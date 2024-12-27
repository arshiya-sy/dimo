import React from "react";
import FlexView from "react-flexview";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import Card from '@mui/material/Card';
import ArrowIcon from '@mui/icons-material/ArrowForwardIos';
import CardContent from '@mui/material/CardContent';
import AttachMoney from '@mui/icons-material/AttachMoney';
import WarningAmber from '@mui/icons-material/WarningAmber';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Switch from "@material-ui/core/Switch";
import { MuiThemeProvider, createTheme, withStyles } from '@material-ui/core/styles';

import MetricServices from "../../../Services/MetricsService";
import arbiApiService from "../../../Services/ArbiApiService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import constantObjects from "../../../Services/Constants";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import ColorPicker from '../../../Services/ColorPicker';
import localeService from "../../../Services/localeListService";
import InputThemes from "../../../Themes/inputThemes";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import InputPinPage from "../../CommonUxComponents/InputPinPageWithValidation";
import ChatBotUtils from "../../NewUserProfileComponents/ChatComponents/ChatBotUtils";
import PropTypes from 'prop-types';

const theme2 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.CreditCardComponents;

const theme1 = createTheme({
    overrides: {
        MuiSelect: {
            select: {
                "&:focus": {
                    background: ""
                }
            }
        },
        MuiInput: {
            underline: {
                '&:hover:not($disabled):not($focused):not($error):before': {
                    borderBottom: "2px solid #00BCE3",
                }, '&:after': {
                    borderBottom: "2px solid #00BCE3"
                }
            },
        },
        MuiSwitch: {
            root : {
                "&$checked": {
                    color: "#0195BA"
                },
            }
        }
    }
});

const SwitchStyle = withStyles({
    switchBase: {
        width: "1.5rem",
        color: ColorPicker.buttonAccent,
        '&$checked': {
            color: ColorPicker.buttonAccent,
        },
        '&$checked + $track': {
            backgroundColor: ColorPicker.newProgressBar,
        },
    },
    checked: {},
    track: {},
})(Switch);

// const styles = {
//     paper: InputThemes.singleInputStyle.paper
// };

const stylePaper = () => ({
    paper: {
        borderTopLeftRadius: "1.25rem",
        borderTopRightRadius: "1.25rem",
        backgroundColor: ColorPicker.newProgressBar
    }
});

var localeObj = {};

class CreditCardSettingsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            progressBar: false,
            automaticDebit: "Active",
            transactionState: "settings",
            dueDate: new Date(),
            checkedAutomaticDebit: this.props.automaticDebit,
            bottomSheetForFailedDueDateChange: false,
            bottomSheetForAutomaticDebit : false,
            bottomSheetForEnableAutomaticDebit : false,
            creditCardBillingDate: this.props.invoiceDueDate,
            creditCardAutoDebitStatus: this.props.automaticDebit,
            bottomSheetForError: false,
            isClickable: false
        };
        this.styles = {
            cardStyle: {
                width: "90%",
                borderRadius: "1.25rem",
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: "-1rem",
                backgroundColor: ColorPicker.newProgressBar
            },
            listItemStyle: {
                width: "100%",
                borderRadius: "0.5rem",
                margin: "0 1rem",
                display: "flex",
                alignItems: "flex-start"
            },
            circle: {
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: ColorPicker.newProgressBar,
                width: "3rem",
                height: "3rem"
            },
            listIconStyle: {
                display: "flex",
                alignItems: "flex-start",
            }
        }
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNameJSON['credit_card_settings'];
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.back();
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

    showProgressDialog = () => {
        this.setState({
            progressBar: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            progressBar: false
        })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    goToCreditCardHomePage = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.onBackHome(this.state.creditCardAutoDebitStatus);
    }

    back = () => {
        if(this.state.bottomSheetForAutomaticDebit){
            this.closeBottomSheetForAutomaticDebit();
        } else if(this.state.bottomSheetForEnableAutomaticDebit){
            this.closeBottomSheetForEnableAutomaticDebit();
        } else if(this.state.bottomSheetForError) {
            this.closeDrawer();
        } else if (this.state.bottomSheetForFailedDueDateChange) {
            this.ConfirmDueDateFailed();
        } else if (this.state.transactionState == "automaticDebit") {
            this.setState({
                transactionState: "settings"
            });
        } else if (this.state.transactionState == "pinAutomaticDebit") {
            this.setState({
                transactionState: "settings",
                bottomSheetForEnableAutomaticDebit: true
            });
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.onBackHome(this.state.creditCardAutoDebitStatus);
        }
    }

    handleCancelAutomaticDebit = () => {
        this.setState({
            transactionState: "settings"
        });
    }

    closeBottomSheetForAutomaticDebit = () => {
        this.setState({
            bottomSheetForAutomaticDebit: false
        });
    }

    closeBottomSheetForEnableAutomaticDebit = () => {
        this.setState({
            bottomSheetForEnableAutomaticDebit: false
        });
    }

    ConfirmAutomaticDebit = () => {
        let newSwitchVal = this.state.creditCardAutoDebitStatus
        this.setState({
            transactionState: "settings",
            bottomSheetForAutomaticDebit: false,
            bottomSheetForEnableAutomaticDebit: false
        });
        this.showProgressDialog();
        arbiApiService.updateCreditCardAutomaticDebit(!newSwitchVal, this.componentName).
            then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processUpdateCreditCardAutomaticDebit(response.result);
                    if (processorResponse.success) {
                        //Log.sDebug("Credit Card Setting Details Fetched: ");
                        let ads = processorResponse.autoDebit;
                        this.setState({
                            creditCardAutoDebitStatus: ads,
                            progressBar: false
                        });
                        this.props.updateCreditCardAutomaticDebitStatus(!newSwitchVal);
                        if (ads) {
                            this.openSnackBar(localeObj.automatic_debit_activated_successfully);
                        } else {
                            this.openSnackBar(localeObj.automatic_debit_deactivated_successfully);
                        }

                    } else {
                        this.setState({
                            progressBar: false,
                            bottomSheetForError: true,
                            bottomSheetErrorMessage: processorResponse.result.mensagem
                        })
                        //Log.sDebug("updateCreditCardAutomaticDebit, Error getting credit card deatils");
                    }
                } else {
                    this.setState({
                        progressBar: false
                    })
                    //Log.sDebug("updateCreditCardAutomaticDebit failed");
                }
            });
    }

    changeAutomaticDebit = () => {
        //let newSwitchVal = !this.state.checkedAutomaticDebit;
        let event = constantObjects.creditCardChangeDueDate
        this.sendEventMetrics(event, PageNameJSON["credit_card_settings_change_automatic_debit"]);
        if (!this.state.creditCardAutoDebitStatus) {
            // this.setState({
            //     transactionState: "automaticDebit"
            // });
            this.setState({
                transactionState: "settings",
                bottomSheetForEnableAutomaticDebit: true
            });
        } else {
            this.setState({
                transactionState: "settings",
                bottomSheetForAutomaticDebit: true
            });
        }
    }

    openMyCardsSection = () => {
        this.props.openMyCards();
    }

    ConfirmAutomaticDebitScreen = () => {
        this.setState({
            transactionState: "pinAutomaticDebit",
            bottomSheetForAutomaticDebit: true
        });
    }

    ConfirmAutomaticDebitWithPin = () => {
        this.setState({
            transactionState: "pinAutomaticDebit"
        });
    }

    changeInvoiceDueDate = () => {
        let event = constantObjects.creditCardChangeDueDate
        this.sendEventMetrics(event, PageNameJSON["credit_card_settings_change_due_date"]);
        this.props.openChangeInvoiceDueDate();
    }

    sendEventMetrics = (event_type, pageName) => {
        let event = {
            eventType: event_type,
            page_name: pageName,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
    }

    closeDrawer = () => {
        this.setState({
            bottomSheetForError: false
        });
    }

    ShowDueDateFailed = () => {
        this.setState({
            bottomSheetForFailedDueDateChange : true
        });
    }

    ConfirmDueDateFailed = () => {
        this.setState({
            bottomSheetForFailedDueDateChange : false
        });
    }

    onHandleGoToHome = () => {
        this.setState({
            transactionState: "settings"
        });
    }

    goToChatbot = () => {
        if (this.state.isClickable) {
            return; 
        }
        this.setState({
            isClickable: true
        });
        ChatBotUtils.insideChatBot(constantObjects.credit_card_settings);
        this.props.history.replace({ pathname: "/chat", transition: "right"});
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.screenHeight;
        const autoDebitContents = [
            {
                heading: localeObj.automatic_debit_list_header_1,
                text: localeObj.automatic_debit_list_subtitle_1,
                action: "Automatic debit action 1",
                icon: <AttachMoney sx={{ fontSize: 25, color: ColorPicker.accent }} />
            },
            {
                heading: localeObj.automatic_debit_list_header_2,
                text: localeObj.automatic_debit_list_subtitle_2,
                action: "Automatic debit action 2",
                icon: <WarningAmber sx={{ fontSize: 25, color: ColorPicker.accent }} />
            },
            {
                heading: localeObj.automatic_debit_list_header_3,
                text: localeObj.automatic_debit_list_subtitle_3,
                action: "Automatic debit action 3",
                icon: <EventBusyIcon sx={{ fontSize: 25, color: ColorPicker.accent }} />
            }
        ];
        return (
            <div style={{ height: `${finalHeight}px` }}>
                <div style={{ display: (this.state.progressBar ? 'block' : 'none') }}>
                    {this.state.progressBar && <CustomizedProgressBars></CustomizedProgressBars>}
                </div>
                {!this.state.progressBar && this.state.transactionState == "settings" && <div style={{ display: (!this.state.progressBar ? 'block' : 'none') }}>
                    {this.state.transactionState !== "automaticDebit" && 
                    <ButtonAppBar header={localeObj.credit_card_settings} onBack={this.goToCreditCardHomePage} action="none" />}
                    <MuiThemeProvider theme={theme1}>
                        <FlexView column style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <List style={{ width: "100%", height: "100%" }}>
                                <ListItem button onClick={() => this.changeInvoiceDueDate()}>
                                    <ListItemText>
                                        <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                            <span className="subtitle4 highEmphasis" >{localeObj.invoice_duedate}</span>
                                            <div className="body2 mediumEmphasis">{localeObj.invoice_duedate_subtext}</div>
                                        </div>
                                    </ListItemText>
                                    <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                </ListItem>
                            </List>
                            <List style={{ width: "100%", height: "100%" }}>
                                <ListItem button>
                                    <ListItemText>
                                        <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                            <span className="subtitle4 highEmphasis" >{localeObj.automatic_debit}</span>
                                            <div className="body2 mediumEmphasis">{this.state.creditCardAutoDebitStatus == true ? localeObj.enabled : localeObj.disabled}</div>
                                        </div>
                                    </ListItemText>
                                    <FlexView>
                                        <span style={{textAlign: "right"}}>
                                            <SwitchStyle checked={this.state.creditCardAutoDebitStatus} onChange={() => this.changeAutomaticDebit()} />
                                        </span>
                                    </FlexView>
                                </ListItem>
                            </List>
                            <Card align="center" style={this.styles.cardStyle} elevation="0" onClick={() => this.openMyCardsSection()}>
                                <CardContent>
                                    <List style={{ marginTop: "-1rem", marginBottom: "-1rem" }}>
                                        <ListItem button onClick={() => this.openMyCardsSection()}>
                                            <ListItemText>
                                                <div style={{textAlign: "left"}}>
                                                    <span className="body2 highEmphasis" ><strong>{localeObj.need_more_options}</strong></span>
                                                    <div>
                                                        <span className="body2 mediumEmphasis">{localeObj.go_to_settings_1}</span>
                                                        <span className="body2 highEmphasis"><strong>{localeObj.go_to_settings_2}</strong></span>
                                                        <span className="body2 mediumEmphasis">{localeObj.go_to_settings_3}</span>
                                                    </div>
                                                </div>
                                            </ListItemText>
                                            <ArrowIcon style={{ fill: ColorPicker.accent, fontSize: "1rem" }} />
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </FlexView>
                    </MuiThemeProvider>

                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                        <div className= "body2" style={{ color: ColorPicker.darkMediumEmphasis, marginTop: "1.25rem" }}> 
                            {localeObj.get_help_chatbot}
                            <span className= "body2" style={{ color: ColorPicker.accent, textDecoration: "underline" }} onClick={this.props.fromVirtualCard || this.props.fromPhysicalCard? this.props.goToChatbot : this.goToChatbot}>
                                {localeObj.chatbot_help}
                            </span> 
                        </div>
                    </div>
                    <MuiThemeProvider theme={theme2}>
                        <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SHORT_SNACK_DURATION} onClose={this.closeSnackBar}>
                            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                        </Snackbar>
                    </MuiThemeProvider>
                    <Drawer
                        anchor="bottom"
                        open={this.state.bottomSheetForFailedDueDateChange}
                        onClose={this.ConfirmDueDateFailed}
                        disableDiscovery={true}
                        disableSwipeToOpen={true}
                        classes={{ paper: classes.paper }}>
                        <div onKeyDown={this.ConfirmDueDateFailed} style={{ margin: "1.5rem" }} >
                            <div style={{ marginTop: "0.5rem", textAlign: "center" }} >
                                <span className="headline6 highEmphasis">
                                    {localeObj.invoice_due_date_failed_header}
                                </span>
                            </div>
                            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                <span className="body2 mediumEmphasis">
                                    {localeObj.invoice_due_date_failed_caption}
                                </span>
                            </div>
                            <div style={{ width: "100%", marginTop: "1.5rem", textAlign: "center" }}>
                                <PrimaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.invoice_due_date_failed_Ok} onCheck={this.ConfirmDueDateFailed} />
                            </div>
                        </div>
                    </Drawer>
                    <Drawer
                        anchor="bottom"
                        open={this.state.bottomSheetForAutomaticDebit}
                        classes={{ paper: classes.paper }}>
                        <div style={{ margin: "1.5rem" }} >
                            <div style={{ marginTop: "0.5rem", textAlign: "center" }} >
                                <span className="headline6 highEmphasis">
                                    {localeObj.credit_card_automatic_debit_disable_header}
                                </span>
                            </div>
                            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                <span className="body2 mediumEmphasis">
                                    {localeObj.credit_card_automatic_debit_enable_desc_1}
                                </span>
                            </div>
                            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                <span className="body2 mediumEmphasis">
                                    {localeObj.credit_card_automatic_debit_enable_desc_2}
                                </span>
                            </div>
                            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                <span className="body2 mediumEmphasis">
                                    {localeObj.credit_card_automatic_debit_enable_desc_3}
                                </span>
                            </div>
                            <div style={{ width: "100%", marginTop: "1.5rem", textAlign: "center" }}>
                                <PrimaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.automatic_debit_deactivate_button} onCheck={this.ConfirmAutomaticDebit} />
                                <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.closeBottomSheetForAutomaticDebit} />
                            </div>
                        </div>
                    </Drawer>
                    <Drawer
                        anchor="bottom"
                        open={this.state.bottomSheetForEnableAutomaticDebit}
                        classes={{ paper: classes.paper }}>
                        <div style={{ margin: "1.5rem" }} >
                            <div style={{ marginTop: "0.5rem", textAlign: "center" }} >
                                <span className="headline6 highEmphasis">
                                    {localeObj.credit_card_automatic_debit_enable_header}
                                </span>
                            </div>
                            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                <span className="body2 mediumEmphasis">
                                    {localeObj.credit_card_automatic_debit_enable_desc_1}
                                </span>
                            </div>
                            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                <span className="body2 mediumEmphasis">
                                    {localeObj.credit_card_automatic_debit_enable_desc_2}
                                </span>
                            </div>
                            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                <span className="body2 mediumEmphasis">
                                    {localeObj.credit_card_automatic_debit_enable_desc_3}
                                </span>
                            </div>
                            <div style={{ width: "100%", marginTop: "1.5rem", textAlign: "center" }}>
                                <PrimaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.automatic_debit_activate_button} onCheck={this.ConfirmAutomaticDebit} />
                                <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.closeBottomSheetForEnableAutomaticDebit} />
                            </div>
                        </div>
                    </Drawer>
                    <Drawer
                        anchor="bottom"
                        open={this.state.bottomSheetForError}
                        classes={{ paper: classes.paper }}>
                        <div onKeyDown={this.closeDrawer} style={{ margin: "1.5rem" }} >
                            <div style={{ marginTop: "0.5rem", textAlign: "center" }} >
                                <span className="headline6 highEmphasis">
                                    {this.state.bottomSheetErrorMessage}
                                </span>
                            </div>
                            <div style={{ width: "100%", marginTop: "1.5rem", textAlign: "center" }}>
                                <PrimaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.ok} onCheck={this.closeDrawer} />
                            </div>
                        </div>
                    </Drawer>
                </div>}
                {!this.state.progressBar && this.state.transactionState === "pinAutomaticDebit" && <div>
                    <ButtonAppBar header={localeObj.pix_authentication} onBack={this.back} action="none" />
                    <InputPinPage history = {this.props.history} confirm={this.ConfirmAutomaticDebit} />
                </div>}
                {!this.state.progressBar && this.state.transactionState === "automaticDebit" &&
                    <div style={{ display: !this.state.processing ? "block" : "none", height: `${finalHeight}px` }}>
                        {this.state.transactionState === "automaticDebit" &&
                            <ButtonAppBar header={localeObj.automatic_debit} onBack={this.back} action="none" />}
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.automatic_debit_header}
                                </div>
                                <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: '1.5rem', marginRight: '1.625rem' }}>
                                    {localeObj.automatic_debit_subheader}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", textAlign: "center" }}>
                            <Grid container spacing={0}>
                                {autoDebitContents.map((keys) => (
                                    <div key={keys.heading} style={{...this.styles.listItemStyle, textAlign: "center"}}>
                                        <ListItem>
                                            <ListItemIcon style={this.styles.listIconStyle}>
                                                <div style={this.styles.circle}>
                                                    {keys.icon}
                                                </div>
                                            </ListItemIcon>
                                            <ListItemText>
                                                <div style={{ marginLeft: "1rem", marginRight: "1rem", textAlign: "center" }}>
                                                    <span className="subtitle4 highEmphasis" >{keys.heading}</span>
                                                    <div className="body2 mediumEmphasis">{keys.text}</div>
                                                </div>
                                            </ListItemText>
                                        </ListItem>
                                    </div>))}
                            </Grid>
                        </div>
                        <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                            <PrimaryButtonComponent className="body1 highEmphasis" btn_text={this.state.creditCardAutoDebitStatus ? localeObj.automatic_debit_deactivate_button : localeObj.automatic_debit_activate_button} onCheck={this.ConfirmAutomaticDebit} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.handleCancelAutomaticDebit} />
                        </div>
                    </div>}
            </div>
        );
    }
}
CreditCardSettingsPage.propTypes = {
    classes: PropTypes.object.isRequired,
    automaticDebit: PropTypes.bool.isRequired,
    invoiceDueDate: PropTypes.instanceOf(Date).isRequired,
    onBackHome: PropTypes.func.isRequired,
    updateCreditCardAutomaticDebitStatus: PropTypes.func.isRequired,
    openMyCards: PropTypes.func.isRequired,
    openChangeInvoiceDueDate: PropTypes.func.isRequired,
    goToChatbot: PropTypes.func.isRequired,
    fromVirtualCard: PropTypes.bool,
    fromPhysicalCard: PropTypes.bool,
    history: PropTypes.object.isRequired,
    componentName: PropTypes.string
  };
export default withStyles(stylePaper)(CreditCardSettingsPage);