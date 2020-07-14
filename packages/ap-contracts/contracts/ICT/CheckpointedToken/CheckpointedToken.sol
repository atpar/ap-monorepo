// "SPDX-License-Identifier: Apache-2.0"
pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";

// TODO: is CheckpointedToken ReentrancyGuardUpgradeSafe
// import "@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol";

import "./CheckpointedTokenStorage.sol";

contract CheckpointedToken is ERC20UpgradeSafe, CheckpointedTokenStorage {

    /**
     * @notice Initialize a new instance storage
     * @dev "constructor" to be called on deployment
     */
    function initialize(string memory name, string memory symbol) public initializer {
        __ERC20_init(name, symbol);
    }

    /**
     * @notice returns an array of holders with non zero balance at a given checkpoint
     * @param checkpointId Checkpoint id at which holder list is to be populated
     * @return list of holders
     */
    function getHoldersAt(uint256 checkpointId) public view returns(address[] memory) {
        uint256 count;
        uint256 i;
        address[] memory activeHolders = holders;
        for (i = 0; i < activeHolders.length; i++) {
            if (balanceOfAt(activeHolders[i], checkpointId) > 0) {
                count++;
            } else {
                activeHolders[i] = address(0);
            }
        }
        address[] memory _holders = new address[](count);
        count = 0;
        for (i = 0; i < activeHolders.length; i++) {
            if (activeHolders[i] != address(0)) {
                _holders[count] = activeHolders[i];
                count++;
            }
        }
        return _holders;
    }

    function getHolderSubsetAt(
        uint256 checkpointId,
        uint256 start,
        uint256 end
    )
        public
        view
        returns(address[] memory)
    {
        uint256 size = holders.length;
        if (end >= size) {
            size = size - start;
        } else {
            size = end - start + 1;
        }
        address[] memory holderSubset = new address[](size);
        for(uint256 j; j < size; j++)
            holderSubset[j] = holders[j + start];

        uint256 count;
        uint256 i;
        for (i = 0; i < holderSubset.length; i++) {
            if (balanceOfAt(holderSubset[i], checkpointId) > 0) {
                count++;
            } else {
                holderSubset[i] = address(0);
            }
        }
        address[] memory _holders = new address[](count);
        count = 0;
        for (i = 0; i < holderSubset.length; i++) {
            if (holderSubset[i] != address(0)) {
                _holders[count] = holderSubset[i];
                count++;
            }
        }
        return _holders;
    }

    function getNumberOfHolders() public view returns(uint256) {
        return holders.length;
    }

    /**
     * @notice Queries the balances of a holder at a specific timestamp
     * @param holder Holder to query balance for
     * @param timestamp Timestamp of the balance checkpoint
     */
    function balanceOfAt(address holder, uint256 timestamp) public view returns(uint256) {
        return getValueAt(checkpointBalances[holder], timestamp);
    }

    /**
     * @notice Queries totalSupply at a specific timestamp
     * @param timestamp Timestamp of the totalSupply checkpoint
     * @return uint256
     */
    function totalSupplyAt(uint256 timestamp) public view returns(uint256) {
        return getValueAt(checkpointTotalSupply, timestamp);
    }

    function _isExistingHolder(address holder) internal view returns(bool) {
        return holderExists[holder];
    }

    function _adjustHolderCount(address from, address to, uint256 value) internal {
        if ((value == 0) || (from == to)) {
            return;
        }
        // Check whether receiver is a new token holder
        if ((balanceOf(to) == 0) && (to != address(0))) {
            holderCount = holderCount.add(1);
            if (!_isExistingHolder(to)) {
                holders.push(to);
                holderExists[to] = true;
            }
        }
        // Check whether sender is moving all of their tokens
        if (value == balanceOf(from)) {
            holderCount = holderCount.sub(1);
        }
    }

    /**
     * @notice Internal - adjusts totalSupply at checkpoint before a token transfer
     */
    function _adjustTotalSupplyCheckpoints() internal {
        updateValueAtNow(checkpointTotalSupply, totalSupply());
    }

    /**
     * @notice Internal - adjusts token holder balance at checkpoint before a token transfer
     * @param holder address of the token holder affected
     */
    function _adjustBalanceCheckpoints(address holder) internal {
        updateValueAtNow(checkpointBalances[holder], balanceOf(holder));
    }

    /**
     * @notice Updates internal variables when performing a transfer
     * @param from sender of transfer
     * @param to receiver of transfer
     * @param value value of transfer
     */
    function _updateTransfer(address from, address to, uint256 value) internal {
        _adjustHolderCount(from, to, value);
        _adjustTotalSupplyCheckpoints();
        _adjustBalanceCheckpoints(from);
        _adjustBalanceCheckpoints(to);
    }

    function _mint(
        address tokenHolder,
        uint256 value
    )
        internal
        override
    {
        _updateTransfer(address(0), tokenHolder, value);
        super._mint(tokenHolder, value);
    }

    function _burn(
        address tokenHolder,
        uint256 value
    )
        internal
        override
    {
        _updateTransfer(tokenHolder, address(0), value);
        super._burn(tokenHolder, value);
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
        _updateTransfer(msg.sender, to, value);
        super._transfer(msg.sender, to, value);
    }
}
