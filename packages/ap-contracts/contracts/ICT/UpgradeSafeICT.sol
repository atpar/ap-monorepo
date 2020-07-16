// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol";
import "@atpar/actus-solidity/contracts/Core/ACTUSTypes.sol";
import "@atpar/actus-solidity/contracts/Core/Utils/EventUtils.sol";
import "@atpar/actus-solidity/contracts/Core/SignedMath.sol";

import "../Core/Base/AssetRegistry/IAssetRegistry.sol";
import "../Core/Base/DataRegistry/DataRegistry.sol";
import "./DepositAllocater.sol";


contract UpgradeSafeICT is
    IERC20,
    DepositAllocater,
    OwnableUpgradeSafe,
    EventUtils
{
    using Address for address;
    using SafeMath for uint256;
    using SignedMath for int256;

    IAssetRegistry public assetRegistry;
    DataRegistry public dataRegistry;

    bytes32 public marketObjectCode;
    bytes32 public assetId;

    // Reserved
    uint256[10] private __gap;

    /**
     * @notice Initialize a new instance storage
     * @dev "constructor" to be called on deployment
     */
    function initialize(
        IAssetRegistry _assetRegistry,
        DataRegistry _dataRegistry,
        bytes32 _marketObjectCode,
        address owner
    ) public initializer {
        require(
            address(_assetRegistry).isContract(),
            "ICT.initialize: INVALID_ASSET_REGISTRY"
        );
        require(
            address(_dataRegistry).isContract(),
            "ICT.initialize: INVALID_DATA_REGISTRY"
        );

        super.initialize("Investment Certificate Token", "ICT");
        super.__Ownable_init();
        transferOwnership(owner);

        assetRegistry = _assetRegistry;
        dataRegistry = _dataRegistry;
        marketObjectCode = _marketObjectCode;
    }

    function setAssetId(bytes32 _assetId) public onlyOwner {
        require (
            assetId == bytes32(0),
            "ICT.setAssetId: ASSET_ID_ALREADY_SET"
        );

        assetId = _assetId;
    }

    function createDepositForEvent(bytes32 _event) public {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "ICT.createDepositForEvent: ASSET_DOES_NOT_EXIST"
        );

        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);
        address currency = assetRegistry.getAddressValueForTermsAttribute(assetId, "currency");

        createDeposit(
            _event,
            scheduleTime,
            (eventType == EventType.XD),
            currency
        );
    }

    function fetchDepositAmountForEvent(bytes32 _event) public {
        (bool isSettled, int256 payoff) = assetRegistry.isEventSettled(assetId, _event);

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
    function registerForRedemption(bytes32 _event, uint256 amount) public {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "ICT.registerForRedemption: ASSET_DOES_NOT_EXIST"
        );

        signalAmountForDeposit(_event, amount);

        Deposit storage deposit = deposits[_event];
        // assuming number of decimals used for numbers in actus-solidity == number of decimals of ICT
        int256 totalQuantity = assetRegistry.getIntValueForTermsAttribute(assetId, "quantity");
        int256 totalSupply = int256(totalSupplyAt(deposit.scheduledFor));
        int256 ratioSignaled = int256(deposit.totalAmountSignaled).floatDiv(totalSupply);
        int256 quantity = ratioSignaled.floatMult(totalQuantity);

        dataRegistry.publishDataPoint(marketObjectCode, deposit.scheduledFor, quantity);
    }

    /**
     * @param _event encoded redemption to cancel the registration for
     */
    function cancelRegistrationForRedemption(bytes32 _event) public {
        require(
            assetRegistry.isRegistered(assetId) == true,
            "ICT.createDepositForEvent: ASSET_DOES_NOT_EXIST"
        );

        signalAmountForDeposit(_event, 0);

        Deposit storage deposit = deposits[_event];
        // assuming number of decimals used for numbers in actus-solidity == number of decimals of ICT
        int256 totalQuantity = assetRegistry.getIntValueForTermsAttribute(assetId, "quantity");
        int256 totalSupply = int256(totalSupplyAt(deposit.scheduledFor));
        int256 ratioSignaled = int256(deposit.totalAmountSignaled).floatDiv(totalSupply);
        int256 quantity = ratioSignaled.floatMult(totalQuantity);

        dataRegistry.publishDataPoint(marketObjectCode, deposit.scheduledFor, quantity);
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
        // TODO: confirm `from replacing `msg.sender`
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

        super.transferDeposit(payee, deposit, depositId);
    }
}
