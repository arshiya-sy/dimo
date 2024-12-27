import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import MetricServices from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";

import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from "../../../Services/Constants";

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.SingleInputTheme;
const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};

class CardDetailComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            field: props.value || ""
        }
        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNames.cardArrivalComponent.code;
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.addEventListener("resize", this.checkIfInputIsActive);
        document.addEventListener("visibilitychange", this.visibilityChange);
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
        if (this.state.field.replace(/ /g, "") === "") {
            this.openSnackBar(localeObj.enter_field + " " + localeObj.cvv);
        } else if (this.state.field.length !== 3) {
            this.openSnackBar(localeObj.cvvError);
            return;
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.recieveField(this.state.field);
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

    handleChange(event) {
        if (event.target.value.length !== 0) {
            const re = /^[0-9]+$/;
            if (re.test(event.target.value) && event.target.value.length <= 3) {
                this.setState({
                    field: event.target.value
                })
            }
        } else {
            this.setState({
                field: event.target.value
            });
        }
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        return (
            <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight - 480}px` : `${finalHeight - 240}px`,  overflowY: "auto", overflowX: "hidden" }}>
                <div style={InputThemes.initialMarginStyle}>
                    <FlexView column>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.cvv_description}
                        </div>
                    </FlexView>
                </div>
                <MuiThemeProvider theme={theme1}>
                    <TextField type="tel" label={localeObj.cvv}
                        onChange={this.handleChange} value={this.state.field || ""}
                        InputProps={{
                            classes: { underline: classes.underline },
                            className: this.state.field === "" ? classes.input : classes.finalInput
                        }} autoComplete='off'
                        InputLabelProps={this.state.field === "" ?
                            { className: classes.input } : { className: classes.finalStyle }}
                    />
                </MuiThemeProvider>
                <div   style={this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle}>
                    <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.sendField} />
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

CardDetailComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    value: PropTypes.string,
    componentName: PropTypes.string,
    recieveField: PropTypes.func.isRequired,
  };

export default withStyles(styles)(CardDetailComponent);