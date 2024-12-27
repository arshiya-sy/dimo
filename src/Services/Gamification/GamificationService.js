import React from 'react';
import 'moment/locale/pt';
import momentLocale from 'moment';
import Lottie from "lottie-react";
import moment from 'moment-timezone';

import PixIcon from '@mui/icons-material/Pix';
import CardIcon from '@material-ui/icons/CreditCard';
import ChecklistIcon from '@mui/icons-material/Rule';
import BoletoIcon from '@mui/icons-material/ReceiptLong';
import PhoneAndroidIcon from '@material-ui/icons/PhoneAndroid';

import Log from "../Log";
import ColorPicker from "../ColorPicker";
import GeneralUtilities from "../GeneralUtilities";
import androidApiCalls from "../androidApiCallsService";
import {
    ACTION_AVAILABLE, ACTION_COMPLETED, ACTION_LOCKED, COMPLETE_TYPE_AND, COMPLETE_TYPE_NA,
    COMPLETE_TYPE_OR, DEFAULT_TIMEZONE, TASK_DIMO_BOLETO_CASHOUT, TASK_DIMO_CARD_CASHOUT,
    TASK_DIMO_PIX_CASHOUT, TASK_DIMO_RECHARGE_CASHOUT, TASK_DIMO_CREDIT_CARD_CASHOUT, TASK_DIMO_DEBIT_CARD_CASHOUT,
    TASK_DIMO_CREDIT_CARD_ONBOARDING, INFINITE_TERM_NUMBER, QUANTIFIER_TYPE_COUNT, QUANTIFIER_TYPE_AMOUNT,
    TASK_DIMO_CREDIT_CARD_REINVEST, TASK_DIMO_FGTS_LOAN_APPROVED, REWARD_TYPE_LUCKY_NUMBER
} from './GamificationTerms';

import LockedAnimatedIcon from '../../images/GamificationImages/task/locked.json';
import CompletedAnimatedIcon from '../../images/GamificationImages/task/completed.json';
import LockedDisableAnimatedIcon from '../../images/GamificationImages/task/locked-disable.json';
import { ReactComponent as FGTSLoanIconSvg } from "../../images/GamificationImages/task/FGTS.svg";
import CompletedDisableAnimatedIcon from '../../images/GamificationImages/task/completed-disable.json';
import { ReactComponent as CCInvestIconSvg } from "../../images/GamificationImages/task/credit-card-investment.svg";

moment.tz.setDefault(DEFAULT_TIMEZONE);

function GamificationService() {
    this.style = {
        taskSvgIconStyle: {
            height: "auto",
            width: "1.5rem",
            alignSelf: "middle",
            fill: ColorPicker.white,
            position: 'absolute',
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)"
        },
    };

    this.getMomentActionTitle = (taskType, localeObj) => {
        let momentActionTitle = '';

        switch (taskType) {
            case TASK_DIMO_CARD_CASHOUT: momentActionTitle = localeObj.manage_cards; break;
            case TASK_DIMO_DEBIT_CARD_CASHOUT: momentActionTitle = localeObj.manage_cards; break;
            case TASK_DIMO_CREDIT_CARD_CASHOUT: momentActionTitle = localeObj.manage_cards; break;
            case TASK_DIMO_CREDIT_CARD_REINVEST: momentActionTitle = localeObj.invest_more; break;
            case TASK_DIMO_CREDIT_CARD_ONBOARDING: momentActionTitle = localeObj.onboard_credit_card; break;
            case TASK_DIMO_PIX_CASHOUT: momentActionTitle = localeObj.pay_pix; break;
            case TASK_DIMO_BOLETO_CASHOUT: momentActionTitle = localeObj.pay_boleto; break;
            case TASK_DIMO_RECHARGE_CASHOUT: momentActionTitle = localeObj.recharge_phone; break;
            case TASK_DIMO_FGTS_LOAN_APPROVED: momentActionTitle = localeObj.fgts_loan; break;
            default: momentActionTitle = localeObj.main_menu;
        }

        return momentActionTitle;
    }

    this.getMomentActionIcon = (taskType, taskCurrentState, isDisabled = false) => {
        let momentActionIcon = '';

        const lockedIcon = isDisabled ? LockedDisableAnimatedIcon : LockedAnimatedIcon;
        const completedIcon = isDisabled ? CompletedDisableAnimatedIcon : CompletedAnimatedIcon;

        if (taskCurrentState !== ACTION_AVAILABLE) {
            momentActionIcon = <Lottie
                style={this.style.taskSvgIconStyle} loop={false}
                animationData={taskCurrentState === ACTION_COMPLETED ? completedIcon : lockedIcon}
            />;
        } else {
            switch (taskType) {
                case TASK_DIMO_CARD_CASHOUT: momentActionIcon = <CardIcon style={this.style.taskSvgIconStyle} />; break;
                case TASK_DIMO_DEBIT_CARD_CASHOUT: momentActionIcon = <CardIcon style={this.style.taskSvgIconStyle} />; break;
                case TASK_DIMO_CREDIT_CARD_CASHOUT: momentActionIcon = <CardIcon style={this.style.taskSvgIconStyle} />; break;
                case TASK_DIMO_CREDIT_CARD_REINVEST: momentActionIcon = <CCInvestIconSvg style={this.style.taskSvgIconStyle} />; break;
                case TASK_DIMO_CREDIT_CARD_ONBOARDING: momentActionIcon = <CCInvestIconSvg style={this.style.taskSvgIconStyle} />; break;
                case TASK_DIMO_PIX_CASHOUT: momentActionIcon = <PixIcon style={this.style.taskSvgIconStyle} />; break;
                case TASK_DIMO_BOLETO_CASHOUT: momentActionIcon = <BoletoIcon style={this.style.taskSvgIconStyle} />; break;
                case TASK_DIMO_RECHARGE_CASHOUT: momentActionIcon = <PhoneAndroidIcon style={this.style.taskSvgIconStyle} />; break;
                case TASK_DIMO_FGTS_LOAN_APPROVED: momentActionIcon = <FGTSLoanIconSvg style={this.style.taskSvgIconStyle} />; break;
                default: momentActionIcon = <CardIcon style={this.style.taskSvgIconStyle} />;
            }
        }

        return momentActionIcon;
    }

    this.momentActionHandler = (taskType) => {
        let redirectPathName = '';
        switch (taskType) {
            case TASK_DIMO_CARD_CASHOUT: redirectPathName = '/digitalCard'; break;
            case TASK_DIMO_DEBIT_CARD_CASHOUT: redirectPathName = '/digitalCard'; break;
            case TASK_DIMO_CREDIT_CARD_CASHOUT: redirectPathName = '/creditCard'; break;
            case TASK_DIMO_CREDIT_CARD_REINVEST: redirectPathName = '/creditCard'; break;
            case TASK_DIMO_CREDIT_CARD_ONBOARDING: redirectPathName = '/creditCard'; break;
            case TASK_DIMO_PIX_CASHOUT: redirectPathName = '/pixSendComponent'; break;
            case TASK_DIMO_BOLETO_CASHOUT: this.handleBoletoTaskAction(); return;
            case TASK_DIMO_RECHARGE_CASHOUT: redirectPathName = '/cellularRecharge'; break;
            case TASK_DIMO_FGTS_LOAN_APPROVED: redirectPathName = '/fgtsHome'; break;
            default: redirectPathName = '/allServices';
        }

        return redirectPathName;
    }

    this.handleBoletoTaskAction = () => {
        document.activeElement.blur();
        if (androidApiCalls.checkSelfPermission(GeneralUtilities.CAMERA_PERMISSION) === 0) {
            androidApiCalls.scanBoletoCode();
        } else {
            androidApiCalls.requestPermission(GeneralUtilities.CAMERA_PERMISSION);
        }
    }

    this.getMomentProgressStatus = (momentData, localeObj) => {
        const { rewardsReceived, rewardsEligible, rewardType } = momentData;
        const rewardTypeLabel = GeneralUtilities.getTranslatedString("reward_", rewardType, localeObj);

        let taskProgressString = '';

        if (rewardsReceived === 0) {
            // No reward received
            taskProgressString = localeObj.task_not_initiated;
        }
        else if (rewardsEligible >= INFINITE_TERM_NUMBER && rewardsReceived > 0) {
            // Reward with No Limit Case
            taskProgressString = GeneralUtilities.formattedString(localeObj.task_progress_no_limit, [rewardsReceived, rewardTypeLabel]);
        }
        else if (rewardsEligible > 0 && rewardsReceived > 0 && !(rewardsReceived >= rewardsEligible)) {
            // Reward with limit case with more than one reward won but less than eligible
            taskProgressString = GeneralUtilities.formattedString(localeObj.task_progress_status, [(rewardsEligible - rewardsReceived), rewardTypeLabel]);
        }
        else if (rewardsReceived >= rewardsEligible) {
            // Reward Limit Case with more than one reward won and equals to eligible rewards
            taskProgressString = localeObj.task_complete_tomorrow;

            const drawDate = moment(momentData.drawDate);
            const programEndDate = moment(momentData.programEndDate);
            const todayStartDate = moment().format('YYYY-MM-DD 00:00:00');
            const drawEndsInDays = drawDate.diff(todayStartDate, 'days');
            const programEndInDays = programEndDate.diff(todayStartDate, 'days');

            if (drawEndsInDays <= 1 && programEndInDays > 1) {
                // Draw ends in 1 days but in the middle of the program
                taskProgressString = localeObj.draw_complete_tomorrow;
            } else if (drawEndsInDays <= 1 && programEndInDays <= 1) {
                // Draw ends in 1 days and program will also ends in less than equals to 1 days
                taskProgressString = localeObj.task_completed_period;
            }
        }

        return taskProgressString;
    }

    this.checkTaskState = (momentData, taskData) => {
        const rewardsReceived = momentData.rewardsReceived;
        const rewardsEligible = momentData.rewardsEligible;
        const tasksCompletionType = momentData.shouldCompleteTasks; // NA, AND, OR

        if ([COMPLETE_TYPE_AND, COMPLETE_TYPE_NA].includes(tasksCompletionType)) {
            // with AND / NA condition
            return rewardsEligible === rewardsReceived ? ACTION_COMPLETED : ACTION_AVAILABLE;
        }

        if (tasksCompletionType === COMPLETE_TYPE_OR) {
            // with OR condition
            let taskState = ACTION_AVAILABLE;
            const cumulativeTaskLimit = taskData.cumulativeTaskLimit;
            const cumulativeTaskProgress = taskData.cumulativeTaskProgress;

            if (rewardsReceived >= rewardsEligible) {
                // reward received greater or equals to eligible rewards
                taskState = cumulativeTaskProgress >= cumulativeTaskLimit ? ACTION_COMPLETED : ACTION_LOCKED;
            } else {
                // reward received less than eligible rewards
                taskState = cumulativeTaskProgress >= cumulativeTaskLimit ? ACTION_COMPLETED : ACTION_AVAILABLE;
            }

            return taskState;
        }
    }

    this.getTaskStatusTitle = (taskCurrentState, localeObj) => {
        let taskStatusTitle = '';

        switch (taskCurrentState) {
            case ACTION_COMPLETED: taskStatusTitle = localeObj.task_completed; break;
            case ACTION_LOCKED: taskStatusTitle = localeObj.task_locked; break;
            case ACTION_AVAILABLE: taskStatusTitle = localeObj.task_running; break;
            default: taskStatusTitle = localeObj.task_running;
        }

        return taskStatusTitle;
    }

    this.getMoreTaskActionTitle = (momentData, localeObj) => {
        const moreTasksCountTitle = GeneralUtilities.formattedString(localeObj.more_tasks, [momentData?.tasks?.length - 1]);
        return `${momentData.tasks[0].taskName} ${moreTasksCountTitle}`;
    }

    this.getMoreTaskActionIcon = (taskStatus) => {
        return taskStatus === ACTION_COMPLETED
            ? <Lottie loop={false} animationData={CompletedDisableAnimatedIcon} style={this.style.taskSvgIconStyle} />
            : <ChecklistIcon style={this.style.taskSvgIconStyle} />;
    }

    this.getMoreTaskActionStatus = (taskStatus, localeObj) => {
        return this.getTaskStatusTitle(taskStatus, localeObj);
    }

    this.getTaskStatusAnimationClass = (originalTaskState, isTaskStateUpdated) => {
        if (originalTaskState !== ACTION_AVAILABLE && !isTaskStateUpdated) {
            return `animate__animated animate__fadeOutUp animate__slow accent`;
        } else if (originalTaskState !== ACTION_AVAILABLE && isTaskStateUpdated) {
            return 'animate__animated animate__fadeInUp animate__fast';
        }

        return 'accent';
    }

    this.getTaskActionAnimationClass = (originalTaskState, isTaskStateUpdated) => {
        if (originalTaskState !== ACTION_AVAILABLE && !isTaskStateUpdated) {
            return `animate__animated animate__fadeOut animate__slow`;
        } else if (originalTaskState !== ACTION_AVAILABLE && isTaskStateUpdated) {
            return 'animate__animated animate__fadeIn animate__slow';
        }

        return '';
    }

    this.getFormattedDrawTitle = ({ programName, drawStartDate, drawEndDate }) => {
        const programStartDate = moment(drawStartDate).format('DD');
        const programStartMonth = moment(drawStartDate).format('MMM');
        const programEndDate = moment(drawEndDate).format('DD');
        const programEndMonth = moment(drawEndDate).format('MMM');

        let drawDelayedTitle = `${programName} / ${programStartDate}`;
        drawDelayedTitle += (programStartMonth === programEndMonth ? '' : programStartMonth) + '-';
        drawDelayedTitle += `${programEndDate} ${programEndMonth}`;

        return drawDelayedTitle;
    }

    this.getFormattedDrawDuration = ({ drawStartDate, drawEndDate }, showYear = false) => {
        const drawStart = moment(drawStartDate);
        const drawEnd = moment(drawEndDate);
        const formattedDrawDate = `${drawStart.format('Do')} ${drawStart.format('MMM')}`
            + ` - ${drawEnd.format('Do')} ${drawEnd.format('MMM')}`
            + `${showYear ? drawEnd.format('YYYY') : ''}`;

        return formattedDrawDate;
    }

    this.getFormattedDrawDate = (drawDate, format = 'DD/MM/YYYY') => {
        return `${moment(drawDate).format(format)}`;
    }

    this.checkToShowDrawDelayed = (drawData) => {
        const wonLuckyNumber = drawData.wonLuckyNumber;
        const drawDelayed = !GeneralUtilities.isNotEmpty(wonLuckyNumber, false);
        const todayDate = moment().format('YYYY-MM-DD 00:00:00');
        const drawDate = moment(drawData.drawDate);

        return !(drawDelayed && moment(todayDate).isBefore(drawDate));
    }

    this.getDisplayTicketString = (luckyNumber) => {
        if (GeneralUtilities.isNotEmpty(luckyNumber, false)) {
            luckyNumber = String(luckyNumber).padStart(7, '0');
            luckyNumber = luckyNumber.substring(0, 2) + "-" + luckyNumber.substring(2, 7)
            return luckyNumber;
        }

        return '';
    }

    this.setUserMomentTimezone = (defaultTimezone = DEFAULT_TIMEZONE) => {
        const userLocaleLanguage = androidApiCalls.getLanguage();
        GeneralUtilities.isNotEmpty(defaultTimezone) && moment.tz.setDefault(defaultTimezone);
        momentLocale.locale(userLocaleLanguage);
        moment.localeData(userLocaleLanguage);
        moment.defineLocale(userLocaleLanguage, momentLocale.localeData()._config);
    }

    this.calculateContentHeight = (appBarRef, bottomButtonsRef, bottomTncRef = {}) => {
        const rootHeight = document.querySelector('#root').clientHeight;
        const appBarHeight = appBarRef?.current?.clientHeight;
        const formattedAppBarHeight = appBarHeight ? appBarHeight : 0;

        const bottomButtonHeight = bottomButtonsRef?.current?.clientHeight;
        const formattedBottomButtonHeight = bottomButtonHeight ? bottomButtonHeight : 0;
        
        const bottomTncHeight = bottomTncRef?.current?.clientHeight;
        const formattedBottomTncHeight = bottomTncHeight ? (bottomTncHeight + 25) : 0;

        const contentHeight = rootHeight - (formattedAppBarHeight + formattedBottomButtonHeight + formattedBottomTncHeight + 70);

        return contentHeight;
    }

    this.checkForMissedLuckyNumbers = () => {
        let previousProgramSnapshot = androidApiCalls.getDAStringPrefs("PreGPSnapshotData");
        let latestProgramSnapshot = androidApiCalls.getDAStringPrefs("GPSnapshotData");

        try {
            previousProgramSnapshot = JSON.parse(previousProgramSnapshot);
            latestProgramSnapshot = JSON.parse(latestProgramSnapshot);
            if (!GeneralUtilities.isNotEmpty(previousProgramSnapshot)) {
                return "";
            }
            if (!GeneralUtilities.isNotEmpty(latestProgramSnapshot)) {
                return "";
            }
        } catch (err) {
            androidApiCalls.setDAStringPrefs("GPSnapshotData", "[]");
            androidApiCalls.setDAStringPrefs("PreGPSnapshotData", "[]");
            Log.sDebug("Exception inside checkForMissedLuckyNumbers " + err, "GamificationService");
            return "";
        }

        for (let l = 0; l < latestProgramSnapshot.length; l++) {
            for (let p = 0; p < previousProgramSnapshot.length; p++) {
                if (latestProgramSnapshot[l].programId === previousProgramSnapshot[p].programId) {
                    let previousReceivedReward = parseFloat(previousProgramSnapshot[p].rewardsReceived);
                    let currentReceivedReward = parseFloat(latestProgramSnapshot[l].rewardsReceived);
                    if (this.isDataOutOfSync("PreGPSnapshotSyncTime") && currentReceivedReward > 0) {
                        androidApiCalls.setDAStringPrefs("PreGPSnapshotSyncTime", moment().format('YYYY-MM-DD 00:00:00'))
                        return latestProgramSnapshot[l];
                    } else if (previousReceivedReward < currentReceivedReward) {
                        return latestProgramSnapshot[l];
                    }
                }
            }
        }

        return "";
    }

    this.isDataOutOfSync = (prefKey = "GPSnapshotSyncTime") => {
        const syncTime = moment(androidApiCalls.getDAStringPrefs(prefKey));
        const now = moment()
        if (now.dayOfYear() !== syncTime.dayOfYear()) {
            return true;
        }
        return false;
    }

    this.CheckForTaskCompletion = (type, amount) => {
        let programSnapshot = androidApiCalls.getDAStringPrefs("GPSnapshotData");

        try {
            programSnapshot = JSON.parse(programSnapshot);

            if (!GeneralUtilities.isNotEmpty(programSnapshot)) {
                return "";
            }
        } catch (err) {
            androidApiCalls.setDAStringPrefs("GPSnapshotData", "[]");
            androidApiCalls.setDAStringPrefs("PreGPSnapshotData", "[]");
            Log.sDebug("Exception inside CheckForTaskCompletion " + err, "GamificationService");
            return "";
        }

        return this.isTaskEligibleForReward(type, amount, programSnapshot);
    }

    this.isTaskEligibleForReward = (type, amount, programData) => {
        for (let p = 0; p < programData.length; p++) {
            if (this.programStatusValidator(programData[p])) {
                for (let t = 0; t < programData[p].tasks.length; t++) {
                    let rewardCount = this.eligibleRewardCountCalculator(programData[p].tasks[t], type, amount, p, t)
                    if (rewardCount > 0) {
                        this.updateProgramSnapshot(p, t, rewardCount, amount)
                        Log.sDebug("Matched program id is " + programData[p].programId + " for type " + type + " amount " + amount, "GamificationService")
                        return programData[p];
                    }
                }
            }
        }
        return "";
    }

    this.programStatusValidator = (programData) => {
        const programEndDate = moment(programData.programEndDate);
        const now = moment().format('YYYY-MM-DD 00:00:00');
        const diff = programEndDate.diff(now, 'days');

        if (diff < 0) {
            return false;
        }
        let rewardsEligible = parseFloat(programData.rewardsEligible);
        let rewardsReceived = this.isDataOutOfSync() ? 0 : parseFloat(programData.rewardsReceived);
        if (rewardsReceived >= rewardsEligible) {
            return false;
        }
        return true;
    }

    this.eligibleRewardCountCalculator = (taskData, type, amount, programIndex, taskIndex) => {
        /*
        taskType : Task type name
        taskConstraint.amount : Constraint amount
        cumulativeTaskProgress : Number of times user completed task to complete one moment (quantifierTaskProgress)
        cumulativeTaskLimit : Number of times this task needs to be completed to complete one moment (quantifierTaskLimit)

        completedTaskMomentCount : No of times user completed awarded for moment for this task completion (taskRewardProgress)
        taskMomentLimit : Maximum times moment can be awarded for this task completion (taskRewardLimit)

        rewardMultiplier : Eligible reward count for completing the task
        */
        let {
            taskType, cumulativeTaskProgress, cumulativeTaskLimit, completedTaskMomentCount, taskMomentLimit,
            rewardMultiplier, taskConstraint, quantifierType
        } = taskData;

        const minTxnAmount = taskConstraint?.amount ? parseFloat(taskConstraint?.amount) : 0;

        if (taskType === type && parseFloat(amount) >= parseFloat(minTxnAmount)) {
            const eligibleLimit = parseFloat(taskMomentLimit);
            const completedProgressValue = parseFloat(this.isDataOutOfSync() ? 0 : cumulativeTaskProgress);
            const completedTasksCount = parseFloat(this.isDataOutOfSync() ? 0 : completedTaskMomentCount);
            let didCompleteTaskPerUserMoment = 0;

            //User completed this task inside frequency limit, otherwise user wont be eligible for reward
            if (completedTasksCount < eligibleLimit) {
                if (quantifierType === QUANTIFIER_TYPE_COUNT) {
                    didCompleteTaskPerUserMoment = (completedProgressValue + 1) % parseFloat(cumulativeTaskLimit);
                } else if (quantifierType === QUANTIFIER_TYPE_AMOUNT) {
                    didCompleteTaskPerUserMoment = (completedProgressValue + parseFloat(amount)) >= parseFloat(cumulativeTaskLimit) ? 0 : 1;
                }

                if (didCompleteTaskPerUserMoment === 0) {
                    return parseFloat(rewardMultiplier);
                } else {
                    this.updateProgramSnapshot(programIndex, taskIndex, 0, amount);
                }
            }
        }

        return 0;
    }

    this.updateProgramSnapshot = (programIndex, taskIndex, rewardCount, amount = 0) => {
        let programSnapshot = androidApiCalls.getDAStringPrefs("GPSnapshotData");

        try {
            programSnapshot = JSON.parse(programSnapshot);

            if (!GeneralUtilities.isNotEmpty(programSnapshot)) {
                return "";
            }
        } catch (err) {
            androidApiCalls.setDAStringPrefs("GPSnapshotData", "[]");
            androidApiCalls.setDAStringPrefs("PreGPSnapshotData", "[]");
            Log.sDebug("Exception inside updateProgramSnapshot " + err, "GamificationService");
            return "";
        }

        const programData = programSnapshot[programIndex];
        let { rewardsEligible, rewardsReceived, tasks } = programData;
        const taskData = tasks[taskIndex];
        let { quantifierType, cumulativeTaskProgress, cumulativeTaskLimit, completedTaskMomentCount, taskMomentLimit } = taskData;

        //Update received reward count in local copy (if user logs in and does back to back transactions this is required)
        rewardsEligible = parseFloat(rewardsEligible);
        rewardsReceived = parseFloat(rewardsReceived) + parseFloat(rewardCount);
        rewardsReceived = rewardsReceived > rewardsEligible ? rewardsEligible : rewardsReceived;

        if (this.isDataOutOfSync()) {
            rewardsReceived = 0 + parseFloat(rewardCount);
        }

        programSnapshot[programIndex].rewardsReceived = rewardsReceived;
        cumulativeTaskProgress = this.isDataOutOfSync() ? 0 : parseFloat(cumulativeTaskProgress);
        completedTaskMomentCount = this.isDataOutOfSync() ? 0 : parseFloat(completedTaskMomentCount);

        //Update the task progress in cumulative data (For EVERY_COUNT and EVERY_VALUE)
        if (quantifierType === QUANTIFIER_TYPE_COUNT) {
            programSnapshot[programIndex].tasks[taskIndex].cumulativeTaskProgress = cumulativeTaskProgress + 1;
        } else if (quantifierType === QUANTIFIER_TYPE_AMOUNT) {
            programSnapshot[programIndex].tasks[taskIndex].cumulativeTaskProgress = cumulativeTaskProgress + parseFloat(amount);
        }

        //Update task completed count in local copy (if user logs in and does back to back transactions this is required)
        if (
            programSnapshot[programIndex].tasks[taskIndex].cumulativeTaskProgress >= cumulativeTaskLimit
            && completedTaskMomentCount <= taskMomentLimit
        ) {
            programSnapshot[programIndex].tasks[taskIndex].cumulativeTaskProgress = 0;
            programSnapshot[programIndex].tasks[taskIndex].completedTaskMomentCount = completedTaskMomentCount + 1;
        }

        //Update Program snapshot details
        androidApiCalls.setDAStringPrefs("GPSnapshotData", JSON.stringify(programSnapshot));
        androidApiCalls.setDAStringPrefs("PreGPSnapshotData", JSON.stringify(programSnapshot));
        androidApiCalls.setDAStringPrefs("GPSnapshotSyncTime", moment().format('YYYY-MM-DD 00:00:00'));
    }

    this.formatGamificationTaskJson = (programsArrayData) => {
        if (!GeneralUtilities.isNotEmpty(programsArrayData)) {
            return [];
        }

        return programsArrayData.map(programData => {
            if (GeneralUtilities.isNotEmpty(programData.tasks)) {
                programData.tasks = programData.tasks.map((taskData) => {
                    return {
                        ...taskData,
                        cumulativeTaskProgress: taskData.tasksCompletedForMoment,
                        cumulativeTaskLimit: taskData.tasksLimitForMoment,
                        completedTaskMomentCount: taskData.noOfMomentsCompleted,
                        taskMomentLimit: taskData.userMomentsLimit,
                        rewardMultiplier: taskData.rewardsPerUserMoment
                    };
                });
            }

            return programData;
        });
    }

    this.formatCompletedProgramJson = (programsArrayData) => {
        if (!GeneralUtilities.isNotEmpty(programsArrayData)) {
            return [];
        }

        return programsArrayData.map(programData => {
            programData.rewardType = GeneralUtilities.isNotEmpty(programData.rewardType) ? programData.rewardType : REWARD_TYPE_LUCKY_NUMBER;

            return programData;
        });
    }
}

export default new GamificationService();
