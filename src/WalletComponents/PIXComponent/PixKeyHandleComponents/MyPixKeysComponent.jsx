import React from 'react';
import FlexView from "react-flexview";

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Card } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import PropTypes from "prop-types";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";

import PageState from '../../../Services/PageState';
import PageNames from '../../../Services/PageNames';
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from '../../../Services/ArbiErrorResponsehandler';
import MetricServices from "../../../Services/MetricsService";
import utilities from "../../../Services/NewUtilities";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import WarningIcon from '@material-ui/icons/Warning';
import ScheduleIcon from '@material-ui/icons/Schedule';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import { ERROR_IN_SERVER_RESPONSE } from '../../../Services/httpRequest';
import Log from '../../../Services/Log';
import constantObjects from '../../../Services/Constants';
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";

const theme2 = InputThemes.snackBarTheme;
const singleInputStyle = InputThemes.singleInputStyle;
const pageName = PageNames.intro;
var localeObj = {};

class MyPixKeysComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            MyPixKeys: [],
            incomingPixKeys: [],
            outgoingClaims: [],
            confirmedClaims: [],
            bottomSheet: false,
            bottomSheetDetails: {},
            disabled: false,
            showSnackBar: this.props.location.showSnackBar ? this.props.location.showSnackBar : false,
            snackBarDescription: this.props.location.snackBarDescription ? this.props.location.snackBarDescription : "",
            snackBarTimeOut: this.props.location.snackBarTimeOut ? this.props.location.snackBarTimeOut : constantObjects.SNACK_BAR_DURATION,
            success: 0
        }
        this.styles = {
            cardStyle: {
                height: "4rem",
                width: "20.5rem",
                borderRadius: "1.25rem",
                marginTop: "0.5rem",
                padding: "0.75rem 1.5rem",
                backgroundColor: ColorPicker.surface3
            },
            cardStyleRandomKey: {
                height: "5rem",
                width: "20.5rem",
                borderRadius: "1.25rem",
                marginTop: "0.5rem",
                padding: "0.25rem 1.5rem 0.25rem",
                backgroundColor: ColorPicker.surface3
            }
        }
        this.componentName = PageNames.pixMyKeysComponent;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(pageName)
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.onBack();
        }
        this.getPixKeysAndClaims();
    }

    getPixKeysAndClaims = () => {
        this.showProgressDialog();
        let response = {};
        if (ImportantDetails.pixKeysResponse === null ||
            ImportantDetails.pixKeysResponse == {} || ImportantDetails.fromRegisterPixKey ||
            Object.keys(ImportantDetails.pixKeysResponse).length === 0) {
            ArbiApiService.getAllPixKeys(this.componentName).then(pixResponse => {
                response = pixResponse;
                this.setState({ success: this.state.success + 1 });
                if (response.success) {
                    ImportantDetails.fromRegisterPixKey = false;
                    ImportantDetails.pixKeysResponse = pixResponse;
                    let responseHandler = ArbiResponseHandler.processGetAllPixKeysResponse(response.result);
                    if (responseHandler.success) {
                        const pixKeys = responseHandler.pixKeys
                        this.setState({
                            MyPixKeys: pixKeys
                        });
                        Log.verbose("mypixkeys " + JSON.stringify(this.state.MyPixKeys), this.componentName);
                        this.checkIfTheresAIncomingPixRequest();
                    }
                } else {
                    Log.sError("error in getting pix keys", this.componentName);
                }
            });
        } else {
            response = ImportantDetails.pixKeysResponse;
            this.setState({ success: this.state.success + 1 });
            if (response.success) {
                let responseHandler = ArbiResponseHandler.processGetAllPixKeysResponse(response.result);
                if (responseHandler.success) {
                    const pixKeys = responseHandler.pixKeys
                    this.setState({
                        MyPixKeys: pixKeys
                    });
                    Log.verbose("mypixkeys " + JSON.stringify(this.state.MyPixKeys), this.componentName);
                }
            } else {
                Log.sError("error in getting pix keys", this.componentName);
            }
        }

        ArbiApiService.getPixKeyClaimStatus(this.componentName).then(response => {
            this.setState({ success: this.state.success + 1 });
            this.hideProgressDialog();
            if (response.success) {
                let responseHandler = ArbiResponseHandler.processPixStatusResponse(response.result);
                if (responseHandler.success) {

                    this.setState({
                        "incomingPixKeys": responseHandler.incomingClaims,
                        "outgoingClaims": responseHandler.outgoingClaims,
                    });
                    //Log.sDebug("response for incoming/outgoing is " + JSON.stringify(responseHandler.incomingClaims) + " " + JSON.stringify(responseHandler.outgoingClaims), this.componentName);

                    this.checkIfTheresAIncomingPixRequest();
                }
            } else {
                Log.sError("error in getting pix claim status", this.componentName);
            }
        });
    }

    checkIfTheresAIncomingPixRequest = () => {
        //Log.sDebug("check If Theres A Incoming Pix Request", "MyPixKeysComponent")
        let copyOfMyPixKeys = JSON.parse(JSON.stringify(this.state.MyPixKeys));
        this.state.MyPixKeys.forEach((pixKey, index) => {
            this.state.incomingPixKeys.forEach((incomingPixKey) => {
                if (pixKey.key_type === incomingPixKey.pixKeyType && pixKey.key_value === incomingPixKey.pixKeyValue) {
                    copyOfMyPixKeys[index]["incomingPortability"] = incomingPixKey;
                }
            });
        });
        //Log.sDebug("check If Theres A Incoming Pix Reques with copy Of My Pix Keys", "MyPixKeysComponent")
        this.setState({
            MyPixKeys: copyOfMyPixKeys
        });
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(pageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(pageName);
        }
    }

    
    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    selectPixKey = (index) => {
        if(!this.state.disabled) {
            this.setState({ disabled: true } ,
                () => {
                    setTimeout(() => this.setState({ disabled: false }), 1000);
            });
        } else {
            return "";
        }
        if (this.state.MyPixKeys[index]["incomingPortability"]) {
            //Log.sDebug("selected pix key is " + JSON.stringify(this.state.MyPixKeys[index]["incomingPortability"]), this.componentName);
            let incomingPortbailityDetails = this.state.MyPixKeys[index]["incomingPortability"];
            this.setState({
                "selectedIndex": index,
                "bottomSheetDetails": {
                    "bottomSheetType": "incomingPortability",
                    "title": localeObj.portability_requested_title,
                    "description": incomingPortbailityDetails["claimType"] === 1 ? localeObj.ownership_requested_description : localeObj.portability_requested_description,
                    "prop1": incomingPortbailityDetails["pixKeyType"],
                    "value1": incomingPortbailityDetails["pixKeyValue"],
                    "prop2": localeObj.institution_requesting,
                    "value2": incomingPortbailityDetails["institutionRequesting"],
                    "primaryButtonText": localeObj.keep_this_key,
                    "secondaryButtonText": localeObj.confirm_portability
                },
                "bottomSheet": true
            });
            return;
        }

        MetricServices.onPageTransitionStop(pageName, PageState.close);
        this.props.history.replace("/keyInformationComponent", {
            "selectedIndex": index,
            "allKeys": this.state.MyPixKeys,
        })

        //Log.sDebug("user clicked " + index, "MyPixKeysComponent");

    }

    selectOutgoingPixKey = (index) => {

        if (this.state.outgoingClaims[index]) {
            //Log.sDebug("selected pix key is " + JSON.stringify(this.state.outgoingClaims[index]), this.componentName);
            let outgoingPortability = this.state.outgoingClaims[index];

            let title, description, primaryText, secondaryButtonText, type;

            if (outgoingPortability["claimType"] === 1 && outgoingPortability["status"].toUpperCase() === "CONFIRMED" && outgoingPortability["blocked"] === false) {
                title = localeObj.conclude_portability_title;
                description = outgoingPortability["pixKeyType"] === GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER ? localeObj.conclude_portability_phone_desc : localeObj.conclude_portability_email_desc;
                type = "concludePortability";

                primaryText = localeObj.verify_now;
                secondaryButtonText = localeObj.back;

            } else {
                title = localeObj.pending_portability_title;
                description = outgoingPortability["claimType"] === 1 ? localeObj.pending_ownership_description : localeObj.pending_portability_description;
                description = GeneralUtilities.formattedString(description, [outgoingPortability["completionDate"]]);
                type = "outgoingPortability";

                if (outgoingPortability["claimType"] === 1) {
                    primaryText = localeObj.pending_portability_wait;
                    secondaryButtonText = "";
                } else {
                    primaryText = localeObj.pending_portability_wait;
                    secondaryButtonText = localeObj.pending_portability_cancel;
                }

            }

            this.setState({
                "selectedIndex": index,
                "bottomSheetDetails": {
                    "bottomSheetType": type,
                    "title": title,
                    "description": description,
                    "prop1": outgoingPortability["pixKeyType"],
                    "value1": outgoingPortability["pixKeyValue"],
                    "prop2": localeObj.pending_portability_request_date,
                    "value2": GeneralUtilities.emptyValueCheck(outgoingPortability["requestDate"]) ? "" : outgoingPortability["requestDate"],
                    "primaryButtonText": primaryText,
                    "secondaryButtonText": secondaryButtonText
                },
                "bottomSheet": true
            });
            return;
        }
    }


    onPrimaryButtonClick = () => {
        if (this.state.bottomSheetDetails.bottomSheetType === "incomingPortability") {
            this.handleClose();
            this.showConfirmCancelIncomingPortability();
        } else if (this.state.bottomSheetDetails.bottomSheetType === "cancelOutgoingPortability") {
            let claimId = this.state.outgoingClaims[this.state.selectedIndex]["claimId"];
            this.cancelPortability(claimId, true);
            this.handleClose();
        } else if (this.state.bottomSheetDetails.bottomSheetType === "concludePortability") {
            this.handleClose();
            this.concludeOrCancelPortabilityWith2fa(3);
        } else if (this.state.bottomSheetDetails.bottomSheetType === "confirmCancelIncomingPortability") {
            this.handleClose();
            this.concludeOrCancelPortabilityWith2fa(4);
        } else {
            this.handleClose();
        }
    }

    onSecondaryButtonClick = () => {
        if (this.state.bottomSheetDetails.bottomSheetType === "incomingPortability") {
            this.confirm_portability();
            this.handleClose();
        } else if (this.state.bottomSheetDetails.bottomSheetType === "outgoingPortability") {
            this.handleClose();
            this.cancelOutgoingPortability();
        } else if (this.state.bottomSheetDetails.bottomSheetType === "cancelOutgoingPortability" || this.state.bottomSheetDetails.bottomSheetType === "concludePortability" || this.state.bottomSheetDetails.bottomSheetType === "confirmCancelIncomingPortability") {
            this.handleClose();
        }
    }

    handleClose = () => {
        this.setState({ "bottomSheet": false })
        return;
    }


    showConfirmCancelIncomingPortability = () => {

        let incomingPortability = this.state.MyPixKeys[this.state.selectedIndex]["incomingPortability"]
        let description = incomingPortability["pixKeyType"] === GeneralUtilities.PIX_KEY_TYPES.EMAIL ? localeObj.cancel_incoming_email_verify_desc : localeObj.cancel_incoming_phone_verify_desc;
        this.setState({
            "bottomSheetDetails": {
                "bottomSheetType": "confirmCancelIncomingPortability",
                "title": localeObj.cancel_incoming_key_verify,
                "description": description,
                "prop1": incomingPortability["pixKeyType"],
                "value1": incomingPortability["pixKeyValue"],
                "prop2": "",
                "value2": "",
                "primaryButtonText": localeObj.verify_now,
                "secondaryButtonText": localeObj.back
            },
            "bottomSheet": true
        });

    }


    concludeOrCancelPortabilityWith2fa = (type) => {
        //Log.sDebug("concludeOrCancelPortabilityWith2fa " + type, this.componentName);
        let pixKeyDetails;

        if (type === 3) {
            pixKeyDetails = this.state.outgoingClaims[this.state.selectedIndex];
        } else {
            pixKeyDetails = this.state.MyPixKeys[this.state.selectedIndex]["incomingPortability"];
        }
        this.showProgressDialog();
        ArbiApiService.sendTokenToPixKey(pixKeyDetails.pixKeyValue, this.componentName).then(response => {
            this.hideProgressDialog();
            if (response.success) {

                let payloadToBesent = {
                    "key_type": pixKeyDetails.pixKeyType,
                    "value": pixKeyDetails.pixKeyValue,
                    "type": type,
                    "payload": { claimId: pixKeyDetails.claimId }
                }
                MetricServices.onPageTransitionStop(pageName, PageState.close);
                this.props.history.replace("/otpConfirmationComponent", payloadToBesent);

            } else {
                let errorMessageToUser = localeObj.retry_later;
                if (response.result !== ERROR_IN_SERVER_RESPONSE) {
                    if (response.result.message == this.VALIDATION_ERROR) {
                        errorMessageToUser = localeObj.validation_error;
                    }
                } else {
                    errorMessageToUser = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                }
                this.openSnackBar(errorMessageToUser);
            }
        });
    }


    cancelOutgoingPortability = () => {
        let outgoingPortability = this.state.outgoingClaims[this.state.selectedIndex];
        this.setState({
            "bottomSheetDetails": {
                "bottomSheetType": "cancelOutgoingPortability",
                "title": localeObj.pending_portability_cancel,
                "description": localeObj.pending_portability_cancel_description,
                "prop1": outgoingPortability["pixKeyType"],
                "value1": outgoingPortability["pixKeyValue"],
                "prop2": "",
                "value2": "",
                "primaryButtonText": localeObj.pending_portability_cancel,
                "secondaryButtonText": localeObj.pending_portability_wait
            },
            "bottomSheet": true
        });
    }

    cancelPortability = (claimId) => {
        //Log.sDebug("calling cancelPortability", this.componentName);
        ArbiApiService.cancelPixClaim({ "claimId": claimId }, this.componentName).then((response) => {
            this.hideProgressDialog();
            if (response.success) {
                if (ArbiResponseHandler.processCancelPixResponse(response.result)) {
                    //Log.sDebug("cancelPortability success", this.componentName);

                    let copyOfKeys = JSON.parse(JSON.stringify(this.state.outgoingClaims));
                    copyOfKeys.splice(this.state.selectedIndex, 1);
                    this.setState({ outgoingClaims: copyOfKeys, showSnackBar: true, snackBarDescription: localeObj.claim_request_cancel, disabled: false });
                    return;
                }
            }
            //Log.sDebug("cancelPortability error", this.componentName, constantObjects.LOG_PROD);
        })
    }

    confirm_portability = () => {
        this.showProgressDialog();
        let claim = this.state.MyPixKeys[this.state.selectedIndex]["incomingPortability"];
        let claimId = claim["claimId"];
        ArbiApiService.confirmPixClaim(claimId, this.componentName).then((response) => {
            this.hideProgressDialog();
            if (response.success) {
                if (ArbiResponseHandler.processConfirmPixResponse(response.result)) {
                    //Log.sDebug("confirm_portability is successful", this.componentName);

                    let messageToUser = claim["claimType"] === 1 ? localeObj.ownership_request_confirm : localeObj.portability_request_confirm;

                    let copyOfMyPixKeys = JSON.parse(JSON.stringify(this.state.MyPixKeys));
                    copyOfMyPixKeys.splice(this.state.selectedIndex, 1);
                    ImportantDetails.fromRegisterPixKey = true;
                    this.setState({
                        MyPixKeys: copyOfMyPixKeys,
                        showSnackBar: true,
                        snackBarDescription: messageToUser,
                        snackBarTimeOut: 3000,
                        disabled: false
                    });
                    return;
                }
            }
            //Log.sDebug("confirm_portability is unsuccessful", this.componentName);
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


    registerKey = () => {
        MetricServices.onPageTransitionStop(pageName, PageState.close);
        this.props.history.replace("/registerNewKeyComponent");
        //Log.sDebug("clicked register key", "MyPixKeysComponent");

    }

    fetchPixKeyValue = (key, value) => {
        if (key == "CPF") {
            let cpfObj = utilities.parseCPF(value);
            return cpfObj.displayCPF
        } else {
            return value;
        }
    }

    onBack = () => {
        if (this.state.bottomSheet) {
            this.setState({ bottomSheet: false })
        }
        else if (this.state.success == 2) {
            MetricServices.onPageTransitionStop(pageName, PageState.back);
            this.props.history.replace({ pathname: "/pixLandingComponent", transition: "right" })
        }
    }

    closeSnackBar = () => {
        this.setState({ showSnackBar: false })
    }

    openSnackBar = (message) => {
        this.setState({
            showSnackBar: true,
            snackBarDescription: message
        });
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        return (
            <div style={{ height: "100%", overflowX: "hidden" }}>
                <ButtonAppBar header={localeObj.my_pix_key} onBack={this.onBack} action="none" />

                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div className="scroll" style={{ height: `${finalHeight * 0.7}px`, overflowY: "auto" }}>
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column overflow="scroll">
                                <FlexView column>
                                    <div style={{ textAlign: "left" }}>
                                        <span className="subtitle2 highEmphasis">{localeObj.edit_pix_keys}</span>
                                    </div>
                                    <div style={{ textAlign: "left", marginTop: "1rem" }}>
                                        <span className="subtitle2 highEmphasis">
                                            {GeneralUtilities.formattedString(localeObj.total_pix_keys, [this.state.MyPixKeys.length])}</span>
                                    </div>
                                </FlexView>
                                <div style={{textAlign: "center"}}>
                                    <Grid container spacing={0}>
                                        {
                                            this.state.MyPixKeys.map((pixkeys, index) => (
                                                <Card key = {index} align="center" style={(pixkeys.key_type) === "EVP" ? this.styles.cardStyleRandomKey : this.styles.cardStyle} elevation="0">
                                                    <ListItem onClick={() => this.selectPixKey(index)} disabled={this.state.disabled}>
                                                        <ListItemText>
                                                            <div style={{ width: '80%',  textAlign:"left"  }}>
                                                                <div className="body2 highEmphasis">
                                                                    <span>{(pixkeys.key_type) === "EVP" ? localeObj.evp_key : pixkeys.key_type}</span>
                                                                </div>
                                                                <div className="body2 mediumEmphasis" style={{ wordWrap: 'break-word' }}>
                                                                    <span>{this.fetchPixKeyValue(pixkeys.key_type, pixkeys.key_value)}</span>
                                                                </div>
                                                            </div>
                                                        </ListItemText>
                                                        {this.state.MyPixKeys[index]["incomingPortability"] ?
                                                            <ListItemIcon style={{ minWidth: "0px" }}>
                                                                <WarningIcon align="center" style={{ fill: ColorPicker.errorRed, width: "1.6rem" }} />
                                                            </ListItemIcon> :
                                                            <ListItemIcon style={{ minWidth: "0px" }}>
                                                                <ArrowForwardIosIcon align="center" style={{ fill: ColorPicker.accent, width: "1.6rem" }} />
                                                            </ListItemIcon>}
                                                    </ListItem>
                                                </Card>
                                            ))
                                        }
                                    </Grid>
                                </div>

                                {this.state.outgoingClaims.length !== 0 &&
                                    <div style={{ marginTop: "2rem" }}>
                                        <div style={{ textAlign: "left" }}>
                                            <span className="subtitle2 highEmphasis">
                                                {localeObj.pending_portability_keys}
                                            </span>
                                        </div>

                                        <div style={{textAlign: "center"}}>
                                            <Grid container spacing={0}>
                                                {
                                                    this.state.outgoingClaims.map((pixkeys, index) => (
                                                        <Card key = {index} align="center" style={this.styles.cardStyle} elevation="0">
                                                            <ListItem onClick={() => this.selectOutgoingPixKey(index)}>
                                                                <ListItemText>
                                                                    <div style={{textAlign: "left"}}>
                                                                        <div className="body2 highEmphasis">
                                                                            <span>{pixkeys.pixKeyType === "EVP" ? localeObj.evp_key : pixkeys.pixKeyType}</span>
                                                                        </div>
                                                                        <div className="body2 mediumEmphasis">
                                                                            <span>{this.fetchPixKeyValue(pixkeys.pixKeyType, pixkeys.pixKeyValue)}</span>
                                                                        </div>
                                                                    </div>
                                                                </ListItemText>
                                                                {pixkeys.claimType === 1 && pixkeys.status === "CONFIRMED" ?
                                                                    <ListItemIcon style={{ minWidth: "0px" }}>
                                                                        <WarningIcon align="center" style={{ color: ColorPicker.errorRed, width: "1.6rem" }} />
                                                                    </ListItemIcon> :
                                                                    <ListItemIcon style={{ minWidth: "0px" }}>
                                                                        <ScheduleIcon align="center" style={{ color: ColorPicker.errorRed, width: "1.6rem" }} />
                                                                    </ListItemIcon>
                                                                }

                                                            </ListItem>
                                                        </Card>
                                                    ))
                                                }
                                            </Grid>
                                        </div>
                                    </div>
                                }
                            </FlexView>
                        </div>

                        <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                            <PrimaryButtonComponent disabled={this.state.MyPixKeys.length + this.state.outgoingClaims.length === 5} className="body1 highEmphasis" btn_text={localeObj.register_new_key} onCheck={this.registerKey} />
                        </div>
                    </div>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>


                <SwipeableDrawer
                    anchor="bottom"
                    open={this.state.bottomSheet}
                    onOpen={this.handleOpen}
                    onClose={this.handleClose}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    classes={{ paper: classes.paper }}
                >
                    <div style={{ margin: "1.5rem" }}
                        onKeyDown={this.handleClose}>
                        <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                            <span className="headline6 highEmphasis">
                                {this.state.bottomSheetDetails.title}
                            </span>
                        </div>
                        <div style={{ marginTop: "1rem", textAlign: "center"  }}>
                            <span className="body2 mediumEmphasis">
                                {this.state.bottomSheetDetails.description}
                            </span>
                        </div>
                        <div style={{ marginTop: "1.5rem", textAlign: "center"  }}>
                            <span className="subtitle2 highEmphasis">
                                {this.state.bottomSheetDetails.prop1}
                            </span>
                        </div>
                        <div style={{ width: "100%", textAlign: "center"  }}>
                            <span className="body2 mediumEmphasis">
                                {this.state.bottomSheetDetails.value1}
                            </span>
                        </div>

                        <div style={{ marginTop: "1.5rem", textAlign: "center"  }}>
                            <span className="subtitle2 highEmphasis">
                                {this.state.bottomSheetDetails.prop2}
                            </span>
                        </div>
                        <div style={{ width: "100%", textAlign: "center"  }}>
                            <span className="body2 mediumEmphasis">
                                {this.state.bottomSheetDetails.value2}
                            </span>
                        </div>
                        <div style={{ marginTop: "1.5rem", textAlign: "center"  }}>
                            <PrimaryButtonComponent className="body1 highEmphasis" btn_text={this.state.bottomSheetDetails.primaryButtonText} onCheck={this.onPrimaryButtonClick} />
                        </div>

                        {this.state.bottomSheetDetails.secondaryButtonText &&
                            <div style={{textAlign: "center" }}>
                                <SecondaryButtonComponent className="body1 highEmphasis" btn_text={this.state.bottomSheetDetails.secondaryButtonText} onCheck={this.onSecondaryButtonClick} />
                            </div>
                        }
                    </div>
                </SwipeableDrawer>

                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.showSnackBar} autoHideDuration={this.state.snackBarTimeOut} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackBarDescription}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}
MyPixKeysComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};
export default withStyles(singleInputStyle)(MyPixKeysComponent);
