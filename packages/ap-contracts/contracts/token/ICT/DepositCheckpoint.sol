/**
 * DISCLAIMER: Under certain conditions, the function pushFunds
 * may fail due to block gas limits.
 * If the total number of holders that ever held tokens is greater than ~15,000 then
 * the function may fail. If this happens holders can pull their share, or the Issuer
 * can use pushFundsToAddresses to provide an explict address list in batches
 */
pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

import "./DepositCheckpointStorage.sol";
import "./CheckpointedToken/CheckpointedToken.sol";


/**
 * @title Logic for distributing funds based on checkpointing
 * @dev abstract contract
 */
contract DepositCheckpoint is DepositCheckpointStorage, CheckpointedToken, Ownable {
    using SafeMath for uint256;


    function _validDepositIndex(uint256 depositId) internal view {
        require(depositId < deposits.length, "Invalid deposit");
    }

    function createDepositForEvent(bytes32 _event)) public {
        // uint256 checkpointId = createTokenCheckpoint();
        // require(checkpointId <= currentCheckpointId, "Invalid checkpoint");
        // uint256 depositIndex = deposits.length;
        uint256 currentSupply = totalSupplyAt(checkpointId);
        require(currentSupply > 0, "Invalid supply");
        deposits.push(
            Deposit(
                checkpointId,
                now, /*solium-disable-line security/no-block-members*/
                amount,
                0,
                0
            )
        );

        // deposits[depositIndex].totalSupply = currentSupply;
        // depositedTokens[depositIndex] = token;
    }

    /**
     * @notice Issuer can push funds to provided addresses
     * @param depositId Id of deposit to distribute funds for
     * @param payees Addresses to which to push the funds
     */
    function pushFundsToAddresses(
        uint256 depositId,
        address payable[] memory payees
    )
        public
    {
        _validDepositIndex(depositId);
        Deposit storage deposit = deposits[depositId];
        for (uint256 i = 0; i < payees.length; i++) {
            if ((!deposit.claimed[payees[i]])) {
                _transferFunds(payees[i], deposit, depositId);
            }
        }
    }

    /**
     * @notice Issuer can push funds using the holder list from the CheckpointedToken
     * @param depositId Id of the deposit to distribute funds for
     * @param start Index in holder list at which to start distributing funds
     * @param end Index in holder list at which to stop distributing funds
     */
    function pushFunds(
        uint256 depositId,
        uint256 start,
        uint256 end
    )
        public
    {
        //NB If possible, please use pushFundsToAddresses as it is cheaper than this function
        _validDepositIndex(depositId);
        Deposit storage deposit = deposits[depositId];
        uint256 checkpointId = deposit.checkpointId;
        address[] memory holders = getHolderSubsetAt(checkpointId, start, end);
        // The holders list maybe smaller than end - start becuase it only contains addresses that had a positive balance
        // the start and end used here are for the address list stored in the dataStore
        for (uint256 i = 0; i < holders.length; i++) {
            address payable payee = address(uint160(holders[i]));
            if (!deposit.claimed[payee]) {
                _transferFunds(payee, deposit, depositId);
            }
        }
    }

    /**
     * @notice Holders can withdraw their share of funds
     * @param depositId Id of the deposit to withdraw
     */
    function withdrawFunds(uint256 depositId) public {
        _validDepositIndex(depositId);
        Deposit storage deposit = deposits[depositId];
        require(!deposit.claimed[msg.sender], "Deposit already claimed");
        _transferFunds(msg.sender, deposit, depositId);
    }

    /**
     * @notice Internal function for transferring deposits
     * @param payee Address of holder
     * @param deposit Pointer to deposit in storage
     * @param depositId Id of the deposit to transfer
     */
    function _transferFunds(address payable payee, Deposit storage deposit, uint256 depositId) internal;

    /**
     * @notice Calculate amount withdrawable funds for a given address
     * @param payee Address of holder
     * @param depositId Id of the deposit
     * @return withdrawable amount
     */
    function withdrawableFundsOf(address payee, uint256 depositId) public view returns(uint256) {
        require(depositId < deposits.length, "Invalid deposit");
        Deposit storage deposit = deposits[depositId];
        if (deposit.claimed[payee]) {
            return (0);
        }
        uint256 balance = balanceOfAt(payee, deposit.checkpointId);
        // if deposit is restricted to a subset of holders than use the total number of tokens for that subset of holders
        uint256 claim = balance
            .mul(deposit.amount)
            .div((deposit.isRestrictedDeposit) ? deposit.totalSupplyOfWhitelistedHolders : deposit.totalSupply);
        
        return claim;
    }

    /**
     * @notice Get static deposit data
     * @return uint256[] timestamp of deposits creation
     * @return uint256[] amount of deposits
     * @return uint256[] claimed amount of of the deposits
     */
    function getDepositsData() 
        external
        view
        returns (uint256[] memory createds, uint256[] memory amounts, uint256[] memory claimedAmounts)
    {
        createds = new uint256[](deposits.length);
        amounts = new uint256[](deposits.length);
        claimedAmounts = new uint256[](deposits.length);
        for (uint256 i = 0; i < deposits.length; i++) {
            (createds[i], amounts[i], claimedAmounts[i]) = getDepositData(i);
        }
    }

    /**
     * @notice Get static deposit data
     * @return uint256 timestamp of deposit creation
     * @return uint256 amount of deposit
     * @return uint256 claimed amount of the deposit
     */
    function getDepositData(uint256 depositId) 
        public
        view 
        returns (uint256 created, uint256 amount, uint256 claimedAmount)
    {
        created = deposits[depositId].created;
        amount = deposits[depositId].amount;
        claimedAmount = deposits[depositId].claimedAmount;
    }

    /**
     * @notice Checks whether an address has withdrawn funds for a deposit
     * @param depositId Id of the deposit to withdraw funds from
     * @return bool whether the address has claimed
     */
    function isClaimed(address holder, uint256 depositId) external view returns (bool) {
        require(depositId < deposits.length, "Invalid deposit");
        return deposits[depositId].claimed[holder];
    }
}