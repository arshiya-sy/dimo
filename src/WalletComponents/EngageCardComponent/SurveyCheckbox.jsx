import React from 'react';
import PropTypes from 'prop-types';

import Log from '../../Services/Log';
import Utils from '../EngageCardComponent/Utils';
import collectData from '../../Services/collectData';
import elementActions from '../EngageCardComponent/elementActions';

import '../../styles/main.css';
import '../../styles/surveyStyles.css';
class SurveyCheckbox extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selectedIndices: [] };
        this.cardId = props.story.contentid || props.story.id;
        this.metadataId = props.metadata.id;

        /** Initialize the Survey data and record default response */
        const jsonObj = {};
        jsonObj.surveyType = "checkBox";
        jsonObj.answer = [];
        jsonObj.question_id = this.props.metadata.id;
        jsonObj.survey_version = this.props.story.dom.survey_version;
        collectData.addSurveyData(this.cardId + jsonObj.question_id, jsonObj);
        //first answer
        collectData.updateAnswer(this.cardId + this.metadataId, null, "checkbox");

        this.localStyle = {
            chipStyle: {
                width: "inherit",
                margin: "0px",
                background: "#e0e0e0",
                display: "flex",
                // borderRadius: "35px",`
                color: "#0194BA",
                overflow: "hidden",
                height: "100%",
                flex: "1 1 0%",
                padding: "10px",
                minHeight: "8px"
            }
        }

        this.componentName = "SurveyCheckbox";
    }

    handleChange = (event, index) => {
        let { metadata } = this.props;
        let { selectedIndices } = this.state;
        let indexOf = selectedIndices.indexOf(index);
        let value = [];
        try {
            if (indexOf === -1) {
                selectedIndices.push(index);
            } else {
                selectedIndices.splice(indexOf, 1);
            }

            this.setState({ selectedIndices });

            selectedIndices.map(index => {
                let temp = {};
                temp[index] = metadata.data.text[index]
                value.push(temp);
                return index;
            });

            collectData.updateAnswer(this.cardId + this.metadataId, value, "checkbox");

            if (metadata && metadata.data && metadata.data.submitOnSelect) {
                metadata.action[0].type = "Submit";
                elementActions.performAction(this.props.metadata.action, this.props.metadata, this.props.story, "")
            }
        } catch (error) {
            Log.sDebug("Error inside handleChange: " + error.message, this.componentName);
        }
    };

    render() {
        let { metadata, style, story } = this.props;
        let { selectedIndices } = this.state;
        let data = metadata.data;
        let styleobj = Utils.parseStyle(style);
        if (story.id.indexOf('cards') === -1) {
            styleobj = Utils.getScaledStyle(styleobj, story);
        }
        let fontScale = (styleobj.scalefactor) ? styleobj.scalefactor : 1;

        const listItems = data.text.map((item, index) => {
            return (
                <div onClick={(e) => this.handleChange(e, index)} key={index}
                     className="hy-checkbox-contaner feedback-checkbox survey-Checkbox"
                     style={{
                         ...this.localStyle.chipStyle,
                         color: data.color,
                         background: data.background,
                         padding: "0px"
                     }}>
                    <input key={Math.random()} type="checkbox" id="checkbox" name="privacy" className="feedback-checkbx"
                           checked={selectedIndices.includes(index)}
                           onChange={() => {}}/>
                    <label htmlFor="privacy" style={{marginLeft: 1 * fontScale + "px", alignItems: "center"}}>
                        <span className='hy-checkbox-label-text' style={{
                            textAlign: "justify",
                            textOverflow: "ellipsis",
                            fontSize: parseFloat(data["Font size"]) * fontScale + "px",
                            paddingLeft: 12 * fontScale + "px"
                        }}>{item}</span>
                    </label>
                </div>
            );
        });

        return (
            <div style={styleobj}>
                <div style={{ display: "flex", flexDirection: data.layout, width: "100%", height: "100%", justifyContent: "space-evenly", gap: "5px" }}>
                    {listItems}
                </div>
            </div>
        );
    }
}

SurveyCheckbox.propTypes = {
    story: PropTypes.object,
    style: PropTypes.string,
    metadata: PropTypes.object,
};

export default SurveyCheckbox;
