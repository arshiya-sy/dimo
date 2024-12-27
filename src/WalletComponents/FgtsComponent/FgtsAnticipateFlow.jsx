import React from "react";
import moment from "moment";
import "../../styles/main.css";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import jwtDecode from 'jwt-decode';

import InputThemes from "../../Themes/inputThemes";
import { CSSTransition } from 'react-transition-group';

import face from "../../images/SpotIllustrations/Face.png";
import logo from "../../images/SpotIllustrations/Checkmark.png";

import Log from "../../Services/Log";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import httpRequest from "../../Services/httpRequest";
import constantObjects from "../../Services/Constants";
import MetricServices from "../../Services/MetricsService";
import arbiApiService from "../../Services/ArbiApiService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import ArbiErrorResponseHandler from '../../Services/ArbiErrorResponsehandler';
import ColorPicker from '../../Services/ColorPicker';
import walletJwtService from "../../Services/walletJwtService";
import InputPinPage from "../CommonUxComponents/InputPinPageWithValidation";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import AmountComponent from "../CommonUxComponents/AmountComponent";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";
import FaceMatchComponent from "../CommonUxComponents/FaceMatchComponent";

import Drawer from '@material-ui/core/Drawer';
import MuiAlert from '@material-ui/lab/Alert';
import AppBar from '@material-ui/core/AppBar';
import DoneIcon from '@material-ui/icons/Done';
import Toolbar from '@material-ui/core/Toolbar';
import CancelIcon from '@material-ui/icons/Close';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider } from "@material-ui/core/styles";

import FgtsTermsPage from "./FgtsSupportComponents/FgtsTermsPage";
import FgtsInterst from "./FgtsSupportComponents/FgtsInterstPage";
import FgtsAnticipateError from "./FgtsSupportComponents/FgtsAnticipateError";
import ShowAnticipationStates from "./FgtsSupportComponents/ShowAnticipationStates";
import FgtsAnticipateVerification from "./FgtsSupportComponents/FgtsAnticipateVerification";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import AlertDialog from "../NewOnboardingComponents/AlertDialog";

const theme1 = InputThemes.DownloadSnackbarTheme;
const theme2 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.FgtsAnticipate;
const styles = InputThemes.singleInputStyle;
const WRITE_EXTERNAL_STORAGE = "android.permission.WRITE_EXTERNAL_STORAGE";
var localeObj = {};
var caf_start_time = "";
const CAMERA_PERMISSION = "android.permission.CAMERA";
const CAF_LOGS = "CAF_FACELIVENESS";
const FACELIVENESS_SUCCESS = "FACELIVENESS_SUCCESS";
const FACELIVENESS_FAILURE = "FACELIVENESS_FAILURE";
const FACELIVENESS_URI = "GET_LIVENESS_METRICS_FOR_CAF";

class FgtsAnticipateFlow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            installmentList: [],
            anticipateStatus: "fgts_anticipation",
            direction: "",
            snackBarOpen: false,
            message: "",
            value: {},
            amount: {},
            phoneNum: "",
            receivable: "",
            processing: false,
            fgtsTerms: "",
            contractId: "",
            tokenVal: "",
            pin: "",
            header: localeObj.fgts_withdraw,
            waitingStatus: true,
            finalContractId: "",
            maxValue: {},
            errorFromAnticipate: false,
            bottomSheetEnabled: false,
            anticipatationNextStage: "anticipate_not_done",
            editAnticipation: false,
            prevMaxValue: { "amount": 0, "decimal": 0 }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount = () => {
        androidApiCalls.enablePullToRefresh(false);
        this.fetchTokenForCAF(ImportantDetails.cpf);
        window.onBackPressed = () => {
            this.onBack();
        }

        window.onContentShared = () => {
            ImportantDetails.shareEnabled = true;
        }

        window.onPauseCamera = () => {
            ImportantDetails.shareEnabled = false;
        }

        window.onPassiveLivenessImage = (selfieImage) => {
            this.setState({
                imageUrl: selfieImage
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
                        isAlive: decodedToken.isAlive,
                        imageUrl: imageUrl,
                        imageJwt: jwt
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
                    this.uploadSelfieDocWithCAF(this.state.imageUrl);
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
                        GeneralUtilities.sendCAFSDKMetrics(FACELIVENESS_URI, FACELIVENESS_SUCCESS, true, timeSpentOnCAF, finalFaceLiveness, localeObj);
                        this.uploadSelfieDocWithCAF(this.state.imageUrl);
                    } else {
                        this.hideProgressDialog();
                        Log.sDebug("Active Faceliveness SDK Failure due to isAlive false", CAF_LOGS, constantObjects.LOG_PROD);
                        this.openSnackBar(GeneralUtilities.getCAFFailureText("1", localeObj));
                        GeneralUtilities.sendActiveCAFFailureSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, finalFaceLiveness, "0", localeObj);
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
                    this.setState({
                        cameraAlert: true
                    })
                }
            } else if (permission === WRITE_EXTERNAL_STORAGE) {
                if (status === false) {
                    this.setState({
                        storagePermissionAlert: true
                    })
                }
            }
        }
        if (this.props.location &&
            this.props.location.from &&
            this.props.location.from === "FGTS_home_page" &&
            this.state.anticipatationNextStage === "anticipate_not_done") {
            let event = {
                eventType: constantObjects.fgtsAnticipageValue,
                page_name: PageNameJSON["anticipate_verification"],
            };
            MetricServices.reportActionMetrics(event, new Date().getTime());
            this.setState({ anticipateNextStage: "anticipate_started" });
            this.getAnticipationValue({ "amount": "0", "decimal": "00" }, "new");
        }
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    closeCameraAlertDialog = () => {
        this.setState({
            cameraAlert: false
        })
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
                this.showProgressDialog();
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

    uploadSelfieDocWithCAF(selfieImage) {
        let selfieClicked = GeneralUtilities.emptyValueCheck(selfieImage) ? this.state.imageUrl : selfieImage;
        let jsonObjectSelfie = {
            "url": selfieClicked,
            "jwt": this.state.imageJwt,
        }
        this.createFaceAuthId(jsonObjectSelfie);
    }

    createFaceAuthId = (jsonObj) => {
        //this.showProgressDialog();
        arbiApiService.createFaceAuthId(jsonObj, PageNameJSON.faceauth).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processGetFgtsFaceAuthId(response.result);
                if (processorResponse.success) {
                    this.setState({
                        faceAuthId: processorResponse.faceAuthId,
                        anticipateStatus: "faceauth_review",
                        direction: "left",
                    })

                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.tryAgainLater
                    })
                    return;
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
                return;
            }
        });
    }

    closestoragePermissionAlertDialog = () => {
        this.setState({
            storagePermissionAlert: false
        })
    }

    setTransactionInfo = (formInfo) => {
        if (formInfo.error) {
            androidApiCalls.hideProgressDialog();
            let jsonObj = {}
            jsonObj["title"] = localeObj.fgts_anticipation;
            jsonObj["header"] = localeObj.fgts_anticipation_error;
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
                anticipateStatus: "error",
                direction: "left",
                pixErrorJson: jsonObj
            })
        } else {
            switch (this.state.anticipateStatus) {
                case "anticipate_verification":
                    switch (formInfo) {
                        case "Anticipate": {
                            let event = {
                                eventType: constantObjects.fgtsAnticipageValue,
                                page_name: PageNameJSON["anticipate_verification"],
                            };
                            MetricServices.reportActionMetrics(event, new Date().getTime());
                            this.getAnticipationValue({ "amount": "0", "decimal": "00" }, "new");
                        }
                            break;
                        case "Link1":
                            this.setState({
                                anticipateStatus: "anticipate_verification_error",
                                header: localeObj.fgts_validate_error_1_main_header,
                                direction: "left",
                                anticipatationNextStage: "account_error",
                                isArbiError: false,
                                errorFromAnticipate: true
                            });
                            break;
                        case "Link2":
                            this.setState({
                                anticipateStatus: "anticipate_verification_error",
                                header: localeObj.fgts_validate_error_2_main_header,
                                direction: "left",
                                anticipatationNextStage: "no_sufficient_balance",
                                isArbiError: false,
                                errorFromAnticipate: true
                            });
                            break;
                        case "Link3":
                            this.setState({
                                anticipateStatus: "anticipate_verification_error",
                                header: localeObj.fgts_validate_error_3_main_header,
                                direction: "left",
                                anticipatationNextStage: "arbi_not_registered",
                                isArbiError: true,
                                errorFromAnticipate: true
                            })
                            break;
                        default:
                            break;
                    }
                    break;
                case "anticipate_verification2":
                    if (formInfo === "anticipate_success") {
                        this.setState({
                            anticipateStatus: "show_installments",
                            header: localeObj.fgts_anticipation_check_header,
                            direction: "left"
                        });
                    } else {
                        if (formInfo === "no_sufficient_balance") {
                            this.setState({
                                anticipateStatus: "anticipate_verification_error",
                                header: localeObj.fgts_withdraw,
                                direction: "left",
                                anticipatationNextStage: "no_sufficient_balance",
                                isArbiError: false,
                                errorFromAnticipate: true
                            });
                        } else {
                            this.props.history.push({ pathname: "/fgtsVideoTutorial", from: "FGTS_home_page", fromComponent: "home" });
                        }
                    }
                    break;
                case "anticipate_verification_error":
                    if (formInfo === "anticipate_success") {
                        this.setState({
                            anticipateStatus: "show_installments",
                            header: localeObj.fgts_anticipation_check_header,
                            direction: "left"
                        });
                    } else {
                        if (formInfo === "account_error") {
                            this.setState({
                                anticipateStatus: "anticipate_verification_error",
                                header: localeObj.fgts_validate_error_1_main_header,
                                direction: "left",
                                anticipatationNextStage: "account_error",
                                isArbiError: false,
                                errorFromAnticipate: true
                            });
                        } else if (formInfo === "no_sufficient_balance") {
                            this.setState({
                                anticipateStatus: "anticipate_verification_error",
                                header: localeObj.fgts_validate_error_2_main_header,
                                direction: "left",
                                anticipatationNextStage: "no_sufficient_balance",
                                isArbiError: false,
                                errorFromAnticipate: true
                            });
                        } else if (formInfo === "arbi_not_registered") {
                            this.setState({
                                anticipateStatus: "anticipate_verification_error",
                                header: localeObj.fgts_validate_error_3_main_header,
                                direction: "left",
                                anticipatationNextStage: "arbi_not_registered",
                                isArbiError: true,
                                errorFromAnticipate: true
                            })
                        }
                    }
                    break;
                case "show_installments":
                    let event = {
                        eventType: constantObjects.fgtsAnticipageValue,
                        page_name: PageNameJSON["show_installments"],
                    };
                    MetricServices.reportActionMetrics(event, new Date().getTime());
                    //this.showProgressDialog();
                    if (formInfo === false) {
                        this.getTermsForFGTS();
                    } else {
                        this.setHighAnticipationValue({ "amount": 0, "decimal": 0 });
                    }
                    break;
                case "get_amount":
                    this.setState({
                        value: formInfo,
                        header: localeObj.fgts_withdraw
                    });
                    this.getAnticipationValue(formInfo, "edit");
                    break;
                case "confirm_anticipation":
                    if (formInfo === "anticipate") {
                        this.getTermsForFGTS();
                    } else {
                        let event = {
                            eventType: constantObjects.fgtsAnticipateNotRightNow,
                            page_name: PageNameJSON["confirm_anticipation"],
                        };
                        MetricServices.reportActionMetrics(event, new Date().getTime());
                        this.goToFgtsHomePage();
                    }
                    break;
                case "display_terms":
                    this.getProposalId();
                    break;
                case "verify_pin":
                    this.setState({
                        tokenVal: formInfo,
                        anticipateStatus: "faceMatch",
                        direction: "left"
                    });
                    break;
                case "faceauth_review":
                    this.signContract()
                    break;
                default:
                    this.goToFgtsHomePage();
                    break;
            }
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openEmail = () => {
        androidApiCalls.openEmail();
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

    setHighAnticipationValue = (values) => {
        this.showProgressDialog();
        this.setState({
            anticipateStatus: "fgts_anticipation",
            header: localeObj.fgts_withdraw,
            direction: "left",
            anticipatationNextStage: "anticipate_success",
            isArbiError: false,
            prevMaxValue: this.state.maxValue
        });
        arbiApiService.getAuthorizedFgtsValue(values, PageNameJSON.anticipation_success).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.procesGetAuthorizedFgtsValue(response.result);
                if (processorResponse.success) {
                    this.setState({
                        value: processorResponse.installmentObject.valueReleased,
                        receivable: processorResponse.installmentObject.totalReceiveable,
                        installmentList: processorResponse.installmentObject.tableValues,
                        interestRate: processorResponse.installmentObject.interestRate,
                        maxValue: processorResponse.installmentObject.maxValue,
                        years: processorResponse.installmentObject.numberOfYears,
                        direction: "left",
                        anticipatationNextStage: "anticipate_success",
                        anticipateStatus: "show_installments",
                        waitingStatus: false,
                        isArbiError: false
                    })
                    //this.getTermsForFGTS();
                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                if (response.status === 500
                    || response.status === 400
                    || response.status === 403
                    || response.status === 404
                    || response.status === 503) {
                    if (response.result &&
                        (response.result.code === 9)) {
                        this.setState({
                            value: { "amount": "", "decimal": "" },
                            receivable: "",
                            installmentList: "[]",
                            anticipateStatus: "anticipate_verification2",
                            header: localeObj.fgts_withdraw,
                            direction: "left",
                            anticipatationNextStage: "account_error",
                            isArbiError: false
                        })
                    } else if (response.result && 
                                (response.result.code === 400 ||
                                    response.result.code === 204 ||
                                    response.result.code === 43037 ||
                                    response.result.code === 1
                                )) {
                        this.setState({
                            value: { "amount": "", "decimal": "" },
                            receivable: "",
                            installmentList: "[]",
                            anticipateStatus: "anticipate_verification2",
                            header: localeObj.fgts_withdraw,
                            direction: "left",
                            anticipatationNextStage: "no_sufficient_balance",
                            isArbiError: false
                        })
                    } else if (response.result && (response.result.code === 43039
                        || response.result.code === 7)) {
                        this.setState({
                            value: { "amount": "", "decimal": "" },
                            receivable: "",
                            installmentList: "[]",
                            anticipateStatus: "anticipate_verification2",
                            header: localeObj.fgts_withdraw,
                            direction: "left",
                            anticipatationNextStage: "arbi_not_registered",
                            isArbiError: true
                        })
                    } else if (response.result && response.result.code === 10) {
                        this.setState({
                            value: { "amount": "", "decimal": "" },
                            receivable: "",
                            installmentList: "[]",
                            anticipateStatus: "anticipate_verification_error",
                            header: localeObj.fgts_withdraw,
                            direction: "left",
                            anticipatationNextStage: "anniversary_too_close",
                            isArbiError: false
                        })
                    } else if (response.result &&
                        (response.result.code === 524 ||
                            response.result.code === 429 ||
                            response.result.code === 950 ||
                            response.result.code === 0
                        )) {
                        this.setState({
                            value: { "amount": "", "decimal": "" },
                            receivable: "",
                            installmentList: "[]",
                            anticipateStatus: "anticipate_verification_error",
                            header: localeObj.fgts_withdraw,
                            direction: "left",
                            anticipatationNextStage: "failed_to_contact_caixa",
                            isArbiError: false
                        })
                    }else if (response.result &&
                        (response.result.code === 525 ||
                            response.result.code === 11054 ||
                            response.result.code === 47001 ||
                            response.result.code === 11002
                        )) {
                        this.setState({
                            value: { "amount": "", "decimal": "" },
                            receivable: "",
                            installmentList: "[]",
                            anticipateStatus: "anticipate_verification_error",
                            header: localeObj.fgts_withdraw,
                            direction: "left",
                            anticipatationNextStage: "fgts_req_failed",
                            isArbiError: false
                        })
                    } else {
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            }
        });
    }

    getTermsForFGTS = () => {
        this.showProgressDialog();
        arbiApiService.getFgtsTermsForContract(PageNameJSON.display_terms).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processGetFgtsTermsForContract(response.result);
                if (processorResponse.success) {
                    this.setState({
                        terms: processorResponse.fgtsTerms,
                        anticipateStatus: "display_terms",
                        direction: "left",
                        header: localeObj.fgts_withdraw
                    })
                    return;
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.tryAgainLater
                    })
                    return;
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
                return;
            }
        })
    }

    getProposalId = () => {
        let valueJSON = {
            "amount": this.state.value.amount,
            "decimal": this.state.value.decimal
        }
        this.showProgressDialog();
        arbiApiService.getTokenAndContractID(valueJSON, PageNameJSON.display_terms).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processGetTokenAndContractID(response.result);
                if (processorResponse.success) {
                    this.setState({
                        proposalId: processorResponse.contractId,
                        anticipateStatus: "verify_pin",
                        direction: "left"
                    });
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.tryAgainLater
                    })
                    return;
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
                return;
            }
        })
    }

    signContract = () => {
        let fgtsFinalObject = {
            "contractId": this.state.proposalId,
            "faceAuthId": this.state.faceAuthId
        }

        this.showProgressDialog();
        arbiApiService.signFGTSContract(fgtsFinalObject, PageNameJSON.anticipation_success).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                androidApiCalls.setDAStringPrefs(GeneralUtilities.FGTSCONTRACTS_KEY, "enable");
                //Log.sDebug("User Details Fetched");
                let processorResponse = ArbiResponseHandler.processSignFGTSContract(response.result);
                if (processorResponse.success) {
                    this.setState({
                        finalContractId: processorResponse.finalContractId,
                        anticipateStatus: "anticipation_success",
                        header: localeObj.fgts_withdraw,
                        direction: "left",
                        alert: {
                            type: "Success",
                            mainHeader: localeObj.fgts_anticipate_success_mainHeader,
                            value: "R$ " + GeneralUtilities.formatBalance(this.state.value.amount) + "," + this.state.value.decimal,
                            subHeader: localeObj.fgts_anticipate_success_subHeader,
                            button1: localeObj.back_home,
                        }
                    })
                    let event = {
                        eventType: constantObjects.fgtsAnticipateComplete,
                        page_name: PageNameJSON["verify_pin"],
                    };
                    MetricServices.reportActionMetrics(event, new Date().getTime());
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.tryAgainLater
                    })
                    return;
                }
            } else {
                if (response &&
                    response.result &&
                    response.result.code &&
                    response.result.code.toString() === "10007") {
                    this.setState({ bottomSheetOpen: true });
                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                    return;
                }
            }
        })
    }

    getAnticipationValue = (values, from) => {
        this.setState({
            anticipateStatus: "fgts_anticipation",
            header: localeObj.fgts_withdraw,
            direction: "left",
            anticipatationNextStage: "anticipate_success",
            isArbiError: false,
            prevMaxValue: this.state.maxValue,
            editAnticipation: from == "edit" ? true : false
        });

        arbiApiService.getAuthorizedFgtsValue(values, PageNameJSON.anticipate_verification).then(response => {
            if (response.success) {
                let processorResponse = ArbiResponseHandler.procesGetAuthorizedFgtsValue(response.result);
                if (processorResponse.success) {
                    this.setState({
                        value: processorResponse.installmentObject.valueReleased,
                        receivable: processorResponse.installmentObject.totalReceiveable,
                        installmentList: processorResponse.installmentObject.tableValues,
                        interestRate: processorResponse.installmentObject.interestRate,
                        maxValue: processorResponse.installmentObject.maxValue,
                        years: processorResponse.installmentObject.numberOfYears,
                        direction: "left",
                        anticipatationNextStage: "anticipate_success",
                        anticipateStatus: "show_installments",
                        waitingStatus: false,
                        isArbiError: false
                    })
                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                if (response.status === 500
                    || response.status === 400
                    || response.status === 403
                    || response.status === 404
                    || response.status === 503) {
                    if (response.result &&
                        (response.result.code === 9)) {
                        this.setState({
                            value: { "amount": "", "decimal": "" },
                            receivable: "",
                            installmentList: "[]",
                            anticipateStatus: "anticipate_verification2",
                            header: localeObj.fgts_withdraw,
                            direction: "left",
                            anticipatationNextStage: "account_error",
                            isArbiError: false
                        })
                    } else if (response.result && (response.result.code === 400 ||
                        response.result.code === 204 ||
                        response.result.code === 43037 ||
                        response.result.code === 1
                    )) {
                        this.setState({
                            value: { "amount": "", "decimal": "" },
                            receivable: "",
                            installmentList: "[]",
                            anticipateStatus: "anticipate_verification2",
                            header: localeObj.fgts_withdraw,
                            direction: "left",
                            anticipatationNextStage: "no_sufficient_balance",
                            isArbiError: false
                        })
                    } else if (response.result && (response.result.code === 43039
                        || response.result.code === 7)) {
                        this.setState({
                            value: { "amount": "", "decimal": "" },
                            receivable: "",
                            installmentList: "[]",
                            anticipateStatus: "anticipate_verification2",
                            header: localeObj.fgts_withdraw,
                            direction: "left",
                            anticipatationNextStage: "arbi_not_registered",
                            isArbiError: true
                        })
                    } else if (response.result && response.result.code === 10) {
                        this.setState({
                            value: { "amount": "", "decimal": "" },
                            receivable: "",
                            installmentList: "[]",
                            anticipateStatus: "anticipate_verification_error",
                            header: localeObj.fgts_withdraw,
                            direction: "left",
                            anticipatationNextStage: "anniversary_too_close",
                            isArbiError: false
                        })
                    } else if (response.result &&
                        (response.result.code === 524 ||
                            response.result.code === 429 ||
                            response.result.code === 950 ||
                            response.result.code === 0)) {
                        this.setState({
                            value: { "amount": "", "decimal": "" },
                            receivable: "",
                            installmentList: "[]",
                            anticipateStatus: "anticipate_verification_error",
                            header: localeObj.fgts_withdraw,
                            direction: "left",
                            anticipatationNextStage: "failed_to_contact_caixa",
                            isArbiError: false
                        })
                    } else if (response.result &&
                        (response.result.code === 525 ||
                            response.result.code === 11054 ||
                            response.result.code === 47001 ||
                            response.result.code === 11002
                        )) {
                        MetricServices.reportCustomEventMetricsToTagManager(PageNames.FgtsAPIError.fgtsAnticipateReqError)
                        this.setState({
                            value: { "amount": "", "decimal": "" },
                            receivable: "",
                            installmentList: "[]",
                            anticipateStatus: "anticipate_verification_error",
                            header: localeObj.fgts_withdraw,
                            direction: "left",
                            anticipatationNextStage: "fgts_req_failed",
                            isArbiError: false
                        })
                    } else {
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    this.setTransactionInfo(errorJson);
                }
            }
        });
    }

    fetchSignedContract = (type) => {
        this.showProgressDialog();
        arbiApiService.fetchSignedFgtsContract(this.state.finalContractId, PageNameJSON.anticipation_success).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processFetchSignedFgtsContract(response.result);
                if (processorResponse.success) {
                    if (type === "Download") {
                        let event = {
                            eventType: constantObjects.fgtsDownloadContract,
                            page_name: PageNameJSON["anticipation_success"]
                        };
                        MetricServices.reportActionMetrics(event, new Date().getTime());
                        this.saveAsPdf(processorResponse.text)
                    } else {
                        let event = {
                            eventType: constantObjects.fgtsShareContract,
                            page_name: PageNameJSON["anticipation_success"]
                        };
                        MetricServices.reportActionMetrics(event, new Date().getTime());
                        let name = "termos_de_fgts_" + this.state.finalContractId + "_" + moment().format("DDMMYYYY");
                        androidApiCalls.sharePdfFile(processorResponse.text, name);
                    }
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.tryAgainLater
                    })
                    return;
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
                return;
            }
        })
    }

    handleOpen = () => {
        androidApiCalls.openReceipt(this.state.fileName);
        this.setState({ finalDoc: false })
    }

    closeDownloadBar = () => {
        this.setState({ finalDoc: false })
    }


    saveAsPdf = (url) => {
        if (androidApiCalls.checkSelfPermission(WRITE_EXTERNAL_STORAGE) === 0) {
            let name = "termos_de_fgts_" + this.state.finalContractId + "_" + moment().format("DDMMYYYY") + ".pdf";
            let filename = androidApiCalls.getDownloadedFileName("Download", name);
            androidApiCalls.saveFile(url, "Download", name).then(result => {
                if (result) {
                    this.setState({
                        finalDoc: true,
                        fileName: name
                    })
                    androidApiCalls.updateDownloadNotification(localeObj.pix_download_complete, filename);
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.tryAgainLater,
                        fileName: name
                    })
                    androidApiCalls.updateDownloadNotification(localeObj.pix_receipt_download_failed, filename);
                }
            })

        } else {
            androidApiCalls.requestPermission(WRITE_EXTERNAL_STORAGE);
        }
    }

    defineValue = () => {
        this.setState({
            anticipateStatus: "get_amount",
            direction: "right",
            header: localeObj.fgts_withdraw
        })
    }

    goToWalletPage = () => {
        this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
    }

    openMyContracts = () => {
        this.props.history.replace({ pathname: "/fgtsHome", transition: "right", from: "anticipation_success" });
    }

    goToFgtsHomePage = () => {
        let valuePropsEnable = androidApiCalls.getDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY);
        if (valuePropsEnable === "1") {
            androidApiCalls.setDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY, "4");
        } else {
            androidApiCalls.setDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY, "6");
        }
        this.props.history.replace({ pathname: "/fgtsHome", transition: "right", from: "anticipation" });
    }

    onBack = () => {
        if (this.state.processing || this.state.anticipateStatus == "fgts_anticipation") {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else if (this.state.reset) {
            this.setState({
                reset: false
            });
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.anticipateStatus], PageState.back);
            switch (this.state.anticipateStatus) {
                case "anticipate_verification":
                case "anticipate_verification2":
                case "show_installments":
                    this.goToFgtsHomePage();
                    break;
                case "error":
                    this.goToWalletPage();
                    break;
                case "anticipate_verification_error":
                    if (this.state.errorFromAnticipate) {
                        this.setState({
                            anticipateStatus: "anticipate_verification",
                            direction: "right",
                            header: localeObj.fgts_withdraw,
                            errorFromAnticipate: false
                        })
                    } else {
                        this.goToFgtsHomePage();
                    }
                    break;
                case "get_amount":
                    this.setState({
                        anticipateStatus: "show_installments",
                        direction: "right",
                        header: localeObj.fgts_withdraw,
                    })
                    break;
                case "confirm_anticipation":
                    this.setState({
                        anticipateStatus: "show_installments",
                        direction: "right",
                        header: localeObj.fgts_withdraw
                    })
                    break;
                case "display_terms":
                    this.setState({
                        anticipateStatus: "show_installments",
                        direction: "right",
                        header: localeObj.fgts_withdraw,
                        alert: {
                            type: "Alert",
                            mainHeader: localeObj.fgts_anticipate_alert_mainHeader,
                            value: "R$ " + GeneralUtilities.formatBalance(this.state.value.amount) + "," + this.state.value.decimal,
                            subHeader: GeneralUtilities.formattedString(localeObj.fgts_anticipate_alert_subHeader, [this.state.years]),
                            footer: localeObj.fgts_anticipate_alert_footer + " R$ " + this.state.receivable,
                            button1: localeObj.fgts_anticipate_alert_button1,
                            button2: localeObj.fgts_anticipate_alert_button2
                        }
                    })
                    break;
                case "verify_pin":
                    this.setState({
                        anticipateStatus: "display_terms",
                        direction: "right"
                    });
                    break;
                case "faceMatch":
                    this.setState({
                        anticipateStatus: "verify_pin",
                        direction: "right"
                    });
                    break;
                case "faceauth_review":
                    this.doFaceMatch();
                    break;
                case "anticipation_success":
                default:
                    this.goToFgtsHomePage();
                    break;
            }
        }
    }

    handleBottomSheet = (val) => {
        this.setState({
            bottomSheetEnabled: val
        });
    }

    forgot_passcode = () => {
        this.setState({
            bottomSheetOpen: false,
            reset: false
        })
        this.props.history.replace("/securityComp", { "from": "pinPage" });
    }

    onPrimary = () => {
        this.setState({
            bottomSheetOpen: false,
            clearPassword: true
        })
    }

    onSecondary = () => {
        this.setState({ bottomSheetOpen: false })
    }


    render() {
        const currentState = this.state.anticipateStatus;
        const { classes } = this.props;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        return (
            <div style={{ overflowX: "hidden" }}>
                {currentState !== "error" && currentState !== "confirm_anticipation" && currentState !== "anticipation_success" && currentState !== "faceauth_review" &&
                    <ButtonAppBar header={this.state.header} onBack={this.onBack} action="none" />
                }
                {currentState === "confirm_anticipation" &&
                    <ButtonAppBar onBack={this.onBack} action="none" />
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "fgts_anticipation" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "fgts_anticipation" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "fgts_anticipation" &&
                            <FgtsAnticipateVerification
                                setTransactionInfo={this.setTransactionInfo}
                                apiStatus={true}
                                componentName={PageNameJSON.anticipate_verification}
                                anticipatationNextStage={this.state.anticipatationNextStage}
                                onCancel={this.goToFgtsHomePage} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "anticipate_verification2" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "anticipate_verification2" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "anticipate_verification2" &&
                            <FgtsAnticipateVerification
                                setTransactionInfo={this.setTransactionInfo}
                                apiStatus={false}
                                componentName={PageNameJSON.anticipate_verification}
                                anticipatationNextStage={this.state.anticipatationNextStage}
                                onCancel={this.goToFgtsHomePage} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "anticipate_verification_error" && this.state.anticipateStatus === "anticipate_verification_error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "anticipate_verification_error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "anticipate_verification_error" &&
                            <FgtsAnticipateError
                                setTransactionInfo={this.setTransactionInfo}
                                componentName={PageNameJSON.anticipate_verification_error}
                                isArbiError={this.state.isArbiError}
                                anticipatationNextStage={this.state.anticipatationNextStage}
                                onCancel={this.goToWalletPage} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "show_installments" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "show_installments" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "show_installments" &&
                            <FgtsInterst
                                setTransactionInfo={this.setTransactionInfo}
                                simulate={false}
                                value={this.state.value}
                                onBackHome={this.onBack}
                                componentName={PageNameJSON.show_installments}
                                header={localeObj.fgts_anticipate_loan_header1}
                                totalReceivable={this.state.receivable}
                                valueComponent={this.state.installmentList}
                                newValue={this.defineValue}
                                interestRate={this.state.interestRate}
                                prevMaxValue={this.state.maxValue}
                                editAnticipation={this.state.editAnticipation} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "get_amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "get_amount" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "get_amount" &&
                            <AmountComponent
                                maxVal={this.state.maxValue}
                                setTransactionInfo={this.setTransactionInfo}
                                feature="fgts_anticipate"
                                componentName={PageNameJSON.get_amount}
                                cancelSimulate={this.goToFgtsHomePage} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "confirm_anticipation" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "confirm_anticipation" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "confirm_anticipation" &&
                            <ShowAnticipationStates
                                alert={this.state.alert}
                                onClick={this.setTransactionInfo}
                                componentName={PageNameJSON.confirm_anticipation} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "display_terms" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "display_terms" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "display_terms" &&
                            <FgtsTermsPage
                                back={this.onBack}
                                terms={this.state.terms}
                                onClick={this.setTransactionInfo}
                                componentName={PageNameJSON.display_terms} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "verify_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "verify_pin" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "verify_pin" &&
                            <InputPinPage
                                back={this.onBack}
                                confirm={this.setTransactionInfo}
                                clearPassword={this.state.clearPassword}
                                componentName={PageNameJSON.verify_pin}
                                fgts={localeObj.fgts_anticipate_authenticate} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "anticipation_success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "anticipation_success" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "anticipation_success" &&
                            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                                <ImageInformationComponent
                                    header={localeObj.fgts_anticipation_successful_header}
                                    icon={logo}
                                    appBarTitle={this.state.header}
                                    appBar={true}
                                    suggestion={localeObj.fgts_anticipation_successful_suggestion}
                                    description={localeObj.fgts_anticipation_successful_description}
                                    btnText={localeObj.back_home}
                                    value={this.state.value}
                                    noBottomSheet={true}
                                    type={PageNameJSON.anticipation_success}
                                    tooltip={localeObj.fgts_anticipation_successful_footer}
                                    next={this.goToWalletPage}
                                    secBtnText={localeObj.fgts_see_my_contracts}
                                    close={this.openMyContracts}
                                    onCancel={this.goToWalletPage} />
                            </div>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "faceMatch" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
                    <div style={{ display: (currentState === "faceMatch" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "faceMatch" &&
                            <FaceMatchComponent
                                componentName={PageNameJSON.faceauth}
                                imageStatus="FGTS Selfie"
                                fourthDescriptionText={""}
                                primaryBtnAction={this.doFaceMatch}
                                onBackButtonPressed={this.onBack} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "faceauth_review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
                    <div style={{ display: (currentState === "faceauth_review" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "faceauth_review" &&
                            <FaceMatchComponent
                                componentName={PageNameJSON.faceauth_success}
                                imageStatus="Selfie review"
                                fourthDescriptionText={<img style={{ maxWidth: "15.5rem", maxHeight: "19.5rem" }} src={this.state.imageUrl} alt="" />}
                                primaryBtnAction={this.signContract}
                                secondaryBtnAction={this.doFaceMatch}
                                onBackButtonPressed={this.onBack} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "error" &&
                            <PixErrorComponent
                                errorJson={this.state.pixErrorJson}
                                onClick={this.goToWalletPage}
                                componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                {this.state.storagePermissionAlert &&
                    <AlertDialog title={localeObj.allow_storage_title} description={localeObj.allow_storage}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closestoragePermissionAlertDialog} />
                }
                {this.state.cameraAlert &&
                    <AlertDialog title={localeObj.allow_camera_title} description={localeObj.allow_camera}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeCameraAlertDialog} />
                }
                <div id="outer" style={{ width: "100%", padding: "5%" }} className="accountOuterContainer">
                    <Drawer
                        anchor="bottom"
                        open={this.state.finalDoc}>
                        <MuiThemeProvider theme={theme1}>
                            <AppBar position="static" color="transparent" elevation="0">
                                <Toolbar>
                                    <IconButton style={{ color: ColorPicker.white }} disabled={true}>
                                        <DoneIcon />
                                    </IconButton>
                                    <span className="body1 highEmphasis">
                                        {localeObj.download_complete}
                                    </span>
                                    <span className="body1 accent" onClick={() => this.handleOpen()}>
                                        {localeObj.open}
                                    </span>
                                    <IconButton>
                                        <CancelIcon style={{ color: ColorPicker.white }} onClick={() => this.closeDownloadBar()} />
                                    </IconButton>
                                </Toolbar>
                            </AppBar>
                        </MuiThemeProvider>
                    </Drawer>
                </div>
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
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
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
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.reset_password} onCheck={this.forgot_passcode} />
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

FgtsAnticipateFlow.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
};

/*
Add condition -> (this.selectKeyType(this.state.transactionInfo["transferType"]) !== "CPF" || this.state.isSentFromTransactionHistory) ? false : true
for enabling regular payment to state "select_date" 
*/
export default withStyles(styles)(FgtsAnticipateFlow);