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
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "..//CommonUxComponents/SecondaryButtonComponent";
import { Button } from "@material-ui/core";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

const styles = InputThemes.singleInputStyle;
var localeObj = {};

class GiftCardGooglePayComp extends React.Component {
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
      pointsStyle: {
        verticalAlign: "middle",
        color: "#F2A375",
        marginLeft: "1rem",
        marginTop: "2rem",
        listStyle: "none",
        position: "relative"
      }
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

    window.onBackPressed = () => {
      this.onBack();
     
    }

    window.addCardToGPayResponse = response => {
      Log.sDebug("addCardToGPayResponse" + response);
      let success = (response === "-1");
      Log.sDebug("addCardToGPayResponse, success" + success);
      //this.sendGpayMetrics(ADD_CARD_TO_GPAY, "tapAndPayClient.pushTokenize", response, success);
      this.props.handleGPayResponse(response);
    };

    window.handleExceptionInGPayIntegration = (response) => {
      Log.sDebug("handleExceptionInGPayIntegration response: " + response);
      //this.sendGpayMetrics(EXCEPTION_IN_GPAY_INTEGRATION, EXCEPTION_IN_GPAY_INTEGRATION, response, false);
    }

    window.gPayDataChangedListener = () => {
      Log.sDebug("gPayDataChangedListener");
      this.props.gPayDataChangedListener();
    }

  }

  onBack = () => {
    if(this.state.open) {
      this.setState({
        open: false
      });
    } else {
      this.setState({
        open: true
      });
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
    this.sendGiftCardMetrics("GIFT_CARD_GPAY_BUTTON_ONCLICK", "GIFT CARD ADD CARD TO GPAY ONCLICK");
    this.props.next();
    
  }

  sendGiftCardMetrics = (uri, apiName) => {
    let data = {};
    data["gc_chaveDeCliente"] = this.props.gcClientKey;
    data["gc_chaveDeConta"] = this.props.gcAccountKey;
    data["gc_chaveDeCartao"] = this.props.cardKey;
              
    ArbiApiMetrics.sendGiftCardAlertMetrics(uri, apiName, true, 201, data, 0);
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
    this.setState({ open: false });
    this.props.goToMotoPayLandingPage();
  }

  onPrimary = () => {
    this.setState({ open: false });
    this.next();
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
          <div style = {{textAlign : "center"}} >
            <div>
              <img style={{ marginTop: "2.5rem", height: "1.4rem" }} src={this.props.googleIcon} alt=""/>
            </div>
          </div>

          <div style={this.style.subTextStyle}>
            <span className="body2 highEmphasis">
              {this.props.gpayDesc + this.props.amount}
            </span>
          </div>

          {!this.props.gpayBtn && <div style={{ marginBottom: "0.5rem", textAlign: "center" }}>
            <span>
              <img style={{ width: `${finalWidth * 0.7}px`, marginTop: "2.5rem" }} src={this.props.icon} alt="" />
            </span>
          </div>}
          {this.props.gpayBtn &&
            <div style={{ position: 'relative', margin: "1.5rem", marginBottom: "0" , textAlign: "center"  }}>
              <img style={{ width: `${finalWidth * 0.7}px`, marginTop: "1.5rem" }} src={this.props.gpayIcon} alt=""></img>
              <div style={{ position: 'absolute', top: "80%", left: "20%", bottom: 0, width: "14rem", textAlign: "left"  }}>
                <span className="subtitle4 highEmphasis">{localeObj.gift_card_gpay_image_text}</span>
              </div>
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
          {this.props.card &&
            <div style={this.style.subTextStyle}>
              <span className="subtitle4 highEmphasis">
                {this.props.virtualCard}
              </span>
            </div>
          }
          <ol className="headline6" style={this.style.pointsStyle}>
            <li style={{ marginRight: "2rem", position: "relative", listStyle: "none", paddingLeft: "2rem" }}>
            <span style={{position: "absolute", left: "0", fontWeight: "bold"}}>01.</span>
              <div className="liFirstDiv">
                <div className="liSecondDiv">
                  <div className="body2 highEmphasis" style={{marginLeft: "1rem" }}>{this.props.gpayDesc2}</div>
                </div>
              </div>
            </li>
            <li style={{ marginRight: "2rem", marginTop:"1rem", position: "relative", listStyle: "none", paddingLeft: "2rem" }}>
            <span style={{position: "absolute", left: "0", fontWeight: "bold"}}>02.</span>
              <div className="liFirstDiv">
                <div className="liSecondDiv">
                  <div className="body2 highEmphasis" style={{marginLeft: "1rem" }}>{this.props.cardActive}</div>
                </div>
              </div>
            </li>
          </ol>

          <div style={this.style.subTextStyle}>
            <span className="body2 highEmphasis">
              {this.props.gpayDesc3}
            </span>
          </div>
          {!this.props.isCardAddedToGpay &&
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

          <div style={{textAlign: "center"}} >
            {this.props.gpayBtn && !this.props.isCardAddedToGpay && <Button onClick={this.next} >
              <img style={{ width: `${finalWidth * 0.7}px` }} src={this.props.addToGpayIcon} alt=""/>
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
                  {localeObj.gift_card_dimo}
                </div>
                <div className="body2 mediumEmphasis" style={{ display: this.props.bottomSheetDesc === undefined ? "block" : "none", textAlign: "center", marginTop: "1rem" }}>
                  {localeObj.gift_card_bs_gpay_desc}
                </div>
              </FlexView>
            </div>
            <div style={{ width: "100%", marginBottom: "1.5rem" , textAlign : "center"}}>
              <PrimaryButtonComponent btn_text={localeObj.gift_card_bs_gpay_primary} onCheck={this.onPrimary} />
              <SecondaryButtonComponent btn_text={localeObj.gift_card_bs_gpay_secondary} onCheck={this.onSecondary} />
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

GiftCardGooglePayComp.propTypes = {
  classes: PropTypes.object.isRequired,
  handleGPayResponse: PropTypes.func,
  gPayDataChangedListener: PropTypes.func,
  details : PropTypes.object,
  cardType : PropTypes.string,
  cardKey: PropTypes.string,
  type: PropTypes.string,
  next: PropTypes.func,
  gcClientKey: PropTypes.string,
  gcAccountKey: PropTypes.string,
  btnText: PropTypes.string,
  footer: PropTypes.string,
  noBottomSheet: PropTypes.bool,
  noAction: PropTypes.bool,
  onCancel: PropTypes.func,
  goToMotoPayLandingPage: PropTypes.func,
  handleBottomSheet: PropTypes.func,
  appBar: PropTypes.string,
  secBtnText: PropTypes.string,
  googleIcon: PropTypes.string,
  gpayDesc: PropTypes.string,
  gpayBtn: PropTypes.string,
  gpayDesc3: PropTypes.string,
  gpayDesc2: PropTypes.string,
  gpayDesc4: PropTypes.string,
  isCardAddedToGpay: PropTypes.bool,
  addedToGpay: PropTypes.string,
  isCardDefaultCardInGPay: PropTypes.bool,
  icon: PropTypes.string,
  gpayIcon: PropTypes.string,
  addToGpayIcon: PropTypes.string,
  header: PropTypes.string,
  subHeader: PropTypes.string,
  description: PropTypes.string,
  charge: PropTypes.string,
  card: PropTypes.bool,
  virtualCard: PropTypes.string,
  action: PropTypes.string,
  gpayBtnText: PropTypes.string,
  close: PropTypes.func,
  onAction: PropTypes.func,
  bottomSheetDesc: PropTypes.string,
  bottomSheet: PropTypes.bool,
  setAsDefaultBtnTxt: PropTypes.string,
  setAsDefaultIcon: PropTypes.string,
  gpayEntryPoint: PropTypes.string
  
};

export default withStyles(styles)(GiftCardGooglePayComp);
