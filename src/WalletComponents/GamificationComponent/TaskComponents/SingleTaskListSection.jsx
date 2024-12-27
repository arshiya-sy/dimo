import React, { useState } from 'react';
import PropTypes from 'prop-types';

import GamificationService from '../../../Services/Gamification/GamificationService';
import { ACTION_AVAILABLE, ACTION_COMPLETED } from '../../../Services/Gamification/GamificationTerms';

export default function SingleTasksListSection(props) {
    const [currentTaskState, setCurrentTaskState] = useState(ACTION_AVAILABLE);
    const [isTaskStateUpdated, setIsTaskStateUpdated] = useState(false);

    const {programData, taskData, taskIndex, localeObj, styles} = props;
    const stylesheet = {
        ...styles,
    };

    const { taskName, taskType, completedTaskMomentCount, taskMomentLimit, cumulativeTaskLimit } = taskData;

    if (completedTaskMomentCount >= taskMomentLimit) {
        taskData.cumulativeTaskProgress = cumulativeTaskLimit;
    }

    const originalTaskState = GamificationService.checkTaskState(programData, taskData);

    if (originalTaskState !== ACTION_AVAILABLE && !isTaskStateUpdated) {
        setTimeout(() => {
            setCurrentTaskState(originalTaskState);
            setIsTaskStateUpdated(true);
        }, 500);
    }

    return (
        <div key={taskIndex}>
            <hr style={stylesheet.taskDividerStyle} />
            <div 
                style={stylesheet.rewardTaskDetailStyle} 
                className={currentTaskState !== ACTION_AVAILABLE ? 'disableReward' : ''}
            >
                <div style={stylesheet.rewardTaskIconContStyle}>
                    {GamificationService.getMomentActionIcon(taskType, currentTaskState, true)}
                </div>
                <div style={{alignSelf: 'center'}}>
                    <div 
                        className={`
                            subtitle4 highEmphasis mb-5
                            ${GamificationService.getTaskActionAnimationClass(originalTaskState, isTaskStateUpdated)}
                        `}
                    >
                        {taskName}
                    </div>
                    <div 
                        className={`
                            textUppercase overline accent
                            ${GamificationService.getTaskStatusAnimationClass(originalTaskState, isTaskStateUpdated)}
                        `}
                    >
                        {GamificationService.getTaskStatusTitle(currentTaskState, localeObj)}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function MoreTasksListSection(props) {
    const [currentTaskState, setCurrentTaskState] = useState(ACTION_AVAILABLE);
    const [isTaskStateUpdated, setIsTaskStateUpdated] = useState(false);

    const {programData, localeObj, styles} = props;
    const stylesheet = {
        ...styles,
        moreTaskLimitTitleStyle: {
            whiteSpace: 'nowrap',
            overflow:'hidden',
            textOverflow: 'ellipsis'
        },
    };

    const multipleTasksCompleted = programData?.rewardsEligible === programData?.rewardsReceived;
    const originalTaskState = multipleTasksCompleted ? ACTION_COMPLETED : ACTION_AVAILABLE;

    if (originalTaskState !== ACTION_AVAILABLE && !isTaskStateUpdated) {
        setTimeout(() => {
            setCurrentTaskState(originalTaskState);
            setIsTaskStateUpdated(true);
        }, 500);
    }

    return (
        <>
            <hr style={stylesheet.taskDividerStyle} />
            <div style={stylesheet.rewardTaskDetailStyle} className={currentTaskState === ACTION_COMPLETED ? 'disableReward' : ''}>
                <div style={stylesheet.rewardTaskIconContStyle}>
                    {GamificationService.getMoreTaskActionIcon(currentTaskState)}
                </div>
                <div style={{ alignSelf: 'center', overflow: 'hidden' }}>
                    <div
                        style={stylesheet.moreTaskLimitTitleStyle} 
                        className={`
                            subtitle4 highEmphasis mb-5
                            ${GamificationService.getTaskActionAnimationClass(currentTaskState, isTaskStateUpdated)}
                        `} 
                    >
                        {GamificationService.getMoreTaskActionTitle(programData, localeObj)}
                    </div>
                    <div 
                        className={`
                            textUppercase overline
                            ${GamificationService.getTaskStatusAnimationClass(currentTaskState, isTaskStateUpdated)}
                        `}
                    >
                        {GamificationService.getMoreTaskActionStatus(currentTaskState, localeObj)}
                    </div>
                </div>
            </div>
        </>
    );
}

SingleTasksListSection.propTypes = {
    styles: PropTypes.object,
    taskData: PropTypes.object,
    taskIndex: PropTypes.number,
    localeObj: PropTypes.object,
    programData: PropTypes.object,
};

MoreTasksListSection.propTypes = {
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    programData: PropTypes.object,
};