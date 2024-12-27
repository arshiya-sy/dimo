import React from 'react';
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import InputThemes from "../../../Themes/inputThemes";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import MetricServices from "../../../Services/MetricsService";
import PageState from '../../../Services/PageState';

import BankIcon from "../../../images/SvgUiIcons/salary_port.svg";
import CompanyIcon from '../../../images/SvgUiIcons/transaction.svg';
import NewUtilities from '../../../Services/NewUtilities';

var localeObj = {};
export default class ReviewComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cnpj: ""
        };

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "Review Page"
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        if(this.props && this.props.cnpj){
            this.setState({cnpj: NewUtilities.parseCnpj(this.props.cnpj).displayCPF})
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

    sendField = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.confirm();
    }

    render() {
        const finalHeight = window.screen.height;
        return (
            <div>
                <div className="scroll" style={{ height: `${finalHeight - 240}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <FlexView column overflow="scroll">
                        <FlexView column style={InputThemes.initialMarginStyle}>
                            <div className="headline5 highEmphasis" >
                                {localeObj.confirm_data}
                            </div>

                            <FlexView column>
                                <div className="pixTableRightContent tableRightStyle highEmphasis" style={{ textAlign: "left", marginTop: "2rem", width: "100%", display: "inline-flex" }}>
                                    <img src={CompanyIcon} alt={"company"}className="pixReceiverSenderIcon" />
                                    {localeObj.company}
                                </div>
                                <div style={{ justifyContent: "space-between", marginTop: "0.375rem" }}>
                                    <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.cnpj}</span>
                                    <span className="pixTableRightContent tableRightStyle highEmphasis" >{this.state.cnpj}</span>
                                </div>
                                <div style={{ justifyContent: "space-between", marginTop: "0.375rem" }}>
                                    <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.company_name}</span>
                                    <span className="pixTableRightContent tableRightStyle highEmphasis" >{this.props.name}</span>
                                </div>
                                <div className="pixTableRightContent tableRightStyle highEmphasis" style={{ textAlign: "left", marginTop: "2rem", width: "100%", display: "inline-flex" }}>
                                    <img src={BankIcon} alt={"Bank"} className="pixReceiverSenderIcon" />
                                    {localeObj.bank}
                                </div>
                                <div style={{ justifyContent: "space-between", marginTop: "0.375rem" }}>
                                    <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.salary_bank_acc}</span>
                                    <span className="pixTableRightContent tableRightStyle highEmphasis" >{this.props.bankName}</span>
                                </div>
                            </FlexView>
                        </FlexView>

                    </FlexView>
                    <div style={{...InputThemes.bottomButtonStyle, textAlign:"center"}}>
                        <PrimaryButtonComponent btn_text={localeObj.conf_cont} onCheck={() => this.sendField()} />
                    </div>
                </div>
            </div>
        )
    }
}
ReviewComponent.propTypes = {
    cnpj: PropTypes.string,
    componentName: PropTypes.string,
    confirm: PropTypes.func.isRequired,
    bankName: PropTypes.object.isRequired,
    name: PropTypes.string
  }