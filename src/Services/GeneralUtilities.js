/* Put any util function here */
import moment from "moment";

import Log from "./Log";
import apiService from "./apiService";
import Globals from "./Config/config";
import history from "./../history.js";
import PageState from "./PageState.js";
import constantObjects from "./Constants";
import arbiApiService from "./ArbiApiService";
import ArbiApiMetrics from "./ArbiApiMetrics";
import MetricsService from "./MetricsService.js";
import androidApiCalls from "./androidApiCallsService";
import ArbiResponseHandler from "./ArbiResponseHandler";
import deploymentVersion from "./deploymentVersion.json";
import ImportantDetails from "../WalletComponents/NewLaunchComponents/ImportantDetails";
import PageNames from "./PageNames.js";

const sha1 = require('sha1');

var reAuthPerSession = 0;

function GeneralUtilies() {
  const DEVICE_TYPES = {
    ENGAGE: "engage",
    BROWSER: "browser"
  };

  this.PIX_KEY_TYPES = Object.freeze({ EMAIL: "EMAIL", CPF: "CPF", PHONE_NUMBER: "PHONE", EVP: "EVP" });
  this.TRANSACTION_TYPES = Object.freeze({ PIX: "PIX", TED: "TED", CONTACT: "CONTACT" });
  this.CREDENTIALS_KEY = "credentails";
  this.MASKED_CPF_KEY = "maskedCpf";
  this.WAITLIST_KEY = "waitListKey";
  this.VALUEPROPS_KEY = "valueProps";
  this.PRIVACY_KEY = "privacyKey";
  this.LOCATION_KEY = "geoLocation";
  this.FGTSVALUEPROPS_KEY = "FgtsValueProps";
  this.FGTSCONTRACTS_KEY = "FgtsContracts";
  this.MOTOSAFECLIENTIDLIST_KEY = "MotosafeClientIdList";
  this.GAMIFICATION_KEY = "gamificationKey";

  // Permissions Key
  this.CAMERA_PERMISSION = "android.permission.CAMERA";

  // Below variable is added as part of handling backpress from components to allservices screen or wallet landing screen
  this.backPressTracking = "";
  this.historyPathData = [];

  this.pushHistoryPath = (redirectComponentData = {}, fromComponentData = {}, { isInitialRoute = false, storeToHistoryPath = true } = {}) => {
    if (isInitialRoute) {
      this.historyPathData = [];
    }

    const totalHistoryPath = this.historyPathData.length;

    if (
      (totalHistoryPath > 0 && fromComponentData.pathname === this.historyPathData[totalHistoryPath - 1]['pathname'])
      || !storeToHistoryPath
    ) {
      // don't store from path data
    } else {
      this.historyPathData.push(fromComponentData);
    }

    return history.push({ ...redirectComponentData });
  }

  this.goBackHistoryPath = () => {
    const lastHistoryPathData = this.historyPathData.pop();
    return history.replace({ ...lastHistoryPathData, transition: "right" });
  }

  this.setBackPressTracking = function (pageName) {
    this.backPressTracking = pageName;
  }

  this.getBackPressTracking = function () {
    return this.backPressTracking;
  }

  this.goBackToPreviousScreen = function (backPage = "", historyProps) {
    if (backPage === "AllServices") {
      historyProps.replace({ pathname: "/allServices", transition: "right" });
    } else {
      historyProps.replace({ pathname: "/newWalletLaunch", transition: "right" });
    }
  }

  this.checkBrowserType = function () {
    Log.debug("GeneralUtilites checkBrowserType " + window.Android);
    if (window.Android !== undefined) {
      return DEVICE_TYPES.ENGAGE;
    }
    return DEVICE_TYPES.BROWSER;
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

  this.getReAuthInCurrentSession = () => {
    return reAuthPerSession;
  }

  this.reAuthDone = () => {
    reAuthPerSession += 1
  }

  this.getUserLocale = function () {
    return androidApiCalls.getUserLocale();
  }

  this.isEngage = function () {
    return this.checkBrowserType() === DEVICE_TYPES.ENGAGE;
  };

  this.getBackendUrlProxyName = () => {
    let backendURL = "";
    if (!this.env) {
      this.env = androidApiCalls.getEnv();
    }
    if (this.env === "staging") {
      backendURL = "engage-experiments";
    } else if (this.env === "df") {
      backendURL = "engage-146207";
    } else if (this.env === "prod") {
      backendURL = "moto-engage";
    } else if (this.env === "dev") {
      backendURL = "engage-backend";
    }
    return backendURL;
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

  this.getParams = function () {
    let params = {};
    params.locale = this.getLocale();
    return params;
  };

  this.validateCPF = (value, throwErrorImmediately = false) => {

    if (value === "" || value === undefined) {
      return true
    }

    value = value.replace("-", "");
    value = value.replace(/\./g, "");

    if (value.length < 11) {
      return throwErrorImmediately ? false : true;
    }

    let invalidos = [
      "11111111111",
      "22222222222",
      "33333333333",
      "44444444444",
      "55555555555",
      "66666666666",
      "77777777777",
      "88888888888",
      "99999999999",
      "00000000000"
    ];


    for (var i = 0; i < invalidos.length; i++) {
      if (invalidos[i] === value) {
        return false;
      }
    }

    let add = 0;
    for (let i = 0; i < 9; i++) add += parseInt(value.charAt(i), 10) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(value.charAt(9), 10)) return false;
    add = 0;
    for (let i = 0; i < 10; i++)
      add += parseInt(value.charAt(i), 10) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(value.charAt(10), 10)) return false;
    return true;
  };

  this.validateCpfOrCnpj = (cnpj, throwErrorImmediately = false) => {

    cnpj = cnpj.trim().replace(/\.|-|\//g, "");

    if (cnpj.length <= 11) {
      return this.validateCPF(cnpj, throwErrorImmediately);
    }
    let multiplicador1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let multiplicador2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma;
    let resto;
    let digito;
    let tempCnpj;

    if (cnpj.length < 14) {
      return throwErrorImmediately ? false : true;
    }

    tempCnpj = cnpj.substr(0, 12);
    soma = 0;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(tempCnpj[i].toString()) * multiplicador1[i];
    }
    resto = (soma % 11);
    if (resto < 2) {
      resto = 0;
    } else {
      resto = 11 - resto;
    }
    digito = resto.toString();
    tempCnpj = tempCnpj + digito;
    soma = 0;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(tempCnpj[i].toString()) * multiplicador2[i];
    }
    resto = (soma % 11);
    if (resto < 2) {
      resto = 0;
    } else {
      resto = 11 - resto;
    }
    digito = digito + resto.toString();
    return cnpj.endsWith(digito);
  }

  this.validateCnpj = (cnpj, throwErrorImmediately = false) => {

    cnpj = cnpj.trim().replace(/\.|-|\//g, "");
    let multiplicador1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let multiplicador2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let soma;
    let resto;
    let digito;
    let tempCnpj;

    if (cnpj.length < 14) {
      return throwErrorImmediately ? false : true;
    }

    tempCnpj = cnpj.substr(0, 12);
    soma = 0;
    for (let i = 0; i < 12; i++) {
      soma += parseInt(tempCnpj[i].toString()) * multiplicador1[i];
    }
    resto = (soma % 11);
    if (resto < 2) {
      resto = 0;
    } else {
      resto = 11 - resto;
    }
    digito = resto.toString();
    tempCnpj = tempCnpj + digito;
    soma = 0;
    for (let i = 0; i < 13; i++) {
      soma += parseInt(tempCnpj[i].toString()) * multiplicador2[i];
    }
    resto = (soma % 11);
    if (resto < 2) {
      resto = 0;
    } else {
      resto = 11 - resto;
    }
    digito = digito + resto.toString();
    return cnpj.endsWith(digito);
  }

  this.validateDDD = (ddd) => {
    if (ddd.length < 2) {
      return true;
    } else {
      let areaCode = parseInt(ddd);
      if (areaCode > 99 || areaCode < 11) {
        return false;
      } else {
        return true;
      }
    }
  }

  this.validateQRCode = (code) => {
    if (code.toLowerCase().includes("br.gov.bcb.pix")) {
      return true;
    } else {
      return false;
    }
  }

  this.validateEmail = (email) => {
    email = email.replace(/\s+$/gm, ' ').trim();
    //The following disable is allowed as the hex characters are known limitation of this rule.
    // eslint-disable-next-line no-control-regex
    const re_mail = /^((([a-z]|\d|[!#$%&'*+\-/=?^_`{|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#$%&'*+\-/=?^_`{|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-||_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+([a-z]+|\d|-|\.{0,1}|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])?([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/;
    return ((re_mail.test(email)))
  }

  this.validateEntry = (value) => {
    if (value.length === 0) {
      return true;
    }
    const re_pin = /\d|[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/
    return (!(re_pin.test(value)));
  }

  this.validatePin = (pin) => {
    if (pin.length === 0) {
      return true
    }
    const re_pin = /^[0-9]*$/
    return ((re_pin.test(pin)));
  }

  this.parsePhoneNum = (value) => {
    let temp = value.replace(/-/g, "");
    if (temp.length >= 4) {
      let areaCode = temp.substr(0, 3);
      let phoneNumber = temp.substr(3, 9);
      let formattedPhoneNumber = areaCode + "-" + phoneNumber;
      return { "ddd": areaCode, "phoneNumber": phoneNumber, "formattedPhoneNumber": formattedPhoneNumber };
    } else {
      return { "ddd": "", "phoneNumber": "", "formattedPhoneNumber": value };
    }
  };

  this.parseCEP = (value) => {
    let tempCep = value;
    let newCep = '';
    let cepFinal = '';
    let cepObj = {}

    if (tempCep) {
      //Handle cases of backpress
      let temp = tempCep.replace(/-/g, "");
      newCep = temp.substr(0, 5);
      if (temp.length > 5) {
        cepFinal = newCep + temp.substr(5, 3);
        newCep += "-" + temp.substr(5, 3);
      }
      if (newCep.length > 9) {
        cepFinal = temp.substr(0, 8);
      }
      cepObj["cepDisp"] = newCep;
      cepObj["cep"] = cepFinal;
    }
    cepObj["cepDisp"] = newCep;
    return cepObj;
  };

  this.parseLandLineNum = (value) => {
    let temp = value.replace(/-/g, "");
    if (temp.length >= 4) {
      let areaCode = temp.substr(0, 3);
      let phoneNumber = temp.substr(3, 8);
      let formattedPhoneNumber = areaCode + "-" + phoneNumber;
      return { "ddd": areaCode, "phoneNumber": phoneNumber, "formattedPhoneNumber": formattedPhoneNumber };
    } else {
      return { "ddd": "", "phoneNumber": "", "formattedPhoneNumber": value };
    }
  };

  this.parseRG = (value) => {
    let tempRG = value.replace(/\.|-/g, "");
    let dispRG = '';
    let actualRG = '';
    let RgObj = {};

    if (tempRG) {
      var temp = tempRG;
      dispRG = temp.substr(0, 2);
      actualRG = temp;
      if (temp.length >= 3) {
        dispRG += '.' + temp.substr(2, 3);
      }
      if (temp.length >= 6) {
        dispRG += '.' + temp.substr(5, 3);
      }
      if (temp.length >= 9) {
        dispRG += "-" + temp.substr(8, 1);
      }
      if (dispRG.length > 12) {
        value = dispRG.substr(0, 13);
        actualRG = actualRG.substr(0, 10);
      }
      RgObj['displayRG'] = dispRG;
      RgObj['actualRG'] = actualRG;
    }
    return RgObj;
  }

  this.parseCpf = (value) => {
    let tempcpf = value.replace(/\.|-| /g, "");
    let newcpf = '';
    let normcpf = '';
    let cpfObject = {
      'displayCPF': '',
      'cpf': ''
    };

    if (tempcpf) {
      //Handle cases of backpress
      var temp = tempcpf;
      newcpf = temp.substr(0, 3);
      normcpf = temp
      if (temp.length >= 4) {
        newcpf += "." + temp.substr(3, 3);
      }
      if (temp.length >= 7) {
        newcpf += "." + temp.substr(6, 3);
      }
      if (temp.length >= 10) {
        newcpf += "-" + temp.substr(9, 2);
      }
      if (newcpf.length > 14) {
        newcpf = newcpf.substr(0, 14);
      }
      if (normcpf.length > 11) {
        normcpf = normcpf.substr(0, 11);
      }
      cpfObject['displayCPF'] = newcpf;
      cpfObject['cpf'] = normcpf
    }
    return cpfObject;
  };

  this.parseAccountNumber = (value) => {
    let tempAcc = value.replace(/-/g, "");
    if (tempAcc.length > 8) {
      tempAcc = tempAcc.substr(0, 8);
    }
    let returnObj = {};
    returnObj["accNumber"] = tempAcc;
    if (tempAcc.length > 7) {
      tempAcc = tempAcc.substr(0, 7) + "-" + tempAcc.substr(7, tempAcc.lenght);
    }
    returnObj["displayAccNumber"] = tempAcc;
    return returnObj;
  }

  this.convertToBZ = (decimalFormat) => {
    if (decimalFormat === "") {
      return ""
    }
    let [full, decimal] = decimalFormat.split(".")
    full = parseInt(full).toLocaleString('en-US')
    full = full.replace(/,/g, ".")
    if (decimal) {
      if (decimal.length > 2) {
        decimal = decimal.substring(0, 2);
      }
      return full + "," + decimal
    }
    return full
  }

  this.getInstituteCode = (instituteName) => {
    const bankMap = {
      "Banco Arbi SA": "54403563",
      "Banco Itau UniBanco": "60701190",
      "Banco Santander": "90400888",
      "Banco do Brasil": "00000000",
      "Bradesco Bank": "60746948",
      "Caixa Econômica": "00360305"
    }
    return bankMap[instituteName] ? bankMap[instituteName] : "";
  }

  this.getInstituteName = (instituteCode) => {
    const bankMap = {
      "54403563": "Banco Arbi SA",
      "60701190": "Banco Itau UniBanco",
      "90400888": "Banco Santander",
      "00000000": "Banco do Brasil",
      "60746948": "Bradesco Bank",
      "00360305": "Caixa Econômica"
    }
    return bankMap[instituteCode] ? bankMap[instituteCode] : "";
  }

  this.formatDecimal = (amountValue) => {
    if (!amountValue || amountValue === "") {
      return ""
    }
    let [full, decimal] = ('' + amountValue).split(".");
    if (full.length < 2) {
      full = "00" + full
      full = full.substring(full.length - 2, full.length);
    }
    decimal = decimal ? (decimal + "00").substring(0, 2) : "00";
    return full + "." + decimal;
  }

  this.formatCPF = (cpf) => {
    try {
      if (cpf) {
        let formatted = cpf.substring(0, 3) + "." + cpf.substring(3, 6) + "." + cpf.substring(6, 9) + "-" + cpf.substring(9, 11);
        return formatted
      }
    } catch (err) {
      Log.sError("CPF Undefined, cannot format", "GeneralUtilities");
    }
  }

  this.areAllArgsValid = (...args) => {
    for (const arg of args) {
      if (arg === null || arg === undefined) {
        return false;
      } else if (typeof arg === "string" && arg.length === 0) {
        return false;
      }
    }
    return true;
  }

  this.formatAddress = (data) => {
    let clientData = data.endereco;
    let rua = this.areAllArgsValid(clientData.rua) ? clientData.rua + ", " : "";
    let complement = this.areAllArgsValid(clientData.complemento) ? clientData.complemento + ", " : "";
    let neighbourhood = this.areAllArgsValid(clientData.bairro) ? clientData.bairro + ", " : "";
    let addressInCaps = rua + clientData.numero + " - " + complement + neighbourhood + clientData.cidade;
    addressInCaps = addressInCaps.toLowerCase();
    addressInCaps = addressInCaps.replace(/(?:^|\s)\S/g, function (firstLetter) { return firstLetter.toUpperCase(); }) + " - " + clientData.uf + " " + clientData.cep;
    return addressInCaps;
  }

  this.formatMailingAddress = (data) => {
    let clientData = data.enderecoCorrespondencia;
    let isValidAddress = false;
    for (let key in clientData) {
      if (clientData[key] !== null) {
        isValidAddress = true;
        break;
      }
    }
    if (!isValidAddress)
      return "NO ADDRESS";
    let addressInCaps = "";
    if (clientData) {
      let rua = this.areAllArgsValid(clientData.rua) ? clientData.rua + ", " : "";
      let complement = this.areAllArgsValid(clientData.complemento) ? clientData.complemento + ", " : "";
      let neighbourhood = this.areAllArgsValid(clientData.bairro) ? clientData.bairro + ", " : "";
      addressInCaps = rua + clientData.numero + " - " + complement + neighbourhood + clientData.cidade;
      addressInCaps = addressInCaps.toLowerCase();
      addressInCaps = addressInCaps.replace(/(?:^|\s)\S/g, function (firstLetter) { return firstLetter.toUpperCase(); }) + " - " + clientData.uf + " " + clientData.cep;
    }
    return addressInCaps;
  }

  this.doesDeviceSupportActiveFaceliveness = () => {
    let deviceInfo = androidApiCalls.getDeviceInformation();
    let deviceInfoJson = JSON.parse(deviceInfo);
    let finalJSON = deviceInfoJson["deviceInfo"];
    Log.sDebug("device supported for CAF ? " + finalJSON["model"]);
    if (finalJSON["model"].toString().toLowerCase() === "hawaii" ||
      finalJSON["model"].toString().toLowerCase() === "moto e32" ||
      finalJSON["model"].toString().toLowerCase() === "moto e20" ||
      finalJSON["model"].toString().toLowerCase() === "moto e(7) plus")
      return false;
    else
      return true;
  }

  this.currencyFromDecimals = (decimalFormat) => {
    if (decimalFormat === "") {
      return ""
    }
    let [full, decimal] = ('' + decimalFormat).split(".");
    full = parseInt(full).toLocaleString('en-US');
    full = full.replace(/,/g, ".");
    decimal = decimal ? decimal : "";
    decimal = decimal + "00";
    decimal = decimal.substring(0, 2);
    return full + "," + decimal
  }

  this.amountToDecimals = (brFormat) => {
    let retVal = brFormat.toString();
    if (retVal.endsWith(",")) {
      retVal = retVal.substring(0, -1);
    }
    retVal = brFormat.replace(/\./g, "");
    retVal = retVal.replace(/,/g, ".");
    return retVal
  }

  this.log = (log, component) => {
    console.log(log + " " + component + " this log was not sent to bq, please use Log.sdebug or Log.serror to send it, do not use this method anymore");
  }

  this.maskCpf = (cpf) => {
    let parsedCpf = this.parseCpf(cpf).displayCPF;
    let maskedCpf = "***" + parsedCpf.slice(3);
    maskedCpf = maskedCpf.slice(0, 11) + "-**";
    return maskedCpf;
  }

  this.maskEmailId = (email) => {
    let str = email.split('');
    let finalArr = [];
    let len = str.indexOf('@');
    str.forEach((item, pos) => {
      (pos >= 1 && pos <= len - 2) ? finalArr.push('X') : finalArr.push(str[pos]);
    })
    return finalArr.join('');
  }

  this.getSimplifiedObject = (payload, returnedObject) => {
    for (const key in payload) {
      if (Object.hasOwnProperty.call(payload, key)) {
        const element = payload[key];
        if (typeof element === 'object') {
          this.getSimplifiedObject(element, returnedObject);
        } else {
          returnedObject[key] = element;
        }
      }
    }
  }

  this.formattedString = (baseString, values) => {

    if (!baseString) {
      return;
    }
    if (!values || values == null) {
      return;
    }
    values.forEach((value, index) => {
      baseString = baseString.replaceAll("{" + index + "}", values[index]);
    });
    return baseString;
  }

  this.emptyValueCheck = (value) => {
    if (value === "" || value == null || value === undefined) {
      return true;
    } else {
      return false;
    }
  }
  this.isArrayEmpty = (value) => {
    if (value == null || value === undefined || value.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  this.formatBalance = (balance) => {
    let balanceString = balance.toString();
    if (balanceString.length <= 3) {
      return balance;
    }
    let isNegative = balanceString.startsWith('-');
    let absoluteBalance = isNegative ? balanceString.slice(1) : balanceString;

    let reverseWord = absoluteBalance.split("").reverse().join("");
    let newNum = reverseWord.match(/.{3}/g).join('.');
    newNum = newNum.split("").reverse().join("");
    let extra = reverseWord.length % 3;
    if (extra > 0) {
      let final = absoluteBalance.substring(0, extra);
      newNum = final + "." + newNum;
    }
    if (isNegative) {
      newNum = '-' + newNum;
    }
    return newNum;
  }

  this.getRawBalance = (balance) => {
    if (balance.toString().includes(".")) {
      let finalBalance = balance.replace(".", "");
      return finalBalance;
    } else {
      return balance;
    }
  }

  this.formTransactionHistoryDivider = function (monthHeader, localeObj, isScheduled) {
    moment.locale(this.getLocale());
    let str = monthHeader;
    let str2 = str.charAt(0).toUpperCase() + str.slice(1);
    let TransactionDivider = [
      {
        "DateHeader": localeObj.today + ", " + moment().format("LL"),
        "transactions": []
      }, {
        "DateHeader": isScheduled ? localeObj.next_week : localeObj.last_week,
        "transactions": []
      }, {
        "DateHeader": str2,
        "transactions": []
      }, {
        "DateHeader": localeObj.this_year,
        "transactions": []
      }, {
        "DateHeader": localeObj.last_year,
        "transactions": []
      }
    ]

    let nextYear = {
      "DateHeader": localeObj.next_year,
      "transactions": []
    }

    if (isScheduled) {
      TransactionDivider.push(nextYear);
    }

    return TransactionDivider;
  }

  this.submitFeedback = function (_data, type, cardId) {
    var payloadJson = Object.assign({}, {});
    payloadJson.feedBackJson = _data;
    payloadJson.type = type;
    payloadJson.feedBackJson.deviceId = payloadJson.deviceid;
    payloadJson.feedBackJson.locale = androidApiCalls.getLocale();
    payloadJson.feedBackJson.country = androidApiCalls.isBrazilDevice() ? "BR" : androidApiCalls.getShipmentCountry();
    payloadJson.feedBackJson['ro_product_model'] = androidApiCalls.getModelName();
    payloadJson.feedBackJson['ro_build_product'] = androidApiCalls.getBuildName()
    delete payloadJson.deviceid;
    payloadJson.feedBackJson.cardId = cardId || "";
    return apiService.submitFeedback(payloadJson);
  };

  this.transactionHistoryDateOrganizer = function (txData, localeObj) {
    moment.locale(this.getLocale());
    let i = 0;
    let TransactionArray = [];
    let monthHeader = moment().format("MMMM");

    let dateFormatter = {
      startOftoday: moment().startOf('day'),
      endOfToday: moment().endOf('day'),
      month: moment().startOf('month'),
      seventhDay: moment(moment().startOf('month')).add(7, 'days'),
      lastWeekEndTime: moment(moment().endOf('day')).subtract(1, 'day'),
      lastweekBeginTime: moment(moment().startOf('day')).subtract(7, 'day'),
    }
    //Log.sDebug("Dates for transaction history formatted as " + JSON.stringify(dateFormatter));

    if (moment(dateFormatter.startOftoday).isBetween(dateFormatter.month, dateFormatter.seventhDay)) {
      dateFormatter.month = moment(dateFormatter.month).subtract(1, 'months');
      monthHeader = moment(dateFormatter.month).format("MMMM");
      TransactionArray = this.formTransactionHistoryDivider(monthHeader, localeObj, false)
      //Log.sDebug("1st week of month. Hence month set to " + monthHeader, "TransactionHistory");
    } else {
      //Log.sDebug("Not the 1st week of month. Hence month set to " + monthHeader, "TransactionHistory");
      TransactionArray = this.formTransactionHistoryDivider(monthHeader, localeObj, false);
    }

    for (i in txData) {
      if (moment(txData[i].date).isBetween(dateFormatter.startOftoday, dateFormatter.endOfToday)) {
        TransactionArray[0].transactions.push(txData[i]);
      }
      else if (moment(txData[i].date).isBetween(dateFormatter.lastweekBeginTime, dateFormatter.lastWeekEndTime)) {
        TransactionArray[1].transactions.push(txData[i]);
      }
      else if (moment(txData[i].date).isBetween(dateFormatter.month, dateFormatter.lastweekBeginTime)) {
        TransactionArray[2].transactions.push(txData[i]);
      }
      else if (moment(txData[i].date).isSame(dateFormatter.startOftoday, 'year')) {
        TransactionArray[3].transactions.push(txData[i]);
      }
      else {
        TransactionArray[4].transactions.push(txData[i]);
      }
    }

    return TransactionArray;
  }

  this.formatAmountDecimal = function (amount) {
    //Log.sDebug("formatAmountDecimal: " + amount);
    let formatted;
    let decimal;
    if (!this.emptyValueCheck(amount)) {
      formatted = amount.toString().split(".")[0];
      if (amount.toString().length > 1) {
        decimal = amount.toString().split(".")[1] ? '' + amount.toString().split(".")[1] : "00";
        if (decimal) {
          switch (decimal.length) {
            case 0: decimal = "00";
              break;
            case 1: decimal = decimal + "0";
              break;
            default: decimal = decimal.substring(0, 2);
              break;
          }
        } else {
          decimal = "00";
        }
      } else {
        decimal = "00"
      }
    } else {
      formatted = "0";
      decimal = "00";
    }

    return {
      "formatted": formatted,
      "decimal": decimal
    }

  }

  this.captitalizeFirstLetter = function (s) {
    return s && s[0].toUpperCase() + s.slice(1);
  }


  this.formInvoiceHistoryDivider = function (iHData) {
    let dat = [];
    if (this.emptyValueCheck(iHData))
      return null;

    for (let i of iHData) {
      dat.push(i.dueDate);
    }
    let invoicehistoryArray = [];
    let yearArray = [...new Set(dat.map(date1 => moment(date1).format('YYYY')))];
    let yearArraySorted = yearArray.sort((a, b) => { return b - a; });
    for (let year of yearArraySorted) {
      let obj = {
        "DateHeader": year,
        "transactions": []
      }
      invoicehistoryArray.push(obj);
    }
    for (let i of iHData) {
      let index = this.getIndexOfYear(invoicehistoryArray, moment(i.dueDate).format('YYYY'));
      invoicehistoryArray[index].transactions.push(i);
    }
    //Log.sDebug("Invoice history " + JSON.stringify( invoicehistoryArray));
    return invoicehistoryArray;

  }

  this.getIndexOfYear = (array, year) => {
    for (let i in array) {
      if (array[i].DateHeader === year)
        return i;
    }
    return -1;

  }



  this.setElementPosition = () => {
    let dm = androidApiCalls.checkDisplaySize();
    switch (dm) {
      case "EXTRA_LARGE_SCREEN": return "15rem";
      case "NEXT_LARGE_SCREEN": return "12rem";
      case "LARGE_SCREEN": return "14rem";
      case "NORMAL_SCREEN":
      case "SMALL_SCREEN":
        return "15rem";
      default: return "15rem";
    }
  }

  this.isDisplaySetToLarge = () => {
    let dm = androidApiCalls.checkDisplaySize() || "";
    if (dm.toString().toLowerCase().includes("large")) {
      return true;
    } else {
      return false;
    }
  }

  this.isScreenSetToMax = () => {
    let dm = androidApiCalls.checkDisplaySize();
    switch (dm) {
      case "EXTRA_LARGE_SCREEN":
      case "NEXT_LARGE_SCREEN": return true;
      default: return false;
    }
  }

  this.getBoxHeight = (calculatedHeight) => {
    let dm = androidApiCalls.checkDisplaySize();
    switch (dm) {
      case "EXTRA_LARGE_SCREEN": return calculatedHeight * 1.5;
      case "NEXT_LARGE_SCREEN": return calculatedHeight * 1.3;
      case "LARGE_SCREEN": return calculatedHeight * 1.2;
      case "NORMAL_SCREEN":
      case "SMALL_SCREEN": return calculatedHeight;
      default: return calculatedHeight;
    }
  }

  this.getBoxWidth = (calculatedWidth) => {
    let dm = androidApiCalls.checkDisplaySize();
    switch (dm) {
      case "EXTRA_LARGE_SCREEN": return calculatedWidth * 1.3;
      case "NEXT_LARGE_SCREEN": return calculatedWidth * 1.2;
      case "LARGE_SCREEN": return calculatedWidth * 1.1;
      case "NORMAL_SCREEN":
      case "SMALL_SCREEN":
        return calculatedWidth;
      default: return calculatedWidth;
    }
  }

  this.getTagWidth = () => {
    let dm = androidApiCalls.checkDisplaySize();
    switch (dm) {
      case "EXTRA_LARGE_SCREEN": return "5rem";
      case "NEXT_LARGE_SCREEN": return "6rem";
      case "LARGE_SCREEN": return "7rem";
      case "NORMAL_SCREEN":
      case "SMALL_SCREEN":
        return "8rem";
      default: return "8rem";
    }
  }

  this.transactionHistoryScheduledDateOrganizer = function (txData, localeObj) {
    moment.locale(this.getLocale());
    let i = 0;
    let TransactionArray = [];
    let monthHeader = moment().format("MMMM");

    let dateFormatter = {
      startOftoday: moment().startOf('day'),
      endOfToday: moment().endOf('day'),
      month: moment().endOf('month'),
      seventhDay: moment(moment().endOf('month')).subtract(7, 'days'),
      nextWeekEndTime: moment(moment().endOf('day')).add(7, 'days'),
      nextWeekBeginTime: moment().endOf('day'),
      thisYearEndTime: moment().endOf('year')
    }
    //Log.sDebug("Dates for transaction history formatted as " + JSON.stringify(dateFormatter));

    if (moment(dateFormatter.startOftoday).isBetween(dateFormatter.month, dateFormatter.seventhDay)) {
      dateFormatter.month = moment(dateFormatter.month).add(1, 'months');
      monthHeader = moment(dateFormatter.month).format("MMMM");
      TransactionArray = this.formTransactionHistoryDivider(monthHeader, localeObj, true)
      //Log.sDebug("1st week of month. Hence month set to " + monthHeader, "TransactionHistory");
    } else {
      //Log.sDebug("Not the 1st week of month. Hence month set to " + monthHeader, "TransactionHistory");
      TransactionArray = this.formTransactionHistoryDivider(monthHeader, localeObj, true);
    }

    for (i in txData) {
      if (moment(txData[i].date).isBetween(dateFormatter.startOftoday, dateFormatter.endOfToday)) {
        TransactionArray[0].transactions.push(txData[i]);
      } else if (moment(txData[i].date).isBetween(dateFormatter.nextWeekBeginTime, dateFormatter.nextWeekEndTime)) {
        TransactionArray[1].transactions.push(txData[i]);
      } else if (moment(txData[i].date).isBetween(dateFormatter.nextWeekEndTime, dateFormatter.month)) {
        TransactionArray[2].transactions.push(txData[i]);
      } else if (moment(txData[i].date).isBetween(dateFormatter.month, dateFormatter.thisYearEndTime)) {
        TransactionArray[3].transactions.push(txData[i]);
      } else if (moment(txData[i].date).isSame(dateFormatter.startOftoday, 'year')) {
        TransactionArray[3].transactions.push(txData[i]);
      } else {
        TransactionArray[4].transactions.push(txData[i]);
      }
    }

    return TransactionArray;
  }

  this.captitalizeStrings = function (value) {
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  this.notEmptyNullUndefinedCheck = function (value, defaultValue = false) {
    try {
      if (!Boolean(value) || (["array", "object"].includes(typeof value) && Object.keys(value).length === 0)) {
        return defaultValue;
      }

      return value;
    } catch (e) {
      return defaultValue;
    }
  }

  this.isNotEmpty = function (value, defaultValue = false) {
    return this.notEmptyNullUndefinedCheck(value, defaultValue);
  }

  this.subDeepLinkCheck = function (subDeepLink) {
    try {
      if (this.isNotEmpty(subDeepLink, false)) {
        history.replace({ pathname: "/newWalletLaunch", transition: "right" });
        return true;
      }
    } catch (error) {
      Log.sDebug("Error in subDeepLinkCheck: " + error.message);
    }

    return false;
  }

  this.getFormattedAmount = (amount) => {
    let balanceInfo = amount.toString().split(".");
    let formattedAmount = this.formatBalance(balanceInfo[0]);
    let decimal = balanceInfo[1];

    if (decimal) {
      switch (decimal.length) {
        case 0: decimal = "00";
          break;
        case 1: decimal = decimal + "0";
          break;
        default: decimal = decimal.substring(0, 2);
          break;
      }
    } else {
      decimal = "00";
    }
    return `${formattedAmount},${decimal}`;
  }

  this.formatAmount = (amount) => {
    let full = "00";
    let decimal = "00";
    if (!this.emptyValueCheck(amount)) {
      let amountInfo = amount.toString().split(".");
      full = amountInfo[0];
      decimal = amountInfo[1];
    }
    if (decimal) {
      switch (decimal.length) {
        case 0:
          decimal = "00";
          break;
        case 1:
          decimal = decimal + "0";
          break;
        default:
          decimal = decimal.substring(0, 2);
          break;
      }
    } else {
      decimal = "00";
    }

    if (full && full.length >= 4) {
      let newfull = "";
      let count = 0;
      let full_length = full.length;
      for (let i = full_length - 1; i >= 0; i--) {
        if (count === 3) {
          newfull = '.' + newfull;
          count = 0;
        }
        newfull = full[i] + newfull;
        count = count + 1;
      }
      full = newfull;
    }

    return full + "," + decimal;
  }

  this.formatBalanceWithoutDecimal = (full) => {
    if (full && full.length >= 4) {
      let newfull = "";
      let count = 0;
      let full_length = full.length;
      for (let i = full_length - 1; i >= 0; i--) {
        if (count === 3) {
          newfull = '.' + newfull;
          count = 0;
        }
        newfull = full[i] + newfull;
        count = count + 1;
      }
      full = newfull;
    }
    return full;
  }

  this.blockUserCardTemp = async function (cardKey) {
    return new Promise((resolve) => {
      (async () => {
        try {
          await arbiApiService.blockCardtemp(cardKey, PageNames.chatComponent).then(response => {
            if (response.success) {
              ImportantDetails.cardDetailResponse = {};
              let processorResponse = ArbiResponseHandler.processBlockCardTempResponse(response.result);
              if (processorResponse.success) {
                resolve(processorResponse);
              }
            }
          });
        } catch (_) {
          return;
        }
        resolve(false);
      })();
    });
  }

  this.unblockUserCardTemp = async function (cardKey) {
    return new Promise((resolve) => {
      (async () => {
        try {
          await arbiApiService.unblockCardTemp(cardKey, PageNames.chatComponent).then(response => {
            Log.debug("Card Unblock " + response.success)
            if (response.success) {
              ImportantDetails.cardDetailResponse = {};
              let processorResponse = ArbiResponseHandler.processUnblockCardTempResponse(response.result);
              if (processorResponse.success) {
                resolve(processorResponse);
              }
            }
          });
        } catch (_) {
          return;
        }
        resolve(false);
      })();
    });
  }

  this.getUserAllCards = async function ({ getBlockedCards = false, getUnblockedCards = false }) {
    return new Promise((resolve) => {
      (async () => {
        let userCards = [];
        try {
          let response = {};
          if (Object.keys(ImportantDetails.cardDetailResponse).length === 0 ||
            ImportantDetails.cardDetailResponse == null ||
            ImportantDetails.cardDetailResponse === undefined ||
            ImportantDetails.cardDetailResponse === "") {
            await arbiApiService.getCardDetails(PageNames.chatComponent).then(cardResponse => {
              response = cardResponse;
              if (response == null ||
                response === undefined ||
                response.length === 0 ||
                response.success === 'false' ||
                (response.status !== 201 && response.status !== 200)) {
                ImportantDetails.cardDetailResponse = {};
              } else {
                ImportantDetails.cardDetailResponse = response;
              }
            });
          } else {
            response = ImportantDetails.cardDetailResponse;
          }
          // await arbiApiService.getCardDetails().then(response => {
          if (response && response.success) {
            let processedDetails = ArbiResponseHandler.processGetCardDetailsApi(response.result);
            //Log.sDebug('CHATBOT: inside check has card', processedDetails,"CHATBOX", constantObjects.LOG_STAGING);
            if (processedDetails.success && processedDetails.physicalCardDetails) {
              userCards = this.validateAndGenerateUserCardObject(userCards, processedDetails.physicalCardDetails, 'physical', getBlockedCards, getUnblockedCards);
            }
            if (processedDetails.error === "VIRTUAL_CARD_ONLY" || (processedDetails.success && processedDetails.virtualCardDetails)) {
              userCards = this.validateAndGenerateUserCardObject(userCards, processedDetails.virtualCardDetails, 'virtual', getBlockedCards, getUnblockedCards);
            }
            resolve(userCards);
          }
          // });
        } catch (_) {
          return;
        }
        // no physical card
        resolve(userCards);
      })();
    });
  }

  this.checkIfUserCancelledCard = (status) => {
    switch (status) {
      case "Bloqueado por Fraude":
      case "Bloqueado por Solicitação Judicial":
      case "Bloqueado por Roubo":
      case "Bloqueado por Perda":
      case "Bloqueado por Extravio":
      case "Bloqueado por Suspeita de Fraude":
      case "Bloqueado por PLD":
      case "Bloqueado por Dano":
      case "Cancelado/Desativado":
        return true;
      default: return false;
    }
  }

  this.checkIfUserBlockedCard = (status) => {
    switch (status) {
      case "Bloqueado a pedido do cliente":
      case "Bloqueado a pedido do cliente Cliente":
      case "Bloqueado por Senha Incorreta":
      case "Bloqueado por Emissão":
        return true;
      default: return false;
    }
  }

  this.validateAndGenerateUserCardObject = (userCardsArray, cards, cardType = 'virtual', getBlockedCards, getUnblockedCards) => {
    cards.forEach((opt) => {
      if (
        (opt.descricaoStatusCartao === 'Desbloqueado' && getBlockedCards)
        || (this.checkIfUserBlockedCard(opt.descricaoStatusCartao) && getUnblockedCards)
        || this.checkIfUserCancelledCard(opt.descricaoStatusCartao)
      ) {
        return;
      }

      let jsonObject = {};
      jsonObject["cardType"] = cardType;
      jsonObject["name"] = opt.nomeImpresso;
      jsonObject["number"] = "**** **** **** " + opt.cartaoNumero.slice(-4);
      jsonObject["expiry"] = opt.cartaoDataExpiracao.split("/").join("");
      jsonObject["cardKey"] = opt.chaveDeCartao;
      jsonObject["status"] = opt.descricaoStatusCartao;
      jsonObject["brand"] = opt.bandeiraNome;
      userCardsArray.push(jsonObject);
    });

    return userCardsArray;
  }

  this.getCAFFailureText = (sdkStatusMessage, localeObj) => {
    if (this.emptyValueCheck(sdkStatusMessage)) {
      return localeObj.error_default_CAF;
    } else if (sdkStatusMessage.includes("300")) {
      return localeObj.error_300_CAF;
    } else if (sdkStatusMessage.includes("400")) {
      return localeObj.error_400_CAF;
    } else if (sdkStatusMessage.includes("500")) {
      return localeObj.error_500_CAF;
    } else if (sdkStatusMessage.includes("600")) {
      return localeObj.error_600_CAF;
    } else if (sdkStatusMessage.includes("1000") || sdkStatusMessage.includes("2000")) {
      return localeObj.error_1000_CAF;
    } else if (sdkStatusMessage.includes("100")) {
      return localeObj.error_100_CAF;
    } else if (sdkStatusMessage.includes("200")) {
      return localeObj.error_200_CAF;
    } else if (sdkStatusMessage.includes("1")) {
      return localeObj.error_1_CAF;
    } else {
      return localeObj.error_default_CAF;
    }
  }


  this.getUserAccountBalance = async function () {
    return new Promise((resolve) => {
      (async () => {
        try {
          const accountKey = ImportantDetails.accountKey;
          await arbiApiService.getUserBalance("GENERAL UTILITIES", accountKey).then(response => {
            if (response.success) {
              let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
              if (processorResponse.success) {
                const formattedBalance = this.getFormattedAmount(processorResponse.balance);
                resolve(`R$ ${formattedBalance}`);
              }
            }
          });
        } catch (_) { return; }
        resolve("R$ 0,00");
      })();
    });
  }

  this.getUserTransactionHistory = async (localeObj) => {
    let txnData = [];
    try {
      const startDate = moment().subtract(90, 'days');
      const endDate = new Date();
      // Log.sDebug('CHATBOT: get user transaction history', startDate, endDate, "CHATBOX");

      const response = await arbiApiService.getTransactionHistory(startDate, endDate, "all", 0, PageNames.chatComponent);
      if (response.success) {
        let processorResponse = ArbiResponseHandler.processTransactionHistoryApiResponse(response.result);
        if (processorResponse.success) {
          // Log.sDebug('CHATBOT: get user transaction history response', "CHATBOX");
          txnData = txnData.concat(processorResponse.transactionData);
          let TransactionArray = this.transactionHistoryDateOrganizer(txnData, localeObj);
          const finalArray = TransactionArray.filter((entry) => Object.keys(entry.transactions).length !== 0);
          // Log.sDebug('CHATBOT: get user transaction history response final', "CHATBOX");
          return [...finalArray];
        }
      }
    } catch (error) {
      // Log.sDebug(error);
    }
    return txnData;
  };

  this.checkForNotificationDialog = function () {
    const tabName = androidApiCalls.getUnParsedDeviceParameter("tab_name");
    if (tabName !== 'Wallet' && tabName !== 'wallet') {
      return false;
    }

    let storyId = androidApiCalls.getUnParsedDeviceParameter('story_id');

    if (!this.isNotEmpty(storyId)) {
      storyId = androidApiCalls.getUnParsedDeviceParameter('fragment_identifier');
    }

    let isDialog = androidApiCalls.getUnParsedDeviceParameter("dialog_trigger");
    const gamificationaddon_id = androidApiCalls.getUnParsedDeviceParameter("open_page");

    if (this.isNotEmpty(gamificationaddon_id)) {
      isDialog = "true";
      storyId = gamificationaddon_id;
    }

    if (isDialog !== 'true') {
      return false;
    }

    androidApiCalls.setDAStringPrefs("story_id", storyId)
    androidApiCalls.setDAStringPrefs("isdialog", isDialog);

    return true;
  }

  this.getPixType = (type) => {
    switch (type) {
      case "CPF": return 1;
      case "CNPJ": return 2;
      case "PHONE": return 3;
      case "EMAIL": return 4;
      case "EVP": return 5;
      default: return 6;
    }
  }

  this.getMetadataForDeviceType = () => {
    if (androidApiCalls.checkIfNm()) {
      return androidApiCalls.getDeviceId();
    } else {
      let value = androidApiCalls.getBarcode();
      if (value) {
        return sha1(value);
      } else {
        return null;
      }
    }
  }

  this.createDeviceInfo = function () {
    var payload = Object.assign({}, {});
    payload.deviceId = androidApiCalls.getDeviceId();
    payload.serialNumber = androidApiCalls.getBarcode();
    payload.anonymizedSerialNumber = this.getMetadataForDeviceType();
    payload.model = androidApiCalls.getModelName();
    payload.apkVersion = androidApiCalls.getAppVersion();
    payload.arbiServerURL = Globals.getDigitalAccountEvironment();
    payload.webviewVersion = deploymentVersion.version;
    payload.webviewServerURL = androidApiCalls.getDigitalAccountUrl();
    payload.motopayEnabled = androidApiCalls.isMotoPlaceEnabled();
    payload.serverURL = this.getBackendUrlProxyName();
    return payload;
  }

  this.getDeviceInformationObject = () => {
    try {
      const deviceInformation = androidApiCalls.getDeviceInformation();
      let deviceInformationObj = JSON.parse(deviceInformation);
      return this.isNotEmpty(deviceInformationObj, false) && deviceInformationObj.deviceInfo;
    } catch (e) {
      return undefined;
    }
  }

  this.setBalanceToCache = (processedBalance) => {
    let balanceInfo = processedBalance.toString().split(".");
    let balance = balanceInfo[0];
    let decimal = balanceInfo[1];
    if (decimal) {
      switch (decimal.length) {
        case 0:
          decimal = "00";
          break;
        case 1:
          decimal = decimal + "0";
          break;
        default:
          decimal = decimal.substring(0, 2);
          break;
      }
    } else {
      decimal = "00";
    }
    ImportantDetails.setBalance(balance, decimal);
  }

  this.findStatus = (situation, cip) => {
    switch (situation) {
      case "Em_Aberto":
        if (cip === "Recusado") {
          return "rejected";
        } else {
          return "sent";
        }
      case "Aprovada":
        if (cip === "A_Enviar" || cip === " Enviada") {
          return "sent";
        } else if (cip === "Recusado") {
          return "rejected";
        } else {
          return "approved";
        }
      case "Retida":
        if (cip === "Recusado") {
          return "rejected";
        } else {
          return "sent";
        }
      case "Cancelada": return "cancelled";
      case "Efetivada": return "active";
      default: return;
    }
  }

  this.openHelpSection = () => {
    androidApiCalls.openUrlInBrowser(Globals.getFAQPath());
  }

  this.openDimoWebsite = () => {
    androidApiCalls.openUrlInBrowser(Globals.getDimoWebsitePath());
  }

  this.onCheckBalance = () => {
    return new Promise((resolve) => {
      (async () => {
        try {
          const accountKey = ImportantDetails.accountKey;
          await arbiApiService.getUserBalance("GENERAL UTILITIES", accountKey).then(response => {
            if (response.success) {
              let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
              if (processorResponse.success) {
                this.setBalanceToCache(processorResponse.balance);
                const formattedBalance = this.getFormattedAmount(processorResponse.balance);
                resolve(`R$ ${formattedBalance}`);
              }
            }
          });
        } catch (_) {
          return;
        }
        resolve("Could not fetch balance");
      })();
    });
  }

  this.isCAFEnabled = () => {
    try {
      let isTokenAvailable = !this.emptyValueCheck(ImportantDetails.jwtForCAF);//RETRY FOR TOKEN
      let isFeatureAllowedOnDevice = !this.emptyValueCheck(androidApiCalls.getReleaseType()) ? androidApiCalls.getReleaseType().includes("release-keys") : false;

      if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION") && isFeatureAllowedOnDevice && isTokenAvailable && constantObjects.featureEnabler.CAF_ENABLED) {
        Log.sDebug("CAF is enabled all conditions met ", "isCAFEnabled", constantObjects.LOG_PROD);
        return true;
      } else {
        Log.sDebug("CAF disabled conditions failed: Is token avaialable  " + isTokenAvailable + "Is feature Flag diabled " + androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")
          + "Is Device Build allowed " + isFeatureAllowedOnDevice + "Is feature enabled on Webview " + constantObjects.featureEnabler.CAF_ENABLED, "isCAFEnabled", constantObjects.LOG_PROD);
        return false;
      }
    } catch (err) {
      Log.sDebug("Error found in CAF enabled check " + err)
      return false;
    }
  }

  this.sendCAFSDKMetrics = (uri, apiName, success, cafTimeSpent, finalJSON, localeObj, pageName) => {
    let cafAnalyticsJSON = {};
    if (finalJSON) {
      cafAnalyticsJSON["trackingID"] = finalJSON.sdkTrackingId;
      cafAnalyticsJSON["chaveDeCliente"] = ImportantDetails.clientKey;
      cafAnalyticsJSON["timeSpentInMs"] = cafTimeSpent;
      cafAnalyticsJSON["sdkStatusCode"] = finalJSON.sdkStatusCode;
      cafAnalyticsJSON["sdkStatusMessageCode"] = this.emptyValueCheck(finalJSON.sdkStatusMessage) ? constantObjects.CAF_MESSAGE_CODE : finalJSON.sdkStatusMessage;
      cafAnalyticsJSON["sdkStatusMessage"] = this.getCAFFailureText(finalJSON.sdkStatusMessage, localeObj);
      cafAnalyticsJSON["pageName"] = pageName;
    } else {
      cafAnalyticsJSON["chaveDeCliente"] = ImportantDetails.clientKey;
      cafAnalyticsJSON["timeSpentInMs"] = cafTimeSpent;
      cafAnalyticsJSON["sdkStatusMessageCode"] = constantObjects.CAF_MESSAGE_CODE;
      cafAnalyticsJSON["sdkStatusMessage"] = localeObj.error_default_CAF;
      cafAnalyticsJSON["pageName"] = pageName;
    }
    ArbiApiMetrics.sendCAFSDKAlertMetrics(uri, apiName, success, cafAnalyticsJSON);
  }

  this.sendActiveCAFFailureSDKMetrics = (uri, apiName, success, cafTimeSpent, finalJSON, code, localeObj, pageName) => {
    let cafAnalyticsJSON = {};
    //code will be used in future
    if (finalJSON) {
      cafAnalyticsJSON["trackingID"] = finalJSON;
      cafAnalyticsJSON["chaveDeCliente"] = ImportantDetails.clientKey;
      cafAnalyticsJSON["timeSpentInMs"] = cafTimeSpent;
      cafAnalyticsJSON["sdkStatusCode"] = finalJSON;
      cafAnalyticsJSON["sdkStatusMessageCode"] = this.emptyValueCheck(finalJSON) ? constantObjects.CAF_MESSAGE_CODE : finalJSON;
      cafAnalyticsJSON["sdkStatusMessage"] = finalJSON;
      cafAnalyticsJSON["pageName"] = pageName;
    } else {
      cafAnalyticsJSON["chaveDeCliente"] = ImportantDetails.clientKey;
      cafAnalyticsJSON["timeSpentInMs"] = cafTimeSpent;
      cafAnalyticsJSON["sdkStatusMessageCode"] = constantObjects.CAF_MESSAGE_CODE;
      cafAnalyticsJSON["sdkStatusMessage"] = localeObj.error_default_CAF;
      cafAnalyticsJSON["pageName"] = pageName;
    }
    ArbiApiMetrics.sendCAFSDKAlertMetrics(uri, apiName, success, cafAnalyticsJSON);
  }

  this.secondsToTime = (secs) => {
    let hour = Math.floor(secs / (60 * 60));
    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);
    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    let obj = {
      "h": hour,
      "m": minutes,
      "s": seconds
    };
    return obj;
  }

  this.getCarouselBreakPoint = () => {
    return {
      mobile: {
        breakpoint: { max: 464, min: 0 },
        items: 1,
        slidesToSlide: 1
      },
      tablet: {
        breakpoint: { max: 1024, min: 464 },
        items: 1,
        slidesToSlide: 1
      }
    };
  }

  this.appendDynamicCss = (dynamicCss) => {
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');

    head.appendChild(style);

    if (style.styleSheet) {
      style.styleSheet.cssText = dynamicCss; // This is required for IE8 and below.
    } else {
      style.appendChild(document.createTextNode(dynamicCss));
    }
  }

  this.arrayColumnCount = (arrayData, columnName) => {
    let columnDataCount = 0;

    try {
      columnDataCount = arrayData.reduce((reduceData, currentData) => reduceData += (currentData[columnName])?.length ?? 0, 0);
    } catch (_) {
      columnDataCount = 0;
    }

    return columnDataCount;
  }

  this.sendActionMetrics = (pageName, eventType) => {
    const eventObject = { page_name: pageName, eventType };
    MetricsService.reportActionMetrics(eventObject, new Date().getTime());
  }

  //All the in-app routing happens here and external urls will be rendered from the respective domelement class
  this.onclickEngageCards = (action, componentName) => {
    MetricsService.onPageTransitionStop(componentName, PageState.close);
    Log.sDebug("User clicked banner for action " + action, "BannerCards");

    if (action === "" || action === undefined) {
      return;
    }

    try {
      const PIX_SUBSTRING = "br.gov.bcb.pix";
      const deepLinkJson = JSON.parse(action);
      let url = deepLinkJson["componentPath"];

      if (url === "" || url === undefined || url === "/newLogin") {
        return;
      }

      if (url.toLowerCase().includes("dimo:qrcode/payment")) {
        ImportantDetails.dimoPayEntryPoint = "DIMO_PAY_FROM_EXTERNAL";
        history.replace({ pathname: "/dimoPayComponent", state: url });
      } else if (url.toLowerCase().includes(PIX_SUBSTRING.toLowerCase())) {
        url = url.replace("%20", " ");
        history.replace({ pathname: "/pixQrCopyPasteComponent", state: url });
      } else {
        const addInfo = deepLinkJson["additionalInfo"];
        const addInfoJson = (addInfo !== "" && addInfo !== undefined) ? JSON.parse(addInfo) : "";
        history.replace({ pathname: url, additionalInfo: addInfoJson });
      }
    } catch (err) {
      Log.sDebug("Exception while fetching card details" + err, componentName, constantObjects.LOG_PROD)
    }
  }

  this.getTranslatedString = (prefix, key, localeObj) => {
    return localeObj[prefix + (key).toString().toLowerCase()];
  }

  this.arrayColumnMatchCount = (arrayData, columnName, matchingValue) => {
    let columnDataCount = 0;

    try {
      columnDataCount = arrayData.reduce((reduceData, currentData) => reduceData += (currentData[columnName] === matchingValue) ? 1 : 0, 0);
    } catch (_) {
      columnDataCount = 0;
    }

    return columnDataCount;
  }

  this.accountStatusMapping = (status) => {
    switch (status) {
      case 2: return "BloqueadaCliente";
      case 3: return "BloqueadoOrganizationUnit";
      case 4: return "BloqueadoNaoAtivada";
      case 5: return "BloqueadoCancelamentoCliente";
      case 6: return "BloqueadoSolicitacaoJudicial";
      case 7: return "BloqueadoSuspeitaFraude";
      case 8: return "BloqueadoFraude";
      case 9: return "BloqueadoSuspeitaPld";
      case 10: return "ContaDigitalPendente";
      case 11: return "ContaEncerrada";
      default: break;
    }
  }

  this.numDifferentiation = (value) => {
    const val = Math.abs(value);

    if (val >= 1000000000) return `${(value / 1000000000).toFixed(2)} B`;
    if (val >= 1000000) return `${(value / 1000000).toFixed(2)} M`;
    if (val >= 1000) return `${(value / 1000).toFixed(2)} K`;
    return value;
  }
  
  this.fetchPixKeys = async () => {
    if (!ImportantDetails.pixKeysResponse ||
        Object.keys(ImportantDetails.pixKeysResponse).length === 0 ||
        ImportantDetails.fromRegisterPixKey ||
        ImportantDetails.pixKeysResponse == {}) {
        const response = await arbiApiService.getAllPixKeys(PageNames.pixRecieve.amount);
        ImportantDetails.pixKeysResponse = response;
        ImportantDetails.fromRegisterPixKey = false;
        return response;
    }
    return ImportantDetails.pixKeysResponse;
  };
}

export default new GeneralUtilies();

