import React from "react";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import PropTypes from "prop-types";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import moto_logo from "../../images/SpotIllustrations/Rocket.png";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import InputThemes from "../../Themes/inputThemes";

var parts = "";
var match = "";
var matched_sac = "";
var parts_sac = "";

const PageName = PageNames.personalInfo.start;
var localeObj = {};

export default class PrivacyComponent extends React.Component {
    constructor(props) {
        super(props);
        localeObj = {};
        this.state = {
            cancelled: false
        };
        this.style = {
            textStyle: {
                marginBottom: "1rem",
                textAlign: "center"
            },
            subTextStyle: {
                textAlign: "center",
                alignItems: "justify",
                marginLeft: "1.5rem",
                marginRight: "1.5rem",
            },
            underLine: {
                borderBottomStyle: "solid",
                width: "fit-content",
                borderBottomWidth: "1.5px"
            }
        }
        this.next = this.next.bind(this);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    next = () => {
        MetricServices.onPageTransitionStop(PageName, PageState.close);
        this.props.start();
    }

    read = () => {
        MetricServices.onPageTransitionStop(PageName, PageState.close);
        this.props.read();
    }

    customerService = () => {
        MetricServices.onPageTransitionStop(PageName, PageState.close);
        this.props.customerServiceData();
    }

    onCancel = () => {
        MetricServices.onPageTransitionStop(PageName, PageState.cancel);
        this.props.onCancel();
    }

    render() {
        let regex = new RegExp(localeObj.terms_privacy, "gi");
        if (localeObj.arbiTermText3) {
            match = localeObj.arbiTermText3.match(regex);
            if (match !== null) {
                parts = localeObj.arbiTermText3.split(match[0], 2);
            }
        }
        let regex_sac = new RegExp(localeObj.sac_customer, "gi");
        if (localeObj.terms_data) {
            matched_sac = localeObj.terms_data.match(regex_sac);
            if (matched_sac !== null) {
                parts_sac = localeObj.terms_data.split(matched_sac[0], 2);
            }
        }

        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        return (
            <div>
                <ButtonAppBar header="" onCancel={this.onCancel} action="cancel" inverse="true" />
                <div className="scroll" style={{ height: `${screenHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "center"}}>
                        <span>
                            <img style={{ width: `${screenWidth * 0.7}px`, marginTop: "3.5rem" }} src={moto_logo} alt="" />
                        </span>
                    </div>
                    <div style={this.style.textStyle}>
                        <span className="headline5 highEmphasis">
                            {localeObj.startText}
                        </span>
                    </div>
                    <div style={this.style.subTextStyle}>
                        <span className="body2 highEmphasis">
                            {parts_sac[0]}
                            <span className="body2 highEmphasis" style={this.style.underLine} onClick={() => this.customerService()}>{matched_sac[0]}</span>
                            {parts_sac[1]}
                        </span>
                    </div>
                    <div style={this.style.subTextStyle}>
                        <span className="body2 highEmphasis" style={{ marginTop: "0.5rem" }}>
                            {localeObj.arbiTermText2}
                        </span>
                    </div>
                    <div style={this.style.subTextStyle}>
                        <span className="body2 highEmphasis">
                            {parts[0]}
                            <span className="body2 highEmphasis" style={this.style.underLine} onClick={() => this.read()}>{match[0]}</span>
                            {parts[1]}
                        </span>
                    </div>
                </div>
                <div style={InputThemes.bottomButtonStyle}>
                    <PrimaryButtonComponent btn_text={localeObj.acceptBtn} onCheck={this.next} />
                </div>

            </div>
        );
    }
}

PrivacyComponent.propTypes = {
    start: PropTypes.func,
    read: PropTypes.func,
    customerServiceData: PropTypes.func,
    onCancel: PropTypes.func
}