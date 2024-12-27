import React from "react";
import "../../../styles/main.css";
import "../../../styles/help_text_styles.css";
import ColorPicker from "../../../Services/ColorPicker";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Skeleton from '@material-ui/lab/Skeleton';
import Log from "../../../Services/Log";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import PropTypes from "prop-types";
import FlexView from "react-flexview";


const iconStyle = {
    color: ColorPicker.accent,
    fontSize: "1rem"
};

const helpPageName = PageNames.helpComponent.help_main;
var localeObj = {};

class HelpParent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            message: "",
        }
        this.style = {
            lazyLoading: {
                margin: "0.75rem 0",
                backgroundColor: ColorPicker.lazyLoadColor,
                borderRadius: "0.875rem"
            },
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(helpPageName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            if (GeneralUtilities.subDeepLinkCheck(this.props.location.state.subDeepLink)) {
                return;
            }
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(helpPageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(helpPageName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        MetricServices.onTransitionStop();
    }

    onSelectOption = (topic, opt) => () => {
        Log.sDebug("Topic selected: " + topic, "HelpParent");
        if (topic === "Tarifas" || topic === "Tariffs") {
            MetricServices.onPageTransitionStop(helpPageName, PageState.close);
            this.props.onTransition({ tarrif: true })
        }
        MetricServices.onPageTransitionStop(helpPageName, PageState.close);
        this.props.onTransition({ tarrif: false, opt: opt, topic: topic })
    }

    render() {
        const helpItems = this.props.firstOrderList ? this.props.firstOrderList : []
        return (
            <div>
                <div style={{ marginLeft: "1.5rem", marginRight: "1.5rem" }}>
                    <FlexView column align="left" style={{ marginTop: "2rem", marginBottom: "1rem" }}>
                        <div className="headline6 highEmphasis" style={{ marginBottom: "2rem" }}>{localeObj.help_faq}</div>
                        {
                            !helpItems.length && <div>
                                {
                                    Array.apply(null, { length: 4 }).map((i) => (
                                        <Skeleton key={i} width="100%" height="2.5em" style={this.style.lazyLoading}></Skeleton>
                                    ))}
                            </div>
                        }
                        {!!helpItems.length && <List disablePadding>
                            {
                                helpItems.map((opt, index) => (
                                    <ListItem disableGutters key={index} align="left" onClick={this.onSelectOption(opt, index)}>
                                        <ListItemText align="left" className="body1 highEmphasis" style={{ textTransform: "capitalize", width: "80%" }} primary={opt} />
                                        <span>
                                            <ArrowForwardIosIcon style={iconStyle} />
                                        </span>
                                    </ListItem>
                                ))
                            }
                        </List>}
                    </FlexView>
                </div>
            </div>
        )
    }
}
HelpParent.propTypes = {
    location: PropTypes.object,
    onTransition: PropTypes.func,
    firstOrderList: PropTypes.object,
};
export default HelpParent;