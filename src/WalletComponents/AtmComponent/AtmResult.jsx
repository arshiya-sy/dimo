import React from 'react';
import PropTypes from "prop-types";

import Log from '../../Services/Log';
import PageState from "../../Services/PageState";
import constantObjects from '../../Services/Constants';
import MetricsService from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from '../../Themes/inputThemes';

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider } from "@material-ui/core/styles";

import success from "../../images/SpotIllustrations/Checkmark.png";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from '../CommonUxComponents/SecondaryButtonComponent';

const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

export default class AtmResultComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false
        }
        this.styles = {
            textStyle: {
                margin: "0 2rem",
                textAlign: "center"
            },
            subTextStyle: {
                margin: "1rem 3rem",
                textAlign: "center"
            }
        }

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "ATM RECEIPT PAGE"
        }
        MetricsService.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.props.onBack();
        }
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

    handleNextTransition = param => {
        if (param === "transactions") {
            this.handleLogging("Clicked on other transactions");
            MetricsService.onPageTransitionStop(this.componentName, PageState.close);
            this.props.OtherTransaction();
        } else if (param === "menu") {
            this.handleLogging("Clicked on main menu");
            this.props.onBack();
        }
    }

    handleLogging = (logs) => {
        Log.sDebug(logs, "AtmResult");
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            snackBarMessage: message
        })
    }

    onBack = () => {
        this.props.onBack();
    }

    render() {
        const finalHeight = window.screen.height;
        const screenWidth = window.screen.width;
        return (
            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: finalHeight }}>
                <div className="scroll" style={{ height: `${finalHeight * 0.65}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "center" }}>
                        <span>
                            <img style={{ width: `${screenWidth * 0.7}px`, marginTop: "5.5rem" }} src={success} alt="" />
                        </span>
                    </div>
                    <div style={this.styles.textStyle}>
                        <span className="headline5 highEmphasis">
                            {localeObj.atm_success_title}
                        </span>
                    </div>
                    <div style={this.styles.subTextStyle}>
                        <span className="body2 highEmphasis">{localeObj.atm_success_text}</span>
                    </div>
                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                        <PrimaryButtonComponent btn_text={localeObj.other_transactions} onCheck={this.handleNextTransition("transactions")} />
                        <SecondaryButtonComponent btn_text={localeObj.back_home} onCheck={this.handleNextTransition("menu")} />
                    </div>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackBarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

AtmResultComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    onBack: PropTypes.func,
    OtherTransaction: PropTypes.func
};
