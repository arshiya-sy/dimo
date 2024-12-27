import React from "react";
import PropTypes from "prop-types";
import { CSSTransition } from 'react-transition-group';

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import InputThemes from "../../Themes/inputThemes";
import FaceAuthComponent from "./FaceAuthComponent";
import GeneralAPIs from "../../Services/GeneralAPIs";
import constantObjects from "../../Services/Constants";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import CommonFunctions from "../../Services/CommonFunctions";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCalls from "../../Services/androidApiCallsService";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import UnblockAccountInfoComponent from "./UnblockAccountInfoComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import UnblockAccountService from "../../Services/UnblockAccount/UnblockAccountService";
import {
    UNBLOCK_ACCOUNT_SECURITY, UNBLOCK_ACCOUNT_SELFIE_INFO, UNBLOCK_ACCOUNT_FAILED,
    UNBLOCK_ACCOUNT_PROGRESS, UNBLOCK_ACCOUNT_FACE_AUTH, UNBLOCK_ACCOUNT_SELFIE_REVIEW
} from "../../Services/UnblockAccount/UnblockAccountTerms";

var localeObj = {};
const styles = InputThemes.singleInputStyle;
const snackBarTheme = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.UnblockAccountComponents;
const constantObjectJSON = constantObjects.UnblockAccount;

class UnblockAccountComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            jwtToken: "",
            base64Image: "",
            processing: false,
            selfieImageUrl: "",
            snackBarMessage: "",
            isSnackBarOpen: false,
            transitionDirection: "left",
            currentState: UNBLOCK_ACCOUNT_SECURITY,
        };

        this.componentName = PageNameJSON.unblock_account_security;

        this.unblockAccountStates = [UNBLOCK_ACCOUNT_SECURITY, UNBLOCK_ACCOUNT_SELFIE_INFO, UNBLOCK_ACCOUNT_FACE_AUTH];

        this.styles = {};

        MetricServices.onPageTransitionStart(this.componentName);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }

        GeneralAPIs.fetchTokenForCAF(ImportantDetails.cpf);
    }

    componentDidMount = () => {
        CommonFunctions.addVisibilityEventListener(this.componentName);
        androidApiCalls.enablePullToRefresh(false);
    }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
    }

    onBackButtonPressed = () => {
        const { processing, currentState } = this.state;

        if (processing) {
            return this.setState({ isSnackBarOpen: true, snackBarMessage: localeObj.no_action });
        } else {
            switch (currentState) {
                case UNBLOCK_ACCOUNT_SELFIE_INFO: this.changeCurrentState(UNBLOCK_ACCOUNT_SECURITY);
                    break;
                case UNBLOCK_ACCOUNT_FACE_AUTH: this.changeCurrentState(UNBLOCK_ACCOUNT_SELFIE_INFO);
                    break;
                case UNBLOCK_ACCOUNT_SELFIE_REVIEW: this.changeCurrentState(UNBLOCK_ACCOUNT_SELFIE_INFO);
                    break;
                case UNBLOCK_ACCOUNT_SECURITY:
                case UNBLOCK_ACCOUNT_PROGRESS:
                case UNBLOCK_ACCOUNT_FAILED:
                default: UnblockAccountService.clearLoginDataHomeRedirect();
            }
        }
    }

    onNextButtonPressed = async (changeState = null) => {
        const { currentState, jwtToken, base64Image } = this.state;

        this.showProgressDialog();

        MetricServices.onPageTransitionStop(this.componentName, PageState.close);

        if (GeneralUtilities.isNotEmpty(changeState)) {
            this.changeCurrentState(changeState);
        } else if (currentState === UNBLOCK_ACCOUNT_SECURITY) {
            GeneralUtilities.sendActionMetrics(this.componentName, constantObjectJSON.unblockAccountSecurityNext);

            this.changeCurrentState(UNBLOCK_ACCOUNT_SELFIE_INFO);
        } else if (currentState === UNBLOCK_ACCOUNT_SELFIE_INFO) {
            GeneralUtilities.sendActionMetrics(this.componentName, constantObjectJSON.unblockAccountSelfieInfoStart);

            this.changeCurrentState(UNBLOCK_ACCOUNT_FACE_AUTH);
        } else if (currentState === UNBLOCK_ACCOUNT_FACE_AUTH) {
            GeneralUtilities.sendActionMetrics(this.componentName, constantObjectJSON.unblockAccountTakePhoto);

            this.changeCurrentState(UNBLOCK_ACCOUNT_SELFIE_REVIEW);
        } else if (currentState === UNBLOCK_ACCOUNT_SELFIE_REVIEW) {
            GeneralUtilities.sendActionMetrics(this.componentName, constantObjectJSON.unblockAccountSendPhoto);

            const unblockAccountResponse = await UnblockAccountService.unblockUserAccount(this.componentName, jwtToken, base64Image);

            this.changeCurrentState(unblockAccountResponse ? UNBLOCK_ACCOUNT_PROGRESS : UNBLOCK_ACCOUNT_FAILED);
        } else if (currentState === UNBLOCK_ACCOUNT_FAILED) {
            GeneralUtilities.sendActionMetrics(this.componentName, constantObjectJSON.unblockAccountFailedTryAgain);

            this.changeCurrentState(UNBLOCK_ACCOUNT_SELFIE_INFO);
        }

        this.hideProgressDialog();
    }

    changeCurrentState(toState) {
        const { currentState } = this.state;
        const currentStateIndex = this.unblockAccountStates.indexOf(currentState);
        const toStateIndex = this.unblockAccountStates.indexOf(toState);
        const transitionDirection = toStateIndex > currentStateIndex ? "left" : "right";

        switch (toState) {
            case UNBLOCK_ACCOUNT_SELFIE_INFO: this.componentName = PageNameJSON.unblock_account_selfie_info;
                break;
            case UNBLOCK_ACCOUNT_FACE_AUTH: this.componentName = PageNameJSON.unblock_account_face_auth;
                break;
            case UNBLOCK_ACCOUNT_SELFIE_REVIEW: this.componentName = PageNameJSON.unblock_account_selfie_review;
                break;
            case UNBLOCK_ACCOUNT_PROGRESS: this.componentName = PageNameJSON.unblock_account_progress;
                break;
            case UNBLOCK_ACCOUNT_FAILED: this.componentName = PageNameJSON.unblock_account_failed;
                break;
            case UNBLOCK_ACCOUNT_SECURITY:
            default: this.componentName = PageNameJSON.unblock_account_security;
        }

        MetricServices.onPageTransitionStart(this.componentName);

        this.setState({ currentState: toState, transitionDirection });
    }

    setSelfieImageData = ({ jwtToken, selfieImageUrl, base64Image }) => this.setState({ jwtToken, selfieImageUrl, base64Image });

    showProgressDialog = () => this.setState({ processing: true });

    hideProgressDialog = () => this.setState({ processing: false });

    openSnackBar = (message) => this.setState({ isSnackBarOpen: true, snackBarMessage: message });

    closeSnackBar = () => this.setState({ isSnackBarOpen: false });

    render() {
        const { processing, isSnackBarOpen, snackBarMessage, currentState, transitionDirection, selfieImageUrl } = this.state;

        if (processing) {
            return (<CustomizedProgressBars />);
        }

        let currentStateComponent = <></>;
        const infoComponentData = [
            UNBLOCK_ACCOUNT_SECURITY, UNBLOCK_ACCOUNT_SELFIE_INFO, UNBLOCK_ACCOUNT_SELFIE_REVIEW,
            UNBLOCK_ACCOUNT_PROGRESS, UNBLOCK_ACCOUNT_FAILED
        ];

        if (infoComponentData.includes(currentState)) {
            currentStateComponent = (
                infoComponentData.map((unblockState, infoComponentIndex) => {
                    let fourthDescriptionText = "";

                    if (unblockState === UNBLOCK_ACCOUNT_SELFIE_REVIEW) {
                        fourthDescriptionText = <img style={{maxWidth: "15.5rem", maxHeight: "19.5rem"}} src={selfieImageUrl} alt="" />;
                    }
                    
                    return (
                        <CSSTransition
                            key={infoComponentIndex}
                            mountOnEnter={true} unmountOnExit={true}
                            in={currentState === unblockState} timeout={300}
                            classNames={transitionDirection === "right" ? "pageSliderRight" : "pageSliderLeft"}
                        >
                            <UnblockAccountInfoComponent
                                componentName={this.componentName} accountStatus={currentState}
                                fourthDescriptionText={fourthDescriptionText}
                                primaryBtnAction={this.onNextButtonPressed}
                                onBackButtonPressed={this.onBackButtonPressed}
                            />
                        </CSSTransition>
                    );
                })
            );
        }

        if ([UNBLOCK_ACCOUNT_FACE_AUTH].includes(currentState)) {
            currentStateComponent = (
                <CSSTransition
                    mountOnEnter={true} unmountOnExit={true}
                    in={currentState === UNBLOCK_ACCOUNT_FACE_AUTH} timeout={300}
                    classNames={transitionDirection === "right" ? "pageSliderRight" : "pageSliderLeft"}
                >
                    <FaceAuthComponent
                        openSnackBar={this.openSnackBar}
                        fromComponent={this.componentName}
                        setSelfieImageData={this.setSelfieImageData}
                        onNextButtonPressed={this.onNextButtonPressed}
                        onBackButtonPressed={this.onBackButtonPressed}
                    />
                </CSSTransition>
            );
        }

        return (
            <>
                { currentStateComponent }
                
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
            </>
        );
    }
}

UnblockAccountComponent.propTypes = {
    accountStatus: PropTypes.string
};

export default withStyles(styles)(UnblockAccountComponent);