import React from "react";
import PropTypes from "prop-types";
import "../../../styles/main.css";
import "../../../styles/help_text_styles.css";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { withStyles } from "@material-ui/core/styles";
import ColorPicker from "../../../Services/ColorPicker";
import Log from "../../../Services/Log";
import FlexView from "react-flexview";

const styles = {
    iconStyle: {
        color: ColorPicker.accent,
        fontSize: "1rem"
    },
};
var parts = "";
var match = "";
var localeObj = {};

const helpPageName = PageNames.helpComponent.faq_selected;

class HelpFaqSelected extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            message: "",
            selectedIndex: "",
            selectedOption: "",
        };
        this.style = {
            underLine: {
                borderBottomStyle: "solid",
                width: "fit-content",
                borderBottomWidth: "1.5px"
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(helpPageName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(helpPageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(helpPageName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    onSelectOption = (opt, index) => () => {
        Log.sDebug("Sub-Topic selected: " + opt, "HelpFaqSelected")
        let faqHeader = this.props.theme;
        if ((faqHeader === "Transactions" || faqHeader === "Transações") && index === 6) {
            MetricServices.onPageTransitionStop(helpPageName, PageState.close);
            this.props.onTransition({ showTime: true });
        } else {
            const newVal = this.state.selectedIndex === index ? "" : index
            this.setState({
                selectedIndex: newVal
            })
        }
    }

    onSelectedQuestion = (question, index) => () => {
        Log.sDebug("Question selected: " + question, "HelpFaqSelected");
        MetricServices.onPageTransitionStop(helpPageName, PageState.close);
        this.props.onTransition({ showTime: false, selectedId: this.state.selectedIndex, questionId: index });
    }

    complaint = () => {
        this.setState({ showComplaint: true })
    }

    read = () => {
        MetricServices.onPageTransitionStop(helpPageName, PageState.recent);
        androidApiCalls.openUrlInBrowser("https://www.bcb.gov.br/acessoinformacao/registrar_reclamacao");
    }

    render() {
        const screenHeight = window.screen.height;
        const faqHeader = this.props.theme
        const faqTopics = this.props.subThemes

        let regex = new RegExp(localeObj.comp_url, "gi");
        if (localeObj.comp_pix) {
            match = localeObj.comp_pix.match(regex);
            if (match != null) {
                parts = localeObj.comp_pix.split(match[0], 2);
            }
        }

        return (
            <div style={{ display: "flex", flexDirection: "column", overflowY: "auto", height: `${(0.72) * screenHeight}px`, overflowX: "hidden" }}>
                <div style={{ marginLeft: "1.5rem", display: this.state.showComplaint ? "none" : "block" }}>
                    <FlexView column align="left" style={{ marginTop: "2rem", marginBottom: "1rem" }}>
                        <div className="headline6 highEmphasis" style={{ marginBottom: "1rem", textTransform: "capitalize" }}>{faqHeader}</div>
                        <List disablePadding>
                            {
                                faqTopics.map((opt, index) => (
                                    <div key={index}>
                                        <ListItem disableGutters onClick={this.onSelectOption(opt, index)}>
                                            <ListItemText align="left" className="body1 highEmphasis" primary={opt} style={{ width: "80%" }} />
                                            <span style={{ marginRight: "8%" }}>
                                                <ArrowForwardIosIcon fontSize='small' style={this.state.selectedIndex !== index ? styles.iconStyle : { ...styles.iconStyle, transform: "rotate(90deg)" }} />
                                            </span>
                                        </ListItem>
                                        {this.state.selectedIndex === index && this.props.getQuestions(this.state.selectedIndex).map((qchild, qindex) => (
                                            <ListItem dense disableGutters key={qindex} onClick={this.onSelectedQuestion(qchild, qindex)}>
                                                <ListItemText align="left" className="body2 mediumEmphasis" primary={qchild} style={{ marginRight: "1rem" }} />
                                            </ListItem>
                                        ))}
                                    </div>
                                ))
                            }
                        </List>
                        {this.props.topic === "Pix" &&
                            <div className="body1 highEmphasis" style={{ marginTop: "1.5rem" }} onClick={() => this.complaint()}>{localeObj.complaint_register}</div>
                        }
                    </FlexView>
                </div>
                <div style={{ margin: "0 1.5rem", display: this.state.showComplaint ? "block" : "none" }}>
                    <FlexView column align="left" style={{ marginTop: "2rem", marginBottom: "1rem" }}>
                        <div className="headline6 highEmphasis" style={{ marginBottom: "1rem", textTransform: "capitalize" }}>{localeObj.complaint_register}</div>
                        <div className="body1 mediumEmphasis" style={{ marginBottom: "1rem", textTransform: "capitalize" }}>{localeObj.comp_suport}</div>
                        <div className="body1 mediumEmphasis">
                            <span>
                                {parts[0]}
                                <span style={this.style.underLine} onClick={() => this.read()}>{match[0]}</span>
                                {parts[1]}
                            </span>
                        </div>
                    </FlexView>
                </div>
            </div>
        )
    }
}

HelpFaqSelected.propTypes = {
    theme: PropTypes.object,
    subThemes: PropTypes.object,
    onTransition: PropTypes.func,
    topic: PropTypes.string,
    getQuestions: PropTypes.func,
};

export default withStyles(styles)(HelpFaqSelected);