import React from 'react';
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";

import PageState from '../../Services/PageState';
import PageNames from '../../Services/PageNames';
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import ArbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import GeneralUtilities from '../../Services/GeneralUtilities';

import SimpleIcon from "../../images/SpotIllustrations/SalaryWith1.png";
import LeaveIcon from "../../images/SpotIllustrations/SalaryWith2.png";
import SafeIcon from "../../images/SpotIllustrations/SalaryWith3.png";
import NextIcon from "@material-ui/icons/ArrowForwardIos";
import CustomizedProgressBars from '../CommonUxComponents/ProgressComponent';
import constantObjects from '../../Services/Constants';
import EndActionButtonComponent from '../CommonUxComponents/EndActionButton';

const styles = InputThemes.singleInputStyle;

var localeObj = {};
class SalaryWithdrawComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            localeObj: [],
            viewDetails: false,
            fromComp: "",
            subDeepLink: false
        }
        this.styles = {
            cardStyle: {
                width: "100%",
                margin: "0 1rem"
            },
            circle: {
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            },
            imgStyle: {
                height: "3rem"
            }
        }
        MetricServices.onPageTransitionStart(PageNames.SalaryPortabilityHomePage);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        this.deepLinkCheck().then(() => { });
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        this.listPortabilityRequests();
        window.onBackPressed = () => {
            this.back();
        }
        if (this.props.location && this.props.location.fromComponent
            && this.props.location.fromComponent === "AllServices") {
            this.setState({
                fromComp: "AllServices"
            });
        } else {
            this.setState({
                fromComp: "newWalletLaunch"
            });
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.SalaryPortabilityHomePage, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.SalaryPortabilityHomePage);
        }
    }

    deepLinkCheck = async () => {
        if (this.props.location.additionalInfo !== "" && this.props.location.additionalInfo !== undefined) {
            let action = this.props.location.additionalInfo["portabilityActions"];
            if (action !== "" && action !== undefined && action !== null) {
                this.setState({ subDeepLink: true });
            }
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }


    back = () => {
        MetricServices.onPageTransitionStop(PageNames.SalaryPortabilityHomePage, PageState.back);
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    onNext = () => {
        MetricServices.onPageTransitionStop(PageNames.SalaryPortabilityHomePage, PageState.close);
        let event = {
            eventType: constantObjects.viewPortabilityRequests,
            page_name: PageNames.SalaryPortabilityHomePage,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        this.props.history.replace({ pathname: "/requestSalaryPortability", transition: "right", "fromComponent": this.state.fromComp })
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

    listPortabilityRequests = () => {
        this.showProgressDialog();
        ArbiApiService.listAllPortabilityRequests(PageNames.SalaryPortabilityHomePage)
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processListAllPortabilities(response.result);
                    if (processorResponse.success) {
                        if (processorResponse.requests > 0) {
                            this.setState({
                                viewDetails: true,
                                portabilities: processorResponse.portabilities
                            })
                            if (this.state.subDeepLink) {
                                this.props.history.replace({ pathname: "/loadPortabilityRequests", transition: "right", "portabilities": processorResponse.portabilities, "fromComponent": this.state.fromComp });
                            }
                        }
                    } else {
                        this.openSnackBar(processorResponse.message);
                    }
                } else {
                    this.setState({
                        message: response.result.message
                    })
                }
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

    moveToPortabilityRequests = () => {
        MetricServices.onPageTransitionStop(PageNames.SalaryPortabilityHomePage, PageState.close);
        let event = {
            eventType: constantObjects.viewPortabilityRequests,
            page_name: PageNames.SalaryPortabilityHomePage,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        this.props.history.replace({ pathname: "/loadPortabilityRequests", transition: "right", "portabilities": this.state.portabilities, "fromComponent": this.state.fromComp });
    }

    render() {
        const screenHeight = window.screen.height;
        const depositContents = [
            {
                heading: localeObj.salary_portability_header_2,
                text: localeObj.salary_portability_desc_2,
                icon: <img src={SimpleIcon} alt={"simple"} style={this.styles.imgStyle} />
            },
            {
                heading: localeObj.salary_portability_header_3,
                text: localeObj.salary_portability_desc_3,
                icon: <img src={LeaveIcon} alt={"Leave"} style={this.styles.imgStyle} />
            },
            {
                heading: localeObj.salary_portability_header_4,
                text: localeObj.salary_portability_desc_4,
                icon: <img src={SafeIcon} alt={"Safe"} style={this.styles.imgStyle} />
            }
        ];

        return (
            <div style={{ overflowX: "hidden" }}>
                <ButtonAppBar header={localeObj.salary_portability} onBack={this.back} action="none" />
                <div className="scroll" style={{ height: `${screenHeight - 240}px`, overflowY: "auto", display: !this.state.processing ? "block" : "none" }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.salary_portability_header_1}
                            </div>
                            <div className="body2 highEmphasis scroll" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                {localeObj.salary_portability_desc_1}
                            </div>
                        </FlexView>
                    </div>

                    <div  style={{ width: "100%", textAlign:"center" }}>
                        <MuiThemeProvider theme={InputThemes.SalaryWithDrawTheme}>
                            <Grid container spacing={0}>
                                {
                                    depositContents.map((keys,index) => (
                                        <div key={index}  style={{...this.styles.cardStyle, textAlign:"center"}}>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <div style={this.styles.circle}>{keys.icon}</div>
                                                </ListItemIcon>
                                                <ListItemText>
                                                    <div style={{ marginLeft: "1rem", textAlign:"left" }}>
                                                        <span className="subtitle4 highEmphasis" >{keys.heading}</span>
                                                        <div className="body2 mediumEmphasis" style={{ marginTop: "0.5rem" }}>{keys.text}</div>
                                                    </div>
                                                </ListItemText>
                                            </ListItem>
                                        </div>
                                    ))
                                }
                            </Grid>
                        </MuiThemeProvider>
                    </div>
                    {this.state.viewDetails &&
                        <div style={{ marginTop: "1.5rem", textAlign:"center" }}>
                            <EndActionButtonComponent
                                btn_text={localeObj.view_request}
                                onCheck={this.moveToPortabilityRequests}
                                icon={<NextIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1rem" }} />} />
                        </div>
                    }
                    <div style={{...InputThemes.bottomButtonStyle, textAlign:"center"}}>
                        <PrimaryButtonComponent btn_text={localeObj.bring_salary} onCheck={this.onNext} />
                    </div>
                </div>
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
            </div>
        );
    }
}
SalaryWithdrawComponent.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  }
export default withStyles(styles)(SalaryWithdrawComponent);