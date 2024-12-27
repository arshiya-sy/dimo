import React from "react";
import "../../styles/main.css";
import InputThemes from "../../Themes/inputThemes";
import FlexView from "react-flexview";
import PropTypes from 'prop-types';

import PageNames from "../../Services/PageNames";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from "../../Services/ArbiResponseHandler";
import ColorPicker from "../../Services/ColorPicker";
import PixErrorComponent from "../CommonUxComponents/ErrorTemplate";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { CSSTransition } from 'react-transition-group';
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import constantObjects from "../../Services/Constants";

import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import CardIcon from "../../images/SvgUiIcons/card.svg";

import card_logo from "../../images/SpotIllustrations/NewCard.png";
import pt_card_logo from "../../images/SpotIllustrations/NewPtCard.png";
import logo from "../../images/SpotIllustrations/Checkmark.png";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import ImageInformationComponent from "../CommonUxComponents/ImageInformationComponent";
import PageState from "../../Services/PageState";
import MetricsService from "../../Services/MetricsService";
import GeneralUtilities from "../../Services/GeneralUtilities";

const styles = InputThemes.singleInputStyle;
const theme2 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.migrateCardRequest;
var localeObj = {};

class MigrateEloCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            creationState: "initial",
            snackBarOpen: false,
            cardKey: this.props.location.state.cardKey || ""
        };
        this.styles = {
            cardStyle: {
                width: "100%",
                borderRadius: "0.5rem",
                margin: "0 1rem"
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
                padding: "0.75rem"
            },
        };
        this.componentName = PageNameJSON.initial;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.onBack();
        }
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

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
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

    onBack = () => {
        if (this.state.processing) {
            this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricsService.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.back);
            this.props.history.replace("/digitalCard");
        }
    }

    onSuccess = () => {
        MetricsService.onPageTransitionStop(PageNameJSON.success, PageState.close);
        let event = {
            eventType: constantObjects.migrationSuccess,
            page_name: PageNameJSON.success,
        };
        MetricsService.reportActionMetrics(event, new Date().getTime());
        this.props.history.replace("/digitalCard");
    }

    onConfirm = () => {
        this.showProgressDialog();
        arbiApiService.migrateCard(this.state.cardKey, PageNameJSON.initial).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processMigrateCardResponse(response.result);
                if (processorResponse.success) {
                    this.setState({
                        creationState: "success"
                    })
                } else {
                    this.openSnackBar(processorResponse.message);
                    return;
                }
            } else {
                let jsonObj = {};
                jsonObj["header"] = localeObj.card_failed;
                jsonObj["description"] = response.result.message;
                this.setState({
                    errorJson: jsonObj,
                    creationState: "error"
                })
            }
        });
    }

    goToVirtualCard = () => {
        let event = {
            eventType: constantObjects.vCardLearnMore,
            page_name: PageNames.DigitalCardScreen,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        if (this.props.location && this.props.location.state && this.props.location.state.virtualDetails.length === 0) {
            this.props.history.replace({
                pathname: '/virtualCardInfo',
                state: this.props.location.state.virtualDetails,
                cardState: "NO CARD"
            });
        } else {
            this.props.history.replace({
                pathname: '/virtualCardInfo',
                state: this.props.location.state.virtualDetails,
                cardState: "CARD PRESENT"
            });
        }
    }

    help = () => {
        GeneralUtilities.openHelpSection();
    }

    render() {
        const creation = this.state.creationState;
        const screenWidth = window.screen.width;
        const finalHeight = window.screen.height;

        const depositContents = [
            {
                heading: localeObj.go_visa,
                text: localeObj.go_visa_desc,
                icon: <img src={CardIcon} style={this.styles.imgStyle} />,
                btn: localeObj.click_check
            },
            {
                heading: localeObj.virtual_card,
                text: localeObj.virtual_card_desc,
                icon: <img src={CardIcon} style={this.styles.imgStyle} />
            }
        ];
        return (
            <div style={{ overflowX: "hidden" }}>
                <div style={{ display: creation === "initial" && !this.state.processing ? 'block' : 'none' }}>
                    <ButtonAppBar header={localeObj.acc_card} onBack={this.onBack} action="none" />
                    <FlexView column style={InputThemes.initialMarginStyle}>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.new_visa}
                        </div>
                    </FlexView>
                    <FlexView column hAlignContent="center" style={{ margin: "1.5rem" }}>
                        <img style={{ height: "7rem" }} src={androidApiCalls.getLocale() === "en_US" ? card_logo : pt_card_logo} alt=""></img>
                    </FlexView>
                    <FlexView column style={{ margin: "1.5rem", marginBottom: "0.5rem" }}>
                        <div className="body2 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.benefit_visa}
                        </div>
                        <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "0.5rem" }}>
                            {localeObj.new_visa_benefit}
                        </div>
                    </FlexView>
                    <div  style={{ width: "100%", textAlign: "center" }}>
                        <MuiThemeProvider theme={InputThemes.SalaryWithDrawTheme}>
                            <Grid container spacing={0}>
                                {
                                    depositContents.map((keys) => (
                                        <div key={keys} style={{...this.styles.cardStyle, textAlign: "center"}}>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <div style={this.styles.circle}>{keys.icon}</div>
                                                </ListItemIcon>
                                                <ListItemText>
                                                    <div  style={{ marginLeft: "1rem", textAlign: "left" }}>
                                                        <span className="subtitle4 highEmphasis" >{keys.heading}</span>
                                                        <div className="body2 mediumEmphasis" style={{ margin: "0.25rem 0" }}>{keys.text}</div>
                                                        {keys.btn && <div className="body2 accent" onClick={() => this.goToVirtualCard()}>{keys.btn}</div>}
                                                    </div>
                                                </ListItemText>
                                            </ListItem>
                                        </div>
                                    ))
                                }
                            </Grid>
                        </MuiThemeProvider>
                    </div>

                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                        <div className="body2 highEmphasis" style={{ margin: "1.5rem", textAlign: "left" }}>
                            {localeObj.replace_elo}
                        </div>
                        <PrimaryButtonComponent btn_text={localeObj.ask_dimo_card} onCheck={this.onConfirm} />
                        <SecondaryButtonComponent btn_text={localeObj.plain_maybe_later} onCheck={this.onBack} />
                        <div className="body2 highEmphasis" style={{ marginTop: "1rem" }} onClick={() => this.help()}>{localeObj.help}</div>
                    </div>

                </div>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} classNames="pageSliderLeft"
                    in={creation === "error" && !this.state.processing ? true : false} timeout={300}>
                    <div style={{ display: (creation === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.onBack} componentName={PageNameJSON.error} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true} classNames="pageSliderLeft"
                    in={creation === "success" && !this.state.processing ? true : false} timeout={300}>
                    <div style={{ display: (creation === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "success" &&
                            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: finalHeight, overflowY: "hidden" }}>
                                <ImageInformationComponent type={PageNameJSON.success} header={localeObj.card_issued} icon={logo} appBar={true} onCancel={this.onSuccess} btnText={localeObj.ok_i_got} next={this.onSuccess} noAction={true}
                                    suggestion={localeObj.card_issued_desc1} description={localeObj.card_issued_desc2} subText={localeObj.card_issued_desc3} tip={androidApiCalls.getLocale() === "en_US" ? localeObj.card_issued_desc4 : ""} />
                            </div>
                        }
                    </div>
                </CSSTransition>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    <div>
                        <ButtonAppBar header={localeObj.acc_card} onBack={this.onBack} action="none" />
                        <CustomizedProgressBars />
                    </div>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div >
        );
    }
}

MigrateEloCard.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};

export default withStyles(styles)(MigrateEloCard);