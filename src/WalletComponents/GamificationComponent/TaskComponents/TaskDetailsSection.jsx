import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";
import Carousel from "react-multi-carousel";

import InfoIcon from '@material-ui/icons/InfoOutlined';

import constantObjects from '../../../Services/Constants';
import GeneralUtilities from "../../../Services/GeneralUtilities";
import SingleTaskDetailsSection from './SingleTaskDetailsSection';
import androidApiCalls from "../../../Services/androidApiCallsService";
import ImportantDetails from '../../NewLaunchComponents/ImportantDetails';
import GamificationService from '../../../Services/Gamification/GamificationService';
import { QUANTIFIER_TYPE_COUNT } from '../../../Services/Gamification/GamificationTerms';

import "react-multi-carousel/lib/styles.css";

export default function TaskDetailsSection(props) {
    const { 
        programData, localeObj, styles, moveToNextScreen,
        hideProgressDialog, showProgressDialog, openSnackBar,
        onBackButtonPressed
    } = props;
    const loopingTasks = programData?.tasks?.length > 1;
    const [resetData, setResetData] = useState(new Date().getTime());
    const [swipeableTask, setSwipeableTask] = useState(loopingTasks);
    const [showQuantifierTypeUi, setShowQuantifierTypeUi] = useState(true);

    useEffect(() => {
        window.onScanQRComplete = (response) => {
            let timeoutId = setInterval(() => {
                clearInterval(timeoutId);
                hideProgressDialog();
            }, 500);

            if (response) {
                if (response === "cancelled") {
                    //Log.sDebug("User cancelled scanning", componentName);
                } else if (response === "manual") {
                    ImportantDetails.setTransactionEntryPoint(constantObjects.boletoManual);
                    //Log.sDebug("User opted to enter boleto code manually", componentName);
                    moveToNextScreen("insertBoleto", false);
                } else if (response === "switchQR") {
                    ImportantDetails.setTransactionEntryPoint(constantObjects.pixQR);
                    //Log.sDebug("User selected to scan boleto QR", componentName);
                    showProgressDialog();
                    androidApiCalls.scanQrCode("QR");
                } else if (response === "switchBarCode") {
                    //Log.sDebug("User selected to scan boleto barcode", componentName);
                    showProgressDialog();
                    ImportantDetails.setTransactionEntryPoint(constantObjects.boletoScan);
                    androidApiCalls.scanBoletoCode();
                } else {
                    if (response.includes("boleto")) {
                        //Log.sDebug("Scanned boleto successfully", componentName);
                        ImportantDetails.setTransactionEntryPoint(constantObjects.boletoScan);
                        const initialStateData = {
                            "qrCodeValue": response.split(":")[1],
                            "manual": false,
                        };

                        moveToNextScreen('boleto', false, initialStateData);
                    } else {
                        //Log.sDebug("Scanned invalid boleto", componentName);
                        openSnackBar(localeObj.invalid_Boleto);
                    }
                }
            }
        }

        window.onRequestPermissionsResult = (permission, status) => {
            if (status === true && permission === GeneralUtilities.CAMERA_PERMISSION) {
                androidApiCalls.scanBoletoCode();
            }
        }
    }, []);

    useEffect(() => {
        const { tasks } = programData;
        let totalCumulativeCountTypeTasks = 0;
        let totalCumulativeTaskLimit = 0;

        tasks.forEach((taskData) => {
            if (taskData.quantifierType === QUANTIFIER_TYPE_COUNT) {
                totalCumulativeCountTypeTasks += 1;
                totalCumulativeTaskLimit += (taskData.cumulativeTaskLimit === 1) ? 1 : 0;
            }
        });
        
        if (tasks.length === totalCumulativeCountTypeTasks && tasks.length === totalCumulativeTaskLimit) {
            setShowQuantifierTypeUi(false);
        }
    }, [programData]);

    const stylesheet = {
        ...styles
    };
    const carouselRef = useRef();
    
    const beforeChangeCarouselHandler = () => {
        setResetData(new Date().getTime());
    }

    const pauseSwipeableTask = () => loopingTasks && setSwipeableTask(false);

    const playSwipeableTask = () => loopingTasks && setSwipeableTask(true);

    return (
        <div className='mb-32'>
            {/* Multiple Task Details Carousel */}
            {
                GeneralUtilities.isNotEmpty(programData.tasks, false)
                && <Carousel
                    ref={carouselRef}
                    beforeChange={beforeChangeCarouselHandler}
                    responsive={GeneralUtilities.getCarouselBreakPoint()}
                    swipeable={swipeableTask}
                    draggable={loopingTasks}
                    autoPlay={loopingTasks && swipeableTask}
                    infinite={loopingTasks}
                    autoPlaySpeed={5000}
                    arrows={false}
                    showDots={loopingTasks}
                    keyBoardControl={loopingTasks}
                    containerClass="carousel-container"
                    dotListClass="custom-dot-list-style"
                    itemClass="carousel-item-padding"
                >
                    {
                        programData.tasks.map((taskData, taskIndex) => {
                            return (
                                <div className={`${loopingTasks ? 'mb-24' : ''} px-24`} key={taskIndex}>
                                    <SingleTaskDetailsSection
                                        programData={programData} localeObj={localeObj}
                                        styles={stylesheet} taskData={taskData} 
                                        moveToNextScreen={moveToNextScreen} resetData={resetData}
                                        onBackButtonPressed={onBackButtonPressed}
                                        showQuantifierTypeUi={showQuantifierTypeUi}
                                        playSwipeableTask={playSwipeableTask}
                                        pauseSwipeableTask={pauseSwipeableTask}
                                    />
                                </div>
                            );
                        })
                    }
                </Carousel>
            }
            
            {/* Moment Completion Info */}
            {
                <FlexView className='px-24' style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <InfoIcon style={{ ...stylesheet.rewardSvgIconStyle, width: '1.125rem' }} />
                    <div className="CaptionBold highEmphasis">
                        {GamificationService.getMomentProgressStatus(programData, localeObj)}
                    </div>
                </FlexView>
            }
        </div>
    );
}

TaskDetailsSection.propTypes = {
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    openSnackBar: PropTypes.func,
    programData: PropTypes.object,
    moveToNextScreen: PropTypes.func,
    showProgressDialog: PropTypes.func,
    hideProgressDialog: PropTypes.func,
    onBackButtonPressed: PropTypes.func,
};