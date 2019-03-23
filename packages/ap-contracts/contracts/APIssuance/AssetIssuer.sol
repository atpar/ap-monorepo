pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../APCore/APDefinitions.sol";
import "./VerifyOrder.sol"; 
import "../APExtended/IContractActor.sol";


contract AssetIssuer is APDefinitions, VerifyOrder {

  /**
   * issues an asset from an order which was signed by the maker and taker
   * @dev verifies both signatures and calls the init code defined in the actor contract
   * @param order order for which to issue the asset
   * @param makerSignature signature of the maker of the order
   * @param takerSignature signature of the taker of the order
   */
  function fillOrder(
    Order memory order, 
    bytes memory makerSignature,
    bytes memory takerSignature
  ) 
    public 
  {
    require(
      assertOrderSignatures(order, makerSignature, takerSignature), 
      "INVALID_SIGNATURE: Order signatures are invalid!"
    );

    bytes32 contractId = keccak256(
      abi.encode(makerSignature, takerSignature)
    );
    ContractOwnership memory ownership = ContractOwnership(
      order.maker, 
      order.maker, 
      order.taker, 
      order.taker
    );

    require(
      IContractActor(order.actor).initialize(contractId, ownership, order.terms), 
      "EXECUTION_ERROR: Initialization failed"
    );
  }
}
