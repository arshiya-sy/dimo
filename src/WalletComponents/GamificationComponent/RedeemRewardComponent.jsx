import React from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import history from "../../history.js";
import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import InputThemes from "../../Themes/inputThemes";
import constantObjects from "../../Services/Constants";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import CommonFunctions from '../../Services/CommonFunctions.js';
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import ProgramTNCSection from './ProgramComponents/ProgramTNCSection.jsx';
import RedeemPhoneSection from './RedeemPrizeComponents/RedeemPhoneSection.jsx';
import RedeemCouponSection from './RedeemPrizeComponents/RedeemCouponSection.jsx';
import GamificationService from "../../Services/Gamification/GamificationService";
import { PRIZE_TYPE_PHONE, PRIZE_TYPE_COUPON } from '../../Services/Gamification/GamificationTerms';

const snackBarTheme = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const screenWidth = window.screen.width;
let localeObj = {};

class RedeemRewardComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            programData: this.props.location?.state?.programData ?? {},
            isSnackBarOpen: false,
            snackBarMessage: '',
            contentHeight: 0
        };

        this.componentName = PageNames.GamificationComponent.redeem_reward;

        this.style = {
            rewardScrollContStyle: {
                overflow: "hidden auto"
            },
            bottomContainerStyle: {
                width: '100%',
                textAlign: 'center',
                position: 'fixed',
                bottom: '1rem'
            },
            rewardImageStyle: {
                verticalAlign: "middle",
                height: "max-content",
                width: screenWidth * 0.56
            },
            rewardIconStyle: {
                width: "1rem",
                verticalAlign: "middle",
                height: "max-content"
            }
        };

        this.appBarRef = React.createRef();
        this.bottomTncRef = React.createRef();
        this.bottomButtonsRef = React.createRef();

        if (!GeneralUtilities.isNotEmpty(this.state.programData, false)) {
            return history.push('/rewards');
        }

        MetricServices.onPageTransitionStart(this.componentName);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        window.onBackPressed = () => this.onBackButtonPressed();
        CommonFunctions.addVisibilityEventListener(this.componentName);

        const contentMaxHeight = GamificationService.calculateContentHeight(this.appBarRef, this.bottomButtonsRef, this.bottomTncRef);
        GeneralUtilities.isNotEmpty(contentMaxHeight) && this.setState({ contentHeight: contentMaxHeight });
    }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    onBackButtonPressed = () => GeneralUtilities.goBackHistoryPath();

    closeSnackBar = () => {
        this.setState({ isSnackBarOpen: false });
    }

    openSnackBar = (message) => {
        this.setState({ isSnackBarOpen: true, snackBarMessage: message });
    }

    onShareWithFriendBtnPressed = (shareType) => {
        GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.shareDrawWinner);
        this.moveToNextScreen('/shareReward', { shareType });
    }

    moveToNextScreen = (redirectPathName, redirectData = {}) => {
        const { programData } = this.state;

        const redirectComponentData = {
            pathname: redirectPathName,
            state: { programData, ...redirectData },
            fromComponent: this.componentName
        };

        return history.push(redirectComponentData);
    }

    updateProgramPrizeDetails = (prizeDetails) => {
        this.setState((prevState) => ({
            programData: {
                ...prevState.programData,
                prizeDetails: { ...prevState.programData.prizeDetails, ...prizeDetails }
            }
        }));
    }

    render() {
        const { programData, isSnackBarOpen, snackBarMessage } = this.state;
        const { prizeDetails = {} } = programData;
        const { prizeType, prizeTncUrl } = prizeDetails;

        return (
            <div id="redeem_reward_container">
                <div ref={this.appBarRef}>
                    <ButtonAppBar
                        header="" 
                        action="cancel" inverse="true"
                        onCancel={this.onBackButtonPressed}
                        onBack={this.onBackButtonPressed}
                    />
                </div>

                <FlexView
                    column vAlignContent='center' hAlignContent='center'
                    style={this.style.rewardScrollContStyle}
                >
                    {/* Phone Prize Section */}
                    {
                        prizeType === PRIZE_TYPE_PHONE
                        && <RedeemPhoneSection
                            localeObj={localeObj} styles={this.style} state={this.state}
                            bottomButtonsRef={this.bottomButtonsRef}
                            fromComponent={this.componentName}
                            onShareWithFriendBtnPressed={this.onShareWithFriendBtnPressed}
                        />
                    }

                    {/* Coupon Prize Section */}
                    {
                        prizeType === PRIZE_TYPE_COUPON
                        && <RedeemCouponSection
                            localeObj={localeObj} styles={this.style} state={this.state}
                            bottomButtonsRef={this.bottomButtonsRef}
                            fromComponent={this.componentName}
                            openSnackBarHandler={this.openSnackBar}
                            onBackButtonPressed={this.onBackButtonPressed}
                            updateProgramPrizeDetails={this.updateProgramPrizeDetails}
                            onShareWithFriendBtnPressed={this.onShareWithFriendBtnPressed}
                        />
                    }

                    {/* Redeem Reward Terms and Conditions */}
                    {
                        GeneralUtilities.isNotEmpty(prizeTncUrl)
                        && <div ref={this.bottomTncRef} style={this.style.bottomContainerStyle}>
                            <ProgramTNCSection
                                localeObj={localeObj} styles={this.style} state={this.state}
                                fromComponent={this.componentName}
                                isRedeemReward={true}
                            />
                        </div>
                    }
                </FlexView>

                {/* Snackbar Section */}
                <MuiThemeProvider theme={snackBarTheme}>
                    <Snackbar
                        open={isSnackBarOpen}
                        onClose={this.closeSnackBar}
                        autoHideDuration={constantObjects.SNACK_BAR_DURATION}
                    >
                        <MuiAlert elevation={6} variant="filled" icon={false}>{snackBarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

RedeemRewardComponent.propTypes = {
    location: PropTypes.object
};

export default withStyles(styles)(RedeemRewardComponent);
