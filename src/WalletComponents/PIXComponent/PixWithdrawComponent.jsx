import React from "react";
import "../../styles/main.css";
import FlexView from "react-flexview";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import androidApiCalls from "../../Services/androidApiCallsService";
import { CSSTransition } from 'react-transition-group';
import moment from "moment";

import InputPinPage from "../CommonUxComponents/InputPinPage";
import localeService from "../../Services/localeListService";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import CustomPixErrorComponent from "./CustomPixErrorComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import NewUtilities from "../../Services/NewUtilities";
import httpRequest from "../../Services/httpRequest";
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';

import PageNames from "../../Services/PageNames";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import ReviewTemplate from "../CommonUxComponents/ReviewTemplate";
import ReceiptTemplate from "../CommonUxComponents/RecieptTemplate";
import InputThemes from "../../Themes/inputThemes";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import constantObjects from "../../Services/Constants";
import GeneralUtilities from "../../Services/GeneralUtilities";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.pixWithdraw;
var localeObj = {};

class PixWithdrawComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageState: "",
            qrCodeInfo: {},
            message: "",
            direction: "",
            qrCodeResponse: this.props.history.location.qrCodeResponse,
            qrCodeJson: {},
            pixErrorJson: {},
            pixTransactionInfo: {},
            info: {},
            from: this.props.history.location.from
        }
        this.styles = {
            cardStyle: {
                width: "100%",
                margin: "0 1rem"
            },
            circle: {
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            },
            imgStyle1: {
                height: "3rem",
                marginBottom: "4rem"
            },
            imgStyle2: {
                height: "3rem",
                marginBottom: "2rem"
            },
            imgStyle3: {
                height: "3rem",
                marginBottom: "2rem"
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        window.onBackPressed = () => {
            this.onBack();
        }
        this.fetchTariff(this.state.qrCodeResponse);
    }

    setTransactionInfo = (value) => {
        if (!this.state.processing) {
            let jsonObject = { ...this.state.qrCodeJson, pin: value };

            let locale = androidApiCalls.getLocale();
            let fileName = ""
            fileName = (locale === "en_US" || locale === "en_AU") ? "pixwithdraw_" : "pixsaque_";

            this.showProgressDialog();
            ArbiApiService.payForAPixWithdraw(jsonObject, PageNameJSON.pin).then((response) => {
                if (response && response.success) {
                    const processedResponse = ArbiResponseHandler.processPixWithdrawlApi(response.result);
                    if (processedResponse && processedResponse.success) {
                        this.hideProgressDialog();
                        let qrCodeInfo = { ...this.state.qrCodeInfo }
                        let pixTransactionInfo = {
                            name: "",
                            amount: qrCodeInfo.amount,
                            decimal: qrCodeInfo.decimal,
                            receiver: {},
                            date: moment(moment.now()).format("DD/MM/YYYY"),
                            hour: moment(moment.now()).format("HH"),
                            mins: moment(moment.now()).format("mm"),
                            fileName: fileName
                        }
                        pixTransactionInfo["receiver"][localeObj.date] = localeObj.pix_today + ", " + moment(moment.now()).format("DD/MM/YYYY");
                        pixTransactionInfo["receiver"][localeObj.pix_type] = qrCodeInfo["transferType"];
                        pixTransactionInfo["receiver"][localeObj.tariff] = "R$ " + qrCodeInfo["tariff"];
                        this.setState({
                            pageState: "pix_receipt",
                            direction: "left",
                            pixTransactionInfo: pixTransactionInfo,
                            info: {
                                [localeObj.pix_type]: localeObj.pix_withdraw
                            }
                        })
                    }
                    else {
                        this.hideProgressDialog();
                        let jsonObj = {}
                        jsonObj["header"] = localeObj.pix_failed;
                        this.setState({
                            transcationState: "error",
                            direction: "left",
                            pixErrorJson: jsonObj
                        })
                    }
                }
                else if (response.result["code"] === 46040) {
                    this.hideProgressDialog();
                    let jsonObject = {}
                    jsonObject["error"] = "true"
                    jsonObject["reason"] = "withdraw_not_confirmed"
                    this.onReview(jsonObject);
                }
                else if (response.result["code"] === 40096) {
                    this.hideProgressDialog();
                    this.setState({ reset: true });
                }
                else if (response.result["code"] === 10007) {
                    this.hideProgressDialog();
                    this.setState({ bottomSheetOpen: true });
                }
                else {
                    this.hideProgressDialog();
                    let jsonObj = {}
                    jsonObj["description"] = response.result["message"];
                    jsonObj["header"] = localeObj.pix_failed;
                    this.setState({
                        pageState: "error",
                        direction: "left",
                        pixErrorJson: jsonObj
                    })
                }
            });
        }
    }

    fetchTariff = (responseJson) => {
        this.showProgressDialog();
        let jsonObject = {};
        let amount = responseJson["amount"];
        jsonObject["amount"] = amount
        jsonObject["code"] = 4079; // PIX withdraw code
        ArbiApiService.getTariff(jsonObject, PageNameJSON.review).then(response => {
            this.hideProgressDialog();
            if (response && response.success) {
                let processorResponse = ArbiResponseHandler.processTariffResponse(response.result);
                if (processorResponse && processorResponse.success) {
                    let qrCodeInfo = {
                        "amount": amount.toString(),
                        "decimal": "00",
                        "transferType": localeObj.pix_withdraw,
                        "tariff": processorResponse.tariff
                    }
                    this.setState({
                        qrCodeInfo: qrCodeInfo,
                        qrCodeJson: responseJson,
                        pageState: "review",
                        direction: "left"
                    })
                } else {
                    let jsonObj = {}
                    jsonObj["header"] = localeObj.tariff_failed;
                    this.setState({
                        pageState: "error",
                        direction: "left",
                        pixErrorJson: jsonObj
                    });
                }
            } else {
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.retry_later
                })
            }
        });
    }

    onReview = (value) => {
        if (!!value.error) {
            let jsonObj = {}
            let customErrorPage = false;
            jsonObj["header"] = localeObj.pix_failed;
            switch (value.reason) {
                case "technical_issue":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "communication_issue":
                    jsonObj["description"] = localeObj.pix_communication_issue;
                    break;
                case "time_limit_exceeded":
                    jsonObj["description"] = localeObj.pix_time_limit_exceeded;
                    break;
                case "insufficient_balance":
                    jsonObj["description"] = localeObj.pix_amount_outofbound;
                    break;
                case "generic_error":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "arbi_error":
                    jsonObj["description"] = value.descriptor;
                    break;
                case "withdraw_not_confirmed":
                    customErrorPage = true;
                    jsonObj["header"] = localeObj.pix_transaction_pending;
                    break;
                default:
                    jsonObj["description"] = value.reason;
                    break;
            }
            if (customErrorPage) {
                this.setState({
                    pageState: "customError",
                    direction: "left",
                    pixErrorJson: jsonObj
                })
            }
            else {
                this.setState({
                    pageState: "error",
                    direction: "left",
                    pixErrorJson: jsonObj
                })
            }
        } else {
            this.setState({
                pageState: "pin",
                direction: "left"
            })
        }
    }

    showHistory = () => {
        this.props.history.replace({ pathname: '/newTransactionHistory', transition: "left" });
    }

    onBack = () => {
        if (this.state.bottomSheetOpen)
            this.setState({ bottomSheetOpen: false });
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            switch (this.state.pageState) {
                case "review":
                    if (this.state.from === "landingPage")
                        this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right", fromPixWithdraw: true });
                    else
                        this.props.history.replace({ pathname: "/pixLandingComponent", transition: "right", fromPixWithdraw: true });
                    break;
                case "pin":
                    this.setState({ pageState: "review", direction: "right" });
                    break;
                case "completed":
                    this.onComplete();
                    break;
                case "error":
                    this.onErrorClose();
                    break;
                case "customError":
                    this.onErrorClose();
                    break;
                case "pix_receipt":
                    this.onComplete();
                    break;
                default:
                    this.onComplete();
                    break;
            }
        }
    }

    getBalanceAndMovetoMain = () => {
        this.showProgressDialog();
        ArbiApiService.getUserBalance(PageNameJSON.amount)
            .then(response => {
                this.hideProgressDialog();
                if (response && response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse && processorResponse.success) {
                        let balanceInfo = processorResponse.balance.toString().split(".");
                        let balance = balanceInfo[0];
                        let decimal = NewUtilities.formatDecimal(balanceInfo[1]);
                        ImportantDetails.walletBalance = balance;
                        ImportantDetails.walletDecimal = decimal;
                        this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
                    }
                } else {
                    if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.pix_communication_issue
                        })
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.pix_technical_issue
                        })
                    }
                }
            });
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

    showHistory = () => {
        this.props.history.replace({ pathname: '/newTransactionHistory', transition: "left" });
    }

    onComplete = () => {
        this.getBalanceAndMovetoMain();
    }

    onErrorClose = () => {
        this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
    }

    onCancel = () => {
        this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
    }

    otherTransaction = () => {
        if (GeneralUtilities.getBackPressTracking() === "AllServices") {
            GeneralUtilities.setBackPressTracking("");
            this.props.history.replace({ pathname: "/allServices", transition: "right", otherTransaction: "atm" });
        } else {
            this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right", otherTransaction: "atm" });
        }
    }

    forgot_passcode = () => {
        this.setState({
            bottomSheetOpen: false,
            reset: false
        })
        this.props.history.replace("/securityComp", { "from": "pinPage" });
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

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    render() {
        const { classes } = this.props;

        return (
            <div style={{ overflowX: "hidden" }}>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.pageState === "review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
                    <div style={{ display: (this.state.pageState === "review" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.review_payment} onBack={this.onBack} action="none" />
                        {this.state.pageState === "review" && <ReviewTemplate requiredInfo={this.state.qrCodeInfo} setTransactionInfo={this.onReview}
                            fromPixWithdraw={true} header={localeObj.withdrawing} btnText={localeObj.next} back={this.onBack} componentName={PageNameJSON.review} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.pageState === "pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
                    <div style={{ display: (this.state.pageState === "pin" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_authentication} onBack={this.onBack} action="none" />
                        {this.state.pageState === "pin" && <InputPinPage confirm={this.setTransactionInfo} clearPassword={this.state.clearPassword} componentName={PageNameJSON.pin} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.pageState === "pix_receipt" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.pageState === "pix_receipt" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_receipt} onCancel={this.onCancel} action="cancel" inverse="true" />
                        {this.state.pageState === "pix_receipt" && <ReceiptTemplate requiredInfo={this.state.pixTransactionInfo} info={this.state.info} confirm={this.onComplete}
                            onBack={this.onBack} header={localeObj.pix_withdraw_receipt_header} btnText={localeObj.back_home} componentName={PageNameJSON.completed} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.pageState === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.pageState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {this.state.pageState === "error" && <PixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.onErrorClose} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.pageState === "customError" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (this.state.pageState === "customError" && !this.state.processing ? 'block' : 'none') }}>
                        {this.state.pageState === "customError" && <CustomPixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.onBack} showHistory={this.showHistory} componentName={PageNameJSON.customError} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
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
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
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
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.reset_password} onCheck={this.forgot_passcode} />
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

export default withStyles(styles)(PixWithdrawComponent);
