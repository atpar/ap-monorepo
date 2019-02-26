pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./IOwnershipRegistry.sol";
import "./IContractRegistry.sol";
import "./IPaymentRegistry.sol";
import "./IPaymentRouter.sol";

import "../AFPCore/AFPDefinitions.sol";
import "../AFPEngines/IPAMEngine.sol";


contract PAMContractActor is AFPDefinitions {

  IOwnershipRegistry ownershipRegistry;
  IContractRegistry contractRegistry;
  IPaymentRegistry paymentRegistry;
  IPaymentRouter paymentRouter;

  IPAMEngine pamEngine;


  constructor (
    IOwnershipRegistry _ownershipRegistry,
    IContractRegistry _contractRegistry,
    IPaymentRegistry _paymentRegistry,
    IPaymentRouter _paymentRouter,
    IPAMEngine _pamEngine
  ) public {
    ownershipRegistry = _ownershipRegistry;
    contractRegistry = _contractRegistry;
    paymentRegistry = _paymentRegistry;
    paymentRouter = _paymentRouter;
    pamEngine = _pamEngine;
  }
  
  function progress (
    bytes32 _contractId,
    uint256 _timestamp
  ) 
    external 
  {
    PAMContractTerms memory terms = contractRegistry.getTerms(_contractId);
    ContractState memory state = contractRegistry.getState(_contractId);
    
    require(terms.statusDate != uint256(0));
    require(state.lastEventTime != uint256(0));
    require(state.contractStatus == ContractStatus.PF);

    uint256 eventId = contractRegistry.getEventId(_contractId);

    (ContractState memory nextState, ContractEvent[MAX_EVENT_SCHEDULE_SIZE] memory pendingEvents) = pamEngine.getNextState(terms, state, _timestamp);

    
    for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
      if (pendingEvents[i].scheduledTime == uint256(0)) { break; }
      uint256 payoff = (pendingEvents[i].payOff < 0) ? uint256(pendingEvents[i].payOff * -1) : uint256(pendingEvents[i].payOff);
      if (payoff == uint256(0)) { continue; }
      require(paymentRegistry.getPayoffBalance(_contractId, eventId) >= payoff, "OUTSTANDING_PAYMENTS");
      eventId += 1;
    }

    // check for non-payment events ...

    contractRegistry.setState(_contractId, nextState);
    contractRegistry.setEventId(_contractId, eventId);
  }
}