import React from "react";
import "../../../styles/main.css";
import PropTypes from 'prop-types';
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import identity from "../../../images/SpotIllustrations/Checkmark.png";
import InformationPageComponent from "../../CommonUxComponents/ImageInformationComponent";
import MetricServices from "../../../Services/MetricsService";
import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import DimoFlashComponent from "../../CommonUxComponents/DimoFlashComponent";

var localeObj = {};
const PageNameJSON = PageNames.CreditCardComponents;
export default class CreditCardSuccess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNameJSON['credit_facematch_success'];
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.goToHomePage();
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
                <div className='sucessPage' style={{ display:'block', overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                    <div style={{ marginTop: "3rem" }}>
                        {
                            this.props.secBtnText  ?
                                <InformationPageComponent header={this.props.header} icon={identity} appBar={false}
                                description={this.props.description} btnText={this.props.btnText} secBtnText = {this.props.secBtnText}  subText= {this.props.subtext}
                                close = {this.props.close} next={this.props.next} type={this.componentName} onCancel={this.props.onCancel} />
                            :
                                <InformationPageComponent header={this.props.header} icon={identity} appBar={false}
                                description={this.props.description} btnText={this.props.btnText} subText= {this.props.subtext} next={this.props.next} type={this.componentName} />

                        }
                        
             
                    </div>
                </div >
                <div style={{ display: creation === "dimo" ? 'block' : 'none' }}>
                    {creation === "dimo" && <DimoFlashComponent />}
                </div>
            </div>
        );
    }
}

CreditCardSuccess.propTypes = {
    componentName: PropTypes.string,
    header: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    btnText: PropTypes.string.isRequired,
    secBtnText: PropTypes.string,
    subtext: PropTypes.string.isRequired,
    close: PropTypes.func,
    next: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
};
