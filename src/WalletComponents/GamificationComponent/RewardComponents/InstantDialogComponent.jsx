import React from 'react';
import Lottie from "lottie-react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

import Drawer from '@material-ui/core/Drawer';
import { withStyles } from "@material-ui/core/styles";

import history from "../../../history.js";
import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import InputThemes from "../../../Themes/inputThemes";
import constantObjects from '../../../Services/Constants.js';
import MetricServices from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import CommonFunctions from '../../../Services/CommonFunctions.js';
import GeneralUtilities from '../../../Services/GeneralUtilities.js';
import ImportantDetails from '../../NewLaunchComponents/ImportantDetails.js';
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import { REWARD_TYPE_COUPON, REWARD_TYPE_LUCKY_NUMBER } from '../../../Services/Gamification/GamificationTerms.js';

import LNInstantDialogJson from "../../../images/GamificationImages/luckyNumber/ln-instant-dialog.json";
import CouponInstantDialogJson from "../../../images/GamificationImages/coupon/coupon-instant-dialog.json";

var localeObj = {};
const styles = InputThemes.singleInputStyle;

const screenWidth = window.screen.width;

class InstantDialogComponent extends React.Component {
    constructor(props) {
        super(props);
        this.componentName = PageNames.GamificationComponent.instant_popup_dialog;
        this.state = {
            bottom: true,
            instantDialogData: {},
            gamProgramData: this.props.gamProgramData,
        }

        MetricServices.onPageTransitionStart(this.componentName);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        CommonFunctions.addVisibilityEventListener(this.componentName);
        this.intializeInitialData();
    }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    intializeInitialData = () => {
        const { programName, rewardType } = this.state.gamProgramData;
        let image = "", title = "", description = "", btnText = "";

        switch(rewardType) {
            case REWARD_TYPE_COUPON:
                image = CouponInstantDialogJson;
                title = localeObj.instant_dialog_coupon_title;
                description = localeObj.instant_dialog_coupon_description;
                btnText = localeObj.instant_dialog_coupon_btn;
                break;
            case REWARD_TYPE_LUCKY_NUMBER:
            default:
                image = LNInstantDialogJson;
                title = localeObj.instant_dialog_ln_title;
                description = localeObj.instant_dialog_ln_description;
                btnText = localeObj.instant_dialog_ln_btn;
        }

        this.setState({ instantDialogData: { image, title, subTitle: programName, description, btnText } });
    }

    onDismiss = () => {
        this.setState({ bottom: false });

        GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.closeInstantDialog);
    }

    checkProgress = () => {
       this.setState({ bottom: false });

       const { programId } = this.state.gamProgramData;
       
       ImportantDetails.setComponentEntryPoint("", constantObjects.entrypoint_instant_dialog);
       GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.progressInstantDialog);
       history.push({pathname: "/rewards", additionalInfo: { openProgramId: programId }});
    }

    render() {
        const { classes } = this.props;
        const { instantDialogData } = this.state;
        const { image, title, subTitle, description, btnText } = instantDialogData;
        const imageStyles = { width: screenWidth * 0.4, marginBottom: "1.5rem" };

        return (
            <Drawer
                classes={{ paper: classes.paper }}
                anchor="bottom"
                open={this.state.bottom}
                onClose={this.onDismiss}
            >
                <FlexView column hAlignContent='center' style={{ margin: "1.5rem", textAlign: "center" }}>
                    <div><Lottie animationData={image} loop={false} style={imageStyles}/></div>
                    <div className="headline5 highEmphasis">{title}</div>
                    <div className="label1 highEmphasis" style={{ paddingTop:"0.56rem" }}>{subTitle}</div>
                    <div className="body2 mediumEmphasis" style={{ marginTop: "1.187rem" }}>{description}</div>
                </FlexView>

                <FlexView
                    column hAlignContent='center'
                    style={{ width: "100%", marginBottom: "1.5rem", paddingTop: "1.5rem", textAlign: "center" }}
                >
                    <PrimaryButtonComponent btn_text={btnText} onCheck={this.checkProgress} />

                    <div
                        className="body2 highEmphasis" style={{ marginTop: "1.5rem" }}
                        onClick={this.onDismiss}
                    >
                        {localeObj.dismiss}
                    </div>
                </FlexView>
            </Drawer>
        );
    }
}

InstantDialogComponent.propTypes = {
    gamProgramId: PropTypes.any,
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(InstantDialogComponent);