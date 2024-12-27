import React from "react";
import PropTypes from "prop-types";

import PageState from "../../../Services/PageState";
import ColorPicker from "../../../Services/ColorPicker";
import constantObjects from "../../../Services/Constants";
import MetricsService from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';

import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import "../../../styles/main.css";
import "../../../styles/lazyLoad.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";
import InputThemes from "../../../Themes/inputThemes";

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";

const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

class FGTSAnticipateIntroduction extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: "",
            message: "",
            showDetails: false,
            snackBarOpen: false,
            anticipateLoader: false,
            firstStageComplete: true,
            secondStageComplete: false,
            thirdStageComplete: false
        }
        this.styles = {
            imgStyleMore: {
                borderRadius: "50%",
                height: "3rem",
                width: "3rem",
                verticalAlign: "middle",
                fill: ColorPicker.surface3,
                backgroundColor: ColorPicker.surface3,
                justifySelf: 'center',
                alignSelf: 'center'
            },
            listStyleSelect: {
                margin: "1rem 1.5rem",
                display: "flex",
                alignItems: 'center',
            }
        }
        this.componentName = GeneralUtilities.emptyValueCheck(this.props.componentName) ? "Installment" : this.props.componentName
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
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

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false });
    }

    changeShowStatus = () => {
        this.setState({
            showDetails: !this.state.showDetails
        })
    }

    setAction = (type) => {
        MetricsService.onPageTransitionStop(this.componentName, PageState.stop);
        this.props.setTransactionInfo(type);
    }

    defineValue = () => {
        MetricsService.onPageTransitionStop(this.componentName, PageState.stop);
        this.props.newValue();
    }

    render() {
        const screenHeight = window.screen.height;
        return (
            <div>
                <div style={{ display: !this.state.processing ? 'block' : 'none', marginTop: "1rem", overflowY: "auto", overflowX: "hidden", height: `${screenHeight - 200}px` }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <span className="headline5 highEmphasis">
                            {localeObj.fgts_anticipate_intro_header}
                        </span>
                    </div>
                    <div >
                        <ol className="headline6 olForFGTS">
                            <li style={{ marginRight: "2rem" }}>
                                <div className="liFirstDiv">
                                    <div className="liSecondDiv">
                                        <div className="body2 highEmphasis" style={{ marginTop: "2rem", marginLeft: "1rem" }}>{localeObj.fgts_anticipate_intro_data1}</div>
                                        <div className="caption accent" style={{ marginTop: "0.5rem", marginLeft: "1rem", textDecorationLine: 'underline' }} onClick={() => this.setAction("Link1")}>{localeObj.fgts_anticipate_intro_link1}</div>
                                    </div>
                                </div>
                            </li>
                            <li style={{ marginRight: "2rem" }}>
                                <div className="liFirstDiv">
                                    <div className="liSecondDiv">
                                        <div className="body2 highEmphasis" style={{ marginTop: "2rem", marginLeft: "1rem" }}>{localeObj.fgts_anticipate_intro_data2}</div>
                                        <div className="caption accent" style={{ marginTop: "0.5rem", marginLeft: "1rem", textDecorationLine: 'underline' }} onClick={() => this.setAction("Link2")}>{localeObj.fgts_anticipate_intro_link2}</div>
                                    </div>
                                </div>
                            </li>
                            <li style={{ marginRight: "2rem" }}>
                                <div className="liFirstDiv">
                                    <div className="liSecondDiv">
                                        <div className="body2 highEmphasis" style={{ marginTop: "2rem", marginLeft: "1rem" }}>{localeObj.fgts_anticipate_intro_data3}</div>
                                        <div className="caption accent" style={{ marginTop: "0.5rem", marginLeft: "1rem", textDecorationLine: 'underline' }} onClick={() => this.setAction("Link3")}>{localeObj.fgts_anticipate_intro_link3}</div>
                                    </div>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
                <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={localeObj.fgts_anticipate} onCheck={() => this.setAction("Anticipate")} />
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={() => this.closeSnackBar()}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

FGTSAnticipateIntroduction.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName : PropTypes.string.isRequired,
    newValue: PropTypes.func.isRequired,
    setTransactionInfo: PropTypes.func.isRequired
};

export default withStyles()(FGTSAnticipateIntroduction);