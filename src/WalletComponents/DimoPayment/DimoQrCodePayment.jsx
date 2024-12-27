import React from 'react';
import InputThemes from "../../Themes/inputThemes";
import "../../styles/main.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";

import moment from "moment";
import FlexView from "react-flexview";
import Drawer from '@material-ui/core/Drawer';
import PropTypes from "prop-types";
import PageNames from "../../Services/PageNames";
import PageState from '../../Services/PageState';
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from '../../Services/ArbiErrorResponsehandler';
import httpRequest from "../../Services/httpRequest";
import GeneralUtilities from "../../Services/GeneralUtilities";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import InputPinPage from "../CommonUxComponents/InputPinPage";
import ReviewTemplate from '../CommonUxComponents/ReviewTemplate';
import ReceiptTemplate from '../CommonUxComponents/RecieptTemplate';
import HSErrorComponent from "../CommonUxComponents/HSErrorComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import { CSSTransition } from 'react-transition-group';
import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import constantObjects from '../../Services/Constants';
import ImportantDetails from '../NewLaunchComponents/ImportantDetails';
import Log from '../../Services/Log';
import HelloShopUtils from '../EngageCardComponent/HelloShopUtil';

const theme1 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.DimoPay;
var localeObj = {};

class DimoQrCodePayment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            transitionState: "initial",
            info: {},
            direction: "",
            reviewInfo: {},
            clearPassword: false,
            errorJson: {},
            pinExpiredSnackBarOpen: false
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            if (this.state.bottomSheetOpen) {
                this.setState({ bottomSheetOpen: false });
            } else {
                this.onBack();
            }
        }
        this.setQrCodeInfo(this.props.history.location.state);
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

    setQrCodeInfo = (code) => {
        let qrCodeValue = code;
        if (code.includes("pix:")) {
            qrCodeValue = code.split("pix:")[1];
        } else if (code.includes(HelloShopUtils.RETURN_URL_PARAM)) {
            qrCodeValue = HelloShopUtils.getQRCode(code);
        }
        qrCodeValue = qrCodeValue ? qrCodeValue : code

        let jsonObj = {};
        jsonObj["componentPath"] = code;
        this.setState({
            hsCode : jsonObj,
        })

        this.showProgressDialog();
        ArbiApiService.getDetailsOfDimoQrCode(qrCodeValue).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processDetailsOfDimoQrCode(response.result);
                if (processedResponse.success) {
                    this.setState({
                        header: localeObj.review_payment,
                        qrCodeInfo: processedResponse.info,
                        qrCodeValue: qrCodeValue,
                        amount: processedResponse.info.amount,
                        decimal: processedResponse.info.decimal
                    })
                    this.createReviewInfo(processedResponse.info);
                } else {
                    this.hideProgressDialog();
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                let jsonObj = {};
                if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = "communication_issue";
                    this.setTransactionInfo(jsonObj);
                } else if (('' + response.result.code === "62100" || '' + response.result.code === "62102") && !HelloShopUtils.isHelloShopDimopayQRPayment(JSON.stringify(this.state.hsCode))) {
                    this.props.history.replace({
                        pathname: "/newWalletLaunch", transition: "right",
                        state: { showSnackBar: GeneralUtilities.formattedString(localeObj.invalid, [localeObj.dimo_pay]) }
                    });
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            }
        });
    }

    handleExecuteTransaction = (val) => {
        let jsonObject = {};
        jsonObject["code"] = this.state.qrCodeValue;
        jsonObject["pin"] = val;
        this.dimoPayToQRCode(jsonObject);
    }

    dimoPayToQRCode = (jsonObject) => {
        this.showProgressDialog();
        if (ImportantDetails.walletBalance === "" && ImportantDetails.walletDecimal === "") {
            this.handleQrCodePayment(jsonObject);
        } else {
            if (parseFloat(this.state.amount + "." + this.state.decimal)
                <= parseFloat(ImportantDetails.walletBalance + "." + ImportantDetails.walletDecimal)) {
                this.handleQrCodePayment(jsonObject);
            } else {
                this.hideProgressDialog();
                let jsonObj = {};
                jsonObj["error"] = true;
                jsonObj["reason"] = "insufficient_balance";
                this.setTransactionInfo(jsonObj);
            }
        }
    }

    handleQrCodePayment = (jsonObject) => {
        ArbiApiService.payForDimoQrCode(jsonObject).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processDetailsOfDimoQRTransaction(response.result);
                this.hideProgressDialog();
                if (processedResponse.success) {
                    this.onGetBalance();
                    let reviewInfo = {
                        "amount": this.state.qrCodeInfo.amount,
                        "decimal": this.state.qrCodeInfo.decimal,
                        "receiver": {},
                    }
                    reviewInfo["receiver"][localeObj.name] = this.state.qrCodeInfo.name
                    reviewInfo["receiver"][localeObj.payment_id] = this.state.qrCodeInfo.paymentId
                    reviewInfo["date"] = moment(processedResponse.date).format('DD/MM/YYYY');
                    reviewInfo["hour"] = moment(processedResponse.date).format('HH');
                    reviewInfo["mins"] = moment(processedResponse.date).format('mm');
                    reviewInfo["fileName"] = "comprovante_Dimo_";
                    if (HelloShopUtils.isHelloShopDimopayQRPayment(JSON.stringify(this.state.hsCode))) {
                        reviewInfo["componentPath"] = this.props.history.location.state
                    }
                    this.setState(prevState => ({
                        info: {
                            ...prevState.info,
                            [localeObj.pix_type]: localeObj.dimo_pay,
                        },
                        transitionState: "receipt",
                        direction: "left",
                        qrCodeInfo: reviewInfo
                    }))
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
                    jsonObj["reason"] = "communication_issue";
                    this.setTransactionInfo(jsonObj);
                } else if ('' + response.result.code === "10007" && !HelloShopUtils.isHelloShopDimopayQRPayment(JSON.stringify(this.state.hsCode))) {
                    this.setState({
                        bottomSheetOpen: true,
                        bottomSheetHeader: localeObj.wrong_passcode,
                        bottomSheetDescription: localeObj.wrong_passcode_header,
                        primary_btn_text: localeObj.try,
                        secondary_btn_text: localeObj.cancel,
                        bottomSheetSubText: localeObj.forgot_passcode,
                        bottomSheetType: "",
                    });
                } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                    this.setState({ reset: true })
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            }
        });
    }

    onGetBalance = async () => {
        await GeneralUtilities.onCheckBalance().then((balanceResponse) => {
            Log.sDebug(balanceResponse, PageNameJSON.result);
        });
    }

    setTransactionInfo = (transactionInfo) => {
        if (transactionInfo.error) {
            androidApiCalls.hideProgressDialog();
            let jsonObj = {}
            jsonObj["errorCode"] = transactionInfo.errorCode;
            jsonObj["title"] = localeObj.pix;
            jsonObj["header"] = localeObj.dimo_failed;
            switch (transactionInfo.reason) {
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
                    jsonObj["description"] = localeObj.generic_error + " " + localeObj.generic_error_subtext
                    break;
                case "unverified_balance":
                    jsonObj["description"] = localeObj.balance_unverified;
                    break;
                case "insufficient_balance":
                    jsonObj["description"] = localeObj.pix_amount_outofbound;
                    break;
                case "arbi_error":
                    jsonObj["description"] = transactionInfo.descriptor;
                    break;
                case HelloShopUtils.HS_TIMEOUT_ERROR_CODE:
                    jsonObj["title"] = localeObj.hs_timeout_error_title;
                    jsonObj["description"] = localeObj.hs_timeout_error_description;
                    jsonObj["reason"] = transactionInfo.reason;
                    break;
                default:
                    break;
            }
            if (HelloShopUtils.isHelloShopDimopayQRPayment(JSON.stringify(this.state.hsCode))) {
                jsonObj["errorCode"] = HelloShopUtils.HS_ERROR_CODE;
                jsonObj["componentPath"] = this.props.history.location.state
            }
            this.setState({
                transitionState: "error",
                direction: "left",
                pixErrorJson: jsonObj

            })
        } else {
            switch (this.state.transitionState) {
                case "dimo_review":
                    this.setState({
                        transitionState: "verify_pin",
                        direction: "left",
                        info: transactionInfo,
                        header: localeObj.pix_authentication,
                    })
                    break;
                case "verify_pin":
                    this.handleExecuteTransaction(transactionInfo)
                    break;
                default:
                    break;
            }
        }
    }

    createReviewInfo = (transactionInfo) => {
        let reviewInfo = {
            "amount": transactionInfo.amount,
            "decimal": transactionInfo.decimal,
            "receiver": {},
            "transferType": localeObj.dimo_pay
        }
        reviewInfo["receiver"][localeObj.name] = transactionInfo.name
        reviewInfo["receiver"][localeObj.payment_id] = transactionInfo.paymentId
        reviewInfo["componentPath"] = this.props.history.location.state

        this.setState({
            reviewInfo: reviewInfo,
            transitionState: "dimo_review",
            direction: "left"
        })
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            switch (this.state.transitionState) {
                case "dimo_review":
                    this.backToHome();
                    break;
                case "verify_pin":
                    MetricServices.onPageTransitionStop(PageNameJSON[this.state.transitionState], PageState.back);
                    this.setState({
                        header: localeObj.review_payment,
                        transitionState: "dimo_review",
                        direction: "right",
                    })
                    break;
                case "receipt":
                    this.backToHome();
                    break;
                case "error":
                    this.backToHome();
                    break;
                default:
                    break;
            }
        }
    }

    backToHome = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.transitionState], PageState.back);

        if (HelloShopUtils.isHelloShopDimopayQRPayment(JSON.stringify(this.state.hsCode))) {
            if (this.state.transitionState === "dimo_review") {
                return this.setState({
                    bottomSheetHeader: localeObj.hs_abort_warning_title,
                    bottomSheetDescription: localeObj.hs_abort_warning_message,
                    primary_btn_text: localeObj.hs_abort_pstbtn,
                    secondary_btn_text: "",
                    bottomSheetType: "HSAbortSheet",
                    bottomSheetSubText: localeObj.hs_abort_ngtbtn,
                    bottomSheetOpen: true
                });
            } else if ((this.state.transitionState === "error") && (this.state.pixErrorJson["reason"] === HelloShopUtils.HS_TIMEOUT_ERROR_CODE)) {
                this.returnToHS(HelloShopUtils.TIMEOUT_ABORTED_ERROR)
            } else if (this.state.transitionState === "error") {
                this.returnToHS(HelloShopUtils.BANK_ABORTED_ERROR)
            } else if (this.state.transitionState === "receipt") {
                let url = HelloShopUtils.getSuccessURL(JSON.stringify(this.state.hsCode))
                HelloShopUtils.returnToHS(url);
            }
            return;
        }
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    returnToHS  = (error) => {
        if (!GeneralUtilities.isNotEmpty(error)) {
            error = HelloShopUtils.USER_ABORTED_ERROR;
        }
        let returnUrl = HelloShopUtils.getAbortedURL(JSON.stringify(this.state.hsCode), error);
        HelloShopUtils.returnToHS(returnUrl)
        return;
    }

    onSecondary = () => {
        this.setState({ bottomSheetOpen: false })
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
        if (this.state.bottomSheetType === "HSAbortSheet") {
            this.setState({
                bottomSheetOpen: false,
            })
            this.returnToHS();
            return;
        }
        this.setState({
            bottomSheetOpen: false,
            reset: false
        })
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.transitionState], PageState.close);
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    componentWillUnmount() {
        this.setState({
            bottomSheetOpen: false,
        })
    }

    render() {
        const currentState = this.state.transitionState;
        const { classes } = this.props;
        return (
            <FlexView column style={{ width: "100%" }}>
                {currentState !== "receipt" && currentState !== "error" &&
                    <div>
                        <ButtonAppBar header={this.state.header} onBack={this.onBack} action="none" />
                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "dimo_review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "dimo_review" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "dimo_review" && <ReviewTemplate requiredInfo={this.state.reviewInfo} setTransactionInfo={this.setTransactionInfo}
                            header={localeObj.paying} detailHeader={localeObj.destination} btnText={localeObj.start_payment} componentName={PageNameJSON.dimo_review} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "verify_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "verify_pin" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "verify_pin" && <InputPinPage confirm={this.setTransactionInfo} requiredInfo={this.state.reviewInfo} clearPassword={this.state.clearPassword} componentName={PageNameJSON.verify_pin} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "receipt" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "receipt" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.receipt} onCancel={this.onBack} action="cancel" inverse="true" />
                        {currentState === "receipt" && <ReceiptTemplate requiredInfo={this.state.qrCodeInfo} OtherTransaction={this.backToHome} info={this.state.info} confirm={this.backToHome} onBack={this.onBack}
                            header={localeObj.paid} btnText={localeObj.back_home} componentName={PageNameJSON.receipt} />}
                    </div>
                </CSSTransition>
                <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                    {currentState === "error" && <HSErrorComponent errorJson={this.state.pixErrorJson} onClick={this.backToHome} componentName={PageNameJSON.error} />}
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
                            open={this.state.bottomSheetOpen}>
                            <div style={{ margin: "1.5rem" }}>
                                <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {this.state.bottomSheetHeader}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {this.state.bottomSheetDescription}
                                </div>
                                </FlexView>
                            </div>
                            <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                                <PrimaryButtonComponent btn_text={this.state.primary_btn_text} onCheck={this.onPrimary} />
                                {this.state.secondary_btn_text && <SecondaryButtonComponent btn_text={this.state.secondary_btn_text} onCheck={this.onSecondary} />}
                                {this.state.bottomSheetSubText && <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.forgot_passcode}>
                                        {this.state.bottomSheetSubText}
                                </div>}
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
            </FlexView>
        )
    }
}
DimoQrCodePayment.propTypes = {
    classes: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
};
export default withStyles(styles)(DimoQrCodePayment);
