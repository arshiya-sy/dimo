import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from "@material-ui/core/styles";
import ColorPicker from '../../../Services/ColorPicker';
import InputThemes from '../../../Themes/inputThemes';
import PageState from '../../../Services/PageState';
import PageNames from '../../../Services/PageNames';
import MetricServices from "../../../Services/MetricsService";
import ArbiApiService from '../../../Services/ArbiApiService';
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponsehandler from '../../../Services/ArbiErrorResponsehandler';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import { ERROR_IN_SERVER_RESPONSE } from '../../../Services/httpRequest';
import localeService from '../../../Services/localeListService';
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import constantObjects from '../../../Services/Constants';
import PropTypes from "prop-types";

const theme2 = InputThemes.snackBarTheme;
const pageName = PageNames.confirmPortability;
var localeObj = {};

export default class PortabilityConfirmationComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            key_type: this.props.location.state.key_type,
            value: this.props.location.state.value,
            claimType: this.props.location.state.claimType,
            snackBarOpen: false
        }

        this.styles = {
            item: {
                margin: "1.5rem"
            },
            description: {
                margin: "0 1.5rem",
                color: ColorPicker.highEmphasis
            },
            subDescription: {
                marginTop: "1.5rem"
            }
        }
        this.componentName = PageNames.confirmPortability;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(pageName)
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.onBack();
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(pageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(pageName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    proceedClaimingPixKey = () => {

        //Log.sDebug("token sent at " + new Date(), PageNames.confirmPortability);

        if (this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.CPF) {
            this.sendRequestForCpfPortability();
            return;
        }

        this.showProgressDialog();
        ArbiApiService.sendTokenToPixKey(this.state.value, pageName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let payloadToBesent = {
                    "key_type": this.state.key_type,
                    "value": this.state.value,
                    "type": 2,
                    "claimType": this.state.claimType
                }
                MetricServices.onPageTransitionStop(pageName, PageState.close);
                this.props.history.replace("/otpConfirmationComponent", payloadToBesent);

            } else {
                let errorMessageToUser = localeObj.retry_later;
                if (response.result !== ERROR_IN_SERVER_RESPONSE) {
                    if (response.result.message == this.VALIDATION_ERROR) {
                        errorMessageToUser = localeObj.validation_error;
                    } else {
                        errorMessageToUser = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    }
                }
                this.openSnackBar(errorMessageToUser);
            }
        });
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

    sendRequestForCpfPortability = () => {
        this.showProgressDialog();
        ArbiApiService.portCpfPixKey(pageName).then((response) => {
            this.hideProgressDialog();
            let messageToUser = localeObj.retry_later;
            if (response.success) {
                let repsonseHandler = ArbiResponseHandler.processPixClaimResponse(response.result);
                if (repsonseHandler.success) {
                    messageToUser = localeObj.ownership_request_successful;
                }
            } else {
                messageToUser = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
            }
            //Log.sDebug(`sent a request for cpf portability ${messageToUser}`, this.componentName);
            MetricServices.onPageTransitionStop(pageName, PageState.close);
            this.props.history.replace({ pathname: "/myPixKeysComponent", showSnackBar: true, snackBarDescription: messageToUser });
        });
    }


    onBack = () => {
        MetricServices.onPageTransitionStop(pageName, PageState.back);
        if (this.state.key_type === GeneralUtilities.PIX_KEY_TYPES.CPF) {
            this.props.history.replace({ pathname: "/registerNewKeyComponent", transition: "right" });
        } else {
            this.props.history.replace("/collectNewKeyDetailsComponent",
                {
                    "key_type": this.state.key_type,
                    "key_value": this.state.value
                })
        }

    }

    render() {
        return (
            <div>
                <ButtonAppBar header={localeObj.portbaility_confirmation_title} onBack={this.onBack}
                    action="none" />

                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <span className="headline5 highEmphasis" style={this.styles.title}>
                            {localeObj.portbaility_confirmation_subtitle}
                        </span>
                    </div>
                    <div style={this.styles.description}>
                        <ol>
                            <li className="body2 highEmphasis">
                                {this.state.claimType === 1 ? localeObj.ownership_confirmation_desc1 : localeObj.portbaility_confirmation_desc1}
                            </li>
                            <li className="body2 highEmphasis" style={this.styles.subDescription}>
                                {this.state.claimType === 1 ? localeObj.ownership_confirmation_desc2 : localeObj.portbaility_confirmation_desc2}
                            </li>
                            <li className="body2 highEmphasis" style={this.styles.subDescription}>
                                {this.state.claimType === 1 ? localeObj.ownership_confirmation_desc3 : localeObj.portbaility_confirmation_desc3}
                            </li>
                        </ol>
                    </div>
                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                        <PrimaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.confirm_portability} onCheck={this.proceedClaimingPixKey} />
                    </div>
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

        )
    }
}


PortabilityConfirmationComponent.propTypes = {
    location: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};