import React from "react";
import "../../../styles/main.css";
import InputThemes from "../../../Themes/inputThemes";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import moment from "moment";
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import httpRequest from "../../../Services/httpRequest";
import MetricServices from "../../../Services/MetricsService";
import ArbiApiService from "../../../Services/ArbiApiService";
import localeService from "../../../Services/localeListService";
import SaveContactUtils from "../../../Services/SaveContactUtils";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import androidApiCalls from "../../../Services/androidApiCallsService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";

import NewPixContact from "./NewPixContact";
import NewPixTransfer from "./NewPixTransfer";
import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import CalenderPicker from "../../CommonUxComponents/CalenderPicker";
import { CSSTransition } from 'react-transition-group';

import AmountComponent from "../../CommonUxComponents/AmountComponent";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import InputPinPage from "../../CommonUxComponents/InputPinPage";
import ScheduleRecurrence from "../../CommonUxComponents/ScheduleRecurrenceBottomSheet";
import ReviewTemplate from "../../CommonUxComponents/ReviewTemplate";
import ReceiptTemplate from "../../CommonUxComponents/RecieptTemplate";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';

import ListContactDetails from "../../ContactComponents/ContactSupportComponents/ContactDetails";
import SelectOption from "../../CommonUxComponents/SelectOptionFromList";
import ListAllContacts from "../../ContactComponents/ContactSupportComponents/ListContactsComponent";
import BottomSheetAccount from "../../CommonUxComponents/BottomSheetAccount";
import TransferInputComponent from "../../TedTransferComponents/TransferInputComponent";
import TransferRecieverComponent from "../../TedTransferComponents/TransferRecieverComponent";

import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import NewUtilities from "../../../Services/NewUtilities";
import constantObjects from "../../../Services/Constants";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import InstantDialogComponent from "../../GamificationComponent/RewardComponents/InstantDialogComponent";
import GamificationService from "../../../Services/Gamification/GamificationService";
import { TASK_DIMO_PIX_CASHOUT } from "../../../Services/Gamification/GamificationTerms"
import ChatBotUtils from "../../NewUserProfileComponents/ChatComponents/ChatBotUtils";
import Log from "../../../Services/Log";

const theme1 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.pixSendComponent;
var localeObj = {};

class PixSend1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pixTransactionState: "transfer_to",
            transactionInfo: {},
            contactsData: {},
            detailsJson: {},
            pixDest: "",
            direction: "",
            amountEdited: false,
            header: "",
            info: {},
            reviewData: {},
            scheduledDate: new Date(),
            clearPassword: false,
            errorJson: {},
            pinExpiredSnackBarOpen: false,
            keyType: "text",
            description: "",
            isRecurrent: false,
            isRecurrentAllowed: false,
            today: new Date(),
            isEditDate: false,
            isFromTED: false,
            isFromTranfer: false,
            isFromContacts: false,
            toContacts: false,
            isContactsFromSend: false,
            isSentFromTransactionHistory: false,
            isEditFromTransactionHistory: false,
            multiSelection: false,
            additionalInfo: {},
            selectedContactData: {},
            scheduleId: "",
            balance: ImportantDetails.walletBalance ? ImportantDetails.walletBalance : -1,
            decimal: ImportantDetails.walletDecimal ? ImportantDetails.walletDecimal : "",
            saveDataAsContact: false,
            gamInstantPopup: false,
            gamProgramData: {},
            pixTypeBS: false
        }

        this.accountKey = "";
        this.minSheduledDate = new Date();
        this.maxSheduledDate = moment(moment().endOf('d')).add(11, 'M').utc();
    }
    componentDidMount() {
        document.body.style.overflow = 'hidden';
        androidApiCalls.enablePullToRefresh(false);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        this.setState({
            header: localeObj.pix,
            accountType: [{ "name": localeObj.account_checking, "value": 0 },
            { "name": localeObj.account_saving, "value": 2 },
            { "name": localeObj.account_payment, "value": 3 },
            { "name": localeObj.account_salary, "value": 1 }],
        })

        this.accountKey = this.props.location.accountKey ? this.props.location.accountKey : ImportantDetails.accountKey;

        if (this.props.location && this.props.location.from) {
            if (this.props.location.from === "pixTransactionHistory" || this.props.location.from === "mainTransactionHistory") {
                let transactionJSON = this.props.location.reviewData;
                transactionJSON["pixKey"] = this.props.location.additonalData.key;
                this.setState({
                    isSentFromTransactionHistory: true,
                    pixDest: "pix_key_selected",
                    additionalInfo: this.props.location.additonalData,
                    field: this.props.location.reviewData.transferType,
                    transactionInfo: transactionJSON
                })
                if (this.props.location.additonalData.isEditSchedule) {
                    this.setState({
                        pixTransactionState: "select_date",
                        isEditFromTransactionHistory: true,
                        scheduledDate: new Date(this.props.location.additonalData.scheduledDate)
                    })
                } else {
                    this.createReviewInfo(transactionJSON)
                }
            } else if (this.props.location.from === "sendToContacts" && this.props.location.type === "pixToKey") {
                this.setState({
                    isFromContacts: true,
                    pixDest: "pix_key_selected",
                    transactionInfo: this.props.location.reviewData,
                    pixTransactionState: "get_amount",
                    saveDataAsContact: false
                })
            } else if (this.props.location.from === "sendToContacts" && this.props.location.type === "pixToAccount") {
                this.setState({
                    isFromContacts: true,
                    pixDest: "pix_account_selected",
                    transactionInfo: this.props.location.reviewData,
                    pixTransactionState: "get_amount",
                    saveDataAsContact: false
                })
            } else if (this.props.location.from === "tedTransfer") {
                this.setState({
                    isFromTED: true,
                    pixDest: "pix_key_selected",
                    transactionInfo: this.props.location.reviewData,
                })
                this.createReviewInfo(this.props.location.reviewData)
            } else if (this.props.location.from === "addContactsPage" || this.props.location.from === "showContactsPage") {
                this.setState({
                    transactionInfo: this.props.location.amountData,
                    selectedContactData: this.props.location.contactData
                })
                this.viewDetails(this.props.location.contactData);
            } else {
                this.setState({
                    pixTransactionState: "transfer_to"
                })
            }
        }

        window.onBackPressed = () => {
            if (this.state.reset !== null && this.state.reset) {
                this.setState({ reset: false });
            }
            if (this.state.bottomSheetOpen !== null && this.state.bottomSheetOpen) {
                this.setState({ bottomSheetOpen: false });
            } else if (this.state.amountBottomSheet !== null && this.state.amountBottomSheet) {
                this.multiSelection(false);
            } else if (this.state.pixTypeBS) {
                this.pixBottomSheet(false)
            } else {
                this.onBack();
            }
        }
    }

    pixBottomSheet = (val) => {
        this.setState({ pixTypeBS : val})
    }

    handleLogging = () => {
        //Log.sDebug(logs, "PixSendComponent");
    }

    setTransactionInfo = (formInfo) => {
        if (formInfo.error) {
            this.handleLogging("Error occured: " + formInfo.error);
            androidApiCalls.hideProgressDialog();
            let jsonObj = {}
            jsonObj["title"] = localeObj.pix;
            jsonObj["header"] = localeObj.pix_failed;
            switch (formInfo.reason) {
                case "technical_issue":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "communication_issue":
                    jsonObj["description"] = localeObj.pix_communication_issue;
                    break;
                case "account_unavailable":
                    jsonObj["description"] = localeObj.pix_account_unavailable;
                    break;
                case "time_limit_exceeded":
                    jsonObj["description"] = localeObj.pix_time_limit_exceeded;
                    break;
                case "insufficient_balance":
                    jsonObj["description"] = localeObj.pix_amount_outofbound;
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
                case "transfer_to":
                    if (formInfo === localeObj.contact_plural) {
                        this.setState({
                            field: formInfo,
                            pixTransactionState: "list",
                            direction: "left",
                            header: localeObj.contact_plural,
                            saveDataAsContact: false,
                            toContacts: false,
                            sendToAccount: false
                        })
                    } else {
                        if (formInfo === 'account') {
                            this.setState({
                                sendToAccount: true,
                                field: formInfo
                            })
                        }
                        this.setState({
                            field: formInfo,
                            pixTransactionState: "get_amount",
                            direction: "left",
                            transactionInfo: formInfo,
                            toContacts: false,
                            saveDataAsContact: true
                        })
                    }
                    break;
                case "get_amount":
                    if (this.state.amountEdited) {
                        this.setState(prevState => ({
                            transactionInfo: {
                                ...prevState.transactionInfo,
                                "amount": formInfo["amount"],
                                "decimal": formInfo["decimal"],
                            },
                            reviewInfo: {
                                ...prevState.reviewInfo,
                                "amount": formInfo["amount"],
                                "decimal": formInfo["decimal"],
                                "description": this.state.description
                            },
                            pixTransactionState: "pix_review",
                            direction: "left",
                            header: localeObj.review_payment,
                            amountEdited: false
                        }))
                    } else if (this.state.isFromContacts) {
                        let contactsData = this.state.transactionInfo;
                        contactsData["amount"] = formInfo["amount"];
                        contactsData["decimal"] = formInfo["decimal"];
                        this.setState(prevState => ({
                            transactionInfo: {
                                ...prevState.transactionInfo,
                                "amount": formInfo["amount"],
                                "decimal": formInfo["decimal"],
                            }
                        }))
                        this.createReviewInfo(contactsData);
                    } else if (this.state.sendToAccount) {
                        if (this.state.field !== formInfo) {
                            this.setState(prevState => ({
                                transactionInfo: {
                                    ...prevState.transactionInfo,
                                    "amount": formInfo["amount"],
                                    "decimal": formInfo["decimal"],
                                    "name": "",
                                    "CPF": ""
                                }
                            }))
                        }
                        this.setState({
                            field: formInfo,
                            pixTransactionState: "institute",
                            direction: "left",
                            pixDest: "pix_account_selected",
                            saveDataAsContact: true
                        })
                    } else if (this.state.toContacts) {
                        let transactionData = this.state.transactionInfo;
                        transactionData["amount"] = formInfo["amount"];
                        transactionData["decimal"] = formInfo["decimal"];
                        this.setState(prevState => ({
                            transactionInfo: {
                                ...prevState.transactionInfo,
                                "amount": formInfo["amount"],
                                "decimal": formInfo["decimal"],
                            },
                            saveDataAsContact: false,
                            isFromTranfer: true
                        }))
                        this.createReviewInfo(transactionData);
                    } else {
                        let transactionData = this.state.transactionInfo;
                        transactionData["amount"] = formInfo["amount"];
                        transactionData["decimal"] = formInfo["decimal"];
                        this.setState(prevState => ({
                            transactionInfo: {
                                ...prevState.transactionInfo,
                                "amount": formInfo["amount"],
                                "decimal": formInfo["decimal"],
                            },
                            isFromTranfer: true,
                            pixDest: "pix_key_selected",
                            saveDataAsContact: true
                        }))
                        this.createReviewInfo(transactionData);
                    }
                    break;

                case "list":
                    this.setState({
                        selectedContactData: formInfo,
                        saveDataAsContact: false
                    });
                    this.viewDetails(formInfo);
                    break;
                case "view_details":
                    this.setState({ header: localeObj.pix_header })
                    if (formInfo.tipoChavePix === "AgenciaConta") {
                        //Log.sDebug("Selected Contact for PIX- Account")
                        this.getISPB(formInfo)
                    } else {
                        //Log.sDebug("Selected Contact for PIX- Key")
                        this.getKeyDetails(formInfo.chavePix);
                    }
                    break;
                case "pix_key_selected":
                    this.setState({
                        transactionInfo: formInfo
                    })
                    this.createReviewInfo(formInfo);
                    break;
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
                            "CPF": formInfo["cpf"],
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
                        field: localeObj.acc_no
                    }), () => {
                        this.createReviewInfo(this.state.transactionInfo, formInfo);
                    })
                    break;
                case "pix_review":
                    if (formInfo.editDate) {
                        this.setState({
                            pixTransactionState: "select_date",
                            header: localeObj.date,
                            direction: "left",
                            description: formInfo.description
                        })
                    } else {
                        delete formInfo['editDate'];
                        if (this.state.reviewInfo.scheduled) {
                            this.setState({
                                pixTransactionState: "verify_pin",
                                direction: "left",
                                info: formInfo,
                                header: localeObj.pix_authentication,
                                pixDest: "pix_key_scheduled",
                            })
                        } else {
                            this.setState({
                                pixTransactionState: "verify_pin",
                                direction: "left",
                                info: formInfo,
                                header: localeObj.pix_authentication,
                            })
                        }
                    }
                    break;
                case "select_date":
                    if (moment(formInfo.date).isSame(moment(this.state.today), 'day')) {
                        let transactionJSON = this.state.transactionInfo;
                        transactionJSON["scheduledReview"] = false;
                        this.setState({
                            transactionInfo: transactionJSON
                        })
                        this.createReviewInfo(transactionJSON);
                    } else {
                        let transactionJSON = this.state.transactionInfo;
                        transactionJSON["scheduledDate"] = moment(formInfo.date).format("DD/MM/YYYY");
                        transactionJSON["sendDate"] = moment(formInfo.date).toISOString();
                        transactionJSON["scheduledReview"] = true;
                        transactionJSON["recurrence"] = 1;
                        this.setState({
                            scheduledDate: formInfo.date,
                            transactionInfo: transactionJSON,
                            isEditDate: (this.state.isSentFromTransactionHistory || this.state.isEditFromTransactionHistory)
                        })
                        if (formInfo.monthly) {
                            this.setState({
                                pixTransactionState: "recurrence",
                                direction: "left"
                            })
                            MetricServices.onPageTransitionStart(PageNameJSON.recurrence);
                        } else {
                            if (this.state.isEditFromTransactionHistory) {
                                this.createReviewInfo(this.state.transactionInfo)
                            } else {
                                this.createReviewInfo(transactionJSON);
                            }
                        }
                    }
                    break;
                case "recurrence":
                    if (formInfo.action === "repeat") {
                        let transactionJSON = this.state.transactionInfo;
                        transactionJSON["recurrence"] = formInfo.repeatTime;
                        this.setState({
                            transactionInfo: transactionJSON,
                            isRecurrent: true
                        })
                        this.createReviewInfo(transactionJSON);
                    } else if (formInfo.action === "cancel") {
                        this.setState({
                            pixTransactionState: "select_date",
                            header: localeObj.date,
                            direction: "left",
                        })
                    }
                    break;
                case "scheduled_pix_review":
                    if (formInfo.editDate) {
                        this.setState({
                            pixTransactionState: "select_date",
                            header: localeObj.date,
                            direction: "left",
                        })
                    } else {
                        if (this.state.isSentFromTransactionHistory) {
                            delete formInfo['editDate'];
                            this.setState({
                                pixTransactionState: "verify_pin",
                                direction: "left",
                                info: formInfo,
                                header: localeObj.pix_authentication,
                                pixDest: "pix_key_selected",
                            })
                        } else {
                            delete formInfo['editDate'];
                            this.setState({
                                pixTransactionState: "verify_pin",
                                direction: "left",
                                info: formInfo,
                                header: localeObj.pix_authentication,
                                pixDest: "pix_key_scheduled",
                            })
                        }
                    }
                    break;
                case "verify_pin": {
                    let transactionJSON = { ...this.state.info };
                    delete transactionJSON['editDate'];
                    this.handleExecuteTransaction(formInfo, transactionJSON)
                    break;
                }
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

    selectKeyType = (type) => {
        if (type === "EVP") {
            return localeObj.evp_key;
        } else if (type === "PHONE") {
            return localeObj.phone_number;
        } else if (type === "EMAIL") {
            return localeObj.email;
        } else if (type === "CPF") {
            return localeObj.cpf;
        } else {
            return type;
        }
    }

    async getContactStatus(transactionInfo, accountNumber) {
        if (this.state.saveDataAsContact) {
            let typeOfContact = this.state.field === localeObj.acc_no ? "AgenciaConta" : transactionInfo["transferType"];
            let contactData = this.state.field === localeObj.acc_no ? (transactionInfo["account"] ? transactionInfo["account"] : accountNumber) : transactionInfo["pixKey"];
            await Promise.all([await SaveContactUtils.getSaveContactStaus(transactionInfo["CPF"].replace(/\.|-|\//g, ""), typeOfContact, contactData)]).then(values => {
                this.setState({
                    saveDataAsContact: values[0]
                })
            }).catch(err => {
                Log.sDebug("getContactStatus: error is: " + err);
                this.setState({
                    saveDataAsContact: true
                })
            })
        }
    }

    createReviewInfo(transactionInfo, accountNumber) {
        this.getContactStatus(transactionInfo, accountNumber);
        let reviewInfo = {
            "amount": transactionInfo["amount"],
            "decimal": transactionInfo["decimal"],
            "description": this.state.description,
            "receiver": {},
            "transferType": this.state.field === localeObj.acc_no ? localeObj.pix_account
                : this.selectKeyType(transactionInfo["transferType"]),
        }
        reviewInfo["receiver"][localeObj.name] = transactionInfo["name"];
        if (this.state.field === localeObj.acc_no) {
            if (transactionInfo["CPF"].replace(/\.|-|\//g, "").length <= 11) {
                reviewInfo["receiver"][localeObj.cpf] = NewUtilities.parseCPFOrCnpj(transactionInfo["CPF"], true)['displayCPF']
            } else {
                reviewInfo["receiver"][localeObj.cnpj] = NewUtilities.parseCPFOrCnpj(transactionInfo["CPF"], true)['displayCPF']
            }
        } else {
            reviewInfo["receiver"][localeObj.cpf] = GeneralUtilities.maskCpf(transactionInfo["CPF"])
        }
        reviewInfo["receiver"][localeObj.Institution] = transactionInfo["receiverInstitute"]

        if (!(Object.keys(this.state.info).length === 0)) {
            if (!GeneralUtilities.emptyValueCheck(this.state.info.Description)) {
                reviewInfo["description"] = this.state.info.Description;
            }
        }

        if (transactionInfo.scheduledReview) {
            reviewInfo["scheduled"] = true;
            reviewInfo["scheduledDate"] = transactionInfo.scheduledDate;
            reviewInfo["scheduleNoFormat"] = transactionInfo.sendDate;
            reviewInfo["recurrence"] = transactionInfo.recurrence;
            this.setState({
                pixTransactionState: "scheduled_pix_review",
                direction: "left",
                header: localeObj.review_payment,
                reviewInfo: reviewInfo
            })
        } else {
            this.setState({
                pixTransactionState: "pix_review",
                direction: "left",
                header: localeObj.review_payment,
                reviewInfo: reviewInfo
            })
        }
    }

    onHandleGoToHome = () => {
        if (GeneralUtilities.subDeepLinkCheck(this.props.location.subDeepLink)) {
            return;
        }

        const { fromComponent = null, state = {} } = this.props.location;

        if (!!this.props.location && !!this.props.location.launchUrl) {
            let cancelPath = this.props.location.launchUrl;
            this.handleLogging(`Going to ${cancelPath} page`);
            this.props.history.replace({ pathname: cancelPath, transition: "right" });
        } else if (this.props.location && this.props.location.from
            && this.props.location.from === "send") {
            this.handleLogging("Going to Wallet landing page");
            this.props.history.replace({ pathname: "/sendComponent", transition: "right", from: "pixSend" });
        } else if (this.props.location && this.props.location.from
            && this.props.location.from === "pix_page") {
            this.handleLogging("Going to Pix landing page");
            this.props.history.replace({ pathname: "/pixLandingComponent", transition: "right" });
        } else if (this.props.location && this.props.location.from
            && this.props.location.from === "pixTransactionHistory") {
            this.handleLogging("Going to Pix transaction histoty page");
            this.props.history.replace({ pathname: "/pixTransactionHistory", transition: "right" });
        } else if (this.props.location && this.props.location.from
            && this.props.location.from === "mainTransactionHistory") {
            this.handleLogging("Going to Main transaction histoty page");
            this.getBalanceAndMovetoMain();
        } else if (this.props.location && this.props.location.from
            && this.props.location.from === "sendToContacts") {
            this.handleLogging("Going to Send contacts page");
            this.props.history.replace({ pathname: "/contacts", transition: "right" });
        } else if (this.props.location && this.props.location.from
            && this.props.location.from === "tedTransfer") {
            this.handleLogging("Going to Ted transfer page");
            this.props.history.replace({
                pathname: "/tedTransfer",
                transition: "right",
                from: "pixToKeyContacts",
                contactData: this.props.location.contactDetails,
                amountData: {
                    "amount": this.state.transactionInfo.amount,
                    "decimal": this.state.transactionInfo.decimal
                }
            });
        } else if (fromComponent === PageNames.GamificationComponent.program_details) {
            this.handleLogging("Going to Rewards page");
            this.props.history.replace({ pathname: "/rewardsDetail", transition: "right", state });
        } else {
            this.handleLogging("Going back to previous page");
            GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
        }
    }

    getBalanceAndMovetoMain = () => {
        this.showProgressDialog();
        ArbiApiService.getUserBalance(PageNameJSON.get_amount)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse.success) {
                        let balanceInfo = processorResponse.balance.toString().split(".")
                        let balance = balanceInfo[0];
                        let decimal = NewUtilities.formatDecimal(balanceInfo[1])
                        this.props.history.replace({ pathname: "/newTransactionHistory", transition: "right", balanceData: { "balance": balance, "decimal": decimal }, from: "pixSchedule" });
                    }
                } else {
                    let jsonObj = {};
                    if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                        jsonObj["error"] = true;
                        jsonObj["errorCode"] = response.status;
                        jsonObj["reason"] = "communication_issue"
                        this.setTransactionInfo(jsonObj);
                    } else {
                        jsonObj["error"] = true;
                        jsonObj["errorCode"] = response.status;
                        jsonObj["reason"] = response.status !== 504 ? "technical_issue" : "time_limit_exceeded"
                        this.setTransactionInfo(jsonObj);
                    }
                }
            });
    }

    viewDetails = (json) => {
        this.showProgressDialog();
        let requestJson = {
            "contactCpf": json.cpf,
            "contactId": json.favId,
            "contactName": json.fullName,
            "nickName": json.nickName,
        }
        ArbiApiService.getContactDetails(requestJson, PageNameJSON.view_details).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processGetContactDetailsResponse(response.result);
                if (processedResponse.success) {
                    requestJson["contactDetails"] = processedResponse.contactDetails;
                    if (processedResponse.contactDetails.length === 0) {
                        this.setState({
                            message: localeObj.pix_technical_issue,
                            pinExpiredSnackBarOpen: true
                        })
                    } else {
                        this.setState({
                            detailsJson: requestJson,
                            pixTransactionState: "view_details",
                            direction: "left",
                            header: localeObj.contact_plural
                        })
                    }
                }
            } else {
                let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    getKeyDetails = (pixKey) => {
        this.showProgressDialog();
        ArbiApiService.getPixKeyDetails(pixKey, PageNameJSON.list).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResult = ArbiResponseHandler.processGetPixKeyDetailsResponse(response.result, pixKey, localeObj);
                if (processedResult.success) {
                    this.setState({
                        transactionInfo: {
                            "pixKey": pixKey,
                            "name": this.state.detailsJson.contactName,
                            "CPF": GeneralUtilities.maskCpf(this.state.detailsJson.contactCpf),
                            "transferType": processedResult.pixKeyDetails.pixKeyType,
                            "receiverInstitute": processedResult.pixKeyDetails.institute,
                        },
                        pixDest: "pix_key_selected",
                        pixTransactionState: "get_amount",
                        toContacts: true
                    })
                    // this.createReviewInfo(data);
                } else {
                    this.setState({
                        message: localeObj.pix_technical_issue,
                        pinExpiredSnackBarOpen: true
                    })
                }
            } else {
                let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
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
                return 1;
        }
    }

    getISPB = (finalDetails) => {
        this.showProgressDialog();
        ArbiApiService.getBankList("Ban").then(response => {
            if (response.success) {
                this.hideProgressDialog();
                let processedResponse = ArbiResponseHandler.processGetISPB(response.result, finalDetails.codigoOuISPB);
                if (processedResponse.success) {
                    this.setState({
                        transactionInfo: {
                            "name": this.state.detailsJson.contactName,
                            "CPF": this.state.detailsJson.contactCpf,
                            "agency": finalDetails.agencia,
                            "bank": finalDetails.codigoOuISPB,
                            "receiverIspb": processedResponse.ispbNum,
                            "transferType": localeObj.pix_account,
                            "receiverInstitute": finalDetails.nomeInstituicao,
                            "noAgency": false,
                            "myAccount": false,
                            "account": finalDetails.conta,
                            "accountType": this.getAccountType(finalDetails.tipoDeConta)
                        },
                        pixDest: "pix_account_selected",
                        pixTransactionState: "get_amount",
                        toContacts: true
                    })
                    // this.createReviewInfo(data);
                    return;
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.pix_account_unavailable
                    })
                }
            } else {
                this.hideProgressDialog();
                let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    editAmount = (desc) => {
        this.setState({
            pixTransactionState: "get_amount",
            direction: "left",
            header: localeObj.pix,
            description: desc,
            amountEdited: true
        })
    }

    onBack = () => {
        if (this.state.processing || this.state.multiSelection) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            let pageNameForBackKey = this.processPageName();
            MetricServices.onPageTransitionStop(pageNameForBackKey, PageState.back);
            switch (this.state.pixTransactionState) {
                case "transfer_to":
                case "error":
                    this.onHandleGoToHome();
                    break;
                case "select":
                    this.setState({
                        direction: "right",
                        pixTransactionState: "get_amount",
                    })
                    break;
                case "get_amount":
                    if (this.state.isFromContacts) {
                        this.setState({ header: localeObj.contact_plural })
                        this.onHandleGoToHome();
                    } else if (this.state.toContacts) {
                        this.setState({
                            direction: "right",
                            pixTransactionState: "view_details",
                            header: localeObj.contact_plural
                        })
                    } else {
                        this.setState({
                            direction: "right",
                            pixTransactionState: "transfer_to",
                            sendToAccount: false
                        })
                    }
                    break;
                case "list":
                    this.setState({
                        direction: "right",
                        pixTransactionState: "transfer_to",
                        header: localeObj.pix,
                        transactionInfo: ""
                    })
                    break;
                case "view_details":
                    this.setState({
                        direction: "right",
                        pixTransactionState: "list"
                    })
                    break;
                case "pix_key_selected":
                    this.setState({
                        direction: "right",
                        pixTransactionState: "transfer_to"
                    })
                    break;
                case "institute":
                    this.setState({
                        direction: "right",
                        pixTransactionState: "get_amount"
                    })
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
                case "pix_review":
                    if (this.state.isSentFromTransactionHistory) {
                        this.onHandleGoToHome();
                    } else if (this.state.isFromContacts) {
                        this.setState({
                            direction: "right",
                            pixTransactionState: "get_amount",
                            header: localeObj.pix_header
                        })
                    } else if (this.state.isFromTED) {
                        this.onHandleGoToHome();
                    } else if (this.state.isFromTranfer) {
                        this.setState({
                            direction: "right",
                            pixTransactionState: "get_amount",
                            header: localeObj.pix_header
                        })
                    } else {
                        const changeState = (this.state.field === localeObj.acc_no) ? "accountNumber" :
                            (this.state.field === localeObj.contact_plural) ? "view_details" : "pix_key_selected";
                        this.setState({
                            pixTransactionState: changeState,
                            direction: "right",
                            header: (this.state.field === localeObj.contact_plural) ? localeObj.contact_plural : localeObj.pix,
                        })
                    }
                    break;
                case "select_date":
                    if (this.state.isEditFromTransactionHistory && this.state.isSentFromTransactionHistory) {
                        this.onHandleGoToHome();
                    } else {
                        this.setState({
                            direction: "right",
                        });
                        this.createReviewInfo(this.state.transactionInfo);
                    }
                    break;
                case "recurrence":
                    this.setState({
                        pixTransactionState: "select_date",
                        direction: "right",
                        isRecurrent: false
                    })
                    break;
                case "scheduled_pix_review":
                    if (this.state.isEditFromTransactionHistory && this.state.isSentFromTransactionHistory) {
                        this.onHandleGoToHome();
                    } else if (this.state.isFromContacts) {
                        this.setState({
                            direction: "right",
                            pixTransactionState: "get_amount"
                        })
                    } else if (this.state.isFromTED) {
                        this.onHandleGoToHome();
                    } else if (this.state.transactionInfo.scheduledReview) {
                        delete this.state.transactionInfo['scheduledReview'];
                        this.setState({
                            direction: "right",
                            pixTransactionState: "select_date",
                        })
                    } else {
                        let keyState = (this.state.field === localeObj.acc_no) ? "accountNumber" :
                            (this.state.field === localeObj.contact_plural) ? "view_details" : "pix_key_selected";
                        this.setState({
                            pixTransactionState: keyState,
                            direction: "right",
                            header: (this.state.field === localeObj.contact_plural) ? localeObj.contact_plural : localeObj.pix
                        })
                    }
                    break;
                case "verify_pin":
                    if (this.state.pixDest === "pix_key_scheduled") {
                        this.setState({
                            pixTransactionState: "scheduled_pix_review",
                            direction: "right",
                            header: localeObj.review_payment,
                        })
                    } else {
                        this.setState({
                            pixTransactionState: "pix_review",
                            direction: "right",
                            header: localeObj.review_payment,
                        })
                    }
                    break;
                case "pix_receipt":
                    if (this.state.gamInstantPopup === true) {
                        this.setState({ gamInstantPopup: false });
                        return;
                    }
                    this.onCancel();
                    break;
                default:
                    break;
            }
        }
    }

    processPageName = () => {
        this.handleLogging("Processing Page Name for meterics");
        let pageName = "";
        switch (this.state.pixTransactionState) {
            case "pix_review":
                if (this.state.pixDest === "pix_key_selected") {
                    pageName = PageNameJSON.pix_review_for_key;
                } else if (this.state.pixDest === "pix_account_selected") {
                    pageName = PageNameJSON.pix_review_for_account;
                }
                break;
            case "verify_pin":
                if (this.state.pixDest === "pix_key_selected") {
                    pageName = PageNameJSON.verify_pin_for_key;
                } else if (this.state.pixDest === "pix_account_selected") {
                    pageName = PageNameJSON.verify_pin_for_account;
                } else if (this.state.pixDest === "pix_key_scheduled") {
                    pageName = PageNameJSON.verify_pin_for_account;
                }
                break;
            case "pix_receipt":
                if (this.state.pixDest === "pix_key_selected") {
                    pageName = PageNameJSON.pix_receipt_for_key;
                } else if (this.state.pixDest === "pix_account_selected") {
                    pageName = PageNameJSON.pix_receipt_for_account;
                } else if (this.state.pixDest === "pix_key_scheduled") {
                    pageName = PageNameJSON.pix_receipt_for_schedule;
                }
                break;
            default:
                pageName = PageNameJSON[this.state.pixTransactionState];
                break;
        }
        return pageName;
    }

    handleExecuteTransaction = (val, dataJSON) => {
        let jsonObject = {};
        jsonObject = this.state.transactionInfo;
        jsonObject["pin"] = val;
        jsonObject["description"] = this.state.info.Description;
        this.setState({
            info: dataJSON
        })
        if (this.state.pixDest === "pix_key_selected") {
            if (this.state.isEditDate && this.state.isSentFromTransactionHistory) {
                jsonObject["txnId"] = this.state.additionalInfo.scheduleId;
                this.handleLogging("Pay now option selected and user clicked on edit date, hence transaction has been reschedduled")
                this.pixEditScheduleToAKey(jsonObject);
            } else if (this.state.isSentFromTransactionHistory) {
                this.handleLogging("Pay now option selected, hence scheduled has been cancelled")
                this.cancelScheduled(jsonObject);
            } else {
                this.handleLogging("Starting Pix send to a key");
                this.pixPayToAKey(jsonObject);
            }
        } else if (this.state.pixDest === "pix_account_selected") {
            this.handleLogging("Starting Pix send to a account");
            this.pixPayToAAccount(jsonObject);
        } else if (this.state.pixDest === "pix_key_scheduled") {
            this.handleLogging("Scheduling Pix send to a key");
            this.pixScheduleToAKey(jsonObject);
        }
    }

    onGetBalance = async () => {
        await GeneralUtilities.onCheckBalance().then(() => {
            //Log.sDebug(balanceResponse, PageNameJSON.pix_receipt_for_key);
        });
    }

    pixPayToAKey = (jsonObject) => {
        this.showProgressDialog();
        ArbiApiService.pixTransferForAKey(jsonObject, PageNameJSON.verify_pin_for_key).then(response => {
            if (response.success) {
                this.onGetBalance();
                let processedResponse = ArbiResponseHandler.processpixTransferForKeyResponse(response.result, localeObj);
                if (processedResponse.success) {
                    processedResponse.transactionDetails["date"] = moment(processedResponse.date).format('DD/MM/YYYY');
                    processedResponse.transactionDetails["hour"] = moment(processedResponse.date).format('HH');
                    processedResponse.transactionDetails["mins"] = moment(processedResponse.date).format('mm');
                    processedResponse.transactionDetails["fileName"] = "comprovante_Pix_";
                    this.setState(prevState => ({
                        info: {
                            ...prevState.info,
                            [localeObj.transaction_code]: processedResponse.transactionDetails.externalTransactionCode,
                            [localeObj.pix_type]: localeObj.pix,
                        },
                        pixTransactionState: "pix_receipt",
                        direction: "left",
                        pixTransactionInfo: processedResponse.transactionDetails
                    }))
                    this.checkForInstantRewardStatus(jsonObject);
                    this.hideProgressDialog();
                } else {
                    this.hideProgressDialog();
                    this.handleLogging("Pix Send to Key - failed ");
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }

            } else {
                this.hideProgressDialog();
                let jsonObj = {};
                this.handleLogging("Pix Send to Key - failed");
                if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = "communication_issue"
                    this.setTransactionInfo(jsonObj);
                } else if ('' + response.result.code === "10007") {
                    this.setState({ bottomSheetOpen: true });
                } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                    this.setState({ reset: true });
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
    }

    checkForInstantRewardStatus = (jsonObject) => {
        try {
            setTimeout(() => {
                const amount = jsonObject["amount"] + "." + jsonObject["decimal"];
                const gamProgramData = GamificationService.CheckForTaskCompletion(TASK_DIMO_PIX_CASHOUT, amount);

                if (GeneralUtilities.isNotEmpty(gamProgramData)) {
                    GeneralUtilities.sendActionMetrics(this.processPageName(), constantObjects.Gamification.showInstantDialog);
                    this.setState({ gamInstantPopup: true, gamProgramData });
                }
            }, 2000);
        } catch (err) {
            this.handleLogging("Exception in checkForInstantRewardStatus " + err)
        }
    }

    cancelScheduled = (jsonObject) => {
        this.showProgressDialog();
        let jsonForCancel = {
            "pin": jsonObject.pin,
            "scheduleId": this.state.additionalInfo.scheduleId
        }
        ArbiApiService.cancelPixScheduledTransactions(jsonForCancel, PageNameJSON.pix_receipt_for_schedule).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processCancelPixScheduledTransactions(response.result);
                if (processedResponse.success) {
                    this.handleLogging("Cancel Schedule", "Pix Cancel Schedule Success");
                    this.pixPayToAKey(jsonObject);
                } else {
                    this.hideProgressDialog();
                    this.handleLogging("Cancel Schedule", "Cancel Schedule - failed ");
                    let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        snackBarOpen: true,
                        message: errorMesaage
                    })
                }
            } else {
                let jsonObj = {};
                this.hideProgressDialog();
                if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = "communication_issue";
                    this.setTransactionInfo(jsonObj);
                } else if ('' + response.result.code === "10007") {
                    this.setState({ bottomSheetOpen: true });
                } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                    this.setState({ reset: true });
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
    }

    pixPayToAAccount = (jsonObject) => {
        this.showProgressDialog();
        ArbiApiService.pixTransferForAAccount(jsonObject, PageNameJSON.verify_pin_for_account).then(response => {

            if (response.success) {
                this.onGetBalance();
                let processedResponse = ArbiResponseHandler.processpixTransferForAccountResponse(response.result, localeObj);
                if (processedResponse.success) {
                    this.handleLogging("Pix Send to Account - success ");
                    processedResponse.transactionDetails["date"] = moment(processedResponse.date).format('DD/MM/YYYY');
                    processedResponse.transactionDetails["hour"] = moment(processedResponse.date).format('HH');
                    processedResponse.transactionDetails["mins"] = moment(processedResponse.date).format('mm');
                    processedResponse.transactionDetails["fileName"] = "comprovante_Pix_";
                    this.setState(prevState => ({
                        info: {
                            ...prevState.info,
                            [localeObj.transaction_code]: processedResponse.transactionDetails.externalTransactionCode,
                            [localeObj.pix_type]: localeObj.pix_account,
                        },
                        pixTransactionState: "pix_receipt",
                        direction: "left",
                        pixTransactionInfo: processedResponse.transactionDetails,
                    }))
                    this.checkForInstantRewardStatus(jsonObject);
                    this.hideProgressDialog();
                } else {
                    this.hideProgressDialog();
                    this.handleLogging("Pix Send to Account - failed ");
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                this.hideProgressDialog();
                this.handleLogging("Pix Send to Account - failed ");
                let jsonObj = {};
                this.handleLogging("Pix Send to Key - failed");
                if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = "communication_issue"
                    this.setTransactionInfo(jsonObj);
                } else if ('' + response.result.code === "10007") {
                    this.setState({ bottomSheetOpen: true })
                } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                    this.setState({ reset: true })
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
    }

    pixScheduleToAKey = (jsonObject) => {
        this.showProgressDialog();
        ArbiApiService.pixScheduleTransferForKey(jsonObject, PageNameJSON.scheduled_pix_review).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                this.onGetBalance();
                let processedResponse = ArbiResponseHandler.processpixScheduleTransferForKeyResponse(response.result, localeObj);
                if (processedResponse.success) {
                    processedResponse.transactionDetails["date"] = moment(this.state.reviewInfo.scheduleNoFormat).format('DD/MM/YYYY');
                    processedResponse.transactionDetails["hour"] = moment(this.state.reviewInfo.scheduleNoFormat).format('HH');
                    processedResponse.transactionDetails["mins"] = moment(this.state.reviewInfo.scheduleNoFormat).format('mm');
                    processedResponse.transactionDetails["fileName"] = "comprovante_Pix_";
                    processedResponse.transactionDetails["scheduled_date"] = this.state.reviewInfo.scheduleNoFormat;
                    processedResponse.transactionDetails["recurrence"] = this.state.reviewInfo.recurrence;
                    this.addRecurrence(this.state.transactionInfo.recurrence);
                    this.setState(prevState => ({
                        info: {
                            ...prevState.info,
                            [localeObj.transaction_code]: processedResponse.transactionDetails.transactionCode,
                            [localeObj.pix_type]: localeObj.pix,
                        },
                        pixTransactionState: "pix_receipt",
                        direction: "left",
                        pixTransactionInfo: processedResponse.transactionDetails
                    }))
                } else {
                    this.handleLogging("Pix Schedule transfer to Key - failed ");
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                let jsonObj = {};
                this.handleLogging("Pix Schedule transfer to Key - failed");
                if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = "communication_issue"
                    this.setTransactionInfo(jsonObj);
                } else if ('' + response.result.code === "10007") {
                    this.setState({ bottomSheetOpen: true })
                } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                    this.setState({ reset: true })
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
    }

    pixEditScheduleToAKey = (jsonObject) => {
        this.showProgressDialog();
        ArbiApiService.pixEditScheduleForKey(jsonObject, PageNameJSON.pix_review_for_key).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                this.onGetBalance();
                let processedResponse = ArbiResponseHandler.processPixEditScheduleForKeyResponse(response.result, localeObj);
                if (processedResponse.success) {
                    processedResponse.transactionDetails["date"] = moment(processedResponse.date).format('DD/MM/YYYY');
                    processedResponse.transactionDetails["hour"] = moment(processedResponse.date).format('HH');
                    processedResponse.transactionDetails["mins"] = moment(processedResponse.date).format('mm');
                    processedResponse.transactionDetails["fileName"] = "comprovante_Pix_";
                    processedResponse.transactionDetails["scheduled_date"] = this.state.reviewInfo.scheduleNoFormat;
                    processedResponse.transactionDetails["recurrence"] = this.state.reviewInfo.recurrence;

                    processedResponse.transactionDetails["receiver"] = this.state.reviewInfo.receiver;
                    processedResponse.transactionDetails["payer"] = {
                        [localeObj.name]: ImportantDetails.userName,
                        [localeObj.cpf]: GeneralUtilities.maskCpf(ImportantDetails.cpf),
                        [localeObj.Institution]: localeObj.bank_name
                    }
                    this.addRecurrence(this.state.transactionInfo.recurrence);
                    this.setState(prevState => ({
                        info: {
                            ...prevState.info,
                            [localeObj.transaction_code]: processedResponse.transactionDetails.transactionCode,
                            [localeObj.pix_type]: localeObj.pix,
                        },
                        pixTransactionState: "pix_receipt",
                        direction: "left",
                        pixTransactionInfo: processedResponse.transactionDetails
                    }))
                } else {
                    this.handleLogging("Pix Schedule transfer to Key - failed ");
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                let jsonObj = {};
                this.handleLogging("Pix Schedule transfer to Key - failed");
                if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = "communication_issue"
                    this.setTransactionInfo(jsonObj);
                } else if ('' + response.result.code === "10007") {
                    this.setState({ bottomSheetOpen: true })
                } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                    this.setState({ reset: true })
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
    }

    addRecurrence = (val) => {
        if (!GeneralUtilities.emptyValueCheck(val) && val > 1) {
            this.setState(prevState => ({
                info: {
                    ...prevState.info,
                    [localeObj.repeat_schedule]: val + " " + GeneralUtilities.captitalizeStrings(localeObj.month_plural)
                },
            }))
        }
        return;
    }

    addContact = (jsonObj) => {
        if (this.state.pixTransactionState === "list") {
            this.props.history.replace({ pathname: "/addContact", transition: "right" });
        } else {
            this.props.history.replace({
                pathname: "/addContact",
                from: "pixSend",
                name: jsonObj.name,
                cpfAdded: jsonObj.cpfAdded,
                amount: this.state.transactionInfo["amount"],
                decimal: this.state.transactionInfo["decimal"],
                details: this.state.selectedContactData
            })
        }
    }

    editContact = (jsonObj) => {
        this.props.history.replace({
            pathname: "/contacts",
            from: "pixSend",
            detailsJSON: this.state.detailsJson,
            details: this.state.selectedContactData,
            name: jsonObj.name,
            cpfAdded: jsonObj.cpfAdded,
            amount: this.state.transactionInfo["amount"],
            decimal: this.state.transactionInfo["decimal"],
        })
    }

    deleteCompleted = () => {
        this.setState({
            pixTransactionState: "list",
            direction: "right"
        })
    }

    saveContacts = () => {
        let event = {
            eventType: constantObjects.saveContactAfterTransaction,
            page_name: PageNameJSON[this.state.pixTransactionState],
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());

        if (this.state.pixDest === "pix_account_selected") {
            let finalInfo = this.state.transactionInfo;
            finalInfo["transferType"] = "ACCOUNT";
            finalInfo["name"] = this.state.transactionInfo.name;
            finalInfo["CPF"] = this.state.transactionInfo['CPF'].replace(/\.|-|\//g, "");
            finalInfo["cpf"] = this.state.transactionInfo['CPF']
            this.props.history.replace({
                pathname: "/saveContactFromTransaction",
                from: "pixAccount",
                isFullAccountInfo: true,
                contactData: finalInfo,
                transition: "left"
            });
        } else {
            let finalInfo = this.state.transactionInfo;
            finalInfo["name"] = this.state.transactionInfo.name;
            finalInfo["CPF"] = this.state.transactionInfo['CPF'].replace(/\.|-|\//g, "");
            finalInfo["cpf"] = this.state.transactionInfo['CPF']
            this.props.history.replace({
                pathname: "/saveContactFromTransaction",
                from: "pixKey",
                isFullAccountInfo: false,
                contactData: finalInfo,
                transition: "left"
            });
        }
    }

    multiSelection = (value) => {
        this.setState({
            amountBottomSheet: value
        })
    }

    onCancel = () => {
        let pageNameForBackKey = this.processPageName();
        MetricServices.onPageTransitionStop(pageNameForBackKey, PageState.cancel);
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    OtherTransaction = () => {
        this.props.history.replace({ pathname: "/pixLandingComponent", transition: "right" });
    }

    onSecondary = () => {
        this.setState({
            bottomSheetOpen: false,
            clearPassword: true
        })
    }

    onPrimary = () => {
        this.setState({
            bottomSheetOpen: false,
            clearPassword: true
        })
    }

    closeSnackBar = () => {
        this.setState({ pinExpiredSnackBarOpen: false })
    }

    forgot_passcode = () => {
        this.setState({
            bottomSheetOpen: false,
            reset: false
        })
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    handleClose = () => {
        this.props.history.replace({
            pathname: '/pixSendComponent',
            from: "send"
        });
        MetricServices.onPageTransitionStop(PageNameJSON.accountType, PageState.back);
        return;
    }

    goToChatbot = () => {
        ChatBotUtils.insideChatBot(constantObjects.pix_error_entrypoint);
        this.props.history.replace({ pathname: "/chat", transition: "right" })
    }

    multipleCheckSelection = (field) => {
        this.setState({
            multiSelection: field
        })
    }

    render() {
        let currentState = this.state.pixTransactionState;
        const { classes } = this.props;
        let bottomSheet = this.state.amountBottomSheet;
        return (
            <div style={{ overflowX: "hidden" }}>
                {currentState !== "error" && currentState !== "pix_receipt" && currentState !== "recurrence"
                    && currentState !== "transaction_schedule" &&
                    <div>
                        <ButtonAppBar header={this.state.header} onBack={this.onBack} action="none" />

                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "transfer_to" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "transfer_to" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "transfer_to" && <NewPixTransfer requiredInfo={this.state.transactionInfo} pixTypeBs={this.state.pixTypeBS} pixBottomSheet={this.pixBottomSheet} setTransactionInfo={this.setTransactionInfo} field={this.state.field}
                            confirmKey={this.getKeyDetails} componentName={PageNameJSON.transfer_to} />}
                    </div>
                </CSSTransition>
                {/* <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "select" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "select" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "select" && <SelectMenuOption type="PIX" header={localeObj.method_list} description={localeObj.pix_choose_method} recieveField={this.setTransactionInfo}
                            value={this.state.field} componentName={PageNameJSON.select} />}
                    </div>
                </CSSTransition> */}
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "list" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "list" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "list" && <ListAllContacts confirm={this.setTransactionInfo} componentName={PageNameJSON.list} showAddOption={true} add={this.addContact} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "view_details" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "view_details" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "view_details" && <ListContactDetails contact={this.state.detailsJson} handleSend={this.setTransactionInfo} componentName={PageNameJSON.view_details}
                            add={this.addContact} fromSend={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "get_amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "get_amount" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "get_amount" && <AmountComponent requiredInfo={this.state.transactionInfo} multiSelection={this.multiSelection} amountBottomSheet={bottomSheet} setTransactionInfo={this.setTransactionInfo} feature="pix_send"
                            field={this.state.field} componentName={PageNameJSON.get_amount} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "pix_key_selected" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "pix_key_selected" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "pix_key_selected" && <NewPixContact requiredInfo={this.state.transactionInfo} setTransactionInfo={this.setTransactionInfo} field={this.state.field}
                            type={this.state.keyType} componentName={PageNameJSON.pix_key_selected} multipleSelection={this.multipleCheckSelection} />}
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
                            componentName={PageNameJSON.beneficiary} refer="pix" />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "agency" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "agency" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "agency" && <TransferInputComponent requiredInfo={this.state.transactionInfo} field={localeObj.agency} from={GeneralUtilities.TRANSACTION_TYPES.PIX} recieveField={this.setTransactionInfo}
                            value={this.state.transactionInfo.agency} componentName={PageNameJSON.agency} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "accountNumber" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "accountNumber" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "accountNumber" && <TransferInputComponent requiredInfo={this.state.transactionInfo} field={localeObj.acc_no} from={GeneralUtilities.TRANSACTION_TYPES.PIX} recieveField={this.setTransactionInfo}
                            value={this.state.transactionInfo.account} componentName={PageNameJSON.accountNumber} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "pix_review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "pix_review" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "pix_review" && <ReviewTemplate requiredInfo={this.state.reviewInfo} setTransactionInfo={this.setTransactionInfo} back={this.editAmount}
                            header={localeObj.pix_sending} detailHeader={localeObj.destination} btnText={localeObj.next}
                            componentName={this.state.pixDest === "pix_key_selected" ? PageNameJSON.pix_review_for_key : PageNameJSON.pix_review_for_account}
                            showScheduleOption={this.state.pixDest === "pix_key_selected" ? true : false} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "select_date" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "select_date" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "select_date" && <CalenderPicker value={this.state.scheduledDate} minDate={this.minSheduledDate} maxDate={this.maxSheduledDate} confirm={this.setTransactionInfo}
                            header={localeObj.select_date} isSchedule={true} checkBox={localeObj.regular_payment} regular={false}
                            primaryButtonText={localeObj.next} componentName={PageNameJSON.select_date} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "recurrence" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "recurrence" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "recurrence" && <ScheduleRecurrence selectedMonth={this.state.scheduledDate} recurrenceTime={this.setTransactionInfo} cancel={this.setTransactionInfo}
                            componentName={PageNameJSON.recurrence} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "scheduled_pix_review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "scheduled_pix_review" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "scheduled_pix_review" && <ReviewTemplate requiredInfo={this.state.reviewInfo} setTransactionInfo={this.setTransactionInfo} back={this.editAmount}
                            header={localeObj.pix_sending} detailHeader={localeObj.destination} btnText={localeObj.next} dateChange={GeneralUtilities.emptyValueCheck(this.state.transactionInfo.sendDate) ? "" : this.state.transactionInfo.sendDate}
                            componentName={PageNameJSON.scheduled_pix_review} showScheduleOption={false} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "verify_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "verify_pin" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "verify_pin" && <InputPinPage confirm={this.setTransactionInfo} clearPassword={this.state.clearPassword}
                            componentName={this.state.pixDest === "pix_key_selected" ? PageNameJSON.verify_pin_for_key : (this.state.pixDest === "pix_account_selected" ? PageNameJSON.verify_pin_for_account : PageNameJSON.verify_pin_for_schedule)} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "pix_receipt" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "pix_receipt" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_receipt} onCancel={this.onCancel} action="cancel" inverse="true" />
                        {currentState === "pix_receipt" && <ReceiptTemplate requiredInfo={this.state.pixTransactionInfo} confirm={this.onCancel} OtherTransaction={this.OtherTransaction} info={this.state.info} onBack={this.onBack}
                            header={this.state.pixDest === "pix_key_scheduled" ? localeObj.you_scheduled : localeObj.pix_you_sent} btnText={localeObj.back_home} schedule={(this.state.pixDest === "pix_key_scheduled" ? true : false) || this.state.isEditDate}
                            componentName={this.state.pixDest === "pix_key_selected" ? PageNameJSON.pix_receipt_for_key : (this.state.pixDest === "pix_account_selected" ? PageNameJSON.pix_receipt_for_account : PageNameJSON.pix_receipt_for_schedule)} showSaveContact={this.state.saveDataAsContact}
                            saveContact={this.saveContacts} />}
                        {this.state.gamInstantPopup && <InstantDialogComponent gamProgramData={this.state.gamProgramData} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "error" && <PixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.onHandleGoToHome} componentName={PageNameJSON.error} goToChatbot={this.goToChatbot} isPixSend={true} />}
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
                                    {localeObj.wrong_passcode}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.wrong_passcode_header}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.try} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondary} />
                            <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.forgot_passcode}>
                                {localeObj.forgot_passcode}
                            </div>
                        </div>
                    </Drawer>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.reset}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.reset_password}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.pin_expired}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.reset_password} onCheck={this.forgot_passcode} />
                        </div>
                    </Drawer>
                </div>
            </div>
        );
    }
}

PixSend1.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};


/*
Add condition -> (this.selectKeyType(this.state.transactionInfo["transferType"]) !== "CPF" || this.state.isSentFromTransactionHistory) ? false : true
for enabling regular payment to state "select_date" 
*/
export default withStyles(styles)(PixSend1);