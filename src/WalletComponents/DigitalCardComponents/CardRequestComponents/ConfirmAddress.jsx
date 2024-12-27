import React from 'react';
import FlexView from "react-flexview";
import { MuiThemeProvider} from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import Skeleton from '@material-ui/lab/Skeleton';
import PropTypes from 'prop-types';
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import localeService from "../../../Services/localeListService";
import MetricServices from "../../../Services/MetricsService";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import InputThemes from '../../../Themes/inputThemes';
import SecondaryButtonComponent from '../../CommonUxComponents/SecondaryButtonComponent';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import constantObjects from '../../../Services/Constants';

var localeObj = {};

export default class ConfirmAddress extends React.Component {

    constructor(props) {
        super(props);
        this.style = {
            textStyle: {
                marginLeft: "3rem",
                marginRight: "3rem",
                marginTop: "1rem",
                textAlign: "center"
            }
        }
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNames.physicalCardComponents.address;
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
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

    next = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.next();
    }

    render() {
        const finalHeight = window.screen.height;
        const finalWidth = window.screen.width;
        return (
            <div className="scroll" style={{ height: `${finalHeight * 0.65}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div align="center" style={{ marginTop: "5%" }}>
                    <span>
                        <img style={{ width: `${finalWidth * 0.7}px` }} src={this.props.icon} alt="" />
                    </span>
                </div>
                <div style={this.style.textStyle}>
                    <span className="headline5 highEmphasis">
                        {localeObj.delivery}
                    </span>
                </div>
                <div style={this.style.textStyle}>
                    <span className="body2 highEmphasis">
                        {localeObj.different_address}
                    </span>
                </div>
                <div style={{ margin: "1.5rem" }}>
                    <FlexView column>
                        <div className="body2 highEmphasis" style={{ textAlign: "left" }}>
                            {this.state.cep}
                        </div>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1.5rem" }}>
                            <p style={{ wordWrap: "break-word" }}>{GeneralUtilities.areAllArgsValid(this.state.street) ? this.state.street : ""}</p>
                            <p style={{ wordWrap: "break-word" }}>{GeneralUtilities.areAllArgsValid(this.state.neighbourhood) ? this.state.neighbourhood : ""}</p>
                            <div>{this.state.city} , {this.state.uf}</div>
                        </div>
                    </FlexView>
                </div>
                <div align="center" style={InputThemes.bottomButtonStyle}>
                    <PrimaryButtonComponent btn_text={localeObj.confirm_address} onCheck={this.sendField} />
                    <SecondaryButtonComponent btn_text={localeObj.not_address} onCheck={this.reset} />
                </div>

                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>

            </div>
        );
    }
}

ConfirmAddress.propTypes = {
    componentName: PropTypes.string.isRequired,
    address: PropTypes.func.isRequired,
    next: PropTypes.func.isRequired
}
