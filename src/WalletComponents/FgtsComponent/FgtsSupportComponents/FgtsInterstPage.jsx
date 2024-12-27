import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import PageState from "../../../Services/PageState";
import ColorPicker from "../../../Services/ColorPicker";
import NewUtilities from "../../../Services/NewUtilities";
import constantObjects from "../../../Services/Constants";
import MetricsService from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import androidApiCalls from "../../../Services/androidApiCallsService";

import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import MuiAlert from '@material-ui/lab/Alert';
import EditIcon from '@material-ui/icons/Edit';
import Snackbar from '@material-ui/core/Snackbar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import "../../../styles/main.css";
import "../../../styles/lazyLoad.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";
import InputThemes from "../../../Themes/inputThemes";

import FgtsInstallmentTable from "./FgtsInstallmentTable";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;

var localeObj = {};

const AwaitButton = withStyles(() => ({
    root: {
        backgroundColor: ColorPicker.newProgressBar,
        borderRadius: "0.75rem",
        padding: "0.5rem",
        textTransform: 'none',
        textAlign: 'center',
        boxShadow: "none",
        justifyContent: "center",
        width: "100%",
        bottomSheetOpen: false,
        '&:disabled': {
            backgroundColor: ColorPicker.newProgressBar,
        },
    },
}))(Button);

const ColoredTextButton = withStyles({
    root: {
        color: ColorPicker.white,
        textTransform: "none"
    },
})((props) => <Button color="default" {...props} />);

class FGTSInterest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: "",
            message: "",
            showDetails: false,
            snackBarOpen: false,
        };

        this.componentName = GeneralUtilities.emptyValueCheck(this.props.componentName) ? "Installment" : this.props.componentName
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        window.onBackPressed = () => {
            this.onBackHome();
        }
        document.addEventListener("visibilitychange", this.visibilityChange);
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
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false });
    }

    onBackHome = () => {
        if (this.state.bottomSheetOpen) {
            this.setState({ bottomSheetOpen: false });
        } else {
            this.props.onBackHome();
        }
    }

    changeShowStatus = () => {
        let event = {
            eventType: constantObjects.fgtsInstallmentTable,
            page_name: this.componentName,
        };
        MetricsService.reportActionMetrics(event, new Date().getTime());
        this.setState({
            showDetails: !this.state.showDetails
        })
    }

    checkHighAmountUsed = () => {
        if (parseFloat(this.props.value.amount + "." + this.props.value.decimal) < constantObjects.minFgtsValue) {
            this.setState({
                snackBarOpen: true,
                message: localeObj.fgts_anticipate_min_value_error_1
            });
        } else if (parseFloat(this.props.value.amount + "." + this.props.value.decimal) > constantObjects.maxFgtsBalance) {
            this.setState({
                snackBarOpen: true,
                message: localeObj.fgts_anticipate_max_value_error_1
            });
        } else {
            if (GeneralUtilities.formatBalance((this.props.value.amount).toString().replace('.', '')) != this.props.prevMaxValue.amount &&
                NewUtilities.formatDecimal(this.props.value.decimal) != this.props.prevMaxValue.decimal) {
                this.setState({
                    bottomSheetOpen: true
                });
            } else {
                this.setAction(false);
            }
        }
    }

    onPrimary = () => {
        this.setAction(true);
    }

    onSecondary = () => {
        this.setAction(false);
    }

    setAction = (highValue) => {
        MetricsService.onPageTransitionStop(this.componentName, PageState.stop);
        this.props.setTransactionInfo(highValue);
    }

    defineValue = () => {
        let event = {
            eventType: constantObjects.fgtsDefineOtherValue,
            page_name: this.componentName,
        };
        MetricsService.reportActionMetrics(event, new Date().getTime());
        MetricsService.onPageTransitionStop(this.componentName, PageState.stop);
        this.props.newValue();
    }

    render() {
        const { classes } = this.props;
        const screenHeight = window.screen.height;
        const scrollHeight = screenHeight > 780 ? screenHeight * 0.65 : screenHeight * 0.5;
        return (
            <div >
                <div style={{ display: "flex", flexDirection: "column", background: ColorPicker.newProgressBar }}>
                    <div style={{ textAlign: "center", margin: "1.5rem 10% 1rem 10%" }} className="body1 highEmphasis">
                        {this.props.header}
                    </div>
                    <span style={{ textAlign: "center" }}>
                        <AwaitButton onClick={this.defineValue}
                            endIcon={<EditIcon style={{ fill: ColorPicker.darkHighEmphasis }} />}>
                            <span className="headline5 highEmphasis" style={{ marginRight: "0.375rem" }}>{"R$ "}</span>
                            <span className="headline2 balanceStyle highEmphasis">{GeneralUtilities.formatBalance((this.props.value.amount).toString().replace('.', ''))}</span>
                            <span className="subScript headline5 highEmphasis">{"," + NewUtilities.formatDecimal(this.props.value.decimal)}</span>
                        </AwaitButton>
                    </span>
                    {this.props.editAnticipation &&
                        this.props.prevMaxValue.amount != 0 &&
                        <div style={{ margin: "1rem", textAlign: "center" }} className="subtitle6 mediumEmphasis">
                            <span>{localeObj.fgts_simulate_loan_header3}{this.props.prevMaxValue.amount}{"," + this.props.prevMaxValue.decimal}</span>
                        </div>}
                    <div style={{ margin: "1rem", textAlign: "center" }} className="subtitle6 mediumEmphasis">
                        <span>{localeObj.fgts_simulate_loan_header2}</span>
                    </div>
                </div>
                <div style={{ display: !this.state.processing ? "block" : "none", height: `${scrollHeight * 0.85}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <FlexView column style={{ marginLeft: "2rem", marginRight: "2rem", marginBottom: "1rem" }}>
                        {!this.state.showDetails &&
                            <div className="pixEditButton" style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", marginTop: "1.5rem" }}>
                                <ColoredTextButton className="Caption" onClick={this.changeShowStatus}
                                    endIcon={<ExpandMoreIcon style={{ marginLeft: "0.5rem", fill: ColorPicker.white }}></ExpandMoreIcon>}>
                                    {localeObj.fgts_see_details}
                                </ColoredTextButton>
                            </div>}
                        {this.state.showDetails &&
                            <div style={{ display: this.state.showDetails ? "block" : "none" }}>
                                <div className="pixEditButton" style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", marginTop: "1.5rem" }}>
                                    <ColoredTextButton className="Caption" onClick={this.changeShowStatus}
                                        endIcon={<ExpandLessIcon style={{ marginLeft: "0.5rem", fill: ColorPicker.white }}></ExpandLessIcon>}>
                                        {localeObj.fgts_hide_details}
                                    </ColoredTextButton>
                                </div>
                                <div className="body2 highEmphasis" style={{ textAlign: "center", margin: "1.5rem" }}>
                                    {localeObj.fgts_simulate_loan_footer}
                                </div>
                                <FgtsInstallmentTable
                                    installmentValues={this.props.valueComponent}
                                    totalReceivable={this.props.totalReceivable} />
                            </div>
                        }
                    </FlexView>
                </div>
                <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                    <PrimaryButtonComponent btn_text={localeObj.fgts_anticipate_primary} onCheck={() => this.checkHighAmountUsed()} />
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.bottomSheetOpen}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.fgts_higher_amount_header}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.fgts_higher_amount_footer}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.fgts_higher_amount_primary_btn} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.fgts_higher_amount_secondary_btn} onCheck={this.onSecondary} />
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

FGTSInterest.propTypes = {
    classes: PropTypes.object,
    valueComponent: PropTypes.array,
    simulate: PropTypes.bool,
    interestRate: PropTypes.string,
    value: PropTypes.object,
    header: PropTypes.string,
    totalReceivable: PropTypes.string,
    setTransactionInfo: PropTypes.func,
    newValue: PropTypes.func,
    componentName: PropTypes.string
};

export default withStyles(styles)(FGTSInterest);