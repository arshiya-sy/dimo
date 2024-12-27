import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import constantObjects from "../../Services/Constants";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import ArbiApiMetrics from "../../Services/ArbiApiMetrics";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import ColorPicker from "../../Services/ColorPicker";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import Log from "../../Services/Log";

import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import ButtonAppBar from "./ButtonAppBarComponent";
import PrimaryButtonComponent from "./PrimaryButtonComponent";
import SecondaryButtonComponent from "./SecondaryButtonComponent";
import { Button } from "@material-ui/core";
import layout from "../../images/SpotIllustrations/Physical card.png"
import elo from "../../images/SpotIllustrations/EloPhysical.png";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

const styles = InputThemes.singleInputStyle;
const ADD_CARD_TO_GPAY = "ADD_CARD_TO_GPAY";
const REMOVE_CARD_FROM_GPAY = "REMOVE_CARD_FROM_GPAY";
const SET_CARD_AS_DEFAULT_GPAY = "SET_CARD_AS_DEFAULT_GPAY";
const EXCEPTION_IN_GPAY_INTEGRATION = "EXCEPTION_IN_GPAY_INTEGRATION";
var localeObj = {};

class GooglePayComponent extends React.Component {
  constructor(props) {
    super(props);
    localeObj = {};
    this.state = {
      displayStatus: false,
      open: false,
    };
    this.style = {
      textStyle: {
        margin: "0 2rem",
        textAlign: "center"
      },
      subTextStyle: {
        margin: "1rem 3rem",
        textAlign: "center"
      },

    }
    this.next = this.next.bind(this);

    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
    MetricServices.onPageTransitionStart(this.props.type);
  }

  componentDidMount() {
    androidApiCalls.enablePullToRefresh(false);
    document.addEventListener("visibilitychange", this.visibilityChange);

    window.addCardToGPayResponse = response => {
      //Log.sDebug("addCardToGPayResponse" + response);
      let success = (response.toString() === "-1");
      //Log.sDebug("addCardToGPayResponse, success" + success);
      this.sendGpayMetrics(ADD_CARD_TO_GPAY, "tapAndPayClient.pushTokenize", response, success);
      this.props.handleGPayResponse(response);
    };

    window.handleDeleteTokenResponse = response => {
      //Log.sDebug("handleDeleteTokenResponse" + response, this.props.type);
      let success = (response.toString() === "0");
      this.sendGpayMetrics(REMOVE_CARD_FROM_GPAY, "tapAndPayClient.requestDeleteToken", response, success);
    };

    window.handleSelectTokenResponse = response => {
      //Log.sDebug("handleSelectTokenResponse" + response, this.props.type);
      let success = (response.toString() === "-1");
      //Log.sDebug("handleSelectTokenResponse, success" + success);
      this.sendGpayMetrics(SET_CARD_AS_DEFAULT_GPAY, "tapAndPayClient.requestSelectToken", response, success);
    };

    window.handleSetGPayAsDefaultTAPResponse = response => {
      Log.sDebug("handleSetGPayAsDefaultTAPResponse" + response);

    };

    window.listTokens = (response) => {
      Log.sDebug("listTokens response: " + response);
    }

    window.handleExceptionInGPayIntegration = (response) => {
      //Log.sDebug("handleExceptionInGPayIntegration response: " + response);
      this.sendGpayMetrics(EXCEPTION_IN_GPAY_INTEGRATION, EXCEPTION_IN_GPAY_INTEGRATION, response, false);
    }

    window.gPayDataChangedListener = () => {
      //Log.sDebug("gPayDataChangedListener");
      this.props.gPayDataChangedListener();
    }

    window.onBackPressed = () => {
      this.props.onCancel();
  }

  }

  sendGpayMetrics = (uri, apiName, response, success) => {
    let data = {};
    data["chaveDeCartao"] = this.props.cardKey;
    data["cardNetwork"] = this.props.details.brand;
    data["cardType"] = this.props.cardType;
    data["cardStatus"] = this.props.details.status;
    data["idStatusCartao"] = this.props.details.idStatusCartao;
    data["response"] = response;
    data["chaveDeConta"] = ImportantDetails.accountKey ? ImportantDetails.accountKey : undefined;
    data["chaveDeCliente"] = ImportantDetails.clientKey ? ImportantDetails.clientKey : undefined;
    data["isGpayInstalled"] = androidApiCalls.isPackageAvailable("com.google.android.apps.walletnfcrel");
    data["isGpayDefaultNFC"] = androidApiCalls.isGPayDefaultTAPApplication();
    ArbiApiMetrics.sendGpayAlertMetrics(uri, apiName, success, success ? 201 : 500, data, 0, this.props.gpayEntryPoint);
  }

  visibilityChange = () => {
    let visibilityState = document.visibilityState;
    if (visibilityState === "hidden") {
      MetricServices.onPageTransitionStop(this.props.type, PageState.recent);
    } else if (visibilityState === "visible") {
      MetricServices.onPageTransitionStart(this.props.type);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("visibilitychange", this.visibilityChange);
  }

  next = () => {
    MetricServices.onPageTransitionStop(this.props.type, PageState.close);
    this.props.next();
  }

  onCancel = () => {
    if (!this.props.btnText || this.props.footer
      || this.props.noBottomSheet || this.props.noAction) {
      this.props.onCancel();
    } else {
      this.setState({ open: true })
    }
  }

  onSecondary = () => {
    MetricServices.onPageTransitionStop(this.props.type, PageState.cancel);
    this.props.onCancel();
    this.setState({ open: false })
  }

  onPrimary = () => {
    this.setState({ open: false })
  }

  handleDialer = (phNum) => () => {
    androidApiCalls.startDialer(phNum);
  }

  setBottomSheet = () => {
    this.props.handleBottomSheet(false);
  }

  handleOpenWhatApp = () => {
    androidApiCalls.openUrlInBrowserLegacy("https://api.whatsapp.com/send?phone=" + constantObjects.customerCareWADialer);
  }

  render() {
    const { classes } = this.props;
    const finalHeight = window.screen.height;
    const finalWidth = window.screen.width;
    return (
      <div>
        {this.props.appBar &&
          <ButtonAppBar header="" onCancel={this.onCancel} action="cancel" inverse="true" />}
        <div className="scroll" style={{ height: this.props.secBtnText ? `${finalHeight * 0.7}px` : `${finalHeight * 0.75}px`, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"}} >
            <div>
              <img style={{ marginTop: "2.5rem", height: "1.4rem" }} alt="gpay" src={this.props.googleIcon} />
            </div>
          </div>

          <div style={this.style.subTextStyle}>
            <span className="body2 highEmphasis">
              {this.props.gpayDesc}
            </span>
          </div>

          {!this.props.gpayBtn && <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"}}>
            <span>
              <img style={{ width: `${finalWidth * 0.7}px`, marginTop: "2.5rem" }} src={this.props.icon} alt="" />
            </span>
          </div>}
          {this.props.gpayBtn && this.props.cardType && this.props.cardType === "virtual" &&
            <div style={{ position: 'relative', margin: "1.5rem", marginBottom: "0", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
              <img style={{ width: `${finalWidth * 0.7}px`, marginTop: "1.5rem" }} src={this.props.gpayIcon} alt=""></img>
              <div style={{ position: 'absolute', top: "80%", left: "20%", bottom: 0, width: "14rem" }}>
                <span style={{textAlign: "left"}} className="subtitle4 highEmphasis">{this.props.details.number}</span>
              </div>
            </div>}
          {this.props.cardType && this.props.cardType === "physical" &&
            <div style={{ position: 'relative', margin: "1.5rem", marginBottom: "0", textAlign: "center" }}>
              <img style={{ width: "10rem" }} src={this.props.details.brand === "VISA" ? layout : elo} alt=""></img>
            </div>}
          <div style={this.style.textStyle}>
            <span className="headline5 highEmphasis">
              {this.props.header}
            </span>
          </div>
          <div style={this.style.textStyle}>
            <span className="headline5 highEmphasis">
              {this.props.subHeader}
            </span>
          </div>
          <div style={this.style.subTextStyle}>
            <span className="body2 highEmphasis">
              {this.props.description}
            </span>
          </div>
          {this.props.card &&
            <div style={this.style.subTextStyle}>
              <span className="body2 highEmphasis">
                {this.props.charge}
              </span>
            </div>}
          {this.props.card && !this.props.gpayOnboarding &&
            <div style={this.style.subTextStyle}>
              <span className="subtitle4 highEmphasis">
                {this.props.virtualCard}
              </span>
            </div>
          }
          <div style={this.style.subTextStyle}>
            <span className="body2 highEmphasis">
              {this.props.gpayDesc2}
            </span>
          </div>
          <div style={this.style.subTextStyle}>
            <span className="body2 highEmphasis">
              {this.props.gpayDesc3}
            </span>
          </div>
          {!this.props.isCardAddedToGpay && !this.props.gpayOnboarding &&
            <div style={this.style.textStyle}>
              <span className="caption highEmphasis">
                {this.props.gpayDesc4}
              </span>
            </div>}
          {this.props.isCardAddedToGpay &&
            <div style={this.style.subTextStyle}>
              <span className="subtitle4 highEmphasis">
                {this.props.addedToGpay}
              </span>
            </div>
          }
          {this.props.btnText &&
            <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
              <PrimaryButtonComponent btn_text={this.props.btnText} onCheck={this.next} />
              {this.props.secBtnText && <SecondaryButtonComponent btn_text={this.props.secBtnText} onCheck={this.props.close} />}
              {this.props.footer &&
                <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={this.props.onCancel}>
                  {this.props.footer}
                </div>}
              {this.props.action &&
                <div className="Body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={this.props.onAction}>
                  {this.props.action}
                </div>}
            </div>
          }

          <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
            {this.props.isCardAddedToGpay && !this.props.isCardDefaultCardInGPay && <PrimaryButtonComponent btn_text={this.props.setAsDefaultBtnTxt} icon={<img style={{ width: "28px", height: "28px" }} src={this.props.setAsDefaultIcon} alt=""/>} onCheck={this.props.onAction} />}
            {this.props.isCardAddedToGpay && <SecondaryButtonComponent btn_text={this.props.gpayBtnText} onCheck={this.next} />}
          </div>

          <div style={{...InputThemes.gpayButtonStyle, textAlign: "center"}}>
            {this.props.gpayBtn && !this.props.isCardAddedToGpay && <Button onClick={this.next} >
              <img style={{ width: `${finalWidth * 0.7}px` }} alt="gpay" src={this.props.addToGpayIcon} />
            </Button>}
          </div>
        </div>
        <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
          <Drawer classes={{ paper: classes.paper }}
            anchor="bottom"
            open={this.state.open}>
            <div style={{ margin: "1.5rem" }}>
              <FlexView column style={{ marginTop: "0.5rem" }}>
                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                  {localeObj.cancel_message_header}
                </div>
                <div className="body2 mediumEmphasis" style={{ display: this.props.bottomSheetDesc === undefined ? "block" : "none", textAlign: "center", marginTop: "1rem" }}>
                  {localeObj.cancel_message_description}
                </div>
              </FlexView>
            </div>
            <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
              <PrimaryButtonComponent btn_text={localeObj.resume} onCheck={this.onPrimary} />
              <SecondaryButtonComponent btn_text={localeObj.stop} onCheck={this.onSecondary} />
            </div>
          </Drawer>
        </div>
        <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
          <Drawer
            anchor="bottom"
            open={this.props.bottomSheet}
            onClose={this.setBottomSheet}
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
                <div onClick={this.handleOpenWhatApp}>
                  <div className="subtitle4" style={{ marginTop: "2.5rem", color: ColorPicker.customerCarelinkColor }}>
                    {localeObj.cc_whatsapp}
                  </div>
                  <div className="body2" style={{ marginTop: "0.5rem", color: ColorPicker.numberDisabledColor }}>
                    {constantObjects.customerCareWADisplay}
                  </div>
                </div>
                <div onClick={this.handleDialer(constantObjects.customerCarePhoneNumberDialer)}>
                  <div className="subtitle4" style={{ marginTop: "2rem", color: ColorPicker.customerCarelinkColor }}>
                    {localeObj.cc_call_us}
                  </div>
                  <div className="body2" style={{ marginTop: "0.5rem", color: ColorPicker.numberDisabledColor }}>
                    {constantObjects.customerCarePhoneNumberDisplay}
                  </div>
                </div>
                <div className="body2 highEmphasis" style={{ marginTop: "4rem" }} onClick={this.setBottomSheet}>
                  {localeObj.cancel}
                </div>
              </FlexView>
            </div>
          </Drawer>
        </div>
      </div>
    );
  }
}

GooglePayComponent.propTypes = {
  classes: PropTypes.object,
  type: PropTypes.string,
  handleGPayResponse: PropTypes.func,
  gPayDataChangedListener: PropTypes.func,
  onCancel: PropTypes.func,
  next: PropTypes.func,
  appBar: PropTypes.bool,
  btnText: PropTypes.string,
  secBtnText: PropTypes.string,
  footer: PropTypes.string,
  action: PropTypes.string,
  onAction: PropTypes.func,
  cardKey: PropTypes.string,
  cardType: PropTypes.string,
  details: PropTypes.object,
  googleIcon: PropTypes.string,
  gpayDesc: PropTypes.string,
  icon: PropTypes.string,
  gpayIcon: PropTypes.string,
  gpayOnboarding: PropTypes.bool,
  charge: PropTypes.string,
  virtualCard: PropTypes.string,
  gpayDesc2: PropTypes.string,
  gpayDesc3: PropTypes.string,
  gpayDesc4: PropTypes.string,
  isCardAddedToGpay: PropTypes.bool,
  addedToGpay: PropTypes.string,
  setAsDefaultBtnTxt: PropTypes.string,
  setAsDefaultIcon: PropTypes.string,
  gpayBtn: PropTypes.bool,
  addToGpayIcon: PropTypes.string,
  bottomSheet: PropTypes.bool,
  bottomSheetDesc: PropTypes.string,
  gpayEntryPoint: PropTypes.string,
  noBottomSheet: PropTypes.bool,
  noAction: PropTypes.bool,
  handleBottomSheet: PropTypes.func,
  header: PropTypes.string,
  description: PropTypes.string,
  subHeader: PropTypes.string,
  card: PropTypes.string,
  close: PropTypes.bool,
  isCardDefaultCardInGPay: PropTypes.bool,
  gpayBtnText: PropTypes.string
};

export default withStyles(styles)(GooglePayComponent);
