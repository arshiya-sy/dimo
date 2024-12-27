import React from 'react';
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";

import PageState from '../../Services/PageState';
import PageNames from '../../Services/PageNames';
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";

import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import constantObjects from '../../Services/Constants';
import GeneralUtilities from '../../Services/GeneralUtilities';

import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

var localeObj = {};

const styles = InputThemes.singleInputStyle;
class FinancingDetailsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            paidDetails: [],
            outstandingDetails: [],
            showDetails: true,
            showPaidDetails: true
        }
        this.style = {
            paperStyle: {
                background: '#1F3F5E',
                padding: "0.75rem",
                borderRadius: "1.25rem",
                marginTop: "1rem"
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNames.ViewInstallmentDetails);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        this.listContractDetails();
        window.onBackPressed = () => {
            this.back();
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.ViewInstallmentDetails, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.ViewInstallmentDetails);
        }
    }

    componentWillUnmount() {
        MetricServices.onPageTransitionStop(PageNames.ViewInstallmentDetails, PageState.close);
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }


    back = () => {
        MetricServices.onPageTransitionStop(PageNames.ViewInstallmentDetails, PageState.back);
        this.props.history.replace({ pathname: "/financing", transition: "right" });
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        })
    }

    listContractDetails = () => {
        this.showProgressDialog();
        ArbiApiService.listContractInvestments(this.props.location.state)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processInstallmentDetails(response.result);
                    if (processorResponse.success) {
                        this.setState({
                            paidDetails: processorResponse.paidDetails,
                            outstandingDetails: processorResponse.outstandingDetails
                        })
                    }
                } else {
                    this.openSnackBar(response.result.message);
                    this.back();
                }
            })
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

    setChecked = () => {
        this.setState({ showDetails: !this.state.showDetails })
    }

    setPaidChecked = () => {
        this.setState({ showPaidDetails: !this.state.showPaidDetails })
    }

    render() {
        const screenHeight = window.screen.height;
        return (
            <div>
                <ButtonAppBar header={localeObj.installments} onBack={this.back} action="none" />
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.all_installments}
                            </div>
                        </FlexView>
                    </div>
                    <div style={{ height: `${screenHeight - 250}px`, overflowX: 'hidden', overflowY: 'auto' }}>
                        <div style={{ margin: "0 1.5rem" }}>
                            <div className="body2 accent" style={{
                                textAlign: "left", alignItems: "center",
                                display: (this.state.paidDetails.length !== 0 && this.state.showDetails) ? "flex" : "none"
                            }} onClick={e => { this.setChecked(e) }}>
                                <RemoveIcon style={{ marginRight: "1rem" }} />
                                <span>{localeObj.installment_outstanding}</span>
                            </div>
                            <div className="body2 highEmphasis" style={{
                                textAlign: "left", alignItems: "center",
                                display: (this.state.paidDetails.length !== 0 && !this.state.showDetails) ? "flex" : "none"
                            }} onClick={e => { this.setChecked(e) }}>
                                <AddIcon style={{ marginRight: "1rem" }} />
                                <span>{localeObj.installment_outstanding}</span>
                            </div>
                            {this.state.showDetails && this.state.outstandingDetails.map((element, idx) =>
                                <Paper key={idx} elevation="0" style={this.style.paperStyle}
                                    variant="outlined">
                                    <FlexView style={{ alignItems: "center" }}>
                                        <div style={{ marginLeft: "1rem" }}>
                                            <span className="subtitle4 highEmphasis">{element.installment}</span>
                                            <span className="subtitle4 highEmphasis" style={{ verticalAlign: "super" }}>{"a"}</span>
                                        </div>
                                        <FlexView column style={{ marginLeft: "1rem" }}>
                                            {element.status === "A Vencer" && <span className="caption mediumEmphasis">{localeObj.installment_outstanding_header}</span>}
                                            {element.status === "Atrasado" && <span className="caption errorRed">{localeObj.overdue_installment}</span>}
                                            <span className="body2 highEmphasis" style={{ marginTop: "0.25rem" }}>{element.installmentDate}</span>
                                        </FlexView>
                                        <div className={element.status === "Atrasado" ? "subtitle4 errorRed" : "subtitle4 highEmphasis"} style={{ marginLeft: "auto", marginRight: "1rem" }}>{"R$ " + GeneralUtilities.currencyFromDecimals(element.value)}</div>
                                    </FlexView>
                                </Paper>
                            )}
                            <div className="body2 accent" style={{
                                textAlign: "left", marginTop: "1.5rem", alignItems: "center",
                                display: (this.state.paidDetails.length !== 0 && this.state.showPaidDetails) ? "flex" : "none"
                            }} onClick={e => { this.setPaidChecked(e) }}>
                                <RemoveIcon style={{ marginRight: "1rem" }} />
                                <span>{localeObj.installment_paid}</span>
                            </div>
                            <div className="body2 highEmphasis" style={{
                                textAlign: "left", marginTop: "1.5rem", alignItems: "center",
                                display: (this.state.paidDetails.length !== 0 && !this.state.showPaidDetails) ? "flex" : "none"
                            }} onClick={e => { this.setPaidChecked(e) }}>
                                <AddIcon style={{ marginRight: "1rem" }} />
                                <span>{localeObj.installment_paid}</span>
                            </div>
                            {this.state.showPaidDetails && this.state.paidDetails.map((element, idx) =>
                                <Paper key={idx} elevation="0" style={this.style.paperStyle}
                                    variant="outlined">
                                    <FlexView style={{ alignItems: "center" }}>
                                        <div style={{ marginLeft: "1rem" }}>
                                            <span className="subtitle4 highEmphasis">{element.installment}</span>
                                            <span className="subtitle4 highEmphasis" style={{ verticalAlign: "super" }}>{"a"}</span>
                                        </div>
                                        <FlexView column style={{ marginLeft: "1rem" }}>
                                            <span className="caption mediumEmphasis">{localeObj.paid_amount}</span>
                                            <span className="body2 highEmphasis" style={{ marginTop: "0.25rem" }}>{element.installmentDate}</span>
                                        </FlexView>
                                        <div className="subtitle4 highEmphasis" style={{ marginLeft: "auto", marginRight: "1rem" }}>{"R$ " + GeneralUtilities.currencyFromDecimals(element.value)}</div>
                                    </FlexView>
                                </Paper>
                            )}
                        </div>
                    </div>
                </div>
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
            </div >
        );
    }
}

FinancingDetailsComponent.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object
}

export default withStyles(styles)(FinancingDetailsComponent);