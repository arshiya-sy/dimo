import React from "react";
import "../../../styles/main.css";
import InputThemes from "../../../Themes/inputThemes";
import FlexView from "react-flexview";

import PageNames from "../../../Services/PageNames";
import localeService from "../../../Services/localeListService";
import ColorPicker from "../../../Services/ColorPicker";

import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import PayIcon from "../../../images/SvgUiIcons/pay.svg";
import CardIcon from "../../../images/SvgUiIcons/card.svg";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";

import PageState from "../../../Services/PageState";
import MetricsService from "../../../Services/MetricsService";
import GeneralUtilities from "../../../Services/GeneralUtilities";

const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.migrateCardRequest;
var localeObj = {};

class CardRequestInfo extends React.Component {
    constructor(props) {
        super(props);
        this.styles = {
            cardStyle: {
                width: "100%",
                borderRadius: "0.5rem",
                margin: "0 1rem"
            },
            circle: {
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: ColorPicker.newProgressBar
            },
            imgStyle: {
                height: "1.5rem",
                width: "1.5rem",
                padding: "0.75rem"
            },
        };
        this.componentName = PageNameJSON.initial;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        MetricsService.onPageTransitionStart(this.componentName);
    }

    visibilityChange = (e) => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    onBack = () => {
        this.props.onBack();
    }

    onConfirm = () => {
        this.props.confirm();
    }

    help = () => {
        GeneralUtilities.openHelpSection();
    }

    render() {
        const finalHeight = window.screen.height;

        const depositContents = [
            {
                heading: localeObj.go_visa,
                text: localeObj.new_debit_desc1,
                icon: <img src={CardIcon} style={this.styles.imgStyle} alt="" />
            },
            {
                heading: localeObj.virtual_card,
                text: localeObj.new_debit_desc2,
                icon: <img src={PayIcon} style={this.styles.imgStyle} alt="" />
            }
        ];
        return (
            <div className="scroll" style={{ height: `${finalHeight * 0.65}px`, overflowY: "auto", overflowX: "hidden" }}>
                <FlexView column style={InputThemes.initialMarginStyle}>
                    <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                        {localeObj.new_debit_card}
                    </div>
                    <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "0.5rem" }}>
                        {localeObj.new_debit_card_desc}
                    </div>
                </FlexView>
                <div align="center" style={{ width: "100%" }}>
                    <MuiThemeProvider theme={InputThemes.SalaryWithDrawTheme}>
                        <Grid container spacing={0}>
                            {
                                depositContents.map((keys, index) => (
                                    <div key={index}  style={{...this.styles.cardStyle, textAlign:"center"}}>
                                        <ListItem>
                                            <ListItemIcon>
                                                <div style={this.styles.circle}>{keys.icon}</div>
                                            </ListItemIcon>
                                            <ListItemText>
                                                <div style={{ marginLeft: "1rem", textAlign:"left"  }}>
                                                    <span className="subtitle4 highEmphasis" >{keys.heading}</span>
                                                    <div className="body2 mediumEmphasis" style={{ margin: "0.25rem 0" }}>{keys.text}</div>
                                                </div>
                                            </ListItemText>
                                        </ListItem>
                                    </div>
                                ))
                            }
                        </Grid>
                    </MuiThemeProvider>
                </div>

                <div align="center" style={InputThemes.bottomButtonStyle}>
                    <div className="body2 highEmphasis" style={{ margin: "1.5rem", textAlign: "left" }}>
                        {localeObj.new_debit_desc3}
                    </div>
                    <PrimaryButtonComponent btn_text={localeObj.ask_now_profile} onCheck={this.onConfirm} />
                    <SecondaryButtonComponent btn_text={localeObj.plain_maybe_later} onCheck={this.onBack} />
                    <div className="body2 highEmphasis" style={{ marginTop: "1rem" }} onClick={() => this.help()}>{localeObj.help}</div>
                </div>
            </div >
        );
    }
}

export default withStyles(styles)(CardRequestInfo);