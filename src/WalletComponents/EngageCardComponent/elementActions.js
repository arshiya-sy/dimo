import Utils from './Utils';
import Log from "../../Services/Log";
import RateUsCard from "./RateUsCard";
import apiService from "../../Services/apiService";
import collectData from "../../Services/collectData";
import { PopupModalHocManger } from "./PopupModalHoc";
import MetricsService from "../../Services/MetricsService";
import GlobalDataStore from "../../Services/GlobalDataStore";
import GeneralUtilities from "../../Services/GeneralUtilities";
import localeListService from '../../Services/localeListService';
import androidApiCalls from "../../Services/androidApiCallsService";
import StoryModeDialog from '../EngageCardComponent/StoryModelDialog';
import ImportantDetails from '../NewLaunchComponents/ImportantDetails';
import CustomAlertDialogs from "../EngageCardComponent/CustomAlertDialogs";

function elementActions() {

  const ActionTypes = Utils.getActionTypes();
  let ratings = ['bad', 'poor', 'neutral', 'good', 'excellent'];
  var actionList = [
    /*0*/ 'None',
    /*1*/ 'Open link in engage',
    /*2*/ 'Open link in browser',
    /*3*/ 'openDialog',
    /*4*/ 'Open Tab',
    /*5*/ 'Go back',
    /*6*/ 'Open in MDA',
    /*7*/ 'Submit',
    /*8*/ 'openReels',
    /*9*/ 'openInAppRating',
    /*10*/ 'copyCode',
    /*11*/ 'showToast',
    /*12*/ 'Open an app'
  ];

  this.openLinkInBrowser = (url, extraInfoObj) => {
    androidApiCalls.openUrlInBrowser(url, extraInfoObj);
  }

  function setId(metaData, elementId, actionType) {
    elementId = elementId + '~#' + actionType + '~#' + ((androidApiCalls.page) ? androidApiCalls.page : 'cards');
    if (metaData.data.label) {
      elementId = elementId + '~#'; //+ getLabel(metaData);
    } else {
      elementId = elementId + '~#image';
    }
    return elementId;
  }

  this.performAction = function (actions, metaData, story, version, props) {
    androidApiCalls.clearFromEncryptedprefs(Utils.LOCAL_STORY_CARDS);

    let contentid = story.contentid || story.id;
    if (!version)
      version = "A";

    for (var i in actions) {
      var actionsFollowSubmit = false;
      var elementId = metaData.id + '~#' + version + '~#' + androidApiCalls.getLocale();
      var action = actions[i];
      if (Utils.isPlaceHolder(action.type) || Utils.isPlaceHolder(action.data)) {
        continue;
      }
      var index = actionList.indexOf(action.type);

      var idArray = contentid.split("~#");
      let storyStats = {
          streamtype : "Engage",
          cardTabId : androidApiCalls.getWalletTabId(),
          contentid : contentid || story.id,
          content : story.content
      }
      if (contentid.indexOf('~#dialog') === -1) {
        storyStats["index"] = parseInt(idArray[idArray.length - 1]) + 1;
        storyStats["streamId"] = story.streamId;
        storyStats["story_id"] = idArray[0];
      }
      elementId = setId(metaData, elementId, action.type);
      MetricsService.reportClickedSubmitMetrics(action.type, elementId + 'NA', contentid);
      MetricsService.reporteOperationMetrics({
        action: ActionTypes.CLICK,
        story: storyStats,
        metadata: metaData,
        actionName: action.type
      }).then(() => {});

      var url, storyid = "";
      var storyDetailsArray = [];

      switch (index) {
        case 1:
          url = action.data;
          if (action.data.indexOf('https://') === 0) {
            storyid = contentid;
            index = contentid.indexOf("~#");
            if (index !== -1) {
              storyid = contentid.substring(0, index);
            }
            androidApiCalls.persistValue("intropageCardSource_" + storyid, JSON.stringify(story));
            androidApiCalls.openInEngage(url, storyid, contentid);
          } else {
            //legacy approach needed to support ongoing stories
            props.onclickEngageCards(url);
            PopupModalHocManger.closeModal();
          }
          break;
        case 2:
          url = (action.data.indexOf('https://') === 0) ? action.data : 'https://' + action.data;
          var extraInfoObj = {
            id: contentid,
            strm_id: story.streamId,
            strm_type: story.streamtype,
            tab_name: "Wallet",
          };
          this.openLinkInBrowser(url, extraInfoObj);
          break;
        case 3:
          storyDetailsArray = contentid.split("~#");
          storyid = storyDetailsArray[0];
          version = "A";
          if (storyDetailsArray.length > 1) {
            version = storyDetailsArray[1];
          }
          var params = {
            dialogtrigger: "none",
            storyId: storyid + "_" + version
          };
          var dialogCall = apiService.getDialog(params);
          dialogCall.then(response => {
            if (response.main) {
              Log.debug('openDialog elementActions getDialog response: ' + JSON.stringify(response));

              PopupModalHocManger.openPopupModalHoc(CustomAlertDialogs, response.main, response.extra, props.onclickEngageCards);
            }
          });
          break;
        case 4:
          if (action.data.toLowerCase()==="shopping") {
            let openTab = androidApiCalls.getShoppingUrl() + action.extraData;//no need to append '/'
            window.location.replace(openTab);
          } else {
            let intent = "#Intent;launchFlags=0x10000000;component=com.motorola.ccc.notification/com.motorola.engageapp.ui.CardsActivity;S.tab_name="+ action.data + ";S.open_page=" + action.extraData +";end"
            androidApiCalls.openApp(intent);
          }
          break;
        case 5:
          //we are using this to close the MDA-dialog
          PopupModalHocManger.closeModal();
          break;
        case 6:
          ImportantDetails.setComponentEntryPoint(contentid);
          props.onclickEngageCards(action.data);
          PopupModalHocManger.closeModal();
          break;
        case 7:
          storyid = story.story_id || contentid.split("~#")[0];
          collectData.sendDataToBackend(storyid, contentid, story);
          this.openPsrating(story, storyid, contentid, actions);
          if (i < actions.length - 1) {
            /**
             * actions follow submit button
             * save action and metadata
             * mark flag and break from for loop
             **/
            let newActions = actions.slice(i + 1, actions.length);
            let saveObj = {};
            saveObj.actions = newActions;
            saveObj.metaData = metaData;
            saveObj.metaData.action = newActions;
            saveObj.version = version;
            GlobalDataStore.updateData("multiple_actions_" + storyid, saveObj);
            actionsFollowSubmit = true;
          }
          break;
        case 8:
          storyDetailsArray = contentid.split("~#");
          storyid = storyDetailsArray[0];
          version = "A";
          index = contentid.indexOf("~#");
          if (storyDetailsArray.length > 1) {
            version = storyDetailsArray[1];
          }

          var params1 = {
            storyId: storyid + "_" + version,
            barcode: androidApiCalls.getBarcode(),
            locale: androidApiCalls.getLocale(),
            deviceid: androidApiCalls.getDeviceId()
          };
          let params2 = {
            dialogtrigger: "none",
            storyId: storyid + "_" + version
          };
          var reelsCall = apiService.getReelsDom(params1);
          reelsCall.then(response => {
            if (response.data && typeof response.data == 'object' && Object.keys(response.data).length > 0) {
              PopupModalHocManger.openPopupModalHoc(StoryModeDialog, { dialogData: response.data }, { fullScreen: true }, props.onclickEngageCards);
            } else {
              var dialogCall = apiService.getDialog(params2);
              dialogCall.then(response => {
                Log.debug('openReels elementActions getDialog response: ' + JSON.stringify(response));

                if (response.main) {
                  PopupModalHocManger.openPopupModalHoc(StoryModeDialog, response.main, { fullScreen: true }, props.onclickEngageCards);
                }
              });
            }
          });
          
          break;
        case 9: 
          androidApiCalls.launchInAppReviewDialog();
          break;
        case 10:
          if (action && action.data) {
            const string = action.data;
            androidApiCalls.copyToClipBoard(string);
            let data = localeListService.getActionLocale();
            story.openSnackBar(data.code_copied);
          }
          break;
        case 11: 
          if (action && action.data) {
            const string = action.data;
            story.openSnackBar(string);
          }
          break;
        case 12: 
          androidApiCalls.openApp(action.data);
          break;
        default:
          Log.sDebug(`Action type "${action && action.type}" not supported`);
      }
      if (actionsFollowSubmit) {
        Log.sDebug("Actions follow submit will be handled after successful submit");
        break;
      }
    }
  }

  this.openPsrating = (story, storyid, contentid, actions) => {
    try {
      let smileyMeterPresent = this.doesStoryHaveSmileyMeter(story);
      const { openPs, openPsThreshold, showDialog, elemId } = actions[0];

      if (smileyMeterPresent && openPs && openPsThreshold) {
        try {
          var surveyPayload = collectData.generateSurveyPayload(storyid, contentid, story);
          if (surveyPayload && surveyPayload.answers) {

            for (let i in surveyPayload.answers) {
              let answer = surveyPayload.answers[i];
              if (answer.surveyType === "smiley" || answer.surveyType === "smiley-meter-mini") {
                if (answer.answer && answer.answer[0]) {
                  if (ratings.indexOf(answer.answer[0]) >= ratings.indexOf(openPsThreshold.toLowerCase())) {
                    let openPsElemId = "open_ps" + elemId;
                    if (androidApiCalls.getValue(openPsElemId) !== "true") {
                      if (showDialog) {
                        let configData = {
                          openPsThreshold: openPsThreshold,
                          storyid: storyid,
                          contentid: contentid,
                          answer: answer.answer[0],
                          elemId: openPsElemId
                        }

                        PopupModalHocManger.openPopupModalHoc(RateUsCard, { configData }, { animation: "blow-in-popup 0.3s forwards" });
                      } else {
                        const deviceInformationObj = GeneralUtilities.getDeviceInformationObject();
                        deviceInformationObj &&
                        androidApiCalls.openApp(`market://details?id=${deviceInformationObj.pkgName}`, false);
                        androidApiCalls.persistValue(openPsElemId, true);
                        let eventObj = {
                          src: "direct",
                          answer: answer.answer[0],
                          elem_id: openPsElemId,
                          story_id: storyid,
                          content_id: contentid,
                          open_ps_threshold: openPsThreshold
                        };
                        Utils.reportMetrics("ps_rating", "open_ps", eventObj);
                      }
                    }
                    return;
                  }
                }
              }
            }
          }
        } catch (error) {
          Log.sDebug("Error inside openPsrating internal catch: " + error.message, this.componentName);
        }
      }
    } catch (error) {
      Log.sDebug("Error inside openPsrating: " + error.message, this.componentName);
    }
  }

  this.doesStoryHaveSmileyMeter = (story) => {
    try {
      if (story && story.dom && story.dom.domJson) {
        let { domJson } = story.dom;
        for (let i in domJson) {
          if (domJson[i]['button-type'] === "smiley-meter" || domJson[i]['button-type'] === "smiley-meter-mini") {
            return true;
          }
        }
      }
    } catch (err) {
      return false;
    }
  }
}

export default new elementActions()
