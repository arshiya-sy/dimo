import React from "react";
import FlexView from "react-flexview";
import PropTypes from 'prop-types';

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import error from "../../images/SpotIllustrations/Alert.png";

import HelloShopUtil from '../EngageCardComponent/HelloShopUtil';
import GeneralUtilities from "../../Services/GeneralUtilities";
import ButtonAppBar from './ButtonAppBarComponent';

var localeObj = {};

export default class HSErrorComponent extends React.Component {
    constructor(props) {
        super(props);

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "HS ERROR PAGE"
        }
        this.state = {
            seconds: 5,
        }
        this.timer = 0;
        this.countDown = this.countDown.bind(this);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);

        if (this.props.errorJson.errorCode === HelloShopUtil.HS_ERROR_CODE) {
            this.startTimer();
        }
    }


    startTimer() {
        if (this.timer === 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    countDown() {
        // Remove one second, set state so a re-render happens.
        let seconds = this.state.seconds - 1;
        this.setState({
            seconds: seconds,
        });
        // Check if we're at zero.
        if (seconds === 0) {
            this.stopCountDown();
            let error = HelloShopUtil.BANK_ABORTED_ERROR;
            if (this.props.errorJson.reason === HelloShopUtil.HS_TIMEOUT_ERROR_CODE) {
                error = HelloShopUtil.TIMEOUT_ABORTED_ERROR;
            }
            let url = HelloShopUtil.getAbortedURL(JSON.stringify(this.props.errorJson), error)
            HelloShopUtil.returnToHS(url);
        }
    }

    stopCountDown() {
        clearInterval(this.timer);
        this.timer = 0;
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
        this.stopCountDown();
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    render() {
        const onButtonPress = ()=> {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            if(this.props.sendJson) {
                let newJson = {
                    "error": false
                }
                this.props.onClick(newJson);
            } else {
                this.props.onClick();
            }
        }

        const onCancelPress = () => {
            MetricServices.onPageTransitionStop(this.componentName, PageState.cancel);
            if(this.props.sendJson) {
                let newJson = {
                    "error": false
                }
                this.props.onClick(newJson);
            } else {
                this.props.onClick();
            }
        }
        const getButtonText = () => {
            if (this.props.errorJson.errorCode === HelloShopUtil.HS_ERROR_CODE) {
                return localeObj.back_to_hs;
            }
            return this.props.btnText? this.props.btnText: localeObj.back_home;
        }

        const finalWidth = window.screen.width;
        return (
            <FlexView column>
                <ButtonAppBar header="" onCancel={()=>onCancelPress()} action="cancel" inverse="true" />
                <div style={{display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"}}>
                    <span>
                        <img style={{ width: `${finalWidth * 0.7}px`, marginTop:"3.5rem" }} src={error} alt="" />
                    </span>
                </div>
                <div className="headline5 highEmphasis" style={{ margin: "0 2rem", textAlign: "center" }} >
                    {this.props.errorJson.header}
                </div>
                <div className="body2 highEmphasis" style={{height:"2.4rem", margin: "1rem 2rem", textAlign: "center", wordWrap: "break-word" }}>
                    {this.props.errorJson.description}
                </div>
                {(this.props.errorJson.errorCode === HelloShopUtil.HS_ERROR_CODE) && <div style={{marginTop: "7.7rem", paddingLeft: "7rem", paddingRight:"3rem", height:"2.5rem"}}>
                    <FlexView>
                        <span style={{}}><CustomizedProgressBars timer={true} size={40}/></span>
                        <span style={{}} className="tableLeftStyle highEmphasis" >{GeneralUtilities.formattedString(localeObj.hs_redirect_message, [this.state.seconds])}</span>
                    </FlexView>
                </div>}
                <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={getButtonText()} onCheck={()=>onButtonPress()} />
                </div>
            </FlexView>
        )
    }
}

HSErrorComponent.propTypes = {
    componentName: PropTypes.string,
    sendJson: PropTypes.bool,
    onClick: PropTypes.func,
    btnText: PropTypes.string,
    errorJson: PropTypes.shape({
      errorCode: PropTypes.string,
      header: PropTypes.string,
      description: PropTypes.string,
      reason: PropTypes.string
    })
  };