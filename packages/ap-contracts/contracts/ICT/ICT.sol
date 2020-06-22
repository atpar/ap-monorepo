// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "@atpar/actus-solidity/contracts/Core/Utils.sol";

import "../Core/Base/AssetRegistry/IAssetRegistry.sol";
import "./DepositAllocater.sol";


contract ICT is IERC20, Ownable, DepositAllocater, Utils {

    using SafeMath for uint256;

    IAssetRegistry public assetRegistry;

    bytes32 public assetId;


    constructor(IAssetRegistry _assetRegistry) DepositAllocater("Investment Certificate Token", "ICT") public {
        assetRegistry = _assetRegistry;
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
            false, // (eventType == EventType.RD),
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
            "ICT.createDepositForEvent: ASSET_DOES_NOT_EXIST"
        );

        signalAmountForDeposit(_event, amount);
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
            numberOfDepositsSignaledByHolder[msg.sender] == 0,
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