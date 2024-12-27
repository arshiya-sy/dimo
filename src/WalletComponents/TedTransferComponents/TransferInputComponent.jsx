import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import GeneralUtilities from '../../Services/GeneralUtilities';
import MetricsService from "../../Services/MetricsService";
import PageState from "../../Services/PageState";

import TextField from "@material-ui/core/TextField";
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from "../../Services/Constants";

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.TransferTheme;
const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};

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

class TransferInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            field: props.value || "",
            snackBarOpen: false,
            maxLength: 100,
            checked: false
        }
        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "ageny_info"
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        if (this.props.field === localeObj.agency) {
            let maxLength = this.props.from === GeneralUtilities.TRANSACTION_TYPES.PIX ? 4 : 5;
            this.setState({
                maxLength: maxLength
            })
            // if (!!this.props.requiredInfo && !!this.props.requiredInfo["noAgency"]) {
            //     this.setState({
            //         checked: this.props.requiredInfo["noAgency"],
            //         field: localeObj.no_agency
            //     })
            // }
        }
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        androidApiCalls.enableCopyPaste();
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
        document.removeEventListener("visibilitychange", this.visibilityChange);
        window.removeEventListener("resize", this.checkIfInputIsActive);
        androidApiCalls.disableCopyPaste();
    }

    sendField = () => {
        if (this.state.field === "") {
            this.openSnackBar(GeneralUtilities.formattedString(localeObj.please_enter_the, [this.props.field]));
        } else {
            if (this.props.field === localeObj.agency) {
                let jsonObject = {};
                // if (this.state.checked) {
                //     jsonObject["agency"] = "0";
                // } else {
                jsonObject["agency"] = this.state.field;
                //}
                jsonObject["noAgency"] = this.state.checked;
                MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                this.props.recieveField(jsonObject);
            } else {
                MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                this.props.recieveField(this.state.field);
            }
        }
    }

    resetField = () => {
        this.setState({
            field: ""
        })
    }

    onChangeChecked = () => {
        if (this.state.checked) {
            this.setState({
                checked: !this.state.checked,
                field: ""
            })
        } else {
            this.setState({
                checked: !this.state.checked,
                field: localeObj.no_agency
            })
        }
    }

    handleChange(event) {
        if (this.props.field === localeObj.acc_no && event.target.value.length !== 0) {
            const re = /^[0-9]+$/;
            if (re.test(event.target.value)) {
                let value = event.target.value;
                this.setState({
                    field: value
                })
            }
        } else if (this.props.field === localeObj.agency && event.target.value.length !== 0) {
            const re = /^[0-9]+$/;
            if (re.test(event.target.value)) {
                let value = event.target.value;
                this.setState({
                    field: value
                })
            }
        } else {
            this.setState({
                field: event.target.value
            });
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
        let amount = this.props.requiredInfo.amount;
        let decimal = this.props.requiredInfo.decimal;
        let fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle;
        return (
            <div style={{ overflow: "hidden" }}>
                <div className="scroll" style={{ height: `${finalHeight - 290}px`, overflowY: "auto" }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis">
                                <span>{this.props.from === GeneralUtilities.TRANSACTION_TYPES.CONTACT ? localeObj.enter_acc_info :
                                    GeneralUtilities.formattedString(localeObj.pix_send_to, [amount, decimal])}</span>
                            </div>
                            {this.props.from !== GeneralUtilities.TRANSACTION_TYPES.CONTACT &&
                                <div className="body2 highEmphasis" style={{ marginTop: "0.6rem" }}>
                                    <span>{localeObj.acc_info}</span>
                                </div>
                            }
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={theme1}>
                        <div style={{ display: 'inline-block' }}>
                            <TextField label={this.props.field} type={"tel"}
                                onChange={this.handleChange} value={this.state.field || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.field === "" ? classes.input : classes.finalInput
                                }} disabled={this.state.checked}
                                inputProps={{ maxLength: this.state.maxLength }}
                                InputLabelProps={this.state.field === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }} />
                        </div>

                        {/* {this.props.field === localeObj.agency && this.props.refer !== "contact" &&
                            <div align="center" style={{ margin: "1.5rem", position: "fixed", top: "18rem" }}>
                                <FormControlLabel
                                    control={<CustomCheckbox id="agency" checked={this.state.checked} onChange={this.onChangeChecked} />}
                                    label={<span>{localeObj.no_agency}</span>}
                                />
                            </div>
                        } */}
                    </MuiThemeProvider>
                </div>
                <div style={{...fieldOpen, textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.sendField} />
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

TransferInput.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    value: PropTypes.string,
    componentName: PropTypes.string,
    field: PropTypes.string,
    from: PropTypes.object.isRequired,
    requiredInfo: PropTypes.object.isRequired,
    recieveField: PropTypes.func.isRequired,
    refer: PropTypes.string,
};

export default withStyles(styles)(TransferInput);
