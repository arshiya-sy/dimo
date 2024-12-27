import React from "react";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/new_pix_style.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import PageState from "../../Services/PageState";
import MetricServices from "../../Services/MetricsService";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import constantObjects from "../../Services/Constants";
import PageNames from "../../Services/PageNames";
import CopyIcon from "../../images/GamificationImages/common/copy.svg";
import ColorPicker from "../../Services/ColorPicker";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from "@material-ui/core/styles";
import MetricsService from "../../Services/MetricsService";
import PropTypes from "prop-types";

var localeObj = {};
const stylesheet = {
    copyCodeContStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'auto',
        borderRadius: '14px',
        border: '2px dashed',
        borderColor: ColorPicker.disabledTxt,
        width: 'max-content',
        padding: '16px',
        paddingLeft: '34px',
        marginTop: '0.625rem'
    },
    redirectTextStyle: { 
        marginBlock: '1rem',
        paddingInline: '1.5rem'
    },
    rewardIconStyle: {
        color: ColorPicker.white
    },
    numberSequenceStyle: {
        fontFamily: 'Rookery',
        fontWeight: '500', 
        fontSize: '22px',
        letterSpacing: '-0.11px', 
        lineHeight: '24px', 
        color: ColorPicker.accent,
        width: '40px',
        height: '40px'
    }
}
const SHA256 = require("js-sha256").sha256;
export default class InsuranceComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
        this.componentName = PageNames.intro;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        window.onBackPressed = () => {
            this.back();
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

    back = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.back);
        this.props.history.replace({ pathname: "/allServices", transition: "right" });
    }

    handleClick = () => {
        androidApiCalls.copyToClipBoard(constantObjects.DIMO_CODE);
        this.setState({
            snackBarOpen: true,
            message: localeObj.copy_success
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    onPrimary = () => {
        let event = {
            eventType: constantObjects.insurance_entrypoint,
            page_name: PageNames.insuranceComponent,
        };
        MetricsService.reportActionMetrics(event, new Date().getTime());
        let deviceInfo = androidApiCalls.getDeviceInformation();
        let deviceInfoJson = JSON.parse(deviceInfo);
        let finalJSON = deviceInfoJson["deviceInfo"];
        const utm_source = "dimo";
        const utm_medium = "button";
        const id = finalJSON["deviceId"];
        const at = androidApiCalls.getDeviceActivationDate();
        const model = finalJSON["model"];
        const urlSafemodel = encodeURIComponent(model);
        // const cb = "https://motopay-backend.uc.r.appspot.com/insurance/v1/insurancedetails";
        const cb = "https://engage-webview-dot-engage-experiments.appspot.com/hellomoto/genericcallback?type=generic&p=jl9m9QgTyfzp63UouTBMX1Z8pyyeyXo-gPRTGtC2WoDRpEErSEf_UNZxPLOVaLAyD__iJrhRGWrKzFTzYBCMct4zcCOUbxEpk0XaaRzked5UfuiznTRzouKBI4Kbyz87ktW3kJxAcw0i68ZPWelQ0D6EGFqsIMVSNK_PfUo";
        const urlSafeCb = encodeURIComponent(cb);
        const forwardHashPrefix = "678a88d2-8aa9-44eb-871f-648fbfe5780d";
        const concatenatedString = `${forwardHashPrefix}${utm_source}${utm_medium}${id}${at}${model}${cb}`;

        const shaValue = SHA256(concatenatedString);
        const bytes = Buffer.from(shaValue, 'hex');
        let base64Value = bytes.toString('base64');
        base64Value = base64Value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

        const insuranceLink = `https://seguros.motorola.com.br/?utm_source=${utm_source}&utm_medium=${utm_medium}&ih=${id}&tt=${at}&dm=${urlSafemodel}&cb=${urlSafeCb}&hash=${base64Value}`;

        window.location.href = insuranceLink;
    }

    render() {
        const screenHeight = window.screen.height;
        return (
            <div>
                <ButtonAppBar header={localeObj.insurance} onBack={this.back} action="none" />
                <div className="scroll" style={{ height: `${screenHeight - 240}px`, overflowX: 'hidden', overflowY: 'auto' }}>

                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ width: '312px', height: '72px' }}>
                                {localeObj.insurance_header}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.6rem", width: '312px', height: '60px' }}>
                                {localeObj.insurance_desc}
                            </div>
                        </FlexView>
                    </div>
                    <div style={{marginLeft: '36px'}}>
                        <FlexView column>
                            <FlexView>
                                <div style={stylesheet.numberSequenceStyle}>{localeObj.insurance_serial_no1}</div>
                                <div className="body1 highEmphasis" style={{width: '248px', height: '24px'}}>{localeObj.insurance_body1}</div>
                            </FlexView>
                            <FlexView style={{ paddingTop: '24px', paddingBottom: '26px' }}>
                                <div style={stylesheet.numberSequenceStyle}>{localeObj.insurance_serial_no2}</div>
                                <div className="body1 highEmphasis" style={{width: '248px', height: '18px'}}>{localeObj.insurance_body2}</div>
                            </FlexView>
                            <FlexView>
                                <div style={stylesheet.numberSequenceStyle}>{localeObj.insurance_serial_no3}</div>
                                <div className="body1 highEmphasis" style={{width: '248px', height: '84px'}}>{localeObj.insurance_body3}</div>
                            </FlexView>
                        </FlexView>
                    </div>
                    
                    <FlexView column style={{alignItems: 'center'}}>
                        <FlexView className="body2 highEmphasis" style={{paddingBottom: '16px'}}>{localeObj.insurance_coupon_header}</FlexView>
                        <FlexView style={stylesheet.copyCodeContStyle} onClick={this.handleClick}>
                            <div className="body4 highEmphasis">{localeObj.insurance_code}</div>
                            <img src={CopyIcon} alt='' style={{ ...stylesheet.rewardIconStyle, marginLeft: '0.5rem' }} />
                        </FlexView>
                    </FlexView>
                </div>
                <FlexView vAlignContent="center" hAlignContent="center" style={InputThemes.bottomButtonStyle}>
                    <PrimaryButtonComponent btn_text={localeObj.insurance_btn} onCheck={this.onPrimary} />
                </FlexView>
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        style={{ top: '560px' }}
                        open={this.state.snackBarOpen}
                        onClose={this.closeSnackBar}
                        autoHideDuration={constantObjects.SNACK_BAR_DURATION}
                    >
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

InsuranceComponent.propTypes = {
    history: PropTypes.object.isRequired
}