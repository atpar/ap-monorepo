pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/math/Math.sol";

import "./CheckpointedToken/CheckpointedToken.sol";
import "./DepositAllocaterStorage.sol";


/**
 * @title Logic for distributing funds based on checkpointing
 * @dev abstract contract
 */
contract DepositAllocater is CheckpointedToken, DepositAllocaterStorage {

    using SafeMath for uint256;


    function createDeposit(bytes32 depositId, uint256 scheduledFor, bool onlySignaled, address token) public {
        Deposit storage deposit = deposits[depositId];

        require(
            deposit.scheduledFor == uint256(0),
            "Deposit.createDeposit: DEPOSIT_ALREADY_EXISTS"
        );

        deposit.scheduledFor = scheduledFor;
        deposit.onlySignaled = onlySignaled;
        deposit.token = token;
    }

    function updateDepositAmount(bytes32 depositId, uint256 amount) public {
        Deposit storage deposit = deposits[depositId];

        require(
            deposit.scheduledFor != uint256(0),
            "Deposit.updateDepositAmount: DEPOSIT_DOES_NOT_EXIST"
        );

        require(
            deposit.amount == uint256(0),
            "Deposit.updateDepositAmount: DEPOSIT_AMOUNT_ALREADY_SET"
        );

        deposit.amount = amount;
    }

    function signalAmountForDeposit(bytes32 depositId, uint256 signalAmount) public {
        Deposit storage deposit = deposits[depositId];

        require(
            deposit.scheduledFor != uint256(0),
            "Deposit.updateDepositAmount: DEPOSIT_DOES_NOT_EXIST"
        );

        require(
            deposit.onlySignaled == true,
            "Deposit.updateDepositAmount: SIGNALING_NOT_ENABLED"
        );

        require(
            deposit.scheduledFor > now,
            "Deposit.updateDepositAmount: DEPOSIT_IS_ALREADY_PROCESSED"
        );

        require(
            balanceOfAt(msg.sender, deposit.scheduledFor) >= signalAmount,
            "Deposit.updateSignaledAmountForDeposit: SIGNAL_AMOUNT_EXCEEDS_BALANCE"
        );

        // mark deposit as signalled for by the holder
        if (deposit.signaledAmounts[msg.sender] == 0 && signalAmount > 0) {
            numberOfDepositsSignaledByHolder[msg.sender] = numberOfDepositsSignaledByHolder[msg.sender].add(1);
        } else if (deposit.signaledAmounts[msg.sender] > 0 && signalAmount == 0) {
            numberOfDepositsSignaledByHolder[msg.sender] = numberOfDepositsSignaledByHolder[msg.sender].sub(1);
        }
        // update total amount signaled for deposit
        deposit.totalAmountSignaled = deposit.totalAmountSignaled.sub(deposit.signaledAmounts[msg.sender]);        
        deposit.totalAmountSignaled = deposit.totalAmountSignaled.add(signalAmount);
        // update the signaled amount of holder
        deposit.signaledAmounts[msg.sender] = signalAmount;
    }

    /**
     * @notice Issuer can push funds to provided addresses
     * @param depositId Id of the deposit
     * @param payees Addresses to which to push the funds
     */
    function pushFundsToAddresses(
        bytes32 depositId,
        address payable[] memory payees
    )
        public
    {
        Deposit storage deposit = deposits[depositId];

        for (uint256 i = 0; i < payees.length; i++) {
            if (deposit.claimed[payees[i]] == false) {
                transferDeposit(payees[i], deposit, depositId);
            }
        }
    }

    /**
     * @notice Withdraws the holders share of funds of the deposit
     * @param depositId Id of the deposit
     */
    function claimDeposit(bytes32 depositId) public {
        Deposit storage deposit = deposits[depositId];
        
        require(
            deposit.claimed[msg.sender] == false,
            "Deposit.claimDeposit: DEPOSIT_ALREADY_CLAIMED"
        );
        
        transferDeposit(msg.sender, deposit, depositId);
    }

    /**
     * @notice Internal function for transferring deposits
     * @param payee Address of holder
     * @param deposit Pointer to deposit in storage
     */
    function transferDeposit(
        address payee,
        Deposit storage deposit,
        bytes32 depositId
    )
        internal
        virtual
    {
        uint256 claim = calculateClaimOnDeposit(payee, depositId);
     
        deposit.claimed[payee] = true;
        deposit.claimedAmount = claim.add(deposit.claimedAmount);
     
        if (claim > 0) {
            require(
                IERC20(deposit.token).transfer(payee, claim),
                "Deposit.transferDeposit: TRANSFER_FAILED"
            );
        }
    }

    /**
     * @notice Calculate claimable amount of a deposit for a given address
     * @param payee Address of holder
     * @param depositId Id of the deposit
     * @return withdrawable amount
     */
    function calculateClaimOnDeposit(address payee, bytes32 depositId) public view returns(uint256) {
        Deposit storage deposit = deposits[depositId];

        if (deposit.claimed[payee]) return 0;

        uint256 totalSupply = totalSupplyAt(deposit.scheduledFor);
        // if deposit is marked as `onlySignaled` use the holders signaled amount
        // instead of the holders checkpointed balance
        uint256 balance = (deposit.onlySignaled)
            ? deposit.signaledAmounts[payee]
            : balanceOfAt(payee, deposit.scheduledFor);
        // if deposit is marked as `onlySignaled` use the total amount signaled
        // instead of the checkpointed total supply
        uint256 claim = balance.mul(deposit.amount).div(
            (deposit.onlySignaled) ? deposit.totalAmountSignaled : totalSupply
        );
        
        return claim;
    }

    /**
     * @notice 
     * @return scheduledFor
     * @return amount
     * @return claimedAmount
     * @return totalAmountSignaled
     * @return onlySignaled
     * @return token
     */
    function getDeposit(bytes32 depositId) 
        public
        view 
        returns (
            uint256 scheduledFor,
            uint256 amount,
            uint256 claimedAmount,
            uint256 totalAmountSignaled,
            bool onlySignaled,
            address token
        )
    {
        Deposit storage deposit = deposits[depositId];

        scheduledFor = deposit.scheduledFor;
        amount = deposit.amount;
        claimedAmount = deposit.claimedAmount;
        totalAmountSignaled = deposit.totalAmountSignaled;
        onlySignaled = deposit.onlySignaled;
        token = deposit.token;
    }

    /**
     * @notice Checks whether an address has withdrawn funds for a deposit
     * @param depositId Id of the deposit
     * @return bool whether the address has claimed
     */
    function hasClaimedDeposit(address holder, bytes32 depositId) external view returns (bool) {
        return deposits[depositId].claimed[holder];
    }
}