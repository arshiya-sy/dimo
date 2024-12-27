import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Log from "../../Services/Log";
import elementActions from './elementActions';
import Utils from '../EngageCardComponent/Utils';
import collectData from '../../Services/collectData';
import constantObjects from '../../Services/Constants';

import '../../styles/main.css';
import '../../styles/surveyStyles.css';

const styles = theme => ({
    root: {
        display: 'flex',
    },
    formControl: {
        margin: 0
    },
    grouprow: {
        margin: `${theme.spacing.unit}px 0`,
        textAlign: `-webkit-auto`,
        flexWrap: 'nowrap',
        flexDirection: `row`
    },
    groupcolumn: {
        margin: `${theme.spacing.unit}px 0`,
        paddingTop: `10px`,
        textAlign: `-webkit-auto`,
        flexWrap: 'nowrap',
        flexDirection: `column`
    },
});

const componentLog = "MaterialButtonChips";

class MaterialButtonChips extends React.Component {
    constructor(props) {
        super(props);
        this.state = { value: null };
        this.cardId = props.story.contentid || props.story.id;
        this.metadataId = props.metadata.id;

        /** Initialize the Survey data and record default response */
        var jsonObj = {};
        jsonObj.surveyType = "radio";
        jsonObj.answer = [];
        jsonObj.question_id = this.props.metadata.id;
        jsonObj.survey_version = this.props.story.dom.survey_version;
        collectData.addSurveyData(this.cardId + jsonObj.question_id, jsonObj);
        //first answer
        collectData.updateAnswer(this.cardId + this.metadataId, this.state.value, "single");

        this.localStyle = {
            chipStyle: {
                background: "#e0e0e0",
                display: "flex",
                borderRadius: "35px",
                color: "#0194BA",
                flex: "1 1 0",
                width: "inherit",
                overflow: "hidden",
                margin: "0px",
                height: "inherit",
                padding: "0px",
                alignItems: "center",
                minHeight: "8px",
                justifyContent: "flex-start"
            }
        }

    }

    handleChange = (event, index) => {
        let { metadata } = this.props;

        try {
            this.setState({ value: index });
            let val = {};
            val[index] = metadata.data.text[index];
            collectData.updateAnswer(this.cardId + this.metadataId, val, "single");

            if (metadata && metadata.data) {
                metadata.action[0].type = "Submit";
                elementActions.performAction(this.props.metadata.action, this.props.metadata, this.props.story, "");
            }
        } catch (error) {
            Log.sDebug(error, componentLog, constantObjects.LOG_PROD);
        }
    };

    render() {
        let { metadata, style, story } = this.props;
        let { value } = this.state;
        let data = metadata.data;
        let styleobj = Utils.parseStyle(style);
        if (story.id.indexOf('cards') === -1) {
            styleobj = Utils.getScaledStyle(styleobj, story);
        }
        let fontScale = (styleobj.scalefactor) ? styleobj.scalefactor : 1;
        let fontSizePx = parseFloat(data["Font size"]) * fontScale + "px";

        var listItems = data.text.map((item, index) => {
            return (
                <div onClick={(e) => this.handleChange(e, index)} key={index}
                     style={{
                        ...this.localStyle.chipStyle,
                        color: data.color,
                        background: value === index ? data.onSelectColor : data.background,
                        border: value === index ? `2px solid ${data.onSelectColor}` : "2px solid rgb(79, 97, 117)"
                }}>
                    <span style={{ color: value === index ? "#001D38" : "#aaafbc" , textAlign: "center",minWidth: "50px"}} className="material-icons-outlined">{data.icons && data.icons[index]}</span>
                    <div style={{ fontSize: fontSizePx, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", color: value === index ? "#001D38" : "#FFFFFF" }}>{item}</div>
                </div>
            );
        });


        return (
            <div style={styleobj}>
                <div style={{ display: "flex", flexDirection: data.layout, height: "100%", width: "100%", gap: "5px" }}>
                    {listItems}
                </div>
            </div>
        );
    }
}

MaterialButtonChips.propTypes = {
    story: PropTypes.object,
    style: PropTypes.string,
    metadata: PropTypes.object,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MaterialButtonChips);
