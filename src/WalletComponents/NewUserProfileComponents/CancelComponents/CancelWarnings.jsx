import React from 'react';
import FlexView from "react-flexview";

import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import PortabilityIcon from "../../../images/SvgUiIcons/salaryPortability.png";
import FgtsIcon from "../../../images/SaqueAniversario/FGTSLoan.png";

import GeneralUtilities from '../../../Services/GeneralUtilities';
import PageState from '../../../Services/PageState';
import PageNames from '../../../Services/PageNames';
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from '../../CommonUxComponents/SecondaryButtonComponent';
import PropTypes from "prop-types";

const styles = InputThemes.singleInputStyle;

var localeObj = {};
class CancelWarningComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            localeObj: [],
        }
        this.styles = {
            cardStyle: {
                width: "100%",
                margin: "0 1rem",
                align:"center"
            },
            circle: {
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            },
            imgStyle: {
                height: "3rem"
            }
        }
        MetricServices.onPageTransitionStart(PageNames.CancelAccountComponents.description);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageNames.CancelAccountComponents.description, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.CancelAccountComponents.description);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    onNext = () => {
        this.props.next();
    }

    back = () => {
        return this.moveToNextScreen("/profileDetails", false);
    }

    moveToNextScreen = (redirectPathName, storeToHistoryPath = true) => {

        const redirectComponentData = {
            pathname: redirectPathName,
            state: { "profileData": this.props.profileData },
            fromComponent: this.componentName
        };

        return GeneralUtilities.pushHistoryPath(redirectComponentData, this.props?.location, {'storeToHistoryPath': storeToHistoryPath});
    }

    render() {
        const screenHeight = window.screen.height;
        const depositContents = [
            {
                heading: localeObj.cancel_header_2,
                text: localeObj.cancel_header_3,
                icon: <img src={FgtsIcon} alt="" style={this.styles.imgStyle} />
            },
            {
                heading: localeObj.salary_portability,
                text: localeObj.cancel_header_4,
                icon: <img src={PortabilityIcon} alt="" style={this.styles.imgStyle} />
            }
        ];

        return (
            <div style={{ overflowX: "hidden" }}>
                <div className="scroll" style={{ height: `${screenHeight - 240}px`, overflowY: "auto"}}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.remember}
                            </div>
                            <div className="body2 highEmphasis scroll" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                                {localeObj.remember_desc}
                            </div>
                        </FlexView>
                    </div>

                    <FlexView column align="center" style={{ width: "100%" }}>
                        <MuiThemeProvider theme={InputThemes.CancelWarningTheme}>
                            <Grid container spacing={0}>
                                {
                                    depositContents.map((keys,index) => (
                                        <div key={index} style={this.styles.cardStyle}>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <div style={this.styles.circle}>{keys.icon}</div>
                                                </ListItemIcon>
                                                <ListItemText>
                                                    <div style={{ marginLeft: "1rem", textAlign:"left" }}>
                                                        <span className="subtitle4 highEmphasis" >{keys.heading}</span>
                                                        <div className="body2 mediumEmphasis" style={{ marginTop: "0.5rem" }}>{keys.text}</div>
                                                    </div>
                                                </ListItemText>
                                            </ListItem>
                                        </div>
                                    ))
                                }
                            </Grid>
                        </MuiThemeProvider>
                    </FlexView>
                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                        <PrimaryButtonComponent btn_text={localeObj.i_understand} onCheck={this.onNext} />
                        <SecondaryButtonComponent btn_text={localeObj.main_menu} onCheck={this.back} />
                    </div>
                </div>
            </div>
        );
    }
}
CancelWarningComp.propTypes = {
    next: PropTypes.func,
    profileData: PropTypes.object,
    location: PropTypes.object,
};
export default withStyles(styles)(CancelWarningComp);
