import React from "react";
import FlexView from "react-flexview";
import "../../../styles/main.css";
import InputThemes from "../../../Themes/inputThemes";
import PropTypes from "prop-types";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import MetricServices from "../../../Services/MetricsService";
import success from "../../../images/SpotIllustrations/Rocket vcard.png";
import card from "../../../images/SpotIllustrations/cc_onboarding.webp";
import DigitalCardArrival from "./DigitalCardArrival";
import { CSSTransition } from 'react-transition-group';
import ImageInformationComponent from "../../CommonUxComponents/ImageInformationComponent";
import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';

import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import OneIcon from "../../../images/SvgUiIcons/number_1.svg";
import TwoIcon from "../../../images/SvgUiIcons/number_2.svg";
import constantObjects from "../../../Services/Constants";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import CardRequestInfo from "./CardRequestInfo";
import ColorPicker from "../../../Services/ColorPicker";
import GeneralUtilities from "../../../Services/GeneralUtilities";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.digitalCardRequest;
var localeObj = {};

class DigitalCardRequestComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appBarState: "",
            creationState: "initial",
            address: "",
            direction: "",
            snackBarOpen: false,
            physicalCardCategory: "",
            isOnBack: true,
            bottomSheetOpen: false
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
                backgroundColor: ColorPicker.bottomSheetColor
            },
            imgStyle: {
                height: "1.25rem",
                width: "1.25rem",
                padding: "1rem"
            },
            iconStyle: {
                height: "1.1rem",
                width: "1.1rem",
                padding: "1rem"
            },

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
        this.getRequestCategory();
    }

    setField = () => {
        switch (this.state.creationState) {
            case "initial":
                return this.getDeliveryAddress();
            case "request":
                return this.requestPhysicalCard();
            default: break;
        }
    }

    onBack = () => {
        if (this.state.bottomSheetOpen) {
            return this.setState({
                bottomSheetOpen: false
            });
        } else if (this.state.processing) {
            return this.setState({
                snackBarOpen: true,
                message: localeObj.no_action
            })
        } else {
            MetricServices.onPageTransitionStop(PageNameJSON[this.state.creationState], PageState.back);
            switch (this.state.creationState) {
                case "initial":
                    if (this.state.isOnBack) {
                        this.setState({ isOnBack: false });
                        this.props.history.replace({ pathname: "/digitalCard", transition: "right" });
                        // GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
                    }
                    break;
                case "request":
                    return this.setState({
                        creationState: "initial",
                        direction: "back"
                    })
                case "success":
                    ImportantDetails.cardDetailResponse = {};
                    this.props.history.replace({ pathname: "/digitalCard", transition: "right" });
                    break;
                case "error":
                    this.props.history.replace({ pathname: "/digitalCard", transition: "right" });
                    break;
                // GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
                default: break;
            }
        }
    }

    getDeliveryAddress = () => {
        this.showProgressDialog();
        arbiApiService.getAllClientData(PageNameJSON.address).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processGetAllClientDataResponse(response.result, "profile");
                let data = processedResponse ? processedResponse.data : {};
                this.setState({
                    address: GeneralUtilities.formatMailingAddress(data) !== "NO ADDRESS" ? data.enderecoCorrespondencia : data.endereco,
                    creationState: "request",
                    direction: "left",
                })
            } else {
                let jsonObj = {};
                jsonObj["header"] = localeObj.failed_address;
                jsonObj["description"] = response.result.message;
                this.setState({
                    errorJson: jsonObj,
                    creationState: "error",
                    direction: "left"
                })
            }
        });
    }

    getRequestCategory = () => {
        this.showProgressDialog();
        arbiApiService.getRequestCategory(PageNameJSON.request).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processedResponse = ArbiResponseHandler.processRequestCategory(response.result);
                if (processedResponse.success) {
                    this.setState({
                        physicalCardCategory: processedResponse.physicalCardCategory
                    })
                }
            } else {
                let jsonObj = {};
                jsonObj["header"] = localeObj.card_request_failed;
                jsonObj["description"] = response.result.message;
                this.setState({
                    errorJson: jsonObj,
                    creationState: "error",
                    direction: "left"
                })
            }
        });
    }

    requestPhysicalCard = () => {
        this.showProgressDialog();
        arbiApiService.requestPhysicalCard(this.state.physicalCardCategory, PageNameJSON["request"])
            .then(response => {
                this.hideProgressDialog();
                if (response.success) {
                    let processedDeatils = ArbiResponseHandler.processRequestPhysicalCardAPI(response.result);
                    if (processedDeatils.success) {
                        this.setState({
                            creationState: "success",
                            direction: "left"
                        });
                    } else {
                        this.openSnackBar(localeObj.retry_later);
                    }
                } else {
                    let jsonObj = {};
                    jsonObj["header"] = localeObj.card_request_failed;
                    jsonObj["description"] = response.result.message;
                    this.setState({
                        errorJson: jsonObj,
                        creationState: "error",
                        direction: "left"
                    })
                }
            });
    }

    changeAddress = () => {
        this.setState({ bottomSheetOpen: true })
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

    goToProfile = () => {
        this.props.history.replace("/myAccount", { "dataUpdated": true });
    }

    cancel = () => {
        this.setState({ bottomSheetOpen: false })
    }

    render() {
        const { classes } = this.props;
        const depositContents = [
            {
                heading: localeObj.update_address,
                text: localeObj.update_address_desc,
                icon: <img src={OneIcon} style={this.styles.imgStyle} alt="" />
            },
            {
                heading: localeObj.request_card_profile,
                text: localeObj.request_card_desc,
                icon: <img src={TwoIcon} style={this.styles.iconStyle} alt="" />
            }
        ];
        const creation = this.state.creationState;
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        return (
            <div style={{ overflowX: "hidden" }}>
                {creation !== "success" && creation !== "error" &&
                    <div>
                        <ButtonAppBar header={creation === "initial" ? localeObj.dimo_card : localeObj.acc_card} onBack={this.onBack} action="none" />
                    </div>
                }
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "initial" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "initial" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "initial" && <CardRequestInfo confirm={this.setField} onBack={this.onBack} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "request" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "request" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "request" && <DigitalCardArrival icon={card} next={this.setField} type="request" componentName={PageNameJSON["request"]}
                            back={this.onBack} secondary={this.changeAddress} address={this.state.address} />}
                    </div>
                </CSSTransition>
                <CSSTransition mountOnEnter={true} unmountOnExit={true}
                    in={creation === "success" && !this.state.processing ? true : false} timeout={300}
                    classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                    <div style={{ display: (creation === "success" && !this.state.processing ? 'block' : 'none') }}>
                        {creation === "success" &&
                            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                                <ImageInformationComponent header={localeObj.physical_card_header} onCancel={this.onBack} icon={success}
                                    appBar={true} description={localeObj.arrive_time} btnText={false} type={PageNameJSON["success"]} />
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
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.state.bottomSheetOpen}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.change_address}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                    {localeObj.change_address_desc}
                                </div>
                            </FlexView>
                        </div>
                        <div style={{ width: "100%", textAlign: "center" }}>
                            <MuiThemeProvider theme={InputThemes.SalaryWithDrawTheme}>
                                <Grid container spacing={0}>
                                    {
                                        depositContents.map((keys, index) => (
                                            <div key={index} style={{ ...this.styles.cardStyle, textAlign: "center" }}>
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <div style={this.styles.circle}>{keys.icon}</div>
                                                    </ListItemIcon>
                                                    <ListItemText>
                                                        <div style={{ marginLeft: "1rem", textAlign: "left" }}>
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
                        <div style={{ width: "100%", margin: "1.5rem 0", textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.go_to_my_profile} onCheck={this.goToProfile} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.cancel} />
                        </div>
                    </Drawer>
                </div>
            </div>
        );
    }
}
DigitalCardRequestComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  };

export default withStyles(styles)(DigitalCardRequestComponent);

