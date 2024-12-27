import React from 'react';
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";

import PageState from '../../Services/PageState';
import PageNames from '../../Services/PageNames';
import constantObjects from '../../Services/Constants';
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import Log from '../../Services/Log';
import apiService from '../../Services/apiService';

import PushIcon from '@mui/icons-material/ArticleOutlined';
import HeardIcon from '@mui/icons-material/SmsOutlined';
import OfferIcon from '@mui/icons-material/AttachMoneyOutlined';
import ExpIcon from '@mui/icons-material/BarChartOutlined';
import NewUtilities from '../../Services/NewUtilities';
import ColorPicker from '../../Services/ColorPicker';
import SecondaryButtonComponent from '../CommonUxComponents/SecondaryButtonComponent';

const styles = InputThemes.singleInputStyle;
var localeObj = {};

class PushNotifComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isNonMoto: androidApiCalls.checkIfNm(),
            country: androidApiCalls.getShipmentCountry(),
        }
        this.styles = {
            cardStyle: {
                width: "100%",
                borderRadius: "0.5rem",
                margin: "0 1rem",
                align: "center"
            },
            imgStyle: {
                height: "1.5rem",
                width: "1.5rem"
            },
            iconStyle: {
                height: "1.25rem",
                width: "1.25rem",
                color: "#FFB684" 
            },
            circleIconContainer: {
                borderRadius: "50%",
                height: "3rem",
                width: "3rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: ColorPicker.newProgressBar
            },
            listStyleSelect: {
                margin: "1rem 1.5rem",
                display: "flex",
                alignItems: 'center',
            },
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNames.pushOptin);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.pushOptin, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.pushOptin);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
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

    setPreOptinStatus = (optin) => {
        this.showProgressDialog();
        MetricServices.onPageTransitionStop(PageNames.pushOptin, PageState.close);
        var payloadJson = Object.assign({}, {});
        payloadJson.cpf = this.props.cpf;
        payloadJson.deviceId = androidApiCalls.getDeviceId();
        payloadJson.anonymizedSerialNumber = NewUtilities.getMetadataForDeviceType();
        payloadJson.pushOptIn = optin === "opted in" ? "true" : optin;
        payloadJson.pushOptInTimestamp = Date.now();
        if (!androidApiCalls.checkIfNm()) {
            payloadJson.serialNumber = androidApiCalls.getBarcode();
            payloadJson.model = androidApiCalls.getModelName();
        } else {
            let deviceDetails = androidApiCalls.getDeviceInformation();
            let deviceDetailsObj = JSON.parse(deviceDetails);
            payloadJson.fcmId = deviceDetailsObj.deviceInfo.fcmId;
        }
        apiService.preOptinStatus(payloadJson)
            .then(response => {
                Log.sDebug("Push optin is successful with status:" + response.status, PageNames.pushOptin);
            }).catch(err => {
                if (err && err.response) {
                    Log.sDebug("Failed to set Push optin " + err.response, PageNames.pushOptin, constantObjects.LOG_PROD);
                }
            });
        if (!this.state.isNonMoto) {
            var optinJson = {
                "deviceId": androidApiCalls.getDeviceId(),
                "userInfo": [
                    {
                        "extraText": {
                            "optin_push": optin,
                            "optinType": "push",
                            "country": this.state.country,
                            "version": "2.5",
                            "source": "motopay-webview",
                        }
                    }
                ]
            };
            var android_params = androidApiCalls.getDeviceParameters();
            for (var i in android_params) {
                if (i !== "source") {
                    optinJson.userInfo[0].extraText[i] = android_params[i];
                }
            }
            var optinData = JSON.stringify(optinJson);
            var promise = androidApiCalls.optinCall(optinData);
            promise.then((data) => {
                Log.sDebug("Subscription confirmed:" + data);
                this.hideProgressDialog();
                this.props.done();
            }, (reason) => {
                Log.sDebug("Subscription failed:" + reason, PageNames.pushOptin, constantObjects.LOG_PROD);
                this.hideProgressDialog();
                this.props.done();
            });
        } else {
            this.hideProgressDialog();
            this.props.done();
        }
    }

    render() {
        const finalHeight = window.screen.height;
        const depositContents = [
            {
                heading: localeObj.push_header_1,
                text: localeObj.push_desc_1,
                icon: <PushIcon style={this.styles.iconStyle} />
            },
            {
                heading: localeObj.push_header_2,
                text: localeObj.push_desc_2,
                icon: <HeardIcon style={this.styles.iconStyle} />
            },
            {
                heading: localeObj.push_header_3,
                text: localeObj.push_desc_3,
                icon: <OfferIcon style={this.styles.iconStyle} />
            },
            {
                heading: localeObj.push_header_4,
                text: localeObj.push_desc_4,
                icon: <ExpIcon style={this.styles.iconStyle} />
            }
        ];

        return (
            <div style={{ overflowX: "hidden" }}>
                <div className="scroll" style={{ height: `${finalHeight - 350}px`, overflowY: "auto" }}>
                    <div style={{ display: !this.state.processing ? "block" : "none" }}>
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.push_header}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                            <MuiThemeProvider theme={InputThemes.PushInput}>
                                <Grid container spacing={0}>
                                    {
                                        depositContents.map((keys, idx) => (
                                            <div key={idx} style={this.styles.cardStyle}>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <div style={this.styles.circleIconContainer}>{keys.icon}</div>
                                                    </ListItemIcon>
                                                    <ListItemText>
                                                        <div style={{ marginLeft: "1rem", align: "left" }}>
                                                            <span className="subtitle4 highEmphasis" >{keys.heading}</span>
                                                            <div className="body2 mediumEmphasis">{keys.text}</div>
                                                        </div>
                                                    </ListItemText>
                                                </ListItem>
                                            </div>
                                        ))
                                    }
                                </Grid>
                            </MuiThemeProvider>
                        </div>
                        <div align="center" style={InputThemes.bottomButtonStyle}>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", margin: "1rem", maxWidth: "89%", marginBottom: "32px" }}>
                                {localeObj.notif_footNote}
                            </div>
                            <PrimaryButtonComponent btn_text={localeObj.push_acceptContBtn} onCheck={() => this.setPreOptinStatus("opted in")} />
                            <SecondaryButtonComponent btn_text={localeObj.motopay_continue} onCheck={() => this.setPreOptinStatus("undecided")}/>
                        </div>
                    </div>
                </div >
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
            </div >
        );
    }
}

PushNotifComp.propTypes = {
    history: PropTypes.object,
    cpf: PropTypes.string,
    done: PropTypes.func
}

export default withStyles(styles)(PushNotifComp);
