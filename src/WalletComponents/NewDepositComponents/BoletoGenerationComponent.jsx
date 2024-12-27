import React from "react";
import "../../styles/main.css";
import moment from "moment";
import InputThemes from "../../Themes/inputThemes";
import { CSSTransition } from 'react-transition-group';

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import httpRequest from "../../Services/httpRequest";
import constantObjects from "../../Services/Constants";
import NewUtilities from "../../Services/NewUtilities";
import ArbiApiService from "../../Services/ArbiApiService";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCalls from "../../Services/androidApiCallsService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";

import ReceiptComponent from "./ReceiptComponent";
import ReviewTemplate from "../CommonUxComponents/ReviewTemplate";
import CalenderPicker from "../CommonUxComponents/CalenderPicker";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import AmountComponent from "../CommonUxComponents/AmountComponent";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider} from '@material-ui/core/styles';
import MetricsService from "../../Services/MetricsService";
import PropTypes from "prop-types";

const theme1 = InputThemes.snackBarTheme;
const PageNameJSON= PageNames.boletoGeneration;
var localeObj = {};

export default class BoletoGenerationComponent extends React.PureComponent {
    constructor(props) {
        super(props);
        //by default expiry date is 3 days from current date
        // minimum is current date
        // maximum is 10 days from now
        this.expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        let expiryDateString = this.expiryDate.toLocaleDateString().split(',')[0];

        this.minimumExpiryTimeString = new Date();
        this.maximumExpiryTimeString = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
        this.state = {
            creationState: "input",
            direction: "",
            info: {},
            amount: "",
            decimal: "",
            message: "",
            limit: 500.00,
            snackBarOpen: false,
            expiryDateString: expiryDateString,
            expiryDate: this.expiryDate,
        };

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    createBoleto = () => {
        this.showProgressDialog();
        let amount = parseFloat(this.state.boletoInfo.amount + "." + this.state.boletoInfo.decimal);
        let tariff = this.fetchTariff();
        let dateString = this.state.boletoInfo.expiryDate.split('T')[0] + "T00:00:00.000Z";
        ArbiApiService.createBoleto({ "expiryDate": dateString, "amount": amount }, PageNameJSON.input).then(
            response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processCreateBoletoResponse(response.result);
                    if (processedResponse.success) {
                        return this.setState({
                            creationState: "doc",
                            direction: "left",
                            info: {
                                "value": NewUtilities.parseSalary(this.state.boletoInfo.amount + "." + this.state.boletoInfo.decimal),
                                "number": processedResponse.number,
                                "doc": processedResponse.doc,
                                "expiryDate": moment(this.state.boletoInfo.expiryDate).format('DD/MM/YYYY'),
                                "tariff": tariff
                            }
                        });
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.retry_later
                        })
                    }
                } else {
                    let jsonObj = {};
                    if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                        jsonObj["error"] = true;
                        jsonObj["errorCode"] = response.status;
                        jsonObj["reason"] = "communication_issue";
                        this.setTransactionInfo(jsonObj);
                    } else if ('' + response.result.code === "14007") {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.invalid_expiry_date
                        })
                    } else {
                        let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                        this.setTransactionInfo(errorJson);
                    }
                }
            }
        );
    }

    setTransactionInfo = (transactionInfo) => {
        if (transactionInfo.error) {
            let jsonObj = {}
            jsonObj["title"] = localeObj.pay;
            jsonObj["header"] = localeObj.boleto_failed;
            switch (transactionInfo.reason) {
                case "technical_issue":
                    jsonObj["description"] = localeObj.pix_technical_issue;
                    break;
                case "generic_error":
                    jsonObj["description"] = localeObj.generic_error + " " + localeObj.generic_error_subtext
                    break;
                case "arbi_error":
                    jsonObj["description"] = transactionInfo.descriptor;
                    break;
                case "communication_issue":
                    jsonObj["description"] = localeObj.pix_communication_issue;
                    break;
                case "tariff_fetch_failed":
                    jsonObj["description"] = localeObj.tariff_failed;
                    break;
                default:
                    break;
            }
            this.setState({
                creationState: "error",
                direction: "left",
                errorJson: jsonObj
            })
        } else {
            let reviewInfo = {
                "amount": transactionInfo.amount,
                "decimal": transactionInfo.decimal,
                "receiver": {},
                "transferType": localeObj.deposit_gen
            }
            switch (this.state.creationState) {
                case "input":
                    reviewInfo["receiver"][localeObj.due_date] = moment(transactionInfo.expiryDate).format('DD/MM/YYYY')
                    reviewInfo["receiver"][localeObj.cpf] = GeneralUtilities.maskCpf(ImportantDetails.cpf)

                    this.setState({
                        boletoInfo: transactionInfo,
                        direction: "left",
                        reviewInfo: reviewInfo,
                        creationState: "review",
                    });
                    return;
                default:
                    break; 
            }
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.back();
        }
        this.showProgressDialog();
        ArbiApiService.getPixLimits(PageNameJSON.input).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResult = ArbiResponseHandler.processBoletoLimitResponse(response.result);
                if (processedResult.success) {
                    this.setState({
                        limit: processedResult.boletoLimit,
                        creationState: "input",
                        direction: "right"
                    })
                } else {
                    this.setState({
                        pinExpiredSnackBarOpen: true,
                        message: localeObj.retry_later
                    })
                }
            } else {
                let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                this.setTransactionInfo(errorJson);
            }
        });
    }

    confirmDate = (field) => {
        this.setState({
            expiryDateString: field.toLocaleDateString().split(',')[0],
            expiryDate: field,
            creationState: "input",
            direction: "left"
        })
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

    fetchTariff = () => {
        let jsonObject = {};
        jsonObject["amount"] = parseFloat(this.state.boletoInfo.amount + "." + this.state.boletoInfo.decimal);
        jsonObject["code"] = 4032; // Boleto generation code
        ArbiApiService.getTariff(jsonObject, PageNameJSON.input).then(response => {
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processTariffResponse(response.result);
                if (processorResponse.success) {
                    return processorResponse.tariff;
                }else{
                    let errorObj = {};
                    errorObj["error"] = true;
                    errorObj["reason"] = "tariff_fetch_failed";
                    this.setTransactionInfo(errorObj);
                    //Log.sDebug("Tariff failed");
                }
            } else {
                let errorObj = {};
                errorObj["error"] = true;
                errorObj["reason"] = "tariff_fetch_failed";
                this.setTransactionInfo(errorObj);
                //Log.sDebug("Tariff failed", PageNameJSON[this.state.creationState], constantObjects.LOG_PROD)
            }
        });
    }

    back = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricsService.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.back);
            switch (this.state.creationState) {
                case "input":
                    this.props.history.replace({
                        pathname: this.props?.location?.from !== PageNames.depositLandingPage ? "newWalletLaunch" : "/depositLandingComponent",
                        transition: "right"
                    });
                    break;
                case "date":
                    this.setState({
                        creationState: "input",
                        direction: "right"
                    })
                    break;
                case "review":
                    this.setState({
                        creationState: "input",
                        direction: "right"
                    })
                    break;
                case "doc":
                case "error":
                    this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
                    break;
                default:
                    break;
            }
        }
    }

    setCalender = (jsonObject) => {
        let reviewInfo = {
            "amount": jsonObject.amount,
            "decimal": jsonObject.decimal,
        }
        this.setState({
            creationState: "date",
            direction: "left",
            reviewInfo: reviewInfo
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    render() {
        const creation = this.state.creationState;

        const checkState = () => {
            if (creation === "input" || creation === "date") {
                return true
            } else {
                return false
            }
        }

        return (
            <div style={{ overflowX: "hidden" }}>
                {creation !== "error" &&
                    <div>
                        <ButtonAppBar header={creation === "review" ? localeObj.review_payment : localeObj.deposit} onBack={this.back} action="none" />
                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={checkState() ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div>
                        {creation === "input" && !this.state.processing &&
                            <AmountComponent requiredInfo={this.state.reviewInfo} feature="deposit" recieveField={this.setTransactionInfo} setCalender={this.setCalender}
                                btnText={moment(this.state.expiryDate).format('DD/MM/YYYY')} expiryDate={this.state.expiryDate} componentName={PageNameJSON.input} limit={this.state.limit}/>}
                        {creation === "date" && !this.state.processing && <CalenderPicker value={this.state.expiryDate} minDate={this.minimumExpiryTimeString} confirm={this.confirmDate}
                            maxDate={this.maximumExpiryTimeString} header={localeObj.generate_date_header} subtxt={localeObj.generate_date_subText} 
                            checkBox={localeObj.regular_payment} componentName={PageNameJSON.date}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "review" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "review" && <ReviewTemplate requiredInfo={this.state.reviewInfo} setTransactionInfo={this.createBoleto} back={this.back}
                            btnText={localeObj.next} header={localeObj.depositing} detailHeader={localeObj.boleto_info} componentName={PageNameJSON.review}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "doc" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "doc" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "doc" && <ReceiptComponent info={this.state.info} showMin={true} complete={this.back} componentName={PageNameJSON.doc}/>}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.back} componentName={PageNameJSON.error}/>}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        );
    }
}

BoletoGenerationComponent.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
}