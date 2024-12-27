import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from '../../../Themes/inputThemes';

import PageState from '../../../Services/PageState';
import PageNames from '../../../Services/PageNames';
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from '../../../Services/ArbiErrorResponsehandler';
import { withStyles } from "@material-ui/core/styles";

import GeneralUtilities from '../../../Services/GeneralUtilities';
import errorCodeList from '../../../Services/ErrorCodeList';
import logo from "../../../images/SpotIllustrations/Checkmark.png";
import SelectMenuOption from '../../CommonUxComponents/SelectMenuOption';
import PixErrorComponent from '../../CommonUxComponents/ErrorTemplate';
import ImageInformationComponent from '../../CommonUxComponents/ImageInformationComponent';
import ImportantDetails from '../../NewLaunchComponents/ImportantDetails';
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import ColorPicker from '../../../Services/ColorPicker';
import PropTypes from "prop-types";

const styles = InputThemes.singleInputStyle;
const pageName = PageNames.registerNewKey;
var localeObj = {};

class RegisterNewKeyComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pixPortabilityDetails: {},
            pixTransactionState: "key_selection",
            optionIndex: this.props.location ? this.props.location.keyType : "",
            blockBackButton: false
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(pageName);
    }

    changeBlockBackButton = (value) => {
        this.setState({ blockBackButton: value });
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        document.body.style.overflow = "scroll";
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

    onNext = (index) => {
        //Log.sDebug("user clicked " + index, "RegisterNewKey");

        this.setState({
            optionIndex: index
        })
        if (index === 0) {
            //phone number
            MetricServices.onPageTransitionStop(pageName, PageState.close);
            this.props.history.replace("/collectNewKeyDetailsComponent", {
                "key_type": GeneralUtilities.PIX_KEY_TYPES.PHONE_NUMBER,
                "key_index": localeObj.phone_number,
                "key_value": ""
            })
        } else if (index === 2) {
            //email
            MetricServices.onPageTransitionStop(pageName, PageState.close);
            this.props.history.replace("/collectNewKeyDetailsComponent", {
                "key_type": GeneralUtilities.PIX_KEY_TYPES.EMAIL,
                "key_index": localeObj.email,
                "key_value": ""
            })
        } else if (index === 3) {
            //CPF
            this.setState({
                bottom: true
            })
        } else {
            //EVP key
            this.showProgressDialog();
            ArbiApiService.createEvpPixKey(pageName).then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processCreateEvpPixKeyResponse(response.result);
                    if (processedResponse.success) {
                        this.handleArbiResponse("success", localeObj.key_registered_sucess, localeObj.type_key_registered_sucess_subtext);
                    } else {
                        let details = localeObj.retry_later;
                        if (processedResponse.details !== "") {
                            details = processedResponse.details;
                        }
                        this.handleArbiResponse("failed", localeObj.key_registered_failure, details);
                    }
                } else {
                    this.handleArbiResponse("failed", localeObj.key_registered_failure, localeObj.tryAgainLater);
                }
            });
        }
    }

    startCreatingCpfPixKey = () => {
        this.setState({
            bottom: false
        })
        this.showProgressDialog();
        ArbiApiService.getPixKeyDetails(ImportantDetails.cpf, pageName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let repsonseHandler = ArbiResponseHandler.processGetPixKeyDetailsResponse(response.result, ImportantDetails.cpf, localeObj);
                if (repsonseHandler.success) {
                    this.setState({
                        "pixPortabilityDetails": {
                            "pixKeyType": repsonseHandler.pixKeyDetails.pixKeyType,
                            "pixKey": repsonseHandler.pixKeyDetails.pixKey,
                            "institution": repsonseHandler.pixKeyDetails.institute,
                            "claimType": 2 // its cpf, so claim type is portability
                        },
                        bottomSheet: true
                    });
                } else {
                    let errorMessageToUser = localeObj.retry_later;
                    this.handleArbiResponse("failed", localeObj.key_registered_failure, errorMessageToUser);
                }
            } else {
                if (response.result.code === errorCodeList.PIX_KEY_NOT_FOUND
                    || response.result.code === errorCodeList.NO_KEY_FOUND_FOR_PARAMS) {
                    this.createCpfPixKey();
                } else {
                    let errorMessageToUser = localeObj.retry_later;
                    this.handleArbiResponse("failed", localeObj.key_registered_failure, errorMessageToUser);
                }
            }
        });
    }

    createCpfPixKey = () => {
        //CPF
        this.showProgressDialog();
        ArbiApiService.createCpfPixKey(pageName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processCpfSetUpPixKeyResponse(response.result);
                if (processedResponse.success) {
                    this.handleArbiResponse("success", localeObj.key_registered_sucess, localeObj.type_key_registered_sucess_subtext);
                } else {
                    let details = localeObj.retry_later;
                    if (processedResponse.details !== "") {
                        details = processedResponse.details;
                    }
                    this.handleArbiResponse("failed", localeObj.key_registered_failure, details);
                }
            } else {
                let errorMessageToUser = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                this.handleArbiResponse("failed", localeObj.key_registered_failure, errorMessageToUser);
            }
        });
    }

    handleArbiResponse = (status, title, text) => {
        if (status === "failed") {
            let jsonObj = {}
            jsonObj["title"] = localeObj.pix;
            jsonObj["header"] = title;
            jsonObj["description"] = text;
            this.setState({
                pixTransactionState: "error",
                pixErrorJson: jsonObj
            })
        } else {
            this.setState({
                pixTransactionState: "success",
                description: text
            })
        }
    }

    onBack = () => {
        MetricServices.onPageTransitionStop(pageName, PageState.back);
        ImportantDetails.fromRegisterPixKey = true;
        if (this.props.from === "creditCard") {
            this.props.onBack();
        } else if (this.props.location && this.props.location.from
            && this.props.location.from === "depositPage") {
            this.props.history.replace({ pathname: "/depositLandingComponent", transition: "right" });
        } else if (this.props.location && this.props.location.from
            && this.props.location.from === "landingPage") {
            this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
        } else if (this.props.location && this.props.location.from
            && this.props.location.from === "pixOnboarding") {
            this.props.history.replace({ pathname: "/pixLandingComponent", transition: "right" });
        } else {
            if (!this.state.blockBackButton) {
                this.props.history.replace({ pathname: "/myPixKeysComponent", transition: "right" });
            }
        }
    }

    registerSuccess = () => {
        ImportantDetails.fromRegisterPixKey = true;
        this.props.history.replace({ pathname: "/myPixKeysComponent", transition: "right" });
    }

    backHome = () => {
        MetricServices.onPageTransitionStop(pageName, PageState.back);
        ImportantDetails.fromRegisterPixKey = true;
        if (this.props.from === "creditCard") {
            this.props.onBack();
        } else {
            this.props.history.replace("/pixLandingComponent")
        }

    }

    startPortability = () => {
        //Log.sDebug("startPortability", this.componentName);
        let payloadToBesent = {
            "key_type": GeneralUtilities.PIX_KEY_TYPES.CPF,
            "value": "",
            "claimType": this.state.pixPortabilityDetails["claimType"]
        }
        //Log.sDebug("show Portability Instructions screen for " + JSON.stringify(payloadToBesent), this.componentName);
        MetricServices.onPageTransitionStop(pageName, PageState.close);
        this.props.history.replace("/portabilityConfirmationComponent", payloadToBesent);
    }

    handleClose = () => {
        this.setState({ bottomSheet: false });
        MetricServices.onPageTransitionStop(pageName, PageState.close);
        this.props.history.replace({ pathname: "/myPixKeysComponent", transition: "right" });
        return;
    }

    handleCpfClose = () => {
        this.setState({ bottom: false })
    }

    selectKeyType = (type) => {
        if (type === "EVP") {
            return localeObj.evp_key;
        } else if (type === "PHONE") {
            return localeObj.phone_number;
        } else if (type === "EMAIL") {
            return localeObj.email;
        } else if (type === "CPF") {
            return localeObj.cpf;
        } else {
            return type;
        }
    }

    render() {
        const { classes } = this.props;
        const currentState = this.state.pixTransactionState;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        return (
            <div style={{ overflowX: "hidden" }}>
                <div style={{ display: (currentState === "key_selection" && !this.state.processing ? 'block' : 'none') }}>
                    <ButtonAppBar header={localeObj.register_new_key} onBack={this.onBack} action="none" />
                    {!this.state.bottomSheet && !this.state.bottom &&
                        <SelectMenuOption type="Keys" header={localeObj.register_new_key_title} recieveField={this.onNext} changeBlockBackButton={this.changeBlockBackButton} value={this.state.optionIndex} />
                    }
                </div>
                <div style={{ display: (currentState === "error" && !this.state.processing ? 'block' : 'none') }}>
                    {currentState === "error" && <PixErrorComponent errorJson={this.state.pixErrorJson} onClick={this.backHome} />}
                </div>
                <div style={{ display: (currentState === "success" && !this.state.processing ? 'block' : 'none') }}>
                    {currentState === "success" &&
                        <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight, overflowY: "hidden" }}>
                            {
                                this.props.from === "creditCard" ?
                                    <ImageInformationComponent type="FinalPage" header={localeObj.key_registered_sucess} btnText={localeObj.back_home}
                                        description={this.state.description} next={this.registerSuccess} icon={logo} appBar={false} />
                                    :
                                    <ImageInformationComponent type="FinalPage" header={localeObj.key_registered_sucess} btnText={localeObj.my_keys}
                                        description={this.state.description} next={this.registerSuccess} close={this.backHome} secBtnText={localeObj.back_home} icon={logo} appBar={false} />


                            }


                        </div>
                    }
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>

                <Drawer
                    anchor="bottom"
                    open={this.state.bottomSheet}
                    onClose={this.handleClose}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    classes={{ paper: classes.paper }}
                    style={{ backgroundColor: ColorPicker.surface3 }}
                >
                    <div style={{ margin: "1.5rem" }}
                        onKeyDown={this.handleClose}>
                        <div style={{ marginTop: "0.5rem", textAlign: 'center' }}>
                            <span className="headline6 highEmphasis" >
                                {this.state.pixPortabilityDetails.claimType === 1 ? localeObj.ownership_key_title : localeObj.portability_key_title}
                            </span>
                        </div>
                        <div style={{ marginTop: "1rem", textAlign: 'center' }}>
                            <span className="body2 highEmphasis">
                                {this.state.pixPortabilityDetails.claimType === 1 ? localeObj.ownership_key_description : localeObj.portability_key_description}
                            </span>
                        </div>
                        <div style={{ marginTop: "1.5rem", textAlign: 'center' }}>
                            <span className="subtitle2 highEmphasis">
                                {this.selectKeyType(this.state.pixPortabilityDetails.pixKeyType)}
                            </span>
                        </div>
                        <div style={{ marginTop: "1rem", textAlign: 'center' }}>
                            <span className="body2 highEmphasis">
                                {this.state.pixPortabilityDetails.pixKey}
                            </span>
                        </div>

                        <div style={{ marginTop: "1.5rem", textAlign: 'center' }}>
                            <span className="subtitle2 highEmphasis">
                                {localeObj.Institution}
                            </span>
                        </div>
                        <div style={{ marginTop: "1rem", textAlign: 'center' }}>
                            <span className="body2 highEmphasis">
                                {this.state.pixPortabilityDetails.institution}
                            </span>
                        </div>
                        <div style={{ width: "100%", margin: "1.5rem 0", textAlign: 'center' }}>
                            <PrimaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.start_portability} onCheck={this.startPortability} />
                            <SecondaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.cancel} onCheck={this.handleClose} />
                        </div>
                    </div>
                </Drawer>
                <Drawer
                    anchor="bottom"
                    open={this.state.bottom}
                    onClose={this.handleCpfClose}
                    disableDiscovery={true}
                    disableSwipeToOpen={true}
                    classes={{ paper: classes.paper }}>
                    <div onKeyDown={this.handleCpfClose} style={{ margin: "1.5rem" }} >
                        <div style={{ marginTop: "0.5rem", textAlign: 'center' }} >
                            <span className="headline6 highEmphasis">
                                {localeObj.key_visibility}
                            </span>
                        </div>
                        <div style={{ marginTop: "1rem", textAlign: 'center' }}>
                            <span className="body2 mediumEmphasis">
                                {localeObj.visibility_info}
                            </span>
                        </div>
                        <div style={{ marginTop: "1.5rem", textAlign: 'center' }}>
                            <span className="subtitle2 highEmphasis">
                                {localeObj.name}
                            </span>
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <span className="body2 mediumEmphasis">
                                {ImportantDetails.userName}
                            </span>
                        </div>
                        <div style={{ marginTop: "1.5rem", textAlign: 'center' }}>
                            <span className="subtitle2 highEmphasis">
                                {localeObj.cpf}
                            </span>
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <span className="body2 mediumEmphasis">
                                {GeneralUtilities.maskCpf(ImportantDetails.cpf)}
                            </span>
                        </div>

                        <div style={{ marginTop: "1.5rem", textAlign: 'center' }}>
                            <span className="subtitle2 highEmphasis">
                                {localeObj.Institution}
                            </span>
                        </div>
                        <div style={{textAlign: 'center'}}>
                            <span className="body2 mediumEmphasis">
                                {localeObj.bank_name}
                            </span>
                        </div>
                        <div style={{ marginTop: "1rem" }}>
                            <span className="body2 mediumEmphasis">
                                {localeObj.visibility_desc}
                            </span>
                        </div>
                        <div style={{ width: "100%", marginTop: "1.5rem", textAlign: 'center' }}>
                            <PrimaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.motopay_continue} onCheck={this.startCreatingCpfPixKey} />
                            <SecondaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.cancel} onCheck={this.handleCpfClose} />
                        </div>
                    </div>
                </Drawer>
            </div>
        );
    }
}
export default withStyles(styles)(RegisterNewKeyComponent);

RegisterNewKeyComponent.propTypes = {
    location: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    from: PropTypes.string,
    onBack: PropTypes.func
};