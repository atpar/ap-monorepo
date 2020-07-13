// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract DvPSettlement {

    event SettlementInitialized(bytes32 indexed settlementId, Settlement settlement);
    event SettlementExecuted(bytes32 indexed settlementId);
    event SettlementRejected(bytes32 indexed settlementId);
    event SettlementExpired(bytes32 indexed settlementId);

    enum SettlementStatus { NOT_EXISTS, INITIALIZED, EXECUTED, REJECTED, EXPIRED }

    struct Settlement {
        address creator;
        address creatorToken;
        uint256 creatorAmount;
        address counterparty;
        address counterpartyToken;
        uint256 counterpartyAmount;
        uint256 expirationDate;
        SettlementStatus status;
    }

    mapping (bytes32 => Settlement) public settlements;

    function createSettlement(
        address counterparty,
        address creatorToken,
        address counterpartyToken,
        uint256 creatorAmount,
        uint256 counterpartyAmount,
        uint256 expirationDate
    ) public
    {
        require(
            expirationDate > block.timestamp,
            "DvPSettlement.createSettlement - expiration date cannot be in the past"
        );

        //transfer token to this contract

        Settlement storage settlement;
        settlement.creator = msg.sender;
        settlement.counterparty = counterparty;
        settlement.creatorToken = creatorToken;
        settlement.counterpartyToken = counterpartyToken;
        settlement.creatorAmount = creatorAmount;
        settlement.counterpartyAmount = counterpartyAmount;
        settlement.expirationDate = expirationDate;
        settlement.status = SettlementStatus.INITIALIZED;
        
        bytes32 id = getSettlementId(settlement);
        settlements[id] = settlement;

        IERC20(settlements[id].creatorToken)
        .transferFrom(
            settlements[id].creator,
            address(this),
            settlements[id].creatorAmount
        );

        emit SettlementInitialized(id, settlement);
    }

    function executeSettlement(bytes32 id) public {
        require(
            settlements[id].status == SettlementStatus.INITIALIZED,
            "DvPSettlement.executeSettlement - settlement must be in initialized status"
        );
        require(
            settlements[id].expirationDate > block.timestamp,
            "DvPSettlement.executeSettlement - settlement expired"
        );
        require(
            msg.sender == settlements[id].counterparty,
            "DvPSettlement.executeSettlement - sender must be counterparty"
        );

        // transfer both tokens
        IERC20(settlements[id].counterpartyToken)
        .transferFrom(
            settlements[id].counterparty,
            settlements[id].creator,
            settlements[id].counterpartyAmount
        );

        IERC20(settlements[id].creatorToken)
        .transfer(
            settlements[id].counterparty,
            settlements[id].creatorAmount
        );
        

        settlements[id].status = SettlementStatus.EXECUTED;
        emit SettlementExecuted(id);
    }

    function rejectSettlement(bytes32 id) public {
        require(
            settlements[id].status == SettlementStatus.INITIALIZED,
            "DvPSettlement.rejectSettlement - settlement must be in initialized status"
        );
        require(
            msg.sender == settlements[id].counterparty,
            "DvPSettlement.rejectSettlement - sender must be counterparty"
        );
        
        // refund creator
        _refundCreator(id);

        settlements[id].status = SettlementStatus.REJECTED;
        emit SettlementRejected(id);
    }

    function expireSettlement(bytes32 id) public {
        require(
            settlements[id].expirationDate < block.timestamp,
            "DvPSettlement.expireSettlement - settlement is not expired"
        );
        require(
            settlements[id].status != SettlementStatus.EXPIRED,
            "DvPSettlement.expireSettlement - function already called"
        );

        // refund creator
        _refundCreator(id);

        settlements[id].status = SettlementStatus.EXPIRED;
        emit SettlementExpired(id);
    }

    function _refundCreator(bytes32 id) internal {
        IERC20(settlements[id].creatorToken)
        .transfer(
            settlements[id].counterparty,
            settlements[id].creatorAmount
        );
    }

    function getSettlementId(Settlement memory _s) public pure returns (bytes32 id) {
        id = keccak256(
            abi.encodePacked(
                _s.creator,
                _s.counterparty,
                _s.creatorToken,
                _s.counterpartyToken,
                _s.creatorAmount,
                _s.counterpartyAmount,
                _s.expirationDate
            )
        );
    }
}