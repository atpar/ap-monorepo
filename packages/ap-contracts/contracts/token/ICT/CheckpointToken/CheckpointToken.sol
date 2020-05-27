pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./CheckpointedTokenStorage.sol";


contract CheckpointedToken is CheckpointedTokenStorage, ERC20Mintable, ReentrancyGuard {

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
     * @notice Queries balances as of a defined checkpoint
     * @param holder Holder to query balance for
     * @param checkpointId Checkpoint ID to query as of
     */
    function balanceOfAt(address holder, uint256 checkpointId) public view returns(uint256) {
        require(checkpointId <= currentCheckpointId, "Invalid checkpoint");
        return getValueAt(checkpointBalances[holder], checkpointId, balanceOf(holder));
    }

    /**
     * @notice Queries totalSupply as of a defined checkpoint
     * @param checkpointId Checkpoint ID to query
     * @return uint256
     */
    function totalSupplyAt(uint256 checkpointId) public view returns(uint256) {
        require(checkpointId <= currentCheckpointId, "Invalid checkpoint");
        return checkpointTotalSupply[checkpointId];
    }

    function createTokenCheckpoint() public returns(uint256) {
        createCheckpoint();

        checkpointTotalSupply[currentCheckpointId] = totalSupply();
        
        return currentCheckpointId;
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
     * @notice Internal - adjusts token holder balance at checkpoint before a token transfer
     * @param holder address of the token holder affected
     */
    function _adjustBalanceCheckpoints(address holder) internal {
        //No checkpoints set yet
        if (currentCheckpointId == 0) {
            return;
        }
        //No new checkpoints since last update
        if (
            (checkpointBalances[holder].length > 0) 
            && (checkpointBalances[holder][checkpointBalances[holder].length - 1].checkpointId == currentCheckpointId)
        ) {
            return;
        }
        //New checkpoint, so record balance
        checkpointBalances[holder].push(Checkpoint({checkpointId: currentCheckpointId, value: balanceOf(holder)}));
    }

    /**
     * @notice Updates internal variables when performing a transfer
     * @param from sender of transfer
     * @param to receiver of transfer
     * @param value value of transfer
     * @return bool success
     */
    function _updateTransfer(address from, address to, uint256 value) internal nonReentrant returns(bool verified) {
        // NB - the ordering in this function implies the following:
        //  - holder counts are updated before transfer managers are called - i.e. transfer managers will see
        //holder counts including the current transfer.
        //  - checkpoints are updated after the transfer managers are called. This allows TMs to create
        //checkpoints as though they have been created before the current transactions,
        //  - to avoid the situation where a transfer manager transfers tokens, and this function is called recursively,
        //the function is marked as nonReentrant. This means that no TM can transfer (or mint / burn) tokens in the execute transfer function.
        _adjustHolderCount(from, to, value);
        _adjustBalanceCheckpoints(from);
        _adjustBalanceCheckpoints(to);
    }

    function _mint(
        address tokenHolder,
        uint256 value
    )
        internal
    {
        _updateTransfer(address(0), tokenHolder, value);
        super._mint(tokenHolder, value);
    }

    function _transfer(
        address to,
        uint256 value
    ) 
        internal
    {
        _updateTransfer(msg.sender, to, value);
        super._transfer(msg.sender, to, value);
    }

    function _transferFrom(
        address from,
        address to,
        uint256 value
    ) 
        internal
    { 
        _updateTransfer(from, to, value);
        super._transfer(from, to, value);
    }

}