import React from 'react';

import moment from "moment";
import "../../../styles/main.css";
import "../../../styles/new_pix_style.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";
import PropTypes from "prop-types";
import { MuiThemeProvider, createMuiTheme, withStyles } from "@material-ui/core/styles";
import MobileStepper from '@material-ui/core/MobileStepper';
import { Card } from "@material-ui/core";
import FlexView from "react-flexview";
import Drawer from '@material-ui/core/Drawer';
import ItemsCarousel from 'react-items-carousel';

import PageState from '../../../Services/PageState';
import PageNames from '../../../Services/PageNames';
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import Utils from "../../../Services/GeneralUtilities";
import ArbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from '../../../Services/ArbiErrorResponsehandler';
import ClickWithTimeout from '../../EngageCardComponent/ClickWithTimeOut';
import utilities from "../../../Services/NewUtilities";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Skeleton from '@material-ui/lab/Skeleton';
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import constantObjects from '../../../Services/Constants';
import ImportantDetails from '../../NewLaunchComponents/ImportantDetails';

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const pageName = PageNames.keyInformation;
const TimeOutPrimaryButton = ClickWithTimeout(PrimaryButtonComponent);
const TimeOutSecondaryButton = ClickWithTimeout(SecondaryButtonComponent);
var localeObj = {};

const theme1 = createMuiTheme({
    overrides: {
        MuiGrid: {
            item: {
                boxSizing: "none"
            },
        },
        MuiPaper: {
            elevation1: {
                boxShadow: "none"
            }
        },
        MuiMobileStepper: {
            dotActive: {
                backgroundColor: ColorPicker.darkMediumEmphasis,
            },
            dot: {
                backgroundColor: ColorPicker.newProgressBar
            },
            root: {
                backgroundColor: ColorPicker.surface0
            }
        }
    }
});

class KeyInformationComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedIndex: this.props.location.state.selectedIndex,
            allKeys: this.props.location.state.allKeys,
            bottom: false,
            staticQR: ["", "", "", "", ""],
            imgLoaded: [false, false, false, false, false],
            currentKey: "",
            currentQRCode: "",
            currentPixKeyValue: "",
            currentKeyDate: "",
            blockBackButton: false
        }
        this.qr = React.createRef();
        MetricServices.onPageTransitionStart(pageName);
    }

    componentDidMount() {
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.onBack();
            //Log.sDebug("Back pressed", pageName);
        }

        window.onContentShared = () => {
            ImportantDetails.shareEnabled = true;
        }

        window.onPauseCamera = () => {
            ImportantDetails.shareEnabled = false;
        }
        //Log.sDebug("loading QR code", pageName);
        this.loadStaticQRCode();
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

    loadStaticQRCode = () => {
        this.setState({ currentKey: this.state.allKeys[this.state.selectedIndex].key_type })
        this.setState({ currentPixKeyValue: this.state.allKeys[this.state.selectedIndex].key_value })
        this.setState({ currentKeyDate: moment(this.state.allKeys[this.state.selectedIndex].registered).format('DD/MM/YYYY') })
        for (let i = 0; i < this.state.allKeys.length; i++) {
            let jsonObject = {};
            jsonObject["pixKey"] = this.state.allKeys[i].key_value;
            jsonObject["Amount"] = 0;
            jsonObject["Description"] = "Send money without any hassle";

            ArbiApiService.generateStaticQrCodeForPixKey(jsonObject, pageName).then(response => {
                if (response.success) {
                    let processedResult = ArbiResponseHandler.processGenerateStaticQrCodeResponse(response.result, this.state.allKeys[i].key_value);
                    if (processedResult.success) {
                        this.setState(prevState => {
                            const staticQR = [...prevState.staticQR];
                            staticQR[i] = "data:image/png;base64, " + processedResult.qrCode.data;
                        
                            const imgLoaded = [...prevState.imgLoaded];
                            imgLoaded[i] = true;
                        
                            return { staticQR, imgLoaded };
                        });
                    }
                    if (i == this.state.selectedIndex) {
                        this.setState({ currentQRCode: this.state.staticQR[i] })
                    }
                } else {
                    //Log.sDebug("error - " + JSON.stringify(response.result), pageName, constantObjects.LOG_PROD);
                }
            });
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

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(pageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(pageName);
        }
    }


    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    onDelete = () => {
        this.setState({ bottom: true });
        //Log.sDebug("user clicked delete " + this.state.allKeys[this.state.selectedIndex].key_type + this.state.allKeys[this.state.selectedIndex].key_value, "KeyInformationComponent");
    }

    confirmDelete = () => {
        //Log.sDebug("user confirmed delete " + this.state.allKeys[this.state.selectedIndex].key_type + this.state.allKeys[this.state.selectedIndex].key_value, "KeyInformationComponent");
        this.setState({ bottom: false });
        this.showProgressDialog();
        this.setState({ blockBackButton: true });
        let pixKeyTypes = {
            "EMAIL": "email_pix_key",
            "CPF": "cpf_pix_key",
            "EVP": "evp_pix_key",
            "PHONE": "mobile_pix_key"
        }
        let pixKeyType = "";
        pixKeyType = pixKeyTypes[this.state.allKeys[this.state.selectedIndex].key_type];
        ArbiApiService.deletePixKey(this.state.allKeys[this.state.selectedIndex].key_value, pixKeyType, pageName)
            .then(response => {
                this.hideProgressDialog();
                this.setState({ blockBackButton: false });
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processdeletePixKeyResponse(response.result, pixKeyType);
                    if (processorResponse.success) {
                        // showSnackBarMessage = true;
                        this.openSnackBar(localeObj.delete_success_dark);
                        let timeoutId = setInterval(() => {
                            clearInterval(timeoutId);
                            ImportantDetails.fromRegisterPixKey = true;
                            MetricServices.onPageTransitionStop(pageName, PageState.close);
                            this.props.history.replace("/myPixKeysComponent")
                        }, 2 * 1000);
                    } else {
                        this.openSnackBar(processorResponse.message);
                    }
                } else {
                    let errorMessageToUser = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.openSnackBar(errorMessageToUser);
                }
            });
    }

    handleClose = () => {
        this.setState({ bottom: false })
        return;
    }

    fetchPixKeyValue = (key, value) => {
        if (key == "CPF") {
            let cpfObj = utilities.parseCPF(value);
            //Log.sDebug("Parsing CPF", "KeyInformationComponent");
            return cpfObj.displayCPF
        } else {
            return value;
        }
    }

    onShare = () => {
        let isSupported = androidApiCalls.shareContent(null,
            this.state.allKeys[this.state.selectedIndex].key_value, null);
        if (!isSupported) {
            Utils.setShareSupport(isSupported);
        }
        //Log.sDebug("user clicked share " + this.state.allKeys[this.state.selectedIndex].key_type + this.state.allKeys[this.state.selectedIndex].key_value, "KeyInformationComponent");
    }

    onBack = () => {
        if (this.state.bottom === true) {
            this.setState({ bottom: false });
        }
        else if (this.state.blockBackButton == false) {
            //setTimeout(() => {
                MetricServices.onPageTransitionStop(pageName, PageState.back);
                this.props.history.replace({ pathname: "/myPixKeysComponent", transition: "right" });
            //}, 2000);
        }
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const changeActiveItem = (selectedIndex) => {
            selectedIndex = (selectedIndex < 0) ? 0 :
                (selectedIndex >= this.state.allKeys.length) ? this.state.allKeys.length - 1 : selectedIndex;
            this.setState({
                selectedIndex: selectedIndex,
                currentQRCode: this.state.staticQR[selectedIndex],
                currentPixKeyValue: this.state.allKeys[selectedIndex].key_value,
                currentKey: this.state.allKeys[selectedIndex].key_type,
                currentKeyDate: moment(this.state.allKeys[selectedIndex].registered).format('DD/MM/YYYY')
            });
            //Log.sDebug("index changed from " + this.state.selectedIndex + " to " + selectedIndex, "KeyInformationComponent");
        }

        return (
            <div style={{ overflowX: "hidden", textAlign: "center" }}>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.bottom}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.delete_key_title}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.delete_key_text}
                                </div>
                                <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                                    <div className="subtitle2 highEmphasis" style={{ textAlign: "center" }}>
                                        {(this.state.allKeys[this.state.selectedIndex].key_type) === "EVP" ? localeObj.evp_key : this.state.allKeys[this.state.selectedIndex].key_type}
                                    </div>
                                    <div className="body2 mediumEmphasis" style={{ textAlign: "center" }}>
                                        {this.fetchPixKeyValue(this.state.allKeys[this.state.selectedIndex].key_type, this.state.allKeys[this.state.selectedIndex].key_value)}
                                    </div>
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", textAlign: "center" }}>
                            <TimeOutPrimaryButton className="body1 highEmphasis" btn_text={localeObj.delete_key_button} onCheck={this.confirmDelete} />
                            <SecondaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.cancel} onCheck={this.handleClose} />
                        </div>
                    </Drawer>
                </div>
                <ButtonAppBar header={this.state.allKeys[this.state.selectedIndex].key_type === "EVP" ? localeObj.evp_key : this.state.allKeys[this.state.selectedIndex].key_type} onBack={this.onBack} action="none" />

                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div className="scroll" style={{ height: `${finalHeight * 0.65}px`, overflowY: "auto" }}>
                        <div style={{ width: "100%", backgroundColor: ColorPicker.surface1, color: ColorPicker.highEmphasis, textAlign: "center" }}>
                        <ItemsCarousel
                            requestToChangeActive={changeActiveItem}
                            activeItemIndex={this.state.selectedIndex}
                            numberOfCards={1}
                            showSlither={true}
                            alwaysShowChevrons
                            gutter={0}
                            outsideChevron
                            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            {this.state.allKeys.map((item, index) => (
                                <div key={index} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                    <Card align="center" style={{ borderRadius: "1.25rem", width: "16.5rem", height: "18.75rem", marginTop: "1rem" }}>
                                        <div style={{ width: "13.5rem", height: "13.5rem", textAlign: "center" }}>
                                            <img align="center" style={{ height: "100%", width: "100%", display: (this.state.imgLoaded[this.state.selectedIndex] === true) ? 'block' : 'none' }} onLoad={() => this.setState({})}
                                                src={this.state.currentQRCode}></img>
                                            <span style={{ display: (this.state.imgLoaded[this.state.selectedIndex] === false) ? 'block' : 'none' }}><Skeleton animation="wave" variant="rect" style={{ width: "12.5rem", height: "12.5rem" }} /></span>
                                        </div>
                                        <div style={{ width: "100%", color: ColorPicker.highEmphasis }}>
                                            <span className="body1 highEmphasis" style={{ color: ColorPicker.highEmphasis }}> {localeObj.pix_key}</span>
                                        </div>
                                        <div style={{ marginLeft: "0.5rem", marginRight: "0.5rem", color: ColorPicker.highEmphasis }}>
                                            <span className="caption highEmphasis" style={{ color: ColorPicker.highEmphasis }}>{this.fetchPixKeyValue(this.state.currentKey, this.state.currentPixKeyValue)}</span>
                                        </div>
                                        <div style={{ width: "100%", color: ColorPicker.highEmphasis }}>
                                            <span className="caption highEmphasis" style={{ color: ColorPicker.highEmphasis }}>{localeObj.registered + this.state.currentKeyDate}</span>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </ItemsCarousel>

                            <div style={{ display: this.state.allKeys.length !== 1 ? 'block' : 'none' }}>
                                <FlexView column hAlignContent="center" style={{ paddingBottom: "1rem" }}>
                                    <MuiThemeProvider theme={theme1}>
                                        <MobileStepper
                                            variant="dots"
                                            steps={this.state.allKeys.length}
                                            position="static"
                                            activeStep={this.state.selectedIndex}
                                        />
                                    </MuiThemeProvider>
                                </FlexView>
                            </div>
                        </div>
                        <div>
                            <span className="caption highEmphasis">
                                {localeObj.key_information_detail_title}
                            </span>
                        </div>
                        <div style={{ marginTop: "6%", display: 'flex', justifyContent: 'center', alignItems: 'center'  }}>
                            <table style={{ border: "none", width: "80%" }}>
                                <tbody>
                                    <tr id="row0" style={{ border: "none" }}>
                                        <td align="left"> <span className="caption mediumEmphasis"> {localeObj.name} </span></td>
                                        <td align="right">
                                            <td align="left"> <span className="CaptionBold highEmphasis"> {this.state.allKeys[this.state.selectedIndex].name} </span></td>
                                        </td>
                                    </tr>
                                    <tr id="row2" style={{ border: "none" }}>
                                        <td align="left"> <span className="caption mediumEmphasis"> {localeObj.cpf} </span></td>
                                        <td align="right">
                                            <td align="left"> <span className="CaptionBold highEmphasis"> {GeneralUtilities.maskCpf(this.state.allKeys[this.state.selectedIndex].cpf)} </span></td>
                                        </td>
                                    </tr>
                                    <tr id="row0" style={{ border: "none" }}>
                                        <td align="left"> <span className="caption mediumEmphasis"> {localeObj.Institution} </span></td>
                                        <td align="right">
                                            <td align="left"> <span className="CaptionBold highEmphasis"> {this.state.allKeys[this.state.selectedIndex].institution} </span></td>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div style={{...InputThemes.bottomButtonStyle, textAlign:"center"}}>
                            <TimeOutPrimaryButton btn_text={localeObj.share_key} onCheck={this.onShare} />
                            <TimeOutSecondaryButton btn_text={localeObj.delete_key} onCheck={this.onDelete} />

                        </div>
                    </div>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}
KeyInformationComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};
export default withStyles(styles)(KeyInformationComponent);
