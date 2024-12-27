import React, { useEffect } from 'react';
import FlexView from 'react-flexview';
import PropTypes from "prop-types";
import '../../styles/main.css';
import '../../styles/new_pix_style.css';
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import PageState from "../../Services/PageState";
import MetricsService from '../../Services/MetricsService';
import { makeStyles } from '@material-ui/core/styles';

import localeService from "../../Services/localeListService";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import GeneralUtilities from '../../Services/GeneralUtilities';
import error from "../../images/SpotIllustrations/Alert.png";
import warning from "../../images/SpotIllustrations/Warning.png";
import gpaySuccess from "../../images/SpotIllustrations/Phone copy.png";
import timerImage from "../../images/SpotIllustrations/Timer.png";
import ButtonAppBar from '../CommonUxComponents/ButtonAppBarComponent';
import InputThemes from '../../Themes/inputThemes';
import ColorPicker from "../../Services/ColorPicker";
import SecondaryButtonComponent from '../CommonUxComponents/SecondaryButtonComponent';
import constantObjects from '../../Services/Constants';
import androidApiCallsService from '../../Services/androidApiCallsService';
import { Drawer } from '@material-ui/core';
import PageNames from '../../Services/PageNames';


const PageNameJSON = PageNames.GiftCardComponents;
var localeObj = {};

const useStyles = makeStyles({
    list: {
      color: ColorPicker.highEmphasis,
      backgroundColor: ColorPicker.surface3,
      borderRadius: "0.625rem",
      fontSize: "0.8rem",
      padding: "0.188rem",
      fontWeight: "300",
      lineHeight: "1.25rem",
      width: "25%",
      boxShadow: "none",
      textAlign: 'center',
      textTransform: 'none',
      size: 'small',
      '&:hover': {
        backgroundColor: "",
      },
      '&:disabled': {
        backgroundColor: ColorPicker.surface2,
      },
    },
    headingStyle: {
      textAlign: 'center',
      marginTop: "4%"
    },
    fullList: {
      width: 'auto',
    },
    paper: {
      borderTopLeftRadius: "1rem",
      borderTopRightRadius: "1rem",
      backgroundColor: ColorPicker.surface3
    }
  });

export default function GiftCardErrorComp(props) {
    let names ="";
    const classes = useStyles();
    if (Object.keys(localeObj).length === 0) {
        localeObj = localeService.getActionLocale();
    }
    if(GeneralUtilities.emptyValueCheck(props.componentName)){
        if (props.errorJson?.gpaySuccess)
          names = PageNameJSON['success'];
        else
          names = PageNameJSON['error'];
    } else {
        names = props.componentName;
    }

    useEffect(() => {
        MetricsService.onPageTransitionStart(names);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
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
        props.onBack();
    }

    const onClose = () => {
      MetricsService.onPageTransitionStop(names, PageState.close);
      props.close();
    }

    const onButtonPress = ()=> {
        MetricsService.onPageTransitionStop(names, PageState.close);
        if(props.errorJson?.gcCreationInProgress === "gcCreationInProgress"){
          props.onClick(props.errorJson.gcCreationInProgress);  
        } else{
          props.onClick(props.errorJson.btnText);
        }
  
    }
    const closeBottomSheet = ()=> {
      props.setCustomerCareBottomSheet(false);
    }
    const openBottomSheet = ()=> {
      props.setCustomerCareBottomSheet(true);
    }

    const handleDialer = (phNum) => () => {
        androidApiCallsService.startDialer(phNum);
    }

    const handleOpenWhatApp = () => {
        androidApiCallsService.openUrlInBrowserLegacy("https://api.whatsapp.com/send?phone=" + constantObjects.customerCareWADialer);
    }

    document.addEventListener("visibilitychange", visibilityChange);

    const finalWidth = window.screen.width;
    return (
        <FlexView column>
            <ButtonAppBar header="" onCancel={()=>onCancelPress()} action="cancel" inverse="true" />
            <div style = {{textAlign: "center"}}>
                <span>
                    <img style={{ width: `${finalWidth * 0.7}px`, marginTop:"3.5rem" }} src={props.errorJson?.warning? warning: props.errorJson?.gpaySuccess? gpaySuccess: props.errorJson?.timer ? timerImage : error} alt="" />
                </span>
            </div>
            <div className="headline5 highEmphasis" style={{ margin: "0 2rem", textAlign: "center" }} >
                {props.errorJson.header}
            </div>
            <div className="body2 highEmphasis" style={{ margin: "1rem 2rem", textAlign: "center", wordWrap: "break-word" }}>
                {props.errorJson.description}
            </div>
            {props.errorJson.caption && <div className="body2 highEmphasis" style={{ display:'block', margin: "0 2rem", textAlign: "center", }}>
                {props.errorJson.caption}
            </div>}
            {props.errorJson.desc && <div className="body2 highEmphasis" style={{ display:'block', margin: "1rem 2rem", textAlign: "center" }}>
                {props.errorJson.desc}
            </div>}

            {props.errorJson.validationErrors && props.errorJson.validationErrors.map((item) => (
                <div key={item} className="body2 highEmphasis" style={{ display:'block', marginLeft: "1rem", marginRight:"1rem", textAlign: "center" }}>
                {item.message}
            </div>
            ))}
            <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
            <Drawer
            anchor="bottom"
            open={props.customerCareBottomSheet}
            onClose={closeBottomSheet}
            classes={{ paper: classes.paper }}>
            <div style={{ margin: "1.5rem" }}>
              <FlexView column style={{ textAlign: "center", marginTop: "0.5rem" }}>
                <div className="headline6 highEmphasis">
                  {localeObj.help_customer_care}
                </div>
                <div className="body2 highEmphasis" style={{ marginTop: "1rem" }}>
                  {localeObj.help_contact_cc}
                </div>
                <div className="body2 mediumEmphasis" style={{ marginTop: "1rem", color: ColorPicker.textDisabledColor }}>
                  {localeObj.cc_timings}
                </div>
                <div onClick={handleOpenWhatApp}>
                  <div className="subtitle4" style={{ marginTop: "2.5rem", color: ColorPicker.customerCarelinkColor }}>
                    {localeObj.cc_whatsapp}
                  </div>
                  <div className="body2" style={{ marginTop: "0.5rem", color: ColorPicker.numberDisabledColor }}>
                    {constantObjects.customerCareWADisplay}
                  </div>
                </div>
                <div onClick={handleDialer(constantObjects.customerCarePhoneNumberDialer)}>
                  <div className="subtitle4" style={{ marginTop: "2rem", color: ColorPicker.customerCarelinkColor }}>
                    {localeObj.cc_call_us}
                  </div>
                  <div className="body2" style={{ marginTop: "0.5rem", color: ColorPicker.numberDisabledColor }}>
                    {constantObjects.customerCarePhoneNumberDisplay}
                  </div>
                </div>
                <div className="body2 highEmphasis" style={{ marginTop: "4rem" }} onClick={closeBottomSheet}>
                  {localeObj.cancel}
                </div>
              </FlexView>
            </div>
            </Drawer>
           </div>
            <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                <PrimaryButtonComponent btn_text={props.errorJson.btnText? props.errorJson.btnText: localeObj.back_home} onCheck={onButtonPress} />
                {props.errorJson.secBtnText && <SecondaryButtonComponent btn_text={props.errorJson.secBtnText} onCheck={onClose} />}
                {props.errorJson.action &&
                <div className="Body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={()=>openBottomSheet()}>
                  {props.errorJson.action}
                </div>}
            </div>
        </FlexView>
    )
}
GiftCardErrorComp.propTypes = {
  errorJson : PropTypes.object,
  componentName: PropTypes.string,
  onBack: PropTypes.func,
  close: PropTypes.func,
  onClick: PropTypes.func,
  setCustomerCareBottomSheet: PropTypes.func,
  customerCareBottomSheet: PropTypes.bool
};
