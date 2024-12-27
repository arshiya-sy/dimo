import Log from "../../Services/Log";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCallsService from "../../Services/androidApiCallsService";

function HelloShopUtil() {

    /* HS constants */
    this.USER_ABORTED_ERROR = "?dimo_error=user_aborted&utm_source=dimo_payment/#/payment";
    this.TIMEOUT_ABORTED_ERROR = "?dimo_error=timeout&utm_source=dimo_payment/#/payment";
    this.BANK_ABORTED_ERROR = "?dimo_error=payment_failed&utm_source=dimo_payment/#/payment";
    this.RETURN_URL_PARAM = "?returnUrl=";
    this.ABORT_URL_PARAM = "&abortUrl=";
    this.TIMEOUT_PARAM = "&timeout=";
    this.DIMO_QRCODE = "dimo:qrcode/payment";
    this.CHECKOUT_URL = "/checkout/#/payment";
    this.HS_TIMEOUT_ERROR_CODE = "Helloshop_timeout";
    this.HS_ERROR_CODE = "Helloshop"
    /* End */

    this.isHelloShopDimopayQRPayment = (deeplink) => {
        if (GeneralUtilities.isNotEmpty(deeplink, false)) {
            try {
                let deepLinkJson = JSON.parse(deeplink);
                deeplink = deepLinkJson["componentPath"];
                if (GeneralUtilities.isNotEmpty(deeplink, false)
                    && deeplink.toLowerCase().includes(this.DIMO_QRCODE) && deeplink.includes(this.RETURN_URL_PARAM)) {
                        return true;
                }
            } catch(err) {
                Log.debug("Exception in isHelloShopDimopayQRPayment " + err)
            }
        }
        return false;
    }

    this.getSuccessURL = (deeplink) => {
        try {
            let deepLinkJson = JSON.parse(deeplink);
            deeplink = deepLinkJson["componentPath"];
            if (GeneralUtilities.isNotEmpty(deeplink, false)
                && deeplink.toLowerCase().includes(this.DIMO_QRCODE) && deeplink.includes(this.RETURN_URL_PARAM)) {
                let returnUrl = deeplink.split(this.RETURN_URL_PARAM)[1];
                if (returnUrl.includes(this.ABORT_URL_PARAM)) {
                    returnUrl = returnUrl.split(this.ABORT_URL_PARAM)[0];
                    Log.sDebug("Redirecting to HS success url " + returnUrl)
                    return returnUrl;
                } 
            }
        } catch(err) {
            Log.debug("Exception in getSuccessURL " + err)
        }
        let hs_checkoutpage =  androidApiCallsService.getShoppingUrl() + this.CHECKOUT_URL;
        return hs_checkoutpage;
    }


    this.getAbortedURL = (deeplink, errorCode) => {
        try {
            let deepLinkJson = JSON.parse(deeplink);
            deeplink = deepLinkJson["componentPath"];
            if (GeneralUtilities.isNotEmpty(deeplink, false)
                && deeplink.toLowerCase().includes(this.DIMO_QRCODE) && deeplink.includes(this.RETURN_URL_PARAM)) {
                let returnUrl = deeplink.split(this.RETURN_URL_PARAM)[1];
                if (returnUrl.includes(this.ABORT_URL_PARAM)) {
                    let abortUrl = returnUrl.split(this.ABORT_URL_PARAM)[1];
                    if (abortUrl.includes(this.TIMEOUT_PARAM)) {
                        abortUrl = abortUrl.split(this.TIMEOUT_PARAM)[0]
                    }
                    abortUrl = abortUrl + errorCode;
                    Log.sDebug("Redirecting to HS abort url " + abortUrl)
                    return abortUrl;
                } 
            }
        } catch(err) {
            Log.debug("Exception in getAbortedURL " + err)
        }
        let hs_checkoutpage =  androidApiCallsService.getShoppingUrl() + this.CHECKOUT_URL;
        return hs_checkoutpage;
    }

    this.getQRCode = (deeplink) => {
        if (GeneralUtilities.isNotEmpty(deeplink, false)
                && deeplink.includes(this.RETURN_URL_PARAM)) {
            let qrcode = deeplink.split(this.RETURN_URL_PARAM)[0];
            return qrcode; 
        }
        return "";
    }

    this.getExtraInfo = (deeplink) => {
        if (GeneralUtilities.isNotEmpty(deeplink, false)
                && deeplink.includes(this.RETURN_URL_PARAM)) {
            let returnUrl = deeplink.split(this.RETURN_URL_PARAM)[1];
            return returnUrl; 
        }
        return "";
    }

    this.returnToHS = (returnUrl) => {
        androidApiCallsService.getShoppingUrl(); // This is just to change the spinner color
        window.location.replace(returnUrl);
    }

    this.getTimeOutValue = (deeplink) => {
        try {
            let deepLinkJson = JSON.parse(deeplink);
            deeplink = deepLinkJson["componentPath"];
            if (GeneralUtilities.isNotEmpty(deeplink, false)
                && deeplink.toLowerCase().includes(this.DIMO_QRCODE) && deeplink.includes(this.RETURN_URL_PARAM)) {
                let returnUrl = deeplink.split(this.RETURN_URL_PARAM)[1];
                if (returnUrl.includes(this.TIMEOUT_PARAM)) {
                    let timeout = returnUrl.split(this.TIMEOUT_PARAM)[1];
                    timeout = Math.floor((timeout - Date.now())/1000)
                    return timeout;
                } 
            }
        } catch(err) {
            Log.debug("Exception in getTimeOutValue " + err)
        }
        return -1;
    }
}
export default new HelloShopUtil();