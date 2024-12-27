import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import FlexView from 'react-flexview';
import '../../../styles/main.css';
import '../../../styles/new_pix_style.css';
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import PageState from "../../../Services/PageState";
import MetricsService from '../../../Services/MetricsService';

import localeService from "../../../Services/localeListService";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import error from "../../../images/SpotIllustrations/Alert.png";
import InputThemes from '../../../Themes/inputThemes';

export default function RequestNotAllowedComponent(props) {
    const localeObj = localeService.getActionLocale();
    let names = "";
    if (GeneralUtilities.emptyValueCheck(props.componentName)) {
        names = "REQUEST NOT ALLOWED PAGE";
    } else {
        names = props.componentName;
    }

    useEffect(() => {
        document.addEventListener("visibilitychange", visibilityChange);
        MetricsService.onPageTransitionStart(names);
    }, []);

    const visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(names, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(names);
        }
    }

    const onButtonPress = () => {
        MetricsService.onPageTransitionStop(names, PageState.close);
        props.onClick();
    }

    return (
        <FlexView column>
            <div style={{display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"}}>
                <span>
                    <img style={{ width: '16rem', marginTop: "1rem" }} src={error} alt="" />
                </span>
            </div>
            <div className="headline5 highEmphasis" style={{ margin: "0 2rem", textAlign: "center" }} >
                {localeObj.no_new_elo_header}
            </div>
            <div className="body2 highEmphasis" style={{ margin: "1rem 2rem", textAlign: "center", wordWrap: "break-word" }}>
                {localeObj.no_new_elo_description}
            </div>
            <div className="body2 highEmphasis" style={{ margin: "0 4rem", textAlign: "left" }} >
                <div>{localeObj.no_new_elo_desc1}</div>
                <div>{localeObj.no_new_elo_desc2}</div>
                <div>{localeObj.no_new_elo_desc3}</div>
            </div>
            <div className="body2 highEmphasis" style={{ margin: "1rem 2rem", textAlign: "center", wordWrap: "break-word" }}>
                {localeObj.request_new_visa}
            </div>
            <div  style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                <PrimaryButtonComponent btn_text={localeObj.get_dimo_visa_card} onCheck={() => onButtonPress()} />
            </div>
        </FlexView>
    )
}

RequestNotAllowedComponent.propTypes = {
    componentName: PropTypes.string.isRequired, // Assuming componentName is required and of type string
    onClick: PropTypes.func.isRequired // Assuming onClick is required and of type function
  };