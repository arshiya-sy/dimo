import moment from 'moment';
import React from 'react';
import androidApiCallsService from '../../../../Services/androidApiCallsService';
import GeneralUtilities from '../../../../Services/GeneralUtilities';
import localeService from '../../../../Services/localeListService';
import ColorPicker from '../../../../Services/ColorPicker';
import FlexView from 'react-flexview/lib';
import CustomizedProgressBars from '../../../CommonUxComponents/ProgressComponent';
import PrimaryButtonComponent from '../../../CommonUxComponents/PrimaryButtonComponent';
import PropTypes from 'prop-types';
import InputThemes from '../../../../Themes/inputThemes';
import TransactionHistoryDisplayGrid from './TransactionHistoryDisplayGrid';
import CommonButtons from '../../../CommonUxComponents/CommonButtons';
import NoInvoiceHistoryComponent from './NoInvoiceHistory';

const FilterButton = CommonButtons.ButtonTypeFilter;
var localeObj = {};

export default class ReceiptComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            processing: false,
            clickVal: "Jan",
            monthArray: [],
            transaction: [],
            noInvoiceHistory: false,
            length: 0
        }

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "CREDIT CARD INVOICE HISTORY RECEIPT PAGE"
        }
        this.scrollContainerRef = React.createRef();
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        const tz = androidApiCallsService.getLocale() === "en_US" ? "en" : "pt-br";
        moment.locale(tz);
        androidApiCallsService.enablePullToRefresh(false);
        this.setState({
            clickVal: moment.utc(this.props.invoiceDetails.invoiceData.dueDate).format("MMM-YYYY")
        })
        this.convertMonthArray(this.props.invoiceMonthArray, moment.utc(this.props.invoiceDetails.invoiceData.dueDate).format("MMM-YYYY"));
    }

    convertMonthArray = (invoiceMonthArray) => {
        let transactions = invoiceMonthArray.flatMap(element => element.transactions);
        const convertedDates = transactions.map(transaction => {
            const dueDate = moment.utc(transaction.dueDate);
            return dueDate.format('MMM-YYYY')
        });

        let orderMonths = convertedDates.reverse();
        this.setState({
            n: convertedDates.length,
            monthArray: orderMonths,
            transaction: transactions
        }, () => {
            this.centerSelectedElement();
        });
    }


    centerSelectedElement = () => {
        const container = this.scrollContainerRef.current;

        if (container) {
            const selectedElement = container.querySelector('.selected');
            if (selectedElement) {
                const containerWidth = container.offsetWidth;
                const selectedElementWidth = selectedElement.offsetWidth;
                const offsetLeft = selectedElement.offsetLeft;
                let scrollLeft = offsetLeft - selectedElementWidth * 2;
                if (scrollLeft < 0) {
                    let s = scrollLeft * (-1);
                    let pad = s + "px"
                    container.style.paddingLeft = pad
                } else if (scrollLeft + containerWidth > container.scrollWidth) {
                    container.style.paddingRight = "84px";
                }

                container.scrollLeft = scrollLeft;
            }
        }
    };

    rightRotate = (a, n, k) => {
        let res = [];
        k = k % n;
        for (let i = 0; i < n; i++) {
            if (i < k) {
                res.push(a[n + i - k]);
            }
            else {
                res.push(a[i - k]);
            }
        }
        return res;
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
    onPrimary = () => {
        //Log.sDebug("onPrimary");
        this.props.payInvoice(this.props.invoiceDetails.invoiceData, this.props.invoiceId, this.props.invoiceDetails?.invoiceData?.isFutureInvoice);
    }


    handleShare = () => {
        //Log.sDebug("handleShare");
    }
    handleDownload = () => {
        //Log.sDebug("handleDownload");
    }

    filterInvoiceHistory = (mon) => {
        // Log.sDebug("filterInvoiceHistory: mon: " + mon);
        let invoiceMonthArray = this.state.transaction;
        //Log.sDebug("filterInvoiceHistory: invoiceMonthArray: " + JSON.stringify(invoiceMonthArray));
        let invoiceData = invoiceMonthArray.filter(function (invoiceMonthArray) {
            return invoiceMonthArray.invoiceMonth === mon;
        }).map(function (invoiceMonthArray) {
            return invoiceMonthArray;
        });
        //Log.sDebug("filterInvoiceHistory: invoiceObj: " + JSON.stringify(invoiceData));
        if (GeneralUtilities.notEmptyNullUndefinedCheck(invoiceData)) {
            this.setState({
                noInvoiceHistory: false,
                clickVal: mon
            });
            this.props.onSelect(invoiceData[0], this.props.invoiceMonthArray)
        } else {
            //Log.sDebug("empty");
            this.setState({
                noInvoiceHistory: true,
                clickVal: mon
            });
        }
        // this.setMonthArray(mon);

    }

    onSelectTransaction = (transactionDetails) => {
        this.props.onSelectTransaction(transactionDetails, this.props.invoiceDetails?.invoiceData?.isFutureInvoice);
    }


    render() {
        const invoiceData = this.props.invoiceDetails.invoiceData;
        const transactionData = this.props.invoiceDetails.transactionData;
        const full = invoiceData.formatted_amount.formatted;
        const decimal = invoiceData.formatted_amount.decimal;
        const screenHeight = window.screen.height;

        const getInvoiceStatusString = () => {
            let invoiceStatus = invoiceData.invoiceStatus;
            let invoiceText = "";
            switch (invoiceStatus) {
                case "open": invoiceText = localeObj.open_invoice; break;
                case "closed": invoiceText = localeObj.closed_invoice; break;
                case "partial": invoiceText = localeObj.partially_paid; break;
                case "paid": invoiceText = localeObj.paid_invoice; break;
                case "installment": invoiceText = localeObj.installments; break;
                case "future": invoiceText = localeObj.future_invoice; break;
                default: invoiceText = localeObj.closed_invoice; break;
            }
            return invoiceText;

        }


        const shouldShowAMountbreakup = () => {
            /*let invoiceStatus = invoiceData.invoiceStatus;
            if (invoiceStatus === 0 || invoiceStatus === 3 || invoiceStatus === -1) {
                return false;
            }
            return true;*/
            return !invoiceData.isFutureInvoice;
        }

        const getPrimaryButtonText = () => {
            let invoiceStatus = invoiceData.invoiceStatus;
            let btnText = "";
            if (invoiceStatus === "open")
                btnText = localeObj.adv_payment;
            else
                btnText = localeObj.pay_invoice;
            return btnText;
        }

        return (

            <div>
                <div id="scrollbar" style={{ marginTop: "1.5rem", marginBottom: "1.5rem", overflowX: 'scroll', whiteSpace: 'nowrap' }} ref={this.scrollContainerRef}>
                    <div id="scrollbar1" style={{ width: "0%", display: 'flex' }}>
                        {this.state.monthArray.map((item, index) => (
                            <FilterButton
                                key={index}
                                className={`smallTextStyleBold ${this.state.clickVal === item ? 'selected' : ''}`}
                                variant="outlined"
                                onClick={() => this.filterInvoiceHistory(item)}
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    padding: "0.313rem 2.5rem",
                                    color: ColorPicker.darkHighEmphasis,
                                    border: "solid 2px transparent",
                                    background: (this.state.clickVal === item ? "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box" : "none"),
                                }}>
                                {item}
                            </FilterButton>
                        ))}
                    </div>
                </div>


                {!this.state.noInvoiceHistory &&
                    <div className="scroll" style={{ height: `${screenHeight * 0.6}px`, overflowY: "auto", overflowX: "hidden" }}>
                        <div style={{ display: !this.state.processing ? "flex" : "none", flexDirection: "column", background: ColorPicker.newProgressBar }}>
                            <div style={{ textAlign: "center", marginTop: "1.5rem", marginBottom: "0.75rem" }} className="body1 highEmphasis">
                                {getInvoiceStatusString()}
                            </div>
                            <span style={{ textAlign: "center" }}>
                                <span className="headline5 highEmphasis" style={{ marginRight: "0.375rem" }}>{"R$ "}</span>
                                <span className="headline2 balanceStyle highEmphasis">{full}</span>
                                <span className="subScript headline5 highEmphasis">{"," + decimal}</span>
                            </span>
                            <div style={{ textAlign: "center", marginTop: "0.375rem", marginBottom: "0.375rem" }} className="body1 highEmphasis">
                                {GeneralUtilities.captitalizeFirstLetter(moment(invoiceData.dueDate).format("MMMM YYYY"))}
                            </div>
                            {invoiceData.closeDate && <div style={{ textAlign: "center" }} className="Caption highEmphasis">
                                {localeObj.close_date + moment(invoiceData.closeDate).format('DD/MM/YYYY')}
                            </div>}
                            {invoiceData.invoiceStatus === "paid" &&
                                <FlexView hAlignContent="center" style={{ textAlign: "center" }}>
                                    {invoiceData.paymentDate && <div style={{ textAlign: "center" }} className="Caption highEmphasis">
                                        {localeObj.close_invoice_date + moment(invoiceData.paymentDate).format('DD/MM/YYYY')}
                                    </div>}
                                </FlexView>
                            }
                            {(invoiceData.invoiceStatus === "open" ||
                                invoiceData.invoiceStatus === "closed" ||
                                invoiceData.invoiceStatus === "partial") && invoiceData.dueDate && <div style={{ textAlign: "center" }} className="Caption highEmphasis">
                                    {localeObj.expiry_date + moment(invoiceData.dueDate).format('DD/MM/YYYY')}
                                </div>
                            }
                            {<div style={{ marginBottom: "1.5rem", }}></div>}
                        </div>

                        {
                            shouldShowAMountbreakup() &&
                            <FlexView column style={{ width: "90%", margin: "1rem" }}>
                                <div style={{ justifyContent: "space-between", margin: "0.25rem" }}>
                                    <span className="body2" style={{ textAlign: "left", float: "left", width: "70%", color: ColorPicker.darkMediumEmphasis }}>{localeObj.national_purchases}</span>
                                    <span className="body2" style={{ textAlign: "right", float: "right", width: "30%", color: ColorPicker.darkHighEmphasis }}>{"R$ "}{invoiceData.nationalTotal}</span>
                                </div>
                                <div style={{ justifyContent: "space-between", margin: "0.25rem" }}>
                                    <span className="body2" style={{ textAlign: "left", float: "left", width: "70%", color: ColorPicker.darkMediumEmphasis }}>{localeObj.international_purchases}</span>
                                    <span className="body2" style={{ textAlign: "right", float: "right", width: "30%", color: ColorPicker.darkHighEmphasis }}>{"R$ "}{invoiceData.internationalTotal}</span>
                                </div>
                                <div style={{ justifyContent: "space-between", margin: "0.25rem" }}>
                                    <span className="body2" style={{ textAlign: "left", float: "left", width: "70%", color: ColorPicker.darkMediumEmphasis }}>{localeObj.taxes}</span>
                                    <span className="body2" style={{ textAlign: "right", float: "right", width: "30%", color: ColorPicker.darkHighEmphasis }}>{"R$ "}{invoiceData.totalTax}</span>
                                </div>

                                {/*<div style={{ justifyContent: "space-between", margin: "0.25rem" }}>
                                <span className="body2" style={{ textAlign: "left", float: "left", width: "70%", color: ColorPicker.darkMediumEmphasis }}>{localeObj.prev_invoice_balance}</span>
                                <span className="body2" style={{ textAlign: "right", float: "right", width: "30%", color: ColorPicker.darkHighEmphasis }}>{"R$ "}{invoiceData.prevCredit}</span>
                            </div>
                            <hr className='hrTag'></hr>
                            <div style={{ justifyContent: "space-between", margin: "0.25rem" }}>
                                <span className="body2" style={{ textAlign: "left", float: "left", width: "70%", color: ColorPicker.darkMediumEmphasis }}>{localeObj.min_payment}</span>
                                <span className="body2" style={{ textAlign: "right", float: "right", width: "30%", color: ColorPicker.darkHighEmphasis }}>{"R$ "}{invoiceData.minPaymentAmount}</span>
                    </div>*/}
                                <hr className='hrTag'></hr>
                            </FlexView>
                        }
                        <TransactionHistoryDisplayGrid txn={transactionData} onSelectTransaction={this.onSelectTransaction} shouldShowAMountbreakup={shouldShowAMountbreakup()} />
                        {
                            !invoiceData.isFutureInvoice && invoiceData.invoiceStatus !== "paid" &&
                            <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                                <PrimaryButtonComponent btn_text={getPrimaryButtonText()} onCheck={this.onPrimary} />
                            </div>
                        }
                        <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                            {this.state.processing && <CustomizedProgressBars />}
                        </div>
                    </div >}
                {this.state.noInvoiceHistory &&
                    <NoInvoiceHistoryComponent msg={localeObj.no_invoice_history} />
                }
            </div>

        )
    }
}


ReceiptComp.propTypes = {
    componentName: PropTypes.string,
    payInvoice: PropTypes.func.isRequired,
    invoiceDetails: PropTypes.shape({
        invoiceData: PropTypes.shape({
            invoiceStatus: PropTypes.string.isRequired,
            formatted_amount: PropTypes.shape({
                formatted: PropTypes.string.isRequired,
                decimal: PropTypes.string.isRequired
            }).isRequired,
            dueDate: PropTypes.string.isRequired,
            paymentDate: PropTypes.string,
            isFutureInvoice: PropTypes.bool.isRequired,
            nationalTotal: PropTypes.number,
            internationalTotal: PropTypes.number,
            totalTax: PropTypes.number,
            prevCredit: PropTypes.number,
            minPaymentAmount: PropTypes.number,
            closeDate: PropTypes.object
        }).isRequired,
        transactionData: PropTypes.arrayOf(
            PropTypes.shape({
                dueDate: PropTypes.string.isRequired,
                amount: PropTypes.number.isRequired,
                // Add more specific PropTypes if needed for transaction details
            })
        ).isRequired
    }).isRequired,
    invoiceId: PropTypes.string.isRequired,
    invoiceMonthArray: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    onSelectTransaction: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
};
