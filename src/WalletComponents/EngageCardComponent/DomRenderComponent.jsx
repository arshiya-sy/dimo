import React from "react";
import PropTypes from 'prop-types';

import Log from "../../Services/Log";
import CountDownTimer from "./CountDownTimer";
import SurveyCheckbox from "./SurveyCheckbox";
import { PopupModalHocManger } from "./PopupModalHoc";
import constantObjects from "../../Services/Constants";
import MaterialButtonChips from "./MaterialButtonChips";
import LabelComp from "../EngageCardComponent/LabelComp";
import ImageComp from "../EngageCardComponent/ImageComp";
import SmileyMeterComponent from "./SmileyMeterComponent";
import RectButton from "../EngageCardComponent/RectButton";
import MetricServices from "../../Services/MetricsService";
import RadioButtonsGroup from "../EngageCardComponent/RadioButtonsGroup";

import "../../styles/main.css";

const elemMap = {
  "en-label": <LabelComp />,
  "en-label-new": <LabelComp />,
  "en-img": <ImageComp />,
  "rect-button": <RectButton />,
  "material-radio-button": <MaterialButtonChips />,
  "radio-button": <RadioButtonsGroup />,
  "smiley-meter": <SmileyMeterComponent />,
  "smiley-meter-mini": <SmileyMeterComponent />,
  "survey-checkbox": <SurveyCheckbox />,
  "countdown-timer": <CountDownTimer />,
};

export default class DomRenderComponent extends React.PureComponent {
  constructor(props) {
    super(props);

    this.componentName = "BannerCards";
    this.state = {
      elementError: 0,
    };
  }

  onElementError = () => {
    this.setState({
      elementError: this.state.elementError + 1,
    });
  }

  closeRemoveDom = (story) => {
    const {id} = story;
    if (id.indexOf('cards') !== -1) {
      story.removeStoryFromCards && story.removeStoryFromCards(id);
    } else if (id.indexOf('dialog') !== -1) {
      PopupModalHocManger.closeModal();
    }
  }

  render() {
    const onclickEngageCards = (action) => {
      this.props.onclickEngageCards(action)
    }

    var storyObj = {...this.props.storydom, index: this.props.index};
    let { parentsize } = storyObj.dom;
    let containerStyle = {
      backgroundColor: parentsize.backgroundcolor || 'transparent',
      display: parentsize.display || "",
      justifyContent: parentsize.justifyContent || "",
      flexDirection: parentsize.flexDirection || "",
      textAlign: "-webkit-center",
      maxWidth: "100%",
      borderRadius: ".5rem",
    };
    let elem;
    try {
      elem = new DynamicElements(storyObj.dom.domJson, storyObj, this.onElementError, onclickEngageCards).getDomElements();
    } catch (err) {
      Log.sDebug("Error while rendering the card " + err, this.componentName, constantObjects.LOG_PROD);
    }

    if (elem && elem.length === 0) {
      Log.sDebug("There are no element to render check DomJson", this.componentName);
      this.closeRemoveDom(this.props.storydom);
      return <div></div>;
    }

    MetricServices.reportDomRenderEOperationViewMetrics({props: this.props});

    return (
      <div id={storyObj.story_id} className="engageCards">
        <div className="webPageContainer" style={containerStyle} >
          {elem}
        </div>
      </div>
    );
  }
}

export class DynamicElements {
  constructor(domJSON, story, elementError, onclickEngageCards) {
    this.domJSON = domJSON;
    this.story = story;
    if (!this.domJSON) {
        Log.sDebug("No domJSON available in DomRenderComponent", this.componentName);
      throw 'No domJSON available';
    }
    if (!this.story) {
        Log.sDebug("No story object available in DomRenderComponent", this.componentName);
      throw 'No story object available';
    }
    this.onErrorCallback = elementError;
    this.onclickEngageCards = onclickEngageCards
  }

  onElementError = (key) => {
    if (this.domJSON[key]) {
      this.domJSON[key].deleted = true;
    }
    try {
      this.onErrorCallback();
    } catch (err) {
      Log.sDebug("onElementError in DomRenderComponent " + err, this.componentName, constantObjects.LOG_PROD);
    }
  }

  createElemNew = (dom, key) => {
    let elemType = (dom.domtype === 'en-button') ? dom['button-type'] : dom.domtype;
    if (!elemMap[elemType]) return;
    return React.cloneElement(elemMap[elemType], {
      metadata: dom.metadata,
      style: dom.style,
      elemType: elemType,
      imgType: dom.imgType,
      action:dom.metadata.action,
      onclickEngageCards: this.onclickEngageCards,
      onError: () => {
        try {
          this.onElementError(key);
        } catch (err) {
          Log.sDebug("onError in DomRenderComponent " + err, this.componentName, constantObjects.LOG_PROD);
        }
      },
      story: this.story,
      key: key
    });
  };

  getDomElements = () => {
    let domJSON = this.domJSON;
    let elem = [];
    for (let key in domJSON) {
      let dom = domJSON[key];
      if (dom.deleted === true) continue;
      elem.push(this.createElemNew(dom, key));
    }
    return elem;
  }
}

DomRenderComponent.propTypes = {
  index: PropTypes.number,
  storydom: PropTypes.object,
  onclickEngageCards: PropTypes.func,
};
