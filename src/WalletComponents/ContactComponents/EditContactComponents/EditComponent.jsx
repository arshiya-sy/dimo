import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import InputThemes from "../../../Themes/inputThemes";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import GeneralUtilities from "../../../Services/GeneralUtilities";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import PageState from "../../../Services/PageState";

import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import SelectOption from "../../CommonUxComponents/SelectOptionFromList";

import constantObjects from "../../../Services/Constants";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ColorPicker from "../../../Services/ColorPicker";

const snackBar = InputThemes.snackBarTheme;
const theme1 = InputThemes.DetailsTheme;
const styles = InputThemes.multipleInputStyle;

const screenHeight = window.innerHeight;
const MINIMUM_NAME_LENGTH = 2;
const MAXIMUM_NAME_LENGTH = 20;
const MINIMUM_AGENCY = 3;
const MAXIMUM_AGENCY = 4;
const MAXIMUM_ACCOUNT = 20;
const MINIMUM_ACCOUNT = 2;
var localeObj = {};

class EditComponent extends React.Component {
    constructor(props) {
        super(props);
        this.componentName = "EditComponent";
        this.state = {
            name: "",
            bankName: "",
            agency: "",
            account: "",
            fieldOpen: false
        }

        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.componentName = GeneralUtilities.emptyValueCheck(this.props.componentName) ? "EDIT CONTACT ACCOUNT" : this.props.componentName;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }


    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);

        let contactInfo = this.props.value;
        if (Object.keys(contactInfo).length !== 0) {
            this.setState({
                "name": contactInfo.name,
                "bankName": contactInfo.bankName,
                "agency": contactInfo.agency,
                "account": contactInfo.account,
                "type": contactInfo.accountType,
                "code": contactInfo.receiverIspb
            })
            if (contactInfo.accountType && contactInfo.accountType.includes("Corrente")) {
                this.setState({ "valueType": "1" })
            } else {
                this.setState({ "valueType": "2" })
            }
        }
        window.onBackPressed = () => {
            this.props.onBack();
        }
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
        window.removeEventListener("resize", this.checkIfInputIsActive);
        document.removeEventListener("visibilitychange", this.visibilityChange);
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
        if (this.state.name.replace(/ /g, "") === "" || this.state.agency === "" || this.state.account === "") {
            this.openSnackBar(localeObj.enter_all_details);
            return;
        }

        if (this.state.name.length > MAXIMUM_NAME_LENGTH || this.state.name.length < MINIMUM_NAME_LENGTH) {
            this.openSnackBar(localeObj.fullname + " " + localeObj.lengthError);
            this.setState({ name: "" });
            return;
        }

        if (this.state.agency.length > MAXIMUM_AGENCY || this.state.agency.length < MINIMUM_AGENCY) {
            this.openSnackBar(localeObj.agency + " " + localeObj.agencyError);
            this.setState({ agency: "" });
            return;
        }

        if (this.state.account.length > MAXIMUM_ACCOUNT || this.state.account.length < MINIMUM_ACCOUNT) {
            this.openSnackBar(localeObj.acc_no + " " + localeObj.accountError);
            this.setState({ account: "" });
            return;
        }

        this.showProgressDialog();
        let jsonObject = {};
        jsonObject["contactId"] = this.props.value.contactId;
        jsonObject["cpf"] = this.props.value.cpf;
        jsonObject["nickName"] = this.props.value.nickName;
        jsonObject["name"] = this.state.name;
        jsonObject["keyId"] = this.props.value.keyId;
        jsonObject["agency"] = this.state.agency;
        jsonObject["receiverIspb"] = this.state.code;
        jsonObject["account"] = this.state.account;
        jsonObject["bankName"] = this.state.bankName;
        jsonObject["accountType"] = this.state.valueType === "1" ? 1 : 2;

        ArbiApiService.editContact(jsonObject, this.componentName).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processDeleteContact(response.result);
                if (processedResponse.success) {
                    this.props.editComplete(jsonObject);
                }
            } else {
                this.setState({
                    message: localeObj.pix_technical_issue,
                    snackBarOpen: true
                })
                this.hideProgressDialog();
                let timeoutId = setInterval(() => {
                    clearInterval(timeoutId);
                    this.props.back();
                }, 1.5 * 1000);
            }
        });
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    handleChange = name => event => {
        if ((name === "name")
            && event.target.value.length !== 0) {
            const re = /^[a-zA-Z\u00C0-\u00FF ]+$/;
            if (re.test(event.target.value)) {
                this.setState({ [name]: event.target.value });
            }
        } else if (name === "bankName") {
            this.props.multipleSelection(true);
            this.setState({
                openList: true
            });
        } else if ((name === "account" || name === "agency") && event.target.value.length !== 0) {
            const re = /^[0-9]+$/;
            if (re.test(event.target.value)) {
                this.setState({ [name]: event.target.value });
            }
        } else {
            this.setState({ [name]: event.target.value });
        }
    };

    confirm = (formInfo) => {
        this.props.multipleSelection(false);
        this.setState({
            openList: false,
            "code": formInfo["code"],
            "bankName": formInfo["receiverInstitute"],
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

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;

        if (!this.props.selection) {
            if (this.state.openList) {
                this.setState({
                    openList: false
                })
            }
        }
        return (
            <div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div style={{ display: this.state.openList ? 'block' : 'none' }}>
                    {this.state.openList && <SelectOption type="Bank" header={localeObj.choose_institute} confirm={this.confirm} />}
                </div>
                <div style={{ display: !this.state.processing && !this.state.openList && !this.state.datePicker ? 'block' : 'none' }}>
                    <div style={{ overflowY: "auto", height: this.state.fieldOpen ? `${finalHeight * 0.42}px` : `${finalHeight * 0.7}px`, overflowX: "hidden" }}>
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.contact_editing}
                                </div>
                                <div className="body2 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.contact_editing_subtitle}
                                </div>
                            </FlexView>
                        </div>
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={localeObj.name}
                                onChange={this.handleChange("name")} value={this.state.name || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.name === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.name === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                            <TextField label={localeObj.Institution}
                                onClick={this.handleChange("bankName")} value={this.state.bankName || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.bankName === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.bankName === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}>
                            </TextField>
                            <TextField label={localeObj.agency} type={"tel"}
                                onChange={this.handleChange("agency")} value={this.state.agency || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.agency === "" ? classes.input : classes.finalInput
                                }}
                                inputProps={{ maxLength: 4 }}
                                InputLabelProps={this.state.agency === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }} />
                            <TextField label={localeObj.acc_no} type={"tel"}
                                onChange={this.handleChange("account")} value={this.state.account || ""}
                                inputProps={{ maxLength: 20 }}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.account === "" ? classes.input : classes.finalInput
                                }}
                                InputLabelProps={this.state.account === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }} />
                        </MuiThemeProvider>
                        <MuiThemeProvider theme={snackBar}>
                            <FormControl style={{ margin: "1.5rem" }}>
                                <div className="body1 highEmphasis" style={{ textAlign: "left", marginBottom: "1rem" }}>
                                    {localeObj.acc_type}
                                </div>
                                <RadioGroup value={this.state.valueType || "1"} onChange={this.handleChange("valueType")}>
                                    <FormControlLabel value="1" control={<Radio sx={{ color: ColorPicker.accent, '&.Mui-checked': { color: ColorPicker.accent } }} />}
                                        label={localeObj.account_checking || ""} className="body2 highEmphasis" />
                                    <FormControlLabel value="2" control={<Radio sx={{ color: ColorPicker.accent, '&.Mui-checked': { color: ColorPicker.accent } }} />}
                                        label={localeObj.account_saving || ""} className="body2 highEmphasis" />
                                </RadioGroup>
                            </FormControl>
                        </MuiThemeProvider>
                    </div>

                    <div style={this.state.fieldOpen ? InputThemes.identifyButtonStyle : InputThemes.bottomButtonStyle}>
                        <PrimaryButtonComponent btn_text={localeObj.finish_editing} onCheck={this.sendField} />
                    </div>
                </div>
                <MuiThemeProvider theme={snackBar}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

EditComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    back: PropTypes.func,
    value: PropTypes.shape({
        contactId: PropTypes.string,
        cpf: PropTypes.string,
        nickName: PropTypes.string,
        name: PropTypes.string,
        keyId: PropTypes.string,
        agency: PropTypes.string,
        receiverIspb: PropTypes.string,
        account: PropTypes.string,
        bankName: PropTypes.string,
        accountType: PropTypes.number
    }),
    onBack: PropTypes.func,
    editComplete: PropTypes.func,
    multipleSelection: PropTypes.func,
    selection: PropTypes.bool
};

export default withStyles(styles)(EditComponent);
