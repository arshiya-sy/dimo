import React from "react";

import PropTypes from "prop-types";
import FlexView from "react-flexview";

import Drawer from '@material-ui/core/Drawer';
import { withStyles } from '@material-ui/core/styles';

import PageState from "../../Services/PageState";
import InputThemes from "../../Themes/inputThemes";
import ButtonAppBar from "./ButtonAppBarComponent";
import ColorPicker from "../../Services/ColorPicker";
import constantObjects from "../../Services/Constants";
import CustomizedProgressBars from "./ProgressComponent";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import CommonFunctions from "../../Services/CommonFunctions";
import PrimaryButtonComponent from "./PrimaryButtonComponent";
import SecondaryButtonComponent from "./SecondaryButtonComponent";
import androidApiCalls from "../../Services/androidApiCallsService";

import "../../styles/main.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";

const styles = InputThemes.singleInputStyle;
var localeObj = {};

class ImageHTMLInformationComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false,
      processing: false,
      displayStatus: false,
    };

    this.style = {
      textStyle: {
        margin: "0 2rem",
        textAlign: "center"
      },
      subTextStyle: {
        margin: props.extra ? "1rem 2rem" : "1rem 3rem",
        textAlign: "center",
        whiteSpace: 'pre-line'
      },
      descStyle: {
        margin: "0.5rem 2rem 2rem",
        textAlign: "center"
      }
    };

    this.next = this.next.bind(this);

    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }

    MetricServices.onPageTransitionStart(this.props.type);
  }

  componentDidMount() {
    androidApiCalls.enablePullToRefresh(false);
    CommonFunctions.addVisibilityEventListener(this.props.type);
  }

  componentWillUnmount() {
    CommonFunctions.removeVisibilityEventListener(this.props.type);
  }

  onBack = () => {
    MetricServices.onPageTransitionStop(this.props.type, PageState.cancel);
    this.props.onBack();
    this.setState({ open: false })
  }

  next = () => {
    MetricServices.onPageTransitionStop(this.props.type, PageState.close);
    this.props.next();
  }

  onCancel = () => {
    if (!this.props.btnText || this.props.footer || this.props.extra
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
    const { processing } = this.state;
    const { classes, appBarInverse = true, appBarAction = "cancel" } = this.props;
    const finalHeight = window.screen.height;
    const finalWidth = window.screen.width;

    return (
      <div style={{ height: `${finalHeight}px` }}>
        {processing && <CustomizedProgressBars />}

        <div style={{ visibility: (processing ? "hidden" : "visible") }}>
          {
            this.props.appBar
            && <ButtonAppBar
              header={this.props.appBarTitle ? this.props.appBarTitle : ""}
              onCancel={this.onCancel} action={appBarAction} inverse={appBarInverse} onBack={this.onBack}
            />
          }

          <div
            className="scroll"
            style={{
              height: this.props.secBtnText ? `${finalHeight * 0.7}px` : `${finalHeight * 0.75}px`,
              overflowY: "auto", overflowX: "hidden"
            }}
          >
            <div
              style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}
            >
              <span>
                <img
                  style={{ width: (this.props.extra ? `${finalWidth * 0.5}px` : `${finalWidth * 0.7}px`), marginTop: (this.props.giftCardIcon ? "4rem" : "2.5rem") }}
                  src={this.props.icon} alt=""
                />
              </span>
            </div>

            <div style={this.style.textStyle}>
              <span className="headline5 highEmphasis">{this.props.header}</span>
            </div>

            <div style={this.style.textStyle}>
              <span className="headline5 highEmphasis">{this.props.subHeader}</span>
            </div>

            <div style={this.props.extra ? this.style.descStyle : this.style.subTextStyle}>
              <span className="body2 highEmphasis">{this.props.suggestion}</span>
            </div>

            <div
              id="descriptionHtml" className="body2 highEmphasis"
              style={{ ...this.style.subTextStyle, ...this.props.descriptionStyles }}
            >
              {this.props.description}
            </div>

            {
              this.props.card
              && <div style={this.style.subTextStyle}>
                <span className="body2 highEmphasis">{this.props.charge}</span>
              </div>
            }

            <div
              id="subTextHtml" className="body2 highEmphasis"
              style={{ ...this.style.subTextStyle, ...this.props.subTextStyles }}
            >
              {this.props.subText}
            </div>

            <div
              id="tipHtml" className="body2 highEmphasis"
              style={{ ...this.style.subTextStyle, ...this.props.tipStyles }}
            >
              {this.props.tip}
            </div>

            {
              this.props.extra
              &&
              <div
                id="tipHtml" className="body2 highEmphasis"
                style={{ ...this.style.subTextStyle, ...this.props.tipStyles }}
              >
                {this.props.extra}
              </div>
            }

            {
              (this.props.btnText || this.props.secBtnText || this.props.footer || this.props.action)
              && <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                {
                  this.props.btnText
                  && <PrimaryButtonComponent btn_text={this.props.btnText} onCheck={this.next} disabled={this.props.disabled} />
                }

                {
                  this.props.secBtnText
                  && <SecondaryButtonComponent btn_text={this.props.secBtnText} onCheck={this.props.close} />
                }

                {
                  this.props.footer
                  && <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={this.onCancel}>
                    {this.props.footer}
                  </div>
                }

                {
                  this.props.action
                  && <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={this.actOnAction}>
                    {this.props.action}
                  </div>
                }
              </div>
            }
          </div>

          <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
            <Drawer
              anchor="bottom"
              open={this.state.open}
              classes={{ paper: classes.paper }}
            >
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
              classes={{ paper: classes.paper }}
            >
              <div style={{ margin: "1.5rem" }}>
                <FlexView column style={{ textAlign: "center", marginTop: "0.5rem" }}>
                  <div className="headline6 highEmphasis">{localeObj.help_customer_care}</div>
                  <div className="body2 highEmphasis" style={{ marginTop: "1rem" }}>{localeObj.help_contact_cc}</div>
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
      </div>
    );
  }
}

ImageHTMLInformationComponent.propTypes = {
  classes: PropTypes.object,
  type: PropTypes.string,
  appBar: PropTypes.bool,
  secBtnText: PropTypes.string,
  giftCardIcon: PropTypes.bool,
  icon: PropTypes.string,
  header: PropTypes.string,
  subHeader: PropTypes.string,
  suggestion: PropTypes.string,
  description: PropTypes.any,
  card: PropTypes.bool,
  charge: PropTypes.string,
  subText: PropTypes.any,
  tip: PropTypes.any,
  extra: PropTypes.any,
  btnText: PropTypes.string,
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
  onBack: PropTypes.func,
  appBarInverse: PropTypes.bool,
  appBarAction: PropTypes.string,
  appBarTitle: PropTypes.string,
  descriptionStyles: PropTypes.object,
  subTextStyles: PropTypes.object,
  tipStyles: PropTypes.object
};

export default withStyles(styles)(ImageHTMLInformationComponent);
