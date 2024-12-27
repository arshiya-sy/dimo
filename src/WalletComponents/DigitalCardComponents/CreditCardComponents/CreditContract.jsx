import React from 'react';
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";
import PropTypes from "prop-types";
import Card from '@material-ui/core/Card';
import { MuiThemeProvider } from "@material-ui/core/styles";

import localeService from "../../../Services/localeListService";
import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames"
import MetricServices from "../../../Services/MetricsService";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";

const theme1 = InputThemes.TermsTheme;
var localeObj = {};
const PageNameJSON = PageNames.CreditCardComponents;

export default class CreditContract extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false
        }
        this.style = {
            terms: {
                align: "center",
                fontSize: "12px",
                color: ColorPicker.darkMediumEmphasis,
                fontWeight: "400",
                fontFamily: "Roboto",
                lineHeight: "1rem"
            },
        }
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNameJSON['credit_contract']
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        if(this.props.terms){
            document.getElementById("toc").innerHTML = this.props.terms;
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName)
        }
    }

    onChangeChecked = () => {
        //Log.sDebug("User clicked on checkbox for terms");
        this.setState({
            checked: !this.state.checked
        })
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    moveToContract = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.moveToContract();
    }

    render() {
        const screenHeight = window.screen.height;
        return (
            <div >
                <div style={InputThemes.initialMarginStyle}>
                    <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                        {localeObj.contract_info}
                    </div>
                    <div className="scroll" style={{ height: `${screenHeight * 0.6}px`, overflowY: "auto", marginTop: "1rem", overflowX: "auto" }} onScroll={this.trackScrolling}>
                        <MuiThemeProvider theme={theme1}>
                            <Card style={{ background: "none" }} variant="outlined">
                                <div style={this.style.terms} id={"toc"}>
                                </div>
                            </Card>
                        </MuiThemeProvider>
                    </div>
                </div>
                {/*<div style={{ margin: "1.5rem 1rem" }}>
                            <FormControlLabel
                                style={{ marginLeft: "0.5rem" }}
                                control={<CustomCheckbox id="agency" checked={this.state.checked} onChange={this.onChangeChecked} />}
                                label={<span className="body2 highEmphasis">{localeObj.fgts_anticipate_terms_agree}</span>}
                            />
        </div>*/}
                <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={localeObj.accept} onCheck={this.moveToContract} />
                </div>
            </div>
        );
    }
}

CreditContract.propTypes = {
    moveToContract: PropTypes.func,
    terms: PropTypes.string,
    componentName: PropTypes.string,
  };
