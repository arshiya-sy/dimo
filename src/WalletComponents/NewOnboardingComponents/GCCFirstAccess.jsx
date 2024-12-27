import React from "react";
import "../../styles/main.css";
import PropTypes from "prop-types";
import { CSSTransition } from 'react-transition-group';

import jwtDecode from 'jwt-decode';
import 'moment/locale/pt-br';
import { MuiThemeProvider } from "@material-ui/core/styles";
import Log from "../../Services/Log";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from "../../Services/Constants";
import arbiApiService from "../../Services/ArbiApiService";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import ArbiErrorResponseHandler from '../../Services/ArbiErrorResponsehandler';
import GeneralUtilities from "../../Services/GeneralUtilities";
import walletJwtService from "../../Services/walletJwtService";

import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import face from "../../images/SpotIllustrations/Face.png";
import mailing_address from "../../images/SpotIllustrations/cc_onboarding.webp";
import address_success from "../../images/SpotIllustrations/Success.png";
import logo from "../../images/SpotIllustrations/Checkmark.png";

import InputPinPageWithValidation from "../CommonUxComponents/InputPinPageWithValidation";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";

import PageState from "../../Services/PageState";
import InputThemes from "../../Themes/inputThemes";

import CreditCardDueDate from "../DigitalCardComponents/CreditCardComponents/CreditCardDueDate";
import CreditContract from "../DigitalCardComponents/CreditCardComponents/CreditContract";
import MetricServices from "../../Services/MetricsService";
import PageNames from "../../Services/PageNames";

const theme2 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.gccCreditCardComponent;
var localeObj = {};
var caf_start_time = "";
const CAMERA_PERMISSION = "android.permission.CAMERA";
const CAF_LOGS = "CAF_FACELIVENESS";
const FACELIVENESS_SUCCESS = "FACELIVENESS_SUCCESS";
const FACELIVENESS_FAILURE = "FACELIVENESS_FAILURE";
const FACELIVENESS_URI = "GET_LIVENESS_METRICS_FOR_CAF";

class GCCFirstAccess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cardStatus: this.props.location.maybelater === true ? "may_be_later" : "credit_due_date",
            processing: false,
            direction: "right",
            dueDate: "",
            snackBarOpen: false,
            headervalue: localeObj.credit_card_welcome_benifits_banner_title,
            amount: this.props.location.amount,
            isAlive: false
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        this.componentName = "GCC FA CREDIT CARD";
    }

    componentDidMount() {
        if (this.props.location.maybelater === "address") {
            this.getDeliveryAddress();
        }
        this.fetchTokenForCAF(ImportantDetails.cpf);

        window.onBackPressed = () => {
            this.onBack();
        }

        window.onPassiveLivenessImage = (selfieImage) => {
            this.setState({
                selfie: selfieImage
            });
        }

        window.onFaceLivenessImage = (imageUrl, jwt) => {
            Log.sDebug("onActiveFaceLivenessImage " + imageUrl + " " + jwt);
            try {
                let i = jwt.lastIndexOf(".");
                let subjwt = jwt.substr(0, i);
                Log.sDebug("onActiveFaceLivenessImage sub test  : " + subjwt);
                const decodedToken = jwtDecode(subjwt);
                Log.sDebug("decodedToken : " + JSON.stringify(decodedToken) + " : " + decodedToken.isAlive + " : " + decodedToken.userId + " : " + decodedToken.requestId);
                if (imageUrl && decodedToken && decodedToken.isAlive) {
                    this.setState({
                        isAlive: decodedToken.isAlive
                    });
                    this.setState({
                        selfie: imageUrl
                    });
                }
            } catch (error) {
                Log.sDebug('Error decoding JWT token:', error);
                return null;
            }
        }

        window.onPassiveLivenessStatus = (faceLiveJson) => {
            let finalFaceLivenessJSON = faceLiveJson;
            if (finalFaceLivenessJSON) {
                if (finalFaceLivenessJSON.sdkStatusCode && finalFaceLivenessJSON.sdkStatusCode === 1) {
                    this.uploadSelfieDocWithCAF(this.state.selfieImage);
                } else {
                    this.hideProgressDialog();
                    this.setState({
                        snackBarOpen: true,
                        message: GeneralUtilities.getCAFFailureText(finalFaceLivenessJSON.sdkStatusMessage, localeObj)
                    });
                }
            } else {
                this.hideProgressDialog();
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.retry_later
                })
            }
        }

        window.onFaceLivenessStatus = (faceLive) => {
            Log.sDebug("onActiveFaceLivenessStatus : " + faceLive);
            let finalFaceLiveness = faceLive;
            let timeSpentOnCAF = new Date().getTime() - caf_start_time;
            if (finalFaceLiveness) {
                Log.sDebug("Faceliveness SDK compelte. Logs " + finalFaceLiveness);
                if (finalFaceLiveness && finalFaceLiveness === "Success") {
                    if (this.state.isAlive) {
                        GeneralUtilities.sendCAFSDKMetrics(FACELIVENESS_URI, FACELIVENESS_SUCCESS, true, timeSpentOnCAF, finalFaceLiveness, localeObj, PageNameJSON['facematch']);
                        this.uploadSelfieDocWithCAF(this.state.selfieImage);
                    } else {
                        this.hideProgressDialog();
                        Log.sDebug("Active Faceliveness SDK Failure due to isAlive false", CAF_LOGS, constantObjects.LOG_PROD);
                        this.openSnackBar(GeneralUtilities.getCAFFailureText("1", localeObj));
                        GeneralUtilities.sendActiveCAFFailureSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, finalFaceLiveness, "0", localeObj, PageNameJSON['facematch']);
                    }
                } else {
                    this.hideProgressDialog();
                    Log.sDebug("Faceliveness SDK Failure with status code 0");
                    this.setState({
                        snackBarOpen: true,
                        message: GeneralUtilities.getCAFFailureText("0", localeObj)
                    });
                }
            } else {
                this.hideProgressDialog();
                Log.sDebug("Faceliveness SDK Failure with NULL JSON from APK");
                this.setState({
                    snackBarOpen: true,
                    message: GeneralUtilities.getCAFFailureText("0", localeObj)
                });
            }
        }

        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === CAMERA_PERMISSION) {
                if (status === true) {
                    this.doFaceMatch();
                } else {
                    if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")) {
                        this.setState({
                            cameraAlert: true
                        })
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.allow_camera
                        })
                    }
                }
            }
        }
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    configureCreditParams = (autoDebit) => {
        this.showProgressDialog();
        let jsonObj = {};
        jsonObj["creditLimit"] = this.state.amount;
        jsonObj["dueDate"] = this.state.dueDate;
        jsonObj["autoDebit"] = autoDebit;
        androidApiCalls.storeToPrefs("firstAccessInvestedAmount", this.state.amount);
        arbiApiService.configureCreditCard(jsonObj, PageNameJSON.contract).then(response => {
            if (response.success) {
                this.setState({
                    creditLimitPrev: this.state.amount,
                    dueDatePrev: this.state.dueDate
                });
                this.fetchCreditContract();

            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    fetchCreditContract = () => {
        this.showProgressDialog();
        arbiApiService.fetchCreditContract(PageNameJSON.contract).then(response => {

            if (response.success) {
                let processorResponse = ArbiResponseHandler.processCreditContractResponse(response.result);
                if (processorResponse.success) {
                    this.hideProgressDialog();
                    if (GeneralUtilities.emptyValueCheck(processorResponse.toc)) {
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    } else {
                        this.setState({
                            toc: processorResponse.toc,
                            contractId: processorResponse.contractId,
                            cardStatus: "credit_contract",
                            headervalue: localeObj.contract,
                            direction: "left"
                        })
                        window.onBackPressed = null;
                        window.onBackPressed = () => {
                            this.onBack();
                        }
                    }
                } else {
                    this.hideProgressDialog();
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                this.getCreditContract();
            }
        });
    }

    getCreditContract = () => {
        //this.showProgressDialog();
        arbiApiService.getCreditContract(PageNameJSON.contract).then(response => {
            this.hideProgressDialog();
            //Log.sDebug("getCreditContract: " + JSON.stringify(response));
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processCreditContractResponse(response.result);
                //Log.sDebug("getCreditContract: processorResponse: " + JSON.stringify(processorResponse));
                if (processorResponse.success) {
                    if (GeneralUtilities.emptyValueCheck(processorResponse.toc)) {
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    } else {
                        this.setState({
                            toc: processorResponse.toc,
                            contractId: processorResponse.contractId,
                            cardStatus: "credit_contract",
                            headervalue: localeObj.contract,
                            direction: "left"
                        })
                    }
                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    faceMatchScreen = (token) => {
        this.setState({
            headervalue: localeObj.faceMatch,
            cardStatus: "credit_facematch",
            direction: "left",
            token: token
        })
    }

    fetchTokenForCAF = async (cpf) => {
        await Promise.all([await walletJwtService.CAFAuthentication(cpf)]).then(async values => {
            if (GeneralUtilities.emptyValueCheck(values[0])) {
                await walletJwtService.CAFAuthentication(cpf)
            }
        }).catch(async err => {
            Log.sDebug("Error while fetching token: " + err);
            await walletJwtService.CAFAuthentication(cpf)
        })
    }

    doFaceMatch = () => {
        caf_start_time = new Date().getTime();
        if (androidApiCalls.checkSelfPermission(CAMERA_PERMISSION) === 0) {
            if (GeneralUtilities.isCAFEnabled()) {
                if (androidApiCalls.isFeatureEnabledInApk("FACE_LIVELINESS") && GeneralUtilities.doesDeviceSupportActiveFaceliveness()) {
                    androidApiCalls.faceLiveness(ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
                } else {
                    androidApiCalls.passiveFaceLiveness(ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
                }

            }
            else {
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.facematch_not_sup
                })
            }
        } else {
            androidApiCalls.requestPermission(CAMERA_PERMISSION);
        }


    }

    setTransactionInfo = (formInfo) => {
        if (formInfo && !!formInfo.error) {
            this.hideProgressDialog();
            let jsonObj = {}
            jsonObj["header"] = localeObj.gpay_error_header;
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
                    jsonObj["header"] = localeObj.insufficient_balance
                    jsonObj["description"] = localeObj.pix_amount_outofbound;
                    break;
                case "insufficient_balance_pix":
                    jsonObj["header"] = localeObj.insufficient_balance
                    jsonObj["description"] = GeneralUtilities.formattedString(localeObj.credit_pix_insufficient_bal, [formInfo.amount])
                    break;
                case "generic_error":
                    jsonObj["description"] = localeObj.generic_error + " " + localeObj.generic_error_subtext
                    break;
                case "arbi_error":
                    jsonObj["description"] = formInfo.descriptor;
                    break;
                case "detalhes_error":
                    jsonObj["header"] = formInfo.title;
                    jsonObj["description"] = formInfo.descriptor;
                    break;
                default:
                    jsonObj["description"] = formInfo.reason;
                    break;
            }
            this.setState({
                cardStatus: "error",
                direction: "left",
                creditErrorJson: jsonObj
            })
        } else {
            let event;
            switch (this.state.cardStatus) {
                case "credit_due_date":
                    event = {
                        eventType: constantObjects.firstAccess + "GCC DUE DATE",
                        page_name: this.componentName,
                    };
                    MetricServices.reportActionMetrics(event, new Date().getTime());
                    this.setState({
                        dueDate: formInfo
                    }, () => {
                        this.configureCreditParams(true);
                    });
                    break;
                case "credit_contract":
                    event = {
                        eventType: constantObjects.firstAccess + "GCC CONTRACT",
                        page_name: this.componentName,
                    };
                    MetricServices.reportActionMetrics(event, new Date().getTime());
                    this.showProgressDialog();
                    arbiApiService.getUserBalance(PageNameJSON.contract).then(response => {
                        if (response.success) {
                            let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                            if (processorResponse.success) {
                                let amount = parseInt(androidApiCalls.getFromPrefs("firstAccessInvestedAmount"));
                                GeneralUtilities.setBalanceToCache(processorResponse.balance);
                                if (processorResponse.balance < amount) {
                                    let jsonObj = {};
                                    jsonObj["error"] = true;
                                    jsonObj["errorCode"] = 422;
                                    jsonObj["reason"] = "insufficient_balance_pix"
                                    jsonObj["amount"] = amount
                                    this.hideProgressDialog();
                                    this.setTransactionInfo(jsonObj);
                                } else {
                                    this.hideProgressDialog();
                                    let eventP = {
                                        eventType: constantObjects.firstAccess + "GCC PIN",
                                        page_name: this.componentName,
                                    };
                                    MetricServices.reportActionMetrics(eventP, new Date().getTime());
                                    this.setState({
                                        cardStatus: "credit_pin_input",
                                        headervalue: localeObj.pix_authentication,
                                        direction: "left",
                                    })
                                }
                            } else {
                                this.hideProgressDialog();
                                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                                this.setTransactionInfo(errorJson);
                            }
                        } else {
                            this.hideProgressDialog();
                            let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                            this.setTransactionInfo(errorJson);
                        }
                    });
                    break;
                case "credit_facematch":
                    event = {
                        eventType: constantObjects.firstAccess + "GCC FACEMATCH",
                        page_name: this.componentName,
                    };
                    MetricServices.reportActionMetrics(event, new Date().getTime());
                    this.goToHomePage();
                    break;
                default: break;
            }
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
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

    getRequestCategory = () => {
        this.showProgressDialog();
        arbiApiService.getRequestCategory(PageNameJSON.card_shipped).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processRequestCategory(response.result);
                if (processedResponse.success) {
                    this.requestPhysicalCard(processedResponse.physicalCardCategory);
                }
            } else {
                this.hideProgressDialog();
                this.goToHomePage();
            }
        });
    }

    requestPhysicalCard = (category) => {
        arbiApiService.requestPhysicalCard(category, PageNameJSON.request_card)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processedDeatils = ArbiResponseHandler.processRequestPhysicalCardAPI(response.result);
                    if (processedDeatils.success) {
                        this.setState({
                            cardStatus: "confirm_address_success",
                            direction: "left"
                        })
                    } else {
                        this.goToHomePage();
                    }
                } else {
                    this.goToHomePage();
                }
            });
    }

    getDeliveryAddress = () => {
        this.showProgressDialog();
        arbiApiService.getAllClientData(PageNameJSON.may_be_later).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processGetAllClientDataResponse(response.result);
                this.setState({
                    cardStatus: "address",
                    headervalue: localeObj.dimo_card,
                    direction: "left",
                    address: GeneralUtilities.formatAddress(processedResponse.data)
                })
            } else {
                let jsonObj = {};
                jsonObj["header"] = localeObj.failed_address;
                jsonObj["description"] = response.result.message;
                this.setState({
                    errorJson: jsonObj,
                    headervalue: localeObj.dimo_card,
                    cardStatus: "error",
                    direction: "left"
                })
            }
        });
    }

    uploadSelfieDocWithCAF(selfieImage) {
        let selfieClicked = GeneralUtilities.emptyValueCheck(selfieImage) ? this.state.selfie : selfieImage;
        let jsonObjectSelfie = {
            "url": selfieClicked,
            "extensao": 2
        }
        this.signCreditContract(jsonObjectSelfie);
    }

    signCreditContract = (selfieObj) => {
        this.showProgressDialog();
        let jsonObj = {};
        jsonObj["token"] = this.state.token;
        jsonObj["contractId"] = this.state.contractId;
        jsonObj["selfieObj"] = selfieObj;
        arbiApiService.signCreditContract(jsonObj, PageNameJSON.contract).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                this.setState({
                    cardStatus: "credit_facematch_success",
                    direction: "left"
                })

            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    help = () => {
        GeneralUtilities.openHelpSection();
    }

    componentWillUnmount() {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    goToHomePage = () => {
        if (this.state.cardStatus === "may_be_later") {
            this.props.history.replace({ pathname: "/newWalletLaunch", newOnboarding: true, transition: "right" });
        } else {
            this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
        }
    }

    confirmAddress = () => {
        this.getRequestCategory();
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            switch (this.state.cardStatus) {
                case "credit_due_date":
                    window.onBackPressed = null;
                    this.props.history.replace({ pathname: "/gccInvestmentAmount" });
                    break;
                case "credit_contract":
                    this.setState({
                        cardStatus: "credit_due_date",
                        headervalue: localeObj.credit_card_welcome_benifits_banner_title,
                        direction: "right",
                    });
                    break;
                case "credit_pin_input":
                    this.setState({
                        cardStatus: "credit_contract",
                        headervalue: localeObj.contract,
                        direction: "right",
                    });
                    break;
                case "credit_facematch":
                    this.setState({
                        cardStatus: "credit_pin_input",
                        headervalue: localeObj.pix_authentication,
                        direction: "right",
                    });
                    break;
                case "confirm_address_success":
                    this.getDeliveryAddress();
                    break;
                case "error":
                case "cardError":
                case "credit_success":
                case "address":
                default:
                    this.goToHomePage();
                    break;
            }
        }
    }

    render() {
        let currentState = this.state.cardStatus;
        let title = this.state.headervalue;
        return (
            <div>
                {!this.state.processing &&
                    <div style={{ overflowX: "hidden" }}>
                        {!this.state.processing &&
                            currentState !== "credit_facematch_success" &&
                            currentState !== "confirm_address_success" &&
                            currentState !== "may_be_later" &&
                            currentState !== "credit_due_date" &&
                            currentState !== "error" &&
                            <ButtonAppBar
                                header={title}
                                onBack={this.onBack}
                                action="none" />
                        }
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={currentState === "credit_due_date" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div style={{ display: (currentState === "credit_due_date" && !this.state.processing ? 'block' : 'none') }}>
                                <ButtonAppBar
                                    header={localeObj.credit_card_welcome_benifits_banner_title}
                                    onBack={this.onBack}
                                    action="none" />
                                {currentState === "credit_due_date" &&
                                    <CreditCardDueDate
                                        recieveField={this.setTransactionInfo}
                                        value={this.state.dueDate}
                                        componentName={PageNameJSON.due_date} />}
                            </div>
                        </CSSTransition>
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={currentState === "credit_contract" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div style={{ display: (currentState === "credit_contract" && !this.state.processing ? 'block' : 'none') }}>
                                {currentState === "credit_contract" &&
                                    <CreditContract
                                        moveToContract={this.setTransactionInfo}
                                        terms={this.state.toc}
                                        componentName={PageNameJSON.contract} />}
                            </div>
                        </CSSTransition>
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={currentState === "credit_pin_input" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div style={{ display: (currentState === "credit_pin_input" && !this.state.processing ? 'block' : 'none') }}>
                                {currentState === "credit_pin_input" &&
                                    <InputPinPageWithValidation
                                        history={this.props.history}
                                        confirm={this.faceMatchScreen}
                                        componentName={PageNameJSON.pin} />}
                            </div>
                        </CSSTransition>
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={currentState === "error" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                                {currentState === "error" &&
                                    <PixErrorComponent
                                        errorJson={this.state.creditErrorJson}
                                        onClick={this.goToHomePage}
                                        componentName={PageNameJSON.error} />}
                            </div>
                        </CSSTransition>
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={currentState === "credit_facematch" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div style={{ display: (currentState === "credit_facematch" && !this.state.processing ? 'block' : 'none') }}>
                                <ImageInformationComponent
                                    header={localeObj.faceMatch_val}
                                    icon={face}
                                    type={PageNameJSON.facematch}
                                    appBar={false}
                                    description={localeObj.faceMatch_desc}
                                    btnText={localeObj.faceMatch_btn} next={this.doFaceMatch}
                                    action={localeObj.help}
                                    onAction={this.help} />
                            </div>
                        </CSSTransition>
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={currentState === "credit_facematch_success" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div className='sucessPage' style={{ display: (currentState === "credit_facematch_success" && !this.state.processing ? 'block' : 'none') }}>
                                <ImageInformationComponent
                                    header={localeObj.first_access_gcc_fm_success_header}
                                    icon={logo}
                                    type={PageNameJSON.onboard_complete}
                                    appBar={false}
                                    description={localeObj.first_access_gcc_fm_success_description}
                                    btnText={localeObj.first_access_gcc_fm_success_second_btn}
                                    next={this.getDeliveryAddress}
                                    close={this.goToHomePage}
                                    onCancel={this.goToHomePage}
                                    footer={localeObj.first_access_gcc_fm_success_btn} />
                            </div>
                        </CSSTransition>
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={currentState === "may_be_later" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div className='sucessPage' style={{ display: (currentState === "may_be_later" && !this.state.processing ? 'block' : 'none') }}>
                                {currentState === "may_be_later" &&
                                    <ImageInformationComponent
                                        header={localeObj.first_access_gcc_maybelater_header}
                                        type={PageNameJSON.may_be_later}
                                        appBar={false}
                                        icon={logo}
                                        suggestion={localeObj.first_access_gcc_maybelater_description}
                                        description={localeObj.first_access_gcc_maybelater_caption}
                                        secBtnText={localeObj.first_access_gcc_fm_success_second_btn}
                                        btnText={localeObj.first_access_gcc_fm_success_btn}
                                        next={this.goToHomePage}
                                        close={this.getDeliveryAddress} />}
                            </div>
                        </CSSTransition>
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={currentState === "address" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div style={{ display: (currentState === "address" && !this.state.processing ? 'block' : 'none') }}>
                                <ImageInformationComponent
                                    header={localeObj.first_access_gcc_mailing_address}
                                    icon={mailing_address}
                                    type={PageNameJSON.request_card}
                                    appBar={false}
                                    suggestion={localeObj.first_access_gcc_mailing_address_desc}
                                    description={this.state.address}
                                    btnText={localeObj.first_access_gcc_mailing_address_btn}
                                    next={this.confirmAddress}
                                    action={localeObj.first_access_gcc_mailing_address_btn_footer}
                                    onAction={this.goToHomePage} />
                            </div>
                        </CSSTransition>
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={currentState === "confirm_address_success" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div style={{ display: (currentState === "confirm_address_success" && !this.state.processing ? 'block' : 'none') }}>
                                <ButtonAppBar header={""} onCancel={this.goToHomePage} action="cancel" inverse="true" />
                                <ImageInformationComponent
                                    header={localeObj.first_access_gcc_address_success_header}
                                    icon={address_success}
                                    type={PageNameJSON.card_shipped}
                                    appBar={false}
                                    description={localeObj.first_access_gcc_address_success_footer}
                                    btnText={localeObj.first_access_gcc_go_to_home}
                                    next={this.goToHomePage}
                                    onCancel={this.goToHomePage} />
                            </div>
                        </CSSTransition>
                    </div>}
                {this.state.processing && <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    <CustomizedProgressBars />
                </div>}
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

GCCFirstAccess.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object
};

export default GCCFirstAccess;
