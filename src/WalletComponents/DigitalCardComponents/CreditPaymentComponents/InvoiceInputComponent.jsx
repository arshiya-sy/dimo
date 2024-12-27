import React from "react";
import FlexView from "react-flexview";
import PropTypes from 'prop-types';
import localeService from "../../../Services/localeListService";
import utilities from "../../../Services/NewUtilities";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import httpRequest from "../../../Services/httpRequest";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import MetricsService from "../../../Services/MetricsService";
import PageState from "../../../Services/PageState";

import TextField from "@material-ui/core/TextField";
import { InputAdornment } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import "../../../styles/main.css";
import "../../../styles/lazyLoad.css";

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import InputThemes from "../../../Themes/inputThemes";
import constantObjects from "../../../Services/Constants";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.AmountTheme;
const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;

var localeObj = {};

class InvoiceInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            amount: "",
            displayValue: "",
            balance: "",
            message: "",
            snackBarOpen: false,
            minSet: false,
            leftToPay: false
        };
        this.confirm = this.confirm.bind(this);
        this.handleChange = this.handleChange.bind(this);

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "INVOICE AMOUNT PAGE"
        }
        MetricsService.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
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
        this.setState({ minSet: false })
        if (this.state.amount.toString().replace(/0/g, "").length === 0) {
            this.setState({
                snackBarOpen: true,
                message: localeObj.pix_enter_valid_amount
            })
            return;
        } else {
            let amount = this.state.amount.substring(0, this.state.amount.length - 2);
            let decimal = this.state.amount.substring(this.state.amount.length - 2, this.state.amount.length);
            let intAmount = parseFloat(amount + "." + decimal);
            if (intAmount < this.props.minLimit) {
                this.setState({
                    minSet: true,
                    minMessage: GeneralUtilities.formattedString(localeObj.invoice_min_val, [GeneralUtilities.getFormattedAmount(this.props.minLimit)])
                })
                return;
            }
            
            if (this.state.balance === "") {
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.balance_unverified
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
        }
    }

    handleChange = (event) => {
        if (event.target.value.length !== 0) {
            const re = /^[0-9]+$/;
            let value = event.target.value.replace(/[^0-9]/g, "");
            if (value.length === 0) {
                this.resetField();
            } else if (re.test(value)) {
                let displaySalary = utilities.parseSalary(event.target.value);
                this.setState({
                    displayValue: displaySalary,
                    amount: displaySalary.replace(/[^0-9]/g, '')
                })
            }
        } else {
            this.resetField();
        }
    }

    resetField = () => {
        this.setState({
            displayValue: "",
            amount: ""
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false });
    }

    componentDidMount() {
        this.setDisplayField();
        this.setUserBalance();
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
            let displaySalary = utilities.parseSalary(this.props.requiredInfo.amount + this.props.requiredInfo.decimal);
            this.setState({
                displayValue: displaySalary,
                amount: this.props.requiredInfo.amount + this.props.requiredInfo.decimal
            })
        }
        if (!!this.props.amountLeftToPay && !!this.props.invoiceValue) {
            if (this.props.amountLeftToPay !== this.props.invoiceValue) {
                this.setState({ leftToPay: true })
            } else {
                this.setState({ leftToPay: false })
            }
        }
    }

    seeDetails = () => {
        this.props.seeDetails();
    }

    installment = () => {
        this.props.payInInstallments();
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle;
        return (
            <div style={{ overflow: "hidden" }}>
                <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.payment_amount}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                {!this.state.leftToPay && localeObj.invoice_value + "R$ " + GeneralUtilities.currencyFromDecimals(this.props.invoiceValue)}
                                {this.state.leftToPay && localeObj.amount_left_Pay + "R$ " + GeneralUtilities.currencyFromDecimals(this.props.amountLeftToPay)}
                            </div>
                        </FlexView>
                    </div>
                    <div style={{ marginTop: "3rem" }}>
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={localeObj.value} type="tel"
                                onChange={this.handleChange}
                                InputProps={{
                                    startAdornment: (this.state.displayValue === "") ? '' : <InputAdornment className="body2 highEmphasis" position="start"><div className="headline4 highEmphasis">R$</div></InputAdornment>,
                                    classes: { underline: classes.underline },
                                    className: this.state.field === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                value={this.state.displayValue}
                                InputLabelProps={this.state.value === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                        </MuiThemeProvider>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", margin: "0.5rem 1.5rem", display: "inline-flex" }}>
                            {localeObj.avai_acc_balance + "R$ "}
                            {(this.state.balance === "" ?
                                <span style={{ marginLeft: "0.5rem" }}>
                                    <section>
                                        <div className="shimmer-bar-5 shimming"></div>
                                    </section>
                                </span>
                                : GeneralUtilities.currencyFromDecimals(this.state.balance))}
                        </div>
                        <div className="body2 accent" style={{ textAlign: "left", margin: "1rem 1.5rem" }} onClick={() => this.seeDetails()}>
                            {localeObj.see_invoice_details + ">"}
                        </div>
                    </div>
                    <div style={{...fieldOpen, textAlign: "center"}}>
                        <div className="body2 errorRed" style={{ display: this.state.minSet ? "block" : "none", margin: "1rem 1.5rem", textAlign: "center" }}>
                            {this.state.minMessage}
                        </div>
                        <PrimaryButtonComponent btn_text={localeObj.pay} onCheck={this.confirm} />
                        {/* <SecondaryButtonComponent btn_text={localeObj.invoice_installmemts} onCheck={this.installment} /> */}
                    </div>
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

InvoiceInput.propTypes = {
    componentName: PropTypes.string,
    setTransactionInfo: PropTypes.func,
    requiredInfo: PropTypes.shape({
        amount: PropTypes.string,
        decimal: PropTypes.string,
    }),
    amountLeftToPay: PropTypes.number,
    invoiceValue: PropTypes.number,
    minLimit: PropTypes.number,
    seeDetails: PropTypes.func,
    payInInstallments: PropTypes.func,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(InvoiceInput);