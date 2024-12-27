import React from 'react';
import FlexView from "react-flexview";

import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

import PageState from '../../Services/PageState';
import PageNames from '../../Services/PageNames';
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import GeneralUtilities from '../../Services/GeneralUtilities';

import PixIcon from "../../images/SvgUiIcons/Pix.svg";
import Transfer from "../../images/SvgUiIcons/transaction.svg";
import WithdrawIcon from "../../images/SvgUiIcons/wallet.svg";
import BoletoIcon from "../../images/SvgUiIcons/BarCode.svg";
import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import ImportantDetails from '../NewLaunchComponents/ImportantDetails';
import constantObjects from '../../Services/Constants';
import PropTypes from "prop-types";

const styles = InputThemes.singleInputStyle;
var localeObj = {};
const theme1 = InputThemes.snackBarTheme;
class DepositLandingComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pixKeysBottom: false,
            isOnBack: true,
            snackBarOpen: false
        }
        this.styles = {
            cardStyle: {
                width: "100%",
                borderRadius: "0.5rem",
                margin: "0 1rem",
                align: "center"
            },
            circle: {
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: ColorPicker.newProgressBar
            },
            imgStyle: {
                height: "1.5rem",
                width: "1.5rem",
                padding: "1rem"
            },
            transferStyle: {
                height: "1rem",
                width: "1.2rem",
                padding: "1.25rem 1rem"
            }
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNames.depositLandingPage);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.back();
        }
        let fromRegisterPixKey = ImportantDetails.fromRegisterPixKey;
        if (fromRegisterPixKey) {
            this.getAllPixKeys();
            ImportantDetails.fromRegisterPixKey = false;
        }
    }

    getAllPixKeys() {
        this.showProgressDialog();
        ArbiApiService.getAllPixKeys(PageNames.depositLandingPage).then(response => {
            this.hideProgressDialog();
            ImportantDetails.pixKeysResponse = response;
        });
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.depositLandingPage, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.depositLandingPage);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    takeAction = async(action) => {
        if (action === "Boleto") {
            MetricServices.onPageTransitionStop(PageNames.depositLandingPage, PageState.close);
            this.props.history.push({ pathname: "/generateBoleto", from: PageNames.depositLandingPage });
        } else if (action === "Ted") {
            MetricServices.onPageTransitionStop(PageNames.depositLandingPage, PageState.close);
            this.props.history.push({ pathname: "/tedDeposit", from: PageNames.depositLandingPage });
        } else if (action === "Pix") {
            let response = {};
            if (ImportantDetails.pixKeysResponse === null ||
                ImportantDetails.pixKeysResponse == {} || ImportantDetails.fromRegisterPixKey
                || Object.keys(ImportantDetails.pixKeysResponse).length === 0) {
                this.showProgressDialog();
                await ArbiApiService.getAllPixKeys(PageNames.depositLandingPage).then(pixResponse => {
                    this.hideProgressDialog();
                    response = pixResponse;
                    ImportantDetails.pixKeysResponse = pixResponse;
                    ImportantDetails.fromRegisterPixKey = false;
                });
            } else {
                response = ImportantDetails.pixKeysResponse;
            }
            if (response.success) {
                const responseJson = ArbiResponseHandler.processGetAllKeysResponse(response.result);
                const pixKeys = responseJson.keys;
                if (pixKeys.length == 0) {
                    this.setState({
                        pixKeysBottom: true
                    });
                } else {
                    MetricServices.onPageTransitionStop(PageNames.depositLandingPage, PageState.close);
                    this.props.history.replace({ pathname: '/pixReceive', from: "depositPage" });
                }
            } else {
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.no_pix_keys
                })
            }
        } else if (action === "salary") {
            let event = {
                eventType: constantObjects.triggerPortability,
                page_name: PageNames.depositLandingPage,
            };
            MetricServices.reportActionMetrics(event, new Date().getTime());
            this.props.history.push("/salaryPortability");
        }
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    back = () => {
        if(this.state.pixKeysBottom){
            this.setState({
                pixKeysBottom: false
            });
        }
        else if (this.state.isOnBack) {
            this.setState({ isOnBack: false });
            MetricServices.onPageTransitionStop(PageNames.depositLandingPage, PageState.back);
            GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
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

    registerKey = () => {
        MetricServices.onPageTransitionStop(PageNames.depositLandingPage, PageState.close);
        //Log.sDebug("User has no pix keys, user clicked to register new key", "PixReceiveComponent");
        this.props.history.replace({ pathname: '/registerNewKeyComponent', from: "depositPage" });
    }

    handleClosePix = () => {
        this.setState({ pixKeysBottom: false })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    render() {
        const { classes } = this.props;
        const depositContents = [
            {
                heading: localeObj.boleto_payment,
                text: localeObj.boleto_subText,
                action: "Boleto",
                icon: <img src={BoletoIcon} style={this.styles.imgStyle} alt="" />
            },
            {
                heading: localeObj.transfers,
                text: localeObj.ted_subText,
                action: "Ted",
                icon: <img src={Transfer} style={this.styles.transferStyle} alt=""/>
            },
            {
                heading: localeObj.pix,
                text: localeObj.pix_subText,
                action: "Pix",
                icon: <img src={PixIcon} style={this.styles.imgStyle} alt=""/>
            },
            {
                heading: localeObj.deposit_salary,
                text: localeObj.salary_subText,
                action: "salary",
                icon: <img src={WithdrawIcon} style={this.styles.imgStyle} alt=""/>
            },
        ];

        return (
            <div style={{ overflowX: "hidden" }}>
                <ButtonAppBar header={localeObj.deposit} onBack={this.back} action="none" />
                <div style={{ display: !this.state.processing ? "block" : "none" }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.deposit_type}
                            </div>
                        </FlexView>
                    </div>

                    <FlexView column align="center" style={{ width: "100%" }}>
                        <Grid container spacing={0}>
                            {
                                depositContents.map((keys, index) => (
                                    <div key={index} style={this.styles.cardStyle}>
                                        <ListItem button onClick={() => this.takeAction(keys.action)}>
                                            <ListItemIcon>
                                                <div style={this.styles.circle}>{keys.icon}</div>
                                            </ListItemIcon>
                                            <ListItemText>
                                                <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                                    <span className="subtitle4 highEmphasis" >{keys.heading}</span>
                                                    <div className="body2 mediumEmphasis">{keys.text}</div>
                                                </div>
                                            </ListItemText>
                                        </ListItem>
                                    </div>
                                ))
                            }
                        </Grid>
                    </FlexView>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.pixKeysBottom}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.no_key_title}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.no_key_text}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.register_new_key} onCheck={this.registerKey} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.handleClosePix} />
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme1}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

DepositLandingComponent.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(DepositLandingComponent);