import React from 'react';
import PropTypes from "prop-types";
import NotVisibleIcon from '@material-ui/icons/VisibilityOffRounded';
import VisibleIcon from '@material-ui/icons/VisibilityRounded';
import androidApiCalls from "../../Services/androidApiCallsService";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import localeService from "../../Services/localeListService";
import GeneralUtilities from '../../Services/GeneralUtilities';
import arbiApiService from "../../Services/ArbiApiService";
import ArbiResponseHandler from '../../Services/ArbiResponseHandler';
import ColorPicker from "../../Services/ColorPicker";
import Log from '../../Services/Log';
import PageNames from "../../Services/PageNames";
import constantObjects from '../../Services/Constants';
import MetricServices from '../../Services/MetricsService';
import ImportantDetails from '../NewLaunchComponents/ImportantDetails';

var localeObj = {};
export default class BalanceCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            balance: GeneralUtilities.isNotEmpty(this.props.balance, false) ? this.props.balance : ImportantDetails.walletBalance,
            decimal: GeneralUtilities.isNotEmpty(this.props.decimal, false) ? this.props.decimal : ImportantDetails.walletDecimal,
            showBalance: androidApiCalls.getDAStringPrefs("showBalance") === "false" ? false : true
        };

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount = () => {
        this.invalidBalanceCheck() && this.checkBalance();
    }

    invalidBalanceCheck = () => {
        const { balance } = this.state;
        return balance === -1 || !GeneralUtilities.isNotEmpty(balance, false);
    }

    checkBalance = () => {
        arbiApiService.getUserBalance(PageNames.mainTransactionHistory.display_transactions ,this.accountKey)
            .then(response => {
                if (response.success) {
                    let processorResponse = ArbiResponseHandler.processBalanceApiResponse(response.result);
                    if (processorResponse.success) {
                        let balanceInfo = processorResponse.balance.toString().split(".");
                        this.setState({
                            balance: balanceInfo[0],
                        });
                        let decimal = balanceInfo[1];
                        if (decimal) {
                            switch (decimal.length) {
                                case 0:
                                    decimal = "00";
                                    break;
                                case 1:
                                    decimal = decimal + "0";
                                    break;
                                default:
                                    decimal = decimal.substring(0, 2);
                                    break;
                            }
                        } else {
                            decimal = "00";
                        }
                        this.setState({
                            decimal: decimal
                        });

                        ImportantDetails.setBalance(this.state.balance, this.state.decimal);
                    }
                } else {
                    this.openSnackBar(response.result.details);
                }
            });
    };

    showBalance = (val) => {
        if(val === "HIDE") {
            let event = {
                eventType: constantObjects.hideBalance,
                page_name: PageNames.mainTransactionHistory.display_transactions,
              };
              MetricServices.reportActionMetrics(event, new Date().getTime());
        } else {
            let event = {
                eventType: constantObjects.showBalance,
                page_name: PageNames.mainTransactionHistory.display_transactions,
              };
              MetricServices.reportActionMetrics(event, new Date().getTime());
        }

        this.setState({
            showBalance: !this.state.showBalance
        })
        Log.sDebug("Balance show state " + !this.state.showBalance, "DisplayTransactions")
        androidApiCalls.setDAStringPrefs("showBalance", !this.state.showBalance);
    }

    render() {
        return (
            <div>
                <div style={{ margin: "1.5rem" }}>
                    <div style={{ display: "flex" }}>
                        <span className="body2 mediumEmphasis">
                            {localeObj.total}
                        </span>
                    </div>
                    <div style={{ marginTop: this.invalidBalanceCheck() ? "0" : "0.3rem", height: "1.5rem"}}>
                        {this.invalidBalanceCheck() && this.state.showBalance &&
                            <div className="shimmer-container">
                                <section className="shimmer-card-wraper">
                                    <div className="shimmer-card-bar shimming"></div>
                                </section>
                            </div>
                        }
                        {this.state.showBalance && !this.invalidBalanceCheck() &&
                            <span style={{ textAlign: "center" }}>
                                 <span className="headline5 highEmphasis" style={{ marginRight: "0.325rem" }}>{"R$"}</span>
                                <span className="headline2 highEmphasis balanceStyle" style={{ marginRight: "0.125rem" }}>{GeneralUtilities.formatBalance(this.state.balance)}</span>
                                <span className="pixSubScript headline5 highEmphasis">{"," + this.state.decimal}</span>
                            </span>
                        }
                        {!this.state.showBalance && !this.invalidBalanceCheck() &&
                            <span style={{ textAlign: "center" }}>
                                <span className="headline5 highEmphasis" style={{ marginRight: "0.25rem" }}>{"R$ "}</span>
                                <span className="hidestyle headline5 highEmphasis">
                                    {this.state.balance.replace(/[0-9]/g, "*")}{this.state.decimal.replace(/[0-9]/g, "*")}</span>
                            </span>
                        }
                        {this.invalidBalanceCheck() && !this.state.showBalance &&
                             <span style={{ textAlign: "center" }}>
                             <span className="headline5 highEmphasis" style={{ marginRight: "0.25rem" }}>{"R$ "}</span>
                             <span className="hidestyle headline5 highEmphasis">
                                 {"***"}</span>
                         </span>
                        }
                        {!this.invalidBalanceCheck() && this.state.showBalance &&
                            <span className="hidestyle" onClick={() => this.showBalance("HIDE")} style={{ marginLeft: "1.2rem" }}>
                                <VisibleIcon style={{ fill: ColorPicker.darkHighEmphasis }} />
                            </span>
                        }
                        {!this.state.showBalance &&
                            <span className="hidestyle" onClick={() => this.showBalance("SHOW")} style={{ marginLeft: "1.2rem" }}>
                                <NotVisibleIcon style={{ fill: ColorPicker.darkHighEmphasis }} />
                            </span>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
BalanceCard.propTypes = {
    balance: PropTypes.string,
    decimal: PropTypes.string,

}