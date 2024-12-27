import React from "react";
import FlexView from "react-flexview";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import Log from "../../../Services/Log";
import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import PixDestSelectButton from "../PIXUtils/PixDestSelectButton";
import PropTypes from "prop-types";
import GeneralUtilities from "../../../Services/GeneralUtilities";

var localeObj = {};

export default class PixDestinationSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: undefined,
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageNames.pixDestinationSelect);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onTransitionStop(PageNames.pixDestinationSelect, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageNames.pixDestinationSelect);
        }
    }

    componentWillUnmount() {
        this.updateOptInStatus();
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    handleLogging = (logs) => {
        Log.sDebug(logs, PageNames.pixDestinationSelect);
    }

    onPixSelect = () => {
        this.handleLogging("Pix selected");
        this.setState({
            selected: "pix_selected"
        })
        this.props.setTransactionInfo("pix_key_selected");
    }

    onAccountSelected = () => {
        this.handleLogging("Transaction by full account details selected");
        this.setState({
            selected: "account_selected"
        })
        this.props.setTransactionInfo("pix_account_selected");
    }

    render() {
        let amount = this.props.requiredInfo.amount;
        let decimal = this.props.requiredInfo.decimal;
        return (
            <div style={{ margin: "1.5rem" }}>
                <FlexView column>
                    <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                        {GeneralUtilities.formattedString(localeObj.pix_send_to, [amount, decimal])}
                    </div>
                    <div className="body1 highEmphasis" style={{ textAlign: "left"}}>
                        {localeObj.pix_find_or_create}
                    </div>
                </FlexView>

                <div style={{ margin: "1.5rem 0" }}>
                    <PixDestSelectButton header={localeObj.pix_key_header} hint={localeObj.pix_key_description} select={this.onPixSelect} />
                </div>
                <div>
                    <PixDestSelectButton header={localeObj.pix_account_info_header} hint={localeObj.pix_account_description} select={this.onAccountSelected} />
                </div>
            </div>
        )
    }
}
PixDestinationSelect.propTypes = {
    classes: PropTypes.object.isRequired,
    setTransactionInfo: PropTypes.func,
    requiredInfo: PropTypes.object
};
