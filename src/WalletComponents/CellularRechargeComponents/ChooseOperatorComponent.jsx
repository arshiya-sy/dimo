import React from "react";
import PropTypes from "prop-types";

import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import MuiAlert from '@material-ui/lab/Alert';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import PageNames from '../../Services/PageNames';
import PageState from "../../Services/PageState";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import arbiApiService from "../../Services/ArbiApiService";
import MetricServices from "../../Services/MetricsService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import GeneralUtilities from "../../Services/GeneralUtilities";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";

const theme1 = InputThemes.OperatorMenuTheme;
var localeObj = {};

const ColoredTextButton = withStyles({
  root: {
    color: ColorPicker.duskHorizon,
    textTransform: "none"
  },
})((props) => <Button color="default" {...props} />);
export default class ChooseOperatorComp extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      displayAmountList: [],
      amountList: [],
      checkedValues: [],
      selectedIndex: -1,
      snackBarOpen: false,
      more: true
    };
    this.providersList = this.props.details.providersList || [];
    this.providersId = this.props.details.providersId || [];
    this.mnpList = [];
    for (let i = 0; i < this.providersList.length; i++) {
      let sampleObject = {
        name: this.providersList[i],
        id: this.providersId[i]
      }
      this.mnpList.push(sampleObject);
    }
    if (this.props.componentName) {
      this.componentName = this.props.componentName;
    } else {
      this.componentName = PageNames.cellularRechargeComponent.operator;
    }
    MetricServices.onPageTransitionStart(this.componentName);
    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
  }

  componentDidMount() {
    androidApiCalls.enablePullToRefresh(false);
    document.addEventListener("visibilitychange", this.visibilityChange);
    window.onBackPressed = () => {
      if (this.state.processing) {
        this.openSnackBar(localeObj.no_action);
      } else {
        this.props.onBack();
      }
    }
    if (this.props.details.selectedProvider) {
      let objFirst = this.mnpList.find(obj => obj.name === this.props.details.selectedProvider);
      let objIndex = this.mnpList.findIndex(obj => obj.name === this.props.details.selectedProvider);
      if (objIndex > 3) {
        this.mnpList = this.removeByAttr(this.mnpList, 'id', objFirst.id);
        this.mnpList.unshift(objFirst);
        let eleId = this.mnpList[0].id;
        this.setInitialId(eleId, 0);
      } else {
        let newEleId = objFirst.id;
        this.setInitialId(newEleId, objIndex);
      }
    }
  }

  visibilityChange = () => {
    let visibilityState = document.visibilityState;
    if (visibilityState === "hidden") {
      MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
    } else if (visibilityState === "visible") {
      MetricServices.onPageTransitionStart(this.componentName);
    }
  }

  async setInitialId(boxId, boxIndex) {
    let ele = await this.getElementByIdAsync(boxId);
    ele.style.borderWidth = "3px";
    ele.style.border = "3px solid transparent";
    ele.style.background = "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box";
    this.setState({
      currentId: boxId,
      checkedValues: [boxId],
      selectedIndex: boxIndex
    })
  }

  getElementByIdAsync = id => new Promise(resolve => {
    const getElement = () => {
      const element = document.getElementById(id);
      if (element) {
        resolve(element);
      } else {
        requestAnimationFrame(getElement);
      }
    };
    getElement();
  });

  componentWillUnmount() {
    document.removeEventListener("visibilitychange", this.visibilityChange);
  }

  onNext = () => {
    if (this.state.selectedIndex === -1) {
      this.openSnackBar(localeObj.invalid_operator);
      return;
    }
    this.showProgressDialog();
    arbiApiService.getRechargeValues("0" + this.props.details.ddd, this.mnpList[this.state.selectedIndex].id, this.componentName)
      .then(response => {
        this.hideProgressDialog();
        if (response.success) {
          let processorResponse = ArbiResponseHandler.processRechargeValuesApiResponse(response.result);
          if (processorResponse.success) {
            this.setState({ displayAmountList: [...this.state.displayAmountList, ...processorResponse.displayAmountList] });
            this.setState({ amountList: [...this.state.amountList, ...processorResponse.amountList] });
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.onInputProvider({
              selectedProviderId: this.mnpList[this.state.selectedIndex].id,
              selectedProvider: this.mnpList[this.state.selectedIndex].name,
              displayAmountList: this.state.displayAmountList,
              amountList: this.state.amountList
            });
          }
        } else {
          this.hideProgressDialog();
          Log.debug("Get provider list failed with error - " + response.error.message);
          this.openSnackBar(localeObj.tryAgainLater);
          return ("");
        }
      });
  };

  onBack = () => {
    GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
  }

  closeSnackBar = () => {
    this.setState({ snackBarOpen: false })
  }

  openSnackBar = (message) => {
    this.setState({
      snackBarOpen: true,
      message: message
    })
  }

  showProgressDialog = () => {
    this.setState({
      processing: true
    })
  }

  hideProgressDialog = () => {
    this.setState({
      processing: false
    })
  }

  removeByAttr = (arr, attr, value) => {
    var i = arr.length;
    while (i--) {
      if (arr[i]
        && Object.prototype.hasOwnProperty.call(arr[i], attr)
        && arr[i][attr] === value) {
        arr.splice(i, 1);
      }
    }
    return arr;
  }

  changeShowStatus = (statusChange) => {
    if (statusChange.toString() === "hide" && this.state.selectedIndex > 3) {
      let objectFirst = this.mnpList[this.state.selectedIndex];
      this.mnpList = this.removeByAttr(this.mnpList, 'id', this.state.currentId);
      this.mnpList.unshift(objectFirst);
      let timeoutId = setInterval(() => {
        clearInterval(timeoutId);
        let eleId = this.mnpList[0].id;
        this.setInitialId(eleId, 0);
      }, 10);
    }

    this.setState({
      more: !this.state.more
    })
    let timeoutId = setInterval(() => {
      clearInterval(timeoutId);
      let eleId = this.mnpList[this.state.selectedIndex].id;
      let eleIndex = this.state.selectedIndex;
      this.setInitialId(eleId, eleIndex);
      //this.setInitialId(this.state.selectedIndex);
    }, 10);
  }

  setChecked = (boxId, indexValue) => {
    let ele = document.getElementById(this.state.currentId);
    if (ele) {
      ele.style.border = "1px solid " + ColorPicker.darkMediumEmphasis;
      ele.style.background = "none";
    }
    document.getElementById(boxId).style.borderWidth = "3px";
    document.getElementById(boxId).style.border = "3px solid transparent";
    document.getElementById(boxId).style.background = "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box";

    this.setState({
      currentId: boxId,
      checkedValues: [boxId],
      selectedIndex: indexValue
    })
  }

  render() {
    const screenHeight = window.screen.height;
    return (
      <div>
        <MuiThemeProvider theme={theme1}>
          <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
            <div style={InputThemes.initialMarginStyle}>
              <span className="headline5 highEmphasis">
                {localeObj.choose_operator}
              </span>
            </div>
            {!this.state.more &&
              <div style={{ overflowY: "auto", height: `${screenHeight - 340}px`, overflowX: "hidden" }}>
                {
                  this.mnpList.map((item, index) => (
                    <Paper key={index} id={item.id} elevation="0"
                      variant="outlined" onClick={() => { this.setChecked(item.id, index) }}>
                      <span style={{ flex: "1", textAlign: "center" }} className="body1 highEmphasis">{item.name}</span>
                    </Paper>
                  ))
                }
                <div className="pixEditButton" style={{ margin: "1rem", textAlign:"center" }}>
                  <ColoredTextButton className="body2" onClick={() => this.changeShowStatus("hide")} >{localeObj.show_less_carriers}</ColoredTextButton>
                </div>
              </div>
            }
            {this.state.more &&
              <div style={{ overflowY: "auto", height: `${screenHeight - 340}px` }}>
                {
                  this.mnpList.slice(0, 4).map((item, index) => (
                    <Paper key={index} id={item.id} elevation="0"
                      variant="outlined" onClick={() => { this.setChecked(item.id, index) }}>
                      <span style={{ flex: "1", textAlign: "center" }} className="body1 highEmphasis">{item.name}</span>
                    </Paper>
                  ))
                }
                <div className="pixEditButton" style={{ margin: "1rem", textAlign:"center" }}>
                  <ColoredTextButton className="body2" onClick={() => this.changeShowStatus("show")} >{localeObj.show_more_carriers}</ColoredTextButton>
                </div>
              </div>
            }
            <div style={{...InputThemes.bottomButtonStyle, textAlign:"center"}}>
              <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.onNext} />
            </div>
          </div>
          <div style={{ display: this.state.processing ? 'block' : 'none' }}>
            {this.state.processing && <CustomizedProgressBars />}
          </div>
          <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
          </Snackbar>
        </MuiThemeProvider>
      </div >
    )
  }
}
ChooseOperatorComp.propTypes = {
  componentName: PropTypes.string,
  onBack: PropTypes.func,
  details: PropTypes.object,
  history: PropTypes.object,
  onInputProvider: PropTypes.func
};