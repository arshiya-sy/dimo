import React  from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';
import { strip } from './utils';
import { KEYS } from './constant';
import  { ReactComponent as SendIcon } from "../../images/SvgUiIcons/sendIcon.svg";
import { AttachFile } from '@material-ui/icons';
class InputBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: ''
    };

    this.handleOnChange = this.handleOnChange.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  handleOnChange = (e) => {
    if(e.target.value.length > 256){
      return;
    }
    this.setState({ inputText: e.target.value });
  };

  sendMessage = (message) => {
    this.props.onSendMessage(message);
    this.setState({ inputText: '' });
  };

  handleOnClick = () => {
    const str = strip(this.state.inputText);

    if (str.length) {
      this.sendMessage(str);
      if(!this.props.isTicket){
        this.props.callTimer();
      }
    } else {
      // to do cannot send empty message
    }
  };

  onKeyPress = (e) => {
    if (
        (this.props.onSendKey === undefined || e[this.props.onSendKey]) &&
        e.charCode === 13
    ) {
      const str = strip(this.state.inputText);
      if (str.length) {
        this.sendMessage(str);
      }
      e.preventDefault();
      return false;
    }
  };

  handleOnAttachFileClick = () => {
    this.props.fetchImage();
  };

  render() {
    return (
        <div className={`react-chat-inputBox ${this.props.disabled ? 'chat-box-disable' : ''}`}>
          <TextareaAutosize
              maxRows={3}
              className="react-chat-textarea"
              placeholder={
                this.props.disabled ? this.props.disabledInputPlaceholder : this.props.placeholder
              }
              value={this.state.inputText}
              onChange={this.handleOnChange}
              onKeyPress={this.onKeyPress}
              autoFocus
              disabled={this.props.disabled}
          />

          {this.props.isTicket &&
              <button
                  className="react-chat-sendButton"
                  onClick={this.handleOnAttachFileClick}
                  disabled={this.props.disabled}
              >
                <AttachFile
                    className={
                      this.props.disabled
                        ? 'react-chat-AttachIcon-disable'
                        : 'react-chat-AttachIcon'
                    }
                />
              </button>
          }
          
          <button
              className="react-chat-sendButton"
              onClick={this.handleOnClick}
              disabled={this.props.disabled}
          >
            <SendIcon
                className={
                  this.props.disabled
                      ? 'react-chat-SendIcon-disable'
                      : 'react-chat-SendIcon'
                }
            />
          </button>
          
        </div>
    );
  }
}

export default InputBox;

InputBox.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  disabledInputPlaceholder: PropTypes.string,
  placeholder: PropTypes.string,
  onSendKey: PropTypes.oneOf(KEYS),
  callTimer: PropTypes.func,
  isTicket: PropTypes.bool,
  fetchImage: PropTypes.func
};
