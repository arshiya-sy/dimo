module.exports = new AndroidApiService();

const SHA256 = require("js-sha256").sha256;
function AndroidApiService() {
  var self = this;
  this.domData = {};
  this.storyId = null;
  this.page = "0";
  this.version = {};
  this.optinStatus = null;
  var deviceId = null;
  let sessionId;
  var locale = null;
  var language = null;
  var userEmail = null;
  var userFirstName = null;
  var userLastName = null;
  var userCountry = null;
  var defer;
  var deferArray = [];
  this.stagingVersion = null;
  this.env = null;
  const WallpaperObject = {};
  const ARGO_URL_PROD = "argo.svcmot.com";
  const ARGO_URL_STAGING = "argo-sdc200.blurdev.com";
  const PROD_ENV = "prod";
  const DF_ENV = "df";
  const STAGING_ENV = "staging";
  const DEV_ENV = "dev";
  const STAGING_VERSION1 = "v1";
  const STAGING_VERSION2 = "v2";
  const FIRST_LAUNCH_IN_DAY = "FIRST_LAUNCH_IN_DAY";
  const ONBOARDED_DATE = "OB_DATE";
  const ONBOARDSTATS_COLLECTION_DATE = "OBSTATS_COLLECTION_DATE";
  const CUMULATIVE_SESSIONS_COUNT = "CUMULATIVE_SESSIONS_COUNT";
  const ACTIVE_SESSIONS_COUNT = "ACTIVE_SESSIONS_COUNT";
  const SESSION_COUNT_PER_DAY = "SESSION_COUNT_PER_DAY";
  const USER_EVER_SIGNED_IN = "USER_EVER_SIGNED_IN";
  const CURRENT_DATE = "CURRENT_DATE";

  const DEVICE_TYPES = {
    ENGAGE: "engage",
    BROWSER: "browser"
  };
  const DOMID = {};
  const BR_MCC = 724;
  const AppName = "EngageApp";
  const OnboardStats = "OnboardStats";
  const GID_TOKEN = "gidtoken",
    INVALID_SESSION_TOKEN = "invalidsessiontoken";
  const MISSING_SESSION_TOKEN = "missingsessiontoken";

  const NEW_BIOMETRIC_ENABLED_FLAG = "new_biometric_enabled_falg";

  const qrCodesList = [["DIMOMOTOROLA.COM.BR", "dimo:qrcode/payment", "Banco24Horas/SaqueDigital", "br.gov.bcb.pix"]];


  this.checkBrowserType = function () {
    if (window.Android !== undefined) {
      return DEVICE_TYPES.ENGAGE;
    }
    return DEVICE_TYPES.BROWSER;
  };

  this.setMotoPlaceStatusBar = () => {
    this.setStatusBarColour("#1795B8");
  };

  this.setDimoStatusBar = () => {
    this.setStatusBarColour("#1F3F5E");
  };

  this.enablePullToRefresh = enable => {
    if (this.PTRenabled === enable) {
      return;
    }
    this.PTRenabled = enable;
    try {
      window.Android.enablePullToRefresh(enable);
    } catch (err) {
      return;
    }
  };

  this.launchInAppReviewDialog = () => {
    try {
      window.Android.launchInAppReviewDialog();
    } catch (err) {
      //console.log("launchInAppReviewDialog api not available");
    }
  };

  this.hideRefreshingSpinner = () => {
    try {
      window.Android.hideRefreshingSpinner();
    } catch (err) {
      return;
    }
  };

  this.isDarkModeEnabled = () => {
    try {
      return window.Android.isDarkModeEnabled();
    }
    catch (err) {
      //console.log(err);
      return false;
    }
  }

  this.isDarkModeSupported = () => {
    try {
      let val = window.Android.isDarkModeSupported();
      return val;
    }
    catch (err) {
      //console.log(err);
      return false;
    }
  }

  this.isMotoPlaceEnabled = function () {
    try {
      if (this.motoEnabled === undefined) {
        this.motoEnabled = window.Android.isMotoPlaceEnabled();
      }
      return this.motoEnabled;
    } catch (err) {
      //console.log("API not available");

      if (window.Android === undefined) {
        //console.log("On Browser");
        return true;
      } else {
        return false;
      }
    }
  };

  /**
   * Method to disable moto place
   * Used in cases where there is an error in uiprofile
   */
  this.disableMotoPlace = () => {
    this.motoEnabled = false;
  };

  this.forceRelogin = () => {
    try {
      window.Android.forceRelogin();
    } catch (err) {
      //console.log(err);
    }
  };
  this.isEngage = function () {
    //return true;
    return this.checkBrowserType() === DEVICE_TYPES.ENGAGE;
  };

  this.isDummy = function () {
    try {
      return window.Android.isWorkingOnTestMode();
    } catch (err) {
      //console.log("Api not available");
      return;
    }
  };

  const OnBoarding = "onboardingFinished";
  this.checkOnboarding = function () {
    return this.getIntValue(OnBoarding) === 1;
  };

  this.changeOnboardingStatus = function (onboardDone, onboardDeviceStatus) {
    let res = onboardDeviceStatus;
    if (onboardDone) {
      res = 1;
    }
    let status = this.persistIntValue(OnBoarding, res);
    if (!status) {
      this.persistValue(OnBoarding, res);
    }
  };

  this.getDeviceId = function () {
    try {
      if (deviceId == null) deviceId = window.Android.getDeviceId();
      return deviceId;
    } catch (err) {
      return undefined;
    }
  };

  this.getDeviceInformation = function () {
    try {
      return window.Android.getDeviceInformation();
    } catch (err) {
      return undefined;
    }
  };

  this.getNmFirebaseToken = function () {
    try {
      return window.Android.getNmFirebaseToken();
    } catch (err) {
      return undefined;
    }
  };

  this.refreshNmFirebaseToken = function () {
    try {
      window.Android.refreshFirebaseToken();
    } catch (err) {
      return undefined;
    }
  }

  this.getSessionToken = () => {
    return window.Android.getCCESettingsValue(
      "blur.service.mmapi.cred.sessionToken",
      ""
    );
  };

  this.getGoogleAccountDetailsAsync = () => {
    try {
      window.Android.getGoogleAccountDetailsAsync();
    } catch (err) {
      //console.log(err);
    }
  };

  this.getGoogleToken = () => {
    let details = {};
    try {
      details = window.Android.getGoogleAccountDetails();
      if (details) {
        return JSON.parse(details).tokenId;
      }
      return undefined;
    } catch (err) {
      //console.log("GoogleToken Api not available");
    }
  };

  this.getGoogleAccountsDetails = () => {
    let details = {};
    try {
      details = window.Android.getGoogleAccountDetails();
      if (details) return JSON.parse(details);
      else return undefined;
    } catch (err) {
      //console.log("Google Account details api not available");
    }
  };

  this.getAppVersion = function () {
    try {
      return window.Android.getAppVersion();
    } catch (err) {
      //console.log("Api not available");
      return undefined;
    }
  };

  this.generateGuid = function () {
    try {
      return window.Android.generateGuid();
    } catch (err) {
      return null;
    }
  };

  this.startWidgetSettings = () => {
    try {
      window.Android.startWidgetSettings();
    } catch (err) {
      //console.warn("startWidgetSettings API not available")
    }
  }

  this.launchWidgetSettings = () => {
    try {
      window.Android.launchWidgetSettings();
    } catch (err) {
      //console.warn("launchWidgetSettings not available")
      this.startWidgetSettings();
    }
  }

  this.isWidgetSupported = () => {
    try {
      return window.Android.isWidgetSupported()
    } catch (err) {
      return false;
    }
  }

  this.scanQrCode = format => {
    try {
      window.Android.scanQrCode(format);
    } catch (err) {
      //console.log(err);
    }
  }

  this.scanBoletoCode = () => {
    try {
      window.Android.scanBoletoCode();
    } catch (err) {
      //console.log(err);
    }
  }

  this.isGpayAppReadyToPay = function () {
    try {
      let paymentJson = {
        "apiVersion": 2,
        "apiVersionMinor": 0,
        "allowedPaymentMethods": [
          {
            "type": "CARD",
            "parameters": {
              "allowedAuthMethods": ["CRYPTOGRAM_3DS"],
              "allowedCardNetworks": ["ELO", "ELO_DEBIT", "MASTERCARD", "MAESTRO", "VISA", "ELECTRON"]
            }
          }
        ],
        "existingPaymentMethodRequired": true
      }
      window.Android.isReadyToPay(JSON.stringify(paymentJson));
    } catch (err) {
      // console.log(err)
    }


  }

  this.addCardToGpay = function (value, gpayJson, userDetails) {
    try {
      if (typeof gpayJson != "string" && typeof gpayJson == "object")
        gpayJson = JSON.stringify(gpayJson);
      if (typeof userDetails != "string" && typeof userDetails == "object")
        userDetails = JSON.stringify(userDetails);
      window.Android.googlePayIntegration(value, gpayJson, userDetails);
    } catch (err) {
      //console.log(err);
    }
  }

  this.manualProvisioning = function (gpayJson, tokenID) {
    try {
      if (typeof gpayJson != "string" && typeof gpayJson == "object")
        gpayJson = JSON.stringify(gpayJson);
      window.Android.manualProvisioning(gpayJson, tokenID);
    } catch (err) {
      //console.log(err);
    }
  }

  this.getActiveWalletId = function () {
    try {
      window.Android.getActiveWalletId();
    } catch (err) {
      //console.log(err);
    }
  }

  this.createWallet = function () {
    try {
      window.Android.createWallet();
    } catch (err) {
      //console.log(err);
    }
  }

  this.getStableHardwareId = function () {
    try {
      window.Android.getStableHardwareId();
    } catch (err) {
      //console.log(err);
    }
  }


  this.setIsNotifToTab = function (value) {
    this.isNotifToTab = value;
  }

  this.getIsNotifToTab = function () {
    return this.isNotifToTab;

  }




  this.getCpf = function () {
    try {
      return window.Android.getCPF();
    } catch (err) {
      return null;
    }
  };

  this.isGPayInstalled = function () {
    try {
      return window.Android.isAppInstalled("com.google.android.apps.walletnfcrel");
    } catch (err) {
      return false;
    }
  };

  this.isFeatureEnabledInApk = function (featureName) {
    try {
      return window.Android.isFeatureEnabledInApk(featureName);
    } catch (err) {
      return false;
    }
  };

  this.isGPayDefaultTAPApplication = function () {
    try {
      return window.Android.isGPayDefaultTAPApplication();
    } catch (err) {
      return false;
    }
  };

  this.setGPayAsDefaultTAPApplication = function () {
    try {
      window.Android.setGPayAsDefaultTAPApplication();
    } catch (err) {
      //console.log(err);
    }
  };

  this.appShortcutIntents = function (localObj) {

    try {
      let shortcutData;
      if (this.checkIfNm()) {
        shortcutData = [
          {
            "shortcutLabel": localObj.scan_any_QR,
            "shortcutIntent": "#Intent;launchFlags=0x10000000;component=com.motorola.dimo/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=%2FnewWalletLaunch;S.motopay_addInfo=%7B%22cameraActions%22%3A%22PixScan%22%7D;S.motopay_launch_point=ScanAnyQR;end",
            "shortcutIcon": "ScanAnyQR"
          },
          {
            "shortcutLabel": localObj.view_transactions,
            "shortcutIntent": "#Intent;launchFlags=0x10000000;component=com.motorola.dimo/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=/newTransactionHistory;S.motopay_launch_point=ViewTransactions;end",
            "shortcutIcon": "ViewTransactions"
          },
          {
            "shortcutLabel": localObj.recharge,
            "shortcutIntent": "#Intent;launchFlags=0x10000000;component=com.motorola.dimo/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=/cellularRecharge;S.motopay_launch_point=Recharge;end",
            "shortcutIcon": "Recharge"
          },
          {
            "shortcutLabel": localObj.receive_PIX,
            "shortcutIntent": "#Intent;launchFlags=0x10000000;component=com.motorola.dimo/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=%2FpixLandingComponent;S.motopay_addInfo=%7B%22pixActions%22%3A%22pix_send%22%7D;S.motopay_launch_point=ReceivePIX;end",
            "shortcutIcon": "ReceivePIX"
          }
        ];

      } else {
        shortcutData = [
          {
            "shortcutLabel": localObj.scan_any_QR,
            "shortcutIntent": "#Intent;launchFlags=0x10000000;component=com.motorola.ccc.notification/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=%2FnewWalletLaunch;S.motopay_addInfo=%7B%22cameraActions%22%3A%22PixScan%22%7D;S.motopay_launch_point=ScanAnyQR;end",
            "shortcutIcon": "ScanAnyQR"
          },
          {
            "shortcutLabel": localObj.view_transactions,
            "shortcutIntent": "#Intent;launchFlags=0x10000000;component=com.motorola.ccc.notification/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=/newTransactionHistory;S.motopay_launch_point=ViewTransactions;end",
            "shortcutIcon": "ViewTransactions"
          },
          {
            "shortcutLabel": localObj.recharge,
            "shortcutIntent": "#Intent;launchFlags=0x10000000;component=com.motorola.ccc.notification/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=/cellularRecharge;S.motopay_launch_point=Recharge;end",
            "shortcutIcon": "Recharge"
          },
          {
            "shortcutLabel": localObj.receive_PIX,
            "shortcutIntent": "#Intent;launchFlags=0x10000000;component=com.motorola.ccc.notification/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=%2FpixLandingComponent;S.motopay_addInfo=%7B%22pixActions%22%3A%22pix_send%22%7D;S.motopay_launch_point=ReceivePIX;end",
            "shortcutIcon": "ReceivePIX"
          }
        ];

      }


      window.Android.appShortcutIntents(JSON.stringify(shortcutData));

    } catch (err) {
      //console.log("Error: appShortcutIntents", err);
    }

  };

  this.widgetIntents = function (localObj) {
    try {
      let shortcutData;
      if (this.checkIfNm()) {
        shortcutData = [
          {
            "widgetLabel": localObj.scan_any_QR,
            "widgetAction": "#Intent;launchFlags=0x10000000;component=com.motorola.dimo/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=%2FnewWalletLaunch;S.motopay_addInfo=%7B%22cameraActions%22%3A%22PixScan%22%7D;S.motopay_launch_via=widget_Pix_Scan;end",
            "widgetIcon": "scan_any_qr"
          },
          {
            "widgetLabel": localObj.view_transactions,
            "widgetAction": "#Intent;launchFlags=0x10000000;component=com.motorola.dimo/com.motorola.engageapp.ui.MotopayActivity;S.override_package=com.motorola.ccc.notification;S.override_class=com.motorola.engageapp.ui.CardsActivity;S.tab_name=Wallet;S.motopay_url=/newTransactionHistory;S.motopay_launch_via=widget_View_Transactions;end",
            "widgetIcon": "view_transactions"
          },
          {
            "widgetLabel": localObj.recharge,
            "widgetAction": "#Intent;launchFlags=0x10000000;component=com.motorola.dimo/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=/cellularRecharge;S.motopay_launch_via=widget_Cellular_Recharge;end",
            "widgetIcon": "recharge"
          },
          {
            "widgetLabel": localObj.receive_PIX,
            "widgetAction": "#Intent;launchFlags=0x10000000;component=com.motorola.dimo/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=%2FpixLandingComponent;S.motopay_addInfo=%7B%22pixActions%22%3A%22pix_receive%22%7D;S.motopay_launch_via=widget_Pix_Receive;end",
            "widgetIcon": "receive_pix"
          }
        ];

      } else {
        shortcutData = [
          {
            "widgetLabel": localObj.scan_any_QR,
            "widgetAction": "#Intent;launchFlags=0x10000000;component=com.motorola.ccc.notification/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=%2FnewWalletLaunch;S.motopay_addInfo=%7B%22cameraActions%22%3A%22PixScan%22%7D;S.motopay_launch_via=widget_Pix_Scan;end",
            "widgetIcon": "scan_any_qr" // APK validation required. Whenever you change any widget icon, you need to verify with the apk and it should be in small letters and should join with "_".
          },
          {
            "widgetLabel": localObj.view_transactions,
            "widgetAction": "#Intent;launchFlags=0x10000000;component=com.motorola.ccc.notification/com.motorola.engageapp.ui.MotopayActivity;S.override_package=com.motorola.ccc.notification;S.override_class=com.motorola.engageapp.ui.CardsActivity;S.tab_name=Wallet;S.motopay_url=/newTransactionHistory;S.motopay_launch_via=widget_View_Transactions;end",
            "widgetIcon": "view_transactions"
          },
          {
            "widgetLabel": localObj.recharge,
            "widgetAction": "#Intent;launchFlags=0x10000000;component=com.motorola.ccc.notification/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=/cellularRecharge;S.motopay_launch_via=widget_Cellular_Recharge;end",
            "widgetIcon": "recharge"
          },
          {
            "widgetLabel": localObj.receive_PIX,
            "widgetAction": "#Intent;launchFlags=0x10000000;component=com.motorola.ccc.notification/com.motorola.engageapp.ui.MotopayActivity;S.tab_name=Wallet;S.motopay_url=%2FpixLandingComponent;S.motopay_addInfo=%7B%22pixActions%22%3A%22pix_receive%22%7D;S.motopay_launch_via=widget_Pix_Receive;end",
            "widgetIcon": "receive_pix"
          }
        ];

      }

      window.Android.updateWidget(JSON.stringify(shortcutData));

    } catch (err) {
      //console.log("Error: widgetIntents", err);
    }
  };

  this.installGPay = function () {
    try {
      window.Android.openAppInPlayStore("com.google.android.apps.walletnfcrel");
    } catch (err) {
      //console.log(err);
    }
  };

  this.openAppInPlayStore = function (appName) {
    try {
      window.Android.openAppInPlayStore(appName);
    } catch (err) {
      console.log(err);
    }
  }

  this.removeCardFromGPay = function (tokenID, tsp) {
    try {
      window.Android.requestDeleteToken(tokenID, tsp);
    } catch (err) {
      //console.log(err);
    }
  };

  this.setCardAsDefaultInGPay = function (tokenID, tsp) {
    try {
      window.Android.requestSelectToken(tokenID, tsp);
    } catch (err) {
      //console.log(err);
    }
  };

  this.isTokenized = function (tsp, tokenReferenceId) {
    try {
      window.Android.getTokenStatus(tsp, tokenReferenceId);
    } catch (err) {
      //console.log(err);
    }
  };

  this.listTokens = function (dataSyncBackground) {
    try {
      window.Android.listTokens(dataSyncBackground);
    } catch (err) {
      //console.log(err);
    }
  };

  this.getDataSyncProperties = function () {
    try {
      window.Android.getDataSyncProperties();
    } catch (err) {
      //console.log(err);
    }
  };

  this.generateGuid = function () {
    try {
      return window.Android.generateGuid();
    } catch (err) {
      return null;
    }
  };

  this.getUserName = function () {
    var name;
    try {
      name = window.Android.getFirstName();
      var lastname = window.Android.getLastName() || "";
      name += " " + lastname;
      if (
        name.toLowerCase().trim() === "owner" ||
        name.toLowerCase().trim() === "proprietário"
      )
        return "";
      return name;
    } catch (err) {
      ////console.log(err);
    }
  };

  this.reloadWebviewUrl = () => {
    try {
      //console.log("reloadWebviewUrl called from webview")
      window.Android.reloadWebviewUrl();
    } catch (err) {
      return;
    }
  }

  this.getLocale = function () {
    if (this.isEngage()) {
      let userLocale = this.getUserLocale();
      locale = userLocale ? userLocale : window.Android.getLocale();
    } else {
      return navigator.language;
    }
    return locale;
  };

  this.isFirstLaunchOfDay = function () {
    let oldTime = new Date(this.getLongValue(FIRST_LAUNCH_IN_DAY, OnboardStats));
    let currentTime = new Date();
    // if (currentTime.getTime() - oldTime.getTime() > DAY_IN_MILLISECONDS ) {
    //   return true;
    // }
    // if (currentTime.getDate() != oldTime.getDate()) {
    //   return true;
    // }
    if ((currentTime.getTime() > oldTime.getTime()) && (currentTime.getDate() !== oldTime.getDate())) {
      return true;
    }
    return false;
  }

  this.userSignIn = function () {
    if (!this.getValue(USER_EVER_SIGNED_IN, OnboardStats)) {
      this.persistValue(USER_EVER_SIGNED_IN, true, OnboardStats);
    }
  }

  this.hasUserEverSignedIn = function () {
    return this.getValue(USER_EVER_SIGNED_IN, OnboardStats);
  }

  this.setCurrentDate = function () {
    this.persistLongValue(CURRENT_DATE, new Date().getTime(), OnboardStats);
  }

  this.isSameDate = function () {
    let oldTime = this.getLongValue(CURRENT_DATE, OnboardStats)
    if (oldTime === 0) {
      oldTime = new Date();
    } else {
      oldTime = new Date(oldTime);
    }
    let currTime = new Date();
    if ((currTime.getTime() >= oldTime.getTime()) && (currTime.getDate() === oldTime.getDate())) {
      return true
    }
    return false;
  }

  this.setFirstLaunchTime = function (curr_time) {
    curr_time = curr_time || new Date();
    this.persistLongValue(FIRST_LAUNCH_IN_DAY, curr_time.getTime(), OnboardStats);
  }

  this.setOnboardedDate = function (curr_time) {
    curr_time = curr_time || new Date();
    this.persistLongValue(ONBOARDED_DATE, curr_time.getTime(), OnboardStats);
  }

  this.setOnboardStatsCollectionDate = (curr_time) => {
    curr_time = curr_time || new Date();
    this.persistLongValue(ONBOARDSTATS_COLLECTION_DATE, curr_time.getTime(), OnboardStats);
  }

  this.getOnboardStatsCollectionDate = () => {
    return this.getLongValue(ONBOARDSTATS_COLLECTION_DATE, OnboardStats);
  }

  this.setCumulativeSessionsCount = () => {
    this.persistLongValue(CUMULATIVE_SESSIONS_COUNT, this.getLongValue(CUMULATIVE_SESSIONS_COUNT, OnboardStats), OnboardStats);
  }

  this.setActiveSessionsCount = () => {
    this.persistLongValue(ACTIVE_SESSIONS_COUNT, this.getLongValue(ACTIVE_SESSIONS_COUNT, OnboardStats) + 1, OnboardStats)
  }

  this.setSessionsPerDay = resetVal => {
    if (resetVal === undefined) {
      resetVal = this.getIntValue(SESSION_COUNT_PER_DAY, OnboardStats) + 1;
    }
    this.persistIntValue(SESSION_COUNT_PER_DAY, resetVal, OnboardStats);
  }

  this.setUserLocale = function (locale) {
    this.persistValue("userLocale", locale);
  }

  this.getUserLocale = function () {
    return this.getValue("userLocale");
  }


  this.optinCard = {
    halfcard: true
  };

  this.optinInfo = {
    isOptedIn: null
  };

  this.getLanguage = function () {
    language = window.Android.getLanguage();
    return language;
  };

  this.getEmailId = function () {
    try {
      if (userEmail == null) {
        userEmail = window.Android.getEmailId();
      }
    } catch (err) {
      //console.log("On a browser?");
      return "{}";
    }
    return userEmail;
  };

  this.getFirstName = function () {
    try {
      if (userFirstName == null) userFirstName = window.Android.getFirstName();
      return userFirstName || "";
    } catch (err) {
      return "";
    }
  };

  this.getCountry = function () {
    try {
      if (userCountry == null) userCountry = window.Android.getCountry();
      return userCountry;
    } catch (err) {
      //console.log("Country not defined");
      return;
    }
  };

  this.getLastName = function () {
    try {
      if (userLastName == null) userLastName = window.Android.getLastName();
      return userLastName || "";
    } catch (err) {
      //console.log("Country not defined");
      return;
    }
  };

  this.getOssLicense = function () {
    try {
      return window.Android.getOssLicense();
    } catch (err) {
      //console.log("error fetching oss license");
      return;
    }
  };

  this.getBarcode = function () {
    try {
      this.barcode = this.barcode || window.Android.getBarcode();
      return this.barcode;
    } catch (err) {
      return;
    }
  };

  this.getHashedBarcode = () => {
    let bcode = this.getBarcode();
    if (bcode) {
      return SHA256(bcode);
    }
    return;
  };

  this.getHashedDeviceId = () => {
    let deviceId = this.getDeviceId();
    if (deviceId) {
      return SHA256(deviceId);
    }
    return;
  };

  this.optinStates = {
    optedin: ["opted in", "pending"],
    optedout: ["opted out", "undecided"]
  };

  /**
    * For early APK versions, window.Android.getOptinStatus
    * is not defined, we determine isPrimitiveApk based
    * on whether or not this function is defined.
    *
   */
  this.isPrimitiveApk = function () {
    return (window.Android.getOptinStatus === undefined);
  }

  this.clearBrowserHistory = () => {
    try {
      window.Android.clearHistory();
    } catch (err) {
      //console.log(err);
    }
  }

  this.getOptinStatus = function (page) {
    if (this.optinStatus == null) {
      try {
        this.optinStatus = window.Android.getOptinStatus();
      } catch (err) {
        /**
         * For early APK versions, window.Android.getOptinStatus
         * is not defined, we determined opted in or out based
         * on page request. Unsubscribe link shows up only
         * when the device is opted in.
         *
         */
        if (this.isEngage() && this.isPrimitiveApk()) {
          if (page === "optout") {
            this.optinStatus = "opted in";
          } else {
            this.optinStatus = "";
            return this.optinStatus;
          }
        } else {
          return "";
        }
      }
    }

    if (this.optinStatus !== undefined) {
      this.optinInfo.isOptedIn = this.optinStatus.toLowerCase().includes("opted in");
    }
    return this.optinStatus;
  };

  this.getOptinInfo = function (page) {
    this.getOptinStatus(page);
    return this.optinInfo;
  };

  this.shouldShowDoubleOptin = () => {
    try {
      return window.Android.shouldShowDoubleOptin();
    } catch (err) {
      //console.log("shouldShowDoubleOptin not available");
      return true;
    }
  }

  this.getScreenDimensions = function () {
    try {
      return window.Android.getScreenDimensions();
    } catch (err) {
      return "{}";
    }
  };

  this.getShipmentCountry = () => {
    try {
      this.shipCountry =
        this.shipCountry ||
        window.Android.getCCESettingsValue(
          "blur.service.mmapi.shipCountry",
          "US"
        );
      return this.shipCountry;

    } catch (err) {
      return '';
    }
  };

  this.getMarketName = () => {
    return this.getSystemStringProperty("ro.vendor.product.display");
  };

  this.getModelName = () => {
    let model = "";
    try {
      model = this.getSystemStringProperty("ro.product.model");
    } catch (err) {
      return;
    }
    return model;
  };

  this.getBuildName = () => {
    let build = "";
    try {
      build = this.getSystemStringProperty("ro.build.product");
    } catch (err) {
      return;
    }
    return build;
  };

  this.getReleaseType = () => {
    let build = "";
    try {
      build = this.getSystemStringProperty("ro.build.tags");
    } catch (err) {
      return;
    }
    return build;
  };

  this.getEnv = () => {
    if (!this.env) {
      try {
        if (this.checkIfNm()) {
          this.env = this.getNonMotoEnvironment();
        } else {
          let url = window.Android.getCCESettingsValue("blur.service.ws.mmiApiUrl", null);
          if (url === ARGO_URL_PROD) {
            this.env = PROD_ENV;
          } else if (url === ARGO_URL_STAGING) {
            if (this.getStagingVersion() === STAGING_VERSION2) {
              this.env = STAGING_ENV;
            } else {
              this.env = DF_ENV;
            }
          } else {
            this.env = DEV_ENV;
          }
        }
      } catch (err) {
        this.env = localStorage.env || "staging";
      }
    }
    return this.env;
  }

  this.getStagingVersion = () => {
    if (!this.stagingVersion) {
      try {
        this.stagingVersion = window.Android.getStagingVersion() || STAGING_VERSION1;
      } catch (err) {
        this.stagingVersion = STAGING_VERSION1;
        if (window.location.href.indexOf("engage-experiments") !== -1 || window.location.href.indexOf("localhost")) {
          this.stagingVersion = STAGING_VERSION2;
        }
      }
    }
    return this.stagingVersion;
  }

  this.sysProps = {};
  this.getSystemStringProperty = key => {
    try {
      this.sysProps[key] =
        this.sysProps[key] || window.Android.getSystemStringProperty(key);
    } catch (err) {
      return;
    }
    return this.sysProps[key];
  };

  /* For debugging auth error codes
  To simulate the auth errors, set the system properties for the following :
  1. Missing Session Token => adb shell setprop missingsessiontoken "invalid"
  2. Invalid Session Token => adb shell setprop invalidsessiontoken "invalid"
  3. Invalid Google Token =>  adb shell setprop gidtoken "invalid"
  Check for specific handling of auth error codes.
  After testing, reset the respective system properties to "", for e.x., adb shell setprop gidtoken ""
  */
  this.hasMissingSessionProps = () => {
    try {
      return (
        this.getSystemStringProperty(MISSING_SESSION_TOKEN) ===
        this.STATES.INVALID
      );
    } catch (err) {
      //console.log(err);
    }
  };

  this.hasSessionInvalidProps = () => {
    try {
      return (
        this.getSystemStringProperty(INVALID_SESSION_TOKEN) ===
        this.STATES.INVALID
      );
    } catch (err) {
      //console.log(err);
    }
  };

  this.hasGoogleIDInvalidProps = () => {
    try {
      return this.getSystemStringProperty(GID_TOKEN) === this.STATES.INVALID;
    } catch (err) {
      //console.log(err);
    }
  };

  this.getHWType = () => {
    try {
      return (
        this.getSystemStringProperty("ro.mot.build.oem.product") ||
        this.getSystemStringProperty("ro.mot.build.system.product") ||
        this.getSystemStringProperty("ro.product.name")
      );
    } catch (err) {
      //console.log("Hardware type not available");
      return;
    }
  };

  this.getChannelId = () => {
    try {
      return window.Android.getChannelId();
    } catch (err) {
      //console.log("No channelid found");
      return '';
    }
  };

  this.getSDKVersion = function () {
    return this.getSystemStringProperty("ro.build.version.sdk");
  };

  this.closeWindow = function (value) {
    try {
      window.Android.closeWindow(value);
    } catch (err) {
      try {
        window.Android.closeWindow();
      } catch (err) {
        return;
      }
    }
  };

  this.backPress = function () {
    window.Android.backPress();
  };

  this.cleanWebResources = () => {
    try {
      window.Android.cleanWebResources();
      //console.log("Cleared WebResources");
    } catch (err) {
      //console.log("Not able to clear WebResources", err);
    }
  }

  this.requestWebResources = (webResources) => {
    try {
      window.Android.requestWebResources(webResources);
      //console.log("Requested to download new WebResources");
    } catch (err) {
      //console.log("Not able download new WebResources", err);
    }
  }

  this.updateWebResource = () => {
    let webResources = {
      "url": "https://storage.googleapis.com/webviewresourceforcostopt/dimo-jan-18-2023-prod-1.0.zip",
      "sha1": "973dd5cd67a76f2aee8388b23280a2ad60af14f4a24a281bcbc14cfc76d652d1",
      "isRequestInterceptionEnabled": "false"
    }
    try {
      window.Android.updateWebResource(JSON.stringify(webResources));
    } catch (err) {
      //console.log("Not able download new Dimo WebResources", err);
    }
  }

  this.cleanDimoWebResources = () => {
    try {
      window.Android.cleanDimoWebResources();
    } catch (err) {
      //console.log("Not able to clear WebResources", err);
    }
  }

  this.showToast = function (string) {
    try {
      window.Android.showToast(string);
    } catch (err) {
      alert(string);
      return;
    }
  };

  this.getLaunchSource = () => {
    try {
      let source = window.Android.getLaunchSource();
      return source;
    } catch (err) {
      //console.log(err)
      return undefined;
    }
  }

  this.optinCall = function (payload) {
    if (typeof payload != "string" && typeof payload == "object")
      payload = JSON.stringify(payload);
    window.Android.email_optin(payload);
    return new Promise((resolve) => {
      resolve(payload);
    });
    //return payload;
  };

  this.openPackage = pck => {
    try {
      return window.Android.launchApp(pck);
    } catch (err) {
      return;
    }
  };

  this.openinPlayStore = pck => {
    try {
      return window.Android.openInPlaystore(pck);
    } catch (err) {
      return;
    }
  };

  this.openUrlInBrowserLegacy = function (url) {
    window.Android.openInBrowser(url);
  };

  this.openUrlInEngage = function (url) {
    window.Android.openInEngage(url);
  };

  this.getAndroidThemeColor = function () {
    return "#00A098";
  };

  this.openInEngage = function (url, storyid, notifid) {
    try {
      window.Android.openInEngage(url, storyid, notifid);
    } catch (err) {
      this.openUrlInEngage(url);
    }
  };

  this.openApp = function (intent) {
    window.Android.openApp(intent);
  };

  this.openUrlInBrowser = function (url, extraObj) {
    try {
      window.Android.openExtUrlInEngage(url, JSON.stringify(extraObj));
    } catch (err) {
      try {
        window.Android.openExtUrlInEngage(url);
      } catch (err) {
        if (!window.Android) {
          window.open(url);
        } else {
          this.openUrlInBrowserLegacy(url);
        }
      }
    }
  };

  this.openUrlInEngage = function (url) {
    window.Android.openInEngage(url);
  };

  this.getAndroidThemeColor = function () {
    return "#00A098";
  };

  this.openInEngage = function (url, storyid, notifid) {
    try {
      window.Android.openInEngage(url, storyid, notifid);
    } catch (err) {
      this.openUrlInEngage(url);
    }
  };

  this.openApp = function (intent) {
    window.Android.openApp(intent);
  };

  this.openEmail = function () {
    window.Android.openEmail();
  }

  var flag = false;
  this.showProgressDialog = function (message, clickOutsideToClose) {
    if (clickOutsideToClose === undefined) {
      clickOutsideToClose = true;
    }
    try {
      window.Android.showProgressDialog(message || "", clickOutsideToClose);
    } catch (err) {
      //console.log("Apk not supported");
    }
    flag = false;
  };

  this.hideProgressDialog = function () {
    try {
      if (flag) {
        return;
      }
      flag = true;
      window.Android.hideProgressDialog();
    } catch (err) {
      //log.log("Not on engage");
    }
  };


  this.logEvent = function (logJson) {
    //log.debug(logJson);
    try {
      window.Android.submitMetrics(JSON.stringify(logJson));
    } catch (err) {
      //log.log("No engage support");
    }
  };

  this.reportSWMetrics = (category, actionType, event) => {
    try {
      let ms = 1 * 60 * 1000;
      let curr_time = new Date();
      let stats = {
        category: category,
        type: "metrics",
        dtime: curr_time.getTime(),
        eventtype: actionType,
        tz: new Date().getTimezoneOffset() * ms * -1,
        event: event,
        version: "0.91"
      };
      return this.submitMetrics(stats);
    } catch (err) {
      //console.log("reportSWMetrics not available");
    }
  };

  this.submitPageEventMetrics = function (jsonObject) {
    try {
      if (typeof jsonObject === 'string') {
        let size = Buffer.byteLength(jsonObject);
        if (size < 2 * 1000) {
          window.Android.collectDAPageEvent(jsonObject);
        } else {
          //console.log("submitPageEventMetrics log is big " + jsonObject)
        }
      }
    } catch (err) {
      //console.log("error submitting page event Metrics");
    }
  };

  this.submitSessionEventMetrics = function (jsonObject) {
    try {
      if (typeof jsonObject === 'string') {
        let size = Buffer.byteLength(jsonObject);
        if (size < 2 * 1000) {
          window.Android.collectDASessionEvents(jsonObject);
        } else {
          //console.log("submitSessionEventMetrics log is big " + jsonObject)
        }
      }
    } catch (err) {
      //console.log("error submitting session event Metrics");
    }
  };

  this.submitAlertEventMetrics = function (jsonObject) {
    try {
      if (typeof jsonObject === 'string') {
        let size = Buffer.byteLength(jsonObject);
        if (size < 2 * 1000) {
          window.Android.collectDAAlerts(jsonObject);
        } else {
          //console.log("submitAlertEventMetrics log is big " + jsonObject)
        }
      }
    } catch (err) {
      //console.log("error submitting alert event Metrics");
    }
  };

  this.submitArbiEventMetrics = function (jsonObject) {
    try {
      if (typeof jsonObject === 'string') {
        let size = Buffer.byteLength(jsonObject);
        if (size < 2 * 1000) {
          window.Android.collectDAArbiEvents(jsonObject);
        } else {
          //console.log("submitArbiEventMetrics log is big " + jsonObject)
        }
      }
    } catch (err) {
      //console.log("error submitting arbi event Metrics");
    }
  };

  this.setStatusBarColour = function (color) {
    try {
      window.Android.setStatusBarColour(color);
    } catch (err) {
      return;
    }
  };

  this.setNavigationBarColor = function (color) {
    try {
      window.Android.setNavigationBarColor(color);
    } catch (err) {
      return;
    }
  };

  this.getDeviceParameters = function (key) {
    var result;
    var res;
    if (!key) {
      key = null;
    }
    try {
      res = window.Android.getLaunchParameter(key);
      result = JSON.parse(res);
    } catch (err) {
      result = res;
    } finally {
      //console.log(result);
      // eslint-disable-next-line no-unsafe-finally
      return result;
    }
  };

  this.shouldBypassOnboard = function () {
    var result;
    var res;
    try {
      res = window.Android.getLaunchParameter("bypassOnboarding");
      result = JSON.parse(res);
      return result;
    } catch (err) {
      result = res;
      return result;
    } finally {
      console.log(result)
    }
  };

  this.getActionFromNotif = function () {
    var result;
    var res;
    try {
      res = window.Android.getLaunchParameter("action");
      result = JSON.parse(res);
      return result;
    } catch (err) {
      result = res;
      return result;
    }
  };

  this.getUnParsedDeviceParameter = function (key) {
    var result;
    var res;
    if (!key) {
      key = null;
    }
    try {
      res = window.Android.getLaunchParameter(key);
      result = res.toSting();
    } catch (err) {
      result = res;
      return result;
    }
  };

  this.uploadImage = (multiple = true) => {
    try {
      window.Android.attachImage(multiple)
    } catch (err) {
      //console.log("Image upload api not available");
    }
  }

  this.uploadImageChatBot = (type, multiple = false) => {
    try {
      window.Android.attachImage(type, multiple)
    } catch (err) {
      //console.log("Image upload api not available");
    }
  }

  this.setUpQRWidget = (username, key, city, base64Image, userCEP) => {
    try {
      window.Android.setUpQRWidget(username, key, city, base64Image, userCEP);
    } catch (err) {
      console.log("setUpQRWidget api not available");
    }
  }

  this.checkOverlayDisplayPermission = () => {
    try {
      return window.Android.checkOverlayDisplayPermission();
    } catch (err) {
      console.log("checkOverlayDisplayPermission api not available");
      return false;
    }
  }

  this.requestOverlayDisplayPermission = () => {
    try {
      window.Android.requestOverlayDisplayPermission();
    } catch (err) {
      console.log("requestOverlayDisplayPermission api not available");
    }
  }

  this.getDeviceActivationDate = () => {
    try {
      const val = window.Android.getCCESettingsValue("blur.service.mother.creationTime", "");
      return val;
    } catch (err) {
      return undefined;
    }
  }

  this.closeWindow = function (value) {
    try {
      window.Android.closeWindow(value);
    } catch (err) {
      try {
        window.Android.closeWindow();
      } catch (err) {
        return;
      }
    }
  };

  this.captureImage = () => {
    try {
      window.Android.dispatchTakePictureIntent()
    } catch (err) {
      //console.log("Image capture not available");
    }
  }

  this.openCustomCamera = (type) => {
    try {
      window.Android.customCameraPreview(type);
    } catch (err) {
      //console.log("Image capture not available");
    }
  }


  this.pinWidget = (source) => {
    try {
      window.Android.requestPinWidget(source);
    } catch (err) {
      //console.log("requestPinWidget api not available");
    }
  }

  this.pinApp = (source) => {
    try {
      window.Android.requestPinAppShortcut(source);
    } catch (err) {
      //console.log("requestPinWidget api not available");
    }
  }

  this.openCamerPermissionSettings = () => {
    try {
      window.Android.cameraPermissionSettings();
    } catch (err) {
      //console.log('cameraPermissionSettings: err:' + err);
    }
  }

  this.isImageAttacherAvailable = () => {
    try {
      return window.Android.isImageAttacherAvailable();
    } catch (err) {
      //console.log('isImageAttacherAvailable() not available: ' + err);
      return false;
    }
  }
  this.getStoryColumn = function (id, page, d) {
    defer = d;

    /**
     * Callback function to fetch the storydom data from the device
     * @param  {String} data - Storydom json in string format
     */
    window.sendStoryColumn = function (data) {
      self.domData = data;
      defer.resolve(data);
    };

    if (this.domData[this.storyId]) {
      defer.resolve(this.domData[this.storyId]);
    } else {
      window.Android.getStoryColumn(id, "storydom");
    }
  };

  /*
  this.getStoryDomInRange = function(range) {
    var d = q.defer();
    if(!range) {
      range = {
        min: 0,
        max: 100
      };
    }
    domlist = [];
    var callList = [];
    var i = 0;
    callList.push(this.getStoryDomInRangeApi(range.min,range.max));
    q.all(callList).then(function() {
      d.resolve(domlist)
    });
    return d.promise;
  }

  const QUERY = '(state = "opened" or state = "visible")';
  this.getStoryDomInRangeApi = function(start, end) {
    var d = q.defer();
    callCounter++;
    deferArray.push(d);
    window.Android.getCardDataInRange(start, end, QUERY);
    return d.promise;
  }
  */

  this.setStoryId = function (id) {
    this.storyId = id;
  };

  this.setPageNumber = function (page) {
    this.page = page;
  };

  this.setVersion = function (storyid, version) {
    if (!this.version[storyid]) {
      this.version[storyid] = version;
    }
  };

  this.setVersionDetails = function (data) {
    var res = data.split("~#");
    this.setVersion(res[0], res[1]);
    this.setDomId(res[0], data);
  };

  this.getVersion = function (cardid) {
    var storyDetails = cardid.split("~#");
    var storyVersion;
    try {
      storyVersion = (storyDetails.length >= 2) ? storyDetails[1] : "A";
    } catch (err) {
      storyVersion = "A";
    }
    return storyVersion;
  };

  this.getValue = function (key, tableName) {
    if (!tableName) {
      tableName = AppName;
    }
    try {
      return window.Android.getString(tableName, key);
    } catch (err) {
      //console.log(err);
      return undefined;
    }
  };

  this.getImei = function () {
    try {
      return window.Android.getImei();
    } catch (err) {
      //console.log(err);
      return undefined;
    }
  };

  this.getIntValue = function (key, tableName) {
    if (!tableName) {
      tableName = AppName;
    }
    try {
      return window.Android.getInt(tableName, key, 0);
    } catch (err) {
      //console.log(err);
      return undefined;
    }
  };

  this.getLongValue = function (key, tableName) {
    if (!tableName) {
      tableName = AppName;
    }
    try {
      return window.Android.getLong(tableName, key, 0);
    } catch (err) {
      //console.log(err);
      return undefined;
    }
  };

  this.setAppRendered = (value) => {
    try {
      window.Android.setAppRendered(value)
    } catch (err) {
      //console.log("setAppRendered device api call failed", err);
    }
  }

  this.updateUIProfile = () => {
    try {
      window.Android.initiateUiProfileRequest();
    } catch (err) {
      //console.log("initiateUiProfileRequest not available on this apk");
    }
  }

  this.refreshContents = () => {
    try {
      window.Android.initiateDomRequest();
    } catch (err) {
      //console.log("initiateDomRequest not available on this apk")
    }
  }

  this.getOnboardDeviceStatus = () => {
    try {
      return window.Android.getInt(AppName, OnBoarding, -1);
    } catch (err) {
      //console.log(err);
      return -1;
    }
  }

  this.persistValue = function (key, value, tableName) {
    if (!tableName) {
      tableName = AppName;
    }
    try {
      window.Android.putString(tableName, key, value);
      return true;
    } catch (err) {
      //console.log(err);
      return false;
    }
  };

  this.persistIntValue = function (key, value, tableName) {
    if (!tableName) {
      tableName = AppName;
    }
    try {
      window.Android.putInt(tableName, key, value);
      return true;
    } catch (err) {
      //console.log(err);
      return false;
    }
  };

  this.persistLongValue = function (key, value, tableName) {
    if (!tableName) {
      tableName = AppName;
    }
    try {
      window.Android.putLong(tableName, key, value);
      return true;
    } catch (err) {
      //console.log(err);
      return false;
    }
  };

  this.isPrefsSupported = function () {
    try {
      return window.Android.putInt !== undefined;
    } catch (err) {
      return false;
    }
  };

  this.getLenovoId = function () {
    try {
      return window.Android.getLenovoId();
    } catch (err) {
      return null;
    }
  };

  this.createLenovoId = function () {
    try {
      window.Android.createLenovoId();
      return true;
    } catch (err) {
      return false;
    }
  };

  this.createLenovoIdWithGoogleId = function (gmail) {
    try {
      window.Android.createLenovoIdWithGoogleId(gmail);
      return true;
    } catch (err) {
      //console.log(err);
      return false;
    }
  };

  this.getDatePicker = function (month, year) {
    try {
      window.Android.getDatePicker(1, 0, month, year)
    } catch (err) {
      //console.log(err);
    }
  }

  this.loginLenovoId = function (gmail) {
    try {
      window.Android.loginLenovoId(gmail);
    } catch (err) {
      //console.log(err);
    }
  };

  this.signInWithGoogleId = () => {
    try {
      window.Android.signInWithGoogleId();
    } catch (err) {
      //console.log(err);
    }
  };

  this.signInWithBiometrics = () => {
    //console.log("signInwithBiometrics")
    try {
      window.Android.signInWithBiometrics();
    } catch (err) {
      //console.log(err);
    }
  };

  this.setBiometricFlag = function (status) {
    //console.log("set bimoetric " + status);
    try {
      this.persistIntValue(NEW_BIOMETRIC_ENABLED_FLAG, status);
    } catch (err) {
      //console.log(err);
    }
  }

  this.stopSignInWithBiometrics = function () {
    //console.log("stopSignInWithBiometrics");
    try {
      window.Android.stopSignInWithBiometrics();
    } catch (err) {
      //console.log(err);
    }
  }

  this.setAccountCreatedFlag = function (accountCreated) {
    try {
      window.Android.setAccountCreatedFlag(accountCreated);
    } catch (err) {
      //console.log(err);
    }
  }

  this.isAccountCreated = function () {
    try {
      //console.log("calling isAccountCreated " + window.Android.isAccountCreated())
      return window.Android.isAccountCreated();
    } catch (err) {
      return false;
    }
  };

  this.setShouldShowAtmWithdrawal = function () {
    try {
      window.Android.setShouldShowAtmWithdrawal(false);
    } catch (err) {
      //console.log(err);
    }
  }

  this.shouldShowAtmWithdrawal = function () {
    try {
      //console.log("calling shouldShowAtmWithdrawal " + window.Android.shouldShowAtmWithdrawal())
      return window.Android.shouldShowAtmWithdrawal();
    } catch (err) {
      return false;
    }
  };

  this.setShowPixOnboarding = function () {
    try {
      window.Android.setShowPixOnboarding(false);
    } catch (err) {
      //console.log(err);
    }
  }

  this.showPixOnboarding = function () {
    try {
      //console.log("calling showPixOnboarding " + window.Android.showPixOnboarding())
      return window.Android.showPixOnboarding();
    } catch (err) {
      return false;
    }
  };

  this.setAccountLoggedIn = function (loggedIn) {
    try {
      window.Android.setAccountLoggedIn(loggedIn);
    } catch (err) {
      //console.log(err);
    }
  };

  this.isAccountLoggedIn = function () {
    try {
      //console.log("calling isAccountLoggedIn " + window.Android.isAccountLoggedIn())
      return window.Android.isAccountLoggedIn();
    } catch (err) {
      return false;
    }
  };

  this.signOutGoogleId = () => {
    //console.log('signOutGoogleId');
    try {
      window.Android.signOutGoogleId();
    } catch (err) {
      //console.log(err);
    }
  };

  this.lenovoIdSignup = function () {
    try {
      //console.log("inside signup");
      window.Android.lenovoIdSignup();
    } catch (err) {
      //console.log(err);
    }
  };

  this.getLenovoIdLoginStatus = function () {
    try {
      return window.Android.getLenovoIdLoginStatus();
    } catch (err) {
      //console.log(err);
      return "error";
    }
  };

  this.getBackendVersion = function () {
    try {
      return window.Android.getBackendVersion();
    } catch (err) {
      //console.log(err);
      return "";
    }
  }

  this.getAccountsByType = function (type) {
    try {
      return window.Android.getAccountsByType(type);
    } catch (err) {
      //console.log(err);
      return "{}";
    }
  };

  this.storeToPrefs = (key, value) => {
    try {
      return window.Android.storeDataPrefs(key, value + "");
    } catch (err) {
      return false;
    }
  }

  this.getFromPrefs = (key) => {
    try {
      return window.Android.getDataPrefs(key);
    } catch (err) {
      return "";
    }
  }

  /**
   * Method to set the mapping of domid to a storyid
   * @param {String} storyid - storyid of the story
   * @param {String} data    - domid generated by the backend
   */
  this.setDomId = function (storyid, data) {
    if (!storyid) return;
    DOMID[storyid] = data;
  };

  /**
   * Method to set the mapping of domid to a storyid
   * @param {String} storyid - storyid of the story
   */
  this.getDomId = function (storyid) {
    return DOMID[storyid];
  };

  /**
   * Function to return the MCC/MNC value of the device
   * @return {Array} Array of MCC/MNC objects
   */
  this.getMccMnc = function () {
    try {
      var mcc = window.Android.getMccMncJsonObject();
      return JSON.parse(mcc);
    } catch (err) {
      //log.error(err);
      //TODO
      //Add error logging to server
      return [];
    }
  };
  const MCC_MNC = this.getMccMnc();

  /**
   * Function to fetch the ro.carrier value of the device
   * @return {String} ro.carrier value of the device
   */
  this.getRoCarrier = function () {
    try {
      return this.getSystemStringProperty("ro.carrier");
    } catch (err) {
      //log.error(err);
      //TODO
      //Add error logging to server
    }
    return undefined;
  };
  const RO_CARRIER = this.getRoCarrier();

  /**
   * Function to check if the device belongs to Brazil
   * @return {Boolean} true if yes, else false
   */
  this.isBrazilDevice = function () {
    if (this.getShipmentCountry() === "BR") {
      return true;
    }
    const mccMnc = MCC_MNC || this.getMccMnc();
    for (var i in mccMnc) {
      var sim = mccMnc[i];
      if (sim.mcc === BR_MCC) {
        return true;
      }
    }
  };

  /**
   * Function to check if the device belongs to Colombia
   * @return {Boolean} true if yes, else false
   */
  this.isColombianDevice = function () {
    const carrier = RO_CARRIER || this.getRoCarrier();
    const mccMnc = MCC_MNC || this.getMccMnc();
    const colombianCarriers = ["amxco", "tefco", "tigco", "avaco"];
    if (colombianCarriers.indexOf(carrier) > -1) {
      return true;
    }
    for (var i in mccMnc) {
      var sim = mccMnc[i];
      if (sim.mcc === 732) {
        return true;
      }
    }
    if (this.getShipmentCountry() === "CO") {
      return true;
    }
    return false;
  };

  /**
   * Function to set the resize characteristics when the soft
   * input keyboard is active
   * @param {integer} status  value indicating the characteristics to be set
   * status = SOFT_INPUT_ADJUST_NOTHING === 0x30
   * status = SOFT_INPUT_ADJUST_RESIZE === 0X10
   */
  this.setSoftInputMode = (status) => {
    try {
      window.Android.setSoftInputMode(status);
    } catch (err) {
      //console.log(err);
    }
  }

  const STATES = (this.STATES = {
    VISIBLE: "visible",
    OPENED: "opened",
    DISMISSED: "dismissed",
    WAITING: "waiting",
    EXPIRED: "expired",
    ERROR: "error",
    INVALID: "invalid"
  });

  function checkValidState(state) {
    for (var i in STATES) {
      if (STATES[i] === state) {
        return true;
      }
    }
    return false;
  }

  /**
   * Function to delete a particular story/card
   * @param {String} storyId  id of the story to be dismissed
   * @param {String} cardId   id of the card to be dismissed
   * @param {String} state    state of the card to be set
   */
  this.dismissCard = function (storyId, cardId) {
    try {
      var state = this.STATES.DISMISSED;
      if (window.Android.setCardState) {
        window.Android.setCardState(storyId, cardId, state);
      } else {
        window.Android.dismissCard(cardId);
      }
      this.dismissNotification(storyId);
    } catch (err) {
      //log.log('Android not supported');
    }
  };

  /**
   * Function to set a particular state of a story/card
   * @param {String} storyId id of the story to be dismissed
   * @param {String} cardId  id of the card to be dismissed
   * @param {String} state   state of the card to be set
   */
  this.setCardState = function (storyId, cardId, state) {
    try {
      if (!checkValidState(state)) {
        return;
      }

      if (window.Android.setCardState) {
        window.Android.setCardState(storyId, cardId, state);
      }
    } catch (err) {
      //log.log('Android not supported');
    }
  };

  /**
   * Function to dismiss a particular notification by storyid
   * @param {String} storyId id of the notification to be dismissed
   */
  this.dismissNotification = function (storyId) {
    try {
      return window.Android.dismissNotification(storyId);
    } catch (err) {
      //Not supported;
    }
  };

  /**
   * Function to set the wallpaper object
   * @param {Object} obj Wallpaper object which contains the src, name and size of the image
   * @param {String} id  Resource id of the wallpaper object, for quick reference
   */
  this.setWallpaperObject = function (obj, id) {
    WallpaperObject[id] = obj;
  };

  /**
   * Function to get the wallpaper object
   * @param {String} id  Resource id of the wallpaper object, for quick reference
   * @return {Object} The wallpaper object set
   */
  this.getWallpaperObject = function (id) {
    return WallpaperObject[id];
  };

  /**
   * Method to set the wallpaper on the device
   * @param {String} uri    - Uri encoded format of the image
   * @param {Number} option - Option of the way to set to wallpaper
   */

  /*
   this.setWallpaper = function(uri, option) {
    //const d = q.defer();

    window.onWallpaperSet = function(status) {
      d.resolve(status);
    }
    window.Android.setWallpaper(uri, option || 3);
    return d.promise;
  }*/

  /**
   * Method to save a file to the device
   * @param  {String} data       - Base64 encoded format of the data
   * @param  {String} folderName - Folder to which the file should be saved
   * @param  {String} fileName   - Name of the file
   * @return {Promise}           - Promise object of the operation
   */

  this.saveFile = function (data, folderName, fileName) {
    const d = new Promise((resolve) => {
      window.onFileSaved = function (status) {
        //console.log("saveFile status " + status);
        if (status === 1) {
          resolve(true);
        } else {
          resolve(false);
        }
      };
    });

    window.Android.saveFile(data, folderName, fileName, "MDA");
    return d;
  };

  this.getDownloadedFileName = function (folderName, fileName) {
    return window.Android.getDownloadedFileName(folderName, fileName);
  };

  /**
   * Method to show the permission dialog for specific permissions
   * @param  {String} permission - Permission to be requested
   */
  this.requestPermission = function (permission) {
    try {
      window.Android.requestPermission(permission);
    } catch (err) {
      console.error('Request permission error: ' + err);
    }
  }

  /**
   * Method to check if permission is already granted for specific permissions
   * @param  {String} permission - Permission to be checked
   */
  this.checkSelfPermission = (permission) => {
    try {
      let permissionGranted = window.Android.checkSelfPermission(permission);
      return permissionGranted;
    } catch (err) {
      console.error('Check self permission error: ' + err);
      return false;
    }
  }

  /**
   * Method to check if permission dialog has to be shown for specific permissions
   * Permission dialog won't be shown if user has previously checked
   * the 'Never Ask Again' checkbox.
   * @param  {String} permission - Permission to be requested
   */
  this.shouldShowRequestPermissionRationale = (permission) => {
    try {
      return window.Android.shouldShowRequestPermissionRationale(permission);
    } catch (err) {
      //console.log('Should Show Request Permission error: ' + err);
      return true;
    }
  }


  this.getAd = function () {
    try {
      return window.Android.getAds();
      //TODO: Change it to a asynchronous task with the callback function 'onAdsAvailable'
    } catch (err) {
      //console.log("No apk support");
      console.error(err);
    }
    return;
  };

  /**
   * Method to share the contents of the card
   * @param  {String} image - Base64 encoded string of the image
   * @param  {String} text  - Title of the card configured
   * @return {Boolean} If the apk supports share or not
   */
  this.shareContent = function (image = "", text, packageName) {
    try {
      if (this.isFeatureEnabledInApk("DIMO_DOC_SHARE") && image !== null) {
        let fileName = "";
        fileName = fileName + ".png";
        this.shareDocumentFile(image, text, fileName);
      } else {
        window.Android.shareDAContent(image, text, packageName);
      }
      return true;
    } catch (err) {
      try {
        window.Android.shareContent(image, text);
        return true;
      } catch (err) {
        //console.warn("Sharing not supported in this apk");
        return false;
      }
    }
  };

  this.sharePdfFile = function (image = "", fileName) {
    try {
      if (this.isFeatureEnabledInApk("DIMO_DOC_SHARE")) {
        fileName = fileName + ".pdf";
        this.shareDocumentFile(image, "", fileName);
      } else {
        window.Android.sharePdfFile(image, fileName);
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  this.shareDocumentFile = function (image = "", header, fileName) {
    try {
      window.Android.shareDocumentFile(image, header, fileName);
      return true;
    } catch (err) {
      return false;
    }
  };

  this.openDocumentFile = function (fileName) {
    try {
      window.Android.openDocumentFile(fileName);
      return true;
    } catch (err) {
      return false;
    }
  };

  /**
   * Method to share the stream of cards to the device
   * @param  {String} title - Heading of the card to be shared
   * @param  {String} url   - Url of the corresponding card
   */
  this.shareNewsfeed = function (title, url) {
    try {
      window.Android.shareNewsfeed(title, url);
    } catch (err) {
      //  log.error('Sharing of cards not supported in this apk');
    }
  };

  this.isBiometricEnabled = () => {
    try {
      //console.log("calling isBiometricEnabled " + this.getIntValue(NEW_BIOMETRIC_ENABLED_FLAG));
      return this.getIntValue(NEW_BIOMETRIC_ENABLED_FLAG);
    } catch (err) {
      return false;
    }
  };

  this.setAccountCreatedFlag = function (accountCreated) {
    try {
      window.Android.setAccountCreatedFlag(accountCreated);
    } catch (err) {
      //console.log(err);
    }
  }

  this.shareEngageCard = function (title, url, image = "") {
    try {
      window.Android.shareContent(title, image);
    } catch (err) {
      //log.error('Sharing of cards not supported in this apk');
    }
  };

  this.enableAds = function (bool) {
    try {
      window.Android.enableAds(bool);
    } catch (err) {
      //log.error('Apk not supported');
    }
  };

  this.isPackageAvailable = (packageName) => {
    try {
      //below device api returns 0 if not installed
      //1,2,3 installed
      //further specification 3 - updated system, 2 - system, 1 - data app
      let resp = window.Android.isPackageAvailable(packageName);
      if ((resp === 1) || (resp === 2) || (resp === 3)) {
        return true;
      } else {
        return false;
      }
      //console.log("isPackageAvailable", resp);
    } catch (err) {
      //console.warn("Package check is not supprted in this Apk ");
      return false;
    }
  }

  this.getAppsInLauncher = () => {
    try {
      window.Android.getAppsInLauncher();
    } catch (err) {
      //console.warn("getAppsInLauncher not supported in this apk " + err);
    }
  }

  this.getDigitalAccountEnvironment = () => {
    try {
      let environment = window.Android.getDigitalAccountEnvironment();
      //console.log("calling getDigitalAccountEnvironment " + environment);
      return environment;
    } catch (err) {
      return "";
    }
  }

  this.getDigitalAccountUrl = () => {
    try {
      let url = window.Android.getDigitalAccountUrl();
      return url;
    } catch (err) {
      return "";
    }
  }

  this.getBackendCloud = () => {
    try {
      let cloud = window.Android.getBackendCloud();
      //console.log("calling getBackendCloud " + cloud);
      return cloud;
    } catch (err) {
      return "";
    }
  }

  // Returns true if the security level is sercure or undefeined, false if it is NonSecure
  this.getArbiApiCallSecurityLevel = () => {
    try {
      let securityLevel = window.Android.getArbiApiCallSecurityLevel();
      //console.log("calling getArbiApiCallSecurityLevel " + securityLevel);
      return securityLevel !== "NonSecure";
    } catch (err) {
      return true;
    }
  }

  /**
   * Http status call backs for optin and optout calls
   * @param {Number} status - Status code of the call
   */
  window.receivedhttpStatus = function (status) {
    return new Promise((resolve) => {
      resolve(status);
    });
    //defer.resolve(status);
  };

  /**
   * Callback function to fetch the cards data from device
   * @param  {String} data - Cards json in string format
   */
  window.receivedCardDataInRange = function (data) {
    /*if((domlist || []).length === 0){
      domlist = data.cards;
    } else{
      data.forEach(function(story) {
        domlist.push(story);
      });
    }*/
    if (deferArray.length > 0) {
      deferArray[0].resolve(data);
      deferArray.splice(0, 1);
    }
  };

  this.storeToPrefs = (key, value) => {
    try {
      return window.Android.storeDataPrefs(key, value + "");
    } catch (err) {
      //console.log(err);
      return false;
    }
  }

  this.getFromPrefs = (key) => {
    try {
      let returnValue = window.Android.getDataPrefs(key);
      return returnValue;
    } catch (err) {
      //console.log(err);
      return "";
    }
  }

  this.checkBiometricsEnabled = () => {
    try {
      return window.Android.checkBioMetricCanAuthenticate();
    } catch (err) {
      //console.log(err)
      return "";
    }
  }

  this.askToSetUpBiometrics = () => {
    try {
      return window.Android.askUserToEnroll()
    } catch (err) {
      //console.log(err)
    }
  }

  this.storeEncryptPrefs = (key, value, auth = true) => {
    try {
      window.Android.encryptData(key, value, auth);
    } catch (err) {
      //console.log(err)
    }
  }

  this.getEncryptPrefs = (key, auth = true) => {
    try {
      window.Android.decryptData(key, auth);
    } catch (err) {
      //console.log(err)
    }
  }

  this.clearFromEncryptedprefs = (key) => {
    try {
      window.Android.removeFromEncryptedSharedPreference(key);
    } catch (err) {
      //console.log(err);
    }
  }

  this.copyToClipBoard = (textToBeCopied) => {
    try {
      //console.log("copyToClipBoard " + textToBeCopied);
      window.Android.copyToClipBoard(textToBeCopied);
    } catch (err) {
      //console.log("copyToClipBoard " + err);
    }
  }

  this.scanPixQR = () => {
    try {
      window.Android.scanPixQR();
    } catch (err) {
      //console.log(err)
    }
  }

  this.shareWalletImage = (data, heading, fileName) => {
    try {
      if (this.isFeatureEnabledInApk("DIMO_DOC_SHARE")) {
        fileName = fileName + ".png";
        this.shareDocumentFile(data, heading, fileName);
      } else {
        window.Android.shareDAContent(data, heading, fileName);
      }
    } catch (err) {
      //console.log(err);
    }
  }

  this.getMotopayQRCode = () => {
    try {
      return window.Android.getMotopayQR();
    } catch (err) {
      //console.log(err);
      return ""
    }
  }

  this.clearMotopayQRCode = () => {
    try {
      return window.Android.clearMotopayQR();
    } catch (err) {
      //console.log(err);
      return ""
    }
  }

  this.getMotopayDeepLinkUrl = () => {
    try {
      return window.Android.getMotopayDeepLinkUrl();
    } catch (err) {
      //console.log(err);
      return ""
    }
  }

  this.clearMotopayDeepLinkUrl = () => {
    try {
      window.Android.clearMotopayDeepLinkUrl();
    } catch (err) {
      //console.log(err);
    }
  }

  this.readOtp = () => {
    try {
      window.Android.startListenForSMSOtp();
    } catch (err) {
      //console.log(err);
    }
  }

  this.enableCopyPaste = () => {
    try {
      window.Android.enableCopyPaste();
    } catch (err) {
      //console.log(err);
    }
  }

  this.disableCopyPaste = () => {
    try {
      window.Android.disableCopyPaste();
    } catch (err) {
      //console.log(err);
    }
  }

  this.startDialer = (phNum) => {
    try {
      window.Android.launchDialer(phNum);
    } catch (err) {
      //console.log(err);
    }
  }

  this.setDAVersion = (version) => {
    try {
      window.Android.setWebviewVersion(version);
    } catch (err) {
      //console.log(err);
    }
  }

  this.getMotopayJwt = () => {
    try {
      return window.Android.getMotopayJwt();
    } catch (err) {
      //console.log(err);
      return ""
    }
  }

  this.storeMotopayJwt = (token) => {
    try {
      window.Android.storeMotopayJwt(token);
    } catch (err) {
      //console.log(err);
    }
  }

  this.setOnboardingProgressInfo = (status) => {
    try {
      window.Android.setOnboardingProgressInfo(status);
    } catch (err) {
      //console.log(err);
    }
  }

  this.updateDownloadNotification = (message, fileName) => {
    try {
      window.Android.updateDownloadNotification(message, fileName);
    } catch (err) {
      //console.log(err);
    }
  }

  this.openReceipt = (fileName) => {
    try {
      if (this.isFeatureEnabledInApk("DIMO_DOC_SHARE")) {
        this.openDocumentFile(fileName);
      } else {
        window.Android.openReceipt(fileName);
      }
    } catch (err) {
      //console.log(err);
    }
  }

  this.getHyUrl = () => {
    /* To open HY from Dimo use openHY() method */
    try {
      return window.Android.getHyUrl();
    } catch (err) {
      //console.log(err);
    }
  }

  this.openHY = () => {
    try {
      let hyUrl = this.getHyUrl();
      window.location.replace(hyUrl);
    } catch (err) {
      //console.log(err);
    }
  }

  this.setDefaultFontSize = () => {
    try {
      window.Android.setDefaultFontSize();
    } catch (err) {
      //console.log(err);
    }
  }

  this.checkDisplaySize = () => {
    try {
      var dimensions = JSON.parse(window.Android.getScreenDimensions());
      let density = dimensions.scaledDensity;
      let displaySize = "";
      if (density >= 4.0) {
        displaySize = "EXTRA_LARGE_SCREEN";
      } else if (density >= 3.0) {
        displaySize = "NEXT_LARGE_SCREEN";
      } else if (density >= 2.0) {
        displaySize = "LARGE_SCREEN";
      } else if (density >= 1.5) {
        displaySize = "NORMAL_SCREEN";
      } else {
        displaySize = "SMALL_SCREEN";
      }
      return displaySize;
    } catch (err) {
      //console.log(err);
    }
  }

  this.isDeviceNotSecure = () => {
    try {
      window.Android.isNotSecure();
    } catch (err) {
      //console.log(err);
    }
  }

  this.getWalletTabId = function () {
    try {
      return window.Android.getDAStringPrefs("walletTabId");
    } catch (err) {
      //console.log(err);
      return -1;
    }
  };

  this.getDAStringPrefs = function (key) {
    try {
      return window.Android.getDAStringPrefs(key);
    } catch (err) {
      //console.log(err);
      return "";
    }
  };

  this.setDAStringPrefs = function (key, value) {
    try {
      window.Android.setDAStringPrefs(key, value);
    } catch (err) {
      //console.log(err);
    }
  };

  this.submitMetrics = function (json) {
    try {
      window.Android.dumpMetrics(JSON.stringify(json));
    } catch (err) {
      //console.log("error submitting Metrics");
      //log.log("No engage support");
    }
  };

  //check to see if the device is non moto
  this.checkIfNm = function () {
    try {
      return window.Android.isNm();
    } catch (err) {
      return false;
    }
  };

  this.getPackageName = function () {
    try {
      return window.Android.getPackageName();
    } catch (err) {
      return "";
    }
  };


  //check to see if device supports only motopay
  this.checkIfMpOnly = function () {
    try {
      return window.Android.isMpOnly();
    } catch (err) {
      return false;
    }
  };

  //check to see if session has expired
  this.isSessionExpired = function () {
    try {
      return window.Android.isExpiredSession();
    } catch (err) {
      return false;
    }
  }

  //Fetch session token for web requests
  this.getNmSessionToken = function () {
    try {
      return window.Android.getNmSessionToken();
    } catch (err) {
      return "";
    }
  }

  //Environment detection in non moto devices
  this.getNonMotoEnvironment = function () {
    try {
      return window.Android.getDeviceType();
    } catch (err) {
      return "staging";
    }
  }

  this.hasCoarsePermission = () => {
    try {
      return window.Android.hasCoarsePermission();
    } catch (err) {
      //console.log(err);
    }
  }

  this.getCurrentLocation = () => {
    try {
      window.Android.getCurrentLocation();
    } catch (err) {
      //console.log(err);
    }
  }

  this.requestFineOrCoarseLocation = () => {
    try {
      window.Android.requestFineOrCoarseLocation();
    } catch (err) {
      //console.log(err);
    }
  }

  this.getSessionId = () => {
    try {
      if (sessionId) {
        return sessionId;
      } else {
        sessionId = window.Android.getSessionId();
        return sessionId;
      }
    } catch (error) {
      return undefined;
    }
  }

  this.getDocDetectorSdk = function (type, token, cpf) {
    try {
      return window.Android.cafDocumentDetector(type, token, cpf);
    } catch (err) {
      //console.log("Error fetching doc detecor" + err)
      return "staging";
    }
  }

  this.passiveFaceLiveness = function (token, cpf) {
    try {
      return window.Android.passiveFaceLiveness(token, cpf);
    } catch (err) {
      //console.log("Error fetching doc detecor" + err)
      return "staging";
    }
  }

  this.faceLiveness = function (token, cpf) {
    try {
      return window.Android.faceLiveness(token, cpf);
    } catch (err) {
      //console.log("Error fetching doc detecor" + err)
      return "staging";
    }
  }

  this.setDimoLoggingDefaults = (defaultJsonString) => {
    try {
      if (defaultJsonString !== "" || defaultJsonString !== undefined || defaultJsonString !== null) {
        window.Android.DimoLoggerDefaultValues(defaultJsonString);
      } else {
        //console.log("Default Logger JSON not available");
      }
    } catch (error) {
      //console.log("Error setting default JSON");
    }
  }

  this.getContactsForRecharge = () => {
    try {
      return window.Android.getContacts();
    } catch (err) {
      //console.log(err);
    }
  }

  this.getShoppingUrl = () => {
    try {
      return window.Android.getMarketPlaceUrl();
    } catch (err) {
      //console.log(err);
    }
  }

  this.getUserEmail = () => {
    try {
      return window.Android.getEmailsList();
    } catch (err) {
      //console.log("getUserEmail" + err);
    }
  }

  this.getUserPhoneNumber = () => {
    try {
      return window.Android.getPhoneNumbersList();
    } catch (err) {
      //console.log("getUserPhoneNumber" + err);
    }
  }
  this.updateCameraCPValues = function (cpAppValue) {
    try {
      const jsonqrCodesList = JSON.stringify(qrCodesList);
      window.Android.clearCameraCPValues();
      window.Android.updateCameraCPValues(jsonqrCodesList, cpAppValue);
    } catch (err) {
      //console.log(err);
    }
  }

  this.updateRoaStatus = function (roa, ted, boleto, pix) {
    try {
      let jsonObj = {
        "readoutAloud": roa,
        "roaTEDMsg": ted,
        "roaBoletoMsg": boleto,
        "roaPixMsg": pix
      }
      window.Android.readoutAloudDefaultValues(JSON.stringify(jsonObj));
    } catch (err) {
      console.log(err);
    }
  }

  this.getRoaStatus = function () {
    try {
      let jsonObj = window.Android.sendReadoutAloudDefaultValues();
      if (jsonObj.length === 0) {
        jsonObj = {
          "readoutAloud": false,
          "roaTEDMsg": false,
          "roaBoletoMsg": false,
          "roaPixMsg": false
        }
      }
      return jsonObj;
    } catch (err) {
      return {
        "readoutAloud": false,
        "roaTEDMsg": false,
        "roaBoletoMsg": false,
        "roaPixMsg": false
      }
    }
  }

  this.smartRemainder = function (jsonObj) {
    try {
      window.Android.smartRemainder(jsonObj)
    } catch (error) {
      return error;
    }
  }

  this.getBootloaderStatus = () => {
    let build = "";
    let secureHardware;
    let bootState;
    try {
      secureHardware = this.getSystemStringProperty("ro.boot.secure_hardware");
      bootState = this.getSystemStringProperty("ro.boot.verifiedbootstate");
      if (secureHardware === "1") {
        if (bootState === "green") {
          build = "locked";
        } else {
          build = "unlocked";
        }
      } else {
        build = "unsecure-hardware";
      }
    } catch (err) {
      // console.log(err)
    }
    return build;
  };

  this.isBootloaderUnlocked = () => {
    let build;
    try {
      build = !(this.getBootloaderStatus() === "locked");
    } catch (err) {
      // console.log(err)
    }
    return build;
  };

  this.emptyValueCheck = (value) => {
    if (value === "" || value == null || value === undefined) {
      return true;
    } else {
      return false;
    }
  }

  this.isDeviceRooted = () => {
    let build = true;
    let isDeviceRemounted;
    let isDeviceVerityDisabled;
    try {
      isDeviceRemounted = this.getSystemStringProperty("dev.mnt.blk.mnt.scratch");
      isDeviceVerityDisabled = this.getSystemStringProperty("ro.boot.veritymode");
      build = this.isBootloaderUnlocked() ||
        !this.emptyValueCheck(isDeviceRemounted.toLowerCase()) ||
        isDeviceVerityDisabled.toLowerCase() === "disabled";
    } catch (err) {
      // console.log(err)
    }
    return build;
  };

}
