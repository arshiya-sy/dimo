import React from "react";
import "../../styles/main.css";
import PropTypes from "prop-types";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import identity from "../../images/SpotIllustrations/Phone copy.png";
import PageNames from "../../Services/PageNames";
import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import MetricsService from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import InputThemes from "../../Themes/inputThemes";
import GeneralUtilities from "../../Services/GeneralUtilities";

const PageName = PageNames.newDeviceLogin;
var localeObj = {};

export default class newDeviceAlertComponent extends React.Component {
  constructor(props) {
    super(props);
    this.styles = {
      item: {
        width: "88%",
        marginLeft: "6%",
        marginRight: "6%",
        marginTop: "7%"
      },
      bottomButtonStyle: {
        width: "100%",
        position: "fixed",
        bottom: "1.5rem"
      },
    };
    this.next = this.next.bind(this);
    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
    MetricsService.onPageTransitionStart(this.componentName, PageState.open);
  }

  componentDidMount() {
    androidApiCalls.enablePullToRefresh(false);
    document.addEventListener("visibilitychange", this.visibilityChange);
    window.onBackPressed = () => {
      this.onCancel();
    }
  }

  componentWillUnmount() {
    document.removeEventListener("visibilitychange", this.visibilityChange);
    MetricsService.onPageTransitionStop(this.componentName, PageState.close);
  }

  visibilityChange = () => {
    let visibilityState = document.visibilityState;
    if (visibilityState === "hidden") {
      MetricsService.onPageTransitionStop(this.componentName, PageState.close);
    } else if (visibilityState === "visible") {
      MetricsService.onPageTransitionStart(this.componentName, PageState.open);
    }
  }

  next = () => {
    androidApiCalls.openEmail();
    MetricsService.onPageTransitionStop(this.componentName, PageState.close);
    this.props.history.replace("/newLogin");
  }

  onCancel = () => {
    MetricsService.onPageTransitionStop(this.componentName, PageState.close);
    this.props.history.replace({ pathname: "/", transition: "right" });
  }

  render() {

    const help = () => {
      MetricsService.onPageTransitionStop(this.componentName, PageState.close);
      GeneralUtilities.openHelpSection();
    }

    return (
      <div style={{ overflowX: "hidden" }}>
        <ImageInformationComponent header={localeObj.new_device_signon_title} onCancel={this.onCancel} icon={identity} type={PageName}
          appBar={true} description={localeObj.new_device_signon_desc} />

        <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
          <PrimaryButtonComponent btn_text={localeObj.go_to_email} onCheck={this.next} />
          <div style={this.styles.item} onClick={() => help()}>
            <span className="body2 highEmphasis">
              {localeObj.need_help}
            </span>
          </div>
        </div>
      </div>
    )
  }
}

newDeviceAlertComponent.propTypes = {
  history: PropTypes.object
}
