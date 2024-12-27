import React from "react";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import ColorPicker from "../../../Services/ColorPicker";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import PageState from "../../../Services/PageState";

import EditIcon from '@material-ui/icons/Edit';
import TimeIcon from '@material-ui/icons/AccessTime';

import InputThemes from "../../../Themes/inputThemes";

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import CommonButtons from "../../CommonUxComponents/CommonButtons";
import MetricsService from "../../../Services/MetricsService";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import PropTypes from "prop-types";

const OutlineButton = CommonButtons.AwaitButton;
var localeObj = {};

export default class PixLimitDescComp extends React.Component {
    constructor(props) {
        super(props);
        this.style = {
            blockStyle: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "5.5rem"
            },
            subTextStyle: {
                marginTop: "0.75rem",
            },
            textStyle: {
                marginTop: "1rem",
            }
        }
        this.state = {
            isClickable: false
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.props.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.props.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.props.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    checkPending = () => {
        this.props.checkPending();
    }

    checkMail = () => {
        androidApiCalls.openEmail();
    }

    edit = () => {
        this.props.editLimit();
    }

    convertToFormat = () => {
        return "R$ " + GeneralUtilities.currencyFromDecimals(this.props.limit);
    }

    onBack = () => {
        this.props.onBack();
    }

    render() {
        return (
            <div>
                <div style={this.style.blockStyle}>
                    <div style={{ textAlign: "center" }}>
                        <div className="subtitle4 highEmphasis">{localeObj.daily} </div>
                        <div style={this.style.subTextStyle} className="headline5 highEmphasis">{this.convertToFormat()}&nbsp;
                            <EditIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1.2rem" }}
                                onClick={() => this.edit()} />
                        </div>
                        <div style={{ display: this.props.pending ? "block" : "none", marginTop: "1rem" }}>
                            <OutlineButton onClick={this.checkPending}
                                startIcon={<TimeIcon style={{ fill: ColorPicker.darkHighEmphasis }} />}>
                                <span className="body2 highEmphasis">{localeObj.pending_request}</span>
                            </OutlineButton>
                        </div>
                    </div>
                    <div style={{ textAlign: "center", marginTop: "4.5rem" }}>
                        <div className="subtitle4 highEmphasis">{localeObj.nightly}</div>
                        <div style={this.style.subTextStyle} className="headline5 highEmphasis">
                            R$ 1.000,00
                        </div>
                    </div>
                </div>
                {this.props.pending === false && <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={localeObj.back_home} onCheck={this.onBack} />
                    { this.props.has48HoursPassed &&
                        <div className= "body2" style={{ color: ColorPicker.darkMediumEmphasis, marginTop: "1.25rem" }}> 
                            {localeObj.get_help_chatbot}
                            <span className= "body2" style={{ color: ColorPicker.accent, textDecoration: "underline" }} onClick={this.props.goToChatbot}>
                                {localeObj.chatbot_help}
                            </span>
                        </div>
                    }
                </div>}
                {this.props.pending === true && <div style = {{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={localeObj.check_mail} onCheck={this.checkMail} />
                    <SecondaryButtonComponent btn_text={localeObj.back_home} onCheck={this.onBack}/>
                    { this.props.has48HoursPassed &&
                        <div className= "body2" style={{ color: ColorPicker.darkMediumEmphasis, marginTop: "1.25rem" }}> 
                            {localeObj.get_help_chatbot}
                            <span className= "body2" style={{ color: ColorPicker.accent, textDecoration: "underline" }} onClick={this.props.goToChatbot}>
                                {localeObj.chatbot_help}
                            </span>
                        </div>
                    }
                </div>}
            </div >
        )
    }
}

PixLimitDescComp.propTypes = {
    location: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    checkPending: PropTypes.func,
    editLimit: PropTypes.func,
    onBack: PropTypes.func,
    limit: PropTypes.string,
    pending: PropTypes.bool,
    has48HoursPassed: PropTypes.bool,
    goToChatbot: PropTypes.func


};