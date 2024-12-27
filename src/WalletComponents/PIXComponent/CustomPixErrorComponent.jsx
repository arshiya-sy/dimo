import React, { useEffect } from 'react';
import FlexView from 'react-flexview';
import '../../styles/main.css';
import '../../styles/new_pix_style.css';
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import PageState from "../../Services/PageState";
import MetricsService from '../../Services/MetricsService';

import localeService from "../../Services/localeListService";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from '../CommonUxComponents/SecondaryButtonComponent';
import GeneralUtilities from '../../Services/GeneralUtilities';
import customError from "../../images/SpotIllustrations/Timer.png";
import ButtonAppBar from '../CommonUxComponents/ButtonAppBarComponent';
import InputThemes from '../../Themes/inputThemes';


var localeObj = {};

export default function CustomPixErrorComponent(props) {
    let names = "";
    if (GeneralUtilities.emptyValueCheck(props.componentName)) {
        names = "CUSTOM PIX ERROR PAGE";
    } else {
        names = props.componentName;
    }

    useEffect(() => {
        MetricsService.onPageTransitionStart(names);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }, [names]);

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

    const showHistory = () => {
        props.showHistory();
    }

    const finalWidth = window.screen.width;

    return (
        <FlexView column>
            <ButtonAppBar header="" onBack={() => onCancelPress()} action="none"  />
            <div align="center">
                <span>
                    <img style={{ width: `${finalWidth * 0.7}px`, marginTop:"3.5rem" }} src={customError} alt="" />
                </span>
            </div>
            <div className="headline5 highEmphasis" style={{ margin: "0 2rem", textAlign: "center" }} >
                {props.errorJson.header}
            </div>
            <div className="body2 highEmphasis" style={{ margin: "1rem 2.5rem", textAlign: "center", wordWrap: "break-word" }}>
                {localeObj.pix_transaction_pending_desc1}
            </div>
            <div className="body2 highEmphasis" style={{ margin: "1rem 4.5rem", textAlign: "center", wordWrap: "break-word" }}>
                {localeObj.pix_transaction_pending_desc2}
            </div>

            <div align="center" style={InputThemes.bottomButtonStyle}>
                <PrimaryButtonComponent btn_text={localeObj.back_home} onCheck={() => onButtonPress()} />
                <SecondaryButtonComponent btn_text={localeObj.see_transactions} onCheck={() => showHistory()} />
            </div>
        </FlexView>
    )
}
