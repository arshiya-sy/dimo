import React from "react";
import FlexView from "react-flexview";

import "../../../styles/main.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";

import PageState from '../../../Services/PageState';
import constantObjects from "../../../Services/Constants";
import MetricServices from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import utilities from "../../../Services/NewUtilities";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import androidApiCalls from "../../../Services/androidApiCallsService";

import MuiAlert from '@material-ui/lab/Alert';
import ListItem from "@material-ui/core/ListItem";
import Snackbar from '@material-ui/core/Snackbar';
import ListItemText from "@material-ui/core/ListItemText";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import BottomSheetAccount from "../../CommonUxComponents/BottomSheetAccount";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PropTypes from 'prop-types';

const theme2 = InputThemes.SearchInputTheme;
const theme3 = InputThemes.snackBarTheme;
const theme1 = InputThemes.DetailsTheme;
const styles = InputThemes.multipleInputStyle;
var localeObj = {};

class ListContactDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contacts: [],
            currentState: "initial",
            snackBarOpen: false,
            message: "",
            name: this.props.contact.nickName || ""
        };
        this.style = {
            textStyle: {
                marginLeft: "3rem",
                marginRight: "3rem",
                marginTop: "1rem",
                textAlign: "center"
            }
        }
        this.handleClick = this.handleClick.bind(this);
        this.componentName = GeneralUtilities.emptyValueCheck(this.props.componentName) ? "EDIT CONTACT" : this.props.componentName;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        androidApiCalls.enablePullToRefresh(false);
        this.setState({
            contactOptions: [{ "name": localeObj.edit_saved_account, "value": 1 },
            { "name": localeObj.delete_saved_account, "value": 2 }]
        })
        window.onBackPressed = () => {
            if (this.state.reset) {
                this.cancel();
            } else {
                this.onBack();
            }
        }
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

    handleClick = (contactJson) => {
        if (contactJson.tipoChavePix === "AgenciaConta") {
            this.setState({
                currentState: "accountType",
                opt: contactJson
            })
        } else {
            this.setState({
                opt: contactJson,
                reset: true
            })
        }
    }

    finishEdit = () => {
        if (this.state.name !== this.props.contact.nickName) {
            if (this.state.name.replace(/ /g, "") === "") {
                this.openSnackBar(localeObj.enter_field + " " + localeObj.nick_name);
                return;
            } else if (this.state.name.length > 20 || this.state.name.length < 2) {
                this.openSnackBar(localeObj.nameError);
                return;
            }

            this.showProgressDialog();
            let jsonObject = {};
            jsonObject["contactId"] = this.props.contact.contactId;
            jsonObject["cpf"] = this.props.contact.contactCpf;
            jsonObject["nickName"] = this.state.name;
            jsonObject["name"] = this.props.contact.contactName;
            this.props.contact.contactDetails.map((opt) => {
                jsonObject["keyId"] = opt.id;
                jsonObject["agency"] = opt.agencia;
                jsonObject["receiverIspb"] = opt.codigoOuISPB;
                jsonObject["account"] = opt.conta;
                jsonObject["bankName"] = opt.nomeInstituicao;
                jsonObject["accountType"] = opt.tipoDeConta;
                jsonObject["pixType"] = opt.tipoChavePix;
                jsonObject["pixKey"] = opt.chavePix;
            });

            ArbiApiService.editContact(jsonObject, this.componentName).then(response => {
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processDeleteContact(response.result);
                    if (processedResponse.success) {
                        let requestJson = {
                            "contactCpf": this.props.contact.contactCpf,
                            "contactId": this.props.contact.contactId,
                            "contactName": this.props.contact.contactName,
                            "nickName": this.state.name,
                            "contactDetails": this.props.contact.contactDetails
                        }
                        this.hideProgressDialog();
                        MetricServices.onPageTransitionStop(this.props.componentName, PageState.back);
                        this.props.finished(requestJson);
                    }
                } else {
                    this.setState({
                        message: localeObj.pix_technical_issue,
                        snackBarOpen: true
                    })
                    this.hideProgressDialog();
                    let timeoutId = setInterval(() => {
                        clearInterval(timeoutId);
                        MetricServices.onPageTransitionStop(this.props.componentName, PageState.back);
                        this.props.moveToDetails(this.props.contact);
                    }, 1.5 * 1000);
                }
            });
        } else {
            this.hideProgressDialog();
            MetricServices.onPageTransitionStop(this.props.componentName, PageState.back);
            this.props.finished(this.props.contact);
        }
    }

    cancel = () => {
        this.setState({
            reset: false
        })
    }

    deleteConfirm = () => {
        this.setState({
            reset: false
        })
        this.showProgressDialog();
        let jsonObj = {};
        jsonObj["contactId"] = this.props.contact.contactId;
        jsonObj["contactCpf"] = this.props.contact.contactCpf;
        jsonObj["keyId"] = this.state.opt.id;
        ArbiApiService.deleteContactKey(jsonObj, this.componentName).then(response => {
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processDeleteContact(response.result);
                if (processedResponse.success) {
                    let jsonObject = {};
                    jsonObject["favId"] = this.props.contact.contactId;
                    jsonObject["cpf"] = this.props.contact.contactCpf;
                    jsonObject["nickName"] = this.props.contact.nickName;
                    jsonObject["fullName"] = this.props.contact.contactName;
                    MetricServices.onPageTransitionStop(this.props.componentName, PageState.back);
                    this.props.deleteComplete(jsonObject);
                }
            } else {
                this.hideProgressDialog();
                this.setState({
                    message: localeObj.pix_technical_issue,
                    snackBarOpen: true
                })
            }
        });
    }

    openSnackBar = (message) => {
        this.setState({
            message: message,
            snackBarOpen: true
        })
    }

    closeSnackBar = () => {
        this.setState({
            snackBarOpen: false
        })
    }

    setContactOption = (val) => {
        if(this.state.name && this.state.name.length > 2 && this.state.name.length <= 20 ) {
            this.setState({ name : this.props.contact.nickName });
        }
        if (val === 1) {
            let jsonObject = {};
            jsonObject["contactId"] = this.props.contact.contactId;
            jsonObject["cpf"] = this.props.contact.contactCpf;
            jsonObject["nickName"] = this.state.name;
            jsonObject["name"] = this.props.contact.contactName;
            jsonObject["keyId"] = this.state.opt.id;
            jsonObject["agency"] = this.state.opt.agencia;
            jsonObject["receiverIspb"] = this.state.opt.codigoOuISPB;
            jsonObject["account"] = this.state.opt.conta;
            jsonObject["bankName"] = this.state.opt.nomeInstituicao;
            jsonObject["accountType"] = this.state.opt.tipoDeConta;
            MetricServices.onPageTransitionStop(this.props.componentName, PageState.back);
            this.props.editObj(jsonObject);
        } else {
            this.setState({
                reset: true,
                currentState: "initial"
            })
        }
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            switch (this.state.currentState) {
                case "initial":
                    this.props.back();
                    break;
                case "accountType":
                    this.setState({
                        currentState: "initial",
                        direction: "right"
                    })
                    break;
                default:
                    break;
            }
        }
    }

    handleChange = (event) => {
        if (event.target.value.length !== 0) {
            const re = /^[A-Za-z0-9\u00C0-\u00FF ]+$/;
            if (re.test(event.target.value)) {
                this.setState({
                    name: event.target.value
                });
            }
        } else {
            this.setState({
                name: event.target.value
            });
        }
    }

    render() {
        const { classes } = this.props;
        const screenHeight = window.screen.height;

        const getSecondaryDetails = (contactJson) => {
            switch (contactJson.tipoChavePix) {
                case "CPF":
                    return utilities.parseCPF(contactJson.chavePix).displayCPF;
                case "CNPJ":
                    return utilities.parseCPFOrCnpj(contactJson.chavePix).displayCPF;
                case "PHONE":
                    return contactJson.chavePix.substr(0, 3) + " " + contactJson.chavePix.substr(3, 2) + " " + contactJson.chavePix.substr(5, 5) + "-" + contactJson.chavePix.substr(10, 4);
                case "EMAIL":
                case "EVP":
                    return contactJson.chavePix;
                default:
                    return (localeObj.contact_ag + ": " + contactJson.agencia + " " + localeObj.contact_ag + ": " + contactJson.conta);
            }
        }

        const getKeyName = (contactJson) => {
            switch (contactJson.tipoChavePix) {
                case "CPF":
                    return localeObj.pix_key_header + ": " + localeObj.cpf;
                case "CNPJ":
                    return localeObj.pix_key_header + ": " + localeObj.cnpj;
                case "PHONE":
                    return localeObj.pix_key_header + ": " + localeObj.phone_number;
                case "EMAIL":
                    return localeObj.pix_key_header + ": " + localeObj.email;
                case "EVP":
                    return localeObj.pix_key_header + ": " + localeObj.evp_key;
                default:
                    return contactJson.nomeInstituicao;
            }
        }

        return (
            <div>
                <ButtonAppBar header={localeObj.contact_plural} onBack={this.onBack} action="none" />
                <div style={{ display: (this.state.currentState === "initial" && !this.state.processing ? 'block' : 'none') }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.contact_editing}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.contact_editing_subtitle}
                            </div>
                        </FlexView>
                    </div>
                    <div style={{ marginTop: "1rem", marginBottom: "2rem" }}>
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={localeObj.nick_name}
                                onChange={this.handleChange}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.name === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                value={this.state.name}
                                InputLabelProps={this.state.name === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }}
                            />
                        </MuiThemeProvider>
                    </div>
                    <MuiThemeProvider theme={theme2}>
                        <div style={{ margin: "0 1.5rem", overflowY: "auto", height: `${screenHeight * 0.6}px`, overflowX: "hidden" }}>
                            {
                                this.props.contact.contactDetails.map((opt, index) => (
                                    <ListItem key={index} button onClick={() => this.handleClick(opt)}>
                                        <ListItemText className="body2 highEmphasis" primary={getKeyName(opt)} secondary={getSecondaryDetails(opt)} />
                                        {opt.tipoChavePix === "AgenciaConta" ? <MoreVertIcon style={{ fill: ColorPicker.accent, marginRight: "1rem" }} /> :
                                            <CloseIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1.5rem" }} />}
                                    </ListItem>
                                ))
                            }
                        </div>
                    </MuiThemeProvider>
                    <div style={InputThemes.bottomButtonStyle}>
                        <PrimaryButtonComponent btn_text={localeObj.finish_editing} onCheck={this.finishEdit} />
                    </div>
                </div>
                <div style={{ display: (this.state.currentState === "accountType" && !this.state.processing ? 'block' : 'none') }}>
                    {this.state.currentState === "accountType" && <BottomSheetAccount accountType={this.state.contactOptions} heading={localeObj.edit_desc}
                        keySelected={this.setContactOption} />}
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme3}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.reset}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.delete_saved_contact}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.delete_contact_dec}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.delete_saved_contact} onCheck={this.deleteConfirm} />
                            <div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }} onClick={this.cancel}>
                                {localeObj.cancel}
                            </div>
                        </div>
                    </Drawer>
                </div>
            </div >
        );
    }
}

ListContactDetails.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    contact: PropTypes.shape({
        contactId: PropTypes.string,
        contactCpf: PropTypes.string,
        contactName: PropTypes.string,
        nickName: PropTypes.string,
        contactDetails: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string,
                agencia: PropTypes.string,
                codigoOuISPB: PropTypes.string,
                conta: PropTypes.string,
                nomeInstituicao: PropTypes.string,
                tipoDeConta: PropTypes.string,
                tipoChavePix: PropTypes.string,
                chavePix: PropTypes.string
            })
        )
    }),
    setTransactionInfo: PropTypes.func,
    finished: PropTypes.func,
    deleteComplete: PropTypes.func,
    editObj: PropTypes.func,
    back: PropTypes.func
};

export default withStyles(styles)(ListContactDetails);