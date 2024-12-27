import React from "react";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";

import { Divider } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent"
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import GeneralUtilities from "../../Services/GeneralUtilities";
import constantObjects from "../../Services/Constants";
import ClickWithTimeout from "../EngageCardComponent/ClickWithTimeOut";
import PropTypes from "prop-types";

const theme1 = InputThemes.SearchInputTheme;
const theme2 = InputThemes.snackBarTheme;
const TimeOutPrimaryButton = ClickWithTimeout(PrimaryButtonComponent);
var localeObj = {};

export default class TedDepositComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(PageNames.tedDepsitDetailsPage);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);

        window.onBackPressed = () => this.onBack();

        window.onContentShared = () => {
            ImportantDetails.shareEnabled = true;
        }

        window.onPauseCamera = () => {
            ImportantDetails.shareEnabled = false;
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.tedDepsitDetailsPage, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.tedDepsitDetailsPage);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    onBack = () => {
        MetricServices.onPageTransitionStop(PageNames.tedDepsitDetailsPage, PageState.back);

        this.props.history.replace({
            pathname: this.props?.location?.from !== PageNames.depositLandingPage ? "newWalletLaunch" : "/depositLandingComponent",
            transition: "right"
        });
    }

    share = () => {
        let accountDetails = localeObj.name + ": " + ImportantDetails.userName + "\n"
            + localeObj.cpf + ": " + GeneralUtilities.formatCPF(ImportantDetails.cpf) + "\n"
            + localeObj.bank + ": " + localeObj.moto_banking + "\n"
            + localeObj.agency + ": " + ImportantDetails.agencyNumber + "\n"
            + localeObj.acc_no + ": " + ImportantDetails.accountNumber;
        let isSupported = androidApiCalls.shareContent(null,
            localeObj.ted_share_message + "\n" + accountDetails, null);
        if (!isSupported) {
            GeneralUtilities.setShareSupport(isSupported);
        }
    }

    copyToClipboard = (header, details, numeric) => {
        androidApiCalls.copyToClipBoard(details);
        this.setState({
            snackBarOpen: true,
            message: androidApiCalls.getLocale() === "en_US" ?
                GeneralUtilities.formattedString(localeObj.copied, [header]) :
                GeneralUtilities.formattedString(localeObj.copied, [numeric, header])
        })
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

        const Details = [
            {
                "header": localeObj.agency,
                "details": ImportantDetails.agencyNumber,
                "numeric": localeObj.num_prefix
            },
            {
                "header": localeObj.acc_no,
                "details": ImportantDetails.accountNumber,
                "numeric": ""
            },
            {
                "header": localeObj.cpf,
                "details": GeneralUtilities.formatCPF(ImportantDetails.cpf),
                "numeric": localeObj.num_suffix
            },
            {
                "header": localeObj.bank,
                "details": localeObj.moto_banking,
                "numeric": localeObj.num_suffix
            },
        ]

        const finalHeight = window.screen.height;
        return (
             <div>
                <ButtonAppBar header={localeObj.deposit} onBack={this.onBack} action="none" />

                <div className="scroll" style={{ height: `${finalHeight - 240}px`, overflowY: "auto", overflowX: "hidden" }}>

                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.account_info}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                {localeObj.account_touch}
                            </div>
                        </FlexView>
                    </div>
                    <div style={InputThemes.initialMarginStyle}>
                        <MuiThemeProvider theme={theme1}>
                            <List dense={false}>
                                {
                                    Details.map((opt, index) => (
                                        <div key={index}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={opt.header}
                                                    secondary={opt.details}
                                                />
                                                <ListItemSecondaryAction>
                                                    <div className="body1 duskHorizon" onClick={() => this.copyToClipboard(opt.header, opt.details, opt.numeric)}>{localeObj.copy}</div>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        </div>
                                    ))}
                            </List>
                        </MuiThemeProvider>
                    </div>
                </div>
                <FlexView column hAlignContent="center" style={InputThemes.bottomButtonStyle}>
                    <TimeOutPrimaryButton btn_text={localeObj.share_info} onCheck={this.share} />
                </FlexView>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div style={{ position: "absolute", width: "100%", left: "-9999px", backgroundColor: "#ffffff" }}>
                    <div style={{ margin: "3.8% 7%" }} id={"share_or_download"}>
                        <MuiThemeProvider theme={theme1}>
                            <List dense={false}>
                                {
                                    Details.map((opt, index) => (
                                        <div key={index}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={opt.header}
                                                    secondary={opt.details}
                                                />
                                            </ListItem>
                                            <Divider />
                                        </div>
                                    ))}
                            </List>
                        </MuiThemeProvider>
                    </div>
                </div>
            </div>
        )
    }
}

TedDepositComponent.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
}