import React, { useEffect, useRef, useState } from 'react';
import Lottie from "lottie-react";
import PropTypes from 'prop-types';
import FlexView from "react-flexview";

import Chip from '@mui/material/Chip';
import Grid from "@material-ui/core/Grid";
import { Divider } from "@material-ui/core";
import Drawer from '@material-ui/core/Drawer';
import { styled } from "@material-ui/core/styles";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { withStyles } from "@material-ui/core/styles";
import NextIcon from '@material-ui/icons/ArrowForwardIos';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import PageNames from '../../../Services/PageNames';
import InputThemes from '../../../Themes/inputThemes';
import ColorPicker from '../../../Services/ColorPicker';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import GamificationService from '../../../Services/Gamification/GamificationService';
import PrimaryButtonComponent from '../../CommonUxComponents/PrimaryButtonComponent';
import { ACTION_AVAILABLE, ACTION_LOCKED, INFINITE_TERM_NUMBER, QUANTIFIER_TYPE_COUNT, QUANTIFIER_TYPE_AMOUNT, TASK_DIMO_BOLETO_CASHOUT, TASK_DIMO_CREDIT_CARD_REINVEST } from '../../../Services/Gamification/GamificationTerms';

import CompletedAnimatedIcon from '../../../images/GamificationImages/task/completed.json';

import 'animate.css';

const inputStyles = InputThemes.singleInputStyle;

const BorderLinearProgress = styled(LinearProgress)((props) => ({
    height: 10,
    borderRadius: props.borderRadius ?? "5px",
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor: props.disabled ? ColorPicker.darkDisabled : ColorPicker.tableBackground,
        transition: props.disabled ? "all 1s linear" : "unset"
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: props.borderRadius ?? "5px",
        backgroundColor: ColorPicker.accent,
        marginLeft: '-1px'
    },
}));

const QuantifierTypeUi = ({ localeObj, taskData, currentTaskState }) => {
    let { cumulativeTaskProgress, cumulativeTaskLimit, quantifierType } = taskData;
    let formattedCompletedAmount, formattedLimitAmount, progressBarUi, progressValue = null;

    cumulativeTaskProgress = cumulativeTaskProgress > cumulativeTaskLimit ? cumulativeTaskLimit : cumulativeTaskProgress;

    if (quantifierType === QUANTIFIER_TYPE_AMOUNT) {
        formattedCompletedAmount = GeneralUtilities.getFormattedAmount(cumulativeTaskProgress);
        formattedLimitAmount = GeneralUtilities.getFormattedAmount(cumulativeTaskLimit);
        progressValue = parseFloat((cumulativeTaskProgress / cumulativeTaskLimit) * 100).toFixed(2);
    } 
    else if (quantifierType === QUANTIFIER_TYPE_COUNT) {
        let progressBarUiValue = [];

        for (let taskLimitIndex = 1; taskLimitIndex <= cumulativeTaskLimit; taskLimitIndex++) {
            let borderRadiusStyle = "5px";
            let progressUiValue = cumulativeTaskProgress;
            
            if (taskLimitIndex === 1 && cumulativeTaskLimit > 1) {
                borderRadiusStyle = "5px 0px 0px 5px";                
            } else if (taskLimitIndex === cumulativeTaskLimit && cumulativeTaskLimit > 1) {
                borderRadiusStyle = "0px 5px 5px 0px";
            } else if (taskLimitIndex !== 1 && cumulativeTaskLimit > 1) {
                borderRadiusStyle = "0px";
            }

            progressBarUiValue.push(
                <Grid key={taskLimitIndex} xs item style={{ paddingInline: 1 }}>
                    <BorderLinearProgress
                        variant="determinate" className='my-8' style={{ height: "0.75rem" }}
                        value={cumulativeTaskProgress !== 0 && progressUiValue >= taskLimitIndex ? 100 : 0}
                        borderRadius={borderRadiusStyle}
                    />
                </Grid>
            );

            progressUiValue -= 1;
        }

        progressBarUi = <Grid spacing={1} container>
            { progressBarUiValue.map((progressData) => progressData) }
        </Grid>;
    }
    
    return (
        <>
            {/* Quantifier Type EVERY_COUNT UI Section */}
            {
                quantifierType === QUANTIFIER_TYPE_COUNT
                && <FlexView column className='w-100 mt-16 px-24'>
                    <FlexView column className='px-32 py-16 br-10' style={{ backgroundColor: ColorPicker.lightEmphasis }}>
                        <FlexView column className='w-100' hAlignContent="center">
                            <div className="body3 highEmphasis">{localeObj.task_progress}</div>
                            { 
                                currentTaskState === ACTION_LOCKED 
                                && <div className="caption ligtherAccent my-5">{localeObj.progress_locked}</div>
                            }
                        </FlexView>
        
                        { progressBarUi }
                        
                        <FlexView className='w-100' hAlignContent="center" vAlignContent="center">
                            <span className="caption mediumEmphasis">{ cumulativeTaskProgress }</span>
                            <span className="body3 highEmphasis">{ ` / ${cumulativeTaskLimit} ` }</span>
                            <span className="caption mediumEmphasis">{ localeObj.transaction_completed }</span>
                        </FlexView>
                    </FlexView>
                </FlexView>
            }

            {/* Quantifier Type EVERY_VALUE UI Section */}
            {
                quantifierType === QUANTIFIER_TYPE_AMOUNT
                &&  <FlexView column className='w-100 mt-16 px-24'>
                    <FlexView column className='px-32 py-16 br-10' style={{ backgroundColor: ColorPicker.lightEmphasis }}>
                        <FlexView column className='w-100' hAlignContent="center">
                            <span className="body3 highEmphasis">{localeObj.spend_progress}</span>
                            {
                                currentTaskState === ACTION_LOCKED
                                && <div className="caption ligtherAccent my-5">{localeObj.progress_locked}</div>
                            }
                        </FlexView>

                        <div>
                            <BorderLinearProgress variant="determinate" value={progressValue} className='my-8' style={{ height: "0.75rem" }} />
                        </div>

                        <FlexView className='w-100' hAlignContent="center" vAlignContent="center">
                            <span className="caption mediumEmphasis">{ `R$ ${formattedCompletedAmount}` }</span>
                            <span className="body3 highEmphasis">{ ` / R$ ${formattedLimitAmount}` }</span>
                        </FlexView>
                    </FlexView>
                </FlexView>
            }
        </>
    );
};

const TaskLimitUi = ({ stylesheet, taskData, currentTaskState }) => {
    const { completedTaskMomentCount, taskMomentLimit } = taskData;

    let taskLimitUiValue = [];

    for (let taskLimitIndex = 1; taskLimitIndex <= taskMomentLimit; taskLimitIndex++) {
        const completedTaskIndex = completedTaskMomentCount !== 0 && taskLimitIndex <= completedTaskMomentCount;
        let taskLimitStyle, taskLimitIndexUi = "";

        if (completedTaskIndex) {
            taskLimitStyle = { border: `1px solid ${ColorPicker.accent}`, padding: '0.5rem', backgroundColor: ColorPicker.accent };
            taskLimitIndexUi = (<CheckIcon style={{ fontSize: '1rem' }} />);
        } else {
            taskLimitStyle = { border: `2px dashed ${ColorPicker.disableColour}`, padding: '0.625rem' };

            if (currentTaskState === ACTION_AVAILABLE) {
                taskLimitIndexUi = taskLimitIndex;
            } else {
                taskLimitIndexUi = (<CloseIcon className='animate__animated animate__fadeInUp animate__fast' style={{ fontSize: '1rem' }} />);                
            }
        }

        taskLimitUiValue.push(
            <FlexView
                key={taskLimitIndex} hAlignContent='center' vAlignContent='center'
                className={`CaptionBold mr-5 ${completedTaskIndex ? 'highEmphasis' : 'disabled'}`}
                style={{ ...stylesheet.taskLimitCircleStyle, ...taskLimitStyle }}
            >
                {taskLimitIndexUi}
            </FlexView>
        );
    }

    return <>{taskLimitUiValue.map((taskLimitData) => taskLimitData) }</>;
}
function SingleTaskDetailsSection(props) {
    const { 
        programData, localeObj, styles, taskData, moveToNextScreen,
        resetData, classes, onBackButtonPressed, playSwipeableTask,
        pauseSwipeableTask, showQuantifierTypeUi
    } = props;
    
    const stylesheet = {
        ...styles,  
        taskTypeIconStyle: {
            border: `2px solid ${ColorPicker.white}`,
            borderRadius: '50%',
            padding: '1.2rem',
            lineHeight: 0,
            position: 'relative'
        },
        taskLimitCircleStyle: {
            borderRadius: '50%',
            height: '1.5rem',
            width: '1.5rem'
        }
    };
    
    const multiplierAnimIntervalId = useRef(null);
    const [isTaskStateUpdated, setIsTaskStateUpdated] = useState(false);
    const [currentTaskState, setCurrentTaskState] = useState(ACTION_AVAILABLE);
    const [currentMultiplierCount, setCurrentMultiplierCount] = useState(1);
    const [showMultiplierAnim, setShowMultiplierAnim] = useState(true);
    const [showMultiplierBottomSheet, setShowMultiplierBottomSheet] = useState(false);

    const { rewardType, frequencyDuration } = programData;
    const { taskName, taskDescription, taskType, rewardMultiplier, completedTaskMomentCount, taskMomentLimit, cumulativeTaskLimit } = taskData;

    if (completedTaskMomentCount >= taskMomentLimit) {
        taskData.cumulativeTaskProgress = cumulativeTaskLimit;
    }

    const frequencyDurationLabel = GeneralUtilities.getTranslatedString("frequency_", frequencyDuration, localeObj);
    const taskStatus = GamificationService.getTaskStatusTitle(currentTaskState, localeObj);
    const originalTaskState = GamificationService.checkTaskState(programData, taskData);
    const rewardTypeLabel = GeneralUtilities.getTranslatedString("reward_", rewardType, localeObj);
    const formattedMultiplierDescription = GeneralUtilities.formattedString(localeObj.multiplier_info_description, [rewardMultiplier, rewardTypeLabel]);

    useEffect(() => {
        window.onBackPressed = () => {
            if (showMultiplierBottomSheet) {
                setShowMultiplierBottomSheet(false);
            } else {
                onBackButtonPressed();
            }
        }
    }, [showMultiplierBottomSheet]);

    useEffect(() => {
        const resetInitialStateData = () => {
            setCurrentTaskState(ACTION_AVAILABLE);
            setIsTaskStateUpdated(false);

            // Task Limit and Multiplier Data
            setCurrentMultiplierCount(1);
            setShowMultiplierAnim(true);
        }

        resetInitialStateData();

        if (rewardMultiplier > 0) {
            multiplierAnimIntervalId.current = setInterval(() => {
                setCurrentMultiplierCount(count => count + 1);
            }, 1000);
        } else {
            setTimeout(() => setShowMultiplierAnim(false), 2000);
        }

        return (() => {
            multiplierAnimIntervalId.current && clearInterval(multiplierAnimIntervalId.current);
        });
    }, [resetData]);

    useEffect(() => {
        if (currentMultiplierCount >= rewardMultiplier) {
            clearInterval(multiplierAnimIntervalId.current);
            setTimeout(() => setShowMultiplierAnim(false), 2000);
        }
    }, [currentMultiplierCount, rewardMultiplier]);

    useEffect(() => {
        const currentTaskStateAnimationHandler = () => {
            if (originalTaskState !== ACTION_AVAILABLE && !isTaskStateUpdated) {
                setTimeout(() => {
                    setCurrentTaskState(originalTaskState);
                    setIsTaskStateUpdated(true);
                }, 500);
            }
        }
        
        if (!isTaskStateUpdated) { currentTaskStateAnimationHandler(); }
    }, [isTaskStateUpdated, originalTaskState]);

    const getMomentActionHandler = (taskType) => {
        GeneralUtilities.sendActionMetrics(PageNames.GamificationComponent.program_details, `OPEN_TASK_${taskType}`);

        if (taskType === TASK_DIMO_BOLETO_CASHOUT) {
            return GamificationService.momentActionHandler(taskType);
        }

        let initialComponentData = {};

        if (taskType === TASK_DIMO_CREDIT_CARD_REINVEST) {
            initialComponentData = { additionalInfo: { "creditActions": "investMentHomePage" } };
        }

        const storeToHistoryPath = false;

        return moveToNextScreen(
            GamificationService.momentActionHandler(taskType), 
            storeToHistoryPath, { isRunningProgram: true }, initialComponentData
        );
    }

    const showMultiplierBottomSheetHandler = () => {
        setShowMultiplierBottomSheet(true);
        pauseSwipeableTask();
    }

    const hideMultiplierBottomSheetHandler = () => {
        setShowMultiplierBottomSheet(false);
        playSwipeableTask();
    }

    const getCurrentMultiplierChipUi = () => (
        <Chip
            className="tagStyle ml-5 gradient-accent"
            style={{ ...stylesheet.countChipStyle, backgroundColor: ColorPicker.accent, top: '0.75rem' }}
            label={(
                <div className={`overline-1 highEmphasis textUppercase animate__animated ${showMultiplierAnim ? 'animate__heartBeat animate__infinite' : ''}`}>
                    {`${localeObj.multiplier_bonus} ${currentMultiplierCount}x`}
                </div>
            )}
            onClick={showMultiplierBottomSheetHandler}
        />
    );

    return (
        <>
            {/* Single Task Details Section */}
            <FlexView
                column className="mb-0" align="center" hAlignContent='center' vAlignContent='center'
                style={{
                    ...stylesheet.programRewardCardStyle,
                    position: 'relative',
                    opacity: currentTaskState !== ACTION_AVAILABLE ? 0.4 : 1
                }}
            >
                { rewardMultiplier > 1 && getCurrentMultiplierChipUi() }

                <div style={stylesheet.taskTypeIconStyle}>
                    { GamificationService.getMomentActionIcon(taskType, currentTaskState) }
                </div>

                <div className='mt-10 mb-10 px-24' style={{ lineHeight: '1.4rem' }}>
                    <div className="body3 highEmphasis mb-5">{taskName}</div>
                    <FlexView
                        hAlignContent='center' vAlignContent='center'
                        style={{height: '1rem'}}
                        className={`
                            textUppercase highEmphasis overline mb-5 
                            ${GamificationService.getTaskStatusAnimationClass(originalTaskState, isTaskStateUpdated)}
                        `}
                    >
                        {
                            currentTaskState !== ACTION_AVAILABLE
                            ? <Lottie
                                animationData={CompletedAnimatedIcon} loop={false}
                                style={{ ...stylesheet.rewardSvgIconStyle, width: '1rem', marginRight: '0.125rem', lineHeight: 0 }}
                            /> 
                            : ''
                        }
                        {taskStatus}
                    </FlexView>
                    <div className="caption ligtherAccent">{taskDescription}</div>
                </div>

                <FlexView 
                    style={{ alignItems: 'center' }} 
                    className={`${currentTaskState !== ACTION_AVAILABLE ? 'disableReward' : ''}  px-24`}
                    onClick={() => currentTaskState === ACTION_AVAILABLE && getMomentActionHandler(taskType)}
                >
                    <div 
                        className={`
                            body2 highEmphasis
                            ${GamificationService.getTaskActionAnimationClass(originalTaskState, isTaskStateUpdated)}
                        `}
                        style={{ textDecoration: 'underline' }}
                    >
                        {GamificationService.getMomentActionTitle(taskType, localeObj)}
                    </div>
                    <NextIcon style={{ ...stylesheet.rewardSvgIconStyle, width: '0.625rem', marginLeft: '0.313rem' }} />
                </FlexView>

                { 
                    showQuantifierTypeUi 
                    && <QuantifierTypeUi localeObj={localeObj} taskData={taskData} currentTaskState={currentTaskState} /> 
                }

                <Divider className='w-100' style={{ border: `1px solid ${ColorPicker.darkBorderColor}`, height: 0, marginTop: '1rem' }} />
                
                <FlexView 
                    className="px-16 mt-10 w-100"
                    hAlignContent='center' vAlignContent='center'
                    style={{ flexWrap: "wrap", rowGap: "0.313rem" }}
                >
                    {
                        taskMomentLimit >= INFINITE_TERM_NUMBER
                        ? <div className={`textUppercase ligtherAccent overline py-5`}>{ localeObj.no_limit_tasks }</div>
                        : <>
                            <div className="CaptionBold highEmphasis mr-10">
                                {GeneralUtilities.formattedString(localeObj.frequency_limit, [frequencyDurationLabel])}:
                            </div>

                            <TaskLimitUi localeObj={localeObj} stylesheet={stylesheet} taskData={taskData} currentTaskState={currentTaskState} />
                        </>
                    }
                </FlexView>
            </FlexView>

            {/* Multiplier Details Bottom Sheet */}
            {
                showMultiplierBottomSheet
                && <div id="outer" className="accountOuterContainer w-100">
                    <Drawer
                        anchor="bottom"
                        classes={{ paper: classes.paper }}
                        open={showMultiplierBottomSheet}
                    >
                        <FlexView column className='m-24 text-center'>
                            <div className="headline6 highEmphasis">
                                {localeObj.multiplier_info}
                            </div>
                            <div className="body2 mediumEmphasis mt-16">
                                {formattedMultiplierDescription}
                            </div>
                        </FlexView>

                        <FlexView className='mb-24 w-100' hAlignContent='center'>
                            <PrimaryButtonComponent
                                btn_text={localeObj.multiplier_info_btn}
                                onCheck={hideMultiplierBottomSheetHandler}
                            />
                        </FlexView>
                    </Drawer>
                </div>
            }
        </>
    );
}

QuantifierTypeUi.propTypes = {
    taskData: PropTypes.object,
    localeObj: PropTypes.object,
    currentTaskState: PropTypes.string,
};

TaskLimitUi.propTypes = {
    taskData: PropTypes.object,
    localeObj: PropTypes.object,
    stylesheet: PropTypes.object,
    currentTaskState: PropTypes.string,
};

SingleTaskDetailsSection.propTypes = {
    styles: PropTypes.object,
    classes: PropTypes.object,
    taskData: PropTypes.object,
    resetData: PropTypes.any,
    localeObj: PropTypes.object,
    programData: PropTypes.object,
    moveToNextScreen: PropTypes.func,
    playSwipeableTask: PropTypes.func,
    pauseSwipeableTask: PropTypes.func,
    onBackButtonPressed: PropTypes.func,
    showQuantifierTypeUi: PropTypes.bool,
};

export default withStyles(inputStyles)(SingleTaskDetailsSection);