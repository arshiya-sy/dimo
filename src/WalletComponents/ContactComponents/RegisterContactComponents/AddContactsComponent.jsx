import React from "react";
import "../../../styles/main.css";
import InputThemes from "../../../Themes/inputThemes";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

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

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider } from '@material-ui/core/styles';
import SelectMenuOption from "../../CommonUxComponents/SelectMenuOption";
import SelectOption from "../../CommonUxComponents/SelectOptionFromList";
import BottomSheetAccount from "../../CommonUxComponents/BottomSheetAccount";
import TransferRecieverComponent from "../../TedTransferComponents/TransferRecieverComponent";
import TransferInputComponent from "../../TedTransferComponents/TransferInputComponent";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import constantObjects from "../../../Services/Constants";
import AddNewContactComponent from "./AddNewContactComponent";
import FetchKeyInformation from "./FetchKeyInformation";
import ImageInformationComponent from "../../CommonUxComponents/ImageInformationComponent";
import PixKeyDescriptionComponent from "./PixKeyDescriptionComponent";

const theme1 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.AddContactsComponent;
var localeObj = {};

class AddContacts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pixTransactionState: "new_contact",
            transactionInfo: {},
            pixDest: "",
            direction: "",
            errorJson: {},
            pinExpiredSnackBarOpen: false,
            keyType: "text",
            cpfAdded: false
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }
    componentDidMount() {
        document.body.style.overflow = 'hidden';
        androidApiCalls.enablePullToRefresh(false);
        this.setState({
            header: localeObj.pix,
            accountType: [
                { "name": localeObj.account_checking, "value": 1 },
                { "name": localeObj.account_saving, "value": 2 },
                { "name": localeObj.account_payment, "value": 3 },
                { "name": localeObj.account_salary, "value": 4 }],
            accountOption: [
                { "name": localeObj.full_acc_info, "value": 0 },
                { "name": localeObj.pix_key_header, "value": 1 }],
        })

        if (this.props.location && this.props.location.from) {
            if (this.props.location.from === "contactDetails" || this.props.location.from === "tedTransfer" || this.props.location.from === "pixSend") {
                this.setState({
                    pixTransactionState: "selectAccount",
                    direction: "left",
                    nickName: this.props.location.name,
                    cpfAdded: this.props.location.cpfAdded
                })
            } else {
                this.setState({
                    pixTransactionState: "new_contact"
                })
            }
        }

        window.onBackPressed = () => {
            this.onBack();
        }
    }

    handleLogging = (logs) => {
        Log.sDebug(logs, "PixSendComponent");
    }

    setTransactionInfo = (formInfo) => {
        if (formInfo.error) {
            this.handleLogging("Error occured: " + formInfo.error);
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
                pixTransactionState: "error",
                direction: "left",
                pixErrorJson: jsonObj
            })
        } else {
            switch (this.state.pixTransactionState) {
                case "new_contact":
                    this.setState({
                        pixTransactionState: "selectAccount",
                        direction: "left",
                        nickName: formInfo
                    })
                    break;
                case "selectAccount":
                    if (formInfo === 0) {
                        this.setState({
                            field: formInfo,
                            pixTransactionState: "institute",
                            direction: "left",
                            pixDest: "pix_account_selected"
                        })
                    } else {
                        this.setState({
                            field: formInfo,
                            pixTransactionState: "select",
                            direction: "left",
                            pixDest: "pix_key_selected"
                        })
                    }
                    MetricServices.onPageTransitionStart(PageNameJSON.selectAccount);
                    break;
                case "select":
                    if (formInfo !== this.state.field) {
                        this.setState(prevState => ({
                            transactionInfo: {
                                ...prevState.transactionInfo,
                                "pixKey": ""
                            },
                        }))
                    }
                    if (formInfo === localeObj.phone_number
                        || formInfo === localeObj.cpf
                        || formInfo === localeObj.cnpj) {
                        this.setState({
                            keyType: "tel"
                        })
                    } else if (formInfo === localeObj.email) {
                        this.setState({
                            keyType: "email"
                        })
                    } else {
                        this.setState({
                            keyType: "text"
                        })
                    }
                    this.setState({
                        field: formInfo,
                        pixTransactionState: "pix_key_selected",
                        direction: "left",
                        pixDest: "pix_key_selected"
                    })
                    break;
                case "pix_key_selected":
                    this.setState({
                        transactionInfo: formInfo,
                        pixTransactionState: "pix_key_description",
                        direction: "left"
                    })
                    break;
                case "pix_key_description":
                    this.setState(prevState => ({
                        transactionInfo: {
                            ...prevState.transactionInfo,
                            "nickName": this.state.nickName
                        }
                    }))
                    return this.registerNewContact();
                case "institute":
                    this.setState(prevState => ({
                        transactionInfo: {
                            ...prevState.transactionInfo,
                            "bank": formInfo["code"],
                            "receiverInstitute": formInfo["receiverInstitute"],
                            "receiverIspb": formInfo["receiverIspb"],
                        },
                        pixTransactionState: "accountType",
                        direction: "left"
                    }))
                    MetricServices.onPageTransitionStart(PageNameJSON.accountType);
                    break;
                case "accountType":
                    this.setState(prevState => ({
                        transactionInfo: {
                            ...prevState.transactionInfo,
                            "accountType": formInfo
                        },
                        pixTransactionState: "beneficiary",
                        direction: "left"
                    }))
                    break;
                case "beneficiary":
                    this.setState(prevState => ({
                        transactionInfo: {
                            ...prevState.transactionInfo,
                            "name": formInfo["name"],
                            "nickName": this.state.nickName,
                            "CPF": formInfo["cpf"].replace(/[^0-9]/g, ''),
                            "cpf": formInfo["cpf"],
                            "myAccount": formInfo["myAccount"]
                        },
                        pixTransactionState: "agency",
                        direction: "left"
                    }))
                    break;
                case "agency":
                    this.setState(prevState => ({
                        transactionInfo: {
                            ...prevState.transactionInfo,
                            "agency": formInfo["agency"],
                            "noAgency": formInfo["noAgency"]
                        },
                        pixTransactionState: "accountNumber",
                        direction: "left"
                    }))
                    break;
                case "accountNumber":
                    this.setState(prevState => ({
                        transactionInfo: {
                            ...prevState.transactionInfo,
                            "account": formInfo
                        },
                    }))
                    return this.registerNewContact();
                case "success":
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

    onHandleGoToHome = () => {
        this.props.history.replace({ pathname: "/contacts", transition: "right" });
    }

    goToWalletPage = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixTransactionState], PageState.back);
        if (this.props.location && this.props.location.from && this.props.location.from === "tedTransfer") {
            this.props.history.replace({
                pathname: "/tedTransfer",
                from: "addContactsPage",
                amountData: {
                    amount: this.props.location.amount,
                    decimal: this.props.location.decimal
                },
                contactData: this.props.location.details
            })
        } else if (this.props.location && this.props.location.from && this.props.location.from === "pixSend") {
            this.props.history.replace({
                pathname: "/pixSendComponent",
                from: "addContactsPage",
                amountData: {
                    amount: this.props.location.amount,
                    decimal: this.props.location.decimal
                },
                contactData: this.props.location.details
            })
        } else {
            GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
        }
    }

    handleSeeContact = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixTransactionState], PageState.back);
        if (this.props.location && this.props.location.from && this.props.location.from === "tedTransfer") {
            this.props.history.replace({
                pathname: "/tedTransfer",
                from: "addContactsPage",
                amountData: {
                    amount: this.props.location.amount,
                    decimal: this.props.location.decimal
                },
                contactData: this.props.location.details
            })
        } else if (this.props.location && this.props.location.from && this.props.location.from === "pixSend") {
            this.props.history.replace({
                pathname: "/pixSendComponent",
                from: "addContactsPage",
                amountData: {
                    amount: this.props.location.amount,
                    decimal: this.props.location.decimal
                },
                contactData: this.props.location.details
            })
        } else {
            this.props.history.replace({ pathname: "/contacts", transition: "right" });
        }
    }

    saveContact = (name) => {
        this.setState({
            nickName: name
        })
        this.registerNewContact();
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                pinExpiredSnackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixTransactionState], PageState.back);
            switch (this.state.pixTransactionState) {
                case "new_contact":
                case "error":
                case "success":
                    this.onHandleGoToHome();
                    break;
                case "selectAccount":
                    if (this.props.location && this.props.location.from) {
                        if (this.props.location.from === "contactDetails") {
                            this.onHandleGoToHome();
                        } else if (this.props.location.from === "tedTransfer") {
                            this.props.history.replace({
                                pathname: "/tedTransfer",
                                from: "addContactsPage",
                                amountData: {
                                    amount: this.props.location.amount,
                                    decimal: this.props.location.decimal
                                },
                                contactData: this.props.location.details
                            })
                        } else if (this.props.location.from === "pixSend") {
                            this.props.history.replace({
                                pathname: "/pixSendComponent",
                                from: "addContactsPage",
                                amountData: {
                                    amount: this.props.location.amount,
                                    decimal: this.props.location.decimal
                                },
                                contactData: this.props.location.details
                            })
                        } else {
                            let jsonObj = this.state.transactionInfo;
                            delete jsonObj['pixKey'];
                            this.setState({
                                direction: "right",
                                transactionInfo: jsonObj,
                                pixTransactionState: "new_contact"
                            })

                        }
                    } else {
                        let jsonObj = this.state.transactionInfo;
                        delete jsonObj['pixKey'];
                        this.setState({
                            direction: "right",
                            pixTransactionState: "new_contact",
                            transactionInfo: jsonObj
                        })
                    }
                    break;
                case "select":
                    this.setState({
                        direction: "right",
                        pixTransactionState: "selectAccount"
                    })
                    MetricServices.onPageTransitionStart(PageNameJSON.selectAccount);
                    break;
                case "pix_key_selected":
                    androidApiCalls.setDAStringPrefs("contactCPF", "")
                    this.setState({
                        direction: "right",
                        pixTransactionState: "select"
                    })
                    break;
                case "pix_key_description":{
                    let jsonObj = this.state.transactionInfo;
                    // delete jsonObj['pixKey'];
                    this.setState({
                        direction: "right",
                        pixTransactionState: "pix_key_selected",
                        transactionInfo: jsonObj
                    })
                }
                    break;
                case "institute":
                    this.setState({
                        direction: "right",
                        pixTransactionState: "selectAccount"
                    })
                    MetricServices.onPageTransitionStart(PageNameJSON.selectAccount);
                    break;
                case "accountType":
                    this.setState({
                        direction: "right",
                        pixTransactionState: "institute"
                    })
                    break;
                case "beneficiary":
                    this.setState({
                        direction: "right",
                        pixTransactionState: "accountType"
                    })
                    MetricServices.onPageTransitionStart(PageNameJSON.accountType);
                    break;
                case "agency":
                    this.setState({
                        direction: "right",
                        pixTransactionState: "beneficiary"
                    })
                    break;
                case "accountNumber":
                    this.setState({
                        direction: "right",
                        pixTransactionState: "agency"
                    })
                    break;
                default:
                    break;
            }
        }
    }

    registerNewContact = () => {
        this.showProgressDialog();
        let timeoutId = setInterval(() => {
            clearInterval(timeoutId);
            ArbiApiService.addNewContact(this.state.transactionInfo, PageNameJSON.new_contact).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processRegisteringContact(response.result);
                    if (processedResponse.success) {
                        this.setState({
                            pixTransactionState: "success",
                            field: "",
                            direction: "left"
                        })
                        androidApiCalls.setDAStringPrefs("contactCPF", "")
                    } else {
                        let jsonObj = {};
                        jsonObj["error"] = true;
                        jsonObj["reason"] = processedResponse.message;
                        this.setTransactionInfo(jsonObj);
                    }
                } else {
                    let jsonObj = {};
                    this.handleLogging("Pix Send to Key - failed");
                    if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                        jsonObj["error"] = true;
                        jsonObj["errorCode"] = response.status;
                        jsonObj["reason"] = "communication_issue"
                        this.setTransactionInfo(jsonObj);
                    } else if ('' + response.result.code === "40007") {
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

    closeSnackBar = () => {
        this.setState({ pinExpiredSnackBarOpen: false })
    }

    noActionSnackBar = () => {
        return this.setState({
            pinExpiredSnackBarOpen: true,
            message: localeObj.no_action
        })
    }

    handleClose = () => {
        Log.sDebug("Bottom sheet dismissed");
    }

    render() {
                const currentState = this.state.pixTransactionState;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        return (
            <div style={{ overflowX: "hidden" }}>
                {currentState !== "error" && currentState !== "success" && currentState !== "pix_key_selected" &&
                    <ButtonAppBar header={localeObj.contact_plural} onBack={this.onBack} action="none" />
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "new_contact" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "new_contact" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "new_contact" && <AddNewContactComponent setTransactionInfo={this.setTransactionInfo}
                            saveContact={this.saveContact} requiredInfo={this.state.transactionInfo} name={this.state.nickName} componentName={PageNameJSON.new_contact} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "selectAccount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "selectAccount" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "selectAccount" && <BottomSheetAccount accountType={this.state.accountOption} heading={localeObj.btm_sheet_acc_header}
                            keySelected={this.setTransactionInfo} componentName={PageNameJSON.selectAccount} handleClose={this.handleClose} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "select" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "select" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "select" && <SelectMenuOption type="Contact" header={localeObj.type_key_header} description={localeObj.type_key_desc}
                            value={this.state.field} componentName={PageNameJSON.select} recieveField={this.setTransactionInfo} cpfAdded={this.state.cpfAdded} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "pix_key_selected" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "pix_key_selected" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "pix_key_selected" && <FetchKeyInformation requiredInfo={this.state.transactionInfo} setTransactionInfo={this.setTransactionInfo} field={this.state.field}
                            type={this.state.keyType} cpfAdded={this.state.cpfAdded} componentName={PageNameJSON.pix_key_selected} header={localeObj.contact_plural} noAction={this.noActionSnackBar} onBack={this.onBack} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "pix_key_description" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "pix_key_description" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "pix_key_description" && <PixKeyDescriptionComponent requiredInfo={this.state.transactionInfo} setTransactionInfo={this.setTransactionInfo} name={this.state.nickName}
                            componentName={PageNameJSON.pix_key_description} onBack={this.onBack} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "institute" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "institute" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "institute" && <SelectOption type="Bank" header={localeObj.choose_institute} confirm={this.setTransactionInfo}
                            componentName={PageNameJSON.institute} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "accountType" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "accountType" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "accountType" && <BottomSheetAccount accountType={this.state.accountType} heading={localeObj.account_type_header}
                            keySelected={this.setTransactionInfo} componentName={PageNameJSON.accountType} handleClose={this.handleClose} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "beneficiary" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "beneficiary" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "beneficiary" && <TransferRecieverComponent requiredInfo={this.state.transactionInfo} setTransactionInfo={this.setTransactionInfo}
                            componentName={PageNameJSON.beneficiary} refer="contact" feature="add_contacts"/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "agency" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "agency" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "agency" && <TransferInputComponent requiredInfo={this.state.transactionInfo} field={localeObj.agency} from={GeneralUtilities.TRANSACTION_TYPES.CONTACT} recieveField={this.setTransactionInfo}
                            value={this.state.transactionInfo.agency} componentName={PageNameJSON.agency} refer="contact" />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "accountNumber" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "accountNumber" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "accountNumber" && <TransferInputComponent requiredInfo={this.state.transactionInfo} field={localeObj.acc_no} from={GeneralUtilities.TRANSACTION_TYPES.CONTACT} recieveField={this.setTransactionInfo}
                            value={this.state.transactionInfo.account} componentName={PageNameJSON.accountNumber} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "success" &&
                            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                                <ImageInformationComponent header={localeObj.contact_added} icon={success} type={PageNameJSON["success"]}
                                    appBar={false} description={localeObj.contact_add_subtxt} btnText={localeObj.see_contact} next={this.handleSeeContact}
                                    secBtnText={localeObj.back_home} close={this.goToWalletPage} componentName={PageNameJSON.success} />
                            </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "error" && <PixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.goToWalletPage} componentName={PageNameJSON.error} />}
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
            </div>
        );
    }
}

AddContacts.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    nickName: PropTypes.string,
    setTransactionInfo: PropTypes.func.isRequired,
    saveContact: PropTypes.func.isRequired,
    location: PropTypes.object,
    history: PropTypes.object
};

export default withStyles(styles)(AddContacts);