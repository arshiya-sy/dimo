import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Drawer from '@material-ui/core/Drawer';

import SessionMetricsTracker from "../../Services/SessionMetricsTracker";
import localeService from "../../Services/localeListService";
import apiService from "../../Services/apiService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import walletJwtService from "../../Services/walletJwtService";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";

import dimo_logo from "../../images/DarkThemeImages/Dimo-Logo_4x.png";
import new_dimo_rebranding_image from "../../images/DarkThemeImages/log-in-page-image-1.png";
import gift_card from "../../images/SpotIllustrations/gift_card.png";
import DotStepperComponent from "../CommonUxComponents/DotStepperComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import CustomAlertDialogs from "../EngageCardComponent/CustomAlertDialogs";
import HelloShopUtils from "../EngageCardComponent/HelloShopUtil";
import { PopupModalHocManger } from "../EngageCardComponent/PopupModalHoc";
import GeneralUtilities from "../../Services/GeneralUtilities";
import InputThemes from "../../Themes/inputThemes";
import constantObjects from "../../Services/Constants";
import NewMotoPayValuePropsComponent from "./NewMotoPayValuePropsComponent";
import Log from "../../Services/Log";

import { MuiThemeProvider } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

const PageName = PageNames.intro;
const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;

var localeObj = {};

class NewMotoPayLandingComponent extends React.Component {
  constructor(props) {
    super(props);
    this.sentState = this.props.location.state;
    this.previousLocation = this.sentState ? this.sentState.from : "";

    this.state = {
      tempDisabled: true,
      valuePropEnabled: true,
      isNonMoto: androidApiCalls.checkIfNm(),
      openGiftCardBS: false
    };
    this.styles = {
      bodyDiv: {
        width: "100%"
      },
      span1: {
        textAlign: 'center',
        margin: "1.5rem",
        marginBottom: "1rem"
      },
      span2: {
        margin: '0% 10%',
        textAlign: 'center',
      }
    }
    this.login = this.login.bind(this);
    this.signup = this.signup.bind(this);
    this.dialogCall = null;
    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
    MetricServices.onPageTransitionStart(PageName);
  }

  componentDidMount() {
    androidApiCalls.setDimoStatusBar();
    if (Number(androidApiCalls.getAppVersion()) < constantObjects.MINIMAL_APK_VERSION && !androidApiCalls.checkIfNm()) {
      this.props.history.replace("/upgradeAppPage");
    } else {
      androidApiCalls.enablePullToRefresh(false);
      androidApiCalls.setDAStringPrefs("sessionActiveStatus", true);
      document.addEventListener("visibilitychange", this.visibilityChange);
      let showGiftCardBottomSheet = androidApiCalls.getFromPrefs("showGiftCardBottomSheet");
      if (!GeneralUtilities.emptyValueCheck(showGiftCardBottomSheet) && showGiftCardBottomSheet === "true") {
        if (!this.sentState?.hideGiftCardBS) {
          this.setState({
            openGiftCardBS: true
          });
        }
      }

      // Set auth token for motopay backend in background.
      walletJwtService.setAuthorization();
      androidApiCalls.setStatusBarColour("#FF001D38");
      androidApiCalls.setNavigationBarColor("#FF001D38");
      window.onBackPressed = () => {
        if (this.state.openGiftCardBS) {
          this.dismissGiftCardBS()
          return
        }
        MetricServices.onPageTransitionStop(PageName, PageState.back);
        if (HelloShopUtils.isHelloShopDimopayQRPayment(androidApiCalls.getMotopayDeepLinkUrl())) {
          return this.setState({
            bottomSheetHeader: localeObj.hs_abort_warning_title,
            bottomSheetDescription: localeObj.hs_abort_warning_message,
            primary_btn_text: localeObj.hs_abort_pstbtn,
            secondary_btn_text: "",
            bottomSheetType: "HSAbortSheet",
            bottomSheetSubText: localeObj.hs_abort_ngtbtn,
            open: true
          });
        } else if (androidApiCalls.checkIfMpOnly()) {
          window.Android.closeWindow();
        } else {
          androidApiCalls.openHY();
        }
      }
      this.deepLinkCheck();
    }
  }

  deepLinkCheck = () => {
    this.showProgressDialog();
    let deepLinkInfo = androidApiCalls.getMotopayDeepLinkUrl();
    let giftCardDeepLink = false;
    Log.sDebug("Notification deeplink details, NewMotoPayLandingComponent " + deepLinkInfo);
    if (deepLinkInfo !== "" && deepLinkInfo !== undefined) {
      let deepLinkJson = JSON.parse(deepLinkInfo);
      let url = deepLinkJson["componentPath"];
      if (url !== "" && url !== undefined && url.includes("/giftCardMain")) {
        androidApiCalls.storeToPrefs("showGiftCardBottomSheet", "true");
        androidApiCalls.clearMotopayDeepLinkUrl();
        let addInfoJson = ""
        try {
          let addInfo = deepLinkJson["additionalInfo"];
          addInfoJson = (addInfo !== "" && addInfo !== undefined) ? JSON.parse(addInfo) : "";
        } catch (err) {
          Log.sError("Error is: ", err);
        }
        this.hideProgressDialog();
        giftCardDeepLink = true;
        this.props.history.replace({
          pathname: "/giftCardMain",
          additionalInfo: addInfoJson
        });
      } else if (url !== "" && url !== undefined && url.toLowerCase().includes("/hy")) {
        ///HY
        androidApiCalls.openHY();
      } else if (url !== "" && url !== undefined && url.toLowerCase().includes("/appsrecommendation")) {
        ///AppsRecommendation
        let hyUrl = androidApiCalls.getHyUrl();
        hyUrl = hyUrl.replace("card", "apps");
        window.location.replace(hyUrl);
      }
    }
    if (!giftCardDeepLink) {
      this.hideProgressDialog();

      // Enable and disable Value Props.
      let valuePropsEnable = androidApiCalls.getDAStringPrefs(GeneralUtilities.VALUEPROPS_KEY);
      if (valuePropsEnable === undefined || valuePropsEnable == null) {
        androidApiCalls.setDAStringPrefs(GeneralUtilities.VALUEPROPS_KEY, "enable");
      } else if (valuePropsEnable === "disable") {
        this.setState({
          valuePropEnabled: false
        });
      }

      if (androidApiCalls.isAccountLoggedIn() && this.previousLocation === "") {
        // this means user had not specifically logged out
        this.login(true);
      } else {
        SessionMetricsTracker.setTimeTakenForLaunch();
        let params = {
          dialogtrigger: "tabentry",
          placement: "Wallet"
        };

        this.dialogCall = apiService.getDialog(params);
        this.dialogCall.then(response => {
          Log.debug('NewMotopayLanding component getDialog response: ' + JSON.stringify(response));

          if (response.main) {
            PopupModalHocManger.openPopupModalHoc(CustomAlertDialogs, response.main,
              response.extra);
          }
        });
      }
      androidApiCalls.updateWebResource();
    }

  }

  visibilityChange = () => {
    let visibilityState = document.visibilityState;
    if (visibilityState === "hidden") {
      MetricServices.onPageTransitionStop(PageName, PageState.recent);
    } else if (visibilityState === "visible") {
      MetricServices.onPageTransitionStart(PageName);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("visibilitychange", this.visibilityChange);
    GeneralUtilities.isNotEmpty(this.dialogCall, false)
      && PopupModalHocManger.closeModal();
  }

  login = (cancelTransition) => {
    androidApiCalls.setDAStringPrefs(GeneralUtilities.VALUEPROPS_KEY, "disable");
    MetricServices.onPageTransitionStop(PageName, PageState.close);
    let privacyPolicy = androidApiCalls.getDAStringPrefs(GeneralUtilities.PRIVACY_KEY);
    if (privacyPolicy !== undefined && privacyPolicy !== null && privacyPolicy !== "") {
      if (cancelTransition) {
        this.props.history.replace({ pathname: "/newLogin", transition: "none" });
      } else {
        this.props.history.replace("/newLogin");
      }
    } else {
      this.props.history.replace({ pathname: '/newSignUpPageComp', from: "landingPage" });
    }
  }

  signup = () => {
    androidApiCalls.setDAStringPrefs(GeneralUtilities.VALUEPROPS_KEY, "disable");
    if (this.state.isNonMoto) {
      MetricServices.onPageTransitionStop(PageName, PageState.close);
      this.props.history.replace("/nonMotoDeviceLogin");
    } else {
      MetricServices.onPageTransitionStop(PageName, PageState.close);
      this.props.history.replace("/userIdCreation");
    }
  }

  help = () => {
    MetricServices.onPageTransitionStop(PageName, PageState.close);
    GeneralUtilities.openHelpSection();
  }

  enableDisableValueProp = (value) => {
    androidApiCalls.setDAStringPrefs(GeneralUtilities.VALUEPROPS_KEY, "disable");
    MetricServices.onPageTransitionStart(PageName);
    this.setState({
      valuePropEnabled: value
    });
  }

  showProgressDialog = () => {
    this.setState({
      processing: true
    })
  }

  hideProgressDialog = () => {
    this.setState({
      processing: false
    })
  }

  closeSnackBar = () => {
    this.setState({ snackBarOpen: false })
  }


  sendEventMetrics = (event_type, pageName) => {
    let event = {
      eventType: event_type,
      page_name: pageName,
    };
    MetricServices.reportActionMetrics(event, new Date().getTime());
  }

  openSnackBar = (message) => {
    this.setState({
      snackBarOpen: true,
      message: message
    })
  }

  returnToHS = () => {
    let deeplink = androidApiCalls.getMotopayDeepLinkUrl();
    androidApiCalls.clearMotopayDeepLinkUrl();
    let returnUrl = HelloShopUtils.getAbortedURL(deeplink, HelloShopUtils.USER_ABORTED_ERROR)
    HelloShopUtils.returnToHS(returnUrl)
    return;
  }

  onPrimary = () => {
    this.setState({ open: false })
    if (this.state.bottomSheetType === "HSAbortSheet") {
      //close the bottom sheet
    }
  }

  onPrimaryGiftCard = () => {
    this.sendEventMetrics(constantObjects.claimReward, PageName);
    this.props.history.replace("/giftCardMain");
  }

  dismissGiftCardBS = () => {
    this.sendEventMetrics(constantObjects.mayBeLater, PageName);
    this.setState({
      openGiftCardBS: false
    });

  }

  onSecondary = () => {
    // Not required now
  }

  onSubText = () => {
    this.setState({ open: false });
    if (this.state.bottomSheetType === "HSAbortSheet") {
      this.returnToHS();
    }
  }

  render() {
    const { classes } = this.props;
    let Styles = this.styles;
    const screenHeight = window.screen.height;
    const screenWidth = window.screen.width;

    return (
      <div>
        {this.state.valuePropEnabled && !this.state.processing &&
          <NewMotoPayValuePropsComponent enableDisableValueProp={this.enableDisableValueProp} signup={this.signup} login={this.login} help={this.help} />
        }
        {!this.state.valuePropEnabled && !this.state.processing &&
          <div className='scrollContainer' style={{ width: screenWidth, overflow: "scroll", position: "relative" }}>
            <FlexView column hAlignContent="center" style={{ width: screenWidth }}>
              <img style={{ marginTop: "1.5rem", height: `${0.095 * screenHeight}px` }} src={dimo_logo} alt=""></img>
            </FlexView>
            <FlexView column hAlignContent="center">
              <img style={{ marginTop: "2rem", height: `${0.4 * screenHeight}px`, width: screenWidth }} src={new_dimo_rebranding_image} alt=""></img>
            </FlexView>
            <FlexView column hAlignContent="center" style={InputThemes.bottomButtonStyle}>
              <div className="headline5 highEmphasis" style={{ ...Styles.span1 }}>
                {localeObj.say_hello}
              </div>
              <div className="subtitle2 highEmphasis" style={{ ...Styles.span2, marginBottom: "60px" }}>
                {this.state.isNonMoto ? localeObj.nm_banking_operation : localeObj.new_motopay_welcome_page}
              </div>
              {
                !this.state.tempDisabled &&
                <FlexView column hAlignContent='center' vAlignContent='center' height={`${(10 / 100) * screenHeight}px`}>
                  <DotStepperComponent size="0" />
                </FlexView>
              }
              <div style={{ textAlign: "center" }}>
                <PrimaryButtonComponent btn_text={localeObj.sign_up} onCheck={this.signup} />
                <SecondaryButtonComponent btn_text={localeObj.login} onCheck={() => this.login(false)} />
              </div>
            </FlexView>
          </div>
        }
        <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
          <Drawer classes={{ paper: classes.paper }}
            anchor="bottom"
            open={this.state.open}>
            <div style={{ margin: "1.5rem" }}>
              <FlexView column style={{ marginTop: "0.5rem" }}>
                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                  {this.state.bottomSheetHeader}
                </div>
                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                  {this.state.bottomSheetDescription}
                </div>
              </FlexView>
            </div>
            <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
              <PrimaryButtonComponent btn_text={this.state.primary_btn_text} onCheck={this.onPrimary} />
              {this.state.secondary_btn_text && <SecondaryButtonComponent btn_text={this.state.secondary_btn_text} onCheck={this.onSecondary} />}
              {this.state.bottomSheetSubText && <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.onSubText}>
                {this.state.bottomSheetSubText}
              </div>}
            </div>
          </Drawer>
        </div>


        <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
          <Drawer classes={{ paper: classes.paper }}
            anchor="bottom"
            open={this.state.openGiftCardBS && constantObjects.featureEnabler.GIFT_CARD_ENABLED}>
            <div style={{ margin: "1.5rem" }}>
              <FlexView column style={{ marginTop: "0.5rem" }}>
                <div className="headline6 highEmphasis" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  {localeObj.gift_card_bs_head}
                </div>
                <div style={{ position: 'relative', display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                  <img style={{ width: "100%", height: "100%", borderRadius: 20 }} src={gift_card} alt=""></img>
                </div>


              </FlexView>
            </div>
            <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
              <PrimaryButtonComponent btn_text={localeObj.gift_card_bs_btn_primary} onCheck={this.onPrimaryGiftCard} />
              {<div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={this.dismissGiftCardBS}>
                {localeObj.gift_card_bs_btn_secondary}
              </div>}
            </div>
          </Drawer>
        </div>

        <div style={{ display: this.state.processing ? 'block' : 'none' }}>
          {this.state.processing && <CustomizedProgressBars />}
        </div>
        <MuiThemeProvider theme={theme2}>
          <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
          </Snackbar>
        </MuiThemeProvider>
      </div >
    );
  }
}

NewMotoPayLandingComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object,
  history: PropTypes.object
};

export default withStyles(styles)(NewMotoPayLandingComponent);
