import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import InputThemes from "../../../Themes/inputThemes";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";

import PageState from "../../../Services/PageState";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from "../../../Services/Constants";

const styles = InputThemes.singleInputStyle;
const theme2 = InputThemes.snackBarTheme;
const screenHeight = window.innerHeight;
var localeObj = {};

class DueDateComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: props.value || "",
            backSlash: false
        }
        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "DUE DATE";
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
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
        window.removeEventListener("resize", this.checkIfInputIsActive);
    }

    sendField = () => {
        let jsonObj = {};
        if (this.state.date.replace(/ /g, "") === "") {
            this.openSnackBar(localeObj.enter_field + " " + localeObj.due_date);
        } else {
            let dateParts = this.state.date.split("/");
            if (dateParts[1] * 1 <= 20) {
                this.openSnackBar(localeObj.invalid_due_date);
            } else {
                jsonObj["date"] = `${dateParts[0]}/20${dateParts[1]}`;
                jsonObj["displayDate"] = this.state.date;
                MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                this.props.confirm(jsonObj);
            }
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

    resetField = () => {
        this.setState({
            date: ""
        })
    }

    handleChange(event) {
        if (event.target.value.length !== 0) {
            const re = /^[0-9/]+$/;
            if (re.test(event.target.value) && event.target.value.length < 6) {
                if (event.target.value.length === 1 && (event.target.value !== "0" && event.target.value !== "1")) {
                    this.setState({
                        date: "0" + event.target.value + '/',
                        backSlash: true
                    })
                } else if (event.target.value.length === 2) {
                    if (!this.state.backSlash) {
                        let digit = event.target.value.split("")[1];
                        let firstDigit = event.target.value.split("")[0];
                        if (firstDigit === "1") {
                            if (digit === "0" || digit === "1" || digit === "2") {
                                this.setState({
                                    date: event.target.value + '/',
                                    backSlash: true
                                })
                            }
                        } else {
                            if (digit !== "0") {
                                this.setState({
                                    date: event.target.value + '/',
                                    backSlash: true
                                })
                            }
                        }
                    } else {
                        this.setState({
                            date: event.target.value,
                            backSlash: false
                        })
                    }
                } else {
                    this.setState({
                        date: event.target.value
                    })
                }
            }
        } else {
            this.resetField();
        }
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

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        return (
            <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight - 480}px` : `${finalHeight - 240}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={InputThemes.initialMarginStyle}>
                    <FlexView column>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.due_date_subText}
                        </div>
                    </FlexView>
                </div>
                <MuiThemeProvider theme={InputThemes.SingleInputTheme}>
                    <TextField label={localeObj.due_date} type={'tel'}
                        placeholder="00/00"
                        onChange={this.handleChange} value={this.state.date}
                        InputProps={{
                            classes: { underline: classes.underline },
                            className: this.state.field === "" ? classes.input : classes.finalInput
                        }} autoComplete='off'
                        InputLabelProps={this.state.field === "" ?
                        { className: classes.input } : { className: classes.finalStyle }}
                        maxLength={5}
                    />
                </MuiThemeProvider>
                <div  style={this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle}>
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

DueDateComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    confirm: PropTypes.func.isRequired,
    componentName: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
}

export default withStyles(styles)(DueDateComponent);