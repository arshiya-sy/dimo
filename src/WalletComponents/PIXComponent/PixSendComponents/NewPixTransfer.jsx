import React, { PureComponent } from 'react'
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import InputThemes from "../../../Themes/inputThemes";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import "../../../styles/new_pix_style.css";

import Log from "../../../Services/Log";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import utilities from "../../../Services/NewUtilities";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiErrorResponsehandler from "../../../Services/ArbiErrorResponsehandler";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import MetricServices from "../../../Services/MetricsService";
import PageState from "../../../Services/PageState";
import ColorPicker from "../../../Services/ColorPicker";

import TextField from "@material-ui/core/TextField";
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import ArrowIcon from '@material-ui/icons/ArrowForwardIos';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import { Drawer } from '@material-ui/core';
import List from '@material-ui/core/List';

const screenHeight = window.screen.height;

const theme1 = InputThemes.AmountTheme;
const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
var localeObj = {};

const ColoredTextButton = withStyles({
    root: {
        color: ColorPicker.duskHorizon,
        textTransform: "none"
    },
})((props) => <Button color="default" {...props} />);

export class NewPixTransfer extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            loading: false,
            searchText: '',
            searchResults: '',
            timerId: null,
            pixData: "",
            displayPixData: "",
            progressDialog: false,
            snackBarOpen: false,
            error: false,
            field: "",
            pixKeyDetails: {},
            bottomSheetOpen: false

        };
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }
    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        androidApiCalls.enableCopyPaste();
        window.addEventListener("resize", this.checkIfInputIsActive);
        if (!!this.props.requiredInfo && !!this.props.requiredInfo["pixKey"]) {
            if ((this.state.searchResults === localeObj.cpf || this.state.searchResults === localeObj.cnpj) && this.props.requiredInfo["pixKey"] !== "") {
                let cpfObj = utilities.parseCPFOrCnpj(this.props.requiredInfo["pixKey"]);
                if (cpfObj.displayCPF) {
                    this.setState({
                        searchText: cpfObj.displayCPF,
                        pixData: cpfObj.displayCPF.replace(/[^0-9]/g, '')
                    })
                }
            } else {
                let enteredKey = this.props.requiredInfo["pixKey"];
                const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                if (typeof enteredKey === "string") {
                    if (enteredKey.includes("+55")) {
                        let editablekey = enteredKey.replace("+55", "");
                        if (editablekey.length !== 0) {
                            enteredKey = editablekey
                        }
                    } else if (this.state.searchResults === localeObj.email) {
                        if (!emailRegex.test(enteredKey)) {
                            enteredKey = ""
                        }
                    }
                }
                this.setState({
                    pixData: enteredKey,
                    searchText: enteredKey
                });
            }
        }
        document.addEventListener("visibilitychange", this.visibilityChange);
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

    handleLogging = (logs) => {
        Log.sDebug(logs, this.componentName);
    }

    sendField = async () => {
        // validate pixData
        if (this.state.searchResults !== "") {
            if (!utilities.validateParameters(this.state.searchResults, this.state.pixData)) {
                this.openSnackBar(localeObj.pix_key_invalid);
                return;
            } else if (this.state.searchResults === localeObj.cpf && !GeneralUtilities.validateCpfOrCnpj(this.state.pixData, true)) {
                this.openSnackBar(localeObj.pix_key_invalid);
                return;
            } else if (this.state.searchResults === localeObj.phone_type) {
                if (this.state.pixData.length !== 15 || parseInt(this.state.pixData[5]) !== 9) {
                    this.openSnackBar(localeObj.pix_key_invalid);
                    return;
                } else if (!utilities.validateParameters("ddd", this.state.pixData.substring(1, 3))) {
                    this.openSnackBar(localeObj.pix_key_invalid);
                    return;
                }
            } else if (this.state.pixData.replace(/ /g, "") === "") {
                this.openSnackBar(localeObj.enter_field + " " + this.state.searchResults.toString().toLowerCase());
                return;
            }
            this.showProgressDialog();
            // let jsonObject = { ...this.props.requiredInfo };
            let key = this.state.pixData;
            if (this.state.searchResults === localeObj.cpf ||
                this.state.searchResults === localeObj.phone_type) {
                key = this.state.pixData.replace(/[^0-9]/g, '');
            }
            if (this.state.searchResults === localeObj.phone_type) {
                key = "+55" + key;
            }
            const pixKey = key;
            let response = await GeneralUtilities.fetchPixKeys();
            if (response && response.success) {
                let responseHandler = ArbiResponseHandler.processGetAllPixKeysResponse(response.result);
                if (responseHandler && responseHandler.success) {
                    const pixKeys = responseHandler.pixKeys;
                    let goAheadFlag = true;
                    if(pixKeys){
                        pixKeys.forEach((arr) => {
                            if (pixKey === arr["key_value"]) {
                                goAheadFlag = false
                                this.openSnackBar(localeObj.pix_same_account_key);
                            }
                        })
                    }
                    if (goAheadFlag) {
                        let jsonObject = {};
                        if(pixKey && (pixKey.length === 11 || pixKey.includes("+55"))) {
                            await ArbiApiService.getPixKeyDetails(pixKey, this.componentName).then(res => {
                                if (res && res.success) {
                                    let processedResult = ArbiResponseHandler.processGetPixKeyDetailsResponse(res.result, pixKey, localeObj);
                                    this.handleLogging("Pix Info valid");
                                    if (processedResult && processedResult.success) {
                                        jsonObject["endToEnd"] = processedResult.pixKeyDetails.endToEnd;
                                        jsonObject["transferType"] = processedResult.pixKeyDetails.pixKeyType;
                                        jsonObject["CPF"] = processedResult.pixKeyDetails.CPF;
                                        jsonObject["receiverInstitute"] = processedResult.pixKeyDetails.institute;
                                        jsonObject["name"] = processedResult.pixKeyDetails.name;
                                        jsonObject["date"] = processedResult.pixKeyDetails.date;
                                        jsonObject["pixKey"] = pixKey;
                                        this.setState({
                                            pixKeyDetails: jsonObject
                                        })
                                    } else {
                                        this.hideProgressDialog();
                                        let jsonObj = ArbiErrorResponsehandler.processErrorsForJSON(processedResult);
                                        this.handleLogging("Error while validating pix info");
                                        MetricServices.onPageTransitionStop(this.componentName, PageState.error);
                                        this.props.setTransactionInfo(jsonObj);
                                    }
                                } else {
                                    this.hideProgressDialog();
                                    let jsonObj = ArbiErrorResponsehandler.processErrorsForJSON(res);
                                    this.handleLogging("Error while validating pix info");
                                    MetricServices.onPageTransitionStop(this.componentName, PageState.error);
                                    this.props.setTransactionInfo(jsonObj);
                                }
                            })
                        }
                        this.hideProgressDialog();
                        jsonObject["endToEnd"] = this.state.pixKeyDetails.endToEnd;
                        jsonObject["transferType"] = this.state.pixKeyDetails.transferType;
                        jsonObject["CPF"] = this.state.pixKeyDetails.CPF;
                        jsonObject["receiverInstitute"] = this.state.pixKeyDetails.receiverInstitute;
                        jsonObject["name"] = this.state.pixKeyDetails.name;
                        jsonObject["date"] = this.state.pixKeyDetails.date;
                        jsonObject["pixKey"] = pixKey;
                        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                        this.props.setTransactionInfo(jsonObject);
                    } else {
                        this.hideProgressDialog();
                    }
                } else {
                    this.hideProgressDialog();
                }
            } else {
                this.hideProgressDialog();
                let jsonObj = ArbiErrorResponsehandler.processErrorsForJSON(response);
                this.handleLogging("Error while validating pix info");
                MetricServices.onPageTransitionStop(this.componentName, PageState.error);
                this.props.setTransactionInfo(jsonObj);
            }
        } else {
            this.callApi(this.state.searchText);
        }
    }

    fetchType(type) {
        switch (type) {
            case "CPF":
                this.setState({
                    field: "CPF"
                })
                break;
            case localeObj.phone_type:
                this.setState({
                    field: "Phone"
                })
                break;
            case "EMAIL":
                this.setState({
                    field: "E-mail"
                })
                break;
            default:
                this.setState({
                    field: "Random key"
                })
        }
    }
    handleChange = (event) => {
        let value = event.target.value;
        value = value.charAt(0).toLowerCase() + value.substring(1);
        this.setState({
            searchText: value,
            error: false
        });
        if (this.state.searchResults !== "") {
            if (this.state.searchResults !== "EMAIL" && this.state.searchResults !== "EVP") {
                let reTest = this.state.searchText.replace(/[^\d]/g, '');
                this.setState({
                    searchText: reTest
                })
            }
            this.setState({
                searchResults: "",
            })
        }

    }

    callApi = async (pixKey) => {
        if(pixKey && pixKey.length === 11) {
            this.props.pixBottomSheet(true);
        } else {
            this.setState({ loading: true })
            let jsonObject = { ...this.props.requiredInfo };
            try {
                await ArbiApiService.getPixKeyDetails(pixKey, this.componentName).then(response => {
                    // this.hideProgressDialog();
                    if (response && response.success) {
                        this.setState({
                            loading: false,
                            error: false
                        })
                        let processedResult = ArbiResponseHandler.processGetPixKeyDetailsResponse(response.result, pixKey, localeObj);
                        this.handleLogging("Pix Info valid");
                        if (processedResult && processedResult.success) {
                            jsonObject["endToEnd"] = processedResult.pixKeyDetails.endToEnd;
                            jsonObject["transferType"] = processedResult.pixKeyDetails.pixKeyType;
                            jsonObject["CPF"] = processedResult.pixKeyDetails.CPF;
                            jsonObject["receiverInstitute"] = processedResult.pixKeyDetails.institute;
                            jsonObject["name"] = processedResult.pixKeyDetails.name;
                            jsonObject["date"] = processedResult.pixKeyDetails.date;
                            jsonObject["pixKey"] = pixKey;
                            this.fetchType(processedResult.pixKeyDetails.pixKeyType);
                            this.setState({
                                searchResults: processedResult.pixKeyDetails.pixKeyType,
                                pixKeyDetails: jsonObject
                            });
                        } else {
                            let jsonObj = ArbiErrorResponsehandler.processErrorsForJSON(response);
                            this.handleLogging("Error while validating pix info");
                            this.setState({
                                searchResults: "",
                                pixKeyDetails: jsonObj
                            });
                        }
                    } else {
                        this.handleLogging("Error while validating pix info");
                        let errorJson = ArbiErrorResponsehandler.processErrorsForJSON(response);
                        switch (errorJson.errorCode) {
                            case 41167:
                            case 41166:
                            case 41161:
                            case 41160:
                            case 41164:
                                this.setState({
                                    pixKeyDetails: errorJson,
                                    searchResults: "",
                                    error: true,
                                    loading: false
                                })
                                break;
                            default:
                                this.props.setTransactionInfo(errorJson);
                                break;
                        }
                    }
                });
            } catch (error) {
                console.error('API call error:', error);
                // Handle errors appropriately
            }
            this.parsePixKey(pixKey)
        }
    };

    parsePixKey = (pixKey) => {
        let value = pixKey;
        value = value.charAt(0).toLowerCase() + value.substring(1);
        if ((this.state.searchResults === localeObj.cpf || this.state.searchResults === localeObj.cnpj) && this.state.searchText !== '') {
            const re = /^([0-9]|\/)+$/;
            if (re.test(this.state.searchText)) {
                let cpfObj = {}
                cpfObj = utilities.parseCPFOrCnpj(this.state.searchText);
                this.setState({
                    searchText: cpfObj.displayCPF,
                    pixData: cpfObj.displayCPF.replace(/[^0-9]/g, '')
                })
            } else if (this.state.searchText === '') {
                this.setState({
                    searchText: "",
                    pixData: "",
                })
            } else {
                this.setState({ error: true })
            }
        } else if (this.state.searchResults === localeObj.phone_type && this.state.searchText !== '') {
            let phoneNumObj = {};
            const re = /^[0-9]+$/;
            if (re.test(this.state.searchText)) {
                phoneNumObj = utilities.parsePhoneNum(this.state.searchText);
                if (phoneNumObj.phoneNumber.length !== 0) {
                    this.setState({
                        searchText: phoneNumObj.phoneNumber,
                        pixData: phoneNumObj.phoneNumber
                    }, () => {
                        if (this.state.pixData.length !== 15 || parseInt(this.state.pixData[5]) !== 9) {
                            this.setState({ error: true })
                        } else if (!utilities.validateParameters("ddd", this.state.pixData.substring(1, 3))) {
                            this.setState({ error: true })
                        }
                    })
                } else {
                    this.setState({
                        searchText: "",
                        pixData: "",
                    })
                }
            } else {
                this.setState({ error: true })
            }
        } else if (this.state.searchResults === localeObj.email_type && this.state.searchText !== '') {
            let email = "";
            const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}(?![^@]*[\W_])$/;
            if (emailRegex.test(this.state.searchText)) {
                email = this.state.searchText
                if (email.length !== 0) {
                    this.setState({
                        searchText: email,
                        pixData: email
                    })
                } else {
                    this.setState({
                        searchText: "",
                        pixData: "",
                    })
                }
            } else {
                this.setState({ error: true })
            }
        } else {
            this.setState({
                pixData: value,
                searchText: value
            });
        }
    }

    selectedkey = (field) => {
        this.fetchType(field)
        this.setState({
            searchResults: field
        }, () => {
            this.props.pixBottomSheet(false)
            this.parsePixKey(field)
        })
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
    sendToAccount = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.setTransactionInfo("account");
    }
    componentWillUnmount() {
        clearTimeout(this.timerId); // Clear timer on component unmount
    }

    onCancel = () => {
        this.props.pixBottomSheet(false);
    }

    listContact = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.setTransactionInfo(localeObj.contact_plural);
    }

    render() {
        const { searchText, loading } = this.state;
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        return (
            <div style={{ overflow: "hidden" }}>
                <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                        <FlexView column style={InputThemes.largestInitialMarginStyle}>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                <span>{localeObj.pix_transfer_to}</span>
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                <span>{localeObj.pix_transfer_info_header}</span>
                            </div>
                        </FlexView>
                        <div style={{ marginTop: "3rem" }}>
                            <MuiThemeProvider theme={theme1}>
                                <TextField label={localeObj.enter_pix_key} type="text"
                                    // error={this.state.error}
                                    value={searchText}
                                    onChange={this.handleChange}
                                    InputProps={{
                                        endAdornment: loading && <CircularProgress style={{ color: ColorPicker.loaderColor }} size={20} />,
                                        classes: { underline: classes.underline },
                                        className: classes.finalInput
                                    }}
                                    InputLabelProps={{ className: classes.finalStyle }}
                                    autoComplete='off'
                                    FormHelperTextProps={{ className: classes.helpertextstyle }}
                                    helperText={this.state.error ? localeObj.transfer_key_error : ""}
                                />
                                <div className="pixEditButton body2" style={{ margin: "0rem 1.5rem" }}>
                                    <span className='highEmphasis'>{localeObj.or}</span>
                                    <ColoredTextButton className='duskHorizon' onClick={this.sendToAccount}>{localeObj.send_to_account} <ArrowIcon style={{ fill: ColorPicker.duskHorizon, marginLeft: "0.5rem", fontSize: "0.7rem" }} /></ColoredTextButton>
                                </div>
                            </MuiThemeProvider>
                        </div>

                        {/* <div style={{ marginTop: "0.5rem", marginLeft: "1.5rem", overflowY: "auto", height: screenHeight > 900 ? this.state.error ? `${screenHeight - 650}px` : `${screenHeight - 600}px` : this.state.error ? `${screenHeight - 594}px` : `${screenHeight - 551}px`, overflowX: "hidden" }}>
                        <div className="subtitle6" style={{ color: ColorPicker.lighterAccent, textAlign: "left" }}>
                            <span>{localeObj.frequent_contacts}</span>
                        </div>
                        <div style={{ margin: "1rem" }}>
                            {contacts.map((opt, key) => (
                                <ListItem button>
                                    <div className="pixSuggestionText contactInitial justifyCenter">{this.initial()}</div>
                                    <ListItemText className="body2 highEmphasis" primary={opt.name} />
                                    <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                </ListItem>
                            ))}
                        </div>
                    </div> */}
                        <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                            <PrimaryButtonComponent style={this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle} btn_text={this.state.searchResults === "" || this.state.error ? localeObj.transfer : (localeObj.transfer_to + ' ' + this.state.field)} onCheck={this.sendField} disabled={this.state.searchText.length === 0 || this.state.loading || this.state.error ? true : false} />
                            <SecondaryButtonComponent btn_text={localeObj.contact_list} onCheck={this.listContact} />
                        </div>
                    </div>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.props.pixTypeBs}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.type_of_key}
                                </div>
                            </FlexView>
                        </div>
                        <FlexView column align="left" style={{ marginLeft: "4%", marginRight: "4%", marginTop: "2%" }} onClick={this.cancelAccount}>
                            <List style={{
                                marginLeft: "4%", marginRight: "7%",
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }} onClick={() => this.selectedkey("CPF")}>
                                <FlexView column>
                                    <div className="body1 highEmphasis">{localeObj.pix_cpf_cnpj}</div>
                                </FlexView>
                                <div style={{ marginTop: "3%" }}>
                                    <ArrowIcon className="accent" style={{ fontSize: "1rem" }} onClick={this.cancelAccount} />
                                </div>
                            </List>
                            <List style={{
                                marginLeft: "4%", marginRight: "7%", marginTop: "2%",
                                display: "flex", justifyContent: "space-between", alignItems: "center"
                            }} onClick={() => this.selectedkey(localeObj.phone_type)}>
                                <FlexView column >
                                    <div className="body1 highEmphasis">{localeObj.phone_number}</div>
                                </FlexView>
                                <div style={{ marginTop: "3%" }}>
                                    <ArrowIcon className="accent" style={{ fontSize: "1rem" }} onClick={this.cancelAccount} />
                                </div>
                            </List>
                            <div style={{ width: "100%", marginBottom: "1rem", textAlign: "center" }}>
                                <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onCancel} />
                            </div>
                        </FlexView>
                    </Drawer>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={2000} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

NewPixTransfer.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    requiredInfo: PropTypes.object,
    setTransactionInfo: PropTypes.func
};

export default withStyles(styles)(NewPixTransfer)