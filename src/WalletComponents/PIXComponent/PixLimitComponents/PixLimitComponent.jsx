import React from "react";
import "../../../styles/main.css";
import "../../../App.css";
import FlexView from "react-flexview";
import { CSSTransition } from 'react-transition-group';
import InputThemes from "../../../Themes/inputThemes";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';

import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import AmountComponent from "../../CommonUxComponents/AmountComponent";

import httpRequest from "../../../Services/httpRequest";
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { withStyles } from "@material-ui/core/styles";

import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import PageNames from "../../../Services/PageNames";
import constantObjects from "../../../Services/Constants";
import PixLimitDescComp from "./PixLimitDescComp";
import InputPinPage from "../../CommonUxComponents/InputPinPage";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import PixLimitLoadComp from "./PixLimitLoadComp";
import moment from "moment";
import ChatBotUtils from "../../NewUserProfileComponents/ChatComponents/ChatBotUtils";
import PropTypes from "prop-types";

const theme1 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.pixLimitComponent;
var localeObj = {};

class PixLimitComponents extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pixstate: "",
            dailyLimit: 0,
            header: "",
            pinExpiredSnackBarOpen: false,
            pending: false,
            requestedLimitChange: false,
            has48HoursPassed: false
        };
    }

    componentDidMount = () => {
        document.body.style.overflow = 'hidden';
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        this.setState({
            header: localeObj.pix_header
        })
        window.onBackPressed = () => {
            this.onBack();
        }
        this.getLimits(false);
    }

    getLimits = (message) => {
        this.setState({ pixstate: "loading" });
        arbiApiService.getPixLimits(PageNameJSON.pix_change_limit).then(response => {
            if (response.success) {
                let processedResult = ArbiResponseHandler.processPixLimitResponse(response.result);
                if (processedResult.success) {
                    arbiApiService.getPendingLimitChange(PageNameJSON.pix_change_limit).then(response => {
                        if (response.success) {
                            let pendingResult = ArbiResponseHandler.processPendingChnangePixLimitResponse(response.result);
                            if (pendingResult.success) {
                                if (pendingResult.isRequestPending) {
                                    const pixDate = pendingResult?.pendingObj?.requestDateTime;
                                    this.setState({
                                        dailyLimit: pendingResult.pendingObj.dailyLimit,
                                        pendingLimit: pendingResult.pendingObj.pendingLimit,
                                        requestDate: pendingResult.pendingObj.requestDate,
                                        pending: true,
                                        header: localeObj.pix_limit,
                                        pixstate: "initial",
                                        direction: "right",
                                        has48HoursPassed: moment().diff(pixDate, "hours") >= 48
                                    })
                                } else {
                                    this.setState({
                                        dailyLimit: processedResult.dailyLimit,
                                        header: localeObj.pix_limit,
                                        pending: false,
                                        pixstate: "initial",
                                        direction: "right"
                                    })
                                }
                                if (message) {
                                    this.setState({
                                        pinExpiredSnackBarOpen: true,
                                        message: message
                                    })
                                }
                            } else {
                                this.setState({
                                    pinExpiredSnackBarOpen: true,
                                    message: localeObj.retry_later
                                })
                            }
                        } else {
                            let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                            this.setErrorInfo(errorJson);
                        }
                    });
                } else {
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                this.setErrorInfo(errorJson);
            }
        });
    }

    setErrorInfo = (transactionInfo) => {
        if (transactionInfo.error) {
            //Log.sDebug("Error has occured with code " + transactionInfo.errorCode, "PixReceiveComponent", constantObjects.LOG_PROD);
            androidApiCalls.hideProgressDialog();
            let jsonObj = {}
            jsonObj["errorCode"] = transactionInfo.errorCode;
            jsonObj["title"] = localeObj.pix;
            jsonObj["header"] = localeObj.pix_failed;
            switch (transactionInfo.reason) {
                case "no_keys":
                    jsonObj["description"] = localeObj.pix_keys_not_found
                    break;
                case "technical_issue":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "communication_issue":
                    jsonObj["description"] = localeObj.pix_communication_issue;
                    break;
                case "account_unavailable":
                    jsonObj["description"] = localeObj.pix_account_unavailable;
                    break;
                case "time_limit_exceeded":
                    jsonObj["description"] = localeObj.pix_time_limit_exceeded;
                    break;
                case "generic_error":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "arbi_error":
                    jsonObj["description"] = transactionInfo.descriptor;
                    break;
            }
            this.setState({
                pixstate: "error",
                pixErrorJson: jsonObj
            })
        }
    }

    onBack = () => {
        //Log.sDebug("Back Button Pressed", "PixReceiveComponent");
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            if (this.state.pixBottom) {
                this.setState({ pixBottom: false })
            } else if (this.state.pendingSheetOpen) {
                this.setState({ pendingSheetOpen: false })
            } else if (this.state.bottomSheetOpen) {
                this.setState({ bottomSheetOpen: false })
            } else if (this.state.reset) {
                this.setState({ reset: false })
            } else if (this.state.pixstate === "initial" || this.state.pixstate === "error"
                || this.state.pixstate === "loading") {
                    if (this.props.location && this.props.location.from) {
                        if(this.props.location.from === "chatBot") {
                            this.props.history.replace({ pathname: "/chat", transition: "right"});
                        } else {
                            this.props.history.replace({ pathname: "/pixLandingComponent", transition: "right" });
                        }
                    } else {
                        this.props.history.replace({ pathname: "/pixLandingComponent", transition: "right" });
                    }
            } else if (this.state.pixstate === "limit") {
                this.setState({
                    pixstate: "initial",
                    direction: "right",
                    header: localeObj.pix_limit,
                })
            } else if (this.state.pixstate === "pin") {
                this.setState({
                    pixstate: "limit",
                    direction: "right",
                    header: localeObj.change_limit,
                })
            }
        }
    }

    editLimit = () => {
        this.setState({
            pixstate: "limit",
            header: localeObj.change_limit,
            direction: "left"
        })
    }

    setDecimalAmount = (limit) => {
        let balanceInfo = limit.toString().split(".");
        this.setState({
            amount: balanceInfo[0],
        });
        let decimal = balanceInfo[1];
        if (decimal) {
            switch (decimal.length) {
                case 0:
                    decimal = "00";
                    break;
                case 1:
                    decimal = decimal + "0";
                    break;
                default:
                    decimal = decimal.substring(0, 2);
                    break;
            }
        } else {
            decimal = "00";
        }
        this.setState({
            decimal: decimal
        });
    }

    onGetAmount = (jsonObj) => {
        this.setState({
            amount: jsonObj["amount"],
            decimal: jsonObj["decimal"],
            pixBottom: true
        })
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

    requestChange = () => {
        this.setState({
            pixBottom: false,
            pixstate: "pin",
            header: localeObj.pix_authentication,
            direction: "right"
        })
    }

    handleClose = () => {
        this.setState({
            pixBottom: false,
            pixstate: "initial",
            direction: "left",
            amount: "",
            decimal: ""
        })
    }

    requestLimitChange = (pin) => {
        this.showProgressDialog();
        let jsonObject = {};
        jsonObject["pin"] = pin;
        jsonObject["amount"] = parseFloat(this.state.amount + "." + this.state.decimal);
        arbiApiService.requestLimitChange(jsonObject, PageNameJSON.pix_limit_review).then(response => {
            if (response.success) {
                this.setState({requestedLimitChange: true, header: localeObj.pix_limit})
                let processedResponse = ArbiResponseHandler.processChangeInPixLimitResponse(response.result);
                this.hideProgressDialog();
                if (processedResponse.success) {
                    if (processedResponse.message) {
                        this.getLimits(processedResponse.message);
                    } else {
                        this.getLimits(false);
                    }
                } else {
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                this.hideProgressDialog();
                let jsonObj = {};
                if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = "communication_issue"
                    this.setErrorInfo(jsonObj);
                } else if ('' + response.result.code === "10007") {
                    this.setState({ bottomSheetOpen: true })
                } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                    this.setState({ reset: true })
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                    this.setErrorInfo(errorJson);
                }
            }
        });
    }

    onSecondary = () => {
        this.setState({ 
            bottomSheetOpen: false,
            clearPassword: true
         })
    }

    onPrimary = () => {
        this.setState({
            bottomSheetOpen: false,
            clearPassword: true
        })
    }

    closeSnackBar = () => {
        this.setState({ pinExpiredSnackBarOpen: false })
    }

    forgot_passcode = () => {
        this.setState({
            bottomSheetOpen: false,
            reset: false
        })
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    checkPending = () => {
        this.setState({
            pendingSheetOpen: true
        })
    }

    onPrimaryButtonClick = () => {
        this.setState({
            pendingSheetOpen: false
        })
    }

    isValueGreaterThan2k = () => {
        const { amount, decimal } = this.state;
        const combinedValue = (parseInt(amount)) + (parseInt(decimal) / 100);
        return combinedValue > 2000;
      };

    goToChatbot = () => {
        if (this.state.isClickable) {
            return
        }
        this.setState({
            isClickable: true
        });
        ChatBotUtils.insideChatBot(constantObjects.pix_limit_entrypoint);
        this.props.history.replace({ pathname: "/chat", transition: "right"});
    }

    render() {
        const pixState = this.state.pixstate;
        const { classes } = this.props;
        const userDetails = {
            "amount": this.state.amount,
            "decimal": this.state.decimal,
        }
        return (
            <div style={{ overflowX: "hidden" }}>
                {pixState !== "error" &&
                    <div>
                        <ButtonAppBar header={this.state.header} onBack={this.onBack} action="none" />
                    </div>}
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "loading" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "loading" && !this.state.processing ? 'block' : 'none') }}>
                        {pixState === "loading" && <PixLimitLoadComp />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "initial" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "initial" && !this.state.processing ? 'block' : 'none') }}>
                        {pixState === "initial" && <PixLimitDescComp editLimit={this.editLimit} limit={this.state.dailyLimit} pending={this.state.pending}
                            checkPending={this.checkPending} onBack={this.onBack} componentName={PageNameJSON.pix_limit_review} has48HoursPassed={this.state.has48HoursPassed} goToChatbot={this.goToChatbot}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "limit" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "limit" && !this.state.processing ? 'block' : 'none') }}>
                        {pixState === "limit" && <AmountComponent setTransactionInfo={this.onGetAmount} requiredInfo={userDetails} feature="pix_limit"
                            limit={this.state.dailyLimit} componentName={PageNameJSON.pix_change_limit} requestedLimitChange={this.state.requestedLimitChange} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "pin" && !this.state.processing ? 'block' : 'none') }}>
                        {pixState === "pin" && <InputPinPage confirm={this.requestLimitChange} clearPassword={this.state.clearPassword}
                            componentName={PageNameJSON.verify_pin_for_limit} />}
                    </div>
                </CSSTransition>
                <div style={{ display: (pixState === "error" && !this.state.processing ? 'block' : 'none') }}>
                    {pixState === "error" && <PixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.onBack} componentName={PageNameJSON.error} />}
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.pinExpiredSnackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.pixBottom}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.change_limit}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {this.isValueGreaterThan2k() ? localeObj.limit_exceeded : localeObj.change_limit_header}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.request_change} onCheck={this.requestChange} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.handleClose} />
                        </div>
                    </Drawer>
                </div >
                <Drawer open={this.state.pendingSheetOpen}
                    anchor="bottom"
                    classes={{ paper: classes.paper }}>
                    <div style={{ margin: "1.5rem" }}>
                        <FlexView column style={{ marginTop: "0.5rem" }}>
                            <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                {localeObj.limit_change}
                            </div>
                            <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                {localeObj.limit_change_subtxt}
                            </div>
                        </FlexView>
                        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                            <span className="subtitle2 highEmphasis">
                                {localeObj.limit_requested}
                            </span>
                        </div>
                        <div style={{textAlign: "center"}}>
                            <span className="body2 mediumEmphasis">
                                {"R$ " + GeneralUtilities.currencyFromDecimals(this.state.pendingLimit)}
                            </span>
                        </div>
                        <div style={{ marginTop: "1rem", textAlign: "center" }}>
                            <span className="subtitle2 highEmphasis">
                                {localeObj.pending_portability_request_date}
                            </span>
                        </div>
                        <div style={{ width: "100%", textAlign: "center" }}>
                            <span className="body2 mediumEmphasis">
                                {this.state.requestDate}
                            </span>
                        </div>
                        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.pending_portability_wait} onCheck={this.onPrimaryButtonClick} />
                        </div>
                    </div>
                </Drawer>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.bottomSheetOpen}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.wrong_passcode}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.wrong_passcode_header}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.try} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondary} />
                            <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.forgot_passcode}>
                                {localeObj.forgot_passcode}
                            </div>
                        </div>
                    </Drawer>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.reset}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.reset_password}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.pin_expired}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.reset_password} onCheck={this.forgot_passcode} />
                        </div>
                    </Drawer>
                </div>
            </div >
        );
    }
}
export default withStyles(styles)(PixLimitComponents);

PixLimitComponents.propTypes = {
    location: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};