import React from "react";
import PropTypes from "prop-types";
import { CSSTransition } from 'react-transition-group';
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from "@material-ui/core/styles";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";

import safety from "../../images/SpotIllustrations/Safety.png";
import location from "../../images/SpotIllustrations/Location copy.png";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";
import apiService from "../../Services/apiService";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import MetricsService from "../../Services/MetricsService";
import AlertDialog from "./AlertDialog";
import NewUtilities from "../../Services/NewUtilities";

const theme2 = InputThemes.snackBarTheme;
var localeObj = {};
const PageNameJSON = PageNames.locationConsent;

export default class LocationConsent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            locState: "initial",
            marketOptin: "undecided",
            securityOptin: "undecided",
            securityOptinTimestamp: Date.now(),
            locationFetched: false
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.onBack();
        }
        window.onRequestLocationPermission = (json) => {
            if (json["android.permission.ACCESS_COARSE_LOCATION"] !== -1) {
                androidApiCalls.getCurrentLocation();
                this.setState({
                    securityOptin: "true",
                    direction: "left",
                    locState: "optin"
                })
            } else {
                if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")) {
                    this.setState({
                        locationAlert: true
                    })
                } else {
                    this.openSnackBar(localeObj.perm_deny);
                }
            }
        }
        window.onCurrentLocationComplete = (response) => {
            if (response === "enable_location_setting" || response === "cancelled" ||
                response === "request_permission" || response === "failure") {
                this.setState({ locationFetched: false })
            } else {
                this.setState({
                    locationFetched: true,
                    latitude: response["Latitude"],
                    longitude: response["Longitude"]
                })
            }
        }
    }

    closeLocationAlertDialog = () => {
        this.setState({
            locationAlert: false
        })
    }


    onDone = () => {
        this.hideProgressDialog();
        if (this.props.location && this.props.location.from
            && this.props.location.from === "loginPage") {
            this.props.history.replace({ pathname: "/newLogin", cpf: this.props.location.cpf });
        }
        if (androidApiCalls.isFeatureEnabledInApk("VISA_GPAY"))
            this.addVcardToGpay();
        else
            this.props.history.replace({ pathname: "/accountConfirmation", transition: "right" });
    }

    addVcardToGpay = () => {
        let addInfoJson = {
            "cardActions": "google_pay_virtual",
            "brand": "VISA",
            "entryPoint": PageNames.firstAccessVCard,
            "pin": this.props.location.pin
        }
        this.props.history.replace({
            pathname: "/digitalCard",
            additionalInfo: addInfoJson,
            pin: this.props.location.pin
        });
    }

    onSkip = () => {
        Log.sDebug("Location consent skipped", PageNames.locationConsent);
        this.setLocationOptinStatus();
    }

    onBack = () => {
        MetricsService.onPageTransitionStop(PageNameJSON[this.state.locState], PageState.back);
        this.props.history.push({ pathname: "/", transition: "right" });
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

    onAskPermission = () => {
        if (androidApiCalls.hasCoarsePermission()) {
            androidApiCalls.getCurrentLocation();
            this.setState({
                securityOptin: "true",
                securityOptinTimestamp: Date.now(),
                direction: "left",
                locState: "optin"
            });
        } else {
            androidApiCalls.requestFineOrCoarseLocation();
        }
    }

    setLocationOptinStatus = () => {
        this.showProgressDialog();
        var payloadJson = Object.assign({}, {});
        payloadJson.cpf = ImportantDetails.cpf;
        payloadJson.chaveDeCliente = ImportantDetails.clientKey;
        payloadJson.locationMarketingOptIn = this.state.marketOptin;
        payloadJson.locationMarketingOptInTimestamp = Date.now();
        payloadJson.locationSecurityOptIn = this.state.securityOptin;
        payloadJson.locationSecurityOptInTimestamp = this.state.securityOptinTimestamp;
        payloadJson.emailVerified = true;
        payloadJson.phoneNumVerified = true;
        if (!androidApiCalls.checkIfNm()) {
            payloadJson.deviceId = androidApiCalls.getDeviceId();
            payloadJson.serialNumber = androidApiCalls.getBarcode();
            payloadJson.anonymizedSerialNumber = NewUtilities.getMetadataForDeviceType();
            payloadJson.model = androidApiCalls.getModelName();
        } else {
            let deviceDetails = androidApiCalls.getDeviceInformation();
            let deviceDetailsObj = JSON.parse(deviceDetails);
            payloadJson.fcmId = deviceDetailsObj.deviceInfo.fcmId;
        }

        if (this.state.securityOptin && this.state.locationFetched) {
            payloadJson.latitude = this.state.latitude.toString();
            payloadJson.longitude = this.state.longitude.toString();
        }

        apiService.setOptinStatus(payloadJson)
            .then(() => {
                // this.hideProgressDialog();
                this.onDone();
            }).catch(() => {
                // this.hideProgressDialog();
                this.onDone();
            });
    }

    marketOpedIn = () => {
        this.showProgressDialog();
        this.setState({ marketOptin: "true" });
        let timeoutId = setInterval(() => {
            clearInterval(timeoutId);
            this.setLocationOptinStatus();
        }, 1.5 * 1000);
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        });
    }

    render() {
        const creation = this.state.locState;
        return (
            <div style={{ overflowX: "hidden" }}>
                <ButtonAppBar header={localeObj.location_access} onBack={this.onBack} action="none" />
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "initial" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ overflowX: "hidden" }}>
                        <ImageInformationComponent header={localeObj.loc_account_safe} icon={safety} appBar={false}
                            description={localeObj.loc_description} btnText={localeObj.plain_allow} onAction={this.onSkip}
                            next={this.onAskPermission} type={this.componentName} action={localeObj.plain_maybe_later} />
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "optin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ overflowX: "hidden" }}>
                        <ImageInformationComponent header={localeObj.loc_optin} icon={location} onAction={this.setLocationOptinStatus}
                            description={localeObj.loc_optin_description} btnText={localeObj.plain_allow} appBar={false}
                            next={this.marketOpedIn} type={this.componentName} action={localeObj.plain_maybe_later} />
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                {this.state.locationAlert &&
                    <AlertDialog title={localeObj.allow_location_title} description={localeObj.loc_description}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closeLocationAlertDialog} />
                }
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

LocationConsent.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object
}