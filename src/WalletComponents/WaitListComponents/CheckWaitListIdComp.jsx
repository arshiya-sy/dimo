import React from "react";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import PropTypes from "prop-types";

import { CSSTransition } from 'react-transition-group';
import InputThemes from "../../Themes/inputThemes";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import PageState from "../../Services/PageState";
import waitlist from "../../images/SpotIllustrations/Phone copy.png";

import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import constantObjects from "../../Services/Constants";
import DetailFormComponent from "../OnBoardingSupportComponents/DetailFormComponent";
import errorCodeList from "../../Services/ErrorCodeList";
import RegisterWaitListComp from "./RegisterWaitListComp";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import PageNames from "../../Services/PageNames";
import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";
import httpRequest from "../../Services/httpRequest";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import GeneralUtilities from "../../Services/GeneralUtilities";
import apiService from "../../Services/apiService";
import Log from "../../Services/Log";

const theme1 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.waitListComponent;
var localeObj = {};

class CheckWaitlistId extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cpf: "",
            creationState: props.location.creationState || "initial",
            snackBarOpen: false
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        if (this.props.history.location.additionalInfo !== "" && this.props.history.location.additionalInfo !== undefined) {
            let currentState = this.props.history.location.additionalInfo["creationState"];
            if (currentState !== "" && currentState !== undefined) {
                this.setState({
                    creationState: currentState
                })
            }
        }
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

    sendField = (cpf) => {
        this.showProgressDialog();
        this.setState({ cpf: cpf });
        arbiApiService.checkWaitListStatus(cpf).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processCheckWaitListStatus(response.result);
                    if (processorResponse.success) {
                        var payloadJson = Object.assign({}, {});
                        payloadJson.cpf = cpf;
                        payloadJson.posicaoFilaOnboard = processorResponse.waitlistId;
                        payloadJson.statusFilaOnboard = processorResponse.onboardingStatus;
                        payloadJson.chaveDeFilaOnboarding = ImportantDetails.waitListId;
                        payloadJson.numeroDiasRestantesFila = processorResponse.noOfDays;
                        this.sendWaitListInfo(payloadJson);
                        if (processorResponse.noOfDays) {
                            let valid = new Date(Date.now() + processorResponse.noOfDays * 24 * 60 * 60 * 1000);
                            let ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(valid);
                            let mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(valid);
                            let da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(valid);
                            this.setState({ validTill: `${da}-${mo}-${ye}` })
                        }
                        this.processWaitListStatus(processorResponse.onboardingStatus, "check_status");
                    } else {
                        this.openSnackBar(processorResponse.message);
                        return
                    }
                } else {
                    if (response.result === httpRequest.NO_RESPONSE || !response.status ||
                        (response.status >= 400 && response.status < 500)) {
                        this.constructError();
                    } else {
                        this.processWaitListErrors(response.result);
                    }
                }
            }).catch(() => {
                this.hideProgressDialog();
                this.constructError();
            });
    }

    registerToWaitList = (userObject) => {
        this.showProgressDialog();
        this.setState({ cpf: userObject.cpf });
        arbiApiService.registerToWaitList(userObject).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processRegisterToWaitList(response.result);
                    if (processorResponse.success) {
                        this.processWaitListStatus(processorResponse.onboardingStatus, "new_register");
                        var payloadJson = Object.assign({}, {});
                        payloadJson.cpf = userObject.cpf;
                        payloadJson.nome = userObject.name;
                        payloadJson.email = userObject.email;
                        payloadJson.phoneNumber = userObject.ddd + userObject.mobNum;
                        payloadJson.posicaoFilaOnboard = processorResponse.waitlistId;
                        payloadJson.statusFilaOnboard = processorResponse.onboardingStatus;
                        payloadJson.chaveDeFilaOnboarding = ImportantDetails.waitListId;
                        payloadJson.numeroDiasRestantesFila = processorResponse.noOfDays;
                        this.sendWaitListInfo(payloadJson);
                    } else {
                        this.openSnackBar(processorResponse.message);
                        return
                    }
                } else {
                    if (response.result === httpRequest.NO_RESPONSE || !response.status ||
                        (response.status >= 400 && response.status < 500)) {
                        this.constructError();
                    } else {
                        this.processWaitListErrors(response.result);
                    }
                }
            }).catch(() => {
                this.hideProgressDialog();
                this.constructError();
            });
    }

    sendWaitListInfo = (payloadJson) => {
        var finalPayload = Object.assign({}, {});
        finalPayload.wlUserData = payloadJson;
        finalPayload.deviceInfo = GeneralUtilities.createDeviceInfo();

        apiService.sendWaitListInfo(finalPayload)
            .then(response => {
                Log.sDebug(response);
            }).catch(err => {
                Log.sError(err);
            });
    }


    checkWaitListVacancy = () => {
        this.showProgressDialog();
        arbiApiService.isVacancyAvailable()
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processIsVacancyAvailable(response.result);
                    if (processorResponse.success) {
                        if (processorResponse.available) {
                            this.setState({
                                creationState: "expired_create_acc",
                                direction: "left",
                            })
                        } else {
                            this.setState({
                                creationState: "expired",
                                direction: "left"
                            })
                        }
                    } else {
                        this.openSnackBar(localeObj.verify_again);
                        return
                    }
                } else {
                    this.openSnackBar(response.result.message);
                }
            });
    }

    processWaitListStatus = (status, type) => {
        switch (status) {
            case "AGUARDANDO_VAGA":
                return this.setState({
                    creationState: "show_waitlist",
                    type: type,
                    direction: "left",
                })
            case "PODE_CADASTRAR":
                return this.setState({
                    creationState: "success",
                    direction: "left",
                })
            case "CADASTRADO":
            case "ONBOARD":
                return this.setState({
                    creationState: "acc_exists",
                    direction: "left",
                });
            case "EXPIRADO":
                this.checkWaitListVacancy();
                break;
                default:
        }
    }

    processWaitListErrors = (result) => {
        switch (result.code) {
            case errorCodeList.ACCOUNT_ALREADY_EXISTS:
                return this.setState({
                    creationState: "acc_exists",
                    direction: "left",
                });
            case errorCodeList.WAITLIST_ALREADY_EXISTS:
                this.openSnackBar(result.message);
                return this.setState({
                    creationState: "show_waitlist",
                    type: "check_status",
                    direction: "left",
                });
            case errorCodeList.VACANCY_EXISTS:
                this.openSnackBar(result.message);
                MetricServices.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.error);
                this.props.history.replace({ pathname: "/newSignUpPageComp", transition: "right" });
                break;
            case errorCodeList.WAITLIST_NOT_FOUND:
                this.openSnackBar(result.message);
                return this.setState({
                    creationState: "register",
                    direction: "left",
                });
            case errorCodeList.WAITLIST_APPROVED:
                this.openSnackBar(result.message);
                return this.setState({
                    creationState: "success",
                    direction: "left",
                });
            default:
        }
    }

    constructError = () => {
        let jsonObj = {};
        jsonObj["title"] = localeObj.waitlist;
        jsonObj["header"] = localeObj.waitlist_failed;
        jsonObj["description"] = localeObj.pix_communication_issue;
        this.setState({
            creationState: "error",
            direction: "left",
            errorJson: jsonObj
        })
    }

    checkStatus = () => {
        this.setState({
            creationState: "initial",
            direction: "left",
        })
    }

    onPrimary = () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.error);
        this.props.history.replace({ pathname: "/newLogin", state: { cpf: this.state.cpf } });
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.back);
            this.props.history.push({ pathname: "/", transition: "right" });
        }
    }

    next = () => {
        if (androidApiCalls.checkIfMpOnly()) {
            window.Android.closeWindow();
        } else {
            androidApiCalls.openHY();
        }
    }

    joinWaitList = () => {
        this.setState({
            creationState: "register",
            direction: "left",
        });
    }

    continue = () => {
        this.props.history.replace({ pathname: "/newSignUpPageComp", transition: "right" });
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
        const creation = this.state.creationState;
        return (
            <div style={{ overflowX: "hidden" }}>
                <ButtonAppBar header={localeObj.waitlist} onBack={this.onBack} action="none" />
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "initial" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "initial" && !this.state.processing) ? 'block' : 'none' }}>
                        {creation === "initial" && <DetailFormComponent header={localeObj.waitlist_cpf_header} field={localeObj.cpf}
                            recieveField={this.sendField} type="tel" value={this.state.cpf} componentName={PageNameJSON.initial} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "show_waitlist" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "show_waitlist" && !this.state.processing) ? 'block' : 'none' }}>
                        {creation === "show_waitlist" && <ImageInformationComponent header={localeObj.reg_success_header}
                            appBar={false} type={PageNameJSON.show_waitlist} next={this.next} bottomSheetDesc={false} icon={waitlist} btnText={localeObj.go_to_hy}
                            description={this.state.type === "check_status" ? localeObj.already_in_wl + localeObj.reg_success_desc : localeObj.reg_success_desc} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "expired" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "expired" && !this.state.processing) ? 'block' : 'none' }}>
                        {creation === "expired" && <ImageInformationComponent header={localeObj.reg_expired}
                            appBar={false} type={PageNameJSON.expired} next={this.joinWaitList} bottomSheetDesc={false} icon={waitlist}
                            description={localeObj.reg_expired_desc} btnText={localeObj.waitlist_join} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "expired_create_acc" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "expired_create_acc" && !this.state.processing) ? 'block' : 'none' }}>
                        {creation === "expired_create_acc" && <ImageInformationComponent header={localeObj.reg_expired}
                            appBar={false} type={PageNameJSON.expired} next={this.continue} bottomSheetDesc={false} icon={waitlist}
                            description={localeObj.reg_expired_acc_desc} btnText={localeObj.motopay_continue} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "acc_exists" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "acc_exists" && !this.state.processing) ? 'block' : 'none' }}>
                        {creation === "acc_exists" && <ImageInformationComponent header={localeObj.login_to_acc}
                            appBar={false} type={PageNameJSON.acc_exists} next={this.onPrimary} bottomSheetDesc={false} icon={waitlist}
                            description={localeObj.cpf_exists} btnText={localeObj.login} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "register" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "register" && !this.state.processing) ? 'block' : 'none' }}>
                        {creation === "register" && <RegisterWaitListComp checkStatus={this.checkStatus} recieveField={this.registerToWaitList} componentName={PageNameJSON.register} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "success" && !this.state.processing) ? 'block' : 'none' }}>
                        {creation === "success" && <ImageInformationComponent header={localeObj.waitlist_clear_header}
                            appBar={false} type={PageNameJSON.success} bottomSheetDesc={false} icon={waitlist} next={this.continue}
                            description={localeObj.waitlist_clear_desc} btnText={localeObj.motopay_continue}
                            subText={this.state.validTill ? localeObj.inv_valid + " " + this.state.validTill : ""} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.onBack} componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}
CheckWaitlistId.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
}
export default withStyles(styles)(CheckWaitlistId);