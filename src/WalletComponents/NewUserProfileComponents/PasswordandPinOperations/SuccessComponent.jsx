import React from "react";
import "../../../styles/main.css";

import PageState from "../../../Services/PageState";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import InputThemes from "../../../Themes/inputThemes";
import constantObjects from "../../../Services/Constants";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import AccordianComponent from "../../NewUserProfileComponents/ProfileDetails/MockAccordian";

import List from '@material-ui/core/List';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import ListItem from '@material-ui/core/ListItem';
import Snackbar from '@material-ui/core/Snackbar';
import ListItemText from '@material-ui/core/ListItemText';
import MuiAlert from '@material-ui/lab/Alert';
import Switch from '@material-ui/core/Switch';
import ColorPicker from "../../../Services/ColorPicker";
import PropTypes from "prop-types";
import FlexView from "react-flexview";

const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

const SwitchStyle = withStyles({
    switchBase: {
        width: "1.5rem",
        color: ColorPicker.buttonAccent,
        '&$checked': {
            color: ColorPicker.buttonAccent,
        },
        '&$checked + $track': {
            backgroundColor: ColorPicker.newProgressBar,
        },
    },
    checked: {},
    track: {},
})(Switch);

class SuccessComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: true,
            message: props.message
        };

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "SUCCESS PAGE";
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount = () => {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false });
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.onFinish();
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount = () => {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    render() {

        return (
            <div style={{ overflowX: "hidden", opacity: "0.8" }}>
                <ButtonAppBar header={localeObj.security} action="none" />
                <MuiThemeProvider theme={InputThemes.SearchInputTheme}>
                    <div style={{ width: "100%" }}>
                        <FlexView column align="left" style={{ width: "100%", marginTop: "2.5rem" }}>
                            <AccordianComponent
                                primary={localeObj.app_password}
                                secondary={localeObj.app_to_access}
                                button1={localeObj.change_password_top} />
                            <AccordianComponent
                                primary={localeObj.account_password}
                                secondary={localeObj.account_to_access}
                                button1={localeObj.change_password_top}
                                button2={localeObj.forgot_password_top}
                            />
                            <div style={{ margin: "0.5rem 1.5rem", textAlign: "left" }}>
                                <List>
                                    <ListItem disablePadding={true} align="left" >
                                        <ListItemText align="left" className="body1 highEmphasis" primary={localeObj.enable_device_security}
                                            secondary={localeObj.enable_device_security_bottom} />
                                        <span style={{textAlign: "right"}}>
                                            <SwitchStyle checked={this.state.checked2} />
                                        </span>
                                    </ListItem>
                                </List>
                            </div>
                        </FlexView>
                    </div>
                </MuiThemeProvider>
                <FlexView column align="center" style={{ width: "100%", marginBottom: "1.5rem", position: "fixed", bottom: "0px" }}>
                    <MuiThemeProvider theme={theme2}>
                        <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                            <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                        </Snackbar>
                    </MuiThemeProvider>
                </FlexView>
            </div>
        );
    }
}
SuccessComponent.propTypes = {
    componentName: PropTypes.string,
    onFinish: PropTypes.func,
    message: PropTypes.string
};
export default SuccessComponent;