import React, { createRef } from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import Log from "../../Services/Log";
import ArbiErrorResponseHandler from "../../Services/ArbiErrorResponsehandler";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import apiService from "../../Services/apiService";

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from "@material-ui/core/styles";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ArbiApiMetrics from "../../Services/ArbiApiMetrics";
import constantObjects from "../../Services/Constants";
import ArbiApiService from "../../Services/ArbiApiService";

const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

export default class SetPinComponent extends React.Component {
    constructor(props) {
        super(props);
        this.codeOne = createRef();
        this.codeTwo = createRef();
        this.codeThree = createRef();
        this.codeFour = createRef();
        this.refArray = [this.codeOne,
        this.codeTwo,
        this.codeThree,
        this.codeFour]
        this.state = {
            otp: [undefined, undefined, undefined, undefined],
            snackBarOpen: false,
            emailOTP: ""
        }

        this.componentName = PageNames.setPin;
        this.userDetails = {};
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.onBack();
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    async getProductKey() {
        return new Promise((resolve, reject) => {
            arbiApiService.getProductKey().then(response => {
                if (response.success) {
                    let processedDeatils = ArbiResponseHandler.processGetProductKey(response.result);
                    if (processedDeatils.success) {
                        resolve(processedDeatils.productkey);
                        Log.sDebug("Product ID fetched successfully")
                    } else {
                        Log.sDebug("Error fetching product id");
                        reject("none");
                    }
                } else {
                    let errorMessage = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                    Log.sDebug("Error fetching product id" + errorMessage, this.componentName, constantObjects.LOG_PROD);
                    reject("none");
                }
            });
        }).catch(err => {
            Log.debug("Promise Unfulfilled: ", err);
        });
    }



    async accountCreation(value) {
        this.showProgressDialog();
        let createAccountJSON = {
            pin: value.join(""),
            productId: ArbiResponseHandler.productId
        }

        await Promise.all([await this.getProductKey()]).then(values => {
            Log.debug("Promise to get product key resolved");
            createAccountJSON.productId = values[0];
        }).catch(err => {
            Log.debug("Using Hardcoded key as promise was unresolved: ", err);
        });
        arbiApiService.createAccount(createAccountJSON, this.componentName).
            then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processCreateAccountResponse(response);
                    if (processorResponse.success) {
                        arbiApiService.getAllClientData(this.componentName).then(async response => {
                            //this.hideProgressDialog();
                            if (response.success) {
                                Log.sDebug("User Details Fetched", "MyAccountPage");
                                let processorResponse = ArbiResponseHandler.processGetAllClientDataResponse(response.result, "profile");
                                if (processorResponse.success) {
                                    Log.sDebug("User Details Fetched: ");
                                    let profileData = await this.getInformationOfUser(processorResponse.data);
                                    this.userDetails = profileData; //payload
                                    Log.sDebug("fetchUserPersonalDetails" + JSON.stringify(this.userDetails));
                                    return apiService.userInformation(this.userDetails);
                                } else {
                                    Log.sDebug("fetchUserDetails, Error getting user deatils", constantObjects.LOG_PROD);
                                }
                            } else {
                                let errorMessage = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                                Log.sDebug("fetchUserDetails" + errorMessage, this.componentName, constantObjects.LOG_PROD);
                            }
                        })
                        androidApiCalls.setAccountCreatedFlag(true);
                        androidApiCalls.setAccountLoggedIn(true);
                        ArbiApiMetrics.sendArbiSuccessMetrics("MOTOPAY_CUSTOM_LOGIN_EVENT");
                        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                        this.props.history.replace({ pathname: "/activateCreditCard", transition: "right", pin: createAccountJSON.pin });
                        return;
                    } else {
                        this.hideProgressDialog();
                        this.openSnackBar(localeObj.tryAgainLater);
                    }
                } else if (response.result && response.result.message) {
                    this.hideProgressDialog();
                    this.openSnackBar(response.result.message);
                } else {
                    this.hideProgressDialog();
                    this.openSnackBar(localeObj.tryAgainLater);
                }
            }).catch(err => {
                this.hideProgressDialog();
                Log.sDebug("set pin error: " + err);
                this.openSnackBar(localeObj.tryAgainLater);
            });
    }

    getInformationOfUser = async function (data) {

        Log.sDebug("getProfileDetailsOfUser: " + JSON.stringify(data));
        let jsonObject = {};

        jsonObject["chaveDeCliente"] = ImportantDetails.clientKey;
        jsonObject["identificacaoFiscal"] = data.identificacaoFiscal;
        jsonObject["email"] = data.email;
        jsonObject["nome"] = data.nome;
        jsonObject["ddd"] = data.telefoneMovel.ddd;
        jsonObject["numero"] = data.telefoneMovel.numero;
        jsonObject["cep"] = data.endereco.cep;
        jsonObject["dataNascimento"] = data.dataNascimento;
        jsonObject["cidade"] = data.endereco.cidade;
        jsonObject["rendaMensal"] = data.rendaMensal;
        jsonObject["nacionalidade"] = data.nacionalidade;
        jsonObject["sexo"] = data.sexo;

        Log.sDebug("profilePayloadData: " + JSON.stringify(jsonObject));
        let profilePayload = await MetricServices.getSecurePayload(jsonObject);
        return profilePayload;
    }

    sendField = () => {
        this.refArray.forEach(ref => {
            ref.current.blur();
        });
        const value = this.refArray.map((reference) => reference.current.value);
        if (value.join("").length < 4) {
            this.openSnackBar(localeObj.enter_complete_pin);
        } else {
            // this.accountCreation(value);
            if (this.props.location.fromComponent === "EmailVerificationComponent") {
                this.verifyEmailOTP(value);
            }
        }
    }

    verifyEmailOTP = (value) => {
        this.showProgressDialog();
        const pin = value.join("");
        let pinObj = {}
        pinObj['token'] = this.props.location.emailOTP;
        pinObj['newPin'] = pin;
        ArbiApiService.forgotAccountPin(pinObj, "SetPinComponent").then(response => {
            this.hideProgressDialog();
            if (response.success) {
                androidApiCalls.setAccountCreatedFlag(true);
                androidApiCalls.setAccountLoggedIn(true);
                ArbiApiMetrics.sendArbiSuccessMetrics("MOTOPAY_CUSTOM_LOGIN_EVENT");
                MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                this.props.history.replace({ pathname: "/activateCreditCard", transition: "right", pin: pin });
            } else {
                this.openSnackBar(response.result.message);
                return;
            }
        })
    }

    onOtpChange = (index, e) => {
        const value = e.target.value;
        if (isNaN(Number(value)) && value !== "") {
            return
        }

        if (value !== "") {
            if (index < this.refArray.length - 1) {
                this.refArray[index + 1].current.focus();
            } else if (index === this.refArray.length - 1) {
                this.refArray.forEach(ref => {
                    ref.current.blur();
                });
            }
        }
    }

    onKeyDown = (index, e) => {
        if (e.keyCode === 189 || e.keyCode === 190) {
            e.returnValue = false;
            if (e.preventDefault) e.preventDefault();
        }
        if (e.keyCode === 8) {
            if (index > 0 && this.refArray[index].current.value.length === 0) {
                this.refArray[index - 1].current.focus();
            }
        }
    }

    maxLengthCheck = (object) => {
        if (object.target.value.length > object.target.maxLength) {
            object.target.value = object.target.value.slice(0, object.target.maxLength)
        }
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.cancel);
            this.props.history.push({ pathname: "/EmailVerification", transition: "right" });
        }
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
        return (
            <div style={{ overflowX: "hidden" }}>
                <ButtonAppBar header={localeObj.transcation_pin} onBack={this.onBack} action="none" />
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.four_digit_pin_header}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                {localeObj.pin_description}
                            </div>
                        </FlexView>
                    </div>
                    <div id="otpBox" style={{ width: "100%", alignSelf: "center", marginTop: "2.5rem", justifySelf: "center", marginLeft: "auto", marginRight: "auto" }}>
                        <form id="otpForm" style={{ display: "flex", justifyContent: "flex-start", margin: "1.5rem", flexDirection: 'row', flexWrap: "wrap" }}>
                            {this.refArray.map((compInputRef, index) => (
                                <input autoComplete='off'
                                    className="otp"
                                    ref={compInputRef}
                                    style={{
                                        width: "2.25rem", height: "2.25rem", padding: "0.5rem", textAlign: "center",
                                        borderRadius: "1rem", border: "none", fontSize: "2rem", backgroundColor: ColorPicker.newProgressBar,
                                        fontWeight: "400", marginRight: "0.5rem", color: ColorPicker.darkHighEmphasis
                                    }}
                                    onChange={((e) => this.onOtpChange(index, e))}
                                    type="password" pattern="[0-9]*" inputMode="numeric"
                                    maxLength="1"
                                    onInput={this.maxLengthCheck}
                                    autoFocus={index === 0 ? true : undefined}
                                    key={index}
                                    onKeyDown={((e) => this.onKeyDown(index, e))}
                                >
                                </input>
                            ))}
                        </form>
                    </div>
                    <div style={InputThemes.bottomButtonStyle}>
                        <PrimaryButtonComponent btn_text={localeObj.save} onCheck={this.sendField} />
                    </div>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        )
    }
}

SetPinComponent.propTypes = {
    history: PropTypes.object
}