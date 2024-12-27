import React from "react";
import FlexView from "react-flexview";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import PropTypes from 'prop-types';
import increaseLimitSuccess from "../../../images/SpotIllustrations/Success.png";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';
import ArrowIcon from '@mui/icons-material/ArrowForwardIos';
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ColorPicker from '../../../Services/ColorPicker';
import localeService from "../../../Services/localeListService";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';


const theme1 = createTheme({
    overrides: {
        MuiSelect: {
            select: {
                "&:focus": {
                    background: ""
                }
            }
        },
        MuiInput: {
            underline: {
                '&:hover:not($disabled):not($focused):not($error):before': {
                    borderBottom: "2px solid #00BCE3",
                }, '&:after': {
                    borderBottom: "2px solid #00BCE3"
                }
            },
        },
        MuiSwitch: {
            root : {
                "&$checked": {
                    color: "#0195BA"
                },
            }
        }
    }
});

var localeObj = {};

class CreditCardIncreaseLimitPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            localeObj: [],
            progressBar: false,
            confirmationScreen: false
        };
        this.styles = {
            cardStyle: {
                width: "100%",
                borderRadius: "1.25rem",
                backgroundColor: ColorPicker.newProgressBar
            },
            textStyle: {
                margin: "0 2rem",
                textAlign: "center"
            },
            subTextStyle: {
                margin: "1rem 3rem",
                textAlign: "center"
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

    goToCreditCardCreditLimitIncreasePage = () => {
        this.props.history.replace({ pathname: "/creditCardHomePage", transition: "left" });
    }

    goToCreditCardCreditSettingsPage = () => {
        this.props.history.replace({
            pathname: "/creditCardSettingsPage",
            transition: "right"
        });
    }

    submitReason = (message) => {
        this.showProgressDialog();
        arbiApiService.updateCreditCardIncreaseCreditLimit(message).then(response => {
            this.hideProgressDialog();
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processCreditCardIncreaseCreditLimit(response.result);
                if (processorResponse.success) {
                    this.setState({
                        confirmationScreen: true
                    });
                }
            }
        });
    }

    render() {
        const finalHeight = window.screen.screenHeight;
        return (
            <div style={{ height: "100%", width: "100%" }}>
                <div style={{ display: (this.state.progressBar ? 'block' : 'none') }}>
                    {this.state.progressBar && <CustomizedProgressBars></CustomizedProgressBars>}
                </div>
                {!this.state.progressBar && !this.state.confirmationScreen && <div style={{ display: (!this.state.progressBar ? 'block' : 'none') }}>
                    <ButtonAppBar onBack={this.goToCreditCardCreditLimitIncreasePage} action="none" />
                    <div className="headline5 highEmphasis" style={{ display: 'block', marginTop: '1.5rem', marginLeft: '1.5rem', marginBottom: '1.5rem', textAlign: "left" }}>
                        {localeObj.increase_limit_header}
                    </div>
                    <MuiThemeProvider theme={theme1}>
                        <FlexView column style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <List style={{ width: "100%", height: "100%" }}>
                                <ListItem button onClick={() => this.submitReason(localeObj.increase_limit_reason_1)}>
                                    <ListItemText>
                                        <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                            <span className="subtitle4 highEmphasis" >{localeObj.increase_limit_reason_1}</span>
                                        </div>
                                    </ListItemText>
                                    <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                </ListItem>
                            </List>
                            <List style={{ width: "100%", height: "100%" }}>
                                <ListItem button onClick={() => this.submitReason(localeObj.increase_limit_reason_2)}>
                                    <ListItemText>
                                        <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                            <span className="subtitle4 highEmphasis" >{localeObj.increase_limit_reason_2}</span>
                                        </div>
                                    </ListItemText>
                                    <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                </ListItem>
                            </List>
                            <List style={{ width: "100%", height: "100%" }}>
                                <ListItem button onClick={() => this.submitReason(localeObj.increase_limit_reason_3)}>
                                    <ListItemText>
                                        <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                            <span className="subtitle4 highEmphasis" >{localeObj.increase_limit_reason_3}</span>
                                        </div>
                                    </ListItemText>
                                    <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                </ListItem>
                            </List>
                            <List style={{ width: "100%", height: "100%" }}>
                                <ListItem button onClick={() => this.submitReason(localeObj.increase_limit_reason_4)}>
                                    <ListItemText>
                                        <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                            <span className="subtitle4 highEmphasis" >{localeObj.increase_limit_reason_4}</span>
                                        </div>
                                    </ListItemText>
                                    <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                </ListItem>
                            </List>
                            <List style={{ width: "100%", height: "100%" }}>
                                <ListItem button onClick={() => this.submitReason(localeObj.increase_limit_reason_5)}>
                                    <ListItemText>
                                        <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                            <span className="subtitle4 highEmphasis" >{localeObj.increase_limit_reason_5}</span>
                                        </div>
                                    </ListItemText>
                                    <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                </ListItem>
                            </List>
                            <List style={{ width: "100%", height: "100%" }}>
                                <ListItem button onClick={() => this.submitReason(localeObj.increase_limit_reason_6)}>
                                    <ListItemText>
                                        <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                            <span className="subtitle4 highEmphasis" >{localeObj.increase_limit_reason_6}</span>
                                        </div>
                                    </ListItemText>
                                    <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                </ListItem>
                            </List>
                        </FlexView>
                    </MuiThemeProvider>
                </div>}
                {!this.state.progressBar && this.state.confirmationScreen &&
                    <div className="scroll" style={{ height: `${finalHeight * 0.9}px`, overflowY: "auto", overflowX: "hidden" }}>
                        <ButtonAppBar onCancel={this.goToCreditCardCreditSettingsPage} action="cancel" />
                        <div style={{ marginBottom: "0.5rem", textAlign: "center" }}>
                            <span>
                                <img style={{ width: '12rem', marginTop: "2.5rem" }} src={increaseLimitSuccess} alt="" />
                            </span>
                        </div>
                        <div style={this.styles.textStyle}>
                            <span className="headline5 highEmphasis">
                                {localeObj.increase_limit_success_header}
                            </span>
                        </div>
                        <div style={this.styles.subTextStyle}>
                            <span className="body2 highEmphasis">
                                {localeObj.increase_limit_success_footer}
                            </span>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

CreditCardIncreaseLimitPage.propTypes = {
    history: PropTypes.object.isRequired,
};

export default CreditCardIncreaseLimitPage;