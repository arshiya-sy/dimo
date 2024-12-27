import MetricsService from "./MetricsService";
import deploymentVersion from "./deploymentVersion.json"
import constantObjects from "./Constants";
import androidApiCallsService from "./androidApiCallsService";

export default new Log();

function Log() {

  this.loggingLevel = constantObjects.LOG_PROD; // dont log anything, 1 - log minimally, 0 - log everything

  this.setLoggingLevel = () => {
    let backendCloud = androidApiCallsService.getBackendCloud();
    if (backendCloud === "dev" || constantObjects.featureEnabler.ENABLE_DOGFOOD_LOGGING) {
      this.loggingLevel = constantObjects.LOG_DEV; // log everything
    } else if (backendCloud === "staging") {
      this.loggingLevel = constantObjects.LOG_STAGING; // log minimally
    } else if (backendCloud === "prod") {
      this.loggingLevel = constantObjects.LOG_PROD; // dont log anything
    }
    console.log("backend Cloud " + backendCloud + " logging level " + this.loggingLevel);
  }

  this.setLoggingLevel();

  // use this for debugging issues where user sensitive info is displayed.
  this.verbose = (log, component = "") => {
    if (this.loggingLevel === constantObjects.LOG_DEV) {
      console.log(`${component} - ${log}`);
    }
  }

  this.debug = (log, component = "") => {
    if (this.loggingLevel !== constantObjects.LOG_PROD) {
      console.log(`${component} - ${log}`);
    }
  }

  this.sDebug = function (log, component = "", logLevel = constantObjects.LOG_DEV) {
    let backendCloud = androidApiCallsService.getBackendCloud();
    if (logLevel !== constantObjects.LOG_PROD) {
      console.log(`${component} - ${log}`);
    }

    if (this.doesItContainSensitiveInfo(log)) {
      console.warn("looks like u r sending some sensitive info, if not then rephrase your log to not contain blacklisted words");
      return;
    }

    if ((constantObjects.featureEnabler.ENABLE_DOGFOOD_LOGGING) ||
      (backendCloud === "dev" && logLevel === constantObjects.LOG_DEV) ||
      ((backendCloud === "staging" || backendCloud === "dev") && logLevel === constantObjects.LOG_STAGING) ||
      (logLevel === constantObjects.LOG_PROD)) {
      console.log("Reaching logging to backend with backend level as " + backendCloud + " and loglevel as " + logLevel);
      let logsPayload = {
        "category": "Debug",
        "loglevel": logLevel,
        "logs": log,
        "component": component,
        "eventTimeString": new Date().toTimeString(),
        "eventTime": new Date().getTime(),
        "webviewVersion": deploymentVersion.version
      }
      MetricsService.reportArbiEventMetrics(logsPayload);
    }

  }

  this.error = (log, component = "") => {
    if (this.loggingLevel !== constantObjects.LOG_PROD) {
      console.error(`${component} - ${log}`);
    }
  }

  this.sError = function (log, component = "") {
    if (this.loggingLevel !== constantObjects.LOG_PROD) {
      console.error(`${component} - ${log}`);
    }

    if (this.doesItContainSensitiveInfo(log)) {
      console.warn("looks like u r sending some sensitive info, if not then rephrase your log to not contain blacklisted words");
      return;
    }

    let logsPayload = {
      "category": "Error",
      "logs": log,
      "component": component,
      "webviewVersion": deploymentVersion.version,
      "eventTime": new Date().getTime()
    }
    MetricsService.reportAlertEventMetrics(logsPayload);
  }

  this.doesItContainSensitiveInfo = (logString) => {
    let sensitiveKeys = ["autenticacao2FA", "senha", "novaSenha", "pinAtual", "pinNovo", "pinOld", "pinNew"];
    for (const key of sensitiveKeys) {
      if (logString !== "" && logString !== undefined) {
        logString = typeof logString === 'string' ? logString : JSON.stringify(logString);
        if (logString.search(new RegExp(key, 'i')) !== -1) {
          return true;
        }
      }
    }
    return false;

  }

}
