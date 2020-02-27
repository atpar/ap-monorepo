pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./TemplateRegistryStorage.sol";


contract ITemplateRegistry is TemplateRegistryStorage {

    function getTemplateTerms(bytes32 templateId) external view returns (TemplateTerms memory);

    function getEventAtIndex(bytes32 templateId, uint256 index) external view returns (bytes32);

    function getScheduleLength(bytes32 templateId) external view returns (uint256);

    function registerTemplate(TemplateTerms memory terms, bytes32[] memory templateSchedule) public;
}