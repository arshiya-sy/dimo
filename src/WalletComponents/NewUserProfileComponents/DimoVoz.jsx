import React from "react";
import PropTypes from "prop-types";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import FlexView from "react-flexview";
import { CSSTransition } from 'react-transition-group';
import InputThemes from "../../Themes/inputThemes";

import Snackbar from '@material-ui/core/Snackbar';

import Drawer from '@material-ui/core/Drawer';
import Switch from '@material-ui/core/Switch';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MuiAlert from '@material-ui/lab/Alert';

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import ColorPicker from '../../Services/ColorPicker';
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider } from "@material-ui/core/styles";

import dimo_voz from "../../images/DarkThemeImages/DimoVoz.png";
import voz_incoming from "../../images/DarkThemeImages/coin_in.png"

import CommonButtons from "../CommonUxComponents/CommonButtons";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import CircleIcon from '@mui/icons-material/Circle';
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import constantObjects from "../../Services/Constants";
import ImportantDetails from '../NewLaunchComponents/ImportantDetails';

import androidApiCallsService from "../../Services/androidApiCallsService";
import SessionMetricsTracker from '../../Services/SessionMetricsTracker';
import ArbiApiMetrics from "../../Services/ArbiApiMetrics";

const FilterButton = CommonButtons.ButtonTypeFilter;
const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;

var localeObj = {};

const SwitchStyle = withStyles({
    switchBase: {
        width: "1.5rem",
        color: ColorPicker.newProgressBar,
        '&$checked': {
            color: ColorPicker.newProgressBar,
        },
        '&$checked + $track': {
            backgroundColor: ColorPicker.checkedBackground,
        },
    },
    checked: {},
    track: {},
})(Switch);


class DimoVoz extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageState: "mainPage",
            incomingBottomSheet: false,
            outgoingBottomSheet: false,
            disableBottomSheet: false,
            snackBarOpen: false,
            message: "",
            incomingOptions: {},
            tempIncomingOptions: { "readoutAloud": false, "Pix": false, "TED": false, "Boleto": false },
            dimoVozActivate: false
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);

        this.getVozStatus();
        window.onBackPressed = () => {
            this.onBack();
        }
    }

    onBack = () => {
        switch (this.state.pageState) {
            case "mainPage":
                this.props.history.replace({ pathname: "/transactionOptions", transition: "right" });
                break;
            case "blank":
                this.onSecondary();
                break;
            default: 
                this.props.history.replace({ pathname: "/transactionOptions", transition: "right" });
                break;
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    sendVozSuccessMetric = (vozSettings) => {
        let jsonObj = {};
        let uri = "/dimo-voz-metrics"

        let basicData = {
            "chaveDeConta": ImportantDetails.accountKey ? ImportantDetails.accountKey : undefined,
            "chaveDeCliente": ImportantDetails.clientKey ? ImportantDetails.clientKey : undefined,
            "sessionId": SessionMetricsTracker.sessionID ? SessionMetricsTracker.sessionID : undefined
        }

        let customDate = {
            "isEnabled": vozSettings["readoutAloud"],
            "isPixEnabled": vozSettings["Pix"],
            "isTedEnabled": vozSettings["TED"],
            "isBoletoEnabled": vozSettings["Boleto"]
        }

        jsonObj = { ...basicData, ...customDate };
        ArbiApiMetrics.sendArbiMetrics(uri, uri, true, 201, jsonObj, 0);
    }

    getVozStatus = () => {
        let roaJson = androidApiCallsService.getRoaStatus();

        this.getIncomingOptions(roaJson);
    }

    getIncomingOptions = (roaJson) => {
        let incomingOptions = { "readoutAloud": false, "Pix": false, "TED": false, "Boleto": false };
        let dimoVozActivate = false;

        if (roaJson == [] || roaJson == undefined || roaJson == "{}") {
            incomingOptions["readoutAloud"] = false
            incomingOptions["Pix"] = false
            incomingOptions["TED"] = false
            incomingOptions["Boleto"] = false
        } else {
            incomingOptions["readoutAloud"] = JSON.parse(roaJson).readoutAloud
            incomingOptions["Pix"] = JSON.parse(roaJson).roaPixMsg
            incomingOptions["TED"] = JSON.parse(roaJson).roaTEDMsg
            incomingOptions["Boleto"] = JSON.parse(roaJson).roaBoletoMsg
        }

        dimoVozActivate = incomingOptions["readoutAloud"]

        this.setState({
            incomingOptions: incomingOptions,
            tempIncomingOptions: incomingOptions,
            dimoVozActivate: dimoVozActivate
        });
    }

    setIncomingOptions = () => {
        let tempIncomingOptions = { ...this.state.tempIncomingOptions };
        let roa = tempIncomingOptions["readoutAloud"];
        let ted = tempIncomingOptions["TED"];
        let boleto = tempIncomingOptions["Boleto"];
        let pix = tempIncomingOptions["Pix"];

        this.sendVozSuccessMetric(tempIncomingOptions);
        androidApiCallsService.updateRoaStatus(roa, ted, boleto, pix);
    }

    onSelectInTransfers = () => {
        if (this.state.dimoVozActivate === true) {
            this.setState({
                pageState: "blank",
                incomingBottomSheet: true
            });
        }
        else {
            return;
        }
    }

    onSelectOutTranfers = () => {
        this.setState({
            pageState: "blank",
            outgoingBottomSheet: true
        });
    }

    handleIncomingOption = (options) => {
        let tempIncomingOptions = { ...this.state.tempIncomingOptions };
        tempIncomingOptions[options] = !tempIncomingOptions[options];
        this.setState({ tempIncomingOptions: tempIncomingOptions });
    }

    onConfirmIncoming = () => {
        this.setIncomingOptions();
        this.getVozStatus();
        this.setState({ pageState: "mainPage", incomingBottomSheet: false });
    }

    disableVoz = () => {
        if (this.state.dimoVozActivate === true) {
            this.setState({
                pageState: "blank",
                disableBottomSheet: true
            });
        }
        else {
            let jsonObj = { "readoutAloud": false, "Pix": false, "TED": false, "Boleto": false };

            let roa = jsonObj["readoutAloud"] = true;
            let ted = jsonObj["TED"] = true;
            let boleto = jsonObj["Boleto"] = true;
            let pix = jsonObj["Pix"] = true;

            this.sendVozSuccessMetric(jsonObj);
            androidApiCallsService.updateRoaStatus(roa, ted, boleto, pix);
            this.getVozStatus();
            this.setState({ pageState: "mainPage" });
        }
    }

    disableVozConfirm = () => {
        let message = localeObj.voz_disable_snackbar_msg;
        this.openSnackBar(message);

        let jsonObj = { "readoutAloud": false, "Pix": false, "TED": false, "Boleto": false };

        let roa = jsonObj["readoutAloud"] = false;
        let ted = jsonObj["TED"] = false;
        let boleto = jsonObj["Boleto"] = false;
        let pix = jsonObj["Pix"] = false;

        this.sendVozSuccessMetric(jsonObj);
        androidApiCallsService.updateRoaStatus(roa, ted, boleto, pix);
        this.getVozStatus();
        this.setState({ pageState: "mainPage", disableBottomSheet: false });
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        });
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    onSecondary = () => {
        let incomingOptions = { ...this.state.incomingOptions };
        this.setState({ tempIncomingOptions: incomingOptions });
        if (this.state.incomingBottomSheet) {
            this.setState({ pageState: "mainPage", incomingBottomSheet: false });
        }
        else if (this.state.outgoingBottomSheet) {
            this.setState({ pageState: "mainPage", outgoingBottomSheet: false });
        }
        else {
            this.setState({ pageState: "mainPage", disableBottomSheet: false });
        }
    }

    render() {
        const finalHeight = window.screen.height;

        const { classes } = this.props;

        return (
            <div>
                {this.state.pageState === "mainPage" &&
                    <div>
                        <ButtonAppBar header={localeObj.dimo_voz} onBack={this.onBack} action="none" />
                        <div className="scroll" style={{ height: `${finalHeight * 0.85}px`, overflowY: "auto" }}>
                            <div style={{ marginTop: "3rem", width: "100%", textAlign: "center" }}>
                                <img align="center" style={{ height: "4.375rem", width: "4.375rem" }} src={dimo_voz} alt=""></img>
                            </div>
                            <div className="headline5 highEmphasis" style={{ marginTop: "3.5rem", textAlign: "center" }}>
                                <span>{localeObj.dimo_voz + " :"}</span>
                            </div>
                            <FlexView column style={{ marginTop: "2rem", alignItems: "center" }}>
                                <FilterButton className="smallTextStyleBold" variant="outlined" style={{ color: ColorPicker.darkHighEmphasis, border: "solid 1px", width: "9rem" }}>
                                    {this.state.dimoVozActivate ?
                                        <CircleIcon style={{ height: "0.75rem", width: "0.75rem", color: ColorPicker.transactionGreen, marginRight: "1rem", marginTop: "0.3rem" }} /> :
                                        <CircleIcon style={{ height: "0.75rem", width: "0.75rem", color: ColorPicker.amountTxnRed, marginRight: "1rem", marginTop: "0.3rem" }} />
                                    }
                                    <div style={{ width: "100%", textAlign: "center" }}>
                                        <div style={{ marginRight: "1rem" }}>
                                            <span className="body2 mediumEmphasis">{this.state.dimoVozActivate ? localeObj.travel_notice_activated : localeObj.travel_notice_deactivated}</span>
                                        </div>
                                    </div>
                                </FilterButton>
                            </FlexView>
                            <FlexView column className="headline5 highEmphasis" align="center" style={{ textAlign: "left", marginTop: "4rem", marginLeft: "1rem" }}>
                                {localeObj.voz_header}
                            </FlexView>
                            <FlexView column className="body2 highEmphasis" align="center" style={{ textAlign: "left", marginTop: "1rem", marginLeft: "1rem" }}>
                                {localeObj.voz_desc1}
                            </FlexView>
                            <FlexView column className="body2 highEmphasis" align="center" style={{ textAlign: "left", marginTop: "1rem", marginLeft: "1rem" }}>
                                {localeObj.voz_desc2}
                            </FlexView>
                            <MuiThemeProvider theme={InputThemes.SearchInputTheme}>
                                <div>
                                    <ListItem disableGutters={true} disablePadding={true} align="left" style={{ marginTop: "1rem", color: ColorPicker.darkHighEmphasis }} onClick={() => this.onSelectInTransfers()}>
                                        <img align="left" style={{ height: "1.25rem", width: "1.305rem", marginLeft: "1rem" }} src={voz_incoming} alt=""></img>
                                        <ListItemText className="body1 highEmphasis" style={{ marginLeft: "1rem" }} primary={localeObj.voz_incoming_transfer}
                                            secondary={this.state.dimoVozActivate ? localeObj.voz_incoming_transfer_sec : localeObj.disabled} />
                                        <span style={{ marginRight: "2.25rem" }} onClick={() => this.onSelectInTransfers()}>
                                            <ArrowForwardIosIcon style={{ color: ColorPicker.accent, fontSize: "1rem" }} />
                                        </span>
                                    </ListItem>
                                </div>
                            </MuiThemeProvider>
                            <div style={{ marginTop: "6rem", textAlign: "center" }}>
                                <PrimaryButtonComponent btn_text={this.state.dimoVozActivate ? localeObj.voz_disable : localeObj.voz_enable} onCheck={this.disableVoz} />
                            </div>
                        </div>
                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={this.state.pageState === "blank" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"}>
                    <div style={{ display: (this.state.pageState === "blank" && !this.state.processing ? 'block' : 'none') }}></div>
                </CSSTransition>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.incomingBottomSheet}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.voz_incoming_transfer}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.voz_incoming_transfer_desc}
                                </div>
                                <MuiThemeProvider theme={InputThemes.SearchInputTheme}>
                                    <FlexView column align="left" style={{ margin: "1.5rem" }}>
                                        <List>
                                            <ListItem disablePadding={true} align="left" style={{ marginTop: "0.5rem" }}>
                                                <ListItemText align="left" className="body1 highEmphasis" primary={"Pix"}
                                                    secondary={this.state.tempIncomingOptions["Pix"] ? localeObj.enabled : localeObj.disabled} />
                                                <span style={{textAlign: "right"}}>
                                                    <SwitchStyle checked={this.state.tempIncomingOptions["Pix"]} onChange={() => this.handleIncomingOption("Pix")} />
                                                </span>
                                            </ListItem>
                                            <ListItem disablePadding={true} align="left" style={{ marginTop: "0.5rem" }}>
                                                <ListItemText align="left" className="body1 highEmphasis" primary={"TED"}
                                                    secondary={this.state.tempIncomingOptions["TED"] ? localeObj.enabled : localeObj.disabled} />
                                                <span style={{textAlign: "right"}}>
                                                    <SwitchStyle checked={this.state.tempIncomingOptions["TED"]} onChange={() => this.handleIncomingOption("TED")} />
                                                </span>
                                            </ListItem>
                                            <ListItem disablePadding={true} align="left" style={{ marginTop: "0.5rem" }}>
                                                <ListItemText align="left" className="body1 highEmphasis" primary={"Boleto"}
                                                    secondary={this.state.tempIncomingOptions["Boleto"] ? localeObj.enabled : localeObj.disabled} />
                                                <span style={{textAlign: "right"}}>
                                                    <SwitchStyle checked={this.state.tempIncomingOptions["Boleto"]} onChange={() => this.handleIncomingOption("Boleto")} />
                                                </span>
                                            </ListItem>
                                        </List>
                                    </FlexView>
                                </MuiThemeProvider>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.confirm} onCheck={this.onConfirmIncoming} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondary} />
                        </div>
                    </Drawer>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.disableBottomSheet}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.voz_disable_desc}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.voz_disable} onCheck={this.disableVozConfirm} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondary} />
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        )
    }
}

DimoVoz.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(DimoVoz);

