import React from "react";
import moment from "moment";
import FlexView from "react-flexview";
import PropTypes from 'prop-types';
import "../../../styles/main.css";
import "../../../styles/colorSelect.css";
import "../../../styles/new_pix_style.css";
import "../../../styles/genericFontStyles.css";
import { CSSTransition } from 'react-transition-group';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';

import InputThemes from "../../../Themes/inputThemes";

import { Divider } from "@mui/material";
import Paper from '@material-ui/core/Paper';
import Drawer from '@material-ui/core/Drawer';
import MuiAlert from '@material-ui/lab/Alert';
import InfoIcon from '@mui/icons-material/Info';
import Snackbar from '@material-ui/core/Snackbar';
import BarChartIcon from '@mui/icons-material/BarChart';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import PayIcon from "../../../images/SvgUiIcons/pay.svg";
import face from "../../../images/SpotIllustrations/Face.png";

import PixAmountComp from "./PixAmountComp";
import CreditContract from "./CreditContract";
import RedeemAmountComp from "./RedeemAmountComp";
import jwtDecode from 'jwt-decode';
import "../../../styles/main.css";
import "../../../styles/new_pix_style.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import CreditCardSuccess from "./CreditCardSuccess";
import RedeemDetailsComp from "./RedeemDetailsComp";
import RedeemConfirmationComp from "./RedeemConfirmationComp";
import CreditCardInvestmentInfo from "./CreditCardInvestmentInfo";
import CreditInvestmentAmountComp from "./CreditInvestmentAmountComp";

import Log from "../../../Services/Log";
import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import ColorPicker from "../../../Services/ColorPicker";
import constantObjects from "../../../Services/Constants";
import MetricServices from "../../../Services/MetricsService";
import ArbiApiService from "../../../Services/ArbiApiService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import walletJwtService from "../../../Services/walletJwtService";
import localeListService from "../../../Services/localeListService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import androidApiCallsService from "../../../Services/androidApiCallsService";
import ArbiErrorResponseHandler from '../../../Services/ArbiErrorResponsehandler';

import AlertDialog from "../../NewOnboardingComponents/AlertDialog";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import PixReceiveComponents from "../../PIXComponent/PixNewRecieve/PixReceiveComponents";
import RegisterNewKeyComponent from "../../PIXComponent/PixKeyHandleComponents/RegisterNewKeyComponent";

import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import InputPinPage from "../../CommonUxComponents/InputPinPageWithValidation";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import ImageInformationComponent from "../../CommonUxComponents/ImageInformationComponent";

var localeObj = {};
const PageNameJSON = PageNames.CreditCardInvestmentComponents;
const theme2 = InputThemes.snackBarThemeForMyCards;
const styles = InputThemes.singleInputStyle;
const CAMERA_PERMISSION = "android.permission.CAMERA";
const CAF_LOGS = "CAF_FACELIVENESS";
const FACELIVENESS_SUCCESS = "FACELIVENESS_SUCCESS";
const FACELIVENESS_FAILURE = "FACELIVENESS_FAILURE";
const FACELIVENESS_URI = "GET_LIVENESS_METRICS_FOR_CAF";

var caf_start_time = "";
class CreditCardInvestmentComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            processing: false,
            creditLimit: 0,
            creditLimitJson: {
                "formatted": "0",
                "decimal": "00"
            },
            totalInvestedJson: {
                "formatted": "0",
                "decimal": "00"
            },
            totalInvested: 0,
            grossInvestedJson: {
                "formatted": "0",
                "decimal": "00"
            },
            grossInvested: 0,
            income: 0,
            amountAvailableToRedeem: 0,
            investedDate: "",
            toDate: "",
            redeemAmount: 0,
            operation: "",
            investMoreAmount: 0,
            investmentAmount: 0,
            investmentDecimal: 0,
            previousComponent: "",
            creditUsage: this.props.creditUsage || "0,00",
            isAlive: false
        }
        this.style = {
            smallCardStyle: {
                width: "9rem",
                height: "9rem",
                borderRadius: "1.75rem",
                backgroundColor: ColorPicker.newProgressBar,
                margin: "0.5rem",
                padding: "1.5rem"
            },
        }
        this.componentName = PageNameJSON['investInfo'];
        MetricServices.onPageTransitionStart(PageNameJSON['investInfo']);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeListService.getActionLocale();
        }
    }
    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        this.fetchTokenForCAF(ImportantDetails.cpf);
        this.setState({
            appBar: localeObj.new_dimo_credit_investment_home
        })
        this.getCreditInvestmentHomePageDetails()

        window.onBackPressed = () => {
            this.onBack();
        }

        window.onPassiveLivenessImage = (selfieImage) => {
            //Log.sDebug("onPassiveLivenessImage:" + selfieImage);
            this.setState({
                selfie: selfieImage
            });
        }

        window.onFaceLivenessImage = (imageUrl, jwt) => {
            Log.sDebug("onActiveFaceLivenessImage " + imageUrl + " " + jwt);
            try {
                let i = jwt.lastIndexOf(".");
                let subjwt = jwt.substr(0, i);
                Log.sDebug("onActiveFaceLivenessImage sub test " + " : " + subjwt);
                const decodedToken = jwtDecode(subjwt);
                Log.sDebug("decodedToken : " + decodedToken + " : " + decodedToken.isAlive + " : " + decodedToken.userId + " : " + decodedToken.requestId);
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
            Log.sDebug("onPassiveLivenessStatus:", faceLiveJson);
            let finalFaceLivenessJSON = faceLiveJson;
            if (finalFaceLivenessJSON) {
                //Log.sDebug("Faceliveness SDK compelte. Logs " + JSON.stringify(finalFaceLivenessJSON));
                if (finalFaceLivenessJSON.sdkStatusCode && finalFaceLivenessJSON.sdkStatusCode === 1) {
                    this.uploadSelfieDocWithCAF(this.state.selfieImage);
                } else {
                    this.hideProgressDialog();
                    this.openSnackBar(GeneralUtilities.getCAFFailureText(finalFaceLivenessJSON.sdkStatusMessage, localeObj));
                }
            } else {
                this.hideProgressDialog();
                //Log.sDebug("Faceliveness SDK Failure with NULL JSON from APK");
                this.openSnackBar(localeObj.retry_later);
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
                        GeneralUtilities.sendCAFSDKMetrics(FACELIVENESS_URI, FACELIVENESS_SUCCESS, true, timeSpentOnCAF, finalFaceLiveness, localeObj, PageNameJSON['credit_facematch']);
                        this.uploadSelfieDocWithCAF(this.state.selfieImage);
                    } else {
                        this.hideProgressDialog();
                        Log.sDebug("Active Faceliveness SDK Failure due to isAlive false", CAF_LOGS, constantObjects.LOG_PROD);
                        this.openSnackBar(GeneralUtilities.getCAFFailureText("1", localeObj));
                        GeneralUtilities.sendActiveCAFFailureSDKMetrics(FACELIVENESS_URI, FACELIVENESS_FAILURE, true, timeSpentOnCAF, finalFaceLiveness, "0", localeObj, PageNameJSON['credit_facematch']);
                    }
                } else {
                    this.hideProgressDialog();
                    Log.sDebug("Faceliveness SDK Failure with status code 0");
                    this.openSnackBar(GeneralUtilities.getCAFFailureText("0", localeObj));
                }
            } else {
                this.hideProgressDialog();
                Log.sDebug("Faceliveness SDK Failure with NULL JSON from APK");
                this.openSnackBar(GeneralUtilities.getCAFFailureText("0", localeObj));
            }
        }


        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === CAMERA_PERMISSION) {
                if (status === true) {
                    this.doFaceMatch();
                } else {
                    if (androidApiCallsService.isFeatureEnabledInApk("CAF_VALIDATION")) {
                        this.setState({
                            cameraAlert: true
                        })
                    } else {
                        this.openSnackBar(localeObj.allow_camera);
                    }
                }
            }
        }


    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNameJSON['investInfo'], PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNameJSON['investInfo'])
        }
    }

    uploadSelfieDocWithCAF(selfieImage) {
        let selfieClicked = GeneralUtilities.emptyValueCheck(selfieImage) ? this.state.selfie : selfieImage;
        let jsonObjectSelfie = {
            "url": selfieClicked,
            "extensao": 2

        }
        if (this.state.operation === "redeem_money")
            this.faceMatchRedeem(jsonObjectSelfie);
        else
            this.faceMatchInvestMore(jsonObjectSelfie);

    }

    faceMatchRedeem = (selfieObj) => {
        this.showProgressDialog();
        let jsonObj = {};
        jsonObj["token"] = this.state.token;
        jsonObj["redeemAmount"] = this.state.redeemAmount;
        jsonObj["selfieObj"] = selfieObj;
        ArbiApiService.faceMatchRedeem(jsonObj, PageNameJSON["credit_facematch"]).then(response => {
            this.hideProgressDialog();
            //Log.sDebug("faceMatchRedeem: response: " + JSON.stringify(response));
            if (response.success) {
                this.setState({
                    currentState: "redeem_facematch_success",
                    direction: "left",
                })

            } else {
                this.hideProgressDialog();
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    faceMatchInvestMore = (selfieObj) => {
        this.showProgressDialog();
        let jsonObj = {};
        jsonObj["token"] = this.state.token;
        jsonObj["selfieObj"] = selfieObj;
        ArbiApiService.faceMatchInvestMore(jsonObj).then(response => {
            this.hideProgressDialog();
            //Log.sDebug("faceMatchInvestMore: response: "+ JSON.stringify(response));
            if (response.success) {
                this.setState({
                    currentState: "investMore_facematch_success",
                    direction: "left",
                })

            } else {
                this.hideProgressDialog();
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });
    }


    getCreditInvestmentHomePageDetails = () => {
        this.showProgressDialog();
        ArbiApiService.getCreditInvestmentHomePageDetails(this.componentName).then(response => {
            //Log.sDebug("getCreditInvestmentHomePageDetails: response: " +JSON.stringify(response));
            if (response.success) {
                let processedDetails = ArbiResponseHandler.processCreditInvestmentHomePageDetails(response.result);
                //Log.sDebug("getCreditInvestmentHomePageDetails: processedDetails: " +JSON.stringify(processedDetails));
                this.hideProgressDialog();
                if (processedDetails.success) {
                    this.setState({
                        creditLimit: processedDetails.creditInvestmentInfo.creditLimit,
                        creditLimitJson: GeneralUtilities.formatAmountDecimal(processedDetails.creditInvestmentInfo.creditLimit),
                        totalInvested: processedDetails.creditInvestmentInfo.valueInvested,
                        totalInvestedJson: GeneralUtilities.formatAmountDecimal(processedDetails.creditInvestmentInfo.valueInvested),
                        grossInvested: processedDetails.creditInvestmentInfo.grossPosition,
                        grossInvestedJson: GeneralUtilities.formatAmountDecimal(processedDetails.creditInvestmentInfo.grossPosition),
                        investedDate: moment.utc(processedDetails.creditInvestmentInfo.fromDate).format('MM/DD/YYYY'),
                        toDate: moment.utc(processedDetails.creditInvestmentInfo.toDate).format('MM/DD/YYYY'),
                        income: processedDetails.creditInvestmentInfo.income,
                        taxes: processedDetails.creditInvestmentInfo.taxes,
                        amountAvailableToRedeem: processedDetails.creditInvestmentInfo.amountAvailableToRedeem,
                        currentState: "investInfo",
                        appBar: localeObj.new_dimo_credit_investment_home

                    });
                    if (this.props.additionalInfo !== "" && this.props.additionalInfo !== undefined) {
                        let action = this.props.additionalInfo["creditActions"];
                        if (action !== "" && action !== undefined) {

                            if (action === "investMore") {
                                this.investMore();
                            } else if (action === "redeem") {
                                this.redeemMoney();
                            }

                        }
                    }

                } else {
                    this.hideProgressDialog();
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);

                }
            } else {
                this.hideProgressDialog();
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });

    }

    setUserBalance = () => {
        this.showProgressDialog();
        ArbiApiService.getUserBalance(this.componentName)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse.success) {
                        GeneralUtilities.setBalanceToCache(processorResponse.balance);
                        this.hideProgressDialog();
                        this.setState({
                            balance: processorResponse.balance,
                            currentState: "credit_invest_amount",
                            appBar: localeObj.new_dimo_credit_investment,
                            previousComponent: this.state.currentState,
                            direction: "right"
                        });
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
    }


    onBack = () => {
        if (this.state.processing) {
            this.openSnackBar(localeObj.no_action);
            return;
        } else if (this.state.open) {
            this.closeBottomSheet();
            return
        } else if (this.state.creditInfoDrawer) {
            this.closeCreditInfoDialog();
            return
        } else if (this.state.bottom) {
            this.handleClose();
            return;
        } else {
            switch (this.state.currentState) {
                case "credit_facematch":
                    this.setState({
                        currentState: "credit_pin_input",
                        appBar: localeObj.pix_authentication,
                        previousComponent: this.state.currentState,
                        direction: "right"
                    })
                    break;
                case "credit_pin_input":
                    if (this.state.operation === "redeem_money") {
                        this.setState({
                            currentState: "redeem_details",
                            appBar: localeObj.redeem_appBar,
                            previousComponent: this.state.currentState,
                            direction: "right"
                        });
                    } else {
                        this.setUserBalance();
                    }

                    break;
                case "redeem_details":
                    this.setState({
                        currentState: "redeem_amount",
                        appBar: localeObj.redeem_appBar,
                        previousComponent: this.state.currentState,
                        direction: "right"
                    });
                    break;
                case "register_key":
                case "receive_pix":
                case "credit_contract":
                case "credit_pix_amount":
                    this.setUserBalance();
                    break;
                case "credit_invest_amount":
                    this.setState({
                        currentState: "credit_invest",
                        previousComponent: this.state.currentState,
                        direction: "right"
                    });
                    break;
                case "redeem_amount":
                    this.redeemMoney();
                    break;
                case "redeem":
                case "credit_invest":
                    this.setState({
                        currentState: "investInfo",
                        direction: "right",
                        previousComponent: this.state.currentState,
                        appBar: localeObj.new_dimo_credit_investment_home
                    })
                    break;
                case "investInfo":
                default:
                    this.props.onBack();
                    break;

            }
        }

    }

    setTransactionInfo = (formInfo) => {
        if (formInfo && !!formInfo.error) {
            //Log.sDebug("Error occured: " + formInfo.error);
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
                currentState: "error",
                direction: "left",
                creditErrorJson: jsonObj
            })
        } else {
            switch (this.state.currentState) {
                case "credit_invest":
                    this.setUserBalance();
                    break;
                case "credit_invest_amount":
                    this.investMoreSimulate(formInfo.amount);
                    break;
                case "credit_due_date":
                    this.setState({
                        dueDate: formInfo,
                        bottomSheetOpen: true
                    })
                    break;
                case "credit_contract":
                    this.investMoreSimulate(this.state.investMoreAmount);
                    break;
                case "credit_facematch":
                default:
                    this.goToInvestmentHomePage();
                    break;
            }
        }
    }

    investMore = () => {
        this.setState({
            operation: "invest_more"
        })
        this.showProgressDialog();
        ArbiApiService.getGuaranteedCreditInvestmentInfo(this.componentName).then(response => {
            //Log.sDebug("getGuaranteedCreditInvestmentInfo: response: " +JSON.stringify(response));
            if (response.success) {
                let processedDetails = ArbiResponseHandler.processGuaranteedCreditInvestmentInfoResponse(response.result);
                if (processedDetails.success) {
                    this.setState({
                        currentState: "credit_invest",
                        creditInvestmentdetails: processedDetails.creditInvestmentInfo,
                        appBar: localeObj.new_dimo_credit_investment,
                        direction: "left",
                    })
                    this.hideProgressDialog();

                } else {
                    this.hideProgressDialog();
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });

    }


    getCreditContract = () => {
        this.showProgressDialog();
        ArbiApiService.getCreditContract(this.componentName).then(response => {
            this.hideProgressDialog();
            //Log.sDebug("getCreditContract: " + JSON.stringify(response));
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processCreditContractResponse(response.result);
                //Log.sDebug("getCreditContract: processorResponse: " + JSON.stringify(processorResponse));
                if (processorResponse.success) {
                    if (GeneralUtilities.emptyValueCheck(processorResponse.toc)) {
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                        this.setTransactionInfo(errorJson);
                    } else {
                        this.setState({
                            toc: processorResponse.toc,
                            contractId: processorResponse.contractId,
                            currentState: "credit_contract",
                            appBar: localeObj.contract,
                            direction: "left"
                        })
                    }
                } else {
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
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

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    showErrorScreen = () => {
        //Log.sDebug("showErrorScreen");
        let jsonObj = {}
        jsonObj["header"] = localeObj.gpay_error_header;
        jsonObj["description"] = localeObj.generic_error + " " + localeObj.generic_error_subtext;
        this.setState({
            currentState: "error",
            direction: "left",
            creditErrorJson: jsonObj
        })
    }

    fetchTokenForCAF = async (cpf) => {
        await Promise.all([await walletJwtService.CAFAuthentication(cpf)]).then(async values => {
            if (GeneralUtilities.emptyValueCheck(values[0])) {
                //Log.sDebug("Retrying for token as value is empty");
                await walletJwtService.CAFAuthentication(cpf)
            }
        }).catch(async () => {
            //Log.sDebug("Retrying for token as due to following error " + err);
            await walletJwtService.CAFAuthentication(cpf)
        })
    }

    pixAmountPage = () => {
        this.setState({
            currentState: "credit_pix_amount",
            appBar: localeObj.pix_header,
            direction: "left",
        })
    }

    sendPixToMyAccount = async (amount, decimal, pixAmount, pixDecimal, displayAmount = 0) => {
        //Log.sDebug("sendPixToMyAccount: amount: " + amount + " decimal: " + decimal);
        let limit = parseFloat(amount + "." + decimal);
        this.setState({
            investMoreAmount: limit,
        });
        this.setState({
            investmentAmount: displayAmount
        });
        let response = {};
        if (ImportantDetails.pixKeysResponse === null ||
            ImportantDetails.pixKeysResponse == {} || ImportantDetails.fromRegisterPixKey
            || Object.keys(ImportantDetails.pixKeysResponse).length === 0) {
            this.showProgressDialog();
            await ArbiApiService.getAllPixKeys(this.componentName).then(pixResponse => {
                this.hideProgressDialog();
                response = pixResponse;
                ImportantDetails.pixKeysResponse = pixResponse;
                ImportantDetails.fromRegisterPixKey = false;
            });
        } else {
            response = ImportantDetails.pixKeysResponse;
        }
        if (response.success) {
            let responseHandler = ArbiResponseHandler.processGetAllPixKeysResponse(response.result);
            if (responseHandler.success) {
                const pixKeys = responseHandler.pixKeys;
                if (pixKeys.length === 0) {
                    this.setState({
                        bottom: true,
                        processing: false
                    });
                } else {
                    this.setState({
                        currentState: "receive_pix",
                        processing: false,
                        location: {
                            additionalInfo: {
                                pixActions: "pix_receive",
                                amount: amount,
                                decimal: decimal,
                                entryPoint: "pixReceiveCreditCard"
                            },
                            subDeepLink: true
                        }
                    })
                }
            } else {
                this.hideProgressDialog();
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
                //Log.sDebug("there is some error " + JSON.stringify(response));
            }
        } else {
            this.hideProgressDialog();
            let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
            this.setTransactionInfo(errorJson);
        }
        Log.debug("registered keys are " + this.state.myKeys, "credit_card_component");
    }

    registerKey = () => {
        this.setState({ bottom: false });
        this.setState({
            currentState: "register_key"
        })
        //Log.sDebug("clicked register key", "credit card page");
    }
    handleClose = () => {
        this.setState({ bottom: false });
    }

    onPixReceiveContinue = () => {
        this.setUserBalance();
    }


    redeemMoney = () => {
        //Log.sDebug("redeemMoney");
        let jsonObj = {}
        jsonObj["header"] = localeObj.redeem_header;
        jsonObj["description"] = localeObj.redeem_desc;
        jsonObj["caption"] = localeObj.redeem_caption;

        this.setState({
            currentState: "redeem",
            direction: "left",
            creditErrorJson: jsonObj,
            operation: "redeem_money"
        })

    }
    invesmentDetails = () => {
        this.openSnackBar(localeObj.coming_soon);
    }

    invesmentHistory = () => {
        this.openSnackBar(localeObj.coming_soon);

    }

    redeemInvestment = (amount, decimal) => {
        //Log.sDebug("amount:" + amount + " decimal: " + decimal);
        let intAmount = parseFloat(amount + "." + decimal);
        this.showProgressDialog();
        ArbiApiService.simulateRedeemInvestment(intAmount, this.componentName).then(response => {
            //Log.sDebug("simulateRedeemInvestment: response: " +JSON.stringify(response));
            if (response.success) {
                let processedDetails = ArbiResponseHandler.processSimulateRedeemDetails(response.result);
                //Log.sDebug("simulateRedeemInvestment: processedDetails: " +JSON.stringify(processedDetails));
                this.hideProgressDialog();
                if (processedDetails.success) {
                    let jsonObj = {}
                    let value = GeneralUtilities.formatDecimal(processedDetails.creditRedeemInfo.redeemAmount);
                    //Log.sDebug("value:" + value);
                    let amount = value.substring(0, value.length - 3);
                    let decimal = value.substring(value.length - 2, value.length);
                    jsonObj["creditLimit"] = processedDetails.creditRedeemInfo.creditLimit;
                    jsonObj["newCreditLimit"] = processedDetails.creditRedeemInfo.creditLimitPostRedeem;
                    jsonObj["full"] = amount;
                    jsonObj["decimal"] = decimal;
                    this.setState({
                        currentState: "redeem_details",
                        direction: "left",
                        details: jsonObj,
                        redeemAmount: processedDetails.creditRedeemInfo.redeemAmount,
                    })

                } else {
                    this.hideProgressDialog();
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);

                }
            } else {
                this.hideProgressDialog();
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });


    }
    onHelp = () => {
        //Log.sDebug("onAction");
        GeneralUtilities.openHelpSection();
    }

    investMoreSimulate = (investMoreAmount) => {
        //Log.sDebug("investMoreAmount:" + investMoreAmount);
        this.showProgressDialog();
        ArbiApiService.simulateInvestMore(investMoreAmount, this.componentName).then(response => {
            //Log.sDebug("investMoreSimulate: response: " +JSON.stringify(response));
            if (response.success) {
                let processedDetails = ArbiResponseHandler.processSimulateInvestMore(response.result);
                //Log.sDebug("investMoreSimulate: processedDetails: " +JSON.stringify(processedDetails));
                this.hideProgressDialog();
                if (processedDetails.success) {
                    this.inputPinScreen();

                } else {
                    this.hideProgressDialog();
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                    this.setTransactionInfo(errorJson);

                }
            } else {
                this.hideProgressDialog();
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response.result);
                this.setTransactionInfo(errorJson);
            }
        });


    }

    inputPinScreen = () => {
        this.setState({
            currentState: "credit_pin_input",
            direction: "left",
            appBar: localeObj.pix_authentication
        })

    }

    faceMatchScreen = (token) => {
        //Log.sDebug("faceMatchScreen");
        this.setState({
            appBar: localeObj.faceMatch,
            currentState: "credit_facematch",
            direction: "left",
            token: token
        })
    }

    doFaceMatch = () => {
        caf_start_time = new Date().getTime();
        if (androidApiCallsService.checkSelfPermission(CAMERA_PERMISSION) === 0) {
            if (GeneralUtilities.isCAFEnabled()) {
                if (androidApiCallsService.isFeatureEnabledInApk("FACE_LIVELINESS") && GeneralUtilities.doesDeviceSupportActiveFaceliveness()) {
                    androidApiCallsService.faceLiveness(ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
                } else {
                    androidApiCallsService.passiveFaceLiveness(ImportantDetails.jwtForCAF, ImportantDetails.cpf.toString());
                }
            }
            else {
                this.openSnackBar(localeObj.facematch_not_sup);
            }
        } else {
            androidApiCallsService.requestPermission(CAMERA_PERMISSION);
        }

    }

    closeCameraAlertDialog = () => {
        this.setState({
            cameraAlert: false
        })
    }


    help = () => {
        GeneralUtilities.openHelpSection();
    }


    goToInvestmentHomePage = () => {
        this.setState({
            currentState: "investInfo",
            direction: "right",
            appBar: localeObj.new_dimo_credit_investment_home
        })
    }

    redeemMoneyButtonClick = () => {
        //Log.sDebug("redeemMoneyButtonClick");
        this.setState({
            currentState: "redeem_amount",
            direction: "left",
            appBar: localeObj.redeem_appBar
        })
    }

    openCreditInfoDialog = () => {
        this.setState({
            creditInfoDrawer: true
        })
    }

    closeCreditInfoDialog = () => {
        this.setState({
            creditInfoDrawer: false
        })
    }

    openBottomSheet = () => {
        this.setState({
            open: true,
            header: localeObj.redeem_bottomsheet_header,
            description: localeObj.redeem_bottomsheet_desc,
            btnText: localeObj.redeem_bottomsheet_btntext
        })
    }

    closeBottomSheet = () => {
        this.setState({
            open: false
        })
    }


    setInvestMentAmount = (amount, decimal, displayAmount = 0) => {
        //Log.sDebug("setInvestMentAmount, amount: " + amount + "decimal:" + decimal );
        this.setState({
            investMoreAmount: amount,
            investmentAmount: displayAmount
        });
        this.setTransactionInfo({
            "amount": amount,
            "decimal": decimal,
            "displayAmount": displayAmount
        });
    }

    render() {
        const { classes } = this.props;
        const currentState = this.state.currentState;
        return (
            <div style={{ overflowX: "hidden" }}>
                <div style={{
                    display: !this.state.processing && currentState !== "error" && currentState !== "redeem_facematch_success" &&
                        currentState !== "investMore_facematch_success" && currentState !== "redeem" && currentState !== "receive_pix" && currentState !== "register_key" ? 'block' : 'none'
                }}>
                    <ButtonAppBar header={this.state.appBar} onBack={this.onBack} action={currentState === "credit_invest" ? "help" : "none"} onHelp={this.onHelp} />
                </div>
                {!this.state.processing && currentState === "investInfo" && <div>

                    <div style={{ textAlign: "center", margin: "2rem" }}>
                        <div className="body2 highEmphasis" style={{ margin: "0.5rem" }}>
                            {localeObj.ci_total_invest}
                        </div>
                        <span style={{ textAlign: "center" }}>
                            <span className="headline5 highEmphasis" style={{ marginRight: "0.325rem" }}>{"R$"}</span>
                            <span className="headline2 highEmphasis balanceStyle" >{this.state.grossInvestedJson.formatted}</span>
                            <span className="superScript headline5 highEmphasis">{"," + this.state.grossInvestedJson.decimal}</span>
                        </span>
                        <div className="body2 highEmphasis" style={{ margin: "0.5rem" }}>
                            {GeneralUtilities.formattedString(localeObj.ci_available, [GeneralUtilities.formatAmount(this.state.amountAvailableToRedeem)])}
                            <InfoIcon style={{ fill: ColorPicker.white, width: "1rem", height: "1rem" }} onClick={this.openCreditInfoDialog} />
                        </div>

                    </div>

                    <FlexView hAlignContent="center" style={{ display: 'flex', justifyContent: 'space-between', margin: "0rem 0.5rem" }}>
                        <Paper id={"total_invest"} elevation="0"
                            style={this.style.smallCardStyle}>
                            <div style={{ textAlign: "left" }}>
                                <div style={{ margin: "0.5rem" }}>
                                    <img alt ="" src={PayIcon} style={{ fill: ColorPicker.accent, width: "1.5rem", display: 'block' }} />
                                </div>
                                <div className="subtitle1 highEmphasis" style={{ margin: "0.5rem" }}>
                                    {localeObj.ci_my_assets}
                                </div>
                                {/*<div className="body2 mediumEmphasis" style={{margin:"0 0.5rem"}}>
                                    {GeneralUtilities.formattedString(localeObj.ci_since, [this.state.investedDate]) }
                                </div>*/}
                                <div className="subtitle4 highEmphasis" style={{ margin: "1.5rem 0.5rem" }}>
                                    {"R$ " + GeneralUtilities.formatAmount(this.state.totalInvested)}
                                </div>
                            </div>
                        </Paper>

                        <Paper id={"total_invest"} elevation="0"
                            style={this.style.smallCardStyle}>
                            <div style={{ textAlign: "left" }}>
                                <div style={{ margin: "0.5rem" }}>
                                    <BarChartIcon style={{ fill: ColorPicker.accent, width: "1.5rem" }} />
                                </div>
                                <div className="subtitle1 highEmphasis" style={{ margin: "0.5rem" }}>
                                    {localeObj.ci_profitability}
                                </div>
                                {/*<div className="body2 mediumEmphasis" style={{margin:"0 0.5rem"}}>
                                {GeneralUtilities.formattedString(localeObj.ci_until, [this.state.toDate])}
                                </div>*/}
                                <div style={{ margin: "1.5rem 0.5rem" }}>
                                    <span>
                                        {this.state.income < 0 ?
                                            <ArrowDownwardIcon style={{ fill: ColorPicker.amountTxnRed, width: "1.25rem", height: "1.25rem" }} /> :
                                            <ArrowUpwardIcon style={{ fill: ColorPicker.transactionGreen, width: "1.25rem", height: "1.25rem" }} />
                                        }
                                    </span>
                                    <span className="incomeStyle subtitle4 highEmphasis">{"R$ " + GeneralUtilities.formatAmount(this.state.income)}</span>
                                </div>

                            </div>
                        </Paper>
                    </FlexView>
                    <div style={InputThemes.bottomButtonStyle}>
                        <div className="body2 mediumEmphasis" style={{ textAlign: "center", margin: "1rem 2rem" }}>
                            {localeObj.ci_caption}
                        </div>
                        <PrimaryButtonComponent btn_text={localeObj.ci_invest_more} onCheck={this.investMore} />
                        <SecondaryButtonComponent btn_text={localeObj.ci_redeem} onCheck={this.redeemMoney} />
                        <div style={{ marginTop: "1.5em" }} className="body2 highEmphasis" onClick={() => this.help()}>
                            {localeObj.help}
                        </div>
                    </div>
                </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "redeem" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "redeem" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "redeem" && <RedeemConfirmationComp errorJson={this.state.creditErrorJson} onCancel={this.goToInvestmentHomePage}
                            onClick={this.redeemMoneyButtonClick} caption="allow" btnText={localeObj.redeem_button} componentName={PageNameJSON['redeem']} />}
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "redeem_amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "redeem_amount" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "redeem_amount" && <RedeemAmountComp onBackHome={this.onBack}
                            investedTotal={this.state.grossInvested} investedAvailable={this.state.amountAvailableToRedeem}
                            onPrimary={this.redeemInvestment} onSecondary={this.goToInvestmentHomePage} seeDetails={this.openBottomSheet} componentName={PageNameJSON['redeem_amount']} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "redeem_details" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "redeem_details" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "redeem_details" && <RedeemDetailsComp next={this.inputPinScreen} details={this.state.details}
                            componentName={PageNameJSON['redeem_details']} />}
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_pin_input" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_pin_input" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_pin_input" && <InputPinPage confirm={this.faceMatchScreen} history={this.props.history} componentName={PageNameJSON['credit_pin_input']} />}
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_facematch" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_facematch" && !this.state.processing ? 'block' : 'none') }}>
                        <ImageInformationComponent header={localeObj.faceMatch_val} icon={face}
                            appBar={false} description={localeObj.faceMatch_desc} btnText={localeObj.faceMatch_btn} next={this.doFaceMatch}
                            action={localeObj.help} onAction={this.help} type={PageNameJSON['credit_facematch']} />
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "redeem_facematch_success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "redeem_facematch_success" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "redeem_facematch_success" && <CreditCardSuccess header={localeObj.redeem_facematch_success_header}
                            description={localeObj.redeem_facematch_success_desc} subtext={localeObj.redeem_facematch_success_desc2} btnText={localeObj.redeem_facematch_success_btn} next={this.getCreditInvestmentHomePageDetails} componentName={PageNameJSON['redeem_facematch_success']} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_invest" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_invest" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_invest" && <CreditCardInvestmentInfo next={this.setTransactionInfo} onBackHome={this.onBack} creditInvestmentInfo={this.state.creditInvestmentdetails}
                            hideProgressDialog={this.hideProgressDialog} componentName={PageNameJSON['credit_invest']} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_invest_amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_invest_amount" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_invest_amount" && <CreditInvestmentAmountComp next={this.setTransactionInfo} onBackHome={this.onBack} investmentAmount={this.state.investmentAmount}
                            minAmount={this.state.creditInvestmentdetails.minInvestment} maxAmount={this.state.creditInvestmentdetails.maxInvestment} balance={this.state.balance}
                            pixAmountPage={this.pixAmountPage} setInvestMentAmount={this.setInvestMentAmount} componentName={PageNameJSON['credit_invest_amount']} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_pix_amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_pix_amount" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_pix_amount" && <PixAmountComp next={this.setTransactionInfo} onBackHome={this.onBack}
                            minAmount={this.state.creditInvestmentdetails.minInvestment} maxAmount={this.state.creditInvestmentdetails.maxInvestment} sendPixToMyAccount={this.sendPixToMyAccount}
                        />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "receive_pix" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "receive_pix" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "receive_pix" && <PixReceiveComponents next={this.setTransactionInfo} onBack={this.onBack}
                            location={this.state.location} onContinue={this.onPixReceiveContinue} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "register_key" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "register_key" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "register_key" && <RegisterNewKeyComponent onBack={this.onBack} from="creditCard" />}
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "credit_contract" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "credit_contract" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "credit_contract" && <CreditContract moveToContract={this.setTransactionInfo} terms={this.state.toc} componentName={PageNameJSON['credit_contract']} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "investMore_facematch_success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "investMore_facematch_success" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "investMore_facematch_success" && <CreditCardSuccess header={localeObj.credit_success_title}
                            description={localeObj.credit_invest_more_success_desc} subtext={localeObj.credit_invest_more_success_desc2} btnText={localeObj.ci_invest_more}
                            secBtnText={localeObj.back_home} close={this.getCreditInvestmentHomePageDetails} next={this.investMore} componentName={PageNameJSON['investMore_facematch_success']} />}
                    </div>
                </CSSTransition>

                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={currentState === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {currentState === "error" && <PixErrorComponent errorJson={this.state.creditErrorJson} onClick={this.onBack} componentName={PageNameJSON['error']} />}
                    </div>
                </CSSTransition>

                {this.state.cameraAlert &&
                    <AlertDialog title={localeObj.allow_camera_title} description={localeObj.allow_camera}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeCameraAlertDialog} />
                }
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing &&
                        <div>
                            <CustomizedProgressBars />
                        </div>
                    }
                </div>

                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.open}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {this.state.header}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {this.state.description}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={this.state.btnText} onCheck={this.closeBottomSheet} />
                        </div>
                    </Drawer>
                </div>

                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.bottom}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.no_key_title}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.no_key_text}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.register_new_key} onCheck={this.registerKey} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.handleClose} />
                        </div>
                    </Drawer>
                </div>

                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.creditInfoDrawer}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.credit_card_investment_info_header}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {GeneralUtilities.formattedString(localeObj.credit_card_investment_info_description, [GeneralUtilities.formatAmount(this.state.amountAvailableToRedeem)])}
                                </div>
                            </FlexView>
                        </div>
                        <div>
                            <FlexView column style={{ marginLeft: "2rem", marginRight: "2rem", marginTop: "1rem" }}>
                                <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                                    <span className="creditCardTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.credit_card_investment_info_total_invested + " & " + localeObj.credit_card_investment_info_gross_invested}</span>
                                    <span className="creditCardTableRightContent tableRightStyle highEmphasis" >{"R$ " + this.state.grossInvestedJson.formatted + "," + this.state.grossInvestedJson.decimal}</span>
                                </div>
                                {/* <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                                    <span className="creditCardTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.credit_card_investment_info_gross_invested}</span>
                                    <span className="creditCardTableRightContent tableRightStyle highEmphasis" >{"R$ " + GeneralUtilities.formatAmount(this.state.income)}</span>
                                </div> */}
                                <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                                    <span className="creditCardTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.credit_card_investment_credit_usage}</span>
                                    <span className="creditCardTableRightContent tableRightStyle highEmphasis" >{"-R$ " + this.state.creditUsage}</span>
                                </div>
                                <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                                    <span className="creditCardTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.credit_card_investment_info_IOF_taxes}</span>
                                    <span className="creditCardTableRightContent tableRightStyle highEmphasis" >{"-R$ " + this.state.taxes}</span>
                                </div>
                            </FlexView>
                            <FlexView column style={{ margin: "0 2rem 2rem" }}>
                                <Divider style={{ borderColor: ColorPicker.lighterAccent, margin: "1rem 0" }} />
                                <div style={{ justifyContent: "space-between" }}>
                                    <span className="creditCardTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.credit_card_investment_info_redeem}</span>
                                    <span className="creditCardTableRightContent tableRightStyle highEmphasis" >{"R$ " + GeneralUtilities.formatAmount(this.state.amountAvailableToRedeem)}</span>
                                </div>
                            </FlexView>
                        </div >
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.credit_card_investment_info_close} onCheck={this.closeCreditInfoDialog} />
                        </div>
                    </Drawer>
                </div>

                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.LONG_SNACK_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

CreditCardInvestmentComp.propTypes = {
    history: PropTypes.object.isRequired,
    classes: PropTypes.object,
    onBack: PropTypes.func.isRequired,
    additionalInfo: PropTypes.string,
    creditUsage: PropTypes.string
};

export default withStyles(styles)(CreditCardInvestmentComp);