import React from 'react';
import PropTypes from 'prop-types';
import { KEYS, TIMESTAMPFORMAT } from './constant';
import InputBox from './InputBox';
import MessageBox from './MessageBox';
import './ChatBox.css';
import ColorPicker from '../ColorPicker';
import CommonButtons from '../../WalletComponents/CommonUxComponents/CommonButtons';
import localeService from "../../Services/localeListService";

const BottomButton = CommonButtons.ButtonTypeChip;
var localeObj = {};

class ChatBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renderInputBox: false
    }
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.handleOnSendMessage = this.handleOnSendMessage.bind(this);
    this.callingTimer = this.callingTimer.bind(this);
    this.fetchingImage = this.fetchingImage.bind(this);
  }


  scrollToBottom() {
    if (this.messagesList) {
      this.messagesList.scrollTop =
        this.messagesList.scrollHeight - this.messagesList.clientHeight;
    }
  }

  componentDidMount() {
    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
    this.scrollToBottom();
    setTimeout(() => {
      this.setState({ renderInputBox: true });
    }, 1000)
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  handleOnSendMessage(message) {
    this.props.onSendMessage(message);
  }

  callingTimer(){
    this.props.callTimer();
  }

  fetchingImage(){
    this.props.fetchImage();
  }

  render() {
    const {
      messages,
      userId,
      timestampFormat,
      height,
      width,
      disableInput,
      disabledInputPlaceholder,
      placeholder,
      style,
      showTypingIndicator,
      activeAuthor,
      authorToDepict,
      onSendKey
    } = this.props;

    const messageList = messages.map((message, idx) => {
      return (
        <MessageBox
          key={idx}
          handleQuickReply={(payload) => this.props.handleQuickReply(payload)}
          handleRerouting={(payload) => this.props.handleRerouting(payload)}
          handleFeedback={(payload) => this.props.handleFeedback(payload)}
          handleMenuButton={(payload) => this.props.handleMenuButton(payload)}
          displayDemarcationChip={this.props.displayDemarcationChip}
          isMenuDisabled={message.isMenuDisabled}
          index={idx}
          left={message.author && message.author.id !== userId}
          timestampFormat={timestampFormat}
          timestamp={true}
          isTicket={this.props.isTickets}
          ticketCreatedDate={this.props.ticketCreatedDate}
          isPublicComment={this.props.isPublicComment}
          chatCommentdate={message.commentedTime}
          author={authorToDepict}
          {...message}
        />
      );
    });

    return (
      <div style={style} className="react-chat-container">
        <div className="react-chat-row">
          <div
            className="react-chat-viewerBox"
            style={{
              height: height,
              width: width,
            }}
          >
            <div
              className="react-chat-messagesList"
              ref={(el) => (this.messagesList = el)}
            >
              <div className="react-chat-messagesListContent">
                {messageList}
                {showTypingIndicator && activeAuthor !== null && (
                  <MessageBox
                    type="indicator"
                    author={authorToDepict}
                    text=""
                    left={true}
                  />
                )}
              </div>
              {this.props.showMainMenuChip && 
                <span className='react-chat-messageBoxRight' style={{alignItems: "end", marginBottom: "1rem"}}>
                    <BottomButton variant="outlined" onClick={this.props.menu} style={{ marginLeft:"0.5rem", marginTop: "1rem", border: ColorPicker.AccentDimoBlueStratus + "solid 1.5px", background: ColorPicker.btnHighEmphasis, marginRight : "0.7rem"}}> {localeObj.MainMenuChip} </BottomButton>
                </span>
                }
              {this.props.showMenuChip && 
                <span className='react-chat-messageBoxRight' style={{alignItems: "end", marginBottom: "1rem"}}>
                    <BottomButton variant="outlined" onClick={this.props.menu} style={{ marginLeft:"0.5rem", marginTop: "1rem", border: ColorPicker.AccentDimoBlueStratus + "solid 1.5px", background: ColorPicker.btnHighEmphasis, marginRight : "0.7rem"}}> {localeObj.MainMenuChip}</BottomButton>
                </span>
                }
              {this.props.showChips && 
                <span className='react-chat-messageBoxRight' style={{alignItems: "end", marginBottom: "1rem"}}>
                    <BottomButton variant="outlined" onClick={this.props.endConversation} style={{ marginTop: "1rem", border: ColorPicker.AccentDimoBlueStratus + "solid 1.5px", background: ColorPicker.btnHighEmphasis, marginRight : "0.7rem"}}> {localeObj.thankyouChip}</BottomButton>
                    <BottomButton variant="outlined" onClick={this.props.menu} style={{ marginLeft:"0.5rem", marginTop: "1rem", border: ColorPicker.AccentDimoBlueStratus + "solid 1.5px", background: ColorPicker.btnHighEmphasis, marginRight : "0.7rem"}}> {localeObj.MainMenuChip}</BottomButton>
                </span>
                }
            </div>

            {this.state.renderInputBox && !this.props.hideKeyboard && !this.props.isTickets &&
              <InputBox
              onSendMessage={this.handleOnSendMessage}
              disabled={disableInput}
              placeholder={placeholder}
              disabledInputPlaceholder={disabledInputPlaceholder}
              onSendKey={onSendKey}
              callTimer = {this.callingTimer}
              />
            }

            {this.props.isTickets && !this.props.ticketClosed &&
              <InputBox
                onSendMessage={this.handleOnSendMessage}
                disabled={disableInput}
                placeholder={placeholder}
                disabledInputPlaceholder={disabledInputPlaceholder}
                onSendKey={onSendKey}
                fetchImage={this.fetchingImage}
                isTicket={this.props.isTickets}
              />
            }
          
          </div>
        </div>
      </div>
    );
  }
}

ChatBox.propTypes = {
  messages: PropTypes.array,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onSendMessage: PropTypes.func.isRequired,
  handleQuickReply: PropTypes.func,
  handleRerouting: PropTypes.func,
  handleFeedback: PropTypes.func,
  handleMenuButton: PropTypes.func,
  timestampFormat: PropTypes.oneOf(TIMESTAMPFORMAT),
  width: PropTypes.string,
  height: PropTypes.string,
  disableInput: PropTypes.bool,
  disabledInputPlaceholder: PropTypes.string,
  placeholder: PropTypes.string,
  style: PropTypes.object,
  showTypingIndicator: PropTypes.bool,
  activeAuthor: PropTypes.object,
  authorToDepict: PropTypes.object,
  onSendKey: PropTypes.oneOf(KEYS),
  callTimer: PropTypes.func,
  fetchImage: PropTypes.func,
  displayDemarcationChip: PropTypes.bool,
  isTickets: PropTypes.bool,
  ticketCreatedDate: PropTypes.string,
  isPublicComment: PropTypes.bool,
  showMainMenuChip: PropTypes.bool,
  showMenuChip: PropTypes.bool,
  showChips: PropTypes.bool,
  hideKeyboard: PropTypes.bool,
  menu: PropTypes.func,
  endConversation: PropTypes.func,
  ticketClosed: PropTypes.bool
};

ChatBox.defaultProps = {
  messages: [],
  timestampFormat: 'calendar',
  disableInput: false,
  disabledInputPlaceholder: '',
  placeholder: '',
  showTypingIndicator: false,
  activeAuthor: null,
};

export default ChatBox;
