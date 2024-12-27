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
import { Divider } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
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

import Empty from "../../images/OnBoardingImages/Empty state.png";
import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import constantObjects from '../../Services/Constants';
import ActionButtonComponent from '../CommonUxComponents/ActionButton';
import GeneralUtilities from '../../Services/GeneralUtilities';

const styles = InputThemes.singleInputStyle;
var localeObj = {};

class FinancingAppComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contractsList: [],
            notFound: false
        }
        this.style = {
            cardStyle: {
                width: "100%",
                borderRadius: "1.25rem",
                backgroundColor: ColorPicker.newProgressBar
            },
            overDueStyle: {
                background: ColorPicker.errorRed,
                margin: "1rem",
                padding: "0.5rem",
                borderRadius: "0.75rem",
                textAlign: "left",
                display: "flex",
                alignItems: "center"
            },
            paperStyle: {
                border: "1px solid " + ColorPicker.lightOpacity,
                background: 'none',
                margin: "0 1rem",
                padding: "0.5rem",
                borderRadius: "0.75rem",
                textAlign: "left"
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNames.FinancingHomePage);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        this.listFinancingContracts();
        window.onBackPressed = () => {
            this.back();
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.FinancingHomePage, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.FinancingHomePage);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }


    back = () => {
        MetricServices.onPageTransitionStop(PageNames.FinancingHomePage, PageState.back);
        this.props.history.replace({ pathname: "/allServices", transition: "right" });
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

    listFinancingContracts = () => {
        this.showProgressDialog();
        ArbiApiService.listFinancingContracts()
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processListContracts(response.result);
                    if (processorResponse.success) {
                        if (processorResponse.contractsList.length !== 0) {
                            this.setState({
                                contractsList: processorResponse.contractsList
                            })
                        } else {
                            this.setState({
                                notFound: true
                            })
                        }
                    }
                } else {
                    this.openSnackBar(response.result.message);
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

    seeDetails = (contractId) => {
        MetricServices.onPageTransitionStop(PageNames.FinancingHomePage, PageState.close);
        let event = {
            eventType: constantObjects.seeDetails,
            page_name: PageNames.FinancingHomePage,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        this.props.history.replace({ pathname: "/seeContractDetails", transition: "right", "state": contractId });
    }

    seeInstallments = (contractId) => {
        MetricServices.onPageTransitionStop(PageNames.FinancingHomePage, PageState.close);
        let event = {
            eventType: constantObjects.viewPortabilityRequests,
            page_name: PageNames.FinancingHomePage,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        this.props.history.replace({ pathname: "/seeInstallments", transition: "right", "state": contractId })
    }

    render() {
        const screenHeight = window.screen.height;
        return (
            <div>
                <ButtonAppBar header={localeObj.financing} onBack={this.back} action="none" />
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div className="headline5 highEmphasis" style={{ margin: "0 1.5rem", marginTop: "2rem", textAlign: "center"}}>
                        {localeObj.contracts}
                    </div>
                    {!this.state.notFound &&
                        <div className="scroll" style={{ height: `${screenHeight - 300}px`, overflowX: 'hidden', overflowY: 'auto' }}>
                            {this.state.contractsList.map((element, idx) =>
                                <div key={idx} style={{ margin: "1rem 1.5rem" }}>
                                    <Card align="center" style={this.style.cardStyle} elevation="0">
                                        <CardContent style={{ paddingBottom: "0" }}>
                                            <FlexView row style={{ justifyContent: "center", alignItems: "center", marginBottom: "1rem" }}>
                                                <CircleIcon style={{ height: "0.75rem", width: "0.75rem", color: ColorPicker.transactionGreen }} />
                                                <span className="subtitle4 highEmphasis" style={{ marginLeft: "0.25rem" }}>{localeObj.active_contract}</span>
                                            </FlexView>
                                            {element.emAtraso &&
                                                <Paper elevation="0" style={this.style.overDueStyle}
                                                    variant="outlined">
                                                    <ErrorIcon style={{ height: "1.5rem", width: "1.5rem", color: ColorPicker.white }} />
                                                    <span className="subtitle4 highEmphasis" style={{ marginLeft: "0.5rem" }}>{localeObj.overdue_contract}</span>
                                                </Paper>}
                                            <Paper elevation="0" style={this.style.paperStyle}
                                                variant="outlined">
                                                <span className="subtitle4 mediumEmphasis">{localeObj.contract + ":"}</span>&nbsp;
                                                <span className="subtitle4 highEmphasis">{element.idContrato}</span>
                                            </Paper>
                                            <FlexView column style={{ marginBottom: "0.75rem" }}>
                                                <FlexView style={{ justifyContent: "space-between", margin: "1rem", alignItems: "center" }}>
                                                    <span className="tableLeftStyle mediumEmphasis" style={{ float: "left" }}>{localeObj.install_amount}</span>
                                                    <span className="pixTableRightContent headline4 highEmphasis" >{"R$ " + GeneralUtilities.currencyFromDecimals(element.valorRecebivel)}</span>
                                                </FlexView>
                                                <Divider style={{ borderColor: ColorPicker.lighterAccent, margin: "0 1.5rem" }} />
                                                <FlexView style={{ justifyContent: "space-between", margin: "1rem", alignItems: "center" }}>
                                                    <span className="tableLeftStyle mediumEmphasis" style={{ float: "left" }}>{localeObj.financed_in + ":"}</span>
                                                    <span className="salaryTableRightContent subtitle4 highEmphasis" >{element.dataFinanciamento}</span>
                                                </FlexView>
                                            </FlexView>
                                            <FlexView style={{ justifyContent: "space-around", marginBottom: "1rem" }}>
                                                <ActionButtonComponent entity={element.idContrato}
                                                    btn_text={localeObj.see_details}
                                                    onCheck={this.seeDetails} />
                                                <ActionButtonComponent entity={element.idContrato}
                                                    btn_text={localeObj.see_installments}
                                                    onCheck={this.seeInstallments}
                                                />
                                            </FlexView>
                                        </CardContent>
                                    </Card>
                                </div>)
                            }
                        </div>
                    }
                    {this.state.notFound &&
                        <FlexView column>
                            <div style={{ marginTop: "7.75rem", display: "flex", justifyContent: "center" }}>
                                <span>
                                    <img style={{ width: '6rem', height: "6rem" }} src={Empty} alt="" />
                                </span>
                            </div>
                            <div className="body1 highEmphasis" style={{ marginTop: "1rem", textAlign: "center" }} >
                                {localeObj.no_contracts}
                            </div>
                        </FlexView>
                    }
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
            </div>
        );
    }
}

FinancingAppComponent.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object
}

export default withStyles(styles)(FinancingAppComponent);