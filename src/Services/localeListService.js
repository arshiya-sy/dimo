import { localeList, specialLocaleFallback } from "./localeList";
import androidApiCalls from "./androidApiCallsService";
import httpRequest from "./httpRequest";
import Log from "./Log";
import Utils from "../WalletComponents/EngageCardComponent/Utils";

var deploymentVersion = require("./deploymentVersion.json");
var responseOnWait = false;

function localeListService() {
  var ActionLocale = {};

  this.setActionLocaleObj = function (data) {
    ActionLocale = data;
  };

  this.getActionLocale = function () {
    if (Object.keys(ActionLocale).length === 0 || Utils.clearLocale('stringReset')) {
      if (responseOnWait) {
        return ActionLocale;
      } else {
        this.setActionLocale();
        return ActionLocale;
      }
    } else {
      return ActionLocale;
    }
  };

  this.setActionLocale = async function () {
    responseOnWait = true
    this.getElementActionLocale(
      "/res/AllLocales/",
      "strings.xml"
    ).then(data => {
      responseOnWait = false;
      this.setActionLocaleObj(data);
    });
  };

  this.getElementActionLocale = function (folderPath, fileName) {
    var localeData = {};
    let version = deploymentVersion.version;
    return new Promise((resolve) => {
      this.fetchLocaleData(this.getFilePath(folderPath, fileName, false), version).then(data => {
        localeData = data;
        this.fetchLocaleData(this.getFilePath(folderPath, fileName, true), version).then(data => {
          /*Populating only the strings in default locale
          for which the locale specific strings are missing.*/
          for (let key in data) {
            if (!localeData[key]) {
              localeData[key] = data[key];
            }
          }
          resolve(localeData);
        });
      }
      ).catch(error => {
        /*When the locale specific file is not found,
        fetching default file and populate localeData*/
        Log.debug("Locale file not found " + error);
        this.fetchLocaleData(this.getFilePath(folderPath, fileName, true), version).then(data => {
          for (let key in data) {
            if (!localeData[key]) {
              localeData[key] = data[key];
            }
          }
          resolve(localeData);
        }).catch(error => {
          Log.debug("Default locale file not found " + error);
          /*Resolving because even after default fetch if there is a failure,
          we don't want to load the app indefinitely */
          resolve(localeData);
        });
      });
    });
  };

  this.fetchLocaleData = function (localvals, version) {
    let url = localvals.url;
    let dir = localvals.dir || 'ltr';
    let params = {};
    params["version"] = version;
    let jsondata;
    let result = httpRequest.getRequest(url, params).then(response => {
      jsondata = this.xmlToJSON(response.data);
      let retData = Object.assign({}, jsondata, { direction: dir });
      return retData;
    });
    return result;
  };

  this.getFilePath = function (folderPath, fileName, usedefault) {
    var device_locale = androidApiCalls.getLocale();
    if (device_locale.indexOf("_") !== -1) {
      device_locale = androidApiCalls.getLocale()
        .split("_")
        .slice(0, 2)
        .join("-");
    }
    Log.debug("device locale is " + device_locale);
    var locale_list_object = localeList.find(function (x) {
      return x.val === device_locale;
    });

    if (!usedefault) {
      if (locale_list_object) {
        return {
          dir: locale_list_object.dir,
          url: folderPath + "values-" + device_locale + "/" + fileName
        };
      }
      //Check for special locales
      if (specialLocaleFallback[device_locale]) {
        locale_list_object = localeList.find(function (x) {
          return x.val === specialLocaleFallback[device_locale]
        });
        if (locale_list_object) {
          return {
            dir: locale_list_object.dir,
            url: folderPath + "values-" + specialLocaleFallback[device_locale] + "/" + fileName
          };
        }
      }

      //fallback to only language
      locale_list_object = localeList.find(function (x) {
        x.val = x.val.split("b+").slice(0, 2).join("");
        return x.val === device_locale.split("-")[0];
      });
      if (locale_list_object) {
        return {
          dir: locale_list_object.dir,
          url: folderPath + "values-" + device_locale.split("-")[0] + "/" + fileName
        };
      }
      //fallback to childeren of language
      locale_list_object = localeList.find(function (x) {
        x.val = x.val.split("b+").slice(0, 2).join("");
        return x.val.split("-")[0].indexOf(device_locale.split("-")[0]) > -1;
      });
      if (locale_list_object) {
        return {
          dir: locale_list_object.dir,
          url: folderPath + "values-" + locale_list_object.val + "/" + fileName
        };
      }
    }
    //fallback to default locale(english)
    locale_list_object = {
      val: "default",
      dir: "ltr"
    };
    return {
      dir: locale_list_object.dir,
      url: folderPath + "values-" + locale_list_object.val + "/" + fileName
    };
  };

  this.xmlToJSON = function (xml) {
    var parser;
    var xmlDoc;
    var res_data = {};
    if (window.DOMParser) {
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(xml, "text/xml");
    }
    var tags = xmlDoc.getElementsByTagName("string");
    for (var i = 0; i < tags.length; i++) {
      res_data[tags[i].attributes.getNamedItem("name").nodeValue] = tags[i].firstChild.nodeValue;
    }
    return res_data;
  };
}

export default new localeListService();
