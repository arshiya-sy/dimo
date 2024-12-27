import React from "react";
import PropTypes from "prop-types";
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
import GiftCardPrivacyComp from "./GiftCardPrivacyComp";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import EditIcon from '@material-ui/icons/Edit';
import ColorPicker from "../../Services/ColorPicker";
import PageNames from "../../Services/PageNames";

const snackBar = InputThemes.snackBarTheme;
const theme1 = InputThemes.DetailsTheme;

const styles = InputThemes.multipleInputStyle;
const screenHeight = window.innerHeight;
var localeObj = {};
const PageNameJSON = PageNames.GiftCardComponents;

class GiftCardAddressComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addNumber: "",
            compliment: "",
            privacy: false,
            fieldOpen: false
        }
        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.componentName = GeneralUtilities.emptyValueCheck(this.props.componentName) ? PageNameJSON['gift_card_address'] : this.props.componentName;
        MetricServices.onPageTransitionStart(this.componentName);
    }


    componentDidMount() {
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        androidApiCalls.enablePullToRefresh(false);
        androidApiCalls.enableCopyPaste();
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        let uf = this.props.address.uf;
        this.setState({
            cep: GeneralUtilities.parseCEP(this.props.address.cep).cepDisp,
            city: this.formatAddressFields(this.props.address.city),
            uf: constantObjects.stateMapping[uf],
            street: GeneralUtilities.emptyValueCheck(this.props.address.street) ? "" : this.formatAddressFields(this.props.address.street),
            neighbourhood: GeneralUtilities.emptyValueCheck(this.props.address.neighbourhood) ? "" : this.formatAddressFields(this.props.address.neighbourhood),
        })
        window.onBackPressed = () => {
            this.onBack();
        }
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
        androidApiCalls.disableCopyPaste();
        document.removeEventListener("visibilitychange", this.visibilityChange);
        window.removeEventListener("resize", this.checkIfInputIsActive);
    }

    sendField = () => {
        const addressRegex = /^(?=.*\d)?[\w\d,.\s\-@*_:]*$/;
        let jsonObject = {
            addNumber: this.state.addNumber,
            compliment: this.state.compliment
        }
        if (GeneralUtilities.emptyValueCheck(this.state.addNumber) || GeneralUtilities.emptyValueCheck(this.state.compliment)) {
            this.openSnackBar(localeObj.address_data_empty);
            return;
        } else if (this.state.addNumber.length > 5) {
            this.openSnackBar(localeObj.invalid_addnum);
            return;
        } else if (!addressRegex.test(this.state.compliment)) {
            this.openSnackBar(localeObj.invalid_addcomp_nospl_chars);
            return;
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.recieveField(jsonObject);
        }



    }

    openPrivacyPolicy = () => {
        this.setState({
            privacy: true
        })
    }

    handleChange = name => event => {
        if (name === "addNumber" && event.target.value.length != 0) {
            const re = /^[0-9]+$/;
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
    onCancel = () => {
        if (this.state.privacy) {
            this.setState({
                privacy: false
            })
        }
    }

    onBack = () => {
        if (this.state.privacy) {
            this.setState({
                privacy: false
            })
            return;
        }
        window.onBackPressed = null;
        this.props.onBack();
        MetricServices.onPageTransitionStop(this.componentName, PageState.back);
    }

    checkIfInputIsActive = () => {
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
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const Details = [
            {
                "header": localeObj.address_section,
                "details": this.props.addressString,
                "edit": true
            },

        ];
        return (
            <div>
                {
                    <ButtonAppBar header={this.state.privacy ? localeObj.gift_card_dimo : localeObj.confirm_address} onBack={this.onBack} onCancel={this.onCancel} action={this.state.privacy ? "cancel" : "none"} inverse={this.state.privacy} />
                }
                {this.state.privacy && <GiftCardPrivacyComp />}
                {!this.state.privacy &&
                    <div className="scroll" style={{ height: `${finalHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" }}>
                        <div style={{ ...InputThemes.initialMarginStyle, marginBottom: "1rem" }}>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.gift_card_form_address_head}
                            </div>
                        </div>
                    <MuiThemeProvider theme={theme1}>
                        <div style={{ display: 'block' }}>
                            <TextField label={localeObj.gift_card_add_num}  type={'tel'}
                                onChange={this.handleChange("addNumber")} value={this.state.addNumber || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.addNumber === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                inputProps={{ maxLength: 100 }}
                                InputLabelProps={this.state.addNumber === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                        </div>
                        <div style={{ display: 'block'}}>
                            <TextField label={localeObj.gift_card_add_comp} autoComplete='off'
                                onChange={this.handleChange("compliment")} value={this.state.compliment || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.compliment === "" ? classes.input : classes.finalInput
                                }}
                                InputLabelProps={this.state.compliment === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                        </div>
                    </MuiThemeProvider>
                    <MuiThemeProvider theme={snackBar}>
                        <div style={{ marginLeft: "0.5rem", marginRight: "1.5rem", marginTop:"1.5rem", marginBottom:"1.5rem" }}>
                                <List>
                                    {
                                        Details.map((opt) => (
                                            <ListItem key="first" button>
                                                <ListItemText style={{ wordWrap: "break-word" }} primary={opt.header} secondary={opt.details} />
                                                {opt.edit &&
                                                    <EditIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "0.875rem" }}
                                                        onClick={() => this.onBack()} />}
                                            </ListItem>
                                        ))
                                    }
                                </List>
                            </div>
                        </MuiThemeProvider>
                        <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                            <div style={{ margin: "1.5rem 1rem", display: this.state.fieldOpen ? "none" : "block" }}>
                                <div style={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>
                                    <span className="body2 highEmphasis">{localeObj.gift_card_form_agree1}</span>
                                    <span className="body2 highEmphasis" style={{ textDecoration: 'underline' }} onClick={() => { this.openPrivacyPolicy() }}>{localeObj.gift_card_form_agree2}</span>
                                    <span className="body2 highEmphasis">{localeObj.gift_card_form_agree5}</span>
                                    <span className="body2 highEmphasis" style={{ textDecoration: 'underline' }} onClick={() => { this.props.openTermsLink() }}>{localeObj.gift_card_form_agree4}</span>
                                    <span className="body2 highEmphasis">{localeObj.gift_card_form_agree3}</span>
                                </div>
                            </div>
                            <PrimaryButtonComponent btn_text={localeObj.gift_card_form_btn_primary2} onCheck={this.sendField} />
                        </div>
                    </div>}
                <MuiThemeProvider theme={snackBar}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

GiftCardAddressComp.propTypes = {
    classes: PropTypes.object.isRequired,
    address: PropTypes.object,
    componentName: PropTypes.string,
    recieveField: PropTypes.func,
    onBack: PropTypes.func,
    openTermsLink: PropTypes.func,
    addressString: PropTypes.string

};

export default withStyles(styles)(GiftCardAddressComp);