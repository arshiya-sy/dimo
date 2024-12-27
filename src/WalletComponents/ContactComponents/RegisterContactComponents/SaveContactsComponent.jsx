import React from "react";
import "../../../styles/main.css";
import InputThemes from "../../../Themes/inputThemes";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import FlexView from "react-flexview";
import PropTypes from "prop-types";

import Log from "../../../Services/Log";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import httpRequest from "../../../Services/httpRequest";

import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import { CSSTransition } from 'react-transition-group';
import success from "../../../images/SpotIllustrations/Checkmark.png";

import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import TransferRecieverComponent from "../../TedTransferComponents/TransferRecieverComponent";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import constantObjects from "../../../Services/Constants";
import ListAllContacts from "../ContactSupportComponents/ListContactsComponent";
import ImageInformationComponent from "../../CommonUxComponents/ImageInformationComponent";

const theme1 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.saveContactAfterTransaction;
var localeObj = {};

class AddContacts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saveContactState: "new_contact",
            transactionInfo: {},
            pixDest: "",
            direction: "",
            errorJson: {},
            contactData:{},
            pinExpiredSnackBarOpen: false,
            keyType: "text",
            cpfAdded: false,
            isFullAccount: false
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }
    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);

        if (this.props.location && this.props.location.from && this.props.location.from === "tedTransfer") {
            this.setState({
                transactionInfo: this.props.location.contactData,
                isFullAccount: true
            });
        } else if(this.props.location && this.props.location.from && this.props.location.from === "pixAccount") {
            this.setState({
                transactionInfo: this.props.location.contactData,
                isFullAccount: true
            });
        } else if(this.props.location && this.props.location.from && this.props.location.from === "pixKey") {
            this.setState({
                transactionInfo: this.props.location.contactData,
                isFullAccount: false
            });
        }

        window.onBackPressed = () => {
            if (this.state.bottomSheetOpen) {
                this.setState({ bottomSheetOpen: false });
            } else {
                this.onBack();
            }
        }
    }

    setTransactionInfo = (formInfo) => {
        if (formInfo.error) {
            Log.sDebug("Error occured: " + formInfo.error, constantObjects.LOG_PROD);
            androidApiCalls.hideProgressDialog();
            let jsonObj = {}
            jsonObj["title"] = localeObj.contact;
            jsonObj["header"] = localeObj.contact_failed;
            switch (formInfo.reason) {
                case "technical_issue":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "communication_issue":
                    jsonObj["description"] = localeObj.pix_communication_issue;
                    break;
                case "account_unavailable":
                    jsonObj["description"] = localeObj.save_account_unavailable;
                    break;
                case "time_limit_exceeded":
                    jsonObj["description"] = localeObj.pix_time_limit_exceeded;
                    break;
                case "generic_error":
                    jsonObj["description"] = localeObj.generic_error + " " + localeObj.generic_error_subtext
                    break;
                case "arbi_error":
                    jsonObj["description"] = formInfo.descriptor;
                    break;
                default:
                    jsonObj["description"] = formInfo.reason;
                    break;
            }
            this.setState({
                saveContactState : "error",
                direction: "left",
                pixErrorJson: jsonObj
            })
        } else {
            switch (this.state.saveContactState) {
                case "new_contact":
                    if(formInfo.saveCreateNew) {
                        this.setState({
                            saveContactState: "beneficiary",
                            direction: "left",
                        })
                    } else {
                    if(formInfo.cpf !== this.state.transactionInfo["CPF"]){
                        return this.setState({
                            pinExpiredSnackBarOpen: true,
                            message: localeObj.contact_differnent_cpf
                        })
                    } else {
                        this.setState(prevState => ({
                            transactionInfo: {
                                ...prevState.transactionInfo,
                                "nickName": formInfo.nickName,
                            },
                            saveContactState: "list_contact",
                            direction: "left",
                            nickName: formInfo.nickName,
                            bottomSheetOpen: true,
                            contactData : formInfo,
                        }))
                    }
                }
                    break;
                case "beneficiary": {
                        let accountData = this.state.transactionInfo;
                        accountData["nickName"] = formInfo.name;
                        this.setState({
                            transactionInfo : accountData
                        })
                        this.registerNewContact();
                    }
                    break;
                case "list_contact":
                    if(formInfo.cpf !== this.state.transactionInfo["CPF"]){
                        return this.setState({
                            pinExpiredSnackBarOpen: true,
                            message: localeObj.contact_differnent_cpf
                        })
                    } else {
                        this.setState(prevState => ({
                            transactionInfo: {
                                ...prevState.transactionInfo,
                                "nickName": formInfo.nickName,
                            },
                            nickName: formInfo.nickName,
                            bottomSheetOpen: true,
                            contactData : formInfo,
                        }))
                    }
                    break;
                default:
                    break;
            }
        }
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        })
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                pinExpiredSnackBarOpen: true,
                message: localeObj.no_action
            })
        } else if(this.state.bottomSheetOpen) {
            this.setState({
                bottomSheetOpen: false,
            })
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.saveContactState], PageState.back);
            switch (this.state.saveContactState) {
                case "new_contact":
                    this.onHandleGoToHome();
                    break;
                case "success":
                    this.onHandleGoToHome();
                    break;
                case "beneficiary":
                    this.setState({
                        saveContactState: "new_contact",
                        direction: "left",
                    });
                    break;
                case "list_contact":
                    this.setState({
                        saveContactState: "new_contact",
                        direction: "left",
                    });
                    break;
                default:
                    break;
            }
        }
    }

    registerNewContact = () => {
        this.setState({
            bottomSheetOpen: false,
        })
        this.showProgressDialog();
        let timeoutId = setInterval(() => {
            clearInterval(timeoutId);
            ArbiApiService.addNewContact(this.state.transactionInfo, PageNameJSON.new_contact).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processRegisteringContact(response.result);
                    if (processedResponse.success) {
                        this.setState({
                            saveContactState: "success",
                            direction: "left"
                        })
                    } else {
                        let jsonObj = {};
                        jsonObj["error"] = true;
                        jsonObj["reason"] = processedResponse.message;
                        this.setTransactionInfo(jsonObj);
                    }
                } else {
                    Log.sDebug("Saving Contact Failed", PageNameJSON[this.state.saveContactState], constantObjects.LOG_PROD);
                    if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                        let jsonObj = {};
                        jsonObj["error"] = true;
                        jsonObj["errorCode"] = response.status;
                        jsonObj["reason"] = "communication_issue"
                        this.setTransactionInfo(jsonObj);
                    } else if ('' + response.result.code === "40007") {
                        let jsonObj = {};
                        jsonObj["error"] = true;
                        jsonObj["reason"] = "account_unavailable";
                        this.setTransactionInfo(jsonObj);
                    } else {
                        let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                }
            });
        }, 1.5 * 1000);
    }

    onShowContact = () => {
        this.props.history.replace({ pathname: "/contacts", transition: "right" });
    }

    onHandleGoToHome = () => {
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    onSecondary = () => {
        this.setState({ bottomSheetOpen: false })
    }

    closeSnackBar = () => {
        this.setState({ pinExpiredSnackBarOpen: false })
    }

    render() {
        const currentState = this.state.saveContactState;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const { classes } = this.props;
        return (
            <div style={{ overflowX: "hidden" }}>
                {currentState !== "error" && currentState !== "success" &&
                    <ButtonAppBar header={localeObj.contact_plural} onBack={this.onBack} action="none" />
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "new_contact" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "new_contact" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "new_contact" && <ListAllContacts confirm={this.setTransactionInfo} showAddNewOption = {true} showAddOption={false}
                        componentName={PageNameJSON.new_contact}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "beneficiary" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "beneficiary" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "beneficiary" && <TransferRecieverComponent requiredInfo={this.state.transactionInfo} setTransactionInfo={this.setTransactionInfo}
                            componentName={PageNameJSON.beneficiary} refer="save_contact" />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "list_contact" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "list_contact" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "list_contact" && <ListAllContacts confirm={this.setTransactionInfo} showAddNewOption = {false}
                        componentName={PageNameJSON.list_contact}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "success" &&
                            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                                <ImageInformationComponent header={localeObj.contact_added} icon={success} type={PageNameJSON.success}
                                    appBar={false} description={localeObj.contact_add_subtxt} btnText={localeObj.see_contact} next={this.onShowContact}
                                    secBtnText={localeObj.back_home} close={this.onHandleGoToHome} />
                            </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "error" && <PixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.onHandleGoToHome} componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.pinExpiredSnackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.bottomSheetOpen}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.contact_save_to_existing}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {this.state.isFullAccount ?  localeObj.contact_save_sure_account + this.state.nickName + " ?": localeObj.contact_save_sure_key + this.state.nickName + " ?"}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={this.state.isFullAccount ? localeObj.contact_save_account : localeObj.contact_save_key} onCheck={this.registerNewContact} />
                            <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.onSecondary}>
                                {localeObj.cancel}
                            </div>
                        </div>
                    </Drawer>
                </div>
            </div>
        );
    }
}

AddContacts.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
};

export default withStyles(styles)(AddContacts);