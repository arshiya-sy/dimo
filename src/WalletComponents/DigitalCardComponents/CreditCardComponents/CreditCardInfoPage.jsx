import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import { Image } from 'react-bootstrap';

import "../../../styles/main.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";

import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import Drawer from '@material-ui/core/Drawer';
import CloseIcon from '@mui/icons-material/Close';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { withStyles} from "@material-ui/core/styles";

import sellIcon from "../../../images/SvgUiIcons/sell.svg";
import showChartIcon from "../../../images/SvgUiIcons/showChart.svg";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import ClickWithTimeout from "../../EngageCardComponent/ClickWithTimeOut";
import cashbackIcon from "../../../images/SpotIllustrations/cashback.png";
import backgroundImage from "../../../images/DarkThemeImages/background_webp_image.webp";
import creditCardValuePropWelcomeBenefits from "../../../images/DarkThemeImages/creditCardWelcomeBenefitsBanner.webp";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import MetricServices from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import GeneralUtilities from "../../../Services/GeneralUtilities";

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";

var localeObj = {};

const TimeOutSpan = ClickWithTimeout('span');
const screenWidth = window.screen.width;
const PageNameJSON = PageNames.CreditCardComponents;
const styles = InputThemes.singleInputStyle;

class CreditCardInfoPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            currentState: (this.props.previousComponent === "credit_invest" || this.props.previousComponent === "credit_invest_amount") ? "howItWorks" : "welcomeBenefits",
            currentSlide: 0,
            fromComponent: this.props.previousComponent,
            knowMoreInfo1: this.props.previousComponent === "credit_invest" ? true : false,
            knowMoreInfo2: false,
            knowMoreInfo3: false,
            knowMoreInfo4: false,
        }
        this.style = {
            imgStyleMore: {
                height: "3rem",
                width: "3rem",
                verticalAlign: "top",
                fill: ColorPicker.accent,
                justifySelf: 'center',
                alignSelf: 'center',
                marginLeft: "1rem",
            },
            iconStyle: {
                color: ColorPicker.accent,
                fontSize: "1rem"
            }
        }
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNameJSON['card_info'];
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.onBack();
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    nextSlide = () => {

        if (this.state.currentSlide === 4) {
            this.setState({
                currentState: "howItWorks"
            });
        } else {
            this.setState((state) => ({
                currentSlide: state.currentSlide + 1,
            }));
        }
    };

    previousSlide = () => {
        if (this.state.currentSlide === 0) {
            this.setState({
                currentState: "welcomeBenefits",
                currentSlide: 0
            });
        } else {
            this.setState((state) => ({
                currentSlide: state.currentSlide - 1,
            }));
        }
    };

    updateCurrentSlide = (index) => {
        if (index === 5) {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.enableDisableValueProp(false)
        }
        const { currentSlide } = this.state;

        if (currentSlide !== index) {
            this.setState({
                currentSlide: index,
            });
        }
    };

    next = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.next();
    }

    openHowItWorks = () => {
        this.setState({
            currentState: "howItWorks",
        });
    }

    onBackHome = () => {
        this.props.onBackHome();
    }

    openCardInfoScreen = () => {
        this.setState({
            currentState: "howItWorks"
        });
    }

    openHowMoneyIsSaved = () => {
        this.setState({
            currentState: "howMoneyIsSaved"
        });
    }

    enableDisableValueProp = (tag = false) => {
        if (tag === false) {
            this.setState({
                currentState: "howItWorks"
            });
        } else {
            this.setState({
                currentState: "ccValueProps",
                currentSlide: 0
            });
        }
    }

    help = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        GeneralUtilities.openHelpSection();
    }

    openKnowMoreInfo = (index) => {
        if (index === 0) {
            this.setState({
                knowMoreInfo1: true
            });
        } else if (index === 1) {
            this.setState({
                knowMoreInfo2: true
            });
        } else if (index === 2) {
            this.setState({
                knowMoreInfo3: true
            });
        } else if (index === 3) {
            this.setState({
                knowMoreInfo4: true
            });
        }
    }

    closeKnowMore1 = () => {
        this.setState({
            knowMoreInfo1: false
        });
    }

    closeKnowMore2 = () => {
        this.setState({
            knowMoreInfo2: false
        });
    }

    closeKnowMore3 = () => {
        this.setState({
            knowMoreInfo3: false
        });
    }

    closeKnowMore4 = () => {
        this.setState({
            knowMoreInfo4: false
        });
    }

    backToHowItWorks = () => {
        this.setState({
            currentState: "howItWorks"
        });
    }

    navigateToKnowMoreDetails = () => {
        this.setState({
            currentState: "knowMoreDetails"
        });
    }

    onBack = () => {
        if (this.state.currentState === "knowMoreDetails") {
            this.setState({
                currentState: "howItWorks"
            });
        } else if (this.state.knowMoreInfo1 === true) {
            return this.setState({
                knowMoreInfo1: false
            });
        } else if (this.state.knowMoreInfo2 === true) {
            return this.setState({
                knowMoreInfo2: false
            });
        } else if (this.state.knowMoreInfo3 === true) {
            return this.setState({
                knowMoreInfo3: false
            });
        } else if (this.state.knowMoreInfo4 === true) {
            return this.setState({
                knowMoreInfo4: false
            });
        } else if (this.state.currentState === "howItWorks") {
            this.setState({
                currentState: "welcomeBenefits"
            });
        } else {
            this.props.onBackHome();
        }
    }

    render() {
        const { classes } = this.props;
        const screenHeight = window.screen.height;
        let creditCardBannerTextHeight = screenHeight * 0.5;
        let creditCardImageTopMargin = screenHeight * 0.6;
        let creditCardValuePropBannerHeight = screenHeight * 0.28;

        const creditCardBenefits = [
            {
                "icons": <img src={sellIcon} style={{ width: "1.5rem" }} alt="" />,
                "creditCardBenefitTitle": localeObj.credit_card_welcome_benifits_card_01_title,
                "creditCardBenefitSubtitle": localeObj.credit_card_welcome_benifits_card_01_subtitle_02
            },
            {
                "icons": <img src={cashbackIcon} style={{ width: "1.5rem" }} alt="" />,
                "creditCardBenefitTitle": localeObj.credit_card_welcome_benifits_card_02_title,
                "creditCardBenefitSubtitle": localeObj.credit_card_welcome_benifits_card_02_subtitle_02
            },
            {
                "icons": <img src={showChartIcon} style={{ width: "1.5rem" }} alt="" />,
                "creditCardBenefitTitle": localeObj.credit_card_welcome_benifits_card_03_title,
                "creditCardBenefitSubtitle": localeObj.credit_card_welcome_benifits_card_03_subtitle_02
            }
        ]

        const creditInfoOptions = [
            {

                "primary": localeObj.credit_card_how_it_works_option_1,
                "secondary": localeObj.credit_card_how_it_works_option_1_subtext
            },
            {
                "primary": localeObj.credit_card_how_it_works_option_2,
                "secondary": localeObj.credit_card_how_it_works_option_2_subtext
            },
            {
                "primary": localeObj.credit_card_how_it_works_option_3,
                "secondary": localeObj.credit_card_how_it_works_option_3_subtext
            },
            {
                "primary": localeObj.credit_card_how_it_works_option_4,
                "secondary": localeObj.credit_card_how_it_works_option_4_subtext
            }
        ]

        return (
            <div>
                {this.state.currentState === "welcomeBenefits" &&
                    <div>
                        <FlexView
                            vAlignContent="center"
                            hAlignContent="center"
                            style={{
                                position: 'relative',
                                width: `${screenWidth}px`,
                                height: `${creditCardValuePropBannerHeight}px`
                            }}>
                            <Image
                                style={{
                                    width: `${screenWidth}px`,
                                    height: `${creditCardValuePropBannerHeight}px`,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                }}
                                responsive
                                src={creditCardValuePropWelcomeBenefits}>
                            </Image>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                padding: '2.75rem 2.5rem',
                                zIndex: 2
                            }}>
                                <span className="body2 highEmphasis"
                                    style={{
                                        position: 'absolute',
                                        left: '50%',
                                        transform: 'translateX(-50%)'
                                    }}>
                                    {localeObj.credit_card_welcome_benifits_banner_title}
                                </span>
                                <CloseIcon onClick={() => this.onBack()}
                                    style={{
                                        position: 'absolute',
                                        right: '2.5rem',
                                        fill: ColorPicker.white,
                                        width: "1.5rem",
                                    }} />
                            </div>
                            <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                zIndex: 1,
                                marginTop: "1rem",
                                padding: "0 3rem",
                                width: `${screenWidth * 0.76}px`
                            }}>
                                <div className="headline5 highEmphasis" style={{ whiteSpace: 'normal' }}>
                                    {localeObj.credit_card_welcome_benifits_banner_header}
                                </div>
                                <div className="body2 highEmphasis" style={{ whiteSpace: 'normal' }}>
                                    {localeObj.credit_card_welcome_benifits_banner_footer}
                                </div>
                            </div>
                        </FlexView>
                        <div style={{
                            height: `${creditCardBannerTextHeight}px`,
                            overflowY: "auto",
                            width: "100%",
                            position: "relative",
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: 'cover',
                        }}>
                            <div style={{
                                height: `${screenHeight * 0.36}px`,
                                overflowY: "auto"
                            }}>
                                <Grid container spacing={0}>{
                                    creditCardBenefits.map((jsonCategory, index) => (
                                        <div key={index} style={{
                                            width: `${screenWidth}px`,
                                            borderRadius: "0.5rem"
                                        }}>
                                            <ListItem button>
                                                <ListItemIcon>
                                                    <FlexView column>
                                                        <div style={{
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            width: "3rem",
                                                            height: "3rem"
                                                        }}>{jsonCategory.icons}</div>
                                                        <div style={{
                                                            width: "0.125rem",
                                                            height: "4.5rem",
                                                            marginLeft: "1.5rem",
                                                            backgroundColor: index !== 2 ? "rgba(255, 255, 255,0.35)" : "transparent",
                                                        }}></div>
                                                    </FlexView>
                                                </ListItemIcon>
                                                <ListItemText>
                                                    <div  style={{ marginLeft: "0.25rem", marginRight: "2.5rem" }}>
                                                        <span className="headline6 highEmphasis" >{jsonCategory.creditCardBenefitTitle}</span>
                                                        <div style={{ marginTop: "0.5rem" }} className="body2 highEmphasis">{jsonCategory.creditCardBenefitSubtitle}</div>
                                                    </div>
                                                </ListItemText>
                                            </ListItem>
                                        </div>
                                    ))}
                                </Grid>
                            </div>
                            <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                                <FlexView column style={{ textAlign: "center", margin: "1rem" }}>
                                    <span className="body2 highEmphasis">{localeObj.credit_card_welcome_benifits_btn_pre_text_01}</span>
                                    <span className="body2 accent" style={{textDecoration: "underline"}} onClick={() => GeneralUtilities.openDimoWebsite()}>{localeObj.credit_card_welcome_benifits_btn_pre_text_02}</span>
                                </FlexView>
                                <PrimaryButtonComponent btn_text={localeObj.credit_card_welcome_benifits_btn} onCheck={() => this.openHowItWorks()} />
                                <div className="body2 highEmphasis" style={{ textAlign: "center", margin: "1.5rem" }} onClick={() => this.onBack()}>
                                    {localeObj.credit_card_how_it_works_option_help_text}
                                </div>
                            </div>
                        </div>
                    </div>}
                {this.state.currentState === "howItWorks" &&
                    <div>
                        <ButtonAppBar header={localeObj.credit_card_how_it_works_title} onBack={this.onBack} action="none" />
                        <div className="scroll" style={{ height: `${creditCardImageTopMargin}px`, overflowY: 'auto' }}>
                            <div style={{ margin: "2rem 1.5rem 0rem 1.5rem" }}>
                                <FlexView column>
                                    <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                        {localeObj.credit_card_how_it_works_header}
                                    </div>
                                    <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                        {localeObj.credit_card_how_it_works_footer}
                                    </div>
                                </FlexView>
                            </div>
                            <div  style={{ marginLeft: "1rem" }}>
                                <List>
                                    {creditInfoOptions.map((opt, index) => (
                                        <ListItem key={index} disablePadding={true} align="left" onClick={() => this.openKnowMoreInfo(index)}>
                                            <TimeOutSpan style={{ marginTop: "1rem" }}>
                                                <div>
                                                    <span className="subtitle4 accent">{"0" + (index + 1) + ". "}</span>
                                                    <span className="subtitle4 highEmphasis">{opt.primary}</span>
                                                </div>
                                                <div className="body2 mediumEmphasis" style={{ marginTop: "0.5rem", marginLeft: "1.5rem" }}>{opt.secondary}</div>
                                            </TimeOutSpan>
                                            <TimeOutSpan>
                                                <div style={this.style.imgStyleMore} >
                                                    <ArrowForwardIosIcon style={this.style.iconStyle} />
                                                </div>
                                            </TimeOutSpan>
                                        </ListItem>
                                    ))}
                                </List>
                            </div>
                            <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                                <PrimaryButtonComponent btn_text={localeObj.credit_card_how_it_works_option_btn} onCheck={this.next} />
                                <SecondaryButtonComponent btn_text={localeObj.credit_card_how_it_works_option_second_btn} onCheck={this.navigateToKnowMoreDetails} />
                                <div className="body2 highEmphasis" style={{ textAlign: "center", margin: "1.5rem" }} onClick={() => this.help()}>
                                    {localeObj.credit_card_how_it_works_option_help}
                                </div>
                            </div>
                        </div>
                        <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                            <Drawer classes={{ paper: classes.paper }}
                                anchor="bottom"
                                open={this.state.knowMoreInfo1}>
                                <div style={{ margin: "1.5rem" }}>
                                    <FlexView column style={{ marginTop: "0.5rem" }}>
                                        <div className="headline6 highEmphasis" style={{ textAlign: "left" }}>
                                            {localeObj.credit_card_know_more_1_header}
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            {localeObj.credit_card_know_more_1_subtext_1}
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            {localeObj.credit_card_know_more_1_subtext_2}
                                        </div>
                                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            <b>{localeObj.credit_card_know_more_1_subtext_3}</b>
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left" }}>
                                            {localeObj.credit_card_know_more_1_subtext_4}
                                        </div>
                                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            <b>{localeObj.credit_card_know_more_1_subtext_5}</b>
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left" }}>
                                            {localeObj.credit_card_know_more_1_subtext_6}
                                        </div>
                                        <div style={{ textAlign: "left", marginTop: "2rem", marginBottom: "1rem" }}>
                                            <span className="body2 mediumEmphasis">
                                                {localeObj.credit_card_know_more_1_subtext_7}
                                            </span>
                                            <span className="body2 accent" style={{ textDecoration: "underline" }} onClick={this.navigateToKnowMoreDetails}>
                                                {localeObj.credit_card_know_more_1_subtext_8}
                                            </span>
                                        </div>
                                    </FlexView>
                                </div>
                                <div  style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    <PrimaryButtonComponent btn_text={localeObj.credit_card_know_more_1_btn} onCheck={this.closeKnowMore1} />
                                </div>
                            </Drawer>
                        </div>
                        <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                            <Drawer classes={{ paper: classes.paper }}
                                anchor="bottom"
                                open={this.state.knowMoreInfo2}>
                                <div style={{ margin: "1.5rem" }}>
                                    <FlexView column style={{ marginTop: "0.5rem" }}>
                                        <div className="headline6 highEmphasis" style={{ textAlign: "left" }}>
                                            {localeObj.credit_card_know_more_2_header}
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            {localeObj.credit_card_know_more_2_subtext_1}
                                        </div>
                                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            <b>{localeObj.credit_card_know_more_2_subtext_2}</b>
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left" }}>
                                            {localeObj.credit_card_know_more_2_subtext_3}
                                        </div>
                                    </FlexView>
                                </div>
                                <div  style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    <PrimaryButtonComponent btn_text={localeObj.credit_card_know_more_2_btn} onCheck={this.closeKnowMore2} />
                                </div>
                            </Drawer>
                        </div>
                        <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                            <Drawer classes={{ paper: classes.paper }}
                                anchor="bottom"
                                open={this.state.knowMoreInfo3}>
                                <div style={{ margin: "1.5rem" }}>
                                    <FlexView column style={{ marginTop: "0.5rem" }}>
                                        <div className="headline6 highEmphasis" style={{ textAlign: "left" }}>
                                            {localeObj.credit_card_know_more_3_header}
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            {localeObj.credit_card_know_more_3_subtext}
                                        </div>
                                    </FlexView>
                                </div>
                                <div  style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    <PrimaryButtonComponent btn_text={localeObj.credit_card_know_more_3_btn} onCheck={this.closeKnowMore3} />
                                </div>
                            </Drawer>
                        </div>
                        <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                            <Drawer classes={{ paper: classes.paper }}
                                anchor="bottom"
                                open={this.state.knowMoreInfo4}>
                                <div style={{ margin: "1.5rem" }}>
                                    <FlexView column style={{ marginTop: "0.5rem" }}>
                                        <div className="headline6 highEmphasis" style={{ textAlign: "left" }}>
                                            {localeObj.credit_card_know_more_4_header}
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            {localeObj.credit_card_know_more_4_subtext_1}
                                        </div>
                                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            <b>{localeObj.credit_card_know_more_4_subtext_2}</b>
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            {localeObj.credit_card_know_more_4_subtext_3}
                                        </div>
                                    </FlexView>
                                </div>
                                <div  style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    <PrimaryButtonComponent btn_text={localeObj.credit_card_know_more_4_btn} onCheck={this.closeKnowMore4} />
                                </div>
                            </Drawer>
                        </div>
                    </div>}
                {this.state.currentState === "knowMoreDetails" &&
                    <div>
                        <ButtonAppBar header={localeObj.credit_card_how_it_works_title} onBack={this.onBack} action="none" />
                        <div className="scroll" style={{ height: `${screenHeight * 0.8}px`, overflowY: 'auto' }}>
                            <div style={{ margin: "1.5rem" }}>
                                <FlexView column>
                                    <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                        {localeObj.credit_card_know_more_details_header}
                                    </div>
                                    <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                        {localeObj.credit_card_know_more_details_subtext_1}
                                    </div>
                                    <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                        <b>{localeObj.credit_card_know_more_details_subtext_2}</b>
                                    </div>
                                    <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                        {localeObj.credit_card_know_more_details_subtext_3}
                                    </div>
                                    <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                        <b>{localeObj.credit_card_know_more_details_subtext_4}</b>
                                    </div>
                                    <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                        {localeObj.credit_card_know_more_details_subtext_5}
                                    </div>
                                    <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                        <b>{localeObj.credit_card_know_more_details_subtext_6}</b>
                                    </div>
                                    <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                        {localeObj.credit_card_know_more_details_subtext_7}
                                    </div>
                                </FlexView>
                            </div>
                            <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                                <PrimaryButtonComponent btn_text={localeObj.credit_card_know_more_details_btn} onCheck={this.backToHowItWorks} />
                            </div>
                        </div>
                    </div>}
            </div>
        )
    }
}

CreditCardInfoPage.propTypes = {
    classes: PropTypes.object.isRequired,
    previousComponent: PropTypes.string,
    onBackHome: PropTypes.func.isRequired,
    next: PropTypes.func,
    componentName: PropTypes.string,
};

export default withStyles(styles)(CreditCardInfoPage);