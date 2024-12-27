import React from "react";
import "../../../styles/main.css";
import Success from "../../../images/SpotIllustrations/Cancel account.png";

import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import arbiApiService from "../../../Services/ArbiApiService";

import { CSSTransition } from 'react-transition-group';
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponseHandler from '../../../Services/ArbiErrorResponsehandler';

import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent"
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";

import { MuiThemeProvider } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import InputThemes from "../../../Themes/inputThemes";
import GeneralUtilities from "../../../Services/GeneralUtilities";

import constantObjects from "../../../Services/Constants";
import CancelBenefits from "./CancelBenefits";
import CancelReason from "./CancelReason";
import PhoneVerificationComponent from "../../DigitalCardComponents/CardArrivalComponents/TokenComponent";
import ImageInformationComponent from "../../CommonUxComponents/ImageInformationComponent";
import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import CancelWarnings from "./CancelWarnings";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import PropTypes from "prop-types";

const theme2 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.CancelAccountComponents;
var localeObj = {};

class CancelAccount extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cancelState: "benefits",
            profileData: this.props.location.state.profileData || {},
            direction: "",
            snackBarOpen: false,
            message: "",
            reason: "",
            reason_code: "",
            selectedList: []
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
    }

    componentDidMount = () => {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.onBack();
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    onSuccess = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.cancelState], PageState.close);
        this.props.history.replace({ pathname: "/newLogin", transition: "right" });
    }

    checkIfAccCancelled = (cancel) => {
        if (cancel) {
            this.setState({
                cancelState: "cancel_reasons",
                direction: "left"
            })
        } else {
            this.onBack();
        }
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        })
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.cancelState], PageState.back);
            if (this.state.cancelState === "benefits" || this.state.cancelState === "error") {
                this.props.history.replace("/profileDetails", { "profileData": this.state.profileData });
            } else if (this.state.cancelState === "cancel_reasons") {
                this.setState({
                    cancelState: "benefits",
                    direction: "right"
                })
            } else if (this.state.cancelState === "receiveTokenToCancelAccount") {
                this.setState({
                    cancelState: "description",
                    direction: "right"
                })
            } else if (this.state.cancelState === "success") {
                this.onSuccess();
            } else if(this.state.cancelState === "description") {
                this.setState({
                    cancelState: "cancel_reasons",
                    direction: "right"
                })
            }
        }
    }

    moveToCancel = (reason, optionsArray, reason_codes) => {
        this.setState({
            reason: reason,
            selectedList: optionsArray,
            reason_code: reason_codes,
            cancelState: "description",
            direction: "left"
        })
        ImportantDetails.saveCancelAccountReason(reason);
    }

    sendTokenToCancelAccount = () => {
        this.showProgressDialog();
        arbiApiService.sendTokenToCancelAccount(PageNameJSON[this.state.cancelState]).then((response) => {
            this.hideProgressDialog();
            if (response.success) {
                const responseHandler = ArbiResponseHandler.processSendTokenToCancelAccount(response.result);
                if (responseHandler.success) {
                    this.setState({
                        cancelState: "receiveTokenToCancelAccount",
                        phoneNumber: responseHandler.phoneNumber
                    });
                    return;
                }
            }
            let errorMessage = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj)
            this.setState({
                snackBarOpen: true,
                message: errorMessage
            })
        });
    }

    cancelAccount = (field) => {
        this.showProgressDialog();
        let payload = {
            "reason": this.state.reason_code,
            "token": field
        }

        arbiApiService.cancelAccount(payload, PageNameJSON[this.state.cancelState]).then((response) => {
            this.hideProgressDialog();
            if (response.success) {
                const responseHandler = ArbiResponseHandler.processCancelAccountResponse(response.result);
                if (responseHandler.success) {
                    androidApiCalls.clearFromEncryptedprefs(GeneralUtilities.CREDENTIALS_KEY);
                    androidApiCalls.setBiometricFlag(0);
                    androidApiCalls.setAccountLoggedIn(false);
                    this.setState({
                        cancelState: "success",
                        direction: "left"
                    })
                }
            } else {
                if ('' + response.result.code === "41118") {
                    this.formatErrorJson(localeObj.cancel_balance_isssue);
                    /* Add following error codes when Jazz provides it
                        FGTS error code -> localeObj.cancel_fgts_isssue
                        Salary portability error code -> localeObj.cancel_salary_isssue
                        Smart financing -> localeObj.cancel_finance_isssue */
                } else {
                    let errorMessage = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                    this.formatErrorJson(errorMessage);
                }
            }
        })
    }

    onHandleGoToHome = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.cancelState], PageState.close);
        this.props.history.replace("/profileDetails", { "profileData": this.state.profileData });
    }

    formatErrorJson = (message) => {
        let jsonObj = {};
        jsonObj["header"] = localeObj.cancel_acc_failure;
        jsonObj["description"] = message;
        this.setState({
            errorJson: jsonObj,
            cancelState: "error"
        })
    }

    render() {
        const cancelStatus = this.state.cancelState;
        return (
            <div style={{ overflowX: "hidden" }}>
                {cancelStatus !== "error" && cancelStatus !== "success" && <ButtonAppBar header={localeObj.cancelAccount} onBack={this.onBack} action="none" />}
                {/* <div style={{height:`${0.55*screenHeight}px`, overflowY: "scroll" }}> */}
                    <CSSTransition mountOnEnter={true} unmountOnExit={true}
                        in={cancelStatus === "benefits" && !this.state.processing ? true : false} timeout={300}
                        classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                        <div style={{ display: (cancelStatus === "benefits" && !this.state.processing ? 'block' : 'none') }}>
                            {cancelStatus === "benefits" && <CancelBenefits accountCancelled={this.checkIfAccCancelled} componentName={PageNameJSON["benefits"]} />}
                        </div>
                    </CSSTransition>
                    <CSSTransition mountOnEnter={true} unmountOnExit={true}
                        in={cancelStatus === "cancel_reasons" && !this.state.processing ? true : false} timeout={300}
                        classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                        <div style={{ display: (cancelStatus === "cancel_reasons" && !this.state.processing ? 'block' : 'none') }}>
                            {cancelStatus === "cancel_reasons" && <CancelReason cancelAccount={this.moveToCancel} componentName={PageNameJSON["cancel_reasons"]} reason={this.state.reason} prevReasons={this.state.selectedList} />}
                        </div>
                    </CSSTransition>
                    <CSSTransition mountOnEnter={true} unmountOnExit={true}
                        in={cancelStatus === "description" && !this.state.processing ? true : false} timeout={300}
                        classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                        <div style={{ display: (cancelStatus === "description" && !this.state.processing ? 'block' : 'none') }}>
                            {cancelStatus === "description" && <CancelWarnings next={this.sendTokenToCancelAccount} profileData={this.state.profileData} back={this.onBack}/>}
                        </div>
                    </CSSTransition>
                    <CSSTransition mountOnEnter={true} unmountOnExit={true}
                        in={cancelStatus === "receiveTokenToCancelAccount" && !this.state.processing ? true : false} timeout={300}
                        classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                        <div style={{ display: (cancelStatus === "receiveTokenToCancelAccount" && !this.state.processing ? 'block' : 'none') }}>
                            {cancelStatus === "receiveTokenToCancelAccount" && <PhoneVerificationComponent messageSent={this.state.phoneNumber} verify={this.cancelAccount}
                                componentName={PageNameJSON["receiveTokenToCancelAccount"]} resend={this.sendTokenToCancelAccount} type="phone" />}
                        </div>
                    </CSSTransition>
                    <CSSTransition mountOnEnter={true} unmountOnExit={true}
                        in={cancelStatus === "success" && !this.state.processing ? true : false} timeout={300}
                        classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                        <div style={{ display: (cancelStatus === "success" && !this.state.processing ? 'block' : 'none') }}>
                            {cancelStatus === "success" && <ImageInformationComponent header={localeObj.cancel_success_header} next={this.onSuccess}
                                subText={androidApiCalls.getLocale() === "en_US" ? "" : localeObj.cancel_success_desc1} icon={Success}
                                description={localeObj.cancel_success_desc} btnText={localeObj.okay_i_got_it} type={PageNameJSON["success"]} />}
                        </div>
                    </CSSTransition>
                    <CSSTransition mountOnEnter={true} unmountOnExit={true}
                        in={cancelStatus === "error" && !this.state.processing ? true : false} timeout={300}
                        classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                        <div style={{ display: (cancelStatus === "error" && !this.state.processing ? 'block' : 'none') }}>
                            {cancelStatus === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.onHandleGoToHome} componentName={PageNameJSON["error"]} />}
                        </div>
                     </CSSTransition>
                {/* </div> */}

                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}
CancelAccount.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
};
export default CancelAccount;