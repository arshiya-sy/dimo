import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from "../../Services/Constants";
import NewUtilities from "../../Services/NewUtilities";
import GeneralUtilities from "../../Services/GeneralUtilities";

const theme1 = InputThemes.DetailsTheme;
const snackBar = InputThemes.snackBarTheme;
const styles = InputThemes.multipleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};

class RegisterWaitList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            mobileNumber: "",
            ddd: "",
            name: "",
            cpf: "",
            email: ""
        }
        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
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

    sendField = () => {
        if (this.state.name.length > 20 || this.state.name.length < 2) {
            this.openSnackBar(localeObj.nameError);
            return;
        } else if (this.state.cpf.length !== 11) {
            this.openSnackBar(localeObj.check_cpf);
            return;
        } else if (!NewUtilities.validateParameters(localeObj.cpf, this.state.cpf)) {
            this.openSnackBar(GeneralUtilities.formattedString(localeObj.invalid, [localeObj.cpf]));
            return;
        } else if (!NewUtilities.validateParameters(localeObj.email, this.state.email)) {
            this.openSnackBar(GeneralUtilities.formattedString(localeObj.invalid, [localeObj.email]));
            return;
        } else if (this.state.cpf.replace(/ /g, "") === "" || this.state.name.replace(/ /g, "") === "" ||
            this.state.email.replace(/ /g, "") === "" || this.state.mobileNumber.replace(/ /g, "") === "") {
            this.openSnackBar(localeObj.enter_all_details);
            return;
        } else if (!NewUtilities.validateParameters("ddd", this.state.ddd)) {
            this.openSnackBar(localeObj.invalid_phone);
            return;
        } else if (this.state.mobNum.length !== 9 || parseInt(this.state.mobNum[0]) !== 9) {
            this.openSnackBar(localeObj.invalid_phone);
            return;
        } else {
            let jsonObject = {};
            jsonObject["name"] = this.state.name;
            jsonObject["cpf"] = this.state.cpf;
            jsonObject["email"] = this.state.email;
            jsonObject["ddd"] = this.state.ddd;
            jsonObject["mobNum"] = this.state.mobNum;
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.recieveField(jsonObject);
        }
    }

    handleChange = name => event => {
        if (name === "cpf") {
            if (event.target.value.length !== 0) {
                const re = /^[0-9.-]+$/;
                if (re.test(event.target.value)) {
                    let cpfObj = {}
                    cpfObj = NewUtilities.parseCPF(event.target.value);
                    this.setState({
                        displayCPF: cpfObj.displayCPF,
                        cpf: cpfObj.displayCPF.replace(/[^0-9]/g, '')
                    })
                }
            } else {
                this.setState({
                    displayCPF: "",
                    cpf: ""
                })
            }
        } else if (name === "name" && event.target.value.length !== 0) {
            const re = /^[A-Za-z\u00C0-\u00FF ]+$/;
            if (re.test(event.target.value)) {
                this.setState({ [name]: event.target.value });
            }
        } else if (name === "phone") {
            if (event.target.value.length !== 0) {
                let phoneNumObj = {};
                const re = /^[0-9/(/)/ /-]+$/;
                if (re.test(event.target.value)) {
                    phoneNumObj = NewUtilities.parsePhoneNum(event.target.value);
                    if (phoneNumObj.phoneNumber.length !== 0) {
                        this.setState({
                            ddd: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(0, 2),
                            mobNum: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(2, 11),
                            mobileNumber: phoneNumObj.phoneNumber
                        })
                    } else {
                        this.setState({
                            ddd: "",
                            mobNum: "",
                            mobileNumber: ""
                        })
                    }
                }
            } else {
                this.setState({
                    ddd: "",
                    mobNum: "",
                    mobileNumber: ""
                })
            }
        } else {
            this.setState({ [name]: event.target.value });
        }
    };

    checkStatus = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.checkStatus();
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

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle;
        return (
            <div style={{ overflow: "hidden" }}>
                <div className="scroll" style={{ overflowY: "auto", height: this.state.fieldOpen ? `${finalHeight - 530}px` : `${finalHeight - 240}px` }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.join_waitlist}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.5rem" }}>
                                {localeObj.join_desc}
                            </div>
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={theme1}>
                        <TextField label={localeObj.fullname}
                            onChange={this.handleChange("name")} value={this.state.name || ""}
                            InputProps={{
                                classes: { underline: classes.underline },
                                className: this.state.name === "" ? classes.input : classes.finalInput
                            }} autoComplete='off'
                            InputLabelProps={this.state.name === "" ?
                                { className: classes.input } : { className: classes.finalStyle }} />

                        <TextField label={localeObj.cpf} type={'tel'}
                            onChange={this.handleChange("cpf")} value={this.state.displayCPF || ""}
                            InputProps={{
                                classes: { underline: classes.underline },
                                className: this.state.cpf === "" ? classes.input : classes.finalInput
                            }} autoComplete='off'
                            InputLabelProps={this.state.cpf === "" ?
                                { className: classes.input } : { className: classes.finalStyle }}
                            error={!NewUtilities.validateParameters(localeObj.cpf, this.state.cpf) ? true : false}
                            FormHelperTextProps={{ className: classes.helpertextstyle }}
                            helperText={!NewUtilities.validateParameters(localeObj.cpf, this.state.cpf) ?
                                GeneralUtilities.formattedString(localeObj.invalid, [localeObj.cpf]) : ""} />

                        <TextField label={localeObj.email} type={'email'}
                            onChange={this.handleChange("email")} value={this.state.email || ""}
                            InputProps={{
                                classes: { underline: classes.underline },
                                className: this.state.email === "" ? classes.input : classes.finalInput
                            }} autoComplete='off'
                            InputLabelProps={this.state.email === "" ?
                                { className: classes.input } : { className: classes.finalStyle }} />

                        <TextField label={localeObj.phone_number} type={'tel'}
                            onChange={this.handleChange("phone")} value={this.state.mobileNumber || ""}
                            InputProps={{
                                classes: { underline: classes.underline },
                                className: this.state.mobileNumber === "" ? classes.input : classes.finalInput
                            }} autoComplete='off'
                            InputLabelProps={this.state.mobileNumber === "" ?
                                { className: classes.input } : { className: classes.finalStyle }}
                            FormHelperTextProps={{ className: classes.helpertextstyle }}
                            placeholder="(00) 00000 0000"
                            helperText={NewUtilities.validateParameters("ddd", this.state.ddd) ? "" : localeObj.incorrect_ddd}
                            error={NewUtilities.validateParameters("ddd", this.state.ddd) ? false : true}
                        />
                    </MuiThemeProvider>

                    {this.state.fieldOpen &&
                        <div className="body2 highEmphasis" style={{ textAlign: "center", margin: "1rem" }}>
                            {localeObj.waitlist_terms}
                        </div>
                    }

                    <div style={{...fieldOpen, textAlign:"center"}}>
                        {!this.state.fieldOpen &&
                            <div className="body2 highEmphasis" style={{ textAlign: "center", margin: "1rem" }}>
                                {localeObj.waitlist_terms}
                            </div>
                        }
                        <PrimaryButtonComponent btn_text={localeObj.motopay_continue} onCheck={this.sendField} />
                        <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: GeneralUtilities.isScreenSetToMax() ? "0.25rem" : "0.75rem" }} onClick={() => this.checkStatus()}>
                            {localeObj.check_status}
                        </div>
                    </div>
                </div>
                <MuiThemeProvider theme={snackBar}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        )
    }
}
RegisterWaitList.propTypes = {
    classes: PropTypes.object.isRequired,
    recieveField: PropTypes.func.isRequired,
    checkStatus: PropTypes.func.isRequired,
}
export default withStyles(styles)(RegisterWaitList);