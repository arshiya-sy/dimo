import errorCodeList from "./ErrorCodeList";
import { ERROR_IN_SERVER_RESPONSE } from "./httpRequest";
import httpRequest from "./httpRequest";
import Log from "./Log";

function ArbiErrorResponseHandler() {

    this.processGetCellularProvidersError = function (result, localeObj) {
        let errorMessageToUser = localeObj.tryAgainLater;
        Log.debug("processGetCellularProvidersError " + result.message);
        if (result.code === errorCodeList.AREA_CODE_INVALID) {
            errorMessageToUser = localeObj.ddd_validation;
        }
        return errorMessageToUser;
    }

    this.processChangeUserPasswordError = function (result, localeObj) {
        let errorMessageToUser = localeObj.tryAgainLater;
        Log.debug("processChangeUserPasswordError " + result.code);
        if (result.code === errorCodeList.ERROR_CHANGING_PASSWORD) {
            errorMessageToUser = result.details;
        }
        return errorMessageToUser;
    }

    this.processCreateUserError = function (result, localeObj) {
        let errorMessageToUser;
        Log.debug("processCreateUserError " + result.code);
        switch (result.code) {
            case errorCodeList.EMAIL_IN_USE: errorMessageToUser = localeObj.duplicate_email; break;
            case errorCodeList.USER_ALREADY_EXISTS: errorMessageToUser = localeObj.duplicate_cpf; break;
            case errorCodeList.INVALID_CPF: errorMessageToUser = localeObj.check_cpf; break;
            case errorCodeList.VALIDATION_ERRORS: errorMessageToUser = localeObj.validation_errors; break;
            default: errorMessageToUser = localeObj.tryAgainLater
        }
        return errorMessageToUser;
    }

    this.processBlockCardError = function (result, localeObj) {
        let errorMessageToUser = localeObj.tryAgainLater;
        if (result.code === 10018) {
            errorMessageToUser = localeObj.card_block_error;
        } else if (result.code === 10021) {
            errorMessageToUser = localeObj.card_blocked_already;
        }
        return errorMessageToUser;
    }

    this.processCardErrors = function (response, localeObj) {
        let errorMessageToUser = localeObj.tryAgainLater;
        errorMessageToUser = this.processErrorsForSnackBar(response, localeObj);
        return errorMessageToUser;
    }

    this.processPixPaymentErrors = function (result, localeObj) {
        let errorMessageToUser = localeObj.tryAgainLater;

        if (result === ERROR_IN_SERVER_RESPONSE) {
            return errorMessageToUser;
        }

        switch (result.code) {
            case errorCodeList.INSUFFICIENT_BALANCE: errorMessageToUser = localeObj.pix_amount_outofbound; break;
            case errorCodeList.INCORRECT_PIN: errorMessageToUser = localeObj.pin_incorrect; break;
            default: break;
        }

        return errorMessageToUser;

    }

    this.processBoletoGenerationError = function (result, localeObj) {
        let errorMessageToUser = localeObj.tryAgainLater;
        switch (result.code) {
            case errorCodeList.INVALID_EXPIRATION_DATE: errorMessageToUser = localeObj.invalid_expiry_date; break;
            default: break;
        }
        return errorMessageToUser;
    }

    this.processPixClaimErrors = function (result, localeObj) {
        let errorMessageToUser = localeObj.tryAgainLater;
        switch (result.code) {
            case errorCodeList.INCORRECT_TOKEN: errorMessageToUser = localeObj.incorrect_token; break;
            default: break;
        }
        return errorMessageToUser;
    }

    //forgot 4 digit password
    this.processforgotAccountPinErrors = function (result, localeObj) {
        let errorMessageToUser = {}
        switch (result.code) {
            case errorCodeList.INCORRECT_VERIFICATION_CODE:
                errorMessageToUser = {
                    "header": localeObj.password_change_failed,
                    "description": localeObj.incorrect_verification_code
                }
                break;
            default:
                errorMessageToUser = {
                    "header": localeObj.generic_error,
                    "description": localeObj.generic_error_subtext
                }
                break;
        }
        return errorMessageToUser;
    }

    this.processChangeAccountPinErrors = function (result, localeObj) {
        let errorMessageToUser = {}
        switch (result.code) {
            case errorCodeList.INVALID_PASSWORD:
                errorMessageToUser = {
                    "header": localeObj.password_change_failed,
                    "description": localeObj.current_password_invalid
                }
                Log.debug("ERROR IN PASS CHANGE Arbi  " + JSON.stringify(errorMessageToUser));
                break;
            default:
                errorMessageToUser = {
                    "header": localeObj.generic_error,
                    "description": localeObj.generic_error_subtext
                }
                break;
        }
        return errorMessageToUser;
    }

    this.processforgotAccountPin2faErrors = function (result, localeObj) {
        let errorMessageToUser = ""
        switch (result.code) {
            case errorCodeList.RESEND_WITHIN_1_MINUTE:
                errorMessageToUser = localeObj.wait_and_try
                break;
            default:
                errorMessageToUser = localeObj.tryAgainLater
                break;
        }
        return errorMessageToUser;
    }

    this.processErrorsForJSON = function (response) {
        let jsonObj = {}
        try {
            if (response && response.result && !response.result.detalhesErro && (response.result === httpRequest.NO_RESPONSE || !response.status)) {
                jsonObj["error"] = true;
                jsonObj["reason"] = "communication_issue"
            } else if (response && response.result && response.result.code && '' + response.result.code === "0") {
                jsonObj["error"] = true;
                jsonObj["errorCode"] = response.result.code;
                jsonObj["reason"] = "generic_error";
            } else if (response && response.result && response.result.code && '' + response.result.code !== "0") {
                jsonObj["error"] = true;
                jsonObj["errorCode"] = response.result.code;
                if ((response.result.message && response.result.details) && (response.result.message !== "" && response.result.details !== "")) {
                    jsonObj["reason"] = "arbi_error";
                    let details = response.result.details;
                    try {
                        if (details.includes("<html>")) {
                            jsonObj["descriptor"] = response.result.message
                        }
                        else if ((details[details.length - 1]) === "}") {
                            let str1 = details.substring(details.indexOf("{"))
                            let str2 = str1.substring(0, str1.indexOf("}") + 1)
                            let str3 = JSON.parse(str2)
                            if (str3["descricaostatus"] !== undefined && str3["descricaostatus"] !== null && str3["descricaostatus"] !== "") {
                                jsonObj["descriptor"] = str3["descricaostatus"];
                            } else if (str3["mensagem"] !== undefined && str3["mensagem"] != null && str3["mensagem"] !== "") {
                                jsonObj["descriptor"] = str3["mensagem"];
                            } else {
                                jsonObj["descriptor"] = details;
                            }
                        }
                        else {
                            jsonObj["descriptor"] = response.result.message + " " + details;
                        }
                    }
                    catch (error) {
                        Log.sDebug("Error: " + error)
                        jsonObj["descriptor"] = response.result.message
                    }
                } else if ((!response.result.details || response.result.details === "") && (response.result.message || response.result.message !== "")) {
                    jsonObj["reason"] = "arbi_error";
                    jsonObj["descriptor"] = response.result.message
                } else if (!response.result.message || response.result.message === "") {
                    jsonObj["reason"] = "arbi_error";
                    jsonObj["descriptor"] = response.result.details
                } else {
                    jsonObj["reason"] = "generic_error";
                }
            } else if (response && response.result && response.result.detalhesErro) {
                jsonObj["error"] = true;
                jsonObj["errorCode"] = response.result.detalhesErro.status;
                jsonObj["reason"] = "detalhes_error";
                jsonObj["title"] = response.result.detalhesErro.title;
                jsonObj["descriptor"] = response.result.detalhesErro.detail;
            } else {
                jsonObj["error"] = true;
                jsonObj["reason"] = response.status !== 504 ? "technical_issue" : "time_limit_exceeded"
            }
            return jsonObj;
        } catch (e) {
            jsonObj["error"] = true;
            jsonObj["reason"] = "technical_issue";
            return jsonObj;
        }
    }

    this.processErrorsForSnackBar = function (response, localeObj) {
        let errorMessage = localeObj.tryAgainLater
        if (response && (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500))) {
            errorMessage = localeObj.pix_communication_issue;
        } else if (response.result && ('' + response.result.code === "0")) {
            errorMessage = localeObj.generic_error + ". " + localeObj.generic_error_subtext;
        } else if (response.result && '' + response.result.code !== "0") {
            if ((response.result.message !== null && response.result.details !== null) && (response.result.message !== "" && response.result.details !== "")) {
                if (response.result.message === response.result.details) {
                    errorMessage = response.result.message;
                } else {
                    let details = response.result.details;
                    try {
                        if (details.includes("<html>")) {
                            errorMessage = response.result.message
                        }
                        else if ((details[details.length - 1]) === "}") {
                            let str1 = details.substring(details.indexOf("{"))
                            let str2 = str1.substring(0, str1.indexOf("}") + 1)
                            let str3 = JSON.parse(str2)
                            errorMessage = str3["descricaostatus"];
                        }
                        else {
                            errorMessage = response.result.message + " " + details;
                        }
                    }
                    catch (error) {
                        Log.sDebug("Error: " + error)
                        errorMessage = response.result.message
                    }
                }
            } else if ((response.result.details === null || response.result.details === "") && (response.result.message !== null || response.result.message !== "")) {
                errorMessage = response.result.message;
            } else if (response.result.message === null || response.result.message === "") {
                errorMessage = response.result.details;
            } else {
                errorMessage = localeObj.generic_error + ". " + localeObj.generic_error_subtext;
            }
        } else {
            errorMessage = response.status !== 504 ? localeObj.pix_technical_issue : localeObj.pix_time_limit_exceeded
        }
        return errorMessage;
    }

}

export default new ArbiErrorResponseHandler();
