import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import localeService from "../../../Services/localeListService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
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
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import InputThemes from "../../../Themes/inputThemes";
import constantObjects from "../../../Services/Constants";
import PageNames from "../../../Services/PageNames";

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.AmountTheme;
const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};
const PageNameJSON = PageNames.CreditCardComponents;
class CreditInvestmentAmountComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: this.props.investmentAmount || "",
            displayValue: this.props.investmentAmount || "",
            balance: this.props.balance || "0",
            message: "",
            snackBarOpen: false,
            minSet: false,
            prevComp: this.props.previousComponent || ""
        };
        this.confirm = this.confirm.bind(this);
        this.handleChange = this.handleChange.bind(this);

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNameJSON['credit_invest_amount']
        }
        MetricsService.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }

        window.onBackPressed = () => {
            this.props.onBackHome();
        }
    }

    SendPixToMyAccount = () => {
        this.props.pixAmountPage();
        return;
    }

    confirm = () => {
        if (this.state.amount.toString().replace(/0/g, "").length === 0) {
            this.setState({
                snackBarOpen: true,
                message: localeObj.pix_enter_valid_amount,
                minSet: false
            });
            return;
        } else {
            let amount = this.state.amount;
            let decimal = "00";
            let intAmount = parseInt(amount);
            if (intAmount < this.props.minAmount) {
                this.setState({
                    minSet: true,
                    minMessage: GeneralUtilities.formattedString(localeObj.credit_invest_min_val, [GeneralUtilities.getFormattedAmount(this.props.minAmount)])
                })
                return;
            }
            else if (intAmount > this.props.maxAmount) {
                this.setState({
                    minSet: true,
                    minMessage: GeneralUtilities.formattedString(localeObj.credit_invest_max_val, [GeneralUtilities.getFormattedAmount(this.props.maxAmount)])
                })
                return;
            } else if (this.state.balance === -1) {
                this.setState({
                    snackBarOpen: true,
                    minSet: false,
                    message: localeObj.balance_unverified
                })
                return;
            } else if (intAmount > this.state.balance) {
                this.setState({
                    minSet: true,
                    minMessage: localeObj.insufficient_balance
                })
                return;
            } else {
                this.props.setInvestMentAmount(amount, decimal, this.state.displayValue);
                MetricsService.onPageTransitionStop(this.componentName, PageState.close);
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
                let displaySalary = GeneralUtilities.formatBalance(value);
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


    seeDetails = () => {
        this.props.onBackHome();
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
                                {localeObj.credit_invest_title}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                {GeneralUtilities.formattedString(localeObj.credit_invest_min_value, [GeneralUtilities.currencyFromDecimals(this.props.minAmount)])}
                            </div>
                        </FlexView>
                    </div>
                    <div style={{ marginTop: "3rem" }}>
                        <div>
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
                        </div>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", margin: "1rem 1.5rem", display: "inline-flex" }}>
                            {localeObj.credit_invest_available_acc_balance + " R$ "}
                            {GeneralUtilities.currencyFromDecimals(this.state.balance)}
                        </div>
                    </div>
                    <div style={{...fieldOpen, textAlign: "center"}}>
                        <div className="body2 errorRed" style={{ display: this.state.minSet ? "block" : "none", margin: "1rem 1.5rem", textAlign: "center" }}>
                            {this.state.minMessage}
                        </div>
                        <PrimaryButtonComponent btn_text={localeObj.motopay_continue} onCheck={this.confirm} />
                        <SecondaryButtonComponent btn_text={localeObj.credit_invest_secondary_btn} onCheck={this.SendPixToMyAccount} />
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

CreditInvestmentAmountComp.propTypes = {
    classes: PropTypes.object.isRequired,
    investmentAmount: PropTypes.string,
    balance: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    previousComponent: PropTypes.string,
    componentName: PropTypes.string,
    onBackHome: PropTypes.func,
    pixAmountPage: PropTypes.func,
    minAmount: PropTypes.number,
    maxAmount: PropTypes.number,
    setInvestMentAmount: PropTypes.func,
    payInInstallments: PropTypes.func
};

export default withStyles(styles)(CreditInvestmentAmountComp);
