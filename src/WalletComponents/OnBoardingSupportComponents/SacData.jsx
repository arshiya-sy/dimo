import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";

import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import Log from "../../Services/Log";

const PageName = PageNames.personalInfo.custom;
const secondaryColor = {
    color: ColorPicker.darkHighEmphasis
}
var localeObj = {};

export default class SacDataComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            backState: false
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.onBack();
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    onBack = () => {
        MetricServices.onPageTransitionStop(PageName, PageState.back);
        this.props.back();
    }

    handleDialer = (phNum, contact) => () => {
        Log.sDebug("Opening Phone Dialer - for + " + contact, PageName);
        androidApiCalls.startDialer(phNum);
    }

    openEmail = () => {
        androidApiCalls.openEmail();
    }

    render() {

        const contactData = [
            {
                header: localeObj.sac,
                description: localeObj.sac_info,
                phoneNumHeader: localeObj.phone_number,
                phoneNum: "0800 722 0708",
                dialer: "08007220708",
                emailData: false
            },
            {
                header: localeObj.ombudsman,
                description: localeObj.ombudsman_info,
                phoneNumHeader: localeObj.phone_number,
                phoneNum: "0800 285 233",
                dialer: "0800285233",
                emailData: true,
                emailHeader: localeObj.email,
                email: "ouvidoria@bancoarbi.com.br"
            },
        ]

        return (
            <div style={{ overflowX: "hidden" }}>
                <ButtonAppBar onBack={this.onBack} action="none" />
                <div style={InputThemes.initialMarginStyle}>
                    <FlexView column>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.sac_customer}
                        </div>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.4rem" }}>
                            {localeObj.sac_customer_description}
                        </div>
                    </FlexView>
                </div>
                <div style={{ margin: "1.5rem" }}>
                    {
                        contactData.map((opt, idx) => (
                            <List key={idx} style={{ marginTop: "1rem" }}>
                                <ListItemText className="body2 highEmphasis" primary={opt.header}
                                    secondaryTypographyProps={{ style: secondaryColor }} secondary={opt.description} />
                                <div style={{ marginTop: "1rem" }}>
                                    <ListItemText style={{ marginBottom: "0rem" }} className="body2 highEmphasis" primary={opt.phoneNumHeader} />
                                    <div className="body2 mediumEmphasis" style={{ textDecorationLine: 'underline' }} onClick={this.handleDialer(opt.dialer, opt.header)}>{opt.phoneNum}</div>
                                </div>
                                {opt.emailData &&
                                    <div style={{ marginTop: "1rem" }}>
                                        <ListItemText style={{ marginBottom: "0rem" }} className="body2 highEmphasis" primary={opt.emailHeader} />
                                        <div className="body2 mediumEmphasis" style={{ textDecorationLine: 'underline' }} onClick={this.openEmail}>{opt.email}</div>
                                    </div>}
                            </List>
                        ))
                    }
                </div>
            </div>
        )
    }
}

SacDataComponent.propTypes = {
    back: PropTypes.func
}