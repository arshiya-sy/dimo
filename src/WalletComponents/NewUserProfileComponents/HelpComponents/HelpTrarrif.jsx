import React from "react";
import PropTypes from "prop-types";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";

import Log from "../../../Services/Log";
import PageState from "../../../Services/PageState";
import MetricServices from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import dimo_logo from "../../../images/DarkThemeImages/Dimo-Logo_4x.png";

const screenHeight = window.screen.height;
class TarrifComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            localeObj: [],
        }

        if(this.props.componentName){
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "EXTERNAL HTML TARRIF/TIME PAGE"
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        localeService.getActionLocale().then((data) => {
            this.setState({
                localeObj: data,
            })
        })
        Log.sDebug("Tarrifs collected" + this.props.tarrifDetails, this.componentName);
        document.getElementById("Tarrifs").innerHTML = this.props.tarrifDetails;
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

    render() {

        return (
            <div style={{ overflow: "scroll" }}>
                <div style={InputThemes.initialMarginStyle}>
                    <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                        <img style={{ height: "3rem", alignItems: "flex-start" }} src={dimo_logo} alt=""></img>
                        <div style={{ marginTop: "1rem", alignItems: "flex-start", height: `${screenHeight - 300}px`, overflowY: "scroll" }}
                            id={"Tarrifs"} className="highEmphasis"></div>
                    </div>
                </div>
            </div>
        )
    }
}

TarrifComponent.propTypes = {
    componentName: PropTypes.string,
    tarrifDetails: PropTypes.string
};

export default TarrifComponent;