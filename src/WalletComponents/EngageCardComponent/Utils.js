import androidApiCalls from "../../Services/androidApiCallsService";
import AndroidApiService from "../../Services/androidApiCallsService";
import constantObjects from "../../Services/Constants";
import apiService from "../../Services/apiService";
import Log from "../../Services/Log";

var clearLocaleVal = [];
var onBoardDone = false;
var shareSupport = true;
var onboardDeviceStatus = -1;
// var AllInterests = [];
var savedInterests = [];
// var AllLanguages = [];
var savedLanguages = [];
var userProfile = {};
var InterestIdLocaleMap = {};
var LangIdLocaleMap = {};
var CardsInViewPort = [];
var isInstaDialog = false;
var pauseInstavideo = false;
var contentIdVideoMetricsMap = {};
var helpSaveCount = 0;
var backend_version = "";
var countmsgsv2Count;
var usefulLinksArray = [];
var reAuthPerSession = 0;
var freshLaunch = true;
let newsNotification;
let isNotifTocardDone = false;
let trendingcardshownValue = true;
let notifTriggeredTransition = false;
let isNotifToBubbleDone = false;
let IswhatsAppAvail = false;
let fromOnboarding = false;
let playerInfo = [];
let performance = {};
let onboardDomPrefetch = false;
let firstSessionOfDay = false;
let userSkipedLogin = false;
let privacyCheckbox = true;
let showingSigninCard = false;
let showingInterestCard = false;
let tabtipShownFor = "";
let tipstate = false;
var contentIdPodcastMetricsMap = {};
let podcastInfo = [];
// const HELP_STREAM = "Help";
const HTTPS_PREFIX = "https://";
const WWW_PREFIX = "www.";
// const WINDOW_HEIGHT = window.innerHeight;
const WINDOW_WIDTH = window.innerWidth;
// const DIFF_X = parseInt(AndroidApiService.getSystemStringProperty("aspectDiffWidth")) || 50;
// const DIFF_Y = parseInt(AndroidApiService.getSystemStringProperty('aspectDiffHeight')) || 50;
// const FONT_SCALE_ENABLED = true;

function Utils() {
  const DEVICE_TYPES = {
    ENGAGE: "engage",
    BROWSER: "browser"
  };
  const DEFAULT_IMAGE = "images/HelloMoto.png";
  const FEEDTYPES = {
    CARDS: "engagecards",
    NEWS: "newsfeed",
    INSIGHTS: "insightfeed",
    HELLOMOTO: "hello_moto_br",
    INSTAFEED: "instafeed",
    FBAD: "fbAd",
    ADFEED: "adsfeed"
  };

  const EngageTypes = {
    OFFERS: "ec_offers",
    WISHES: "ec_wishes",
    DATAENRICHMENT: "ec_dataenrichment",
    INFORMATION: "ec_information",
    SURVEYS: "ec_surveys",
    INSURANCE: "ec_insurance",
    OPTIN: "ec_optin",
    GOODIE: "ec_goodies"
  };

  this.blockedEngageTypes = [EngageTypes.APPRECOMMENDATION, EngageTypes.HELP];
  this.LOCAL_STORY_CARDS = "localStoryCards";
  // const NEW_CONTENT_VIEWED = "newcontentviewed";
  const SIGNIN_DIALOG_SHOW_LIMIT = 1;
  const INTEREST_DIALOG_SHOW_LIMIT = 1;
  const SIGNIN_CARD_SHOW_LIMIT = 3;
  const INTEREST_CARD_SHOW_LIMIT = 3;

  this.ACTION_TYPE_DELETE = 'delete';

  this.CELLULAR_RECHARGE = "recharge";
  this.BOLETO_PAYMENT = "boleto";
  this.CREDIT_PAYMENT = "credit_invoice";
  this.CASHIN_SMARTALERT = "cashin_alert";

  this.blockedFEEDTYPES = [
    FEEDTYPES.INSIGHTS,
    FEEDTYPES.INSTAFEED,
    FEEDTYPES.FBAD
  ];

  this.getSignInDialogShowLimit = function () {
    return SIGNIN_DIALOG_SHOW_LIMIT;
  }

  this.getInterestDialogShowLimit = function () {
    return INTEREST_DIALOG_SHOW_LIMIT;
  }

  this.getSigninCardShowLimit = function () {
    return SIGNIN_CARD_SHOW_LIMIT;
  }

  this.getInterestCardShowLimit = function () {
    return INTEREST_CARD_SHOW_LIMIT;
  }

  this.setFirstSessionOfDay = function (val) {
    firstSessionOfDay = val;
  }

  this.isFirstSessionOfDay = function () {
    return firstSessionOfDay;
  }

  this.getTabtipShownFor = function () {
    return tabtipShownFor;
  }

  this.setTabtipShownFor = function (tab_id) {
    tabtipShownFor = tab_id || "";
  }

  this.getEngageTypes = function () {
    return Object.values(EngageTypes);
  };

  this.getFEEDTYPES = function () {
    return Object.values(FEEDTYPES);
  };

  this.addCardToViewPortList = function (id) {
    setTimeout(() => {
      if (!CardsInViewPort.includes(id)) {
        CardsInViewPort.push(id);
      }
    }, 100);
  };

  this.removeCardFromViewPortList = function (id) {
    setTimeout(() => {
      var index = CardsInViewPort.indexOf(id);
      if (index > -1) {
        CardsInViewPort.splice(index, 1);
      }
    }, 100);
  };

  this.setShowingSigninCard = (val) => {
    showingSigninCard = val;
  }

  this.setShowingInterestCard = (val) => {
    showingInterestCard = val;
  }

  this.getShowingInterestCard = () => {
    return showingInterestCard;
  }

  this.getShowingSigninCard = () => {
    return showingSigninCard;
  }

  this.clearLocale = (key) => {
    try {
      if (!clearLocaleVal.includes(key)) {
        let value = androidApiCalls.getValue(key, "false");
        let returnVal = (value == "true");
        androidApiCalls.persistValue(key, "false");
        clearLocaleVal.push(key);
        return returnVal;
      } else {
        return false;
      }
    } catch (err) {
      Log.sDebug(err, constantObjects.LOG_PROD);
      return false;
    }
  }

  this.getHelpSaveCount = () => {
    return helpSaveCount;
  }

  this.setHelpSaveCount = count => {
    helpSaveCount = count;
  }

  this.setInstaDialog = function (value) {
    isInstaDialog = value;
  };

  this.setPauseInstavideo = function (value) {
    pauseInstavideo = value;
  };

  this.getReAuthInCurrentSession = () => {
    return reAuthPerSession;
  }

  this.reAuthDone = () => {
    reAuthPerSession += 1
  }

  this.getPauseInstavideo = function () {
    if (pauseInstavideo) {
      pauseInstavideo = false;
      return true;
    }
    return false;
  };


  /**
   * Method keep track of number of videos played.
   * @param {String} type Type of the requst like get, set, delete.
   * @param {String} id Content id of the video being played.
   */

  this.videoPlayerDetails = (type, id) => {
    /**
     * check if content already bein played if not push it to list
     */

    if (type === 'set' && !playerInfo.includes(id)) {
      playerInfo.push(id);
    } else if (type === "delete") {
      let index = playerInfo.indexOf(id);
      if (index > -1) {
        playerInfo.splice(index, 1);
      }
    }
    /**
     * check if multipule videos are played pause first one ande remove it from list
     */
    else if (type === "get") {
      let pauseVideo, index;
      index = playerInfo.indexOf(id);
      if (playerInfo.length === 1 && index === -1) {
        return true;
      } else if (playerInfo.length > 1) {
        if (index === (playerInfo.length - 1)) {
          playerInfo = [];
          playerInfo.push(id);
          pauseVideo = false;
        } else {
          pauseVideo = true;
        }
        return pauseVideo
      }
    }
  }

  this.podcastPlayerDetails = (type, id) => {
    /**
        * check if content already bein played if not push it to list
        */

    if (type === 'set' && !podcastInfo.includes(id)) {
      podcastInfo.push(id);
    } else if (type === "delete") {
      let index = podcastInfo.indexOf(id);
      if (index > -1) {
        podcastInfo.splice(index, 1);
      }
    }
  }

  this.saveContentIdPodcastMap = function (contentId, videoMetrics) {
    contentIdPodcastMetricsMap = videoMetrics;
  };

  this.getContentIdPodcastMap = function () {
    return contentIdPodcastMetricsMap;
  };

  this.clearContentIdPodcastMap = function () {
    contentIdPodcastMetricsMap = {};
  };


  this.IsCardInViewPortList = function (id) {
    if (isInstaDialog) return false;
    /** List Corrupted or video on top*/
    if (CardsInViewPort.length < 1) return true;
    return CardsInViewPort.includes(id);
  };

  this.logCardsInViewPort = function (src) {
    Log.sDebug(
      src + " " + CardsInViewPort.length + " logCardsInViewPort " + CardsInViewPort.toString()
    );
  };

  this.clearCardToViewPortList = function () {
    CardsInViewPort = [];
  };

  this.notifToCardValue = (type, value) => {
    if (type === "get") {
      return isNotifTocardDone;
    } else if (type === "set") {
      isNotifTocardDone = value;
    }
  }


  this.shouldShowTrendingCards = (type, value) => {
    if (type === "get") {
      return trendingcardshownValue;
    } else if (type === "set") {
      trendingcardshownValue = value;
    }
  }



  this.notifTriggeredTransition = (type, value) => {
    if (type === "get") {
      return notifTriggeredTransition;
    } else if (type === "set") {
      notifTriggeredTransition = value;
    }
  }

  this.notifToBubbleValue = (type, value) => {
    if (type === "get") {
      return isNotifToBubbleDone;
    } else if (type === "set") {
      isNotifToBubbleDone = value;
    }
  }

  this.NAVTYPES = {
    engagecards: "engagecards",
    likedcards: "likedcards",
    allcards: null
  };

  const PLACEHOLDERS = {
    image: "<<IMAGE_SRC>>",
    title: "<<TITLE>>",
    description: "<<DESCRIPTION>>",
    url: "<<URL>>",
    videosrc: "<<VIDEO_SRC>>",
    story_id: "<<STORYID>>",
    source: "<<SOURCE>>",
    ctaLabel: "<<ctaLabel>>"
  };

  this.getPlaceHolders = function () {
    return PLACEHOLDERS;
  };

  const DOM_TEMPLATE = {
    TEMPLATE1: {
      domJson: [{
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#0",
        domtype: "en-label-new",
        elemid: "textbox0",
        metadata: {
          id: "textbox0",
          type: "text-new",
          data: {
            "Selected Label": "",
            label: "<b>" + PLACEHOLDERS.description + "</b>",
            actionDataCounter: 0
          },
          action: [{
            type: "None",
            data: ""
          }]
        },
        style: "display: flex; align-items: center;text-align: -webkit-left; box-shadow: 0px 0px 0px; outline: none; cursor: text; width: 75.1479%; height: 54.5%; border: 0px none rgba(0, 0, 0, 0.87); top: 18.8387%; left: 13.9053%; position: absolute; background-color: rgba(0, 0, 0, 0); padding: 5px; overflow: hidden; text-overflow: ellipsis; z-index: 5; border-radius: 0%;"
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#1",
        domtype: "en-label-new",
        elemid: "textbox3",
        metadata: {
          id: "textbox3",
          type: "text-new",
          data: {
            "Selected Label": "",
            label: "",
            actionDataCounter: 0
          },
          action: [{
            type: "Open link in browser",
            data: PLACEHOLDERS.url
          }]
        },
        style: "text-align: -webkit-right; box-shadow: 0px 0px 0px; outline: none; cursor: pointer;; width: 97.0414%; height: 102.581%; border: 0px none rgba(0, 0, 0, 0.87); top: 0%; left: 0%; position: absolute; background-color: rgba(0, 0, 0, 0); padding: 5px; overflow: hidden; text-overflow: ellipsis; z-index: 10; border-radius: 0%;"
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#2",
        domtype: "en-img",
        metadata: {
          id: "image0",
          type: "image",
          data: {
            imgsrc: "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/doubleQuote.png"
          },
          action: [{
            type: "None",
            data: ""
          }],
          classList: []
        },
        style: "top: 3%; left:1%; position: absolute; height: 14%; width:11.792%; background-size: 100% 100%; text-align: center; border: none;z-index: auto;",
        value: "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/doubleQuote.png"
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#3",
        domtype: "en-img",
        metadata: {
          id: "image0",
          type: "image",
          data: {
            imgsrc: "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/doubleQuote.png"
          },
          action: [{
            type: "None",
            data: ""
          }],
          classList: []
        },
        style: "top: 70%; left: 87%; transform: rotate(180deg); position: absolute; height: 14%; width:11.792%; background-size: 100% 100%; text-align: center; border: none;z-index: auto;",
        value: "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/doubleQuote.png"
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#4",
        domtype: "en-img",
        metadata: {
          id: "image0",
          type: "image",
          data: {
            imgsrc: "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/quoteLine.png"
          },
          action: [{
            type: "None",
            data: ""
          }],
          classList: []
        },
        style: "top: 14%; left:1%; position: absolute; height: 73%; width:11.792%; background-size: 100% 100%; text-align: center; border: none;z-index: auto;",
        value: "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/quoteLine.png"
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#5",
        domtype: "en-img",
        metadata: {
          id: "image1",
          type: "image",
          data: {
            imgsrc: "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/twitter.png"
          },
          action: [{
            type: "None",
            data: ""
          }],
          classList: []
        },
        style: "top: 78%; left: 32%; position: absolute; height: 22%; width: 36%; background-size: 100% 100%; text-align: center; border: none; z-index: auto;",
        value: "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/twitter.png"
      }
      ],
      parentsize: {
        resources: {
          images: [
            "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/quote.png",
            "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/doubleQuote.png",
            "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/quoteLine.png",
            "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/twitter.png"
          ]
        },
        cardHeight: "268px",
        height: 80,
        width: 100,
        taskbarcolor: "rgb(63, 81, 181)",
        backgroundcolor: "rgb(255, 255, 255)"
      }
    },

    ADS: {
      domJson: [{
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#0",
        domtype: "en-img",
        metadata: {
          id: "image1",
          type: "image",
          data: {
            imgsrc: PLACEHOLDERS.imgsrc
          },
          action: [{
            type: "Open link in browser",
            data: PLACEHOLDERS.url
          }],
          classList: []
        },
        style: "top: 0%; left: 0%; position: absolute; height: 100%; width: 100%; background-size: 100% 100%; text-align: center; border: none; z-index: auto;",
        value: "https://storage.googleapis.com/engage_uploaded_files/0000110536757028/twitter.png"
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#1",
        domtype: "en-video",
        metadata: {
          id: "video0",
          type: "video",
          data: {
            src: PLACEHOLDERS.videosrc,
            thumbnail: PLACEHOLDERS.imgsrc,
            ad: PLACEHOLDERS.ad_video
          },
          action: [{
            type: "None",
            data: undefined
          }],
          classList: []
        },
        style: "top: 0%; left: 0%; position: absolute; height: 100%; width: 100%; background-size: 100% 100%; text-align: center; border: none; z-index: 1;background-color: white",
        value: PLACEHOLDERS.videosrc
      }
      ],
      cardHeight: "268px",
      parentsize: {
        resources: {
          images: [PLACEHOLDERS.imgsrc]
        },
        height: 80,
        width: 100,
        taskbarcolor: "rgb(63, 81, 181)",
        backgroundcolor: "rgb(255, 255, 255)"
      }
    },

    TEMPLATE2: {
      domJson: [{
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#0",
        domtype: "en-label-new",
        elemid: "textbox0",
        metadata: {
          id: "textbox0",
          type: "text-new",
          data: {
            "Selected Label": "",
            label: '<b><font style="font-size: 16px;">' +
              PLACEHOLDERS.title +
              "</font></b>",
            actionDataCounter: 0
          },
          action: [{
            type: "None",
            data: ""
          }]
        },
        style: "text-align: -webkit-left; box-shadow: 0px 0px 0px; outline: none; cursor: text; width: 62.5503%; height: 27%; border: 0px none rgba(0, 0, 0, 0.87); top: 16.371%; left: 2.14201%; position: absolute; background-color: rgba(0, 0, 0, 0); padding: 5px; overflow: hidden; text-overflow: ellipsis; z-index: 5; border-radius: 0%;"
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#1",
        domtype: "en-label-new",
        elemid: "textbox1",
        metadata: {
          id: "textbox1",
          type: "text-new",
          data: {
            "Selected Label": "",
            label: '<font color="#545454">' + PLACEHOLDERS.description + "</font>",
            actionDataCounter: 0
          },
          action: [{
            type: "None",
            data: ""
          }]
        },
        style: "text-align: justify; font-size: 15px; box-shadow: 0px 0px 0px; outline: none; cursor: text; width: 92.1692%; height: 34%; border: 0px none rgba(0, 0, 0, 0.87); top: 57%; left: 2.14201%; position: absolute; background-color: rgba(0, 0, 0, 0); padding: 5px; overflow: hidden; text-overflow: ellipsis; z-index: 5; border-radius: 0%;"
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#2",
        domtype: "en-label-new",
        elemid: "textbox2",
        metadata: {
          id: "textbox2",
          type: "text-new",
          data: {
            "Selected Label": "",
            label: '<span style="color: rgb(188, 188, 172); font-size: 14px;">' +
              PLACEHOLDERS.source +
              "</span>",
            actionDataCounter: 0
          },
          action: [{
            type: "None",
            data: ""
          }]
        },
        style: "text-align: -webkit-left; box-shadow: 0px 0px 0px; outline: none; cursor: text; width: 82.3373%; height: 7%; border: 0px none rgba(0, 0, 0, 0.87); top: 4%; left: 2.14201%; position: absolute; background-color: rgba(0, 0, 0, 0); padding: 5px; overflow: hidden; text-overflow: ellipsis; z-index: 5; border-radius: 0%;"
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#3",
        domtype: "en-label-new",
        elemid: "textbox3",
        metadata: {
          id: "textbox3",
          type: "text-new",
          data: {
            "Selected Label": "",
            label: "",
            actionDataCounter: 0
          },
          action: [{
            type: "Open link in browser",
            data: PLACEHOLDERS.url
          }]
        },
        style: "text-align: -webkit-right; box-shadow: 0px 0px 0px; outline: none; cursor: pointer; width: 97.0414%; height: 102.581%; border: 0px none rgba(0, 0, 0, 0.87); top: 0%; left: 0%; position: absolute; background-color: rgba(0, 0, 0, 0); padding: 5px; overflow: hidden; text-overflow: ellipsis; z-index: 10; border-radius: 0%;"
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#4",
        domtype: "en-img",
        metadata: {
          id: "image0",
          type: "image",
          data: {
            imgsrc: PLACEHOLDERS.imgsrc
          },
          action: [{
            type: "None",
            data: ""
          }],
          classList: ["en-image-auto-adjust"]
        },
        style: "top: 19%; left: 68%; position: absolute; height: 27%; width: 30%; background-size: 100% 100%; text-align: center; border: none; z-index: auto;",
        value: PLACEHOLDERS.imgsrc
      }
      ],
      cardHeight: "268px",
      parentsize: {
        resources: {
          images: [PLACEHOLDERS.imgsrc]
        },
        height: 80,
        width: 100,
        taskbarcolor: "rgb(63, 81, 181)",
        backgroundcolor: "rgb(255, 255, 255)"
      }
    },

    HelloMoto: {
      parentsize: {
        resources: {
          images: [
            PLACEHOLDERS.imgsrc,
            "https://storage.googleapis.com/engage_uploaded_files/CardStream/motorola_logo.png"
          ]
        },
        taskbarcolor: "rgb(63, 81, 181)",
        height: 106,
        width: 100,
        backgroundcolor: "rgb(255, 255, 255)"
      },
      domJson: [{
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#0",
        domtype: "en-label-new",
        style: "text-align: center; box-shadow: 0px 0px 0px; outline: none; cursor: text; border: 0px none rgba(0, 0, 0, 0.87); background-color: rgba(0, 0, 0, 0); padding: 5px; z-index: 5; border-radius: 0%; width: 89.9408%; height: 22%; top: 72.1622%; left: 3.25444%; position: absolute;",
        elemid: "textbox0",
        metadata: {
          id: "textbox0",
          action: [{
            data: PLACEHOLDERS.url,
            type: "Open link in browser"
          }],
          data: {
            actionDataCounter: 0,
            label: '<font style="font-size: 15px;"><b>' +
              PLACEHOLDERS.title +
              "</b></font>",
            "Selected Label": ""
          },
          type: "text-new"
        }
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#1",
        domtype: "en-label-new",
        style: "text-align: -webkit-left; box-shadow: 0px 0px 0px; outline: none; cursor: text; width: 22%; height: 7%; border: 0px none rgba(0, 0, 0, 0.87); top: 0.6%; left: 7.8%; position: absolute; background-color: rgba(0, 0, 0, 0); padding: 5px; overflow: hidden; text-overflow: ellipsis; z-index: 5; border-radius: 0%;",
        elemid: "textbox2",
        metadata: {
          id: "textbox2",
          type: "text-new",
          data: {
            "Selected Label": "",
            label: '<span style="color: #000; font-size: 12px; font-weight: 500"> Hello Moto </span>',
            actionDataCounter: 0
          },
          action: [{
            type: "None",
            data: ""
          }]
        }
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#2",
        domtype: "en-video",
        style: "top:12%; left:0%; position: absolute; height:60.7%; width:100%; background-size: 100% 100%; text-align: center; border: none;z-index: 1;background-color: white",
        value: PLACEHOLDERS.videosrc,
        metadata: {
          id: "video0",
          classList: [],
          action: [{
            type: "None"
          }],
          data: {
            src: PLACEHOLDERS.videosrc,
            thumbnail: PLACEHOLDERS.imgsrc,
            ad: PLACEHOLDERS.ad_video
          },
          type: "video"
        }
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#3",
        domtype: "en-img",
        style: "top:12%; left:0%; position: absolute; height:60.7%; width:100%; background-size: 100% 100%; text-align: center; border: none;z-index: 0;",
        value: PLACEHOLDERS.imgsrc,
        metadata: {
          id: "image0",
          classList: ["en-image-auto-adjust"],
          action: [{
            data: PLACEHOLDERS.url,
            type: "Open link in browser"
          }],
          data: {
            imgsrc: PLACEHOLDERS.imgsrc
          },
          type: "image"
        }
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#4",
        domtype: "en-img",
        style: "top:3%; left:2.24%; position: absolute; height: 6%; width:5%; background-size: 100% 100%; text-align: center; border: none;z-index: 0;",
        value: "https://storage.googleapis.com/engage_uploaded_files/CardStream/motorola_logo.png",
        metadata: {
          id: "image1",
          classList: [],
          action: [{
            type: "None"
          }],
          data: {
            imgsrc: "https://storage.googleapis.com/engage_uploaded_files/CardStream/motorola_logo.png"
          },
          type: "image"
        }
      }
      ],
      cardHeight: "347.82px"
    },

    Instagram: {
      parentsize: {
        resources: {
          images: [
            PLACEHOLDERS.imgsrc,
            "https://storage.googleapis.com/engage_uploaded_files/CardStream/insta.jpg",
            "https://storage.googleapis.com/engage_uploaded_files/CardStream/insta2.png"
          ]
        },
        taskbarcolor: "rgb(63, 81, 181)",
        height: 112.2,
        width: 100,
        backgroundcolor: "rgb(255, 255, 255)"
      },
      cardHeight: "347.82px",
      domJson: [{
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#0",
        domtype: "en-label-new",
        style: "text-align: center; box-shadow: 0px 0px 0px; outline: none; cursor: text; border: 0px none rgba(0, 0, 0, 0.87); background-color: rgba(0, 0, 0, 0); padding: 5px; z-index: 5; border-radius: 0%; width: 89.9408%; height: 22.973%; top: 72.1622%; left: 3.25444%; position: absolute;",
        elemid: "textbox0",
        metadata: {
          id: "textbox0",
          action: [{
            data: PLACEHOLDERS.url,
            type: "Dialog Box"
          }],
          data: {
            actionDataCounter: 0,
            label: '<font style="font-size: 14px;"><b>' +
              PLACEHOLDERS.title +
              "</b></font>",
            "Selected Label": ""
          },
          type: "text-new"
        }
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#1",
        domtype: "en-img",
        style: "top:11%; left:0%; position: absolute; height:62.37%; width:100%; background-size: 100% 100%; text-align: center; border: none;z-index: auto;",
        value: PLACEHOLDERS.imgsrc,
        metadata: {
          id: "image0",
          classList: ["en-image-auto-adjust"],
          action: [{
            data: PLACEHOLDERS.url,
            type: "Dialog Box"
          }],
          data: {
            imgsrc: PLACEHOLDERS.imgsrc
          },
          type: "image"
        }
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#2",
        domtype: "en-video",
        style: "top:11%; left:0%; position: absolute; height:62.37%; width:100%; background-size: 100% 100%; text-align: center; border: none;z-index: 1;background-color: white;",
        value: PLACEHOLDERS.videosrc,
        metadata: {
          id: "video0",
          classList: [],
          action: [{
            type: "None"
          }],
          data: {
            src: PLACEHOLDERS.videosrc,
            thumbnail: PLACEHOLDERS.imgsrc,
            ad: PLACEHOLDERS.ad_video
          },
          type: "video"
        }
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#3",
        domtype: "en-img",
        style: "top:2%; left:2.14%; position: absolute; height: 6%; width: 6%; background-size: 100% 100%; text-align: center; border: none;z-index: auto;",
        value: "https://storage.googleapis.com/engage_uploaded_files/CardStream/insta.jpg",
        metadata: {
          id: "image1",
          classList: [],
          action: [{
            type: "None"
          }],
          data: {
            imgsrc: "https://storage.googleapis.com/engage_uploaded_files/CardStream/insta.jpg"
          },
          type: "image"
        }
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#4",
        domtype: "en-img",
        style: "top:2%; left: 8.7%; position: absolute; height: 6%; width: 19%; background-size: 100% 100%; text-align: center; border: none;z-index: auto;",
        value: "https://storage.googleapis.com/engage_uploaded_files/CardStream/insta2.png",
        metadata: {
          id: "image1",
          classList: [],
          action: [{
            type: "None"
          }],
          data: {
            imgsrc: "https://storage.googleapis.com/engage_uploaded_files/CardStream/insta2.png"
          },
          type: "image"
        }
      }
      ]
    },

    Instagram_mini: {
      parentsize: {
        resources: {
          images: [PLACEHOLDERS.imgsrc]
        },
        taskbarcolor: "rgb(63, 81, 181)",
        height: 112.2,
        width: 100,
        backgroundcolor: "rgb(255, 255, 255)"
      },
      cardHeight: "232.82px",
      domJson: [{
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#1",
        domtype: "en-img",
        style: "top:0%; left:0%; position: absolute; height:100%; width:100%; background-size: 100% 100%; text-align: center; border: none;z-index: auto;",
        value: PLACEHOLDERS.imgsrc,
        metadata: {
          id: "image0",
          classList: ["en-image-auto-adjust"],
          action: [{
            data: PLACEHOLDERS.url,
            type: "Dialog Box"
          }],
          data: {
            imgsrc: PLACEHOLDERS.imgsrc
          },
          type: "image"
        }
      },
      {
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#2",
        domtype: "en-video",
        style: "top:11%; left:0%; position: absolute; height:62.37%; width:100%; background-size: 100% 100%; text-align: center; border: none;z-index: 1;background-color: white;",
        value: PLACEHOLDERS.videosrc,
        metadata: {
          id: "video0",
          classList: [],
          action: [{
            type: "None"
          }],
          data: {
            src: PLACEHOLDERS.videosrc,
            thumbnail: PLACEHOLDERS.imgsrc,
            ad: PLACEHOLDERS.ad_video
          },
          type: "video"
        }
      }
      ]
    },

    FeedbackCard: {
      options: [{
        name: "Delete"
      }],
      parentsize: {
        resources: {
          images: []
        },
        taskbarcolor: "rgb(63, 81, 181)",
        height: 60,
        width: 100,
        backgroundcolor: "rgb(255, 255, 255)"
      },
      cardHeight: "248px",
      domJson: [{
        id: PLACEHOLDERS.story_id + "~#A~#cards~#default~#0~#domJson~#0",
        domtype: "feedback-card",
        style: "outline: none; cursor: text; background-color: rgba(0, 0, 0, 0); padding: 5px; z-index: 5; width: 97%; height: 100%; top: 0; left: 0; position: absolute;",
        elemid: "feedback0",
        metadata: {
          id: "feedback0",
          action: [{
            data: "",
            type: "None"
          }],
          data: {
            actionDataCounter: 0,
            label: PLACEHOLDERS.description,
            title: PLACEHOLDERS.title
          },
          type: "feedback-card"
        }
      }]
    }
  };

  this.getTemplates = () => {
    return DOM_TEMPLATE;
  };

  /**
   * Function to fetch the values based on the key present
   * @param  {Object} object - Object to search the keys
   * @param  {String} string - The key of the value to be fetched
   * @return {Object}        Returns the corresponding value of the key
   */
  this.fetchObject = function (object, string) {
    var alphaVal = string
      .trim()
      .split(".")
      .reduce(function (object, property) {
        if (object && object[property]) return object[property];
        return undefined;
      }, object);
    return ((alphaVal || "") + "").split('"').join('\\"');
  };

  this.isPlaceHolder = str => {
    let placeHolderRegex = this.getRegex();
    let res = placeHolderRegex.test(str);
    return res;
  };

  this.getRegex = () => {
    return new RegExp("<<([^>^>)]*)>>", "g"); //Regex to find all placeholders in the card layout
  };

  this.jsonToDom = (json, template) => {
    if (!template) {
      return;
    }
    var domData = JSON.stringify(template);
    let placeHolderRegex = this.getRegex();
    domData = domData.replace(placeHolderRegex, (...match) => {
      let val = this.fetchObject(json, match[1]);
      return val || match[0];
    });
    try {
      domData = domData.split("\\ N").join("\n");
      domData = domData.split("\\ n").join("\n");
      domData = domData.split("\n").join("\\n");
      domData = domData.split("\\ T").join("\t");
      domData = domData.split("\\ t").join("\t");
      domData = domData.split("\t").join("\\t");
      domData = domData.split("\\ R").join("\r");
      domData = domData.split("\\ r").join("\r");
      domData = domData.split("\r").join("\\r");

      return JSON.parse(domData);
    } catch (err) {
      Log.sDebug("Invalid JSON " + err + " for content id " + json.contentid, constantObjects.LOG_PROD);
      return;
    }
  };

  this.privacyCheckboxstate = (type, value) => {
    if (type === "get") {
      return privacyCheckbox;
    } else if (type === 'set') {
      privacyCheckbox = value;
    }
  }

  this.recordAppPerformence = (from, time, report, tab_name) => {
    let lastLaunchTime = androidApiCalls.getLongValue("lastLaunchTime");
    performance[from] = time - lastLaunchTime;
    if (report) {
      let indexHtmlTs = AndroidApiService.getValue("htmlFetched");
      performance["indexHtml"] = indexHtmlTs - lastLaunchTime;
      performance["contentFetched"] = new Date().getTime() - lastLaunchTime;
      performance["tab_name"] = tab_name;
      this.reportMetrics("performance", "debug", performance);
    }
  }


  this.parseDom = function (data) {
    data = Object.assign(data, data.dom[0]);
    // data.dom = JSON.stringify(data.dom);
    return data;
  };

  this.getParams = function () {
    let params = {};
    params.locale = this.getLocale();
    return params;
  };

  this.getNewsNotifParams = function () {
    let params = {};
    params.locale = this.getLocale();
    params.type = "newsoptin";
    params.version = "1"
    return params;
  };

  this.styleParser = styleKey => {
    var keys = styleKey.split("-");
    for (var i in keys) {
      if (i === "0") continue;
      let char = keys[i][0];
      keys[i] = char.toUpperCase() + keys[i].substr(1);
    }
    return keys.join("");
  };

  this.parseStyle = style => {
    let styleObj = {};
    try {
      let newString = style.split(";");
      newString.forEach(item => {
        let isJSCode = item.split("~$#~"); //~$#~ Is placeholder for the js expression in the string
        try {
          if (isJSCode[1]) {
            isJSCode[1] = eval(isJSCode[1]);
            item = isJSCode.join("");
          }
        } catch (error) {
          Log.sDebug("Error inside parseStyle: " + error.message, "Utils");
        }

        let styleString = item.split(":");
        if (styleString && styleString.length === 2) {
          let styleKey = this.styleParser(styleString[0].trim());
          styleObj[styleKey] = styleString[1].trim();
        }
      });
    } catch (err) {
      Log.debug("parseStyle Error " + err);
    }

    return styleObj;
  };

  this.getNewsNotifSettings = () => {
    return new Promise((resolve) => {
      if (newsNotification) {
        resolve(newsNotification);
      }
    });
  }

  this.saveNewsNotifSettings = (payloadJson) => {
    return new Promise(() => {
      newsNotification = payloadJson.newsnotification;
    })
  }

  this.extractRGB = inputExp => {
    var regex = /rgb\(([^)]+)\)/;
    if (regex.exec(inputExp)) {
      return regex.exec(inputExp)[0];
    } else {
      return null;
    }
  };

  this.getMCC = () => {
    let mccCountry;
    const getcountry = {
      "724": "br",
      "404": "in",
      "405": "in",
      "310": "us",
      "311": "us",
      "316": "us",
      "732": "co",
    }
    let mcc = androidApiCalls.getMccMnc()
    mcc && mcc.forEach(item => {
      if (!mccCountry) {
        mccCountry = getcountry[item.mcc]
      }
    });
    return mccCountry;
  }

  this.shrinkStringByLimit = (str, limit) => {
    if (!str) return "";
    if (limit === undefined) return str;
    if (str.length >= limit) {
      str = str.slice(0, limit);
      return str.slice(0, str.lastIndexOf(" ")) + "...";
    }
    return str;
  }

  this.parseInstaTitle = str => {
    var te = unescape(str).split(
      "#Repost @motorolabr (@get_repost)\\n\\u30fb\\u30fb\\u30fb\\n"
    );
    return unescape(te[1] || te[0]);
  };

  this.backendVersion = () => {
    return backend_version;
  }

  this.getBackendVersion = () => {
        return new Promise((resolve) => {
          if (backend_version != "") {
            resolve(backend_version)
          } else {
              apiService.getBackendVersion().then(resp => {
              resolve(backend_version = resp.data.split(",")[0]);
            }).catch(err => {
              Log.debug(err);
              resolve("");
            })
          }
        })
      }

  this.setIntrIdLocaleMapping = intIdLocaleMap => {
    InterestIdLocaleMap = intIdLocaleMap;
  };

  this.getIntrIdLocaleMap = () => {
    return InterestIdLocaleMap;
  };

  this.saveInterets = interests => {
    savedInterests = interests;
  };
  this.setLangIdLocaleMapping = lngIdLocaleMap => {
    LangIdLocaleMap = lngIdLocaleMap;
  };

  this.getLangIdLocaleMap = () => {
    return LangIdLocaleMap;
  };

  this.saveLanguages = lang => {
    savedLanguages = lang;
  };

  this.toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10)
    var hours = Math.floor(sec_num / 3600)
    var minutes = Math.floor(sec_num / 60) % 60
    var seconds = sec_num % 60

    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v, i) => v !== "00" || i > 0)
      .join(":")
  }

  this.getSavedInterests = () => {
    return savedInterests;
  };
  this.getSavedLanguages = () => {
    return savedLanguages;
  };

  this.getCredentials = function () {
    var obj = {};
    obj.locale = this.getLocale();
    return obj;
  };

  /**
   * @enum {ActionTypes}
   */
  const ActionTypes = Object.freeze({
    SAVE: "save",
    UNSAVE: "unsave",
    SHARE: "share",
    DELETE: "delete",
    UNDO_DELETE: "undodelete",
    CARD_USEFUL: "carduseful",
    CARD_SURVEY: "cardsurvey",
    CARD_NOT_USEFUL: "cardnotuseful",
    AUTO_DELETE: "autodelete",
    VIEW: "view",
    SCRATCH_COVER_VIEW: "scratchCoverView",
    CLICK: "click",
    SERVED: "served",
    CLEARALL: "clear_all",
    CLOSE_BTN_CLICK: "closeBtnClick"
  });

  this.getActionTypes = () => {
    return ActionTypes;
  };

  this.setIswhatsAppAvail = () => {
    IswhatsAppAvail = androidApiCalls.isPackageAvailable("com.whatsapp");
  }

  this.getIswhatsAppAvail = () => {
    return IswhatsAppAvail;
  }

  this.reportOnboardMetrics = (category, actionType, event) => {
    this.reportMetrics(category, actionType, event);
  }

  this.reportViewMetrics = stats => {
    if (androidApiCalls.checkOnboarding()) {
      return androidApiCalls.submitMetrics(stats);
    }
  };

  this.addUniqueKeyToCard = (response) => {
    response.cards = response.cards.map((item) => {
      let randomKey = parseInt(Math.random() * 1000000);
      for (let card of item.data) {
        card.storyObj_id = card.contentid
          ? card.contentid + "_" + randomKey
          : randomKey;
      }
      item.uniqueKey = item.storyid
        ? item.storyid + "_" + randomKey
        : item.streamid
          ? item.streamid + "_" + randomKey
          : randomKey;
      return item;
    });
    return response.cards;
  }

  this.fromOnboarding = (type, value) => {
    if (type === "set") {
      fromOnboarding = value;
    } else if (type === "get") {
      return fromOnboarding;
    }
  }

  this.getDomParams = function (parameters) {
    var params = {};
    params = Object.assign(params, parameters);
    params = Object.assign(params, this.getCredentials());
    return params;
  };

  this.getFeedTypes = function () {
    return FEEDTYPES;
  };

  this.getDefaulImage = function () {
    return DEFAULT_IMAGE;
  };

  this.checkBrowserType = function () {
    if (window.Android !== undefined) {
      return DEVICE_TYPES.ENGAGE;
    }
    return DEVICE_TYPES.BROWSER;
  };

  this.saveUserProfile = userProf => {
    userProfile = userProf;
  };

  this.getUserProfileSettings = () => {
    if (Object.keys(userProfile).length === 0) {
      let profData = androidApiCalls.getValue("UserProfileData");
      if (!(profData === undefined)) {
        return JSON.parse(profData);
      } else {
        return userProfile;
      }
    } else {
      return userProfile;
    }
  };

  this.isEngage = function () {
    return this.checkBrowserType() === DEVICE_TYPES.ENGAGE;
  };

  this.generateMetricsPayload = function (events) {
    var obj = this.getCredentials();
    obj.authtoken = obj.motoid_login;
    delete obj.motoid_login;
    obj.events = events;
    return obj;
  };

  this.setUserLocale = function (locale) {
    androidApiCalls.setUserLocale(locale);
  }

  this.getUserLocale = function () {
    return androidApiCalls.getUserLocale();
  }

  this.getLocale = () => {
    let userLocale = this.getUserLocale();
    if (userLocale && userLocale != null) {
      return userLocale;
    }
    if (this.isEngage()) {
      return androidApiCalls.getLocale();
    } else {
      return window.navigator.language;
    }
  }

  this.setCountMsgsV2Count = (counts) => {
    countmsgsv2Count = counts;
  }

  this.getCountMsgsV2Count = () => {
    return countmsgsv2Count;
  }

  this.resetUnservedCount = (tabname) => {
    if (countmsgsv2Count && countmsgsv2Count[tabname]) {
      countmsgsv2Count[tabname].unservedcount = 0;
    }
  }

  this.getTabCounts = (tabname) => {
    try {
      return countmsgsv2Count[tabname]
    } catch (err) {
      Log.sDebug("No showcount for the tab " + tabname, constantObjects.LOG_PROD);
    }
  }

  /**
   * This method is to preserve the initial onboarding status from device.
   * Once onboard is complete and  user routes back, the initial onboard status
   * preserved here (incomplete: 0 or onprogress: -1) needs to be set.
   */
  this.setOnboardDeviceStatus = status => {
    onboardDeviceStatus = status;
  }

  this.getOnboardDeviceStatus = () => {
    onboardDeviceStatus = androidApiCalls.getOnboardDeviceStatus();
    return onboardDeviceStatus;
  }

  this.OnBoardComplete = function () {
    //Set onboarding status to "Complete"
    onBoardDone = true;
    androidApiCalls.changeOnboardingStatus(onBoardDone);
  };

  this.resetOnboardStatus = () => {
    //Reset onboarding status to "Not Complete"
    onBoardDone = false;
    androidApiCalls.changeOnboardingStatus(onBoardDone, onboardDeviceStatus);
  }

  this.userSkipedLogin = (type) => {
    if (type === "set") {
      userSkipedLogin = true;
    } else if (type === "get") {
      return userSkipedLogin;
    }
  }

  this.sortResponseByTs = (response) => {
    try {
      response.cards.sort((a, b) => {
        if (a.data[0].ts > b.data[0].ts) {
          return -1;
        } else if (a.data[0].ts < b.data[0].ts) {
          return 1;
        } else {
          return 0;
        }
      });
      return response;
    } catch (err) {
      return response;
    }
  }


  this.checkVideo = (content, metadata) => {
    try {
      let hasVideo;
      if (content && content.tsa) {
        hasVideo = false;
      } else if (content && content.cta &&
        (content.cta["hasVideo"] === "true" || content.cta["hasVideo"] === true)) {
        hasVideo = true;
      } else if (content && content.videourls &&
        content.videourls[0] && content.videourls[0].length > 0) {
        hasVideo = true;
      } else {
        hasVideo = false;
      }
      if (metadata && metadata.id === "image1") {
        hasVideo = false;
      }
      return hasVideo;
    } catch (err) {
      Log.sDebug(err, "utilities", constantObjects.LOG_PROD);
    }
  }

  this.isIndiaDevice = () => {
    let isIndia;
    androidApiCalls.getMccMnc().map((mccJson) => {
      if (mccJson.mcc === "405" || mccJson.mcc === "404") {
        isIndia = true;
      }
    })
    if (isIndia) {
      return true;
    } else if (androidApiCalls.getShipmentCountry().toUpperCase() === "IN") {
      return true;
    } else if (androidApiCalls.getChannelId().toLowerCase() === 'retin') {
      return true;
    } else {
      return false;
    }
  }

  this.onboardDomPrefetched = (type, val) => {
    if (type === "set") {
      onboardDomPrefetch = val;
    } else if (type === "get") {
      return onboardDomPrefetch;
    }
  }

  this.getImageCroping = (props) => {
    try {
      let {
        story,
        metadata
      } = props;
      let enableImgCrop = androidApiCalls.getSystemStringProperty('enablecrop');
      if (story.content && story.content.cropimage && metadata &&
        (enableImgCrop !== "false") && metadata.data['cropImg']
      ) {
        return `center -${parseInt(story.content.cropimage[0][props.imgType].hghtPixel)}px`
      } else {
        return "center top";
      }
    } catch (err) {
      return "center top";
    }
  }
  this.areAdsCustomized = () => {
    let areAdsCustomized = AndroidApiService.getValue("areAdsCustomized")
    if (areAdsCustomized) {
      return areAdsCustomized;
    } else {
      AndroidApiService.persistValue("areAdsCustomized", "true");
      return "true";
    }
  };

  this.logEvent = function () {
    return;
  };

  this.saveContentIdVideoMap = function (contentId, videoMetrics) {
    contentIdVideoMetricsMap[contentId] = videoMetrics;
  };

  this.getContentIdVideoMap = function (contentId) {
    return contentIdVideoMetricsMap[contentId];
  };

  this.clearContentIdVideoMap = function () {
    contentIdVideoMetricsMap = {};
  };

  this.setShareSupport = function (isSupported) {
    shareSupport = isSupported;
  }

  this.getShareSupport = function () {
    return shareSupport;
  }

  this.isFreshlaunch = function () {
    return freshLaunch;
  }
  this.setFreshlaunch = function (value) {
    freshLaunch = value;
  }

  this.validateCPF = (value) => {
    if (androidApiCalls.isMotoPlaceEnabled() && value.length === 0) {
      return true;
    } else if (!androidApiCalls.isMotoPlaceEnabled() && value == null) return false

    var invalidos = [
      "111.111.111-11",
      "222.222.222-22",
      "333.333.333-33",
      "444.444.444-44",
      "555.555.555-55",
      "666.666.666-66",
      "777.777.777-77",
      "888.888.888-88",
      "999.999.999-99",
      "000.000.000-00"
    ];

    for (let i = 0; i < invalidos.length; i++) {
      if (invalidos[i] == value) {
        return false;
      }
    }
    value = value.replace("-", "");
    value = value.replace(/\./g, "");
    var add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(value.charAt(i), 10) * (10 - i);
    var rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(value.charAt(9), 10)) return false;
    add = 0;
    for (let i = 0; i < 10; i++) add += parseInt(value.charAt(i), 10) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11) rev = 0;
    if (rev != parseInt(value.charAt(10), 10)) return false;
    return true;
  };

  this.formatDate = function (date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var secs = date.getSeconds();
    var milliSecs = date.getMilliseconds();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime =
      hours + ":" + minutes + ":" + secs + ":" + milliSecs + " " + ampm;
    return (
      date.getMonth() +
      1 +
      "/" +
      date.getDate() +
      "/" +
      date.getFullYear() +
      "  " +
      strTime
    );
  };

  this.beautifyStr = function (inputStr) {
    var beautifyStrArray = [HTTPS_PREFIX, WWW_PREFIX];
    for (let index in beautifyStrArray) {
      let str = beautifyStrArray[index];
      if (inputStr.indexOf(str) != -1) {
        inputStr = inputStr.slice(str.length);
      }
    }
    return inputStr;
  }

  this.getUsefulLinkArray = function () {
    return usefulLinksArray;
  }

  this.setUsefulLinkArray = data => {
    usefulLinksArray = data;
  }

  this.getScaledStyle = (styleobj, story) => {
    let parentsize = story.dom.parentsize;
    /**
     * Determine dom type as different correction factots apply
     * Cards have a side padding total of 16px
     * Dialogs do not have any standard padding
     */
    let isDialog = (story && story.id && story.id.indexOf('dialog') !== -1);
    let isReels = (story && story.id && story.id.indexOf('reels') !== -1);
    let domtype = isDialog ? "dialog" : isReels ? "reels" : "cards";

    let correctionFactor = domtype === "cards" ? 32 : 0;
    let heightConst = domtype === "cards" ? 176 : window.innerHeight * 0.47;
    let widthConst = domtype === "cards" ? 371 : window.innerWidth;

    /**
     *  For cards and dialogs,
     * all width and height are calculated against 338 * 310
     * Calculate scaledWidth and Height by setting scaledWidth to
     * the available device width and calculate height based on
     * aspect Ratio.
     * As intropages are full screen and target size is sometimes
     * available in dom as screensize, the same should be considered
     */

    let scaledStandardWidth = (WINDOW_WIDTH - correctionFactor);
    let scaledStandardHeight = heightConst * scaledStandardWidth / widthConst;
    let parentHeight = (parentsize.height * scaledStandardHeight) / 100;
    let parentWidth = (parentsize.width * scaledStandardWidth) / 100;
    let originalElementWidth = parentsize.width * widthConst * parseFloat(styleobj.width) / 10000;
    let originalElementHeight = parentsize.height * heightConst * parseFloat(styleobj.height) / 10000;
    let elementAspectRatio = originalElementWidth / originalElementHeight;

    /**
     * calculate dimensions and position based on the
     * actual parent width and parent height
     */
    let elementWidth = parentWidth * parseFloat(styleobj.width) / 100;
    let elementHeight = elementWidth / parseFloat(elementAspectRatio);
    let elementTop = parentHeight * parseFloat(styleobj.top) / 100;
    let elementLeft = parentWidth * parseFloat(styleobj.left) / 100;

    const pixelToRemConversion = 0.0625;
    const elementWidthInRem = elementWidth * pixelToRemConversion;
    const elementHeightInRem = elementHeight * pixelToRemConversion;

    styleobj.width = elementWidthInRem + "rem";
    styleobj.height = elementHeightInRem + "rem";
    styleobj.top = elementTop + "px";
    styleobj.left = elementLeft + "px";

    if (styleobj.fontSize && styleobj.fontSize.includes("px")) {
      if (styleobj.scalefactor) {
        styleobj.fontSize = styleobj.scalefactor * parseFloat(styleobj.fontSize) + "px";
      } else {
        styleobj.fontSize = parseFloat(styleobj.fontSize) + "px";
      }
    }

    return styleobj;
  }

  this.toolTipState = (type, value) => {
    if (type === "set") {
      tipstate = value;
    } else if (type === "get") {
      return tipstate;
    }
  }

  this.getChromeVersion = () => {
    var pieces = navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/);
    if (pieces == null || pieces.length != 5) {
      return undefined;
    }
    pieces = pieces.map(piece => parseInt(piece, 10));
    return {
      major: pieces[1],
      minor: pieces[2],
      build: pieces[3],
      patch: pieces[4]
    };
  }

  this.reportMetrics = (category, actionType, event) => {
    // if (!AndroidApiService.checkOnboarding()) {
    //   if(!byPassOnboard) {
    //     return;
    //   }
    // }
    let ms = 1 * 60 * 1000;
    let curr_time = new Date();
    let stats = {
      category: category,
      type: "metrics",
      dtime: curr_time.getTime(),
      eventtype: actionType,
      tz: new Date().getTimezoneOffset() * ms * -1,
      event: event,
    };
    return androidApiCalls.submitMetrics(stats);
  };

}

export default new Utils();
