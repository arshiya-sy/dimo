import React from "react";
import "../../styles/main.css";
import PropTypes from "prop-types";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import identity from "../../images/SpotIllustrations/Checkmark.png";
import InformationPageComponent from "../CommonUxComponents/ImageInformationComponent";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import { ONBOARD_STATUS } from "../../Services/MetricsService";
import PageNames from "../../Services/PageNames";
import DimoFlashComponent from "../CommonUxComponents/DimoFlashComponent";

var localeObj = {};

export default class AccountConfirmationComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        this.next = this.next.bind(this);
        this.componentName = PageNames.accountConfirmation;
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

    next = () => {
        this.setState({
            direction: "left",
            locState: "dimo"
        })
        let timeoutId = setInterval(() => {
            clearInterval(timeoutId);
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.history.replace({ pathname: "/newWalletLaunch", newOnboarding: true });
        }, 1.5 * 1000);
    }

    sendEventMetrics = (event_type, pageName) => {
        let event = {
            eventType: event_type,
            page_name: pageName,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
    }


    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const creation = this.state.locState;
        return (
            <div>
                <div className='sucessPage' style={{ display: creation !== "dimo" ? 'block' : 'none', overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                    <div style={{ marginTop: "3rem" }}>
                        <InformationPageComponent header={localeObj.ac_header} icon={identity} appBar={false}
                            description={localeObj.ap_description} btnText={localeObj.access_account} next={this.next} type={this.componentName} />

                    </div>
                </div >
                <div style={{ display: creation === "dimo" ? 'block' : 'none' }}>
                    {creation === "dimo" && <DimoFlashComponent />}
                </div>
            </div>
        );
    }
}

AccountConfirmationComponent.propTypes = {
    history: PropTypes.object
}