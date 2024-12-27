import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import constantObjects from "../../Services/Constants";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';
import ButtonAppBar from "./ButtonAppBarComponent";
import PrimaryButtonComponent from "./PrimaryButtonComponent";
import ColorPicker from "../../Services/ColorPicker";
import SecondaryButtonComponent from "./SecondaryButtonComponent";
import GeneralUtilities from "../../Services/GeneralUtilities";
import NewUtilities from "../../Services/NewUtilities";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";

import BulbIcon from '@mui/icons-material/LightbulbOutlined';
import PhoneIcon from '@mui/icons-material/SmartphoneOutlined';
import ProfileIcon from '@mui/icons-material/PermIdentityOutlined';
import Grid from '@material-ui/core/Grid';

const styles = InputThemes.singleInputStyle;
var localeObj = {};

class ImageInformationPageComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayStatus: false,
      open: false,
    };
    this.style = {
      textStyle: {
        margin: "0 2rem",
        textAlign: "center"
      },
      subTextStyle: {
        margin: "1rem 3rem",
        textAlign: this.props.from === "waitingApproval"? "left" : "center"
      },
      toolTipTextStyle: {
         margin: "3rem",
        textAlign: "center"
      },
      cardStyle: {
        width: "100%",
        borderRadius: "0.5rem",
        margin: "0 1rem"
      },
      iconStyle: {
        height: "1.25rem",
        width: "1.25rem",
        color: "#FFB684" 
      },
      circleIconContainer: {
        borderRadius: "50%",
        height: "3rem",
        width: "3rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: ColorPicker.newProgressBar
      }
    }
    this.next = this.next.bind(this);

    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
    MetricServices.onPageTransitionStart(this.props.type);
  }

  componentDidMount() {
    androidApiCalls.enablePullToRefresh(false);
    document.addEventListener("visibilitychange", this.visibilityChange);
  }

  visibilityChange = () => {
    let visibilityState = document.visibilityState;
    if (visibilityState === "hidden") {
      MetricServices.onPageTransitionStop(this.props.type, PageState.recent);
    } else if (visibilityState === "visible") {
      MetricServices.onPageTransitionStart(this.props.type);
    }
  }

  componentWillUnmount() {
    document.removeEventListener("visibilitychange", this.visibilityChange);

  }

  next = () => {
    MetricServices.onPageTransitionStop(this.props.type, PageState.close);
    this.props.next();
  }

  onCancel = () => {
    if (!this.props.btnText || this.props.footer
      || this.props.noBottomSheet || this.props.noAction) {
      MetricServices.onPageTransitionStop(this.props.type, PageState.cancel);
      this.props.onCancel();
    } else {
      this.setState({ open: true })
    }
  }

  onSecondary = () => {
    MetricServices.onPageTransitionStop(this.props.type, PageState.cancel);
    this.props.onCancel();
    this.setState({ open: false })
  }

  onPrimary = () => {
    this.setState({ open: false })
  }

  handleDialer = (phNum) => () => {
    MetricServices.onPageTransitionStop(this.props.type, PageState.close);
    androidApiCalls.startDialer(phNum);
  }

  setBottomSheet = () => {
    this.props.handleBottomSheet(false);
  }

  actOnAction = () => {
    MetricServices.onPageTransitionStop(this.props.type, PageState.close);
    this.props.onAction();
  }

  handleOpenWhatApp = () => {
    androidApiCalls.openUrlInBrowserLegacy("https://api.whatsapp.com/send?phone=" + constantObjects.customerCareWADialer);
  }

  render() {
    const { classes } = this.props;
    const finalHeight = window.screen.height;
    const finalWidth = window.screen.width;
    const selfieContents = [
      {
        text: this.props.suggestion,
        icon: <ProfileIcon style={this.style.iconStyle} />
      },
      {
        text: this.props.description,
        icon: <BulbIcon style={this.style.iconStyle} />
      },
      {
          text: this.props.subText,
          icon: <PhoneIcon style={this.style.iconStyle} />
      }
    ];
    return (
      <div style={{ height: `${finalHeight}px` }}>
        {this.props.appBar &&
          <ButtonAppBar header={this.props.appBarTitle ? this.props.appBarTitle : ""} onCancel={this.onCancel} action={ this.props.from === "waitingApproval" ? "none" : "cancel" } inverse="true" />}
        <div className="scroll" style={{ height: this.props.secBtnText ? `${finalHeight * 0.7}px` : `${finalHeight * 0.75}px`, overflowY: "auto", overflowX: "hidden", width: `${finalWidth}px` }}>
          <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <span>
              <img style={{ width: (this.props.giftCardIcon ? `${finalWidth * 0.5}px` : `${finalWidth * 0.7}px`), marginTop: (this.props.giftCardIcon ? "4rem" : "2.5rem") }} src={this.props.icon} alt="" />
            </span>
          </div>
          <div style={this.style.textStyle}>
            <span className="headline5 highEmphasis">
              {this.props.header}
            </span>
          </div>
          <div style={this.style.textStyle}>
            <span className="headline5 highEmphasis">
              {this.props.subHeader}
            </span>
          </div>
          <div style={{ textAlign: "center",  paddingTop: "14px", paddingBottom: "20px"}}>
            <span className="body2 highEmphasis">
              {this.props.selfieSubHeader}
            </span>
          </div>
          {this.props.address &&
            <div className="body2 highEmphasis" style={{ marginTop: "1.5rem", textAlign: "center" }}>
              <div>{NewUtilities.parseCEP(this.props.address.cep).cepDisp}</div>
              <p style={{ wordWrap: "break-word" }}>{this.props.address.street}, {this.props.address.number}</p>
              <p style={{ wordWrap: "break-word" }}>{GeneralUtilities.areAllArgsValid(this.props.address.complement) ? this.props.address.complement : ""}</p>
              <p style={{ wordWrap: "break-word" }}>{this.props.address.neighbourhood}</p>
              <div>{this.props.address.city} , {this.props.address.uf}</div>
            </div>
          }
          {this.props.fromSelfieCam?

            <div align="center">  
                <Grid container spacing={0} style={{ paddingLeft: "48px"}}>
                    {
                        selfieContents.map((keys) => (
                          <div align="center" style={this.style.cardStyle}>
                              <ListItem>
                                  <ListItemIcon>
                                      <div style={this.style.circleIconContainer}>{keys.icon}</div>
                                  </ListItemIcon>
                                  <ListItemText>
                                      <div align="left" style={{ marginLeft: "1rem" }}>
                                          <div className="body2 mediumEmphasis">{keys.text}</div>
                                      </div>
                                  </ListItemText>
                              </ListItem>
                          </div>
                        ))
                    }
                </Grid>
            </div>

            :
            <div>
              <div style={this.style.subTextStyle}>
                <span className="body2 highEmphasis">
                  {this.props.suggestion}
                </span>
              </div>
              <div style={this.style.subTextStyle}>
                <span className="body2 highEmphasis">
                  {this.props.description}
                </span>
              </div>
              {this.props.card &&
                <div style={this.style.subTextStyle}>
                  <span className="body2 highEmphasis">
                    {this.props.charge}
                  </span>
                </div>}
              <div style={this.style.subTextStyle}>
                <span className="body2 highEmphasis">
                  {this.props.subText}
                </span>
              </div>
              <div style={this.style.subTextStyle}>
                <span className="body2 highEmphasis">
                  {this.props.tip}
                </span>
              </div>
            </div>
          }
            
          {this.props.btnText &&
            <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
              {this.props.tooltip &&
                <div className="body2 highEmphasis" style={this.style.toolTipTextStyle} onClick={this.onCancel}>
                  {this.props.tooltip}
                </div>}
              <PrimaryButtonComponent btn_text={this.props.btnText} onCheck={this.next} disabled={this.props.disabled} />
              {this.props.secBtnText && <SecondaryButtonComponent btn_text={this.props.secBtnText} onCheck={this.props.close} />}
              {this.props.from === "waitingApproval" && 
                  <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={this.props.onHelp}>
                    {localeObj.help}
                  </div>
              }
              {this.props.footer &&
                <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={this.onCancel}>
                  {this.props.footer}
                </div>}
              {this.props.action &&
                <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={this.actOnAction}>
                  {this.props.action}
                </div>}
            </div>
          }
        </div>
        <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
          <Drawer classes={{ paper: classes.paper }}
            anchor="bottom"
            open={this.state.open}>
            <div style={{ margin: "1.5rem" }}>
              <FlexView column style={{ marginTop: "0.5rem" }}>
                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                  {localeObj.cancel_message_header}
                </div>
                <div className="body2 mediumEmphasis" style={{ display: this.props.bottomSheetDesc === undefined ? "block" : "none", textAlign: "center", marginTop: "1rem" }}>
                  {localeObj.cancel_message_description}
                </div>
              </FlexView>
            </div>
            <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
              <PrimaryButtonComponent btn_text={localeObj.resume} onCheck={this.onPrimary} />
              <SecondaryButtonComponent btn_text={localeObj.stop} onCheck={this.onSecondary} />
            </div>
          </Drawer>
        </div>
        <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
          <Drawer
            anchor="bottom"
            open={this.props.bottomSheet}
            onClose={this.setBottomSheet}
            classes={{ paper: classes.paper }}>
            <div style={{ margin: "1.5rem" }}>
              <FlexView column style={{ textAlign: "center", marginTop: "0.5rem" }}>
                <div className="headline6 highEmphasis">
                  {localeObj.help_customer_care}
                </div>
                <div className="body2 highEmphasis" style={{ marginTop: "1rem" }}>
                  {localeObj.help_contact_cc}
                </div>
                <div className="body2 mediumEmphasis" style={{ marginTop: "1rem", color: ColorPicker.textDisabledColor }}>
                  {localeObj.cc_timings}
                </div>
                <div onClick={this.handleOpenWhatApp}>
                  <div className="subtitle4" style={{ marginTop: "2.5rem", color: ColorPicker.customerCarelinkColor }}>
                    {localeObj.cc_whatsapp}
                  </div>
                  <div className="body2" style={{ marginTop: "0.5rem", color: ColorPicker.numberDisabledColor }}>
                    {constantObjects.customerCareWADisplay}
                  </div>
                </div>
                <div onClick={this.handleDialer(constantObjects.customerCarePhoneNumberDialer)}>
                  <div className="subtitle4" style={{ marginTop: "2rem", color: ColorPicker.customerCarelinkColor }}>
                    {localeObj.cc_call_us}
                  </div>
                  <div className="body2" style={{ marginTop: "0.5rem", color: ColorPicker.numberDisabledColor }}>
                    {constantObjects.customerCarePhoneNumberDisplay}
                  </div>
                </div>
                <div className="body2 highEmphasis" style={{ marginTop: "4rem" }} onClick={this.setBottomSheet}>
                  {localeObj.cancel}
                </div>
              </FlexView>
            </div>
          </Drawer>
        </div>
      </div>
    );
  }
}

ImageInformationPageComponent.propTypes = {
  classes: PropTypes.object,
  type: PropTypes.string,
  appBar: PropTypes.bool,
  secBtnText: PropTypes.string,
  giftCardIcon: PropTypes.bool,
  icon: PropTypes.string,
  header: PropTypes.string,
  subHeader: PropTypes.string,
  suggestion: PropTypes.string,
  description: PropTypes.string,
  card: PropTypes.bool,
  charge: PropTypes.string,
  subText: PropTypes.string,
  tip: PropTypes.string,
  btnText: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
  ]),
  disabled: PropTypes.bool,
  footer: PropTypes.string,
  action: PropTypes.func,
  onCancel: PropTypes.func,
  next: PropTypes.func,
  close: PropTypes.func,
  bottomSheet: PropTypes.bool,
  bottomSheetDesc: PropTypes.string,
  noBottomSheet: PropTypes.bool,
  noAction: PropTypes.bool,
  handleBottomSheet: PropTypes.func,
  onAction: PropTypes.func,
  address: PropTypes.object,
  appBarTitle: PropTypes.string
};

export default withStyles(styles)(ImageInformationPageComponent);
