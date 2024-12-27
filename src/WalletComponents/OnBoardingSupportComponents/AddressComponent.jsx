import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import utilities from "../../Services/NewUtilities";

import InputThemes from "../../Themes/inputThemes";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import GeneralUtilities from "../../Services/GeneralUtilities";
import constantObjects from "../../Services/Constants";

const styles = InputThemes.multipleInputStyle;
var localeObj = {};

class AddressComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
            cep: "",
            address: this.props.address ||""
        }
        this.style = {
            underLine: {
                borderBottomStyle: "solid",
                width: "fit-content",
                borderBottomWidth: "1.5px"
            }
        }
        this.sendField = this.sendField.bind(this);
        this.componentName = this.props.componentName;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        this.setState({
            cep: this.props.address.displayCep,
            street: this.formatAddressFields(this.props.address.street),
            neighbourhood: this.formatAddressFields(this.props.address.neighborhood),
            city: this.formatAddressFields(this.props.address.city),
            uf: this.props.address.uf,
            number: this.props.address.number
        })
    }

    formatAddressFields = (value) => {
        let addressInCaps = value.toLowerCase();
        addressInCaps = addressInCaps.replace(/(?:^|\s)\S/g, function (firstLetter) { return firstLetter.toUpperCase(); });
        return addressInCaps;
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

    sendField = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.recieveField();
    }

    reset = () => {
        this.props.reset();
    }

    render() {
        const finalHeight = window.screen.height;
        return (
            <div className="scroll" style={{ height: `${finalHeight * 0.67}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={InputThemes.initialMarginStyle}>
                    <FlexView column>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.check_address}
                        </div>
                    </FlexView>
                </div>
                <div style={{ margin: "1.5rem" }}>
                    <FlexView column>
                        <div className="body2 highEmphasis" style={{ textAlign: "left" }}>
                            {this.state.cep}
                        </div>
                        <div className="body2 highEmphasis" style={{ textAlign: "left" }}>
                            <p style={{ wordWrap: "break-word" }}>{GeneralUtilities.areAllArgsValid(this.state.street) ? this.state.street : ""}</p>
                            <div>{this.state.number}</div>
                            <p style={{ wordWrap: "break-word" }}>{GeneralUtilities.areAllArgsValid(this.state.neighbourhood) ? this.state.neighbourhood : ""}</p>
                            <div>{this.state.city} , {this.state.uf}</div>
                        </div>
                    </FlexView>
                </div>
                <div align="center" style={InputThemes.bottomButtonStyle}>
                    <FlexView column>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", margin: "1.5rem" }}>
                            <span className="label2 highEmphasis">{localeObj.address_footer1}</span>
                            <span className="label2 accent" style={this.style.underLine} onClick={() => this.props.read("address")}>{localeObj.address_footer2}</span>
                        </div>
                    </FlexView>
                    <PrimaryButtonComponent btn_text={localeObj.confirm} onCheck={this.sendField} />
                    <SecondaryButtonComponent btn_text={localeObj.edit_address} onCheck={this.reset} />
                </div>
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

AddressComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    address: PropTypes.object,
    reset: PropTypes.func,
    recieveField: PropTypes.func,
    componentName: PropTypes.string
};

export default withStyles(styles)(AddressComponent);
