import React from "react";
import FlexView from "react-flexview";
import PropTypes from 'prop-types';
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import "../../../styles/main.css";
import InputThemes from "../../../Themes/inputThemes";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import MetricServices from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import layout from "../../../images/SpotIllustrations/Physical card.png"
import elo from "../../../images/SpotIllustrations/EloPhysical.png";

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from '@material-ui/core/styles';
import constantObjects from "../../../Services/Constants";
import GeneralUtilities from "../../../Services/GeneralUtilities";

const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

export default class CardReview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
        };

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNames.cardArrivalComponent.review;
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
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

    help = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        if (this.props.onHelp) {
            this.props.onHelp()
        } else {
            GeneralUtilities.openHelpSection();
        }
    }

    onConfirm = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.confirm();
    }

    render() {
        const finalHeight = window.screen.height;
        return (
            <div>
                <div className="scroll" style={{ height: `${finalHeight - 290}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <FlexView column style={InputThemes.initialMarginStyle}>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.confirm_card}
                        </div>
                    </FlexView>
                    <div style={{ position: 'relative', margin: "1.5rem", marginBottom: "0", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                        <img style={{ width: "12rem" }} src={this.props.details.brand === "VISA" ? layout : elo} alt=""></img>
                    </div>
                    <FlexView column style={{ marginTop: "1rem" }}>
                        <div className="subtitle4 mediumEmphasis" style={{ textAlign: "center" }}>
                            {localeObj.card_number}
                        </div>
                        <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "0.6rem" }}>
                            {this.props.details.number}
                        </div>
                    </FlexView>
                </div>

                <div  style={InputThemes.bottomButtonStyle}>
                    <PrimaryButtonComponent btn_text={localeObj.confirm} onCheck={this.onConfirm} />
                    <div style={{ marginTop: "1.5em" }} className="body2 highEmphasis" onClick={() => this.help()}>
                        {localeObj.help}
                    </div>
                </div>

                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        );
    }
}

CardReview.propTypes = {
    componentName: PropTypes.string,
    details: PropTypes.shape({
      brand: PropTypes.string.isRequired,
      number: PropTypes.string.isRequired,
    }).isRequired,
    confirm: PropTypes.func.isRequired,
    onHelp: PropTypes.func,
  };