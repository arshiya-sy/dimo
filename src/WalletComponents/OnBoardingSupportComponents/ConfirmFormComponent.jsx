import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import InputThemes from "../../Themes/inputThemes";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import utilities from "../../Services/NewUtilities";

import NotVisibleIcon from '@material-ui/icons/VisibilityOffRounded';
import VisibleIcon from '@material-ui/icons/VisibilityRounded';
import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import GeneralUtilities from "../../Services/GeneralUtilities";
import constantObjects from "../../Services/Constants";

const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};

class ConfirmFormComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            field: "",
            displayField: "",
            showPassword: false,
            snackBarOpen: false,
            clearPassword: true
        }
        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);
        if (this.props.componentName === null || this.props.componentName === undefined) {
            this.componentName = this.props.field;
        } else {
            this.componentName = this.props.componentName;
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

    setDisplayField = (value) => {
        if (this.props.field === localeObj.cpf) {
            let cpfObj = utilities.parseCPF(value);
            if (cpfObj.displayCPF) {
                this.setState({
                    displayField: cpfObj.displayCPF,
                    field: cpfObj.displayCPF.replace(/[^0-9]+/g, '')
                });
            } else {
                this.setState({
                    displayField: "",
                    field: ""
                });
            }
        } else if (this.props.field === localeObj.salary) {
            if (value !== -1) {
                let displaySalary = utilities.parseSalary(value + this.props.decimal);
                this.setState({
                    displayField: "R$ " + displaySalary,
                    field: value + this.props.decimal
                })
            }
        } else if (value) {
            this.setState({
                displayField: value,
                field: value
            })
        }
    }

    sendField = () => {
        if (this.state.field === "" || this.state.field === -1) {
            this.openSnackBar(localeObj.enter_field + " " + this.props.field.toString().toLowerCase());
            this.resetField();
        } else if (this.props.field === localeObj.cpf && this.state.field.length !== 11) {
            this.openSnackBar(localeObj.check_cpf);
            this.resetField();
            return;
        } else if (this.props.field === localeObj.password
            && (this.state.field.length < 8 || this.state.field.length > 16)) {
            this.openSnackBar(localeObj.password_length);
            return;
        } else if (!utilities.validateParameters(this.props.field, this.state.field)) {
            this.openSnackBar(GeneralUtilities.formattedString(localeObj.invalid, [this.props.field]));
            this.resetField();
            return;
        } else if (this.props.field === localeObj.salary) {
            if (this.state.field.length > 10) {
                this.openSnackBar(localeObj.salary_length);
                return;
            }
            if (this.state.field.replace(/0/g, "").length === 0 || this.state.field.substring(0, 1) === "0") {
                this.openSnackBar(localeObj.salary_validation);
                return;
            }
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.recieveField(this.state.field.substring(0, this.state.field.length - 2));
            this.props.recieveDecimal(this.state.field.substring(this.state.field.length - 2, this.state.field.length));
        } else {
            this.setState({
                clearPassword: true
            });
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.recieveField(this.state.field);
        }
    }

    resetField = () => {
        this.setState({
            field: "",
            displayField: ""
        })
    }

    showPassword = () => {
        this.setState({
            showPassword: !this.state.showPassword
        })
    }

    forgotPassword = () => {
        this.props.forgotPassword();
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
                if (cpfObj.displayCPF) {
                    this.setState({
                        displayField: cpfObj.displayCPF,
                        field: cpfObj.displayCPF.replace(/[^0-9]/g, '')
                    })
                } else {
                    this.setState({
                        displayField: "",
                        field: ""
                    });
                }
            } else {
                this.setState({
                    field: event.target.value,
                    displayField: event.target.value
                });
            }
        } else if (this.props.field === localeObj.salary && event.target.value.length !== 0) {
            const re = /^[0-9]+$/;
            let value = event.target.value.replace(/[^0-9]/g, "");
            if (value.length === 0) {
                this.resetField();
            } else if (re.test(value)) {
                let displaySalary = utilities.parseSalary(event.target.value);
                this.setState({
                    displayField: "R$ " + displaySalary,
                    field: displaySalary.replace(/[^0-9]/g, '')
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
        } else {
            this.setState({
                field: event.target.value,
                displayField: event.target.value
            });
        }
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

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const mainHeight = finalHeight * (this.props.type === "password" ? 0.35 : 0.29);
        const minHeight = finalHeight * (this.props.type === "password" ? 0.64 : 0.58);
        if (this.props.clearPassword && this.state.clearPassword) {
            this.setState({
                clearPassword: false
            })
            this.resetField();
        }
        let showError = this.props.showError === false ? false : true;
        return (
            <div style={{ overflow: "hidden" }}>
                <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight - minHeight}px` : `${finalHeight - mainHeight}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={GeneralUtilities.isScreenSetToMax() && this.state.fieldOpen ? InputThemes.largestInitialMarginStyle : InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {this.props.header}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                {this.props.description}
                            </div>
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={InputThemes.SingleInputTheme}>
                        <div style={{ display: 'inline-block' }}>
                            <TextField
                                label={this.props.field} type={this.state.showPassword ? "text" : this.props.type}
                                error={showError && !utilities.validateParameters(this.props.field, this.state.field) ? true : false}
                                onChange={this.handleChange} value={this.state.displayField || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.field === "" ? classes.input : classes.finalInput
                                }} autoComplete='off'
                                InputLabelProps={this.state.field === "" || this.state.field === -1 ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }}
                                helperText={(showError && !utilities.validateParameters(this.props.field, this.state.field)) ?
                                    GeneralUtilities.formattedString(localeObj.invalid, [this.props.field]) : ""} />
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
                        </div>
                    </MuiThemeProvider>
                </div>
                <div style={this.state.fieldOpen && this.props.type === "password" ? InputThemes.formButtonStyle : InputThemes.bottomButtonStyle}>
                    <div style={{textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={this.props.btnText} onCheck={this.sendField} />
                    {this.props.type === "password" &&
                        <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: GeneralUtilities.isScreenSetToMax() ? "0.25rem" : "1.5rem" }} onClick={() => this.forgotPassword()}>
                            {localeObj.forgotPassword}
                        </div>}
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

ConfirmFormComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    type: PropTypes.string,
    btnText: PropTypes.string,
    field: PropTypes.string,
    description: PropTypes.string,
    header: PropTypes.string,
    componentName: PropTypes.string,
    value: PropTypes.string,
    decimal: PropTypes.string,
    recieveField: PropTypes.func,
    recieveDecimal: PropTypes.func,
    forgotPassword: PropTypes.func,
    clearPassword: PropTypes.bool,
    showError: PropTypes.bool
};

export default withStyles(styles)(ConfirmFormComponent);
