import React from 'react';
import InputThemes from "../../../Themes/inputThemes";
import "../../../styles/main.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";

import moment from "moment";
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import Drawer from '@material-ui/core/Drawer';

import Log from "../../../Services/Log";
import PageNames from "../../../Services/PageNames";
import PageState from '../../../Services/PageState';
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from '../../../Services/ArbiErrorResponsehandler';
import httpRequest from "../../../Services/httpRequest";
import GeneralUtilities from "../../../Services/GeneralUtilities";

import AmountComponent from "../../CommonUxComponents/AmountComponent";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import InputPinPage from "../../CommonUxComponents/InputPinPage";
import ReviewTemplate from '../../CommonUxComponents/ReviewTemplate';
import ReceiptTemplate from '../../CommonUxComponents/RecieptTemplate';
import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import { CSSTransition } from 'react-transition-group';
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import constantObjects from '../../../Services/Constants';
import ImportantDetails from '../../NewLaunchComponents/ImportantDetails';

import InstantDialogComponent from "../../GamificationComponent/RewardComponents/InstantDialogComponent";
import GamificationService from "../../../Services/Gamification/GamificationService";
import { TASK_DIMO_PIX_CASHOUT } from "../../../Services/Gamification/GamificationTerms"

const theme1 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.pixCopyPasteQRCode;
var localeObj = {};

class PixQRTempFlow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            transitionState: "initial",
            info: {},
            direction: "",
            reviewInfo: {},
            clearPassword: false,
            errorJson: {},
            pinExpiredSnackBarOpen: false,
            description: "",
            gamInstantPopup: false,
            gamProgramData: {}
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            if (this.state.bottomSheetOpen) {
                this.setState({ bottomSheetOpen: false });
            } else {
                this.onBack();
            }
        }
        this.setQrCodeInfo(this.props.history.location.state);
    }



    handleLogging = (logs) => {
        Log.sDebug(logs, "PixQRCopyPasteComponent");
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

    setQrCodeInfo = (code) => {
        this.handleLogging("Getting QR code details");
        this.showProgressDialog();
        ArbiApiService.getDetailsOfQrCode(code, PageNameJSON.pix_review).then(response => {
            if (response && response.success) {
                let processedResponse = ArbiResponseHandler.processDetailsOfPixQrCode(response.result);
                processedResponse.info["transactionPurpose"] = "OTHR"
                processedResponse.info["modalityAgent"] = response.result["modalidadeAgente"]
                processedResponse.info["providerOfWithdrawService"] = response.result["prestadorDoServicoDeSaque"]

                if (processedResponse.success) {
                    let pixType = processedResponse.info.pixType;
                    if (pixType === "2" || pixType === "SAQUE") {
                        this.props.history.replace({
                            pathname: "/pixWithdraw",
                            qrCodeResponse: processedResponse.info,
                            from: this.props.history.location.from
                        })
                    } else {
                        this.handleLogging("Getting QR code details success checking if qr is not generated with user's key");
                        const pixKey = processedResponse.info.receiverKey;
                        let keyResponse = {};
                        if (ImportantDetails.pixKeysResponse === null ||
                            ImportantDetails.pixKeysResponse == {} ||
                            Object.keys(ImportantDetails.pixKeysResponse).length == 0) {
                            this.showProgressDialog();
                            ArbiApiService.getAllPixKeys(PageNameJSON.pix_review).then(pixResponse => {
                                this.hideProgressDialog();
                                keyResponse = pixResponse ? pixResponse : {};
                                ImportantDetails.pixKeysResponse = pixResponse;
                                ImportantDetails.fromRegisterPixKey = false;
                                if (keyResponse.success) {
                                    let responseHandler = ArbiResponseHandler.processGetAllPixKeysResponse(keyResponse.result);
                                    if (responseHandler && responseHandler.success) {
                                        const pixKeys = responseHandler.pixKeys;
                                        let goAhead = true;
                                        pixKeys.map((arr) => {
                                            if (pixKey === arr["key_value"]) {
                                                goAhead = false;
                                            }
                                        })
                                        if (goAhead) {
                                            if (ImportantDetails.walletBalance === "" && ImportantDetails.walletDecimal === "") {
                                                this.showProgressDialog();
                                                ArbiApiService.getUserBalance(PageNameJSON.pix_review)
                                                    .then(response => {
                                                        this.hideProgressDialog();
                                                        if (response && response.success) {
                                                            let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                                                            if (processorResponse && processorResponse.success) {
                                                                if (parseFloat(processedResponse.info.amount + "." + processedResponse.info.decimal) <= parseFloat(processorResponse.balance)) {
                                                                    this.handleLogging("Getting QR code details success redirecting to review");
                                                                    this.setState({
                                                                        header: localeObj.review_payment,
                                                                        qrCodeInfo: processedResponse.info
                                                                    })
                                                                    this.createReviewInfo(processedResponse.info);
                                                                } else {
                                                                    let jsonObj = {};
                                                                    jsonObj["error"] = true;
                                                                    jsonObj["reason"] = "insufficient_balance";
                                                                    this.setTransactionInfo(jsonObj);
                                                                }
                                                            } else {
                                                                let jsonObj = {};
                                                                jsonObj["error"] = true;
                                                                jsonObj["reason"] = "unverified_balance";
                                                                this.setTransactionInfo(jsonObj);
                                                            }
                                                        } else {
                                                            let jsonObj = {};
                                                            jsonObj["error"] = true;
                                                            jsonObj["reason"] = "unverified_balance";
                                                            this.setTransactionInfo(jsonObj);
                                                        }
                                                    });
                                            } else {
                                                this.hideProgressDialog();
                                                if (parseFloat(processedResponse.info.amount + "." + processedResponse.info.decimal)
                                                    <= parseFloat(ImportantDetails.walletBalance + "." + ImportantDetails.walletDecimal)) {
                                                    this.handleLogging("Getting QR code details success redirecting to review");
                                                    this.setState({
                                                        header: localeObj.review_payment,
                                                        qrCodeInfo: processedResponse.info
                                                    })
                                                    this.createReviewInfo(processedResponse.info);
                                                } else {
                                                    let jsonObj = {};
                                                    jsonObj["error"] = true;
                                                    jsonObj["reason"] = "insufficient_balance";
                                                    this.setTransactionInfo(jsonObj);
                                                }
                                            }
                                        } else {
                                            this.hideProgressDialog();
                                            this.onCancel(localeObj.pix_same_account_key);
                                        }
                                    } else {
                                        this.hideProgressDialog();
                                        this.setState({
                                            pinExpiredSnackBarOpen: true,
                                            message: localeObj.retry_later
                                        })
                                    }
                                } else {
                                    this.hideProgressDialog();
                                    let errorMessage = ArbiErrorResponsehandler.processErrorsForSnackBar(keyResponse, localeObj)
                                    this.setState({
                                        pinExpiredSnackBarOpen: true,
                                        message: errorMessage
                                    })
                                }
                            });
                        } else {
                            this.handleLogging("Getting QR code details success checking if qr is not generated with user's key");
                            const pixKey = processedResponse.info.receiverKey;
                            let keyResponse = {};
                            if (ImportantDetails.pixKeysResponse === null ||
                                ImportantDetails.pixKeysResponse == {} ||
                                Object.keys(ImportantDetails.pixKeysResponse).length == 0) {
                                this.showProgressDialog();
                                ArbiApiService.getAllPixKeys().then(pixResponse => {
                                    this.hideProgressDialog();
                                    keyResponse = pixResponse;
                                    ImportantDetails.pixKeysResponse = pixResponse;
                                    ImportantDetails.fromRegisterPixKey = false;
                                });
                            } else {
                                keyResponse = ImportantDetails.pixKeysResponse;
                            }
                            if (keyResponse.success) {
                                let responseHandler = ArbiResponseHandler.processGetAllPixKeysResponse(keyResponse.result);
                                if (responseHandler.success) {
                                    const pixKeys = responseHandler.pixKeys;
                                    let goAhead = true;
                                    pixKeys.map((arr) => {
                                        if (pixKey === arr["key_value"]) {
                                            goAhead = false;
                                        }
                                    })
                                    if (goAhead) {
                                        if (ImportantDetails.walletBalance === "" && ImportantDetails.walletDecimal === "") {
                                            ArbiApiService.getUserBalance()
                                                .then(response => {
                                                    this.hideProgressDialog();
                                                    if (response.success) {
                                                        let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                                                        GeneralUtilities.setBalanceToCache(processorResponse.balance);
                                                        if (processorResponse.success) {
                                                            if (parseFloat(processedResponse.info.amount + "." + processedResponse.info.decimal) <= parseFloat(processorResponse.balance)) {
                                                                this.handleLogging("Getting QR code details success redirecting to review");
                                                                this.setState({
                                                                    header: localeObj.review_payment,
                                                                    qrCodeInfo: processedResponse.info
                                                                })
                                                                this.createReviewInfo(processedResponse.info);
                                                            } else {
                                                                let jsonObj = {};
                                                                jsonObj["error"] = true;
                                                                jsonObj["reason"] = "insufficient_balance";
                                                                this.setTransactionInfo(jsonObj);
                                                            }
                                                        } else {
                                                            let jsonObj = {};
                                                            jsonObj["error"] = true;
                                                            jsonObj["reason"] = "unverified_balance";
                                                            this.setTransactionInfo(jsonObj);
                                                        }
                                                    } else {
                                                        let jsonObj = {};
                                                        jsonObj["error"] = true;
                                                        jsonObj["reason"] = "unverified_balance";
                                                        this.setTransactionInfo(jsonObj);
                                                    }
                                                });
                                        } else {
                                            this.hideProgressDialog();
                                            if (parseFloat(processedResponse.info.amount + "." + processedResponse.info.decimal)
                                                <= parseFloat(ImportantDetails.walletBalance + "." + ImportantDetails.walletDecimal)) {
                                                this.handleLogging("Getting QR code details success redirecting to review");
                                                this.setState({
                                                    header: localeObj.review_payment,
                                                    qrCodeInfo: processedResponse.info
                                                })
                                                this.createReviewInfo(processedResponse.info);
                                            } else {
                                                let jsonObj = {};
                                                jsonObj["error"] = true;
                                                jsonObj["reason"] = "insufficient_balance";
                                                this.setTransactionInfo(jsonObj);
                                            }
                                        }
                                    } else {
                                        this.hideProgressDialog();
                                        this.onCancel(localeObj.pix_same_account_key);
                                    }
                                } else {
                                    this.hideProgressDialog();
                                    this.setState({
                                        pinExpiredSnackBarOpen: true,
                                        message: localeObj.retry_later
                                    })
                                }
                            } else {
                                this.hideProgressDialog();
                                let errorMessage = ArbiErrorResponsehandler.processErrorsForSnackBar(keyResponse, localeObj)
                                this.setState({
                                    pinExpiredSnackBarOpen: true,
                                    message: errorMessage
                                })
                            }
                        }
                    }
                } else {
                    this.hideProgressDialog();
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                this.handleLogging("Getting QR code details failed");
                this.hideProgressDialog();
                let jsonObj = {};
                if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["errorCode"] = response.status;
                    jsonObj["reason"] = "communication_issue";
                    this.setTransactionInfo(jsonObj);
                } else if ('' + response.result.code === "13002") {
                    let cancelPath = "/pixLandingComponent";
                    if (!!this.props.location && !!this.props.location.launchUrl) {
                        cancelPath = this.props.location.launchUrl;
                    }
                    this.props.history.replace({ pathname: cancelPath, transition: "right", state: { showSnackBar: localeObj.invalid_pix_QR } });
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            }
        });
    }

    handleExecuteTransaction = (val) => {
        let jsonObject = {};
        jsonObject = this.state.qrCodeInfo;
        jsonObject["description"] = this.state.info[localeObj.pix_description];
        jsonObject["pin"] = val;
        this.pixPayToQRCode(jsonObject);
    }

    pixPayToQRCode = (jsonObject) => {
        this.showProgressDialog();
        this.handleLogging("Paying with QR code details");
        ArbiApiService.payForAPixQrCode(jsonObject, PageNameJSON.verify_pin).then(response => {
            if (response.success) {
                this.onGetBalance();
                let processedResponse = ArbiResponseHandler.processDetailsOfPixQRTransaction(response.result, localeObj);
                this.hideProgressDialog();
                if (processedResponse.success) {
                    this.handleLogging("Paying with QR code success");
                    processedResponse.transactionDetails["date"] = moment(processedResponse.date).format('DD/MM/YYYY');
                    processedResponse.transactionDetails["hour"] = moment(processedResponse.date).format('HH');
                    processedResponse.transactionDetails["mins"] = moment(processedResponse.date).format('mm');
                    processedResponse.transactionDetails["fileName"] = "comprovante_Pix_";
                    let txnInfo = this.state.info;
                    delete txnInfo["editDate"];
                    this.setState({
                        info: txnInfo
                    })
                    this.setState(prevState => ({
                        info: {
                            ...prevState.info,
                            [localeObj.pix_description]: jsonObject.description,
                            [localeObj.transaction_code]: processedResponse.transactionDetails.transactionCode,
                            [localeObj.pix_type]: "Pix",
                        },
                        transitionState: "pix_receipt",
                        direction: "left",
                        qrCodeInfo: processedResponse.transactionDetails
                    }))
                    this.checkForInstantRewardStatus(jsonObject);
                } else {
                    this.handleLogging("Paying with QR code failed");
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                this.handleLogging("Paying with QR code failed");
                this.hideProgressDialog();
                let jsonObj = {};
                if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                    jsonObj["error"] = true;
                    jsonObj["reason"] = "communication_issue";
                    this.setTransactionInfo(jsonObj);
                } else if ('' + response.result.code === "10007") {
                    this.setState({ bottomSheetOpen: true })
                } else if (response.result.message === constantObjects.EXPIRY_ERROR) {
                    this.setState({ reset: true })
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
                    GeneralUtilities.sendActionMetrics(PageNameJSON[this.state.transitionState], constantObjects.Gamification.showInstantDialog);
                    this.setState({ gamInstantPopup: true, gamProgramData });
                }
            }, 2000);
        } catch (err) {
            this.handleLogging("Exception in checkForInstantRewardStatus " + err)
        }
    }

    onGetBalance = async () => {
        await GeneralUtilities.onCheckBalance().then((balanceResponse) => {
            Log.sDebug(balanceResponse, PageNameJSON.pix_receipt_for_key);
        });
    }

    setTransactionInfo = (transactionInfo) => {
        if (transactionInfo.error) {
            this.handleLogging("Error occured: " + transactionInfo.reason);
            androidApiCalls.hideProgressDialog();
            let jsonObj = {}
            jsonObj["errorCode"] = transactionInfo.errorCode;
            jsonObj["title"] = localeObj.pix;
            jsonObj["header"] = localeObj.pix_failed;
            switch (transactionInfo.reason) {
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
                case "generic_error":
                    jsonObj["description"] = localeObj.generic_error + " " + localeObj.generic_error_subtext
                    break;
                case "unverified_balance":
                    jsonObj["description"] = localeObj.balance_unverified;
                    break;
                case "insufficient_balance":
                    jsonObj["description"] = localeObj.pix_amount_outofbound;
                    break;
                case "arbi_error":
                    jsonObj["description"] = transactionInfo.descriptor;
                    break;
            }
            this.setState({
                transitionState: "error",
                direction: "left",
                pixErrorJson: jsonObj
            })
        } else {
            switch (this.state.transitionState) {
                case "pix_review":
                    if (parseFloat(this.state.reviewInfo.amount + "." + this.state.reviewInfo.decimal) <= 0) {
                        this.setState({
                            pinExpiredSnackBarOpen: true,
                            message: localeObj.pix_enter_valid_amount
                        })
                        return;
                    }
                    this.setState({
                        transitionState: "verify_pin",
                        direction: "left",
                        info: transactionInfo,
                        header: localeObj.pix_authentication,
                    })
                    break;
                case "get_amount":
                    this.setState(prevState => ({
                        qrCodeInfo: {
                            ...prevState.qrCodeInfo,
                            "amount": transactionInfo["amount"],
                            "decimal": transactionInfo["decimal"],
                        },
                        reviewInfo: {
                            ...prevState.reviewInfo,
                            "amount": transactionInfo["amount"],
                            "decimal": transactionInfo["decimal"],
                            "description": this.state.description
                        },
                        transitionState: "pix_review",
                        direction: "left",
                        header: localeObj.review_payment,
                    }))
                    break;
                case "verify_pin":
                    this.handleExecuteTransaction(transactionInfo)
                    break;
            }
        }
    }

    editAmount = (desc) => {
        this.setState({
            transitionState: "get_amount",
            direction: "right",
            description: desc,
            header: localeObj.pix,
        })
    }

    createReviewInfo = (transactionInfo) => {
        let reviewInfo = {
            "amount": transactionInfo.amount,
            "decimal": transactionInfo.decimal,
            "receiver": {},
            "transferType": transactionInfo.pixKeyType,
            "description": transactionInfo.description,
        }
        reviewInfo["receiver"][localeObj.name] = transactionInfo.name
        reviewInfo["receiver"][localeObj.cpf] = GeneralUtilities.maskCpf(transactionInfo.CPF)
        reviewInfo["receiver"][localeObj.Institution] = transactionInfo.receiverInstitute

        this.setState({
            reviewInfo: reviewInfo,
            transitionState: "pix_review",
            description: transactionInfo.description,
            direction: "left"
        })
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else if (this.state.reset) {
            this.setState({
                reset: false
            });
        } else {
            switch (this.state.transitionState) {
                case "pix_review":
                    this.onCancel();
                    break;
                case "verify_pin":
                    MetricServices.onPageTransitionStop(PageNameJSON[this.state.transitionState], PageState.back);
                    this.setState({
                        transitionState: "pix_review",
                        header: localeObj.review_payment,
                        direction: "right",
                    })
                    break;
                case "get_amount":
                    MetricServices.onPageTransitionStop(PageNameJSON[this.state.transitionState], PageState.back);
                    this.setState({
                        direction: "right",
                        transitionState: "pix_review",
                        header: localeObj.review_payment
                    })
                    break;
                case "pix_receipt":
                case "error":
                    if (this.state.gamInstantPopup == true) {
                        this.setState({ gamInstantPopup: false });
                        return;
                    }
                    this.backToHome();
                    break;
            }
        }
    }

    OtherTransaction = () => {
        this.props.history.replace({ pathname: "/pixLandingComponent", transition: "right" });
    }

    backToHome = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.transitionState], PageState.back);
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    onCancel = (message = "") => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.transitionState], PageState.cancel);
        let cancelPath = "/pixLandingComponent";
        if (!!this.props.location && !!this.props.location.launchUrl) {
            // go back launch url
            cancelPath = this.props.location.launchUrl;
        }
        this.props.history.replace({ pathname: cancelPath, transition: "right", state: { showSnackBar: message } });
    }

    onSecondary = () => {
        this.setState({ bottomSheetOpen: false })
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
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.transitionState], PageState.close);
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    render() {
        const currentState = this.state.transitionState;
        const { classes } = this.props;
        return (
            <FlexView column style={{ width: "100%" }}>
                {currentState !== "pix_receipt" && currentState !== "error" &&
                    <div>
                        <ButtonAppBar header={this.state.header} onBack={this.onBack} action="none" />
                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "get_amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "get_amount" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "get_amount" && <AmountComponent requiredInfo={this.state.reviewInfo} setTransactionInfo={this.setTransactionInfo} feature="pix_send"
                            componentName={PageNameJSON.get_amount} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "pix_review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "pix_review" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "pix_review" && <ReviewTemplate requiredInfo={this.state.reviewInfo} setTransactionInfo={this.setTransactionInfo} back={this.editAmount}
                            header={localeObj.pix_sending} detailHeader={localeObj.destination} btnText={localeObj.next} componentName={PageNameJSON.pix_review} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "verify_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "verify_pin" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "verify_pin" && <InputPinPage confirm={this.setTransactionInfo} clearPassword={this.state.clearPassword} componentName={PageNameJSON.verify_pin} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "pix_receipt" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "pix_receipt" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_receipt} onCancel={this.onBack} action="cancel" inverse="true" />
                        {currentState === "pix_receipt" && <ReceiptTemplate requiredInfo={this.state.qrCodeInfo} OtherTransaction={this.OtherTransaction} info={this.state.info} confirm={this.backToHome} onBack={this.onBack}
                            header={localeObj.pix_you_sent} btnText={localeObj.back_home} componentName={PageNameJSON.pix_receipt} />}
                        {this.state.gamInstantPopup && <InstantDialogComponent gamProgramData={this.state.gamProgramData} />}
                    </div>
                </CSSTransition>
                <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                    {currentState === "error" && <PixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.backToHome} componentName={PageNameJSON.error} />}
                </div>
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
                            <FlexView column>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.wrong_passcode}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.wrong_passcode_header}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.try} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondary} />
                            <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={this.forgot_passcode}>
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
                        <div style={{ width: "100%", marginBottom: "1.5rem",textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.reset_password} onCheck={this.forgot_passcode} />
                        </div>
                    </Drawer>
                </div>
            </FlexView>
        )
    }
}

PixQRTempFlow.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};

export default withStyles(styles)(PixQRTempFlow);
