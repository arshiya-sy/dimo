import React from "react";
import "../../styles/main.css";
import PropTypes from "prop-types";
import Log from "../../Services/Log";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices, { ONBOARD_STATUS } from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import { CSSTransition } from 'react-transition-group';

import personInfo from "../../images/SpotIllustrations/Information.png";
import PrivacyComponent from "../OnBoardingSupportComponents/PrivacyComponent";
import TermsAndPrivacyComponent from "../OnBoardingSupportComponents/TermsAndPrivacyComponent";
import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";
import SacDataComponent from "../OnBoardingSupportComponents/SacData";
import GeneralUtilities from "../../Services/GeneralUtilities";

const PageNameJSON = PageNames.personalInfo;
var localeObj = {};

export default class PersonalInfoComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      creation: props.location.state || "start",
      direction: ""
    };
    this.next = this.next.bind(this);
    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
  }

  componentDidMount() {
    androidApiCalls.enablePullToRefresh(false);
    window.onBackPressed = () => {
      this.onBack();
    }
  }

  onBack = () => {
    switch (this.state.creation) {
      case "privacy":
      case "end":
      case "custom":
        return this.setState({
          creation: "start",
          direction: "left"
        });
      case "start":
        this.props.history.replace("/");
        break;
      default: break;
    }
  }

  next = () => {
    this.props.history.replace("/userIdCreation");
  }

  start = () => {
    Log.sDebug("privacy_accepted", "PrivacyComponent");
    androidApiCalls.setDAStringPrefs(GeneralUtilities.PRIVACY_KEY, "enable");
    if (this.props.location && this.props.location.from && this.props.location.from === "landingPage") {
      this.props.history.replace({ pathname: "/newLogin", transition: "none" });
    } else {
      androidApiCalls.persistIntValue("onboardingFinished", 1, "EngageApp");
      androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.PRIVACY_ACCEPTED);
      this.setState({
        creation: "end",
        direction: "left"
      });
    }
  }

  onCancel = () => {

    Log.sDebug("privacy_rejected", "PrivacyComponent");

    androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.PRIVACY_REJECTED);
    this.props.history.replace({ pathname: "/", state: 'end', transition: "right" });
  }

  read = () => {
    this.setState({
      creation: "privacy",
      direction: "left"
    });
  }

  viewCustomerService = () => {
    this.setState({
      creation: "custom",
      direction: "left"
    });
  }

  back = () => {
    MetricServices.onPageTransitionStop(PageNameJSON[this.state.creation], PageState.back);
    this.setState({
      creation: "start",
      direction: "right"
    });
  }

  render() {
    return (
      <div style={{ overflowX: "hidden" }}>
        <CSSTransition mountOnEnter={true} unmountOnExit={true}
          in={this.state.creation === "start" && !this.state.processing ? true : false} timeout={300}
          classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
          <div style={{ display: (this.state.creation === "start" ? 'block' : 'none') }}>
            {this.state.creation === "start" && <PrivacyComponent start={this.start} onCancel={this.onCancel} read={this.read} customerServiceData={this.viewCustomerService} />}
          </div>
        </CSSTransition>
        <CSSTransition mountOnEnter={true} unmountOnExit={true}
          in={this.state.creation === "custom" ? true : false} timeout={300}
          classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
          <div style={{ display: (this.state.creation === "custom" ? 'block' : 'none') }}>
            {this.state.creation === "custom" &&
              <SacDataComponent next={this.start} back={this.back} />}
          </div>
        </CSSTransition>
        <CSSTransition mountOnEnter={true} unmountOnExit={true}
          in={this.state.creation === "privacy" ? true : false} timeout={300}
          classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
          <div style={{ display: (this.state.creation === "privacy" ? 'block' : 'none') }}>
            {this.state.creation === "privacy" &&
              <TermsAndPrivacyComponent next={this.start} back={this.back} />}
          </div>
        </CSSTransition>
        <CSSTransition mountOnEnter={true} unmountOnExit={true}
          in={this.state.creation === "end" ? true : false} timeout={300}
          classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
          <div style={{ display: (this.state.creation === "end" ? 'block' : 'none') }}>
            {this.state.creation === "end" &&
              <ImageInformationComponent header={localeObj.personalInfo} onCancel={this.onCancel} icon={personInfo} type={PageNames.personalInfo.end}
                description={localeObj.initial_data} btnText={localeObj.start} next={this.next} appBar={true} bottomSheetDesc={false} />}
          </div>
        </CSSTransition>
      </div>
    );
  }
}

PersonalInfoComponent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object
}