import Globals from "./Config/config";
import httpRequest from "./httpRequest";
import androidApiCalls from "./androidApiCallsService";
import constantObjects from "./Constants";
import Utils from "../WalletComponents/EngageCardComponent/Utils";
import Log from "../Services/Log";
import MetricsService from "./MetricsService";
import NewUtilities from "./NewUtilities";

function ApiService() {

  this.authWalletProfile = function (payloadJson) {
    let url = Globals.get("authWalletProfile");
    return httpRequest.postRequest(url, payloadJson);
  };

  this.createUser = function (payloadJson) {
    let url = Globals.get("createUser");
    return httpRequest.postRequest(url, payloadJson);
  };

  this.emailVerification = function (payloadJson) {
    let url = Globals.get("emailVerification");
    return httpRequest.postRequest(url, payloadJson);
  };
  this.getDataSyncProperties = function (clientKey) {
    let url = Globals.get("getDataSyncProperties");
    url = url + clientKey;
    return httpRequest.getRequest(url);
  };

  this.getStatus = function (barcode, deviceId, cpf, imei) {
    let url = Globals.get("getStatus");
    const payloadJSON = {
      "barcode": barcode,
      "deviceId": deviceId,
      "cpf": cpf,
      "imei": imei
    }
    return httpRequest.postRequest(url, payloadJSON);
  };

  this.getStatusV2 = function (barcode, deviceId, cpf, imei) {
    let url = Globals.get("getStatusV2");
    const payloadJSON = {
      "barcode": barcode,
      "deviceId": deviceId,
      "cpf": cpf,
      "imei": imei
    }
    return httpRequest.postRequest(url, payloadJSON);
  };

  this.setStatus = function (barcode, gcClientKey, deviceId, cpf, imei) {
    let url = Globals.get("setStatus");
    let payloadJson = {
      "barcode": barcode,
      "gcClientKey": gcClientKey,
      "deviceId": deviceId,
      "cpf": cpf,
      "imei": imei
    }
    return httpRequest.postRequest(url, payloadJson);
  };

  this.getEligibleForGiftCardPromotion = function (barcode) {
    let url = Globals.get("getEligibleForGiftCardPromotion");
    url = url + barcode ;
    return httpRequest.getRequest(url);
  };

  this.setEligibleForGiftCardPromotion = function (barcode, isEligible) {
    let url = Globals.get("setEligibleForGiftCardPromotion");
    let payloadJson = {
      "barcode": barcode,
      "isEligible": isEligible
    }
    return httpRequest.postRequest(url, payloadJson);
  };

  this.getGiftCardNewJourneyStatus = function () {
    let url = Globals.get("getNewFeatureStatus");
    return httpRequest.getRequest(url);
  };

  this.getGiftCardPhase3Status = function () {
    let url = Globals.get("getStatusGiftCardPhase3");
    return httpRequest.getRequest(url);
  };

  this.postWalletProfile = function (params, payloadJson) {
    let url = Globals.get("getWalletProfile");
    return httpRequest.postRequest(url, payloadJson, params);
  };

  this.createWalletProfile = function (payloadJson) {
    let url = Globals.get("createWalletProfile");
    return httpRequest.postRequest(url, payloadJson);
  };

  this.deActivateAccount = function (payloadJson) {
    let url = Globals.get("deactivateAccount");
    return httpRequest.postRequest(url, payloadJson);
  };

  this.requestOtp = function (payloadJson) {
    let url = Globals.get("postOtpRequest");
    url = url + "/" + payloadJson["userId"];
    return httpRequest.getRequest(url);
  }

  this.userInformation = function (payloadJson) {
    let url = Globals.get("userInformation");
    return httpRequest.postRequest(url, payloadJson);
  }

  this.validateOtp = function (payloadJson) {
    let url = Globals.get("validateOtp");
    url = url + "/" + payloadJson["userId"];
    return httpRequest.postRequest(url, payloadJson["otp"], "text/plain");
  }

  this.changePassword = function (payloadJson) {
    let url = Globals.get("changePassword");
    return httpRequest.postRequest(url, payloadJson);
  };

  this.getUserName = function (userName) {
    let url = Globals.get("userName");
    url = url + "/" + userName;
    return httpRequest.getRequest(url, "");
  }

  this.getBackendVersion = () => {
    let params = {},
      url = Globals.get("getVersion");
    return httpRequest.getRequest(url, params);
  }

  this.reportMetrics = function (payloadJson) {
    let url = Globals.get("analytics");
    return httpRequest.postRequest(url, payloadJson, "text/plain");
  }

  this.reportEncryptedLogs = function (payloadJson) {
    let url = Globals.get("logs");
    return httpRequest.postRequest(url, payloadJson, "application/json");
  }

  this.getPublicKey = function () {
    let url = Globals.get("publicKey");
    return httpRequest.getRequest(url, "");
  }

  this.getHelpFaq = function (locale) {
    let url = Globals.get("ptHelpFaq")
    if (locale.includes("en_")) {
      url = Globals.get("enHelpFaq")
    }
    return httpRequest.getRequest(url)
  }

  this.getFaqAnswer = function (locale, questionCode) {
    let url = Globals.get("ptFaqAnswer")
    if (locale.includes("en_")) {
      url = Globals.get("enFaqAnswer")
    }
    url = url + questionCode
    return httpRequest.getRequest(url)
  }

  this.getExternalHelpFaq = function (locale) {
    let url = Globals.get("ptExternalHelpFaq")
    if (locale.includes("en_")) {
      url = Globals.get("enExternalHelpFaq")
    }
    return httpRequest.getRequest(url)
  }

  this.getExternalFaqAnswer = function (locale, questionCode) {
    let url = Globals.get("ptExternalFaqAnswer")
    if (locale.includes("en_")) {
      url = Globals.get("enExternalFaqAnswer")
    }
    url = url + questionCode
    return httpRequest.getRequest(url)
  }

  this.getTarrifData = function (locale) {
    let url = Globals.get("tarrifContentPt")
    if (locale.includes("en_")) {
      url = Globals.get("tarrifContentEn")
    }
    return httpRequest.getRequest(url)
  }

  this.getTimeData = function (locale) {
    let url = Globals.get("timeContentPt")
    if (locale.includes("en_")) {
      url = Globals.get("timeContentEn")
    }
    return httpRequest.getRequest(url)
  }

  this.getZohoTickets = function (payloadJson) {
    let url = Globals.get("chatTicketsRequest")
    return httpRequest.postRequest(url, payloadJson, "application/json");
  }

  this.getTicketComments = function (payloadJson) {
    let url = Globals.get("chatTicketCommentsRequest")
    return httpRequest.postRequest(url, payloadJson, "application/json");
  }

  this.postTicketComments = function (payloadJson) {
    let url = Globals.get("chatTicketCommentsPostRequest")
    return httpRequest.postRequest(url, payloadJson, "application/json");
  }

  this.postTicketRatings = function (payloadJson) {
    let url = Globals.get("chatPostRatings")
    return httpRequest.postRequest(url, payloadJson, "application/json");
  }

  // To fetch wallet tab id from ui profile
  this.getWalletTabIdFromUiProfile = function () {
    let result = new Promise((resolve) => {
      let walletTabId = androidApiCalls.getWalletTabId();
      if (!walletTabId) {
        window.onUiProfileComplete = (status, tabId) => {
          if (status === "success") {
            resolve(tabId);
          } else {
            resolve("")
          }
        }
        window.Android.initiateUiProfileForWallet();
      } else {
        resolve(walletTabId);
      }
    });
    return result;
  }

  //Required for performing registration or refreshing session in non moto devices.
  this.performRegistrationOrRefreshToken = async function () {
    let result = new Promise((resolve) => {
      let isExpired = androidApiCalls.isSessionExpired();
      if (!isExpired) {
        let sessionToken = androidApiCalls.getNmSessionToken();
        resolve(sessionToken);
      } else {
        //session expired, so call refresh token and register for callback
        window.onTokenRefreshComplete = (status, newToken) => {
          if (status === "success") {
            resolve(newToken);
          } else {
            resolve("")
          }
        };
        window.Android.performRegistrationOrRefreshToken();
      }
    });
    return result;
  }

  this.getDomResponse = async function (tabName) {
    let json = {
      motoplace: true,
      locale: androidApiCalls.getLocale(),
      tabName,
      rid: androidApiCalls.getDeviceId() + new Date().getTime()
    }
    let url = Globals.getEngage("getdom");
    return httpRequest.getRequest(url, json, "engage");
  }

  this.getMotopayToken = function (credentials) {
    let url = "";
    if (androidApiCalls.checkIfNm()) {
      url = Globals.get("getTokenForNm");
    } else {
      url = Globals.get("getToken");
    }
    return httpRequest.postRequest(url, credentials);
  }

  this.submitFeedback = function (payloadJson) {
    let url = Globals.getEngage("feedBack");
    return httpRequest.postRequest(url, payloadJson, "application/json", "engage");
  };

  this.uploadImage = (url, payloadJSON) => {
    return httpRequest.postRequest(url, payloadJSON, "application/json", "engageFileParams");
  };

  this.uploadImageFromChatBot = (url, payloadJSON, type) => {
    return httpRequest.putRequest(url, payloadJSON, type);
  };

  this.signedUrlChatBot = (payloadJson) => {
    let url = Globals.get("secureUrlChatbot");
    return httpRequest.postRequest(url, payloadJson);
  }

  this.getDialogDom = function (params) {
    let url = Globals.getEngage("getDialogDom");
    params.barcode = androidApiCalls.getBarcode();
    params.deviceid = androidApiCalls.getDeviceId();
    params.anonymizedSerialNumber = NewUtilities.getMetadataForDeviceType();
    params.locale = androidApiCalls.getLocale();

    Log.debug('Calling getDialogDom with params: ' + JSON.stringify(params));

    return httpRequest.getRequest(url, params, "engage").catch(err => {
      Log.sDebug(err, "getDialogDom API service", constantObjects.LOG_PROD);
    });
  }
  this.getReelsDom = function (params = {}) {
    let url = Globals.getEngage("getReelsDom");
    return httpRequest.getRequest(url, params, "engage").catch(err => {
      Log.sDebug(err, "getReels API service", constantObjects.LOG_PROD);
    });
  };

  this.reportEngageActions = function (payload, params) {
    let url = Globals.getEngage("eoperations");
    params = params || {};
    let payloadJson = generateMetricsMetadata(payload);
    return httpRequest.postRequest(url, payloadJson, params, "engage");
  };

  function generateMetricsMetadata(stats) {
    let obj = {
      channelid: androidApiCalls.getChannelId() || "web version",
      scountry: androidApiCalls.getShipmentCountry() || "web version",
      hwtype: androidApiCalls.getHWType() || "web version",
      locale: androidApiCalls.getLocale() || navigator.language,
      stats: [stats]
    };
    return obj;
  }

  this.getDialog = function (popupParams) {
    let timeAtLaunch = popupParams.launchTime || new Date().getTime();
    let result = this.getDialogDom(popupParams);
    let reqResolved = false;

    return new Promise((resolve, reject) => {
      result.then(response => {
        Log.debug('Response getDialogDom with result: ' + JSON.stringify(response));

        if (!reqResolved) {
          reqResolved = true;
          let respData = {};

          let dropDialogResponse = false;
          let dialogTimeoutInSeconds = 8;
          let cancellable = false;
          let position = "center";
          let animation = null;

          try {
            const data = response.data;
            const versionedData = data['A'] || data['B'];
            
            dialogTimeoutInSeconds = versionedData.default[0].dom.dialogTimeout || 8;
            cancellable = versionedData.default[0].dom.dialogcancellable;
            position = versionedData.default[0].dom.aligndialog.toLowerCase();
            animation = versionedData.default[0].dom.animation;
          } catch (err) {
            dialogTimeoutInSeconds = 8;
          }

          if (["onMDAlogin"].includes(popupParams.dialogtrigger)) {
            let timeNow = new Date();
            //Wait for max of dialogTimeoutInSeconds seconds to show dialog from the time of applaunch
            dropDialogResponse = (timeNow.getTime() - timeAtLaunch) / 1000 > dialogTimeoutInSeconds;
          }

          if (!dropDialogResponse && response && Object.keys(response.data).length !== 0) {
            let extraObj = {
              customDomDialog: true,
              cancellable: cancellable,
              animation: animation,
              position: position,
            };
            respData.main = { dialogData: response.data };
            respData.extra = extraObj;
            dropDialogResponse = false;
          } else {
            if (!response) {
              let eventObj = { params: popupParams, type: 'null response' };
              Utils.reportMetrics("dialog", "dialogDropped", eventObj);
            } else if (dropDialogResponse) {
              let eventObj = { id: this.dialogId, type: 'dropDialogResponse', params: popupParams };
              Utils.reportMetrics("dialog", "dialogDropped", eventObj);
              Log.sDebug("Dropping dialog response as it arrived after 8 seconds from applaunch","API service");
            }
          }

          Log.debug('Returing getDialog success with resolve: ' + JSON.stringify(respData));

          resolve(respData);
        }
      });

      result.catch(resp => {
        Log.debug('Returning getDialog reject with result: ' + JSON.stringify(resp));

        try {
          reject("Http error code " + resp.message);
        } catch (err) {
          let eventObj = { params: popupParams, type: 'dialogcallfailed' };
          Utils.reportMetrics("dialog", "dialogDropped", eventObj);
          Log.sDebug(err,"API service", constantObjects.LOG_PROD);
        }
      });
    });
  };

  this.setOptinStatus = async function (payloadJson) {
    let url = Globals.get("setOptinStatus");
    let payload = await MetricsService.getSecurePayload(payloadJson);
    return httpRequest.postRequest(url, payload);
  }

  this.preOptinStatus = async function (payloadJson) {
    let url = Globals.get("preUpdateOptin");
    let payload = await MetricsService.getSecurePayload(payloadJson);
    return httpRequest.postRequest(url, payload);
  }

  this.getOptinStatus = function (cpf) {
    let url = Globals.get("getOptinStatus");
    url = url + "/" + cpf;
    return httpRequest.getRequest(url);
  }

  this.sendWaitListInfo = async function (payloadJson) {
    let url = Globals.get("waitListRegister");
    let payload = await MetricsService.getSecurePayload(payloadJson);
    return httpRequest.postRequest(url, payload);
  }

  this.sendMotoSafeInfo = async function (payloadJson) {
    let url = Globals.get("motoSafeRequest");
    return httpRequest.postRequest(url, payloadJson);
  }

  this.getCAFSecretKeys = function () {
    let url = Globals.get("getCAFToken");
    return httpRequest.getRequest(url);
  }

  this.getOnboardingClientId = function () {
    let url = Globals.get("getOnboardingClientId");
    console.log("getOnboardingClientId url ", url)
    return httpRequest.getRequest(url);
  }
}

export default new ApiService();