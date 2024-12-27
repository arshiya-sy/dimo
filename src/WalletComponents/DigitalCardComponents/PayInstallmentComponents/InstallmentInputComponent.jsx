import React from "react";
import FlexView from "react-flexview";
import moment from "moment";
import localeService from "../../../Services/localeListService";
import utilities from "../../../Services/NewUtilities";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from '../../../Services/ArbiErrorResponsehandler';
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
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import InputThemes from "../../../Themes/inputThemes";
import constantObjects from "../../../Services/Constants";

import PropTypes from 'prop-types';

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.AmountTheme;
const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};

class InstallmentInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            amount: "",
            displayValue: "",
            message: "",
            snackBarOpen: false,
            minSet: false,
            leftToPay: false,
            processing: false
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

    confirm = () => {
        this.setState({ minSet: false });
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
            if (intAmount < this.props.minimumDownPayment) {
                this.setState({
                    minSet: true,
                    minMessage: GeneralUtilities.formattedString(localeObj.invoice_min_val, [GeneralUtilities.getFormattedAmount(this.props.minimumDownPayment)])
                })
                return;
            }
            else if (intAmount > this.props.amountLeftToPay) {
                this.setState({
                    minSet: true,
                    minMessage: GeneralUtilities.formattedString(localeObj.invoice_max_val, [GeneralUtilities.getFormattedAmount(this.props.amountLeftToPay)])
                })
                return;
            } else {
                let jsonObject = {
                    "amount": amount,
                    "decimal": decimal,
                    "invoiceId": this.props.invoiceId,
                    "installments": 6,
                    "value": parseFloat(amount + "." + decimal)
                }
                this.showProgressDialog();
                ArbiApiService.simulatePaymentInstallments(jsonObject).then(response => {
                    this.hideProgressDialog();
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processSimulatePaymentInstallments(response.result);
                        if (processorResponse.success) {
                            const jsonObject = {
                                "amount": amount,
                                "decimal": decimal,
                                "siumulationId": processorResponse.siumulationId,
                                "expiryDate": moment(processorResponse.expiryDate).format("DD/MM/YYYY"),
                                "intrestRate": processorResponse.intrestRate,
                                "invoiceOriginalValue": processorResponse.invoiceOriginalValue,
                                "downPaymentValue": processorResponse.downPaymentValue,
                                "numberOfInstallments": processorResponse.numberOfInstallments,
                                "installmentValue": processorResponse.installmentValue,
                                "toBePaid": processorResponse.toBePaid,
                                "intrestTotal": processorResponse.intrestTotal,
                                "invoiceList": processorResponse.invoiceList,
                                "invoiceListLength": processorResponse.invoiceListLength
                            }
                            MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                            this.props.setTransactionInfo(jsonObject);
                        } else {
                            let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(processorResponse);
                            this.props.setTransactionInfo(errorJson);
                        }
                    } else {
                        let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                        this.props.setTransactionInfo(errorJson);
                    }
                });

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
    }

    seeDetails = () => {
        this.props.seeDetails();
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const fielOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle;
        return (
            <div style={{ overflow: "hidden" }}>
                {!this.state.processing && <div>
                    <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" }}>
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.down_payment_header}
                                </div>
                                <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                    {localeObj.original_invoice + "R$ " + GeneralUtilities.currencyFromDecimals(this.props.amountLeftToPay)}
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
                            <div className="body2 highEmphasis" style={{ textAlign: "left", margin: "1rem 1.5rem", display: "inline-flex" }}>
                                {localeObj.down_payment_desc + GeneralUtilities.currencyFromDecimals(this.props.minimumDownPayment)}
                            </div>
                            <div className="body2 accent" style={{ textAlign: "left", margin: "1rem 1.5rem" }} onClick={() => this.seeDetails()}>
                                {localeObj.see_invoice_details + ">"}
                            </div>
                        </div>
                        <div style={{...fielOpen, textAlign: "center"}}>
                            <PrimaryButtonComponent btn_text={localeObj.simulate_installments} onCheck={this.confirm} />
                        </div>
                    </div>
                    <MuiThemeProvider theme={theme2}>
                        <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                        </Snackbar>
                    </MuiThemeProvider>
                </div>}
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
            </div>
        )
    }
}

InstallmentInput.propTypes = {
    classes: PropTypes.object,
    componentName: PropTypes.string,
    requiredInfo: PropTypes.shape({
        amount: PropTypes.string,
        decimal: PropTypes.string
    }),
    minimumDownPayment: PropTypes.number.isRequired,
    amountLeftToPay: PropTypes.number.isRequired,
    invoiceId: PropTypes.string.isRequired,
    seeDetails: PropTypes.func.isRequired,
    setTransactionInfo: PropTypes.func.isRequired
};
export default withStyles(styles)(InstallmentInput);