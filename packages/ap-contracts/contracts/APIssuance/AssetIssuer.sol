pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../APCore/APDefinitions.sol";
import "./VerifyOrder.sol"; 
import "../APExtended/IContractActor.sol";


contract AssetIssuer is APDefinitions, VerifyOrder {

  function fillOrder (
    Order memory order, 
    bytes memory makerSignature,
    bytes memory takerSignature
  ) public {
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
