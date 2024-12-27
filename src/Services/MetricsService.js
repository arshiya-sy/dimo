import androidApiCalls from "../Services/androidApiCallsService";
import apiService from "../Services/apiService"
import { AsymmetricCrypto } from './AsymmetricCrypto';
import { SymmetricCrypto } from './SymmetricCrypto';
import SessionMetricsTracker from "./SessionMetricsTracker";
import ImportantDetails from "../WalletComponents/NewLaunchComponents/ImportantDetails";
import Log from "./Log";
import deploymentVersion from "./deploymentVersion.json";
import PageState from "./PageState";
import moment from "moment";
import constantObjects from "./Constants";
import GeneralUtilities from "./GeneralUtilities";
import Utils from "../WalletComponents/EngageCardComponent/Utils";
import DBService from "../Services/DBService";
import { v4 as uuidv4 } from 'uuid';

const ActionTypes = Utils.getActionTypes();

export default new MetricService();

export const ONBOARD_STATUS = Object.freeze({
  PRIVACY_ACCEPTED: "PRIVACY_ACCEPTED",
  PRIVACY_REJECTED: "PRIVACY_REJECTED",
  USER_CREATED: "USER_CREATED",
  DOCUMENT_UPLOADED: "DOCUMENT_UPLOADED",
  SELFIE_UPLOADED: "SELFIE_UPLOADED",
  PERSONAL_INFO_ENTERED: "PERSONAL_INFO_ENTERED",
  TERMS_AND_CONDITIONS_SIGNED: "TERMS_AND_CONDITIONS_SIGNED",
  CLIENT_APPROVED: "CLIENT_APPROVED",
  CLIENT_REJECTED_ERROR_SELFIE: "CLIENT_REJECTED_ERROR_SELFIE",
  CLIENT_REJECTED_ERROR_DOCS: "CLIENT_REJECTED_ERROR_DOCS",
  CLIENT_REJECTED_ERROR_DOC_INFO: "CLIENT_REJECTED_ERROR_DOC_INFO",
  CLIENT_REJECTED_ERROR_MULTIPLE: "CLIENT_REJECTED_ERROR_MULTIPLE",
  CLIENT_REJECTED_OTHER: "CLIENT_REJECTED_OTHER",
  ACCOUNT_CREATED: "ACCOUNT_CREATED",
  ACCOUNT_LOGGED_IN: "ACCOUNT_LOGGED_IN"
});

export const OPERATIONS_VERSION_MAP = {
  "save": 0.9,
  "unsave": 0.9,
  "share": 0.9,
  "delete": 0.9,
  "undodelete": 0.9,
  "carduseful": 0.9,
  "cardsurvey": 0.9,
  "cardnotuseful": 0.9,
  "view": 0.9,
  "click": 0.9,
  "served": 0.9,
  "scratchCoverVIew": 1.0,
  "scratchAttempt": 1.0,
}

function MetricService() {
  let prevStartTime;
  let currentStartTime;
  let timeSpent;
  let prev_page_name;
  let current_page_name;
  let pageTable = [];
  let sessionData = {};
  this.publicKey = "";
  let oldVia = "";

  this.onTransitionStart = (title) => {
    if (prevStartTime) {
      current_page_name = title;
      currentStartTime = new Date().getTime();
    } else {
      prev_page_name = title;
      prevStartTime = new Date().getTime();
    }
  };

  this.onTransitionStop = () => {
    timeSpent = new Date().getTime() - prevStartTime;
    Log.sDebug(prev_page_name, "metricService");
    this.reportPageCloseMetrics(prev_page_name, prevStartTime);
    prevStartTime = currentStartTime;
    prev_page_name = current_page_name;
  };

  this.reportPageCloseMetrics = (page_name, startTime) => {
    var event = {
      eventType: "Close",
      tm_spent: timeSpent,
      page_name: page_name,
    };
    this.reportPageEventMetrics("Page_Metrics", event, startTime);
  };

  this.onPageTransitionStart = (title) => {
    if (oldVia !== androidApiCalls.getDAStringPrefs("DA_LAUNCH_VIA")) {
      Log.debug("Entry point changed from " + oldVia + " to " + androidApiCalls.getDAStringPrefs("DA_LAUNCH_VIA"))
      oldVia = androidApiCalls.getDAStringPrefs("DA_LAUNCH_VIA");
    }
    if (title === "" || title === undefined || title === null) {
      Log.sDebug("This start event has no page title", "metricService");
      return;
    } else {
      let PageJson = {
        pageName: title,
        startTime: new Date().getTime(),
        entryPoint: ImportantDetails.componentEntryPoint
      };
    
      pageTable.push(PageJson);
      ImportantDetails.resetComponentEntryPoint();
    }
  };

  this.onPageTransitionStop = (name, eventType) => {
    if (pageTable.length === 0) {
      Log.sDebug("Page Table is Empty!", "metricService");
      return;
    } else if (name === "" || name === undefined || name === null) {
      Log.sDebug("This stop event has no page title", "metricService");
      return;
    }

    let eventDetail = eventType;
    if (eventType === null || eventType === undefined) {
      eventDetail = PageState.close;
    }

    let index = pageTable.findIndex(obj => obj.pageName === name);
    if (index !== -1) {
      pageTable[index]["timeSpent"] = new Date().getTime() - pageTable[index].startTime;
      this.reportPageMetrics(pageTable[index], eventDetail, index);
    }
  };

  this.reportPageMetrics = (pageData, eventType, index) => {
    var event = {
      eventType: eventType,
      tm_spent: pageData.timeSpent,
      page_name: pageData.pageName,
      entryPoint: pageData.entryPoint
    };
    this.reportPageEventMetrics(constantObjects.pageMetrics, event, pageData.startTime);
    pageTable.splice(index, 1);
  };

  this.reportPageEventMetrics = (category, event, startTime) => {
    let jsonObject = {};
    let via = androidApiCalls.getDAStringPrefs("DA_LAUNCH_VIA")
    if (via === "" || via === undefined || via === null) {
      via = "OTHER";
    }
    jsonObject["chaveDeConta"] = ImportantDetails.accountKey ? ImportantDetails.accountKey : undefined;
    jsonObject["chaveDeCliente"] = ImportantDetails.clientKey ? ImportantDetails.clientKey : undefined;
    jsonObject["webviewVersion"] = deploymentVersion.version;
    jsonObject["category"] = category;
    jsonObject["startTimeInMs"] = startTime;
    jsonObject["pageName"] = event.page_name;
    jsonObject["event"] = event.eventType;
    jsonObject["timeSpentInMs"] = event.tm_spent;
    jsonObject["via"] = via;
    jsonObject["entryPoint"] = event.entryPoint ? event.entryPoint : ImportantDetails.transactionEntryPoint;
    return androidApiCalls.submitPageEventMetrics(JSON.stringify(jsonObject));
  };

  this.reportActionMetrics = (event, clickTime) => {
    let jsonObject = {};
    let via = androidApiCalls.getDAStringPrefs("DA_LAUNCH_VIA")
    if (via === "" || via === undefined || via === null) {
      via = "OTHER";
    }
    jsonObject["chaveDeConta"] = ImportantDetails.accountKey ? ImportantDetails.accountKey : undefined;
    jsonObject["chaveDeCliente"] = ImportantDetails.clientKey ? ImportantDetails.clientKey : undefined;
    jsonObject["webviewVersion"] = deploymentVersion.version;
    jsonObject["category"] = constantObjects.actionButton;
    jsonObject["buttonClickTime"] = clickTime;
    jsonObject["pageName"] = event.page_name;
    jsonObject["event"] = event.eventType;
    jsonObject["via"] = via;
    jsonObject["sessionId"] = ImportantDetails.sessionID;
    return androidApiCalls.submitPageEventMetrics(JSON.stringify(jsonObject));
  }

  this.reportPageReloginEventMetrics = (pageName) => {
    let curr_time = new Date();
    let jsonObject = {};
    let via = androidApiCalls.getDAStringPrefs("DA_LAUNCH_VIA");
    if (via === "" || via === undefined || via === null) {
      via = "OTHER";
    }
    jsonObject["chaveDeConta"] = ImportantDetails.accountKey ? ImportantDetails.accountKey : undefined;
    jsonObject["chaveDeCliente"] = ImportantDetails.clientKey ? ImportantDetails.clientKey : undefined;
    jsonObject["webviewVersion"] = deploymentVersion.version;
    jsonObject["category"] = constantObjects.pageMetrics;
    jsonObject["startTimeInMs"] = curr_time.getTime();
    jsonObject["pageName"] = pageName;
    jsonObject["event"] = "resume_after_relogin";
    jsonObject["timeSpentInMs"] = -1;
    jsonObject["via"] = via
    return androidApiCalls.submitPageEventMetrics(JSON.stringify(jsonObject));

  };

  this.getAppEnterVia = () => {
    return androidApiCalls.getDAStringPrefs("DA_LAUNCH_VIA");
  }

  this.getAppLaunchTime = () => {
    let finalDate = new Date(moment(androidApiCalls.getDAStringPrefs("DA_LAUNCH_TIME")));
    return finalDate.getTime();
  }

  this.setSessionData = () => {
    let enter_via = androidApiCalls.getDAStringPrefs("DA_LAUNCH_VIA")
    sessionData = {
      "sessionEntryPoint": GeneralUtilities.emptyValueCheck(enter_via) ? "OTHER" : enter_via,
      "webviewVersion": deploymentVersion.version,
      "category": constantObjects.sessionMetrics,
      "chaveDeConta": ImportantDetails.accountKey ? ImportantDetails.accountKey : undefined,
      "chaveDeCliente": ImportantDetails.clientKey ? ImportantDetails.clientKey : undefined,
      "sessionEventMarkedBy": constantObjects.sessionMetricMarkedBy
    }
    Log.sDebug("Setting Initial Data");
  }

  this.reportSessionMetrics = (isAutoLogout) => {
    androidApiCalls.setDAStringPrefs("SESSION_DATA", "");
    androidApiCalls.setDAStringPrefs("sessionActiveStatus", false);
    let sessionDuration = new Date().getTime() - SessionMetricsTracker.sessionStartTime;

    sessionData["sessionDetails"] = isAutoLogout ? "INCOMPLETE LOGOUT" : "COMPLETE LOGOUT";
    sessionData["sessionDurationInMs"] = sessionDuration;
    sessionData["backgroundTimeInMs"] = SessionMetricsTracker.appBackgroundTime;
    sessionData["launchTime"] = this.getAppLaunchTime() - SessionMetricsTracker.appLoadTime;
    sessionData["sessionStartTimeInMs"] = SessionMetricsTracker.sessionStartTime;
    sessionData["sessionId"] = SessionMetricsTracker.sessionID;
    sessionData["foregroundTimeInMs"] = SessionMetricsTracker.appBackgroundTime === 0 ? (sessionDuration) : SessionMetricsTracker.appForegroundTime;
    sessionData["chaveDeConta"] = ImportantDetails.accountKey ? ImportantDetails.accountKey : undefined;

    if (!GeneralUtilities.emptyValueCheck(sessionData.foregroundTimeInMs) && SessionMetricsTracker.prevSessionID !== sessionData.sessionId) {
      androidApiCalls.submitSessionEventMetrics(JSON.stringify(sessionData));
      SessionMetricsTracker.setPrevSessionId();
    } else {
      Log.debug("Repeated session values have been removed");
    }

  }

  this.saveSessionData = () => {
    let sessionDuration = new Date().getTime() - SessionMetricsTracker.sessionStartTime;

    sessionData["sessionDetails"] = "INCOMPLETE LOGOUT";
    sessionData["sessionDurationInMs"] = sessionDuration;
    sessionData["backgroundTimeInMs"] = SessionMetricsTracker.appBackgroundTime;
    sessionData["launchTime"] = this.getAppLaunchTime() - SessionMetricsTracker.appLoadTime;
    sessionData["sessionStartTimeInMs"] = SessionMetricsTracker.sessionStartTime;
    sessionData["sessionId"] = SessionMetricsTracker.sessionID;
    sessionData["foregroundTimeInMs"] = SessionMetricsTracker.appBackgroundTime === 0 ? (sessionDuration) : SessionMetricsTracker.appForegroundTime;
    sessionData["chaveDeConta"] = ImportantDetails.accountKey ? ImportantDetails.accountKey : undefined;
    sessionData["sentToBackgroundTime"] = new Date().getTime();

    androidApiCalls.setDAStringPrefs("SESSION_DATA", JSON.stringify(sessionData));
  }

  this.createSessionID = () => {
    let sessionID = uuidv4();
    Log.sDebug("Session ID successfully created.")
    return  sessionID;
  }

  this.convertToBinary = (val) => {
    let charsEncoded = val.split('');
    return charsEncoded.map(function (char) {
      return char.charCodeAt(0).toString(2)
    }).join('');
  }

  this.getAsciiFromBinary = (binaryVal) => {
    let asciiVal = "";
    let binaryArr = binaryVal.match(/.{1,8}/g);
    for (let i = 0; i < binaryArr.length; i++) {
      asciiVal += String.fromCharCode(parseInt(binaryArr[i], 2).toString(10));
    }
    return asciiVal;
  }

  this.extractPublicKey = async () => {
    return new Promise((resolve, reject) => {
      apiService.getPublicKey().then(resp => {
          if (!resp || resp.status !== 200) {
            Log.debug("Unable to fetch public Key");
            reject(null);
          }
          else if (resp.status === 200) {
            this.publicKey = resp.data;
            resolve(resp.data)
          }
          else {
            Log.debug("Unable to fetch public Key");
            reject(null);
          }
        });
    });

  }

  this.secureApiForAnalytics = (payloadobj) => {
    try {
      this.symmetric = new SymmetricCrypto();
      this.asymmetric = new AsymmetricCrypto(payloadobj.key);
      const keyAndIv = this.symmetric.getKeyAndIv();
      const encryptedKeyAndIv = this.asymmetric.encrypt(keyAndIv, true);
      let jsonObject = {};
      let payloadToEncrypt = payloadobj.pay;

      jsonObject["securePayload"] = this.symmetric.encrypt(JSON.stringify(payloadToEncrypt));
      jsonObject["secret"] = encryptedKeyAndIv;
      return jsonObject;
    } catch (err) {
      Log.sDebug('MetricService: Error while encryption inside secureApiForAnalytics : ' + err.toString(),"metricService", constantObjects.LOG_PROD);
    }
  };

  this.getSecurePayload = async (payload) => {
    if (this.publicKey === "") {
      await this.extractPublicKey();
    }
    return this.secureApiForAnalytics({ "pay": payload, "key": this.publicKey });
  }

  // metrics will be sent immediately, send all alert logs
  this.reportAlertEventMetrics = async (payload) => {
    let alertPayload = payload;
    if (this.publicKey === "") {
      await Promise.all([await this.extractPublicKey()])
        .then(values => {
          this.publicKey = values[0];
          let securePayload = this.secureApiForAnalytics({ "pay": alertPayload, "key": this.publicKey });
          return androidApiCalls.submitAlertEventMetrics(JSON.stringify(securePayload));
        }).catch(err => {
          Log.debug("errors are : " + JSON.stringify(err));
        });
    } else {
      let securePayload = this.secureApiForAnalytics({ "pay": alertPayload, "key": this.publicKey });
      return androidApiCalls.submitAlertEventMetrics(JSON.stringify(securePayload));
    }
  };


  this.reportArbiEventMetrics = async (payload) => {
    if (this.publicKey === "") {
      await Promise.all([await this.extractPublicKey()])
        .then(values => {
          this.publicKey = values[0];
          let securePayload = this.secureApiForAnalytics({ "pay": payload, "key": this.publicKey });
          return androidApiCalls.submitArbiEventMetrics(JSON.stringify(securePayload));
        }).catch(err => {
          Log.debug("errors are : " + JSON.stringify(err));
        });
    } else {
      let securePayload = this.secureApiForAnalytics({ "pay": payload, "key": this.publicKey });
      return androidApiCalls.submitArbiEventMetrics(JSON.stringify(securePayload));
    }
  };

  this.removeSensitiveInfo = (payload) => {
    let sensitiveKeys = ["autenticacao2FA", "senha", "novaSenha", "pinAtual", "pinNovo"]
    for (const key in payload) {

      if (sensitiveKeys.indexOf(key) !== -1 && Object.prototype.hasOwnProperty.call(payload, key)) {
        delete payload[key];
      }
    }
  }

  this.reportClickedSubmitMetrics = (action, elementId, contentid) => {
    var log_json = this.createClickActionJson(action, elementId, contentid);
    androidApiCalls.logEvent(log_json);
  };

  this.reportDialogViewedSubmitMetrics = (contentId) => {

    if (contentId === "" || contentId === undefined) {
      return;
    }
    var storyId = contentId;
    var i = contentId.indexOf("~#");
    if (i !== -1) {
      storyId = contentId.substring(0, i);
    }
    let event = "card opened";
    let eventType = "state change"
    let id = storyId + '~#' + (androidApiCalls.getVersion(contentId) || null) + '~#' + androidApiCalls.getLocale() + '~#' + eventType + '~# cards ~#WebViewPage';
    let logJson = this.createOpenActionJson(event, id, storyId, contentId);
    androidApiCalls.logEvent(logJson);
  }

  this.reportViewedSubmitMetrics = (contentId) => {
    let cardState = androidApiCalls.STATES.OPENED;
    var storyId = contentId;
    var i = contentId.indexOf("~#");
    if (i !== -1) {
      storyId = contentId.substring(0, i);
    }

    androidApiCalls.setCardState(storyId, contentId, cardState);
    let event = "card opened";
    let eventType = "state change"
    let id = storyId + '~#' + (androidApiCalls.getVersion(contentId) || null) + '~#' + androidApiCalls.getLocale() + '~#' + eventType + '~# cards ~#WebViewPage';
    let logJson = this.createOpenActionJson(event, id, storyId, contentId);
    androidApiCalls.logEvent(logJson);
  }

  this.createOpenActionJson = function (event, actionId, storyID, cardID) {
    var actionObject = {};
    actionObject.id = cardID || (storyID + "_Web_Page");
    actionObject.state = "visible";
    actionObject.timestamp = Date.now() + "";
    actionObject.data = [];
    var actionData = {};
    actionData.event = event;
    actionData.id = actionId;
    actionObject.data.push(actionData);
    var actions = [];
    actions.push(actionObject);
    var logActionJson = {
      "story": [
        {
          "id": storyID,
          "action": actions
        }
      ]
    };
    return logActionJson;
  }

  this.createClickActionJson = function (event, actionId, contentid) {
    var actionObject = {};
    //actionObject.id = androidApiCalls.getDomId(storyID) || (storyID + "_Web_Page");
    actionObject.id = contentid;
    actionObject.state = "visible";
    actionObject.timestamp = Date.now() + "";
    actionObject.data = [];
    var actionData = {};
    actionData.event = event;
    actionData.id = actionId;
    actionObject.data.push(actionData);
    var actions = [];
    actions.push(actionObject);

    var storyid = contentid;
    var index = contentid.indexOf("~#");
    if (index !== -1) {
      storyid = contentid.substring(0, index);
    }
    var logActionJson = {
      story: [{
        id: storyid,
        action: actions
      }]
    };
    return logActionJson;
  };

  this.reportDomRenderEOperationViewMetrics = ({ props }) => {
    let contentid = props.storydom.id;
    let actionType = ActionTypes.VIEW;
    const scratchedCards = DBService.getScratchedCards();

    if (props.storydom.dom.scratchcard && !scratchedCards.includes(contentid)) {
      actionType = ActionTypes.SCRATCH_COVER_VIEW;
    }

    const servedCardList = DBService.getServedCards();
    const actionTypeContentId = contentid + "~#" + actionType;

    if (!servedCardList.includes(actionTypeContentId)) {
      let storyStats = {
        cardTabId: androidApiCalls.getWalletTabId(),
        contentid: contentid,
        content: props.storydom.content
      }

      this.reportSubmitMetrics(props, contentid, storyStats);
      this.reporteOperationMetrics({ action: actionType, story: storyStats }).then(() => { });
      DBService.setServedCard(actionTypeContentId);
    }
  }

  this.reportSubmitMetrics = (props, contentid, storyStats) => {
    var idArray = contentid.split("~#");

    if (contentid.indexOf('~#dialog') === -1) {
      storyStats["index"] = parseInt(idArray[idArray.length - 1]) + 1;
      storyStats["streamId"] = props.storydom.streamId;
      storyStats["story_id"] = idArray[0];
      this.reportViewedSubmitMetrics(props.storydom.id);
    } else {
      this.reportDialogViewedSubmitMetrics(props.storydom.id);
    }
  }

  this.reporteOperationMetrics = async ({ action, story, metadata, actionName }) => {
    let data = {
      index: story.index,
      storyId: story.story_id,
      streamId: story.streamId || "Engage",
      cardTabId: story.cardTabId,
      streamType: "Engage",
      csrc: "Engage"
    };

    data["element_id"] = metadata && metadata.id;
    data["action"] = actionName;

    if (metadata && metadata.extraEvtData) {
      data.extraEvtData = metadata.extraEvtData
    }

    if (metadata && story.contentid.indexOf('~#dialog') !== -1) {
      data["elemid"] = metadata.id;
      if (metadata && metadata.action && metadata.action.length > 0) {
        data["eventtype"] = metadata.action[0].type;
        data["eventdata"] = metadata.action[0].data;
      }
    }

    try {
      if (GeneralUtilities.isNotEmpty(story.content, false) && story.content.reporting) {
        data["reporting"] = story.content.reporting;
      }
      const category = story.category || "content";
      this.reportActions(story.contentid, action, data, category).then(() => { });
    } catch (err) {
      Log.debug("errors are : " + JSON.stringify(err));
    }
  };

  this.reportDeleteAction = async (action = Utils.ACTION_TYPE_DELETE, story, metadata, actionName = Utils.ACTION_TYPE_DELETE) => {
    let data = {
      index: story.index,
      storyId: story.story_id,
      streamId: story.streamId || "Engage",
      streamType: "Engage",
      cardTabId: story.cardTabId,
      csrc: "Engage"
    };
    data["element_id"] = metadata && metadata.id;
    data["action"] = actionName;

    if (metadata && metadata.extraEvtData) {
      data.extraEvtData = metadata.extraEvtData
    }

    if (metadata && story.id.indexOf('~#dialog') !== -1) {
      data["elemid"] = metadata.id;
      if (metadata && metadata.action && metadata.action.length > 0) {
        data["eventtype"] = metadata.action[0].type;
        data["eventdata"] = metadata.action[0].data;
      }
    }

    try {
      if (story.content.reporting) {
        data["reporting"] = story.content.reporting;
      }
    } catch (err) {
      return;
    }

    this.reportActions(story.id, action, data).then(() => { });
  };

  this.reportActions = async (contentId, actionType, data, category) => {
    //TODO: Add check to ensure actionType is a typeof of ActionTypes
    let curr_time = new Date();
    let ms = 1 * 60 * 1000;
    data = data || {};
    let pageName;
    let tabName = "Wallet";
    let eventObj = {
      id: contentId,
      index: data.index,
      tab_name: tabName,
      stry_id: data.storyId,
      strm_id: data.streamId,
      strm_type: data.streamType,
      src: androidApiCalls.getLaunchSource() || "NA",
      page_name: data.page_name || pageName,
      album_id: data.album_id,
      sourceTab: data.sourceTab,
      csrc: data.csrc
    };
    if (data.extraEvtData) {
      eventObj = { ...eventObj, ...data.extraEvtData }
    }
    if (data.survey) {
      eventObj.survey = data.survey;
    }
    if (data.elemid) {
      eventObj.elemid = data.elemid
    }
    if (data.reporting) {
      eventObj["reporting"] = data.reporting;
    }
    if (data.unsaveType) {
      eventObj["unsave_type"] = data.unsaveType;
    }

    if (data.reason) {
      eventObj["reason"] = data.reason;
    }
    if (data.pkg_name) {
      eventObj["pkg_name"] = data.pkg_name;
      eventObj["url"] = data.url;
    }
    if (data.videoPlayTime) {
      eventObj["videoPlayTimeMs"] = data.videoPlayTime;
    }

    if (data.apptapVersion) {
      eventObj["apptapVersion"] = data.apptapVersion;
    }

    let stats = {
      category: category || "content",
      type: "op",
      dtime: curr_time.getTime(),
      tz: new Date().getTimezoneOffset() * ms * -1,
      eventtype: actionType,
      version: OPERATIONS_VERSION_MAP[actionType],
      event: eventObj,
      sessionId: androidApiCalls.getSessionId()
    };

    stats.event["element_id"] = data.element_id;
    stats.event["action"] = data.action;

    if (!stats.event.stry_id) {
      stats.event = this.extractStoryIdFromstring(stats.event);
    }

    apiService.reportEngageActions(stats).then(() => { });
  };

  this.extractStoryIdFromstring = (event) => {
    try {
      if (event.id) {
        let stry_id = event.id.split("~#")[0];
        event.stry_id = stry_id;
      }
    } catch (error) {
      return;
    }
    return event
  }
}
