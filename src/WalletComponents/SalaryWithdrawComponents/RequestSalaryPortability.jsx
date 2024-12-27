import React from "react";
import PropTypes from "prop-types";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import localeService from "../../Services/localeListService";
import { CSSTransition } from 'react-transition-group';
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import GeneralUtilities from "../../Services/GeneralUtilities";

import DetailFormComponent from "../OnBoardingSupportComponents/DetailFormComponent";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import face from "../../images/SpotIllustrations/Face.png";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import { AuthStateContext } from "../../ContextProviders/AuthProvider";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";

import constantObjects from "../../Services/Constants";
import ReviewComponent from "./WithdrawSupportComponents/WithdrawReview";
import ListAllBankComp from "./WithdrawSupportComponents/ListAllBankComp";
import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";
import SetPinComponent from "../CommonUxComponents/InputPinPage";

const theme1 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.SalaryPortabilityRequest;
var localeObj = {};

class RequestSalaryPortability extends React.Component {

    static contextType = AuthStateContext;

    constructor(props) {
        super(props);
        this.state = {
            creationState: "initial",
            name: "",
            direction: "",
            cnpj: ""
        };
        this.setField = this.setField.bind(this);
        this.onBack = this.onBack.bind(this);
        this.componentName = "RequestSalaryPortability";
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        this.setState({
            header: localeObj.salary_portability,
            creationState: "cnpj"
        })

        if (this.props.location && this.props.location.valueRequests) {
            this.setState({
                name: this.props.location.valueRequests.name,
                cnpj: this.props.location.valueRequests.cnpj,
                receiverInstitute: this.props.location.valueRequests.bank
            })
        }

        window.onBackPressed = () => {
            if (this.state.open) {
                this.setState({ open: false });
            } else {
                this.onBack();
            }
        }
    }

    setField = (field) => {
        switch (this.state.creationState) {
            case "cnpj":
                return this.setState({
                    cnpj: field,
                    creationState: "company",
                    direction: "left"
                })
            case "company":
                return this.setState({
                    name: field,
                    creationState: "bank",
                    direction: "left"
                })
            case "bank":
                return this.setState({
                    bank: field["code"],
                    receiverInstitute: field["receiverInstitute"],
                    receiverIspb: field["receiverIspb"],
                    creationState: "review",
                    header: localeObj.review_payment,
                    direction: "left"
                })
            case "review":
                return this.setState({
                    token: field,
                    creationState: "pin",
                    direction: "left",
                    header: localeObj.pix_authentication
                })
            case "pin":
                this.requestPortability(field);
                return
            default:
        }
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

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    openEmail = () => {
        androidApiCalls.openEmail();
    }

    requestPortability = (token) => {
        this.showProgressDialog();
        let jsonObject = {};
        jsonObject["name"] = this.state.name;
        jsonObject["cnpj"] = this.state.cnpj;
        jsonObject["bank"] = this.state.bank;
        jsonObject["token"] = token;

        arbiApiService.requestSalaryPortability(jsonObject, PageNameJSON.review)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processRequestPortability(response.result);
                    if (processorResponse.success) {
                        return this.setState({
                            creationState: "success",
                            header: localeObj.salary_portability,
                            direction: "left"
                        })
                    } else {
                        this.openSnackBar(processorResponse.message);
                    }
                } else {
                    let jsonObj = {}
                    jsonObj["title"] = localeObj.salary_portability;
                    jsonObj["header"] = localeObj.failedToProcess;
                    jsonObj["description"] = response.result.message;
                    return this.setState({
                        errorJson: jsonObj,
                        creationState: "error",
                        direction: "left"
                    })
                }
            })
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action,
            })
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.back);
            switch (this.state.creationState) {
                case "cnpj":
                    if (this.props.location && this.props.location.fromComponent) {
                        return this.props.history.replace({
                            pathname: '/salaryPortability',
                            transition: "right",
                            "fromComponent": this.props.location.fromComponent
                        })
                    } else {
                        return this.props.history.replace({
                            pathname: '/salaryPortability',
                            transition: "right"
                        })
                    }
                case "company":
                    return this.setState({
                        creationState: "cnpj",
                        direction: "right",
                    })
                case "bank":
                    return this.setState({
                        creationState: "company",
                        direction: "right",
                    })
                case "review":
                    return this.setState({
                        creationState: "bank",
                        direction: "right",
                        header: localeObj.salary_portability
                    })
                case "pin":
                    return this.setState({
                        creationState: "review",
                        direction: "right",
                        header: localeObj.review_payment
                    })
                case "success":
                case "error":
                    this.goToLaunchPage();
                    return
                default:
            }
        }
    }

    goToLaunchPage = () => {
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    render() {
        const creation = this.state.creationState;
        return (
            <div style={{ overflowX: "hidden" }}>
                {creation !== "error" &&
                    <div>
                        <ButtonAppBar header={this.state.header} onBack={this.onBack} action="none" />
                    </div>}
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "cnpj" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "cnpj" && !this.state.processing) ? 'block' : 'none' }}>
                        {creation === "cnpj" && <DetailFormComponent header={localeObj.cnpj_header} description={localeObj.cnpj_desc} field={localeObj.cnpj}
                            recieveField={this.setField} type="tel" value={this.state.cnpj} componentName={PageNameJSON.cnpj} firstBtn={localeObj.salary_next} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "company" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "company" && !this.state.processing) ? 'block' : 'none' }}>
                        {creation === "company" && <DetailFormComponent header={localeObj.company_header}
                            description={localeObj.company_desc} field={localeObj.social_reason} recieveField={this.setField} value={this.state.name}
                            componentName={PageNameJSON.name} firstBtn={localeObj.salary_next} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "bank" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "bank" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "bank" && <ListAllBankComp confirm={this.setField} componentName={PageNameJSON.bank} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "review" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "review" && <ReviewComponent cnpj={this.state.cnpj} name={this.state.name} bankName={this.state.receiverInstitute}
                            confirm={this.setField} componentName={PageNameJSON.review} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "pin" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "pin" && <SetPinComponent confirm={this.setField} componentName={PageNameJSON.pin} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "success" && !this.state.processing ? 'block' : 'none') }}>
                        <ImageInformationComponent header={localeObj.anticipate_success_header} icon={face} appBar={false}
                            description={localeObj.anticipate_success_description} btnText={localeObj.go_email} subText={localeObj.anticipate_success_subText}
                            next={this.openEmail} />
                    </div >
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.goToLaunchPage} componentName={PageNameJSON.error} />}
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
            </div>
        );
    }
}
RequestSalaryPortability.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  }
export default withStyles(styles)(RequestSalaryPortability);