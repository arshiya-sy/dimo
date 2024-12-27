import React from 'react';
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import InputThemes from "../../../Themes/inputThemes";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import Log from "../../../Services/Log";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import utilities from "../../../Services/NewUtilities";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import MetricServices from "../../../Services/MetricsService";
import PageState from "../../../Services/PageState";

import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";

const screenHeight = window.innerHeight;

const theme1 = InputThemes.SingleInputTheme;
const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
var localeObj = {};

class NewPixContact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pixData: "",
            displayPixData: "",
            pixName: "",
            snackBarOpen: false,
            pixKeys: []
        }

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "New PIX Contact"
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        androidApiCalls.enableCopyPaste();
        window.addEventListener("resize", this.checkIfInputIsActive);
        if (!!this.props.requiredInfo && !!this.props.requiredInfo["pixKey"]) {
            if (this.props.field === localeObj.pix_cpf_cnpj && this.props.requiredInfo["pixKey"] !== "") {
                let cpfObj = utilities.parseCPFOrCnpj(this.props.requiredInfo["pixKey"]);
                if (cpfObj.displayCPF) {
                    this.setState({
                        displayPixData: cpfObj.displayCPF,
                        pixData: cpfObj.displayCPF.replace(/[^0-9]/g, '')
                    })
                }
            } else {
                let enteredKey = this.props.requiredInfo["pixKey"];
                if (typeof enteredKey === "string") {
                    if (enteredKey.includes("+55")) {
                        let editablekey = enteredKey.replace("+55", "");
                        editablekey = utilities.parsePhoneNum(editablekey);
                        if (editablekey.phoneNumber.length !== 0) {
                            enteredKey = editablekey.phoneNumber
                        }
                    }
                }
                this.setState({
                    pixData: enteredKey,
                    displayPixData: enteredKey
                });
            }
        }
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }
       

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        window.removeEventListener("resize", this.checkIfInputIsActive);
    }

    handlePixInfoChange = (event) => {
        let value = event.target.value;
        value = value.charAt(0).toLowerCase() + value.substring(1);
        if (this.props.field === localeObj.pix_cpf_cnpj && event.target.value.length !== 0) {
            const re = /^([0-9.-]|\/)+$/;
            if (re.test(event.target.value)) {
                let cpfObj = {}
                cpfObj = utilities.parseCPFOrCnpj(event.target.value);
                this.setState({
                    displayPixData: cpfObj.displayCPF,
                    pixData: cpfObj.displayCPF.replace(/[^0-9]/g, '')
                })
            } else if (event.target.value.length === 0) {
                this.setState({
                    displayPixData: "",
                    pixData: ""
                })
            }
        } else if (this.props.field === localeObj.phone_number && event.target.value.length !== 0) {
            let phoneNumObj = {};
            const re = /^[0-9/(/)/ /-]+$/;
            if (re.test(event.target.value)) {
                phoneNumObj = utilities.parsePhoneNum(event.target.value);
                if (phoneNumObj.phoneNumber.length !== 0) {
                    this.setState({
                        displayPixData: phoneNumObj.phoneNumber,
                        pixData: phoneNumObj.phoneNumber
                    })
                } else {
                    this.setState({
                        displayPixData: "",
                        pixData: ""
                    })
                }
            }
        } else {
            this.setState({
                pixData: value,
                displayPixData: value
            });
        }
    }

    handleLogging = (logs) => {
        Log.sDebug(logs, this.componentName);
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

    checkIfInputIsActive = () => {
        if (window.innerHeight !== screenHeight) {
            this.setState({
                fieldOpen: true
            })
        } else {
            this.setState({
                fieldOpen: false
            })
        }
    }

    sendField = () => {
        // validate pixData
        this.showProgressDialog();
        if (!utilities.validateParameters(this.props.field, this.state.pixData)) {
            this.openSnackBar(localeObj.pix_key_invalid);
            this.hideProgressDialog();
            return;
        } else if (this.props.field === localeObj.pix_cpf_cnpj && !GeneralUtilities.validateCpfOrCnpj(this.state.pixData, true)) {
            this.openSnackBar(localeObj.pix_key_invalid);
            this.hideProgressDialog();
            return;
        } else if (this.props.field === localeObj.phone_number) {
            if (this.state.pixData.length !== 15 || parseInt(this.state.pixData[5]) !== 9) {
                this.openSnackBar(localeObj.pix_key_invalid);
                this.hideProgressDialog();
                return;
            } else if (!utilities.validateParameters("ddd", this.state.pixData.substring(1, 3))) {
                this.openSnackBar(localeObj.pix_key_invalid);
                this.hideProgressDialog();
                return;
            }
        } else if (this.props.field === localeObj.email && this.state.pixData.length !== 0) {
            const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
            if (!emailRegex.test(this.state.pixData)) {
                this.openSnackBar(localeObj.pix_key_invalid);
                this.hideProgressDialog();
                return;
            }
        } else if (this.state.pixData.replace(/ /g, "") === "") {
            this.openSnackBar(localeObj.enter_field + " " + this.props.field.toString().toLowerCase());
            this.hideProgressDialog();
            return;
        }
        let jsonObject = { ...this.props.requiredInfo };
        let key = this.state.pixData;
        if (this.props.field === localeObj.pix_cpf_cnpj ||
            this.props.field === localeObj.phone_number) {
            key = this.state.pixData.replace(/[^0-9]/g, '');
        }
        if (this.props.field === localeObj.phone_number) {
            key = "+55" + key;
        }
        const pixKey = key;
        let response = {};
        if (ImportantDetails.pixKeysResponse === null || 
            ImportantDetails.pixKeysResponse == {} || 
            Object.keys(ImportantDetails.pixKeysResponse).length === 0) {
            ArbiApiService.getAllPixKeys(this.componentName).then(pixResponse => {
                response = pixResponse;
                ImportantDetails.pixKeysResponse = pixResponse;
                ImportantDetails.fromRegisterPixKey = false;
            });
        } else {
            response = ImportantDetails.pixKeysResponse;
        }
        if (response.success) {
            let responseHandler = ArbiResponseHandler.processGetAllPixKeysResponse(response.result);
            if (responseHandler.success) {
                const pixKeys = responseHandler.pixKeys;
                let goAheadFlag = true;
                if(pixKeys){
                    pixKeys.forEach((arr) => {
                        if (pixKey === arr["key_value"]) {
                            goAheadFlag = false
                            this.hideProgressDialog();
                            this.openSnackBar(localeObj.pix_same_account_key);
                        }
                    })
                }
                if (goAheadFlag) {
                    ArbiApiService.getPixKeyDetails(pixKey, this.componentName).then(response => {
                        if (response.success) {
                            let processedResult = ArbiResponseHandler.processGetPixKeyDetailsResponse(response.result, pixKey, localeObj);
                            this.handleLogging("Pix Info valid");
                            if (processedResult.success) {
                                this.hideProgressDialog();
                                jsonObject["endToEnd"] = processedResult.pixKeyDetails.endToEnd;
                                jsonObject["transferType"] = processedResult.pixKeyDetails.pixKeyType;
                                jsonObject["CPF"] = processedResult.pixKeyDetails.CPF;
                                jsonObject["receiverInstitute"] = processedResult.pixKeyDetails.institute;
                                jsonObject["name"] = processedResult.pixKeyDetails.name;
                                jsonObject["date"] = processedResult.pixKeyDetails.date;
                                jsonObject["pixKey"] = pixKey;
                                MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                                this.props.setTransactionInfo(jsonObject);
                            } else {
                                this.hideProgressDialog();
                                let jsonObj = ArbiErrorResponsehandler.processErrorsForJSON(response);
                                this.handleLogging("Error while validating pix info");
                                MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                                this.props.setTransactionInfo(jsonObj);
                            }
                        } else {
                            this.hideProgressDialog();
                            let jsonObj = ArbiErrorResponsehandler.processErrorsForJSON(response);
                            this.handleLogging("Error while validating pix info");
                            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                            this.props.setTransactionInfo(jsonObj);
                        }
                    });
                } else {
                    this.hideProgressDialog();
                }
            } else {
                this.hideProgressDialog();
            }
        } else {
            this.hideProgressDialog();
            let jsonObj = ArbiErrorResponsehandler.processErrorsForJSON(response);
            this.handleLogging("Error while validating pix info");
            MetricServices.onPageTransitionStop(this.componentName, PageState.error);
            this.props.setTransactionInfo(jsonObj);
        }
    }

    showProgressDialog = () => {
        this.props.multipleSelection(true);
        this.setState({
            processing: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        })
        this.props.multipleSelection(false);
    }

    render() {
        let amount = this.props.requiredInfo.amount;
        let decimal = this.props.requiredInfo.decimal;
        const { classes } = this.props;
        let fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle
        return (
            <div style={{ overflow: "hidden" }}>
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis">
                                <span>{GeneralUtilities.formattedString(localeObj.pix_send_to, [amount, decimal])}</span>
                            </div>
                            <div className="body2 highEmphasis">
                                <span>{localeObj.pix_key_enter}</span>
                            </div>
                        </FlexView>
                    </div>
                    {this.props.field !== localeObj.phone_number &&
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={this.props.field} type={this.props.type}
                                error={this.props.field === localeObj.email
                                    || utilities.validateParameters(this.props.field, this.state.pixData) ? false : true}
                                onChange={this.handlePixInfoChange}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.pixData === "" ? classes.input : classes.finalInput
                                }}
                                value={this.state.displayPixData} autoComplete='off'
                                InputLabelProps={this.state.pixData === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }}
                                helperText={this.props.field === localeObj.email || utilities.validateParameters(this.props.field, this.state.pixData) ? "" : GeneralUtilities.formattedString(localeObj.invalid, [this.props.field])}
                            />
                        </MuiThemeProvider>
                    }
                    {this.props.field === localeObj.phone_number &&
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={this.props.field}
                                type={"tel"}
                                placeholder="(00) 00000-0000"
                                FormHelperTextProps={{ className: classes.helpertextstyle }}
                                helperText={utilities.validateParameters("ddd", utilities.parsePhoneNum(this.state.pixData).phoneNumber.replace(/[^0-9]/g, '').substr(0, 2)) ? "" : localeObj.incorrect_ddd}
                                error={utilities.validateParameters("ddd", utilities.parsePhoneNum(this.state.pixData).phoneNumber.replace(/[^0-9]/g, '').substr(0, 2)) ? false : true}
                                onChange={this.handlePixInfoChange}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.pixData === "" ? classes.input : classes.finalInput
                                }}
                                value={this.state.displayPixData} autoComplete='off'
                                InputLabelProps={this.state.pixData === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                        </MuiThemeProvider>
                    }

                    <div style={{...fieldOpen, textAlign: "center"}}>
                        <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.sendField} />
                    </div>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={2000} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

NewPixContact.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.func,
    requiredInfo: PropTypes.object,
    field: PropTypes.string,
    setTransactionInfo: PropTypes.func,
    multipleSelection: PropTypes.func,
    type: PropTypes.string
    
};

export default withStyles(styles)(NewPixContact);
