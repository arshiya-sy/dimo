import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import constantObjects from "../../Services/Constants";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCalls from "../../Services/androidApiCallsService";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import banner_en from "../../../src/images/SaqueAniversario/banner-en-US.webp";
import banner_pt from "../../../src/images/SaqueAniversario/banner-pt-BR.webp";
import { MuiThemeProvider, withStyles, createMuiTheme } from "@material-ui/core/styles";

import FGTSContracts from "./FgtsSupportComponents/FgtsContractsPage";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
const theme1 = InputThemes.FGTSListItemTheme;
const theme2 = InputThemes.snackBarTheme;
var localeObj = {};
class FgtsHomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            currentSlide: 0,
            currentState: "showFGTSOptions",
            valuePropEnabled: this.props?.location?.from == "anticipate" ? "disable" : "enable",
            isOnBack: true,
            isContractsEnabled: true,
            selectedTab: "anticipateFGTS"
        }

        this.styles = {
            cardStyle: {
                width: "100%",
                borderRadius: "0.5rem",
                margin: "0 1rem",
                align: "center"
            },
            circle: {
                width: "3rem",
                height: "3rem",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: ColorPicker.newProgressBar
            },
            numberCircle: {
                borderRadius: "50%",
                width: "2rem",
                height: "2rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: ColorPicker.accent,
                backgroundColor: ColorPicker.newProgressBar
            },
            verticalLine: {
                position: "absolute",
                top: "2rem",
                left: "3rem",
                width: "0.25rem",
                height: "80%",
                backgroundColor: ColorPicker.accent,
                transform: "translateX(-50%)",
                zIndex: 0
            },
            imgStyleMore: {
                borderRadius: "50%",
                height: "3rem",
                width: "3rem",
                verticalAlign: "middle",
                fill: ColorPicker.surface3,
                backgroundColor: ColorPicker.surface3,
                justifySelf: 'center',
                alignSelf: 'center',
                marginRight: "1rem",
                marginTop: "1rem"
            },
            transferStyle: {
                height: "1rem",
                width: "1.2rem",
                padding: "1.25rem 1rem"
            }
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNames.FgtsHomePage);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        localeObj = localeService.getActionLocale();
        if (this.props?.location?.from == "anticipation_success") {
            this.setState({
                valuePropEnabled: "disable",
                currentState: "contracts"
            });
        } else if (this.props?.location?.from == "anticipate") {
            this.setState({
                valuePropEnabled: "disable"
            });
        } else {
            let valuePropsEnable = androidApiCalls.getDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY);
            if (valuePropsEnable === undefined ||
                valuePropsEnable === null ||
                valuePropsEnable === "" ||
                valuePropsEnable === "0") {
                androidApiCalls.setDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY, "1");
                this.setState({
                    valuePropEnabled: "enable"
                });
            } else if (valuePropsEnable === "1" || valuePropsEnable === "4") {
                androidApiCalls.setDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY, "2");
                this.setState({
                    valuePropEnabled: "enable"
                });
            } else {
                androidApiCalls.setDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY, "3");
                this.setState({
                    valuePropEnabled: "disable"
                });
            }
            if (this.props.location.state && this.props.location.state.onBack) {
                this.setState({
                    valuePropEnabled: "disable"
                });
            }
        }
        window.onBackPressed = () => {
            this.onBackHome();
        }
    }

    showProgressDialog = () => {
        this.setState({
            currentState: "showProgressBar"
        })
    }

    hideProgressDialog = (state = "showFGTSOptions") => {
        this.setState({
            currentState: state
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.FgtsHomePage, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.FgtsHomePage);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    onBackHome = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else if (this.state.currentState == "showFGTSOptions" || this.state.currentState == "value_prop") {
            MetricServices.onPageTransitionStop(PageNames.FgtsHomePage, PageState.back);
            let { fromComponent = null, state = {} } = this.props?.location;
            if (fromComponent === PageNames.GamificationComponent.program_details) {
                return this.props.history.replace({ pathname: "/rewardsDetail", transition: "right", state });
            } else if (GeneralUtilities.getBackPressTracking() === "AllServices") {
                this.props.history.replace({ pathname: "/allServices", transition: "right" });
            } else {
                GeneralUtilities.setBackPressTracking("home");
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
            }
        } else if (this.state.currentState == "contracts" ||
            this.state.currentState == "view_tutorial") {
            this.setState({
                valuePropEnabled: "disable",
                currentState: "showFGTSOptions"
            });
            MetricServices.onPageTransitionStop(PageNames.FgtsHomePage, PageState.back);
            if (GeneralUtilities.getBackPressTracking() === "AllServices") {
                this.props.history.replace({ pathname: "/allServices", transition: "right" });
            } else {
                GeneralUtilities.setBackPressTracking("home");
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
            }
        } else {
            MetricServices.onPageTransitionStop(PageNames.FgtsHomePage, PageState.back);
            this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
        }
    }

    onSelectOption(action) {
        let event = {
            eventType: constantObjects.fgtsSelectOption + " " + action,
            page_name: PageNames.FgtsHomePage,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        switch (action) {
            case "view_tutorial":
                MetricServices.onPageTransitionStop(PageNames.FgtsHomePage, PageState.close);
                this.props.history.push({ pathname: "/fgtsVideoTutorial", from: "FGTS_home_page", fromComponent: "home" });
                break;
            case "anticipate":
                MetricServices.onPageTransitionStop(PageNames.FgtsHomePage, PageState.close);
                ImportantDetails.setTransactionEntryPoint(constantObjects.fgtsFromAnticipate);
                this.props.history.push({ pathname: "/fgtsAnticipate", from: "FGTS_home_page" });
                break;
            case "contracts":
                this.setState({
                    currentState: "contracts"
                });
                break;
            case "value_prop":
                this.setState({
                    valuePropEnabled: "disable",
                    currentState: "showFGTSOptions"
                });
                break;
            case "enable_value_prop":
                this.setState({
                    valuePropEnabled: "enable"
                });
            default:
                break;
        }
    }

    hideBottomSheet = () => {
        this.setState({
            bottomSheet: false
        });
    }

    handleTabClick = (tabName) => {
        this.setState({ currentState: tabName });
    };

    takeAction = (option) => {
        switch (option) {
            case "open_FGTS_app":
                this.goToFgtsPlayStoreApk();
                break;
            case "none":
            default:
                break;
        }
    }

    isFGTSAppInstalled = () => {
        let isAppInstalled = androidApiCalls.isPackageAvailable("br.gov.caixa.fgts.trabalhador");
        if (isAppInstalled) {
            androidApiCalls.openApp('package:br.gov.caixa.fgts.trabalhador#Intent;end;');
        } else {
            this.goToFgtsPlayStoreApk();
        }
    }

    goToFgtsPlayStoreApk = () => {
        let fgtsUrl = "https://play.google.com/store/apps/details?id=br.gov.caixa.fgts.trabalhador";
        androidApiCalls.openUrlInBrowserLegacy(fgtsUrl);
    }

    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;

        const fgtsContents = [
            {
                heading: localeObj.fgts_withdraw_info_contents_1,
                icon: <AttachMoneyIcon className="regularAccent" style={{ width: "1.5rem", height: "1.5rem", margin: "0.75rem", color: "#FFB684" }} />
            },
            {
                heading: localeObj.fgts_withdraw_info_contents_2,
                icon: <AccessTimeIcon className="regularAccent" style={{ width: "1.5rem", height: "1.5rem", margin: "0.75rem", color: "#FFB684" }} />
            },
            {
                heading: localeObj.fgts_withdraw_info_contents_3,
                icon: <AttachMoneyIcon className="regularAccent" style={{ width: "1.5rem", height: "1.5rem", margin: "0.75rem", color: "#FFB684" }} />
            },
            {
                heading: localeObj.fgts_withdraw_info_contents_4,
                icon: <ReceiptLongIcon className="regularAccent" style={{ width: "1.5rem", height: "1.5rem", margin: "0.75rem", color: "#FFB684" }} />
            },
        ];

        const anticipateFgtsContents = [
            {
                heading: <div>
                    <span className="body2 highEmphasis">{localeObj.fgts_withdraw_anticipate_info_1}</span>
                    <span className="body2 accent"><u>{localeObj.fgts_withdraw_anticipate_info_1_applink}</u></span>
                </div>,
                action: "open_FGTS_app"
            },
            {
                heading: <div>
                    <span className="body2 highEmphasis">{localeObj.fgts_withdraw_anticipate_info_2}</span>
                </div>,
                action: "none"
            },
            {
                heading: <div>
                    <span className="body2 highEmphasis">{localeObj.fgts_withdraw_anticipate_info_3}</span>
                </div>,
                action: "none"
            },
            {
                heading: <div>
                    <span className="body2 highEmphasis">{localeObj.fgts_withdraw_anticipate_info_4}</span>
                </div>,
                action: "none"
            },
        ];

        return (
            <div>
                {this.state.valuePropEnabled === "enable" &&
                    this.state.currentState === "showFGTSOptions" &&
                    <div style={{
                        width: `${screenWidth}px`,
                        height: `${screenHeight}px`,
                        overflowX: "hidden",
                        overflowY: "auto"
                    }}>
                        <ButtonAppBar header={localeObj.fgts_withdraw} onBack={this.onBackHome} action="none" />
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.fgts_withdraw_info_header}
                                </div>
                                <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.5rem" }}>
                                    {localeObj.fgts_withdraw_info_footer}
                                </div>
                            </FlexView>
                        </div>
                        <MuiThemeProvider theme={theme1}>
                            <FlexView column align="center" style={{ width: "100%" }}>
                                <Grid container spacing={0}>
                                    {
                                        fgtsContents.map((keys, index) => (
                                            <div key={index} style={this.styles.cardStyle}>
                                                <ListItem button>
                                                    <ListItemIcon>
                                                        <div style={this.styles.circle}>{keys.icon}</div>
                                                    </ListItemIcon>
                                                    <ListItemText>
                                                        <div style={{ textAlign: "left" }}>
                                                            <span className="body2 highEmphasis" >{keys.heading}</span>
                                                        </div>
                                                    </ListItemText>
                                                </ListItem>
                                            </div>
                                        ))
                                    }
                                </Grid>
                            </FlexView>
                        </MuiThemeProvider>
                        <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                            <FlexView column>
                                <div className="body2 highEmphasis" style={{ textAlign: "left", margin: "0.5rem 1.5rem" }}>
                                    {localeObj.fgts_withdraw_anticipation}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginLeft: "1.5rem", marginRight: "1.5rem", marginBottom: "2.5rem" }}>
                                    {localeObj.fgts_withdraw_anticipation_footer}
                                </div>
                            </FlexView>
                            <PrimaryButtonComponent btn_text={localeObj.fgts_withdraw_button} onCheck={() => this.onSelectOption("value_prop")} />
                        </div>
                    </div >}
                {this.state.valuePropEnabled === "disable" &&
                    <div>
                        <ButtonAppBar header={localeObj.fgts_withdraw} onBack={this.onBackHome} action="none" />
                        <div style={{ display: (this.state.currentState === "showProgressBar" ? 'block' : 'none') }}>
                            {this.state.currentState === "showProgressBar" && <CustomizedProgressBars></CustomizedProgressBars>}
                        </div>
                        <div style={{ display: (this.state.currentState === "showProgressBar" ? 'none' : 'block'), marginTop: "2rem" }}>
                            <FlexView>
                                <FlexView
                                    column
                                    className="body2"
                                    style={{ textAlign: "center", width: "50%" }}
                                    onClick={() => this.handleTabClick("showFGTSOptions")}>
                                    <span style={{
                                        color: (this.state.currentState === "showFGTSOptions" ? ColorPicker.darkHighEmphasis : ColorPicker.darkMediumEmphasis)
                                    }}>
                                        {localeObj.anticipation_fgts}
                                    </span>
                                    <div style={{
                                        height: '0.25rem',
                                        backgroundColor: (this.state.currentState === "showFGTSOptions" ? ColorPicker.accent : 'transparent'),
                                        marginTop: "1rem"
                                    }}></div>
                                </FlexView>
                                <FlexView
                                    column
                                    className="body2"
                                    style={{ textAlign: "center", width: "50%" }}
                                    onClick={() => this.handleTabClick("contracts")}>
                                    <span style={{
                                        color: (this.state.currentState === "contracts" ? ColorPicker.darkHighEmphasis : ColorPicker.darkMediumEmphasis)
                                    }}>
                                        {localeObj.fgts_contracts}
                                    </span>
                                    <div style={{
                                        height: '0.25rem',
                                        backgroundColor: (this.state.currentState === "contracts" ? ColorPicker.accent : 'transparent'),
                                        marginTop: "1rem"
                                    }}></div>
                                </FlexView>
                            </FlexView>
                        </div>
                        <div style={{ display: (this.state.currentState === "showFGTSOptions" ? 'block' : 'none'), backgroundColor: ColorPicker.tableBackground }}>
                            <div>
                                <img
                                    style={{ width: `${screenWidth}px`, height: `${screenHeight * 0.3}px` }}
                                    src={androidApiCalls.getLocale() === "en_US" ? banner_en : banner_pt}
                                    onClick={() => this.onSelectOption("enable_value_prop")}
                                    alt="" />
                            </div>
                            <FlexView column style={{ width: "100%" }}>
                                <div className="headline5 highEmphasis" style={{ margin: "0.5rem 2rem" }}>
                                    {localeObj.fgts_withdraw_anticipate_header}
                                </div>
                                <Grid container spacing={0} style={{ position: "relative" }}>
                                    <div style={this.styles.verticalLine}></div>
                                    {anticipateFgtsContents.map((keys, index) => (
                                        <div key={index} style={this.styles.cardStyle}>
                                            <ListItem button onClick={() => this.takeAction(keys.action)}>
                                                <ListItemIcon>
                                                    <div style={this.styles.numberCircle}>{index + 1}</div>
                                                </ListItemIcon>
                                                <ListItemText>
                                                    <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                                        {keys.heading}
                                                    </div>
                                                </ListItemText>
                                            </ListItem>
                                        </div>
                                    ))}
                                </Grid>
                            </FlexView>
                            <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                                <div style={{ marginBottom: "0.5rem", width: "80%", marginTop: "1.5rem" }} onClick={() => this.onSelectOption("view_tutorial")}>
                                    <span className="body2 accent">{localeObj.fgts_see_step_by_step}</span>
                                </div>
                                <PrimaryButtonComponent btn_text={localeObj.fgts_withdraw_button} onCheck={() => this.onSelectOption("anticipate")} />
                            </div>
                            <MuiThemeProvider theme={theme2}>
                                <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                                    <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                                </Snackbar>
                            </MuiThemeProvider>
                        </div>
                        <div style={{ display: (this.state.currentState === "contracts" ? 'block' : 'none'), backgroundColor: ColorPicker.tableBackground }}>
                            <FGTSContracts
                                contractStatus={true}
                                onBack={this.onBackHome}
                                anticipateNow={() => this.onSelectOption("anticipate")}
                            />
                        </div>
                    </div>}
            </div >
        )
    }
}

FgtsHomePage.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};

export default withStyles()(FgtsHomePage);
