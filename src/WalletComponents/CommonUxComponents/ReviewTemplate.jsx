import React from 'react';
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import moment from "moment";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import Log from "../../Services/Log";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import TextField from "@material-ui/core/TextField";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import CommonButtons from '../CommonUxComponents/CommonButtons';
import SecondaryButtonComponent from './SecondaryButtonComponent';
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import MetricServices from "../../Services/MetricsService";
import PageState from '../../Services/PageState';
import Utilities from "../../Services/NewUtilities";

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import TimeIcon from '@material-ui/icons/AccessTime';
import EditIcon from '@material-ui/icons/Edit';
import GeneralUtilities from '../../Services/GeneralUtilities';
import BottomSheetForKeys from '../PIXComponent/PixNewRecieve/BottomSheetForKeys';
import constantObjects from '../../Services/Constants';

import SourceIcon from "../../images/SvgUiIcons/send.svg";
import DestIcon from "../../images/SvgUiIcons/receive.svg";
import BoletoIcon from "../../images/SvgUiIcons/BarCode.svg";
import TransactionIcon from '../../images/SvgUiIcons/transaction.svg';
import HelloShopUtil from '../EngageCardComponent/HelloShopUtil';

const theme2 = InputThemes.snackBarTheme;
const theme1 = InputThemes.MultiLineInputTheme;
const styles = InputThemes.singleInputStyle;
const screenHeight = window.innerHeight;
const OutlineButton = CommonButtons.AwaitButton;
var localeObj = {};

const ColoredTextButton = withStyles({
    root: {
        color: ColorPicker.duskHorizon,
        textTransform: "none"
    },
})((props) => <Button color="default" {...props} />);

const SOFT_INPUT_ADJUST_NOTHING = 48; //0x30
const SOFT_INPUT_ADJUST_RESIZE = 16; //0x10

class ReviewComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            receiverInfo: {},
            amount: this.preSetDefault("amount") ? this.preSetDefault("amount") : "",
            decimal: this.preSetDefault("decimal") ? this.preSetDefault("decimal") : "",
            displayValue: "",
            date: GeneralUtilities.emptyValueCheck(props.dateChange) ? moment(moment.now()).format("DD/MM/YYYY") : moment(props.dateChange).format("DD/MM/YYYY"),
            scheduleDate: moment().format("DD/MM/YYYY"),
            editing: false,
            description: this.preSetDefault("description"),
            snackBarOpen: false,
            selectedKey: "",
            bottomSheet: false,
            dateEdit: false,
            tarrifColor: false,
            regularPayment: false,
            scheduled: false,
            descriptionNeeded: true,
            credIndication: false,
            source: false,
            dest: true,
            time: {},
            seconds: 10
        };
        this.setKey = this.setKey.bind(this);
        this.scheduleDate = new Date();
        this.minimumExpiryDate = new Date();
        this.maximumExpiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "Review Page"
        }
        this.timer = 0;
        this.countDown = this.countDown.bind(this);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        let json = {};
        if (this.props.requiredInfo) {
            Object.assign(json, this.props.requiredInfo);
        }
        this.setState({
            receiverInfo: json,
            selectedKey: json["keys"]
        });

        let hsTimeOutValue = HelloShopUtil.getTimeOutValue(JSON.stringify(this.props.requiredInfo));
        this.setState({
            seconds: hsTimeOutValue,
        });

        if (HelloShopUtil.isHelloShopDimopayQRPayment(JSON.stringify(this.props.requiredInfo))) {
            if (hsTimeOutValue > 0) {
                let timeLeftVar = GeneralUtilities.secondsToTime(hsTimeOutValue);
                this.setState({ time: timeLeftVar });
                this.startTimer();
            } else {
                let jsonObj = {};
                jsonObj["error"] = true;
                jsonObj["reason"] = HelloShopUtil.HS_TIMEOUT_ERROR_CODE;
                this.props.setTransactionInfo(jsonObj)
                this.stopCountDown();
            }
        }

        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        androidApiCalls.setSoftInputMode(SOFT_INPUT_ADJUST_NOTHING);

        this.setState({
            scheduled: GeneralUtilities.emptyValueCheck(json.scheduled) ? false : json.scheduled,
            scheduleDate: GeneralUtilities.emptyValueCheck(json.scheduledDate) ? moment().format("DD/MM/YYYY") : json.scheduledDate
        });

        switch (json["transferType"]) {
            case "Withdraw":
            case "Saque":
                this.setState({
                    descriptionNeeded: false,
                    tarrifColor: true,
                    atm: true
                })
                break;
            case "Phone Recharge":
            case "Recarga":
                this.setState({
                    descriptionNeeded: false,
                    source: true,
                    dest: false
                })
                break;
            case "Boleto generation":
            case "Geração de boleto":
                this.setState({
                    descriptionNeeded: false,
                    credIndication: true,
                    dest: false
                })
                break;
            case "TED":
                this.setState({
                    descriptionNeeded: false,
                    regularPayment: true,
                    tarrifColor: true,
                })
                break;
            case "Boleto":
                this.setState({
                    regularPayment: false,
                    descriptionNeeded: false,
                })
                this.maximumExpiryDate = new Date(json.receiver.DueDate);
                break;
            case "Dimo QR code":
                this.setState({
                    regularPayment: false,
                    descriptionNeeded: false,
                })
                break;
            case "Pix Withdraw":
                this.setState({
                    descriptionNeeded: false,
                    tarrifColor: false,
                    atm: true
                })
                break;
            case "Pix Saque":
                this.setState({
                    descriptionNeeded: false,
                    tarrifColor: false,
                    atm: true
                })
                break;
            default: break;
        }
        if (this.props.requiredInfo.keys) {
            this.setState({
                source: true,
                dest: false
            })
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
        window.removeEventListener("resize", this.checkIfInputIsActive);
        androidApiCalls.setSoftInputMode(SOFT_INPUT_ADJUST_RESIZE);
        this.stopCountDown();
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

    changeEditStatus = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.back);
        if (this.props.requiredInfo.keys) {
            let jsonObject = {};
            jsonObject["key"] = this.state.selectedKey;
            jsonObject["desc"] = this.state.description;
            this.props.back(jsonObject);
        } else {
            if (this.state.descriptionNeeded) {
                this.props.back(this.state.description);
            } else {
                this.props.back();
            }
        }
    }

    formatDate = (date) => {
        return moment(date).format("DD/MM/YYYY");
    }

    getOrdinal = (date) => {
        return moment(date).format('Do');
    }

    preSetDefault = (key) => {
        if (!!this.props.requiredInfo && !!this.props.requiredInfo[key]) {
            return this.props.requiredInfo[key];
        }
        else {
            return "";
        }
    }

    handleBlur = () => {
        this.handleLogging("Done editing amount");
        if (this.validAmount()) {
            this.setState({ editing: !this.state.editing })
        }
    }

    handleDescriptionChange = (event) => {
        if (event.target.value.toString().length <= 140) {
            this.setState({ description: event.target.value })
        } else {
            this.openSnackBar(localeObj.desc_error);
        }
    }

    handleLogging = (logs) => {
        Log.sDebug(logs, this.props.componentName);
    }

    sendField = () => {
        this.handleLogging("clicked next");
        if (!this.props.requiredInfo.keys) {
            let jsonObject = {};
            if (this.state.receiverInfo["transferType"].toLowerCase().includes("pix")) {
                jsonObject["editDate"] = false;
            }
            jsonObject[localeObj.date] = moment(moment().format("DD/MM/YYYY")).isSame(moment(this.state.date).format("DD/MM/YYYY"), "day") ? (localeObj.pix_today + ", " + this.state.date) : "" + this.state.date;
            jsonObject[localeObj.pix_type] = this.state.receiverInfo["transferType"];
            if (this.state.description !== "" && this.state.description !== undefined) {
                jsonObject[localeObj.pix_description] = this.state.description;
            }
            if (!(this.state.receiverInfo["transferType"].toLowerCase().includes("pix")) && this.state.receiverInfo["tariff"]) {
                jsonObject[localeObj.tariff] = this.state.receiverInfo["tariff"];
            }
            Log.sDebug(JSON.stringify(jsonObject));
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.setTransactionInfo(jsonObject);
        } else {
            let jsonObject = {};
            jsonObject["selectedKey"] = this.state.selectedKey;
            jsonObject["description"] = this.state.description ? this.state.description : "";
            this.props.setTransactionInfo(jsonObject);
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
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

    setKey = (selectedKey) => {
        this.setState({
            selectedKey: selectedKey,
        })
    }

    openBottomSheet = () => {
        this.setState({
            bottomSheet: !this.state.bottomSheet
        })
    }

    editDate = () => {
        let jsonObject = {};
        jsonObject["editDate"] = true;
        jsonObject["description"] = this.state.description ? this.state.description : "";
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.setTransactionInfo(jsonObject);
    }

    confirmDate = (field) => {
        if (this.state.regularPayment) {
            this.scheduleDate = field["date"];
            this.setState({
                scheduleDate: field["monthly"] ? this.getOrdinal(field["date"]) : this.formatDate(field["date"]),
                dateEdit: !this.state.dateEdit
            })
        } else {
            this.scheduleDate = field;
            this.setState({
                scheduleDate: this.formatDate(field),
                dateEdit: !this.state.dateEdit
            })
        }
    }

    selectKeyType = (type) => {
        if (type === "EVP") {
            return localeObj.evp_key;
        } else if (type === "PHONE") {
            return localeObj.phone_number;
        } else if (type === "EMAIL") {
            return localeObj.email;
        } else if (type === "CPF") {
            return localeObj.cpf;
        } else {
            return type;
        }
    }

    getEditStatus = () => {
        let enableEdit = false;
        if (this.state.receiverInfo &&
            (this.state.receiverInfo.amount === undefined && this.state.receiverInfo.decimal === undefined)) {
            enableEdit = true;
        }
        if (this.state.amount.toString() === "0" && this.state.decimal.toString() === "00") {
            enableEdit = true;
        }
        return enableEdit;
    }

    startTimer() {
        if (this.timer === 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    countDown() {
        // Remove one second, set state so a re-render happens.
        let seconds = this.state.seconds - 1;
        let secondsToTime = GeneralUtilities.secondsToTime(seconds);
        this.setState({
            time: secondsToTime,
            seconds: seconds,
        });
        // Check if we're at zero.
        if (seconds === 0) {
            let jsonObj = {};
            jsonObj["error"] = true;
            jsonObj["reason"] = HelloShopUtil.HS_TIMEOUT_ERROR_CODE;
            this.props.setTransactionInfo(jsonObj)
            this.stopCountDown();
        }
    }

    stopCountDown() {
        clearInterval(this.timer);
        this.timer = 0;
    }

    onBack() {
        if (this.state.bottomSheet) {
            this.setState({ bottomSheet: false })
        } else {
            this.props.back();
        }
    }

    render() {
        var unDisclosedAmount = false;
        if (this.state.receiverInfo && this.state.receiverInfo.transferType === localeObj.pix
            && this.state.receiverInfo.amount === "not_defined" && this.state.receiverInfo.decimal === "not_defined") {
            unDisclosedAmount = true;
        }

        const scheduleButtonContent = () => {
            let statement = "";
            if (this.state.scheduled) {
                if (!GeneralUtilities.emptyValueCheck(this.props.requiredInfo.recurrence)) {
                    if (this.props.requiredInfo.recurrence > 1) {
                        let displayDate = (GeneralUtilities.getLocale() === "en_US" ? moment(this.props.requiredInfo.scheduleNoFormat).format("Do") : moment(this.props.requiredInfo.scheduleNoFormat).format("D"));
                        statement = localeObj.scheduled_for + " " + displayDate;
                    } else {
                        statement = localeObj.schedule + " " + this.state.scheduleDate;
                    }
                } else {
                    statement = localeObj.schedule + " " + this.state.scheduleDate;
                }
            } else {
                statement = localeObj.immediate_send;
            }
            return statement
        }

        const finalHeight = window.screen.height;
        return (
            <div>
                <div style={{ display: !this.state.dateEdit ? "block" : "none" }}>
                    <div className="scroll" style={{ height: (this.state.fieldOpen) ? `${finalHeight * 0.42}px` : (this.props.requiredInfo.transferType === "Boleto") ? `${finalHeight * 0.65}px` : `${finalHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" }}>
                        <FlexView column overflow="scroll">
                            <MuiThemeProvider theme={theme1}>
                                <FlexView column style={InputThemes.initialMarginStyle}>
                                    <div className="headline5 highEmphasis" >
                                        {this.props.header}
                                    </div>
                                    <FlexView style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>
                                        {!unDisclosedAmount &&
                                            <div className="pixCurrencyStyle headline5 highEmphasis" style={{ marginRight: "0.375rem" }}>
                                                {"R$ "}
                                                <span>
                                                    <span className="headline2 balanceStyle highEmphasis">{Utilities.formatDisplayAmount(this.state.amount)}</span>
                                                    <span className="subScript headline5 highEmphasis">{"," + Utilities.formatDecimal(this.state.decimal)}</span>
                                                </span>
                                            </div>
                                        }
                                        {unDisclosedAmount &&
                                            <div className="pixCurrencyStyle headline5 highEmphasis" >
                                                {localeObj.not_defined}
                                            </div>
                                        }
                                        {this.getEditStatus() && <div className="pixEditButton body2 duskHorizon" style={{
                                            top: "0.375rem", display: this.state.receiverInfo["transferType"] === "Boleto"
                                                || this.state.receiverInfo["transferType"] === localeObj.dimo_pay ? "none" : "block"
                                        }}>
                                            <ColoredTextButton onClick={this.changeEditStatus} >{localeObj.pix_edit}</ColoredTextButton>
                                        </div>}
                                    </FlexView>
                                    <FlexView column>
                                        {this.state.descriptionNeeded &&
                                            <div style={{ margin: "1rem 0" }}>
                                                <TextField
                                                    multiline
                                                    fullWidth
                                                    variant="outlined"
                                                    rows="3" autoComplete='off'
                                                    onChange={this.handleDescriptionChange}
                                                    InputProps={{ className: "body2 highEmphasis" }}
                                                    value={this.state.description}
                                                    inputProps={{ maxLength: 140 }}
                                                    InputLabelProps={{ shrink: true }}
                                                    placeholder={localeObj.pix_send_optional}
                                                />
                                            </div>
                                        }
                                        <div style={{ display: (this.state.scheduled) ? "block" : "none" }}>
                                            <OutlineButton onClick={this.editDate}
                                                startIcon={<TimeIcon style={{ fill: ColorPicker.darkHighEmphasis }} />}
                                                endIcon={<EditIcon style={{ marginLeft: "0.5rem", fill: ColorPicker.darkHighEmphasis }} />}>
                                                <span className="body2 highEmphasis">{scheduleButtonContent()}</span>
                                            </OutlineButton>
                                        </div>
                                        <FlexView column style={{ marginTop: "1rem" }}>
                                            {this.props.requiredInfo.receiver &&
                                                <div className="pixTableRightContent tableRightStyle highEmphasis" style={{ textAlign: "left", width: "100%" }}>
                                                    <img alt="" src={this.state.dest ? DestIcon : this.state.src ? SourceIcon : BoletoIcon} className="pixReceiverSenderIcon" />
                                                    {this.props.detailHeader}
                                                </div>
                                            }
                                            {
                                                this.props.requiredInfo.keys &&
                                                <div style={{ justifyContent: "space-between", marginTop: "0.375rem" }}>
                                                    <span className="pixTableLeftContent tableLeftStyle mediumEmphasis">{localeObj.pix_key_header}</span>
                                                    <span onClick={() => this.openBottomSheet()} className="pixTableRightContent tableRightStyle highEmphasis">
                                                        {this.selectKeyType(this.state.selectedKey.type)} {">"}
                                                        {this.state.bottomSheet &&
                                                            <BottomSheetForKeys onBack={this.onBack} pixKey={this.props.allKeys} heading={localeObj.pix_select_Key} keySelected={this.setKey} evp_key={localeObj.evp_key} />
                                                        }
                                                    </span>
                                                </div>
                                            }
                                            {this.props.requiredInfo.receiver &&
                                                Object.keys(this.props.requiredInfo.receiver).map((key, idx) => {
                                                    return (
                                                        <div key={idx} style={{ justifyContent: "space-between", marginTop: "0.375rem" }}>
                                                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{key}</span>
                                                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{this.props.requiredInfo.receiver[key]}</span>
                                                        </div>
                                                    )
                                                })
                                            }
                                            <div className="pixTableRightContent tableRightStyle highEmphasis" style={{ textAlign: "left", marginTop: "2rem", width: "100%", display: "inline-flex" }}>
                                                <img alt="" src={TransactionIcon} className="pixReceiverSenderIcon" />
                                                {this.props.fromPixWithdraw ? localeObj.details : localeObj.transcation_details}
                                            </div >
                                            <div style={{ justifyContent: "space-between", marginTop: "0.375rem" }}>
                                                <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.pix_type}</span>
                                                <span className="pixTableRightContent tableRightStyle highEmphasis" >{this.props.requiredInfo.transferType}</span>
                                            </div>
                                            <div style={{ justifyContent: "space-between", marginTop: "0.375rem" }}>
                                                <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{this.state.atm ? localeObj.date : localeObj.pix_tansfer_date}</span>
                                                {this.props.fromPixWithdraw ?
                                                    <span className="pixTableRightContent tableRightStyle highEmphasis" > {localeObj.pix_today + ", " + this.state.date}</span> :
                                                    <span className="pixTableRightContent tableRightStyle highEmphasis" > {moment(moment().format("DD/MM/YYYY")).isSame(moment(this.state.date).format("DD/MM/YYYY"), "day") ? (localeObj.pix_today + ", ") : ""}{this.state.date}</span>
                                                }
                                            </div>
                                            {
                                                this.props.requiredInfo.tariff &&
                                                <div style={{ justifyContent: "space-between", marginTop: "0.375rem" }}>
                                                    <span className="pixTableLeftContent tableLeftStyle" style={{ color: this.state.tarrifColor ? ColorPicker.errorRed : ColorPicker.darkMediumEmphasis }}>{localeObj.tariff}</span>
                                                    <span className="pixTableRightContent tableRightStyle" style={{ color: this.state.tarrifColor ? ColorPicker.errorRed : ColorPicker.darkHighEmphasis }} >{"R$ " + this.props?.requiredInfo?.tariff}</span>
                                                </div>
                                            }
                                        </FlexView >
                                    </FlexView >
                                    {
                                        this.state.seconds > 0 && <div style={{ align: "center", marginTop: "2.125rem", padding: "1rem", backgroundColor: ColorPicker.disableBlack, borderRadius: ".75rem" }}>
                                            <FlexView>
                                                <span style={{ marginRight: "1rem", paddingTop: ".5rem", paddingBottom: "0.5rem" }} className="headline7 accent"> {this.state.time.h > 0 ? (this.state.time.h + ":" + this.state.time.m + ":" + this.state.time.s) : (this.state.time.m + ":" + this.state.time.s)}</span>
                                                <span style={{ marginRight: "1.375rem" }} className="tableLeftStyle highEmphasis">{localeObj.hs_timeout_message}</span>
                                            </FlexView>
                                        </div>
                                    }
                                </FlexView >
                                {
                                    this.state.credIndication &&
                                    <FlexView column style={{ textAlign: "center", margin: "2rem" }}>
                                        <div className="body2 disabled" >
                                            {localeObj.boleto_pay_duration}
                                        </div>
                                    </FlexView>
                                }
                            </MuiThemeProvider >
                        </FlexView >
                        <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={this.props.btnText} onCheck={() => this.sendField()} />
                            {this.props.fromBoleto && <SecondaryButtonComponent btn_text={localeObj.edit_schedule} onCheck={() => this.editDate()} />}
                            <div style={{ display: this.props.showScheduleOption ? "block" : "none" }}>
                                <SecondaryButtonComponent btn_text={this.props.requiredInfo.transferType === "Boleto" ? localeObj.schedule_transfer : localeObj.schedule_transfer} onCheck={() => this.editDate()} />
                            </div>
                        </div>
                        <MuiThemeProvider theme={theme2}>
                            <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                                <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                            </Snackbar>
                        </MuiThemeProvider>
                    </div >
                </div >
            </div >
        )
    }
}

ReviewComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    requiredInfo: PropTypes.object,
    dateChange: PropTypes.string,
    componentName: PropTypes.string,
    back: PropTypes.func,
    setTransactionInfo: PropTypes.func,
    header: PropTypes.string,
    detailHeader: PropTypes.string,
    allKeys: PropTypes.array,
    btnText: PropTypes.string,
    showScheduleOption: PropTypes.bool,
    fromPixWithdraw: PropTypes.bool,
    fromBoleto: PropTypes.bool
};


export default withStyles(styles)(ReviewComponent);
