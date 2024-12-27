import React from 'react';
import PropTypes from "prop-types";
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import FlexView from "react-flexview";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import PageState from '../../../Services/PageState';
import ColorPicker from '../../../Services/ColorPicker';
import constantObjects from "../../../Services/Constants";
import MetricsService from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";

import Card from '@material-ui/core/Card';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import InputThemes from "../../../Themes/inputThemes";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";

const theme1 = InputThemes.TermsTheme;
var localeObj = {};


const CustomCheckbox = withStyles({
    root: {
        color: ColorPicker.accent,
        '&$checked': {
            color: ColorPicker.darkHighEmphasis,
        },
    },
    checked: {
    },
})((props) => <Checkbox color="default" {...props} />);

class FGTSTermsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            snackBarDuration: constantObjects.SNACK_BAR_DURATION,
            checked: false
        }
        this.style = {
            terms: {
                align: "left",
                marginTop: "1rem",
            },
        }

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "DISPLAY TERMS PAGE"
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        document.getElementById("Terms").innerHTML = this.props.terms;
        window.onBackPressed = () => {
            this.props.back();
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName);
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    onChangeChecked = () => {
        this.setState({
            checked: !this.state.checked
        })
    }

    acceptTerms = () => {
        MetricsService.onPageTransitionStop(this.componentName, PageState.close);
        this.props.onClick("Nothing");
    }

    render() {
        const screenHeight = window.screen.height;
        return (
            <div style={{ overflowX: "hidden" }}>
                <div style={{  height: `${screenHeight * 0.75}px`, overflowY: "auto", overflowX: "hidden"}}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                                {localeObj.fgts_anticipate_terms_header}
                            </div>
                            <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "1rem" }}>
                                {localeObj.fgts_anticipate_terms_footer}
                            </div>
                        </FlexView>
                    </div>
                    <div className="scroll" style={{ overflowY: "auto", height: `${screenHeight * 0.5}px`, overflowX: "hidden" }}>
                        <div>
                            <MuiThemeProvider theme={theme1}>
                                <Card variant="outlined" style={{ background: "none" }}>
                                    <div style={{ width: "94%", marginLeft: "auto", marginRight: "auto" }}>
                                        <div className="body2 highEmphasis" style={this.style.terms} id={"Terms"}></div>
                                    </div>
                                </Card>
                            </MuiThemeProvider>
                        </div>
                    </div>
                    <div>
                        <FormControlLabel
                            style={{ marginLeft: "0.5rem" }}
                            control={<CustomCheckbox id="agency" checked={this.state.checked} onChange={this.onChangeChecked} />}
                            label={<span className="body2 highEmphasis">{localeObj.fgts_anticipate_terms_agree}</span>}
                        />
                    </div>
                </div>
                <div style={{ ...InputThemes.bottomButtonStyle, textAlign: "center" }}>
                    <PrimaryButtonComponent btn_text={localeObj.accept} onCheck={this.acceptTerms} disabled={!this.state.checked} />
                </div>
            </div>
        );
    }
}

FGTSTermsPage.propTypes = {
    classes: PropTypes.object,
    onClick: PropTypes.func,
    terms: PropTypes.string,
    componentName: PropTypes.string,
};

export default withStyles()(FGTSTermsPage)