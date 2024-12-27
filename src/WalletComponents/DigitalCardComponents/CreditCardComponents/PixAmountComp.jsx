import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import localeService from "../../../Services/localeListService";
import utilities from "../../../Services/NewUtilities";
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

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.AmountTheme;
const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};

class PixAmountComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: "",
            displayValue: "",
            balance: -1,
            message: "",
            snackBarOpen: false,
            sendFeature: false,
            bottomSheetOpen: false,
        };
        this.confirm = this.confirm.bind(this);
        this.handleChange = this.handleChange.bind(this);

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "PIX AMOUNT PAGE"
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
    }



    confirm = () => {
        if (this.state.amount.toString().replace(/0/g, "").length === 0) {
            this.setState({
                snackBarOpen: true,
                message: localeObj.pix_enter_valid_amount
            })
            return;
        } else {
            let amount = this.state.amount.substring(0, this.state.amount.length - 2);
            let decimal = this.state.amount.substring(this.state.amount.length - 2, this.state.amount.length);
            MetricsService.onPageTransitionStop(this.componentName, PageState.close);
            this.props.sendPixToMyAccount(amount, decimal, this.state.displayValue);

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

    onPressCancel = () => {
        this.setState({ bottomSheetOpen: false });
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
        const fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle;

        return (
            <div style={{ overflow: "hidden" }}>
                <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.credit_pix_title}
                            </div>
                        </FlexView>
                    </div>
                    <div style={{ marginTop: "3rem" }}>
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={localeObj.value} type="tel"
                                onChange={this.handleChange}
                                placeholder={""}
                                error={false}
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
                                helperText={""}
                            />
                        </MuiThemeProvider>
                        {/* <div className="body2 highEmphasis" style={{ textAlign: "left", margin: "1rem 1.5rem", display: "inline-flex" }}>
                            {localeObj.credit_pix_min_value + " R$ "}
                            { GeneralUtilities.currencyFromDecimals(this.props.minAmount)}
                        </div> */}
                    </div>
                    <div style={{...fieldOpen, textAlign: "center"}}>
                        <PrimaryButtonComponent btn_text={localeObj.credit_next} onCheck={this.confirm} />
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

PixAmountComp.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    sendPixToMyAccount: PropTypes.func,
    feature: PropTypes.string,
    requiredInfo: PropTypes.shape({
        amount: PropTypes.string,
        decimal: PropTypes.string
    })
};

export default withStyles(styles)(PixAmountComp);