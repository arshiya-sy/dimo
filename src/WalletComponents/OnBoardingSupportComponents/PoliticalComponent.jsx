import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import moment from "moment";

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
import CalenderPicker from "../CommonUxComponents/CalenderPicker";

const theme1 = InputThemes.DetailsTheme;
const snackBar = InputThemes.snackBarTheme;
const styles = InputThemes.multipleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};

class PoliticalComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: props.politicalNextDisabled? props.politicalNextDisabled : true,
            position: props.value.position || "",
            startDate: props.value.startDate || "",
            endDate: props.value.endDate || "",
            snackBarOpen: false,
            startDatePicker: false,
            endDatePicker: false
        }
        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.maxDate = new Date(moment().subtract(1, 'days'));
        this.dob = new Date(moment().subtract(100, 'years'));
        this.componentName = this.props.componentName;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        androidApiCalls.enableCopyPaste();
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        if (this.props.value.startDate) {
            let d = new Date(this.props.value.startDate);
            let num = Number(d.getFullYear()) + 10;
            d.setFullYear(Number(num));
            let day = new Date(this.props.value.startDate);
            let nextDay = new Date(day);
            nextDay.setDate(day.getDate() + 1);
            this.setState({
                finalStartDate: new Date(this.props.value.startDate),
                minFinalDate: nextDay,
                maxFinalDate: d
            })
        }
        if (this.props.value.endDate) {
            this.setState({
                finalEndDate: new Date(this.props.value.endDate)
            })
        }

        if (this.props.value.disabled !== "" && this.props.value.disabled !== undefined) {
            this.setState({ disabled: this.props.value.disabled });
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

    componentDidUpdate(prevProps, prevState) {
        // Only update disabled state if the relevant fields have changed
        if (
            prevState.position !== this.state.position ||
            prevState.startDate !== this.state.startDate ||
            prevState.endDate !== this.state.endDate
        ) {
            this.updateDisabledState();
        }
    }

    updateDisabledState() {
        const { position, startDate, endDate } = this.state;
        const isDisabled = position.replace(/ /g, "") === "" || startDate === "" || endDate === "";
        this.setState({ disabled: isDisabled });
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
        if ((this.state.position.replace(/ /g, "") === "") || (this.state.startDate === "")
            || (this.state.endDate === "")) {
            this.openSnackBar(localeObj.enter_all_details);
            return;
        }
        let startDate, endDate;
        if (moment(this.state.startDate, "DD/MM/YYYY", true).isValid()) {
            startDate = moment(this.state.startDate, "DD/MM/YYYY").toDate();
        } else if (moment(this.state.startDate, moment.ISO_8601, true).isValid()) {
            startDate = new Date(this.state.startDate);
        } else {
            startDate = null;
        }

        if (moment(this.state.endDate, "DD/MM/YYYY", true).isValid()) {
            endDate = moment(this.state.endDate, "DD/MM/YYYY").toDate();
        } else if (moment(this.state.endDate, moment.ISO_8601, true).isValid()) {
            endDate = new Date(this.state.endDate);
        } else {
            endDate = null;
        }

        // let startDate = moment(this.state.startDate, "DD/MM/YYYY");
        // startDate = new Date(startDate.format("YYYY-MM-DD"));

        // let endDate = moment(this.state.endDate, "DD/MM/YYYY");
        // endDate = new Date(endDate.format("YYYY-MM-DD"))

        if (startDate === null && isNaN(startDate)) {
            this.openSnackBar(localeObj.start_date_validation_error);
            return;
        }
        if (endDate === null && isNaN(endDate)) {
            this.openSnackBar(localeObj.end_date_validation_error);
            return;
        }

        if (startDate.getTime() > endDate.getTime() || startDate.getTime() === endDate.getTime()) {
            this.openSnackBar(localeObj.endError);
            return;
        }
        else if (this.dob.getTime() > startDate.getTime()) {
            this.openSnackBar(localeObj.startError);
            return;
        } else if (this.state.position.length > 50 || this.state.position.length < 2) {
            this.openSnackBar(localeObj.position + " " + localeObj.lengthError);
            return;
        }

        let politicalOptions = {};
        politicalOptions["position"] = this.state.position;
        politicalOptions["startDate"] = new Date(this.state.finalStartDate).toISOString().split('T')[0];
        politicalOptions["endDate"] = new Date(this.state.finalEndDate).toISOString().split('T')[0];
        politicalOptions["disabled"] = this.state.disabled;

        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.recieveField(politicalOptions);
    }

    handleChange = name => event => {
        if (name === "position" && event.target.value.length !== 0) {
            const re = /^[A-Za-z\u00C0-\u00FF ]+$/;
            if (re.test(event.target.value)) {
                this.setState({ [name]: event.target.value });
            }
        } else {
            this.setState({ [name]: event.target.value });
        }
    };

    handleClick = name => () =>{
        this.props.multipleSelection(true);
        if (name === "startDate") {
            this.setState({
                startDatePicker: true,
            });
        } else {
            if (this.state.finalStartDate) {
                this.setState({
                    endDatePicker: true,
                });
            } else {
                this.openSnackBar(localeObj.select_start_date);
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

    confirmDate = (field) => {
        this.props.multipleSelection(false);
        let d = new Date(field);
        d.setFullYear(d.getFullYear() + 10);
        let day = new Date(field);
        let nextDay = new Date(field);
        nextDay.setDate(day.getDate() + 1);
        this.setState({
            startDate: moment(field).format('DD/MM/YYYY'),
            maxFinalDate: d,
            minFinalDate: nextDay,
            finalStartDate: field,
            startDatePicker: false
        })
    }

    confirmEndDate = (field) => {
        this.props.multipleSelection(false);
        this.setState({
            endDate: moment(field).format('DD/MM/YYYY'),
            finalEndDate: field,
            endDatePicker: false
        })
    }

    render() {
        console.log("disabled1 " + this.state.disabled)
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        if (!this.props.multiSelection) {
            if (this.state.startDatePicker) {
                this.setState({
                    startDatePicker: false
                })
            } else if (this.state.endDatePicker) {
                this.setState({
                    endDatePicker: false
                })
            }
        }
        return (
            <div>
                <div style={{ display: this.state.startDatePicker ? 'block' : 'none' }}>
                    {this.state.startDatePicker && <CalenderPicker value={this.state.startDate === "" ? this.maxDate : this.state.finalStartDate} minDate={this.dob} maxDate={this.maxDate} confirm={this.confirmDate} disableToday={true}/>}
                </div>
                <div style={{ display: this.state.endDatePicker ? 'block' : 'none' }}>
                    {this.state.endDatePicker && <CalenderPicker value={this.state.endDate === "" ? this.state.finalStartDate : this.state.finalEndDate} minDate={this.state.minFinalDate} maxDate={this.state.maxFinalDate} confirm={this.confirmEndDate} />}
                </div>
                <div style={{ display: !this.state.endDatePicker && !this.state.startDatePicker ? 'block' : 'none' }}>
                    <div style={{ overflowY: "auto", height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`, overflowX: "hidden" }}>
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {localeObj.political_info_header}
                                </div>
                            </FlexView>
                        </div>
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={localeObj.position}
                                onChange={this.handleChange("position")} value={this.state.position || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.position === "" ? classes.input : classes.finalInput
                                }} autoComplete='off'
                                InputLabelProps={this.state.position === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                        </MuiThemeProvider>
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={localeObj.startDate} autoComplete='off'
                                onClick={this.handleClick("startDate")}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.startDate === "" ? classes.input : classes.finalInput
                                }}
                                InputLabelProps={this.state.startDate === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                value={this.state.startDate === "undefined" || this.state.startDate === "" ? "" : moment(this.state.startDate, 'DD/MM/YYYY', true).isValid() ?
                                    this.state.startDate : moment(this.state.startDate, "YYYY-MM-DD").format("DD/MM/YYYY")} />
                        </MuiThemeProvider>
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={localeObj.endDate}
                                autoComplete='off' onClick={this.handleClick("endDate")}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.endDate === "" ? classes.input : classes.finalInput
                                }}
                                InputLabelProps={this.state.endDate === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                value={this.state.endDate === "undefined" || this.state.endDate === "" ? "" : moment(this.state.endDate, 'DD/MM/YYYY', true).isValid() ?
                                    this.state.endDate : moment(this.state.endDate, "YYYY-MM-DD").format("DD/MM/YYYY")} />
                        </MuiThemeProvider>

                        <div style={this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle}>
                            <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.sendField} disabled={this.state.disabled}/>
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

PoliticalComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    value: PropTypes.shape({
        position: PropTypes.string,
        startDate: PropTypes.string,
        endDate: PropTypes.string
    }),
    componentName: PropTypes.string,
    dob: PropTypes.string,
    recieveField: PropTypes.func,
    multipleSelection: PropTypes.func,
    multiSelection: PropTypes.bool
};

export default withStyles(styles)(PoliticalComponent);
