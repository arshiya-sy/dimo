import React from "react";
import FlexView from "react-flexview";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import PageState from "../../../Services/PageState";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";
import MetricServices from "../../../Services/MetricsService";
import ImportantDetails from '../../NewLaunchComponents/ImportantDetails';

import { createMuiTheme, MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import NextIcon from '@material-ui/icons/ArrowForwardIos';
import GeneralUtilities from "../../../Services/GeneralUtilities";
import moment from "moment";
import PropTypes from 'prop-types';

const theme1 = createMuiTheme({
    overrides: {
        MuiPaper: {
            rounded: {
                borderRadius: "0.75rem",
                marginBottom: "1rem",
                padding: "0.75rem"
            }
        }
    }
});

const ColoredTextButton = withStyles({
    root: {
        color: ColorPicker.duskHorizon,
        textTransform: "none"
    },
})((props) => <Button color="default" {...props} />);

const styles = InputThemes.singleInputStyle;
var localeObj = {};

class InvoicePaymentMethod extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            details: props.details,
            full: "",
            decimal: "",
            minSet: false
        };

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "INVOICE PAYMENT METHODS";
        }
        MetricServices.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        const tz = androidApiCalls.getLocale() === "en_US" ? "en" : "pt-br";
        moment.locale(tz);
        document.addEventListener("visibilitychange", this.visibilityChange);
        if (!!this.props.amountLeftToPay && !!this.props.invoiceValue) {
            if (this.props.amountLeftToPay !== this.props.invoiceValue) {
                this.setState({ leftToPay: true })
            } else {
                this.setState({ leftToPay: false })
            }
        }
        if (!!this.props.requiredInfo && !!this.props.requiredInfo.decimal && !!this.props.requiredInfo.amount) {
            this.setState({
                full: this.props.requiredInfo.amount,
                decimal: this.props.requiredInfo.decimal
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
    }

    action = (option) => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        if (ImportantDetails.walletBalance === "" && ImportantDetails.walletDecimal === "") {
            this.props.action(option);
        } else {
            if (parseFloat(this.state.full + "." + this.state.decimal)
                <= parseFloat(ImportantDetails.walletBalance + "." + ImportantDetails.walletDecimal)) {
                this.props.action(option);
            } else {
                this.setState({
                    minSet : true
                });
            }
        }
    }

    changeEditStatus = () => {
        this.setState({
            minSet : false
        });
        this.props.changeEditStatus();
    }

    render() {
        const { classes } = this.props;
        const screenScrollHeight = window.screen.height * 0.85;

        let menuOptions = [];
        menuOptions.push(localeObj.pay_with_balance);
        //menuOptions.push(localeObj.pay_with_boleto);
        //menuOptions.push(localeObj.pay_with_pix);

        const getDate = () => {
            // const date = new Date();
            // const day = date.getDate();
            // const month = date.toLocaleString('default', { month: 'long' });
            // const year = date.getFullYear();
            // return day + ", " + month + " " + year;.
            return moment().format('DD MMMM YYYY');
        }

        return (
            <div style={{ height: `${screenScrollHeight}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={InputThemes.initialMarginStyle}>
                    <FlexView column>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.total_payment_amount}
                        </div>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                            {!this.state.leftToPay && localeObj.invoice_value + "R$ " + GeneralUtilities.currencyFromDecimals(this.props.invoiceValue)}
                            {this.state.leftToPay && localeObj.amount_left_Pay + "R$ " + GeneralUtilities.currencyFromDecimals(this.props.amountLeftToPay)}
                        </div>
                        <FlexView style={{ textAlign: "left", marginTop: "2rem" }}>
                            <div className="pixCurrencyStyle headline5 highEmphasis" style={{ marginRight: "0.375rem" }}>
                                {"R$ "}
                                <span>
                                    <span className="headline2 balanceStyle highEmphasis">{this.state.full}</span>
                                    <span className="subScript headline5 highEmphasis">{"," + this.state.decimal}</span>
                                </span>
                            </div>
                            <div className="pixEditButton body2 duskHorizon" style={{ top: "0.375rem" }}>
                                <ColoredTextButton onClick={this.changeEditStatus} >{localeObj.pix_edit}</ColoredTextButton>
                            </div>
                        </FlexView>
                    </FlexView>
                    <div style={{ margin: "1.5rem 0" }}>
                        <MuiThemeProvider theme={theme1}>
                            <Paper className={classes.root} elevation="0"
                                style={{ backgroundColor: ColorPicker.newProgressBar }}>
                                <FlexView>
                                    <FlexView hAlignContent="left" style={{ marginLeft: "1rem", marginRight: "auto" }}>
                                        <FlexView column>
                                            <div className="Caption mediumEmphasis">{localeObj.payment_date}</div>
                                            <div className="body2 highEmphasis" style={{ marginTop: "0.3rem" }}>{getDate()}</div>
                                        </FlexView>
                                    </FlexView>
                                    <FlexView hAlignContent="right" style={{ alignItems: "center" }}>
                                        <NextIcon style={{ fill: ColorPicker.accent, width: "0.8rem", position: "relative", marginRight: "0", marginLeft: 'auto', float: "right" }} />
                                    </FlexView>
                                </FlexView>
                            </Paper>
                        </MuiThemeProvider>
                    </div>
                </div>
                <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <div className="body2 errorRed" style={{ display: this.state.minSet ? "block" : "none", margin: "1rem 1.5rem", textAlign: "center" }}>
                        {localeObj.insufficient_balance}
                    </div>
                    <div style={{ margin: "1.5rem" }}>
                        {menuOptions.map((opt, key) => (
                            <MuiThemeProvider key={opt} theme={theme1}>
                                <Paper className={classes.root} id={key} elevation="0"
                                    onClick={() => { this.action(opt) }} style={{ backgroundColor: ColorPicker.newProgressBar }}>
                                    <FlexView style={{ alignItems: "center" }}>
                                        <FlexView hAlignContent="center" className="body2 highEmphasis" style={{ marginLeft: 'auto', marginRight: "auto", float: "right" }}>
                                            {opt}
                                        </FlexView>
                                        <FlexView hAlignContent="right">
                                            <NextIcon style={{ fill: ColorPicker.accent, width: "0.8rem", position: "relative", marginRight: "0", marginLeft: 'auto', float: "right" }} />
                                        </FlexView>
                                    </FlexView>
                                </Paper>
                            </MuiThemeProvider>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
}

InvoicePaymentMethod.propTypes = {
    details: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    action: PropTypes.func.isRequired,
    changeEditStatus: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    amountLeftToPay: PropTypes.number,
    invoiceValue: PropTypes.number,
    requiredInfo: PropTypes.shape({
      decimal: PropTypes.string,
      amount: PropTypes.string
    })
  };
  
export default withStyles(styles)(InvoicePaymentMethod);