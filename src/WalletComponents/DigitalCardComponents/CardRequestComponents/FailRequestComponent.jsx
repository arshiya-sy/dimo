import React from "react";
import PropTypes from "prop-types";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import MetricServices from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import androidApiCalls from "../../../Services/androidApiCallsService";
import card from "../../../images/SpotIllustrations/Card.png";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";

import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";

import { withStyles } from '@material-ui/core/styles';

const styles = InputThemes.singleInputStyle;
var localeObj = {};

class FailRequestComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayStatus: false,
            open: false,
            snackBarOpen: false
        };
        this.style = {
            textStyle: {
                marginLeft: "3rem",
                marginRight: "3rem",
                marginTop: "1rem",
                textAlign: "center"
            }
        }
        this.onBack = this.onBack.bind(this);
        this.componentName = PageNames.FailRequest;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
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

    onBack = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.back);
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    help = () => {
        if (this.props.onHelp) {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.onHelp()
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            GeneralUtilities.openHelpSection();
        }
    }

    render() {
        const finalHeight = window.screen.height;
        return (
            <div className="scroll" style={{ height: `${finalHeight - 290}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div>
                    <ButtonAppBar header={localeObj.account_card} onBack={this.onBack} action="none" />
                </div>
                <div  style={{ marginTop: "5%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                    <span>
                        <img style={{ width: '16rem' }} src={card} alt="" />
                    </span>
                </div>
                <div style={this.style.textStyle}>
                    <span className="headline5 highEmphasis">
                        {localeObj.fail_request}
                    </span>
                </div>
                <div style={this.style.textStyle}>
                    <span className="body2 highEmphasis" style={{ fontWeight: 400 }}>
                        {localeObj.fail_request_description}
                    </span>
                </div>

                <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={localeObj.request_card} disabled={true} />
                    <div style={this.style.textStyle} className="body2 highEmphasis" onClick={() => this.help()}>
                        {localeObj.help}
                    </div>
                </div>
            </div>
        );
    }
}

FailRequestComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    onHelp: PropTypes.func
  };

export default withStyles(styles)(FailRequestComponent);
