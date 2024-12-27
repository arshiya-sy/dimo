import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import "../../../styles/main.css";
import InputThemes from "../../../Themes/inputThemes";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import MetricsService from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiErrorResponseHandler from "../../../Services/ArbiErrorResponsehandler";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";

import card from "../../../images/SpotIllustrations/Success.png";
import success from "../../../images/SpotIllustrations/Checkmark.png";
import DigitalCardArrival from "../CardRequestComponents/DigitalCardArrival";
import CardReview from "./CardReviewComponent";
import CardDetailComponent from "./CardDetailComponent";
import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import ImageInformationComponent from "../../CommonUxComponents/ImageInformationComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { CSSTransition } from 'react-transition-group';
import SetPinComponent from "../../CommonUxComponents/InputPinPage";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";

import DuedateComponent from "./DuedateComponent";
import constantObjects from "../../../Services/Constants";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import ArbiApiMetrics from "../../../Services/ArbiApiMetrics";
import GeneralUtilities from "../../../Services/GeneralUtilities";

const theme2 = InputThemes.snackBarTheme
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.cardArrivalComponent;
const CARD_STATUS_UPDATE = "CARD_STATUS_UPDATE_CUSTOM";
var localeObj = {};

class DigitalCardArrivalComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appBarState: "",
            creationState: "arrival",
            direction: "",
            open: false,
            card: props.location.state.card,
            clearPassword: false,
            cvv: ""
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        this.setField = this.setField.bind(this);
        this.onBack = this.onBack.bind(this);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        this.setState({
            appBarState: localeObj.account_card
        })
        window.onBackPressed = () => {
            this.onBack();
        }
        if (this.props.location.state.additionalInfo !== "" && this.props.location.state.additionalInfo !== undefined) {
            let action = this.props.location.state.additionalInfo["Actions"];
            if (action !== "" && action !== undefined) {
                this.setField(action)
            }
        }
    }

    setField = (field) => {
        switch (this.state.creationState) {
            case "arrival":
                return this.setState({
                    creationState: "review",
                    appBarState: localeObj.unblock_card,
                    direction: "left"
                })
            case "review":
                return this.setState({
                    creationState: "due",
                    direction: "left"
                })
            case "due":
                return this.setState({
                    creationState: "code",
                    direction: "left",
                    dueDate: field["date"],
                    date: field["displayDate"]
                })
            case "code":
                return this.setState({
                    cvv: field,
                    creationState: "pin",
                    direction: "left",
                })
            case "pin":
                this.setState({
                    pin: field,
                });
                return this.unblockUserCard(field);
            default:
                break;
        }
    }

    onBack = () => {
        if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricsService.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.back);
            switch (this.state.creationState) {
                case "review":
                    return this.setState({
                        creationState: "arrival",
                        direction: "right",
                        appBarState: localeObj.account_card
                    })
                case "due":
                    return this.setState({
                        creationState: "review",
                        direction: "right",
                    })
                case "code":
                    return this.setState({
                        creationState: "due",
                        direction: "right",
                    })
                case "pin":
                    return this.setState({
                        creationState: "code",
                        direction: "right",
                    })
                case "success":
                    ImportantDetails.cardDetailResponse = {};
                    this.props.history.replace({ pathname: "/digitalCard", transition: "right" });
                    break;
                case "error":
                    this.props.history.replace({ pathname: "/digitalCard", transition: "right" });
                    break;
                case "arrival":
                    if(this.state.bottomSheetOpen) {
                        this.bottomSheetOpen(false);
                    } else {
                        this.props.history.replace({ pathname: "/digitalCard", transition: "right" });
                    }
                    break;
                default:
                    break;
            }
        }
    }

    bottomSheetOpen = (val) => {
        this.setState({ bottomSheetOpen: val })
    }

    unblockUserCard(field) {
        this.showProgressDialog();
        let unblockObj = {};
        unblockObj["cvv"] = this.state.cvv;
        unblockObj["expiryDate"] = this.state.dueDate;
        unblockObj["pin"] = field;
        unblockObj["cardKey"] = this.state.card.cardKey;
        arbiApiService.unblockCardbyIssue(unblockObj, PageNameJSON[this.state.creationState])
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processUnblockCardByIssueResponse(response.result);
                    if (processorResponse.success) {
                        let uri = "/cartao/desbloquear-cartao-emissao-sync-senha-conta";
                        let jsonObj = {};
                        jsonObj["chaveDeConta"] = ImportantDetails.accountKey;
                        jsonObj["chaveDeCliente"] = ImportantDetails.clientKey;
                        jsonObj["chaveDeCartao"] = this.state.card.cardKey;
                        jsonObj["cardType"] = "physical";
                        jsonObj["cardProvider"] = this.state.card.brand;
                        jsonObj["apiName"] = uri;
                        ArbiApiMetrics.sendArbiMetrics(CARD_STATUS_UPDATE, CARD_STATUS_UPDATE, true, 201, jsonObj, 0);
                        this.setState({
                            creationState: "success",
                            direction: "left",
                        })
                    } else {
                        this.openSnackBar(processorResponse.message);
                    }
                } else {
                    let jsonObj = {};
                    let errorMessage = ArbiErrorResponseHandler.processCardErrors(response, localeObj);
                    jsonObj["header"] = localeObj.card_failed;
                    jsonObj["description"] = errorMessage;
                    this.setState({
                        errorJson: jsonObj,
                        creationState: "error",
                        direction: "left",
                    })
                }
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

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    help = () => {
        if (this.props.onHelp) {
            this.props.onHelp()
        } else {
            GeneralUtilities.openHelpSection();
        }
    }

    goToVirtualCard = () => {
        let event = {
            eventType: constantObjects.vCardLearnMore,
            page_name: PageNameJSON["arrival"],
        };
        MetricsService.reportActionMetrics(event, new Date().getTime());
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

    render() {
        const creation = this.state.creationState;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        return (
            <div style={{ overflowX: "hidden" }}>
                {creation !== "success" && creation !== "error" &&
                    <div>
                        <ButtonAppBar header={this.state.appBarState} onBack={this.onBack} action="none" />
                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "arrival" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "arrival" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "arrival" && <DigitalCardArrival icon={card} next={this.setField} bottomSheetOpen={this.bottomSheetOpen} bottomSheetEnabled={this.state.bottomSheetOpen} type="arrival" onHelp={this.help}
                            componentName={PageNameJSON["arrival"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "review" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "review" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "review" && <CardReview confirm={this.setField} details={this.state.card} onHelp={this.help}
                            componentName={PageNameJSON["review"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "due" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "due" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "due" && <DuedateComponent confirm={this.setField} value={this.state.date}
                            componentName={PageNameJSON["due"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "code" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "code" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "code" && <CardDetailComponent recieveField={this.setField} value={this.state.cvv} onHelp={this.help}
                            componentName={PageNameJSON["code"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "pin" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "pin" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "pin" && <SetPinComponent header={localeObj.four_digit_auth} description={localeObj.enterPin} confirm={this.setField}
                            componentName={PageNameJSON["pin"]} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "success" &&
                            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                                <ImageInformationComponent header={localeObj.card_unblocked} onCancel={this.onBack} icon={success}
                                    appBar={true} description={localeObj.unblock_description} btnText={false} type={PageNameJSON["success"]} />
                            </div>
                        }
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "error" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "error" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "error" && <PixErrorComponent errorJson={this.state.errorJson} onClick={this.onBack} componentName={PageNameJSON["error"]} />}
                    </div>
                </CSSTransition>
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

DigitalCardArrivalComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    onHelp: PropTypes.func.isRequired,
};

export default withStyles(styles)(DigitalCardArrivalComponent);
