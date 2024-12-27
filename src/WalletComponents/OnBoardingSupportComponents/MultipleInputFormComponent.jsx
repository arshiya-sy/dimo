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
import PageNames from "../../Services/PageNames";

import NotVisibleIcon from '@material-ui/icons/VisibilityOffRounded';
import VisibleIcon from '@material-ui/icons/VisibilityRounded';
import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from "../../Services/Constants";
import { is } from "@uirouter/core";
import ColorPicker from "../../Services/ColorPicker";
import CheckRounded from '@mui/icons-material/CheckRounded';
import CircleRounded from '@mui/icons-material/CircleRounded';

const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};
const feature_available = "HINT_PHONE_EMAIL";
const PageNameJSON = PageNames.userId;

class MultipleInputFormComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            field1: props.value1 || "",
            field2: props.value2 || "",
            displayField1: "",
            displayField2: "",
            name:"",
            cpf: "",
            showPassword: false,
            showConfirmPassword: false,
            snackBarOpen: false,
            fieldOpen: false,
            isButtonEnabled: false,
            isLengthValid: false,
            hasNumber: false,
            hasCapitalLetter: false, 
            hasSpecialCharacter: false,
            passwordsMatch: false,
            isButtonEnabledPassword: false,
            isPassword: false,
            isTermsClickable: true,
            fromForgetPassword: props.fromForgetPassword || false
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(this.componentName);

        this.handleNext = this.handleNext.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.updateNextButtonState = this.updateNextButtonState.bind(this);
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = this.props.field;
        }

        this.style = {
            passTextStyle: (isValid) => ({
                color: isValid ? ColorPicker.darkDisabled : ColorPicker.darkHighEmphasis,
                marginLeft: '11px',
            }),
            underLine: {
                borderBottomStyle: "solid",
                width: "fit-content",
                borderBottomWidth: "1.5px"
            }
        }
    }

    componentDidMount() {
        androidApiCalls.enableCopyPaste();
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);

        let passJson = {};
        passJson["isLengthValid"]= this.props.isLengthValid;
        passJson["hasNumber"]= this.props.hasNumber;
        passJson["hasCapitalLetter"]= this.props.hasCapitalLetter; 
        passJson["hasSpecialCharacter"]= this.props.hasSpecialCharacter;
        passJson["passwordsMatch"]= this.props.passwordsMatch;

        this.setDisplayField(this.props.value1, this.props.value2, this.props.isNextEnabled, this.props.isNextEnabledPassword, passJson);

        if(androidApiCalls.isFeatureEnabledInApk(feature_available) && constantObjects.featureEnabler.ENABLE_EMAIL_AUTOPOPULATE && this.props.type === "email"
         && GeneralUtilities.emptyValueCheck(this.props.value1) && this.props.allowAutoPopulate) {
            let Ids = androidApiCalls.getEmailId();
            if(Ids.toString() !== "{}") {
                this.props.isEmailAlert(true);
                let IdsJsonArray = JSON.parse(Ids);
                let finalList = Object.keys(IdsJsonArray);
                this.setState({
                    emailAlert: true,
                    emailList : finalList
                })
            }
            else {
                this.setState({
                    emailAlert: false
                })
            }
        }

        window.onEmailRecieve = (userEmail) => {
            const { activeField } = this.state;

            if (activeField === 'field1') {
                this.setState({ field1: userEmail, displayField1: userEmail });
            } else if (activeField === 'field2') {
                this.setState({ field2: userEmail, displayField2: userEmail });
            }
        }
    }

    onSelectEmail = (userEmail) => {
        this.setState({
            field1: userEmail,
            displayField1: userEmail,
            emailAlert: false
        })
    }

    closeEmailAlertDialog = () => {
        this.props.isEmailAlert(false);
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
            default:
                break;
        }
    }

    setVisibleIconTop2 = () => {
        let dm = androidApiCalls.checkDisplaySize();
        switch (dm) {
            case "EXTRA_LARGE_SCREEN": return "17rem";
            case "NEXT_LARGE_SCREEN": return "18rem";
            case "LARGE_SCREEN": return "20rem";
            case "NORMAL_SCREEN":
            case "SMALL_SCREEN":
                return "21rem";
            default:
                break;
        }
    }

    handleNext = () => {
        const isField1Empty = this.state.field1.replace(/ /g, "") === "";
        const isField2Empty = this.state.field2.replace(/ /g, "") === "";

        if (isField1Empty || isField2Empty) {
            const emptyField = isField1Empty ? this.props.field1 : this.props.field2;
            this.openSnackBar(localeObj.enter_field + " " + emptyField.toString().toLowerCase());
        } else if (this.props.field1 === localeObj.nick_name_label && (this.state.field1.length > 20 || this.state.field1.length < 2)) {
            this.openSnackBar(localeObj.nameError);
            return;
        } else if ((this.props.field2 === localeObj.cpf) && !utilities.validateParameters(this.props.field2, this.state.field2)) {
            this.openSnackBar(GeneralUtilities.formattedString(localeObj.invalid, [this.props.field2]));
            return;
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            if (this.props.field1 === localeObj.emailField) {
                if(this.state.field1 !== this.state.field2){
                    this.openSnackBar(localeObj.emailMismatchError)
                    return;
                } else if(!utilities.validateParameters(this.props.field2, this.state.field2)){
                    this.openSnackBar(GeneralUtilities.formattedString(localeObj.invalid, [this.props.field2]));
                    return;
                }
                let json = {};
                json["field1"] = this.state.field1;
                json["field2"] = this.state.field2;
                json["optin"] = "true";
                this.props.recieveField(json);
            } else {
                let json = {};
                json["field1"] = this.state.field1;
                json["field2"] = this.state.field2;
                json["isNextEnabled"] = this.state.isButtonEnabled;
                json["isNextEnabledPassword"] = this.state.isButtonEnabledPassword;
                json["isLengthValid"] = this.state.isLengthValid;
                json["hasNumber"] = this.state.hasNumber;
                json["hasCapitalLetter"] = this.state.hasCapitalLetter;
                json["hasSpecialCharacter"] = this.state.hasSpecialCharacter;
                json["passwordsMatch"] = this.state.passwordsMatch;
                this.props.recieveField(json);
            }
        }
    }

    updateNextButtonState = () => {
        if(this.componentName === PageNameJSON.name){
            if((this.state.field1.length >= 2) && this.state.field2.length === 11){
                this.setState({ isButtonEnabled: true, isButtonEnabledPassword: true });
            } else {
                this.setState({ isButtonEnabled: false, isButtonEnabledPassword: false });
            }
        }
    }


    setDisplayField = (value1, value2, isNextEnabled, isNextEnabledPassword, passJson) => {
        if (this.componentName === PageNameJSON.name) {
            let cpfObj = utilities.parseCPF(value2);
            this.setState({
                displayField1: value1,
                displayField2: cpfObj.displayCPF,
                isButtonEnabled: isNextEnabled
            })
        } else if (this.componentName === PageNameJSON.email){
            this.setState({
                displayField1: value1,
                displayField2: value2,
            })
        } else {
            this.setState({
                displayField1: value1,
                displayField2: value2,
                isButtonEnabledPassword: isNextEnabledPassword,
                isLengthValid: passJson["isLengthValid"],
                hasNumber: passJson["hasNumber"],
                hasCapitalLetter: passJson["hasCapitalLetter"], 
                hasSpecialCharacter: passJson["hasSpecialCharacter"], 
                passwordsMatch: passJson["passwordsMatch"]
            })
        }
    }

    sendOptInField = () => {
        const isField1Empty = this.state.field1.replace(/ /g, "") === "";
        const isField2Empty = this.state.field2.replace(/ /g, "") === "";

        if (isField1Empty || isField2Empty) {
            const emptyField = isField1Empty ? this.props.field1 : this.props.field2;
            this.openSnackBar(localeObj.enter_field + " " + emptyField.toString().toLowerCase());
        } else if (this.props.field1 === localeObj.nick_name_label && (this.state.field1.length > 20 || this.state.field1.length < 2)) {
            this.openSnackBar(localeObj.nameError);
            return;
        } else if ((this.props.field2 === localeObj.cpf) && !utilities.validateParameters(this.props.field2, this.state.field2)) {
            this.openSnackBar(GeneralUtilities.formattedString(localeObj.invalid, [this.props.field2]));
            return;
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            if (this.props.field1 === localeObj.emailField) {
                if(this.state.field1 !== this.state.field2){
                    this.openSnackBar(localeObj.emailMismatchError)
                    return;
                } else if(!utilities.validateParameters(this.props.field2, this.state.field2)){
                    this.openSnackBar(GeneralUtilities.formattedString(localeObj.invalid, [this.props.field2]));
                    return;
                }
                let json = {};
                json["field1"] = this.state.field1;
                json["optin"] = "undecided";
                this.props.recieveField(json);
            } else {
                let json = {};
                json["field1"] = this.state.field1;
                json["field2"] = this.state.field2;
                json["isNextEnabled"] = this.state.isButtonEnabled;
                json["isNextEnabledPassword"] = this.state.isButtonEnabledPassword;
                json["isLengthValid"] = this.state.isLengthValid;
                json["hasNumber"] = this.state.hasNumber;
                json["hasCapitalLetter"] = this.state.hasCapitalLetter;
                json["hasSpecialCharacter"] = this.state.hasSpecialCharacter;
                json["passwordsMatch"] = this.state.passwordsMatch;
                this.props.recieveField(json);
            }
        }
    }

    showPassword = () => {
        this.setState({
            showPassword: !this.state.showPassword
        })
    }

    showConfirmPassword = () => {
        this.setState({
            showConfirmPassword: !this.state.showConfirmPassword
        })
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

    handleChange = name => event => {
        if (name === localeObj.cpf && event.target.value.length !== 0) {
            const re = /^[0-9.-]+$/;
            if (re.test(event.target.value)) {
                let cpfObj = {}
                cpfObj = utilities.parseCPF(event.target.value);
                this.setState({
                    displayField2: cpfObj.displayCPF,
                    field2: cpfObj.displayCPF.replace(/[^0-9]/g, '')
                }, this.updateNextButtonState)
            }
        } else if (name === localeObj.nick_name_label
            && event.target.value.length !== 0) {
            const re = /^[A-Za-z\u00C0-\u00FF ]+$/;
            if (re.test(event.target.value)) {
                this.setState({
                    displayField1: event.target.value,
                    field1: event.target.value
                }, this.updateNextButtonState);
            }
        } else if (name === localeObj.emailField
            && event.target.value.length !== 0) { 
            this.setState({
                displayField1: event.target.value,
                field1: event.target.value
            });
        } else if (name === localeObj.emailConfirmation
            && event.target.value.length !== 0) {
            this.setState({
                displayField2: event.target.value,
                field2: event.target.value
            });
        } else if (name === localeObj.password) {
            if (event.target.value.length < 17) {
                let value = event.target.value.split(" ").join("");
                this.setState({
                    displayField1: value,
                    field1: value
                }, this.validatePassword)
            }
        } else if (name === localeObj.confirm_password) {
            if (event.target.value.length < 17) {
                let value = event.target.value.split(" ").join("");
                this.setState({
                    displayField2: value,
                    field2: value
                }, this.validatePassword)
            }
        } else {
            if(name === localeObj.nick_name_label || name === localeObj.emailField || name === localeObj.password){
                this.setState({
                    displayField1: event.target.value,
                    field1: event.target.value,
                });
            } else {
                this.setState({
                    displayField2: event.target.value,
                    field2: event.target.value
                });
            }
        }
    };

    validatePassword = () => {
        const password = this.state.field1;
        const isLengthValid = password.length >= 8 && password.length <= 16;
        const hasNumber = /[0-9]/.test(password);
        const hasCapitalLetter = /[A-Z]/.test(password);
        const hasSpecialCharacter = /[@#$]/.test(password);

        this.setState({
            isLengthValid,
            hasNumber,
            hasCapitalLetter,
            hasSpecialCharacter,
            isPassword: isLengthValid && hasNumber && hasCapitalLetter && hasSpecialCharacter
        }, () => {
            if(this.state.field1 !== "" && (this.state.field1 === this.state.field2)){
                this.setState({ passwordsMatch: true })
                if(this.state.isLengthValid && this.state.hasNumber && this.state.hasCapitalLetter && this.state.hasSpecialCharacter){
                    this.setState({ isButtonEnabledPassword: true })
                } else {
                    this.setState({ isButtonEnabledPassword: false });
                }
            } else {
                this.setState({ passwordsMatch: false, isButtonEnabledPassword: false })
            }
        });
    }

    checkIfInputIsActive = (e) => {
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

    read = (val) => {
        if (this.state.isTermsClickable) {
            this.setState({ isTermsClickable: false });

            this.props.read(val);

            setTimeout(() => {
                this.setState({ isTermsClickable: true });
            }, 2000);
        }
    };

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const mainHeight = finalHeight * (this.props.footNote ? 0.35 : 0.29);
        const minHeight = finalHeight * (this.props.footNote ? 0.64 : 0.55);
        
        const getBulletOrCheck = (isValid) => (
            isValid ? 
            <CheckRounded style={{ width: '14px', height: '14px', color: ColorPicker.success }} /> : 
            <CircleRounded style={{ width: '4px', height: '4px', marginRight:"0.5rem", marginLeft: "0.3rem", color: ColorPicker.darkDisabled }} />
        );

        if (!this.props.emailAlert) {
            if (this.state.emailAlert) {
                this.setState({
                    emailAlert: false
                })
            }
        }
        return (
            <div style={{ overflow: "hidden" }}>
                <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight - minHeight}px` : `${finalHeight - mainHeight}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={GeneralUtilities.isScreenSetToMax() && this.state.fieldOpen ? InputThemes.largestInitialMarginStyle : InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {this.props.header}
                            </div>
                            <div className="body2 highEmphasis scroll" style={this.state.fieldOpen || GeneralUtilities.isDisplaySetToLarge() ?
                                InputThemes.descriptionWithField : InputThemes.descriptionWithoutField}>
                                {this.props.description}
                            </div>
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={InputThemes.SingleInputTheme}>
                        <div style={{ display: 'inline-block' }}>
                            <TextField label={this.props.field1} type={this.state.showPassword ? "text" : this.props.type}
                                error={this.props.field1 === localeObj.emailField || utilities.validateParameters(this.props.field1, this.state.field1) ? false : true}
                                onChange={this.handleChange(this.props.field1)} value={this.state.displayField1 || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.field1 === "" ? classes.multipleInput : classes.multipleFinalInput
                                }}
                                onFocus={() => this.setState({ activeField: 'field1' })}
                                autoComplete='off'
                                InputLabelProps={this.state.field1 === "" ?
                                    { className: classes.multipleInput } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }}
                                helperText={this.props.field1 === localeObj.emailField || utilities.validateParameters(this.props.field1, this.state.field1) ? "" :
                                    GeneralUtilities.formattedString(localeObj.invalid, [this.props.field1])}
                            />
                            <TextField style={{marginTop: "70px"}} label={this.props.field2} type={this.state.showConfirmPassword ? "text" : this.props.type}
                                error={this.props.field2 === localeObj.emailField || utilities.validateParameters(this.props.field2, this.state.field2) ? false : true}
                                onChange={this.handleChange(this.props.field2)} value={this.state.displayField2 || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.field2 === "" ? classes.multipleInput : classes.multipleFinalInput
                                }}
                                onFocus={() => this.setState({ activeField: 'field2' })}
                                autoComplete='off'
                                disabled={this.props.field2 === localeObj.confirm_password && !this.state.isPassword}
                                InputLabelProps={this.state.field2 === "" ?
                                    { className: classes.multipleInput } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }}
                                helperText={this.props.field2 === localeObj.emailField || utilities.validateParameters(this.props.field2, this.state.field2) ? "" :
                                    GeneralUtilities.formattedString(localeObj.invalid, [this.props.field2])}
                            />
                            {this.props.type === "password" && this.state.showPassword &&
                                <span onClick={() => this.showPassword()}>
                                    <VisibleIcon className="highEmphasis" style={{ position: 'absolute', right: 40, top: this.setVisibleIconTop(), width: 30 }} />
                                </span>
                            }
                            {this.props.type === "password" && !this.state.showPassword &&
                                <span onClick={() => this.showPassword()}>
                                    <NotVisibleIcon className="highEmphasis" style={{ position: 'absolute', right: 40, top: this.setVisibleIconTop(), width: 30 }} />
                                </span>
                            }
                            {this.props.type === "password" && this.state.showConfirmPassword &&
                                <span onClick={() => this.showConfirmPassword()}>
                                    <VisibleIcon className="highEmphasis" style={{ position: 'absolute', right: 40, top: this.setVisibleIconTop2(), width: 30 }} />
                                </span>
                            }
                            {this.props.type === "password" && !this.state.showConfirmPassword &&
                                <span onClick={() => this.showConfirmPassword()}>
                                    <NotVisibleIcon className="highEmphasis" style={{ position: 'absolute', right: 40, top: this.setVisibleIconTop2(), width: 30 }} />
                                </span>
                            }
                            {this.state.emailAlert &&
                            <AlertDialog  title ={localeObj.email_autopopulate_alert_header} positiveBtn = {localeObj.email_autopopulate_alert_button}  neagtiveBtn = {localeObj.cancel}
                             choice= {this.state.emailList} handleClose= {this.closeEmailAlertDialog} onSelect = {this.onSelectEmail} type="emailAutoPopulate" allowRadio={true}/>
                            }
                        </div>
                        {this.props.type === "password" &&
                        <div style={{ marginLeft: '20px', marginTop: '130px', maxWidth: 'fit-content' }}>                           
                            <div style={{ display: 'flex', marginBottom: '0.3rem' }}>
                                <div style={{}}>{getBulletOrCheck(this.state.isLengthValid)}</div>
                                <div style={this.style.passTextStyle((this.state.isLengthValid))}>{localeObj.password_condition1}</div>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '0.3rem' }}>
                                <div>{getBulletOrCheck(this.state.hasNumber)}</div>
                                <div style={this.style.passTextStyle(this.state.hasNumber)}>{localeObj.password_condition2}</div>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '0.3rem' }}>
                                <div>{getBulletOrCheck(this.state.hasCapitalLetter)}</div>
                                <div style={this.style.passTextStyle(this.state.hasCapitalLetter)}>{localeObj.password_condition3}</div>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '0.3rem' }}>
                                <div>{getBulletOrCheck(this.state.hasSpecialCharacter)}</div>
                                <div style={this.style.passTextStyle(this.state.hasSpecialCharacter)}>{localeObj.password_condition4}</div>
                            </div>
                            <div style={{ display: 'flex', marginBottom: '0.3rem' }}>
                                <div>{getBulletOrCheck(this.state.passwordsMatch)}</div>
                                <div style={this.style.passTextStyle(this.state.passwordsMatch)}>{localeObj.password_condition5}</div>
                            </div>
                        </div>
                    }
                    </MuiThemeProvider>
                </div>               
                <div align="center" style={this.state.fieldOpen && this.props.footNote ? InputThemes.formButtonStyle : InputThemes.bottomButtonStyle}>
                    <FlexView column style={{ display: this.state.fieldOpen ? "none" : "block" }}>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginLeft: "23.5px", marginRight: "25px", marginBottom: "52px" }}>
                            {this.props.footNote}
                        </div>
                        { this.componentName === PageNameJSON.name &&
                            <div className="label2 highEmphasis" style={{ marginLeft: "24px", marginRight: "41px", marginBottom: "27px", textAlign: "left" }}>
                                    {localeObj.terms_desc1}
                                    <span className="label2 accent" style={this.style.underLine} onClick={() => this.read("privacy")}>{localeObj.terms_privacy}</span>
                                    {localeObj.terms_desc2} 
                                    <span className="label2 accent" style={this.style.underLine} onClick={() => this.read("account")}>{localeObj.account_terms}</span>
                                    {localeObj.terms_desc3}
                            </div>
                        }
                    </FlexView>
                    {this.componentName === PageNameJSON.name || this.props.type === "password"?
                        <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.handleNext} disabled={this.props.type==="password"? !this.state.isButtonEnabledPassword : !this.state.isButtonEnabled}/>
                        :
                        <PrimaryButtonComponent btn_text={this.props.firstBtn ? this.props.firstBtn : localeObj.next} onCheck={this.handleNext} />
                    }
                    {this.props.secBtnText && <SecondaryButtonComponent btn_text={this.props.secBtnText} onCheck={this.sendOptInField} />}
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

MultipleInputFormComponent.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(MultipleInputFormComponent);
