import React from "react";
import PropTypes from "prop-types";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import FlexView from "react-flexview";
import ColorPicker from "../../Services/ColorPicker";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import { withStyles } from "@material-ui/core/styles";

import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import Utils from "../../WalletComponents/EngageCardComponent/Utils";

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import Log from "../../Services/Log";

var data = require("../../Services/deploymentVersion.json");
var localeObj = {};

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

class AboutComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            backendVersion: "",
            AppVersion: "",
            isButtonClicked: false
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(PageNames.aboutApp);
        Utils.getBackendVersion().then(resp => {
            this.setState({ backendVersion: resp });
        });
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);

        let version = androidApiCalls.getAppVersion().toString();
        if (version !== null) {
            this.setState({
                AppVersion: version.substring(0, 2) + "." + version.substring(2, 3) + "." + version.substring(3, 6)
            })
        }

        window.onBackPressed = () => {
            this.props.history.replace({ pathname: "/myAccount", transition: "right" });
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.aboutApp, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.aboutApp);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    onSelectOption() {
        if(this.state.isButtonClicked){
            return;
        }
        this.setState({ isButtonClicked: true })

        Log.sDebug("User Clicked OSS Licensces", "AboutAppComponent");
        MetricServices.onPageTransitionStop(PageNames.aboutApp, PageState.close);
        this.props.history.replace("/OssComp");

        setTimeout(() => {
            this.setState({ isButtonClicked: false });
        }, 300);
    }

    render() {

        const onBack = () => {
            MetricServices.onPageTransitionStop(PageNames.aboutApp, PageState.back);
            this.props.history.replace({ pathname: "/myAccount", transition: "right" });
        }
        let { backendVersion } = this.state;
        let versionInfo = localeObj.app_version + " " + androidApiCalls.getAppVersion()
            + "/" + data.version + (backendVersion ? "-" + backendVersion : backendVersion);
        let deviceIdInfo = androidApiCalls.getBarcode();
        const screenHeight = window.screen.height;
        return (
            <div>
                <ButtonAppBar header={localeObj.about} onBack={onBack} action="none" />
                <div style={{ margin: "1.5rem",height:`${0.65*screenHeight}px`,overflow:"scroll"}}>
                    <FlexView column>
                        <div className="body2 highEmphasis">
                            {localeObj.about_text}
                        </div>
                    </FlexView>
                    <ListItem disableGutters={true} disablePadding={true} align="left" style={{ marginTop: "2rem" }} onClick={() => this.onSelectOption()}>
                        <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.oss_licenses} />
                        <span style={{ marginRight: "2.25rem" }} onClick={() => this.onSelectOption()}>
                            <ArrowForwardIosIcon style={{ color: ColorPicker.accent, fontSize: "1rem" }} />
                        </span>
                    </ListItem>

                </div>
                <FlexView column align="left" style={{ margin: "1.5rem", width: "90%", position: "fixed", bottom: "0px" }}>
                    <div className="caption highEmphasis">{versionInfo}</div>
                    <div className="caption highEmphasis">{localeObj.device_id + ": "}{deviceIdInfo}</div>
                    <div className="caption highEmphasis">{localeObj.last_updated + ": " + data.date}</div>
                </FlexView>
            </div>
        )
    }
}

AboutComponent.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AboutComponent);