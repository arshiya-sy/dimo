import React from 'react';
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@material-ui/core/Paper';
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";

import PageState from '../../Services/PageState';
import PageNames from '../../Services/PageNames';
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";

import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import constantObjects from '../../Services/Constants';

import { CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import GeneralUtilities from '../../Services/GeneralUtilities';

const styles = InputThemes.singleInputStyle;
var localeObj = {};

class FinancingDetailsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contractDetails: []
        }
        this.style = {
            cardStyle: {
                marginTop: "1rem",
                width: "100%",
                borderRadius: "1.25rem",
                backgroundColor: ColorPicker.newProgressBar
            },
            paperStyle: {
                background: '#1F3F5E',
                padding: "0.75rem",
                borderRadius: "1.25rem",
                marginTop: "1rem"
            },
            overDueStyle: {
                background: ColorPicker.errorRed,
                padding: "0.75rem",
                borderRadius: "1.25rem",
                marginTop: "1rem",
                display: "flex",
                alignItems: "center"
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNames.ViewContaractDetails);
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
            MetricServices.onPageTransitionStop(PageNames.ViewContaractDetails, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.ViewContaractDetails);
        }
    }

    componentWillUnmount() {
        MetricServices.onPageTransitionStop(PageNames.ViewContaractDetails, PageState.close);
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }


    back = () => {
        MetricServices.onPageTransitionStop(PageNames.ViewContaractDetails, PageState.back);
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
        ArbiApiService.listContractDetails(this.props.location.state)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processContractDetails(response.result);
                    if (processorResponse.success) {
                        this.setState({
                            contractDetails: processorResponse.contractDetails
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

    render() {
        const screenHeight = window.screen.height;
        const element = this.state.contractDetails;
        let percentage = Math.ceil((element.paidAmount / element.totalAmount) * 100);
        return (
            <div>
                <ButtonAppBar header={localeObj.financing_details} onBack={this.back} action="none" />
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div className="scroll" style={{ height: `${screenHeight - 240}px`, overflowX: 'hidden', overflowY: 'auto' }}>
                        <div style={{ margin: "1rem" }}>
                            <Paper elevation="0" style={this.style.paperStyle}
                                variant="outlined">
                                <FlexView style={{ justifyContent: "space-between", alignItems: "center" }}>
                                    <span className="tableLeftStyle mediumEmphasis" style={{ marginLeft: "1rem" }}>{localeObj.contract}</span>
                                    <span className="subtitle4 highEmphasis" style={{ marginRight: "1rem" }}>{element.contract}</span>
                                </FlexView>
                            </Paper>
                            {element.overDue &&
                                <Paper elevation="0" style={this.style.overDueStyle}
                                    variant="outlined">
                                    <ErrorIcon style={{ height: "1.5rem", width: "1.5rem", color: ColorPicker.white }} />
                                    <span className="subtitle4 highEmphasis" style={{ marginLeft: "1rem" }}>{localeObj.overdue_installment}</span>
                                </Paper>}
                            <Card align="center" style={this.style.cardStyle} elevation="0">
                                <CardContent style={{ paddingBottom: "0" }}>
                                    <FlexView row style={{ alignItems: "center", margin: "1rem 0" }}>
                                        <div style={{ width: "40%"}}>
                                            <CircularProgressbarWithChildren
                                                value={percentage}
                                                strokeWidth={10}
                                                styles={{
                                                    path: {
                                                        stroke: ColorPicker.accent,
                                                        strokeLinecap: 'butt',
                                                        transform: 'rotate(0.4turn)',
                                                        transformOrigin: 'center center',
                                                    },
                                                    trail: {
                                                        stroke: 'rgba(255, 255, 255, 0.38)',
                                                        strokeLinecap: 'butt'
                                                    }
                                                }}
                                            >
                                                <FlexView column>
                                                    <span className="headline7 highEmphasis">{`${percentage}%`}</span>
                                                    <span className="caption ligtherAccent" style={{ marginLeft: "-2px", marginBottom: "2px" }}>{androidApiCalls.getLocale() === "en_US" ? "of" : "de"}</span>
                                                    <span className="caption ligtherAccent">{"R$ " + GeneralUtilities.currencyFromDecimals(element.totalAmount)}</span>
                                                </FlexView>
                                            </CircularProgressbarWithChildren>
                                        </div>
                                        <FlexView column style={{ textAlign: "left", width: "60%" }}>
                                            <div style={{ marginLeft: "2rem" }}>
                                                <div className="body2 mediumEmphasis">{localeObj.outstanding_balance}</div>
                                                <div className="subtitle4 highEmphasis" style={{ marginTop: "0.2rem" }}>{"R$ " + GeneralUtilities.currencyFromDecimals(element.remainingAmount)}</div>
                                                <div className="body2 mediumEmphasis" style={{ marginTop: "1.5rem" }}>{localeObj.paid_amount}</div>
                                                <div className="subtitle4 highEmphasis" style={{ marginTop: "0.2rem" }}>{"R$ " + GeneralUtilities.currencyFromDecimals(element.paidAmount)}</div>
                                                <div className="body2 mediumEmphasis" style={{ marginTop: "1.5rem" }}>{localeObj.installments}</div>
                                                <div className="subtitle4 highEmphasis" style={{ marginTop: "0.2rem" }}>{element.paidInstallments + "/" + element.totalInstallments}</div>
                                                <div className="caption ligtherAccent" style={{ marginTop: "0.2rem" }}>{"R$ " + GeneralUtilities.currencyFromDecimals(element.installmentAmount) + " / " + localeObj.month}</div>
                                            </div>
                                        </FlexView>
                                    </FlexView>
                                </CardContent>
                            </Card>
                            <Paper elevation="0" style={this.style.paperStyle}
                                variant="outlined">
                                <FlexView style={{ justifyContent: "space-between", alignItems: "center" }}>
                                    <span className="tableLeftStyle mediumEmphasis" style={{ marginLeft: "1rem" }}>{localeObj.next_due}</span>
                                    <span className="subtitle4 highEmphasis" style={{ marginRight: "1rem" }}>{element.nextDueDate}</span>
                                </FlexView>
                            </Paper>
                            <Paper elevation="0" style={this.style.paperStyle}
                                variant="outlined">
                                <FlexView style={{ justifyContent: "space-between", alignItems: "center" }}>
                                    <span className="tableLeftStyle mediumEmphasis" style={{ marginLeft: "1rem" }}>{localeObj.device}</span>
                                    <span className="subtitle4 highEmphasis" style={{ marginRight: "1rem" }}>{element.device}</span>
                                </FlexView>
                            </Paper>
                            <Card align="center" style={this.style.cardStyle} elevation="0">
                                <CardContent style={{ paddingBottom: "1rem" }}>
                                    <FlexView column style={{ margin: "0 1rem" }}>
                                        <FlexView style={{ justifyContent: "space-between", alignItems: "center" }}>
                                            <span className="tableLeftStyle mediumEmphasis" style={{ float: "left" }}>{localeObj.financed_in}</span>
                                            <span className="pixTableRightContent subtitle4 highEmphasis" >{element.financedIn}</span>
                                        </FlexView>
                                        <FlexView style={{ justifyContent: "space-between", marginTop: "1rem", alignItems: "center" }}>
                                            <span className="tableLeftStyle mediumEmphasis" style={{ float: "left" }}>{localeObj.first_due}</span>
                                            <span className="pixTableRightContent subtitle4 highEmphasis" >{element.firstDueDate}</span>
                                        </FlexView>
                                        <FlexView style={{ justifyContent: "space-between", marginTop: "1rem", alignItems: "center" }}>
                                            <span className="tableLeftStyle mediumEmphasis" style={{ float: "left" }}>{localeObj.last_due}</span>
                                            <span className="pixTableRightContent subtitle4 highEmphasis" >{element.lastDueDate}</span>
                                        </FlexView>
                                    </FlexView>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div style={InputThemes.bottomButtonStyle}>
                        <PrimaryButtonComponent btn_text={localeObj.back} onCheck={this.back} />
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