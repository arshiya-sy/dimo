import React from "react";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import localeService from "../../Services/localeListService";
import { CSSTransition } from "react-transition-group";
import androidApiCalls from "../../Services/androidApiCallsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import PhoneNumberComponent from "../OnBoardingSupportComponents/PhoneNumberComponent";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import ProgressBar from "../CommonUxComponents/ProgressBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import { copyUserCreationParametersIntoClientCreationJson } from "../../Services/ClientCreationJson";
import ArbiApiService from "../../Services/ArbiApiService";

import Drawer from "@material-ui/core/Drawer";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import { AuthStateContext } from "../../ContextProviders/AuthProvider";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import apiService from "../../Services/apiService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import PushNotificationOptinComp from "./PushNotificationOptinComp";
import walletJwtService from "../../Services/walletJwtService";
import NewUtilities from "../../Services/NewUtilities";
import MultipleInputFormComponent from "../OnBoardingSupportComponents/MultipleInputFormComponent";

import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import MetricsService from "../../Services/MetricsService";

const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.userId;
const PHONE_STATE_PERMISSION = "android.permission.READ_PHONE_STATE";
var localeObj = {};

class UserIdCreation extends React.Component {
  biometricAvailability = Object.freeze({ SUCCESS: "success", FAILURE: "failure", NEEDS_SETUP: "require" });
  bottomSheetTypes = Object.freeze({ ENABLE_FP_WARNING: "ENABLE_FP_WARNING", DISABLE_FP_WARNING: "DISABLE_FP_WARNING", FORGOT_PASSWORD: "FORGOT_PASSWORD", WRONG_PASSWORD: "WRONG_PASSWORD" });
  static contextType = AuthStateContext;

  constructor(props) {
    super(props);
    this.state = {
      creationState: this.props.location?.state?.creationState || "nameCPF",
      name: this.props.location?.state?.name || "",
      email: this.props.location?.state?.email || "",
      repeatEmail: "",
      direction: "",
      cpf: this.props.location?.state?.cpf || "",
      phoneNumber: this.props.location?.state?.phoneNumber || "",
      ddd: this.props.location?.state?.ddd || "",
      displayNumber: this.props.location?.state?.displayNumber || "",
      cancelState: false,
      actualDdd: "",
      password: this.props.location?.state?.passwordData?.field1 || "",
      snackBarOpen: false,
      message: "",
      repeatPassword: this.props.location?.state?.passwordData?.field1 || "",
      whatsappOptIn: "undecided",
      whatsappOptInTimestamp: Date.now(),
      emailOptIn: "false",
      emailOptInTimestamp: Date.now(),
      isNonMoto: androidApiCalls.checkIfNm(),
      country: androidApiCalls.getShipmentCountry(),
      open: false,
      fpOpen: false,
      step: this.props.location?.state?.step || 1,
      allowAutoPopulate: false,
      isNextEnabled: false,
      isNextEnabledPassword: this.props.location?.state?.passwordData?.isNextEnabledPassword || false,
      passwordData: "",
      isBackClicked: false,
      fromForgetPassword: false,
      navigated: false,
    };
    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
    this.clientKey = "";
    this.setField = this.setField.bind(this);
    this.onBack = this.onBack.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.setDDD = this.setDDD.bind(this);

    this.componentName = "UserIdCreation";
  }

  componentDidMount() {
    this.getOnboardingAccessToken();
    androidApiCalls.enablePullToRefresh(false);
    window.onBackPressed = () => {
      if (this.state.open) {
        this.setState({ open: false });
      } else if (this.state.emailAlert) {
        this.isEmailAlert(false)
      } else {
        this.onBack();
      }
    };

    window.onRequestPermissionsResult = (permission, status) => {
      if (permission === PHONE_STATE_PERMISSION) {
        if (status === true) {
          this.setState({
            allowAutoPopulate: true,
          });
        } else {
          this.setState({
            snackBarOpen: true,
            message: localeObj.phone_state_permission_denied,
          });
        }
      }
    };

    if (androidApiCalls.hasCoarsePermission()) {
      androidApiCalls.getCurrentLocation();
    }
    window.onCurrentLocationComplete = (response) => {
      if (response === "enable_location_setting" || response === "cancelled" ||
        response === "request_permission" || response === "failure") {
        this.setState({ locationFetched: false })
      } else {
        this.setState({
          locationFetched: true,
          latitude: response["Latitude"],
          longitude: response["Longitude"]
        })
      }
    }

    if (this.props.location.state?.from === "forgetPassword") {
      this.setState({ fromForgetPassword: true })
    } else {
      this.checkAndroidPermissions();
    }
  }

  getOnboardingAccessToken = async () => {
    await arbiApiService.getOnboardingAuthToken().then((response) => {
      Log.sDebug("getOnboardingAccessToken:" + JSON.stringify(response));
      if (response && response.success) {
        ImportantDetails.onboardingAcessToken = response.result;
      }
    });
  };

  checkAndroidPermissions = () => {
    if (androidApiCalls.checkSelfPermission(PHONE_STATE_PERMISSION) === 0) {
      this.setState({
        allowAutoPopulate: true,
      });
    } else {
      androidApiCalls.requestPermission(PHONE_STATE_PERMISSION);
    }
  };

  setDDD = (json) => {
    this.setState({
      actualDdd: json["field"],
      // DD is usually two digits, but ARBI expects, 3 digit input
      ddd: "0" + json["field"],
      whatsappOptIn: json["optin"],
    });
  };

  setField = (field) => {
    let timeoutId;
    let timeoutPhone;
    switch (this.state.creationState) {
      case "nameCPF":
        this.setState({
          name: field["field1"],
          cpf: field["field2"],
          isNextEnabled: field["isNextEnabled"],
        });
        ImportantDetails.cpf = field["field2"];
        this.fetchTokenForCAF(field["field2"]);
        return this.getOnboardingKey(field["field2"], field["field1"]);
      case "email":
        this.setState({
          email: field["field1"],
          repeatEmail: field["field2"],
          emailOptIn: field["optin"],
          emailOptInTimestamp: this.state.emailOptInTimestamp,
        });
        this.registerClientEmail(field["field1"]);
        timeoutId = setInterval(() => {
          clearInterval(timeoutId);
          this.setPreOptinStatus("email");
        }, 1.5 * 1000);
        break;
      case "notification":
        this.setState({
          creationState: "phoneNumber",
          direction: "left",
          step: this.state.step + 1,
        });
        break;
      case "phoneNumber":
        this.setState({
          phoneNumber: field["phoneNumber"],
          displayNumber: field["displayNumber"],
          ddd: field["ddd"],
          whatsappOptIn: field["optin"],
          whatsappOptInTimestamp: this.state.whatsappOptInTimestamp,
          direction: "left",
          step: this.state.step + 1,
        });
        this.sendOtpToken(field);
        timeoutPhone = setInterval(() => {
          clearInterval(timeoutPhone);
          this.setPreOptinStatus("phone");
        }, 1.5 * 1000);
        break;
      case "password":
        if (this.state.fromForgetPassword) {
          this.setState(
            {
              password: field["field1"],
              repeatPassword: field["field2"]
            },
            this.newPassword(field["field1"])
          );
        } else {
          this.setState(
            {
              password: field["field1"],
              repeatPassword: field["field2"],
              isNextEnabledPassword: field["isNextEnabledPassword"],
              isLengthValid: field["isLengthValid"],
              hasNumber: field["hasNumber"],
              hasCapitalLetter: field["hasCapitalLetter"],
              hasSpecialCharacter: field["hasSpecialCharacter"],
              passwordsMatch: field["passwordsMatch"],
              passwordData: field,
              direction: "left",
              step: this.state.step + 1,
            },
            this.createNewUser(field["field1"])
          );
        }
        break;
      default:
        break;
    }
  };

  newPassword = (password) => {
    let passwordChangeObj = {}
    passwordChangeObj['token'] = this.props.location.state.forgetPasswordOTP;
    passwordChangeObj['newPassword'] = password;
    passwordChangeObj['cpf'] = this.props.location.state.cpf;

    this.showProgressDialog();
    arbiApiService.changeForgottenPasswordPhone(passwordChangeObj, PageNames.userId)
      .then(response => {
        this.hideProgressDialog();
        if (response && response.success) {
          let processorResponse = ArbiResponseHandler.processChangePasswordResponse(response.result);
          if (processorResponse && processorResponse.success) {
            this.setState({
              message: localeObj.password_change_success,
              snackBarOpen: true,
              flag: true
            })
            androidApiCalls.setBiometricFlag(0);
            this.props.history.replace({ pathname: "/newLogin", transition: "right" });
          } else {
            this.setState({
              snackBarOpen: true,
              message: localeObj.tryAgainLater
            })
            return;
          }
        } else {
          let errorJSON = {
            "header": localeObj.password_change_failed,
            "description": response.result.message
          };
          this.setState({
            errors: errorJSON,
            creationState: "error",
            direction: "left"
          });
          return;
        }
      });
  }

  createNewUser = (password) => {
    if (!this.state.processing) {
      if (!navigator.onLine) {
        this.setState({
          snackBarOpen: true,
          message: localeObj.noNetwork,
        });
        return;
      }
      this.showProgressDialog();
      ArbiApiService.userCreation(password, this.state.locationFetched, this.state.latitude, this.state.longitude).then((response) => {
        if (response && response.success) {
          this.clientKey = response.result.chaveUsuario;
          ImportantDetails.clientKey = response.result.chaveUsuario;
          this.validateUser();
        } else {
          this.hideProgressDialog();
          this.setState({
            snackBarOpen: true,
            message: localeObj.gift_card_error_head1,
          });
        }
      });
    }
  };

  registerClientEmail = (email) => {
    this.showProgressDialog();
    ArbiApiService.registerEmailOnboarding(email).then((response) => {
      this.hideProgressDialog();
      if (response && response.success) {
        this.setState({
          creationState: "notification",
          direction: "left",
          step: this.state.step + 1,
        });
      } else if (response.status === 400) {
        if ((this.state.currEmail === this.state.email)) {
          this.setState({
            creationState: "notification",
            direction: "left",
            step: this.state.step + 1,
          });
        } else if (response.result.detail === "E-mail inválido.") {
          this.setState({
            snackBarOpen: true,
            message: localeObj.invalid_email,
          });
        } else if (response.result.detail === "E-mail já utilizado.") {
          this.setState({
            snackBarOpen: true,
            message: localeObj.duplicate_email,
          });
        }
      } else {
        this.setState({
          snackBarOpen: true,
          message: localeObj.gift_card_error_head1,
        });
      }
    });
  };

  sendOtpToken = (value) => {
    this.showProgressDialog();
    ArbiApiService.sendingOTPToken(value).then((response) => {
      if (response && response.success) {
        this.hideProgressDialog();
        this.props.history.replace({
          pathname: "/phoneNumberVerification",
          state: {
            step: this.state.step,
            whatsappOptIn: value.optin,
            phoneNumber: value.phoneNumber,
            ddd: value.ddd,
            displayNumber: value.displayNumber,
            cpf: this.state.cpf,
            name: this.state.name,
            email: this.state.email
          },
        });
      } else {
        this.hideProgressDialog();
        this.setState({
          snackBarOpen: true,
          message: localeObj.gift_card_error_head1,
        });
      }
    });
  };

  getOnboardingKey = (cpf, name) => {
    this.showProgressDialog();
    arbiApiService.getOnboardingKey(cpf, name).then((response) => {
      if (response && response.success) {
        let processedResponse = ArbiResponseHandler.processGetOnboardingKeyResponse(response.result);
        if (processedResponse && processedResponse.success) {
          Log.sDebug("getOnboardingKey, processedResponse:" + JSON.stringify(processedResponse));
          ImportantDetails.chaveOnboarding = processedResponse.chaveOnboarding;
          if (processedResponse.status === 0) {
            this.hideProgressDialog();
            this.setState({
              creationState: "email",
              direction: "left",
              step: this.state.step + 1,
            });
          } else if (processedResponse.status === 1) {
            this.hideProgressDialog();
            this.setState({
              creationState: "notification",
              direction: "left",
              step: this.state.step + 1,
            });
          } else if (processedResponse.status === 2) {
            this.hideProgressDialog();

            this.setState({
              creationState: "password",
              direction: "left",
              step: this.state.step + 1,
            });
          } else {
            this.setState({
              open: true,
              bottomHeader: localeObj.duplicate_cpf,
              bottomDescription: localeObj.already_registered,
              primaryBtn: localeObj.login,
              secondaryBtn: localeObj.cancel,
              sheetType: "error",
            });
          }
        } else {
          this.hideProgressDialog();
          Log.sDebug("unexpected error in getting the key");
        }
      } else {
        this.hideProgressDialog();
        Log.verbose("error in getting the key");
      }
    });
  };

  setPreOptinStatus = (type) => {
    var payloadJson = Object.assign({}, {});
    payloadJson.cpf = this.state.cpf;
    if (type === "phone") {
      payloadJson.phoneNumber = this.state.ddd + ":" + this.state.phoneNumber;
      payloadJson.whatsappOptIn = this.state.whatsappOptIn;
      payloadJson.whatsappOptInTimestamp = Date.now();
      this.setValueOptinStatus(payloadJson);
    } else {
      payloadJson.email = this.state.email;
      payloadJson.emailOptIn = this.state.emailOptIn;
      payloadJson.emailOptInTimestamp = Date.now();
      this.setValueOptinStatus(payloadJson);
      if (!this.state.isNonMoto) {
        var optinJson = {
          deviceId: androidApiCalls.getDeviceId(),
          userInfo: [
            {
              email: this.state.email,
              firstName: this.state.name,
              optin: this.state.emailOptIn,
              extraText: {
                optinType: "email",
                country: this.state.country,
                version: "2.5",
                source: "motopay-webview",
              },
            },
          ],
        };
        var android_params = androidApiCalls.getDeviceParameters();
        for (var i in android_params) {
          if (i !== "source") {
            optinJson.userInfo[0].extraText[i] = android_params[i];
          }
        }
        var optinData = JSON.stringify(optinJson);
        var promise = androidApiCalls.optinCall(optinData);
        promise.then(
          (data, status) => {
            Log.sDebug("Subscription confirmed:" + data + " status:" + status);
          },
          (reason) => {
            Log.sDebug(
              "Subscription failed:" + reason,
              this.componentName,
              constantObjects.LOG_PROD
            );
          }
        );
      }
    }
  };

  setValueOptinStatus = (payloadJson) => {
    if (!androidApiCalls.checkIfNm()) {
      payloadJson.deviceId = androidApiCalls.getDeviceId();
      payloadJson.anonymizedSerialNumber =
        NewUtilities.getMetadataForDeviceType();
      payloadJson.serialNumber = androidApiCalls.getBarcode();
      payloadJson.model = androidApiCalls.getModelName();
    } else {
      let deviceDetails = androidApiCalls.getDeviceInformation();
      let deviceDetailsObj = JSON.parse(deviceDetails);
      payloadJson.fcmId = deviceDetailsObj.deviceInfo.fcmId;
    }
    apiService
      .preOptinStatus(payloadJson)
      .then((response) => {
        Log.sDebug(
          "Location optin is successful with status:" + response.status,
          this.componentName
        );
      })
      .catch((err) => {
        if (err) {
          //Log.sDebug("Falied to set location optin" + err.response.status, this.componentName)
          Log.sDebug(
            "Falied to set location optin",
            this.componentName,
            constantObjects.LOG_PROD
          );
        }
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

  fetchTokenForCAF = async (cpf) => {
    await Promise.all([await walletJwtService.CAFAuthentication(cpf)])
      .then(async (values) => {
        if (GeneralUtilities.emptyValueCheck(values[0])) {
          Log.sDebug("Retrying for token as value is empty");
          await walletJwtService.CAFAuthentication(cpf);
        }
        if (GeneralUtilities.emptyValueCheck(values[0])) {
          Log.sDebug("Retrying for token as value is empty");
          await walletJwtService.CAFAuthentication(cpf);
        }
      })
      .catch(async (err) => {
        Log.sDebug("Retrying for token as due to following error " + err);
        await walletJwtService.CAFAuthentication(cpf);
      });
  };

  storeCredentials = () => {
    Log.sDebug("Store Credentials operation", "UserIdCreationComponent");

    let jsonObject = {};
    jsonObject["userName"] = this.clientKey;
    jsonObject["password"] = this.state.password;
    jsonObject["accountKey"] = this.accountKey;
    jsonObject["clientName"] = this.state.name;
    jsonObject["cpf"] = this.state.cpf;
    jsonObject["ddd"] = this.state.ddd;
    jsonObject["phoneNumber"] = this.state.phoneNumber;
    jsonObject["email"] = this.state.email;

    Log.debug("jsonObject :" + JSON.stringify(jsonObject));
    androidApiCalls.storeEncryptPrefs(
      GeneralUtilities.CREDENTIALS_KEY,
      JSON.stringify(jsonObject),
      true
    );

    window.onEncryptCompleted = (key, statusOrData) => {
      if (statusOrData !== "failure") {
        Log.sDebug(
          "user credentials have been successfully stored , login via fingerprint next time",
          "UserIdCreationComponent"
        );
        androidApiCalls.setBiometricFlag(1);
        androidApiCalls.storeToPrefs(
          GeneralUtilities.MASKED_CPF_KEY,
          GeneralUtilities.maskCpf(ImportantDetails.cpf)
        );
        this.openSnackBar(localeObj.fp_enable);
        this.props.history.replace("/docInformation");
      } else {
        this.openSnackBar(localeObj.not_biometric);
        Log.sDebug(
          "Biometry not authorized for device",
          "UserIdCreationComponent"
        );
        // this.fpTimeout = setTimeout(() => {
        //   clearTimeout(this.fpTimeout);
        //   this.props.history.replace("/docInformation");
        // }, 1000);
      }
    };
  };

  openSnackBar = (message) => {
    this.setState({
      snackBarOpen: true,
      message: message,
    });
  };

  cancelVerification = () => {
    this.setVerificationDialogueStatus(false);
    this.props.history.replace("/docInformation");
  };

  setVerificationDialogueStatus = (status) => {
    this.setState({ dialogOpen: status });
  };

  registerFp = () => {
    androidApiCalls.askToSetUpBiometrics();
    window.fingerprintEnrollComplete = (result) => {
      Log.sDebug(
        "fingerprintEnrollComplete " + result,
        "UserIdCreationComponent"
      );
      if (result) {
        this.setVerificationDialogueStatus(false);
        this.showEnableFingerprintBottomSheet();
      }
    };
  };

  navigateToIdentificationPage = () => {
    this.props.history.replace("/docInformation");
  };

  storeCred = () => {
    this.storeCredentials();
  };

  showEnableFingerprintBottomSheet = () => {
    this.setState({
      bottomSheetHeader: localeObj.enable_fingerprint_title,
      bottomSheetDescription: localeObj.onboard_enable_fingerprint_desc,
      primary_btn_text: localeObj.confirm,
      bottomSheetType: this.bottomSheetTypes.ENABLE_FP_WARNING,
      bottomSheetSubText: "",
      fpOpen: true,
    });
  };

  handleFingerPrint = () => {
    Log.sDebug("entered UserIdCreationComponent", "UserIdCreationComponent");
    let isBiometricsEnabled = androidApiCalls.checkBiometricsEnabled();
    Log.sDebug("isBiometricsEnabled = " + isBiometricsEnabled);
    if (isBiometricsEnabled === this.biometricAvailability.SUCCESS) {
      Log.sDebug(
        "Biometric is set up - show bottom sheet",
        "UserIdCreationComponent"
      );
      this.showEnableFingerprintBottomSheet();
    } else if (isBiometricsEnabled === this.biometricAvailability.NEEDS_SETUP) {
      Log.sDebug("Biometric is not set up", "UserIdCreationComponent");
      this.setVerificationDialogueStatus(true);
    } else {
      this.openSnackBar(localeObj.no_biometric);
      Log.sDebug("No Biometric for device", "UserIdCreationComponent");
      this.props.history.replace("/identification");
    }
  };

  validateUser = () => {
    if (!navigator.onLine) {
      this.setState({
        snackBarOpen: true,
        message: localeObj.noNetwork,
      });
      return;
    }
    let jsonObject = {};
    jsonObject["usuario"] = this.clientKey;
    jsonObject["senha"] = this.state.password;
    jsonObject["metadados"] = arbiApiService.getMetadata();

    arbiApiService.authenticateUserWithClientKey(jsonObject, this.componentName).then((response) => {
      if (response && response.success) {
        let data = response.result;
        let processedResponseForLogin = ArbiResponseHandler.processAuthenticateUserApiResponse(data);
        if (processedResponseForLogin && processedResponseForLogin.loginSuccess) {
          this.updateAuthForAllUrls();
          if (processedResponseForLogin.accountSuccess) {
            let payload = {
              name: this.state.name,
              cpf: this.state.cpf,
              email: this.state.email,
              ddd: this.state.ddd,
              phoneNumber: this.state.phoneNumber,
              organizationUnitId: ArbiApiService.organizationUnitId,
            };
            copyUserCreationParametersIntoClientCreationJson(payload);
            androidApiCalls.setDAStringPrefs(GeneralUtilities.WAITLIST_KEY, "");
            if (androidApiCalls.isBiometricEnabled() === 1) {
              this.props.history.replace({
                pathname: "/docInformation",
                state: { passwordData: this.state.passwordData, creationState: "political", step: this.state.step },
              });
              this.hideProgressDialog();
            } else {
              this.hideProgressDialog();
              this.handleFingerPrint();
            }
          } else if (processedResponseForLogin.message === "NO_ACCOUNT") {
            this.getAllClientData().then((response) => {
              if (response === "true") {
                androidApiCalls.setDAStringPrefs(GeneralUtilities.WAITLIST_KEY, "");
                if (androidApiCalls.isBiometricEnabled() === 1) {
                  this.props.history.replace({
                    pathname: "/docInformation",
                    state: { passwordData: this.state.passwordData, creationState: "political", step: this.state.step },
                  });
                } else {
                  this.handleFingerPrint();
                }
              } else {
                this.hideProgressDialog();
                this.openSnackBar(localeObj.failedToProcess);
              }
            });
          } else {
            this.hideProgressDialog();
            Log.sDebug("could not process response of getUserName() ", this.componentName);
            let errorMessageToUser = localeObj.tryAgainLater;
            this.openSnackBar(errorMessageToUser);
          }
        }
      }
    })
      .catch((err) => {
        this.hideProgressDialog();
        if (err.response.error.details === "Invalid user name or password") {
          this.setState({
            snackBarOpen: true,
            message: this.state.invalid_username_password,
          });
          return;
        } else {
          this.setState({
            snackBarOpen: true,
            message: localeObj.token_validation_failed,
          });
          return;
        }
      });
  };

  getAllClientData = () => {
    return new Promise((resolve) => {
      this.showProgressDialog();
      arbiApiService.getAllClientData(this.componentName).then(response => {
        this.hideProgressDialog();
        if (response && response.success) {
          let responseHandler = ArbiResponseHandler.processGetAllClientDataResponse(response.result);
          if (responseHandler.success) {
            resolve("true");
          } else {
            resolve("false");
          }
        } else {
          resolve("false");
        }
      });
    });
  }

  updateAuthForAllUrls = () => {
    const { auth, updateAuth } = this.context;
    Log.sDebug("Auth is: " + auth);
    updateAuth(true, false);
  };
  onBack = () => {
    if (this.state.fpOpen === true || this.state.dialogOpen === true) {
      return;
    }

    if (this.state.creationState !== "password" || !this.state.emailAlert) {
      this.setState({
        step: this.state.step - 1,
      });
    }

    if (this.state.processing) {
      return this.setState({
        snackBarOpen: true,
        message: localeObj.no_action,
      });
    } else {
      MetricsService.onPageTransitionStop(
        PageNameJSON[this.state.creationState],
        PageState.back
      );
      if (this.state.creationState !== "password") {
        this.setState({
          step: this.state.step - 1,
        });
      }
      switch (this.state.creationState) {
        case "nameCPF":
          if (!this.state.navigated) {
            this.setState({ navigated: true }, () => {
              this.props.history.replace({
                pathname: "/motoPayLandingPage",
                transition: "right",
                state: "end",
              });
            });
          }
          return;
        case "email":
          if (this.state.emailAlert) {
            this.setState({ emailAlert: false })
          } else {
            this.setState({
              creationState: "nameCPF",
              direction: "right",
            });
          }
          break;
        case "notification":
          return this.setState({
            creationState: "email",
            direction: "right",
            currEmail: this.state.email
          });
        case "password":
          if (this.state.fromForgetPassword) {
            this.props.history.replace("/phoneNumberVerification", { from: "forgetPassword", cpf: this.props.location.state.cpf });
          } else {
            return this.setState({
              snackBarOpen: true,
              message: localeObj.phone_num_verfied,
            });
          }
          break;
        case "phoneNumber":
          return this.setState({
            creationState: "notification",
            direction: "right",
          });
        default:
          this.props.history.replace({
            pathname: "/newLogin",
            state: { from: this.componentName },
            transition: "right",
          });
          break;
      }
    }
  };

  onCancel = () => {
    this.setState({
      open: true,
      bottomHeader: localeObj.cancel_message_header,
      bottomDescription: localeObj.initial_cancel_message,
      primaryBtn: localeObj.resume,
      secondaryBtn: localeObj.stop,
      sheetType: "cancel",
    });
  };

  onSecondary = () => {
    this.setState({ open: false });
    if (this.state.sheetType === "cancel") {
      MetricsService.onPageTransitionStop(
        PageNameJSON[this.state.creationState],
        PageState.cancel
      );
      this.props.history.replace({
        pathname: "/",
        state: { from: this.componentName },
        transition: "right",
      });
    }
  };

  onPrimary = () => {
    this.setState({ open: false });
    if (this.state.sheetType === "error") {
      MetricsService.onPageTransitionStop(
        PageNameJSON[this.state.creationState],
        PageState.error
      );
      this.props.history.replace({
        pathname: "/newLogin",
        state: { cpf: this.state.cpf },
      });
    }
  };

  closeSnackBar = () => {
    this.setState({ snackBarOpen: false });
  };

  getOnboardingTerms = async (val) => {
    let termos = [];
    await arbiApiService.getTerms().then((response) => {
      Log.sDebug("getTerms:" + JSON.stringify(response));
      if (response && response.success) {
        termos = response.result.termos;
        if (val === "privacy") {
          androidApiCalls.openUrlInBrowser(termos[2].linkTermo);
        } else if (val === "account") {
          androidApiCalls.openUrlInBrowser(termos[1].linkTermo);
        }
      }
    });
  };

  read = (val) => {
    this.getOnboardingTerms(val);
  };

  isEmailAlert = (val) => {
    this.setState({ emailAlert: val })
  }

  render() {
    const { classes } = this.props;
    const creation = this.state.creationState;
    let step = this.state.step;
    let header;
    if (this.state.fromForgetPassword) {
      header = localeObj.app_password;
    } else if (creation === "notification") {
      header = localeObj.push_notification;
    } else {
      header = localeObj.personalInfo;
    }
    return (
      <div style={{ overflowX: "hidden" }}>
        <ButtonAppBar header={header}
          onBack={this.onBack} onCancel={this.onCancel} action={creation === "notification" || creation === "error" ? "none" : "cancel"} />

        <CSSTransition mountOnEnter={true} unmountOnExit={true} in={creation === "nameCPF" && !this.state.processing ? true : false} timeout={300} classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
          <div style={{ display: creation === "nameCPF" && !this.state.processing ? "block" : "none" }}>
            {!this.state.fromForgetPassword && <ProgressBar size={step} />}
            {creation === "nameCPF" && (
              <MultipleInputFormComponent
                header={localeObj.name_header}
                description={localeObj.name_body}
                type={"text"}
                field1={localeObj.nick_name_label}
                field2={localeObj.cpf}
                recieveField={this.setField}
                value1={this.state.name}
                value2={this.state.cpf}
                isNextEnabled={this.state.isNextEnabled}
                read={this.read}
                componentName={PageNameJSON.name}
              />
            )}
          </div>
        </CSSTransition>
        <CSSTransition mountOnEnter={true} unmountOnExit={true} in={creation === "email" && !this.state.processing ? true : false} timeout={300}
          classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
          <div style={{ display: creation === "email" && !this.state.processing ? "block" : "none" }}>
            <ProgressBar size={step} />
            {creation === "email" && (
              <MultipleInputFormComponent
                header={localeObj.email_header}
                field1={localeObj.emailField}
                field2={localeObj.emailConfirmation}
                type="email"
                recieveField={this.setField}
                value1={this.state.email}
                value2={this.state.repeatEmail}
                description={localeObj.email_descriptor}
                secBtnText={localeObj.next}
                footNote={localeObj.email_footer_descriptor}
                componentName={PageNameJSON.email}
                firstBtn={localeObj.acceptContBtn}
                allowAutoPopulate={this.state.allowAutoPopulate}
                isEmailAlert={this.isEmailAlert}
                emailAlert={this.state.emailAlert}
              />
            )}
          </div>
        </CSSTransition>
        <CSSTransition mountOnEnter={true} unmountOnExit={true} in={creation === "phoneNumber" && !this.state.processing ? true : false} timeout={300}
          classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
          <div style={{ display: creation === "phoneNumber" && !this.state.processing ? "block" : "none", }}>
            <ProgressBar size={step} />
            {creation === "phoneNumber" && (
              <PhoneNumberComponent
                header={localeObj.phone_header}
                recieveField={this.setField}
                ddd={this.state.ddd}
                phoneNumber={this.state.phoneNumber}
                setDDD={this.setDDD}
                displayNumber={this.state.displayNumber}
                field={localeObj.gift_phone_number}
                componentName={PageNameJSON.phoneNumber}
                allowAutoPopulate={this.state.allowAutoPopulate}
              />
            )}
          </div>
        </CSSTransition>
        <CSSTransition mountOnEnter={true} unmountOnExit={true} in={creation === "notification" && !this.state.processing ? true : false} timeout={300}
          classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
          <div style={{ display: creation === "notification" && !this.state.processing ? "block" : "none", }} >
            <ProgressBar size={step} />
            {creation === "notification" && (
              <PushNotificationOptinComp done={this.setField} cpf={this.state.cpf} />)}
          </div>
        </CSSTransition>
        <CSSTransition mountOnEnter={true} unmountOnExit={true} in={creation === "password" && !this.state.processing ? true : false}
          timeout={300} classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
          <div style={{ display: creation === "password" && !this.state.processing ? "block" : "none", }}>
            <ProgressBar size={step} />
            {creation === "password" && (
              <MultipleInputFormComponent
                header={localeObj.password_header}
                description={localeObj.password_descriptor}
                field1={localeObj.password}
                field2={localeObj.confirm_password}
                recieveField={this.setField}
                type="password"
                value1={this.state.password}
                value2={this.state.repeatPassword}
                isNextEnabledPassword={this.state.isNextEnabledPassword}
                isLengthValid={this.state.isLengthValid}
                hasNumber={this.state.hasNumber}
                hasCapitalLetter={this.state.hasCapitalLetter}
                hasSpecialCharacter={this.state.hasSpecialCharacter}
                passwordsMatch={this.state.passwordsMatch}
                fromForgetPassword={this.state.fromForgetPassword}
                componentName={PageNameJSON.password}
              />
            )}
          </div>
        </CSSTransition>
        {/* <CSSTransition mountOnEnter={true} unmountOnExit={true} in={creation === "privacy" ? true : false} timeout={300}
          classNames={ this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
          <div style={{ display: creation === "privacy" ? "block" : "none" }}>
            {creation === "privacy" && (
              <TermsAndPrivacyComponent next={this.start} back={this.back} />
            )}
          </div>
        </CSSTransition> */}

        <div style={{ display: this.state.processing ? "block" : "none" }}>
          <ProgressBar size={step} />
          {this.state.processing && <CustomizedProgressBars />}
        </div>
        <CSSTransition mountOnEnter={true} unmountOnExit={true}
          in={creation === "error" && !this.state.processing ? true : false} timeout={300} classNames="pageSliderLeft">
          <div style={{ display: (creation === "error" && !this.state.processing ? 'block' : 'none') }}>
            {creation === "error" && !this.state.processing && <PixErrorComponent errorJson={this.state.errors} onClick={this.onBack} componentName={PageNameJSON["error"]} />}
          </div>
        </CSSTransition>
        <MuiThemeProvider theme={InputThemes.snackBarTheme}>
          <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar} >
            <MuiAlert elevation={6} variant="filled" icon={false}> {this.state.message} </MuiAlert>
          </Snackbar>
        </MuiThemeProvider>

        <div id="outer" style={{ width: "100%" }} className="accountOuterContainer" >
          <Drawer classes={{ paper: classes.paper }} anchor="bottom" open={this.state.open} >
            <div style={{ margin: "1.5rem" }}>
              <FlexView column style={{ marginTop: "0.5rem" }}>
                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                  {this.state.bottomHeader}
                </div>
                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                  {this.state.bottomDescription}
                </div>
              </FlexView>
            </div>
            <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", }}>
              <PrimaryButtonComponent btn_text={this.state.primaryBtn} onCheck={this.onPrimary} />
              <SecondaryButtonComponent btn_text={this.state.secondaryBtn} onCheck={this.onSecondary} />
            </div>
          </Drawer>
        </div>

        <MuiThemeProvider theme={InputThemes.SearchInputTheme}>
          <div style={{ width: "100%" }}>
            <Drawer classes={{ paper: classes.paper }} anchor="bottom" open={this.state.fpOpen}>
              <div style={{ margin: "1.5rem" }}>
                <FlexView column style={{ marginTop: "0.5rem" }}>
                  <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                    {this.state.bottomSheetHeader}
                  </div>
                  <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                    {this.state.bottomSheetDescription}
                  </div>
                </FlexView>
              </div>
              <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", }}>
                <PrimaryButtonComponent btn_text={this.state.primary_btn_text} onCheck={this.storeCred} />
                <SecondaryButtonComponent btn_text={localeObj.skip} onCheck={this.navigateToIdentificationPage} />
              </div>
            </Drawer>
          </div>
        </MuiThemeProvider>

        <div style={{ width: "100%" }}>
          <Drawer classes={{ paper: classes.paper }} anchor="bottom" open={this.state.dialogOpen}>
            <div style={{ margin: "1.5rem" }}>
              <FlexView column style={{ marginTop: "0.5rem" }}>
                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                  {localeObj.no_fp_register}
                </div>
              </FlexView>
            </div>
            <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", }} >
              <PrimaryButtonComponent btn_text={localeObj.register_fp} onCheck={this.registerFp} />
              <SecondaryButtonComponent btn_text={localeObj.skip} onCheck={this.cancelVerification} />
            </div>
          </Drawer>
        </div>
      </div>
    );
  }
}

UserIdCreation.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object,
  history: PropTypes.object,
};

export default withStyles(styles)(UserIdCreation);
