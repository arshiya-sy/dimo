import React from "react";
import "../../styles/main.css";
import PropTypes from "prop-types";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import identity from "../../images/SpotIllustrations/ID.png";
import PageNames from "../../Services/PageNames";
import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import ArbiApiService from "../../Services/ArbiApiService";
import InputThemes from "../../Themes/inputThemes";
import constantObjects from "../../Services/Constants";
import Log from "../../Services/Log";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from '@material-ui/core/styles';

const PageName = PageNames.identificationInfo;
var localeObj = {};

export default class IdentificationPageComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      processing: false
    }
    this.confirmUserEmail = this.confirmUserEmail.bind(this);
    this.componentName = PageNames.identificationInfo;
    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
  }

  componentDidMount() {
    androidApiCalls.enablePullToRefresh(false);
    window.onBackPressed = () => {
      this.onCancel();
    }
  }

  confirmUserEmail = () => {
    this.showProgressDialog();
    ArbiApiService.confirmEmailId(this.componentName)
      .then(response => {
        this.hideProgressDialog();
        if (response.success) {
          let repsonseHandler = ArbiResponseHandler.processEmailIdResponse(response.result);
          if (repsonseHandler.success) {
            this.setState({
              snackBarOpen: true,
              message: repsonseHandler.message
            })
            this.props.history.replace("/identityCreation");
          }
        } else {
          this.props.history.replace("/identityCreation");
        }
      }).catch(err => {
        this.props.history.replace("/identityCreation");
        Log.debug(err.response.error.details);
      });
  }

  onCancel = () => {
    this.props.history.replace({ pathname: "/", transition: "right" });
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

  closeSnackBar = () => {
    this.setState({ snackBarOpen: false })
  }

  render() {
    return (
      <div style={{ overflowX: "hidden" }}>
        <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
          <ImageInformationComponent header={localeObj.identification} onCancel={this.onCancel} icon={identity} type={PageName}
            appBar={true} description={localeObj.identification_description} btnText={localeObj.start} next={this.confirmUserEmail} />
        </div>
        <MuiThemeProvider theme={InputThemes.snackBarTheme}>
          <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
          </Snackbar>
        </MuiThemeProvider>
        <div style={{ display: this.state.processing ? 'block' : 'none' }}>
          {this.state.processing && <CustomizedProgressBars />}
        </div>
      </div >
    );
  }
}

IdentificationPageComponent.propTypes = {
  history: PropTypes.object
}