import React from "react";
import PropTypes from "prop-types";
import InputThemes from "../../Themes/inputThemes";

import moment from "moment";
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
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import LongList from "../CommonUxComponents/LongListComponent";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import GeneralUtilities from "../../Services/GeneralUtilities";
import CalenderPicker from "../CommonUxComponents/CalenderPicker";
import utilities from "../../Services/NewUtilities";
import gift_card_form from "../../images/SpotIllustrations/Gift_Card_Google1.webp";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import GiftCardAddressComp from "./GiftCardAddressComp";
import PageNames from "../../Services/PageNames";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import GiftCardPrivacyComp from "./GiftCardPrivacyComp";

const snackBar = InputThemes.snackBarTheme;
const theme1 = InputThemes.DetailsTheme;
const styles = InputThemes.multipleInputStyle;
var localeObj = {};
const PageNameJSON = PageNames.GiftCardComponents;
const screenHeight = window.innerHeight;
const MINIMUM_NAME_LENGTH = 2;
const MAXIMUM_NAME_LENGTH = 50;
class GiftCardFormComponent extends React.Component {
    constructor(props) {
        super(props);

        this.componentName = PageNameJSON['gift_card_form'];
        this.state = {
            name: "",
            docType: androidApiCalls.getFromPrefs("docType"),
            phoneNumber: "",
            dob: "",
            areDetailsEmpty: false,
            motherName: "",
            email: "",
            cpf: "",
            ddd: "",
            cep: "",
            address: {},
            gcOptions: {},
            cepFinal: "",
            checked: false,
            snackBarOpen: false,
            maxDay: moment().subtract(1, 'days'),
            fieldOpen: false,
            datePicker: false,
            privacy: false
        }

        this.sendField = this.sendField.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.maxBirthday = new Date(moment().subtract(18, 'years').subtract(1, 'days'));
        this.minBirthDay = new Date(moment(new Date()).subtract(150, 'years').subtract(1, 'days'));
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(this.componentName);
    }


    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        window.onBackPressed = () => {
            if(this.state.privacy) {
                this.setState({
                    privacy: false
                })
                return;
            }
            this.goToMotoPayLandingPage();  
        }
    }

    onChangeChecked = () => {
        Log.sDebug("User clicked on checkbox for terms");
        this.setState({
            checked: !this.state.checked
        })
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
        window.removeEventListener("resize", this.checkIfInputIsActive);
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

    onBack = () => {
        this.setState({
            editAddress: false
        });
        window.onBackPressed = () => {
            if(this.state.privacy) {
                this.setState({
                    privacy: false
                })
                return;
            }
            this.goToMotoPayLandingPage();
        }
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

    sendField = () => {
        if ((this.state.phoneNumber === "") || (this.state.cpf === "") ||
        (this.state.dob === "") || (this.state.cep === "")||  (this.state.name.replace(/ /g, "") === "") || (this.state.email.replace(/ /g, "") === "")) {
            this.openSnackBar(localeObj.enter_all_details);
            return;
        }
        if (this.state.name.length > MAXIMUM_NAME_LENGTH || this.state.name.length < MINIMUM_NAME_LENGTH) {
            this.openSnackBar(localeObj.fullname + " " + localeObj.lengthError);
            return;
        }
        if (this.state.field.length !== 11) {
            this.openSnackBar(localeObj.check_cpf);
            return;
        }
        if ((!utilities.validateParameters("ddd", this.state.ddd) || (this.state.mobNum.length !== 9 || parseInt(this.state.mobNum[0]) !== 9))) {
            this.openSnackBar(localeObj.enter_valid_phoneNumber);
            return;
        } 
        if (!utilities.validateParameters("E-mail", this.state.email)) {
            this.openSnackBar(localeObj.enter_valid_email)
            return;
        }
        if(this.state.cepFinal.length !== 8) {
            this.openSnackBar( GeneralUtilities.formattedString(localeObj.invalid, [localeObj.cep]))
            return;
        }     
        let myDate = this.state.dob;
        let [day, month, year] =  myDate.split('/');
        let newDate = `${month}/${day}/${year}`;
        let dob = new Date(newDate);
        if (dob === "Invalid Date" && isNaN(dob)) {
            this.openSnackBar(localeObj.date_validation_error);
            return;
        }
        let maxDate = new Date(this.maxBirthday);
        let minDate = new Date(this.minBirthDay);
        if (dob.getTime() > maxDate.getTime()) {
            this.openSnackBar(localeObj.birthDayError);
            return;
        } else if (dob.getTime() < minDate.getTime()) {
            this.openSnackBar(localeObj.underAgeError);
            return;
        }

        // if (this.state.motherName.length > MAXIMUM_NAME_LENGTH || this.state.motherName.length < MINIMUM_NAME_LENGTH) {
        //     this.openSnackBar(localeObj.reg_mother_name + " " + localeObj.lengthError);
        //     return;
        // }   
       
        let gcOptions = {};
        gcOptions["phoneNumber"] = this.state.phoneNumber;
        gcOptions["ddd"] = this.state.ddd;
        //gcOptions["motherName"] = this.state.motherName;
        gcOptions["cpf"] = this.state.field;
        gcOptions["dob"] = moment(this.state.finalDob).format("YYYY-MM-DD");
        gcOptions["name"] = this.state.name;
        gcOptions["mobNum"] = this.state.mobNum;
        gcOptions["email"] = this.state.email;
        gcOptions["cep"] = this.state.cep;
        this.setState({
            gcOptions: gcOptions
        })

       MetricServices.onPageTransitionStop(this.componentName, PageState.close);
       this.props.sendEventMetrics(constantObjects.confirmForm, PageNameJSON["gift_card_form"]);
       this.consultCEP(this.state.cep)
    }

    consultCEP = (cep) => {
        this.showProgressDialog();
        ArbiApiService.consultCEPGiftCard(cep, this.componentName)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    Log.debug("consultCEP " + JSON.stringify(response), "Address CEP page");
                    let processorResponse = ArbiResponseHandler.processGetAddressResponseGiftCard(response.result);
                    if (processorResponse.success) {
                        
                        let detailsObject = processorResponse.address;
                        let street = GeneralUtilities.areAllArgsValid(detailsObject["street"]) ? detailsObject["street"] + ", " : "";
                        let neighbourhood = GeneralUtilities.areAllArgsValid(detailsObject["neighbourhood"]) ? detailsObject["neighbourhood"] : "";
                        let addressString = street + neighbourhood
                        + ", " + detailsObject["city"] + "-" + detailsObject["uf"] + " "
                        + localeObj.cep + " - " + detailsObject["cep"];
                       Log.sDebug("address:" + addressString);
                        this.setState({
                            address: detailsObject,
                            addressString: addressString,
                            editAddress: true
                        });
                         
                    } else {
                        this.openSnackBar(localeObj.cep_doesnt_exist);
                        return;
                    }
                } else {
                    this.openSnackBar(localeObj.tryAgainLater);
                    return;
                }
            });
    }

   

    handleChange = name => event => {
        if (name === "phoneNumber" && event.target.value.length !== 0) {
            let phoneNumObj = {};
            const re = /^[0-9/(/)/ /-]+$/;
            if (re.test(event.target.value)) {
                phoneNumObj = utilities.parsePhoneNum(event.target.value);
                if (phoneNumObj.phoneNumber.length !== 0) {
                    this.setState({
                        ddd: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(0, 2),
                        mobNum: phoneNumObj.phoneNumber.replace(/[^0-9]/g, '').substr(2, 11),
                        phoneNumber: phoneNumObj.phoneNumber
                    })
                } else {
                    this.setState({
                        ddd: "",
                        mobNum: "",
                        phoneNumber: ""
                    })
                }
            }
           
        } else if (name === "cpf" && event.target.value.length !== 0) {
            const re = /^[0-9.-]+$/;
            if (re.test(event.target.value)) {
                let cpfObj = {}
                cpfObj = utilities.parseCPF(event.target.value);
                this.setState({
                    cpf:cpfObj.displayCPF,
                    field: cpfObj.displayCPF.replace(/[^0-9]/g, '')
                })
            }
        } else if ((name === "name"  || name === "motherName")
            && event.target.value.length !== 0) {
            const re = /^[a-zA-Z\u00C0-\u00FF ]+$/;
            if (re.test(event.target.value)) {
                this.setState({ [name]: event.target.value });
            }
        } else if (name === "cep" && event.target.value.length !== 0) {
            const re = /^[0-9-]+$/;
            if (re.test(event.target.value)) {
                let cepObj = {};
                cepObj = utilities.parseCEP(event.target.value);
                this.setState({
                    cep: cepObj.cepDisp,
                    cepFinal: cepObj.cepDisp.replace(/[^0-9]/g, '')
                })
            }
        } else if (name === "dob") {
            this.setState({
                datePicker: true,
            });
        } else {
            this.setState({ [name]: event.target.value });
        }
    };

    confirm = (value) => {
        this.props.multipleSelection(false);
        this.setState({
            openList: false
        })
        if (this.state.type === "State") {
            this.setState({ issueState: value });
        } else {
            this.setState({ ufIssueOrg: value });
        }
    }

    confirmDate = (field) => {
        this.setState({
            dob: moment(field).format('DD/MM/YYYY'),
            finalDob: field,
            datePicker: false
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }
    openPrivacyPolicy = () => {
        this.setState({
            privacy: true
        })
    }

    goToMotoPayLandingPage = () => {
        this.props.goToMotoPayLandingPage();
    }

    mayBeLater = () => {
        this.props.sendEventMetrics(constantObjects.mayBeLaterForm, PageNameJSON["gift_card_form"]);
        this.props.mayBeLater();
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    openTermsLink = () => {
        androidApiCalls.openUrlInBrowser("https://regulamento.contadigitalmotorola.com.br/Regulamento_Gift_Card_Dimo.html");
    }

    onCancel = () => {
        if(this.state.privacy) {
            this.setState({
                privacy: false
            })
        }
    }

    setAddress = (json) => {
        this.setState(
            (prevState) => ({
                address: {
                    ...prevState.address,
                    number: json.addNumber,
                    complement: json.compliment
                }
            }),
            () => {
                this.props.sendEventMetrics(constantObjects.acceptGCCreation, PageNameJSON["gift_card_address"]);
                window.onBackPressed = null;
                this.props.receiveDetails(this.state.gcOptions, this.state.address);
                Log.sDebug("setAddress:" + JSON.stringify(this.state.address));
            }
        );
      
       
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
       
        return (
            <div>
           {this.state.privacy && 
           <div>
                <ButtonAppBar header={localeObj.gift_card_dimo }  onCancel={this.onCancel} action={"cancel"} inverse={this.state.privacy} />
                <GiftCardPrivacyComp/>
           </div>
           }
           {!this.state.privacy && 
            <div>
            {
                this.state.editAddress && 
                <GiftCardAddressComp header={localeObj.gift_card_form_address_head} address={this.state.address} addressString={this.state.addressString} onBack= {this.onBack}
                openPrivacyPolicy = {this.openPrivacyPolicy} openTermsLink = {this.openTermsLink} recieveField={this.setAddress} />
            }
            <div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div style={{ display: this.state.openList ? 'block' : 'none' }}>
                    {this.state.openList && <LongList type={this.state.type} header={this.state.header} confirm={this.confirm} />}
                </div>
                <div style={{ display: this.state.datePicker ? 'block' : 'none' }}>
                    {this.state.datePicker && <CalenderPicker value={this.state.dob === "" ? this.maxBirthday : this.state.finalDob} minDate={this.minBirthDay} maxDate={this.maxBirthday} confirm={this.confirmDate} />}
                </div>
                {
                !this.state.editAddress && 
                <div style={{ display: !this.state.processing && !this.state.openList && !this.state.datePicker ? 'block' : 'none' }}>
                    <div style={{ overflowY: "auto", height: this.state.fieldOpen ? `${finalHeight * 0.4}px` : `${finalHeight * 0.7}px`, overflowX: "hidden" }}>
                    <div style={{textAlign:"center" }} >
                            <img style={{ width: "100%", height:"12rem"}} src={gift_card_form} alt=""></img>
                            {/*<div align="left" style={{ position: 'absolute', top: "20%", left: "8%", right: 0, bottom: 0, width: "85%" }}>
                                <div style={{display: 'flex', marginBottom: "1rem"}}>
                                    <img style={{ width: "auto", height: "1.5rem", marginRight: "1rem" }} src={gift_card_dimo_logo}/> 
                                    <span className="headline5 highEmphasis">{"+"}</span>
                                    <img style={{ width: "auto", height: "1.5rem",marginLeft:"1rem", marginRight: "1rem" }} src={gift_card_gpay_logo}/> 
                                    <span className="headline5 highEmphasis">{"+"}</span>
                                    <img style={{ width: "auto", height: "1.25rem",marginLeft:"1rem", }} src={visa}/> 
                                </div>
                                <div className="headline5 highEmphasis" style={{ marginBottom: "1rem"}}>{localeObj.gift_card_form_head}</div>
                                <div className="body2 highEmphasis">{localeObj.gift_card_form_desc}</div> 
                            </div>
                            */}
                        </div>
                        <div >                            
                        </div>
                        <MuiThemeProvider theme={theme1}>
                            <TextField label={localeObj.fullname}
                                onChange={this.handleChange("name")} value={this.state.name || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.name === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.name === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                            <TextField label={localeObj.cpf} type={'tel'}
                                onChange={this.handleChange("cpf")} value={this.state.cpf || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.cpf === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.cpf === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                             <TextField label={localeObj.gift_card_form_email}
                                onChange={this.handleChange("email")} value={this.state.email || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.email === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.phoneNumber === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                            <TextField label={localeObj.gift_phone_number} type={'tel'}
                                onChange={this.handleChange("phoneNumber")} value={this.state.phoneNumber || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.phoneNumber === "" ? classes.input : classes.finalInput
                                }} autoComplete='off'
                                InputLabelProps={this.state.phoneNumber === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                FormHelperTextProps={{ className: classes.helpertextstyle }}
                                placeholder="(00) 00000 0000"
                                helperText={utilities.validateParameters("ddd", this.state.ddd) ? "" : localeObj.incorrect_ddd}
                                error={utilities.validateParameters("ddd", this.state.ddd) ? false : true}
                            />
                            <TextField label={localeObj.dob}
                                onClick={this.handleChange("dob")}
                                InputLabelProps={this.state.dob === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.dob === "" ? classes.input : classes.finalInput
                                }}
                                value={this.state.dob === "undefined" || this.state.dob === ""? "" : moment(this.state.dob, 'DD/MM/YYYY', true).isValid() ?
                                    this.state.dob : moment(this.state.dob, "YYYY-MM-DD").format("DD/MM/YYYY")} />
                       
                            {/*<TextField label={localeObj.reg_mother_name} autoComplete='off'
                                onChange={this.handleChange("motherName")} value={this.state.motherName || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.motherName === "" ? classes.input : classes.finalInput
                                }}
                                InputLabelProps={this.state.motherName === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />*/}

                            <TextField label={localeObj.cep} type={'tel'}
                                onChange={this.handleChange("cep")} value={this.state.cep || ""}
                                InputProps={{
                                    classes: { underline: classes.underline },
                                    className: this.state.cep === "" ? classes.input : classes.finalInput
                                }}
                                autoComplete='off'
                                InputLabelProps={this.state.cep === "" ?
                                    { className: classes.input } : { className: classes.finalStyle }}
                            />
                        </MuiThemeProvider>
                    </div>
                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <div style={{ margin: "1.5rem 1rem", display: this.state.fieldOpen ? "none" : "block" }}>
                        <div style={{marginLeft:"0.5rem", marginRight:"0.5rem"}}>
                            <span className="body2 highEmphasis">{localeObj.gift_card_form_agree1}</span>
                            <span className="body2 highEmphasis" style={{ textDecoration: 'underline'}}  onClick={() => {this.openPrivacyPolicy()}}>{localeObj.gift_card_form_agree2}</span>
                            <span className="body2 highEmphasis">{localeObj.gift_card_form_agree5}</span>
                            <span className="body2 highEmphasis" style={{ textDecoration: 'underline'}}  onClick={() => {this.openTermsLink()}}>{localeObj.gift_card_form_agree4}</span>
                            <span className="body2 highEmphasis">{localeObj.gift_card_form_agree3}</span>
                        </div>   
                        </div> 
                        <PrimaryButtonComponent btn_text={localeObj.gift_card_form_btn_primary1} onCheck={this.sendField} />
                        {<div className="body2 highEmphasis" style={{ textAlign: "center", marginTop: "1.5rem" }} onClick={() => {this.mayBeLater()}}>
                            {localeObj.gift_card_form_btn_secondary}
                      </div>}
                    </div>
                </div> }
                <MuiThemeProvider theme={snackBar}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
            </div>}
            </div>
        )
    }
}

GiftCardFormComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    sendEventMetrics: PropTypes.func,
    multipleSelection: PropTypes.func,
    goToMotoPayLandingPage: PropTypes.func,
    mayBeLater: PropTypes.func,
    receiveDetails: PropTypes.func
};

export default withStyles(styles)(GiftCardFormComponent);

