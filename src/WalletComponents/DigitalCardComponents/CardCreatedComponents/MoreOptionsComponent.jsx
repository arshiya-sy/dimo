import React from "react";
import FlexView from "react-flexview";
import PropTypes from 'prop-types';
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { MuiThemeProvider, createTheme, withStyles } from '@material-ui/core/styles';
import ArrowIcon from '@mui/icons-material/ArrowForwardIos';
import Switch from "@material-ui/core/Switch";
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import ColorPicker from '../../../Services/ColorPicker';
import localeService from "../../../Services/localeListService";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from "../../../Services/Constants";
import InputThemes from "../../../Themes/inputThemes";
import PageNames from "../../../Services/PageNames";
import MetricsService from "../../../Services/MetricsService";
import PageState from "../../../Services/PageState";

const theme2 = InputThemes.snackBarTheme;

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
            root: {
                "&$checked": {
                    color: "#0195BA"
                },
            }
        }
    }
});

const SwitchStyle = withStyles({
    switchBase: {
        width: "1.5rem",
        color: ColorPicker.buttonAccent,
        '&$checked': {
            color: ColorPicker.buttonAccent,
        },
        '&$checked + $track': {
            backgroundColor: ColorPicker.newProgressBar,
        },
    },
    checked: {},
    track: {},
})(Switch);

const stylePaper = () => ({
    paper: {
        borderTopLeftRadius: "1.25rem",
        borderTopRightRadius: "1.25rem",
        backgroundColor: ColorPicker.newProgressBar
    }
});

var localeObj = {};


class MoreOptionsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            progressBar: false,
            bottomSheetForContactlesspayments: false,
            checkedContactlessPayment: false,
            creditCardContactlessPayment: this.props.contactlessPayments,
            bottomSheetForError: false
        };
        this.styles = {
            textStyle: {
                margin: "1rem"
            },
            cardStyle: {
                width: "90%",
                borderRadius: "1.25rem",
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: "-1rem",
                backgroundColor: ColorPicker.newProgressBar
            },
            listItemStyle: {
                width: "100%",
                borderRadius: "0.5rem",
                margin: "0 1rem"
            },
            imgStyle: {
                height: "1.5rem",
                width: "1.5rem",
                padding: "1rem"
            },
            circle: {
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: ColorPicker.newProgressBar,
                width: "3rem",
                height: "3rem"
            }
        }
        this.componentName = PageNames["CreditCardComponents"]["more_options_component"]
        MetricsService.onPageTransitionStart(this.componentName);
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        window.onBackPressed = () => {
            this.back();
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

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    goToCreditCardHomePage = () => {
        MetricsService.onPageTransitionStop(this.componentName, PageState.close);
        this.props.onBackHome();
    }

    back = () => {
        if (this.state.bottomSheetForContactlesspayments === true) {
            this.handleCancelContactlessPayment();
        } else {
            MetricsService.onPageTransitionStop(this.componentName, PageState.close);
            this.props.onBackHome();
        }
    }

    ConfirmContactlessPayment = () => {
        let newSwitchVal = this.state.creditCardContactlessPayment
        this.showProgressDialog();
        arbiApiService.updateCreditCardContactlessPayments(!newSwitchVal, this.props.cardNumber, this.componentName).then(response => {
            if (response.success) {
                let processorResponse = ArbiResponseHandler.processUpdateCreditCardContactlessPayments(response.result);
                if (processorResponse.success) {
                    this.setState({
                        creditCardContactlessPayment: !newSwitchVal,
                        bottomSheetForContactlesspayments: false,
                        progressBar: false
                    });
                    if (!newSwitchVal) {
                        this.openSnackBar(localeObj.contactless_payments_success_activation_message);
                    } else {
                        this.openSnackBar(localeObj.contactless_payments_success_deactivation_message);
                    }
                } else {
                    this.setState({
                        progressBar: false,
                        bottomSheetForError: true,
                        bottomSheetErrorMessage: processorResponse.result.mensagem,
                        bottomSheetForContactlesspayments: false
                    })
                    //Log.sDebug("updateCreditCardContactlessPayments, Error getting credit card deatils");
                }
            } else {
                this.hideProgressDialog();
                this.setState({
                    bottomSheetForContactlesspayments: false
                });
                //Log.sDebug("updateCreditCardContactlessPayments failed");
            }
        });
    }

    changeContactlessPayment = () => {
        this.setState({
            bottomSheetForContactlesspayments: true
        });
    }

    handleCancelContactlessPayment = () => {
        this.setState({
            bottomSheetForContactlesspayments: false
        });
    }

    toggleSwitch = (event) => {
        let selectedVal = event.target.value;
        this.setState({
            travelNoticeCheck: selectedVal
        });
    }

    closeDrawer = () => {
        this.setState({
            bottomSheetForError: false
        });
    }

    render() {
        const { classes } = this.props;
        const finalHeight = window.screen.screenHeight;

        return (
            <div style={{ height: `${finalHeight}px` }}>
                <div style={{ display: (this.state.progressBar ? 'block' : 'none') }}>
                    {this.state.progressBar && <CustomizedProgressBars></CustomizedProgressBars>}
                </div>
                {!this.state.progressBar &&
                    <div style={{ display: (!this.state.progressBar ? 'block' : 'none') }}>
                        <ButtonAppBar header={localeObj.more_card_options} onBack={this.back} action="none" />
                        <MuiThemeProvider theme={theme1}>
                            <FlexView column style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <List style={{ width: "100%", height: "100%" }}>
                                    <ListItem button>
                                        <ListItemText>
                                            <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                                <span className="subtitle4 highEmphasis" >{localeObj.contactless_payment}</span>
                                                <div className="body2 mediumEmphasis">{this.state.creditCardContactlessPayment === true ? localeObj.enabled : localeObj.disabled}</div>
                                            </div>
                                        </ListItemText>
                                        <FlexView>
                                            <span style={{ textAlign: "right" }}>
                                                <SwitchStyle checked={this.state.creditCardContactlessPayment} onChange={() => this.changeContactlessPayment()} />
                                            </span>
                                        </FlexView>
                                    </ListItem>
                                </List>
                                <List style={{ width: "100%", height: "100%" }}>
                                    <ListItem button onClick={() => this.props.moreOptionsRequestSecondCopy()}>
                                        <ListItemText>
                                            <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                                <span className="subtitle4 highEmphasis" >{localeObj.request_second_copy}</span>
                                                <div className="body2 mediumEmphasis">{localeObj.request_second_copy_subtext}</div>
                                            </div>
                                        </ListItemText>
                                        <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                    </ListItem>
                                </List>
                                <List style={{ width: "100%", height: "100%" }}>
                                    <ListItem button onClick={() => this.props.moreOptionsCancelCard()}>
                                        <ListItemText>
                                            <div style={{ marginLeft: "1rem", textAlign: "left" }}>
                                                <span className="subtitle4 highEmphasis" >{localeObj.cancel_card}</span>
                                                <div className="body2 mediumEmphasis">{localeObj.cancel_card_subtext}</div>
                                            </div>
                                        </ListItemText>
                                        <ArrowIcon style={{ fill: ColorPicker.accent, marginRight: "1rem", fontSize: "1rem" }} />
                                    </ListItem>
                                </List>
                            </FlexView>
                        </MuiThemeProvider>
                        <MuiThemeProvider theme={theme2}>
                            <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SHORT_SNACK_DURATION} onClose={this.closeSnackBar}>
                                <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                            </Snackbar>
                        </MuiThemeProvider>
                        <Drawer
                            anchor="bottom"
                            open={this.state.bottomSheetForContactlesspayments}
                            classes={{ paper: classes.paper }}>
                            <div style={{ margin: "1.5rem" }} >
                                <div style={{ marginTop: "0.5rem" }} >
                                    <span className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                        {localeObj.contactless_payments_header}
                                    </span>
                                </div>
                                <div style={{ marginTop: "1rem" }}>
                                    <span className="body2 mediumEmphasis" style={{ textAlign: "center" }}>
                                        {localeObj.contactless_payments_footer}
                                    </span>
                                </div>
                                <div style={{ width: "100%", marginTop: "1.5rem" }}>
                                    <PrimaryButtonComponent className="body1 highEmphasis" btn_text={this.state.creditCardContactlessPayment ? localeObj.contactless_payments_button_deactivate : localeObj.contactless_payments_button_activate} onCheck={this.ConfirmContactlessPayment} />
                                    <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.handleCancelContactlessPayment} />
                                </div>
                            </div>
                        </Drawer>
                        <Drawer
                            anchor="bottom"
                            open={this.state.bottomSheetForError}
                            onClose={this.handleDueDateFailedMessageClose}
                            disableDiscovery={true}
                            disableSwipeToOpen={true}
                            classes={{ paper: classes.paper }}>
                            <div onKeyDown={this.handleDueDateFailedMessageClose} style={{ margin: "1.5rem" }} >
                                <div style={{ marginTop: "0.5rem" }} >
                                    <span className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                        {this.state.bottomSheetErrorMessage}
                                    </span>
                                </div>
                                <div style={{ width: "100%", marginTop: "1.5rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    <PrimaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.ok} onCheck={this.closeDrawer} />
                                </div>
                            </div>
                        </Drawer>
                    </div>}
            </div>
        );
    }
}

MoreOptionsComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    cardNumber: PropTypes.number.isRequired,
    contactlessPayments: PropTypes.bool.isRequired,
    onBackHome: PropTypes.func.isRequired,
    moreOptionsRequestSecondCopy: PropTypes.func.isRequired,
    moreOptionsCancelCard: PropTypes.func.isRequired
};

export default withStyles(stylePaper)(MoreOptionsComponent);