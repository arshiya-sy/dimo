import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../styles/main.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import List from '@material-ui/core/List';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { withStyles } from "@material-ui/core/styles";

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import GeneralUtilities from "../../Services/GeneralUtilities";

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";

var localeObj = {};
const styles = InputThemes.singleInputStyleWithPaper;

class GCCHowItWorks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            currentState: "howItWorks",
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
        this.componentName = PageNames.gccHowItWorks;
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

    next = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.history.replace({ pathname: "/gccInvestmentAmount" });
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

    help = () => {
        //MetricServices.onPageTransitionStop(this.componentName, PageState.close);
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
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.cancel);
            this.props.history.replace({ pathname: "/newWalletLaunch", newOnboarding: true });
        }
    }

    render() {
        const { classes } = this.props;
        const screenHeight = window.screen.height;
        let creditCardImageTopMargin = screenHeight * 0.6;

        const creditInfoOptions = [
            {
                "icon": <AttachMoneyIcon className="regularAccent" style={{ width: "1.5rem", height: "1.5rem", margin: "0.75rem", color: "#FFB684" }} />,
                "primary": localeObj.first_access_gcc_howitworks_option_1
            },
            {
                "icon": <TrendingUpIcon className="regularAccent" style={{ width: "1.5rem", height: "1.5rem", margin: "0.75rem", color: "#FFB684" }} />,
                "primary": localeObj.first_access_gcc_howitworks_option_2
            }
        ]

        return (
            <div>

                {this.state.currentState === "howItWorks" &&
                    <div>
                        <ButtonAppBar header={localeObj.credit_card_how_it_works_title} onBack={this.onBack} action="none" />
                        <div className="scroll" style={{ height: `${creditCardImageTopMargin}px`, overflowY: 'auto' }}>
                            <div style={{ margin: "2.5rem 1rem 2.5rem 1.5rem" }}>
                                <FlexView column>
                                    <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                        {localeObj.credit_card_how_it_works_header}
                                    </div>
                                    <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                        {localeObj.credit_card_how_it_works_footer}
                                    </div>
                                </FlexView>
                            </div>
                            <div style={{ marginLeft: "1.5rem", marginRight: "1rem", display: "flex", flexDirection: "column", justifyContent: "left" }}>
                                <List>
                                    {creditInfoOptions.map((opt, index) => (
                                        <ListItem disablePadding={true} align="left" onClick={() => this.openKnowMoreInfo(index)} key={index}>
                                            <ListItemIcon>
                                                <div style={{
                                                    width: '3rem',
                                                    height: '3rem',
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                    backgroundColor: ColorPicker.newProgressBar
                                                }}>{opt.icon}</div>
                                            </ListItemIcon>
                                            <ListItemText style={{marginLeft: "1rem"}}>
                                                <span style={{textAlign: "left"}} className="body2 highEmphasis">{opt.primary}</span>
                                            </ListItemText>
                                            <ListItemText>
                                                <div style={{textAlign: "right"}}>
                                                    <ArrowForwardIosIcon style={{ fill: ColorPicker.accent, margin: "1rem 0rem 1rem auto", fontSize: "1rem" }} />
                                                </div>
                                            </ListItemText>
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
                                            {localeObj.first_access_gcc_howitworks_option1_bottomsheet_header}
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            {localeObj.first_access_gcc_howitworks_option1_bottomsheet_text_1}
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            {localeObj.first_access_gcc_howitworks_option1_bottomsheet_text_2}
                                        </div>
                                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            <b>{localeObj.first_access_gcc_howitworks_option1_bottomsheet_text_3}</b>
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left" }}>
                                            {localeObj.first_access_gcc_howitworks_option1_bottomsheet_text_4}
                                        </div>
                                    </FlexView>
                                </div>
                                <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"  }}>
                                    <PrimaryButtonComponent btn_text={localeObj.first_access_gcc_howitworks_option1_bottomsheet_btn} onCheck={this.closeKnowMore1} />
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
                                            {localeObj.first_access_gcc_howitworks_option2_bottomsheet_header}
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            {localeObj.first_access_gcc_howitworks_option2_bottomsheet_text_1}
                                        </div>
                                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                            <b>{localeObj.first_access_gcc_howitworks_option2_bottomsheet_text_2}</b>
                                        </div>
                                        <div className="body2 mediumEmphasis" style={{ textAlign: "left" }}>
                                            {localeObj.first_access_gcc_howitworks_option2_bottomsheet_text_3}
                                        </div>
                                        <div style={{ textAlign: "left", marginTop: "2rem", marginBottom: "1rem" }}>
                                            <span className="body2 mediumEmphasis">
                                                {localeObj.first_access_gcc_howitworks_option2_bottomsheet_text_4}
                                            </span>
                                            <span className="body2 accent" style={{ textDecoration: "underline" }} onClick={this.navigateToKnowMoreDetails}>
                                                {localeObj.credit_card_know_more_1_subtext_8}
                                            </span>
                                        </div>
                                    </FlexView>
                                </div>
                                <div style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"  }}>
                                    <PrimaryButtonComponent btn_text={localeObj.first_access_gcc_howitworks_option2_bottomsheet_btn} onCheck={this.closeKnowMore2} />
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

GCCHowItWorks.propTypes = {
    classes: PropTypes.object.isRequired,
    location: PropTypes.object,
    history: PropTypes.object,
    previousComponent: PropTypes.string,
    onBackHome: PropTypes.func
};

export default withStyles(styles)(GCCHowItWorks);