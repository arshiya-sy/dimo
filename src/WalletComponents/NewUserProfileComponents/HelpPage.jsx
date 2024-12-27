import React from "react";
import PropTypes from "prop-types";
import "../../styles/main.css";
import "../../styles/help_text_styles.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState"
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import apiService from "../../Services/apiService";
import MetricServices from "../../Services/MetricsService";

import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";
import { CSSTransition } from 'react-transition-group';
import Drawer from '@material-ui/core/Drawer';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import FlexView from "react-flexview/lib";
import HelpParent from "./HelpComponents/HelpParent";
import HelpFaqSelected from "./HelpComponents/HelpFaqSelected";
import HelpQA from "./HelpComponents/HelpQA";
import HelpJson from "./HelpComponents/HelpJson";
import HelpTarrif from "./HelpComponents/HelpTrarrif";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";

const styles = {
    root: {
        color: ColorPicker.white
    },
    paper: InputThemes.singleInputStyle.paper
}

const theme2 = InputThemes.snackBarTheme;
const PageNameJSON = PageNames.helpComponent;
var localeObj = {};

class HelpPage extends React.Component {
    constructor(props) {
        super(props);
        this.componentName = "HelpPage";
        this.state = {
            snackBarOpen: false,
            message: "",
            help_state: "help_main",
            direction: "",
            bottomSheetEnabled: false,
            helpJson: new HelpJson([]),
            helpLoaded: false,
            faq: 0,
            tarrifData: "",
            timeData: "",
            processing: false,
            callingUrl: props?.location?.callingUrl ? props.location.callingUrl : "/myAccount",
            resumeState: props?.location?.resumeState ? props.location.resumeState : undefined
        }
        this.style = {
            underLine: {
                textDecorationLine: 'underline',
                marginTop: "1rem"
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            if (this.state.bottomSheetEnabled) {
                this.setState({ bottomSheetEnabled: false });
                Log.sDebug("Closing bottomsheet", this.componentName)
            } else {
                this.onBack();
            }
        }
        this.getFaqJson();
    }

    handleBottomSheet = val => () => {
        if (val) {
            Log.sDebug("Opening bottomSheet", this.componentName);
        } else {
            Log.sDebug("Closing bottomSheet", this.componentName)
        }
        this.setState({
            bottomSheetEnabled: val
        });
    }

    chatOption = () => {
        Log.sDebug("Opening chat", this.componentName);
        this.showSnackBar(localeObj.coming_soon);
    }

    getQuestions = (subThemeIdx) => {
        return this.state.helpJson.getQuestions(this.state.faq, subThemeIdx);
    }

    getFaqJson = () => {
        apiService.getHelpFaq(androidApiCalls.getLocale())
            .then(response => {
                if (response.status == 200) {
                    Log.sDebug("Success in getting faq json from backend", this.componentName)
                    this.setState({
                        helpJson: new HelpJson(response.data),
                        helpLoaded: true
                    })
                }
            }).catch(err => {
                Log.sDebug("Falied to get faq json", this.componentName, constantObjects.LOG_PROD)
                if (err.response) {
                    Log.sDebug("Falied to get faq json" + err.response.status, this.componentName, constantObjects.LOG_PROD)
                }
            });
    }

    getFaqAnswer = (questionCode) => {
        this.toggleProgressDialog();
        apiService.getFaqAnswer(androidApiCalls.getLocale(), questionCode)
            .then(response => {
                if (response.status == 200) {
                    Log.sDebug("Success in fetching faq answer for:" + questionCode, this.componentName);
                    this.toggleProgressDialog();
                    this.setState({
                        help_state: "qa_state",
                        direction: "left",
                        answer: response.data,
                    })
                }
            }).catch(err => {
                this.toggleProgressDialog();
                Log.sDebug("failed to fetch faq answer for:" + questionCode, this.componentName, constantObjects.LOG_PROD)
                this.showSnackBar(localeObj.no_answer)
                if (err.response) {
                    Log.sDebug("failed to fetch faq answer status: " + err.response.status, this.componentName, constantObjects.LOG_PROD);
                }
            });
    }

    toggleProgressDialog = () => {
        this.setState({
            processing: !this.state.processing
        })
    }

    showSnackBar = (msg) => {
        this.setState({
            snackBarOpen: true,
            message: msg
        })
    }

    closeSnackBar = () => {
        this.setState({
            snackBarOpen: false
        })
    }

    handleDialer = (phNum) => () => {
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.help_state], PageState.recent);
        androidApiCalls.startDialer(phNum);
    }

    onTransition = (transitInfo) => {
        let helpList;
        let Topic;
        Log.sDebug("Moving forward from state " + this.state.help_state, this.componentName);
        switch (this.state.help_state) {
            case "help_main":
                if (transitInfo.tarrif) {
                    this.changeRoute();
                } else {
                    this.setState({
                        faq: transitInfo.opt,
                        topic: transitInfo.topic,
                        subThemes: this.state.helpJson.getSubThemes(transitInfo.opt),
                        help_state: "faq_selected",
                        direction: "left"
                    })
                }
                break;
            case "faq_selected":
                helpList = this.state.helpJson.getFirstOrderIndexTopicMapping();
                Topic = helpList[this.state.faq];
                Log.sDebug("Topic is " + Topic + "select id is " + transitInfo.selectedId, this.componentName);
                if (transitInfo.showTime) {
                    this.getTime();
                } else {
                    const qId = this.state.helpJson.getQuestionId(this.state.faq, transitInfo.selectedId, transitInfo.questionId);
                    this.getFaqAnswer(qId);
                    this.setState({
                        subThemeIdx: transitInfo.selectedId,
                        questionIdx: transitInfo.questionId,
                        questionId: qId,
                        question: this.state.helpJson.getQuestion(this.state.faq, transitInfo.selectedId, transitInfo.questionId),
                    });
                }
                break;
        }
    }

    onBack = () => {
        Log.sDebug("Going back from state " + this.state.help_state, this.componentName);
        MetricServices.onPageTransitionStop(PageNameJSON[this.state.help_state], PageState.back);
        switch (this.state.help_state) {
            case "qa_state":
                this.setState({
                    help_state: "faq_selected",
                    direction: "right"
                })
                break;
            case "faq_selected":
                this.setState({
                    help_state: "help_main",
                    direction: "right"
                })
                break;
            case "help_main":
                this.props.history.replace({
                    pathname: this.state.callingUrl,
                    transition: "right",
                    state: this.state.resumeState
                })
                break;
            case "show_tarrif":
                this.setState({
                    help_state: "help_main",
                    direction: "right"
                })
                break;
            case "show_time":
                this.setState({
                    help_state: "faq_selected",
                    direction: "right"
                })
                break;
        }
    }

    changeRoute = () => {
        this.setState({
            processing: true
        })
        let locale = androidApiCalls.getLocale();
        apiService.getTarrifData(locale)
            .then(response => {
                if (response.status == 200) {
                    Log.sDebug("Success in getting tarrif data from backend", this.componentName);
                    this.setState({
                        processing: false,
                        tarrifData: response.data,
                        help_state: "show_tarrif",
                        direction: "left"
                    })
                }
            }).catch(err => {
                Log.sDebug("Falied to get tarrif data", this.componentName, constantObjects.LOG_PROD)
                if (err.response) {
                    Log.sDebug("Falied to get tarrif data" + err.response.status, this.componentName, constantObjects.LOG_PROD)
                }
            });
    }

    getTime = () => {
        this.setState({
            processing: true
        })
        let locale = androidApiCalls.getLocale();
        apiService.getTimeData(locale)
            .then(response => {
                if (response.status == 200) {
                    Log.sDebug("Success in getting payment time data from backend", this.componentName);
                    this.setState({
                        processing: false,
                        timeData: response.data,
                        help_state: "show_time",
                        direction: "left"
                    })
                }
            }).catch(err => {
                Log.sDebug("Falied to get payment time data", this.componentName, constantObjects.LOG_PROD)
                if (err.response) {
                    Log.sDebug("Falied to get payment time data" + err.response.status, this.componentName, constantObjects.LOG_PROD)
                }
            });
    }

    handleOpenWhatApp = () => {
        androidApiCalls.openUrlInBrowserLegacy("https://api.whatsapp.com/send?phone=" + constantObjects.customerCareWADialer);
    }

    render() {
        const { classes } = this.props;
        const firstOrderMapping = this.state.helpJson.getFirstOrderIndexTopicMapping();
        Log.sDebug("current State " + this.state.help_state, this.componentName);

        return (
            <FlexView column>
                <div style={{ overflowY: "scroll", height: "50%" }}>
                    <ButtonAppBar header={localeObj.help_txt} onBack={this.onBack} action="none" />
                    {this.state.help_state === "help_main" &&
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={this.state.help_state === "help_main" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div style={{ display: this.state.help_state === "help_main" ? 'block' : 'none' }}>
                                {this.state.help_state === "help_main" && <HelpParent onTransition={this.onTransition} firstOrderList={firstOrderMapping} />}
                            </div>
                        </CSSTransition>
                    }
                    {this.state.help_state === "faq_selected" &&
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={this.state.help_state === "faq_selected" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div style={{ display: this.state.help_state === "faq_selected" ? 'block' : 'none' }}>
                                {this.state.help_state === "faq_selected" && <HelpFaqSelected onTransition={this.onTransition}
                                    theme={firstOrderMapping[this.state.faq]} topic={this.state.topic}
                                    subThemes={this.state.subThemes}
                                    getQuestions={this.getQuestions} />}
                            </div>
                        </CSSTransition>
                    }
                    {this.state.help_state === "qa_state" &&
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={this.state.help_state === "qa_state" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div style={{ display: this.state.help_state === "qa_state" ? 'block' : 'none' }}>
                                {this.state.help_state === "qa_state" && <HelpQA question={this.state.question} theme={firstOrderMapping[this.state.faq]} answer={this.state.answer} link={this.changeRoute} />}
                            </div>
                        </CSSTransition>
                    }
                    {this.state.help_state === "show_tarrif" &&
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={this.state.help_state === "show_tarrif" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div style={{ display: this.state.help_state === "show_tarrif" ? 'block' : 'none' }}>
                                {this.state.help_state === "show_tarrif" && <HelpTarrif tarrifDetails={this.state.tarrifData} componentName={PageNameJSON["show_tarrif"]} />}
                            </div>
                        </CSSTransition>
                    }
                    {this.state.help_state === "show_time" &&
                        <CSSTransition mountOnEnter={true} unmountOnExit={true}
                            in={this.state.help_state === "show_time" && !this.state.processing ? true : false} timeout={300}
                            classNames={this.state.direction === "right" ? "pageSliderRight" : "pageSliderLeft"} >
                            <div style={{ display: this.state.help_state === "show_time" ? 'block' : 'none' }}>
                                {this.state.help_state === "show_time" && <HelpTarrif tarrifDetails={this.state.timeData} componentName={PageNameJSON["show_time"]} />}
                            </div>
                        </CSSTransition>
                    }
                    {this.state.processing && <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                        <CustomizedProgressBars />
                    </div>}
                </div>
                {this.state.helpLoaded &&
                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                        { /*<PrimaryButtonComponent btn_text={localeObj.chat} onCheck={this.chatOption} /> */}
                        <div className="body2 highEmphasis" style={{ marginTop: "1.5rem", display: !(this.state.processing) ? 'block' : 'none' }} onClick={this.handleBottomSheet(true)}>{localeObj.call_customerCare}</div>
                    </div>
                }
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer
                        anchor="bottom"
                        open={this.state.bottomSheetEnabled}
                        onOpen={this.handleBottomSheet(true)}
                        onClose={this.handleBottomSheet(false)}
                        onBackdropClick={this.handleBottomSheet(false)}
                        classes={{ paper: classes.paper }}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ textAlign: "center", marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis">
                                    {localeObj.help_customer_care}
                                </div>
                                <div className="body2 highEmphasis" style={{ marginTop: "1rem" }}>
                                    {localeObj.help_contact_cc}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ marginTop: "1rem", color: ColorPicker.textDisabledColor }}>
                                    {localeObj.cc_timings}
                                </div>
                                <div onClick={this.handleOpenWhatApp}>
                                    <div className="subtitle4" style={{ marginTop: "2.5rem", color: ColorPicker.customerCarelinkColor }}>
                                        {localeObj.cc_whatsapp}
                                    </div>
                                    <div className="body2" style={{ marginTop: "0.5rem", color: ColorPicker.numberDisabledColor }}>
                                        {constantObjects.customerCareWADisplay}
                                    </div>
                                </div>
                                <div onClick={this.handleDialer(constantObjects.customerCarePhoneNumberDialer)}>
                                    <div className="subtitle4" style={{ marginTop: "2rem", color: ColorPicker.customerCarelinkColor }}>
                                        {localeObj.cc_call_us}
                                    </div>
                                    <div className="body2" style={{ marginTop: "0.5rem", color: ColorPicker.numberDisabledColor }}>
                                        {constantObjects.customerCarePhoneNumberDisplay}
                                    </div>
                                </div>
                                <div className="body2 highEmphasis" style={{ marginTop: "4rem" }} onClick={this.handleBottomSheet(false)}>
                                    {localeObj.cancel}
                                </div>
                            </FlexView>
                        </div>
                    </Drawer>
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </FlexView>
        )
    }
}

HelpPage.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HelpPage);
