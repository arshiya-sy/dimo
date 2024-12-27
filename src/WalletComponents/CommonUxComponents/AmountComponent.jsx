import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import androidApiCalls from "../../Services/androidApiCallsService";
import localeService from "../../Services/localeListService";
import utilities from "../../Services/NewUtilities";
import GeneralUtilities from "../../Services/GeneralUtilities";
import httpRequest from "../../Services/httpRequest";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import MetricsService from "../../Services/MetricsService";
import PageState from "../../Services/PageState";

import TextField from "@material-ui/core/TextField";
import { InputAdornment } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import "../../styles/main.css";
import "../../styles/lazyLoad.css";

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import InputThemes from "../../Themes/inputThemes";
import ActionButtonComponent from "./ActionButton";
import constantObjects from "../../Services/Constants";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.AmountTheme;
const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};

class AmountComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: "",
            displayValue: "",
            balance: "",
            message: "",
            snackBarOpen: false,
            sendFeature: false,
            bottomSheetOpen: false,
            buttonEnable: this.props.feature === "fgts_anticipate" ? false : true
        };
        if (Object.keys(localeObj).toString().length === 0) {
            localeObj = localeService.getActionLocale();
        }
        this.confirm = this.confirm.bind(this);
        this.setAction = this.setAction.bind(this);
        this.handleChange = this.handleChange.bind(this);

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "AMOUNT PAGE"
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    setUserBalance = () => {
        if (ImportantDetails.walletBalance === "" && ImportantDetails.walletDecimal === "") {
            ArbiApiService.getUserBalance(this.componentName)
                .then(response => {
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                        if (processorResponse.success) {
                            GeneralUtilities.setBalanceToCache(processorResponse.balance);
                            this.setState({ balance: processorResponse.balance });
                        }
                    } else {
                        let jsonObj = {};
                        if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                            jsonObj["error"] = true;
                            jsonObj["errorCode"] = response.status;
                            jsonObj["reason"] = "communication_issue"
                            MetricsService.onPageTransitionStop(this.componentName, PageState.error);
                            this.props.setTransactionInfo(jsonObj);
                        } else {
                            jsonObj["error"] = true;
                            jsonObj["errorCode"] = response.status;
                            jsonObj["reason"] = response.status !== 504 ? "technical_issue" : "time_limit_exceeded"
                            MetricsService.onPageTransitionStop(this.componentName, PageState.error);
                            this.props.setTransactionInfo(jsonObj);
                        }
                    }
                });
        } else {
            this.setState({ balance: ImportantDetails.walletBalance + "." + ImportantDetails.walletDecimal })
        }
    }

    confirm = () => {
        if (this.state.amount.replace(/0/g, "").toString().length === 0) {
            this.setState({
                snackBarOpen: true,
                message: this.props.feature === "pix_recieve" ? localeObj.pix_receiver_amount : localeObj.pix_enter_valid_amount
            })
            return;
        } else {
            let amount = this.state.amount.substring(0, this.state.amount.toString().length - 2);
            let decimal = this.state.amount.substring(this.state.amount.toString().length - 2, this.state.amount.toString().length);
            let intAmount = parseFloat(amount + "." + decimal);
            if (this.props.feature === "deposit") {
                if (intAmount < 25 || intAmount > this.props.limit) {
                    this.setState({
                        snackBarOpen: true,
                        message: GeneralUtilities.formattedString(localeObj.boleto_range, [GeneralUtilities.getFormattedAmount(this.props.limit)])
                    })
                    return;
                }
                let jsonObject = {};
                let completeDateFormat = this.props.expiryDate;
                //completeDateFormat.setHours(24, 0, 0, 0);
                jsonObject["expiryDate"] = completeDateFormat.toISOString();
                jsonObject["amount"] = amount;
                jsonObject["decimal"] = decimal;
                jsonObject["date"] = completeDateFormat.toLocaleDateString();
                MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                this.props.recieveField(jsonObject);
            } else if (this.props.feature === "fgts_anticipate") {
                if (parseFloat(amount + "." + decimal) > parseFloat(GeneralUtilities.getRawBalance(this.props.maxVal.amount) + "." + this.props.maxVal.decimal)) {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.fgts_anticipate_newAmount_error + " " + this.props.maxVal.amount + "," + this.props.maxVal.decimal
                    })
                    return;
                } else if (parseFloat(amount + "." + decimal) < constantObjects.minFgtsValue) {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.fgts_simulate_min_value_error1
                    })
                    return;
                } else {
                    const jsonObject = {
                        amount: amount,
                        decimal: decimal
                    }
                    MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                    this.props.setTransactionInfo(jsonObject);
                }
            } else if (this.props.feature === "fgts_simulate") {
                if (parseFloat(amount + "." + decimal) < constantObjects.minFgtsBalance) {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.fgts_simulate_min_balance_error1
                    })
                    return;
                } else if (parseFloat(amount + "." + decimal) > constantObjects.maxFgtsBalance) {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.fgts_simulate_min_balance_error2
                    })
                    return;
                } else {
                    const jsonObject = {
                        amount: amount,
                        decimal: decimal
                    }
                    MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                    this.props.setTransactionInfo(jsonObject);
                }
            } else if (this.state.sendFeature) {
                if (this.state.balance === "") {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.balance_unverified
                    })
                    return;
                } else if (parseFloat(amount + "." + decimal) <= parseFloat(this.state.balance)) {
                    const jsonObject = {
                        amount: amount,
                        decimal: decimal
                    }
                    MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                    this.props.setTransactionInfo(jsonObject);
                } else {
                    if (this.props.feature === "pix_send" || this.props.feature === "ted_send") {
                        this.props.multiSelection(true);
                        // this.setState({
                        //     bottomSheetOpen: true
                        // });
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.pix_amount_outofbound
                        });
                    }
                }
            } else {
                const jsonObject = {
                    amount: amount,
                    decimal: decimal
                }
                MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                this.props.setTransactionInfo(jsonObject);
            }
        }
    }



    handleChange = (event) => {
        if (event.target.value.toString().length !== 0) {
            const re = /^[0-9]+$/;
            let value = event.target.value.replace(/[^0-9]/g, "");
            if (value.toString().length === 0) {
                this.resetField();
            } else if (re.test(value)) {
                let displaySalary = utilities.parseSalary(event.target.value);
                this.setState({
                    displayValue: displaySalary,
                    amount: displaySalary.replace(/[^0-9]/g, ''),
                    buttonEnable: false
                })
            }
        } else {
            this.resetField();
        }
    }

    resetField = () => {
        this.setState({
            displayValue: "",
            amount: "",
            buttonEnable: true
        })
    }

    setAction() {
        if (this.props.feature === "deposit") {
            let decimal = "00";
            let amount = "";
            if (this.state.amount.toString().length > 2) {
                amount = this.state.amount.substring(0, this.state.amount.toString().length - 2);
                decimal = this.state.amount.substring(this.state.amount.toString().length - 2, this.state.amount.toString().length);
            } else {
                amount = this.state.amount;
            }
            let jsonObject = {};
            jsonObject["amount"] = amount;
            jsonObject["decimal"] = decimal;
            this.props.setCalender(jsonObject);
        } else if (this.props.feature === "pix_recieve") {
            const jsonObject = {
                amount: "not_defined",
                decimal: "not_defined"
            }
            MetricsService.onPageTransitionStop(this.componentName, PageState.close);
            this.props.setTransactionInfo(jsonObject);
        }
    }

    schedule = () => {
        let amount = this.state.amount.substring(0, this.state.amount.toString().length - 2);
        let decimal = this.state.amount.substring(this.state.amount.toString().length - 2, this.state.amount.toString().length);
        const jsonObject = {
            amount: amount,
            decimal: decimal,
            addSchedule: true
        }
        MetricsService.onPageTransitionStop(this.componentName, PageState.close);
        this.props.setTransactionInfo(jsonObject);
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false });
    }

    onPressCancel = () => {
        // this.setState({ bottomSheetOpen: false });
        this.props.multiSelection(false);
    }

    cancelSimulate = () => {
        this.props.cancelSimulate();
    }

    componentDidMount() {
        MetricsService.onPageTransitionStart(this.componentName);
        this.setDisplayField();
        if (this.props.requestedLimitChange) {
            this.resetField();
        }
        if (this.props.feature === "pix_send" || this.props.feature === "ted_send" || this.props.feature === "pix_return") {
            this.setUserBalance();
            this.setState({
                sendFeature: true
            })
        }
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        window.removeEventListener("resize", this.checkIfInputIsActive);
    }

    checkIfInputIsActive = () => {
        if (window.innerHeight !== screenHeight) {
            this.setState({
                fieldOpen: true
            })
        } else {
            this.setState({
                fieldOpen: false
            })
        }
    }

    setDisplayField = () => {
        if (!!this.props.requiredInfo && !!this.props.requiredInfo.amount && !!this.props.requiredInfo.decimal) {
            if (this.props.feature === "pix_recieve" && this.props.requiredInfo.amount === "not_defined"
                && this.props.requiredInfo.decimal === "not_defined") {
                return;
            } else {
                let displaySalary = utilities.parseSalary(this.props.requiredInfo.amount + this.props.requiredInfo.decimal);
                this.setState({
                    displayValue: displaySalary,
                    amount: this.props.requiredInfo.amount + this.props.requiredInfo.decimal
                })
            }
        }
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle
        const headerSelect = () => {
            if (this.props.feature === "pix_send") {
                if (this.props.requiredInfo && this.props.requiredInfo.name) {
                    let firstName = this.props.requiredInfo.name.split(" ")[0]
                    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
                    return localeObj.transfer_amount_to + ' ' + firstName + '?';
                } else {
                    return localeObj.pix_amount_header;
                }
            } else if (this.props.feature === "ted_send") {
                return localeObj.pix_amount_header;
            } else if (this.props.feature === "pix_return") {
                return localeObj.pix_amount_return;
            } else if (this.props.feature === "pix_limit") {
                return localeObj.pix_daily_limit_header;
            } else if (this.props.feature === "fgts_simulate") {
                return localeObj.fgts_simulate_amount_header;
            } else if (this.props.feature === "fgts_anticipate") {
                return localeObj.fgts_anticipate_newAmount_header;
            } else {
                return localeObj.deposit_header;
            }
        }

        const fgtsAnticipateError = () => {
            let amount = this.state.amount.substring(0, this.state.amount.toString().length - 2);
            let decimal = this.state.amount.substring(this.state.amount.toString().length - 2, this.state.amount.toString().length);
            if (this.props.feature === "fgts_anticipate") {
                if (parseFloat(amount + "." + decimal) > parseFloat(GeneralUtilities.getRawBalance(this.props.maxVal.amount) + "." + this.props.maxVal.decimal)) {
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        }

        return (
            <div style={{ overflow: "hidden" }}>
                <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            {this.props.feature != "fgts_anticipate" && <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {headerSelect()}
                            </div>}
                            {this.props.feature === "fgts_anticipate" && <div className="subtitle4 highEmphasis" style={{ textAlign: "left" }}>
                                {headerSelect()}
                            </div>}
                            {this.props.feature === "fgts_anticipate" &&
                                <span style={{ marginTop: "1rem", textAlign: "left" }}>
                                    <span className="headline5 highEmphasis" style={{ marginRight: "0.375rem" }}>{"R$ "}</span>
                                    <span className="headline2 balanceStyle highEmphasis">{this.props.maxVal.amount}</span>
                                    <span className="subScript headline5 highEmphasis">{"," + utilities.formatDecimal(this.props.maxVal.decimal)}</span>
                                </span>
                            }
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                {(this.props.feature === "deposit" && GeneralUtilities.formattedString(localeObj.boleto_range, [GeneralUtilities.getFormattedAmount(this.props.limit)]))
                                    || (this.props.feature === "fgts_anticipate" && localeObj.fgts_anticipate_newAmount_subheader)
                                    || (this.props.feature === "fgts_simulate" && localeObj.fgts_simulate_amount_subheader)}

                                {(this.props.feature === 'pix_send' && this.props.requiredInfo && this.props.requiredInfo.receiverInstitute && this.props.requiredInfo.transferType &&
                                    <FlexView column>
                                        <div className="body2 mediumEmphasis">
                                            {localeObj.transfer_institution} {this.props.requiredInfo.receiverInstitute}
                                        </div>
                                        <div className="body2 mediumEmphasis">
                                            {localeObj.transfer_pix_key} {this.props.requiredInfo.transferType}
                                        </div>
                                    </FlexView>
                                )}
                            </div>
                        </FlexView>
                    </div>
                    <div style={{ marginTop: this.props.feature === "fgts_anticipate" ? "1rem" : "3rem" }}>
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={(this.props.feature === "fgts_simulate" || this.props.feature === "fgts_anticipate") ? "" : localeObj.value} type="tel"
                                onChange={this.handleChange}
                                placeholder={(this.props.feature === "fgts_simulate" || this.props.feature === "fgts_anticipate") ? localeObj.default_amount : ""}
                                error={this.props.feature === "fgts_anticipate" && fgtsAnticipateError() ? true : false}
                                InputProps={{
                                    startAdornment: (this.state.displayValue === "") ? '' : <InputAdornment className="body2 highEmphasis" position="start"><div className="headline4 highEmphasis">R$</div></InputAdornment>,
                                    classes: { underline: classes.underline },
                                    className: this.state.field === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                value={this.state.displayValue}
                                InputLabelProps={this.state.value === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }}
                                helperText={
                                    (this.props.feature === "fgts_anticipate" && fgtsAnticipateError()) ?
                                        localeObj.fgts_anticipate_newAmount_error + " " + this.props.maxVal.amount + "," + this.props.maxVal.decimal
                                        : ""}
                            />
                        </MuiThemeProvider>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", margin: "1rem 1.5rem", display: "inline-flex" }}>
                            {this.props.feature === "pix_limit" &&
                                localeObj.daily_limit + GeneralUtilities.currencyFromDecimals(this.props.limit)}
                            {this.state.sendFeature && localeObj.avai_acc_balance + "R$ "}
                            {this.state.sendFeature && (this.state.balance === "" ?
                                <span style={{ marginLeft: "0.5rem" }}>
                                    <section>
                                        <div className="shimmer-bar-5 shimming"></div>
                                    </section>
                                </span>
                                : GeneralUtilities.currencyFromDecimals(this.state.balance))}
                        </div>

                        {!this.state.sendFeature &&
                            this.props.feature !== "pix_limit" &&
                            this.props.feature !== "fgts_simulate" &&
                            this.props.feature !== "fgts_anticipate" &&
                            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                <ActionButtonComponent
                                    btn_text={this.props.feature === "deposit" ? localeObj.due_date + " " + this.props.btnText : this.props.btnText}
                                    onCheck={this.setAction}
                                />
                            </div>
                        }
                    </div>
                    <div style={{ ...fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle, textAlign: "center" }}>
                        <PrimaryButtonComponent disable={this.state.buttonEnable} btn_text={this.props.feature === "fgts_anticipate" ? localeObj.confirm : localeObj.next} onCheck={this.confirm} />
                    </div>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.props.amountBottomSheet}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.insufficient_balance}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.schedule_outofbound}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginTop: "1rem", marginBottom: "1.5rem", textAlign: "center" }}>
                            <SecondaryButtonComponent btn_text={localeObj.back_to_top} onCheck={this.onPressCancel} />
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

AmountComponent.propTypes = {
    classes: PropTypes.object,
    feature: PropTypes.string,
    btnText: PropTypes.string,
    limit: PropTypes.number,
    requiredInfo: PropTypes.object,
    maxVal: PropTypes.number,
    minVal: PropTypes.number,
    requestedLimitChange: PropTypes.bool,
    cancelSimulate: PropTypes.func,
    setTransactionInfo: PropTypes.func,
    setCalender: PropTypes.func,
    expiryDate: PropTypes.object,
    recieveField: PropTypes.func,
    componentName: PropTypes.string,
    multiSelection: PropTypes.func,
    amountBottomSheet: PropTypes.bool

};

export default withStyles(styles)(AmountComponent);