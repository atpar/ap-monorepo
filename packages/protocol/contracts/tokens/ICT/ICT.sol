// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "../../ACTUS/Core/ACTUSTypes.sol";
import "../../ACTUS/Core/Utils/EventUtils.sol";
import "../../ACTUS/Core/Utils/PeriodUtils.sol";
import "../../ACTUS/Core/Conventions/BusinessDayConventions.sol";
import "../../ACTUS/Core/FixedPointMath.sol";
import "../../Core/Base/AssetRegistry/IAssetRegistry.sol";
import "../../Core/Base/OracleProxy/DataRegistryProxy/IDataRegistryProxy.sol";
import "./DepositAllocater.sol";


contract ICT is
    IERC20,
    DepositAllocater,
    Ownable,
    EventUtils,
    PeriodUtils,
    BusinessDayConventions
{
    using Address for address;
    using SafeMath for uint256;
    using FixedPointMath for int256;

    IAssetRegistry public assetRegistry;
    IDataRegistryProxy public dataRegistryProxy;

    bytes32 public marketObjectCode;
    bytes32 public assetId;


    constructor(
        IAssetRegistry _assetRegistry,
        IDataRegistryProxy _dataRegistryProxy,
        bytes32 _marketObjectCode,
        address owner
    )
        DepositAllocater("Investment Certifacte Token", "ICT")
    {
        require(
            address(_assetRegistry).isContract(),
            "ICT.initialize: INVALID_ASSET_REGISTRY"
        );
        require(
            address(_dataRegistryProxy).isContract(),
            "ICT.initialize: INVALID_DATA_REGISTRY"
        );

        transferOwnership(owner);

        assetRegistry = _assetRegistry;
        dataRegistryProxy = _dataRegistryProxy;
        marketObjectCode = _marketObjectCode;
    }

    function setAssetId(bytes32 _assetId)
        public
        onlyOwner
    {
        require (
            assetId == bytes32(0),
            "ICT.setAssetId: ASSET_ID_ALREADY_SET"
        );

        assetId = _assetId;
    }

    function createDepositForEvent(bytes32 _event)
        public
        nonReentrant()
    {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "ICT.createDepositForEvent: ASSET_DOES_NOT_EXIST"
        );

        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        // redemption is comprised of REF, EXE, REP events
        // only REF is needed for the ICT redemption workflow
        require(
            eventType != EventType.EXE && eventType != EventType.REP,
            "ICT.createDepositForEvent: FORBIDDEN_EVEN_TYPE"
        );

        address currency = assetRegistry.getAddressValueForTermsAttribute(assetId, "currency");

        createDeposit(
            _event,
            scheduleTime,
            // latest registration date on EXE
            (eventType == EventType.REF)
                ? getTimestampPlusPeriod(
                    assetRegistry.getPeriodValueForTermsAttribute(assetId, "redemptionRecordPeriod"),
                    scheduleTime)
                : 0,
            (eventType == EventType.REF),
            currency
        );
    }

    function fetchDepositAmountForEvent(bytes32 _event)
        public
        nonReentrant()
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        (bool isSettled, int256 payoff) = assetRegistry.isEventSettled(
            assetId,
            (eventType != EventType.REF)
                ? _event
                : encodeEvent(
                    EventType.REP,
                    getTimestampPlusPeriod(
                        assetRegistry.getPeriodValueForTermsAttribute(assetId, "settlementPeriod"),
                        scheduleTime
                    )
                )
        );

        require(
            isSettled == true,
            "ICT.fetchDepositAmountForEvent: NOT_YET_DEPOSITED"
        );

        updateDepositAmount(
            _event,
            (payoff >= 0) ? uint256(payoff) : uint256(payoff * -1)
        );
    }

    /**
     * @param _event encoded redemption to register for
     * @param amount amount of tokens to redeem
     */
    function registerForRedemption(bytes32 _event, uint256 amount)
        public
        nonReentrant()
    {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "ICT.registerForRedemption: ASSET_DOES_NOT_EXIST"
        );

        signalAmountForDeposit(_event, amount);

        Deposit storage deposit = deposits[_event];
        // assuming number of decimals used for numbers in actus-solidity == number of decimals of ICT
        int256 quantity = assetRegistry.getIntValueForStateAttribute(assetId, "quantity");
        int256 totalSupply = int256(totalSupplyAt(deposit.scheduledFor));
        int256 ratioSignaled = int256(deposit.totalAmountSignaled).fixedDiv(totalSupply);
        int256 exerciseQuantity = ratioSignaled.fixedMul(quantity);

        (EventType eventType, ) = decodeEvent(_event);

        uint256 timestamp = shiftCalcTime(
            (eventType != EventType.REF) ? deposit.scheduledFor : deposit.signalingCutoff,
            BusinessDayConvention(assetRegistry.getEnumValueForTermsAttribute(assetId, "businessDayConvention")),
            Calendar(assetRegistry.getEnumValueForTermsAttribute(assetId, "calendar")),
            assetRegistry.getUIntValueForTermsAttribute(assetId, "maturityDate")
        );

        dataRegistryProxy.publishDataPoint(marketObjectCode, timestamp, exerciseQuantity);
    }

    /**
     * @param _event encoded redemption to cancel the registration for
     */
    function cancelRegistrationForRedemption(bytes32 _event)
        public
        nonReentrant()
    {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "ICT.createDepositForEvent: ASSET_DOES_NOT_EXIST"
        );

        signalAmountForDeposit(_event, 0);

        Deposit storage deposit = deposits[_event];
        // assuming number of decimals used for numbers in actus-solidity == number of decimals of ICT
        int256 quantity = assetRegistry.getIntValueForStateAttribute(assetId, "quantity");
        int256 totalSupply = int256(totalSupplyAt(deposit.scheduledFor));
        int256 ratioSignaled = int256(deposit.totalAmountSignaled).fixedDiv(totalSupply);
        int256 exerciseQuantity = ratioSignaled.fixedMul(quantity);

        (EventType eventType, ) = decodeEvent(_event);

        uint256 timestamp = shiftCalcTime(
            (eventType != EventType.REF) ? deposit.scheduledFor : deposit.signalingCutoff,
            BusinessDayConvention(assetRegistry.getEnumValueForTermsAttribute(assetId, "businessDayConvention")),
            Calendar(assetRegistry.getEnumValueForTermsAttribute(assetId, "calendar")),
            assetRegistry.getUIntValueForTermsAttribute(assetId, "maturityDate")
        );

        dataRegistryProxy.publishDataPoint(marketObjectCode, timestamp, exerciseQuantity);
    }

    function mint(address account, uint256 amount)
        public
        onlyOwner
        returns(bool)
    {
        super._mint(account, amount);
        return true;
    }

    function _transfer(
        address from,
        address to,
        uint256 value
    )
        internal
        virtual
        override
    {
        require(
            totalAmountSignaledByHolder[from] == 0,
            "ICT._transfer: HOLDER_IS_SIGNALING"
        );
        super._transfer(from, to, value);
    }

    function transferDeposit(
        address payee,
        Deposit storage deposit,
        bytes32 depositId
    )
        internal
        virtual
        override
    {
        if (deposit.onlySignaled == true && deposit.signaledAmounts[payee] > 0) {
            _burn(payee, deposit.signaledAmounts[payee]);
        }
        // `nonReentrant`-protected (by the `DepositAllocator`)
        super.transferDeposit(payee, deposit, depositId);
    }
}
