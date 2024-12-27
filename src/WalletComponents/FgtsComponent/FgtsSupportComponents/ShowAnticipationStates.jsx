import FlexView from 'react-flexview';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../../styles/main.css';
import "../../../styles/colorSelect.css";
import '../../../styles/new_pix_style.css';
import "../../../styles/genericFontStyles.css";

import ShareIcon from '@material-ui/icons/Share';
import GetAppIcon from '@material-ui/icons/GetApp';

import PageState from "../../../Services/PageState";
import ColorPicker from '../../../Services/ColorPicker';
import MetricsService from '../../../Services/MetricsService';
import localeService from "../../../Services/localeListService";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import androidApiCalls from "../../../Services/androidApiCallsService";

import AndroidActionButton from "../../CommonUxComponents/AndroidActionButton";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from '../../CommonUxComponents/SecondaryButtonComponent';

import InputThemes from '../../../Themes/inputThemes';
import error from "../../../images/SpotIllustrations/Alert.png";
import success from "../../../images/SpotIllustrations/Checkmark.png";

export default function ShowAnticipationStates(props) {
    const localeObj = localeService.getActionLocale();
    const finalWidth = window.screen.width;
    const finalHeight = window.screen.height;
    let names = "";
    
    if (GeneralUtilities.emptyValueCheck(props.componentName)) {
        names = "ERROR PAGE";
    } else {
        names = props.componentName;
    }

    useEffect(() => {
        MetricsService.onPageTransitionStart(names);
        document.addEventListener("visibilitychange", visibilityChange);
    }, []);

    const visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(names, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(names);
        }
    }

    const onButtonPress = (type) => {
        MetricsService.onPageTransitionStop(names, PageState.close);
        props.onClick(type);
    }

    const handleDownloadandShare = (type) => {
        props.shareOrDownload(type);
    }

    const getTopMargin = () => {
        let dm = androidApiCalls.checkDisplaySize();
        switch (dm) {
            case "EXTRA_LARGE_SCREEN":
            case "NEXT_LARGE_SCREEN":
            case "LARGE_SCREEN":
                return "0.5rem";
            case "NORMAL_SCREEN":
            case "SMALL_SCREEN":
                return "1.5rem";
            default: return "1.5rem";
        }
    }

    return (
        <FlexView column>
            <div className='scroll' style={{ height: `${finalHeight * 0.7}px` }}>
                <div style={{textAlign: "center"}}>
                    <span>
                        <img style={{ width: `${finalWidth * 0.7}px` }} src={props.alert.type === "Alert" ? error : success} alt="" />
                    </span>
                </div>
                <div className="body2 highEmphasis" style={{ margin: "0 2rem", textAlign: "center" }} >
                    {props.alert.mainHeader}
                </div>
                <div className="headline2 highEmphasis" style={{ margin: "1rem 2rem", textAlign: "center" }} >
                    {props.alert.value}
                </div>
                <div className="body2 highEmphasis" style={{ margin: "0.5rem 2rem", textAlign: "center", wordWrap: "break-word" }}>
                    {props.alert.subHeader}
                </div>
                <div className="body2 highEmphasis" style={{ marginTop: getTopMargin() }}>
                    {props.alert.type !== "Alert" &&
                        <FlexView style={{ justifyContent: "space-around", width: "90%", margin: "1.5rem 5%" }}>
                            <AndroidActionButton
                                btn_text={localeObj.share}
                                onCheck={() => handleDownloadandShare("Share")}
                                icon={<ShareIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />} />
                            <AndroidActionButton
                                btn_text={localeObj.download}
                                onCheck={() => handleDownloadandShare("Download")}
                                icon={<GetAppIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />} />
                        </FlexView>
                    }
                </div>
                <div className="body2 highEmphasis" style={{ marginTop: getTopMargin(), textAlign: "center", wordWrap: "break-word" }}>
                    {props.alert.footer}
                </div>
            </div>
            <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                <PrimaryButtonComponent btn_text={props.alert.button1} onCheck={() => onButtonPress("anticipate")} />
                {props.alert.type === "Alert" &&
                    <SecondaryButtonComponent btn_text={props.alert.button2} onCheck={() => onButtonPress("cancel")} />
                }
            </div>
        </FlexView>
    )
}

ShowAnticipationStates.propTypes = {
    componentName: PropTypes.string,
    alert: PropTypes.shape({
      type: PropTypes.oneOf(['Alert', 'Success']),
      mainHeader: PropTypes.string,
      value: PropTypes.string,
      subHeader: PropTypes.string,
      footer: PropTypes.string,
      button1: PropTypes.string,
      button2: PropTypes.string,
    }),
    onClick: PropTypes.func,
    shareOrDownload: PropTypes.func,
  };