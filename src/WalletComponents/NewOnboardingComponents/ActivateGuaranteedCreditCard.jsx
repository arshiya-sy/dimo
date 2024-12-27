import React from "react";
import "../../styles/main.css";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import InputThemes from "../../Themes/inputThemes";
import Grid from '@material-ui/core/Grid';

import sellIcon from "../../images/SvgUiIcons/sell.svg";
import showChartIcon from "../../images/SvgUiIcons/showChart.svg";
import layout from "../../images/DarkThemeImages/VisaVirtualCard.png";
import cashbackIcon from "../../images/SpotIllustrations/cashback.png";

import Log from "../../Services/Log";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import constantObjects from "../../Services/Constants"
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import { ONBOARD_STATUS } from "../../Services/MetricsService";
import androidApiCalls from "../../Services/androidApiCallsService";
import GeneralUtilities from "../../Services/GeneralUtilities";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";

var localeObj = {};

export default class ActivateGuaranteedCreditCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}

        this.componentName = PageNames.activateGuaranteedCreditCard;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.CLIENT_APPROVED);
        window.onBackPressed = () => {
            this.onCancel();
        }
    }

    onCancel = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.history.push({ pathname: "/newWalletLaunch", transition: "right" });
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

    sendEventMetrics = (event_type, pageName) => {
        let event = {
            eventType: event_type,
            page_name: pageName,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
    }

    showEnableFingerprintBottomSheet = () => {
        this.setState({
            bottomSheetHeader: localeObj.enable_fingerprint_title,
            bottomSheetDescription: localeObj.onboard_enable_fingerprint_desc,
            primary_btn_text: localeObj.confirm,
            bottomSheetType: this.bottomSheetTypes.ENABLE_FP_WARNING,
            bottomSheetSubText: "",
            fpOpen: true
        });
    }

    setVerificationDialogueStatus = (status) => {
        this.setState({ dialogOpen: status });
    }

    registerFp = () => {
        androidApiCalls.askToSetUpBiometrics();
        window.fingerprintEnrollComplete = (result) => {
            Log.sDebug("fingerprintEnrollComplete " + result, "ActivateGuaranteedCreditCardComponent");
            if (result) {
                this.setVerificationDialogueStatus(false);
                this.showEnableFingerprintBottomSheet();
            }
        }
    }

    cancelVerification = () => {
        this.setVerificationDialogueStatus(false);
        this.props.history.replace("/identification");
    }

    onClickAction = (event) => {
        window.onBackPressed = () => {
            this.onCancel();
        }
        let eventL = {};
        switch (event) {
            case "save":
                eventL = {
                    eventType: constantObjects.firstAccess + "CLICKED GCC ONBOARDING",
                    page_name: this.componentName,
                };
                MetricServices.reportActionMetrics(eventL, new Date().getTime());
                MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                this.props.history.replace({ pathname: "/gccHowItWorks", newOnboarding: true });
                break;
            case "maybeLater":
                eventL = {
                    eventType: constantObjects.firstAccess + "CLICKED MAY BE LATER",
                    page_name: this.componentName,
                };
                MetricServices.reportActionMetrics(eventL, new Date().getTime());
                MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                this.props.history.replace({
                    pathname: "/gccFirstAccess",
                    maybelater: true
                });
                break;
            default:
                MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                this.props.history.replace({ pathname: "/newWalletLaunch", newOnboarding: true });
                break;
        }
    }


    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const cardWidth = screenWidth * 0.80;
        const cardHeight = screenHeight * 0.24;

        const creditCardBenefits = [
            {
                "icons": <img src={sellIcon} style={{ width: "1.5rem" }} alt="" />,
                "creditCardBenefitTitle": localeObj.first_access_gcc_option_1
            },
            {
                "icons": <img src={cashbackIcon} style={{ width: "1.5rem" }} alt="" />,
                "creditCardBenefitTitle": localeObj.first_access_gcc_option_2
            },
            {
                "icons": <img src={showChartIcon} style={{ width: "1.5rem" }} alt="" />,
                "creditCardBenefitTitle": localeObj.first_access_gcc_option_3
            }
        ]

        return (
            <div>
                <ButtonAppBar header={localeObj.dimo_card} onBack={this.onCancel} action="none" />
                <div style={{ overflowY: "auto", width: screenWidth, height: screenHeight, textAlign: "center" }}>
                    <img style={{ width: `${cardWidth}px`, height: `${cardHeight}px`, marginLeft: '2rem', marginRight: '2rem', marginTop: "4.125rem" }} src={layout} alt=""></img>
                    <FlexView column>
                        <div style={{ textAlign: "center", margin: "1.313rem 2rem" }} className="headline5 highEmphasis">
                            {localeObj.first_access_gcc_header}
                        </div>
                        <div>
                            <Grid container spacing={0}>{
                                creditCardBenefits.map((jsonCategory, index) => (
                                    <div key={index} style={{
                                        width: `${screenWidth}px`,
                                        borderRadius: "0.5rem",
                                        marginLeft: "2rem"
                                    }}>
                                        <FlexView>
                                            <FlexView>
                                                <div style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    width: "3rem",
                                                    height: "3rem"
                                                }}>{jsonCategory.icons}</div>
                                            </FlexView>
                                            <FlexView>
                                                <div style={{ marginTop: "0.75rem", marginLeft: "0.813rem", textAlign: "left" }}>
                                                    <span className="body2 highEmphasis" >{jsonCategory.creditCardBenefitTitle}</span>
                                                </div>
                                            </FlexView>
                                        </FlexView>
                                    </div>
                                ))}
                            </Grid>
                        </div>
                    </FlexView>
                </div>
                <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                    <FlexView column style={{ textAlign: "center", margin: "1rem" }}>
                        <span className="body2 highEmphasis">{localeObj.credit_card_welcome_benifits_btn_pre_text_01}</span>
                        <span className="body2 accent" style={{ textDecoration: "underline" }} onClick={() => GeneralUtilities.openDimoWebsite()}>{localeObj.credit_card_welcome_benifits_btn_pre_text_02}</span>
                    </FlexView>
                    <PrimaryButtonComponent btn_text={localeObj.first_access_gcc_btn} onCheck={() => this.onClickAction("save")} />
                    <div className="body2 highEmphasis" style={{ marginTop: "1rem" }} onClick={() => this.onClickAction("maybeLater")}>{localeObj.plain_maybe_later}</div>
                </div>
            </div>
        );
    }
}

ActivateGuaranteedCreditCard.propTypes = {
    history: PropTypes.object
}
