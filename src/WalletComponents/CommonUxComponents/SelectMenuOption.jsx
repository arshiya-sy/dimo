import React from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";

import { MuiThemeProvider } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import ArbiApiService from "../../Services/ArbiApiService";
import localeService from "../../Services/localeListService";
import PrimaryButtonComponent from "./PrimaryButtonComponent";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import androidApiCalls from "../../Services/androidApiCallsService";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CustomizedProgressBars from './ProgressComponent';
import MetricServices from "../../Services/MetricsService";
import PageState from '../../Services/PageState';
import Log from '../../Services/Log';
import constantObjects from '../../Services/Constants';
import ColorPicker from '../../Services/ColorPicker';

const theme1 = InputThemes.OperatorMenuTheme;
const theme2 = InputThemes.snackBarTheme;
const feature_available = "RNE_DOCUMENT_SCAN_SUPPORT"
var localeObj = {};

export default class SelectMenuOption extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            field: "",
            menuOptions: [],
            checkedValues: [],
            snackBarOpen: false
        }
        this.docOptions = [];
        this.genderOptions = [];
        this.politicallyExposed = [];
        this.keyOptions = [];
        this.transferOptions = [];
        this.salaryOptions = [];

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = this.props.type;
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);

        if (androidApiCalls.isFeatureEnabledInApk(feature_available)) {
            this.docOptions = [localeObj.rg, localeObj.cnh, localeObj.rne];
        } else {
            this.docOptions = [localeObj.rg, localeObj.cnh];
        }

        this.genderOptions = [localeObj.female, localeObj.male];
        this.politicallyExposed = [localeObj.no, localeObj.yes];
        this.transferOptions = [localeObj.pix, localeObj.transfer_money];
        this.pixOptions = [
            localeObj.phone_number,
            localeObj.evp_key,
            localeObj.email,
            localeObj.pix_cpf_cnpj,
            localeObj.acc_no,
            localeObj.contact_plural
        ];
        this.contactOptions = [
            localeObj.phone_number,
            localeObj.email,
            localeObj.cpf,
            localeObj.cnpj,
            localeObj.evp_key,
        ];
        this.contactOptionsWithOutCpf = [
            localeObj.phone_number,
            localeObj.email,
            localeObj.cnpj,
            localeObj.evp_key,
        ];
        this.cardOptions = [
            localeObj.damage,
            localeObj.stolen,
            localeObj.lost
        ];
        this.cancelOptions = [
            localeObj.response_time,
            localeObj.slow,
            localeObj.errors,
            localeObj.benefits,
            localeObj.absence,
            localeObj.difficulty,
            localeObj.category_others,
        ];
        this.salaryOptions = [
            localeObj.salary_op1,
            localeObj.salary_op2,
            localeObj.salary_op3,
            localeObj.salary_op4,
            localeObj.salary_op5
        ]
        switch (this.props.type) {
            case "Doc":
                if (this.props.value !== "") {
                    this.setInitialId(this.docOptions.findIndex(obj => obj === this.props.value));
                }
                return this.setState({
                    menuOptions: this.docOptions
                })
            case "Gender":
                if (this.props.value !== "") {
                    this.setInitialId(this.genderOptions.findIndex(obj => obj === this.props.value));
                }
                return this.setState({
                    menuOptions: this.genderOptions
                })
            case "Political":
                if (this.props.value !== "") {
                    this.setInitialId(this.politicallyExposed.findIndex(obj => obj === this.props.value));
                }
                return this.setState({
                    menuOptions: this.politicallyExposed
                })
            case "Keys":
                this.setItemList();
                break;
            case "Transfer":
                if (parseInt(androidApiCalls.getDAStringPrefs("options")) !== -1) {
                    this.setInitialId(parseInt(androidApiCalls.getDAStringPrefs("options")));
                }
                return this.setState({
                    menuOptions: this.transferOptions
                })
            case "PIX":
                if (this.props.value !== "") {
                    this.setInitialId(this.pixOptions.findIndex(obj => obj === this.props.value));
                }
                return this.setState({
                    menuOptions: this.pixOptions
                })
            case "Contact":
                if (this.props.value !== "" && !this.props.cpfAdded) {
                    this.setInitialId(this.contactOptions.findIndex(obj => obj === this.props.value));
                } else if (this.props.value !== "" && this.props.cpfAdded) {
                    this.setInitialId(this.contactOptionsWithOutCpf.findIndex(obj => obj === this.props.value));
                }
                if (this.props.cpfAdded) {
                    this.setState({
                        menuOptions: this.contactOptionsWithOutCpf
                    })
                } else {
                    this.setState({
                        menuOptions: this.contactOptions
                    })
                }
                break;
            case "Card":
                if (this.props.value !== "") {
                    this.setInitialId(this.cardOptions.findIndex(obj => obj === this.props.value));
                }
                return this.setState({
                    menuOptions: this.cardOptions
                })
            case "PortCancel":
                if (this.props.value !== "") {
                    this.setInitialId(this.props.value - 1);
                }
                return this.setState({
                    menuOptions: this.cancelOptions
                })
            case "salary":
                if (this.props.value !== "") {
                    this.setInitialId(this.salaryOptions.findIndex(obj => obj === this.props.value));
                }
                return this.setState({
                    menuOptions: this.salaryOptions
                })
            default:
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

    async setInitialId(boxId) {
        let ele = await this.getElementByIdAsync(boxId);
        ele.style.borderWidth = "3px";
        ele.style.border = "3px solid transparent";
        ele.style.background = "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box";
        this.setState({
            currentId: boxId,
            checkedValues: [boxId],
            field: this.getField(boxId)
        })
    }

    getField = (index) => {
        switch (this.props.type) {
            case "Doc":
                return this.state.menuOptions[index];
            case "Gender":
                return index === 0 ? 'F' : 'M';
            case "Political":
            case "PIX":
                return this.state.menuOptions[index];
            case "Contact":
                return this.state.menuOptions[index];
            case "Keys":
            case "Transfer":
                return index
            case "Card":
                return index;
            case "PortCancel":
                return index + 1;
            case "salary":
                return this.state.menuOptions[index];
            default:
        }
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

    setItemList = async () => {
        let pixKeys = [];
        this.props.changeBlockBackButton(true);
        let response = {};
        if (ImportantDetails.pixKeysResponse === null ||
            ImportantDetails.pixKeysResponse == {} || ImportantDetails.fromRegisterPixKey
            || Object.keys(ImportantDetails.pixKeysResponse).length === 0) {
            this.showProgressDialog();
            await ArbiApiService.getAllPixKeys(this.componentName).then(pixResponse => {
                this.hideProgressDialog();
                response = pixResponse;
                ImportantDetails.pixKeysResponse = pixResponse;
                ImportantDetails.fromRegisterPixKey = false;
            });
        } else {
            response = ImportantDetails.pixKeysResponse;
        }
        this.props.changeBlockBackButton(false);
        if (response.success) {
            let responseHandler = ArbiResponseHandler.processGetAllPixKeysResponse(response.result);
            if (responseHandler.success) {
                pixKeys = responseHandler.pixKeys
                Log.debug("mypixkeys " + JSON.stringify(pixKeys));
                this.setkeyList(pixKeys);
            } else {
                this.setkeyList(pixKeys);
            }
        } else {
            Log.debug("SelectMenuOption|" + ImportantDetails.accountKey + " there is some error " + JSON.stringify(response));
            this.setkeyList(pixKeys);
        }
    }

    setkeyList = (MyPixKeys) => {
        for (let i = 0; i < MyPixKeys.length; i++) {
            Log.debug("key type " + MyPixKeys[i].key_type);
            if (MyPixKeys[i].key_type === "CPF") {
                const keyList = [
                    localeObj.phone_number,
                    localeObj.evp_key,
                    localeObj.email
                ];
                if (this.props.value !== "") {
                    this.setInitialId(keyList.findIndex(obj => obj === this.props.value));
                }
                this.setState({
                    menuOptions: keyList
                })
                return;
            }
        }
        const keyList = [
            localeObj.phone_number,
            localeObj.evp_key,
            localeObj.email,
            localeObj.cpf
        ];
        if (this.props.value !== "") {
            this.setInitialId(keyList.findIndex(obj => obj === this.props.value));
        }
        this.setState({
            menuOptions: keyList
        })
    }

    getElementByIdAsync = id => new Promise(resolve => {
        const getElement = () => {
            const element = document.getElementById(id);
            if (element) {
                resolve(element);
            } else {
                requestAnimationFrame(getElement);
            }
        };
        getElement();
    });

    setChecked = (boxId) => {
        if (this.props.type === "Transfer") {
            androidApiCalls.setDAStringPrefs("options", String(boxId));
        }
        let ele = document.getElementById(this.state.currentId);
        if (ele) {
            ele.style.border = "1px solid " + ColorPicker.darkMediumEmphasis;
            ele.style.background = "none";
        }
        document.getElementById(boxId).style.borderWidth = "3px";
        document.getElementById(boxId).style.border = "3px solid transparent";
        document.getElementById(boxId).style.background = "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box";

        this.setState({
            currentId: boxId,
            checkedValues: [boxId],
            field: this.getField(boxId)
        })
    }

    sendField = () => {
        if (this.state.field === "") {
            this.openSnackBar(localeObj.optionError);
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.recieveField(this.state.field);
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

    render() {
        const screenHeight = window.screen.height;
        return (
            <div className="scroll" style={{ height: this.props.footNote ? `${screenHeight * 0.67}px` : `${screenHeight * 0.71}px`, overflowY: "auto", overflowX: "hidden" }}>
                <MuiThemeProvider theme={theme1}>
                    <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                        <div style={InputThemes.initialMarginStyle}>
                            <FlexView column>
                                <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                    {this.props.header}
                                </div>
                                <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.5rem" }}>
                                    {this.props.description}
                                </div>
                            </FlexView>
                        </div>
                        {this.state.menuOptions.map((opt, key) => (
                            <Paper id={key} key={key} elevation="0" style={{ border: "1px solid " + ColorPicker.darkMediumEmphasis, background: 'none' }}
                                variant="outlined" onClick={() => { this.setChecked(key) }}>
                                <span style={{ flex: "1", textAlign: "center" }} className="body1 highEmphasis">{opt}</span>
                            </Paper>

                        ))}

                        <div style={{ ...InputThemes.bottomButtonStyle, textAlign: this.props.type==="Political" ? "left" : "center" }}>
                            <div className="body2 highEmphasis" style={{ margin: "1.5rem" }}>
                                {this.props.footNote}
                            </div>
                            <PrimaryButtonComponent btn_text={this.props.btnText ? this.props.btnText : localeObj.next} onCheck={this.sendField} />
                        </div>
                    </div>
                    <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                        {this.state.processing && <CustomizedProgressBars />}
                    </div>
                </MuiThemeProvider>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        );
    }
}

SelectMenuOption.propTypes = {
    componentName: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.number,
    cpfAdded: PropTypes.bool,
    changeBlockBackButton: PropTypes.func,
    recieveField: PropTypes.func,
    footNote: PropTypes.string,
    header: PropTypes.string,
    description: PropTypes.string,
    menuOptions: PropTypes.arrayOf(PropTypes.string),
    btnText: PropTypes.string,
};
