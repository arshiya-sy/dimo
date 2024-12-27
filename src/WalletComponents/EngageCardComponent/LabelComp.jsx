import React from 'react';
import PropTypes from 'prop-types';

import ReactHtmlParser from 'react-html-parser';

import Log from '../../Services/Log';
import Utils from '../EngageCardComponent/Utils';
import elementActions from '../EngageCardComponent/elementActions';
import ClickWithTimeOut from "../EngageCardComponent/ClickWithTimeOut";

import '../../styles/main.css';

const TimeOutDiv = ClickWithTimeOut('div');
const styles = {
  readMoreBtnStyle: {
    marginBottom: '27%',
    fontSize: '12px',
    color: "white",
    background: "rgb(0, 0, 0, .4)",
    padding: "4px 8px",
    position: "relative",
    borderRadius: "14px",
    width: "max-content",
    display: "inline-block",
    verticalAlign: "4px"
  },
  readMoreIconStyle: {
    // marginBottom: '27%',
    fontSize: '12px',
    marginLeft: "6px",
    position: "relative",
    top: "2px",
  }
}

export default class LabelComp extends React.Component {
  constructor(props) {
    super(props);

    this.componentName = "LabelComp";
  }

  isPlaceHolder = (str) => {
    let placeHolderRegex = Utils.getRegex();
    let res = placeHolderRegex.test(str);
    return res;
  }

  shouldComponentUpdate = () => {
    return false;
  }

  parsePercentage = (val) => {
    val = val || "";
    let num = parseInt(val.split('%')[0] || 0);
    return num;
  }

  shrinkStringByLimit = (str, len) => {
    this.getStringNodes(str, (node, index) => {
      let item = node[index];
      if (len < 0) {
        node[index] = '';
      }
      node[index] = Utils.shrinkStringByLimit(item, len);
      len -= item.length;
    });
  }


  //Added null check here because Node is output of ReactHtmlParser
  //While looping if label containes special char like "<" parse tinks it is new tage and add one more key that can be null
  //since typeof (null) is object  node[i].props is faliling. 
  getStringNodes = (node, callback) => {
    for (let i = 0; i < node.length; i++) {
      if (typeof (node[i]) === 'object' && node[i] && node[i].props && node[i].props.children) {
        this.getStringNodes(node[i].props.children, callback);
      } else if (node[i]) {
        callback(node, i);
      }
    }
  }

  replaceTextAction = (metadata) => {
    for (let a in metadata.action) {
      for (let b in metadata.action[a].action) {
        if (metadata.action[a].action[b].type !== "Replace Text") {
          continue;
        }

        var str = metadata.data.label;
        var src = metadata.action[a].data.label;
        var dest = metadata.action[a].action[b].data;

        metadata.data.label = str.replace(src, dest);
      }
    }
  }

  parseLabel = (str) => {
    let currentLocale = this.props.story ? this.props.story.locale : "default";
    if (str.includes("fontStyle")) {
      try {
        let fontStyle = this.props.metadata.data.localeSpecificStyles[currentLocale] ?
          this.props.metadata.data.localeSpecificStyles[currentLocale].fontStyle :
          this.props.metadata.data.localeSpecificStyles["default"].fontStyle;
        if (fontStyle) {
          str = str.replace("fontStyle", fontStyle);
        }
      } catch (error) {
        Log.sDebug("Error inside parseLabel localeSpecificStyles: " + error.message, this.componentName);
      }
    }

    if (!str.includes("<font") && !str.includes("color")) {
      try {
        str = `<font color='#fff'>${str}</font>`;
      } catch (error) {
        Log.sDebug("Error inside parseLabel checking str font: " + error.message, this.componentName);
      }
    }

    let label = ReactHtmlParser(str);
    try {
      if (this.props.metadata.data.localeSpecificStyles[currentLocale].maxlen) {
        this.shrinkStringByLimit(label, this.props.metadata.data.localeSpecificStyles[currentLocale].maxlen);
      } else if (this.props.metadata.data.localeSpecificStyles["default"].maxlen) {
        this.shrinkStringByLimit(label, this.props.metadata.data.localeSpecificStyles["default"].maxlen);
      }
    } catch (error) {
      Log.sDebug("Error inside parseLabel checking localeSpecificStyles maxlen: " + error.message, this.componentName);
    }

    if (this.props.metadata.data.maxlen) {
      this.shrinkStringByLimit(label, this.props.metadata.data.maxlen);
    }
    return label;
  }

  extractMetadata = (id, metadata) => {
    let action = metadata.action;
    for (let i = 0; i < metadata.action.length; i++) {
      if (metadata.action[i].id === id) {
        return action[i];
      }
    }
  }

  clickAction = () => {
    elementActions.performAction(this.props.metadata.action, this.props.metadata, this.props.story, "", this.props);
  }

  /**
   * Complicated logic. ToDo - remove this
   * as soon new and better games layout is
   * in place
   */
  isSingleLine = (story) => {
    let single = true;
    if (story.content.title) {
      let titleArr = story.content.title.split(" ");
      if (titleArr.length === 1) {
        single = true;
      } else if (titleArr.length > 3 && story.content.title.length > 13) {
        single = false;
      } else {
        if (titleArr.length === 2) {
          if (story.content.title.length <= 13) {
            single = true;
          } else {
            single = false;
          }
        } else {
          for ( let i = 0; i < titleArr.length; i++) {
            if (titleArr[i].length > 6) {
              single = false;
              break;
            }
          }
        }
      }
    }
    return single;
  }

  render() {
    let { metadata, style, story } = this.props;
    let currentLocale = this.props.story ? this.props.story.locale : "default";

    if (typeof (style) === "object") {
      style = style[currentLocale] || style["default"];
    }

    if (this.isPlaceHolder(metadata.data.label)) {
      return '';
    }

    this.replaceTextAction(metadata);
    try {
      if (metadata.id === 'textbox2' && story.content.source === 'hellomoto') {
        return ''
      }
    } catch (error) {
      Log.sDebug("Error inside render checking metadata: " + error.message, this.componentName);
    }
    let data = metadata.data;
    let styleobj = Utils.parseStyle(style);
    if (styleobj.relToDevHeight) {
      let attrArr = styleobj.relToDevHeight.split(" ");
      for (let i = 0; i < attrArr.length; i++) {
        let attr = attrArr[i].trim();
        styleobj[attr] = parseFloat(styleobj[attr]) * window.innerHeight / 100 + 'px';
      }
    }
    styleobj.maxWidth = `${100 - this.parsePercentage(styleobj.left)}%`;
    styleobj.maxHeight = data.readMoreBtn ? "45%" : `${100 - this.parsePercentage(styleobj.top)}%`;

    if (story.id.indexOf('cards') === -1) {
      styleobj = Utils.getScaledStyle(styleobj, story);
    }

    return (
      <TimeOutDiv style={styleobj} onClick={this.clickAction} data-elem-id={metadata.id} className="textDiv">
        {this.parseLabel(data.label)}
        {data.readMoreBtn && <span>
          <div style={styles.readMoreBtnStyle}>
            {"Read more"}
            <span className="textBoxSpan">
              <i className="material-icons iconClass" style={styles.readMoreIconStyle}>library_books </i>
            </span>
          </div>
        </span>}
      </TimeOutDiv>
    )
  }
}

LabelComp.propTypes = {
  story: PropTypes.object,
  style: PropTypes.string,
  metadata: PropTypes.object,
};

