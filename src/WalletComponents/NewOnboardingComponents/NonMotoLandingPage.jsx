import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import dimo_logo from "../../images/DarkThemeImages/Dimo-Logo_4x.png";
import phone_copy from "../../images/SpotIllustrations/Phone copy.png";

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import InputThemes from "../../Themes/inputThemes";

const PageName = PageNames.nonMotoDeviceLogin;
var localeObj = {};

export default class NonMotoDeviceLandingComponent extends React.Component {
    constructor(props) {
        super(props);

        this.styles = {
            bodyDiv: {
                width: "100%"
            },
            span1: {
                textAlign: 'center',
                margin: "1.5rem",
                marginBottom: "1rem"
            },
            span2: {
                margin: '0% 10%',
                textAlign: 'center',
            }
        }
        this.goToStore = this.goToStore.bind(this);
        this.back = this.back.bind(this);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);

        window.onBackPressed = () => {
            this.back();
        }
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

    goToStore = () => {
        androidApiCalls.openUrlInBrowser("https://www.motorola.com.br/");
        MetricServices.onPageTransitionStop(PageName, PageState.close);
    }

    back = () => {
        MetricServices.onPageTransitionStop(PageName, PageState.back);
        this.props.history.replace({ pathname: "/", transition: "right" });
    }

    render() {
        let Styles = this.styles;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;

        return (
            <div>
                <div className='scroll' style={{ height: `${screenHeight - 250}px`, width: screenWidth, overflowY: "scroll", overflowX: "hidden" }}>
                    <FlexView column hAlignContent="center" style={{ width: screenWidth }}>
                        <img style={{ marginTop: "1.5rem", height: '5rem', width: '14rem' }} src={dimo_logo} alt=""></img>
                    </FlexView>
                    <div style={{ align: "center" }}>
                        <img style={{ width: `${screenWidth * 0.7}px` }} src={phone_copy} alt="" />
                        <div className="headline5 highEmphasis" style={{ ...Styles.span1 }}>
                            {localeObj.nm_welcome_page}
                        </div>
                        <div className="subtitle2 highEmphasis" style={{ ...Styles.span2, marginBottom: "1.5rem" }}>
                            {localeObj.nm_banking_exclusive}
                        </div>
                        <div className="subtitle2 highEmphasis" style={{ ...Styles.span2 }}>
                            {localeObj.nm_buy_phone}
                        </div>
                    </div>
                    <FlexView column hAlignContent="center" style={InputThemes.bottomButtonStyle}>
                        <div style={{ textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.goToStore} onCheck={this.goToStore} />
                            <SecondaryButtonComponent btn_text={localeObj.back} onCheck={this.back} />
                        </div>
                    </FlexView>
                </div>

            </div >
        );
    }
}

NonMotoDeviceLandingComponent.propTypes = {
    history: PropTypes.object
}