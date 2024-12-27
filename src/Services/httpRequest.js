import axios from "axios";
import ArbiApiUrls from "./ArbiApiUrls";
import GeneralUtilities from "./GeneralUtilities";
import MetricServices from "../Services/MetricsService";
import AndroidApiService from "./androidApiCallsService";
import walletJwtService from "../Services/walletJwtService";
import SessionMetricsTracker from "./SessionMetricsTracker";
import androidApiCalls from "../Services/androidApiCallsService";
import constantObjects from "./Constants";
import { AsymmetricCrypto } from './AsymmetricCrypto';
import { SymmetricCrypto } from './NodeForgeSymmCrypto';
import { SecurePayload } from './SecurePayload';

import errorCodeList from "./ErrorCodeList";
import ArbiApiMetrics from "./ArbiApiMetrics";
import history from "../history";
import ImportantDetails from "../WalletComponents/NewLaunchComponents/ImportantDetails";
import Log from "./Log";
import Globals from "./Config/config";
import { arbiEnvironment } from "./Config/config";
import apiService from "./apiService";
import { v4 as uuidv4 } from 'uuid';

var externalAxios = axios.create({});
var walletAxios = axios.create({});
var gcsAxios = axios.create({});

export const ERROR_IN_SERVER_RESPONSE = "ERROR_IN_SERVER_RESPONSE";
export const NO_RESPONSE = "NO_RESPONSE";

//const SECURE_API_URL = 'https://secure.addhub.com.br/';
const SECURE_API_URL = 'https://secure.jazztech.com.br/';
const UNAUTHORIZED_ACCESS = 401;
const organizationUnitId = Globals.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX ? 3 : constantObjects.featureEnabler.PROD_ORGID;
const clientId = Globals.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX ? "65007e5228567a0008500455" : "649c504398bdfa0008feae67";

/*const PAYMENT_APIS = [ArbiApiUrls.WITHDRAW_ATM_URL, ArbiApiUrls.PAY_BOLETO, ArbiApiUrls.DIMO_PAY_QR_CODE,
  "transferencias/efetuar-ted", "transferencias/efetuar-transferencia-entre-contas-arbi", "recarga/recarregar-celular",
  "pix/operacao/enviar-ordem-pagamento-por-chave", "pix/operacao/enviar-ordem-pagamento-por-agencia",
  "pix/operacao/enviar-ordem-pagamento-por-qrcode", "pix/operacao/enviar-ordem-devolucao"];*/

class HttpRequest {
  constructor() {
    this.initialiseSecureAlgo = this.initialiseSecureApis();
    this.componentName = "HttpRequest";
  }

  async initialiseSecureApis() {

    try {
      // fetches the server's public RSA key
      const publicKeyFetch = await fetch(SECURE_API_URL);
      const publicKey = (await publicKeyFetch.json()).publicKey;

      // initialize algorithms
      this.symmetric = new SymmetricCrypto();
      this.asymmetric = new AsymmetricCrypto(publicKey);

      //this will generate Key and Iv and it will be used for one active session
      this.symmetric.generateSecret();

      Log.debug("pulled secure api details", this.componentName);
      return true;
    } catch (err) {
      Log.debug("could not pull secure api details", this.componentName);
      return false;
    }

  }

  async setHelloYouAxios() {
    let auth = null;
    let config;
    let mpOnly = androidApiCalls.checkIfMpOnly();
    if (mpOnly) {
      /*For not moto devices supporting motopay webview,
      token will be same as apk session token */
      auth = await apiService.performRegistrationOrRefreshToken();
      config = {
        headers: {
          'Authorization': `Bearer ${auth}` //for non moto devices
        }
      }
    } else {
      const authData = GeneralUtilities.isNotEmpty(androidApiCalls.getValue("AuthData", "EngageApp"), "{}");
      auth = JSON.parse(authData);
      config = {
        headers: {
          'Authorization': `Bearer ${auth?.token}` //moto devices
        }
      }
    }
    var helloYouAxios = axios.create(config);
    return helloYouAxios;
  }

  setMotopayToken(token) {
    let config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
    walletAxios = axios.create(config)
  }

  async externalGetRequest(url) {
    let result = externalAxios
      .get(url)
      .then(response => response);

    Log.debug(
      "External request url " + url + " " + GeneralUtilities.formatDate(new Date()), this.componentName
    );

    result.then(response => {
      Log.debug(
        "External response for " +
        url +
        " status code " +
        response.status +
        " " +
        GeneralUtilities.formatDate(new Date()), this.componentName
      );
    }).catch(err => {
      Log.debug(err, this.componentName);
    });
    return result;
  }


  async getRequest(url, params, backend = "motopay") {
    var srcparams = new URLSearchParams();
    for (var param in params) {
      if (Array.isArray(params[param])) {
        for (var src in params[param]) {
          srcparams.append(param, params[param][src]);
        }
      } else {
        srcparams.append(param, params[param]);
      }
    }

    if (
      AndroidApiService.isDummy() === true ||
      (localStorage && Boolean(localStorage.isDummy) === true)
    ) {
      srcparams.set("dummy", true);
    }

    let usedAxios = walletAxios;
    if (backend === "engage") {
      usedAxios = await this.setHelloYouAxios();
      //Required for conveying non motorola device requests to backend
      if (androidApiCalls.checkIfNm()) {
        srcparams.set("nmDevice", true);
      }
    } else {
      usedAxios.interceptors.response.use(response => response, error => {
        const status = error.response ? error.response.status : undefined
        // Fetch token and retry in case of authorization error.
        if (status === 401) {
          if (GeneralUtilities.getReAuthInCurrentSession() < 10) {
            if (AndroidApiService.checkIfNm()) {
              return this.refreshAndGetFCMAuthToken().then(setTimeout(() => {
                GeneralUtilities.reAuthDone();
                let authToken = JSON.parse(walletJwtService.getTokenFromDevice()).token;
                if (authToken === "" || authToken === undefined) {
                  authToken = walletJwtService.getTokenFromDevice();
                }
                error.response.config.headers['Authorization'] = `Bearer ${authToken}`;
                return usedAxios.request(error.config);
              }), 3000);
            } else {
              return this.refreshAndGetToken().then(() => {
                GeneralUtilities.reAuthDone();
                let authToken = JSON.parse(walletJwtService.getTokenFromDevice()).token;
                if (authToken === "" || authToken === undefined) {
                  authToken = walletJwtService.getTokenFromDevice();
                }
                error.response.config.headers['Authorization'] = `Bearer ${authToken}`;
                return usedAxios.request(error.config)
              })
            }
          } else {
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      })
    }


    let result = usedAxios
      .get(url, {
        params: srcparams,
      }).then(response => response).catch(error => {
        Log.debug("There was an error", error);
      });

    Log.debug(
      "request url " + url + " " + GeneralUtilities.formatDate(new Date()), this.componentName
    );
    result.then(response => {
      Log.debug(
        "response for " +
        url +
        " status code " +
        response.status +
        " " +
        GeneralUtilities.formatDate(new Date()), this.componentName
      );
    }).catch(err => {
      if (err.response && err.response.status === 400 && backend === "engage" && GeneralUtilities.getReAuthInCurrentSession() < 1) {
        Log.error('Retrying with auth for url ' + url);
        GeneralUtilities.reAuthDone()
      }
    });

    return result;
  }

  async postWithParamsRequestToArbiSecure(url, payloadJson, params, isSecure = true, authToken = "", customUrl = "", retryCount = 0, sendMetricsAsAlert = true, pageName = "") {
    let url_to_send = url.split(ImportantDetails.accountKey + "/")[1];
    if (!GeneralUtilities.emptyValueCheck(customUrl)) {
      url_to_send = customUrl;
    }
    let url_edit = url + "?";
    var srcparams = new URLSearchParams();
    for (var param in params) {
      if (Array.isArray(params[param])) {
        for (var src in params[param]) {
          srcparams.append(param, params[param][src]);
          url_edit = url_edit + param + '=' + params[param] + '&';
        }
      } else {
        srcparams.append(param, params[param]);
        url_edit = url_edit + param + '=' + params[param] + '&';
      }
    }

    Log.debug("postWithParamsRequestToArbi " + url + " isSecure " + isSecure + " retry count " + retryCount + this.componentName);
    Log.verbose("postWithParamsgetRequestToArbi " + url + " params are" + srcparams, this.componentName);

    let isSecureAlgoInitialised = await this.initialiseSecureAlgo;
    Log.debug("isSecureAlgoInitilaized " + isSecureAlgoInitialised, this.componentName);
    payloadJson["pageName"] = pageName;
    return new Promise((resolve) => {
      if (!isSecureAlgoInitialised) {

        resolve({ "success": false, status: 500, "result": ERROR_IN_SERVER_RESPONSE });

      } else {
        url_edit = url_edit.slice(0, -1);
        let orgHeader = { "uo": organizationUnitId };
        let requestData = this.prepareReuestDataToAdd(url_edit, payloadJson, authToken, orgHeader);
        let startTimeStamp = Date.now();
        let arbiResponse = this.secureApiCall(requestData);

        arbiResponse.then((response) => {
          let responseTime = Date.now() - startTimeStamp;
          Log.verbose("decrypting " + this.symmetric.decrypt(response.data.response), this.componentName);
          let returnedData = JSON.parse(this.symmetric.decrypt(response.data.response));
          Log.debug(
            "response for " +
            url +
            " status code " +
            response.status +
            " " +
            GeneralUtilities.formatDate(new Date(), this.componentName)
          );

          if (returnedData) {
            // if the arbi api is successful then the success property is true and the result property will have the related data
            if (returnedData.success) {
              ArbiApiMetrics.sendArbiSuccessMetrics(url_to_send, payloadJson, returnedData, responseTime, response.status, sendMetricsAsAlert);
              resolve({ "success": true, status: response.status, "result": returnedData.result });
            } else {
              resolve(this.handleError(url_to_send, payloadJson, response.status, returnedData, responseTime));
            }
          }
        }).catch(err => {
          Log.debug("error is " + JSON.stringify(err), this.componentName);
          let responseTime = Date.now() - startTimeStamp;
          let returnedData;
          try {
            if (!err.response) {
              ArbiApiMetrics.sendArbiFailureMetrics(url_to_send, payloadJson, 500, {}, responseTime);
              resolve({ "success": false, "result": NO_RESPONSE });
            }
            if (err.response.status === UNAUTHORIZED_ACCESS) {
              let lastPath = history.location.pathname;
              let lastState = history.location.state;
              ImportantDetails.resetAccessToken();

              ArbiApiMetrics.sendArbiFailureMetrics(url_to_send, payloadJson, err.response.status, err.response, responseTime);
              history.push("/newLogin", { followTo: lastPath, followState: lastState });
            } else {
              let errorDetails = err.response.data.response;
              returnedData = JSON.parse(this.symmetric.decrypt(errorDetails));
              Log.sDebug("decrypted error is " + JSON.stringify(returnedData), this.componentName);
            }
            if (returnedData) {
              resolve(this.handleError(url_to_send, payloadJson, err.response.status, returnedData, responseTime));
            }
          } catch (exception) {
            Log.sDebug("error is " + exception, this.componentName);
          }
        });
      }
    });

  }

  async securePOSTwithParamsApiCall(url, payloadJson, authToken, srcparams) {

    let config = {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        "accept": "text/plain",
        "Content-Type": "application/json"//where applicable
      },
    }

    let arbiAxios = axios.create(config);

    let resPromise = arbiAxios.request({
      method: "post",
      url: url,
      data: JSON.stringify(payloadJson),
      params: srcparams,
    });

    return resPromise;
  }

  async getRequestToArbiSecure(url, params, isSecure = true, authToken = "", customUrl = "", retryCount = 0, pageName = "" , splitKey = ImportantDetails.accountKey) {
    let url_to_send = url.split(splitKey + "/")[1];
    if (!GeneralUtilities.emptyValueCheck(customUrl)) {
      url_to_send = customUrl;
    }
    let url_edit = url + "?";
    var srcparams = new URLSearchParams();
    for (var param in params) {
      if (Array.isArray(params[param])) {
        for (var src in params[param]) {
          srcparams.append(param, params[param][src]);
          url_edit = url_edit + param + '=' + params[param] + '&';
        }
      } else {
        srcparams.append(param, params[param]);
        url_edit = url_edit + param + '=' + params[param] + '&';
      }
    }

    Log.debug("getRequestToArbi " + url + " isSecure " + isSecure + " retry count " + retryCount + this.componentName);
    Log.verbose("getRequestToArbi " + url + " params are" + JSON.stringify(srcparams), this.componentName);

    let isSecureAlgoInitialised = await this.initialiseSecureAlgo;
    Log.debug("isSecureAlgoInitilaized " + isSecureAlgoInitialised, this.componentName);

    return new Promise((resolve) => {
      if (!isSecureAlgoInitialised) {

        resolve({ "success": false, status: 500, "result": ERROR_IN_SERVER_RESPONSE });

      } else {
        url_edit = url_edit.slice(0, -1);
        let orgHeader = { "uo": organizationUnitId };
        let requestData = this.prepareReuestDataToAdd(url_edit, srcparams, authToken, orgHeader, "get");
        let startTimeStamp = Date.now();
        let arbiResponse = this.secureApiCall(requestData);
        params["pageName"] = pageName;
        arbiResponse.then((response) => {
          let responseTime = Date.now() - startTimeStamp;
          Log.verbose("decrypting " + this.symmetric.decrypt(response.data.response), this.componentName);
          let returnedData = JSON.parse(this.symmetric.decrypt(response.data.response));
          Log.debug(
            "response for " +
            url +
            " status code " +
            response.status +
            " " +
            GeneralUtilities.formatDate(new Date(), this.componentName)
          );

          if (returnedData) {
            // if the arbi api is successful then the success property is true and the result property will have the related data
            if (returnedData.success) {
              ArbiApiMetrics.sendArbiSuccessMetrics(url_to_send, params, returnedData, responseTime, response.status);
              resolve({ "success": true, status: response.status, "result": returnedData.result });
            } else {
              resolve(this.handleError(url_to_send, params, response.status, returnedData, responseTime));
            }
          }
        }).catch(err => {
          Log.debug("error is " + JSON.stringify(err), this.componentName);
          let responseTime = Date.now() - startTimeStamp;
          let returnedData;
          try {
            if (!err.response) {

              ArbiApiMetrics.sendArbiFailureMetrics(url_to_send, params, 500, {}, responseTime);
              resolve({ "success": false, "result": NO_RESPONSE });
            }
            if (err.response.status === UNAUTHORIZED_ACCESS) {
              let lastPath = history.location.pathname;
              let lastState = history.location.state;
              ImportantDetails.resetAccessToken();

              ArbiApiMetrics.sendArbiFailureMetrics(url_to_send, params, err.response.status, err.response, responseTime);
              history.push("/newLogin", { followTo: lastPath, followState: lastState });
            } else {
              let errorDetails = err.response.data.response;
              returnedData = JSON.parse(this.symmetric.decrypt(errorDetails));
              Log.debug("decrypted error is " + JSON.stringify(returnedData), this.componentName);
            }
            if (returnedData) {
              resolve(this.handleError(url_to_send, params, err.response.status, returnedData, responseTime));
            }
          } catch (exception) {
            Log.debug("error is " + exception, this.componentName);
          }
        });
      }
    });

  }

  // Do not use this API for Jazz request. This is exclusively for engage/backend
  async postRequest(url, payloadJson, conType = "application/json", backend = "motopay", params = {}) {
    let usedAxios = walletAxios;
    if (backend === "engage") {
      usedAxios = await this.setHelloYouAxios();
      //Required for conveying non motorola device requests to backend
      if (androidApiCalls.checkIfNm()) {
        params.nmDevice = true;
      }
    } else if (backend === "engageFileParams") {
      params = { 'name': 'file' };
      usedAxios = await this.setHelloYouAxios();
      //Required for conveying non motorola device requests to backend
      if (androidApiCalls.checkIfNm()) {
        params.nmDevice = true;
      }
    } else {
      usedAxios.interceptors.response.use(response => response, error => {
        const status = error.response ? error.response.status : undefined
        // Fetch token and retry in case of authorization error.
        if (status === 401) {
          if (GeneralUtilities.getReAuthInCurrentSession() < 10) {
            if (AndroidApiService.checkIfNm()) {
              return this.refreshAndGetFCMAuthToken().then(setTimeout(() => {
                GeneralUtilities.reAuthDone();
                let authToken = JSON.parse(walletJwtService.getTokenFromDevice()).token;
                if (authToken === "" || authToken === undefined) {
                  authToken = walletJwtService.getTokenFromDevice();
                }
                error.response.config.headers['Authorization'] = `Bearer ${authToken}`;
                return usedAxios.request(error.config);
              }), 3000);
            } else {
              return this.refreshAndGetToken().then(() => {
                GeneralUtilities.reAuthDone();
                let authToken = JSON.parse(walletJwtService.getTokenFromDevice()).token;
                if (authToken === "" || authToken === undefined) {
                  authToken = walletJwtService.getTokenFromDevice();
                }
                error.response.config.headers['Authorization'] = `Bearer ${authToken}`;
                return usedAxios.request(error.config);
              })
            }
          } else {
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      })
    }

    let resPromise = usedAxios.request({
      method: "post",
      url: url,
      data: payloadJson,
      params: params,
      headers: {
        'Content-Type': conType
      },
      crossDomain: true
    });

    Log.debug(
      "request for " + url + " " + GeneralUtilities.formatDate(new Date()), this.componentName
    );
    resPromise.then(response => {
      Log.debug(
        "response for " +
        url +
        " status code " +
        response.status +
        " " +
        GeneralUtilities.formatDate(new Date()), this.componentName
      );
    }).catch(err => {
      Log.debug(err, this.componentName)
    })
    return resPromise;
  }

  async putRequest(url, payloadJson, conType) {
    let usedAxios = gcsAxios;

    let config = {
      headers: {
        'Content-Type': conType
      }
    }
    usedAxios = axios.create(config);


    let resPromise = usedAxios.request({
      method: "put",
      url: url,
      data: payloadJson,
      crossDomain: true
    });

    Log.debug(
      "request for " + url + " " + GeneralUtilities.formatDate(new Date()), this.componentName
    );
    resPromise.then(response => {
      Log.debug(
        "response for " +
        url +
        " status code " +
        response.status +
        " " +
        GeneralUtilities.formatDate(new Date()), this.componentName
      );
    }).catch(err => {
      Log.debug(err, this.componentName)
    })
    return resPromise;
  }

  refreshAndGetToken = async () => {
    return await walletJwtService.setAuthorization();
  }

  refreshAndGetFCMAuthToken = async () => {
    Log.sDebug("refreshAndGetFCMAuthToken as FCM Token is expired", "httpRequest");
    AndroidApiService.refreshNmFirebaseToken();
    window.onFbTokenRefreshed = async () => {
      return await walletJwtService.authorize();
    }
  }

  async postRequestToArbiNonSecure(url, payloadJson, accessToken) {

    let arbiAxios = axios.create({});
    if (accessToken) {
      let config = {
        headers: {
          'Authorization': `Bearer ${accessToken}` //where applicable
        }
      }
      arbiAxios = axios.create(config);
    }

    return new Promise((resolve) => {
      let resPromise = arbiAxios.request({
        method: "post",
        url: url,
        data: payloadJson,
        headers: {
          "accept": "text/plain",
          "Content-Type": "application/json-patch+json"
        },
      });

      Log.debug(
        "request for " + url + " " + GeneralUtilities.formatDate(new Date()), this.componentName
      );
      resPromise.then(response => {
        Log.debug(
          "response for " +
          url +
          " status code " +
          response.status +
          " " +
          GeneralUtilities.formatDate(new Date()) + " data " + JSON.stringify(response.data), this.componentName
        );

        // usually if the arbi api is successful then the success property is true and the result property will have the related data
        if (response.data && response.data.success) {
          resolve({ "success": true, status: response.status, "result": response.data.result });
        } else {
          // its 200 but there is not data from server
          resolve({ "success": false, status: response.status, "result": ERROR_IN_SERVER_RESPONSE });
        }
      }).catch(err => {
        Log.debug(err, this.componentName)
        if (err.response) {
          let metricsPayload = {
            "uri": url,
            "httpResponseCode": err.response.status,
            "data": {
              "errorResponse": JSON.stringify(err.response.data.error),
              "payload_sent": JSON.stringify(payloadJson)
            }
          };
          MetricServices.reportAlertEventMetrics(metricsPayload);
          resolve({ "success": false, status: err.response.status, "result": err.response.data.error });
        } else {
          let metricsPayload = {
            "uri": url,
            "httpResponseCode": 500,
            "data": ERROR_IN_SERVER_RESPONSE
          };
          MetricServices.reportAlertEventMetrics(metricsPayload);
          resolve({ "success": false, status: 500, "result": ERROR_IN_SERVER_RESPONSE });
        }
      })
    });
  }

  async putRequestToArbiNonSecure(url, payloadJson, accessToken) {

    let arbiAxios = axios.create({});
    if (accessToken) {
      let config = {
        headers: {
          'Authorization': `Bearer ${accessToken}` //where applicable
        }
      }
      arbiAxios = axios.create(config);
    }

    return new Promise((resolve) => {
      let resPromise = arbiAxios.request({
        method: "put",
        url: url,
        data: payloadJson,
        headers: {
          "accept": "text/plain",
          "Content-Type": "application/json-patch+json"
        },
      });

      Log.debug(
        "request for " + url + " " + GeneralUtilities.formatDate(new Date()), this.componentName
      );
      resPromise.then(response => {
        Log.debug(
          "response for " +
          url +
          " status code " +
          response.status +
          " " +
          GeneralUtilities.formatDate(new Date()) + " data " + JSON.stringify(response.data), this.componentName
        );

        // usually if the arbi api is successful then the success property is true and the result property will have the related data
        if (response.data && response.data.success) {
          resolve({ "success": true, status: response.status, "result": response.data.result });
        } else {
          // its 200 but there is not data from server
          resolve({ "success": false, status: response.status, "result": ERROR_IN_SERVER_RESPONSE });
        }
      }).catch(err => {
        Log.debug(err, this.componentName)
        if (err.response) {
          let metricsPayload = {
            "uri": url,
            "httpResponseCode": err.response.status,
            "data": {
              "errorResponse": JSON.stringify(err.response.data.error),
              "payload_sent": JSON.stringify(payloadJson)
            }
          };
          MetricServices.reportAlertEventMetrics(metricsPayload);
          resolve({ "success": false, status: err.response.status, "result": err.response.data.error });
        } else {
          let metricsPayload = {
            "uri": url,
            "httpResponseCode": 500,
            "data": ERROR_IN_SERVER_RESPONSE
          };
          MetricServices.reportAlertEventMetrics(metricsPayload);
          resolve({ "success": false, status: 500, "result": ERROR_IN_SERVER_RESPONSE });
        }
      })
    });
  }

  prepareReuestDataToAdd(path, data, authToken, orgHeader, type) {
    if (authToken) {
      authToken = this.symmetric.encrypt(`Bearer ${authToken}`);
    }

    let finalType = GeneralUtilities.emptyValueCheck(type) ? "post" : type;

    // generates a SecurePayload
    const secret = this.asymmetric.encrypt(this.symmetric.getKeyAndIvForAsym(), false);
    const payload = this.symmetric.encrypt(JSON.stringify(data));
    const route = this.symmetric.encrypt(`${path}`);
    const typeOfCall = this.symmetric.encrypt(`${finalType}`);
    const header = this.symmetric.encrypt(JSON.stringify(orgHeader));
    const securePayload = new SecurePayload(payload, authToken, secret, route, typeOfCall, header);

    // sends the request
    const requestData = {
      payload: btoa(JSON.stringify(securePayload))
    };

    return requestData;
  }

  async secureApiCall(requestData) {
    let newAxios = axios.create({});

    let resPromise = newAxios.request({
      method: "post",
      url: SECURE_API_URL,
      data: JSON.stringify(requestData),
      headers: {
        "accept": "text/plain",
        "Content-Type": "application/json",
        "ClientId": clientId
      },
    });
    return resPromise;
  }

  async putSecureApiCall(requestData) {
    let newAxios = axios.create({});

    let resPromise = newAxios.request({
      method: "put",
      url: SECURE_API_URL,
      data: JSON.stringify(requestData),
      headers: {
        "accept": "text/plain",
        "Content-Type": "application/json"
      },
    });
    return resPromise;
  }

  async secureCallHash(requestData) {
    let newAxios = axios.create({});

    let resPromise = newAxios.request({
      method: "post",
      url: SECURE_API_URL + "hash",
      data: JSON.stringify(requestData),
      headers: {
        "accept": "text/plain",
        "Content-Type": "application/json"
      },
    });
    return resPromise;
  }

  async putRequestToArbi(url, payloadJson, isSecure = true, authToken = "", customUrl = "", retryCount = 0, pageName = "") {

    let url_to_send = url.split(ImportantDetails.accountKey + "/")[1];
    if (!GeneralUtilities.emptyValueCheck(customUrl)) {
      url_to_send = customUrl;
    }
    Log.debug("putRequestToArbi " + url + " isSecure " + isSecure + " retry count " + retryCount + " idempotency key is " + payloadJson["chaveDeIdempotencia"], this.componentName);
    Log.verbose("putRequestToArbi " + url + " payload is" + JSON.stringify(payloadJson), this.componentName);

    if (!isSecure) {
      return this.putRequestToArbiNonSecure(url, payloadJson, authToken);
    }

    let isSecureAlgoInitialised = await this.initialiseSecureAlgo;
    Log.debug("isSecureAlgoInitilaized " + isSecureAlgoInitialised, this.componentName);

    return new Promise((resolve) => {
      if (!isSecureAlgoInitialised) {
        resolve({ "success": false, status: 500, "result": ERROR_IN_SERVER_RESPONSE });
      } else {
        let orgHeader = { "uo": organizationUnitId, "ClientId": clientId  };
        let requestData = this.prepareReuestDataToAdd(url, payloadJson, authToken, orgHeader, "put");
        let startTimeStamp = Date.now();
        let arbiResponse = this.secureApiCall(requestData);
        requestData["pageName"] = pageName;
        arbiResponse.then((response) => {
          let responseTime = Date.now() - startTimeStamp;
          Log.verbose("decrypting " + this.symmetric.decrypt(response.data.response), this.componentName);
          let returnedData = JSON.parse(this.symmetric.decrypt(response.data.response));
          Log.debug("response for " + url + " status code " + response.status + " " + GeneralUtilities.formatDate(new Date(), this.componentName));
          if (returnedData) {
            // if the arbi api is successful then the success property is true and the result property will have the related data
            if (returnedData.success) {
              if (url.includes(ArbiApiUrls.AUTHENTICATE_USER)) {
                SessionMetricsTracker.createSessionId();
              }
              ArbiApiMetrics.sendArbiSuccessMetrics(url_to_send, payloadJson, returnedData, responseTime, response.status);
              resolve({ "success": true, status: response.status, "result": returnedData.result });
            } else {
              resolve(this.handleNewError(url_to_send, payloadJson, response.status, returnedData, responseTime));
            }
          }
        }).catch(err => {
          Log.debug("error is " + JSON.stringify(err), this.componentName);
          let responseTime = Date.now() - startTimeStamp;
          let returnedData;
          try {
            if (!err.response) {
              ArbiApiMetrics.sendArbiFailureMetrics(url_to_send, payloadJson, 500, {}, responseTime);
              resolve({ "success": false, "result": NO_RESPONSE });
            }
            if (err.response.status === UNAUTHORIZED_ACCESS) {
              let lastPath = history.location.pathname;
              let lastState = history.location.state;
              ImportantDetails.resetAccessToken();

              ArbiApiMetrics.sendArbiFailureMetrics(url_to_send, payloadJson, err.response.status, {}, responseTime);
              history.push("/newLogin", { followTo: lastPath, followState: lastState });
            } else {
              let errorDetails = err.response.data.response;
              returnedData = JSON.parse(this.symmetric.decrypt(errorDetails));
              Log.debug("decrypted error is " + JSON.stringify(returnedData), this.componentName);
            }
            if (returnedData) {
              resolve(this.handleNewError(url_to_send, payloadJson, err.response.status, returnedData, responseTime));
            }
          } catch (exception) {
            Log.debug("error is " + exception, this.componentName);
          }
        });
      }
    });
  }

  async postRequestToArbi(url, payloadJson, isSecure = true, authToken = "", retryCount = 0, pageName = "", customUrl = "") {
    let url_to_send = url;

    if (!GeneralUtilities.emptyValueCheck(customUrl)) {
      url_to_send = customUrl;
    }

    Log.debug("postRequestToArbi " + url + " isSecure " + isSecure + " retry count " + retryCount + " idempotency key is " + payloadJson["chaveDeIdempotencia"], this.componentName);
    Log.verbose("postRequestToArbi " + url + " payload is" + JSON.stringify(payloadJson), this.componentName);

    if (!isSecure) {
      return this.postRequestToArbiNonSecure(url, payloadJson, authToken);
    }

    let isSecureAlgoInitialised = await this.initialiseSecureAlgo;
    Log.debug("isSecureAlgoInitilaized " + isSecureAlgoInitialised, this.componentName);

    return new Promise((resolve) => {
      if (!isSecureAlgoInitialised) {

        resolve({ "success": false, status: 500, "result": ERROR_IN_SERVER_RESPONSE });

      } else {
        let orgHeader = { "uo": organizationUnitId, "ClientId": clientId };
        let requestData = this.prepareReuestDataToAdd(url, payloadJson, authToken, orgHeader);
        payloadJson["pageName"] = pageName;
        let startTimeStamp = Date.now();

        let arbiResponse = this.secureApiCall(requestData);
        arbiResponse.then((response) => {
          let responseTime = Date.now() - startTimeStamp;
          Log.verbose("decrypting " + this.symmetric.decrypt(response.data.response), this.componentName);
          let returnedData = JSON.parse(this.symmetric.decrypt(response.data.response));
          Log.debug(
            "response for " +
            url +
            " status code " +
            response.status +
            " " +
            GeneralUtilities.formatDate(new Date(), this.componentName)
          );

          if (returnedData) {
            // if the arbi api is successful then the success property is true and the result property will have the related data
            if (returnedData.success) {
              if (url.includes(ArbiApiUrls.AUTHENTICATE_USER)) {
                SessionMetricsTracker.createSessionId();
              }
              ArbiApiMetrics.sendArbiSuccessMetrics(url_to_send, payloadJson, returnedData, responseTime, response.status);
              resolve({ "success": true, status: response.status, "result": returnedData.result });
            } else {
              resolve(this.handleError(url_to_send, payloadJson, response.status, returnedData, responseTime));
            }
          }
        }).catch(err => {
          Log.debug("error is " + JSON.stringify(err), this.componentName);
          let responseTime = Date.now() - startTimeStamp;
          let returnedData;
          if (err && !err.response) {
            ArbiApiMetrics.sendArbiFailureMetrics(url_to_send, payloadJson, 500, err, responseTime);
            resolve({ "success": false, "result": NO_RESPONSE });
          }
          if (err && err.response && err.response.status === UNAUTHORIZED_ACCESS  && !url.includes("autenticar/device")) {
            let lastPath = history.location.pathname;
            let lastState = history.location.state;
            ImportantDetails.resetAccessToken();

            ArbiApiMetrics.sendArbiFailureMetrics(url_to_send, payloadJson, err.response.status, err.response, responseTime);
            history.push("/newLogin", { followTo: lastPath, followState: lastState });
          } else if(err && err.response && err.response.data){
            let errorDetails = err.response.data.response;
            returnedData = JSON.parse(this.symmetric.decrypt(errorDetails));
            Log.sDebug("decrypted error is " + JSON.stringify(returnedData), this.componentName);
          }
          if (returnedData) {
            resolve(this.handleError(url_to_send, payloadJson, err.response.status, returnedData, responseTime));
          }
        }
        );
      }
    });
  }

  async postRequestToArbiHash(main_url, payloadJson, isSecure = true, authToken = "", retryCount = 0) {

    Log.debug("postRequestForHash " + main_url + " isSecure " + isSecure + " retry count " + retryCount + " idempotency key is " + payloadJson["chaveDeIdempotencia"], this.componentName);
    Log.verbose("postRequestForHash  " + main_url + " payload is" + JSON.stringify(payloadJson), this.componentName);

    let isSecureAlgoInitialised = await this.initialiseSecureAlgo;
    Log.debug("isSecureAlgoInitilaized " + isSecureAlgoInitialised, this.componentName);

    return new Promise((resolve) => {
      if (!isSecureAlgoInitialised) {
        resolve({ "success": false, status: 500, "result": ERROR_IN_SERVER_RESPONSE });
      } else {
        let orgHeader = { "uo": organizationUnitId };
        let requestData = this.prepareReuestDataToAdd(main_url, payloadJson, authToken, orgHeader);

        let startTimeStamp = Date.now();

        let arbiResponse = this.secureCallHash(requestData);
        arbiResponse.then((response) => {
          Log.debug(
            "response for " +
            main_url + "with hasing url hash" +
            " status code " +
            response.status +
            " " +
            GeneralUtilities.formatDate(new Date(), this.componentName)
          );

          resolve({ "success": true, status: response.status, "result": response.data.response });

        }).catch(err => {
          Log.debug("error is " + JSON.stringify(err), this.componentName);
          let responseTime = Date.now() - startTimeStamp;
          let returnedData;
          if (!err.response) {
            ArbiApiMetrics.sendArbiFailureMetrics(main_url, payloadJson, 500, {}, responseTime);
            resolve({ "success": false, "result": NO_RESPONSE });
          }
          if (err.response.status === UNAUTHORIZED_ACCESS) {
            let lastPath = history.location.pathname;
            let lastState = history.location.state;
            ImportantDetails.resetAccessToken();

            ArbiApiMetrics.sendArbiFailureMetrics(main_url, payloadJson, err.response.status, err.response, responseTime);
            history.push("/newLogin", { followTo: lastPath, followState: lastState });
          } else {
            let errorDetails = err.response.data.response;
            returnedData = JSON.parse(this.symmetric.decrypt(errorDetails));
            Log.sDebug("decrypted error is " + JSON.stringify(returnedData), this.componentName);
          }
          if (returnedData) {
            resolve(this.handleError(main_url, payloadJson, err.response.status, returnedData, responseTime));
          }
        });
      }
    });
  }


  handleError(url, requestData, status, returnedData, responseTime) {
    if (returnedData) {
      ArbiApiMetrics.sendArbiFailureMetrics(url, requestData, status, returnedData.error, responseTime);
      return { "success": false, status: status, "result": returnedData.error ? returnedData.error : returnedData };
    }
  }

  handleNewError(url, requestData, status, returnedData, responseTime) {
    if (returnedData) {
      ArbiApiMetrics.sendArbiFailureMetrics(url, requestData, status, returnedData.error, responseTime);
      return { "success": false, status: status, "result": returnedData.result };
    }
  }

  retryPostRequestToArbi(url, payloadJson, isSecure, authToken, retryCount, errorCode) {
    retryCount++;
    if (errorCode === errorCodeList.DUPLICATE_IDEMPOTENCY_ERROR) {
      payloadJson["chaveDeIdempotencia"] = uuidv4();
    }

    return this.postRequestToArbi(url, payloadJson, isSecure, authToken, retryCount);
  }

  retryGetRequestToArbi(url, params, isSecure, authToken, retryCount) {
    retryCount++;
    Log.sDebug("GET request failed", this.componentName, constantObjects.LOG_PROD);
    return this.getRequestToArbiSecure(url, params, isSecure, authToken, retryCount);
  }


  async retryCall(url, type, params, data, backend = "motopay") {
    let usedAxios = walletAxios;
    if (backend === "engage") {
      usedAxios = await this.setHelloYouAxios();
      /*motopay webview does not call retryCall function.
        The below nmDevice param is needed for helloyou webview,
        in case it becomes available for non moto devices */
      if (androidApiCalls.checkIfNm()) {
        params.set("nmDevice", true);
      }
    }
    let resPromise = usedAxios.request({
      method: type,
      url: url,
      data: data,
      params: params,
      crossDomain: true
    });

    Log.debug(
      "request url " + url + " " + GeneralUtilities.formatDate(new Date()), this.componentName
    );
    resPromise.then(response => {
      Log.debug(
        "response for " +
        url +
        " status code " +
        response.status +
        " " +
        GeneralUtilities.formatDate(new Date()), this.componentName
      );
    });
    return resPromise;
  }

  async postRequestUrlencoded(url, payload){
    return new Promise((resolve) => {
      let apiResponse = axios({
        method: 'POST',
        url: url,
        withCredentials: false,
        data: payload,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      apiResponse.then(function (response) {
          if (response.data) {
            resolve({ "success": true, status: response.status, "result": response.data.access_token });
          } else {
            resolve({ "success": false, status: response.status, "result": ERROR_IN_SERVER_RESPONSE });
          }
      }). catch(err => {
        Log.debug(err, this.componentName)
        if (err.response) {
          let metricsPayload = {
            "uri": url,
            "httpResponseCode": err.response.status,
            "data": {
              "errorResponse": JSON.stringify(err.response.data.error),
              "payload_sent": JSON.stringify(payload)
            }
          };
          MetricServices.reportAlertEventMetrics(metricsPayload);
          resolve({ "success": false, status: err.response.status, "result": err.response.data.error });
        } else {
          let metricsPayload = {
            "uri": url,
            "httpResponseCode": 500,
            "data": ERROR_IN_SERVER_RESPONSE
          };
          MetricServices.reportAlertEventMetrics(metricsPayload);
          resolve({ "success": false, status: 500, "result": ERROR_IN_SERVER_RESPONSE });
        }
      })
    });

  }

  async postRequestOnboarding(url, payloadJson, accessToken) {

    let arbiAxios = axios.create({});
    let startTimeStamp = Date.now();
    if (accessToken) {
      let config = {
        headers: {
          'Authorization': `Bearer ${accessToken}` 
        }
      }
      arbiAxios = axios.create(config);
    }

    return new Promise((resolve) => {
      let resPromise = arbiAxios.request({
        method: "post",
        url: url,
        data: payloadJson,
        headers: {
          "accept": "text/plain",
          "Content-Type": "application/json-patch+json"
        },
      });

      Log.debug(
        "request for " + url + " " + GeneralUtilities.formatDate(new Date()), this.componentName
      );
      resPromise.then(response => {
        let responseTime = Date.now() - startTimeStamp;
        // Log.verbose("decrypting " + this.symmetric.decrypt(response.data), this.componentName);
        Log.debug(
          "response for " +
          url +
          " status code " +
          response.status +
          " " +
          GeneralUtilities.formatDate(new Date()) + " data " + JSON.stringify(response.data), this.componentName
        );

        if (response.data) {
          ArbiApiMetrics.sendArbiSuccessMetrics(url, payloadJson, response.data, responseTime, response.status);
          resolve({ "success": true, status: response.status, "result": response.data });
        } else {
          // its 200 but there is not data from server
          resolve({ "success": false, status: response.status, "result": ERROR_IN_SERVER_RESPONSE });
        }
      }).catch(err => {
        Log.debug(err, this.componentName)
        let responseTime = Date.now() - startTimeStamp;
        if (err.response) {
          let metricsPayload = {
            "uri": url,
            "httpResponseCode": err.response.status,
            "data": {
              "errorResponse": JSON.stringify(err.response.data.error),
              "payload_sent": JSON.stringify(payloadJson)
            }
          };
          MetricServices.reportAlertEventMetrics(metricsPayload);
          ArbiApiMetrics.sendArbiFailureMetrics(url, payloadJson, err.response.status, err.response, responseTime);
          resolve({ "success": false, status: err.response.status, "result": err.response.data.error });
        } else {
          let metricsPayload = {
            "uri": url,
            "httpResponseCode": 500,
            "data": ERROR_IN_SERVER_RESPONSE
          };
          MetricServices.reportAlertEventMetrics(metricsPayload);
          ArbiApiMetrics.sendArbiFailureMetrics(url, payloadJson, 500, err, responseTime);
          resolve({ "success": false, status: 500, "result": ERROR_IN_SERVER_RESPONSE });
        }
      })
    });
  }

  async patchRequestUrlencoded(url, payload, accessToken){
    let arbiAxios = axios.create({});
    if (accessToken) {
      let config = {
        headers: {
          'Authorization': `Bearer ${accessToken}` 
        }
      }
      arbiAxios = axios.create(config);
    }
    return new Promise((resolve) => {
      let apiResponse = arbiAxios.request({
        method: 'PATCH',
        url: url,
        withCredentials: false,
        data: payload,
        headers: {
            "Content-Type": "application/json"
        }
      })
      apiResponse.then(function (response) {
          if (response.data) {
            resolve({ "success": true, status: response.status, "result": response.data });
          } else {
            resolve({ "success": false, status: response.status, "result": ERROR_IN_SERVER_RESPONSE });
          }
      }). catch(err => {
        Log.debug(err, this.componentName)
        if (err.response) {
          let metricsPayload = {
            "uri": url,
            "httpResponseCode": err.response.status,
            "data": {
              "errorResponse": JSON.stringify(err.response.data.error),
              "payload_sent": JSON.stringify(payload)
            }
          };
          MetricServices.reportAlertEventMetrics(metricsPayload);
          resolve({ "success": false, status: err.response.status, "result": err.response.data });
        } else {
          let metricsPayload = {
            "uri": url,
            "httpResponseCode": 500,
            "data": ERROR_IN_SERVER_RESPONSE
          };
          MetricServices.reportAlertEventMetrics(metricsPayload);
          resolve({ "success": false, status: 500, "result": ERROR_IN_SERVER_RESPONSE });
        }
      })
    });
  }

  async getRequestOnboarding(url, accessToken) {
    return new Promise((resolve) => {
      let apiResponse = axios.get(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,  
          'Accept': '*/*'  
        }
      })
      apiResponse.then(function (response) {
          if (response.data) {
            resolve({ "success": true, status: response.status, "result": response.data });
          } else {
            resolve({ "success": false, status: response.status, "result": ERROR_IN_SERVER_RESPONSE });
          }
      }). catch(err => {
        Log.debug(err, this.componentName)
        if (err.response) {
          let metricsPayload = {
            "uri": url,
            "httpResponseCode": err.response.status,
            "data": {
              "errorResponse": JSON.stringify(err.response.data.error)
            }
          };
          MetricServices.reportAlertEventMetrics(metricsPayload);
          resolve({ "success": false, status: err.response.status, "result": err.response.data.error });
        } else {
          let metricsPayload = {
            "uri": url,
            "httpResponseCode": 500,
            "data": ERROR_IN_SERVER_RESPONSE
          };
          MetricServices.reportAlertEventMetrics(metricsPayload);
          resolve({ "success": false, status: 500, "result": ERROR_IN_SERVER_RESPONSE });
        }
      })
    });
  }

}

export default new HttpRequest();
