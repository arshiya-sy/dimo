import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";

import ArrowIcon from '@material-ui/icons/ArrowForwardIos';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider } from "@material-ui/core/styles";
import MuiAlert from '@material-ui/lab/Alert';
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";

import PageState from "../../Services/PageState";
import PageNames from "../../Services/PageNames";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";

const theme1 = InputThemes.SearchInputTheme;
const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

export default class ChooseRechargeAmountComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedAmount: "",
            selectedIndex: -1,
            displayAmountList: this.props.details.displayAmountList,
            amountList: this.props.details.amountList,
            snackBarOpen: false
        };

        if(this.props.componentName){
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNames.cellularRechargeComponent.amount;
        }
        MetricServices.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
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


    onSelectKey = (index) => {
        Log.debug("selected amount " + this.state.amountList[index]);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.onInputAmount(this.state.amountList[index]);
    };

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.props.onBack();
        }
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

    render() {
        const screenHeight = window.screen.height;
        return (
            <div style={InputThemes.initialMarginStyle}>
                <FlexView column>
                    <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                        {localeObj.choose_amount}
                    </div>
                    <div style={{ marginTop: "2rem" }}>
                        <table style={{ border: "none", width: "100%", margin:"0 -2px" }}>
                            <tbody>
                                <tr id="row0" style={{ border: "none" }}>
                                    <td style={{textAlign:"left"}}> <span className="tableLeftStyle mediumEmphasis" > {localeObj.phone_number} </span></td>
                                    <td style={{textAlign:"right"}}>
                                        <td style={{textAlign:"left"}}> <span className="tableRightStyle highEmphasis"> {this.props.details.displayNumber} </span></td>
                                    </td>
                                </tr>
                                <tr id="row2" style={{ border: "none" }}>
                                    <td style={{textAlign:"left"}}> <span className="tableLeftStyle mediumEmphasis"> {localeObj.operator} </span></td>
                                    <td style={{textAlign:"right"}}>
                                        <td style={{textAlign:"left"}}> <span className="tableRightStyle highEmphasis"> {this.props.details.selectedProvider} </span></td>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </FlexView>
                <div className="scroll" style={{ overflowY: "auto", height: `${screenHeight * 0.5}px`,marginTop: "2rem", overflowX: "hidden" }}>
                    <MuiThemeProvider theme={theme1}>
                        {
                            this.state.displayAmountList.map((opt, key) => (
                                <ListItem key={key} button onClick={() => this.onSelectKey(key)}>
                                    <ListItemText className="subtitle2 highEmphasis" primary={opt} />
                                    <ArrowIcon style={{ fill: ColorPicker.accent,  marginRight: "1rem", fontSize: "1rem"  }} />
                                </ListItem>
                            ))
                        }
                    </MuiThemeProvider>
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
ChooseRechargeAmountComp.propTypes = {
    componentName: PropTypes.string,
    onBack: PropTypes.func.isRequired,
    details: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    onInputAmount: PropTypes.func.isRequired
  };