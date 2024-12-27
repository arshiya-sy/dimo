import React from "react";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import { TextField } from "@mui/material";
import InputThemes from "../../Themes/inputThemes";
import FlexView from "react-flexview/lib";
import GeneralUtilities from "../../Services/GeneralUtilities";
import localeService from "../../Services/localeListService";
import MetricServices from "../../Services/MetricsService";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import Log from "../../Services/Log";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import {
  MuiThemeProvider,
  withStyles,
  MenuItem,
} from "@material-ui/core";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import PageNames from "../../Services/PageNames";
import constantObjects from "../../Services/Constants";
import androidApiCallsService from "../../Services/androidApiCallsService";
import { Snackbar } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import PropTypes from "prop-types";

const theme1 = InputThemes.DetailsTheme;
const styles = InputThemes.multipleInputStyle;
var localeObj = {};
const pageName = PageNames.keyInformation;

class WidgetPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayValue: "",
      incomingPixKeys: [],
      MyPixKeys: [],
      name: ImportantDetails.userName || "",
      userCity: "",
      staticQR: "",
      imgLoaded: false.valueOf,
      noPixKeysAvailable: false,
      isPixKeySelected: false,
      theSelectedPixKey: "",
      previouslySelectedPixKey: "",
      userCEP: "",
    };
    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
    MetricServices.onPageTransitionStart(pageName);
    this.deepLinkCheck().then(() => {});
  }
  componentDidMount() {
    this.getPixKeysAndClaims();
    this.getCity();
    window.onBackPressed = () => this.onBack();
    window.onEditPixKeyDetails = (key) => {
      this.setState({
        theSelectedPixKey: key,
      });
    };
    this.deepLinkCheck().then(() => {});
    this.fetchUserDetails();
  }

  deepLinkCheck = async () => {
    if (
      this.props.location.additionalInfo !== "" &&
      this.props.location.additionalInfo !== undefined
    ) {
      let pixKey = this.props.location.additionalInfo["pixKey"];
      if (pixKey !== "" && pixKey !== undefined) {
        await this.setState({ selectedPixKey: pixKey });
      }
    }
  };

  onBack = () => {
    this.props.history.replace({
      pathname: "/newWalletLaunch",
      transition: "right",
    });
  };

  showProgressDialog = () => {
    this.setState({
      processing: true,
    });
  };

  hideProgressDialog = () => {
    this.setState({
      processing: false,
    });
  };

  openSnackBar = (message) => {
    this.setState({
      snackBarOpen: true,
      snackBarMessage: message,
    });
  };

  closeSnackBar = () => {
    this.setState({ snackBarOpen: false });
  };

  handleChange = (name) => (event) => {
    if (name === "pixKeys" && event.target.value.length != 0) {
      this.setState({
        selectedPixKey: event.target.value,
        isPixKeySelected: true,
      });
    } else if (name === "city" && event.target.value.length != 0) {
      const re = /^[A-Za-z\u00C0-\u00FF ]+$/;
      if (re.test(event.target.value)) {
        this.setState({ [name]: event.target.value });
      }
    } else if (name === "name" && event.target.value.length != 0) {
      const re = /^[A-Za-z\u00C0-\u00FF ]+$/;
      if (re.test(event.target.value)) {
        this.setState({ [name]: event.target.value });
      }
    } else {
      this.setState({ [name]: event.target.value });
    }
  };

  goToPixPage = () => {
    this.props.history.replace({
      pathname: "/myPixKeysComponent",
      transition: "right",
    });
  };

  getPixKeysAndClaims = () => {
    this.showProgressDialog();
    ArbiApiService.getAllPixKeys(pageName).then((response) => {
      this.hideProgressDialog();
      if (response.success) {
        let responseHandler = ArbiResponseHandler.processGetAllPixKeysResponse(
          response.result
        );
        if (responseHandler.success) {
          const pixKeys = responseHandler.pixKeys;
          this.setState({
            MyPixKeys: pixKeys,
          });
          Log.verbose(
            "mypixkeys " + JSON.stringify(this.state.MyPixKeys),
            pageName
          );
          this.checkIfTheresAIncomingPixRequest();
        }
      }
    });

    if (this.state.MyPixKeys.length === 0) {
      this.setState({
        noPixKeysAvailable: true,
      });
    }

    ArbiApiService.getPixKeyClaimStatus(pageName).then((response) => {
      if (response.success) {
        let responseHandler = ArbiResponseHandler.processPixStatusResponse(
          response.result
        );
        if (responseHandler.success) {
          this.setState({
            incomingPixKeys: responseHandler.incomingClaims,
            outgoingClaims: responseHandler.outgoingClaims,
          });
          Log.sDebug(
            "response for icnoming/outgoing is " +
              JSON.stringify(responseHandler.incomingClaims) +
              " " +
              JSON.stringify(responseHandler.outgoingClaims),
            pageName
          );

          this.checkIfTheresAIncomingPixRequest();
        }
      } else {
        Log.sError("error in getting pix claim status", pageName);
      }
    });
  };

  checkIfTheresAIncomingPixRequest = () => {
    Log.sDebug("check If Theres A Incoming Pix Request", "MyPixKeysComponent");
    let copyOfMyPixKeys = JSON.parse(JSON.stringify(this.state.MyPixKeys));
    this.state.MyPixKeys.forEach((pixKey, index) => {
      this.state.incomingPixKeys.forEach((incomingPixKey) => {
        if (
          pixKey.key_type === incomingPixKey.pixKeyType &&
          pixKey.key_value === incomingPixKey.pixKeyValue
        ) {
          copyOfMyPixKeys[index]["incomingPortability"] = incomingPixKey;
        }
      });
    });
    Log.sDebug(
      "check If Theres A Incoming Pix Reques with copy Of My Pix Keys",
      "MyPixKeysComponent"
    );
    this.setState({
      MyPixKeys: copyOfMyPixKeys,
    });
  };

  onSecondary = () => {
    if (!this.state.isPixKeySelected && this.state.theSelectedPixKey === "") {
      this.openSnackBar(localeObj.select_pix_key);
    }
    const val = androidApiCallsService.checkOverlayDisplayPermission();
    if (!val) {
      androidApiCallsService.requestOverlayDisplayPermission();
    } else {
      if (this.state.userCity === "" || this.state.userCEP === "") {
        this.openSnackBar(localeObj.tryAgainLater);
      } else {
        this.loadStaticQRCode()
          .then((staticQRData) => {
            androidApiCallsService.setUpQRWidget(
              this.state.name,
              this.state.selectedPixKey,
              this.state.userCity,
              staticQRData,
              this.state.userCEP
            );
            this.openSnackBar(localeObj.details_saved);
            setTimeout(() => {
              androidApiCallsService.closeWindow(
                "Close app from element actions"
              );
            }, 1000);
          })
          .catch((error) => {
            console.error("Error loading static QR code:", error);
          });
      }
    }
  };

  getCity = () => {
    ArbiApiService.getAllClientData(pageName).then((response) => {
      if (response.success) {
        let processedResponse =
          ArbiResponseHandler.processGetAllClientDataResponse(response.result);
        if (
          processedResponse.success &&
          GeneralUtilities.notEmptyNullUndefinedCheck(
            processedResponse.city,
            false
          )
        ) {
          const userCity = processedResponse?.city;
          this.setState({
            userCity: userCity,
          });
        }
        this.setState({
          creationState: "address",
          direction: "left",
          address: GeneralUtilities.formatAddress(processedResponse.data),
        });
      } else {
        let jsonObj = {};
        jsonObj["header"] = localeObj.failed_address;
        jsonObj["description"] = response.result.message;
        this.setState({
          errorJson: jsonObj,
          creationState: "error",
          direction: "left",
        });
      }
    });
  };

  loadStaticQRCode = () => {
    let jsonObject = {};
    jsonObject["pixKey"] = this.state.selectedPixKey;
    jsonObject["Amount"] = 0;
    jsonObject["Description"] = "Send money without any hassle";

    return new Promise((resolve, reject) => {
      ArbiApiService.generateStaticQrCodeForPixKey(jsonObject, pageName).then(
        (response) => {
          if (response.success) {
            let processedResult =
              ArbiResponseHandler.processGenerateStaticQrCodeResponse(
                response.result,
                this.state.selectedPixKey
              );
            if (processedResult.success) {
              // Resolve with the static QR code data
              const staticQRData =
                "data:image/png;base64, " + processedResult.qrCode.data;
              resolve(staticQRData);
            } else {
              reject("Error processing static QR code.");
            }
          } else {
            reject("API request failed.");
            Log.sDebug(
              "error - " + JSON.stringify(response.result),
              pageName,
              constantObjects.LOG_PROD
            );
          }
        }
      );
    });
  };

  fetchUserDetails() {
    ArbiApiService.getAllClientData(pageName).then((response) => {
      if (response.success) {
        Log.sDebug("User Details Fetched", "WidgetPage");
        let processorResponse =
          ArbiResponseHandler.processGetAllClientDataResponse(
            response.result,
            "profile"
          );
        if (processorResponse.success) {
          Log.sDebug("User Details Fetched: ");
          this.getProfileDetailsOfUser(processorResponse.data);
        } else {
          Log.sDebug("fetchUserDetails, Error getting user details");
        }
      } else {
        Log.sDebug("fetchUserDetails");
      }
    });
  }

  getProfileDetailsOfUser(data) {
    let clientData = data.endereco;
    Log.sDebug("getProfileDetailsOfUser: " + JSON.stringify(data));
    this.setState({
      userCEP: clientData.cep,
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <div>
          <ButtonAppBar
            header={localeObj.QR_widget_header}
            action="none"
            onBack={this.onBack}
          />
        </div>

        <div style={InputThemes.initialMarginStyle}>
          <FlexView column>
            <div
              className="headline5 highEmphasis"
              style={{ textAlign: "left" }}
            >
              {localeObj.setup_QR}
            </div>
            <p
              className="body2 highEmphasis"
              style={{ textAlign: "left", marginTop: "0.5rem" }}
            >
              {localeObj.QR_widget_body}
            </p>
          </FlexView>

          <FlexView column>
            <MuiThemeProvider theme={theme1}>
              <TextField
                style={{ margin: "8px" }}
                label={localeObj.fullname}
                onChange={this.handleChange("name")}
                value={this.state.name || ""}
                InputProps={{
                  classes: { underline: classes.underline },
                  className:
                    this.state.name === "" ? classes.input : classes.finalInput,
                  style: { color: "white" },
                  readOnly: true,
                }}
                autoComplete="off"
                InputLabelProps={{
                  className:
                    this.state.name === "" ? classes.input : classes.finalStyle,
                  style: { color: "white" },
                }}
              />

              <TextField
                label={localeObj.pix_keys}
                style={{ margin: "8px" }}
                onChange={this.handleChange("pixKeys")}
                value={this.state.selectedPixKey || ""}
                InputProps={{
                  classes: { underline: classes.underline },
                  className:
                    this.state.selectedPixKey === ""
                      ? classes.input
                      : classes.finalInput,
                  style: { color: "white" },
                }}
                autoComplete="off"
                InputLabelProps={{
                  className:
                    this.state.selectedPixKey === ""
                      ? classes.input
                      : classes.finalStyle,
                  style: { color: "white" },
                }}
                select
              >
                {this.state.MyPixKeys.map((pixKey, index) => (
                  <MenuItem
                    key={index}
                    value={
                      this.state.theSelectedPixKey
                        ? this.state.theSelectedPixKey
                        : pixKey.key_value
                    }
                  >
                    {pixKey.key_value}
                  </MenuItem>
                ))}

                {this.state.noPixKeysAvailable && (
                  <MenuItem value="gotoPixPage" onClick={this.goToPixPage}>
                    {localeObj.go_to_pix}
                  </MenuItem>
                )}
              </TextField>

              <TextField
                style={{ margin: "8px" }}
                label={localeObj.city}
                onChange={this.handleChange("city")}
                value={this.state.userCity || ""}
                InputProps={{
                  classes: { underline: classes.underline },
                  className:
                    this.state.city === "" ? classes.input : classes.finalInput,
                  style: { color: "white" },
                  readOnly: true,
                }}
                autoComplete="off"
                InputLabelProps={{
                  className:
                    this.state.city === "" ? classes.input : classes.finalStyle,
                  style: { color: "white" },
                }}
              />
            </MuiThemeProvider>
          </FlexView>
        </div>

        <div style={{ display: this.state.processing ? "block" : "none" }}>
          {this.state.processing && <CustomizedProgressBars />}
        </div>

        <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
          <PrimaryButtonComponent
            btn_text={localeObj.save}
            onCheck={this.onSecondary}
          />
        </div>

        <MuiThemeProvider theme={InputThemes.snackBarTheme}>
          <Snackbar
            open={this.state.snackBarOpen}
            autoHideDuration={constantObjects.SNACK_BAR_DURATION}
            onClose={this.closeSnackBar}
          >
            <MuiAlert elevation={6} variant="filled" icon={false}>
              {this.state.snackBarMessage}
            </MuiAlert>
          </Snackbar>
        </MuiThemeProvider>
      </div>
    );
  }
}
WidgetPage.propTypes = {
  location: PropTypes.object,
  classes: PropTypes.object,
  history: PropTypes.object,

};
export default withStyles(styles)(WidgetPage);
