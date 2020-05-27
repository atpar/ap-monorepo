pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./FDTCheckpoint.sol";
import "./ERC20FDTCheckpointStorage.sol";


/**
 * @title Checkpoint module for issuing ERC20 deposits
 */
contract ERC20FDTCheckpoint is ERC20FDTCheckpointStorage, FDTCheckpoint {
    using SafeMath for uint256;

    /**
     * @notice Creates a deposit and checkpoints the token balances
     * @param token Address of ERC20 token in which deposit is to be denominated
     * @param amount Amount of specified token for deposit
     */
    function depositFunds(
        address token,
        uint256 amount
    )
        public
    {
        uint256 checkpointId = createTokenCheckpoint();
        /*solium-disable-next-line security/no-block-members*/
        require(amount > 0, "No deposit sent");
        require(token != address(0), "Invalid token");
        require(checkpointId <= currentCheckpointId, "Invalid checkpoint");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "insufficent allowance");
        uint256 depositIndex = deposits.length;
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

        deposits[depositIndex].totalSupply = currentSupply;
        depositedTokens[depositIndex] = token;

        emit FundsDistributed(msg.sender, depositIndex, amount);
    }

    /**
     * @notice Internal function for transferring deposits
     * @param payee Address of holder
     * @param deposit Pointer to deposit in storage
     * @param depositId Id of deposit to transfer
     */
    function _transferFunds(address payable payee, Deposit storage deposit, uint256 depositId) internal {
        uint256 claim = withdrawableFundsOf(payee, depositId);
        deposit.claimed[payee] = true;
        deposit.claimedAmount = claim.add(deposit.claimedAmount);
        if (claim > 0) {
            require(IERC20(depositedTokens[depositId]).transfer(payee, claim), "transfer failed");
        }
        emit FundsWithdrawn(payee, depositId, claim);
    }
}