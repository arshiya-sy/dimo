import React from "react";
import moment from "moment";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";
import InputThemes from "../../Themes/inputThemes";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import httpRequest from "../../Services/httpRequest";
import constantObjects from "../../Services/Constants";
import NewUtilities from "../../Services/NewUtilities";
import MetricServices from "../../Services/MetricsService";
import ArbiApiService from "../../Services/ArbiApiService";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import ArbiErrorResponsehandler from "../../Services/ArbiErrorResponsehandler";
import GeneralUtilities from "../../Services/GeneralUtilities";

import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import { withStyles, MuiThemeProvider } from "@material-ui/core/styles";

import SelectMenuOption from "../CommonUxComponents/SelectMenuOption";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

const theme1 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
var localeObj = {};

class SendComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            info: {},
            header: "",
            message: "",
            formInfo: -1,
            direction: "",
            menuOptionsOpen: true,
            snackBarOpen: false,
            processing: false,
            bottomSheetOpen: false,
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        // The below time out is introduced as SelectMenuOption is creating some distortion happening when we click on send icon in landing page or all services.
        this.processTimeout = setTimeout(() => {
            clearTimeout(this.processTimeout);
            this.setState({
                processing: false
            });
        }, 750);
        this.setState({
            header: localeObj.pix_send_amount
        });

        if (this.props.location && this.props.location.from) {
            if (this.props.location.from === "pixSend") {
                this.setState({
                    formInfo: 0
                });
            } else if (this.props.location.from === "ted") {
                this.setState({
                    formInfo: 1
                });
            } else if (this.props.location.from === "tedInternal") {
                this.setState({
                    formInfo: 2
                });
            }
        }
        window.onBackPressed = () => {
            this.back();
        }
    }

    isPublicHoliday = async () => {
        let today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        today = today.toISOString();
        this.showProgressDialog();
        await ArbiApiService.isDatePublicHoliday(today, PageNames.sendPage).then(response => {
            this.hideProgressDialog();
            if (response && response.success) {
                let processedResponse = ArbiResponseHandler.processIsDatePublicHolidayResponse(response.result);
                if (processedResponse && processedResponse.success) {
                    let workingDay = new Date(processedResponse.workingDay);
                    workingDay.setUTCHours(0, 0, 0, 0);
                    if(new Date(today).getTime() === workingDay.getTime()) {
                        this.setState({ isPublicHoliday: false });
                    } else {
                        this.setState({ isPublicHoliday: true });
                    }
                } else {
                    let errorMesaage = ArbiErrorResponsehandler.processErrorsForSnackBar(response, localeObj);
                    this.setState({
                        snackBarOpen: true,
                        message: errorMesaage
                    });
                }
            } else {
                this.setState({
                    snackBarOpen: true,
                    message: localeObj.pix_technical_issue
                });
            }
        });
    }

    schedule = () => {
        this.setState({
            bottomSheetOpen: false
        })
        MetricServices.onPageTransitionStop(PageNames.sendPage, PageState.close);
        this.props.history.replace({
            pathname: '/tedTransfer',
            type: "external",
            from: "send"
        });
    }

    onPressCancel = () => {
        this.setState({
            bottomSheetOpen: false
        })
    }

    setTransactionInfo = async (formInfo) => {
        MetricServices.onPageTransitionStop(PageNames.sendPage, PageState.close);
        if (formInfo === 0) {
            ImportantDetails.setTransactionEntryPoint(constantObjects.pixSend);
            this.props.history.replace({
                pathname: '/pixSendComponent',
                from: "send"
            });
        } else if (formInfo === 1) {
            await this.isPublicHoliday();
            ImportantDetails.setTransactionEntryPoint(constantObjects.tedExternal);
            if (moment().day() === 0 || moment().day() === 6 || (moment().hour() === 17 && moment().minute() > 15) || moment().hour() > 17 || moment().hour() < 8 || this.state.isPublicHoliday) {
                this.setState({
                    bottomSheetOpen: true,
                    processing: false
                })
            } else {
                this.props.history.replace({
                    pathname: '/tedTransfer',
                    type: "external",
                    from: "send"
                });
            }
        } else {
            ImportantDetails.setTransactionEntryPoint(constantObjects.tedInternal);
            this.props.history.replace({
                pathname: '/tedTransfer',
                type: "internal",
                from: "send"
            });
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    back = () => {
        // this.setState({
        //     menuOptionsOpen: false
        // })
        if (this.props.location && this.props.location.from && this.props.location.from === "mainTransactionHistory") {
            this.getBalanceAndMovetoMain();
        } else if(this.state.bottomSheetOpen) {
            this.setState({ bottomSheetOpen: false })
        } else {
            GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
            MetricServices.onPageTransitionStop(PageNames.sendPage, PageState.back);
        }
    }

    getBalanceAndMovetoMain = () => {
        this.showProgressDialog();
        ArbiApiService.getUserBalance(PageNames.sendPage)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse.success) {
                        let balanceInfo = processorResponse.balance.toString().split(".");
                        let balance = balanceInfo[0];
                        let decimal = NewUtilities.formatDecimal(balanceInfo[1]);
                        MetricServices.onPageTransitionStop(PageNames.sendPage, PageState.back);
                        this.props.history.replace({ pathname: "/newTransactionHistory", transition: "right", balanceData: { "balance": balance, "decimal": decimal } });
                    }
                } else {
                    if (response.result === httpRequest.NO_RESPONSE || !response.status || (response.status >= 400 && response.status < 500)) {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.pix_communication_issue
                        })
                    } else {
                        this.setState({
                            snackBarOpen: true,
                            message: localeObj.pix_technical_issue
                        })
                    }
                }
            });
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

    render() {
        const { classes } = this.props;

        return (
            <div style={{ overflowX: "hidden" }}>
                <ButtonAppBar header={this.state.header} onBack={this.back} action="none" />
                {!this.state.processing && !this.state.bottomSheetOpen && this.state.menuOptionsOpen &&
                    <SelectMenuOption style={{ display: (this.state.processing || this.state.bottomSheetOpen) ? 'none' : 'block' }} componentName={PageNames.sendPage} type="Transfer"
                        header={localeObj.method_list} description={localeObj.send_method} recieveField={this.setTransactionInfo}
                        value={this.state.formInfo} />
                }
                <MuiThemeProvider theme={theme1}>
                    <Snackbar align="center" open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.bottomSheetOpen && !this.state.processing}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.contact_method}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    <div>{localeObj.contact_ted_schedule_time}</div>
                                    <div style={{ display: "flex", justifyContent: "center" }}>{androidApiCalls.getLocale().includes("en") ? localeObj.contact_schedule : ""}</div>
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", marginTop: "1rem", marginBottom: "1.5rem", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.contact_schedule_transfer} onCheck={this.schedule} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onPressCancel} />
                        </div>
                    </Drawer>
                </div>
            </div >
        )

    }
}

SendComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
};

export default withStyles(styles)(SendComponent);
