import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";

import Log from "../../Services/Log";
import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import constantObjects from "../../Services/Constants";
import arbiApiService from "../../Services/ArbiApiService";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCalls from "../../Services/androidApiCallsService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import androidApiCallsService from "../../Services/androidApiCallsService";
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";

import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import ListItem from '@material-ui/core/ListItem';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import SecurityIcon from '@material-ui/icons/Security';
import HelpIcon from '@material-ui/icons/HelpOutlineOutlined';
import ExitToAppIcon from '@material-ui/icons/ExitToAppOutlined';
import FeedbackIcon from '@material-ui/icons/RateReviewOutlined';
import ChatIcon from '@material-ui/icons/Chat';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import AccountCircleIcon from '@material-ui/icons/AccountCircleOutlined';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import dimo_logo from "../../images/DarkThemeImages/Dimo-Logo_4x.png";
import OptinIcon from '@material-ui/icons/LocalOffer';

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import contentCopy from "../../images/SvgUiIcons/account_copy.svg";
import ClickWithTimeout from "../EngageCardComponent/ClickWithTimeOut";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import ChatBotUtils from "./ChatComponents/ChatBotUtils";

const theme2 = InputThemes.snackBarTheme;
const TimeOutDiv = ClickWithTimeout('div');
const TimeOutSpan = ClickWithTimeout('span');

const styles = {
    root: {
        background: "#6A7580"
    },
    gridStyle: {
        backgroundColor: ColorPicker.newProgressBar,
        padding: "1rem",
        height: "180",
        boxShadow: "none",
        borderRadius: "1.5rem",
        textAlign: 'center',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: ColorPicker.newProgressBar,
        },
    },
    paper: InputThemes.singleInputStyle.paper
};

var localeObj = {};

class MyAccountPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: ImportantDetails.userName,
            agency: ImportantDetails.agencyNumber,
            accountNum: ImportantDetails.accountNumber,
            cpf: ImportantDetails.cpf,
            editedcpf: "",
            data_for_profile: {},
            bottomSheet: false,
            bottomSheetType: "",
            bottomSheetTitle: "",
            bottomSheetPrimaryButton: "",
            bottomSheetSecondaryButton: "",
            snackBarOpen: false,
            message: "",
            currentState: "MyAccount",
            phoneNumber: "",
            subDeepLink: false,
            isOnBack: true
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNames.myAccountMenu);
        this.deepLinkCheck().then(() => { });
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);

        if (ImportantDetails.cpf !== null) {
            this.setState({
                editedcpf: GeneralUtilities.formatCPF(ImportantDetails.cpf),
                cpf: ImportantDetails.cpf
            })
        }
        window.onBackPressed = () => {
            if (this.state.bottomSheet) {
                this.setState({
                    bottomSheet: false
                });
            }
            else if (this.state.currentState !== "showProgressBar") {
                MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.back);
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
            }
        }
        if(this.props.location && this.props.location.state && this.props.location.state.dataUpdated){
            this.fetchDetails("profile");
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.myAccountMenu);
        }
    }

    deepLinkCheck = async () => {
        if (this.props.location.additionalInfo !== "" && this.props.location.additionalInfo !== undefined) {
            let action = this.props.location.additionalInfo["profileActions"];
            if (action !== "" && action !== undefined) {
                await this.setState({ subDeepLink: true });
                this.onSelectOption(action);
            }
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    fetchDetails(to_page) {
        this.setState({ currentState: "showProgressBar" })
        arbiApiService.getAllClientData(PageNames.myAccountMenu).then(response => {
                this.setState({ currentState: "hideProgressBar" })
                if (response.success) {
                    Log.sDebug("User Details Fetched", "MyAccountPage");
                    let processorResponse = ArbiResponseHandler.processGetAllClientDataResponse(response.result, "profile");
                    if (processorResponse.success) {
                        let profileData = this.getProfileDetailsOfUser(processorResponse.data)
                        if (to_page === "profile") {
                            MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.close);
                            this.props.history.replace("/profileDetails", { "profileData": profileData, "subDeepLink": this.state.subDeepLink });
                        } else if (to_page === "feedback") {
                            let userJSON = {
                                "name": profileData.nickName,
                                "email": profileData.email
                            }
                            MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.close);
                            this.props.history.replace("/feedback", { "userDetails": userJSON, "subDeepLink": this.state.subDeepLink });
                        } else {
                            let securityJSON = {
                                "from": "Account Page",
                                "cpf": this.state.cpf,
                                "phone_number": profileData.phoneNum,
                                "email": profileData.email
                            }
                            MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.close);
                            this.props.history.replace("/securityComp", { "passwordDetails": securityJSON, "subDeepLink": this.state.subDeepLink });
                        }
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.tryAgainLater
                        })
                        return;
                    }
                } else {
                    let errorMessage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        snackBarOpen: true,
                        message: errorMessage
                    })
                    return;
                }
            })
    }

    getProfileDetailsOfUser(clientData) {
        let nickname = ImportantDetails.nickName;

        if (nickname === "") {
            nickname = this.state.userName;
        }

        let profilePayload = {
            "name": clientData.nome,
            "email": clientData.email,
            "phoneNum": "+55 " + clientData.telefoneMovel.ddd.substring(1, 3) + " " + clientData.telefoneMovel.numero.substring(0, 5) + "-" + clientData.telefoneMovel.numero.substring(5, 9),
            "phoneNumber": {
                "ddd" : clientData.telefoneMovel.ddd,
                "number": clientData.telefoneMovel.numero
            },
            "address": GeneralUtilities.formatAddress(clientData),
            "mailing_address": GeneralUtilities.formatMailingAddress(clientData) === "NO ADDRESS"? localeObj.no_address : GeneralUtilities.formatMailingAddress(clientData),
            "nickName": nickname,
            "isEmailVerified": clientData.emailConfirmado
        }
        return profilePayload;
    }

    onSelectOption(action) {
        Log.sDebug("User Choose " + action, "MyAccountPage");
        switch (action) {
            case "profile_details":
                this.fetchDetails("profile");
                break;
            case "help":
                MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.close);
                GeneralUtilities.openHelpSection();
                break;
            case "app_settings":
                MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.close);
                this.props.history.replace("/appSettings");
                break;
            case "contract_terms":
                MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.close);
                this.props.history.replace("/contractsAndTerms", { "subDeepLink": this.state.subDeepLink });
                break;
            case "chat":
                MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.close);
                ChatBotUtils.insideChatBot(constantObjects.user_profile_entrypoint);
                this.props.history.replace("/chat", { "subDeepLink": this.state.subDeepLink });
                break;
            case "about":
                MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.close);
                this.props.history.replace("/aboutComp");
                break;
            case "feedback":
                this.fetchDetails("feedback");
                break;
            case "security":
                this.fetchDetails("security");
                break;
            case "logout":
                this.setState({
                    bottomSheet: true,
                    bottomSheetType: "logout",
                    bottomSheetTitle: localeObj.logout_header,
                    bottomSheetPrimaryButton: localeObj.logout_new,
                    bottomSheetSecondaryButton: localeObj.cancel
                });
                break;
            case "optin":
                MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.close);
                this.props.history.replace("/marketOptin", { "subDeepLink": this.state.subDeepLink });
                break;
            case "voz":
                this.props.history.replace("/dimoVoz");
                break;
            case "transactions":
                this.props.history.replace("/transactionOptions");
                break;
            default:
                this.props.history.replace("/newWalletLaunch");
                break;
        }
        Log.sDebug("Selected Action " + action)
    }

    render() {

        const { classes } = this.props;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const dimoImageHeight = 0.05 * screenHeight;
        const dimoImageWidth = 0.34 * screenWidth;
        const AccountItems = [
            {
                "option": localeObj.profile_details,
                "action": "profile_details",
                "icon": <AccountCircleIcon className="accent" />
            },
            {
                "option": localeObj.help_txt,
                "action": "help",
                "icon": <HelpIcon className="accent" />
            },
            {
                "option": localeObj.chat,
                "action": "chat",
                "disable": constantObjects.featureEnabler.DISABLE_CHATBOT,
                "icon": <ChatIcon className="accent" />
            },
            {
                "option": localeObj.contract_terms,
                "action": "contract_terms",
                "icon": <InsertDriveFileIcon className="accent" />
            },
            /*{
                "option": localeObj.app_settings,
                "action": "app_settings",
                "icon": <SettingsIcon className="accent" />
            },*/
            {
                "option": localeObj.security,
                "action": "security",
                "icon": <SecurityIcon className="accent" />
            },
            {
                "option": localeObj.transaction_options,
                "action": "transactions",
                "disable": !androidApiCallsService.isFeatureEnabledInApk("READOUT_ALOUD"),
                "icon": <CurrencyExchangeIcon className="accent" />
            },
            {
                "option": localeObj.about,
                "action": "about",
                "icon": <InfoIcon className="accent" />
            },
            {
                "option": localeObj.market_optin,
                "action": "optin",
                "icon": <OptinIcon className="accent" />
            },
            {
                "option": localeObj.feedback,
                "action": "feedback",
                "icon": <FeedbackIcon className="accent" />
            },
            {
                "option": localeObj.logout,
                "action": "logout",
                "icon": <ExitToAppIcon className="accent" />
            }
        ]


        const onBack = () => {
            if (this.state.isOnBack && this.state.currentState !== "showProgressBar") {
                this.setState({ isOnBack: false });
                MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.back);
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
            }
        }

        const hideBottomSheet = () => {
            this.setState({
                bottomSheet: false
            });
        }

        const onLogout = () => {
            this.setState({
                currentState: "showProgressBar",
                bottomSheet: false
            });

            arbiApiService.logOut(PageNames.myAccountMenu).then((response) => {
                Log.sDebug("Log out user " + response.success, "MyAccountPage");
                ImportantDetails.resetAllFields();
                androidApiCalls.setDAStringPrefs("showBalance", true);
                MetricServices.reportSessionMetrics();
                MetricServices.onPageTransitionStop(PageNames.myAccountMenu, PageState.logout);
                this.props.history.replace({ pathname: "/", state: { from: PageNames.myAccountMenu }, transition: "right" });
            });
        }

        const onPrimaryButtonClick = () => {
            switch (this.state.bottomSheetType) {
                case "logout": onLogout(); break;
                default:
                    break;
            }
        }

        const onSecondaryButtonClick = () => {
            switch (this.state.bottomSheetType) {
                case "logout": hideBottomSheet(); break;
                default:
                    break;
            }
        }

        const copyToClipboard = () => {
            let event = {
                eventType: constantObjects.copyAccountDetails,
                page_name: PageNames.myAccountMenu,
            };
            MetricServices.reportActionMetrics(event, new Date().getTime());
            let copyDetails = localeObj.name + ": " + ImportantDetails.userName + "\n" + localeObj.cpf + ": " + GeneralUtilities.formatCPF(ImportantDetails.cpf) + "\n" + localeObj.bank_number + "\n" + localeObj.agency + ": " + ImportantDetails.agencyNumber + "\n" + localeObj.acc_no + ": " + ImportantDetails.accountNumber;
            androidApiCallsService.copyToClipBoard(copyDetails);
            Log.sDebug("User Copied Profile Details", "MyAccountPage");
            this.setState({
                snackBarOpen: true,
                message: localeObj.copy_success
            })
        }

        return (
            <div >
                <ButtonAppBar style={{ marginLeft: "7%" }} header={localeObj.my_account_page} onBack={onBack} action="none" />
                {/* To show progressBar */}
                <div style={{ display: (this.state.currentState === "showProgressBar" ? 'block' : 'none') }}>
                    {this.state.currentState === "showProgressBar" && <CustomizedProgressBars></CustomizedProgressBars>}
                </div>

                {/*  To show the main my account page*/}
                <div style={{ display: (this.state.currentState === "MyAccount" ? 'block' : 'none') }}>
                    <div className="scroll" style={{ height: `${screenHeight - 150}px`, overflowY: "auto" }}>
                        <div style={{ marginTop: "1.5rem" }}>
                            <div style={{ width: "100%", textAlign: "center" }}>
                                <img align="center" style={{ height: `${dimoImageHeight}px`, width: `${dimoImageWidth}px` }} src={dimo_logo} alt=""></img>
                            </div>
                        </div>
                        <FlexView column align="center" style={{ marginLeft: "1.5rem", marginRight: "1.5rem", marginTop: "1.5rem" }}>
                            <Grid container justify="center" alignItems="center" style={styles.gridStyle}>
                                <div style={{ width: "50%", marginTop: "0.16%", textAlign: "center" }}>
                                    <span className="subtitle4 highEmphasis">{this.state.userName}</span>
                                </div>
                                <div style={{ width: "62%", marginLeft: "19%", marginRight: "19%", marginTop: "2%", textAlign: "center" }}>
                                    <div className="body2 mediumEmphasis">{localeObj.cpf}{" "}{this.state.editedcpf}</div>
                                </div>
                                <div style={{ width: "62%", marginLeft: "19%", marginRight: "19%", marginTop: "2%", textAlign: "center" }}>
                                    <div className="body2 mediumEmphasis">{localeObj.bank_number}</div>
                                    <div className="body2 mediumEmphasis">{localeObj.agency}{" "}{this.state.agency} | {localeObj.account}{" "}{this.state.accountNum}{" "}</div>
                                </div>
                                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                    <span style={{textAlign: "center"}} onClick={copyToClipboard} >
                                        <img style={{ marginRight: "0.5rem", display: 'inline-flex', width: '0.8rem' }} src={contentCopy} alt="" />
                                        <span className="body2 highEmphasis">{localeObj.share_details} </span>
                                    </span>
                                </div>
                            </Grid>
                        </FlexView>
                        <FlexView column align="left" style={{ marginLeft: "0.8rem", marginRight: "1.5rem", marginTop: "2rem" }}>
                            <List disablePadding={true}>
                                {
                                    AccountItems.map((opt, key) => (
                                        <span key={key} style={{ display: (!opt.disable ? 'block' : 'none') }}>
                                            <ListItem style={{ marginTop: "0.5rem" }} >
                                                <TimeOutSpan style={{ marginRight: "0.5rem", display: 'inline-flex' }} onClick={() => this.onSelectOption(opt.action)}>{opt.icon}</TimeOutSpan>
                                                <TimeOutDiv className="body1 highEmphasis" onClick={() => this.onSelectOption(opt.action)}>{opt.option}</TimeOutDiv>
                                            </ListItem>
                                        </span>
                                    ))
                                }
                            </List>
                        </FlexView>
                    </div>
                    <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                        <Drawer classes={{ paper: classes.paper }}
                            anchor="bottom"
                            open={this.state.bottomSheet}>
                            <div style={{ margin: "1.5rem" }}>
                                <FlexView column>
                                    <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                        {this.state.bottomSheetTitle}
                                    </div>
                                </FlexView>
                            </div>
                            <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                                <PrimaryButtonComponent btn_text={this.state.bottomSheetPrimaryButton} onCheck={onPrimaryButtonClick} />
                                <SecondaryButtonComponent btn_text={this.state.bottomSheetSecondaryButton} onCheck={onSecondaryButtonClick} />
                            </div>
                        </Drawer>
                        <MuiThemeProvider theme={theme2}>
                            <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                                <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                            </Snackbar>
                        </MuiThemeProvider>
                    </div>
                </div>
            </div>
        )
    }
}

MyAccountPage.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MyAccountPage);
