import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import constantObjects from "../../../Services/Constants";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import PageState from "../../../Services/PageState";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";

import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import ColorPicker from "../../../Services/ColorPicker";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import EditIcon from '@material-ui/icons/Edit';
import GeneralUtilities from "../../../Services/GeneralUtilities";

const styles = InputThemes.singleInputStyle;
const theme1 = InputThemes.snackBarTheme;
var localeObj = {};

class CreditCardResumeOnboarding extends React.Component {
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
        textAlign: "center"
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
    this.props.onSecondary();
  }

  onPrimary = () => {
    this.props.onPrimary();
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

  edit = (option, details) => {
    this.props.editOnboardingDetails(option, details);

  }

  render() {
    const { classes } = this.props;
    const finalHeight = window.screen.height;
    const finalWidth = window.screen.width;
    const Details = [
      {
        "header": localeObj.resume_cc_list1,
        "details": "R$ " + GeneralUtilities.formatBalanceWithoutDecimal(this.props.creditLimit),
        "edit": true
      },
      {
        "header": localeObj.resume_cc_list2,
        "details": GeneralUtilities.formattedString(localeObj.resume_cc_list2_desc, [this.props.dueDate]),
        "edit": true
      }
    ]

    return (
      <div style={{ height: `${finalHeight}px` }}>
        {this.props.appBar &&
          <ButtonAppBar header="" onCancel={this.onCancel} action="cancel" inverse="true" />}
        <div className="scroll" style={{ height: this.props.secBtnText ? `${finalHeight * 0.6}px` : `${finalHeight * 0.65}px`, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
            <span>
              <img style={{ width: `${finalWidth * 0.7}px`, marginTop: "2.5rem" }} src={this.props.icon} alt="" />
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

          <MuiThemeProvider theme={theme1}>
            <div style={{ margin: "2rem" }}>
              <List>
                {
                  Details.map((opt, key) => (
                    <ListItem key={key} button>
                      <ListItemText style={{ wordWrap: "break-word" }} primary={opt.header} secondary={opt.details} />
                      {opt.edit &&
                        <EditIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "0.875rem" }}
                          onClick={() => this.edit(opt.header, opt.details)} />}
                    </ListItem>
                  ))
                }
              </List>
            </div>
          </MuiThemeProvider>
          {this.props.btnText &&
            <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
              <PrimaryButtonComponent btn_text={this.props.btnText} onCheck={this.next} disabled={this.props.disabled} />
              {this.props.secBtnText && <SecondaryButtonComponent btn_text={this.props.secBtnText} onCheck={this.props.close} />}
              {this.props.footer &&
                <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={this.onCancel}>
                  {this.props.footer}
                </div>}
              {this.props.action &&
                <div className="Body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={this.actOnAction}>
                  {this.props.action}
                </div>}
            </div>
          }
        </div>
        <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
          <Drawer classes={{ paper: classes.paper }}
            anchor="bottom"
            open={this.props.bottomSheet}
          >
            <div style={{ margin: "1.5rem" }}>
              <FlexView column style={{ marginTop: "0.5rem" }}>
                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                  {localeObj.resume_cc_bs_head}
                </div>
                <div className="body2 mediumEmphasis" style={{ display: this.props.bottomSheetDesc === undefined ? "block" : "none", textAlign: "center", marginTop: "1rem" }}>
                  {localeObj.resume_cc_bs_desc1}
                </div>
                {/* <div className="body2 mediumEmphasis" style={{ display: this.props.bottomSheetDesc === undefined ? "block" : "none", textAlign: "center", marginTop: "1rem" }}>
                  {localeObj.resume_cc_bs_desc2}
                </div> */}
              </FlexView>
            </div>
            <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
              <PrimaryButtonComponent btn_text={localeObj.resume_cc_bs_primary} onCheck={this.onPrimary} />
              <SecondaryButtonComponent btn_text={localeObj.resume_cc_bs_secondary} onCheck={this.onSecondary} />
            </div>
          </Drawer>
        </div>

      </div>
    );
  }
}

CreditCardResumeOnboarding.propTypes = {
  classes: PropTypes.object.isRequired,
  type: PropTypes.string,
  next: PropTypes.func,
  onCancel: PropTypes.func,
  onSecondary: PropTypes.func,
  onPrimary: PropTypes.func,
  handleBottomSheet: PropTypes.func,
  editOnboardingDetails: PropTypes.func,
  icon: PropTypes.string,
  header: PropTypes.string,
  subHeader: PropTypes.string,
  suggestion: PropTypes.string,
  description: PropTypes.string,
  card: PropTypes.bool,
  charge: PropTypes.string,
  subText: PropTypes.string,
  tip: PropTypes.string,
  btnText: PropTypes.string,
  secBtnText: PropTypes.string,
  footer: PropTypes.string,
  action: PropTypes.string,
  disabled: PropTypes.bool,
  bottomSheet: PropTypes.bool,
  bottomSheetDesc: PropTypes.string,
  creditLimit: PropTypes.number,
  noAction: PropTypes.bool,
  noBottomSheet: PropTypes.bool,
  onAction: PropTypes.func,
  dueDate: PropTypes.number,
  appBar: PropTypes.bool,
  close: PropTypes.string
};

export default withStyles(styles)(CreditCardResumeOnboarding);
