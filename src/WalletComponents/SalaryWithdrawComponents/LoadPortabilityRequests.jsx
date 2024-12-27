import React from "react";
import PropTypes from "prop-types";
import "../../styles/main.css";
import "../../styles/lazyLoad.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";
import { CSSTransition } from 'react-transition-group';
import FlexView from "react-flexview";

import PageState from "../../Services/PageState";
import MetricsService from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';

import ListAllRequests from "./WithdrawSupportComponents/ListAllRequests";
import SelectMenuOption from "../CommonUxComponents/SelectMenuOption";
import DetailFormComponent from "../OnBoardingSupportComponents/DetailFormComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import InputThemes from "../../Themes/inputThemes";
import PageNames from "../../Services/PageNames";
import constantObjects from "../../Services/Constants";
import SetPinComponent from "../CommonUxComponents/InputPinPage";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";

const PageNameJSON = PageNames.SalaryPortabilityRequestProcess;
const styles = InputThemes.singleInputStyle;
var localeObj = {};

class LoadPortabilityRequests extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            portabilityList: [],
            creationState: "initial",
            details: ""
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(PageNameJSON.load);
    }

    componentDidMount() {
        window.onBackPressed = () => {
            if (this.state.open) {
                this.setState({ open: false });
            } else {
                this.onBack();
            }
        }
        if (this.props.location && this.props.location.portabilities) {
            this.setState({
                portabilityList: this.props.location.portabilities,
                creationState: "load"
            })
        }
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
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

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    setField = (field) => {
        switch (this.state.creationState) {
            case "load":
                return this.setState({
                    portKey: field,
                    creationState: "reason",
                    direction: "left"
                })
            case "reason":
                this.setState({
                    reason: field
                })
                if (field === 5 || field === 7) {
                    return this.setState({
                        creationState: "detail",
                        direction: "left"
                    })
                } else {
                    return this.setState({ open: true })
                }
            case "detail":
                return this.setState({
                    details: field,
                    open: true
                })
            case "pin":
                this.cancelPortability(field);
                return
            default:
        }
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action,
            })
        } else {
            MetricsService.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.back);
            switch (this.state.creationState) {
                case "load":
                    if (this.props.location && this.props.location.fromComponent) {
                            return this.props.history.replace({
                                pathname: '/salaryPortability',
                                transition: "right",
                                "fromComponent": this.props.location.fromComponent
                            })
                    } else {
                        return this.props.history.replace({
                            pathname: '/salaryPortability',
                            transition: "right"
                        })
                    }
                case "reason":
                    return this.setState({
                        creationState: "load",
                        direction: "left"
                    })
                case "detail":
                    return this.setState({
                        creationState: "reason",
                        direction: "left"
                    })
                case "pin":
                    return this.onSecondary();
                case "error":
                    return this.goToLaunchPage();
                default:
            }
        }
    }

    goToLaunchPage = () => {
        return this.setState({
            creationState: "load",
            direction: "left"
        })
    }

    onSecondary = () => {
        this.setState({ open: false });
        if (this.state.reason === 5 || this.state.reason === 7) {
            return this.setState({
                creationState: "detail",
                direction: "left"
            })
        } else {
            return this.setState({
                creationState: "reason",
                direction: "left"
            })
        }
    }

    onPrimary = () => {
        this.setState({
            open: false,
            creationState: "pin",
            direction: "left"
        })
    }

    cancelPortability = (token) => {
        this.showProgressDialog();
        let jsonObject = {};
        jsonObject["portKey"] = this.state.portKey;
        jsonObject["reason"] = this.state.reason;
        jsonObject["details"] = this.state.details;
        jsonObject["token"] = token;

        ArbiApiService.cancelSalaryPortability(jsonObject, PageNameJSON.load)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processDeleteContact(response.result);
                    if (processorResponse.success) {
                        this.openSnackBar(localeObj.port_req_cancelled);
                        ArbiApiService.listAllPortabilityRequests(PageNameJSON.load)
                            .then(response => {
                                this.hideProgressDialog();
                                if (response.success) {
                                    let processorResponse = ArbiResponseHandler.processListAllPortabilities(response.result);
                                    if (processorResponse.success) {
                                        this.setState({
                                            portabilityList: processorResponse.portabilities,
                                            creationState: "load"
                                        })
                                    } else {
                                        this.openSnackBar(processorResponse.message);
                                    }
                                } else {
                                    this.setState({
                                        message: response.result.message
                                    })
                                }
                            })
                    } else {
                        this.hideProgressDialog();
                        this.openSnackBar(processorResponse.message);
                    }
                } else {
                    this.hideProgressDialog();
                    let jsonObj = {}
                    jsonObj["title"] = localeObj.salary_portability;
                    jsonObj["header"] = localeObj.failedToProcess;
                    jsonObj["description"] = response.result.message;
                    return this.setState({
                        errorJson: jsonObj,
                        creationState: "error",
                        direction: "left"
                    })
                }
            })
    }

    create = (jsonObject) => {
        this.props.history.replace({ pathname: "/requestSalaryPortability", transition: "right", "valueRequests": jsonObject })
    }

    render() {
        const creation = this.state.creationState;
        const { classes } = this.props;
        return (
            <div style={{ overflowX: "hidden" }}>
                {creation !== "error" &&
                    <ButtonAppBar header={creation === "pin" ? localeObj.pix_authentication : localeObj.requests}
                        onBack={this.onBack} action="none" />}
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "load" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "load" && !this.state.processing) ? 'block' : 'none' }}>
                        {creation === "load" && <ListAllRequests cancel={this.setField} onBack={this.onBack} confirm={this.create}
                            portabilityList={this.state.portabilityList} componentName={PageNameJSON.load} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "reason" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "reason" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "reason" && <SelectMenuOption type="PortCancel" header={localeObj.cancel_reason}
                            recieveField={this.setField} value={this.state.reason} componentName={PageNameJSON.reason} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "detail" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "detail" && !this.state.processing) ? 'block' : 'none' }}>
                        {creation === "detail" && <DetailFormComponent header={localeObj.cancel_reason}
                            field={localeObj.name} recieveField={this.setField} value={this.state.details}
                            componentName={PageNameJSON.details} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "pin" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "pin" && <SetPinComponent confirm={this.setField} componentName={PageNameJSON.pin} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.goToLaunchPage} componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <MuiThemeProvider theme={InputThemes.OperatorMenuTheme}>
                        <Drawer classes={{ paper: classes.paper }}
                            anchor="bottom"
                            open={this.state.open}>
                            <div style={{ margin: "1.5rem" }}>
                                <FlexView column style={{ marginTop: "0.5rem" }}>
                                    <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                        {localeObj.cancel_portability + "?"}
                                    </div>
                                    <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                        {localeObj.cancel_port_desc}
                                    </div>
                                </FlexView>
                            </div>
                            <div style={{ width: "100%", marginBottom: "1.5rem", textAlign:"center" }}>
                                <PrimaryButtonComponent btn_text={localeObj.yes_can_port} onCheck={this.onPrimary} />
                                <SecondaryButtonComponent btn_text={localeObj.back} onCheck={this.onSecondary} />
                            </div>
                        </Drawer>
                    </MuiThemeProvider>
                </div>
            </div>
        )
    }
}
LoadPortabilityRequests.propTypes = {
    location: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    header: PropTypes.string
  }
export default withStyles(styles)(LoadPortabilityRequests);