import React, { useEffect } from 'react';
import FlexView from 'react-flexview';
import PropTypes from 'prop-types';
import '../../../styles/main.css';
import '../../../styles/new_pix_style.css';
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import PageState from "../../../Services/PageState";
import MetricsService from '../../../Services/MetricsService';

import localeService from "../../../Services/localeListService";
import PrimaryButtonComponent from '../../CommonUxComponents/PrimaryButtonComponent';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import error from "../../../images/SpotIllustrations/Warning.png";
import ButtonAppBar from '../../CommonUxComponents/ButtonAppBarComponent';
import InputThemes from '../../../Themes/inputThemes';
import PageNames from '../../../Services/PageNames';

var localeObj = {};
const PageNameJSON = PageNames.CreditCardInvestmentComponents;
export default function RedeemConfirmationComp(props) {
    let names ="";
    if (Object.keys(localeObj).length === 0) {
        localeObj = localeService.getActionLocale();
    }
    if(GeneralUtilities.emptyValueCheck(props.componentName)){
        names = PageNameJSON['redeem']
    } else {
        names = props.componentName;
    }

    useEffect(() => {
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

    const onCancelPress = () => {
        MetricsService.onPageTransitionStop(names, PageState.cancel);
        props.onCancel();
    }

    const onButtonPress = ()=> {
        MetricsService.onPageTransitionStop(names, PageState.close);
        props.onClick();
    }

    document.addEventListener("visibilitychange", visibilityChange);

    const finalWidth = window.screen.width;

    return (
        <FlexView column>
            <ButtonAppBar header="" onCancel={()=>onCancelPress()} action="cancel" inverse="true" />
            <div style={{display: "flex", justifyContent: "center"}}>
                <span>
                    <img style={{ width: `${finalWidth * 0.7}px`, marginTop:"3.5rem" }} src={error} alt="" />
                </span>
            </div>
            <div className="headline5 highEmphasis" style={{ margin: "0 2rem", textAlign: "center" }} >
                {props.errorJson.header}
            </div>
            <div className="body2 highEmphasis" style={{ margin: "1rem 2rem", textAlign: "center", wordWrap: "break-word" }}>
                {props.errorJson.description}
            </div>
            <div className="body2 highEmphasis" style={{ display: (props.caption === "allow" ? 'block' : 'none'), margin: "1rem 2rem", textAlign: "center", wordWrap: "break-word" }}>
                {props.errorJson.caption}
            </div>
            <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                <PrimaryButtonComponent btn_text={props.btnText? props.btnText: localeObj.back_home} onCheck={()=>onButtonPress()} />
            </div>
        </FlexView>
    )
}

RedeemConfirmationComp.propTypes = {
    componentName: PropTypes.string,
    onCancel: PropTypes.func,
    onClick: PropTypes.func,
    errorJson: PropTypes.shape({
        header: PropTypes.string,
        description: PropTypes.string,
        caption: PropTypes.string
    }),
    caption: PropTypes.string,
    btnText: PropTypes.string
};