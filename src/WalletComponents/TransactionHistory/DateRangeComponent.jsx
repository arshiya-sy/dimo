import "date-fns";
import React from "react";
import PropTypes from "prop-types";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import FlexView from "react-flexview";
import { DateRange } from 'react-date-range';

import "../../styles/genericFontStyles.css";
import "../../styles/dateRange.css";
import "../../styles/colorSelect.css";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import "../../styles/main.css";

import PageState from "../../Services/PageState";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import BottomSheetYear from "../CommonUxComponents/BottomSheetYear";
import GeneralUtilities from "../../Services/GeneralUtilities";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import moment from "moment";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import { enUS, ptBR } from "date-fns/locale";
import MetricsService from "../../Services/MetricsService";
import DownIcon from "@material-ui/icons/KeyboardArrowDown";

const materialTheme = InputThemes.CalenderTheme;
const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

const startDate = () => {
    let dateOfAccountOpening = ImportantDetails.dateOfOpening;
            if (!dateOfAccountOpening || dateOfAccountOpening === null || dateOfAccountOpening === undefined || dateOfAccountOpening === "") {
                dateOfAccountOpening = moment("07/12/2021").toDate();
            } else {
                dateOfAccountOpening = moment(ImportantDetails.dateOfOpening).toDate();
            }
            return dateOfAccountOpening;
}
export default class DateRangeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            date: props.value || new Date(),
            snackBarOpen: false,
            checked: false,
            showDateView: new Date(),
            selection: {
                startDate: new Date(),
                endDate: new Date(),
                key: 'selection',
            },
            bottomSheet: false,
            yearList: [],
            selectedYear: new Date().getFullYear()
        }
        this.sendField = this.sendField.bind(this);

        if(this.props.componentName){
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "TRANSACTION HISTORY DATE RANGE"
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        let yearList = [];
        let yearStart = startDate().getFullYear();
        let yearEnd = new Date().getFullYear();
        for (let i = Number(yearStart); i <= Number(yearEnd); i++) {
            yearList.push(i);
        }
        this.setState({
            yearList: yearList
        })

        if(this.props.componentName){
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "Calender Page"
        }

        if(GeneralUtilities.emptyValueCheck(this.props.value)){
            this.setState({
                date: new Date()
            })
        } else {
            this.setState({
                date: this.props.value
            })
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
        if (this.state.selection.endDate === "") {
            this.openSnackBar(localeObj.enter_field);
        } else {
            if (this.props.regular) {
                let json = {};
                json["monthly"] = this.state.checked;
                json["date"] = this.state.date;
                json["startDate"] = this.state?.selection?.startDate;
                json["endDate"] = this.state.selection.endDate;
                MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                this.props.confirm(json);
            } else if (!this.props.regular && this.props.isSchedule) {
                let json = {};
                json["monthly"] = false;
                json["date"] = this.state.date;
                json["startDate"] = this.state?.selection?.startDate;
                json["endDate"] = this.state.selection.endDate;
                MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                this.props.confirm(json);
            } else {
                let json = {};
                json["date"] = this.state.date;
                json["startDate"] = this.state?.selection?.startDate;
                json["endDate"] = this.state.selection.endDate;
                MetricsService.onPageTransitionStop(this.componentName, PageState.close);
                this.props.confirm(json);
            }
        }
    }

    onCancel = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.cancel);
        this.props.cancel();
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

    setYear = (field) => {
            let d = new Date();
            d.setFullYear(Number(field));
            let dateOfAccountOpening = ImportantDetails.dateOfOpening;
            if (!dateOfAccountOpening || dateOfAccountOpening === null || dateOfAccountOpening === undefined || dateOfAccountOpening === "") {
                dateOfAccountOpening = new Date("07/12/2021");
            } else {
                dateOfAccountOpening = new Date(ImportantDetails.dateOfOpening);
            }
            let finalDate = new Date();
            if(d.getFullYear() === dateOfAccountOpening.getFullYear()){
                finalDate = dateOfAccountOpening;
            }else{
                d.setMonth(0);
                finalDate = d;
            }
            let defaultRange = {
                startDate: finalDate,
                endDate: finalDate,
                key: "selection"
            }
            this.onSelectRange(defaultRange);    
            this.setState({
                bottomSheet: false,
                date: finalDate,
                key: "selection",
            });
    }

    onSelectRange(range) {
        Log.sDebug("Range" + JSON.stringify(range), this.componentName);
        this.setState({
            selection: {
                startDate: range.startDate,
                endDate: range.endDate,
                key: "selection"
            }
        })
        Log.sDebug("Selection" + JSON.stringify(this.state.selection), this.componentName);
    }

    render() {
        const selectRange = this.state.selection;
        const screenHeight = window.screen.height;
        const today = moment();
        const start_date = new Date(this.state?.selection?.startDate);
        const end_date = new Date(this.state.selection.endDate);

        const minDate = () => {
            let dateOfAccountOpening = ImportantDetails.dateOfOpening;
            if (!dateOfAccountOpening || dateOfAccountOpening === null || dateOfAccountOpening === undefined || dateOfAccountOpening === "") {
                dateOfAccountOpening = moment("07/12/2021").toDate();
            } else {
                dateOfAccountOpening = moment(ImportantDetails.dateOfOpening).toDate();
            }
            return dateOfAccountOpening;
        }

        const maximumDate = today.toDate();

        return (
            <div>
                <div className="scroll" style={{ height: `${screenHeight - 290}px`, overflowY: "auto", overflowX: "hidden" }}>
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
                    <div>
                    {
                    this.state?.selection?.startDate !== "null" && this.state.selection.endDate !== "Invalid Date" && start_date?.getTime() !== end_date?.getTime() ? 
                        <div className="subtitle4 highEmphasis" style={{ textAlign: "left", margin: "1.5rem 1.5rem", color: "white" }}>
                                    {localeObj.from_caps +": " + this.state?.selection?.startDate?.getDate() +", "+ this.state?.selection?.startDate?.toLocaleString("default", { month: "short" }) +" "+ this.state?.selection?.startDate?.getFullYear() +" "+
                                     localeObj.to_caps +": "+ this.state.selection.endDate.getDate() +", "+ this.state.selection.endDate.toLocaleString("default", { month: "short" }) +" "+ this.state.selection.endDate.getFullYear()  }
                        </div> : ""
                    }

                    <div className="subtitle4 highEmphasis" onClick={this.pickYear}
                            style={{ textAlign: "left", margin: "1.5rem", marginTop: "0", display: "inline-flex" }}>
                            <span>{new Date(this.state.date).getFullYear()}</span>
                            <DownIcon style={{ fill: ColorPicker.darkHighEmphasis, marginTop: "-0.25rem", fontSize: "1.5rem" }} />
                        </div>
                        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={GeneralUtilities.getLocale() === 'en_US' ? enUS : ptBR}>
                            <ThemeProvider theme={materialTheme}>
                                <DateRange style={{ width: `${window.screen.width - 32}px` }}
                                    locale={GeneralUtilities.getLocale() === 'en_US' ? enUS : ptBR}
                                    onChange={item => this.onSelectRange(item.selection)}
                                    months={1}
                                    direction="vertical"
                                    weekdayDisplayFormat='EEEEE'
                                    minDate={minDate()}
                                    maxDate={maximumDate}
                                    date={this.state.showDateView}
                                    shownDate={this.state.showDateView}
                                    startDatePlaceholder={null}
                                    endDatePlaceholder={null}
                                    moveRangeOnFirstSelection={true}
                                    ranges={[selectRange]}
                                    showDateDisplay={false}
                                    editableDateInputs={true}
                                    showMonthAndYearPickers={false}
                                />
                            </ThemeProvider>
                        </MuiPickersUtilsProvider>
                    </div>
                </div>
                <div style={{...InputThemes.bottomButtonStyle, textAlign:"center"}}>
                    <PrimaryButtonComponent btn_text={localeObj.apply} onCheck={this.sendField} />
                    <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onCancel} />
                </div>
                <div style={{ display: this.state.bottomSheet ? "block" : "none" }}>
                    {this.state.bottomSheet && <BottomSheetYear year={this.state.yearList} heading={localeObj.deposit_date_subText} keySelected={this.setYear} />}
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
DateRangeComponent.propTypes = {
    value: PropTypes.string,
    componentName: PropTypes.string,
    header: PropTypes.string,
    confirm: PropTypes.func.isRequired,
    isSchedule: PropTypes.bool,
    regular: PropTypes.string,
    cancel: PropTypes.func.isRequired,
    subtxt: PropTypes.string,

}