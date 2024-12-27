import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import "../../../styles/main.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import constantObjects from "../../../Services/Constants";
import MetricServices from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import { withStyles } from "@material-ui/core/styles";
import SecurityRoundedIcon from '@material-ui/icons/SecurityRounded';
import PaymentRoundedIcon from '@material-ui/icons/PaymentRounded';
import AttachMoneyRoundedIcon from '@material-ui/icons/AttachMoneyRounded';

import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";

import ClickWithTimeout from "../../EngageCardComponent/ClickWithTimeOut";

const TimeOutSpan = ClickWithTimeout('span');
var localeObj = {};

class VirtualCardInfoComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            currentState: "showVcardIntro"
        }
        this.styles = {
            imgStyleMore: {
                borderRadius: "50%",
                height: "3rem",
                width: "3rem",
                verticalAlign: "middle",
                fill: ColorPicker.surface3,
                backgroundColor: ColorPicker.surface3,
                justifySelf: 'center',
                alignSelf: 'center',
                marginRight: "1rem",
            },
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNames.VirtualCardInfoScreen);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);

        window.onBackPressed = () => {
            this.onBackHome();
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.VirtualCardInfoScreen, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.VirtualCardInfoScreen);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    onBackHome = () => {
        MetricServices.onPageTransitionStop(PageNames.VirtualCardInfoScreen, PageState.back);
        this.props.history.replace({ pathname: "/digitalCard", transition: "right" });
        // GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }


    hideBottomSheet = () => {
        this.setState({
            bottomSheet: false
        });
    }

    onGoToCard = () => {
        let event = {
            eventType: constantObjects.vCardView,
            page_name: PageNames.VirtualCardInfoScreen,
        };
        MetricServices.reportActionMetrics(event, new Date().getTime());
        MetricServices.onPageTransitionStop(PageNames.VirtualCardInfoScreen, PageState.close);
        this.props.history.replace({ pathname: "/virtualCardComponent", state: this.props.location.state });
    }

    render() {
        const screenHeight = window.screen.height;
        const screenScrollHeight = screenHeight * 0.75;
        const fgtsOptions = [
            {
                "primary": localeObj.virtual_card_intro_security,
                "secondary": localeObj.virtual_card_intro_security_description,
                "icon": <SecurityRoundedIcon className="regularAccent" style={{ width: "1.5rem", height: "1.5rem", margin: "0.75rem", color: "#FFB684" }} />
            },
            {
                "primary": localeObj.virtual_card_intro_payment,
                "secondary": localeObj.virtual_card_intro_payment_description,
                "icon": <AttachMoneyRoundedIcon className="regularAccent" style={{ width: "1.5rem", height: "1.5rem", margin: "0.75rem", color: "#FFB684" }} />
            },
            {
                "primary": localeObj.virtual_card_intro_practicality,
                "secondary": localeObj.virtual_card_intro_practicality_description,
                "icon": <PaymentRoundedIcon className="regularAccent" style={{ width: "1.5rem", height: "1.5rem", margin: "0.75rem", color: "#FFB684" }} />
            },
        ]

        const isDisabled = () => {
            if (this.props.location && (this.props.location.cardState === "CARD PRESENT")) {
                return false
            } else {
                return true
            }
        }

        return (
            <div >
                <ButtonAppBar header={localeObj.virtual_card} onBack={this.onBackHome} action="none" />

                {/* To show progressBar */}
                <div style={{ display: (this.state.currentState === "showProgressBar" ? 'block' : 'none') }}>
                    {this.state.currentState === "showProgressBar" && <CustomizedProgressBars></CustomizedProgressBars>}
                </div>

                {/*  To show the main my account page*/}
                <div style={{ display: (this.state.currentState === "showVcardIntro" ? 'block' : 'none') }}>
                    <div className="scroll" style={{ height: `${screenScrollHeight}px`, width: "90%", overflowY: 'auto', margin: "2rem 1.5rem" }}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {androidApiCalls.getLocale() === "en_US" ? localeObj.virtual_card : localeObj.virtual_card_in_hand}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.5rem" }}>
                                {localeObj.virtual_card_intro_subheader}
                            </div>
                        </FlexView>
                        <div style={{ marginTop: "1rem", textAlign: "left" }}>
                            <List>
                                {
                                    fgtsOptions.map((opt) => (
                                        <ListItem key={opt} disablePadding={true} align="left">
                                            <TimeOutSpan>
                                                <div style={this.styles.imgStyleMore} >
                                                    {opt.icon}
                                                </div>
                                            </TimeOutSpan>

                                            <TimeOutSpan style={{ marginTop: "1rem" }}>
                                                <div className="subtitle2 highEmphasis">{opt.primary}</div>
                                                <div className="body2 mediumEmphasis" style={{ marginTop: "0.5rem" }}>{opt.secondary}</div>
                                            </TimeOutSpan>
                                        </ListItem>
                                    ))
                                }
                            </List>
                        </div>
                    </div>
                    <div  style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                        <PrimaryButtonComponent btn_text={localeObj.virtual_card_go_to} disabled={isDisabled()} onCheck={this.onGoToCard} />
                        <SecondaryButtonComponent btn_text={localeObj.back_home} onCheck={this.onBackHome} />
                    </div>
                </div>
            </div>
        )
    }
}

VirtualCardInfoComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
};

export default withStyles()(VirtualCardInfoComponent);