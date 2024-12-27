import React from 'react';
import FlexView from "react-flexview";
import '../../styles/main.css';
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import PropTypes from "prop-types";

import androidApiCalls from "../../Services/androidApiCallsService";
import localeService from "../../Services/localeListService";
import MetricsService from '../../Services/MetricsService';
import PageState from '../../Services/PageState';

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import InputThemes from '../../Themes/inputThemes';
import Log from '../../Services/Log';

const IS_ANDRIOD = androidApiCalls.checkBrowserType() === "engage" ? true : false;
var localeObj = {};

export default class PreviewImageComponent extends React.Component {
    constructor(props) {
        super(props);
        this.componentName = this.props.componentName;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName)
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        Log.sDebug("Reaching Preview Stage");
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName);
        }
    }

    send = () => {
        MetricsService.onPageTransitionStop(this.componentName, PageState.close);
        this.props.reviewCompleted();
    }

    retake = () => {
        this.props.retake();
    }

    render() {
        const screenHeight = window.screen.height;
        const previewImage = () => {
            let iRef = undefined;
            const prefix_image = "data:image/jpeg;base64,";
            iRef = IS_ANDRIOD ? prefix_image + this.props.id : this.props.id;
            return (
                iRef && <img src={iRef} style={{ maxWidth: "100%", maxHeight: `${(0.46) * screenHeight}px` }} alt="" />
            )
        }
        return (
            <div className="scroll" style={{ height: `${screenHeight - 290}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={InputThemes.initialMarginStyle}>
                    <FlexView column>
                        <div className="headline5 highEmphasis" style={{ textAlign: "center" }}>
                            {this.props.header}
                        </div>
                        <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem", marginLeft: "5%", marginRight: "5%" }}>
                            {this.props.description}
                        </div>
                    </FlexView>
                </div>
                <div style={{ margin: "0.5rem 3rem" }}>
                    {previewImage()}
                </div>
                <div style={InputThemes.bottomButtonStyle}>
                    <PrimaryButtonComponent btn_text={localeObj.send} onCheck={this.send} />
                    <SecondaryButtonComponent btn_text={localeObj.retake_photo} onCheck={this.retake} />
                </div>
            </div>
        )
    }
}

PreviewImageComponent.propTypes = {
    componentName: PropTypes.string,
    description: PropTypes.string,
    header: PropTypes.string,
    id: PropTypes.string,
    reviewCompleted: PropTypes.func,
    retake: PropTypes.func,
}