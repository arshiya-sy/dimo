import React from "react";
import FlexView from "react-flexview";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";
import PropTypes from "prop-types";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";

import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PixKnowMore from "./PixKnowMore";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from "@material-ui/core/styles";
import Pix from "../../../images/OnBoardingImages/PixFirstAccess.png";
import { CSSTransition } from 'react-transition-group';
import constantObjects from "../../../Services/Constants";

const theme2 = InputThemes.snackBarTheme;
const pageName = PageNames.pixOnboarding['pix_onboarding_main'];
var localeObj = {};

class PixOnboarding extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            knowMore: false,
            direction: ""
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(pageName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
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

    onknowMore = ()=> {
        MetricServices.onPageTransitionStop(pageName, PageState.close);
       this.setState({
           knowMore: true,
           direction:"left"
       })
    }

    onBack = ()=> {
        MetricServices.onPageTransitionStop(pageName, PageState.back);
        this.setState({
            knowMore: false,
            direction:"right"
        })
     }

    onClickAction = (action) => {
        MetricServices.onPageTransitionStop(pageName, PageState.close);
        this.props.handleOnboarding(action);
        return;
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    render() {
        const finalWidth = window.screen.width
        return (
            <div>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={this.state.knowMore ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                <div style={{display: (this.state.knowMore ? "block" : 'none') }}>
                    {this.state.knowMore && <PixKnowMore handleBack={this.onBack} onGotIt={()=>this.onClickAction("cancel")}/>}
                </div>
                </CSSTransition>
                <div style={{ overflowX: "hidden", display: (!this.state.knowMore ? "block" : 'none') }}>
                    <ButtonAppBar header="" onCancel={()=>this.onClickAction("cancel")} action="cancel" inverse="true" />
                    <div style={{textAlign: "center"}}>
                        <span>
                            <img style={{ width: `${finalWidth * 0.7}px` }} src={Pix} alt="" />
                        </span>
                    </div>
                    <div style={{ margin: "0 3rem" }}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "center" }}>
                                {localeObj.onboard_pix_header}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                <div>{localeObj.pix_highlights_subheader}</div>
                                <div style={{marginTop: "1rem" }} >{localeObj.pix_highlights_text}</div>
                            </div>
                            <div className="subtitle2 highEmphasis" onClick={() => this.onknowMore()} style={{textAlign: "center", marginTop: "1.5rem"}}>
                                {localeObj.pix_know_more}
                            </div>
                        </FlexView>
                    </div>

                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "cener"}}>
                        <PrimaryButtonComponent btn_text={localeObj.register_keys} onCheck={()=>this.onClickAction("register")} />
                        <div className="body2 highEmphasis" style={{marginTop:"1rem"}} onClick={()=>this.onClickAction("maybeLater")}>{localeObj.plain_maybe_later}</div> 
                    </div>
                    <MuiThemeProvider theme={theme2}>
                        <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                        </Snackbar>
                    </MuiThemeProvider>
                </div>
            </div>
        )
    }
}

export default PixOnboarding;

PixOnboarding.propTypes = {
    handleOnboarding: PropTypes.func
}