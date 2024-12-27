import React from 'react';
import PropTypes from "prop-types";
import moment from 'moment';
import FlexView from 'react-flexview/lib';
import ColorPicker from '../../Services/ColorPicker';
import { Paper } from "@material-ui/core";
import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from "../../Services/Constants";
import CalenderPicker from "../CommonUxComponents/CalenderPicker";
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import { MuiThemeProvider } from '@material-ui/core/styles';
import InputThemes from "../../Themes/inputThemes";
import androidApiCallsService from '../../Services/androidApiCallsService';
import localeListService from '../../Services/localeListService';
import PrimaryButtonComponent from '../CommonUxComponents/PrimaryButtonComponent';
import SecondaryButtonComponent from '../CommonUxComponents/SecondaryButtonComponent';
import ImportantDetails from '../NewLaunchComponents/ImportantDetails';
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import androidApiCalls from '../../Services/androidApiCallsService';

const theme1 = InputThemes.PeriodSelectorTheme;
const theme2 = InputThemes.snackBarTheme;
//const PageNameJSON = PageNames.mainTransactionHistory;
var localeObj = {};

class PeriodSelection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            beginDate: new Date(),
            finishDate:  new Date(),
            beginDateString: "",
            finishDateString:  "",
            beginDateDisplayString: "",
            finishDateDisplayString: "",
            disabledStartDate: true,
            disabledFinishDate: true,
            disabledApplyButton: true,
            processing: false,
            currentState: "period",
            snackBarOpen: false,
            message : "",
            preDefinedCustomPeriod : false
        }
        let today = new Date();
        this.maxDisplayDate = new Date(today);
        this.minDisplayDate = new Date(ImportantDetails.dateOfOpening);
        this.styles = {
            cardStyle: {
                height: "4rem",
                width: "20.5rem",
                borderRadius: "1.25rem",
                marginTop: "0.5rem",
                padding: "0.75rem 1.5rem",
                backgroundColor: ColorPicker.surface3
            }
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeListService.getActionLocale();
        }
    }

    componentDidMount() {
        const tz = androidApiCalls.getLocale() === "en_US" ? "en" : "pt-br";
        moment.locale(tz);
        androidApiCallsService.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.onBack();
        }
    }

    onGetDateRange = (rangeObj) => {
        let fromDate = moment(rangeObj.startDate).startOf('day');
        let endDate = moment(rangeObj.endDate).endOf('day');
        //Log.sDebug("From Date selected " + fromDate.toISOString + " " + "From Date selected " + endDate.toISOString, "Period Selection");
        if (moment(fromDate).isSameOrBefore(moment(endDate))) {
            this.setState({
                beginDate : moment(fromDate).format("DD/MM/YYYY"),
                beginDateString : fromDate.toISOString(),
                finishDate : moment(endDate).format("DD/MM/YYYY"),
                finishDateString : endDate.toISOString(),
                currentState: "period"
            });
        } else {
            this.setState({
                snackBarOpen: true,
                message: localeObj.initial_date
            });
        }
    }

    onCancelRange = () => {
        this.setState({
            currentState: localeObj.all_operations_filter
        });
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    filterPeriodSelection = () => {
        this.props.periodSelectionApply(moment(this.state.beginDateString), moment(this.state.finishDateString));
    }

    cancelPeriodSelection = () => {
        this.props.periodSelectionCancel();
    }

    selectStartDate = () => {
        this.setState({
            currentState: "StartDate"
        });
    }

    selectFinishDate = () => {
        this.setState({
            currentState: "EndDate"
        });
    }

    onBack = () => {
        if (this.state.currentState === "StartDate" || this.state.currentState === "EndDate") {
            this.setState({
                currentState: "period"
            });
        } else {
            this.props.onBack();
        }
    }

    setStartDate = (formInfo) => {
        const date = moment(formInfo);
        const fd = `${date.date()}, ${date.format('MMM')} ${date.year()}`;
        this.setState({
            beginDate: date.toDate(),
            beginDateString: date.format('MM/DD/YYYY'),
            beginDateDisplayString: fd,
            currentState: 'period',
        });
        if(this.state.finishDateString !== "" && fd !== ""){
            this.setState({
                disabledApplyButton: false
            });
        }
    }

    setEndDate = (formInfo) => {
        const date = moment(formInfo);
        const fd = `${date.date()}, ${date.format('MMM')} ${date.year()}`;
    
        this.setState({
            finishDate: date.toDate(),
            finishDateString: date.format('MM/DD/YYYY'),
            finishDateDisplayString: fd,
            currentState: 'period',
        });
    
        if (this.state.beginDateString !== '' && fd !== '') {
            this.setState({
                disabledApplyButton: false,
            });
        }
    };

    cancelDate = () => {
        this.setState({
            currentState: "period"
        });
    }

    render() {
        return (
            <div style={{ height: "100%", width: "100%" }}>
                <ButtonAppBar header={localeObj.date} onBack={this.onBack} action="none" />
                {this.state.currentState !== "StartDate" && this.state.currentState !== "EndDate" &&
                    <div style={{textAlign: "center"}}>
                        <MuiThemeProvider theme={theme1}>
                            <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                                <div style={InputThemes.initialMarginStyle}>
                                    <FlexView column>
                                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                            {this.props.header}
                                        </div>
                                    </FlexView>
                                </div>
                                <Paper id="startDateId" elevation="0" style={{ background: ColorPicker.disableBlack }}
                                    variant="outlined" >
                                    <FlexView onClick={this.selectStartDate} style={{ width: '100%' }}>
                                        <FlexView column hAlignContent='left' style={{ margin: 'auto auto auto 0rem', width: '90%', justifyContent: 'left'}}>
                                            <div style={{textAlign: "left"}} className="body2 highEmphasis">
                                                <span>{localeObj.startDate}</span>
                                            </div>
                                            <div style={{textAlign: "left"}} className="body2 mediumEmphasis">
                                                <span>{this.state.beginDateDisplayString}</span>
                                            </div>
                                        </FlexView>
                                        <FlexView column style={{ minWidth: "0px", marginLeft: 'auto', marginRight: '0rem' }}>
                                            <ArrowForwardIos style={{ fill: ColorPicker.accent, width: "1rem",textAlign: "center" }} />
                                        </FlexView>
                                    </FlexView>
                                </Paper>
                                <Paper id="endDateId" elevation="0" style={{ background: ColorPicker.disableBlack }}
                                    variant="outlined">
                                    <FlexView onClick={this.selectFinishDate} style={{ width: '100%' }}>
                                        <FlexView column hAlignContent='left' style={{ margin: 'auto auto auto 0rem', width: '90%', justifyContent: 'left' }}>
                                            <div style={{textAlign: "left"}} className="body2 highEmphasis">
                                                <span>{localeObj.finishDate}</span>
                                            </div>
                                            <div style={{textAlign: "left"}} className="body2 mediumEmphasis">
                                                <span>{this.state.finishDateDisplayString}</span>
                                            </div>
                                        </FlexView>
                                        <FlexView column style={{ minWidth: "0px", marginLeft: 'auto', marginRight: '0rem' }}>
                                            <ArrowForwardIos style={{ fill: ColorPicker.accent, width: "1rem",textAlign: "center" }} />
                                        </FlexView>
                                    </FlexView>
                                </Paper>
                                <div style={{ ...InputThemes.bottomButtonStyle,textAlign: "center"}}>
                                    <PrimaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.apply} onCheck={this.filterPeriodSelection} disabled = {this.state.disabledApplyButton} />
                                    <SecondaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.cancel} onCheck={this.cancelPeriodSelection} />
                                </div>
                            </div>
                            <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                                {this.state.processing && <CustomizedProgressBars />}
                            </div>
                        </MuiThemeProvider>
                    </div>}
                <div style={{ display: (this.state.currentState === "StartDate" && !this.state.processing ? 'block' : 'none') }}>
                    {this.state.currentState === "StartDate" &&
                        <CalenderPicker
                            value={this.state.beginDate}
                            minDate={this.minDisplayDate}
                            maxDate={this.maxDisplayDate}
                            confirm={this.setStartDate}
                            header={localeObj.startDate}
                            primaryButtonText={localeObj.apply}
                            secondaryButtonEnabled={true}
                            isPeriodSelection = {true}
                            secondaryButtonText={localeObj.cancel}
                            cancel={this.cancelDate}/>}
                </div>
                <div style={{ display: (this.state.currentState === "EndDate" && !this.state.processing ? 'block' : 'none') }}>
                    {this.state.currentState === "EndDate" &&
                        <CalenderPicker
                            value={this.state.finishDate}
                            minDate={this.minDisplayDate}
                            maxDate={this.maxDisplayDate}
                            confirm={this.setEndDate}
                            header={localeObj.finishDate}
                            primaryButtonText={localeObj.apply}
                            secondaryButtonEnabled={true}
                            isPeriodSelection = {true}
                            secondaryButtonText={localeObj.cancel}
                            cancel={this.cancelDate} />}
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
PeriodSelection.propTypes = {
    periodSelectionApply: PropTypes.func.isRequired,
    periodSelectionCancel: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    header: PropTypes.string
  }
export default PeriodSelection;
