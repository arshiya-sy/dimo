import ImportantDetails from "../WalletComponents/NewLaunchComponents/ImportantDetails";
import ArbiApiService from "./ArbiApiService";
import ArbiResponseHandler from "./ArbiResponseHandler";
import constantObjects from "./Constants";
import Log from "./Log";

function OcrProperties() {

    this.className = "OcrProperties";
    this.keysToExtract = ["rg","rgIssuingAuthority","rgIssueState","rgIssueDate","cnhIssueDate", "name","fatherName","motherName","birthDate"];
    this.ocrResponsePromiseArray = {};

    this.readOcr = function(pageName = "") {
        let typeOfDoc = ImportantDetails.uploadDocType ? ImportantDetails.uploadDocType : constantObjects.DOC_TYPE.RG;
        this.ocrResponsePromiseArray[typeOfDoc] = new Promise((resolve, reject) => {
            ArbiApiService.extractOcrFromDoc(typeOfDoc, pageName).then((response) => {
                if (response.success) {
                    let repsonseHandler = ArbiResponseHandler.processOcrResponse(response.result);
                    if (repsonseHandler.success) {
                        let data = repsonseHandler.payload;
                        let returnableData = {};
                        for (const key in data) {
                            if (Object.hasOwnProperty.call(data, key) && this.keysToExtract.indexOf(key) !== -1) {
                                const value = data[key];
                                returnableData[key] = value;
                                resolve(returnableData);
                            }
                        }
                        Log.verbose("Extracted ocr " + JSON.stringify(returnableData));
                    } else {
                        reject("failed");
                    }
                } else {
                    reject("failed");
                }
            });
        })
    }

    this.getOcrPoperties = function() {
        let typeOfDoc = ImportantDetails.uploadDocType ? ImportantDetails.uploadDocType : constantObjects.DOC_TYPE.RG;
        if (this.ocrResponsePromiseArray[typeOfDoc]) {
            return this.ocrResponsePromiseArray[typeOfDoc];
        } else {
            return new Promise((resolve, reject) => {
                reject("ocr api hasnt been called");
            })
        }
    }

    this.isOcrAlreadyInitated = function() {
        let typeOfDoc = ImportantDetails.uploadDocType ? ImportantDetails.uploadDocType : constantObjects.DOC_TYPE.RG;
        return this.ocrResponsePromiseArray[typeOfDoc] ? true : false
    }


}

export default new OcrProperties();