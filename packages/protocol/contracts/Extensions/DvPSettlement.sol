// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/**
 * @title DvPSettlement
 * @dev Contract to manage any number of Delivery-versus-Payment Settlements
 */
contract DvPSettlement {

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

    // stores the settlementId of the last created Settlement
    uint256 public lastSettlementId;
    // SettlementId => Settlement
    mapping (uint256 => Settlement) public settlements;

    event SettlementInitialized(uint256 indexed settlementId, Settlement settlement);
    event SettlementExecuted(uint256 indexed settlementId, address indexed executor);
    event SettlementExpired(uint256 indexed settlementId);


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
    )
        external
    {
        require(
            expirationDate > block.timestamp,
            "DvPSettlement.createSettlement: INVALID_EXPIRATION_DATE"
        );

        // practially no risk of overflowing or underflowing
        lastSettlementId++;

        Settlement storage settlement = settlements[lastSettlementId];
        settlement.creator = msg.sender;
        settlement.creatorToken = creatorToken;
        settlement.creatorAmount = creatorAmount;
        settlement.creatorBeneficiary = creatorBeneficiary;
        settlement.counterparty = counterparty;
        settlement.counterpartyToken = counterpartyToken;
        settlement.counterpartyAmount = counterpartyAmount;
        settlement.expirationDate = expirationDate;
        settlement.status = SettlementStatus.INITIALIZED;

        require(
            IERC20(settlement.creatorToken).transferFrom(settlement.creator, address(this), settlement.creatorAmount),
            "DvPSettlement.createSettlement: TRANFER_FAILED"
        );

        emit SettlementInitialized(lastSettlementId, settlement);
    }


    /**
     * @notice Executes an existing Settlement with the sender as the counterparty
     * @dev This function can only be successfully called by the designated counterparty unless
     * the counterparty address is empty (0x0) in which case anyone can fulfill and execute the settlement
     * @dev The counterparty must approve for this contract at least `counterpartyAmount` of tokens
     * @param settlementId Id of the Settlement to execute
     */
    function executeSettlement(uint256 settlementId) external {
        Settlement storage settlement = settlements[settlementId];

        require(
            settlement.status == SettlementStatus.INITIALIZED,
            "DvPSettlement.executeSettlement: SETTLEMENT_NOT_INITIALIZED"
        );
        require(
            settlement.expirationDate > block.timestamp,
            "DvPSettlement.executeSettlement: SETTLEMENT_EXPIRED"
        );
        require(
            // if empty (0x0) counterparty address, consider it an "open" settlement
            settlement.counterparty == address(0) || settlement.counterparty == msg.sender,
            "DvPSettlement.executeSettlement: UNAUTHORIZED_SENDER"
        );

        // if empty (0x0) creatorBeneficiary address, send funds to creator
        address creatorReveiver = (settlement.creatorBeneficiary == address(0))
            ? settlement.creator
            : settlement.creatorBeneficiary;

        settlement.status = SettlementStatus.EXECUTED;

        // transfer both tokens
        require(
            IERC20(settlement.counterpartyToken).transferFrom(msg.sender, creatorReveiver, settlement.counterpartyAmount)
            && IERC20(settlement.creatorToken).transfer(msg.sender, settlement.creatorAmount),
            "DvPSettlement.executeSettlement: TRANSFER_FAILED"
        );

        emit SettlementExecuted(settlementId, msg.sender);
    }

    /**
     * @notice When called after a given settlement expires, it refunds tokens to the creator
     * @dev This function can be called by anyone since there is no other possible outcome for
     * a created settlement that has passed the expiration date
     * @param settlementId Id of the Settlement to expire
     */
    function expireSettlement(uint256 settlementId) external {
        Settlement storage settlement = settlements[settlementId];

        require(
            settlement.status == SettlementStatus.INITIALIZED,
            "DvPSettlement.expireSettlement: SETTLEMENT_NOT_INITIALIZED"
        );
        require(
            settlement.expirationDate < block.timestamp,
            "DvPSettlement.expireSettlement: SETTLEMENT_NOT_YET_EXPIRED"
        );

        settlement.status = SettlementStatus.EXPIRED;

        // refund creator of settlement
        require(
            IERC20(settlement.creatorToken).transfer(settlement.creator, settlement.creatorAmount),
            "DvPSettlement.expireSettlement: TRANSFER_FAILED"
        );
        
        emit SettlementExpired(settlementId);
    }
}
