import React from 'react';
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import ListItem from "@material-ui/core/ListItem";
import TextField from '@material-ui/core/TextField';
import ListItemText from "@material-ui/core/ListItemText";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import "../../styles/main.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";
import InputThemes from "../../Themes/inputThemes";

import Log from "../../Services/Log";
import PageNames from '../../Services/PageNames';
import PageState from '../../Services/PageState';
import utilities from "../../Services/NewUtilities";
import ColorPicker from '../../Services/ColorPicker';
import constantObjects from '../../Services/Constants';
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";

import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from '../CommonUxComponents/SecondaryButtonComponent';

const theme1 = InputThemes.SingleInputTheme;
const theme2 = InputThemes.snackBarTheme
const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};

class CellularPhoneNumberInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contactsName: [],
            contactsNumber: [],
            completePhoneNumberEditList: [],
            displayNumber: "",
            phoneNumber: "",
            ddd: "",
            showRecents: false,
            snackBarOpen: false
        }

        this.style={
            iconStyle :{
                color: ColorPicker.accent,
                fontSize: "1rem"
            }, 
            showContactListStyle: {
                width: "100%",
                position: "fixed",
                marginTop: "2rem"
            },
        }

        if(this.props.componentName){
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNames.cellularRechargeComponent.inputNumber
        }

        MetricServices.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        androidApiCalls.enableCopyPaste();
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        window.onBackPressed = () => {
            this.props.onBack();
        }

        Log.debug(this.props.details)
        if (this.props.details.phoneNumber) {
            this.setState({ phoneNumber: this.props.details.phoneNumber })
        }
        if (this.props.details.ddd) {
            this.setState({ ddd: this.props.details.ddd })
        }
        if (this.props.details.displayNumber) {
            this.setState({ displayNumber: this.props.details.displayNumber })
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
        document.removeEventListener("visibilitychange", this.visibilityChange);
        window.removeEventListener("resize", this.checkIfInputIsActive);
        androidApiCalls.disableCopyPaste();
    }

    checkIfInputIsActive= () => {
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

    onNext = () => {
        if (this.state.displayNumber === "") {
            this.openSnackBar(localeObj.enter_valid_phoneNumber);
            return;
        } else if (!utilities.validateParameters("ddd", this.state.ddd)) {
            this.openSnackBar(localeObj.enter_valid_phoneNumber);
            return;
        } else if (this.state.phoneNumber.length !== 9 || parseInt(this.state.phoneNumber[0]) !== 9) {
            this.openSnackBar(localeObj.enter_valid_phoneNumber);
            return;
        }
        //Log.sDebug("recharging dd number " + this.state.ddd, "CellularPhoneNumberInput");
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.onInputNumber({
            ddd: this.state.ddd,
            phoneNumber: this.state.phoneNumber,
            displayNumber: this.state.displayNumber,
        });
    };

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    resetField = () => {
        this.setState({
            displayNumber: ""
        })
    }

    selectContact = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.getContacts();
    }

    handleChange = event => {
        if (event.target.value.length !== 0) {
            let phoneNumObj = {};
            const re = /^[0-9/(/)/ /-]+$/;
            if (re.test(event.target.value)) {
                phoneNumObj = utilities.parsePhoneNum(event.target.value);
                if (phoneNumObj.phoneNumber.length !== 0) {
                    this.setState({
                        ddd: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(0, 2),
                        phoneNumber: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(2, 11),
                        displayNumber: phoneNumObj.phoneNumber
                    });
                    return;
                } else {
                    this.resetField();
                }
            }
        } else {
            this.resetField();
        }
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const fieldOpen = this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle
        return (
            <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`,  overflowY: "auto",  overflowX: "hidden" }}>
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis">
                                {localeObj.enter_number}
                            </div>
                        </FlexView>
                    </div>
                    <div>
                        <MuiThemeProvider theme={theme1}>
                            <TextField
                                label={localeObj.phone_number}
                                type={"tel"}
                                placeholder="(00) 00000 0000"
                                value={this.state.displayNumber || ""}
                                onChange={this.handleChange}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.displayNumber === "" ? classes.input : classes.finalInput
                                }}  autoComplete='off'
                                InputLabelProps={this.state.displayNumber === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }}
                                helperText={utilities.validateParameters("ddd", this.state.ddd) ? "" : localeObj.incorrect_ddd}
                                error={utilities.validateParameters("ddd", this.state.ddd) ? false : true} />
                        </MuiThemeProvider>
                        <div className="body2 highEmphasis" style={this.style.showContactListStyle}>
                            <FlexView column>
                                {this.state.showRecents &&
                                    this.state.contactsName.map((opt, index) => (
                                        <ListItem key={index} button onClick={() => this.handleClick(opt, index)}>
                                            <ListItemText className="body2 highEmphasis" primary={opt} secondary={this.state.carrrier + " " + this.state.contactsNumber[this.state.contactsName.findIndex(item => item === opt)]} />
                                            <span style={{ marginRight: "2%" }}>
                                                <ArrowForwardIosIcon style={this.style.iconStyle} />
                                            </span>
                                        </ListItem>
                                    ))
                                }
                            </FlexView>
                        </div>
                    </div>
                    <div style={{...fieldOpen, textAlign:"center"}}>
                        <PrimaryButtonComponent className="Body1" btn_text={localeObj.next} onCheck={this.onNext} />
                        {this.props.shouldShowContacts &&
                            <SecondaryButtonComponent className="Body1" btn_text={localeObj.recharge_select_contact} onCheck={this.selectContact}/>
                        }
                    </div>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        );
    }
}
CellularPhoneNumberInput.propTypes = {
    classes: PropTypes.object.isRequired,
    shouldShowContacts: PropTypes.bool.isRequired,
    getContacts: PropTypes.func.isRequired,
    componentName: PropTypes.string,
    onBack: PropTypes.func.isRequired,
    details: PropTypes.object.isRequired,
    onInputNumber: PropTypes.func.isRequired

};

export default withStyles(styles)(CellularPhoneNumberInput);