// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../../external/math/SafeConversion.sol";
import "./IFundsDistributionToken.sol";


/**
 * @title FundsDistributionToken
 * @author Johannes Escherich
 * @author Roger-Wu
 * @author Johannes Pfeffer
 * @author Tom Lam
 * @dev A  mintable token that can represent claims on cash flow of arbitrary assets such as dividends, loan repayments,
 * fee or revenue shares among large numbers of token holders. Anyone can deposit funds, token holders can withdraw
 * their claims.
 * FundsDistributionToken (FDT) implements the accounting logic. FDT-Extension contracts implement methods for depositing and
 * withdrawing funds in Ether or according to a token standard such as ERC20, ERC223, ERC777.
 */
abstract contract FundsDistributionToken is IFundsDistributionToken, ERC20 {

    using SafeMath for uint256;
    using SignedSafeMath for int256;

    using SafeConversion for uint256;
    using SafeConversion for int256;

    // optimize, see https://github.com/ethereum/EIPs/issues/1726#issuecomment-472352728
    uint256 constant internal pointsMultiplier = 2**128;
    uint256 internal pointsPerShare;

    mapping(address => int256) internal pointsCorrection;
    mapping(address => uint256) internal withdrawnFunds;


    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    /**
     * prev. distributeDividends
     * @notice Distributes funds to token holders.
     * @dev It reverts if the total supply of tokens is 0.
     * It emits the `FundsDistributed` event if the amount of received ether is greater than 0.
     * About undistributed funds:
     *   In each distribution, there is a small amount of funds which does not get distributed,
     *     which is `(msg.value * pointsMultiplier) % totalSupply()`.
     *   With a well-chosen `pointsMultiplier`, the amount funds that are not getting distributed
     *     in a distribution can be less than 1 (base unit).
     *   We can actually keep track of the undistributed ether in a distribution
     *     and try to distribute it in the next distribution ....... todo implement
     */
    function _distributeFunds(uint256 value) internal {
        require(totalSupply() > 0, "FundsDistributionToken._distributeFunds: SUPPLY_IS_ZERO");

        if (value > 0) {
            pointsPerShare = pointsPerShare.add(
                value.mul(pointsMultiplier) / totalSupply()
            );
            emit FundsDistributed(msg.sender, value);
        }
    }

    /**
     * prev. withdrawDividend
     * @notice Prepares funds withdrawal
     * @dev It emits a `FundsWithdrawn` event if the amount of withdrawn ether is greater than 0.
     */
    function _prepareWithdrawFor(address _owner) internal returns (uint256) {
        uint256 _withdrawableDividend = withdrawableFundsOf(_owner);

        withdrawnFunds[_owner] = withdrawnFunds[_owner].add(_withdrawableDividend);

        emit FundsWithdrawn(_owner, _withdrawableDividend);

        return _withdrawableDividend;
    }

    /**
     * prev. withdrawableDividendOf
     * @notice View the amount of funds that an address can withdraw.
     * @param _owner The address of a token holder.
     * @return The amount funds that `_owner` can withdraw.
     */
    function withdrawableFundsOf(address _owner) public view override returns(uint256) {
        return accumulativeFundsOf(_owner).sub(withdrawnFunds[_owner]);
    }

    /**
     * prev. withdrawnDividendOf
     * @notice View the amount of funds that an address has withdrawn.
     * @param _owner The address of a token holder.
     * @return The amount of funds that `_owner` has withdrawn.
     */
    function withdrawnFundsOf(address _owner) public view returns(uint256) {
        return withdrawnFunds[_owner];
    }

    /**
     * prev. accumulativeDividendOf
     * @notice View the amount of funds that an address has earned in total.
     * @dev accumulativeFundsOf(_owner) = withdrawableFundsOf(_owner) + withdrawnFundsOf(_owner)
     * = (pointsPerShare * balanceOf(_owner) + pointsCorrection[_owner]) / pointsMultiplier
     * @param _owner The address of a token holder.
     * @return The amount of funds that `_owner` has earned in total.
     */
    function accumulativeFundsOf(address _owner) public view returns(uint256) {
        return pointsPerShare.mul(balanceOf(_owner)).toInt256Safe()
            .add(pointsCorrection[_owner]).toUint256Safe() / pointsMultiplier;
    }

    /**
     * @dev Internal function that transfer tokens from one address to another.
     * Update pointsCorrection to keep funds unchanged.
     * @param from The address to transfer from.
     * @param to The address to transfer to.
     * @param value The amount to be transferred.
     */
    function _transfer(address from, address to, uint256 value) internal override {
        super._transfer(from, to, value);

        int256 _magCorrection = pointsPerShare.mul(value).toInt256Safe();
        pointsCorrection[from] = pointsCorrection[from].add(_magCorrection);
        pointsCorrection[to] = pointsCorrection[to].sub(_magCorrection);
    }

    /**
     * @dev Internal function that mints tokens to an account.
     * Update pointsCorrection to keep funds unchanged.
     * @param account The account that will receive the created tokens.
     * @param value The amount that will be created.
     */
    function _mint(address account, uint256 value) internal override {
        super._mint(account, value);

        pointsCorrection[account] = pointsCorrection[account]
            .sub( (pointsPerShare.mul(value)).toInt256Safe() );
    }

    /**
     * @dev Internal function that burns an amount of the token of a given account.
     * Update pointsCorrection to keep funds unchanged.
     * @param account The account whose tokens will be burnt.
     * @param value The amount that will be burnt.
     */
    function _burn(address account, uint256 value) internal override {
        super._burn(account, value);

        pointsCorrection[account] = pointsCorrection[account]
            .add( (pointsPerShare.mul(value)).toInt256Safe() );
    }
}
