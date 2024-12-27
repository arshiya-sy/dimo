import React from 'react';
import FlexView from "react-flexview";
import moment from "moment";

import "../../../styles/main.css";
import "../../../styles/new_pix_style.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import ColorPicker from "../../../Services/ColorPicker";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import PageState from '../../../Services/PageState';
import { Divider } from "@mui/material";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import PrimaryButtonComponent from '../../CommonUxComponents/PrimaryButtonComponent';
import InputThemes from '../../../Themes/inputThemes';
import PropTypes from 'prop-types';

var localeObj = {};

export default class SimulationDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            processing: false,
            leftToPay: false,
            full: "",
            decimal: ""
        };

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "INVOICE PARTIAL PAYMENT SIMULATION";
        }
        MetricServices.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        androidApiCalls.enableCopyPaste();
        if (!!this.props.requiredInfo && !!this.props.requiredInfo.decimal && !!this.props.requiredInfo.amount) {
            this.setState({
                full: this.props.requiredInfo.amount,
                decimal: this.props.requiredInfo.decimal
            })
        }
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
        const screenHeight = window.screen.height;
        return (
            <div>
                <div style={{ display: "flex", flexDirection: "column", background: ColorPicker.newProgressBar }}>
                    <div style={{ textAlign: "left", margin: "1.5rem" }} className="headline5 highEmphasis">
                        {localeObj.invoice_payment}
                    </div>
                    <span style={{ textAlign: "left", margin: "0 1.5rem" }}>
                        <span className="headline5 highEmphasis" style={{ marginRight: "0.375rem" }}>{"R$ "}</span>
                        <span className="headline2 balanceStyle highEmphasis">{this.state.full}</span>
                        <span className="subScript headline5 highEmphasis">{"," + this.state.decimal}</span>
                    </span>

                    <FlexView column hAlignContent="left" style={{ textAlign: "left", margin: "0.75rem 1.5rem", marginBottom: "2rem" }}>
                        <div className="body2 highEmphasis">
                            {localeObj.original_invoice + "R$ " + GeneralUtilities.currencyFromDecimals(this.props.details.totalInvoice)}
                        </div>
                        <div className="body2 highEmphasis" style={{ marginTop: "0.5rem" }}>
                            {localeObj.due_date + ": " + moment(this.props.details.expiryDate).format('DD/MM/YYYY')}
                        </div>
                    </FlexView>
                </div>
                <div style={{ height: `${screenHeight - 520}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <FlexView column style={{ marginLeft: "2rem", marginRight: "2rem", marginTop: "1rem" }}>
                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.remaining_invoice}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{"R$ " + GeneralUtilities.currencyFromDecimals(this.props.details.leftToBePaid)}</span>
                        </div>
                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.current_invoice}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{"R$ "}</span>
                        </div>
                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.iof_taxes}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{GeneralUtilities.currencyFromDecimals(this.props.details.taxes) + "% a.m"}</span>
                        </div>
                        <Divider style={{ borderColor: ColorPicker.lighterAccent, margin: "1rem 0" }} />
                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.initial_amount_invoice}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{"R$ " + GeneralUtilities.currencyFromDecimals(this.props.details.initialAmount)}</span>
                        </div>
                        <Divider style={{ borderColor: ColorPicker.lighterAccent, margin: "1rem 0" }} />
                    </FlexView>
                </div>
                <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <PrimaryButtonComponent btn_text={localeObj.conf_cont} onCheck={this.confirm} />
                </div>
            </div >
        )
    }
}

SimulationDetails.propTypes = {
    next: PropTypes.func.isRequired,
    details: PropTypes.shape({
      totalInvoice: PropTypes.number.isRequired,
      expiryDate: PropTypes.string.isRequired,
      leftToBePaid: PropTypes.number.isRequired,
      taxes: PropTypes.number.isRequired,
      initialAmount: PropTypes.number.isRequired
    }).isRequired,
    componentName: PropTypes.string,
    requiredInfo: PropTypes.shape({
      decimal: PropTypes.string,
      amount: PropTypes.string
    })
  };
  