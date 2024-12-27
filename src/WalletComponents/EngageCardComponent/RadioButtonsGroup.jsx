import React from 'react';
import PropTypes from 'prop-types';

import elementActions from "./elementActions";
import Utils from '../EngageCardComponent/Utils';
import collectData from '../../Services/collectData';

import '../../styles/main.css';

class RadioButtonsGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "", scale: 1 };
    this.cardId = props.story.contentid || props.story.id;
    this.metadataId = props.metadata.id;
    this.radioButtonContainer = React.createRef();

    /** Initialize the Survey data and record default response */
    var jsonObj = {};
    jsonObj.surveyType = "radio";
    jsonObj.answer = [];
    jsonObj.question_id = this.props.metadata.id;
    jsonObj.survey_version = this.props.story.dom.survey_version;
    collectData.addSurveyData(this.cardId + jsonObj.question_id, jsonObj);
    //first answer
    collectData.updateAnswer(this.cardId + this.metadataId, null, "single");
  }

  componentDidMount = () => {
    let container = this.radioButtonContainer.current;
    if (container.style.flexDirection === 'row' && container.clientWidth < container.scrollWidth) {
      let scalediff = container.clientWidth / container.scrollWidth;
      //Scalling down the size of radio buttons to fit in row. But restricting to .85 to avoid text looking very small;
      if (scalediff < 1 && scalediff > .85) {
        this.setState({ scale: scalediff });
      }
    }
  }

  handleChange = (event, metadata) => {
    this.setState({ value: event.target.value });
    let value = event.target.value;
    let answer = {};
    if (metadata.data.text.includes(value)) {
      answer[0] = value;
    }
    collectData.updateAnswer(this.cardId + this.metadataId, answer, "single");

    if (metadata && metadata.data) {
      metadata.action[0].type = "Submit";
      elementActions.performAction(metadata.action, metadata, this.props.story, "");
    }
  };

  render() {
    let { metadata, style, story } = this.props;
    let elementId = metadata.id;
    let data = metadata.data;
    let styleObj = Utils.parseStyle(style);
    if (story.id.indexOf('cards') === -1) {
      styleObj = Utils.getScaledStyle(styleObj, story);
    }
    let scale = (styleObj.scalefactor) ? styleObj.scalefactor : 1;

    return (
        <div style={styleObj}>
          <form style={{ width: "100%", height: "100%" }}>
            <div ref={this.radioButtonContainer} style={{ transform: `scale(${this.state.scale})`, transformOrigin: 'left', width: "100%", height: "100%", display: "flex", flexDirection: data.layout || "row" }}>
              {data.text.map((item, index) => {
                return (
                    <div key={index} className="report-reason-item" style={{ "--survey-radiobtn-color": "#CBC0EA", minHeight: "25px", flex: "1 1 0", marginLeft: '5px', marginRight: '10px' }}>
                      <input type="radio" id={`report-${this.cardId}-${item}-${elementId}`} onChange={(e) => this.handleChange(e, this.props.metadata)} value={item} name="radio-group" />
                      <label htmlFor={`report-${this.cardId}-${item}-${elementId}`} style={{
                        color: data.color,
                        marginLeft: "2rem",
                        fontSize: parseFloat(data["Font size"]) * scale + "px",
                      }}>{item}</label>
                    </div>
                )
              })}
            </div>
          </form>
        </div >
    );
  }
}

RadioButtonsGroup.propTypes = {
  story: PropTypes.object,
  style: PropTypes.string,
  classes: PropTypes.object,
  metadata: PropTypes.object,
};

export default RadioButtonsGroup;
