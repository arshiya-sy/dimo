import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";

import Paper from '@material-ui/core/Paper';

import ColorPicker from "../../../Services/ColorPicker";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import ShimmerComponent from '../../CommonUxComponents/ShimmerComponent';
import GamificationAPIs from '../../../Services/Gamification/GamificationAPIs';
import GamificationService from '../../../Services/Gamification/GamificationService';
import { ACTION_AVAILABLE, TASK_DIMO_CARD_CASHOUT } from '../../../Services/Gamification/GamificationTerms';


export default function TaskOverviewSection(props) {
    const [processing, setProcessing] = useState(false);
    const [taskOverviewData, setTaskOverviewData] = useState({});

    const { state, localeObj, styles } = props;
    const { programData } = state;
    const { programId, rewardType } = programData;

    useEffect(() => {
        (async () => {
            setProcessing(true);
            
            // const fetchedTaskOverviewData = await GamificationAPIs.fetchCompletedProgramTasksAPI(programId, rewardType);
            const fetchedTaskOverviewData = [{taskOff: "true"},{taskOff: "true"}, ];
            setTaskOverviewData(fetchedTaskOverviewData);
            
            setProcessing(false);
        })();
    }, [programId, rewardType]);

    const stylesheet = {
        ...styles,
        programTaskCardStyle: {
            borderRadius: "1rem",
            backgroundColor: ColorPicker.rewardCardBg
        },
        taskTypeIconStyle: {
            lineHeight: 0,
            padding: '1.2rem',
            borderRadius: '50%',
            position: 'relative',
            backgroundColor: ColorPicker.lightEmphasis
        },
        taskValuePaperStyle: {
            borderRadius: "1rem",
            backgroundColor: ColorPicker.rewardCardBgLight
        }
    };

    return (
        <div className='p-24'>
            <div className='highEmphasis subtitle4 mb-16'>{localeObj.program_tasks_overview}</div>

            {
                processing
                && <ShimmerComponent
                    totalComponents={2}
                    loadingComponents={[
                        {
                            name: "inline-content", classNames: "br-16",
                            inlineLeftContents: [{ name: "icon", classNames: "br-rounded" }],
                            inlineRightContents: [{name: "subtitle", classNames: "br-16"}, {name: "subtitle", classNames: "mt-5 br-16"}]
                        },
                        {name: "title", classNames: "mt-16 br-16"}
                    ]}
                    containerClasses={{ pageClassNames: "mt-10", containerClassNames: "br-16 px-24 py-10" }}
                />
            }

            {
                !processing
                && GeneralUtilities.isNotEmpty(taskOverviewData)
                && taskOverviewData.map((taskData, taskIndex) => {
                    const { taskName = "Credit card spend", taskType = TASK_DIMO_CARD_CASHOUT, currentTaskState = ACTION_AVAILABLE, completedTasks = 3, eligibleTasks = 5, valueSpend = 1000,  } = taskData;
                    const formattedValueSpend = `R$ ${GeneralUtilities.formatAmount(valueSpend)}`;
                    const taskValueSpendTxt = GeneralUtilities.formattedString(localeObj.task_value_spend, [formattedValueSpend]);
                    const taskCompletedCount = GeneralUtilities.formattedString(localeObj.task_completed_count, [completedTasks, eligibleTasks]);

                    return (
                        <Paper key={taskIndex} style={stylesheet.programTaskCardStyle} className='px-24 py-10 mt-10' elevation={0}>
                            <FlexView vAlignContent='center'>
                                <div style={stylesheet.taskTypeIconStyle}>
                                    { GamificationService.getMomentActionIcon(taskType, currentTaskState) }
                                </div>

                                <FlexView column vAlignContent='center' className='ml-10'>
                                    <div className='highEmphasis body3'>{taskName}</div>
                                    <div className='accent overline textUppercase mt-5'>{taskCompletedCount}</div>
                                </FlexView>
                            </FlexView>

                            <Paper style={stylesheet.taskValuePaperStyle} className='mt-16 px-24 py-10 text-center' elevation={0}>
                                <div className='highEmphasis CaptionBold'>{taskValueSpendTxt}</div>
                            </Paper>
                        </Paper>
                    )
                })
            }
        </div>
    );
}

TaskOverviewSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string
};