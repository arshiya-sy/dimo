import React from 'react';
import FlexView from "react-flexview";
import PropTypes from 'prop-types';
import "../../../styles/main.css";
import "../../../styles/new_pix_style.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import ColorPicker from "../../../Services/ColorPicker";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import PageState from '../../../Services/PageState';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import PrimaryButtonComponent from '../../CommonUxComponents/PrimaryButtonComponent';
import InputThemes from '../../../Themes/inputThemes';
import PageNames from '../../../Services/PageNames';

var localeObj = {};
const PageNameJSON = PageNames.CreditCardInvestmentComponents;
export default class RedeemDetailsComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            processing: false,
        };

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNameJSON['redeem_details'];
        }
        MetricServices.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        androidApiCalls.enableCopyPaste();
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    confirm = () => {
        this.props.next();
    }

    render() {
        return (
            <div>
                <div style={{ display: "flex", flexDirection: "column"}}>
                    <div style={{ textAlign: "left", margin: "1.5rem" }} className="headline5 highEmphasis">
                        {localeObj.redeem_details_header}
                    </div>
                    <span style={{ textAlign: "left", margin: "0 1.5rem" }}>
                        <span className="headline5 highEmphasis" style={{ marginRight: "0.375rem" }}>{"R$ "}</span>
                        <span className="headline2 balanceStyle highEmphasis">{this.props.details.full}</span>
                        <span className="subScript headline5 highEmphasis">{"," + this.props.details.decimal}</span>
                    </span>
                    <div style={{ textAlign: "left", margin: "0 1.5rem" }} className="body2 highEmphasis">
                            {localeObj.redeem_details_text}
                    </div>
                </div>
                <div style={{ height: "8rem", overflowY: "auto", overflowX: "hidden", background: ColorPicker.cardBackgroundColor, margin:"1.5rem 0" }}>
                    <FlexView column style={{ marginLeft: "2rem", marginRight: "2rem", marginTop: "1rem" }}>
                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.redeem_details_list1}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{"R$ " + GeneralUtilities.currencyFromDecimals(this.props.details.creditLimit)}</span>
                        </div>
                        <hr className='hrTag'></hr>
                        <div style={{ justifyContent: "space-between", marginBottom: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.redeem_details_list2}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{"R$ "+ GeneralUtilities.currencyFromDecimals(this.props.details.newCreditLimit)}</span>
                        </div>
                    </FlexView>
                </div>
                <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={localeObj.conf_cont} onCheck={this.confirm} />
                </div>
            </div >
        )
    }
}

RedeemDetailsComp.propTypes = {
    componentName: PropTypes.string,
    next: PropTypes.func,
    details: PropTypes.shape({
        full: PropTypes.number,
        decimal: PropTypes.number,
        creditLimit: PropTypes.number,
        newCreditLimit: PropTypes.number
    })
};
