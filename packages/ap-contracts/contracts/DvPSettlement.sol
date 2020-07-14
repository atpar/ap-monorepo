// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/utils/Counters.sol";

contract DvPSettlement {
    using Counters for Counters.Counter;
    Counters.Counter _settlementIds;

    event SettlementInitialized(uint256 indexed settlementId, Settlement settlement);
    event SettlementExecuted(uint256 indexed settlementId, address indexed executor);
    event SettlementExpired(uint256 indexed settlementId);

    enum SettlementStatus { NOT_EXISTS, INITIALIZED, EXECUTED, EXPIRED }

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

    mapping (uint256 => Settlement) public settlements;

    function createSettlement(
        address creatorToken,
        uint256 creatorAmount,
        address counterparty,
        address counterpartyToken,
        uint256 counterpartyAmount,
        uint256 expirationDate
    ) public
    {
        require(
            expirationDate > block.timestamp,
            "DvPSettlement.createSettlement - expiration date cannot be in the past"
        );

        _settlementIds.increment();
        uint256 id = _settlementIds.current();

        settlements[id].creator = msg.sender;
        settlements[id].creatorToken = creatorToken;
        settlements[id].creatorAmount = creatorAmount;
        settlements[id].counterparty = counterparty;
        settlements[id].counterpartyToken = counterpartyToken;
        settlements[id].counterpartyAmount = counterpartyAmount;
        settlements[id].expirationDate = expirationDate;
        settlements[id].status = SettlementStatus.INITIALIZED;
        
       require(
            IERC20(settlements[id].creatorToken)
            .transferFrom(
                settlements[id].creator,
                address(this),
                settlements[id].creatorAmount
            ),
            "DvPSettlement.createSettlement - transferFrom failed"
        );

        emit SettlementInitialized(id, settlements[id]);
    }

    function executeSettlement(uint256 id) public {
        require(
            settlements[id].status == SettlementStatus.INITIALIZED,
            "DvPSettlement.executeSettlement - settlement must be in initialized status"
        );
        require(
            settlements[id].expirationDate > block.timestamp,
            "DvPSettlement.executeSettlement - settlement expired"
        );

        // if no counterparty is set consider it an "open" settlement
        require(
            settlements[id].counterparty == address(0) || settlements[id].counterparty == msg.sender,
            "DvPSettlement.executeSettlement - sender not allowed to execute settlement"
        );

        // transfer both tokens
        require(
            (IERC20(settlements[id].counterpartyToken)
            .transferFrom(
                msg.sender,
                settlements[id].creator,
                settlements[id].counterpartyAmount
            )),
            "DvPSettlement.executeSettlement - transferFrom sender failed"
        );

        require(
            (IERC20(settlements[id].creatorToken)
            .transfer(
                msg.sender,
                settlements[id].creatorAmount
            )),
            "DvPSettlement.executeSettlement - transfer to sender failed"
        );

        settlements[id].status = SettlementStatus.EXECUTED;
        emit SettlementExecuted(id, msg.sender);
    }

    function expireSettlement(uint256 id) public {
        require(
            settlements[id].expirationDate < block.timestamp,
            "DvPSettlement.expireSettlement - settlement is not expired"
        );
        require(
            settlements[id].status != SettlementStatus.EXPIRED,
            "DvPSettlement.expireSettlement - function already called"
        );

        // refund creator
        IERC20(settlements[id].creatorToken)
        .transfer(
            settlements[id].creator,
            settlements[id].creatorAmount
        );

        settlements[id].status = SettlementStatus.EXPIRED;
        emit SettlementExpired(id);
    }
}