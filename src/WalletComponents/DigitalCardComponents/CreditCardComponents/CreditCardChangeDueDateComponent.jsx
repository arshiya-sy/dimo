import React from "react";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import PropTypes from 'prop-types';
import { Card } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import InputThemes from "../../../Themes/inputThemes";
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ArbiErrorResponseHandler from '../../../Services/ArbiErrorResponsehandler';
import ColorPicker from '../../../Services/ColorPicker';
import localeService from "../../../Services/localeListService";
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import PrimaryButtonComponent from '../../CommonUxComponents/PrimaryButtonComponent';
import constantObjects from "../../../Services/Constants";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import MetricServices from "../../../Services/MetricsService";
import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";

const theme2 = InputThemes.snackBarTheme;

const stylePaper = () => ({
    paper: {
        borderTopLeftRadius: "1.25rem",
        borderTopRightRadius: "1.25rem",
        backgroundColor: ColorPicker.newProgressBar
    }
});

var localeObj = {};

class CreditCardChangeDueDateComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            progressBar: false,
            preSelectedDateValue: this.props.preSelectedDate,
            billingDate: this.props.preSelectedDate,
            usedLimit: 0,
            menuOptions: ["05", "10", "15", "20", "25"],
            checkedValues: [],
            confirmDateChange: false,
            dateSelected : false
        };
        this.styles = {
            textStyle: {
                margin: "1rem"
            },
            cardStyle: {
                width: "100%",
                borderRadius: "1.25rem",
                backgroundColor: ColorPicker.newProgressBar
            },
            smallCardStyle: {
                width: "5rem",
                height: "5rem",
                borderRadius: "1rem",
                backgroundColor: ColorPicker.newProgressBar
            },
            itemStyle: {
                display: "flex",
                justifyContent: "space-between",
                margin: "5% 0",
                align: 'left'
            }
        }
        this.componentName = PageNames["CreditCardComponents"]["credit_due_date"]
        if(this.props.componentName){
            this.componentName = this.props.componentName
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    componentDidMount() {
        this.setInitialId(this.state.menuOptions.findIndex(obj => obj === this.props.preSelectedDate));
        window.onBackPressed = () => {
            this.back();
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
    }

    showProgressDialog = () => {
        this.setState({
            progressBar: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            progressBar: false
        })
    }

    goToCreditCardSettingsPage = () => {
        this.props.onBack();
    }

    getElementByIdAsync = id => new Promise(resolve => {
        const getElement = () => {
            const element = document.getElementById(id);
            if (element) {
                resolve(element);
            } else {
                requestAnimationFrame(getElement);
            }
        };
        getElement();
    });

    async setInitialId(boxId) {
        let ele = await this.getElementByIdAsync(boxId);
        ele.style.borderWidth = "2px";
        ele.style.border = "2px solid transparent";
        ele.style.background = "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box";
        this.setState({
            currentId: boxId,
            checkedValues: [boxId],
            billingDate: this.getField(boxId)
        })
    }

    getField = (index) => {
        return this.state.menuOptions[index];
    }

    setChecked = (boxId) => {
        let ele = document.getElementById(this.state.currentId);
        if (ele) {
            ele.style.borderWidth = "2px";
            ele.style.border = "2px solid transparent";
            ele.style.background = ColorPicker.newProgressBar;
        }
        document.getElementById(boxId).style.borderWidth = "2px";
        document.getElementById(boxId).style.border = "2px solid transparent";
        document.getElementById(boxId).style.background = "linear-gradient(to right,RGB(31, 63, 94),RGB(31, 63, 94)) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box";

        this.setState({
            currentId: boxId,
            checkedValues: [boxId],
            billingDate: this.getField(boxId),
            dateSelected : true
        });
    }

    handleCancelInvoiceDueDate = () => {
        this.setState({
            confirmDateChange: false
        });
    }

    sendConfirmation = () => {
        if(this.state.billingDate === this.state.preSelectedDateValue) {
            this.openSnackBar(localeObj.credit_card_no_date_change_error);
        }
        else if (this.state.billingDate === "" || !this.state.dateSelected) {
            this.openSnackBar(localeObj.optionError);
        } else {
            this.setState({
                confirmDateChange: true
            });
        }
    }

    back = () => {
        if(this.state.confirmDateChange) {
            this.handleCancelInvoiceDueDate();
        } else {
            this.props.onBack();
        }
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    confirmInvoiceDateChange = () => {
        this.setState({
            confirmDateChange: false
        });
        this.showProgressDialog();
        arbiApiService.updateCreditCardInvoiceDueDate(this.state.billingDate, this.componentName).then(response => {
                if (response.success) {
                    this.hideProgressDialog();
                    //Log.sDebug("Credit Card Invoice Due Date Details Fetched", "Credit Card Invoice Due Date Update Page");
                    let processorResponse = ArbiResponseHandler.processCreditCardInvoiceDueDateChanges(response.result);
                    if (processorResponse.success) {
                        //Log.sDebug("Credit Card Invoice Due Date Details Fetched: "+JSON.stringify(processorResponse.result));
                        this.setState({
                            billingDate: processorResponse.dueDate,
                            creditCardSettingsResult: processorResponse.result
                        });
                        this.props.setBillingDate(processorResponse.dueDate);
                        this.openSnackBar(localeObj.invoice_due_date_successmessage);
                        this.timeoutForSnackbar = setTimeout(() => {
                            clearTimeout(this.timeoutForSnackbar);
                            this.props.onBack();
                        }, 2000);
                    } else {
                        this.hideProgressDialog();
                        let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                        //this.setTransactionInfo(errorJson);
                        if(errorJson && errorJson.descriptor){
                            this.openSnackBar(errorJson.descriptor);
                        } else {
                            this.openSnackBar(localeObj.tryAgainLater)
                        }
                        this.timeoutForSnackbar = setTimeout(() => {
                            clearTimeout(this.timeoutForSnackbar);
                            this.props.onBack();
                        }, 2000);
                        //Log.sDebug("updateCreditCardInvoiceDueDate, Error in updating invoice due date changes");
                    }
                } else {
                    this.hideProgressDialog();
                    let errorJson = ArbiErrorResponseHandler.processErrorsForJSON(response);
                    //this.setTransactionInfo(errorJson);
                    if(errorJson && errorJson.descriptor){
                        this.openSnackBar(errorJson.descriptor);
                    } else {
                        this.openSnackBar(localeObj.tryAgainLater)
                    }
                    //this.openSnackBar(localeObj.invoice_due_date_failedmessage);
                    this.timeoutForSnackbar = setTimeout(() => {
                        clearTimeout(this.timeoutForSnackbar);
                        this.props.onBack();
                    }, 2000);
                    //Log.sDebug("updateCreditCardInvoiceDueDate failed");
                }
            });
    }

    render() {
        const { classes } = this.props;
        return (
            <div style={{ height: "100%", width: "100%" }}>
                <div style={{ display: (this.state.progressBar ? 'block' : 'none') }}>
                    {this.state.progressBar && <CustomizedProgressBars></CustomizedProgressBars>}
                </div>
                {<div style={{ display: (!this.state.progressBar ? 'block' : 'none') }}>
                    <span  className="headline5 highEmphasis" style={{ display: 'block', marginTop: '1.5rem', marginLeft: '1.5rem', marginBottom: '1.5rem', textAlign: "left" }}>
                        {localeObj.invoice_due_date_header}
                    </span>
                    <div style={{ margin: '2rem' }}>
                        <Grid container>
                            {this.state.menuOptions.map((opt, key) => (
                                <Grid key={key} align="center" item xs={4}>
                                    <Card align="center" style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        height: "5rem",
                                        width: "5rem",
                                        border: "2px solid transparent",
                                        backgroundColor: ColorPicker.newProgressBar,
                                        borderRadius: "1.25rem",
                                        marginBottom: "2rem"
                                    }} id={key} elevation="0" onClick={() => { this.setChecked(key) }}>
                                        <span className="body1 highEmphasis">{opt}</span>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </div>
                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                        {/* <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                            {localeObj.invoice_due_date_confirmation_msg}
                        </div> */}
                        <PrimaryButtonComponent btn_text={localeObj.change_invoice_due_date} onCheck={this.sendConfirmation} />
                    </div>
                    <MuiThemeProvider theme={theme2}>
                        <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SHORT_SNACK_DURATION} onClose={this.closeSnackBar}>
                            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                        </Snackbar>
                    </MuiThemeProvider>
                    <div style={{ height: "100%", overflowX: "hidden" }}>
                        <Drawer
                        anchor="bottom"
                        open={this.state.confirmDateChange}
                        classes={{
                            paper: classes.paper
                        }}
                        style={InputThemes.initialMarginStyle}>
                            <div style={{textAlign: "center"}}
                                onKeyDown={this.handleInvoiceDate}>
                                <div style={{ marginTop: '2rem', marginLeft: '1rem', marginRight: '1rem', textAlign: "center" }}>
                                    <span className="headline6 highEmphasis">
                                        {localeObj.invoice_due_date_bottomSheet_header}
                                    </span>
                                </div>
                                <div style={{ marginTop: "1rem", marginLeft: '1rem', marginRight: '1rem', marginBottom: "1rem", textAlign: "center" }}>
                                    <span className="body2 mediumEmphasis">
                                        {localeObj.invoice_due_date_bottomSheet_footer}
                                    </span>
                                </div>
                                <div style={{ width: "100%", marginBottom: "1rem", textAlign: "center" }}>
                                    <PrimaryButtonComponent btn_text={localeObj.confirm_invoice_due_date_change} onCheck={this.confirmInvoiceDateChange} />
                                    <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.handleCancelInvoiceDueDate} />
                                </div>
                            </div>
                        </Drawer>
                    </div>
                </div>}

            </div>
        );
    }
}

CreditCardChangeDueDateComponent.propTypes = {
    classes: PropTypes.object,
    travelNoticeStatus: PropTypes.string,
    history: PropTypes.object,
    onBack: PropTypes.func,
    setBillingDate: PropTypes.func,
    preSelectedDate: PropTypes.number,
    componentName: PropTypes.string
  };

export default withStyles(stylePaper)(CreditCardChangeDueDateComponent);