import androidApiService from "./androidApiCallsService";
import apiService from "./apiService";
import MetricsService from "./MetricsService";
import httpRequest from "./httpRequest";
import ImportantDetails from "../WalletComponents/NewLaunchComponents/ImportantDetails";
import constantObjects from "./Constants";
import Log from "./Log";
import * as jose from 'jose';
import NewUtilities from "./NewUtilities";

const INVALID_SESSION_TOKEN = "invalidSessionToken";
const MISSING_SESSION_TOKEN = "missingSessionToken";
const RETRY_INTERVAL = [0, 1000, 2000, 5000, 30000, 60000]
let RETRY_COUNT;
const componentName = "walletJwtService"

function walletJwtService() {
  RETRY_COUNT = -1;
  const marginInMilliSeconds = 60 * 60 * 1000; // Refresh token in background if token expires in 1 hr.
  const marginInMilliSecForFCMAuthToken = 5 * 60 * 1000 // FCM Auth token will be regenarated before 5 mins.
  const expiraryToken = 24 * 60 * 60 * 1000 //24*60*60*1000 Token validity duration.
  const expiryOfFCMAuthToken = 60 * 60 * 1000 // For Time being FCM Auth Expiry is set as 55 mins
  this.internalErrorOccurred = false;

  this.getTokenFromDevice = () => {
    return androidApiService.getMotopayJwt();
  }

  this.setToken = authData => {
    androidApiService.storeMotopayJwt(JSON.stringify(authData));
  };

  this.initHttpRequest = token => {
    httpRequest.setMotopayToken(token);
  };

  this.getCredentials = () => {
    let jsonObj = {}
    if (!androidApiService.checkIfNm()) {
      if (androidApiService.isEngage()) {
        jsonObj.deviceId = androidApiService.getDeviceId();
        jsonObj.barcode = androidApiService.getBarcode();
        jsonObj.anonymizedSerialNumber = NewUtilities.getMetadataForDeviceType();
        if (androidApiService.checkIfMpOnly()) {
          jsonObj.sessionToken = androidApiService.getNmSessionToken();
          jsonObj.nmHardwareType = "NONMOTO_HY";
        } else {
          jsonObj.sessionToken = androidApiService.getSessionToken();
        }
      } else {
        jsonObj.barcode = "NDSI330028";
        jsonObj.deviceid = "1982318922759348224";
      }
    } else {
      let deviceDetails = androidApiService.getDeviceInformation();
      let deviceDetailsObj = JSON.parse(deviceDetails);
      jsonObj.firebaseUserId = deviceDetailsObj.deviceInfo.fcmId;
      let nmFirebaseuserToken = androidApiService.getNmFirebaseToken();
      jsonObj.firebaseAuthToken = nmFirebaseuserToken;
      if (nmFirebaseuserToken === "") {
        androidApiService.refreshNmFirebaseToken();
        window.onFbTokenRefreshed = () => {
          jsonObj.firebaseAuthToken = androidApiService.getNmFirebaseToken();
        }
      }
    }

    if (jsonObj.sessionToken && androidApiService.hasMissingSessionProps()) {
      jsonObj.sessionToken = undefined;
    } else if (jsonObj.sessionToken && androidApiService.hasSessionInvalidProps()) {
      jsonObj.sessionToken += "invalidsessiontokenfordebugging";
    }
    return jsonObj;
  }

  this.getParsedJson = (jsonString) => {
    let jsonObj = {}
    try {
      jsonObj = JSON.parse(jsonString);
    } catch (err){
      Log.sDebug("Failed to parse auth token from device",componentName, constantObjects.LOG_PROD);
    }

    return jsonObj;
  }


  this.setAuthorization = async function () {
    const auth = this.getTokenFromDevice();
    Log.sDebug("Set Authorization called and token from device is fetched", componentName , constantObjects.LOG_STAGING);
    if (auth !== "" && !!this.getParsedJson(auth).token) {
      //try to parse it as json.
      const authJson = this.getParsedJson(auth);
      if (androidApiService.checkIfNm()) {
        if (authJson.expiresafter - new Date().getTime() < marginInMilliSecForFCMAuthToken) {
          androidApiService.refreshNmFirebaseToken();
          window.onFbTokenRefreshed = async () => {
            Log.debug("New Firebase token fetched inside setAuthorization ", "walletJwtService");
            return await this.authorize();
          }
        } else {
          this.initHttpRequest(authJson.token);
        }
      } else {
        if (authJson.expiresafter - new Date().getTime() < marginInMilliSeconds) {
          return await this.authorize();
        } else {
          this.initHttpRequest(authJson.token);
        }
      }
    } else {
      return await this.authorize();
    }
  }

  this.authorize = async function () {
    RETRY_COUNT = (RETRY_COUNT >= RETRY_INTERVAL.length) ? RETRY_INTERVAL.length : RETRY_COUNT + 1;
    if (RETRY_COUNT >= RETRY_INTERVAL.length) {
      Log.sDebug("Retry count exhausted for getting token failing retry " + RETRY_COUNT, componentName, constantObjects.LOG_PROD);
      return;
    }
    Log.sDebug("Fetching jwt token", componentName);
    let credentials = this.getCredentials();
    let self = this;
    credentials = await MetricsService.getSecurePayload(JSON.stringify(credentials));
    return await apiService.getMotopayToken(JSON.stringify(credentials)).then(response => {
      if (response.status === 200) {
        Log.sDebug("Fetching jwt token successful", componentName)
        RETRY_COUNT = -1;
        const respData = response.data;
        let tokenData = {};
        if (androidApiService.checkIfNm()) {
          tokenData = {
            "token": respData,
            "expiresafter": new Date().getTime() + expiryOfFCMAuthToken
          }
        } else {
          tokenData = {
            "token": respData,
            "expiresafter": new Date().getTime() + expiraryToken
          }
        }
        Log.debug("JWT Authorization token is fetched and stored in apk", componentName);
        if (respData) {
          this.setToken(tokenData);
          this.initHttpRequest(respData);
        }
        return JSON.stringify(respData);
      } else {
        Log.sDebug("Fetching jwt token failed", componentName, constantObjects.LOG_PROD)
          if((response.status === 401 || response.status === 400) && androidApiService.checkIfNm()){
            Log.sDebug("Fetching jwt token failed with 401 firebase auth token invalid", componentName, constantObjects.LOG_PROD);
            Log.debug(response.data.error)
            androidApiService.refreshNmFirebaseToken();
            window.onFbTokenRefreshed= (isRefresh)=> {
              if(isRefresh === "true"){
                Log.debug("New Firebase token fetched",componentName);
                self.authorize();
              }
            }
          }
          if (response.status === 401 && response.data) {
            Log.sDebug("Fetching jwt token failed with 401", componentName , constantObjects.LOG_PROD);
            Log.debug(response.data.error)
            if (response.data.error === MISSING_SESSION_TOKEN || response.data.error === INVALID_SESSION_TOKEN) {
              setTimeout(function () {
                self.setAuthorization();
              }, RETRY_INTERVAL[RETRY_COUNT]);
            } else {
              // DEVICE_NOT_FOUND CASE
              Log.sDebug("Fetching jwt token failed with DEVICE NOT FOUND", componentName, constantObjects.LOG_PROD)
              Log.debug("Failed in getting wallet token. Error: ", response.data.error);
              return response;
            }
          } else {
            // ERROR STATUS NOT 401, hence not a failure at backend.
            Log.sDebug("Fetching jwt token failed with status: " + response.status, componentName, constantObjects.LOG_PROD)
            Log.debug("Something went wrong when getting wallet token. Error: ", response)
            return response;
          }
      }
    });
  }

  this.CAFAuthentication = function (cpf) {
    return new Promise((resolve) => {
      apiService.getCAFSecretKeys()
        .then(async (response) => {
          let clientSecret = response.data.clientSecret;
          let clientId = response.data.clientId;
          const secret = new TextEncoder().encode(
            clientSecret,
          );
          const alg = 'HS256'
          const jwt = await new jose.SignJWT({
            "iss": clientId,
            "exp": 24,
            "peopleId": cpf
          }).setProtectedHeader({ alg })
            .setExpirationTime('24h')
            .sign(secret)
          ImportantDetails.jwtForCAF = jwt;
          ImportantDetails.cpf = cpf;
          resolve(jwt);
        }).catch(err => {
          Log.sDebug("ERRORR FOUND in JWT creation" + JSON.stringify(err))
          ImportantDetails.jwtForCAF = "";
          resolve("")
        });
      });
  }

}

export default new walletJwtService();
