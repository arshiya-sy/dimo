import React from "react";
import moment from "moment";
import PropTypes from "prop-types";
import "../../../styles/main.css";
import "../../../styles/lazyLoad.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";
import FlexView from "react-flexview";
import Card from '@mui/material/Card';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import CardContent from '@mui/material/CardContent';
import GetAppIcon from '@material-ui/icons/GetApp';
import ShareIcon from '@material-ui/icons/Share';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import CircleIcon from '@mui/icons-material/Circle';
import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import constantObjects from "../../../Services/Constants";
import MetricsService from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import NewUtilities from "../../../Services/NewUtilities";
import AndroidActionButton from "../../CommonUxComponents/AndroidActionButton";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import { withStyles } from "@material-ui/core/styles";
import { MuiThemeProvider } from '@material-ui/core/styles';
import ClickWithTimeout from "../../EngageCardComponent/ClickWithTimeOut";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import ActionButtonComponent from "../../CommonUxComponents/ActionButton";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import Button from '@material-ui/core/Button';
import arbiApiService from "../../../Services/ArbiApiService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import ArbiResponseHandler from '../../../Services/ArbiResponseHandler';
import arbiResponseHandler from '../../../Services/ArbiResponseHandler';
import ArbiErrorResponseHandler from '../../../Services/ArbiErrorResponsehandler';
import AlertDialog from "../../NewOnboardingComponents/AlertDialog";
import emptyIcon from "../../../images/DarkThemeImages/EmptyTransactionHistory_2x.png";
import ChatBotUtils from "../../NewUserProfileComponents/ChatComponents/ChatBotUtils";

const theme1 = InputThemes.snackBarTheme;
const theme2 = InputThemes.DownloadSnackbarTheme;
const WRITE_EXTERNAL_STORAGE = "android.permission.WRITE_EXTERNAL_STORAGE";
const TimeOutActionButton = ClickWithTimeout(AndroidActionButton);
var localeObj = {};

const ActionButton = withStyles(() => ({
    root: {
        color: ColorPicker.tableBackground,
        backgroundColor: ColorPicker.accent2,
        borderRadius: "30px",
        fontSize: "0.875rem",
        fontWeight: "400",
        lineHeight: "20px",
        padding: "8px 24px",
        textTransform: 'none',
        textAlign: 'center',
        boxShadow: "none",
        justifyContent: "center",
        border: "1px solid " + ColorPicker.buttonAccent,
        minWidth: "8rem",
        '&:hover': {
            border: "solid 1px " + ColorPicker.buttonAccent,
            boxShadow: "none",
        },
        '&:disabled': {
            color: ColorPicker.disabledTxt,
            backgroundColor: ColorPicker.secDisabled,
        },
        "& .MuiTouchRipple-root span": {
            border: "solid 1px " + + ColorPicker.buttonAccent,
            boxShadow: "none",
        },
    },
}))(Button);

class fgtsContractsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            amount: "",
            contractsList: [],
            isContractsEnabled: this.props.contractsStatus,
            snackBarOpen: false,
            message: "",
            fileName: "",
            noContracts: false,
            success: 0,
            isClickable: false
        };
        this.style = {
            textStyle: {
                margin: "1rem"
            },
            cardStyle: {
                width: "100%",
                borderRadius: "1.25rem",
                backgroundColor: ColorPicker.newProgressBar,
                height: "16.75rem"
            },
            itemStyle: {
                display: "flex",
                justifyContent: "space-between",
                margin: "5% 0",
                align: 'left'
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(PageNames.FgtsContracts);
    }

    componentDidMount() {
        this.setState({
            isContractsEnabled: this.props.contractsStatus
        });

        window.onContentShared = () => {
            ImportantDetails.shareEnabled = true;
        }

        window.onPauseCamera = () => {
            ImportantDetails.shareEnabled = false;
        }
        document.addEventListener("visibilitychange", this.visibilityChange);

        let contractsQuery = {
            "sortOrder": "1",
            "Pagina": "1",
            "porPagina": "30"
        };
        this.showProgressDialog();
        arbiApiService.getFgtsContractsList(contractsQuery, PageNames.FgtsContracts).then(response => {
            this.hideProgressDialog();
            this.setState({ success: 1 });
            if (response.success) {
                let processorResponse = arbiResponseHandler.procesGetFgtsContractsList(response.result);
                if (processorResponse.success) {
                    if (processorResponse.fgtsContractsList.contractValues.length === 0) {
                        this.setState({
                            isContractsEnabled: false,
                            contractsList: [],
                            noContracts: true
                        });
                    } else {
                        this.setState({
                            isContractsEnabled: true,
                            contractsList: processorResponse.fgtsContractsList.contractValues,
                            totalItems: processorResponse.fgtsContractsList.totalItems,
                            qtdPaginas: processorResponse.fgtsContractsList.qtdPaginas,
                            qtdPorPagina: processorResponse.fgtsContractsList.qtdPorPagina,
                            pagina: processorResponse.fgtsContractsList.pagina,
                            idStatusExecucao: processorResponse.fgtsContractsList.idStatusExecucao,
                            noContracts: false
                        });
                    }
                } else {
                    this.setState({
                        isContractsEnabled: false,
                        contractsList: [],
                        noContracts: true
                    });
                    let errorMesaage = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        snackBarOpen: true,
                        message: errorMesaage
                    });
                }
            } else {
                this.setState({
                    noContracts: true,
                    isContractsEnabled: false,
                    contractsList: []
                });
            }
        });

        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === WRITE_EXTERNAL_STORAGE) {
                if (status === false) {
                    if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")) {
                        this.setState({
                            storagePermissionAlert: true
                        })
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.allow_storage
                        })
                    }

                }
            }
        }

        window.onBackPressed = () => {
            this.goToFgtsHomePage();
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(PageNames.FgtsContracts, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(PageNames.FgtsContracts);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    goToFgtsHomePage = () => {
        this.props.onBack();
    }

    defineValue = () => {
        MetricsService.onPageTransitionStop(PageNames.FgtsContracts, PageState.stop);
        this.props.newValue();
    }

    showProgressDialog = () => {
        this.setState({
            progressBar: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            progressBar: false
        })
    }

    processAmountValue = (value) => {
        let amtArray = value.toString().split(".");
        return GeneralUtilities.formatBalance(amtArray[0]);
    }

    processDecimalValue = (value) => {
        let valArray = value.toString().split(".");
        return valArray[1] ? '' + valArray[1] : "00";
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    handleOpen = () => {
        androidApiCalls.openReceipt(this.state.fileName);
        this.setState({ finalDoc: false })
    }

    closeDownloadBar = () => {
        this.setState({ finalDoc: false })
    }

    fetchSignedContract = (type, finalContractId) => {
        this.showProgressDialog();
        this.setState({ success: 0 });
        arbiApiService.fetchSignedFgtsContract(finalContractId, PageNames.FgtsContracts).
            then(response => {
                this.hideProgressDialog();
                this.setState({ success: 1 });
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processFetchSignedFgtsContract(response.result);
                    if (processorResponse.success) {
                        if (type === "Download") {
                            let event = {
                                eventType: constantObjects.fgtsDownloadContract,
                                page_name: PageNames.FgtsContracts,
                            };
                            MetricsService.reportActionMetrics(event, new Date().getTime());
                            this.saveAsPdf(processorResponse.text, finalContractId)
                        } else {
                            let name = "contratos_de_fgts_" + finalContractId + "_" + moment().format("DDMMYYYYHHmmss");
                            let event = {
                                eventType: constantObjects.fgtsShareContract,
                                page_name: PageNames.FgtsContracts,
                            };
                            MetricsService.reportActionMetrics(event, new Date().getTime());
                            androidApiCalls.sharePdfFile(processorResponse.text, name);
                        }
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.tryAgainLater
                        })
                        return;
                    }
                } else {
                    let errorMesaage = ArbiErrorResponseHandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        snackBarOpen: true,
                        message: errorMesaage
                    });
                    return;
                }
            })
    }

    closestoragePermissionAlertDialog = () => {
        this.setState({
            storagePermissionAlert: false
        })
    }

    saveAsPdf = (url, finalContractId) => {
        if (androidApiCalls.checkSelfPermission(WRITE_EXTERNAL_STORAGE) === 0) {
            let name = "contratos_de_fgts_" + finalContractId + "_" + moment().format("DDMMYYYYHHmmss") + ".pdf";
            let filename = androidApiCalls.getDownloadedFileName("Download", name);
            androidApiCalls.saveFile(url, "Download", name).then(result => {
                if (result) {
                    this.setState({
                        finalDoc: true,
                        fileName: name,
                        snackBarOpen: false
                    });
                    androidApiCalls.updateDownloadNotification(localeObj.pix_download_complete, filename);
                } else {
                    this.setState({
                        snackBarOpen: true,
                        message: localeObj.tryAgainLater,
                        fileName: name
                    })
                    androidApiCalls.updateDownloadNotification(localeObj.pix_receipt_download_failed, filename);
                }
            });
        } else {
            androidApiCalls.requestPermission(WRITE_EXTERNAL_STORAGE);
        }
    }

    handleOpenWhatApp = () => {
        androidApiCalls.openUrlInBrowserLegacy("https://api.whatsapp.com/send?phone=" + constantObjects.customerCareWADialer);
    }

    goToChatbot = () => {
        if (this.state.isClickable) {
            return;
        }
        this.setState({
            isClickable: true
        });
        ChatBotUtils.insideChatBot(constantObjects.fgts_contracts_entrypoint);
        this.props.history.replace({ pathname: "/chat", transition: "right" });
    }

    callAnticipation = () => {
        this.props.anticipateNow();
    }

    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const demoList = this.state.contractsList;

        return (
            <div>
                <div style={{ display: (this.state.progressBar ? 'block' : 'none') }}>
                    {this.state.progressBar && <CustomizedProgressBars></CustomizedProgressBars>}
                </div>
                {<div style={{ display: (this.state.progressBar ? 'none' : 'block') }}>
                    {this.state.noContracts ? (
                        <FlexView column
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: `${screenHeight * 0.72}px`,
                                overflowY: 'auto'
                            }} s
                        >
                            <div className="headline5 highEmphasis" style={{ textAlign: "center" }} >
                                {localeObj.noContractsFound}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "center", marginLeft: "15%", marginRight: "15%", marginTop: "0.7rem" }} >
                                {localeObj.noContractsFound_caption}
                            </div>
                            <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                                <ActionButton
                                    className="body2"
                                    variant="contained"
                                    onClick={() => this.callAnticipation()}>
                                    {localeObj.fgts_anticipate_now}
                                </ActionButton>
                            </div>
                        </FlexView>
                    ) : (
                        <div className="scroll cardScroll" style={{ width: screenWidth, height: `${screenHeight * 0.7}px`, overflowX: 'hidden', overflowY: 'auto' }}>
                            {demoList.map((element) =>
                                <div key={element} style={InputThemes.initialMarginStyle}>
                                    <Card align="center" style={this.style.cardStyle} elevation="0">
                                        <CardContent>
                                            <FlexView style={{ marginTop: "1.5rem", justifyContent: "center" }}>
                                                <CircleIcon style={{ height: "0.75rem", width: "0.75rem", marginRight: "0.5rem", color: element.ativo ? ColorPicker.transactionGreen : ColorPicker.errorRed }} />
                                                <span className="subtitle4 highEmphasis">{element.ativo ? localeObj.fgts_activeContracts : localeObj.fgts_inactiveContracts}</span>
                                            </FlexView>
                                            <FlexView column align="center" style={{justifyContent: "center"}}>
                                                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                                                    <span className="body2 mediumEmphasis">{localeObj.fgts_valueofContract}</span>
                                                </div>
                                                <div style={{ marginTop: "0.2rem", textAlign: "center" }}>
                                                    <span className="headline5 highEmphasis" style={{ marginRight: "0.375rem" }}>{"R$ "}</span>
                                                    <span className="headline2 balanceStyle highEmphasis">{this.processAmountValue(element.valorFinanciado)}</span>
                                                    <span className="subScript headline5 highEmphasis">{"," + NewUtilities.formatDecimal(this.processDecimalValue(element.valorFinanciado))}</span>
                                                </div>
                                            </FlexView>
                                            <FlexView style={{ justifyContent: "space-between", marginLeft: "2.5rem", marginRight: "2.5rem" }}>
                                                <FlexView column style={this.style.itemStyle}>
                                                    <span style={{ textAlign: "left" }} className="body2 mediumEmphasis">{localeObj.fgts_contractsFrom}{": "}</span>
                                                    <span className="subtitle4 highEmphasis" style={{ marginTop: "0.375rem" }}>{element.startContractDate}</span>
                                                </FlexView>
                                                <FlexView column style={this.style.itemStyle}>
                                                    <span style={{ textAlign: "left" }} className="body2 mediumEmphasis">{localeObj.fgts_contractsUntil}{": "}</span>
                                                    <span className="subtitle4 highEmphasis" style={{ marginTop: "0.375rem" }}>{element.endContractDate}</span>
                                                </FlexView>
                                            </FlexView>
                                            <FlexView style={{ justifyContent: "center", margin: "1rem" }}>
                                                <AndroidActionButton
                                                    btn_text={localeObj.download}
                                                    onCheck={() => this.fetchSignedContract("Download", element.contrato)}
                                                    icon={<GetAppIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />} />
                                            </FlexView>
                                        </CardContent>
                                    </Card>
                                </div>)
                            }
                        </div>
                    )}
                    <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                        <FlexView column onClick={this.handleOpenWhatApp}>
                            <span className="body2 highEmphasis">{localeObj.fgts_help_text_1}</span>
                            <div>
                                <span className="body2 highEmphasis">
                                    {localeObj.fgts_help_text_2}
                                </span>
                                <span className="body2 accent">
                                    {localeObj.fgts_help_text_3}
                                </span>
                            </div>
                        </FlexView>
                    </div>
                </div>}
                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={() => this.closeSnackBar()}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                {this.state.storagePermissionAlert &&
                    <AlertDialog title={localeObj.allow_storage_title} description={localeObj.allow_storage}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closestoragePermissionAlertDialog} />
                }
                {this.state.finalDoc && <div id="outer" style={{ width: "100%", padding: "5%" }} className="accountOuterContainer">
                    <Drawer
                        anchor="bottom"
                        open={this.state.finalDoc}>
                        <MuiThemeProvider theme={theme2}>
                            <AppBar position="static" color="transparent" elevation="0">
                                <Toolbar>
                                    <IconButton style={{ color: ColorPicker.white }} disabled={true}>
                                        <DoneIcon />
                                    </IconButton>
                                    <span className="body1 highEmphasis">
                                        {localeObj.download_complete}
                                    </span>
                                    <span className="body1 accent" onClick={() => this.handleOpen()}>
                                        {localeObj.open}
                                    </span>
                                    <IconButton>
                                        <CancelIcon style={{ color: ColorPicker.white }} onClick={() => this.closeDownloadBar()} />
                                    </IconButton>
                                </Toolbar>
                            </AppBar>
                        </MuiThemeProvider>
                    </Drawer>
                </div>}
            </div>)
    }
}

fgtsContractsPage.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.shape({
        contractsStatus: PropTypes.bool.isRequired,
    }).isRequired,
    newValue: PropTypes.func.isRequired,
};

export default withStyles()(fgtsContractsPage);