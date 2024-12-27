import moment from "moment";
import ReactHtmlParser from "react-html-parser";
import { ReactComponent as ErrorIcon } from "../../images/SvgUiIcons/errorIcon.svg";
import avatar from "./placeholder.png";
import ColorPicker from "../ColorPicker";
import React, { useEffect, useState } from 'react';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ImportantDetails from "../../WalletComponents/NewLaunchComponents/ImportantDetails";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../GeneralUtilities";
import CommonButtons from '../../WalletComponents/CommonUxComponents/CommonButtons';
import PropTypes from 'prop-types';
import { TIMESTAMPFORMAT } from './constant';

var localeObj = {};
const BottomButton = CommonButtons.ButtonTypeChip;

function MessageBox(props) {
  let isQuickReply = false;
  const [isDisabled, setIsDisabled] = useState(false);
  const [disable, setDisable] = useState(false);
  const [menuClicked, setMenuClicked] = useState(false);
  let isHelpPage = false;

  const {
    type,
    timestamp,
    timestampFormat,
    buttons,
    left,
    author,
    hasError,
    text,
    addLine,
    isTicket,
    chatCommentdate,
    displayDemarcationChip,
    isMenuDisabled,
    index
  } = props;

  useEffect(() => {
    if (Object.keys(localeObj).length === 0) {
        localeObj = localeService.getActionLocale();
    }
  }, []);

  const onClickButton = (e, dataJson) => {
    setIsDisabled(!isDisabled);
    props.handleQuickReply(dataJson);
  };

  const onClickSurvey = (dataJson) => {
    props.handleRerouting(dataJson);
    setDisable(!disable);
  };

  const onClickHandleMenuButton = () => {
    props.handleMenuButton();
    setMenuClicked(true);
  };

  if (type === "text" || type === "indicator") {
    let time;
    if (timestamp) {
      if (timestampFormat === "calendar") {
        time = moment(timestamp).calendar();
      } else if (timestampFormat === "fromNow") {
        time = moment(timestamp).fromNow();
      } else {
        time = moment(timestamp).format(timestampFormat);
      }
    }

    // TODO: ADD HIGHLIGHT CHECK FOR OLDER CHAT CONVERSATIONS
    // TODO: DISABLE OLDER BUTTONS/QUICK REPLY CLICKS WORKINGS
    const _buttons = buttons
      ? buttons.map((button, idx) => {
          if (button.type === 'URL' && !button.internal) {
            return (
              <a
                key={idx}
                href={button.payload}
                rel="noopener noreferrer"
                target="_blank"
                className="react-chat-message-button"
              >
                {button.title}
              </a>
            );
          } else if(button.type === 'URL' && button.internal) {
            isQuickReply = true;

            if (typeof button.title !== 'undefined' && (button.title === 'View FAQ' || button.title === 'Ver perguntas frequentes')) {
              isHelpPage = true;
            }

            const onHelpClick = () => {
              onClickSurvey({ response: button.payload });
            }

            const handleClick = () => {
              onClickSurvey({ response: button.payload, index: index });
            };

            return (
                <button
                  key={idx}
                  onClick={isHelpPage? onHelpClick: handleClick}
                  disabled={isMenuDisabled ? true : false}
                  rel="noreferrer"
                  target="_blank"
                  className= {`react-chat-message-button ${isMenuDisabled ? 'disabled' : 'enabled'}`}
                >
                  {button.title}
                </button>
              );
          }
          else if (button.type === 'QUICK_REPLY') {
            isQuickReply = true;

            const buttonStyle = {
              display: 'flex',
              flexDirection: 'row-reverse',
              justifyContent: 'center',
              alignItems: 'center',
            };
            
            return (
              <button
                key={idx}
                className= {`react-chat-message-button ${isMenuDisabled || isDisabled ? 'disabled' : 'enabled'}`}
                onClick ={(e) => onClickButton(e,{response: button.payload, key: button.payloadKey, responseText: button.title, index: index})} 
                disabled={isMenuDisabled ? true : isDisabled}
                style={button.icon === "Like" || button.icon === "Dislike" ? buttonStyle : null}
              >
                {button.icon === "Like" && (
                  <span style={{marginLeft:'8px'}} disabled={isMenuDisabled ? true : isDisabled}>
                    <ThumbUpIcon style={{ color: isMenuDisabled || isDisabled ? 'rgba(255, 255, 255, 0.38)' : 'white' }} />&nbsp;
                  </span>
                )} 
                {button.icon === "Dislike" && (
                  <span style={{marginLeft:'8px'}} disabled={isMenuDisabled ? true : isDisabled}>
                    <ThumbDownIcon style={{ color: isMenuDisabled || isDisabled ? 'rgba(255, 255, 255, 0.38)' : 'white' }} />&nbsp;
                  </span>
                )}
                {button.title}
              </button>
            );
          }
        })
      : [];

    return (
      <div
        className={!GeneralUtilities.emptyValueCheck(text) ? `react-chat-messageBox ${
          left ? "react-chat-messageBoxLeft" : "react-chat-messageBoxRight"
        }`: ""}
      >
        <img
          alt="avater img"
          src={author.avatarUrl ? author.avatarUrl : avatar}
          className={`react-chat-avatar ${
            left ? "react-chat-avatarLeft" : "react-chat-avatarRight"
          }`}
        />

        {isTicket && !GeneralUtilities.emptyValueCheck(text) && 
          <div className="message-info">
            <div className="body2 highEmphasis">{left ? localeObj.ticket_agent : ImportantDetails.userName}</div>
            <div className="body2 disabled">{chatCommentdate}</div>
          </div>
        }

        <div
          className={!GeneralUtilities.emptyValueCheck(text) ? `react-chat-message ${
            left
              ? isQuickReply
                ? "react-chat-messageLeft"
                : "react-chat-messageLeft tri-right left-top"
              : "react-chat-messageRight tri-right right-top"
          }`: ""}
        >
          <div className="react-chat-additional">{author.username}</div>
          <div
            className={!GeneralUtilities.emptyValueCheck(text) ? `react-chat-bubble ${
              left
                ? isQuickReply
                  ? "react-chat-leftBubble-QuickReply"
                  : "react-chat-leftBubble"
                : "react-chat-rightBubble"
            } ${hasError ? "react-chat-bubbleWithError" : ""}`: ""}
          >
    
            {type === "indicator" && (
              <div className="react-chat-typing-indicator">
                <span />
                <span />
                <span />
              </div>
            )}
            <div style={{display: !GeneralUtilities.emptyValueCheck(text) ? "block" : "none" }}>{ !GeneralUtilities.emptyValueCheck(text) && ReactHtmlParser(text)}</div>
            {_buttons.length > 0 && (
              <div
                className={
                  `${left
                    ? "react-chat-message-buttonGroupLeft"
                    : "react-chat-message-buttonGroupRight"} ${"chatbot-buttons-container"}` 
                }
              >
                {_buttons}
              </div>
            )}
            {hasError && (
              <ErrorIcon
                className={`${
                  left ? "react-chat-errorLeft" : "react-chat-errorRight"
                } react-chat-error`}
              />
            )}
          </div>
          <div className="react-chat-additional">{time !== null && time}</div>
        </div>
      </div>
    );
  } else if (type === "notification") {
    return (
      <div className="text-center text-secondary react-chat-notification">
        <div style={{display: text && text !== "" && text !== null && text !== undefined ? "block" : "none" }}>{ReactHtmlParser(text)}</div>
      </div>
    );
  } else if (type === "demarcation") {
    return (
      <div className="text-center text-secondary react-chat-notification">
        <div
          style={{
            display:
              text && text !== "" && text !== null && text !== undefined
                ? "block"
                : "none",
          }}
        >
          {ReactHtmlParser(text)}
        </div>
        {addLine && (
          <hr
            style={{
              background: ColorPicker.white,
              height: "0.063rem",
              width: "22rem",
            }}
          ></hr>
        )}
        {displayDemarcationChip && (
          menuClicked ? null : (
            <BottomButton
              className="react-chat-menu-button"
              onClick={() => onClickHandleMenuButton()}
              style={{
                marginLeft: "0.5rem",
                border: ColorPicker.AccentDimoBlueStratus + "solid 1.5px",
                background: ColorPicker.btnHighEmphasis,
                marginRight: "0.7rem",
                width: "auto"
              }}
            >
              {localeObj.menuChip}
            </BottomButton>
          )
        )}
      </div>
    );
  }
}

MessageBox.propTypes = {
    type: PropTypes.string,
    timestamp: PropTypes.number,
    timestampFormat: PropTypes.oneOf(TIMESTAMPFORMAT),
    buttons: PropTypes.array,
    left: PropTypes.bool,
    author: PropTypes.object,
    hasError: PropTypes.bool,
    text: PropTypes.string,
    addLine: PropTypes.bool,
    isTicket: PropTypes.bool,
    chatCommentdate: PropTypes.string,
    displayDemarcationChip: PropTypes.bool,
    isMenuDisabled: PropTypes.bool,
    index: PropTypes.number,
    handleQuickReply: PropTypes.func,
    handleRerouting: PropTypes.func,
    handleMenuButton: PropTypes.func
}

export default MessageBox;
