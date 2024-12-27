import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/new_pix_style.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Skeleton from '@material-ui/lab/Skeleton';

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";
import PageState from "../../Services/PageState";
import MetricServices from "../../Services/MetricsService";
import utilities from "../../Services/NewUtilities";

import TextField from "@material-ui/core/TextField";
import { InputAdornment } from '@material-ui/core';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import GeneralUtilities from "../../Services/GeneralUtilities";
import OutlineButtonComponent from "../CommonUxComponents/OutlineButton";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.AmountTheme;
const styles = InputThemes.singleInputStyle;

const screenHeight = window.innerHeight;
var localeObj = {};
class AtmCardComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: false,
            amount: "",
            displayValue: "",
            currentBalance: "",
            quickValuesAmount: ["20,00", "40,00", "50,00", "100,00"],
            quickValuesDisplay: ["R$ 20,00", "R$ 40,00", "R$ 50,00", "R$ 100,00"],
            snackBarOpen: false,
            setThroughBtn: false
        };
        this.styles = {
            lazyLoading: {
                verticalAlign: "top",
                position: "relative",
                top: "-0.5rem",
                marginLeft: "2%",
                backgroundColor: ColorPicker.lazyLoadColor,
                borderRadius: "0.75rem"
            },
            item: {
                margin: "0 1.5rem",
                marginTop: "2.5rem"
            },
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "ATM CARD COMPONENT"
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        this.setUserBalance();
        this.setDisplayField();
        window.onBackPressed = () => {
            this.props.onBack();
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

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        window.removeEventListener("resize", this.checkIfInputIsActive);
    }


    handleLogging = (logs) => {
        Log.sDebug(logs, "AtmCardComponent");
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

    setUserBalance = () => {
        if (ImportantDetails.walletBalance === "" && ImportantDetails.walletDecimal === "") {
            arbiApiService.getUserBalance(this.componentName)
                .then(response => {
                    if (response.success) {
                        let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                        if (processorResponse.success) {
                            this.setState({ currentBalance: processorResponse.balance });
                            GeneralUtilities.setBalanceToCache(processorResponse.balance);
                        }
                    } else {
                        let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                        this.props.setTransactionInfo(errorJson);
                    }
                });
        } else {
            this.setState({ currentBalance: ImportantDetails.walletBalance + "." + ImportantDetails.walletDecimal })
        }
    }

    validAmount = () => {
        if (this.state.currentBalance === "") {
            return true;
        }
        let amount = "";
        let decimal = "";
        if (this.state.amount.length > 2) {
            amount = this.state.amount.substring(0, this.state.amount.length - 2);
            decimal = this.state.amount.substring(this.state.amount.length - 2, this.state.amount.length);
        } else {
            amount = this.state.amount;
        }
        return amount ? parseFloat(amount + "." + decimal) <= parseFloat(this.state.currentBalance) : true;
    }

    handleClick = () => {
        this.setState({
            setThroughBtn: false
        })
    }

    handleChange = (event) => {
        if (event.target.value.length !== 0) {
            const re = /^[0-9]+$/;
            let value = event.target.value.replace(/[^0-9]/g, "");
            if (re.test(value)) {
                let displaySalary = utilities.parseSalary(event.target.value);
                this.setState({
                    displayValue: displaySalary,
                    amount: displaySalary.replace(/[^0-9]/g, '')
                })
            }
        }
    }

    check = () => {
        this.setState({
            setThroughBtn: true
        })
    }

    onSelectKey = (index) => {
        if (this.state.quickValuesAmount[index] !== "0") {
            const re = /^[0-9]+$/;
            let value = this.state.quickValuesAmount[index].replace(/[^0-9]/g, "");
            if (re.test(value)) {
                let displaySalary = utilities.parseSalary(this.state.quickValuesAmount[index]);
                this.setState({
                    displayValue: displaySalary,
                    amount: displaySalary.replace(/[^0-9]/g, '')
                })
            }
        }
    }

    sendField = () => {
        this.handleLogging("Clicked Next with amount " + this.state.amount);
        if (this.state.amount.toString().replace(/0/g, "").length === 0) {
            this.openSnackBar(localeObj.atm_range);
            return;
        } else {
            let decimal = "00";
            let amount = "";
            if (this.state.amount.length > 2) {
                amount = this.state.amount.substring(0, this.state.amount.length - 2);
                decimal = this.state.amount.substring(this.state.amount.length - 2, this.state.amount.length);
            } else {
                amount = this.state.amount;
            }
            if (parseFloat(amount + "." + decimal) <= parseFloat(this.state.currentBalance)) {
                let totalAmount = parseFloat(amount + "." + decimal);
                if (this.checkAmountValidity(totalAmount)) {
                    this.props.onSetAmount(parseFloat(amount + "." + decimal));
                    Log.debug("Valid amount sendField " + parseFloat(amount + "." + decimal));
                } else {
                    this.openSnackBar(localeObj.pix_enter_valid_amount);
                    return;
                }
            } else {
                this.openSnackBar(localeObj.insufficient_balance);
                return;
            }
        }
    }

    checkAmountValidity = (totalAmount) => {
        if (totalAmount === 0)
            return false;
        if (totalAmount === 10)
            return false;
        if (totalAmount === 30)
            return false;
        if (totalAmount % 10 !== 0)
            return false;
        if (totalAmount > 1000)
            return false;
        return true;
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle;
        return (
            <div className="scroll" style={{
                height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`,
                overflowY: "auto", overflowX: "hidden"
            }}>
                <div style={InputThemes.initialMarginStyle}>
                    <FlexView column>
                        <div className="headline5 highEmphasis">
                            {localeObj.atm_header}
                        </div>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                            {localeObj.atm_range}
                        </div>
                    </FlexView>
                </div>
                <div style={{ marginTop: "3rem" }}>
                    <MuiThemeProvider theme={theme1}>
                        <TextField label={localeObj.value} type="tel"
                            error={!this.validAmount()}
                            onChange={this.handleChange} onClick={this.handleClick}
                            InputProps={{
                                startAdornment: <InputAdornment className="body2 highEmphasis" position="start">R$</InputAdornment>,
                                classes: { underline: this.state.setThroughBtn ? classes.finalUnderline : classes.underline },
                                className: this.state.displayValue === "" ? classes.input : classes.finalInput
                            }}
                            value={this.state.displayValue}
                            InputLabelProps={{ className: classes.finalStyle }}
                            FormHelperTextProps={{ className: classes.helpertextstyle }}
                        />
                    </MuiThemeProvider>
                </div>
                <div style={{ margin: "1rem 1.5rem", display: "flex" }}>
                    <span className="body2 highEmphasis">{localeObj.pix_balance}</span>
                    <span className="body2 highEmphasis" style={{ color: this.validAmount() ? ColorPicker.darkHighEmphasis : ColorPicker.errorRed }}>&nbsp;{"R$"}&nbsp;</span>
                    {this.state.currentBalance === "" ? <Skeleton width="20%" height="2em" variant="text" style={this.styles.lazyLoading}></Skeleton>
                        : <span className="body2 highEmphasis" style={{ color: this.validAmount() ? ColorPicker.darkHighEmphasis : ColorPicker.errorRed }}>
                            {GeneralUtilities.currencyFromDecimals(this.state.currentBalance)}</span>}
                </div>
                <div style={this.styles.item}>
                    <span className="subtitle4 highEmphasis">
                        {localeObj.quick_values}
                    </span>
                </div>
                <div style={{ margin: "1rem 1.5rem", display: "flex", justifyContent: "center" }}>
                    <Grid container justify="space-between">
                        {
                            this.state.quickValuesDisplay.map((item, index) => (
                                <Grid item key={index} xs={6} style={{ display: "flex", justifyContent: (index === 0 || index === 2) ? "flex-start" : "flex-end"}} onClick={() => this.onSelectKey(index)}>
                                    <OutlineButtonComponent btn_text={item} onCheck={this.check} />
                                </Grid>
                            ))
                        }
                    </Grid>
                </div>
                <div style={{...fieldOpen, textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.sendField} />
                    <div className="body2" style={{ color: ColorPicker.darkMediumEmphasis, marginTop: "1.25rem" }}>
                        {localeObj.get_help_chatbot}
                        <span className="body2" style={{ color: ColorPicker.accent, textDecoration: "underline" }} onClick={this.props.goToChatbot}>
                            {localeObj.chatbot_help}
                        </span>
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

AtmCardComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    onBack: PropTypes.func,
    requiredInfo: PropTypes.shape({
        amount: PropTypes.string,
        decimal: PropTypes.string
    }),
    setTransactionInfo: PropTypes.func,
    onSetAmount: PropTypes.func,
    goToChatbot: PropTypes.func
};

export default withStyles(styles)(AtmCardComponent);