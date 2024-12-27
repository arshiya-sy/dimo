import React from "react";
import FlexView from "react-flexview";
import PropTypes from 'prop-types';
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import CircleIcon from '@mui/icons-material/Circle';
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import ColorPicker from '../../../Services/ColorPicker';
import localeService from "../../../Services/localeListService";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import InputThemes from "../../../Themes/inputThemes";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import ActionButtonComponent from "../../CommonUxComponents/ActionButton";
import travelNoticeIcon from "../../../images/SvgUiIcons/CreditCardTravelNotice.svg";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";

var localeObj = {};

class CreditCardChangeTravelNoticeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            progressBar: false,
            openBottomSheetTravelNoticeChange: false
        };
        this.styles = {
            textStyle: {
                margin: "1rem",
                textAlign: 'center'
            },
            cardStyle: {
                width: "100%",
                borderRadius: "1.25rem",
                backgroundColor: ColorPicker.newProgressBar
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    showProgressDialog = () => {
        this.setState({
            progressBar: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            progressBar: false
        })
    }

    toggleShowMoreDetails = () => {
        this.setState({
            showMoreDetails: !this.state.showMoreDetails
        })
    }

    goToCreditCardHomePage = () => {
        this.props.history.replace({ pathname: "/creditCardHomePage", transition: "left" });
    }

    changeTravelNotice = () => {
        let newSwitchVal = !this.state.checkedTravelNotice;
        this.setState({
            checkedTravelNotice: !newSwitchVal
        });
    }

    changeContactlessPayment = () => {
        let newSwitchVal = !this.state.checkedContactlessPayment;
        this.setState({
            checkedContactlessPayment: !newSwitchVal
        });
    }

    changeAutomaticDebit = () => {
        let newSwitchVal = !this.state.checkedAutomaticDebit;
        this.setState({
            checkedAutomaticDebit: !newSwitchVal
        });
    }

    changeBlockCard = () => {
        let newSwitchVal = !this.state.checkedBlockCard;
        this.setState({
            checkedBlockCard: !newSwitchVal
        });
    }

    changeInvoiceDueDate = () => {
        this.props.history.replace({ pathname: "/creditCardChangeDueDatePage", transition: "left" });
    }

    toggleSwitch = (event) => {
        let selectedVal = event.target.value;
        this.setState({
            travelNoticeCheck: selectedVal
        });
    }

    handleSubmitBtn = () => {

    }

    handleCancelBtn = () => {

    }
    render() {
        const finalHeight = window.screen.availHeight;
        return (
            <div style={{ height: "100%", width: "100%" }}>
                <div style={{ display: (this.state.progressBar ? 'block' : 'none') }}>
                    {this.state.progressBar && <CustomizedProgressBars></CustomizedProgressBars>}
                </div>
                {<div style={{ display: (!this.state.progressBar ? 'block' : 'none') }}>
                    <ButtonAppBar header={localeObj.travel_notice} onBack={this.goToCreditCardSettingsPage} action="none" />
                    <FlexView column className="scroll" style={{ height: `${finalHeight * 0.75}px`, overflowY: "auto", overflowX: "hidden" }}>
                        <div style={{ marginBottom: "1rem", textAlign: "center" }}>
                            <span>
                                <img style={{ width: '6rem', height: '6rem', marginTop: "2.5rem" }} src={travelNoticeIcon} alt="" />
                            </span>
                        </div>
                        <div style={this.styles.textStyle}>
                            <span className="headline5 highEmphasis">
                                {localeObj.travel_notice}
                            </span>
                        </div>
                        <div style={{ marginTop: "1rem", textAlign: "center" }}>
                            <div style={{ marginRight: "1rem" }}>
                                <CircleIcon fontSize="small" style={{ color: this.props.travelNoticeStatus === "activate" ? ColorPicker.transactionGreen : ColorPicker.errorRed }} />
                            </div>
                            <ActionButtonComponent
                                variant="outlined"
                                btn_text={this.props.travelNoticeStatus === "activate" ? localeObj.travel_notice_activated : localeObj.travel_notice_deactivated}
                                disabled={true}
                            />
                        </div>
                        <div style={InputThemes.initialMarginStyle}>
                            <Card align="center" style={this.styles.cardStyle} elevation="0">
                                <CardContent>
                                    <FlexView>
                                        <div style={{ float: 'right', textAlign: "right" }}>
                                            <span className="subtitle3 highEmphasis">{localeObj.visa_credit}</span>
                                        </div>
                                        <div style={{ float: 'right', textAlign: "right" }}>
                                            <span className="subtitle4 highEmphasis">{"end 5678"}</span>
                                        </div>
                                    </FlexView>
                                </CardContent>
                            </Card>
                        </div>
                        <div>
                            <FlexView align="left" style={{ marginTop: "0.5rem" }}>
                                <span className="subtitle3 highEmphasis">{localeObj.travel_notice_subtext_1}</span>
                            </FlexView>
                            <Card align="center" style={this.styles.cardStyle} elevation="0">
                                <CardContent>
                                    <FlexView>
                                        <FlexView align="left" style={{ marginTop: "1.2rem" }}>
                                            <span className="subtitle3 highEmphasis">{localeObj.from}</span>
                                        </FlexView>
                                        <FlexView align="right" style={{ marginTop: '1rem' }}>
                                            <div style={{ borderleft: '2px solid transparent', display: 'flex' }}></div>
                                            <span className="subtitle3 highEmphasis">{localeObj.to}</span>
                                        </FlexView>
                                    </FlexView>
                                </CardContent>
                            </Card>
                        </div>
                    </FlexView>
                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                        <div className="body2 highEmphasis" style={{ textAlign: "center", position: "fixed", bottom: "11rem", margin: "1rem" }}>
                            {localeObj.travel_notice_subtext_2}
                        </div>
                        <PrimaryButtonComponent btn_text={localeObj.travel_notice_activate_button} onCheck={this.handleSubmitBtn} />
                        <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.handleCancelBtn} />
                    </div>
                </div>}
            </div>
        );
    }
}

CreditCardChangeTravelNoticeComponent.propTypes = {
    travelNoticeStatus: PropTypes.string,
    history: PropTypes.object
  };

export default CreditCardChangeTravelNoticeComponent;