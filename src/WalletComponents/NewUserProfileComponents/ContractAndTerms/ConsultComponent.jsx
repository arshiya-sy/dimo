import React from "react";
import PropTypes from "prop-types";
import "../../../styles/main.css";

import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';

import { MuiThemeProvider } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import InputThemes from "../../../Themes/inputThemes";
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";
import PrivacyPortuguese2024 from '../../../PrivacyFiles/Privacy_pt_2024';

import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent"
import TermsTempalte from "../ContractAndTerms/TermsTemplate"
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import Log from "../../../Services/Log";
import constantObjects from "../../../Services/Constants";
import MetricsService from "../../../Services/MetricsService";

const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

class ConsultTerms extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: "Waiting",
            contarctState: this.props.location.state.chosen,
            header: "",
            terms: "",
            snackBarOpen: false,
            message: "",
            componentName: "",
            subDeepLink: false
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
    }

    componentDidMount = () => {
        androidApiCalls.enablePullToRefresh(false);
        this.setState({
            componentName: PageNames.contractAndTermsComponent.select_contract
        })
        window.onBackPressed = () => {
            MetricsService.onPageTransitionStop(this.state.componentName, PageState.back);
            this.props.history.replace({ pathname: "/contractsAndTerms", transition: "right" });
        }

        if (this.state.contarctState === "privacy") {
            Log.sDebug("Rendering Privacy Terms", "ContractComponent");
            this.getPrivacyData();
        } else if (this.state.contarctState === "generic") {
            Log.sDebug("Rendering Generic Terms", "ContractComponent");
            this.genericTermsRendering();
        } else if (this.state.contarctState === "tor") {
            Log.sDebug("Rendering Terms of Residence", "ContractComponent");
            this.addressTermsRendering();
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    getPrivacyData = () => {
        Log.sDebug("Fetching Privacy Data", "ContractComponent");
        let event = {
            eventType: constantObjects.privacy,
            page_name: PageNames.contractAndTermsComponent.select_contract,
        };
        MetricsService.reportActionMetrics(event, new Date().getTime());
        this.setState({
            header: localeObj.privacy_policy,
            //terms: <PrivacyEnglish/>,
            componentName: PageNames.contractAndTermsComponent.display_privacy,
            terms: androidApiCalls.getLocale() === "en_US" ? <PrivacyPortuguese2024 /> : <PrivacyPortuguese2024 />,
            status: "component"
        })
    }

    genericTermsRendering = () => {
        Log.sDebug("Fetching Generic Terms", "ContractComponent");
        this.showProgressDialog();
        let event = {
            eventType: constantObjects.tos,
            page_name: PageNames.contractAndTermsComponent.select_contract,
        };
        MetricsService.reportActionMetrics(event, new Date().getTime());
        arbiApiService.getTOS(PageNames.contractAndTermsComponent.display_tos).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processGetTosResponse(response.result);
                    if (processorResponse.success) {
                        this.setState({
                            terms: processorResponse.tos,
                            header: localeObj.Account_open,
                            status: "component",
                            componentName: PageNames.contractAndTermsComponent.display_tos,
                        })
                        return;
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.tryAgainLater
                        })
                        return;
                    }
                } else {
                    let errorMessage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj)
                    this.setState({
                        snackBarOpen: true,
                        message: errorMessage
                    })
                    return;
                }
            })
    }

    addressTermsRendering = () => {
        Log.sDebug("Fetching Terms of residence", "ContractComponent");
        this.showProgressDialog();
        let event = {
            eventType: constantObjects.tor,
            page_name: PageNames.contractAndTermsComponent.select_contract,
        };
        MetricsService.reportActionMetrics(event, new Date().getTime());
        arbiApiService.getTOA(PageNames.contractAndTermsComponent.display_toa).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processGetToaResponse(response.result);
                    if (processorResponse.success) {
                        this.setState({
                            terms: processorResponse.toa,
                            header: localeObj.tor,
                            status: "component",
                            componentName: PageNames.contractAndTermsComponent.display_toa,
                        })
                        return;
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.tryAgainLater
                        })
                        return;
                    }
                } else {
                    let errorMessage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj)
                    this.setState({
                        snackBarOpen: true,
                        message: errorMessage
                    })
                    return;
                }
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


    render() {

        const onBack = () => {
            MetricsService.onPageTransitionStop(this.state.componentName, PageState.back);
            this.props.history.replace({ pathname: "/contractsAndTerms", transition: "right", "subDeepLink": this.props.location.subDeepLink });
        }
        const loadingState = this.state.status;
        return (

            <div style={{ overflowX: "hidden" }}>
                <ButtonAppBar header={(this.state.contarctState === "privacy" ? localeObj.privacy_policy : this.state.header)} onBack={onBack} action="none" />
                <div style={{ display: (loadingState === "component" && !this.state.processing ? 'block' : 'none') }}>
                    {loadingState === "component" && <TermsTempalte type={this.state.contarctState} header={this.state.header} terms={this.state.terms} componentName={this.state.componentName} />}
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

ConsultTerms.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    classes: PropTypes.object.isRequired
};

export default ConsultTerms;
