import React from 'react';
import FlexView from "react-flexview";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";
import PropTypes from "prop-types";

import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Card from '@material-ui/core/Card';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import Log from "../../Services/Log";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames"
import MetricServices from "../../Services/MetricsService";

import IconDivider from "../CommonUxComponents/DividerComponent";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import ProgressBar from "../CommonUxComponents/ProgressBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import constantObjects from '../../Services/Constants';

const styles = InputThemes.singleInputStyle;
const theme1 = InputThemes.TermsTheme;
const theme3 = InputThemes.MuiAlertForReceiptComponent;
var localeObj = {};

class TermsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: true,
            addTermLoaded: false,
            genTermLoaded: false,
            firstScroll: false,
            open: false,
            toa: "<h1>  </h1> ",
            tos: "<h1>  </h1> ",
            snackBarOpen: false,
        }
        this.style = {
            terms: {
                align: "center",
                fontSize: "12px",
                color: ColorPicker.darkMediumEmphasis,
                fontWeight: "400",
                fontFamily: "Roboto",
                lineHeight: "1rem"
            },
        }
        this.authenticationMessage = "Para utilizar token por e-mail, realize a confirmação do seu e-mail";
        this.componentName = PageNames.displayTorTos;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    async componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        document.addEventListener('scroll', this.trackScrolling);

        let links = document.getElementsByTagName('a')
        for (let i = 0; i < links.length; i++) {
            links.item(i).onclick = () => androidApiCalls.openUrlInBrowser("https://www.bancoarbi.com.br");
        }

        this.showProgressDialog();
        await Promise.all([await this.toaRendering(), await this.tosRendering()]).then(values => {
            Log.debug("Promised: " + JSON.stringify(values), this.componentName);
            this.hideProgressDialog();
        }).catch(err => {
            Log.sError("Error is: ", err);
            this.hideProgressDialog();
            this.setState({
                snackBarOpen: true,
                message: localeObj.dialog_error
            })
        });

        window.onBackPressed = () => {
            if (this.state.open) {
                this.setState({ open: false });
                return;
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
            MetricServices.onPageTransitionStart(this.componentName)
        }
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    async toaRendering() {
        return new Promise((resolve, reject) => {
            ArbiApiService.getTOA(this.componentName).then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processGetToaResponse(response.result);
                    if (processorResponse.success) {
                        document.getElementById("toa").innerHTML = processorResponse.toa;
                        resolve('TOA')
                        return;
                    } else {
                        this.hideProgressDialog();
                        this.tryLater();
                        reject('none')
                        return;
                    }
                } else {
                    this.hideProgressDialog();
                    this.tryLater();
                    reject('none')
                    return;
                }
            }).catch(err => {
                Log.sError("Error is: ", err);
                this.hideProgressDialog();
                this.tryLater();
                reject('none')
            });
        });
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    async tosRendering() {
        return new Promise((resolve, reject) => {
            ArbiApiService.getTOS(this.componentName).then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processGetTosResponse(response.result);
                    if (processorResponse.success) {
                        document.getElementById("tos").innerHTML = processorResponse.tos;
                        resolve('TOS')
                        return;
                    } else {
                        this.hideProgressDialog();
                        this.tryLater();
                        reject('none')
                        return;
                    }
                } else {
                    this.hideProgressDialog();
                    this.tryLater();
                    reject('none')
                    return;
                }
            }).catch(err => {
                Log.sError("Error is: ", err);
                this.hideProgressDialog();
                this.tryLater();
                reject('none')
            });
        });
    }

    moveToContract = () => {
        this.showProgressDialog();
        ArbiApiService.twoFactorAuth()
            .then(response => {
                if (response.success) {
                    let phoneNum = response.result.mensagem.split(" ");
                    this.setState({
                        snackBarOpen: true,
                        message: response.result.mensagem
                    })
                    this.hideProgressDialog();
                    MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                    this.props.history.replace({
                        pathname: '/contract',
                        state: phoneNum.pop(),
                    });
                } else {
                    this.hideProgressDialog();
                    if (response.result.details === this.authenticationMessage) {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.try_validation
                        })
                        return;
                    } else if (response.result.code === 46001 || response.result.code === 11014) {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.wait_and_try
                        })
                        return;
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.otp_validation_fail
                        })
                        return;
                    }
                }
            })
    }

    tryLater = () => {
        this.setState({
            snackBarOpen: true,
            message: localeObj.tryAgainLater
        })
    }

    trackScrolling = () => {
        const divider1 = document.getElementById('divider1');
        if (this.isBottom(divider1)) {
            this.setState({
                firstScroll: true
            })
        }
        const wrappedElement = document.getElementById('bottom');
        if (this.isBottom(wrappedElement)) {
            document.removeEventListener('scroll', this.trackScrolling);
        }
    };

    isBottom(el) {
        return el.getBoundingClientRect().bottom <= window.innerHeight;
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            this.setState({ open: true })
        }
    }

    onCancel = () => {
        this.setState({ open: true })
    }

    onSecondary = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.cancel);
        this.props.history.replace({ pathname: "/", transition: "right" });
        this.setState({ open: false })
    }

    onPrimary = () => {
        this.setState({ open: false })
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        });
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        });
    }

    render() {
        const { classes } = this.props;
        const screenHeight = window.screen.height;
        return (
            <div style={{ overflowX: "hidden" }}>
                <ButtonAppBar header={localeObj.acc_verification} onCancel={this.onCancel} action="cancel" inverse="true" />
                <ProgressBar size="20" />
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={{ margin: "1.5rem" }}>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.contract}
                        </div>
                        <div className="scroll" style={{ height: `${screenHeight - 330}px`, overflowY: "auto", marginTop: "1rem", overflowX: "hidden" }} onScroll={this.trackScrolling}>
                            <MuiThemeProvider theme={theme1}>
                                <Card style={{ background: "none" }} variant="outlined">
                                    <List component="nav">
                                        <ListItem>
                                            <FlexView column>
                                                <div className="body2 mediumEmphasis">
                                                    {localeObj.terms_header}
                                                </div>
                                                <div style={this.style.terms} id={"tos"}>
                                                </div>
                                            </FlexView>
                                        </ListItem>
                                        <div id="divider1">
                                            <IconDivider divScrolled={this.state.firstScroll}></IconDivider>
                                        </div>
                                        <ListItem>
                                            <FlexView column>
                                                <div className="body2 mediumEmphasis">
                                                    {localeObj.terms_header_address}
                                                </div>
                                                <div style={this.style.terms} id={"toa"}>
                                                </div>
                                            </FlexView>
                                        </ListItem>
                                        <div id="bottom"></div>
                                    </List>
                                </Card>
                            </MuiThemeProvider>
                        </div>
                    </div>
                    <div style={InputThemes.bottomButtonStyle}>
                        <PrimaryButtonComponent btn_text={localeObj.accept} onCheck={this.moveToContract} />
                    </div>
                    <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                        {this.state.processing && <CustomizedProgressBars />}
                    </div>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.open}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.cancel_message_header}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.cancel_message_description}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"  }}>
                            <PrimaryButtonComponent btn_text={localeObj.resume} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.stop} onCheck={this.onSecondary} />
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme3}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

TermsComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object,
    history: PropTypes.object
};

export default withStyles(styles)(TermsComponent);