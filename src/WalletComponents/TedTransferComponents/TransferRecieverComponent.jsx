import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";

import "../../styles/main.css";
import "../../styles/new_pix_style.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";
import MetricsService from "../../Services/MetricsService";
import PageState from "../../Services/PageState";

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent"
import GeneralUtilities from "../../Services/GeneralUtilities";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import NewUtilities from "../../Services/NewUtilities";
import constantObjects from "../../Services/Constants";

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.DetailsTheme;
const styles = InputThemes.multipleInputStyle;
const screenHeight = window.innerHeight;
const recieverInputMaxLength = 20;

const CustomCheckbox = withStyles({
    root: {
        color: ColorPicker.accent,
        '&$checked': {
            color: ColorPicker.accent,
        },
    },
    checked: {
    },
})((props) => <Checkbox color="default" {...props} />);
var localeObj = {};
class TransferReciever extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            displayCpf: "",
            cpf: "",
            description: "",
            snackBarOpen: false,
            myAccount: this.props.refer === "save_contact" ? false : this.getCheckedProp(),
            checked: false,
        };

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "beneficiary"
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        document.removeEventListener("visibilitychange", this.visibilityChange);
        MetricsService.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        this.setDisplayField();
        androidApiCalls.enablePullToRefresh(false);
        if (this.props.requiredInfo) {
            if(this.props.requiredInfo["CPF"]){
                this.setState({
                    displayCpf: NewUtilities.parseCPFOrCnpj(this.props.requiredInfo["CPF"]).displayCPF,
                    name: this.props.requiredInfo["name"]
                })
            } else if(this.props.requiredInfo["cpf"]) {
                this.setState({
                    displayCpf: NewUtilities.parseCPFOrCnpj(this.props.requiredInfo["cpf"]).displayCPF,
                    name: this.props.requiredInfo["beneficiary"]
                })
            } else {
                this.setState({
                    displayCpf: "",
                    name: ""
                })
            }
        }
        androidApiCalls.enableCopyPaste();
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.checkIfInputIsActive);
        androidApiCalls.disableCopyPaste();
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

    handleCpfChange = (event) => {
        const re = /^[0-9\-./|]+$/;
        if (re.test(event.target.value)) {
            const cpfInfo = NewUtilities.parseCPFOrCnpj(event.target.value)
            this.setState({
                displayCpf: cpfInfo.displayCPF,
                cpf: cpfInfo.displayCPF.replace(/[^0-9]/g, '')
            })
        } else if (event.target.value && event.target.value.length === 0) {
            this.setState({
                displayCpf: "",
                cpf: ""
            })
        } else {
            this.setState({
                displayCpf: event.target.value,
                cpf: event.target.value
            })
        }
    }

    handleNameChange = (event) => {
        if (event.target.value.length !== 0) {
            const re = /^[A-Za-z0-9\u00C0-\u00FF ]+$/;
            if (re.test(event.target.value)) {
                this.setState({
                    name: event.target.value
                });
            }
        } else {
            this.setState({
                name: event.target.value
            });
        }
    }

    getPropValues = (key) => {
        let value = "";
        if (!!this.props.requiredInfo && !!this.props.requiredInfo[key]) {
            value = this.props.requiredInfo[key];
        }
        return value;
    }

    getCheckedProp = () => {
        let value = false;
        if (!!this.props.requiredInfo && !!this.props.requiredInfo["myAccount"]) {
            value = this.props.requiredInfo["myAccount"];
        }
        return value;
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

    sendField = () => {
        if (this.props.refer === "save_contact") {
            if (!this.state.name && this.state.name === "") {
                this.openSnackBar(localeObj.enter_field + " " + localeObj.nick_name);
                return;
            } else if (this.state.name.length > 20 || this.state.name.length < 2) {
                this.openSnackBar(localeObj.nameError);
                return;
            } else {
                let jsonObject = {};
                jsonObject["name"] = this.state.name;
                MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                this.props.setTransactionInfo(jsonObject)
            }
        } else if (!GeneralUtilities.validateCpfOrCnpj(this.state.displayCpf, true)) {
            this.openSnackBar(localeObj.invalid_cnpj_or_cpf);
        } else if (this.state.myAccount 
                &&  this.state.name !== "" ? 
                    this.state?.name?.trim().length > 30 || 
                        this.state?.name?.trim().length < 2 ? true : false 
                    : this.state?.name?.trim().length > 20 || this.state?.name?.trim().length < 2 ? true : false) {
            this.openSnackBar(localeObj.nameError);
        } else if (!this.state.displayCpf || this.state.displayCpf === "") {
            this.openSnackBar(localeObj.pix_cpf_empty);
        } else {
            let jsonObject = {};
            jsonObject["name"] = this.state.name;
            jsonObject["cpf"] = this.state.displayCpf;
            if (this.state.myAccount) {
                jsonObject["myAccount"] = true;
            }
            MetricsService.onPageTransitionStop(this.componentName, PageState.close);
            this.props.setTransactionInfo(jsonObject)
        }
    }

    setDisplayField = () => {
        if (!!this.props.requiredInfo && !!this.props.requiredInfo.beneficiary && !!this.props.requiredInfo.cpf) {
            if (this.props.feature === "ted_transfer" && this.props.requiredInfo.beneficiary === ""
                && this.props.requiredInfo.cpf === "") {
                return;
            } else {
                this.setState({
                    name: this.props.requiredInfo.beneficiary,
                    displayCpf: NewUtilities.parseCPFOrCnpj(this.props.requiredInfo.cpf).displayCPF
                })
            }
        } else if (!!this.props.requiredInfo && !!this.props.requiredInfo.name && !!this.props.requiredInfo.cpf) {
            if (this.props.feature === "add_contacts" && this.props.requiredInfo.name === ""
                && this.props.requiredInfo.cpf === "") {
                return;
            } else {
                this.setState({
                    name: this.props.requiredInfo.name,
                    displayCpf: NewUtilities.parseCPFOrCnpj(this.props.requiredInfo.cpf).displayCPF
                })
            }
        }
    }

    selectMyAccount = () => {
        let selectDeatils = !this.state.myAccount;
        if (selectDeatils) {
            this.setState({
                name: ImportantDetails.userName,
                displayCpf: GeneralUtilities.parseCpf(ImportantDetails.cpf).displayCPF,
                myAccount: !this.state.myAccount
            })
        } else {
            this.setState({
                name: "",
                displayCpf: "",
                myAccount: !this.state.myAccount
            })
        }
    }

    render() {
        let amount = this.props.requiredInfo.amount;
        let decimal = this.props.requiredInfo.decimal;
        const finalHeight = window.screen.height;
        const { classes } = this.props;
        const fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle;
        return (
            <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight - 480}px` : `${finalHeight - 240}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={InputThemes.initialMarginStyle}>
                    <FlexView column>
                        <div className="headline5 highEmphasis">
                            <span>{this.props.refer === "contact" ? localeObj.enter_acc_info : this.props.refer === "save_contact" ? localeObj.contact_saving : GeneralUtilities.formattedString(localeObj.pix_send_to, [amount, decimal])}</span>
                        </div>
                        {this.props.refer !== "contact" && this.props.refer !== "save_contact" &&
                            < div className="body2 highEmphasis" style={{ marginTop: "0.6rem" }}>
                                <span>{localeObj.acc_info}</span>
                            </div>
                        }
                    </FlexView>
                </div >
                <MuiThemeProvider theme={theme1}>
                    <TextField disabled={this.state.myAccount}
                        onChange={this.handleNameChange}
                        InputProps={{
                            classes: { underline: classes.underline },
                            className: classes.finalInput,
                            maxLength: this.state.myAccount === "true" ? 30 : recieverInputMaxLength
                        }}
                        error={this.state.myAccount ? this.state.name && this.state.name.length > 30 ? true : false : this.state.name && this.state.name.length > 20 ? true : false}
                        value={this.state.name} autoComplete='off'
                        helperText={this.state.myAccount ? this.state.name && this.state.name.length > 30 ? localeObj.nameError : '' : this.state.name && this.state.name.length > 20 ? localeObj.nameError : ''}
                        placeholder={this.props.refer === "save_contact" ? localeObj.nick_name : localeObj.pix_name_suggestion}
                    />
                    <div style={{ display: this.props.refer !== "save_contact" ? "block" : "none" }}>
                        <TextField type={'tel'}
                            error={this.props.refer === "save_contact" ? false : GeneralUtilities.validateCpfOrCnpj(this.state.cpf) ? false : true}
                            onChange={this.handleCpfChange} disabled={this.state.myAccount}
                            InputProps={{
                                classes: { underline: classes.underline },
                                className: classes.finalInput
                            }}
                            value={this.state.displayCpf} autoComplete='off'
                            placeholder={localeObj.pix_cpf_suggestion}
                            FormHelperTextProps={{ className: classes.helpertextstyle }}
                            helperText={this.props.refer === "save_contact" ? "" : GeneralUtilities.validateCpfOrCnpj(this.state.cpf) ? "" : localeObj.invalid_cnpj_or_cpf}
                        />
                    </div>
                    <div style={{ display: this.props.refer !== "save_contact" ? "block" : "none", margin: "1.5rem" }}>
                        <FormControlLabel
                            control={<CustomCheckbox id="myAccount" 
                            checked={this.state.myAccount} 
                            onChange={this.selectMyAccount} />}
                            label={<span className="body2 highEmphasis">{localeObj.my_account}</span>}
                        />
                    </div>

                </MuiThemeProvider>

                <div style={{...fieldOpen, textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={this.props.refer === "save_contact" ? localeObj.save_contact : localeObj.next} onCheck={this.sendField} disabled={this.state.myAccount ?  this.state.name && this.state.name.length > 30 ? true : false :  this.state.name && this.state.name.length > 20 ? true : false} />
                </div>

                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        )
    }
}

TransferReciever.propTypes = {
    classes: PropTypes.object.isRequired,
    refer: PropTypes.string,
    componentName: PropTypes.string,
    requiredInfo: PropTypes.object.isRequired,
    setTransactionInfo: PropTypes.func.isRequired,
    feature: PropTypes.string,
};

export default withStyles(styles)(TransferReciever);
