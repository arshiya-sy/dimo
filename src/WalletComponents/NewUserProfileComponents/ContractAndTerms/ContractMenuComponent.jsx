import React from "react";
import PropTypes from "prop-types";
import "../../../styles/main.css";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import ColorPicker from "../../../Services/ColorPicker";
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { MuiThemeProvider } from "@material-ui/core/styles";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Log from "../../../Services/Log";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import InputThemes from "../../../Themes/inputThemes";
import GeneralUtilities from "../../../Services/GeneralUtilities";

const styles = {
    iconStyle: {
        color: ColorPicker.accent,
        fontSize: "1rem"
    },
};

const contractPageName = PageNames.contractAndTermsComponent.select_contract;
var localeObj = {};

class ContractComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked1: false,
            checked2: false
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(contractPageName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);

        window.onBackPressed = () => {
            MetricServices.onPageTransitionStop(contractPageName, PageState.back);
            if (this.props.location.state && GeneralUtilities.subDeepLinkCheck(this.props.location.state.subDeepLink)) {
                return;
            }
            this.props.history.replace({ pathname: "/myAccount", transition: "right" });
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(contractPageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(contractPageName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    onSelectOption(type) {
        Log.sDebug("Type chosen " + type, "ChooseContract");
        MetricServices.onPageTransitionStop(contractPageName, PageState.close);
        if(this.props.location.state){
            this.props.history.replace("/consultComp", { "chosen": type, "subDeepLink": this.props.location.state.subDeepLink });
        }else if(this.props.location.subDeepLink){
            this.props.history.replace("/consultComp", { "chosen": type, "subDeepLink": this.props.location.subDeepLink });
        }else{
            this.props.history.replace("/consultComp", { "chosen": type });
        }
        
    }

    render() {

        const onBack = () => {
            MetricServices.onPageTransitionStop(contractPageName, PageState.back);
            if (this.props.location.state && GeneralUtilities.subDeepLinkCheck(this.props.location.state.subDeepLink)) {
                return;
            }
            this.props.history.replace({ pathname: "/myAccount", transition: "right" });
        }

        const contractItems = [
            {
                primary: localeObj.Account_open,
                action: "generic"
            },
            {
                primary: localeObj.privacy_policy,
                action: "privacy"
            },
            {
                primary: localeObj.tor,
                action: "tor"
            }
        ]

        return (
            <div>
                <ButtonAppBar header={localeObj.contract_terms} onBack={onBack} action="none" />
                <div style={{ margin: "1.5rem", textAlign: "left" }}>
                    <MuiThemeProvider theme={InputThemes.SearchInputTheme}>
                        <List>
                            {
                                contractItems.map((opt, key) => (
                                    <ListItem key={key} disablePadding={true} align="left" onClick={() => this.onSelectOption(opt.action)}>
                                        <ListItemText align="left" className="body1 highEmphasis" primary={opt.primary}/>
                                        <span style={{ marginRight: "2%" }}>
                                            <ArrowForwardIosIcon style={styles.iconStyle} />
                                        </span>
                                    </ListItem>
                                ))
                            }
                        </List>
                    </MuiThemeProvider>
                </div>
            </div>
        )
    }
}

ContractComponent.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    classes: PropTypes.object.isRequired
};

export default ContractComponent;
