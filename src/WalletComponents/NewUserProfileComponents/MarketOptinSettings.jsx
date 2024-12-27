import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import constantObjects from "../../Services/Constants";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import Drawer from '@material-ui/core/Drawer';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import apiService from "../../Services/apiService";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import Log from "../../Services/Log";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCallsService from "../../Services/androidApiCallsService";
import NewUtilities from "../../Services/NewUtilities";


const SwitchStyle = withStyles({
    width: "6%",
    switchBase: {
        color: ColorPicker.buttonAccent,
        '&$checked': {
            color: ColorPicker.buttonAccent,
        },
        '&$checked + $track': {
            backgroundColor: ColorPicker.newProgressBar,
        },
    },
    checked: {},
    track: {},
})(Switch);

const styles = {
    buttonStyle: {
        textTransform: 'none',
        align: "center",
        background: ColorPicker.newProgressBar,
        color: ColorPicker.darkHighEmphasis,
        padding: "0.5rem",
        borderRadius: "0.75rem",
        width: "100%",
        border: "0px",
        fontWeight: 400,
        '&:hover': {
            backgroundColor: ColorPicker.newProgressBar,
            boxShadow: "none"
        },
        "& .MuiTouchRipple-root span": {
            backgroundColor: ColorPicker.newProgressBar,
            boxShadow: "none",
        },
    },
    accSum: {
        height: "2rem",
        marginBottom: -1,
        '&$expanded': {
            height: "2rem",
        },
    },
    MuiAccordionroot: {
        "&.MuiAccordion-root:before": {
            backgroundColor: "transparent",
        },
        MuiAccordianDetails: {
            "&.MuiAccordionDetails-root": {
                padding: "0 0 0 0"
            },
        }
    },
    paper: InputThemes.singleInputStyle.paper
};

var localeObj = {};

class MarketOptinSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            location: false,
            locServer: "undecided",
            whatsapp: false,
            phoneServer: "undecided",
            pushNotif: false,
            notifServer: "undecided",
            whatsappOptInTimestamp: Date.now(),
            locationMarketingOptInTimestamp: Date.now(),
            pushOptInTimestamp: Date.now(),
            locationFetched: false,
            roaSettingsCheck: false,
            roaTEDSettingsCheck: false,
            roaBoletoSettingsCheck: false,
            roaPixSettingsCheck: false,
            expandedSwitch: false,
            isROAEnabled: false
        }
        this.componentName = "MarketOptinSettings";
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNames.MarketOptinSettings);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        apiService.getOptinStatus(ImportantDetails.cpf)
            .then(response => {
                if (response.status == 200) {
                    this.setState({
                        locServer: response.data.locationMarketingOptIn,
                        phoneServer: response.data.whatsappOptIn,
                        notifServer: response.data.pushOptIn,
                        location: this.setBoolField(response.data.locationMarketingOptIn),
                        whatsapp: this.setBoolField(response.data.whatsappOptIn),
                        pushNotif: this.setBoolField(response.data.pushOptIn),
                        whatsappOptInTimestamp: response.data.whatsappOptInTimestamp,
                        locationMarketingOptInTimestamp: response.data.locationMarketingOptInTimestamp,
                        pushOptInTimestamp: response.data.pushOptInTimestamp
                    })
                }
            }).catch(err => {
                if (err.response) {
                    Log.sDebug("Falied to set location optin" + err.response.status, this.componentName, constantObjects.LOG_PROD);
                }
            });
        window.onBackPressed = () => {
            if (GeneralUtilities.subDeepLinkCheck(this.props.location.state.subDeepLink)) {
                return;
            }
            MetricServices.onTransitionStop(PageNames.MarketOptinSettings, PageState.back);
            this.props.history.replace({ pathname: "/myAccount", transition: "right" });
        }
        if (androidApiCalls.hasCoarsePermission()) {
            androidApiCalls.getCurrentLocation();
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

    setBoolField = (field) => {
        switch (field) {
            case "true":
            case "opted in":
                return true;
            default:
                return false;
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onTransitionStop(PageNames.MarketOptinSettings, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.MarketOptinSettings);
        }
    }

    componentWillUnmount() {
        this.updateOptInStatus();
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    updateOptInStatus = () => {
        var payloadJson = Object.assign({}, {});
        payloadJson.cpf = ImportantDetails.cpf;
        payloadJson.chaveDeCliente = ImportantDetails.clientKey;
        payloadJson.locationMarketingOptIn = this.state.locServer;
        payloadJson.locationMarketingOptInTimestamp = this.state.locationMarketingOptInTimestamp;
        payloadJson.whatsappOptIn = this.state.phoneServer;
        payloadJson.whatsappOptInTimestamp = this.state.whatsappOptInTimestamp;
        payloadJson.pushOptIn = this.state.notifServer;
        payloadJson.pushOptInTimestamp = this.state.pushOptInTimestamp;
        if (this.state.location && this.state.locationFetched) {
            payloadJson.latitude = this.state.latitude.toString();
            payloadJson.longitude = this.state.longitude.toString();
        }
        if (!androidApiCalls.checkIfNm()) {
            payloadJson.deviceId = androidApiCalls.getDeviceId();
            payloadJson.anonymizedSerialNumber = NewUtilities.getMetadataForDeviceType();
            payloadJson.serialNumber = androidApiCalls.getBarcode();
            payloadJson.model = androidApiCalls.getModelName();
        } else {
            let deviceDetails = androidApiCalls.getDeviceInformation();
            let deviceDetailsObj = JSON.parse(deviceDetails);
            payloadJson.fcmId = deviceDetailsObj.deviceInfo.fcmId;
        }

        apiService.setOptinStatus(payloadJson).then(response => {
            if (response.status == 200) {
                Log.sDebug("Successfully to set optin" + response.status, this.componentName);
            }
        }).catch(err => {
            if (err.response) {
                Log.sDebug("Falied to set optin" + err.response.status, this.componentName);
            }
        });
    }

    handleLocation() {
        if (this.state.location) {
            this.setState({
                bottomSheetHeader: localeObj.location_access_header,
                bottomSheetDescription: localeObj.disable_loc,
                type: "location",
                open: true
            })
        } else {
            this.setLocationOptions();
        }
    }

    setLocationOptions = () => {
        this.setState({
            locServer: this.state.location ? "false" : "true",
            location: !(this.state.location),
            locationMarketingOptInTimestamp: Date.now()
        })
        let timeoutId = setInterval(() => {
            clearInterval(timeoutId);
            this.updateOptInStatus();
        }, 1000);
    }

    handleWhatsapp() {
        if (this.state.whatsapp) {
            this.setState({
                bottomSheetHeader: localeObj.whatsapp_access_header,
                bottomSheetDescription: localeObj.disable_phone,
                type: "whatsapp",
                open: true
            })
        } else {
            this.setWhatsappOptions();
        }
    }

    setWhatsappOptions = () => {
        this.setState({
            phoneServer: this.state.whatsapp ? "false" : "true",
            whatsapp: !(this.state.whatsapp),
            whatsappOptInTimestamp: Date.now()
        })
        let timeoutId = setInterval(() => {
            clearInterval(timeoutId);
            this.updateOptInStatus();
        }, 1000);
    }

    handlePush() {
        if (this.state.pushNotif) {
            this.setState({
                bottomSheetHeader: localeObj.push_notification,
                bottomSheetDescription: localeObj.disable_notif,
                type: "push_notif",
                open: true
            })
        } else {
            this.setPushNotifOptions();
        }
    }

    setPushNotifOptions = () => {
        this.setState({
            notifServer: this.state.pushNotif ? "false" : "true",
            pushNotif: !(this.state.pushNotif),
            pushOptInTimestamp: Date.now()
        })
        let timeoutId = setInterval(() => {
            clearInterval(timeoutId);
            this.updateOptInStatus();
        }, 1000);
    }

    onPrimary = () => {
        this.setState({ open: false });
    }

    onSecondary = () => {
        this.setState({ open: false })
        if (this.state.type === "location") {
            this.setLocationOptions();
        } else if (this.state.type === "whatsapp") {
            this.setWhatsappOptions();
        } else if (this.state.type === "push_notif") {
            this.setPushNotifOptions();
        }
    }

    UpdateReadOutAloudStatus() {
        androidApiCallsService.updateRoaStatus(this.state.roaSettingsCheck,
            this.state.roaPixSettingsCheck,
            this.state.roaTEDSettingsCheck,
            this.state.roaBoletoSettingsCheck);
    }

    UpdateReadOutAloudStatusApk(roa, ted, boleto, pix) {
        androidApiCallsService.updateRoaStatus(roa, ted, boleto, pix);
    }

    handleRoaSettings() {
        let roaVal = !this.state.expandedSwitch;
        this.setState({
            expandedSwitch: roaVal,
            roaSettingsCheck: roaVal,
            roaBoletoSettingsCheck: roaVal,
            roaPixSettingsCheck: roaVal,
            roaTEDSettingsCheck: roaVal
        });
        this.UpdateReadOutAloudStatusApk(roaVal, roaVal, roaVal, roaVal);
    }

    handleRoaTEDSettings() {
        if (this.state.roaTEDSettingsCheck) {
            if (this.state.roaTEDSettingsCheck && !this.state.roaPixSettingsCheck && !this.state.roaBoletoSettingsCheck) {
                this.UpdateReadOutAloudStatusApk(false, false, this.state.roaBoletoSettingsCheck, this.state.roaPixSettingsCheck);
                this.setState({
                    roaTEDSettingsCheck: false,
                    roaSettingsCheck: false,
                    expandedSwitch: false
                });
            } else {
                this.UpdateReadOutAloudStatusApk(this.state.roaSettingsCheck, false, this.state.roaBoletoSettingsCheck, this.state.roaPixSettingsCheck);
                this.setState({
                    roaTEDSettingsCheck: false
                });
            }
        } else {
            this.UpdateReadOutAloudStatusApk(true, true, this.state.roaBoletoSettingsCheck, this.state.roaPixSettingsCheck);
            this.setState({
                roaTEDSettingsCheck: true,
                roaSettingsCheck: true,
                expandedSwitch: true
            });
        }

    }

    handleRoaBoletoSettings() {
        if (this.state.roaBoletoSettingsCheck) {
            if (this.state.roaBoletoSettingsCheck && !this.state.roaPixSettingsCheck && !this.state.roaTEDSettingsCheck) {
                this.UpdateReadOutAloudStatusApk(false, this.state.roaTEDSettingsCheck, false, this.state.roaPixSettingsCheck);
                this.setState({
                    roaBoletoSettingsCheck: false,
                    roaSettingsCheck: false,
                    expandedSwitch: false
                });
            } else {
                this.UpdateReadOutAloudStatusApk(this.state.roaSettingsCheck, this.state.roaTEDSettingsCheck, false, this.state.roaPixSettingsCheck);
                this.setState({
                    roaBoletoSettingsCheck: false
                });
            }
        } else {
            this.UpdateReadOutAloudStatusApk(true, this.state.roaTEDSettingsCheck, true, this.state.roaPixSettingsCheck);
            this.setState({
                roaBoletoSettingsCheck: true,
                roaSettingsCheck: true,
                expandedSwitch: true
            });
        }
    }

    handleRoaPixSettings() {
        if (this.state.roaPixSettingsCheck) {
            if (!this.state.roaBoletoSettingsCheck && this.state.roaPixSettingsCheck && !this.state.roaTEDSettingsCheck) {
                this.UpdateReadOutAloudStatusApk(false, this.state.roaTEDSettingsCheck, this.state.roaBoletoSettingsCheck, false);
                this.setState({
                    roaPixSettingsCheck: false,
                    roaSettingsCheck: false,
                    expandedSwitch: false
                });
            } else {
                this.UpdateReadOutAloudStatusApk(this.state.roaSettingsCheck, this.state.roaTEDSettingsCheck, this.state.roaBoletoSettingsCheck, false);
                this.setState({
                    roaPixSettingsCheck: false
                });
            }
        } else {
            this.UpdateReadOutAloudStatusApk(true, this.state.roaTEDSettingsCheck, this.state.roaBoletoSettingsCheck, true);
            this.setState({
                roaPixSettingsCheck: true,
                roaSettingsCheck: true,
                expandedSwitch: true
            });
        }
    }

    render() {
        const onBack = () => {
            if (GeneralUtilities.subDeepLinkCheck(this.props.location.state.subDeepLink)) {
                return;
            }
            MetricServices.onTransitionStop(PageNames.MarketOptinSettings, PageState.back);
            this.props.history.replace({ pathname: "/myAccount", transition: "right" });
        }
        const { classes } = this.props;

        return (
            <div>
                <ButtonAppBar header={localeObj.app_settings} onBack={onBack} action="none" />
                <div>
                    <MuiThemeProvider theme={InputThemes.SearchInputTheme}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column align="left">
                                <List>
                                    <ListItem disablePadding={true} align="left">
                                        <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.location_access_header}
                                            secondary={localeObj.location_access_text} />
                                        <span style={{textAlign: "right"}}>
                                            <SwitchStyle checked={this.state.location} onChange={() => this.handleLocation()} />
                                        </span>
                                    </ListItem>
                                    <ListItem disablePadding={true} align="left" style={{ marginTop: "0.5rem" }}>
                                        <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.whatsapp_access_header}
                                            secondary={localeObj.whatsapp_access_text} />
                                        <span style={{textAlign: "right"}}>
                                            <SwitchStyle checked={this.state.whatsapp} onChange={() => this.handleWhatsapp()} />
                                        </span>
                                    </ListItem>
                                    <ListItem disablePadding={true} align="left" style={{ marginTop: "0.5rem" }}>
                                        <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.push_notification}
                                            secondary={localeObj.push_notification_text} />
                                        <span style={{textAlign: "right"}}>
                                            <SwitchStyle checked={this.state.pushNotif} onChange={() => this.handlePush()} />
                                        </span>
                                    </ListItem>
                                    {this.state.isROAEnabled && <ListItem disablePadding={true} align="left">
                                        <Accordion elevation={0} classes={{ root: classes.MuiAccordionroot }} square expanded={this.state.expandedSwitch} >
                                            <AccordionSummary className={classes.accSum} expandIcon={<ExpandMoreIcon style={{ color: ColorPicker.accent }} onClick={() => this.handleRoaSettings()} />}>
                                                <List style={{ margin: "0rem" }}>
                                                    <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.roa_settings} />
                                                </List>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <List>
                                                    <ListItem disablePadding={true} align="left">
                                                        <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.roa_TED_settings} />
                                                        <span style={{textAlign: "right"}}>
                                                            <SwitchStyle checked={this.state.roaTEDSettingsCheck} onChange={() => this.handleRoaTEDSettings()} />
                                                        </span>
                                                    </ListItem>
                                                </List>
                                            </AccordionDetails>
                                            <AccordionDetails>
                                                <List>
                                                    <ListItem disablePadding={true} align="left">
                                                        <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.roa_Boleto_settings} />
                                                        <span style={{textAlign: "right"}}>
                                                            <SwitchStyle checked={this.state.roaBoletoSettingsCheck} onChange={() => this.handleRoaBoletoSettings()} />
                                                        </span>
                                                    </ListItem>
                                                </List>
                                            </AccordionDetails>
                                            <AccordionDetails>
                                                <List>
                                                    <ListItem disablePadding={true} align="left">
                                                        <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.roa_Pix_settings} />
                                                        <span style={{textAlign: "right"}}>
                                                            <SwitchStyle checked={this.state.roaPixSettingsCheck} onChange={() => this.handleRoaPixSettings()} />
                                                        </span>
                                                    </ListItem>
                                                </List>
                                            </AccordionDetails>
                                        </Accordion>
                                    </ListItem>}
                                </List>
                            </FlexView>
                        </div>
                    </MuiThemeProvider>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.open}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {this.state.bottomSheetHeader}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {this.state.bottomSheetDescription}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "0.6rem" }}>
                                    {localeObj.time_limit_to_complete}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.back} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.deactivate} onCheck={this.onSecondary} />
                        </div>
                    </Drawer>
                </div>
            </div >
        )
    }
}

MarketOptinSettings.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MarketOptinSettings);
