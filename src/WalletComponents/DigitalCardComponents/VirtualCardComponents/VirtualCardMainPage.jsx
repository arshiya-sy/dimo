import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import "../../../styles/main.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";
import layout from "../../../images/DarkThemeImages/VisaVirtualCard.png"

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";
import MetricServices from "../../../Services/MetricsService";
import androidApiCalls from "../../../Services/androidApiCallsService";

import Paper from '@material-ui/core/Paper';
import NextIcon from '@material-ui/icons/ArrowForwardIos';
import { createMuiTheme, MuiThemeProvider, withStyles } from '@material-ui/core/styles';

const theme1 = createMuiTheme({
    overrides: {
        MuiPaper: {
            rounded: {
                borderRadius: "0.75rem",
                marginBottom: "1rem",
                padding: "0.75rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            },
        }
    }
});

const styles = InputThemes.singleInputStyle;

class VirtualCardMainPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            details: props.details,
        };

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNames.physicalCardComponents.card;
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.props.back();
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

    action = (option) => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.action(option);
    }

    render() {
        const { classes } = this.props;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const scrollHeight = screenHeight * 0.60;
        const buttonsScrollHeight = screenHeight * 0.24;
        const cardWidth = screenWidth * 0.80;
        const cardHeight = screenHeight * 0.24;

        return (
            <div style={{ overflowX: "hidden" }}>
                <div className="scroll" style={{ height: `${scrollHeight}px`, width: `${screenWidth}px`, overflowY: "auto", overflowX: "hidden", position: 'relative', marginBottom: "0", textAlign: "center" }}>
                    <img style={{ width: `${cardWidth}px`, height: `${cardHeight}px`, marginLeft: 'auto', marginRight: 'auto' }} src={layout} alt=""></img>
                    <div  style={{ position: 'absolute', top: "25%", marginLeft: "15%", textAlign: "left" }}>
                        <span className="body1 highEmphasis">{this.state.details.name}</span>
                    </div>
                    <div  style={{ position: 'absolute', top: "30%", marginLeft: "15%", textAlign: "left" }}>
                        <span className="headline6 highEmphasis">{this.state.details.number}</span>
                    </div>
                <FlexView column>
                    <div className="body2 highEmphasis" style={{ marginLeft:'1rem',marginRight:'1rem', textAlign: "center" }}>
                    <hr className='hrTag'></hr>
                        <iframe title="virtualCard" align="center" width="100%" height="270" loading="lazy" frameBorder="0" src={this.props.src}></iframe>
                    <hr className='hrTag'></hr>
                    </div>
                </FlexView>
                </div>
                <div style={{ margin: "0.5rem 1.5rem 0.5rem 1.5rem", height: `${buttonsScrollHeight}px`, overflowY: 'auto' }}>
                    {this.props.menuOptions.map((opt, key) => (
                        <MuiThemeProvider key={opt} theme={theme1}>
                            <Paper className={classes.root} id={key} elevation="0"
                                onClick={() => { this.action(opt) }} style={{ backgroundColor: ColorPicker.newProgressBar }}>
                                <span className="body2 highEmphasis">{opt}</span>
                                <NextIcon style={{ fill: ColorPicker.accent, width: "0.8rem", position: "absolute", right: "2em" }} />
                            </Paper>
                        </MuiThemeProvider>
                    ))}
                </div>
            </div>
        );
    }
}

VirtualCardMainPage.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    menuOptions: PropTypes.object.isRequired,
    src: PropTypes.string,
    action: PropTypes.func,
    details: PropTypes.string,
    componentName: PropTypes.string,
    back: PropTypes.func.isRequired,
};

export default withStyles(styles)(VirtualCardMainPage);