import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ReactSVG } from 'react-svg';

import elementActions from "./elementActions";
import Utils from '../EngageCardComponent/Utils';
import collectData from '../../Services/collectData';
import badSvg from '../../images/rating_icons/bad_rating.svg';
import GeneralUtilities from "../../Services/GeneralUtilities";
import goodSvg from '../../images/rating_icons/good_rating.svg';
import poorSvg from '../../images/rating_icons/poor_rating.svg';
import neutralSvg from '../../images/rating_icons/neutral_rating.svg';
import excellentSvg from '../../images/rating_icons/excellent_rating.svg';

import '../../styles/main.css';
import Log from '../../Services/Log';

const allRatings = [
  {
    value: 'poor',
    imgsrc: poorSvg,
  }, {
    value: 'bad',
    imgsrc: badSvg,
  }, {
    value: 'neutral',
    imgsrc: neutralSvg,
  }, {
    value: 'good',
    imgsrc: goodSvg,
  }, {
    value: 'excellent',
    imgsrc: excellentSvg,
  }
];

const allRatingsMini = [
  {
    value: 'poor',
    imgsrc: poorSvg,
  },
  {
    value: 'excellent',
    imgsrc: excellentSvg,
  }
]

const selectedColor = "#CBC0EA";
const unselectedColor = { icon: "#4F6175", text: "var(--font-color)" };

class SmileyMeterComponent extends Component {
  constructor(props) {
    super(props);
    this.cardId = props.story.contentid || props.story.id;
    this.metadataId = props.metadata.id;
    this.isMini = this.props.elemType === 'smiley-meter-mini';

    this.state = {
      selectedRating: "excellent",
      moreInfo: [],
      moreInfofeedback: [],
      moreInfoOptionsfeedback: [],
      prevSelectedIcon: []
    }
    this.init();

    /** Initialize the Survey data and record default response */
    const jsonObj = {};
    jsonObj.surveyType = "smiley";
    jsonObj.answer = [];
    jsonObj.question_id = this.props.metadata.id;
    jsonObj.survey_version = this.props.story.dom.survey_version;

    collectData.addSurveyData(this.cardId + jsonObj.question_id, jsonObj);
    collectData.updateAnswer(this.cardId + this.metadataId, this.state.selectedRating, "smiley");

    this.componentName = "SmileyMeterComponent";
  }

  init = () => {
    const description = this.props.metadata.data.description;
    let moreInfo1 = [];
    for (const k in description) {
      try {
        if (Object.prototype.hasOwnProperty.call(description, k)) {
          const str = description[k];
          let str_array = str.split(",").map(function (item) {
            return item.trim();
          });
          if (str.trim().length === 0) {
            str_array = [];
          }
          moreInfo1[k] = str_array;
        }
      } catch (error) {
        Log.sDebug(`Error inside init hasOwnProperty ${k}: ${error.message}`, this.componentName);
      }

    }
    this.setState({ moreInfo: moreInfo1 });
  }

  handleClick = (e, opt,) => {
    let { metadata } = this.props;
    if (GeneralUtilities.isNotEmpty(this.state.prevSelectedIcon, false)) {
      this.setState(prevState => ({
        prevSelectedIcon: {
          ...prevState.prevSelectedIcon,
          style: { ...prevState.prevSelectedIcon.style, color: unselectedColor['icon'] }
        }
      }));
    }

    e.currentTarget.style.color = selectedColor;
    this.setState({
      selectedRating: opt.value,
      moreInfofeedback: [],
      moreInfoOptionsfeedback: [],
      prevSelectedIcon: e.currentTarget
    });

    collectData.updateAnswer(this.cardId + this.metadataId, opt.value, "smiley");

    if (metadata && metadata.data) {
      metadata.action[0].type = "Submit";
      elementActions.performAction(metadata.action, metadata, this.props.story, "")
    }
  }

  handleTextClick = (rating, x, optId) => {
    const optionId = optId;
    const index = this.state.moreInfofeedback.indexOf(x);
    let moreInfofeedbackArr = this.state.moreInfofeedback;
    let moreInfoOptionsfeedbackArr = this.state.moreInfoOptionsfeedback;

    if (index > -1) {
      moreInfofeedbackArr.splice(index, 1);
      moreInfoOptionsfeedbackArr.splice(index, 1);
      this.setState({
        moreInfofeedback: moreInfofeedbackArr,
        moreInfoOptionsfeedback: moreInfoOptionsfeedbackArr,
      });
    } else {
      moreInfofeedbackArr.push(x);
      moreInfoOptionsfeedbackArr.push(optionId);
      this.setState({
        moreInfofeedback: moreInfofeedbackArr,
        moreInfoOptionsfeedback: moreInfoOptionsfeedbackArr,
      });
    }
    collectData.updateAnswer(this.cardId + this.metadataId, this.state.selectedRating, "smiley", this.state.moreInfofeedback);
  }

  disableDblClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  }

  getOptionsStyle = (opt) => {
    let selectColor = this.state.moreInfofeedback.indexOf(opt) > -1;
    return {
      width: 'auto', padding: '8px', margin: '2%', borderRadius: '50px', border: '2px solid #4F6175', fontSize: '14px',
      backgroundColor: selectColor ? selectedColor : unselectedColor['background'],
      color: selectColor ? "white" : unselectedColor['text']
    };
  }

  render() {
    let { style, story } = this.props;
    let styleobj = Utils.parseStyle(style);
    if (story.id.indexOf('cards') === -1) {
      styleobj = Utils.getScaledStyle(styleobj, story);
    }
    const currentState = this.state;

    return (
      <div style={styleobj}>
        <div className="emotDiv">
          {!this.isMini && allRatings.map((opt, key) => (
            <ReactSVG key={key} className="svgDiv" style={{ color: "#4F6175" }} onClick={(e) => this.handleClick(e, opt, key)}
              onDoubleClick={(e) => this.disableDblClick(e)} src={opt.imgsrc} />
          ))
          }
          {this.isMini && allRatingsMini.map((opt, key) => (
            <ReactSVG key={key} className="svgDiv" style={{ color: "#4F6175" }} onClick={(e) => this.handleClick(e, opt, key)}
              onDoubleClick={(e) => this.disableDblClick(e)} src={opt.imgsrc}
            />
          ))
          }
        </div>

        <div className="optionDiv">
          {currentState.selectedRating && currentState.moreInfo[currentState.selectedRating] &&
            currentState.moreInfo[currentState.selectedRating].map((opt, key) => (
              <div key={key} style={this.getOptionsStyle(opt)} onClick={() => this.handleTextClick(currentState.selectedRating, opt, key)}>
                {opt}
              </div>))}
        </div>
      </div>
    );
  }
}

SmileyMeterComponent.propTypes = {
  story: PropTypes.object,
  style: PropTypes.string,
  classes: PropTypes.object,
  metadata: PropTypes.object,
  elemType: PropTypes.string,
};

export default SmileyMeterComponent;
