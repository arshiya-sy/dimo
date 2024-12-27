import React from "react";
import "../../styles/main.css";
import PropTypes from "prop-types";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import InformationPage from "../CommonUxComponents/ImageInformationComponent";
import logo from "../../images/SpotIllustrations/Checkmark.png";
import PageNames from "../../Services/PageNames";
import GeneralUtilities from "../../Services/GeneralUtilities";
import ClientCreationJson from "../../Services/ClientCreationJson";
import MetricsService from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";

import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import InputThemes from "../../Themes/inputThemes";
import constantObjects from "../../Services/Constants";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from '@material-ui/core/styles';

var localeObj = {};

export default class ValidateEmailComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            processing: false
        }
        this.next = this.next.bind(this);
        this.componentName = PageNames.validating;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.remind();
        }
    }

    next = () => {
        androidApiCalls.openEmail();
        MetricsService.onPageTransitionStop(this.componentName, PageState.close);
        this.props.history.replace("/newLogin");
    }

    remind = () => {
        MetricsService.onPageTransitionStop(this.componentName, PageState.close);
        if (androidApiCalls.checkIfMpOnly()) {
            window.Android.closeWindow();
        } else {
            androidApiCalls.openHY();
        }
    }

    resend = () => {
        this.showProgressDialog();
        ArbiApiService.confirmEmailId(this.componentName)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let repsonseHandler = ArbiResponseHandler.processEmailIdResponse(response.result);
                    if (repsonseHandler.success) {
                        this.setState({
                            snackBarOpen: true,
                            message: repsonseHandler.message
                        })
                    }
                }
            })
    }

    help = () => {
        GeneralUtilities.openHelpSection();
        MetricsService.onPageTransitionStop(this.componentName, PageState.close);
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

    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        return (
            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                <div style={{ display: this.state.processing ? 'none' : 'block' }}>
                    <div style={{ marginTop: "3rem" }}>
                        <InformationPage icon={logo} appBar={false} header={localeObj.verify_mail} onCancel={this.help}
                            description={GeneralUtilities.formattedString(localeObj.validate_mail_description, [GeneralUtilities.maskEmailId(ClientCreationJson.email)])}
                            btnText={localeObj.go_email} next={this.next} type={this.componentName} footer={localeObj.help}
                            secBtnText={localeObj.fgts_anticipate_token_resend} close={this.resend} />
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

ValidateEmailComponent.propTypes = {
    history: PropTypes.object
}