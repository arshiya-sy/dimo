/* Put any util function here */
import GeneralUtilies from "./GeneralUtilities";
import androidApiCalls from "./androidApiCallsService";

var reAuthPerSession = 0;
const sha1 = require('sha1');
function Utilies() {
    const DEVICE_TYPES = {
        ENGAGE: "engage",
        BROWSER: "browser"
    };

    this.checkBrowserType = function () {
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

    this.validateParameters = (field, value) => {
        switch (field) {
            case "CPF":
                return GeneralUtilies.validateCPF(value);
            case "CPF/CNPJ":
                return GeneralUtilies.validateCpfOrCnpj(value);
            case "CNPJ":
                return GeneralUtilies.validateCnpj(value);
            case "E-mail":
            case "Email":
            case "EMAIL":
                return GeneralUtilies.validateEmail(value);
            case "ddd":
                return GeneralUtilies.validateDDD(value);
            case "qr":
                return GeneralUtilies.validateQRCode(value);
            default:
                return true;
        }
    };

    this.parseCEP = (value) => {
        let tempCep = value;
        let newCep = '';
        let cepObj = {}

        if (tempCep) {
            //Handle cases of backpress
            let temp = tempCep.replace(/-/g, "");
            newCep = temp.substr(0, 5);
            if (temp.length > 5) {
                newCep += "-" + temp.substr(5, 3);
            }
            if (newCep.length > 9) {
                value = temp.substr(0, 8);
            }
            cepObj["cepDisp"] = newCep;

        }
        cepObj["cepDisp"] = newCep;
        return cepObj;
    };

    this.parseLandLineNum = (value) => {
        let temp = value.replace(/-/g, "");
        if (temp.length >= 3) {
            let areaCode = temp.substr(0, 2);
            let phoneNumber = temp.substr(2, 8);
            let formattedPhoneNumber = areaCode + "-" + phoneNumber;
            return { "ddd": areaCode, "phoneNumber": phoneNumber, "formattedPhoneNumber": formattedPhoneNumber };
        } else {
            return { "ddd": "", "phoneNumber": "", "formattedPhoneNumber": value };
        }
    };

    this.parseCPF = (value, mask = false) => {
        let tempcpf = value.replace(/\.|-/g, "");
        let newcpf = '';
        let cpfObject = {}

        if (tempcpf) {
            //Handle cases of backpress
            var temp = tempcpf;
            newcpf = mask ? "***" : temp.substr(0, 3);
            if (temp.length >= 4) {
                newcpf += "." + temp.substr(3, 3);
            }
            if (temp.length >= 7) {
                newcpf += "." + temp.substr(6, 3);
            }
            if (temp.length >= 10) {
                newcpf += "-";
                newcpf += mask ? "**" : temp.substr(9, 2);
            }
            if (newcpf.length > 14) {
                value = newcpf.substr(0, 15);
            }
            cpfObject['displayCPF'] = newcpf;
        }
        return cpfObject;
    };

    this.parseCPFOrCnpj = (value, mask = false) => {
        let tempcpf = value.replace(/\.|-|\//g, "");
        let newcpf = '';
        let cpfObject = {}

        if (tempcpf.length <= 11) {
            return this.parseCPF(tempcpf, mask);
        }

        if (tempcpf) {
            //Handle cases of backpress
            let temp = tempcpf;
            newcpf = mask ? "**" : temp.substr(0, 2); //54
            if (temp.length >= 3) {
                newcpf += "." + temp.substr(2, 3); // 54.403
            }
            if (temp.length >= 6) {
                newcpf += "." + temp.substr(5, 3); // 54.403.563
            }
            if (temp.length >= 9) {
                newcpf += "/";
                newcpf += mask ? "****" : temp.substr(8, 4); // 54.403.563/0001
            }
            if (temp.length >= 13) {
                newcpf += "-";
                newcpf += mask ? "**" : temp.substr(12, 2); // 54.403.563/0001-50
            }
            cpfObject['displayCPF'] = newcpf;
        }
        return cpfObject;
    };

    this.parseCnpj = (value, mask = false) => {
        let tempcpf = value.replace(/\.|-|\//g, "");
        let newcpf = '';
        let cpfObject = {}

        if (tempcpf) {
            //Handle cases of backpress
            let temp = tempcpf;
            newcpf = mask ? "**" : temp.substr(0, 2); //54
            if (temp.length >= 3) {
                newcpf += "." + temp.substr(2, 3); // 54.403
            }
            if (temp.length >= 6) {
                newcpf += "." + temp.substr(5, 3); // 54.403.563
            }
            if (temp.length >= 9) {
                newcpf += "/";
                newcpf += mask ? "****" : temp.substr(8, 4); // 54.403.563/0001
            }
            if (temp.length >= 13) {
                newcpf += "-";
                newcpf += mask ? "**" : temp.substr(12, 2); // 54.403.563/0001-50
            }
            cpfObject['displayCPF'] = newcpf;
        }
        return cpfObject;
    };

    this.parsePhoneNum = (value) => {
        let newnumber = "";
        let phoneObject = {}
        let tempNum = value.replace(/\(|\)| /g, "");
        if (tempNum) {
            newnumber += "(";
            var temp = tempNum;
            newnumber += temp.substr(0, 2);
            if (temp.length >= 3) {
                newnumber += ") " + temp.substr(2, 5);
            }
            if (temp.length >= 8) {
                newnumber += " " + temp.substr(7, temp.length);
            }
            if (newnumber.length > 14) {
                newnumber = newnumber.substr(0, 15);
            }
            phoneObject['phoneNumber'] = newnumber;
        }
        phoneObject['phoneNumber'] = newnumber;
        return phoneObject;
    };

    this.parseRG = (value) => {
        let tempRG = value.replace(/\.|-/g, "");
        let dispRG = '';
        let RgObj = {};

        if (tempRG) {
            var temp = tempRG;
            dispRG = temp.substr(0, 2);
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
            }
            RgObj['displayRG'] = dispRG;
        }
        RgObj['displayRG'] = dispRG;
        return RgObj;
    }

    this.parseCode = (value) => {
        let tempcode = value.replace(/[^0-9]/g, '');
        let newcode = '';
        let codeObject = {};
        if (tempcode) {
            //Handle cases of backpress
            var temp = tempcode;
            newcode = temp.substr(0, 5);
            if (temp.length >= 6) {
                newcode += "." + temp.substr(5, 5);
            }
            if (temp.length >= 11) {
                newcode += "-" + temp.substr(10, 5);
            }
            if (temp.length >= 16) {
                newcode += "." + temp.substr(15, 6);
            }
            if (temp.length >= 22) {
                newcode += "-" + temp.substr(21, 5);
            }
            if (temp.length >= 27) {
                newcode += "." + temp.substr(26, 6);
            }
            if (temp.length >= 33) {
                newcode += "-" + temp.substr(32, 1);
            }
            if (temp.length >= 34) {
                newcode += "," + temp.substr(33, 15);
            }

            codeObject['displayCode'] = newcode;
        }
        return codeObject;
    }

    this.parseSalary = (value) => {
        let tempSalary = value.replace(/[^0-9]/g, "");
        if (tempSalary.length === 4) {
            if (tempSalary[0] === "0" && tempSalary[1] === "0") {
                tempSalary = tempSalary.substr(2, tempSalary.length);
            } else if (tempSalary[0] === "0") {
                tempSalary = tempSalary.substr(1, tempSalary.length);
            }
        }
        let displaySalary = "";
        let modified = false;
        let modifiedMax = false;
        if (tempSalary) {
            var temp = tempSalary;
            if (temp.length > 8) {
                modifiedMax = true;
                modified = true;
                displaySalary += temp.substr(0, temp.length - 8);
            }
            if (temp.length > 5) {
                if (modified) {
                    let length = temp.length - 5 - displaySalary.length;
                    displaySalary += "." + temp.substr(temp.length - 8, length);
                } else {
                    modified = true;
                    displaySalary += temp.substr(0, temp.length - 5);
                }
            }
            if (temp.length >= 3) {
                if (modified) {
                    let length = temp.length - 2 - displaySalary.length;
                    if (modifiedMax) {
                        displaySalary += "." + temp.substr(temp.length - 5, length + 1);
                    } else {
                        displaySalary += "." + temp.substr(temp.length - 5, length);
                    }
                } else {
                    modified = true;
                    displaySalary += temp.substr(0, temp.length - 2);
                }
            }
            if (temp.length >= 1) {
                if (modified) {
                    displaySalary += "," + temp.substr(temp.length - 2, temp.length);
                } else {
                    if (temp.length === 1) {
                        if (temp.substr(0, temp.length) !== "0") {
                            displaySalary = "0,0" + temp.substr(0, temp.length);
                        }
                    } else {
                        if (temp.substr(0, temp.length) !== "00") {
                            displaySalary = "0," + temp.substr(0, temp.length);
                        } else {
                            displaySalary = '';
                        }
                    }
                }
            }
        }
        return displaySalary;
    }

    this.formatDecimal = (decimal) => {
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
        return decimal;
    }

    this.formatAmount = (amount) => {
        if (amount) {
            let amountInfo = amount.toString().split(".");
            let full = amountInfo[0];
            let decimal = amountInfo[1];
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
            if (full) {
                return full + "," + decimal;
            } else {
                return "00," + decimal;
            }
        } else {
            return "0,00";
        }
    }

    this.formatDisplayAmount = (amount) => {
        if (amount) {
            var formatter = new Intl.NumberFormat(GeneralUtilies.getUserLocale());
            var currentVal = formatter.format(amount);

            return currentVal;
        }
    }

    this.getMetadataForDeviceType = () => {
        if (androidApiCalls.checkIfNm()) {
            return androidApiCalls.getDeviceId();
        } else {
            let value = androidApiCalls.getBarcode();
            if(value){
                return sha1(value);
            } else {
                return null;
            }
        }
    }
}

export default new Utilies();
