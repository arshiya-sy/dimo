import ImportantDetails from "../WalletComponents/NewLaunchComponents/ImportantDetails";
import deploymentVersion from "./deploymentVersion.json";
import ArbiApiMetricConfig from "./ArbiApiMetricConfig";
import SessionMetricsTracker from "./SessionMetricsTracker";
import config from "./Config/config";
import GeneralUtilities from "./GeneralUtilities";
import MetricsService from "./MetricsService";
import Log from "./Log";
import { v4 as uuidv4 } from 'uuid';

function ArbiApiMetrics() {
  this.additionalData = "";

  this.sendArbiMetrics = function (uri, apiName, success, status, data, responseTime, sendMetricsAsAlert = true) {
    let addInfo = this.additionalData
    let payload = {};
    payload["uri"] = "/" + uri;
    payload["success"] = success;
    payload["apiName"] = apiName;
    payload["eventTime"] = new Date().getTime();
    payload["httpResponseCode"] = status;
    payload["webviewVersion"] = deploymentVersion.version;
    payload["responseTimeInMs"] = responseTime;
    payload["entryPoint"] = ImportantDetails.transactionEntryPoint;
    payload["additionalData"] = addInfo;
    payload["via"] = MetricsService.getAppEnterVia();
    payload["data"] = data;
    Log.verbose("sendMetricsFinal " + JSON.stringify(payload));

    this.additionalData = "";
    if (!success || sendMetricsAsAlert) {
      MetricsService.reportAlertEventMetrics(payload);
      Log.sDebug("sendMetricsFinal, alert");
    } else {
      Log.sDebug("sendMetricsFinal, not alert");
      MetricsService.reportArbiEventMetrics(payload);
    }

  };
  this.sendGiftCardAlertMetrics = function (uri, apiName, success, status, data, responseTime) {
    let addInfo = this.additionalData
    let payload = {};
    payload["uri"] = "/" + uri;
    payload["success"] = success;
    payload["apiName"] = apiName;
    payload["eventTime"] = new Date().getTime();
    payload["httpResponseCode"] = status;
    payload["webviewVersion"] = deploymentVersion.version;
    payload["responseTimeInMs"] = responseTime;
    payload["additionalData"] = addInfo;
    payload["via"] = MetricsService.getAppEnterVia();
    payload["data"] = data;
    Log.sDebug("sendGiftCardAlertMetrics " + JSON.stringify(payload), "API METRICS");

    this.additionalData = "";
    MetricsService.reportAlertEventMetrics(payload);

  };

  this.sendGpayAlertMetrics = function (uri, apiName, success, status, data, responseTime, gpayEntryPoint) {
    let addInfo = this.additionalData
    let payload = {};
    payload["uri"] = "/" + uri;
    payload["success"] = success;
    payload["apiName"] = apiName;
    payload["eventTime"] = new Date().getTime();
    payload["httpResponseCode"] = status;
    payload["webviewVersion"] = deploymentVersion.version;
    payload["responseTimeInMs"] = responseTime;
    payload["entryPoint"] = gpayEntryPoint;
    payload["additionalData"] = addInfo;
    payload["via"] = MetricsService.getAppEnterVia();
    payload["data"] = data;
    Log.sDebug("sendMetricsFinal " + JSON.stringify(payload), "API METRICS");

    this.additionalData = "";
    MetricsService.reportAlertEventMetrics(payload);

  };

  this.sendPixKeyAlertMetrics = function (uri, apiName, success, status, data, responseTime) {
    let addInfo = this.additionalData
    let payload = {};
    payload["uri"] = "/" + uri;
    payload["success"] = success;
    payload["apiName"] = apiName;
    payload["eventTime"] = new Date().getTime();
    payload["httpResponseCode"] = status;
    payload["webviewVersion"] = deploymentVersion.version;
    payload["responseTimeInMs"] = responseTime;
    payload["additionalData"] = addInfo;
    payload["via"] = MetricsService.getAppEnterVia();
    payload["data"] = data;
    Log.sDebug("sendMetricsFinal " + JSON.stringify(payload), "API METRICS");

    this.additionalData = "";
    MetricsService.reportAlertEventMetrics(payload);
  };

  this.sendCAFSDKAlertMetrics = function (uri, apiName, success, data) {
    let addInfo = this.additionalData
    let payload = {};
    payload["uri"] = "/" + uri;
    payload["success"] = success;
    payload["apiName"] = apiName;
    payload["httpResponseCode"] = 200;
    payload["eventTime"] = new Date().getTime();
    payload["webviewVersion"] = deploymentVersion.version;
    payload["responseTimeInMs"] = 0;
    payload["entryPoint"] = ImportantDetails.transactionEntryPoint;
    payload["additionalData"] = addInfo;
    payload["via"] = MetricsService.getAppEnterVia();
    payload["data"] = data;
    this.additionalData = "";

    MetricsService.reportAlertEventMetrics(payload);
  };

  this.sendArbiSuccessMetrics = function (url, request, response, responseTime, statusCode, sendMetricsAsAlert = true) {
    request = request ? request : {};
    response = response ? response : {};
    statusCode = statusCode || 200;

    let uri = config.getArbiApiResource(url);

    let basicData = {
      "chaveDeIdempotencia": request["chaveDeIdempotencia"],
      "chaveDeConta": ImportantDetails.accountKey ? ImportantDetails.accountKey : undefined,
      "chaveDeCliente": ImportantDetails.clientKey ? ImportantDetails.clientKey : undefined,
      "idStatusExecucao": response.result ? response.result.idStatusExecucao : undefined,
      "idExecucao": response.result ? response.result.idExecucao : undefined,
      "sessionId": SessionMetricsTracker.sessionID ? SessionMetricsTracker.sessionID : undefined
    }

    let customData = this.returnSuccessCustomData(uri, request, response.result);
    let completeData = { ...basicData, ...customData.data };
    this.sendArbiMetrics(uri, customData.apiName, true, statusCode, completeData, responseTime, sendMetricsAsAlert);
  }

  this.returnSuccessCustomData = function (uri, request, response) {
    let config = ArbiApiMetricConfig[uri];
    Log.verbose("config is " + JSON.stringify(config));

    if (config) {
      let dataProperties = {};

      let combinedReqResp = { ...request, ...response };
      let flatObject = {};
      GeneralUtilities.getSimplifiedObject(combinedReqResp, flatObject);
      config.properties.forEach((prop) => {
        if (flatObject[prop] !== undefined || flatObject[prop] !== null) {
          dataProperties[prop] = flatObject[prop];
        }
      });

      if (config.processorFunction) {
        let returnedProperties = config.processorFunction(request, response);
        Object.assign(dataProperties, returnedProperties);
      }

      return { apiName: config.apiName, data: dataProperties }
    } else {
      return { apiName: uri, data: {} }
    }
  }

  this.returnFailureCustomData = function (uri, request, response) {
    let config = ArbiApiMetricConfig[uri];
    Log.verbose("config is " + JSON.stringify(config));


    let data;
    data = Object.assign({}, response);
    if(data["validationErrors"] !== undefined && data["validationErrors"] != null) {
      data["validationErrors"] = JSON.stringify(data.validationErrors);
    }
    if (config) {
      let dataProperties = {};

      config.properties.forEach((prop) => {
        if (request[prop]) {
          dataProperties[prop] = request[prop];
        }
      });

      if (config.processorFunction) {
        let returnedProperties = config.processorFunction(request, {});
        Object.assign(dataProperties, returnedProperties);
      }

      if (data) {
        Object.assign(dataProperties, data);
      }

      return { apiName: config.apiName, data: dataProperties }
    } else {

      return { apiName: uri, data: response }
    }
  }


  this.sendArbiFailureMetrics = function (url, request, status, response, responseTime) {
    let uri = config.getArbiApiResource(url);

    let basicData = {
      "chaveDeIdempotencia": request["chaveDeIdempotencia"] === undefined ? request["chaveDeIdempotencia"] : uuidv4(),
      "chaveDeConta": ImportantDetails.accountKey ? ImportantDetails.accountKey : undefined,
      "chaveDeCliente": ImportantDetails.clientKey ? ImportantDetails.clientKey : undefined,
    }

    let customData = this.returnFailureCustomData(uri, request, response);
    let completeData = { ...basicData, ...customData.data };
    this.sendArbiMetrics(uri, customData.apiName, false, status, completeData, responseTime);
  }

  this.setAdditionalData = function (additionalinfo) {
    this.additionalData = additionalinfo;
  }

}

export default new ArbiApiMetrics();