import Globals from "./Config/config";
import httpRequest from "./httpRequest";
import localeService from '../Services/localeListService';
import Utils from "../WalletComponents/EngageCardComponent/Utils";
import GlobalDataStore from "./GlobalDataStore";
import DBService from "./DBService";
import { PopupModalHocManger } from "../WalletComponents/EngageCardComponent/PopupModalHoc";
import NewUtilities from "./NewUtilities";
import Log from "./Log";

function collectData() {
    var androidApiCalls = require('../Services/androidApiCallsService');

    var userEnteredData = {};
    this.surveyData = [];
    this.addSurveyData = function (key, value) {
        this.surveyData[key] = value;
    }

    this.updateUserEnteredData = function (key, value) {
        userEnteredData[key] = value;
    }

    this.updateAnswer = function (key, value, answerType, extra) {
        //Single Value answer supported so far
        if (answerType === 'single') {
            this.surveyData[key].answer = [];
            if (value) {
                this.surveyData[key].answer.push(value);
            }
        } else if (answerType === 'freeflow') {
            this.surveyData[key].answer = [];
            this.surveyData[key].freetext = [];
            this.surveyData[key].freetext.push(value);
            this.surveyData[key].doSubmit = !this.surveyData[key].requiredField || (value.trim().length !== 0);
        } else if (answerType === 'smiley') {
            this.surveyData[key].answer = [];
            this.surveyData[key].extra = [];
            this.surveyData[key].answer.push(value);
            this.surveyData[key].extra = extra;
        } else if (answerType === "checkbox") {
            this.surveyData[key].answer = [];
            if (value && value.length !== 0) {
                this.surveyData[key].answer.push(value);
            }
        }
    }

    this.sendDataToBackend = function (storyId, cardId, story) {
        let localeObj = localeService.getActionLocale();
        try {
            const surveyPayload = this.generateSurveyPayload(storyId, cardId, story);
            let url = Globals.getEngage("survey");
            let params = { storyId: storyId };
            if (surveyPayload && surveyPayload.unAnsweredQn) {
                return;
            } else if (!surveyPayload) {
                story.openSnackBar(localeObj.required_survey_field);
                return;
            }
            httpRequest.postRequest(url, surveyPayload, "application/json", "engage", params)
                .then(() => {
                    androidApiCalls.persistValue("survey_card_answered", storyId);
                    story.openSnackBar(localeObj.thankyou_submit);

                    /*
                     Delete story card functionality:
                     store inside Deleted card cache
                     */
                    try {
                        DBService.setDeletedCard(cardId);
                        if (cardId.indexOf('cards') !== -1) {
                            story.removeStoryFromCards && story.removeStoryFromCards(cardId);
                        } else if (cardId.indexOf('dialog') !== -1) {
                            PopupModalHocManger.closeModal();
                        }
                    } catch (_) {
                        return;
                    }

                    try {
                        let actionElement = GlobalDataStore.getData("multiple_actions_" + storyId).newData;
                        if (actionElement) {
                            Utils.performAction(actionElement.actions, actionElement.metaData, story, actionElement.version, this.props);
                        }
                    } catch (error) {
                        return;
                    }
                }, (error) => {
                    Log.sDebug("Error is:" ,error);
                    story.openSnackBar(localeObj.tryAgainLater);
                });
        } catch (err) {
            story.openSnackBar(localeObj.tryAgainLater);
        }
    }

    this.generateSurveyPayload = function (storyId, cardid, story = {}) {
        var surveyResponse = {};
        surveyResponse.survey_id = storyId;
        surveyResponse.story_id = storyId;
        surveyResponse.barcode = androidApiCalls.getBarcode();
        surveyResponse.deviceid = androidApiCalls.getDeviceId();
        surveyResponse.anonymizedSerialNumber = NewUtilities.getMetadataForDeviceType();
        androidApiCalls.setVersionDetails(cardid);
        surveyResponse.story_version = androidApiCalls.getVersion(cardid) || "";
        surveyResponse.locale = androidApiCalls.getLocale();
        var timeNow = new Date();
        surveyResponse.dts = timeNow.getTime();
        surveyResponse.dtz = timeNow.getTimezoneOffset() * -1;

        var answers = [];
        for (var key in this.surveyData) {
            if (Object.prototype.hasOwnProperty.call(this.surveyData, key)) {
                if ((key.indexOf(cardid + "button") !== -1) || (key.indexOf(cardid + "qna") !== -1)) {
                    if (this.surveyData[key].doSubmit === false) return null;
                    answers.push(this.surveyData[key]);
                }
            }
        }

        surveyResponse.answers = answers;
        surveyResponse.unAnsweredQn = this.checkForEmptyAnswer(answers, story);
        surveyResponse.survey_version = answers[0].survey_version;
        return surveyResponse;
    }

    this.checkForEmptyAnswer = (answers, story = {}) => {
        let unAnsweredQn = false;
        let data = localeService.getActionLocale();
        for (let index = 0; index < answers.length; index++) {
            if (answers[index].surveyType !== "freeflow") {
                if (answers[index].answer && answers[index].answer.length < 1) {
                    unAnsweredQn = true;
                    story.openSnackBar(data.answer_all_qn);
                    break;
                }
            } else {
                if (answers[index].requiredField && answers[index].freetext && answers[index].freetext.length < 1) {
                    unAnsweredQn = true;
                    story.openSnackBar(data.answer_all_qn);
                    break;
                }
            }
        }
        return unAnsweredQn;
    }

    this.getCardId = function (elemId) {
        if (elemId) {
            return elemId.substring(0, elemId.indexOf('~#domJson'));
        }
        return null;
    }
}

export default new collectData()
