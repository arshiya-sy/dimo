import React from "react";
import InputThemes from "../../Themes/inputThemes";
import PropTypes from "prop-types";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import FlexView from "react-flexview";
import { TextField } from "@material-ui/core";
import localeService from "../../Services/localeListService";
import MetricServices from "../../Services/MetricsService";
import utilities from "../../Services/NewUtilities";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import ColorPicker from "../../Services/ColorPicker";
import CircularProgress from '@material-ui/core/CircularProgress';
import GeneralUtilities from "../../Services/GeneralUtilities";
import Log from "../../Services/Log";
import arbiApiService from "../../Services/ArbiApiService";
import PageNames from "../../Services/PageNames";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import constantObjects from "../../Services/Constants";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import androidApiCalls from "../../Services/androidApiCallsService";

const styles = InputThemes.multipleInputStyle;
const screenHeight = window.innerHeight;
const theme1 = InputThemes.DetailsTheme;
const PageNameJSON = PageNames.clientCreation;
var localeObj = {};

class UserAddressComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cep: "",
            neighborhood: "",
            street: "",
            complement: "",
            city: "",
            uf: "",
            number: "",
            reference: "",
            isButtonEnabled: this.props.isButtonEnabled || "",
            loading: false,
            isCepVerified: false,
            cepHelperText: "",
            cepTouched: false
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enableCopyPaste();
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);

        this.setDisplayField(this.props.value);
    }

    setDisplayField = (cepInfo) => {
        if(cepInfo){
            this.setState({
                cep: cepInfo.displayCep,
                neighborhood: cepInfo.neighborhood,
                street: cepInfo.street,
                number: cepInfo.number,
                reference: cepInfo.reference,
                isButtonEnabled: cepInfo.isButtonEnabled,
                city: cepInfo.city,
                uf: cepInfo.uf,
                cepHelperText: cepInfo.cepHelperText
            })
        }
    }

    handleChange = name => event => {
        this.setState({ cepTouched: true})
        if (name === "cep" && event.target.value.length !== 0) {
            const re = /^[0-9-]+$/;
            if (re.test(event.target.value)) {
                let cepObj = {};
                cepObj = utilities.parseCEP(event.target.value);
                this.setState({
                    cep: cepObj.cepDisp,
                    cepField: cepObj.cepDisp.replace(/[^0-9]/g, '')
                }, this.cepVerification )
            } 
        } else if ((name === "neighborhood" || name === "street") && event.target.value.length !== 0) {
            let re = /^[A-Za-z\u00C0-\u00FF\s\d]*$/;
            if (re.test(event.target.value)) {
                this.setState({ [name]: event.target.value }, this.updateNextButtonState);
            }
        } else if (name === "number" && event.target.value.length !== 0) {
            const re = /^[0-9A-Za-z .-]+$/;
            if (re.test(event.target.value)) {
                this.setState({ [name]: event.target.value }, this.updateNextButtonState);
            }
        } else {
            this.setState({ [name]: event.target.value }, this.updateNextButtonState);
        }
    }

    sendField = () => {
        let cepInfo = {};
        cepInfo["cep"] = this.state.cepField;
        cepInfo["neighborhood"] = this.state.neighborhood;
        cepInfo["street"] = this.state.street;
        cepInfo["number"] = this.state.number;
        cepInfo["reference"] = this.state.reference;
        cepInfo["city"] = this.state.city;
        cepInfo["uf"] = this.state.uf;
        cepInfo["complement"] = this.state.complement;
        cepInfo["isButtonEnabled"] = this.state.isButtonEnabled;
        cepInfo["displayCep"] = this.state.cep;
        cepInfo["cepHelperText"] = this.state.cepHelperText;
        this.props.recieveField(cepInfo);
    }

    cepVerification = () => {
        if(this.state.cepField.length === 8){
            this.fetchCEPDetails(this.state.cep);
            this.updateNextButtonState();
        }
    }

    fetchCEPDetails = (cep) => {
        this.setState({ loading: true })
        if (!navigator.onLine) {
            this.openSnackBar(localeObj.noNetwork);
            return;
        }
        arbiApiService.consultCEP(cep, PageNameJSON.cep)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processGetAddressResponse(response.result);
                    if (processorResponse.success) {
                        this.setState({ loading: false });
                        let jsonObject = {
                            "street": processorResponse.address.street,
                            "complement":  processorResponse.address.complement || "",
                            "neighbourhood": processorResponse.address.neighbourhood,
                            "cep": cep,
                            "city": processorResponse.address.city,
                            "uf": processorResponse.address.uf
                        }
                        this.setState({ 
                            isCepVerified: true, 
                            cepHelperText: jsonObject.city + " - " +  jsonObject.uf,
                            neighborhood: jsonObject.neighbourhood,
                            street: jsonObject.street,
                            complement: jsonObject.complement,
                            city: jsonObject.city,
                            uf: jsonObject.uf
                         });
                        Log.debug("The address is " + JSON.stringify(jsonObject), "Address CEP page");
                        return;
                    } else {
                        this.setState({ 
                            loading: false, 
                            isCepVerified: false,
                            cepHelperText: GeneralUtilities.formattedString(localeObj.invalid, [localeObj.cep])
                        });
                        return;
                    }
                } else {
                    this.openSnackBar(localeObj.tryAgainLater);
                    this.setState({ loading: false });
                    return;
                }
            });
    }

    updateNextButtonState = () => {
        if(this.state.isCepVerified && this.state.cep !== "" && this.state.neighborhood !== "" && this.state.street !== "" && this.state.number !== ""){
            this.setState({ isButtonEnabled: true });
        } else {
            this.setState({ isButtonEnabled: false });
        }
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

    checkIfInputIsActive = (e) => {
        if (window.innerHeight !== screenHeight) {
            this.setState({
                fieldOpen: true
            })
        } else {
            this.setState({
                fieldOpen: false
            })
        }
    }

    render() {
        const { loading } = this.state;
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        return (
            <div>
                <div style={{ overflowY: "auto", height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`, overflowX: "hidden" }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.address_header}
                            </div>
                        </FlexView>
                    </div>

                    <MuiThemeProvider theme={theme1}>
                        <div style={{ display: 'inline-block' }}>
                            <TextField label={localeObj.cep}
                                onChange={this.handleChange("cep")} value={this.state.cep || ""}
                                error={this.state.cepTouched && !this.state.isCepVerified}
                                InputProps={{
                                    endAdornment: loading && <CircularProgress style={{ color: ColorPicker.loaderColor }} size={20} />,
                                    classes: { underline: classes.underline },
                                    className: this.state.cep === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.cep === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: this.state.isCepVerified ? classes.verifiedHelperText : classes.helpertextstyle }}
                                helperText={ this.state.cepHelperText }
                            />
                            <TextField label={localeObj.neighborhood}
                                onChange={this.handleChange("neighborhood")} value={this.state.neighborhood || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.neighborhood === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.neighborhood === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                            <TextField label={localeObj.street}
                                onChange={this.handleChange("street")} value={this.state.street || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.street === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.street === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                            <TextField label={localeObj.number}
                                onChange={this.handleChange("number")} value={this.state.number || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.number === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.number === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                            <TextField label={localeObj.reference}
                                onChange={this.handleChange("reference")} value={this.state.reference || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.reference === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.reference === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                        </div>
                    </MuiThemeProvider>
                </div>
                <div align="center" style={this.state.fieldOpen ? InputThemes.identifyButtonStyle : InputThemes.bottomButtonStyle}>
                    <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.sendField} disabled={!this.state.isButtonEnabled}/>
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

UserAddressComponent.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(UserAddressComponent);
