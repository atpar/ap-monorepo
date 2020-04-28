pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "./TemplateRegistryStorage.sol";


abstract contract ITemplateRegistry is TemplateRegistryStorage {

    function isRegistered(bytes32 templateId)
        external
        view
        virtual
        returns (bool);

    function getTemplateTerms(bytes32 templateId)
        external
        view
        virtual
        returns (TemplateTerms memory);

    function getEventAtIndex(bytes32 templateId, uint256 index)
        external
        view
        virtual
        returns (bytes32);

    function getScheduleLength(bytes32 templateId)
        external
        view
        virtual
        returns (uint256);

    function registerTemplate(TemplateTerms calldata terms, bytes32[] calldata templateSchedule)
        external
        virtual;
}