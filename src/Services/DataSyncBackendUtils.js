import Log from "./Log";
import androidApiCallsService from "./androidApiCallsService";
import ArbiApiService from "./ArbiApiService";
import ArbiResponseHandler from "./ArbiResponseHandler";
import ArbiApiMetrics from "./ArbiApiMetrics"
import apiService from "./apiService";
import ImportantDetails from "../WalletComponents/NewLaunchComponents/ImportantDetails";
import PageNames from "./PageNames";


class DataSyncBackendUtils {

    getDataSyncTime = () => {
        return Number(androidApiCallsService.getDAStringPrefs("dataSyncBackendTime"));

    }

    getDataSyncProps = () => {
        return androidApiCallsService.getDAStringPrefs("neededDataProperties");

    }

    setDataSyncProps = (neededDataProps) => {
        androidApiCallsService.setDAStringPrefs("neededDataProperties", neededDataProps);

    }

    performDataSyncOperation = (dataSyncProp) => {
        //Log.sDebug("SEND_GPAY_METRICS performDataSyncOperation, dataSyncProp: " + dataSyncProp);
        switch (dataSyncProp) {
            case "/GET_CARD_STATUS_IN_GPAY":
                if (androidApiCallsService.isFeatureEnabledInApk("VISA_GPAY"))
                    androidApiCallsService.listTokens(true);
                break;
            case "/GET_PIX_KEY_METRICS":
                ArbiApiService.getAllPixKeys(PageNames.dataSync).then(response => {
                    if (response.success) {
                        let responseHandler = ArbiResponseHandler.processGetAllPixKeysResponse(response.result);
                        if (responseHandler.success) {
                            let pixKeys = responseHandler.pixKeys;
                            this.sendPixKeyStatusMetrics(pixKeys);
                        }
                    }
                });
                break;
            default:
                //Log.sDebug("performDataSyncOperation, data sync operation not defined");
                this.dataSyncOperationCompleted(dataSyncProp);
                break;
        }

    }

    /* this function should be called after data is send to the backend */
    dataSyncOperationCompleted = (operation) => {
        let dataSyncProps = this.getDataSyncProps();
        let dataSyncPropArray = JSON.parse(dataSyncProps);
        let index = dataSyncPropArray.indexOf(operation);
        if (index > -1)
            dataSyncPropArray.splice(index, 1);
        this.setDataSyncProps(JSON.stringify(dataSyncPropArray));
    }

    getDataSyncProperties = () => {
        let dataSyncTime = this.getDataSyncTime();
        if (new Date().getTime() - dataSyncTime >= 7 * 24 * 60 * 60 * 1000) {
            androidApiCallsService.setDAStringPrefs("dataSyncBackendTime", "" + new Date().getTime());
            //Log.sDebug("SEND_METRICS_BACKEND calling getDataSyncProperties");
            apiService.getDataSyncProperties(ImportantDetails.clientKey)
                .then(response => {
                    //Log.sDebug("response: " + JSON.stringify(response));
                    let responseObj = response.data;

                    if (response.status === 200 && responseObj.success) {
                        //Log.sDebug("SEND_METRICS_BACKEND getDataSyncProperties response data: " + JSON.stringify(responseObj.data));
                        let responseData = responseObj.data;
                        let dataProps = responseData["neededDataProperties"];
                        this.setDataSyncProps(JSON.stringify(dataProps));
                        for (let prop in dataProps) {
                            this.performDataSyncOperation(dataProps[prop]);
                        }

                    }
                }).catch(err => {
                    //Log.sDebug("Error in getting data sync properties" + err);
                    if (err.response) {
                        //Log.sDebug("Falied to get data sync properties" + err.response.status);
                    }
                });

        } else {
            try {
                let dataSyncProp = this.getDataSyncProps();
                //Log.sDebug("dataSyncProp: " + dataSyncProp);
                if (dataSyncProp === "" || dataSyncProp === "{}" || dataSyncProp === "undefined" || dataSyncProp === "null")
                    return;
                let dataSyncPropArray = JSON.parse(dataSyncProp);
                for (let prop in dataSyncPropArray) {
                    this.performDataSyncOperation(dataSyncPropArray[prop]);
                }
            } catch (err) {
                return;
            }
        }

    }

    getCardDetails = (listTokensRes) => {
        ArbiApiService.getCardDetails(PageNames.dataSync).then(response => {
            if (response.success) {
                let processedDetails = ArbiResponseHandler.processGetCardDetailsApi(response.result);
                if (processedDetails.success) {
                    let listCards = [];
                    if (processedDetails.virtualCardDetails) {
                        processedDetails.virtualCardDetails.forEach((opt) => {
                            let jsonObject = {};
                            jsonObject["cardType"] = "virtual";
                            jsonObject["name"] = opt.nomeImpresso;
                            jsonObject["number"] = "**** **** **** " + opt.cartaoNumero.slice(-4);
                            jsonObject["expiry"] = opt.cartaoDataExpiracao.split("/").join("");
                            jsonObject["cardKey"] = opt.chaveDeCartao;
                            jsonObject["status"] = opt.descricaoStatusCartao;
                            jsonObject["brand"] = opt.bandeiraNome;
                            jsonObject["idStatusCartao"] = opt.idStatusCartao;
                            listCards.push(jsonObject);
                        });
                    }
                    if (processedDetails.physicalCardDetails) {
                        processedDetails.physicalCardDetails.forEach((opt) => {
                            let jsonObject = {};
                            jsonObject["cardType"] = "physical";
                            jsonObject["name"] = opt.nomeImpresso;
                            jsonObject["number"] = "**** **** **** " + opt.cartaoNumero.slice(-4);
                            jsonObject["expiry"] = opt.cartaoDataExpiracao.split("/").join("");
                            jsonObject["cardKey"] = opt.chaveDeCartao;
                            jsonObject["status"] = opt.descricaoStatusCartao;
                            jsonObject["brand"] = opt.bandeiraNome;
                            jsonObject["idStatusCartao"] = opt.idStatusCartao;
                            listCards.push(jsonObject);
                        });
                    }

                    this.sendGpayStatusMetrics(listTokensRes, listCards);

                } else {
                    if (processedDetails.error === "NO_CARDS") {
                        Log.sDebug("Account has no phyiscal cards or virtual cards");
                        this.sendGpayStatusMetrics(listTokensRes, []);
                    } else if (processedDetails.error === "VIRTUAL_CARD_ONLY") {
                        Log.sDebug("Account has no phyiscal cards, just virtual card");
                        let listCards = [];
                        if(processedDetails.virtualCardDetails) {
                            processedDetails.virtualCardDetails.forEach((opt) => {
                                let jsonObject = {};
                                jsonObject["cardType"] = "virtual";
                                jsonObject["name"] = opt.nomeImpresso;
                                jsonObject["number"] = "**** **** **** " + opt.cartaoNumero.slice(-4);
                                jsonObject["expiry"] = opt.cartaoDataExpiracao.split("/").join("");
                                jsonObject["cardKey"] = opt.chaveDeCartao;
                                jsonObject["status"] = opt.descricaoStatusCartao;
                                jsonObject["brand"] = opt.bandeiraNome;
                                jsonObject["idStatusCartao"] = opt.idStatusCartao;
                                listCards.push(jsonObject);
                            });
                        }
                        this.sendGpayStatusMetrics(listTokensRes, listCards);

                    } else {
                        Log.sDebug("Failed to get card details");
                    }
                }
            } else {
                Log.sDebug("Process response failure");
            }
        });

    }

    sendGpayStatusMetrics = (listTokensRes, listCards) => {
        let resData = [];
        let gpayTokens = [];
        let tokenArray = [];
        listTokensRes.map((token) => {
            tokenArray = token.split(":");
            gpayTokens.push(tokenArray);
            tokenArray = [];
        });
        listCards.map((opt) => {
            let gpayToken = [];
            let isCardAddedToGPay = false;
            let isCardDefault = false;
            let tokenStateInt = -1;
            for (let i in gpayTokens) {
                gpayToken = gpayTokens[i];
                if (gpayToken[2] === opt.number.substring(15, 19)) {
                    isCardAddedToGPay = (gpayToken[6] === '5');
                    isCardDefault = gpayToken[7];
                    tokenStateInt = gpayToken[6];
                    break;
                }
                gpayToken = [];
            }
            resData.push(this.getGpayStatusJson(opt, isCardAddedToGPay, isCardDefault, tokenStateInt));
        });
        let payloadData = {};
        payloadData["cardDetails"] = JSON.stringify(resData);
        payloadData["chaveDeConta"] = ImportantDetails.accountKey ? ImportantDetails.accountKey : undefined;
        payloadData["chaveDeCliente"] = ImportantDetails.clientKey ? ImportantDetails.clientKey : undefined;
        payloadData["isGpayInstalled"] = androidApiCallsService.isPackageAvailable("com.google.android.apps.walletnfcrel");
        payloadData["isGpayDefaultNFC"] = androidApiCallsService.isGPayDefaultTAPApplication();
        payloadData["requestedBy"] = "1";
        this.dataSyncOperationCompleted("/GET_CARD_STATUS_IN_GPAY");
        //Log.sDebug("SEND_GPAY_METRICS gpay metrics send to backend");
        ArbiApiMetrics.sendGpayAlertMetrics("GET_CARD_STATUS_IN_GPAY", "tapAndPayClient.getTokenStatus", true, 201, payloadData, 0);
    }

    sendPixKeyStatusMetrics = (clientPixKeys) => {
        if (clientPixKeys === null || clientPixKeys === undefined) {
            return;
        }

        let payloadData = {}
        payloadData["chaveDeCliente"] = ImportantDetails.clientKey ? ImportantDetails.clientKey : undefined;

        let tempNewData = { EMAIL: [], CPF: [], EVP: [], PHONE: [] }
        for (let i = 0; i < clientPixKeys.length; i++) {
            let key = clientPixKeys[i]["key_type"];
            let value = clientPixKeys[i]["key_value"];
            tempNewData[key].push(value);
        }

        let newData = { email_pix_key: "", cpf_pix_key: "", evp_pix_key: "", mobile_pix_key: "" }
        newData["email_pix_key"] = tempNewData["EMAIL"].toString()
        newData["cpf_pix_key"] = tempNewData["CPF"].toString()
        newData["evp_pix_key"] = tempNewData["EVP"].toString()
        newData["mobile_pix_key"] = tempNewData["PHONE"].toString()

        Object.assign(payloadData, newData);

        this.dataSyncOperationCompleted("/GET_PIX_KEY_METRICS");
        Log.sDebug("SEND_PIX_KEY_METRICS pix key metrics send to backend");
        ArbiApiMetrics.sendPixKeyAlertMetrics("GET_PIX_KEY_METRICS", "pix/enderecamento/consultar-chaves", true, 201, payloadData, 0);
    }

    getGpayStatusJson = (details, isCardAddedToGPay, isCardDefault, tokenStateInt) => {
        let data = {};
        data["chaveDeCartao"] = details.cardKey;
        data["cardNetwork"] = details.brand;
        data["cardType"] = details.cardType;
        data["cardStatus"] = details.status;
        data["idStatusCartao"] = details.idStatusCartao + "";
        data["isCardAddedToGPay"] = isCardAddedToGPay + "";
        data["isCardDefault"] = isCardDefault + "";
        data["tokenStateInt"] = tokenStateInt;
        Log.sDebug("getGpayStatusJson: " + data);
        return data;
    }




}

export default new DataSyncBackendUtils();
