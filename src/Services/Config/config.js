import constantObjects from "../Constants";
import AndroidApiService from "../androidApiCallsService";


/**
 * @enum {PATH}
 */

// Clean up the paths, we should not have enagage urls listed here for any env.
const path = Object.freeze({
  dev: "https://motopay-backend-dev.uc.r.appspot.com",
  staging: "https://motopay-backend-staging.uc.r.appspot.com",
  prod: "https://motopay-backend.uc.r.appspot.com"
});

/**
 * @enum {pathEngage}
 */
 const pathEngage = Object.freeze({
  dev: "https://engage-webview-dot-engage-backend.appspot.com",
  staging: "https://engage-webview-dot-engage-experiments.appspot.com",
  df: "https://engage-webview-dot-engage-146207.appspot.com",
  prod: "https://engage-webview-dot-moto-engage.appspot.com"
});


/**
 * @enum {DAPATH}
 */
const daPath = Object.freeze({
  "SANDBOX": "https://api.sandbox.addhub.com.br/",
  "PRODUCTION": "https://api.addhub.com.br/",
});

const onboardingPath = Object.freeze({
  "SANDBOX": "https://sdx.jazztech.com.br/",
  "PRODUCTION": "https://prod.jazztech.com.br/"
});

const iframeUrl = Object.freeze({
  "SANDBOX": "https://web-safe-iframe-sandbox.jazztech.com.br/",
  "PRODUCTION": "https://web-safe-iframe.jazztech.com.br/",
});

const arbiEnvironment = Object.freeze({
  "SANDBOX": "Sandbox",
  "PRODUCTION": "Production"
});

const chatBotPath = Object.freeze({
  "dev": "https://motopay-backend-dev.uc.r.appspot.com/chatbot/converse",
  "staging": "https://motopay-backend-staging.uc.r.appspot.com/chatbot/converse",
  "prod": "https://motopay-backend.uc.r.appspot.com/chatbot/converse"
});

const FAQPath = Object.freeze({
  "dev": "https://faq-stg.contadigitalmotorola.com.br/",
  "staging": "https://faq-stg.contadigitalmotorola.com.br/",
  "prod": "https://faq.contadigitalmotorola.com.br/"
});

const DimoWebsitePath = Object.freeze({
  "dev": "https://dimomotorola.com.br",
  "staging": "https://dimomotorola.com.br",
  "prod": "https://dimomotorola.com.br"
});

const gamificationPath = Object.freeze({
  "dev": "https://services-gamification-dev.uc.r.appspot.com",
  "staging": "https://services-gamification.uc.r.appspot.com",
  "prod": "https://services-gamification.uc.r.appspot.com"
});

const configuredDomain = AndroidApiService.getDigitalAccountEnvironment();

/**
 * use enableOn key to enable apis on specific env
 * Ex: To enable only on specific platforms, use a
 * comma seperated list of env. Take care not to include
 * space.
 * auth : {
 * value : "/hellomoto/auth",
 * enableOn : "dev,staging"
 * }
 */
const apiList = Object.freeze({
  survey: {
    value: "/survey"
  },
  createWalletProfile:{
    value:"/api/services/app/Conta/CriarConta"
  },
  authWalletProfile:{
    value:"/profile/v1/validate"
  },
  userInformation:{
    value:"/demographics/v1/update"
  },
  createUser:{
    value:"/usuarios/criar-usuario",
    //enableOn: "testing"
  },
  emailVerification:{
    value:"/autenticar/cliente",
    //enableOn: "testing"
  },
  getDataSyncProperties:{
    value:"/dataSyncController/v1/getDataSyncProperties?clientKey=",
  },
  
  getNewFeatureStatus:{
    value: "/GiftCard/v1/getNewFeatureStatus",
  },

  getStatusGiftCardPhase3:{
    value: "/GiftCard/v1/getStatusGiftCardPhase3",
  },

  getStatus:{
    value: "/GiftCard/getStatus",
  },

  getStatusV2:{
    value: "/GiftCard/v2/getStatus",
  },

  setStatus:{
    value: "/GiftCard/setStatus",
  },

  getEligibleForGiftCardPromotion:{
    value: "/GiftCard/getEligibleForGiftCardPromotion?barcode=",
  },

  setEligibleForGiftCardPromotion:{
    value: "/GiftCard/setEligibleForGiftCardPromotion",
  },

 
  feedBack: {
    value: "/hellomotofeedback"
  },
  postOtpRequest:{
    value:"/otp/v1/sendmail"
  },
  validateOtp: {
    value:"/otp/v1/validateotp"
  },
  changePassword:{
    value: "/usuarios/alterar-senha-acesso-cliente"
  },
  userName:{
    value:"/profile/v1/displayName"
  },
  deactivateAccount:{
    value: "/usuarios/delete"
  },
  deleteAccount:{
    value: "/profile/v1/delete/"
  },
  analytics: {
    value: "/analytics/v1/log"
  },
  logs: {
    value: "/v1/securelog"
  },
  publicKey: {
    value: "/rsakeys/v1/get"
  },
  getdom:{
    value: "/webview/dimo/cards"
  },
  eoperations: {
    value: "/webview/eoperations"
  },
  ptHelpFaq: {
    value: "/help/v1/get/pt"
  },
  enHelpFaq: {
    value: "/help/v1/get/en"
  },
  ptFaqAnswer: {
    value: "/help/v1/getReply/pt/"
  },
  enFaqAnswer: {
    value: "/help/v1/getReply/en/"
  },
  getToken:{
    value:"/auth/v1/getToken"
  },
  getTokenForNm:{
    value:"/auth/v1/getTokenForFirebaseCred"
  },
  ptExternalHelpFaq:{
    value:"/help/v1/ext/get/pt"
  },
  enExternalHelpFaq:{
    value:"/help/v1/ext/get/en"
  },
  ptExternalFaqAnswer:{
    value:"/help/v1/ext/getReply/pt/"
  },
  enExternalFaqAnswer:{
    value:"/help/v1/ext/getReply/en/"
  },
  tarrifContentEn:{
    value: "/help/v1/get/tariff/en"
  },
  tarrifContentPt:{
    value: "/help/v1/get/tariff/pt"
  },
  timeContentEn:{
    value: "/help/v1/get/time/en"
  },
  timeContentPt:{
    value: "/help/v1/get/time/pt"
  },
  getDialogDom: {
    value: "/webview/dialog"
  },
  getReelsDom: {
    value: "/webview/reels"
  },
  getOptinStatus: {
    value: "/optin/v1/get/cpf"
  },
  setOptinStatus: {
    value: "/optin/v1/post/update"
  },
  preUpdateOptin: {
    value: "/optin/v1/pre/update"
  },
  waitListRegister:{
    value: "/waitList/v1/wlUserData"
  },
  motoSafeRequest:{
    value: "/motosafeinterface/v1/msRequest"
  },
  getCAFToken : {
    value: "/cafdetails/v1/getdetails"
  },
  chatTicketsRequest:{
    value: "/zoho/v1/getAllTickets"
  },
  chatTicketCommentsRequest:{
    value: "/zoho/v1/getAllTicketComments"
  },
  chatTicketCommentsPostRequest:{
    value: "/zoho/v1/postCommentToTicket"
  },
  secureUrlChatbot:{
    value: "/zoho/v1/getSignedUrl"
  },
  chatPostRatings:{
    value: "/zoho/v1/postRatings"
  },
  getOnboardingClientId:{
    value: "/auth/v1/onboardingToken"
  }
});

const gcsPath = Object.freeze({
  dev: '/helloyou_feedback_uploads_qa/',
  staging: '/feedback_uploaded_files/',
  df: '/helloyou_feedback_uploads_engage/',
  prod: '/helloyou_feedback_uploads_prod/'
});

const gamificationApiList = Object.freeze({
  ongoingPrograms: {
    value: "/program/v1/programs"
  },
  programHistory: {
    value: "/lucky-draw/v1/get/draw-history-for-program"
  },
  allPrizes: {
    value: "/lucky-draw/v2/get/all-prizes"
  },
  wonRewards: {
    value: "/lucky-draw/v1/get/for-client"
  },
  programLuckyNumbers: {
    value: "/program/v1/lucky-numbers-for-program"
  },
  programSnapshot: {
    value: "/program/v1/program-snapshot"
  },
  completedPrograms: {
    value: "/program/v1/completed-programs"
  },
  programCoupons: {
    value: "/coupons/v1/coupons-for-program"
  },
  revealCoupon: {
    value: "/coupons/v1/allocate"
  },
  userLNParticipation: {
    value: "/completed-program/v1/lucky-numbers/summary"
  },
  completedDrawHistory: {
    value: "/lucky-draw/v2/get/draw-history-for-program"
  },
  LNAchievementBoard: {
    value: "/completed-program/v1/lucky-numbers/achievement-board"
  },
  userCouponParticipation: {
    value: "/completed-program/v1/coupons"
  },
  completedProgramTasks: {
    value: "/completed-program/v1/coupons"
  },
  couponAchievementBoard: {
    value: "/completed-program/v1/coupons"
  },
});

class Globals {
  /**
   * Method to return the corresponding api of the given key
   * @param {PATH} key The key of the api to be returned
   * @returns {String}
   */
  Globals() {
    this.env = null;
    this.EngageEnv = null;
    this.nonDefaultUrlPrefix = null;
    this.isNonDefaultUrlSet = false;
  }

  get = key => {
    if (!this.env) {
      if(AndroidApiService.checkIfNm()) {
        this.env = AndroidApiService.getNonMotoEnvironment();
      } else {
        this.env = AndroidApiService.getBackendCloud();
      }
    }

    if (key === "env") {
      return this.env;
    }

    let urlSuffix = apiList[key] && apiList[key]["value"];
    let urlPrefix = path[this.env];
    let res = urlPrefix + urlSuffix;
    console.log("returning config get " + res);
    return res;
  };

  getEngage = key => {
    if (!this.EngageEnv) {
      this.EngageEnv = AndroidApiService.getEnv();
    }
    this.nonDefaultUrlPrefix = AndroidApiService.getBackendVersion() || "";
    let urlSuffix = apiList[key]["value"];
    let urlPrefix = this.nonDefaultUrlPrefix || pathEngage[this.EngageEnv];
    let res = urlPrefix + urlSuffix;
    return res;
  };

  getSaveToBucketPath = () => {
    if(!this.env) {
      this.env = AndroidApiService.getEnv();
    }
    let gcs = path[this.env] + '/gcs' + gcsPath[this.env];
    return gcs;
  }

  getSaveToEngBucketPath = () => {
    if(!this.env) {
      this.env = AndroidApiService.getEnv();
    }
    let gcs = pathEngage[this.env] + '/gcs' + gcsPath[this.env];
    return gcs;
  }

  getStoragePath = () => {
    if(!this.env) {
      this.env = AndroidApiService.getEnv();
    }
    let storagePath = 'https://storage.googleapis.com' + gcsPath[this.env];
    return storagePath;
  }

  getWACustomerCarePath = () => {
    return `https://api.whatsapp.com/send?phone=${constantObjects.customerCareWADialer}`;
  }

  getArbiUrl = urlSuffix => {
    let domain = daPath.PRODUCTION;

    console.log("DA env " + this.getDigitalAccountEvironment());

    if (this.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX) {
      domain = daPath.SANDBOX;
    }

    return domain + urlSuffix;
  }

  getOnboardingUrl = urlSuffix => {
    let domain = onboardingPath.PRODUCTION;

    console.log("DA env " + this.getDigitalAccountEvironment());
    console.log("domain " + domain);

    if (this.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX) {
      domain = onboardingPath.SANDBOX;
    }

    return domain + urlSuffix;
  }

  getGiftCardTreasureAccountKey = () => {
    let key = "a1850777-9e08-4dd2-b7bc-056752be8a7c";
    if(this.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX) {
      key = "b982e03e-0acd-4fa7-84b1-0f53ab27cb00";
    }
    return key;
  }

  getGiftCardUO = () => {
    let UO = 353;
    if(this.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX) {
      UO = 20192;
    }
    return UO;
  }

  getIframeUrl = urlSuffix => {
    let domain = iframeUrl.PRODUCTION;
    if (this.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX) {
      domain = iframeUrl.SANDBOX;
    }

    return domain + urlSuffix;
  }

  getArbiApiResource = completeUrl => {
    let domain = daPath.PRODUCTION;

    console.log("DA env " + this.getDigitalAccountEvironment());

    if (this.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX) {
      domain = daPath.SANDBOX;
    }

    let splitUrl = completeUrl.split(domain);
    return splitUrl.length > 1 ? splitUrl[1]: splitUrl[0];
  }

  getChatBotPath = () => {
    if(!this.env) {
      this.env = AndroidApiService.getEnv();
    }
    let path = chatBotPath[this.env];
    return path;
  }

  getFAQPath = () => {
    if(!this.env) {
      this.env = AndroidApiService.getBackendCloud();
    }
    let path = FAQPath[this.env];
    return path;
  }

  getDimoWebsitePath = () => {
    if(!this.env) {
      this.env = AndroidApiService.getBackendCloud();
    }
    let path = DimoWebsitePath[this.env];
    return path;
  }

  getGamificationApiUrl = (key) => {
    if(!this.env) {
      this.env = AndroidApiService.getBackendCloud();
    }
    
    const urlSuffix = gamificationApiList[key] && gamificationApiList[key]["value"];
    const urlPrefix = gamificationPath[this.env];
    const fullPathUrl = urlPrefix + urlSuffix;
    return fullPathUrl;
  }

  getDigitalAccountEvironment = () => {
    if (configuredDomain ===  arbiEnvironment.SANDBOX) {
      return arbiEnvironment.SANDBOX;
    } else {
      return arbiEnvironment.PRODUCTION;
    }
  }
}

export default new Globals();
export const PATH = Object.keys(path);
export {arbiEnvironment}
