pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./ITemplateRegistry.sol";
import "./TemplateRegistryStorage.sol";


/**
 * @title TemplateRegistry
 * @notice Registry for ACTUS compatible templates.
 * A Template is made up of a set of TemplateTerms and TemplateSchedules.
 */
contract TemplateRegistry is TemplateRegistryStorage, ITemplateRegistry {

    event RegisteredTemplate(bytes32 templateId);


    /**
     * @notice Returns the terms of a template.
     * @param templateId id of the template
     * @return TemplateTerms
     */
    function getTemplateTerms(bytes32 templateId) external view returns (TemplateTerms memory) {
        return (decodeAndGetTerms(templateId));
    }

    /**
     * @notice Returns an event for a given position (index) in a schedule of a given template.
     * @param templateId id of the template
     * @param scheduleId id of the schedule
     * @param index index of the event to return
     * @return Event
     */
    function getEventAtIndex(bytes32 templateId, uint8 scheduleId, uint256 index) external view returns (bytes32) {
        return templates[templateId].templateSchedules[scheduleId].templateSchedule[index];
    }

    /**
     * @notice Returns the length of a schedule (given its scheduleId) of a given template.
     * @param templateId id of the template
     * @param scheduleId id of the schedule
     * @return Length of the schedule
     */
    function getScheduleLength(bytes32 templateId, uint8 scheduleId) external view returns (uint256) {
        return templates[templateId].templateSchedules[scheduleId].length;
    }

    /**
     * @notice Convenience method for retrieving the entire schedule for a given scheduleId
     * Not recommended to execute it on-chain (if schedule is too long the tx may run out of gas)
     * @param templateId id of the template
     * @param scheduleId id of the schedule to retrieve
     * @return the schedule
     */
    function getSchedule(bytes32 templateId, uint8 scheduleId) external view returns (bytes32[] memory schedule) {
        uint256 scheduleLength = templates[templateId].templateSchedules[scheduleId].length;
        schedule = new bytes32[](scheduleLength);

        for (uint256 i = 0; i < scheduleLength; i++) {
            schedule[i] = templates[templateId].templateSchedules[scheduleId].templateSchedule[i];
        }

        return schedule;
    }

    /**
     * @notice Stores a new template for given set of TemplateTerms and TemplateSchedules.
     * The templateId is derived from the hash of the TemplateTerms and the TemplateSchedules
     * to circumvent duplicate TemplateTerms on-chain.
     * @param terms set of TemplateTerms
     * @param templateSchedules set of TemplateSchedules which encode offsets for ScheduleTime relative to an AnchorDate
     */
    function registerTemplate(TemplateTerms memory terms, TemplateSchedules memory templateSchedules) public {
        // derive the templateId from the hash of the provided TemplateTerms and TemplateSchedules
        bytes32 templateId = keccak256(
            abi.encode(
                keccak256(abi.encode(terms)),
                keccak256(abi.encode(templateSchedules))
            )
        );

        // revert if a template for the derived template already exists
        require(
            templates[templateId].isSet == false,
            "TemplateRegistry.registerTemplate: ENTRY_ALREADY_EXISTS"
        );

        // store the template
        setTemplate(templateId, terms, templateSchedules);

        emit RegisteredTemplate(templateId);
    }
}