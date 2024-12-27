import React from "react";
import PropTypes from "prop-types";
import { CSSTransition } from 'react-transition-group';

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import "../../styles/new_pix_style.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import { copyEditedPhoneNumber } from "../../Services/ClientCreationJson";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FlexView from "react-flexview/lib";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import EditIcon from '@material-ui/icons/Edit';

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import PhoneNumberComponent from "../OnBoardingSupportComponents/PhoneNumberComponent";
import DetailFormComponent from "../OnBoardingSupportComponents/DetailFormComponent";
import ArbiApiService from "../../Services/ArbiApiService";
import NewUtilities from "../../Services/NewUtilities";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import constantObjects from "../../Services/Constants";
import apiService from "../../Services/apiService";
import Log from "../../Services/Log";

const styles = InputThemes.singleInputStyle;
const theme1 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.revisionPage;
var localeObj = {};

class RevisionComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.profileData,
            ddd: props.profileData.telefoneMovel.ddd,
            phoneNumber: props.profileData.telefoneMovel.numero,
            name: props.profileData.nome,
            actualDdd: props.profileData.telefoneMovel.ddd.substr(1, 3),
            whatsappOptIn: "undecided",
            whatsappOptInTimestamp: Date.now()
        }
        this.componentName = this.props.componentName;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
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

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    edit = (header) => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.edit);
        this.props.revSelectionDone(true);
        if (header === localeObj.fullname) {
            this.setState({
                editName: true,
            })
        } else if (header === localeObj.phone_number) {
            this.setState({
                editPhone: true,
            })
        } else {
            this.props.editAddress();
        }
    }

    setDDD = (json) => {
        this.setState({
            actualDdd: json["field"],
            // DD is usually two digits, but ARBI expects, 3 digit input
            ddd: "0" + json["field"],
            whatsappOptIn: json["optin"]
        })
    }

    setField = (field) => {
        this.props.revSelectionDone(false);
        if (this.state.editPhone) {
            this.setState({
                phoneNumber: field,
                editPhone: false,
                whatsappOptInTimestamp: this.state.whatsappOptInTimestamp,
            })
            let timeoutId = setInterval(() => {
                clearInterval(timeoutId);
                this.setPreOptinStatus();
            }, 1000);
        } else {
            ArbiApiService.createClientPayloadJson("nome", field);
            this.setState({
                name: field,
                editName: false
            })
        }
    }

    setPreOptinStatus = () => {
        var payloadJson = Object.assign({}, {});
        payloadJson.cpf = NewUtilities.parseCPF(this.state.data.identificacaoFiscal).displayCPF;
        payloadJson.phoneNumber = this.state.ddd + ":" + this.state.phoneNumber;
        payloadJson.whatsappOptIn = this.state.whatsappOptIn;
        payloadJson.whatsappOptInTimestamp = Date.now();
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
        apiService.preOptinStatus(payloadJson)
            .then(response => {
                Log.sDebug("Location optin is successful with status:" + response.status, this.componentName);
            }).catch(err => {
                if (err.response) {
                    Log.sDebug("Failed to set location optin" + err.response.status, this.componentName, constantObjects.LOG_PROD);
                }
            });
    }

    sendField = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.recieveField(this.state.name);
    }

    render() {
        const Details = [
            {
                "header": localeObj.fullname,
                "details": this.state.name,
                "edit": true
            },
            {
                "header": localeObj.cpf,
                "details": NewUtilities.parseCPF(this.state.data.identificacaoFiscal).displayCPF
            },
            {
                "header": localeObj.email,
                "details": this.state.data.email,
            },
            {
                "header": localeObj.phone_number,
                "details": NewUtilities.parsePhoneNum(this.state.actualDdd + this.state.phoneNumber).phoneNumber,
                "edit": true
            },
            {
                "header": localeObj.profile_address,
                "details": this.state.data.address,
                "edit": true
            },
        ];
        let json = {
            "ddd": this.state.ddd,
            "mobileNumber": this.state.phoneNumber
        };
        ArbiApiService.createClientPayloadJson("userInfo", json)
        copyEditedPhoneNumber(json);

        if (!this.props.revSelect && this.state.editName) {
            this.setState({
                editName: false
            })
        }
        if (!this.props.revSelect && this.state.editPhone) {
            this.setState({
                editPhone: false
            })
        }
        const finalHeight = window.screen.height;
        return (
            <div>
                <div style={{ display: !this.state.editPhone && !this.state.editName ? 'block' : 'none' }}>
                    <div className="scroll" style={{ height: `${finalHeight - 240}px`, overflowY: "auto", overflowX: "hidden" }}>
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.revision_header}
                                </div>
                                <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                    {localeObj.revision_description}
                                </div>
                            </FlexView>
                        </div>
                        <MuiThemeProvider theme={theme1}>
                            <div style={{ margin: "1.5rem" }}>
                                <List>
                                    {
                                        Details.map((opt, idx) => (
                                            <ListItem key={idx} button>
                                                <ListItemText style={{ wordWrap: "break-word" }} primary={opt.header} secondary={opt.details} />
                                                {opt.edit &&
                                                    <EditIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "0.875rem" }}
                                                        onClick={() => this.edit(opt.header)} />}
                                            </ListItem>
                                        ))
                                    }
                                </List>
                            </div>
                        </MuiThemeProvider>
                        <div style={InputThemes.bottomButtonStyle}>
                            <PrimaryButtonComponent btn_text={localeObj.motopay_continue} onCheck={this.sendField} />
                        </div>
                    </div>
                </div>
                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={this.state.editPhone ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: this.state.editPhone ? 'block' : 'none' }}>
                        <PhoneNumberComponent header={localeObj.phone_header} recieveField={this.setField}
                            ddd={this.state.actualDdd} phoneNumber={this.state.phoneNumber} setDDD={this.setDDD} field={localeObj.phone_number}
                            componentName={PageNameJSON.phoneNumber} />
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={this.state.editName ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: this.state.editName ? 'block' : 'none' }}>
                        <DetailFormComponent header={localeObj.change_name_header} field={localeObj.fullname}
                            recieveField={this.setField} value={this.state.name} componentName={PageNameJSON.name} />
                    </div>
                </CSSTransition>
            </div >
        )
    }
}

RevisionComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    profileData: PropTypes.object,
    componentName: PropTypes.string,
    revSelectionDone: PropTypes.func,
    editAddress: PropTypes.func,
    recieveField: PropTypes.func,
    revSelect: PropTypes.bool
};

export default withStyles(styles)(RevisionComponent);