import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import FlexView from 'react-flexview';
import '../../styles/main.css';
import '../../styles/new_pix_style.css';
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import PageState from "../../Services/PageState";
import MetricsService from '../../Services/MetricsService';

import localeService from "../../Services/localeListService";
import PrimaryButtonComponent from "./PrimaryButtonComponent";
import GeneralUtilities from '../../Services/GeneralUtilities';
import error from "../../images/SpotIllustrations/Alert.png";
import ButtonAppBar from './ButtonAppBarComponent';
import InputThemes from '../../Themes/inputThemes';
import ColorPicker from "../../Services/ColorPicker";
var localeObj = {};
export default function PixErrorComponent(props) {
    let names = "";
    if (Object.keys(localeObj).length === 0) {
        localeObj = localeService.getActionLocale();
    }
    if (GeneralUtilities.emptyValueCheck(props.componentName)) {
        names = "ERROR PAGE";
    } else {
        names = props.componentName;
    }

    useEffect(() => {
        MetricsService.onPageTransitionStart(names);
    }, [names]);

    const visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(names, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(names);
        }
    }

    const onCancelPress = () => {
        MetricsService.onPageTransitionStop(names, PageState.cancel);
        if (props.sendJson) {
            let newJson = {
                "error": false
            }
            props.onClick(newJson);
        } else {
            props.onClick();
        }
    }

    const onButtonPress = () => {
        MetricsService.onPageTransitionStop(names, PageState.close);
        if (props.sendJson) {
            let newJson = {
                "error": false
            }
            props.onClick(newJson);
        } else {
            props.onClick();
        }
    }
    document.addEventListener("visibilitychange", visibilityChange);

    const finalWidth = window.screen.width;

    return (
        <FlexView column>
            {!props.title && <ButtonAppBar header="" onCancel={() => onCancelPress()} action="cancel" inverse="true" />}
            {props.title === "allow" && <ButtonAppBar header={props.errorJson.title} onBack={() => props.onBackHome()} action="none" />}
            <FlexView hAlignContent="center" vAlignContent="center" column>
                <span>
                    <img style={{ width: `${finalWidth * 0.7}px`, marginTop: "3.5rem" }} src={error} alt="" />
                </span>
            </FlexView>
            <div className="headline5 highEmphasis" style={{ margin: "0 2rem", textAlign: "center" }} >
                {props.errorJson.header}
            </div>
            <div className="body2 highEmphasis" style={{ margin: "1rem 2rem", textAlign: "center", wordWrap: "break-word" }}>
                {props.errorJson.description}
            </div>
            <div className="body2 highEmphasis" style={{ display: (props.caption === "allow" ? 'block' : 'none'), margin: "1rem 2rem", textAlign: "center", wordWrap: "break-word" }}>
                {props.errorJson.caption}
            </div>
            <div className="body2 highEmphasis" style={{ display: (props.caption2 === "allow" ? 'block' : 'none'), margin: "1rem 2rem", textAlign: "center", wordWrap: "break-word" }}>
                {props.errorJson.caption2}
            </div>
            <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                <PrimaryButtonComponent btn_text={props.btnText ? props.btnText : localeObj.back_home} onCheck={() => onButtonPress()} />
                {props.isPixSend &&
                    <div className="body2" style={{ color: ColorPicker.darkMediumEmphasis, marginTop: "1.25rem" }}>
                        {localeObj.get_help_chatbot}
                        <span className="body2" style={{ color: ColorPicker.accent, textDecoration: "underline" }} onClick={props.goToChatbot}>
                            {localeObj.chatbot_help}
                        </span>
                    </div>
                }
            </div>
        </FlexView>
    )
}

PixErrorComponent.propTypes = {
    componentName: PropTypes.string,
    errorJson: PropTypes.shape({
        title: PropTypes.string,
        header: PropTypes.string,
        description: PropTypes.string,
        caption: PropTypes.string,
        caption2: PropTypes.string,
    }),
    caption: PropTypes.string,
    caption2: PropTypes.string,
    title: PropTypes.string,
    btnText: PropTypes.string,
    onClick: PropTypes.func,
    onBackHome: PropTypes.func,
    sendJson: PropTypes.bool,
    isPixSend: PropTypes.bool,
    goToChatbot: PropTypes.func,
};
