import React from 'react';
import FlexView from 'react-flexview';
import "../../../styles/main.css";
import "../../../styles/help_text_styles.css";
import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import MetricServices from "../../../Services/MetricsService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import localeService from "../../../Services/localeListService";
import PropTypes from "prop-types";

const helpPageName= PageNames.helpComponent.qa_state;
var localeObj = {};

class HelpQA extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          answer : this.props.answer,
          hyperlink: false,
          arrayString: [],
          data: "",
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(helpPageName);
    }
    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        this.checkHyperLink();
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
    
    checkHyperLink=()=> {
        let link="";
        let arrayStringSplit= this.props.answer;
        let anwerStr = this.props.answer;
        let urlCheck = new RegExp('(?<https>(https:[/][/]|www.)([a-z]|[A-Z]|[0-9]|[/._-]|[~])*)');
        if (urlCheck.test(anwerStr)) {
            link= urlCheck.exec(anwerStr)[0];
            arrayStringSplit = anwerStr.split(link);
            this.setState({
                hyperlink: true,
                arrayString: arrayStringSplit,
                data: link
            })
        }
    }
    goToLink=()=> {
        MetricServices.onPageTransitionStop(helpPageName, PageState.recent);
        this.props.link();
    }

    render() {

        const getTheme= ()=> {
            if(this.props.theme === "Tarifas" || this.props.theme === "Tariffs") {
                return true;
            } else {
                return false;
            }
        }

        return (
            <FlexView column style={{margin:"1.5rem", marginBottom:"0"}}>
                <div className="headline6 highEmphasis" style={{ textAlign: "left", marginBottom:"1.5rem"}}>
                    {this.props.question}
                </div>
                <div className="body2 mediumEmphasis" style={{display: !this.state.hyperlink ? "block" : "none", textAlign: "left"}}>
                    {this.props.answer}
                </div>
                <div style={{display: (this.state.hyperlink && getTheme()) ? "block" : "none", textAlign: "left"}}>
                <span className="body2 mediumEmphasis">
                        {this.state.arrayString[0]+" "}
                        <span className="body2 mediumEmphasis" style={{textDecorationLine: "underline"}} onClick={this.goToLink}>{localeObj.click_here}</span>
                        {" " + this.state.arrayString[1]}
                    </span>
                </div>
                <div style={{display: (this.state.hyperlink && !getTheme()) ? "block" : "none", textAlign: "left"}}>
                <span className="body2 mediumEmphasis">
                        {this.state.arrayString[0]+" "}
                        <a href={this.state.data} className="body2 mediumEmphasis">{this.state.data}</a>
                        {" " + this.state.arrayString[1]}
                    </span>
                </div>
            </FlexView>
        )
    }
}
HelpQA.propTypes = {
    answer: PropTypes.string,
    link: PropTypes.func,
    theme: PropTypes.object,
    question: PropTypes.object,
};
export default HelpQA;