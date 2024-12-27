import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import InputThemes from "../../Themes/inputThemes";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";

import AlertDialog from "../NewOnboardingComponents/AlertDialog";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import utilities from "../../Services/NewUtilities";
import GeneralUtilities from "../../Services/GeneralUtilities";

import NotVisibleIcon from '@material-ui/icons/VisibilityOffRounded';
import VisibleIcon from '@material-ui/icons/VisibilityRounded';
import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from "../../Services/Constants";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";
import PageNames from "../../Services/PageNames";

const PageNameJSON = PageNames.userProfileDetails;
const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};
const feature_available = "HINT_PHONE_EMAIL"
var redactedMail = "";

class DetailFormComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            field: props.value || "",
            displayField: "",
            snackBarOpen: false,
            fieldOpen: false
        }
        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = this.props.field;
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enableCopyPaste();
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);

        this.setDisplayField(this.props.value);

        if (androidApiCalls.isFeatureEnabledInApk(feature_available) && constantObjects.featureEnabler.ENABLE_EMAIL_AUTOPOPULATE && this.props.type === "email"
            && GeneralUtilities.emptyValueCheck(this.props.value) && this.props.allowAutoPopulate) {
            let Ids = androidApiCalls.getEmailId();
            if (Ids.toString() !== "{}") {
                let IdsJsonArray = JSON.parse(Ids);
                let finalList = Object.keys(IdsJsonArray);
                this.setState({
                    emailAlert: true,
                    emailList: finalList
                })
            }
            else {
                this.setState({
                    emailAlert: false
                })
            }
        }

        window.onEmailRecieve = (userEmail) => {
            this.setState({
                field: userEmail,
                displayField: userEmail
            })
        }
    }

    onSelectEmail = (userEmail) => {
        this.setState({
            field: userEmail,
            displayField: userEmail,
            emailAlert: false
        })
    }

    closeEmailAlertDialog = () => {
        this.setState({
            emailAlert: false
        })
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
        androidApiCalls.disableCopyPaste();
        window.removeEventListener("resize", this.checkIfInputIsActive);
    }

    setVisibleIconTop = () => {
        let dm = androidApiCalls.checkDisplaySize();
        switch (dm) {
            case "EXTRA_LARGE_SCREEN": return "12.5rem";
            case "NEXT_LARGE_SCREEN": return "13.5rem";
            case "LARGE_SCREEN": return "15.5rem";
            case "NORMAL_SCREEN":
            case "SMALL_SCREEN":
                return "16.5rem";
            default: break;
        }
    }

    sendOtpToEmail = () => {
        this.showProgressDialog();
        arbiApiService.generateEmailOtp(this.state.email, PageNameJSON.update_email)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processOtpForProfileResponse(response.result);
                    if (processorResponse.success) {
                        redactedMail = processorResponse.message;
                        this.setState({
                            currentState: "input_email_otp",
                            direction: "left"
                        });
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater);
                        return;
                    }
                } else {
                    let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                    this.setState({ previousState: "update_email" });
                    this.setErrorJson(errorJson);
                }
            });
    }


    sendField = () => {
        var regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,16}$/;
        const addressRegex = /^(?=.*\d)?[\w\d,.\s\-@*_:]*$/;

        if (this.props.field === localeObj.add_comp) {
            if (this.state.field.length > 30) {
                this.openSnackBar(localeObj.invalid_addcomp);
                return;
            } else if (!addressRegex.test(this.state.field)) {
                this.openSnackBar(localeObj.invalid_addcomp_nospl_chars);
                return;
            } else {
                MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                this.sendOtpToEmail()
            }
        } else if (this.state.field.replace(/ /g, "") === "") {
            if (this.props.field.toString() === localeObj.cnpj) {
                this.openSnackBar(localeObj.enter_field + " " + localeObj.cnpj);
            } else {
                this.openSnackBar(localeObj.enter_field + " " + this.props.field.toString().toLowerCase());
            }
        } else if (this.props.field === localeObj.cep && this.state.field.length !== 8) {
            this.openSnackBar(GeneralUtilities.formattedString(localeObj.invalid, [this.props.field]));
            return;
        } else if (this.props.field === localeObj.nick_name && (this.state.field.length > 20 || this.state.field.length < 2)) {
            this.openSnackBar(localeObj.nameError);
            return;
        } else if (this.props.field === localeObj.social_reason && (this.state.field.length > 100 || this.state.field.length < 2)) {
            this.openSnackBar(localeObj.companyError);
            return;
        } else if (this.props.field === localeObj.fullname && (this.state.field.length > 50 || this.state.field.length < 2)) {
            this.openSnackBar(localeObj.fullname + " " + localeObj.lengthError);
            return;
        } else if (this.props.field === localeObj.cnpj && this.state.field.length !== 14) {
            this.openSnackBar(localeObj.cnpj_error);
            return;
        } else if (this.props.field !== localeObj.cnpj && !utilities.validateParameters(this.props.field, this.state.field)) {
            this.openSnackBar(GeneralUtilities.formattedString(localeObj.invalid, [this.props.field]));
            return;
        } else if (this.props.field === localeObj.cpf && this.state.field.length !== 11) {
            this.openSnackBar(localeObj.check_cpf);
            return;
        } else if (this.props.field === localeObj.password && !regex.test(this.state.field)) {
            this.openSnackBar(localeObj.password_length);
            return;
        } else if (this.props.field === localeObj.add_num && this.state.field.length > 5) {
            this.openSnackBar(localeObj.invalid_addnum);
            return;
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            if (this.props.field === localeObj.email) {
                let json = {};
                json["field"] = this.state.field;
                json["optin"] = "true";
                this.props.recieveField(json);
            } else {
                this.props.recieveField(this.state.field);
            }
        }
    }

    sendOptInField = () => {
        if (this.state.field.replace(/ /g, "") === "") {
            if (this.props.field.toString() === localeObj.cnpj) {
                this.openSnackBar(localeObj.enter_field + " " + localeObj.cnpj);
            } else {
                this.openSnackBar(localeObj.enter_field + " " + this.props.field.toString().toLowerCase());
            }
            return;
        } else if (!utilities.validateParameters(this.props.field, this.state.field)) {
            this.openSnackBar(GeneralUtilities.formattedString(localeObj.invalid, [this.props.field]));
            return;
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            let json = {};
            json["field"] = this.state.field;
            json["optin"] = "undecided";
            this.props.recieveField(json);
        }
    }

    setDisplayField = (value) => {
        if (this.props.field === localeObj.cpf) {
            let cpfObj = utilities.parseCPF(value);
            this.setState({
                displayField: cpfObj.displayCPF,
            })
        } else if (this.props.field === localeObj.cep) {
            let cepObj = utilities.parseCEP(value);
            this.setState({
                displayField: cepObj.cepDisp
            })
        } else if (this.props.field === localeObj.cnpj) {
            let cnpjObj = utilities.parseCnpj(value);
            if (!GeneralUtilities.emptyValueCheck(value)) {
                this.setState({
                    displayField: cnpjObj.displayCPF,
                    field: cnpjObj.displayCPF.replace(/[^0-9]/g, '')
                })
            } else {
                this.setState({
                    displayField: value
                })
            }
        } else {
            this.setState({
                displayField: value
            })
        }
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

    handleChange(event) {
        if (this.props.field === localeObj.cpf && event.target.value.length !== 0) {
            const re = /^[0-9.-]+$/;
            if (re.test(event.target.value)) {
                let cpfObj = {}
                cpfObj = utilities.parseCPF(event.target.value);
                this.setState({
                    displayField: cpfObj.displayCPF,
                    field: cpfObj.displayCPF.replace(/[^0-9]/g, '')
                })
            }
        } else if (this.props.field === localeObj.cnpj && event.target.value.length !== 0) {
            const re = /^([0-9.-]|\/)+$/;
            if (re.test(event.target.value)) {
                let cpfObj = {}
                cpfObj = utilities.parseCnpj(event.target.value);
                this.setState({
                    displayField: cpfObj.displayCPF,
                    field: cpfObj.displayCPF.replace(/[^0-9]/g, '')
                })
            } else if (event.target.value.length === 0) {
                this.setState({
                    field: event.target.value,
                    displayField: event.target.value
                })
            }
        } else if (this.props.field === localeObj.password) {
            if (event.target.value.length < 17) {
                let value = event.target.value.split(" ").join("");
                this.setState({
                    displayField: value,
                    field: value
                })
            }
        } else if (this.props.field === localeObj.cep && event.target.value.length !== 0) {
            const re = /^[0-9-]+$/;
            if (re.test(event.target.value)) {
                let cepObj = {};
                cepObj = utilities.parseCEP(event.target.value);
                this.setState({
                    displayField: cepObj.cepDisp,
                    field: cepObj.cepDisp.replace(/[^0-9]/g, '')
                })
            }
        } else if ((this.props.field === localeObj.nick_name || this.props.field === localeObj.fullname)
            && event.target.value.length !== 0) {
            const re = /^[A-Za-z\u00C0-\u00FF ]+$/;
            if (re.test(event.target.value)) {
                this.setState({
                    field: event.target.value,
                    displayField: event.target.value
                });
            }
        } else if (this.props.field === localeObj.add_num && event.target.value.length !== 0) {
            const re = /^[0-9]+$/;
            if (re.test(event.target.value)) {
                this.setState({
                    field: event.target.value,
                    displayField: event.target.value
                });
            }
        } else {
            this.setState({
                field: event.target.value,
                displayField: event.target.value
            });
        }
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

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const mainHeight = finalHeight * (this.props.footNote ? 0.35 : 0.29);
        const minHeight = finalHeight * (this.props.footNote ? 0.64 : 0.58);
        return (
            <div style={{ overflow: "hidden" }}>
                <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight - minHeight}px` : `${finalHeight - mainHeight}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={GeneralUtilities.isScreenSetToMax() && this.state.fieldOpen ? InputThemes.largestInitialMarginStyle : InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.email_header_profile_update}
                            </div>
                            <div className="body2 highEmphasis scroll" style={this.state.fieldOpen || GeneralUtilities.isDisplaySetToLarge() ?
                                InputThemes.descriptionWithField : InputThemes.descriptionWithoutField}>
                                {this.props.description}
                            </div>
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={InputThemes.SingleInputTheme}>
                        <div style={{ display: 'inline-block' }}>
                            <TextField label={localeObj.email} type={"email"}
                                error={localeObj.email === localeObj.email || utilities.validateParameters(localeObj.email, this.state.field) ? false : true}
                                onChange={this.handleChange} value={this.state.displayField || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.field === "" ? classes.input : classes.finalInput
                                }} autoComplete='off'
                                InputLabelProps={this.state.field === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }}
                                placeholder={localeObj.email === localeObj.add_comp ? localeObj.pix_optional : ""}
                                helperText={localeObj.email === localeObj.email || utilities.validateParameters(localeObj.email, this.state.field) ? "" :
                                    (localeObj.email === localeObj.cnpj ? localeObj.cnpj_error : GeneralUtilities.formattedString(localeObj.invalid, [this.props.field]))}
                            />
                            {this.state.emailAlert &&
                                <AlertDialog title={localeObj.email_autopopulate_alert_header} positiveBtn={localeObj.email_autopopulate_alert_button} neagtiveBtn={localeObj.cancel}
                                    choice={this.state.emailList} handleClose={this.closeEmailAlertDialog} onSelect={this.onSelectEmail} type="emailAutoPopulate" allowRadio={true} />
                            }
                        </div>
                    </MuiThemeProvider>
                </div>
                <div style={this.state.fieldOpen && this.props.footNote ? InputThemes.formButtonStyle : InputThemes.bottomButtonStyle}>
                    <div style={{ textAlign: "center" }}>
                        <FlexView column style={{ display: this.state.fieldOpen ? "none" : "block" }}>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", margin: "1.5rem" }}>
                                {this.props.footNote}
                            </div>
                        </FlexView>
                        <PrimaryButtonComponent btn_text={this.props.firstBtn ? this.props.firstBtn : localeObj.next} onCheck={this.sendField} />
                        {this.props.secBtnText && <SecondaryButtonComponent btn_text={this.props.secBtnText} onCheck={this.sendOptInField} />}
                    </div>
                </div>
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

DetailFormComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    field: PropTypes.string,
    componentName: PropTypes.string,
    description: PropTypes.string,
    header: PropTypes.string,
    value: PropTypes.string,
    firstBtn: PropTypes.string,
    secBtnText: PropTypes.string,
    footNote: PropTypes.string,
    type: PropTypes.string,
    recieveField: PropTypes.func,
    allowAutoPopulate: PropTypes.bool
};

export default withStyles(styles)(DetailFormComponent);
