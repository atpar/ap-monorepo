// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/utils/Counters.sol";

/**
 * @title DvPSettlement
 * @dev Contract to manage any number of Delivery-versus-Payment Settlements
 */
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
        address creatorBeneficiary;
        address counterparty;
        address counterpartyToken;
        uint256 counterpartyAmount;
        uint256 expirationDate;
        SettlementStatus status;
    }

    mapping (uint256 => Settlement) public settlements;

    /**
     * @notice Creates a new Settlement in the contract's storage and transfers creator's tokens into the contract
     * @dev The creator must approve for this contract at least `creatorAmount` of tokens
     * @param creatorToken address of creator's ERC20 token
     * @param creatorAmount amount of creator's ERC20 token to be exchanged
     * @param counterparty address of counterparty OR 0x0 for open settlement
     * @param counterpartyToken address of counterparty's ERC20 token
     * @param counterpartyAmount amount of counterparty's ERC20 token to be exchanged
     * @param expirationDate unix timestamp in seconds
     */
    function createSettlement(
        address creatorToken,
        uint256 creatorAmount,
        address creatorBeneficiary,
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
        settlements[id].creatorBeneficiary = creatorBeneficiary;
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


    /**
     * @notice Executes an existing Settlement with the sender as the counterparty
     * @dev This function can only be successfully called by the designated counterparty unless
     * the counterparty address is empty (0x0) in which case anyone can fulfill and execute the settlement
     * @dev The counterparty must approve for this contract at least `counterpartyAmount` of tokens
     * @param id the unsigned integer ID value for the Settlement to execute
     */
    function executeSettlement(uint256 id) public {
        require(
            settlements[id].status == SettlementStatus.INITIALIZED,
            "DvPSettlement.executeSettlement - settlement must be in initialized status"
        );
        require(
            settlements[id].expirationDate > block.timestamp,
            "DvPSettlement.executeSettlement - settlement expired"
        );

        // if empty (0x0) counterparty address, consider it an "open" settlement
        require(
            settlements[id].counterparty == address(0) || settlements[id].counterparty == msg.sender,
            "DvPSettlement.executeSettlement - sender not allowed to execute settlement"
        );

        // if empty (0x0) creatorBeneficiary address, send funds to creator
        address creatorReveiver = (settlements[id].creatorBeneficiary == address(0)) ?
            settlements[id].creator : settlements[id].creatorBeneficiary;

        // transfer both tokens
        require(
            (IERC20(settlements[id].counterpartyToken)
            .transferFrom(
                msg.sender,
                creatorReveiver,
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

    /**
     * @notice When called after a given settlement expires, it refunds tokens to the creator
     * @dev This function can be called by anyone since there is no other possible outcome for
     * a created settlement that has passed the expiration date
     * @param id the unsigned integer ID value for the Settlement to expire
     */
    function expireSettlement(uint256 id) public {
        require(
            settlements[id].expirationDate < block.timestamp,
            "DvPSettlement.expireSettlement - settlement is not expired"
        );
        require(
            settlements[id].status == SettlementStatus.INITIALIZED,
            "DvPSettlement.expireSettlement - only INITIALIZED settlements can be expired"
        );

        // refund creator
        require(
            (IERC20(settlements[id].creatorToken)
            .transfer(
                settlements[id].creator,
                settlements[id].creatorAmount
            )),
            "DvPSettlement.expireSettlement - refunding creator failed"
        );

        settlements[id].status = SettlementStatus.EXPIRED;
        emit SettlementExpired(id);
    }
}