import React from "react";
import PropTypes from "prop-types";

import "../../styles/main.css";
import FlexView from "react-flexview";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import androidApiCalls from "../../Services/androidApiCallsService";
import { CSSTransition } from 'react-transition-group';

import InputPinPage from "../CommonUxComponents/InputPinPage";
import localeService from "../../Services/localeListService";
import AtmCardComponent from "./AtmCardComponent";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';

import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import httpRequest from "../../Services/httpRequest";
import MetricsService from "../../Services/MetricsService";
import NewUtilities from "../../Services/NewUtilities";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import ReviewTemplate from "../CommonUxComponents/ReviewTemplate";
import InputThemes from "../../Themes/inputThemes";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import AtmResultComponent from "./AtmResult";
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import GeneralUtilities from "../../Services/GeneralUtilities";
import ChatBotUtils from "../NewUserProfileComponents/ChatComponents/ChatBotUtils";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.atmwithdraw;

var localeObj = {};
class AtmComponent extends React.Component {

    constructor(props) {
        super(props);
        this.qrCodeValue = this.props.location.state.qrCodeValue;
        this.state = {
            transcationState: "amount",
            amount: "",
            direction: "",
            info: {},
            statusInfo: {},
            balance: -1,
            decimal: "",
            atmInfo: {},
            isClickable: false
        }
        this.accountKey = "";
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    onSetAmount = (value) => {
        if (!this.state.processing) {
            this.fetchTariff(value);
        }
    }

    onReview = (value) => {
        if (value.error) {
            let jsonObj = {}
            jsonObj["header"] = localeObj.atm_failure_title;
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
                default:
                    jsonObj["description"] = value.reason;
                    break;
            }
            this.setState({
                transcationState: "error",
                direction: "left",
                pixErrorJson: jsonObj
            })
        } else {
            this.setState({
                transcationState: "pin",
                direction: "left"
            })
        }
    }

    setTransactionInfo = (value) => {
        if (!this.state.processing) {
            let jsonObject = {};
            jsonObject["qrCodeValue"] = this.qrCodeValue;
            jsonObject["amount"] = this.state.amount;
            jsonObject["pin"] = value;

            this.showProgressDialog();
            ArbiApiService.withdrawMoneyFromAtm(jsonObject, PageNameJSON.completed).then((response) => {
                Log.verbose("withdrawl from atm - " + response.success + " data - " + JSON.stringify(response.result));
                if (response.success) {
                    const processedResponse = ArbiResponseHandler.processAtmWithdrawlApi(response.result);
                    if (processedResponse.success) {
                        this.onGetBalance();
                        this.hideProgressDialog();
                        this.setState({
                            transcationState: "completed",
                            direction: "left",
                            info: {
                                transcationResult: "success",
                                mode: "ATM",
                                amount: this.state.amount,
                                [localeObj.transaction_code]: processedResponse.transactionCode
                            }
                        });
                    } else {
                        this.hideProgressDialog();
                        let jsonObj = {}
                        jsonObj["header"] = localeObj.atm_failure_title;
                        this.setState({
                            transcationState: "error",
                            direction: "left",
                            pixErrorJson: jsonObj
                        })
                    }
                } else {
                    this.hideProgressDialog();
                    let jsonObj = {}
                    if ('' + response.result.code === "10007") {
                        this.setState({ bottomSheetOpen: true })
                    } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                        this.setState({ reset: true })
                    } else {
                        jsonObj["header"] = localeObj.atm_failure_title;
                        jsonObj["description"] = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                        this.setState({
                            transcationState: "error",
                            direction: "left",
                            pixErrorJson: jsonObj
                        })
                    }
                }
            });
        }
    }

    onComplete = () => {
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
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

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.onBack();
        }
    }

    fetchTariff = (amount) => {
        this.showProgressDialog();
        let jsonObject = {};
        jsonObject["amount"] = amount;
        jsonObject["code"] = 4014; // ATM withdraw code
        ArbiApiService.getTariff(jsonObject, PageNameJSON.review).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processTariffResponse(response.result);
                if (processorResponse.success) {
                    let atmInfo = {
                        "amount": amount.toString().split(".")[0],
                        "decimal": amount.toString().split(".")[1] ? amount.toString().split(".")[1] : "00",
                        "transferType": localeObj.atm_tool_header,
                        "tariff": processorResponse.tariff
                    }
                    this.setState({
                        amount: amount,
                        atmInfo: atmInfo,
                        transcationState: "review",
                        direction: "left",
                    })
                } else {
                    let jsonObj = {}
                    jsonObj["header"] = localeObj.tariff_failed;
                    this.setState({
                        transcationState: "error",
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

    onGetBalance = async () => {
        await GeneralUtilities.onCheckBalance().then((balanceResponse) => {
            Log.sDebug(balanceResponse, PageNameJSON.result, "ATM Main Component");
        });
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricsService.onPageTransitionStop(PageNameJSON[this.state.transcationState], PageState.back);
            switch (this.state.transcationState) {
                case "review":
                    this.setState({ transcationState: "amount", direction: "right" });
                    break;
                case "pin":
                    this.setState({ transcationState: "review", direction: "right" });
                    break;
                case "completed":
                    this.onComplete();
                    break;
                case "error":
                case "amount":
                    if (this.props.location && this.props.location.from && this.props.location.from === "mainTransactionHistory") {
                        this.getBalanceAndMovetoMain();
                    } else {
                        this.onComplete();
                    }
                    break;
                default: break;
            }
        }
    }

    getBalanceAndMovetoMain = () => {
        this.showProgressDialog();
        ArbiApiService.getUserBalance(PageNameJSON.amount)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse.success) {
                        let balanceInfo = processorResponse.balance.toString().split(".");
                        let balance = balanceInfo[0];
                        let decimal = NewUtilities.formatDecimal(balanceInfo[1]);
                        this.props.history.replace({ pathname: "/newTransactionHistory", transition: "right", balanceData: { "balance": balance, "decimal": decimal } });
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

    otherTransaction = () => {
        if (GeneralUtilities.getBackPressTracking() === "AllServices") {
            GeneralUtilities.setBackPressTracking("");
            this.props.history.replace({ pathname: "/allServices", transition: "right", otherTransaction: "atm" });
        } else {
            this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right", otherTransaction: "atm" });
        }
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

    forgot_passcode = () => {
        this.setState({
            bottomSheetOpen: false,
            reset: false
        })
        MetricsService.onPageTransitionStop(PageNameJSON[this.state.transcationState], PageState.close);
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    goToChatbot = () => {
        if (this.state.isClickable) {
            return;
        }
        this.setState({
            isClickable: true
        });
        ChatBotUtils.insideChatBot(constantObjects.atm_card_entrypoint);
        this.props.history.replace({ pathname: "/chat", transition: "right" });
    }

    render() {
        const transaction = this.state.transcationState;
        const { classes } = this.props;
        return (
            <div style={{ overflowX: "hidden" }}>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "amount" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.atm_tool_header} onBack={this.onBack} action="none" />
                        {transaction === "amount" && <AtmCardComponent onSetAmount={this.onSetAmount} onBack={this.onBack} setTransactionInfo={this.onReview}
                            requiredInfo={this.state.atmInfo} componentName={PageNameJSON.amount} goToChatbot={this.goToChatbot} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
                    <div style={{ display: (transaction === "review" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.review_payment} onBack={this.onBack} action="none" />
                        {transaction === "review" && <ReviewTemplate requiredInfo={this.state.atmInfo} setTransactionInfo={this.onReview}
                            header={localeObj.withdrawing} btnText={localeObj.next} back={this.onBack} componentName={PageNameJSON.review} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
                    <div style={{ display: (transaction === "pin" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.atm_tool_header} onBack={this.onBack} action="none" />
                        {transaction === "pin" &&
                            <InputPinPage confirm={this.setTransactionInfo} clearPassword={this.state.clearPassword} componentName={PageNameJSON.pin} />
                        }
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "completed" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
                    <div style={{ display: (transaction === "completed" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "completed" && <AtmResultComponent onBack={this.onBack} OtherTransaction={this.otherTransaction} componentName={PageNameJSON.completed} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "error" && <PixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.onComplete} componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    <ButtonAppBar header={localeObj.atm_tool_header} onBack={this.onBack} action="none" />
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
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"  }}>
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
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"  }}>
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

AtmComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object,
    history: PropTypes.object
};

export default withStyles(styles)(AtmComponent);
