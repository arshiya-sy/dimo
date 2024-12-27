import React from "react";
import FlexView from "react-flexview";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import upgradeImg from "../../images/SpotIllustrations/Phone copy.png";

import dimo_logo from "../../images/DarkThemeImages/Dimo-Logo_4x.png";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import InputThemes from "../../Themes/inputThemes";

const PageName = PageNames.UpgradeAppPage;
var localeObj = {};

export default class UpgradeAppPage extends React.Component {
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
        if (androidApiCalls.checkIfMpOnly()) {
            androidApiCalls.openAppInPlayStore("com.motorola.dimo");
        } else {
            androidApiCalls.openAppInPlayStore("com.motorola.ccc.notification");
        }
    }

    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        return (
            <div>
                <div className="scroll" style={{ height: `${screenHeight * 0.75}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <span>
                            <img style={{ width: `${screenWidth * 0.7}px`, marginTop: "3.5rem" }} src={upgradeImg} alt="" />
                        </span>
                    </div>
                    <div style={this.style.textStyle}>
                        <span className="headline5 highEmphasis">
                            {localeObj.upgrade_header}
                        </span>
                    </div>
                    <div style={this.style.subTextStyle}>
                        <span className="body2 highEmphasis">
                            {localeObj.upgrade_desc}
                        </span>
                    </div>
                </div>
                <div style={InputThemes.bottomButtonStyle}>
                    <FlexView column hAlignContent="center" style={{ width: screenWidth, marginBottom: "3rem" }}>
                        <img style={{ marginTop: "1.5rem", height: `${0.095 * screenHeight}px` }} src={dimo_logo} alt=""></img>
                    </FlexView>
                    <PrimaryButtonComponent btn_text={localeObj.update_now} onCheck={this.next} />
                </div>

            </div>
        );
    }
}