pragma solidity ^0.6.4;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "./FundsDistributionToken.sol";
import "./IFundsDistributionToken.sol";


contract VanillaFDT is IFundsDistributionToken, FundsDistributionToken, Ownable {

    using SafeMathUint for uint256;
    using SafeMathInt for int256;


    // token in which the funds can be sent to the FundsDistributionToken
    IERC20 public fundsToken;

    // balance of fundsToken that the FundsDistributionToken currently holds
    uint256 public fundsTokenBalance;

    modifier onlyFundsToken() {
        require(
            msg.sender == address(fundsToken),
            "VanillaFDT.onlyFundsToken: UNAUTHORIZED_SENDER"
        );
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        IERC20 _fundsToken,
        address owner,
        uint256 initialAmount
    )
        public
        FundsDistributionToken(name, symbol)
    {
        require(
            address(_fundsToken) != address(0),
            "SimpleRestrictedFDT: INVALID_FUNDS_TOKEN_ADDRESS"
        );

        fundsToken = _fundsToken;
        _transferOwnership(owner);
        _mint(owner, initialAmount);
    }

    /**
     * @notice Withdraws all available funds for a token holder
     */
    function withdrawFunds() external override {
        _withdrawFundsFor(msg.sender);
    }

    /**
     * @notice Register a payment of funds in tokens. May be called directly after a deposit is made.
     * @dev Calls _updateFundsTokenBalance(), whereby the contract computes the delta of the previous and the new
     * funds token balance and increments the total received funds (cumulative) by delta by calling _registerFunds()
     */
    function updateFundsReceived() external {
        int256 newFunds = _updateFundsTokenBalance();

        if (newFunds > 0) {
            _distributeFunds(newFunds.toUint256Safe());
        }
    }

    /**
     * @notice Withdraws funds for a set of token holders
     */
    function pushFunds(address[] memory owners) public {
        for (uint256 i = 0; i < owners.length; i++) {
            _withdrawFundsFor(owners[i]);
        }
    }

    /**
     * @notice Overrides the parent class token transfer function to enforce restrictions.
     */
    function transfer(address to, uint256 value) public override returns (bool) {
        return super.transfer(to, value);
    }

    /**
     * @notice Overrides the parent class token transferFrom function to enforce restrictions.
     */
    function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        return super.transferFrom(from, to, value);
    }

    /**
     * @notice Exposes the ability to mint new FDTs for a given account. Caller has to be the owner of the FDT.
     */
    function mint(address account, uint256 amount) public onlyOwner returns (bool) {
        _mint(account, amount);
        return true;
    }

    /**
     * @notice Exposes the ability to burn exisiting FDTs for a given account. Caller has to be the owner of the FDT.
     */
    function burn(address account, uint256 amount) public onlyOwner returns (bool) {
        _burn(account, amount);
        return true;
    }

    /**
     * @notice Withdraws all available funds for a token holder
     */
    function _withdrawFundsFor(address owner) internal {
        uint256 withdrawableFunds = _prepareWithdrawFor(owner);

        require(
            fundsToken.transfer(owner, withdrawableFunds),
            "VanillaFDT.withdrawFunds: TRANSFER_FAILED"
        );

        _updateFundsTokenBalance();
    }

    /**
     * @dev Updates the current funds token balance
     * and returns the difference of new and previous funds token balances
     * @return A int256 representing the difference of the new and previous funds token balance
     */
    function _updateFundsTokenBalance() internal returns (int256) {
        uint256 prevFundsTokenBalance = fundsTokenBalance;

        fundsTokenBalance = fundsToken.balanceOf(address(this));

        return int256(fundsTokenBalance).sub(int256(prevFundsTokenBalance));
    }
}
