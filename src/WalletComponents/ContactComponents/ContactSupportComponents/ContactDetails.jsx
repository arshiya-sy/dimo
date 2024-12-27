import React from "react";
import FlexView from "react-flexview";

import "../../../styles/main.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";

import PageState from '../../../Services/PageState';
import utilities from "../../../Services/NewUtilities";
import constantObjects from "../../../Services/Constants";
import MetricServices from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";

import MuiAlert from '@material-ui/lab/Alert';
import ListItem from "@material-ui/core/ListItem";
import Snackbar from '@material-ui/core/Snackbar';
import AddIcon from '@mui/icons-material/Add';
import ListItemText from "@material-ui/core/ListItemText";
import ArrowIcon from '@material-ui/icons/ArrowForwardIos';
import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import Button from '@material-ui/core/Button';
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import PropTypes from 'prop-types';

const theme1 = InputThemes.SearchInputTheme;
const styles = InputThemes.multipleInputStyle;
const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

class ListContactDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contacts: [],
            allContacts: [],
            snackBarOpen: false,
            message: "",
            cleared: false,
            empty: true
        };
        this.style = {
            textStyle: {
                marginLeft: "3rem",
                marginRight: "3rem",
                marginTop: "1rem",
                textAlign: "center"
            },
            buttonStyles:{
                color: ColorPicker.darkHighEmphasis,
                border: "solid 1px " + ColorPicker.buttonAccent,
                borderRadius: "1.875rem",
                fontSize: "1rem",
                padding: "8px 22px 8px 26px",
                fontWeight: "400",
                lineHeight: "28px",
                boxShadow: "none",
                textAlign: 'center',
                textTransform: 'none',
                '&:hover': {
                    border: "solid 1px " + ColorPicker.darkMediumEmphasis,
                    boxShadow: "none",
                },
                '&:disabled': {
                    color: ColorPicker.disabledTxt,
                    backgroundColor: ColorPicker.secDisabled,
                },
                "& .MuiTouchRipple-root span": {
                    border: "solid 1px " + + ColorPicker.darkMediumEmphasis,
                    boxShadow: "none",
                },
                width: "301px",
                height: "36px"
            }
        }
        this.handleClick = this.handleClick.bind(this);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        androidApiCalls.enablePullToRefresh(false);
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

    handleClick = (finalData) => {
        //Log.sDebug("User has selected a contact to send money")
        this.props.handleSend(finalData);
    }

    edit = () => {
        let jsonObj = {};
        jsonObj["name"] = this.props.contact.nickName;
        this.props.contact.contactDetails.map((opt) => {
            if (opt.tipoChavePix === "CPF") {
                jsonObj["cpfAdded"] = true;
            }
        });
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.edit(jsonObj);
    }

    delete = () => {
        this.props.bottomSheetOpen(true);
    }

    cancel = () => {
        this.props.bottomSheetOpen(false);
    }

    deleteConfirm = () => {
        this.props.bottomSheetOpen(false);
        this.setState({
            reset: false
        })
        this.showProgressDialog();
        ArbiApiService.deleteContact(this.props.contact.contactCpf, this.componentName).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processDeleteContact(response.result);
                if (processedResponse.success) {
                    this.setState({
                        message: localeObj.contact_deleted,
                        snackBarOpen: true
                    })
                    let timeoutId = setInterval(() => {
                        clearInterval(timeoutId);
                        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                        this.props.deleteComplete();
                    }, 1.5 * 1000);
                }
            } else {
                this.setState({
                    message: localeObj.pix_technical_issue,
                    snackBarOpen: true
                })
            }
        });
    }

    addNew = () => {
        let jsonObj = {};
        jsonObj["name"] = this.props.contact.nickName;
        this.props.contact.contactDetails.map((opt) => {
            if (opt.tipoChavePix === "CPF") {
                jsonObj["cpfAdded"] = true;
            }
        });
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.add(jsonObj);
    }

    closeSnackBar = () => {
        this.setState({
            snackBarOpen: false
        })
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
                    return (localeObj.contact_ag + ": " + contactJson.agencia + " " + localeObj.contact_cc + ": " + contactJson.conta);
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
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.transfer_to_contact}
                            </div>
                            <div className="body1 highEmphasis" style={{ marginTop: "1rem", textAlign: "left" }}>
                                {localeObj.choose_receiver_institute}
                            </div>
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={theme1}>
                        <div style={{ margin: "1.5rem", overflowY: "auto", height: `${screenHeight * 0.6}px`, overflowX: "hidden" }}>
                            {
                                this.props.contact.contactDetails.map((opt, index) => (
                                    <ListItem key={index} button onClick={() => this.handleClick(opt)}>
                                        <ListItemText className="body2 highEmphasis" primary={getKeyName(opt)} secondary={getSecondaryDetails(opt)} />
                                        <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                    </ListItem>
                                ))
                            }
                            <div  style={{ marginTop: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                <Button startIcon={<AddIcon />} variant="outlined" style={this.style.buttonStyles} onClick={() => this.addNew()}>{localeObj.add_key}</Button>
                            </div>
                        </div>
                    </MuiThemeProvider>
                    {!this.props.fromSend &&
                        <div style={InputThemes.bottomButtonStyle}>
                            <PrimaryButtonComponent btn_text={localeObj.contact_edit} onCheck={this.edit} />
                            <div style={this.style.textStyle} className="body2 highEmphasis" onClick={this.delete}>
                                {localeObj.contact_delete}
                            </div>
                        </div>
                    }
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.props.bottomSheetEnabled}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.contact_delete}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.delete_contact_dec}
                                </div>
                            </FlexView>
                        </div>
                        <div  style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.contact_delete_btn_text} onCheck={this.deleteConfirm} />
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
    contact: PropTypes.shape({
      nickName: PropTypes.string,
      contactCpf: PropTypes.string,
      contactDetails: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        agencia: PropTypes.string,
        codigoOuISPB: PropTypes.string,
        conta: PropTypes.string,
        nomeInstituicao: PropTypes.string,
        tipoDeConta: PropTypes.string,
        tipoChavePix: PropTypes.string,
        chavePix: PropTypes.string
      }))
    }),
    handleSend: PropTypes.func,
    edit: PropTypes.func,
    deleteComplete: PropTypes.func,
    add: PropTypes.func,
    fromSend: PropTypes.bool
  };

export default withStyles(styles)(ListContactDetails);