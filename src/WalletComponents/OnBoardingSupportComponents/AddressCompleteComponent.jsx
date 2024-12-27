import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import InputThemes from "../../Themes/inputThemes";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";

import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import constantObjects from "../../Services/Constants";
import GeneralUtilities from "../../Services/GeneralUtilities";

const snackBar = InputThemes.snackBarTheme;
const theme1 = InputThemes.DetailsTheme;
const styles = InputThemes.multipleInputStyle;
var localeObj = {};

class AddressCompleteComponenet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            street: "",
            neighbourhood: ""
        }
        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.componentName = GeneralUtilities.emptyValueCheck(this.props.componentName) ? "Address Complete" : this.props.componentName;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }


    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        androidApiCalls.enableCopyPaste();
        document.addEventListener("visibilitychange", this.visibilityChange);
        let uf = this.props.address.uf;
        this.setState({
            cep: GeneralUtilities.parseCEP(this.props.address.cep).cepDisp,
            city: this.formatAddressFields(this.props.address.city),
            uf: constantObjects.stateMapping[uf],
            street: GeneralUtilities.emptyValueCheck(this.props.address.street) ? "" : this.formatAddressFields(this.props.address.street),
            neighbourhood: GeneralUtilities.emptyValueCheck(this.props.address.neighbourhood) ? "" : this.formatAddressFields(this.props.address.neighbourhood),
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

    componentWillMount() {
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentWillUnmount() {
        androidApiCalls.disableCopyPaste();
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    sendField = () => {

        let jsonObject = {
            street: this.state.street,
            neighbourhood: this.state.neighbourhood
        }

        switch (this.props.showFields) {
            case 0:
                if (GeneralUtilities.emptyValueCheck(this.state.street)) {
                    this.openSnackBar(localeObj.street_empty);
                    return;
                } else {
                    MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                    this.props.recieveField(jsonObject);
                }
                break;
            case 1:
                if (GeneralUtilities.emptyValueCheck(this.state.neighbourhood)) {
                    this.openSnackBar(localeObj.neighbourhood_empty);
                    return;
                } else {
                    MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                    this.props.recieveField(jsonObject);
                }
                break;
            default:
                if (GeneralUtilities.emptyValueCheck(this.state.street) || GeneralUtilities.emptyValueCheck(this.state.neighbourhood)) {
                    this.openSnackBar(localeObj.address_data_empty);
                    return;
                } else {
                    MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                    this.props.recieveField(jsonObject);
                }
                break;
        }
    }

    handleChange = name => event => {
        if (event.target.value.length !== 0) {
            let re = /^[A-Za-zÀ-ú\s\d\-\'\)\(.,]*$/;
            if (re.test(event.target.value)) {
                this.setState({ [name]: event.target.value });
            }
        } else {
            this.setState({ [name]: event.target.value });
        }
    };

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        return (
            <div>
                <div className="scroll" style={{ height: `${finalHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={{ ...InputThemes.initialMarginStyle, marginBottom: "1rem" }}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.complete_address}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.5rem" }}>
                                {localeObj.cep + " " + this.state.cep}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left" }}>
                                <div>{this.state.city + " - " + this.state.uf}</div>
                            </div>
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={theme1}>
                        <div style={{ display: (this.props.showFields === 2 || this.props.showFields === 0) ? 'block' : 'none' }}>
                            <TextField label={localeObj.profile_address}
                                onChange={this.handleChange("street")} value={this.state.street || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.street === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                inputProps={{ maxLength: 100 }}
                                InputLabelProps={this.state.street === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                        </div>
                        <div style={{ display: (this.props.showFields === 2 || this.props.showFields === 1) ? 'block' : 'none' }}>
                            <TextField label={localeObj.add_neighborhood} autoComplete='off'
                                onChange={this.handleChange("neighbourhood")} value={this.state.neighbourhood || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.neighbourhood === "" ? classes.input : classes.finalInput
                                }}
                                InputLabelProps={this.state.neighbourhood === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                        </div>
                    </MuiThemeProvider>

                    <div style={InputThemes.bottomButtonStyle}>
                        <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.sendField} />
                    </div>
                </div>
                <MuiThemeProvider theme={snackBar}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

AddressCompleteComponenet.propTypes = {
    classes: PropTypes.object.isRequired,
    address: PropTypes.object,
    showFields: PropTypes.number,
    recieveField: PropTypes.func,
    componentName: PropTypes.string
};

export default withStyles(styles)(AddressCompleteComponenet);