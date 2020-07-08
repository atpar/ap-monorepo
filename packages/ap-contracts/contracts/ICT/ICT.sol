// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "@atpar/actus-solidity/contracts/Core/Utils/EventUtils.sol";
import "@atpar/actus-solidity/contracts/Core/SignedMath.sol";

import "../Core/Base/AssetRegistry/IAssetRegistry.sol";
import "../Core/Base/MarketObjectRegistry/IMarketObjectRegistry.sol";
import "./DepositAllocater.sol";


contract ICT is IERC20, Ownable, DepositAllocater, EventUtils {

    using SafeMath for uint256;
    using SignedMath for int256;

    IAssetRegistry public assetRegistry;
    IMarketObjectRegistry public marketObjectRegistry;

    bytes32 public marketObjectCode;
    bytes32 public assetId;


    constructor(
        IAssetRegistry _assetRegistry,
        IMarketObjectRegistry _marketObjectRegistry,
        bytes32 _marketObjectCode
    ) DepositAllocater("Investment Certificate Token", "ICT") public {
        assetRegistry = _assetRegistry;
        marketObjectRegistry = _marketObjectRegistry;
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

        marketObjectRegistry.publishDataPointOfMarketObject(marketObjectCode, deposit.scheduledFor, quantity);
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

        marketObjectRegistry.publishDataPointOfMarketObject(marketObjectCode, deposit.scheduledFor, quantity);
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
            totalAmountSignaledByHolder[msg.sender] == 0,
            "ICT._transfer: HOLDER_IS_SIGNALING"
        );
        super._transfer(msg.sender, to, value);
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