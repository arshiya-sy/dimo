import React from 'react';
import PropTypes from 'prop-types';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";
import constantObjects from '../../Services/Constants';
import MetricServices from "../../Services/MetricsService";
import CommonFunctions from '../../Services/CommonFunctions';
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCalls from "../../Services/androidApiCallsService";
import TaskDetailsSection from './TaskComponents/TaskDetailsSection';
import ProgramTNCSection from './ProgramComponents/ProgramTNCSection';
import ShowRewardSection from './RewardComponents/ShowRewardsSection';
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import WinnerDetailsSection from './WinnerComponents/WinnerDetailsSection';
import RewardSummarySection from './RewardComponents/RewardSummarySection';
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ProgramSummarySection from './ProgramComponents/ProgramSummarySection';
import { PRIZE_TYPE_COUPON, SHARE_TYPE_COUPON_PROGRAM, SHARE_TYPE_PHONE_PROGRAM } from '../../Services/Gamification/GamificationTerms';

const styles = InputThemes.singleInputStyle;
const theme2 = InputThemes.snackBarTheme;
const screenHeight = window.screen.height;
const gamificationScreens = PageNames.GamificationComponent;
const programDetailsScreen = gamificationScreens.program_details;
const drawDetailsScreen = gamificationScreens.draw_details;
let localeObj = {};

class RewardDetailComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            processing: false,
            programData: this.props?.location?.state?.programData ?? {},
            wonDetailsScreen: this.props?.location?.state?.wonDetailsScreen ?? false,
            isRunningProgram: this.props?.location?.state?.isRunningProgram ?? false,
            transitionScreen: programDetailsScreen,
            snackBarOpen: false
        };

        this.componentName = this.state.wonDetailsScreen ? drawDetailsScreen : programDetailsScreen;

        this.style = {
            rewardScrollContStyle: {
                whiteSpace: "pre-wrap",
                height: screenHeight * 0.85,
                overflow: "hidden auto",
                position: 'relative'
            },
            rewardSvgIconStyle: {
                width: "1.25rem",
                verticalAlign: "middle",
                fill: ColorPicker.white,
                height: "max-content",
                marginRight: "0.625rem"
            },
            programRewardCardStyle: {
                backgroundColor: ColorPicker.disableBlack,
                borderRadius: "1.25rem",
                marginBottom: "1rem",
                width: '100%',
                paddingBlock: '1rem',
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center'
            },
            ticketNumberStyle: {
                position: 'absolute',
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
            },
            countChipStyle: {
                position: "absolute",
                height: "1.2rem",
                right: '1rem',
                top: 0,
                marginLeft: 0,
                borderRadius: '1rem'
            }
        };

        if (!GeneralUtilities.isNotEmpty(this.state.programData, false)) {
            return GeneralUtilities.goBackHistoryPath();
        }

        MetricServices.onPageTransitionStart(this.componentName);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        CommonFunctions.addVisibilityEventListener(this.componentName);
        window.onBackPressed = () => this.onBackButtonPressed();
    }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    showProgressDialog = () => this.setState({ processing: true });

    hideProgressDialog = () => this.setState({ processing: false });

    openSnackBar = (message) => this.setState({ snackBarOpen: true, message: message });

    closeSnackBar = () => this.setState({ snackBarOpen: false });

    onBackButtonPressed = () => GeneralUtilities.goBackHistoryPath();

    onShareButtonPressed = () => {
        const { programData } = this.state;
        const { rewardType } = programData;

        GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.shareProgramDetails);
        this.moveToNextScreen(
            '/shareReward', true,
            { 'shareType': rewardType === PRIZE_TYPE_COUPON ? SHARE_TYPE_COUPON_PROGRAM : SHARE_TYPE_PHONE_PROGRAM }
        );
    }

    moveToNextScreen = (redirectPathName, storeToHistoryPath = true, initialStateData = {}, initialComponentData = {}) => {
        const { programData, wonDetailsScreen } = this.state;

        const redirectComponentData = {
            pathname: redirectPathName,
            state: { programData, wonDetailsScreen, ...initialStateData },
            fromComponent: this.componentName,
            ...initialComponentData
        };

        return GeneralUtilities.pushHistoryPath(redirectComponentData, this.props?.location, { 'storeToHistoryPath': storeToHistoryPath });
    }

    render() {
        const { processing, programData, wonDetailsScreen } = this.state;

        let drawDelayed = false;
        let wonLuckyNumber = null;

        if (wonDetailsScreen) {
            wonLuckyNumber = programData.wonLuckyNumber;
            drawDelayed = !GeneralUtilities.isNotEmpty(wonLuckyNumber, false);
        }

        return (
            <div id="program_details_container">
                <ButtonAppBar
                    style={{ marginLeft: "7%" }} header={localeObj.program_detail_screen}
                    action="help-share"
                    onBack={this.onBackButtonPressed}
                    onHelp={() => CommonFunctions.onHelpButtonPressed(this.componentName)}
                    onShare={this.onShareButtonPressed}
                />

                <div style={{ display: processing ? 'block' : 'none' }}>{processing && <CustomizedProgressBars />}</div>

                <div style={{ ...this.style.rewardScrollContStyle, display: !processing ? 'block' : 'none' }} className="scroll">
                    <div className='px-24' style={{paddingTop: "1rem"}}>
                        {/* Program Summary Section */}
                        <ProgramSummarySection
                            localeObj={localeObj} state={this.state} styles={this.style}
                            drawDelayed={drawDelayed}
                        />

                        {/* Reward Summary Section */}
                        <RewardSummarySection
                            localeObj={localeObj} state={this.state} styles={this.style}
                            moveToNextScreen={this.moveToNextScreen}
                            fromComponent={this.componentName}
                        />

                        {/* Winner Details Section */}
                        {
                            wonDetailsScreen
                            && <WinnerDetailsSection
                                localeObj={localeObj} styles={this.style} state={this.state}
                                drawDelayed={drawDelayed} wonLuckyNumber={wonLuckyNumber}
                                moveToNextScreen={this.moveToNextScreen}
                            />
                        }
                    </div>  

                    {
                        !wonDetailsScreen
                        && <TaskDetailsSection
                            localeObj={localeObj} programData={programData} styles={this.style}
                            moveToNextScreen={this.moveToNextScreen}
                            hideProgressDialog={this.hideProgressDialog}
                            showProgressDialog={this.showProgressDialog}
                            openSnackBar={this.openSnackBar}
                            onBackButtonPressed={this.onBackButtonPressed}
                        />
                    }

                    {/* Different Reward UI Section: LN/Coupons/Cashback */}
                    <ShowRewardSection
                        localeObj={localeObj} state={this.state} styles={this.style}
                        fromComponent={this.componentName}
                        fromLocationData={this.props?.location}
                        moveToNextScreen={this.moveToNextScreen}
                    />

                    {/* Program Terms and Conditions */}
                    <ProgramTNCSection
                        localeObj={localeObj} styles={this.style} state={this.state}
                        fromComponent={this.componentName}
                    />
                </div>

                <MuiThemeProvider theme={theme2}>
                    <Snackbar
                        open={this.state.snackBarOpen}
                        autoHideDuration={constantObjects.SNACK_BAR_DURATION}
                        onClose={this.closeSnackBar}
                    >
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

RewardDetailComponent.propTypes = {
    location: PropTypes.object
};

export default withStyles(styles)(RewardDetailComponent);
