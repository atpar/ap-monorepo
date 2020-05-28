/**
 * DISCLAIMER: Under certain conditions, the function pushFunds
 * may fail due to block gas limits.
 * If the total number of holders that ever held tokens is greater than ~15,000 then
 * the function may fail. If this happens holders can pull their share, or the Issuer
 * can use pushFundsToAddresses to provide an explict address list in batches
 */
pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/math/Math.sol";

import "@atpar/actus-solidity/contracts/Core/Utils.sol";

import "./DepositStorage.sol";
import "./CheckpointedToken/CheckpointedToken.sol";


/**
 * @title Logic for distributing funds based on checkpointing
 * @dev abstract contract
 */
contract Deposit is DepositStorage, CheckpointedToken, Utils {

    using SafeMath for uint256;


    function createDepositForEvent(bytes32 _event) public {
        Deposit storage deposit = depositForEvent[_event];

        require(
            deposit.created == uint256(0),
            "Deposit.createDepositForEvent: DEPOSIT_ALREADY_EXISTS"
        );

        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        deposit.created = now;
        deposit.isRestrictedDeposit = false; // todo: add EventType for redemption
        deposit.token = address(0); // todo: look up currency in AssetRegistry
    }

    function updateDepositAmountForEvent(bytes32 _event) public {
        Deposit storage deposit = depositForEvent[_event];

        require(
            deposit.created != uint256(0),
            "Deposit.createDepositForEvent: DEPOSIT_DOES_NOT_EXIST"
        );

        require(
            deposit.amount == uint256(0),
            "Deposit.updateDepositAmountForEvent: DEPOSIT_AMOUNT_ALREADY_SET"
        );

        deposit.amount = 0; // query payoff from AssetRegistry

        // emit FundsDistributed(msg.sender, depositIndex, amount);
    }

    /**
     * @notice Issuer can push funds to provided addresses
     * @param _event The deposits corresponding event
     * @param payees Addresses to which to push the funds
     */
    function pushFundsToAddresses(
        bytes32 _event,
        address payable[] memory payees
    )
        public
    {
        Deposit storage deposit = depositForEvent[_event];

        for (uint256 i = 0; i < payees.length; i++) {
            if ((!deposit.claimed[payees[i]])) {
                transferDeposit(payees[i], deposit, _event);
            }
        }
    }

    /**
     * @notice Withdraws the holders share of funds of the deposit
     * @param _event The deposits corresponding event
     */
    function claimDepositForEvent(bytes32 _event) public {
        Deposit storage deposit = depositForEvent[_event];
        
        require(!deposit.claimed[msg.sender], "Deposit.withdrawFunds: DEPOSIT_ALREADY_CLAIMED");
        
        transferDeposit(msg.sender, deposit, _event);
    }

    /**
     * @notice Internal function for transferring deposits
     * @param payee Address of holder
     * @param deposit Pointer to deposit in storage
     */
    function transferDeposit(address payable payee, Deposit storage deposit, bytes32 _event) internal {
        uint256 claim = calculateClaimOnDepositForEvent(payee, _event);
     
        deposit.claimed[payee] = true;
        deposit.claimedAmount = claim.add(deposit.claimedAmount);
     
        if (claim > 0) {
            require(IERC20(deposit.token).transfer(payee, claim), "Deposit.transferDeposit: TRANSFER_FAILED");
        }
     
        // emit FundsWithdrawn(payee, depositId, claim);
    }

    /**
     * @notice Calculate claimable amount of a deposit for a given address
     * @param payee Address of holder
     * @param _event The deposits corresponding event
     * @return withdrawable amount
     */
    function calculateClaimOnDepositForEvent(address payee, bytes32 _event) public view returns(uint256) {
        Deposit storage deposit = depositForEvent[_event];

        if (deposit.claimed[payee]) return (0);

        (, uint256 scheduleTime) = decodeEvent(_event);
        uint256 balance = balanceOfAt(payee, scheduleTime);
        uint256 totalSupply = totalSupplyAt(scheduleTime);
        // if deposit is restricted to a subset of holders than use the total number of tokens for that subset of holders
        uint256 claim = balance
            .mul(deposit.amount)
            .div((deposit.isRestrictedDeposit) ? deposit.totalBalanceOfWhitelistedHolders : totalSupply);
        
        return claim;
    }

    /**
     * @notice 
     * @return created
     * @return amount
     * @return claimedAmount
     * @return totalBalanceOfWhitelistedHolders
     * @return isRestrictedDeposit
     * @return token
     */
    function getDepositForEvent(bytes32 _event) 
        public
        view 
        returns (
            uint256 created,
            uint256 amount,
            uint256 claimedAmount,
            uint256 totalBalanceOfWhitelistedHolders,
            bool isRestrictedDeposit,
            address token
        )
    {
        Deposit storage deposit = depositForEvent[_event];

        created = deposit.created;
        amount = deposit.amount;
        claimedAmount = deposit.claimedAmount;
        totalBalanceOfWhitelistedHolders = deposit.totalBalanceOfWhitelistedHolders;
        isRestrictedDeposit = deposit.isRestrictedDeposit;
        token = deposit.token;
    }

    /**
     * @notice Checks whether an address has withdrawn funds for a deposit
     * @param _event The deposits corresponding event
     * @return bool whether the address has claimed
     */
    function hasClaimedDepositForEvent(address holder, bytes32 _event) external view returns (bool) {
        return depositForEvent[_event].claimed[holder];
    }
}