
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


    function encodeAndSetSchedule(bytes32 templateId, bytes32[] memory templateSchedule)
        internal
    {
        require(
            templateSchedule.length != 0,
            "TemplateRegistry.encodeAndSetSchedule: EMPTY_SCHEDULE"
        );
        require(
            templateSchedule.length < MAX_EVENT_SCHEDULE_SIZE,
            "TemplateRegistry.encodeAndSetSchedule: MAX_EVENT_SCHEDULE_SIZE"
        );

        for (uint256 i = 0; i < templateSchedule.length; i++) {
            if (templateSchedule[i] == bytes32(0)) break;
            templates[templateId].templateSchedule.events[i] = templateSchedule[i];
            templates[templateId].templateSchedule.length = i + 1;
        }
    }