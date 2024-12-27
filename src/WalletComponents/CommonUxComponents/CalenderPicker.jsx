import "date-fns";
import React from "react";
import moment from "moment";
import PropTypes from "prop-types";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider, Calendar } from "@material-ui/pickers";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import DownIcon from "@material-ui/icons/KeyboardArrowDown";

import constantObjects from "../../Services/Constants";
import { enUS, ptBR } from "date-fns/locale";
import GeneralUtilities from "../../Services/GeneralUtilities";
import BottomSheetYear from "./BottomSheetYear";
import MetricsService from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import ButtonAppBar from "./ButtonAppBarComponent";

const materialTheme = InputThemes.CalenderTheme;
const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

const CustomCheckbox = withStyles({
    root: {
        color: ColorPicker.accent,
        '&$checked': {
            color: ColorPicker.darkHighEmphasis,
        },
    },
    checked: {
    },
})((props) => <Checkbox color="default" {...props} />);

const isCurrentDay = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
};


export default class CalenderPicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: new Date(),
            snackBarOpen: false,
            checked: false,
            bottomSheet: false,
            yearList: [],
        }
        this.style = {
            highlightCurrentDay: {
                backgroundColor: ColorPicker.disableBlack,
                color: 'white',
            },
            dateUnderline: {
                textDecoration: 'underline'
            },
            disableColor: {
                color: 'rgba(255, 255, 255, 0.38)'
            },
            daySelected: {
                color: ColorPicker.darkHighEmphasis,
                fontWeight: 400,
                background: "linear-gradient(135deg, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                "&:hover": {
                    background: "linear-gradient(135deg, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                }
        }
    }
        this.sendField = this.sendField.bind(this);
        MetricsService.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        if (!GeneralUtilities.emptyValueCheck(this.props.value)) {
            this.setState({
                date: new Date(this.props.value)
            })
        }
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        let yearList = [];
        let yearStart = this.props?.maxDate ? new Date(this.props.maxDate).getFullYear() : new Date().getFullYear();
        let yearEnd = this.props?.minDate ? new Date(this.props.minDate).getFullYear() : new Date().getFullYear();
        for (let i = Number(yearStart); i >= Number(yearEnd); i--) {
            yearList.push(i);
        }
        this.setState({
            yearList: yearList
        })

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "CALENDER PAGE"
        }
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

    sendField = () => {
        if (this.state.date === "") {
            this.openSnackBar(localeObj.enter_field);
        } else {
            if (this.props.regular) {
                let json = {};
                json["monthly"] = this.state.checked;
                json["date"] = this.state.date;
                MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                this.props.confirm(json);
            } else if (!this.props.regular && (this.props.isSchedule || this.props.isPeriodSelection === true)) {
                let json = {};
                json["monthly"] = false;
                json["date"] = this.state.date;
                if (moment(this.state.date).startOf('day').isBefore(moment(this.props.minDate).startOf('day')) || moment(this.state.date).endOf('day').isAfter(moment(this.props.maxDate).endOf('day'))) {
                    this.openSnackBar(localeObj.schedule_date_error);
                    return;
                } else {
                    MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                    if (this.props.isPeriodSelection === true) {
                        this.props.confirm(this.state.date);
                    } else {
                        this.props.confirm(json);
                    }
                }
            } else {
                MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                this.props.confirm(this.state.date);
            }
        }
    }

    cancelField = () => {
        this.props.cancel();
    }

    onChange = (value) => {
        this.setState({ date: value });
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

    disableWeekends = (date) => {
        return (this.props.shouldDisableWeekend && (date.getDay() === 0 || date.getDay() === 6));
    }

    onChangeChecked = () => {
        this.setState({
            checked: !this.state.checked
        })
    }

    pickYear = () => {
        if (this.state.yearList.length > 1) {
            this.setState({
                bottomSheet: true
            })
        }
    }

    changeYear = (date) => {
        let newYear = new Date(date).getFullYear();
        if (newYear !== new Date(this.state.date).getFullYear()) {
            this.setYear(newYear, "USER_SCROLL")
        }
    }

    setYear = (field, type) => {
        if (GeneralUtilities.emptyValueCheck(type)) {
            let d = new Date(this.state.date);
            if (this.state.date !== "") {
                d.setFullYear(Number(field));
                if (this.props.monthsAhead) {
                    d.setMonth(d.getMonth() - Number(this.props.monthsAhead));
                }
            }
            this.setState({
                date: d,
                bottomSheet: false
            })
        } else if (type === "USER_SCROLL") {
            let d = new Date(moment().startOf('year').toDate());
            d.setFullYear(Number(field));
            if (this.props.monthsAhead) {
                d.setMonth(d.getMonth() - Number(this.props.monthsAhead));
            }
            if (this.props.minDate && d < this.props.minDate) {
                d = new Date(this.props.minDate);
            }
            if (this.props.maxDate && d > this.props.maxDate) {
                d = new Date(this.props.maxDate);
            }
            this.setState({
                date: d,
                bottomSheet: false
            })
        }
    }
    setMinDate = () => {
        if (this.props.minDate !== null) {
            this.setState({ date: new Date(this.props?.minDate) })
        }
    }

    setMaxDate = () => {
        if (this.props?.maxDate !== null) {
            let maxDate = new Date(this.props?.maxDate);
            const day = maxDate.getDay();
            if (day === 0) {
                maxDate.setDate(maxDate.getDate() - 2); // Move to Friday
            } else if (day === 6) {
                maxDate.setDate(maxDate.getDate() - 1); // Move to Friday
            }
            this.setState({ date: maxDate });
        }
    }

    render() {
        const shouldUnderlineDate = (date, selectedDate) => {
            const minDate = new Date(this.props.minDate);
            minDate.setHours(0, 0, 0, 0);
            const maxDate = new Date(this.props.maxDate);
            maxDate.setHours(0, 0, 0, 0);
            const currentDate = new Date();
            return date.toDateString() !== selectedDate?.toDateString() && (date.toDateString() === currentDate.toDateString() ||  (date >= minDate && date <= maxDate));
        }

        return (
            <div>
                { this.props.fromBoleto && <ButtonAppBar header={localeObj.date} onBack={this.props.onBack} action="none"/> }
                <div style={{ display: this.state.bottomSheet ? "none" : "block" }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {this.props.header ? this.props.header : localeObj.deposit_date_header}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                {this.props.subtxt}
                            </div>
                        </FlexView>
                    </div>
                    <div style={{ margin: "0 1.5rem" }}>
                        <div className="subtitle4 highEmphasis" onClick={this.pickYear}
                            style={{ textAlign: "left", margin: "1.5rem 0.6rem", marginTop: "0", display: "inline-flex" }}>
                            <span>{new Date(this.state.date).getFullYear()}</span>
                            <DownIcon style={{ fill: ColorPicker.darkHighEmphasis, marginTop: "-0.25rem", fontSize: "1.5rem" }} />
                        </div>
                        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={GeneralUtilities.getLocale() === 'en_US' ? enUS : ptBR}>
                            <ThemeProvider theme={materialTheme}>
                                <Calendar label={localeObj.due_date}
                                    variant="static"
                                    format="dd/MM/yyyy"
                                    date={this.state.date}
                                    minDate={this.props?.minDate}
                                    maxDate={this.props?.maxDate}
                                    onChange={this.onChange}
                                    onMonthChange={this.changeYear}
                                    shouldDisableDate={this.disableWeekends}
                                    renderDay={(date, selectedDate, dayInCurrentMonth, dayComponent) => {
                                        let disabledClass = '';
                                        const isToday = isCurrentDay(date);
                                        const dayClass = isToday ? this.style.highlightCurrentDay : null;
                                        const underlineStyle = shouldUnderlineDate(date, selectedDate) ? this.style.dateUnderline : null;
                                        if (this.props.disableToday) {
                                            const isDisabled = date > this.props?.maxDate;
                                            disabledClass = isDisabled ? this.style.disableColor : '';
                                        }
                                        let minDate = this.state.date < this.props?.minDate;
                                        let maxDate = this.state.date > this.props?.maxDate;
                                        if (minDate) {
                                            this.setMinDate()
                                        } else if (maxDate) {
                                            this.setMaxDate()
                                        }
                                        return React.cloneElement(dayComponent, {
                                            //   style: dayClass,
                                            style: {
                                                ...dayClass,
                                                ...underlineStyle,
                                                ...disabledClass
                                            },
                                        });
                                    }}
                                />
                            </ThemeProvider>
                        </MuiPickersUtilsProvider>
                    </div>
                    {this.props.regular &&
                        <div style={{ marginTop: "-0.5rem" }}>
                            <FormControlLabel
                                style={{ marginLeft: "0.5rem", marginTop: "-0.5rem" }}
                                control={<CustomCheckbox id="agency" checked={this.state.checked} onChange={this.onChangeChecked} />}
                                label={<span>{localeObj.regular_payment}</span>}
                            />
                        </div>
                    }
                    <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                        {this.props.fromBoleto &&
                            <div className="subtitle2 highEmphasis" style={{ marginBottom: "17px", opacity: "60%" }}>{localeObj.calender_bottomText}</div>
                        }
                        <PrimaryButtonComponent btn_text={this.props.secondaryButtonEnabled === true ? localeObj.apply : localeObj.confirm} onCheck={this.sendField} />
                        {this.props.secondaryButtonEnabled === true && <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.cancelField} />}
                    </div>
                </div>
                <div style={{ display: this.state.bottomSheet ? "block" : "none" }}>
                    {this.state.bottomSheet && <BottomSheetYear year={this.state.yearList} heading={localeObj.deposit_date_subText} keySelected={this.setYear} />}
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

CalenderPicker.propTypes = {
    secondaryButtonEnabled: PropTypes.bool,
    regular: PropTypes.bool,
    minDate: PropTypes.object.isRequired,
    maxDate: PropTypes.object.isRequired,
    subtxt: PropTypes.string,
    monthsAhead: PropTypes.string,
    shouldDisableWeekend: PropTypes.bool,
    cancel: PropTypes.func,
    header: PropTypes.string,
    confirm: PropTypes.func,
    isPeriodSelection: PropTypes.bool,
    isSchedule: PropTypes.bool,
    componentName: PropTypes.string,
    value: PropTypes.object,
    fromBoleto: PropTypes.bool,
    onBack: PropTypes.func
};
