import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import "../../../styles/main.css";

import localeService from "../../../Services/localeListService";
import MetricsService from "../../../Services/MetricsService";
import PageState from "../../../Services/PageState";
import InputThemes from "../../../Themes/inputThemes";
import constantObjects from "../../../Services/Constants";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";

import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import GeneralUtilities from "../../../Services/GeneralUtilities";

const theme1 = InputThemes.DetailsTheme;
const styles = InputThemes.multipleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};

class AddNewContact extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: this.props.name ? this.props.name : "",
            keyInfo: {}
        };

        this.confirm = this.confirm.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.componentName = GeneralUtilities.emptyValueCheck(this.props.componentName) ? "ADD NEW CONTACT" : this.props.componentName;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    confirm = () => {
        if (this.state.name.trim() === "") {
            this.openSnackBar(localeObj.enter_field + " " + localeObj.nick_name);
            return;
        } else if (this.state.name.trim().length > 20 || this.state.name.trim().length < 2) {
            this.openSnackBar(localeObj.nameError);
            return;
        } else {
            this.props.setTransactionInfo(this.state.name);
        }
    }

    handleChange = (event) => {
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

    save = () => {
        let jsonObject = {};
        jsonObject["nickName"] = this.state.name;
        this.props.saveContact(jsonObject);
    }

    componentDidMount() {
        this.setButtonState();
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
        document.removeEventListener("visibilitychange", this.visibilityChange);
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

    setButtonState = () => {
        if (this.props.nickName) {
            this.setState({
                name: this.props.nickName
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

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;

        return (
            <div style={{ overflow: "hidden" }}>
                <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight - 480}px` : `${finalHeight - 240}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.adding_contact}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.adding_contact_subtext}
                            </div>
                        </FlexView>
                    </div>
                    <div style={{ marginTop: "3rem", marginBottom: "2rem" }}>
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={localeObj.nick_name}
                                onChange={this.handleChange}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.name === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                value={this.state.name}
                                InputLabelProps={this.state.name === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }}
                            />
                        </MuiThemeProvider>
                    </div>
                    <div style={this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle}>
                        <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.confirm} disabled={this.state.disabled} />
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

AddNewContact.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    nickName: PropTypes.string,
    setTransactionInfo: PropTypes.func.isRequired,
    saveContact: PropTypes.func.isRequired,
    name: PropTypes.string
  };

export default withStyles(styles)(AddNewContact);