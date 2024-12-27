import moment from 'moment';
import React from 'react';
import PropTypes from 'prop-types';
import androidApiCallsService from '../../../../Services/androidApiCallsService';
import GeneralUtilities from '../../../../Services/GeneralUtilities';
import localeService from '../../../../Services/localeListService';
import ColorPicker from '../../../../Services/ColorPicker';
import CustomizedProgressBars from '../../../CommonUxComponents/ProgressComponent';

var localeObj = {};

export default class TransactionHistoryReceipt extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            processing: false,
        }

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "CREDIT CARD TRANSACTION HISTORY RECEIPT PAGE"
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCallsService.enablePullToRefresh(false);
        moment.locale(GeneralUtilities.getLocale());
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        })
    }

    render() {
        const transactionData = this.props.transactionData;
        const full = transactionData.formatted_amount.formatted;
        const decimal = transactionData.formatted_amount.decimal;
        const screenHeight = window.screen.height;

        return (
            <div className="scroll" style={{ height: `${screenHeight * 0.75}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={{ display: !this.state.processing ? "flex" : "none", flexDirection: "column", background: ColorPicker.newProgressBar }}>
                    <div style={{ textAlign: "center", marginTop: "1.5rem", marginBottom: "0.75rem" }} className="body1 highEmphasis">
                        {localeObj.you_paid}
                    </div>
                    <span style={{ textAlign: "center" }}>
                        <span className="headline5 highEmphasis" style={{ marginRight: "0.375rem" }}>{"R$ "}</span>
                        <span className="headline2 balanceStyle highEmphasis">{full}</span>
                        <span className="subScript headline5 highEmphasis">{"," + decimal}</span>
                    </span>
                    <div style={{ textAlign: "center", marginTop: "0.375rem", marginBottom: "0.375rem" }} className="body1 highEmphasis">
                        {GeneralUtilities.formattedString(localeObj.payment_desc, [transactionData.description])}
                    </div>

                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }} className="Caption highEmphasis">
                        {transactionData.formattedDateTime}
                    </div>

                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
            </div >

        )
    }
}

TransactionHistoryReceipt.propTypes = {
  componentName: PropTypes.string,
  transactionData: PropTypes.shape({
    formatted_amount: PropTypes.shape({
      formatted: PropTypes.string.isRequired,
      decimal: PropTypes.string.isRequired,
    }).isRequired,
    description: PropTypes.string.isRequired,
    formattedDateTime: PropTypes.string.isRequired,
  }).isRequired,
};
