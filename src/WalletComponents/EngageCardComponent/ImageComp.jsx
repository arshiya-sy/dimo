import React from 'react';
import PropTypes from 'prop-types';

import Log from "../../Services/Log";
import Utils from '../EngageCardComponent/Utils';
import DBService from "../../Services/DBService";
import { PopupModalHocManger } from "./PopupModalHoc";
import constantObjects from '../../Services/Constants';
import elementActions from '../EngageCardComponent/elementActions';
import ClickWithTimeOut from "../EngageCardComponent/ClickWithTimeOut";

const TimeOutDiv = ClickWithTimeOut('div');
const placeholderRegex = new RegExp("<<([^>^>)]*)>>", "g");

class ImageComp extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { imageSize: null }
    this.imagRef = React.createRef();
    this.imageLoaded = false;
    this.mounted = true;

    this.isDialogImg = (props.story && props.story.id && props.story.id.indexOf('dialog') !== -1);
    this.isCardImg = (props.story && props.story.id && props.story.id.indexOf('cards') !== -1);

    this.componentName = "ImageComp";
  }

  styles = {
    imageContainer: {
      width: '100%',
      height: '100%',
      position: "relative",
      display: "flex",
      alignItems: "center",
      backgroundSize: 'inherit',
      backgroundPosition: 'top',
      backgroundRepeat: 'no-repeat',
    },
    smallCardVideoImg: {
      width: '30px',
      height: '30px',
      border: "1px solid #FFFFFF",
    },
    playIconWrapper: {
      background: 'rgba(0, 0, 0, 0.35)',
      borderRadius: '64px',
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 'auto',
      border: '1px solid rgb(255, 255, 255)',
      boxSizing: 'border-box',
      boxShadow: 'rgba(0, 0, 0, 0.3) 1px 2px 4px 0px'
    },
    playIconInner: {
      borderStyle: "solid",
      borderWidth: "12px 0px 12px 20px",
      borderColor: "transparent transparent transparent #FFFFFF",
      marginLeft: "7px",
    },
    playIconInnerSmall: {
      borderWidth: "6px 0px 6px 10px",
      marginLeft: "4px"
    }
  };

  imgError = () => {
    this.props.onError && this.props.onError(this.props.metadata);
    if (this.props.metadata && this.props.metadata.data.optional === true) return;

    const {id} = this.props.story;

    Log.sDebug("Removing the content due to image error inside ImageComp " + id + " " + JSON.stringify(this.props.story), 'ImageComp', constantObjects.LOG_PROD);
    DBService.setDeletedCard(id);

    if (this.isDialogImg) {
      PopupModalHocManger.closeModal();
      const eventObj = {};
      eventObj.id = id;
      Utils.reportMetrics("dialog", "imageerrorclose", eventObj);
      return;
    }

    if (this.isCardImg) {
      this.props.story.removeStoryFromCards && this.props.story.removeStoryFromCards(id);
    }
  }

  componentDidMount = () => {
    let img = new Image();
    let src = this.props.metadata.data.imgsrc;
    if (Utils.isPlaceHolder(src)) {
      this.imgError();
      return;
    }
    img.src = src;
    img.onerror = () => {
      this.imgError();
    };
  }

  clickAction = ($event) => {
    if ($event.defaultPrevented) return;
    $event.preventDefault();
    elementActions.performAction(this.props.metadata.action, this.props.metadata, this.props.story, "", this.props);
  }

  componentWillUnmount = () => {
    this.mounted = false;
  }

  render() {
    let { story, metadata, style } = this.props;
    style = style || '';
    let data = metadata.data;

    if (data.highlighter && story && story.highlighter && story.highlighter.position) {
      let position = story.highlighter.position;
      if ("top_left" === position) {
        style = "width: 60px; height: 15px; zIndex: 10; height: 15px;background-size:contain;background-position: right top;display:flex;flex-direction:column;align-self:flex-end;position:absolute;top:-2px; left:12px;background-position: left bottom;";
      } else if ("top_right" === position) {
        style = "width: 30px; height: 15px; zIndex: 10; height: 15px;background-size:contain;background-position: right top;display:flex;flex-direction:column;align-self:flex-end;position:absolute;top:-2px; right:12px;background-position: left bottom;";
      } else if ("center" === position) {
        style = "margin-top: 5px; height:50px; width:50px;justify-content: center;align-items:center;display:flex;background-size: 100% 100%; text-align: center; border: none;z-index: auto;cursor: pointer;position:absolute;top:0px;margin:auto 0;justify-content:center;transform:translate(-50%,0);left:50%;";
      }
    }

    let ImgLayoutStyle = metadata.style ? Utils.parseStyle(metadata.style) : "";
    let hasVideo = Utils.checkVideo(story.content, metadata);
    let imgStyle = Object.assign({}, this.styles.imageContainer, ImgLayoutStyle);
    try {
      if (data && data.imgsrc && placeholderRegex.test(data.imgsrc)) {
        return <div/>
      }
      if (metadata.id === 'image1'&& story.content && story.content.source === 'hellomoto') {
        return '';
      }
    } catch (error) {
      Log.sDebug("Error inside render placeholderRegex: " + error.message, this.componentName);
    }

    imgStyle.backgroundImage = `url(${data.imgsrc})`;
    // imgStyle.backgroundPosition = Utils.getImageCroping(this.props);
    imgStyle.backgroundPosition = "center top";
    imgStyle.borderRadius = "inherit";

    if (data.highlighter && style.includes("background-position")) {
      imgStyle.backgroundPosition = "inherit";
    }
    let img = new Image();
    img.src = data.imgsrc;
    if (! this.imageLoaded) {
      img.onload = () => {
        if (data["Overlay playback image"]) {
          try {
            this.imageLoaded = true;
            let imageSize;
            let element = this.imagRef.current;
            if (element.offsetWidth > 150 && element.offsetHeight > 150) {
              imageSize = "big";
            } else {
              imageSize = "small";
            }
            if (this.mounted) {
              this.setState({ imageSize });
            }
          } catch (error) {
            Log.sDebug("Error inside render img onload: " + error.message, this.componentName);
          }
        }
      }
    }
    img.onerror = () => {
      this.imgError();
    }

    let styleobj = Utils.parseStyle(style);
    if (styleobj.relToDevHeight) {
      let attrArr = styleobj.relToDevHeight.split(" ");
      for (let i = 0; i < attrArr.length; i++) {
        let attr = attrArr[i].trim();
        styleobj[attr] = parseFloat(styleobj[attr]) * window.innerHeight / 100 + 'px';
      }
    }
    if (styleobj.preserveAspectRatio) {
      //Games tab UI preservation accross mutilple devices
      //subtracting 8px of left and right margin to get the actual
      //width of the div
      let imageW = parseFloat(styleobj.width) / 100 * window.innerWidth - 16;
      let imageH = imageW / parseFloat(styleobj.aspectRatio);
      styleobj.width = imageW + "px";
      styleobj.height = imageH + "px";
    }
    let imageSize = styleobj.height && parseInt(styleobj.height.replace(/px/g, "")) > 140 ? "big" : "small";
    if (data && data["Overlay playback image"]) {
      imageSize = this.state.imageSize;
      hasVideo = true;
    }
    if (story.streamtype && story.streamtype === "Podcasts") {
      this.styles.smallCardVideoImg = {
        width: '33px',
        height: '33px',
      }
    }
    if (data.withPlayIcon) {
      hasVideo = true;
    }
    imageSize = data.playButton || imageSize;
    let videoLibraryStyle = imageSize === "big" ? { ...this.styles.playIconWrapper } : { ...this.styles.playIconWrapper, ...this.styles.smallCardVideoImg };
    let videoLibraryInner = imageSize === "big" ? { ...this.styles.playIconInner } : { ...this.styles.playIconInner, ...this.styles.playIconInnerSmall };
    let classObj = "";

    if (!data.forceApplyStyle && (!story.streamtype || story.streamtype === "Engage")) {
      for (let i = 0; i < metadata.classList.length; i++) {
        classObj = classObj + " " + metadata.classList[i];
      }

      if (story.streamId !== "engageopeninfullscreen" && !story.ignoreStyleScale && !this.isCardImg) {
        styleobj = Utils.getScaledStyle(styleobj, story);
      }
    }

    if (data && data.imageSpecificStyles) {
      let imageSpecificStyles = Utils.parseStyle(data.imageSpecificStyles) || {};
      imgStyle = { ...imgStyle, ...imageSpecificStyles };
    }

    return (
      <div ref={this.imagRef} style={styleobj} className={classObj} data-elem-id={metadata.id} id="imageID">
        <TimeOutDiv onClick={this.clickAction} style={imgStyle}>
          {hasVideo && <div style={videoLibraryStyle}><div style={videoLibraryInner}></div></div>}
        </TimeOutDiv>
      </div>
    );
  }
}

ImageComp.propTypes = {
  story: PropTypes.object,
  onError: PropTypes.func,
  style: PropTypes.string,
  metadata: PropTypes.object,
};

export default ImageComp;