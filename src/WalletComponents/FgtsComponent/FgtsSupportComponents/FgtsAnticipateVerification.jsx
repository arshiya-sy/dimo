import React from "react";
import PropTypes from "prop-types";

import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import ColorPicker from "../../../Services/ColorPicker";
import httpRequest from "../../../Services/httpRequest";
import constantObjects from "../../../Services/Constants";
import arbiApiService from "../../../Services/ArbiApiService";
import MetricsService from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponseHandler from '../../../Services/ArbiErrorResponsehandler';

import CircleCheckedFilled from '@material-ui/icons/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { withStyles } from "@material-ui/core/styles";

import "../../../styles/main.css";
import "../../../styles/lazyLoad.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";
import InputThemes from "../../../Themes/inputThemes";

import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import CustomizedProgressBars from "../../CommonUxComponents/LargeprogressComponent";
import success from "../../../images/SpotIllustrations/Checkmark.png";
import FlexView from "react-flexview";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";

var localeObj = {};
const PageNameJSON = PageNames.FgtsAnticipate;

class FGTSAnticipateVerification extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: "0",
            message: "",
            processing: true,
            showDetails: false,
            snackBarOpen: false,
            anticipateLoader: false,
            firstStageComplete: false,
            secondStageComplete: false,
            thirdStageComplete: false,
        };
        this.styles = {
            imgStyleMore: {
                borderRadius: "50%",
                height: "3rem",
                width: "3rem",
                verticalAlign: "middle",
                justifySelf: 'center',
                alignSelf: 'center'
            },
            listStyleSelect: {
                margin: "1rem",
                display: "flex",
                alignItems: 'center',
                justifyContent: "left",
                flexDirection: "row",
            }
        }

        this.componentName = GeneralUtilities.emptyValueCheck(this.props.componentName) ? "FGTS ANTICIPATION" : this.props.componentName
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
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

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        if (!this.props.apiStatus) {
            this.timeoutHandleOne = setTimeout(() => {
                this.setState({
                    firstStageComplete: true
                });
            }, 1000);
            this.timeoutHandleFour = setTimeout(() => {
                MetricsService.onPageTransitionStop(this.componentName, PageState.stop);
                this.props.setTransactionInfo(this.props.anticipatationNextStage);
            }, 4000);
            if (this.props.anticipatationNextStage === "account_error" ||
                this.props.anticipatationNextStage === "arbi_not_registered") {
                this.timeoutHandleTwo = setTimeout(() => {
                    this.setState({
                        secondStageComplete: true
                    });
                }, 2000);
            }
            if (this.props.anticipatationNextStage === "arbi_not_registered") {
                this.timeoutHandleThree = setTimeout(() => {
                    this.setState({
                        thirdStageComplete: true,
                    });
                }, 3000);
            }
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    goToFgtsHomePage = () => {
        this.props.onCancel();
    }

    goToFgtsVideoTutorial = () => {
        this.props.setTransactionInfo(this.props.anticipatationNextStage);
    }

    setAction = () => {
        this.setState({
            anticipateLoader: true
        });
    }

    defineValue = () => {
        MetricsService.onPageTransitionStop(this.componentName, PageState.stop);
        this.props.newValue();
    }

    render() {
        return (
            <div>
                {this.props.apiStatus &&
                    <FlexView column style={{
                        position: "relative",
                        textAlign: "center",
                        paddingTop: "12rem"
                    }}>
                        {<CustomizedProgressBars></CustomizedProgressBars>}
                        <span className="headline9 highEmphasis" style={{ marginTop: "6rem", textAlign: "center" }}>{localeObj.fgts_hangin}</span>
                        <span className="body2 highEmphasis" style={{ marginTop: "2rem", textAlign: "center" }}>{localeObj.fgts_incontact_caixa}</span>
                    </FlexView>}
                {!this.props.apiStatus &&
                    <FlexView column style={{
                        position: "relative",
                        textAlign: "center",
                        paddingTop: "12rem"
                    }}>
                        {<CustomizedProgressBars></CustomizedProgressBars>}
                        <span className="headline9 highEmphasis" style={{ marginTop: "6rem", textAlign: "center" }}>{localeObj.fgts_hangin}</span>
                        <span className="body2 highEmphasis" style={{ marginTop: "2rem", textAlign: "center" }}>{localeObj.fgts_incontact_caixa}</span>
                        <div>
                            <div style={{ ...this.styles.listStyleSelect, textAlign: "center" }}>
                                <div style={this.styles.imgStyleMore} >
                                    {(this.props.anticipatationNextStage === "account_error" || this.props.anticipatationNextStage === "arbi_not_registered") &&
                                        <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: this.state.firstStageComplete ? ColorPicker.transactionGreen : ColorPicker.disableBlack }} />}
                                    {this.props.anticipatationNextStage === "no_sufficent_balance" && !this.state.firstStageComplete &&
                                        <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.disableBlack }} />}
                                    {this.props.anticipatationNextStage === "no_sufficent_balance" && this.state.firstStageComplete &&
                                        <CancelIcon style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.errorRed }} />}
                                </div>
                                <div className="body1" style={{ marginLeft: "0.5rem", marginTop: "0.5rem", color: (this.state.firstStageComplete && this.props.anticipatationNextStage === "no_sufficent_balance") ? ColorPicker.errorRed : (this.state.firstStageComplete ? ColorPicker.white : ColorPicker.disableBlack), textAlign: "left" }}>
                                    <span>{localeObj.searching_fgts_balance}</span>
                                </div>
                            </div>
                            <div style={{ ...this.styles.listStyleSelect, textAlign: "center" }}>
                                <div style={this.styles.imgStyleMore} >
                                    {(this.props.anticipatationNextStage === "arbi_not_registered") &&
                                        <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: this.state.secondStageComplete ? ColorPicker.transactionGreen : ColorPicker.disableBlack }} />}
                                    {this.props.anticipatationNextStage === "account_error" && !this.state.secondStageComplete &&
                                        <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.disableBlack }} />}
                                    {this.props.anticipatationNextStage === "account_error" && this.state.secondStageComplete &&
                                        <CancelIcon style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.errorRed }} />}
                                </div>
                                <div className="body1" style={{ marginLeft: "0.5rem", marginTop: "0.5rem", color: (this.state.thirdStageComplete && this.props.anticipatationNextStage === "account_error") ? ColorPicker.errorRed : (this.state.secondStageComplete ? ColorPicker.white : ColorPicker.disableBlack), textAlign: "left" }}>
                                    <span>{localeObj.fgts_anticipation_enabled}</span>
                                </div>
                            </div>
                            <div style={{ ...this.styles.listStyleSelect, textAlign: "center" }}>
                                <div style={this.styles.imgStyleMore} >
                                    {!this.state.thirdStageComplete &&
                                        <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.disableBlack }} />}
                                    {this.props.anticipatationNextStage === "arbi_not_registered" && this.state.thirdStageComplete &&
                                        <CancelIcon style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.errorRed }} />}
                                </div>
                                <div className="body1" style={{ marginLeft: "0.5rem", marginTop: "0.5rem", color: (this.state.thirdStageComplete && this.props.anticipatationNextStage === "arbi_not_registered") ? ColorPicker.errorRed : (this.state.thirdStageComplete ? ColorPicker.white : ColorPicker.disableBlack), textAlign: "left" }}>
                                    <span>{localeObj.fgts_arbi_authorized}</span>
                                </div>
                            </div>
                        </div>
                    </FlexView>}
                {/* <div style={{ display: (this.props.anticipatationNextStage === "anticipate_success" && this.state.thirdStageComplete) ? "none" : 'block', marginTop: "72%", textAlign: "center" }}>
                    {<CustomizedProgressBars></CustomizedProgressBars>}
                </div>
                <div style={{ textAlign: "center" }}>
                    <span>
                        <img style={{ display: (this.props.anticipatationNextStage === "anticipate_success" && this.state.thirdStageComplete) ? "block" : 'none', width: "100%", marginTop: "1rem" }} src={success} alt="" />
                    </span>
                </div>
                <div className="headline5 highEmphasis" style={{ display: 'block', marginTop: '2.25rem' }}>
                    <span style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                        {(this.props.anticipatationNextStage === "anticipate_success" && this.state.thirdStageComplete) ? localeObj.fgts_anticipate_done : localeObj.fgts_hangin}
                    </span>
                </div>
                <div className="body2 highEmphasis" style={{ display: 'block', marginTop: '1rem', marginBottom: '2rem' }}>
                    <span style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                        {(this.props.anticipatationNextStage === "anticipate_success" && this.state.thirdStageComplete) ? "" : localeObj.fgts_hangin_footer}
                    </span>
                </div>
                {this.props.apiStatus &&
                    <div>
                        <div style={{ ...this.styles.listStyleSelect, textAlign: "center" }}>
                            <div style={this.styles.imgStyleMore} >
                                <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.disableBlack }} />
                            </div>
                            <span className="body1" style={{ marginLeft: "0.5rem", marginTop: "0.5rem", color: ColorPicker.disableBlack, display: 'flex', flex: 1, textAlign: 'left' }}>
                                {(this.state.firstStageComplete ? localeObj.fgts_account_found_after : localeObj.fgts_account_found)}
                            </span>
                        </div>
                        <div style={{ ...this.styles.listStyleSelect, textAlign: "center" }}>
                            <div style={this.styles.imgStyleMore} >
                                <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.disableBlack }} />
                            </div>
                            <span className="body1" style={{ marginLeft: "0.5rem", marginTop: "0.5rem", color: ColorPicker.disableBlack, display: 'flex', flex: 1, textAlign: 'left' }}>
                                {(this.state.secondStageComplete ? localeObj.fgts_validate_saque_aniversario_after : localeObj.fgts_validate_saque_aniversario)}
                            </span>
                        </div>
                        <div style={{ ...this.styles.listStyleSelect, textAlign: "center" }}>
                            <div style={this.styles.imgStyleMore} >
                                <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.disableBlack }} />
                            </div>
                            <span className="body1" style={{ marginLeft: "0.5rem", marginTop: "0.5rem", color: ColorPicker.disableBlack, display: 'flex', flex: 1, textAlign: 'left' }}>
                                {(this.state.thirdStageComplete ? localeObj.fgts_validate_arbi_bank_after : localeObj.fgts_validate_arbi_bank)}
                            </span>
                        </div>
                    </div>
                }
                {!this.props.apiStatus &&
                    <div style={{ ...this.styles.listStyleSelect, textAlign: "center" }}>
                        <div style={this.styles.imgStyleMore} >
                            {(this.props.anticipatationNextStage === "anticipate_success" || this.props.anticipatationNextStage === "no_sufficent_balance" || this.props.anticipatationNextStage === "arbi_not_registered") &&
                                <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: this.state.firstStageComplete ? ColorPicker.transactionGreen : ColorPicker.disableBlack }} />}
                            {this.props.anticipatationNextStage === "account_error" && !this.state.firstStageComplete &&
                                <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.disableBlack }} />}
                            {this.props.anticipatationNextStage === "account_error" && this.state.firstStageComplete &&
                                <CancelIcon style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.errorRed }} />}
                        </div>
                        <div className="body1" style={{ marginLeft: "0.5rem", marginTop: "0.5rem", color: (this.state.firstStageComplete && this.props.anticipatationNextStage === "account_error") ? ColorPicker.errorRed : (this.state.firstStageComplete ? ColorPicker.white : ColorPicker.disableBlack), textAlign: "left" }}>
                            <span>{(this.state.firstStageComplete ? localeObj.fgts_account_found_after : localeObj.fgts_account_found)}</span>
                        </div>
                    </div>
                }
                {!this.props.apiStatus &&
                    <div style={{ ...this.styles.listStyleSelect, textAlign: "center" }}>
                        <div style={this.styles.imgStyleMore} >
                            {(this.props.anticipatationNextStage === "anticipate_success" || this.props.anticipatationNextStage === "arbi_not_registered") &&
                                <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: this.state.secondStageComplete ? ColorPicker.transactionGreen : ColorPicker.disableBlack }} />}
                            {this.props.anticipatationNextStage === "no_sufficent_balance" && !this.state.secondStageComplete &&
                                <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.disableBlack }} />}
                            {this.props.anticipatationNextStage === "no_sufficent_balance" && this.state.secondStageComplete &&
                                <CancelIcon style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.errorRed }} />}
                        </div>
                        <div className="body1" style={{ marginLeft: "0.5rem", marginTop: "0.5rem", color: (this.state.thirdStageComplete && this.props.anticipatationNextStage === "no_sufficent_balance") ? ColorPicker.errorRed : (this.state.secondStageComplete ? ColorPicker.white : ColorPicker.disableBlack), textAlign: "left" }}>
                            <span>{(this.state.secondStageComplete ? localeObj.fgts_validate_saque_aniversario_after : localeObj.fgts_validate_saque_aniversario)}</span>
                        </div>
                    </div>
                }
                {!this.props.apiStatus &&
                    <div style={{ ...this.styles.listStyleSelect, textAlign: "center" }}>
                        <div style={this.styles.imgStyleMore} >
                            {(this.props.anticipatationNextStage === "anticipate_success") &&
                                <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: this.state.thirdStageComplete ? ColorPicker.transactionGreen : ColorPicker.disableBlack }} />}
                            {this.props.anticipatationNextStage === "arbi_not_registered" && !this.state.thirdStageComplete &&
                                <CircleCheckedFilled style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.disableBlack }} />}
                            {this.props.anticipatationNextStage === "arbi_not_registered" && this.state.thirdStageComplete &&
                                <CancelIcon style={{ width: "1.5rem", height: "1.5rem", marginTop: "1rem", fill: ColorPicker.errorRed }} />}
                        </div>
                        <div className="body1" style={{ marginLeft: "0.5rem", marginTop: "0.5rem", color: (this.state.thirdStageComplete && this.props.anticipatationNextStage === "arbi_not_registered") ? ColorPicker.errorRed : (this.state.thirdStageComplete ? ColorPicker.white : ColorPicker.disableBlack), textAlign: "left" }}>
                            <span>{(this.state.thirdStageComplete ? localeObj.fgts_validate_arbi_bank_after : localeObj.fgts_validate_arbi_bank)}</span>
                        </div>
                    </div>
                } */}
                {!this.props.apiStatus &&
                    <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                        <PrimaryButtonComponent btn_text={localeObj.see_help} onCheck={() => this.goToFgtsVideoTutorial()} />
                    </div>}
            </div>
        )
    }
}

FGTSAnticipateVerification.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    apiStatus: PropTypes.bool,
    anticipatationNextStage: PropTypes.string,
    onCancel: PropTypes.func,
    setTransactionInfo: PropTypes.func,
    newValue: PropTypes.func,
};


export default withStyles()(FGTSAnticipateVerification);