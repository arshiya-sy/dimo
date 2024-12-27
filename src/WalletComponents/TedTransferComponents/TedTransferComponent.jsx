import React from "react";
import moment from "moment";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";
import InputThemes from "../../Themes/inputThemes";
import { CSSTransition } from 'react-transition-group';

import Log from "../../Services/Log";
import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import httpRequest from "../../Services/httpRequest";
import NewUtilities from "../../Services/NewUtilities";
import constantObjects from "../../Services/Constants";
import MetricServices from "../../Services/MetricsService";
import ArbiApiService from "../../Services/ArbiApiService";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCalls from "../../Services/androidApiCallsService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";

import InputPinPage from "../CommonUxComponents/InputPinPage";
import CalenderPicker from "../CommonUxComponents/CalenderPicker";
import ReviewTemplate from "../CommonUxComponents/ReviewTemplate";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import RecieptTemplate from "../CommonUxComponents/RecieptTemplate";
import AmountComponent from "../CommonUxComponents/AmountComponent";
import SelectOption from "../CommonUxComponents/SelectOptionFromList";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import BottomSheetAccount from "../CommonUxComponents/BottomSheetAccount";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import ScheduleRecurrence from "../CommonUxComponents/ScheduleRecurrenceBottomSheet";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import Drawer from '@material-ui/core/Drawer';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider } from '@material-ui/core/styles';

import TransferInputComponent from "./TransferInputComponent";
import TransferRecieverComponent from "./TransferRecieverComponent";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import ListContactDetails from "../ContactComponents/ContactSupportComponents/ContactDetails";
import ListAllContacts from "../ContactComponents/ContactSupportComponents/ListContactsComponent";
import SaveContactUtils from "../../Services/SaveContactUtils";

const theme1 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.tedComponent;
var localeObj = {};

class TedTransferComponent extends React.Component {

    constructor(props) {
        super(props);
        this.styles = {
            outerStyle: {
                width: "100%",
            },
        }
        this.state = {
            formInfo: (this.props.location && this.props.location.from
                && this.props.location.from === "pixSend") ? 0 : "",
            transcationState: "amount",
            info: {},
            header: "",
            direction: "",
            transactionInfo: {},
            detailsJson: {},
            selectedContactData: {},
            clearPassword: false,
            errorJson: {},
            additionalData: {},
            scheduledDate: new Date(),
            isScheduled: false,
            pinExpiredSnackBarOpen: false,
            isFromTransactionHistory: false,
            isEditSchedule: false,
            prevReviewPage: "",
            accNum: "",
            balance: ImportantDetails.walletBalance ? ImportantDetails.walletBalance : -1,
            decimal: ImportantDetails.walletDecimal ? ImportantDetails.walletDecimal : "",
            selectFromContact: false,
            isFromContact: false,
            minSheduledDate: new Date(),
            maxSheduledDate: moment().endOf("day").add(11, 'M').utc(),
            hasDateChanged: false,
            saveDataAsContact: false,
        };
        this.accountKey = "";
        this.onCompleteHandler = this.onCompleteHandler.bind(this);
        this.complete = this.complete.bind(this);
        this.arbiCode = "213";
        this.transferOptions = [];
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        this.setState({
            header: localeObj.transfer_money,
            accountType: [{ "name": localeObj.account_checking, "value": 1 },
            { "name": localeObj.account_saving, "value": 2 },
            { "name": localeObj.account_payment, "value": 3 }],
            pathsToSend: [
                { name: localeObj.contact_select, "value": 1 },
                { name: localeObj.contact_add_new_account, "value": 2 }]
        });

        this.accountKey = this.props.location.accountKey ? this.props.location.accountKey : ImportantDetails.accountKey;

        if (this.props.location && this.props.location.from && this.props.location.from === "mainTransactionHistory") {
            this.setState({
                isFromTransactionHistory: true,
                scheduledDate: this.props.location.additonalData.scheduledDate,
                isEditSchedule: this.props.location.additonalData.isEditSchedule,
                transactionInfo: this.props.location.reviewData,
                additionalData: this.props.location.additonalData,
                isScheduled: !this.props.location.additonalData.isEditSchedule,
                //maxSheduledDate: this.props.location.additonalData.finalEditDate (Inlcude when the date is available in proper format)
            });
            this.onPayAndEditNow();
        } else if (this.props.location && this.props.location.from && this.props.location.from === "sendToContacts") {
            this.setState({
                isFromContact: true,
                transactionInfo: this.props.location.reviewData,
                accNum: this.props.location.reviewData.account
            });
            this.setState({
                transcationState: "amount",
                direction: "left"
            })
        } else if ((this.props.location && this.props.location.from) && (this.props.location.from === "pixToKeyContacts" ||
            this.props.location.from === "addContactsPage" || this.props.location.from === "showContactsPage")) {
            this.setState({
                transactionInfo: this.props.location.amountData,
                selectedContactData: this.props.location.contactData
            })
            this.viewDetails(this.props.location.contactData);
        } else {
            this.setState({
                transcationState: "amount",
                direction: "left"
            })
        }

        window.onBackPressed = () => {
            if (this.state.bottomSheetOpen !== null && this.state.bottomSheetOpen) {
                this.setState({ bottomSheetOpen: false });
                return;
            } else if (this.state.reset !== null && this.state.reset) {
                this.setState({ reset: false });
                return;
            } else if(this.state.amountBottomSheet !== null && this.state.amountBottomSheet){
                this.multiSelection(false);
            } else {
                this.back();
            }
        }
    }

    onPayAndEditNow() {
        if (this.props.location.additonalData.isEditSchedule) {
            this.setState({
                transcationState: "select_date",
                direction: "left",
                info: this.props.location.reviewData,
                header: localeObj.date,
            })
        } else {
            this.setState({
                transactionInfo: this.props.location.reviewData,
            }, ()=>{
                this.createReviewInfo();
            });
        }
    }

    complete = () => {
        this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
    }

    OtherTransaction = () => {
        this.props.history.replace({ pathname: "/sendComponent", transition: "right", from: "ted" });
    }

    closeSnackBar = () => {
        this.setState({ pinExpiredSnackBarOpen: false })
    }

    setTransactionInfo = (formInfo) => {
        if (formInfo.error) {
            androidApiCalls.hideProgressDialog();
            let jsonObj = {}
            jsonObj["title"] = localeObj.transfer_money;
            jsonObj["header"] = localeObj.ted_failed;
            switch (formInfo.reason) {
                case "technical_issue":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "communication_issue":
                    jsonObj["description"] = localeObj.pix_communication_issue;
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
                case "tariff_fetch_failed":
                    jsonObj["description"] = localeObj.tariff_failed;
                    break;
                default:
                    jsonObj["description"] = formInfo.reason;
                    break;
            }
            this.setState({
                transcationState: "error",
                direction: "left",
                header: "Error",
                errorJson: jsonObj,
                processing: false
            })
        } else {
            switch (this.state.transcationState) {
                case "amount":
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
                            },
                        }))
                        if (this.state.prevReviewPage === "review") {
                            this.setState({
                                transcationState: "review",
                                direction: "left",
                                header: localeObj.review_payment,
                                amountEdited: false
                            });
                        } else {
                            this.setState({
                                transcationState: "scheduled_ted_review",
                                direction: "left",
                                header: localeObj.review_payment,
                                amountEdited: false
                            });
                        }
                    } else if (this.state.isFromContact) {
                        this.setState(prevState => ({
                            transactionInfo: {
                                ...prevState.transactionInfo,
                                "amount": formInfo["amount"],
                                "decimal": formInfo["decimal"],
                            }
                        }))
                        this.createReviewInfo();
                    } else {
                        MetricServices.onPageTransitionStart(PageNameJSON.path_option);
                        this.setState({
                            transcationState: "path_option",
                            direction: "left",
                            transactionInfo: formInfo,
                        })
                    }
                    break;
                case "path_option":
                    if (formInfo === 2) {
                        if (this.props.location && this.props.location.from
                            && this.props.location.from === "send" && this.props.location.type === "internal") {
                            this.setState(prevState => ({
                                transactionInfo: {
                                    ...prevState.transactionInfo,
                                    "bank": "213",
                                    "receiverInstitute": "BANCO ARBI S.A.",
                                },
                                saveDataAsContact: true,
                                transcationState: "accountType",
                                direction: "left"
                            }));
                        } else {
                            this.setState({
                                transcationState: "institute",
                                direction: "left",
                                saveDataAsContact: true,
                            })
                        }
                    } else {
                        this.setState({
                            transcationState: "list",
                            direction: "left",
                            header: localeObj.contact_plural,
                            saveDataAsContact: false
                        })
                    }
                    break;
                case "list":
                    this.setState({
                        selectedContactData: formInfo,
                    });
                    this.viewDetails(formInfo);
                    break;
                case "view_details":
                    if (formInfo.tipoChavePix === "AgenciaConta") {
                        let transactionData = this.state.transactionInfo;
                        transactionData["beneficiary"] = this.state.detailsJson.contactName;
                        transactionData["cpf"] = this.state.selectedContactData.cpf;
                        transactionData["myAccount"] = false;
                        transactionData["agency"] = formInfo.agencia;
                        transactionData["bank"] = formInfo.codigoOuISPB;
                        transactionData["receiverInstitute"] = formInfo.nomeInstituicao;
                        transactionData["noAgency"] = false;
                        transactionData["account"] = formInfo.conta;
                        transactionData["accountType"] = formInfo.tipoDeConta;

                        this.setState({
                            transactionInfo: transactionData,
                            accNum: formInfo.conta,
                            selectFromContact: true
                        });

                        this.createReviewInfo();
                    } else {
                        this.getKeyDetails(formInfo.chavePix);
                    }
                    break;
                case "institute":
                    this.setState(prevState => ({
                        transactionInfo: {
                            ...prevState.transactionInfo,
                            "bank": formInfo["code"],
                            "receiverInstitute": formInfo["receiverInstitute"],
                        },
                        transcationState: "accountType",
                        direction: "left"
                    }));
                    MetricServices.onPageTransitionStart(PageNameJSON.accountType);
                    break;
                case "accountType":
                    this.setState(prevState => ({
                        transactionInfo: {
                            ...prevState.transactionInfo,
                            "accountType": formInfo
                        },
                        transcationState: "beneficiary",
                        direction: "left"
                    }))
                    break;
                case "beneficiary":
                    this.setState(prevState => ({
                        transactionInfo: {
                            ...prevState.transactionInfo,
                            "beneficiary": formInfo["name"],
                            "cpf": formInfo["cpf"],
                            "myAccount": formInfo["myAccount"]
                        },
                        transcationState: "agency",
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
                        transcationState: "accountNumber",
                        direction: "left"
                    }))
                    break;
                case "accountNumber":
                    this.getContactStatus(this.state.transactionInfo, formInfo);
                    this.setState(prevState => ({
                        transactionInfo: {
                            ...prevState.transactionInfo,
                            "account": formInfo
                        },
                        accNum: formInfo
                    }), () => {
                        this.createReviewInfo();
                    });
                    break;
                case "review":
                    if (this.state.isFromTransactionHistory && !this.state.isEditSchedule && formInfo.editDate) {
                        this.setState({
                            transcationState: "select_date",
                            direction: "left",
                            info: formInfo,
                            header: localeObj.date,
                            isEditSchedule: true
                        });
                    } else if (formInfo.editDate) {
                        this.setState({
                            transcationState: "select_date",
                            direction: "left",
                            info: formInfo,
                            header: localeObj.date,
                        })
                    } else {
                        delete formInfo['editDate'];
                        this.setState({
                            transcationState: "pin",
                            direction: "left",
                            info: formInfo,
                            header: localeObj.pix_authentication,
                        })
                    }
                    break;
                case "select_date":
                    if (moment(formInfo.date).isSame(moment(this.state.today), 'day')) {
                        let transactionJSON = this.state.transactionInfo;
                        transactionJSON["scheduledReview"] = false;
                        this.setState({
                            transactionInfo: transactionJSON,
                            isScheduled: false,
                            isEditDate: false
                        })
                        this.createReviewInfo();
                    } else {
                        let transactionJSON = this.state.transactionInfo;
                        transactionJSON["scheduledDate"] = moment(formInfo.date).format("DD/MM/YYYY");
                        transactionJSON["sendDate"] = moment(formInfo.date).toISOString();
                        transactionJSON["scheduledReview"] = true;
                        transactionJSON["recurrence"] = 1;
                        this.setState({
                            scheduledDate: formInfo.date,
                            transactionInfo: transactionJSON,
                            isEditDate: true
                        })

                        if (formInfo.monthly) {
                            this.setState({
                                transcationState: "recurrence",
                                direction: "left"
                            });
                            MetricServices.onPageTransitionStart(PageNameJSON.recurrence);
                        } else {
                            this.createReviewInfo();
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
                        this.createReviewInfo();
                    } else if (formInfo.action === "cancel") {
                        this.setState({
                            transcationState: "select_date",
                            header: localeObj.date,
                            direction: "left",
                        })
                    }
                    break;
                case "scheduled_ted_review":
                    if (formInfo.editDate) {
                        this.setState({
                            transcationState: "select_date",
                            direction: "left",
                            info: formInfo,
                            header: localeObj.date,
                            isScheduled: false
                        })
                    } else {
                        delete formInfo['editDate'];
                        this.setState({
                            isScheduled: true,
                            transcationState: "pin",
                            direction: "left",
                            info: formInfo,
                            header: localeObj.pix_authentication,
                        })
                    }
                    break;
                case "pin":
                    this.onCompleteHandler(formInfo);
                    break;
                default:
            }
        }
    }

    getKeyDetails = (pixKey) => {
        this.showProgressDialog();
        ArbiApiService.getPixKeyDetails(pixKey, PageNameJSON.list).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResult = ArbiResponseHandler.processGetPixKeyDetailsResponse(response.result, pixKey, localeObj);
                if (processedResult.success) {
                    let transactionInfo = {
                        "amount": this.state.transactionInfo.amount,
                        "decimal": this.state.transactionInfo.decimal,
                        "pixKey": pixKey,
                        "name": this.state.detailsJson.contactName,
                        "CPF": GeneralUtilities.maskCpf(this.state.detailsJson.contactCpf),
                        "transferType": processedResult.pixKeyDetails.pixKeyType,
                        "receiverInstitute": processedResult.pixKeyDetails.institute,
                    }
                    this.props.history.replace({
                        pathname: "/pixSendComponent",
                        from: "tedTransfer",
                        reviewData: transactionInfo,
                        contactDetails: this.state.selectedContactData
                    })
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

    async getContactStatus(transactionInfo, account_num) {
        if (this.state.saveDataAsContact) {
            await Promise.all([await SaveContactUtils.getSaveContactStaus(transactionInfo["cpf"].replace(/\.|-|\//g, ""), "AgenciaConta", account_num)]).then(values => {
                this.setState({
                    saveDataAsContact: values[0]
                })
            }).catch(() => {
                this.setState({
                    saveDataAsContact: true
                })
            })
        }
    }

    onGetBalance = async () => {
        await GeneralUtilities.onCheckBalance().then((balanceResponse) => {
            Log.sDebug(balanceResponse, PageNameJSON.success_immediate);
        });
    }

    onCompleteHandler = (val) => {
        if (this.state.isScheduled) {
            this.onScheduleTedBuildData(val);
        } else {
            let jsonObject = {};
            Object.assign(jsonObject, this.state.transactionInfo);
            jsonObject["token"] = val;
            let payer = {
                [localeObj.name]: ImportantDetails.userName,
                [localeObj.cpf]: NewUtilities.parseCPFOrCnpj(ImportantDetails.cpf, true)['displayCPF'],
                [localeObj.Institution]: localeObj.bank_name,
            }
            this.showProgressDialog();
            // if (jsonObject.bank == this.arbiCode) {
            //     this.internalTEDTransfer(jsonObject, payer);
            // } else {
                this.externalTEDTransfer(jsonObject, payer)
            //}
        }
    }

    onScheduleTedBuildData = (val) => {
        let scheduleObject = this.state.transactionInfo;
        if (GeneralUtilities.emptyValueCheck(scheduleObject.account)) {
            scheduleObject["account"] = this.state.accNum;
        }
        scheduleObject["token"] = val;
        let payerDetails = {
            [localeObj.name]: ImportantDetails.userName,
            [localeObj.cpf]: NewUtilities.parseCPFOrCnpj(ImportantDetails.cpf, true)['displayCPF'],
            [localeObj.Institution]: localeObj.bank_name,
        }
        this.showProgressDialog();
        if (this.state.isFromTransactionHistory && this.state.isEditSchedule && this.state.isEditDate) {
            scheduleObject["txnId"] = this.state.additionalData.scheduleId;
            if (scheduleObject.bank === this.arbiCode) {
                //Log.sDebug("Editing Scheduled Internal TED");
                this.editInternalSchedule(scheduleObject, payerDetails);
            } else {
                //Log.sDebug("Editing Scheduled External TED");
                this.editExternalSchedule(scheduleObject, payerDetails);
            }
        } else if (this.state.isFromTransactionHistory && !this.state.isEditSchedule && !this.state.isEditDate) {
            let cancelJSON = {
                "pin": val,
                "scheduleId": this.state.additionalData.scheduleId
            }
            if (scheduleObject.bank === this.arbiCode) {
                //Log.sDebug("Cancel Scheduled Internal TED");
                this.cancelInternalTedScheduledTransaction(cancelJSON, scheduleObject, payerDetails);
            } else {
                //Log.sDebug("Cancel Scheduled External TED");
                this.cancelExternalTedScheduledTransaction(cancelJSON, scheduleObject, payerDetails);
            }
        } else {
            // if (scheduleObject.bank === this.arbiCode) {
            //     this.addRecurrence(this.state.reviewInfo["recurrence"]);
            //     //Log.sDebug("Scheduling Internal TED");
            //     this.scheduleTedInternalTransfer(scheduleObject, payerDetails);
            // } else {
                //Log.sDebug("Scheduling External TED");
                this.scheduleTedExternalTransfer(scheduleObject, payerDetails);
            //}
        }
    }

    internalTEDTransfer(jsonObject, payer) {
        ArbiApiService.tedExternalTransfer(jsonObject, PageNameJSON.success_immediate)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processTedExternalTransferResponse(response.result);
                    if (processorResponse.success) {
                        this.onGetBalance();
                        this.setState(prevState => ({
                            transcationState: "success",
                            direction: "left",
                            isScheduled: false,
                            info: {
                                ...prevState.info,
                                [localeObj.amount]: "R$ " + GeneralUtilities.formatBalance(this.state.transactionInfo["amount"]) + "," + this.state.transactionInfo["decimal"],
                                [localeObj.tariff]: localeObj.currency + " " + this.state.reviewInfo["tariff"],
                                [localeObj.transaction_code]: processorResponse.transactionId,
                            },
                            reviewInfo: {
                                ...prevState.reviewInfo,
                                payer: payer,
                                date: moment(processorResponse.date).utcOffset(0, false).format('DD/MM/YYYY'),
                                hour: (moment(processorResponse.date).utcOffset(-3).format('HH')),
                                mins: moment(processorResponse.date).utcOffset(0, false).format('mm'),
                                fileName: "comprovante_ted_"
                            }
                        }));
                    } else {
                        this.setState({
                            pinExpiredSnackBarOpen: true,
                            message: localeObj.retry_later
                        })
                    }
                } else {
                    this.handleTedError(response);
                }
            });
    }

    externalTEDTransfer(jsonObject, payer) {
        ArbiApiService.tedExternalTransfer(jsonObject, PageNameJSON.success_immediate)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processTedExternalTransferResponse(response.result);
                    if (processorResponse.success) {
                        this.onGetBalance();
                        this.setState(prevState => ({
                            transcationState: "success",
                            direction: "left",
                            isScheduled: false,
                            info: {
                                ...prevState.info,
                                [localeObj.transaction_code]: processorResponse.transactionId,
                            },
                            reviewInfo: {
                                ...prevState.reviewInfo,
                                payer: payer,
                                date: moment(processorResponse.date).format('DD/MM/YYYY'),
                                hour: moment(processorResponse.date).format('HH'),
                                mins: moment(processorResponse.date).format('mm'),
                                fileName: "comprovante_ted_"
                            }
                        }));
                    } else {
                        this.setState({
                            pinExpiredSnackBarOpen: true,
                            message: localeObj.retry_later
                        })
                    }
                } else {
                    this.handleTedError(response);
                }
            });
    }

    scheduleTedInternalTransfer = (jsonObject, payer) => {
        ArbiApiService.tedScheduleInternal(jsonObject)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processTedScheduleInternalResponse(response.result);
                    if (processorResponse.success) {
                        this.setState(prevState => ({
                            transcationState: "success",
                            direction: "left",
                            info: {
                                ...prevState.info,
                                [localeObj.tariff]: localeObj.currency + " " + this.state.reviewInfo["tariff"],
                                [localeObj.transaction_code]: processorResponse.transactionId,
                            },
                            reviewInfo: {
                                ...prevState.reviewInfo,
                                type: "D",
                                payer: payer,
                                date: moment(processorResponse.date).format('DD/MM/YYYY'),
                                hour: moment(processorResponse.date).format('HH'),
                                mins: moment(processorResponse.date).format('mm'),
                                scheduled_date: processorResponse.scheduledDate,
                                fileName: "comprovante_ted_"
                            }
                        }));
                    } else {
                        //Log.sDebug("Internal TED Scheduling Failed", componentLog, constantObjects.LOG_PROD);
                        this.setState({
                            pinExpiredSnackBarOpen: true,
                            message: localeObj.retry_later
                        })
                    }
                } else {
                    //Log.sDebug("Internal TED Scheduling Failed",componentLog, constantObjects.LOG_PROD);
                    this.handleTedError(response);
                }
            });
    }

    scheduleTedExternalTransfer = (jsonObject, payer) => {
        ArbiApiService.tedScheduleExternal(jsonObject, PageNameJSON.scheduled_ted_review)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processTedScheduleExternalResponse(response.result);
                    if (processorResponse.success) {
                        this.setState(prevState => ({
                            transcationState: "success",
                            direction: "left",
                            info: {
                                ...prevState.info,
                                [localeObj.tariff]: localeObj.currency + " " + this.state.reviewInfo["tariff"],
                                [localeObj.transaction_code]: processorResponse.transactionId,
                            },
                            reviewInfo: {
                                ...prevState.reviewInfo,
                                payer: payer,
                                type: "D",
                                date: moment(processorResponse.date).format('DD/MM/YYYY'),
                                hour: moment(processorResponse.date).format('HH'),
                                mins: moment(processorResponse.date).format('mm'),
                                scheduled_date: processorResponse.scheduledDate,
                                fileName: "comprovante_ted_"
                            }
                        }));
                    } else {
                        //Log.sDebug("External TED Scheduling Failed", componentLog, constantObjects.LOG_PROD);
                        this.setState({
                            pinExpiredSnackBarOpen: true,
                            message: localeObj.retry_later
                        })
                    }
                } else {
                    //Log.sDebug("External TED Scheduling Failed",componentLog, constantObjects.LOG_PROD);
                    this.handleTedError(response);
                }
            });
    }

    editInternalSchedule = (jsonObject, payer) => {
        ArbiApiService.tedInternalScheduleEdit(jsonObject, PageNameJSON.success_schedule)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processTedInternalScheduleEdit(response.result);
                    if (processorResponse.success) {
                        this.setState(prevState => ({
                            transcationState: "success",
                            direction: "left",
                            info: {
                                ...prevState.info,
                                [localeObj.tariff]: localeObj.currency + " " + this.state.reviewInfo["tariff"],
                                [localeObj.transaction_code]: jsonObject.txnId,
                            },
                            reviewInfo: {
                                ...prevState.reviewInfo,
                                payer: payer,
                                type: "D",
                                date: moment(this.state.reviewInfo.scheduleNoFormat).format('DD/MM/YYYY'),
                                hour: moment(this.state.reviewInfo.scheduleNoFormat).format('HH'),
                                mins: moment(this.state.reviewInfo.scheduleNoFormat).format('mm'),
                                scheduled_date: jsonObject.sendDate,
                                fileName: "comprovante_ted_"
                            }
                        }));
                    } else {
                        //Log.sDebug("Internal TED Edit Schedule Failed", componentLog, constantObjects.LOG_PROD);
                        this.setState({
                            pinExpiredSnackBarOpen: true,
                            message: localeObj.retry_later
                        })
                    }
                } else {
                    //Log.sDebug("Internal TED Edit Schedule Failed",componentLog, constantObjects.LOG_PROD);
                    this.handleTedError(response);
                }
            });
    }

    editExternalSchedule = (jsonObject, payer) => {
        ArbiApiService.tedExternalScheduleEdit(jsonObject, PageNameJSON.success_schedule)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processTedExternalScheduleEdit(response.result);
                    if (processorResponse.success) {
                        this.setState(prevState => ({
                            transcationState: "success",
                            direction: "left",
                            info: {
                                ...prevState.info,
                                [localeObj.tariff]: localeObj.currency + " " + this.state.reviewInfo["tariff"],
                                [localeObj.transaction_code]: processorResponse.transactionDetails.transactionId,
                            },
                            reviewInfo: {
                                ...prevState.reviewInfo,
                                payer: payer,
                                type: "D",
                                date: moment(processorResponse.transactionDetails.date).format('DD/MM/YYYY'),
                                hour: moment(processorResponse.transactionDetails.date).format('HH'),
                                mins: moment(processorResponse.transactionDetails.date).format('mm'),
                                scheduled_date: processorResponse.transactionDetails.scheduledDate,
                                fileName: "comprovante_ted_"
                            }
                        }));
                    } else {
                        //Log.sDebug("External TED Edit Schedule Failed", componentLog, constantObjects.LOG_PROD);
                        this.setState({
                            pinExpiredSnackBarOpen: true,
                            message: localeObj.retry_later
                        })
                    }
                } else {
                    //Log.sDebug("External TED Edit Schedule Failed",componentLog, constantObjects.LOG_PROD);
                    this.handleTedError(response);
                }
            });
    }

    cancelInternalTedScheduledTransaction = (jsonForCancel, jsonObject, payer) => {
        this.showProgressDialog();
        ArbiApiService.tedInternalScheduleCancel(jsonForCancel, PageNameJSON.scheduled_ted_review).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processTedInternalScheduleCancel(response.result);
                if (processedResponse.success) {
                    //Log.sDebug("Cancel Schedule", "TED Cancel Internal Schedule Success");
                    this.externalTEDTransfer(jsonObject, payer);
                } else {
                    //Log.sDebug("Cancel Schedule", "Cancel Schedule - failed ", componentLog, constantObjects.LOG_PROD);
                    this.hideProgressDialog();
                    let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: errorMesaage
                    });
                }
            } else {
                this.handleTedError(response);
            }
        });
    }

    cancelExternalTedScheduledTransaction = (jsonForCancel, jsonObject, payer) => {
        this.showProgressDialog();
        ArbiApiService.tedExternalScheduleCancel(jsonForCancel, PageNameJSON.scheduled_ted_review).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processTedExternalScheduleCancel(response.result);
                if (processedResponse.success) {
                    //Log.sDebug("Cancel Schedule", "TED Cancel Internal Schedule Success");
                    this.externalTEDTransfer(jsonObject, payer)
                } else {
                    //Log.sDebug("Cancel Schedule", "Cancel Schedule - failed ", componentLog, constantObjects.LOG_PROD);
                    this.hideProgressDialog();
                    let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: errorMesaage
                    });
                }
            } else {
                this.handleTedError(response);
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
                            transcationState: "view_details",
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

    handleTedError = (response) => {
        let jsonObj = {};
        if (response.result === !response.status || (response.status >= 400 && response.status < 500)) {
            jsonObj["error"] = true;
            jsonObj["errorCode"] = response.status;
            jsonObj["reason"] = "communication_issue"
            this.setTransactionInfo(jsonObj);
        } else if ('' + response.result.code === "10007") {
            this.setState({ bottomSheetOpen: true })
        } else if (response.result.code) {
            jsonObj["error"] = true;
            jsonObj["reason"] = response.result.message;
            this.setTransactionInfo(jsonObj);
        } else {
            let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
            this.setTransactionInfo(errorJson);
        }
    }

    onForgot = () => {
        this.setState({
            bottomSheetOpen: false,
            reset: false,
            processing: false
        })
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    onSecondary = () => {
        this.setState({
            bottomSheetOpen: false,
            processing: false
        })
    }

    onPrimary = () => {
        this.setState({
            bottomSheetOpen: false,
            clearPassword: true,
            processing: false
        })
    }

    editAmount = () => {
        let prevState = this.state.transcationState;
        this.setState({
            transcationState: "amount",
            direction: "right",
            header: localeObj.pix_send_amount,
            amountEdited: true,
            prevReviewPage: prevState
        })
    }

    back = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            let pageNameForBackKey = this.processPageName();
            MetricServices.onPageTransitionStop(pageNameForBackKey, PageState.back);
            switch (this.state.transcationState) {
                case "amount":
                    if (this.props.location && this.props.location.from
                        && this.props.location.from === "send" && this.props.location.type === "external") {
                        this.props.history.replace({ pathname: "/sendComponent", transition: "right", from: "ted" });
                    } else if (this.props.location && this.props.location.from
                        && this.props.location.from === "send" && this.props.location.type === "internal") {
                        this.props.history.replace({ pathname: "/sendComponent", transition: "right", from: "tedInternal" });
                    } else if (this.props.location && this.props.location.from && this.props.location.from === "mainTransactionHistory") {
                        this.getBalanceAndMovetoMain();
                    } else if (this.props.location && this.props.location.from && this.props.location.from === "sendToContacts") {
                        this.props.history.replace({ pathname: "/contacts", transition: "right" });
                    } else {
                        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
                    }
                    break;
                case "path_option":
                    this.setState({
                        direction: "right",
                        transcationState: "amount",
                        selectFromContact: false
                    })
                    break;
                case "list":
                    this.setState({
                        direction: "right",
                        transcationState: "path_option",
                        header: localeObj.transfer_money
                    })
                    MetricServices.onPageTransitionStart(PageNameJSON.path_option);
                    break;
                case "view_details":
                    this.setState({
                        direction: "right",
                        transcationState: "list"
                    })
                    break;
                case "institute":
                    this.setState({
                        direction: "right",
                        transcationState: "path_option",
                        header: localeObj.transfer_money
                    })
                    MetricServices.onPageTransitionStart(PageNameJSON.path_option);
                    break;
                case "accountType":
                    if (this.props.location && this.props.location.from
                        && this.props.location.from === "send" && this.props.location.type === "internal") {
                        this.setState({
                            direction: "right",
                            transcationState: "amount",
                            header: localeObj.transfer_money
                        })
                    } else {
                        this.setState({
                            direction: "right",
                            transcationState: "institute"
                        })
                    }
                    break;
                case "beneficiary":
                    this.setState({
                        direction: "right",
                        transcationState: "accountType"
                    });
                    MetricServices.onPageTransitionStart(PageNameJSON.accountType);
                    break;
                case "agency":
                    this.setState({
                        direction: "right",
                        transcationState: "beneficiary"
                    })
                    break;
                case "accountNumber":
                    this.setState({
                        direction: "right",
                        transcationState: "agency"
                    })
                    break;
                case "review":
                    if (this.state.isFromTransactionHistory && !this.state.isEditSchedule) {
                        this.getBalanceAndMovetoMain();
                    } else if (this.state.selectFromContact) {
                        this.setState({
                            direction: "right",
                            transcationState: "view_details",
                            header: localeObj.contact_plural
                        })
                        break;
                    } else if (this.state.isFromContact) {
                        this.setState({
                            direction: "right",
                            transcationState: "amount",
                            header: localeObj.transfer_money
                        })
                    } else {
                        this.setState({
                            direction: "right",
                            transcationState: "accountNumber",
                            header: localeObj.transfer_money,
                        })
                    }
                    break;
                case "select_date":
                    if (this.state.isFromTransactionHistory && this.state.isEditSchedule) {
                        this.getBalanceAndMovetoMain();
                    } else {
                        let transactionJSON = this.state.transactionInfo;
                        delete transactionJSON["scheduledDate"];
                        delete transactionJSON["sendDate"];
                        transactionJSON["scheduledReview"] = false;
                        this.setState({
                            direction: "right",
                            transcationState: "review",
                            transactionInfo: transactionJSON,
                            header: localeObj.review_payment,
                        });
                    }
                    break;
                case "recurrence":
                    this.setState({
                        transcationState: "select_date",
                        direction: "left",
                        header: localeObj.date,
                    })
                    break;
                case "scheduled_ted_review":
                    if (this.state.isFromTransactionHistory && !this.state.isEditSchedule) {
                        this.getBalanceAndMovetoMain();
                    } else if (this.state.isFromTransactionHistory && this.state.isEditSchedule) {
                        this.setState({
                            transcationState: "select_date",
                            direction: "left",
                            header: localeObj.date,
                        });
                    } else if (this.state.selectFromContact) {
                        this.setState({
                            direction: "right",
                            transcationState: "view_details",
                            header: localeObj.contact_plural
                        })
                    } else if (this.state.isFromContact) {
                        this.setState({
                            direction: "right",
                            transcationState: "amount",
                            header: localeObj.transfer_money
                        })
                    } else {
                        this.setState({
                            direction: "right",
                            transcationState: "accountNumber",
                            header: localeObj.pix_send_amount,
                            isScheduled: false
                        })
                    }
                    break;
                case "pin":
                    if (this.state.isScheduled) {
                        this.setState({
                            direction: "right",
                            transcationState: "scheduled_ted_review",
                            header: localeObj.review_payment,
                        })
                    } else {
                        this.setState({
                            direction: "right",
                            transcationState: "review",
                            header: localeObj.review_payment,
                        })
                    }
                    break;
                case "success":
                case "error":
                    this.complete();
                    break;
                default:
            }
        }
    }

    processPageName = () => {
        //Log.sDebug("Processing Page Name for meterics");
        let pageName = "";
        switch (this.state.transcationState) {
            case "pin":
                if (this.state.isScheduled) {
                    pageName = PageNameJSON.pin_schedule;
                } else {
                    pageName = PageNameJSON.pin_immediate
                }
                break;
            case "success_receipt":
                if (this.state.isScheduled) {
                    pageName = PageNameJSON.success_schedule;
                } else {
                    pageName = PageNameJSON.success_immediate;
                }
                break;
            default:
                pageName = PageNameJSON[this.state.transcationState];
                break;
        }
        return pageName;
    }

    getBalanceAndMovetoMain = () => {
        this.showProgressDialog();
        ArbiApiService.getUserBalance(PageNameJSON.review)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse.success) {
                        let balanceInfo = processorResponse.balance.toString().split(".")
                        let balance = balanceInfo[0];
                        let decimal = NewUtilities.formatDecimal(balanceInfo[1])
                        this.props.history.replace({ pathname: "/newTransactionHistory", transition: "right", balanceData: { "balance": balance, "decimal": decimal }, from: "tedSchedule" });
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

    addContact = (jsonObj) => {
        this.props.history.replace({
            pathname: "/addContact",
            from: "tedTransfer",
            name: jsonObj.name,
            cpfAdded: jsonObj.cpfAdded,
            amount: this.state.transactionInfo["amount"],
            decimal: this.state.transactionInfo["decimal"],
            details: this.state.selectedContactData
        })
    }

    createReviewInfo = () => {
        //this.getContactStatus(this.state.transactionInfo);
        if (this.state.transactionInfo["bank"] !== this.arbiCode && moment(this.state.transactionInfo.sendDate).isSame(moment(this.state.today), 'day')) {
            this.checkTrasactionAvailability();
        }
        let reviewInfo = {
            "amount": this.state.transactionInfo["amount"],
            "decimal": this.state.transactionInfo["decimal"],
            "receiver": {},
            "transferType": localeObj.transfer_money,
            "allowSchedule": true
        }
        reviewInfo["receiver"][localeObj.name] = this.state.transactionInfo["beneficiary"]
        if (this.state.transactionInfo["cpf"].replace(/\.|-|\//g, "").length <= 11) {
            reviewInfo["receiver"][localeObj.cpf] = NewUtilities.parseCPFOrCnpj(this.state.transactionInfo["cpf"], true)['displayCPF']
        } else {
            reviewInfo["receiver"][localeObj.cnpj] = NewUtilities.parseCPFOrCnpj(this.state.transactionInfo["cpf"], true)['displayCPF']
        }
        reviewInfo["receiver"][localeObj.Institution] = this.state.transactionInfo["receiverInstitute"];

        this.showProgressDialog();
        let jsonObject = {};
        jsonObject["amount"] = parseFloat(this.state.transactionInfo["amount"] + "." + this.state.transactionInfo["decimal"]);
        if (this.state.transactionInfo["bank"] === this.arbiCode) {
            jsonObject["code"] = 4019; //TED internal arbi code
        } else {
            jsonObject["code"] = 4015; // TED External code
        }
        ArbiApiService.getTariff(jsonObject, PageNameJSON.pin_schedule).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processTariffResponse(response.result);
                if (processorResponse.success) {
                    reviewInfo["tariff"] = processorResponse.tariff;
                    if (this.state.transactionInfo.scheduledReview) {
                        reviewInfo["scheduled"] = true;
                        reviewInfo["scheduledDate"] = this.state.transactionInfo.scheduledDate;
                        reviewInfo["scheduleNoFormat"] = this.state.transactionInfo.sendDate;
                        reviewInfo["recurrence"] = this.state.transactionInfo.recurrence;
                        this.setState({
                            transcationState: "scheduled_ted_review",
                            direction: "left",
                            header: localeObj.review_payment,
                            reviewInfo: reviewInfo
                        })
                    } else {
                        if (this.state.isFromTransactionHistory) {
                            this.setState({
                                isEditSchedule: false
                            })
                        }
                        this.setState({
                            transcationState: "review",
                            direction: "left",
                            header: localeObj.review_payment,
                            reviewInfo: reviewInfo
                        })
                    }
                } else {
                    let jsonObj = {};
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = "tariff_fetch_failed"
                    this.setTransactionInfo(jsonObj);
                }
            } else {
                reviewInfo["tariff"] = "0,00";
                this.setState({
                    transcationState: "review",
                    direction: "left",
                    header: localeObj.review_payment,
                    reviewInfo: reviewInfo
                });
            }
        });
    }

    handleClose = () => {
        this.props.history.replace({
            pathname: '/tedTransfer',
            type: "external",
            from: "send"
        });
        MetricServices.onPageTransitionStop(PageNameJSON.accountType, PageState.back);
        return;
    }

    saveContacts = () => {
        let finalInfo = this.state.transactionInfo;

        finalInfo["transferType"] = "ACCOUNT";
        finalInfo["name"] = this.state.transactionInfo.beneficiary;
        finalInfo["CPF"] = this.state.transactionInfo.cpf.replace(/\.|-|\//g, "");

        let event = {
            eventType: constantObjects.saveContactAfterTransaction,
            page_name: PageNameJSON[this.state.transcationState],
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());

        this.props.history.replace({
            pathname: "/saveContactFromTransaction",
            from: "tedTransfer",
            isFullAccountInfo: true,
            contactData: finalInfo,
            transition: "left"
        });
    }

    multiSelection = (value) => {
        this.setState({
            amountBottomSheet : value
        })
    }

    checkTrasactionAvailability = () => {
        if ((moment().day() === 0 || moment().day() === 6 || moment().hour() >= 17)) {
            this.setState({
                hasDateChanged: true
            });
            let transactionData = this.state.transactionInfo;
            let scheduledDate = moment();
            if (moment().day() === 0) {
                //Log.sDebug("Day is Sunday, Hence scheduled TED for Monday " + scheduledDate);
                scheduledDate = moment().add(1, 'day');
            } else if (moment().day() === 6) {
                //Log.sDebug("Day is Saturday, Hence scheduled TED for Monday " + scheduledDate);
                scheduledDate = moment().add(2, 'days');
            } else if (moment().hour() >= 17) {
                if (moment().add(1, 'day').day() === 0) {
                    //Log.sDebug("Time is more than 5pm and Day is Sunday, Hence scheduled TED for Monday " + scheduledDate);
                    scheduledDate = moment().add(2, 'days');
                } else if (moment().add(1, 'day').day() === 6) {
                    //Log.sDebug("Time is more than 5pm and Day is Saturday, Hence scheduled TED for Monday " + scheduledDate);
                    scheduledDate = moment().add(3, 'days');
                } else {
                    //Log.sDebug("Time is more than 5pm, Hence scheduled TED for next day " + scheduledDate);
                    scheduledDate = moment().add(1, 'day');
                }
            }

            if (this.state.isFromTransactionHistory) {
                this.setState({
                    isEditSchedule: true
                });
            }

            transactionData["scheduledReview"] = true;
            transactionData["scheduledDate"] = moment(scheduledDate).format("DD/MM/YYYY");
            transactionData["sendDate"] = moment(scheduledDate).toISOString();
            transactionData["recurrence"] = 1;
            //Log.sDebug("TED has been scheduled as selected Time or date is not avialable", constantObjects.LOG_STAGING)
            this.setState({
                transactionInfo: transactionData,
                isScheduled: true,
                minSheduledDate: scheduledDate.utc()
            });
        }
    }

    render() {
        const currentState = this.state.transcationState;
        const { classes } = this.props;
        const bottomSheet = this.state.amountBottomSheet;
        return (
            <div style={{ overflowX: "hidden" }}>
                {currentState !== "error" && currentState !== "success" &&
                    <div>
                        <ButtonAppBar header={this.state.header} onBack={this.back} action="none" />
                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "amount" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "amount" && <AmountComponent requiredInfo={this.state.transactionInfo} multiSelection={this.multiSelection} amountBottomSheet={bottomSheet} setTransactionInfo={this.setTransactionInfo}
                            feature="ted_send" componentName={PageNameJSON.amount} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "path_option" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "path_option" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "path_option" && <BottomSheetAccount accountType={this.state.pathsToSend} heading={localeObj.contact_how_to_send}
                            keySelected={this.setTransactionInfo} componentName={PageNameJSON.path_option} handleClose={this.handleClose} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "list" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "list" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "list" && <ListAllContacts confirm={this.setTransactionInfo} add={this.addContact} componentName={PageNameJSON.list} showAddOption={false} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "view_details" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "view_details" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "view_details" && <ListContactDetails contact={this.state.detailsJson} handleSend={this.setTransactionInfo} componentName={PageNameJSON.view_details} add={this.addContact}
                            fromSend={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "institute" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "institute" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "institute" && <SelectOption type="Bank" header={localeObj.choose_institute} confirm={this.setTransactionInfo} TEDBankList= {true}
                            componentName={PageNameJSON.institute} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "accountType" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "accountType" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "accountType" && <BottomSheetAccount accountType={this.state.accountType} heading={localeObj.account_type_header}
                            keySelected={this.setTransactionInfo} componentName={PageNameJSON.accountType} handleClose={this.back} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "beneficiary" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "beneficiary" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "beneficiary" && <TransferRecieverComponent requiredInfo={this.state.transactionInfo} setTransactionInfo={this.setTransactionInfo} feature="ted_transfer"
                            componentName={PageNameJSON.beneficiary} refer="ted" />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "agency" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "agency" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "agency" && <TransferInputComponent requiredInfo={this.state.transactionInfo} field={localeObj.agency} recieveField={this.setTransactionInfo} value={this.state.transactionInfo.agency}
                            from={GeneralUtilities.TRANSACTION_TYPES.TED} checked={this.state.transactionInfo.noAgency} componentName={PageNameJSON.agency} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "accountNumber" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "accountNumber" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "accountNumber" && <TransferInputComponent requiredInfo={this.state.transactionInfo} field={localeObj.acc_no}
                            recieveField={this.setTransactionInfo} value={this.state.transactionInfo.account} from={GeneralUtilities.TRANSACTION_TYPES.TED}
                            componentName={PageNameJSON.accountNumber} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "review" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "review" && <ReviewTemplate requiredInfo={this.state.reviewInfo} setTransactionInfo={this.setTransactionInfo} back={this.editAmount}
                            header={localeObj.pix_sending} detailHeader={localeObj.destination} btnText={localeObj.next} componentName={PageNameJSON.review} showScheduleOption={true} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "select_date" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "select_date" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "select_date" && <CalenderPicker value={this.state.scheduledDate} minDate={this.state.minSheduledDate} maxDate={this.state.maxSheduledDate} confirm={this.setTransactionInfo}
                            header={localeObj.select_date_ted}  monthsAhead="1"  isSchedule={true} checkBox={localeObj.regular_payment} regular={this.state.isFromTransactionHistory ? false : true} primaryButtonText={localeObj.next}
                            shouldDisableWeekend={true} componentName={PageNameJSON.select_date} />}
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
                    in={currentState === "scheduled_ted_review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "scheduled_ted_review" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "scheduled_ted_review" && <ReviewTemplate requiredInfo={this.state.reviewInfo} setTransactionInfo={this.setTransactionInfo} back={this.editAmount} showScheduleOption={false}
                            header={localeObj.pix_sending} detailHeader={localeObj.destination} btnText={localeObj.next} dateChange={GeneralUtilities.emptyValueCheck(this.state.transactionInfo.sendDate) ? "" : this.state.transactionInfo.sendDate}
                            componentName={PageNameJSON.scheduled_ted_review} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "pin" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "pin" && <InputPinPage confirm={this.onCompleteHandler} clearPassword={this.state.clearPassword}
                            componentName={this.state.isScheduled ? PageNameJSON.pin_schedule : PageNameJSON.pin_immediate} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "success" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={this.state.isScheduled ? localeObj.schedule_receipt : localeObj.pix_receipt} onCancel={this.complete} action="cancel" inverse="true" />
                        {currentState === "success" && <RecieptTemplate requiredInfo={this.state.reviewInfo} info={this.state.info} confirm={this.complete} onBack={this.back}
                            schedule={this.state.isScheduled} header={this.state.isScheduled ? localeObj.you_scheduled : localeObj.paid} OtherTransaction={this.OtherTransaction}
                            btnText={localeObj.back_home} componentName={this.state.isScheduled ? PageNameJSON.success_schedule : PageNameJSON.success_immediate} showSaveContact={this.state.saveDataAsContact}
                            saveContact={this.saveContacts} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.complete} componentName={PageNameJSON.error} />}
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
                            <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.onForgot}>
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
                            <PrimaryButtonComponent btn_text={localeObj.reset_password} onCheck={this.onForgot} />
                        </div>
                    </Drawer>
                </div>
            </div >
        )
    }
}

TedTransferComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default withStyles(styles)(TedTransferComponent);
