pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "./ITemplateRegistry.sol";
import "./TemplateRegistryStorage.sol";


/**
 * @title TemplateRegistry
 * @notice Registry for ACTUS compatible templates.
 * A Template is made up of a set of TemplateTerms and TemplateSchedules.
 */
contract TemplateRegistry is TemplateRegistryStorage, ITemplateRegistry {

    event RegisteredTemplate(bytes32 indexed templateId);


    /**
     * @notice Returns true if there is a template registered for a given templateId
     * @param templateId id of the template
     * @return true if template exists
     */
    function isRegistered(bytes32 templateId)
        external
        view
        override
        returns (bool)
    {
        return templates[templateId].isSet;
    }

    /**
     * @notice Returns the terms of a template.
     * @param templateId id of the template
     * @return TemplateTerms
     */
    function getTemplateTerms(bytes32 templateId)
        external
        view
        override
        returns (TemplateTerms memory)
    {
        return (decodeAndGetTerms(templateId));
    }

    /**
     * @notice Returns an event for a given position (index) in a schedule of a given template.
     * @param templateId id of the template
     * @param index index of the event to return
     * @return Event
     */
    function getEventAtIndex(bytes32 templateId, uint256 index)
        external
        view
        override
        returns (bytes32)
    {
        return templates[templateId].templateSchedule.events[index];
    }

    /**
     * @notice Returns the length of a schedule of a given template.
     * @param templateId id of the template
     * @return Length of the schedule
     */
    function getScheduleLength(bytes32 templateId)
        external
        view
        override
        returns (uint256)
    {
        return templates[templateId].templateSchedule.length;
    }

    /**
     * @notice Convenience method for retrieving the entire schedule
     * Not recommended to execute method on-chain (if schedule is too long the tx may run out of gas)
     * @param templateId id of the template
     * @return the schedule
     */
    function getSchedule(bytes32 templateId)
        external
        view
        returns (bytes32[] memory)
    {
        uint256 scheduleLength = templates[templateId].templateSchedule.length;
        bytes32[] memory schedule = new bytes32[](scheduleLength);

        for (uint256 i = 0; i < scheduleLength; i++) {
            schedule[i] = templates[templateId].templateSchedule.events[i];
        }

        return schedule;
    }

    /**
     * @notice Stores a new template for given set of TemplateTerms and TemplateSchedules.
     * The templateId is derived from the hash of the TemplateTerms and the TemplateSchedules
     * to circumvent duplicate TemplateTerms on-chain.
     * @param terms set of TemplateTerms
     * @param templateSchedule templateSchedule which encodes offsets for ScheduleTime relative to an AnchorDate + EventType
     */
    function registerTemplate(TemplateTerms memory terms, bytes32[] memory templateSchedule)
        public
        override
    {
        // derive the templateId from the hash of the provided TemplateTerms and TemplateSchedule
        bytes32 templateId = keccak256(
            abi.encode(
                keccak256(abi.encode(terms)),
                keccak256(abi.encode(templateSchedule))
            )
        );

        // revert if a template for the derived template already exists
        require(
            templates[templateId].isSet == false,
            "TemplateRegistry.registerTemplate: ENTRY_ALREADY_EXISTS"
        );

        // store the template
        setTemplate(templateId, terms, templateSchedule);

        emit RegisteredTemplate(templateId);
    }
}