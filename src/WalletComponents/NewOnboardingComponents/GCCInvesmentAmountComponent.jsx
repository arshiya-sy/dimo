import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import ArbiErrorResponseHandler from '../../Services/ArbiErrorResponsehandler';
import MetricsService from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import walletJwtService from "../../Services/walletJwtService";
import TextField from "@material-ui/core/TextField";
import { InputAdornment } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import "../../styles/main.css";
import "../../styles/lazyLoad.css";

import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import InputThemes from "../../Themes/inputThemes";
import constantObjects from "../../Services/Constants";
import PageNames from "../../Services/PageNames";
import Log from "../../Services/Log";

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.AmountTheme;
const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;

var localeObj = {};

class GCCInvestmentAmountComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            amount: this.props.investmentAmount || "",
            displayValue: this.props.investmentAmount || "",
            balance: this.props.balance || "0",
            message: "",
            minMessage: "",
            snackBarOpen: false,
            processing: false,
            minAmount: 50,
            maxAmount: 20000,
            minSet: false,
            prevComp: this.props.previousComponent || ""
        };

        this.componentName = PageNames.gccInvestmentAmountComponent;

        window.onBackPressed = () => {
            this.onBack();
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }

        MetricsService.onPageTransitionStart(this.componentName);
    }

    SendPixToMyAccount = () => {
        if (this.state.amount.toString().replace(/0/g, "").length === 0) {
            this.setState({
                snackBarOpen: true,
                message: localeObj.pix_enter_valid_amount,
                minSet: false
            });
            return;
        } else {
            let amount = this.state.amount;
            let decimal = "00";
            let intAmount = parseInt(amount);
            if (intAmount < this.state.minAmount) {
                this.setState({
                    minSet: true,
                    minMessage: GeneralUtilities.formattedString(localeObj.credit_invest_min_val, [GeneralUtilities.getFormattedAmount(this.state.minAmount)])
                })
                return;
            }
            else if (intAmount > this.state.maxAmount) {
                this.setState({
                    minSet: true,
                    minMessage: GeneralUtilities.formattedString(localeObj.credit_invest_max_val, [GeneralUtilities.getFormattedAmount(this.state.maxAmount)])
                })
                return;
            } else {
                this.showProgressDialog();
                ArbiApiService.getAllPixKeys(this.componentName).then(pixResponse => {
                    if (pixResponse.success) {
                        const responseJson = ArbiResponseHandler.processGetAllKeysResponse(pixResponse.result);
                        const pixKeys = responseJson.keys;
                        const userInfo = responseJson.userInfo;
                        if (pixKeys.length === 0) {
                            // User has no pix keys need to handle this use case.
                            ArbiApiService.createEvpPixKey(PageNames.gccCreditCardComponent.create_evp_key).then(response => {
                                if (response.success) {
                                    let processedResponse = ArbiResponseHandler.processCreateEvpPixKeyResponse(response.result);
                                    if (processedResponse.success) {
                                        //this.handleArbiResponse("success", localeObj.key_registered_sucess, localeObj.type_key_registered_sucess_subtext);
                                        let jsObject = [];
                                        jsObject["amount"] = this.state.amount;
                                        jsObject["decimal"] = decimal;
                                        this.onGetAmount(jsObject);
                                    } else {
                                        this.hideProgressDialog();
                                        let details = localeObj.retry_later;
                                        if (processedResponse.details !== "") {
                                            details = processedResponse.details;
                                        }
                                        this.handleArbiResponse("failed", localeObj.key_registered_failure, details);
                                    }
                                } else {
                                    this.hideProgressDialog();
                                    this.handleArbiResponse("failed", localeObj.key_registered_failure, localeObj.tryAgainLater);
                                }
                            });
                        } else {
                            this.hideProgressDialog();
                            this.setState({
                                allKeys: pixKeys,
                                key: pixKeys[0],
                                userData: userInfo,
                                pixstate: "pix_review",
                                direction: "left"
                            });
                            let jsonObj = {};
                            jsonObj["selectedKey"] = pixKeys[0];
                            this.getKey(jsonObj);
                        }
                    } else {
                        this.hideProgressDialog();
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(pixResponse);
                        this.setTransactionInfo(errorJson);
                    }
                });

            }
        }
    }

    handleArbiResponse = (status, title, text) => {
        if (status === "failed") {
            let jsonObj = {}
            jsonObj["title"] = localeObj.pix;
            jsonObj["header"] = title;
            jsonObj["description"] = text;
            this.setState({
                snackBarOpen: true,
                message: title + " " + text
            });
        } else {

            // MetricsService.onPageTransitionStop(this.componentName, PageState.close);
            // this.setState({
            //     pixTransactionState: "success",
            //     description: text
            // });
        }
    }

    onGetAmount = (jsonObject) => {
        //Log.sDebug("Amount for QR code generation received", "PixReceiveComponent");
        //Log.sDebug("Fetching all pix keys", "PixReceiveComponent");
        let response = {};
        //this.showProgressDialog();
        ArbiApiService.getAllPixKeys(this.componentName).then(pixResponse => {
            this.hideProgressDialog();
            response = pixResponse;
            if (response.success) {
                const responseJson = ArbiResponseHandler.processGetAllKeysResponse(response.result);
                const pixKeys = responseJson.keys;
                const userInfo = responseJson.userInfo;
                if (pixKeys.length === 0) {
                    // User has no pix keys need to handle this use case.
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.first_access_gcc_no_keys,
                        minSet: false
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
                    let jsonObj = {};
                    jsonObj["selectedKey"] = pixKeys[0];
                    this.getKey(jsonObj);
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
        });


    }

    setTransactionInfo = (transactionInfo) => {
        if (transactionInfo && transactionInfo.error) {
            this.hideProgressDialog();
            let jsonObj = {}
            jsonObj["errorCode"] = transactionInfo.errorCode;
            jsonObj["title"] = localeObj.pix;
            jsonObj["header"] = localeObj.pix_failed;
            switch (transactionInfo.reason) {
                case "no_keys":
                    jsonObj["description"] = localeObj.pix_keys_not_found;
                    break;
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
                default: break;
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
        jsonObject["description"] = "";
        let userDetails = {
            receiver: {
                [localeObj.pix_key]: info.selectedKey.key,
                [localeObj.name]: this.state.userData.name,
                [localeObj.cpf]: this.state.userData.cpf,
                [localeObj.Institution]: localeObj.bank_name,
            },
            "keys": this.state.allKeys,
            "amount": this.state.amount,
            "decimal": this.state.decimal,
            "transferType": localeObj.pix,
            "description": ""
        }
        this.showProgressDialog();
        ArbiApiService.generateStaticQrCodeForPixKey(jsonObject, this.componentName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResult = ArbiResponseHandler.processGenerateStaticQrCodeResponse(response.result, pixKey);
                if (processedResult.success) {
                    let event = {
                        eventType: constantObjects.firstAccess + "PIX KEY SUCCESSFUL",
                        page_name: this.componentName,
                    };
                    MetricsService.reportActionMetrics(event, new Date().getTime());
                    MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                    this.props.history.push({
                        pathname: "/gccPixRecieveQRCode",
                        "fromComponent": "GCCInvestmentAmountComponent",
                        "QrCode": "data:image/png;base64, " + processedResult.qrCode.data,
                        key: info.selectedKey,
                        description: info.description,
                        direction: "left",
                        copyCode: processedResult.qrCode.copyCode,
                        componentName: "GCCInvestmentAmountComponent",
                        requiredInfo: userDetails
                    });
                } else {
                    this.setState({
                        SnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    handleChange = (event) => {
        if (event.target.value.length !== 0) {
            const re = /^[0-9]+$/;
            let value = event.target.value.replace(/[^0-9]/g, "");
            if (value.length === 0) {
                this.resetField();
            } else if (re.test(value)) {
                let displaySalary = GeneralUtilities.formatBalance(value);
                this.setState({
                    displayValue: displaySalary,
                    amount: displaySalary.replace(/[^0-9]/g, '')
                })
            }
        } else {
            this.resetField();
        }
    }

    resetField = () => {
        this.setState({
            displayValue: "",
            amount: ""
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false });
    }

    fetchTokenForCAF = async (cpf) => {
        await Promise.all([await walletJwtService.CAFAuthentication(cpf)]).then(async values => {
            if (GeneralUtilities.emptyValueCheck(values[0])) {
                //Log.sDebug("Retrying for token as value is empty");
                await walletJwtService.CAFAuthentication(cpf)
            }
        }).catch(async err => {
            Log.sDebug("Retrying for token as due to following error " + err);
            await walletJwtService.CAFAuthentication(cpf)
        })
    }

    componentDidMount() {
        this.fetchTokenForCAF(ImportantDetails.cpf);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        window.removeEventListener("resize", this.checkIfInputIsActive);
    }

    checkIfInputIsActive = () => {
        if (window.innerHeight !== screenHeight) {
            this.setState({
                fieldOpen: true
            })
        } else {
            this.setState({
                fieldOpen: false
            })
        }
    }


    seeDetails = () => {
        this.props.onBackHome();
    }

    installment = () => {
        this.props.payInInstallments();
    }

    onBack = () => {
        MetricsService.onPageTransitionStop(this.componentName, PageState.back);
        this.props.history.replace({ pathname: "/gccHowItWorks", newOnboarding: true });
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle;
        return (
            <div style={{ overflow: "hidden" }}>
                {!this.state.processing && <div>
                    <ButtonAppBar header={localeObj.credit_card_welcome_benifits_banner_title} onBack={this.onBack} action="none" />
                    <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" }}>
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.first_access_gcc_amount_header}
                                </div>
                                <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                    {GeneralUtilities.formattedString(localeObj.first_access_gcc_amount_description, [GeneralUtilities.currencyFromDecimals(this.state.minAmount)])}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ marginTop: "3rem" }}>
                            <div>
                                <MuiThemeProvider theme={theme1}>
                                    <TextField label={localeObj.value} type="tel"
                                        onChange={this.handleChange}
                                        InputProps={{
                                            startAdornment: (this.state.displayValue === "") ? '' : <InputAdornment className="body2 highEmphasis" position="start"><div className="headline4 highEmphasis">R$</div></InputAdornment>,
                                            classes: { underline: classes.underline },
                                            className: this.state.field === "" ? classes.input : classes.finalInput
                                        }}
                                        autoComplete='off'
                                        value={this.state.displayValue}
                                        InputLabelProps={this.state.value === "" ?
                                            { className: classes.input } : { className: classes.finalStyle }}
                                    />
                                </MuiThemeProvider>
                            </div>
                        </div>
                        <div style={{...fieldOpen, textAlign: "center"}}>
                            <div className="body2 errorRed" style={{ display: this.state.minSet ? "block" : "none", margin: "1rem 1.5rem", textAlign: "center" }}>
                                {this.state.minMessage}
                            </div>
                            <div className="body2 highEmphasis" style={{ margin: "1rem 1.5rem", textAlign: "center" }}>
                                {localeObj.first_access_gcc_amount_btn_description}
                            </div>
                            <PrimaryButtonComponent btn_text={localeObj.first_access_gcc_amount_btn} onCheck={this.SendPixToMyAccount} />
                        </div>
                    </div>
                </div>}
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}
GCCInvestmentAmountComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    investmentAmount: PropTypes.string,
    balance: PropTypes.string,
    previousComponent: PropTypes.string,
    history: PropTypes.object,
    location: PropTypes.object,
    onBackHome: PropTypes.func,
    payInInstallments: PropTypes.func
};

export default withStyles(styles)(GCCInvestmentAmountComponent);
