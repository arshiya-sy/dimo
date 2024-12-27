import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import "../../styles/main.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css"

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import utilities from "../../Services/NewUtilities";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";

import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import PhotoCamera from '@material-ui/icons/PhotoCamera';

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import androidApiCallsService from "../../Services/androidApiCallsService";
import ActionButtonComponent from "../CommonUxComponents/ActionButton";
import constantObjects from "../../Services/Constants";

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.AmountTheme;
const styles = InputThemes.payStyle;
const screenHeight = window.innerHeight;
var localeObj = {};

class InsertBoleto extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            code: "",
            displayValue: "",
            snackBarOpen: false,
            scanDisabled: false,
            count: 0
        };
        this.confirm = this.confirm.bind(this);
        this.handleChange = this.handleChange.bind(this);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNames.insertBoleto);
    }

    confirm = () => {
        if (this.state.code === "") {
            this.openSnackBar(localeObj.enter_details);
            return;
        }
        let code = this.state.code.replace(/[^0-9]/g, '');
        if (code.length < 43 || code.length > 48) {
            this.openSnackBar(localeObj.incorrect_boleto);
            //Log.sDebug("Incorrect Boleto entered with " + code.length + " " + code);
            return;
        }
        let payLoad = {
            "manual": true,
            "qrCodeValue": this.state.code
        }
        MetricServices.onPageTransitionStop(PageNames.insertBoleto, PageState.close);
        this.props.history.replace({
            pathname: '/boleto',
            state: payLoad
        });
    }

    back = () => {
        MetricServices.onPageTransitionStop(PageNames.insertBoleto, PageState.back);

        const { fromComponent = null, state = {} } = this.props.location;

        if (fromComponent === PageNames.GamificationComponent.program_details) {
            return this.props.history.replace({ pathname: "/rewardsDetail", transition: "right", state });
        }

        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    resetDisabledState = async () => {
        setTimeout(
            function () {
                this.setState({ scanDisabled: false });
            }.bind(this),
            1000);
    }

    scanCode = () => {
        this.setState({ scanDisabled: true })
        MetricServices.onPageTransitionStop(PageNames.insertBoleto, PageState.close);
        this.props.history.replace({
            pathname: '/newWalletLaunch',
            transition: "right",
            scanBoleto: true
        });
        this.resetDisabledState();
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

    handleChange = (event) => {
        const re = /^[0-9]+$/;

        if (re.test(event.target.value.replace(/[^0-9]/g, ''))) {
            let codeObj = {}
            codeObj = utilities.parseCode(event.target.value);
            const count = Math.min(48, Math.max(0, codeObj.displayCode.replace(/[^0-9]/g, '').length));
            this.setState({
                displayValue: codeObj.displayCode.replace(/-/g, '\n').replace(',', ' '),
                code: codeObj.displayCode.replace(/[^0-9]/g, ''),
                count
            });
        } else if (event.target.value.length === 0) {
            this.setState({
                displayValue: "",
                code: "",
                count: 0
            })
        }
    }

    componentDidMount() {
        if (this.props?.location?.state && this.props?.location?.state?.qrCodeValue) {
            let codeObj = {}
            codeObj = utilities.parseCode(this.props.location.state.qrCodeValue);
            this.setState({
                displayValue: codeObj.displayCode.replace(/-/g, '\n').replace(',', ' '),
                code: codeObj.displayCode.replace(/[^0-9]/g, '')
            })
        }
        window.onBackPressed = () => {
            this.back();
        }
        androidApiCallsService.enableCopyPaste();
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.insertBoleto, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.insertBoleto);
        }
    }

    componentWillUnmount() {
        androidApiCallsService.disableCopyPaste();
        window.removeEventListener("resize", this.checkIfInputIsActive);
        document.removeEventListener("visibilitychange", this.visibilityChange);
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
        const fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle;
        return (
            <div>
                <ButtonAppBar header={localeObj.pay} onBack={this.back} action="none" />
                <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight - 480}px` : `${finalHeight - 240}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left", userSelect: "none" }}>
                                {localeObj.enter_boleto_details}
                            </div>
                        </FlexView>
                    </div>
                    <div style={{ marginTop: "3.5rem" }}>
                        <MuiThemeProvider theme={theme1}>
                            <TextField
                                label={
                                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                                        <div>{localeObj.digitable_line}</div>
                                        <div style={{paddingLeft: "200px"}}>({this.state.count}/48)</div>
                                    </div>
                                } 
                                type={'tel'} 
                                onChange={this.handleChange} multiline rows={4} 
                                inputProps={{ inputMode: 'numeric' }}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.displayValue === "" ? classes.input : classes.finalInput,
                                }} autoComplete='off'
                                value={this.state.displayValue}
                                InputLabelProps={this.state.displayValue === ""?
                                { className: classes.input } : { className: classes.finalStyle }}
                            />
                        </MuiThemeProvider>
                        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center" }}>
                            <ActionButtonComponent
                                btn_text={localeObj.scan_code}
                                onCheck={this.scanCode}
                                icon={<PhotoCamera style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />}
                                disabled={this.state.scanDisabled} />
                        </div>
                    </div>
                    <div style={{...fieldOpen, textAlign: "center"}}>
                        <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.confirm} />
                    </div>
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

InsertBoleto.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object,
    history: PropTypes.object,

};

export default withStyles(styles)(InsertBoleto);