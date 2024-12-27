import React from "react";
import PropTypes from "prop-types";

import PageState from "../../../Services/PageState";
import ColorPicker from "../../../Services/ColorPicker";
import MetricsService from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import GeneralUtilities from "../../../Services/GeneralUtilities";

import "../../../styles/main.css";
import "../../../styles/lazyLoad.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";
import InputThemes from "../../../Themes/inputThemes";

import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import List from '@material-ui/core/List';
import MuiAlert from '@material-ui/lab/Alert';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import customError from "../../../images/SpotIllustrations/Timer.png";
import error from "../../../images/SpotIllustrations/Alert.png";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";

import androidApiCallsService from "../../../Services/androidApiCallsService";
import constantObjects from "../../../Services/Constants";
import PageNames from "../../../Services/PageNames";

const theme1 = InputThemes.SearchInputTheme;
const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

class FGTSAnticipateError extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: "",
            message: "",
            showDetails: false,
            snackBarOpen: false,
            header1: "",
            footer1: "",
            footer2: "",
            footer3: "",
            footer4: "",
            buttonText: "Open FGTS App"
        };
        this.styles = {
            imgStyleMore: {
                borderRadius: "50%",
                height: "3rem",
                width: "3rem",
                verticalAlign: "middle",
                justifySelf: 'center',
                alignSelf: 'center'
            },
            listStyleSelect: {
                margin: "1rem 1.5rem",
                display: "flex",
                alignItems: 'center',
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        
    }

    componentDidMount() {
        let componentPageName = "FGTS ANTICIPATION ERROR DETAILS";
        if(this.props && this.props.anticipatationNextStage === "failed_to_contact_caixa"){
            componentPageName = PageNames.FgtsAnticipate["failed_to_contact_caixa"]
        }else if(this.props && this.props.anticipatationNextStage === "no_sufficient_balance"){
            componentPageName = PageNames.FgtsAnticipate["no_sufficient_balance"]
        }else if(this.props && this.props.anticipatationNextStage === "arbi_not_registered"){
            componentPageName = PageNames.FgtsAnticipate["arbi_not_registered"]
        }else if(this.props && this.props.anticipatationNextStage === "anniversary_too_close"){
            componentPageName = PageNames.FgtsAnticipate["anniversary_too_close"]
        }else {
            componentPageName = "FGTS ANTICIPATION ERROR DETAILS";
        }
        this.componentName = componentPageName;
        MetricsService.onPageTransitionStart(this.componentName);
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
        MetricsService.onPageTransitionStop(this.componentName);
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false });
    }

    goToFgtsPlayStoreApk = () => {
        this.props.onCancel();
        // this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
    }

    copyToClipboard = (header, details, numeric) => {
        androidApiCallsService.copyToClipBoard(details);
        this.setState({
            snackBarOpen: true,
            message: androidApiCallsService.getLocale() === "en_US" ?
                GeneralUtilities.formattedString(localeObj.copied, [header]) :
                GeneralUtilities.formattedString(localeObj.copied, [numeric, header])
        })
    }

    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const Details = [
            {
                "id": 1,
                "header": localeObj.fgts_agency,
                "details": ImportantDetails.agencyNumber,
                "numeric": localeObj.num_prefix
            },
            {
                "id": 2,
                "header": localeObj.fgts_account,
                "details": ImportantDetails.accountNumber.slice(0, -2),
                "numeric": ""
            },
            {
                "id": 3,
                "header": localeObj.fgts_digit,
                "details": ImportantDetails.accountNumber.charAt(ImportantDetails.accountNumber.length - 1),
                "numeric": ""
            }
        ]

        return (
            <div>
                <div className="scroll" style={{ height: `${screenHeight * 0.8}px`, overflowY: "auto", overflowX: "hidden" }}>
                    {this.props.anticipatationNextStage != "failed_to_contact_caixa" && 
                     this.props.anticipatationNextStage != "anniversary_too_close" &&
                     this.props.anticipatationNextStage != "no_sufficient_balance" &&
                        <div>
                            <div style={{ textAlign: "center" }}>
                                <span>
                                    <img style={{ width: `${screenWidth * 0.7}px`, marginTop: "2.5rem" }} src={customError} alt="" />
                                </span>
                            </div>
                            <div className="headline5 highEmphasis" style={{ display: 'block', marginTop: '2.25rem', textAlign: "center" }}>
                                <span style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    {localeObj.fgts_req_failed_header}
                                </span>
                            </div>
                            <div className="body2 highEmphasis" style={{ width: `${screenWidth * 0.9}px`, display: 'block', margin: '1rem', textAlign: "center" }}>
                                <span style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    {localeObj.fgts_req_failed_desc}
                                </span>
                            </div>
                        </div>
                    }
                    {this.props.anticipatationNextStage === "failed_to_contact_caixa" &&
                        <div>
                            <div style={{ textAlign: "center" }}>
                                <span>
                                    <img style={{ width: `${screenWidth * 0.7}px`, marginTop: "2.5rem" }} src={customError} alt="" />
                                </span>
                            </div>
                            <div className="headline5 highEmphasis" style={{ display: 'block', marginTop: '2.25rem', textAlign: "center" }}>
                                <span style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    {localeObj.fgts_failed_to_contact_caixa_header}
                                </span>
                            </div>
                            <div className="body2 highEmphasis" style={{ width: `${screenWidth * 0.9}px`, display: 'block', margin: '1rem', textAlign: "center" }}>
                                <span style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    {localeObj.fgts_failed_to_contact_caixa_desc}
                                </span>
                            </div>
                        </div>
                    }
                    {this.props.anticipatationNextStage === "anniversary_too_close" &&
                        <div>
                            <div style={{ textAlign: "center" }}>
                                <span>
                                    <img style={{ width: `${screenWidth * 0.7}px`, marginTop: "2.5rem" }} src={customError} alt="" />
                                </span>
                            </div>
                            <div className="headline5 highEmphasis" style={{ display: 'block', marginTop: '2.25rem', textAlign: "center" }}>
                                <span style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    {localeObj.fgts_anniversary_too_close_header}
                                </span>
                            </div>
                            <div className="body2 highEmphasis" style={{ width: `${screenWidth * 0.9}px`, display: 'block', margin: '1rem', textAlign: "center" }}>
                                <span style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    {localeObj.fgts_anniversary_too_close_desc}
                                </span>
                            </div>
                        </div>
                    }
                    {this.props.anticipatationNextStage === "no_sufficient_balance" &&
                        <div>
                            <div style={{ textAlign: "center" }}>
                                <span>
                                    <img style={{ width: `${screenWidth * 0.7}px`, marginTop: "2.5rem" }} src={error} alt="" />
                                </span>
                            </div>
                            <div className="headline5 highEmphasis" style={{ display: 'block', marginTop: '2.25rem', textAlign: "center" }}>
                                <span style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    {localeObj.fgts_no_balance_header}
                                </span>
                            </div>
                            <div className="body2 highEmphasis" style={{ width: `${screenWidth * 0.9}px`, display: 'block', margin: '1rem', textAlign: "center" }}>
                                <span style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    {localeObj.fgts_no_balance_desc}
                                </span>
                            </div>
                        </div>
                    }
                </div>
                <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                    <PrimaryButtonComponent btn_text={localeObj.back_home} onCheck={() => this.goToFgtsPlayStoreApk()} />
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={() => this.closeSnackBar()}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

FGTSAnticipateError.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    anticipatationNextStage: PropTypes.string,
    isArbiError: PropTypes.bool,
    onCancel: PropTypes.func,
};

export default withStyles()(FGTSAnticipateError);