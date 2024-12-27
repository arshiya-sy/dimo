import Log from "../Services/Log";

export default class Story {
  constructor(storyObj, streamId, template, storyId, index, cardTabId, showSnackBar) {
    storyObj = storyObj || {};
    Log.sDebug("storyObj: " + JSON.stringify(storyObj), "Story Copmonent");
    this.index = index;
    this.story_id = storyId;
    this.story_type = storyObj.story_type;
    this.contentid = storyObj.id;
    this.hasliked = storyObj.hasliked;
    if (storyObj.highlighter) {
      this.highlighter = storyObj.highlighter;

    }
    this.hasheart = storyObj.hasheart;
    this.cardTabId = cardTabId || "";
    this.showSnackBar = showSnackBar;
    this.audiourls = storyObj.audiourls || [];
    this.streamId = storyObj.streamId || streamId;
    if (this.story_id || this.contentid.indexOf("~#reels") !== -1 || this.contentid.indexOf("~#dialog") !== -1 || this.contentid.indexOf("~#storydom") !== -1) {
      this.streamtype = "Engage";
    } else {
      this.streamtype =
        storyObj.streamtype;
    }

    if (!this.streamId && this.streamtype === "Engage") {
      this.streamId = "Engage";
    }

    this.content = storyObj.content;
    this.extrainfo = storyObj.extrainfo;
    this.survey = storyObj.survey;
    this.advt = storyObj.advt;
    this.dom = storyObj.dom;
    this.audio_duration = storyObj.extrainfo && storyObj.extrainfo.map ? storyObj.extrainfo.map.audioDurationSec : ''
    this.locale = storyObj.locale ? storyObj.locale[0] : "default";
    if (storyObj.str && storyObj.str.dom && storyObj.str.undo) {
      this.dom = storyObj.str.dom;
    }
    else {
      this.dom = storyObj.dom;
    }

    this.cardIndex = "0"; //Indicating the data[].length is 1
    //(based on props and indexing done in cardCarousel component where new Story() is constructed)
    if (typeof this.index === "string" && this.index.indexOf(".") > -1) {
      this.cardIndex = this.index.split(".")[1]; //Here we obtain the exact index of the card within data[] of every element of dom response.(needed for ordering in stacked layout)
    }

    if (!this.dom) {
      if (this.content && this.content.source === "taboola_promoted") {
        template = "advt";
        this.streamtype = "Advertisements";
      } else if (!template && this.content && this.content.cta && this.content.cta.hasVideo) {
        template = "default";
      }
      this.generateDom(template, this.cardIndex);
    }

    this.internal = storyObj.internal || {};
    this.hidden = storyObj.hidden || false;
  }
}
    

