import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import constantObjects from "../../../Services/Constants";
import MetricServices from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";

import MuiAlert from '@material-ui/lab/Alert';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import GeneralUtilities from "../../../Services/GeneralUtilities";
import NewUtilities from "../../../Services/NewUtilities";

const theme2 = InputThemes.snackBarTheme;
const styles = InputThemes.singleInputStyle;
var localeObj = {};

class DigitalCardArrival extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayStatus: false,
            open: false,
            snackBarOpen: false
        };
        this.style = {
            textStyle: {
                marginLeft: "3rem",
                marginRight: "3rem",
                marginTop: "1rem",
                textAlign: "center"
            }
        }

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNames.cardArrivalComponent.arrival;
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        if (this.props.address) {
            this.setState({
                street: this.props.address.rua ? this.formatAddressFields(this.props.address.rua) : "",
                neighbourhood: this.props.address.bairro? this.formatAddressFields(this.props.address.bairro) : "",
                city: this.formatAddressFields(this.props.address.cidade),
                uf: this.props.address.uf,
            })
            this.setDisplayField(this.props.address.cep);
        }
    }

    setDisplayField = (value) => {
        let cepObj = NewUtilities.parseCEP(value);
        this.setState({
            cep: cepObj.cepDisp
        })
    }

    formatAddressFields = (value) => {
        let addressInCaps = value.toLowerCase();
        addressInCaps = addressInCaps.replace(/(?:^|\s)\S/g, function (firstLetter) { return firstLetter.toUpperCase(); });
        return addressInCaps;
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

    open = () => {
        if (this.props.type === "request" || this.props.type === "card_exists") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.next();
        } else {
            this.props.bottomSheetOpen(true);
        }
    }

    onSecondary = () => {
        this.props.bottomSheetOpen(false);
    }

    onPrimary = () => {
        this.props.bottomSheetOpen(false);
        this.setState({ open: false });
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.next();
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

    secondary = () => {
        this.props.secondary();
    }

    help = () => {
        if (this.props.onHelp) {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.onHelp()
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            GeneralUtilities.openHelpSection();
        }
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.height;
        const finalWidth = window.screen.width;
        return (
            <div className="scroll" style={{ height: `${finalHeight * 0.65}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={{ marginTop: "5%", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                    <span>
                        <img style={{ width: `${finalWidth * 0.7}px` }} src={this.props.icon} alt="" />
                    </span>
                </div>
                <div style={this.style.textStyle}>
                    <span className="headline5 highEmphasis">
                        {this.props.type === "request" ? localeObj.delivery : localeObj.physical_card_header}
                    </span>
                </div>
                <div style={this.style.textStyle}>
                    <span className="body2 highEmphasis" style={{ fontWeight: 400 }}>
                        {this.props.type === "request" ? localeObj.confirm_mail_address : localeObj.physical_card_description}
                    </span>
                </div>
                {this.props.type !== "request" &&
                    <div style={this.style.textStyle}>
                        <span className="body2 highEmphasis" style={{ fontWeight: 400 }}>
                            {localeObj.physical_card_description_1}
                        </span>
                    </div>
                }
                {this.props.type === "request" &&
                    <div style={{ margin: "1.5rem", textAlign: "center" }}>
                        <FlexView column>
                            <div className="body2 highEmphasis">
                                {this.state.cep}
                            </div>
                            <div className="body2 highEmphasis" style={{marginTop: "0.5rem" }}>
                                <p style={{ wordWrap: "break-word" }}>{GeneralUtilities.areAllArgsValid(this.state.street) ? this.state.street : ""}</p>
                                <p style={{ wordWrap: "break-word" }}>{GeneralUtilities.areAllArgsValid(this.state.neighbourhood) ? this.state.neighbourhood : ""}</p>
                                <div>{this.state.city} , {this.state.uf}</div>
                            </div>
                        </FlexView>
                    </div>
                }
                <div style={{...InputThemes.bottomButtonStyle, textAlign:"center"}}>
                    <PrimaryButtonComponent btn_text={this.props.type === "request" ? localeObj.confirm_address : this.props.type === "card_exists" ? localeObj.ok_i_got : localeObj.arrived} onCheck={this.open} />
                    {this.props.type === "request" && <SecondaryButtonComponent btn_text={localeObj.not_address} onCheck={this.secondary} />}
                    <div style={this.style.textStyle} className="body2 highEmphasis" onClick={() => this.help()}>
                        {localeObj.help}
                    </div>
                </div>
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer classes={{ paper: classes.paper }}
                        anchor="bottom"
                        open={this.props.bottomSheetEnabled}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.arrived}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.arrived_header}
                                </div>
                            </FlexView>
                        </div>
                        <div  style={{ width: "100%", marginBottom: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.unblock_card} onCheck={this.onPrimary} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.onSecondary} />
                        </div>
                    </Drawer>
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

DigitalCardArrival.propTypes = {
    classes: PropTypes.object.isRequired,
    componentName: PropTypes.string,
    icon: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['request', 'card_exists', 'arrival']).isRequired,
    next: PropTypes.func.isRequired,
    onHelp: PropTypes.func
  };

export default withStyles(styles)(DigitalCardArrival);
