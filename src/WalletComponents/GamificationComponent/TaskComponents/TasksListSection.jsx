import React from 'react';
import PropTypes from 'prop-types';

import ColorPicker from "../../../Services/ColorPicker";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import SingleTasksListSection, { MoreTasksListSection } from './SingleTaskListSection';

export default function TasksListSection(props) {
    const {programData, localeObj, styles} = props;
    const stylesheet = {
        ...styles,
        taskDividerStyle: {
            margin: 0, 
            marginBottom: '1rem',
            border: '1px solid',
            borderColor: ColorPicker.tableBackground
        },
        rewardTaskDetailStyle: {
            display: "flex",
            width: "auto",
            paddingInline: '1.5rem',
            paddingBottom: '1rem'
        },
        rewardTaskIconContStyle: {
            ...styles.rewardTaskIconContStyle,
            border: `2px solid ${ColorPicker.white}`,
            borderRadius: '50%',
            padding: '1rem',
            lineHeight: 0,
            position: 'relative'
        }
    };

    return (
        <>
            {/* Less than 2 Program Tasks Details Section */}
            {
                GeneralUtilities.isNotEmpty(programData.tasks)
                && programData.tasks.length <= 2
                && programData.tasks.map((taskData, taskIndex) =>
                    <SingleTasksListSection
                        key={taskIndex} styles={stylesheet} localeObj={localeObj}
                        programData={programData} taskData={taskData} taskIndex={taskIndex}
                    />
                )
            }

            {/* More than 2 Program Tasks Details Section */ }
            {
                GeneralUtilities.isNotEmpty(programData.tasks)
                && programData.tasks.length > 2
                && <MoreTasksListSection programData={programData} styles={stylesheet} localeObj={localeObj} />
            }
        </>
    );
}

TasksListSection.propTypes = {
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    programData: PropTypes.object,
};