import React from "react";
import PropTypes from "prop-types";
import FlexView from "react-flexview";
import moment from "moment";

import "../../../styles/main.css";
import "../../../styles/colorSelect.css";
import "../../../styles/genericFontStyles.css";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import MetricServices from "../../../Services/MetricsService";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import { Paper } from "@material-ui/core";
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import GeneralUtilities from "../../../Services/GeneralUtilities";

var localeObj = {};
const PageNameJSON = PageNames.CreditCardComponents;
class CreditCardInvestmentInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            cdi_date: "80% CDI - ",
            creditInvestmentInfo: {}
        }
        this.styles = {
            imgStyleMore: {
                borderRadius: "50%",
                height: "3rem",
                width: "3rem",
                verticalAlign: "middle",
                fill: ColorPicker.surface3,
                backgroundColor: ColorPicker.surface3,
                justifySelf: 'center',
                alignSelf: 'center',
                marginRight: "1rem",
            },
            cardStyle: {
                borderRadius: "1.25rem",
                backgroundColor: ColorPicker.newProgressBar
            },
        }
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNameJSON['credit_invest'];
        }
        MetricServices.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        moment.locale(androidApiCalls.getLanguage());
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        this.props.hideProgressDialog();
        window.onBackPressed = () => {
            this.onBackHome();
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
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

    next = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.next();
    }

    onBackHome = () => {
        this.props.onBackHome();
    }

    help = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        GeneralUtilities.openHelpSection();
    }

    render() {
        const screenHeight = window.screen.height;
        const screenScrollHeight = screenHeight * 0.75;

        return (
            <div className="scroll" style={{ height: `${screenScrollHeight}px`, overflowY: 'auto', overflowX: "hidden" }}>
                <div style={InputThemes.initialMarginStyle}>
                    <FlexView column>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.credit_invest_title1}
                        </div>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.5rem" }}>
                            {GeneralUtilities.formattedString(localeObj.credit_invest_desc, [this.props.creditInvestmentInfo.indexPercentage, this.props.creditInvestmentInfo.index])}
                        </div>
                    </FlexView>  
                    <Paper  elevation="0" 
                      variant="outlined" style={{ backgroundColor: ColorPicker.newProgressBar, marginTop: "1.5rem",  borderRadius: "20px", padding: "1rem"}}>
                        <div style={{ justifyContent: "space-between"}}>
                            <span style={{ textAlign: "left", float: "left", width: "10%", paddingRight: "1rem", paddingTop:"0.25rem" }}>{ <ShieldOutlinedIcon style={{ width: "1.8rem", height: "1.8rem", marginLeft: "0.75rem", marginRight: "0.75rem", color: "#FFB684" }} />}</span>
                        <div>
                            <span className="body2 highEmphasis">{<b>{localeObj.credit_invest_desc1}</b>}</span>
                            <span className="body2 highEmphasis">{localeObj.credit_invest_desc2}</span>
                        </div>
                        </div>        
                    </Paper>
                    <Paper  elevation="0"
                        variant="outlined" style={{ backgroundColor: ColorPicker.newProgressBar,borderRadius: "20px",  marginTop: "1.5rem", padding: "1rem" }}>
                        
                        <FlexView column style={{ width: "100%", marginRight: "0rem", margin:"1rem" }}>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.banco_master}
                        </div>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop:"0.875rem"}}>
                            {this.props.creditInvestmentInfo.indexPercentage + "% " + this.props.creditInvestmentInfo.index +  " - " + moment.utc(this.props.creditInvestmentInfo.dueDate).format('MMM/YYYY').toUpperCase()} {/*TO-DO change it after jazz provide the field for the api*/}
                        </div>
                        
                        <div style={{ justifyContent: "space-between", marginTop:"2rem"}}>
                        <span className="body2 mediumEmphasis " style={{ textAlign: "left", float: "left", width: "60%" }}>{localeObj.min_application}</span>
                        <span className="body2 mediumEmphasis" style={{ textAlign: "left", float: "left", width: "40%", display: 'block' }}>
                            {localeObj.credit_due_date_info}
                            </span>
                        </div>
                        <div style={{ justifyContent: "space-between", marginTop:"0.25rem"}}>
                        <span className="subtitle4 highEmphasis " style={{ textAlign: "left", float: "left", width: "60%" }}>{GeneralUtilities.getFormattedAmount(this.props.creditInvestmentInfo.minInvestment)}</span>
                        <span className="subtitle4 highEmphasis" style={{ textAlign: "left", float: "left", width: "40%", display: 'block' }}>
                            {moment.utc(this.props.creditInvestmentInfo.dueDate).format('DD/MM/YYYY')}
                            </span>
                        </div>
                        <div style={{ justifyContent: "space-between", marginTop:"2rem"}}>
                        <span className="body2 mediumEmphasis " style={{ textAlign: "left", float: "left", width: "60%" }}>{localeObj.max_application}</span>
                        <span className="body2 mediumEmphasis" style={{ textAlign: "left", float: "left", width: "40%", display: 'block' }}>
                            {localeObj.interest}
                            </span>
                        </div>
                        <div style={{ justifyContent: "space-between" , marginTop:"0.25rem"}}>
                        <span className="subtitle4 highEmphasis " style={{ textAlign: "left", float: "left", width: "60%" }}>{GeneralUtilities.getFormattedAmount(this.props.creditInvestmentInfo.maxInvestment)}</span>
                        <span className="subtitle4 highEmphasis" style={{ textAlign: "left", float: "left", width: "40%", display: 'block' }}>
                            {localeObj.liquidity}
                            </span>
                        </div>
                        <div style={{ justifyContent: "space-between", marginTop:"2rem"}}>
                        <span className="body2 mediumEmphasis " style={{ textAlign: "left", float: "left", width: "60%" }}>{localeObj.bank}</span>
                        </div>
                        <div style={{ justifyContent: "space-between" , marginTop:"0.25rem"}}>
                        <span className="subtitle4 highEmphasis " style={{ textAlign: "left", float: "left", width: "60%" }}>
                            {localeObj.agency_name}</span>  {/*TO-DO change it after jazz provide the field for the api*/}
                        </div>
                        </FlexView>
                        </Paper> 
                </div> 
                <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={localeObj.credit_invest_btn} onCheck={this.next} />
                </div>
            </div >
        )
    }
}

CreditCardInvestmentInfo.propTypes = {
    classes: PropTypes.object.isRequired,
    creditInvestmentInfo: PropTypes.shape({
      indexPercentage: PropTypes.number.isRequired,
      index: PropTypes.string.isRequired,
      dueDate: PropTypes.string.isRequired,
      minInvestment: PropTypes.number.isRequired,
      maxInvestment: PropTypes.number.isRequired,
    }).isRequired,
    hideProgressDialog: PropTypes.func.isRequired,
    next: PropTypes.func.isRequired,
    onBackHome: PropTypes.func.isRequired,
    componentName: PropTypes.string,
  };

export default CreditCardInvestmentInfo;
