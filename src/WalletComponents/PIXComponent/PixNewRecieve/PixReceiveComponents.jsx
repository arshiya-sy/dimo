import React from "react";
import "../../../styles/main.css";
import "../../../App.css";
import { CSSTransition } from 'react-transition-group';
import InputThemes from "../../../Themes/inputThemes";

import PageNames from "../../../Services/PageNames";
import PageState from '../../../Services/PageState';
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import PropTypes from "prop-types";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PixGenerateQrCode from "../PixNewRecieve/PixGeneratedQrCode";
import AmountComponent from "../../CommonUxComponents/AmountComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';

import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import ReviewTemplate from "../../CommonUxComponents/ReviewTemplate";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import Log from "../../../Services/Log";
import constantObjects from "../../../Services/Constants";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import PixGenerateQrCodeCreditCard from "./PixGenerateQrCodeCreditCard";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";

const theme1 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.pixRecieve;
var localeObj = {};

export default class PixReceiveComponents extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pixstate: "amount",
            amountEdited: false,
            description: "",
            direction: "",
            amount: "",
            selectedKey: "",
            decimal: "",
            key: {},
            identification: "",
            allKeys: [],
            userData: {},
            code: {},
            header: "PIX",
            pinExpiredSnackBarOpen: false,
            pixReceiveCreditCard: false
        };

        this.onGetAmount = this.onGetAmount.bind(this);
        this.getKey = this.getKey.bind(this);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount = () => {
        if (this.props.location.additionalInfo !== "" && this.props.location.additionalInfo !== undefined) {
            let amount = this.props.location.additionalInfo["amount"];
            let decimal = this.props.location.additionalInfo["decimal"];
            let pixReceiveCreditCard = this.props.location.additionalInfo["entryPoint"] === "pixReceiveCreditCard";
            Log.sDebug("pixReceiveCreditCard1:" + pixReceiveCreditCard);
            this.setState({
                pixReceiveCreditCard: pixReceiveCreditCard
            })
            if (amount !== "" && amount !== undefined) {
                if (decimal === "" || decimal === undefined) {
                    decimal = "00"
                }
                const jsonObject = {
                    amount: amount,
                    decimal: decimal
                }
                this.onGetAmount(jsonObject)
            }
        }
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.onBack();
        }
    }

    registerKey = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.close);
        //Log.sDebug("User has no pix keys, user clicked to register new key", "PixReceiveComponent");
        this.props.history.replace("/registerNewKeyComponent");
    }

    handleClosePix = () => {
        this.setState({ pixKeysBottom: false })
        this.onBack();
    }

    retryGetAllPixKeys = async () => {
        const pixResponse = await arbiApiService.getAllPixKeys(PageNameJSON.amount);
        if(pixResponse && pixResponse.success){
            ImportantDetails.pixKeysResponse = pixResponse;
            return ArbiResponseHandler.processGetAllKeysResponse(pixResponse.result);
        } else {
            return null;
        }
    };

    handleNoPixKeys = async () => {
        const createResponse = await arbiApiService.createEvpPixKey(PageNameJSON.amount);
        if (createResponse && createResponse.success) {
            ImportantDetails.pixKeysResponse = {};
            return await this.retryGetAllPixKeys();
        } else {
            this.hideProgressDialog();
            return null;
        }
    };

    onGetAmount = async (jsonObject) => {
        Log.sDebug("Amount for QR code generation received", "PixReceiveComponent");
        Log.sDebug("Fetching all pix keys", "PixReceiveComponent");
        this.showProgressDialog();
        let response = await GeneralUtilities.fetchPixKeys();
        if (response && response.success) {
            let responseJson = ArbiResponseHandler.processGetAllKeysResponse(response.result);
            if (!responseJson) {
                this.hideProgressDialog();
                let jsonObj = {};
                jsonObj["error"] = true;
                jsonObj["reason"] = "communication_issue"
                this.setTransactionInfo(jsonObj);
                return;
            }
            if(this.props && this.props.location &&
                this.props.location.from &&
                this.props.location.from === "landingPage" &&
                responseJson.keys.length === 0) {
                    responseJson = await this.handleNoPixKeys();
                    if(!responseJson){
                        let jsonObj = {};
                        jsonObj["error"] = true;
                        jsonObj["reason"] = "no_keys";
                        this.setTransactionInfo(jsonObj);
                        return;
                    }
            } else {
                this.hideProgressDialog();
            }
            this.hideProgressDialog();
            if (!(Array.isArray(responseJson.keys) && responseJson.keys.length)) {
                let jsonObj = {};
                jsonObj["error"] = true;
                jsonObj["reason"] = "no_keys";
                this.setTransactionInfo(jsonObj);
                return;
            }
            const pixKeys = responseJson.keys;
            const userInfo = responseJson.userInfo;
            Log.sDebug("User has " + pixKeys.length + " pix keys", "PixReceiveComponent");
            if (pixKeys.length === 0) {
                this.setState({
                    pixKeysBottom: true
                });
            } else {
                this.setState({
                    allKeys: pixKeys,
                    key: pixKeys[0],
                    userData: userInfo,
                    amount: jsonObject["amount"],
                    decimal: jsonObject["decimal"],
                    pixstate: "pix_review",
                    direction: "left"
                });
            }
        } else {
            this.hideProgressDialog();
            let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
            this.setTransactionInfo(errorJson);
        }
    }

    closeSnackBar = () => {
        this.setState({ pinExpiredSnackBarOpen: false })
    }


    getKey = (info) => {
        //Log.sDebug("Key selected for QR code generation", "PixReceiveComponent");
        let jsonObject = {};
        const pixKey = info.selectedKey.key;
        jsonObject["pixKey"] = pixKey;
        if (this.state.amount === "not_defined" && this.state.decimal === "not_defined") {
            jsonObject["Amount"] = parseFloat("0.0");
        } else {
            jsonObject["Amount"] = parseFloat(this.state.amount + "." + this.state.decimal);
        }
        jsonObject["description"] = info.description ? info.description : "";
        this.showProgressDialog();
        arbiApiService.generateStaticQrCodeForPixKey(jsonObject, PageNameJSON.generate_qr_code).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResult = ArbiResponseHandler.processGenerateStaticQrCodeResponse(response.result, pixKey);
                //Log.sDebug("generateStaticQrCodeForPixKey: " + processedResult);
                if (processedResult.success) {
                    if (this.state.pixReceiveCreditCard) {
                        this.setState({
                            code: "data:image/png;base64, " + processedResult.qrCode.data,
                            key: info.selectedKey,
                            description: info.description,
                            pixstate: "generate_qr_code_credit_card",
                            direction: "left",
                            copyCode: processedResult.qrCode.copyCode
                        });

                    } else {
                        this.setState({
                            code: "data:image/png;base64, " + processedResult.qrCode.data,
                            key: info.selectedKey,
                            description: info.description,
                            pixstate: "generate_qr_code",
                            direction: "left",
                            copyCode: processedResult.qrCode.copyCode
                        });
                    }


                } else {
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    setTransactionInfo = (transactionInfo) => {
        if (transactionInfo.error) {
            //Log.sDebug("Error has occured with code " + transactionInfo.errorCode, "PixReceiveComponent", constantObjects.LOG_PROD);
            androidApiCalls.hideProgressDialog();
            let jsonObj = {}
            jsonObj["errorCode"] = transactionInfo.errorCode;
            jsonObj["title"] = localeObj.pix;
            jsonObj["header"] = localeObj.pix_failed;
            switch (transactionInfo.reason) {
                case "no_keys":
                    jsonObj["description"] = localeObj.pix_keys_not_found
                    break
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
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "arbi_error":
                    jsonObj["description"] = transactionInfo.descriptor;
                    break;
                default:
                    break;
            }
            this.setState({
                pixstate: "error",
                pixErrorJson: jsonObj
            })
        } else {
            if (this.state.pixstate === "pix_review") {
                this.getKey(transactionInfo);
            }
        }
    }

    backHome = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.back);
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    onBack = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.back);
        //Log.sDebug("Back Button Pressed", "PixReceiveComponent");
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            if (this.state.pixReceiveCreditCard) {
                this.props.onBack();

            } else if (this.state.pixstate === "pix_review") {
                this.setState({
                    pixstate: "amount",
                    direction: "right"
                })
            } else if (this.state.pixstate === "error") {
                GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
            } else {
                if (GeneralUtilities.subDeepLinkCheck(this.props.location.subDeepLink)) {
                    return;
                }
                if (this.props.location && this.props.location.from
                    && this.props.location.from === "depositPage") {
                    this.props.history.replace({ pathname: "/depositLandingComponent", transition: "right" });
                } else if (this.props.location && this.props.location.from
                    && this.props.location.from === "landingPage") {
                    this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
                } else {
                    this.props.history.replace({ pathname: "/pixLandingComponent", transition: "right" });
                }
            }
        }
    }

    editAmount = (json) => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.pixstate], PageState.edit);
        //Log.sDebug("User Pressed edit amount", "PixReceiveComponent");
        this.setState({
            pixstate: "amount",
            key: json["key"],
            description: json["desc"],
            direction: "right"
        })
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

    render() {
        const userDetails = {
            receiver: {
                [localeObj.name]: this.state.userData.name,
                [localeObj.cpf]: this.state.userData.cpf,
                [localeObj.Institution]: localeObj.bank_name,
            },
            "keys": this.state.key,
            "amount": this.state.amount,
            "decimal": this.state.decimal,
            "transferType": localeObj.pix,
            "description": this.state.description
        }
        const pixState = this.state.pixstate;

        return (
            <div style={{ overflowX: "hidden" }}>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "amount" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "amount" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix} onBack={this.onBack} action="none" />

                        {pixState === "amount" && <AmountComponent setTransactionInfo={this.onGetAmount} requiredInfo={userDetails} feature={"pix_recieve"} btnText={localeObj.pix_dont_disclose}
                            componentName={PageNameJSON.amount} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "pix_review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "pix_review" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar style={{ position: "absolute" }} header={this.state.pixReceiveCreditCard ? localeObj.new_dimo_credit_investment : localeObj.review_payment} onBack={this.onBack} action="none" />
                        {pixState === "pix_review" && <ReviewTemplate requiredInfo={userDetails} setTransactionInfo={this.setTransactionInfo} back={this.editAmount}
                            header={localeObj.pix_receiving} detailHeader={localeObj.source} btnText={localeObj.pix_create_Qr_Code}
                            allKeys={this.state.allKeys} componentName={PageNameJSON.pix_review} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "generate_qr_code" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "generate_qr_code" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.pix_header} onCancel={this.onBack} action="cancel" inverse="true" data-html2canvas-ignore="true"/>
                        {pixState === "generate_qr_code" && <PixGenerateQrCode requiredInfo={userDetails} QrCode={this.state.code} copyCode={this.state.copyCode} close={this.backHome} componentName={PageNameJSON.pix_review} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pixState === "generate_qr_code_credit_card" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pixState === "generate_qr_code_credit_card" && !this.state.processing ? 'block' : 'none') }}>
                        <ButtonAppBar style={{ position: "absolute" }} header={localeObj.new_dimo_credit_investment} onBack={this.onBack} action="none" />
                        {pixState === "generate_qr_code_credit_card" && <PixGenerateQrCodeCreditCard requiredInfo={userDetails} QrCode={this.state.code} copyCode={this.state.copyCode}
                            onBack={this.onBack} onContinue={this.props.onContinue} componentName={PageNameJSON.pix_review} />}
                    </div>
                </CSSTransition>
                <div style={{ display: (pixState === "error" && !this.state.processing ? 'block' : 'none') }}>
                    {pixState === "error" && <PixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.backHome} componentName={PageNameJSON.error} />}
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    <ButtonAppBar header={this.state.pixReceiveCreditCard ? localeObj.new_dimo_credit_investment : pixState === "pix_review" ? localeObj.review_payment : localeObj.pix} onBack={this.onBack} action="none" />
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.pinExpiredSnackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div style={{ height: "100%", overflowX: "hidden" }}>
                    <SwipeableDrawer
                        anchor="bottom"
                        open={this.state.pixKeysBottom}
                        disableDiscovery={true}
                        disableSwipeToOpen={true}
                        style={{ margin: "1.5rem" }}>
                        <div style={{textAlign: "center"}}
                            onKeyDown={this.handleClose}>
                            <div style={{textAlign: "center"}}>
                                <span className="headline6 highEmphasis">
                                    {localeObj.no_key_title}
                                </span>
                            </div>
                            <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                <span className="body2 mediumEmphasis">
                                    {localeObj.no_key_text}
                                </span>
                            </div>
                            <div style={{ width: "100%", marginBottom: "1rem",textAlign: "center" }}>
                                <PrimaryButtonComponent btn_text={localeObj.register_new_key} onCheck={this.registerKey} />
                                <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.handleClosePix} />
                            </div>
                        </div>
                    </SwipeableDrawer>
                </div>
            </div>
        );
    }
}

PixReceiveComponents.propTypes = {
    location: PropTypes.object,
    classes: PropTypes.object,
    history: PropTypes.object,
    onContinue: PropTypes.func,
    onBack: PropTypes.func,
};