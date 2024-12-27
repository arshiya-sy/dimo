import React from "react";
import PropTypes from "prop-types";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import {withStyles } from "@material-ui/core/styles";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";

const styles = {
    root: {
        background: "#6A7580"
    },
    aboutStyle: {
        align: "left",
        marginLeft: "4%",
        marginRight: "8.8%",
        marginTop: "3.8%"
    }
};

var localeObj = {};

class OssComponent extends React.Component {
    constructor(props) {
        super(props);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStop(PageNames.ossLicences);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);

        window.onBackPressed = () => {
            MetricServices.onPageTransitionStop(PageNames.ossLicences, PageState.back);
            this.props.history.replace({ pathname: "/aboutComp", transition: "right" });
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.ossLicences, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStop(PageNames.ossLicences);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        MetricServices.onTransitionStop();
    }

    render() {

        const screenHeight = window.screen.height;
        const onBack = () => {
            MetricServices.onPageTransitionStop(PageNames.ossLicences, PageState.back);
            this.props.history.replace({ pathname: "/aboutComp", transition: "right" });
        }

        return (
            <div>
                <ButtonAppBar header={localeObj.oss_licenses} onBack={onBack} action="none" />
                <div className="scroll" style={{ margin: "1.5rem", height: `${screenHeight * 0.82}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={{ width: "90%", whiteSpace: "pre-line", overflow: "hidden" }} className="body2 highEmphasis">
                        {androidApiCalls.getOssLicense()}
                    </div>
                </div>
            </div>
        )
    }
}

OssComponent.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(OssComponent);