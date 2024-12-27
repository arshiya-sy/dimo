import React from "react";
import "../../../styles/main.css";
import InputThemes from "../../../Themes/inputThemes";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';

import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import InputPinComponent from "../../CommonUxComponents/InputPinPage";
import ERROR_IN_SERVER_RESPONSE from "../../../Services/httpRequest";
import SuccessComponent from "../PasswordandPinOperations/SuccessComponent";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";

import { MuiThemeProvider } from "@material-ui/core/styles";
import { CSSTransition } from 'react-transition-group';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Log from "../../../Services/Log";
import constantObjects from "../../../Services/Constants";
import PropTypes from "prop-types";

const theme2 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.changePinComponent;
var localeObj = {};

class ChangePinComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pinState: "old_pin",
            oldpass: "",
            direction: "",
            errros: {},
            newpass: "",
            retype: "",
            snackBarOpen: false,
            message: ""
        };

        this.getOldPin = this.getOldPin.bind(this);
        this.getNewPin = this.getNewPin.bind(this);
        this.getRetypePin = this.getRetypePin.bind(this);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(PageNames.ViewContaractDetails);
    }

    componentDidMount = () => {
        androidApiCalls.enablePullToRefresh(false);

        window.onBackPressed = () => {
            this.onBack();
        }
    }

    getOldPin = (old_pin) => {
        Log.sDebug("Input Old Pin", "ChangePinMain");
        this.setState({
            oldpass: old_pin,
            pinState: "new_pin",
            direction: "left"
        })
    }

    getNewPin = (new_pin) => {
        Log.sDebug("Input New Pin", "ChangePinMain");
        this.setState({
            newpass: new_pin,
            pinState: "retype_pin",
            direction: "left"
        })
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

    onSuccess = () => {
        let securityJSON = {
            "from": "Password Page"
        }
        this.props.history.replace("/securityComp", { "passwordDetails": securityJSON });
    }

    getRetypePin = (retype_pin) => {
        Log.sDebug("Retyped new pin", "ChangePinMain");

        if (this.state.newpass !== retype_pin) {
            Log.sDebug("Retyped pin is not same as new pin", "ChangePinMain");
            this.setState({
                snackBarOpen: true,
                message: localeObj.password_dont_match
            });
            return;
        }
        this.setState({
            retype: retype_pin,
        })

        let jsonObject = {};

        jsonObject["pinOld"] = this.state.oldpass;
        jsonObject["pinNew"] = this.state.newpass;
        this.showProgressDialog();
        arbiApiService.changeAccountPin(jsonObject, PageNameJSON.retype_pin)
            .then(response => {
                Log.sDebug("Pin reset Successful", "ChangePinMain");
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processChangeAccountPinResponse(response.result);
                    if (processorResponse.success) {
                        Log.sDebug("Pin changed successfully", "ChangePinMain");
                        this.setState({
                            message: localeObj.password_change_success,
                            pinState: "success",
                            direction: "left"
                        })
                    } else {
                        Log.sDebug("Pin Change Failed", "ChangePinMain", constantObjects.LOG_PROD);
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.tryAgainLater
                        })
                        return;
                    }
                } else {
                    let errorMessageToUser = localeObj.retry_later;
                    if (response.result !== ERROR_IN_SERVER_RESPONSE) {
                        if (response.result.message == ArbiResponseHandler.INCOORRECT_PIN) {
                            errorMessageToUser = localeObj.pin_incorrect;
                            this.setErrorMessageStatus(errorMessageToUser);
                        } else if (response.result.code === 10007) {
                            errorMessageToUser = localeObj.current_password_invalid;
                            this.setErrorMessageStatus(errorMessageToUser);
                        } else {
                            this.setErrorMessageStatus(response.result.message);
                        }
                        Log.sDebug("Pin Change Failed with Reason  " + errorMessageToUser, "ChangePinMain", constantObjects.LOG_PROD);
                    } else {
                        this.setErrorMessageStatus(errorMessageToUser);
                    }
                }
            });
    }

    onBack = () => {
        if (this.state.processing) {
            Log.sDebug("Moving to component from " + this.state.pinState, "ChangePinMain");
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.pinState], PageState.back);
            if (this.state.pinState === "old_pin") {
                let securityJSON = {
                    "from": "Password Page"
                }
                this.props.history.replace({pathname: "/securityComp", "passwordDetails": securityJSON, "phoneNumber" : this.props.location.phoneNumber});
            } else if (this.state.pinState === "new_pin") {
                this.setState({
                    pinState: "old_pin",
                    direction: "right"
                })
            } else if (this.state.pinState === "retype_pin") {
                this.setState({
                    pinState: "old_pin",
                    direction: "right"
                })
            }
        }
    }

    setErrorMessageStatus = (errorMessageToUser) => {
        this.setState({
            snackBarOpen: true,
            message: errorMessageToUser
        });
        let timeoutId = setInterval(() => {
            clearInterval(timeoutId);
            let securityJSON = {
                "from": "Password Page"
            }
            this.props.history.replace("/securityComp", { "passwordDetails": securityJSON });
        }, 1.5 * 1000);
    }

    render() {
        const pinStatus = this.state.pinState;
        const successMessage = this.state.message;

        return (
            <div style={{ overflowX: "hidden" }}>
                {pinStatus !== "success" && <ButtonAppBar header={localeObj.account_password} onBack={this.onBack} action="none" />}
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pinStatus === "old_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pinStatus === "old_pin" && !this.state.processing ? 'block' : 'none') }}>
                        {pinStatus === "old_pin" && <InputPinComponent header={localeObj.old_password_header} confirm={this.getOldPin} componentName={PageNameJSON["old_pin"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pinStatus === "new_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pinStatus === "new_pin" && !this.state.processing ? 'block' : 'none') }}>
                        {pinStatus === "new_pin" && <InputPinComponent header={localeObj.password_header} description={localeObj.pin_change_bottom} confirm={this.getNewPin}
                            componentName={PageNameJSON["new_pin"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pinStatus === "retype_pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pinStatus === "retype_pin" && !this.state.processing ? 'block' : 'none') }}>
                        {pinStatus === "retype_pin" && <InputPinComponent header={localeObj.repeat_password_header} description={localeObj.repeat_password_descriptor} confirm={this.getRetypePin}
                            componentName={PageNameJSON["retype_pin"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={pinStatus === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (pinStatus === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {pinStatus === "success" && <SuccessComponent message={successMessage} onFinish={this.onSuccess} componentName={PageNameJSON["success"]} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
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
ChangePinComp.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object
};
export default ChangePinComp;