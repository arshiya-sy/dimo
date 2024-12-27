import React from "react";
import "../../styles/main.css";
import PropTypes from "prop-types";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import androidApiCalls from "../../Services/androidApiCallsService";
import InputThemes from "../../Themes/inputThemes";
import { CSSTransition } from 'react-transition-group';

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import constantObjects from "../../Services/Constants";
import ArbiApiService from "../../Services/ArbiApiService";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';

import ListContactDetails from "./ContactSupportComponents/ContactDetails";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ListAllContacts from "./ContactSupportComponents/ListContactsComponent";

import EditDetails from "./EditContactComponents/EditDetails";
import EditComponent from "./EditContactComponents/EditComponent";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.contactViewComponent;
var localeObj = {};

class ContactListComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            detailsJson: {},
            transcationState: "list",
            direction: "",
            message: "",
            snackBarOpen: "",
            isOnBack: true
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    moveToDetails = (details) => {
        this.setState({
            detailsJson: details,
            transcationState: "view_details",
            direction: "left"
        })
    }

    addContact = () => {
        this.props.history.replace({ pathname: "/addContact", transition: "right" });
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

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.onBack();
        }

        if (this.props.location && this.props.location.from) {
            if (this.props.location.from === "pixSend" || this.props.location.from === "tedTransfer") {
                this.setState({
                    detailsJson: this.props.location.detailsJSON,
                    transcationState: "edit_contact",
                    direction: "right"
                })
            }
        }
    }

    viewDetails = (json) => {
        this.showProgressDialog();
        let requestJson = {
            "contactCpf": json.cpf,
            "contactId": json.favId,
            "contactName": json.fullName,
            "nickName": json.nickName,
        }
        ArbiApiService.getContactDetails(requestJson, PageNames.chatComponent).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processGetContactDetailsResponse(response.result);
                if (processedResponse.success) {
                    requestJson["contactDetails"] = processedResponse.contactDetails;
                    if (processedResponse.contactDetails.length === 0) {
                        this.hideProgressDialog();
                        this.setState({
                            transcationState: "list",
                            direction: "right"
                        })
                    } else {
                        this.hideProgressDialog();
                        this.moveToDetails(requestJson);
                    }
                }
            } else {
                let message = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                this.setState({
                    snackBarOpen: true,
                    message: message
                })
                this.hideProgressDialog();
            }
        });
    }

    deleteConfirmed = (json) => {
        this.setState({
            message: localeObj.contact_deleted,
            snackBarOpen: true
        })
        let timeoutId = setInterval(() => {
            clearInterval(timeoutId);
            this.viewDetails(json);
        }, 1.5 * 1000);
    }

    addContactFromDetails = (json) => {
        this.props.history.replace({
            pathname: "/addContact",
            from: "contactDetails",
            name: json["name"],
            cpfAdded: json["cpfAdded"]
        })
    }

    edit = () => {
        this.setState({
            transcationState: "edit_contact",
            direction: "right"
        })
    }

    editObj = (json) => {
        this.setState({
            transcationState: "edit_contact_info",
            direction: "right",
            value: json
        })
    }

    sendData = (finalDetails) => {
        if (finalDetails.tipoChavePix === "AgenciaConta") {
            //move to PIX Account
            this.getISPB(finalDetails);
            //this.sendDataForTed(finalDetails) -> Flow avaialable if necessary
        } else {
            //move to PIX KEY
            this.getKeyDetails(finalDetails.chavePix);
        }
    }

    getKeyDetails = (pixKey) => {
        this.showProgressDialog();
        ArbiApiService.getPixKeyDetails(pixKey, PageNameJSON.view_details).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResult = ArbiResponseHandler.processGetPixKeyDetailsResponse(response.result, pixKey, localeObj);
                if (processedResult.success) {
                    let data = {
                        "pixKey": pixKey,
                        "transferType": processedResult.pixKeyDetails.pixKeyType,
                        "receiverInstitute": processedResult.pixKeyDetails.institute,
                    }
                    this.sendDataforPix(data);
                } else {
                    this.setState({
                        message: localeObj.pix_technical_issue,
                        snackBarOpen: true
                    })
                }
            } else {
                let message = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                this.setState({
                    snackBarOpen: true,
                    message: message
                })
            }
        });
    }

    sendDataforPix = (keyData) => {
        let pixSendWithoutAmount = {
            "transferType": keyData.transferType,
            "name": this.state.detailsJson.contactName,
            "CPF": GeneralUtilities.maskCpf(this.state.detailsJson.contactCpf),
            "receiverInstitute": keyData.receiverInstitute,
            "pixKey": keyData.pixKey,
        }

        this.props.history.replace({
            pathname: "/pixSendComponent",
            from: "sendToContacts",
            type: "pixToKey",
            reviewData: pixSendWithoutAmount,
        });
    }

    getAccountType = (val) => {
        switch (val) {
            //1 = ContaCorrente, 2 = ContaPoupanca, 3 = ContaDePagamento, 4 = ContaVirtual
            case "ContaCorrente":
                return 1;
            case "ContaPoupanca":
                return 2;
            case "ContaDePagamento":
                return 3;
            case "ContaVirtual":
                return 4;
            default:
                return;
        }
    }

    sendDataForTed = (finalDetails) => {
        let sendDataToTed = {
            "beneficiary": this.state.detailsJson.contactName,
            "cpf": this.state.detailsJson.contactCpf,
            "agency": finalDetails.agencia,
            "bank": finalDetails.codigoOuISPB,
            "receiverInstitute": finalDetails.nomeInstituicao,
            "noAgency": false,
            "myAccount": false,
            "account": finalDetails.conta,
            "accountType": finalDetails.tipoDeConta
        }

        this.props.history.replace({
            pathname: "/tedTransfer",
            from: "sendToContacts",
            reviewData: sendDataToTed,
        })
    }

    getISPB = (finalDetails) => {
        this.showProgressDialog();
        ArbiApiService.getBankList("Ban").then(response => {
            if (response.success) {
                this.hideProgressDialog();
                let processedResponse = ArbiResponseHandler.processGetISPB(response.result, finalDetails.codigoOuISPB);
                if (processedResponse.success) {
                    this.sendDataForPixAccount(finalDetails, processedResponse.ispbNum);
                    return;
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.pix_account_unavailable
                    })
                }
            } else {
                let message = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                this.setState({
                    snackBarOpen: true,
                    message: message
                })
            }
        });
    }

    sendDataForPixAccount = (finalDetails, ispb) => {
        let sendDataToPixAccount = {
            "name": this.state.detailsJson.contactName,
            "CPF": this.state.detailsJson.contactCpf,
            "agency": finalDetails.agencia,
            "bank": finalDetails.codigoOuISPB,
            "receiverIspb": ispb,
            "transferType": localeObj.pix_account,
            "receiverInstitute": finalDetails.nomeInstituicao,
            "noAgency": false,
            "myAccount": false,
            "account": finalDetails.conta,
            "accountType": this.getAccountType(finalDetails.tipoDeConta)
        }

        this.props.history.replace({
            pathname: "/pixSendComponent",
            from: "sendToContacts",
            type: "pixToAccount",
            reviewData: sendDataToPixAccount,
        });
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.transcationState], PageState.back);
            switch (this.state.transcationState) {
                case "list":
                    if (this.props.location && this.props.location.from === "pix-send") {
                        this.props.history.replace({
                            pathname: "/pixSendComponent",
                            direction: "right"
                        })
                    } else if (this.state.isOnBack) {
                        this.setState({ isOnBack: false });
                        this.goToWalletPage();
                    }
                    break;
                case "view_details":
                    if(this.state.bottomSheetOpen) {
                        this.bottomSheetOpen(false)
                    } else {
                        this.setState({
                            transcationState: "list",
                            direction: "right"
                        })
                    }
                    break;
                case "edit_contact":
                    if (this.props.location && this.props.location.from) {
                        if (this.props.location.from === "tedTransfer") {
                            this.props.history.replace({
                                pathname: "/tedTransfer",
                                from: "showContactsPage",
                                amountData: {
                                    amount: this.props.location.amount,
                                    decimal: this.props.location.decimal
                                },
                                contactData: this.props.location.details
                            })
                        } else if (this.props.location.from === "pixSend") {
                            this.props.history.replace({
                                pathname: "/pixSendComponent",
                                from: "showContactsPage",
                                amountData: {
                                    amount: this.props.location.amount,
                                    decimal: this.props.location.decimal
                                },
                                contactData: this.props.location.details
                            })
                        }
                    } else {
                        this.setState({
                            transcationState: "view_details",
                            direction: "right"
                        })
                    }
                    break;
                case "edit_contact_info":
                    if (!this.state.selection) {
                        this.setState({
                            transcationState: "edit_contact",
                            direction: "right"
                        })
                    } else {
                        this.setState({
                            selection: false
                        })
                    }
                    break;
                default:
                    break;
            }
        }
    }

    goToWalletPage = () => {
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    deleteCompleted = () => {
        this.setState({
            transcationState: "list",
            direction: "right"
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    multipleSelection = (field) => {
        this.setState({
            selection: field
        })
    }

    editComplete = (json) => {
        this.showProgressDialog();
        let requestJson = {
            "contactCpf": json.cpf,
            "contactId": json.contactId,
            "contactName": json.name,
            "nickName": json.nickName,
        }
        ArbiApiService.getContactDetails(requestJson, PageNames.chatComponent).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processGetContactDetailsResponse(response.result);
                if (processedResponse.success) {
                    this.hideProgressDialog();
                    requestJson["contactDetails"] = processedResponse.contactDetails;
                    this.setState({
                        message: localeObj.contact_updated,
                        snackBarOpen: true
                    })
                    this.moveToDetails(requestJson);
                }
            } else {
                this.hideProgressDialog();
                this.setState({
                    message: localeObj.pix_technical_issue,
                    snackBarOpen: true
                })
                let timeoutId = setInterval(() => {
                    clearInterval(timeoutId);
                    this.goToWalletPage();
                }, 1.5 * 1000);
            }
        });
    }

    finishEditing = (details) => {
        this.setState({
            snackBarOpen: true,
            message: localeObj.contact_updated
        })
        this.moveToDetails(details)
    }
    bottomSheetOpen = (val) => {
        this.setState({
            bottomSheetOpen : val
        })
    }

    render() {
        const transaction = this.state.transcationState;
        return (
            <div style={{ overflowX: "hidden" }}>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "list" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "list" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.contact_plural} onBack={this.onBack} action="none" />
                        {transaction === "list" && <ListAllContacts confirm={this.viewDetails} add={this.addContact}
                            componentName={PageNameJSON.list} showAddOption={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "view_details" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "view_details" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.contact_plural} onBack={this.onBack} action="none" />
                        {transaction === "view_details" && <ListContactDetails contact={this.state.detailsJson} add={this.addContactFromDetails} fromSend={false}
                            deleteComplete={this.deleteCompleted} edit={this.edit} componentName={PageNameJSON.view_details} handleSend={this.sendData} bottomSheetOpen={this.bottomSheetOpen} bottomSheetEnabled={this.state.bottomSheetOpen}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "edit_contact" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "edit_contact" && !this.state.processing ? 'block' : 'none') }}>
                        {transaction === "edit_contact" && <EditDetails contact={this.state.detailsJson} finished={this.finishEditing} moveToDetails={this.moveToDetails}
                            deleteComplete={this.deleteConfirmed} editObj={this.editObj} back={this.onBack} componentName={PageNameJSON.edit_contact} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={transaction === "edit_contact_info" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (transaction === "edit_contact_info" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.contact_plural} onBack={this.onBack} action="none" />
                        {transaction === "edit_contact_info" && <EditComponent editComplete={this.editComplete} value={this.state.value} selection={this.state.selection}
                            multipleSelection={this.multipleSelection} back={this.goToWalletPage} onBack={this.onBack} componentName={PageNameJSON.edit_contact_info} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    <ButtonAppBar header={localeObj.contact_plural} onBack={this.onBack} action="none" />
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.TOO_SHORT_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

ContactListComponent.propTypes = {
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  };

export default withStyles(styles)(ContactListComponent);
