import React from "react";
import "../../styles/main.css";
import PropTypes from "prop-types";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';

import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import ColorPicker from "../../Services/ColorPicker";
import InputThemes from "../../Themes/inputThemes";
import MetricServices from "../../Services/MetricsService";
import PageState from "../../Services/PageState";

export default class ShowOnboardingSections extends React.Component {

    constructor(props) {
        super(props);
        this.type = this.props.payload.type;
        this.title = this.props.payload.title;
        this.listOfSections = this.props.payload.listOfSections;
        this.bottomHeader = this.props.payload.bottomHeader;
        this.buttonText = this.props.payload.buttonText;
        this.bottomText = this.props.payload.bottomText;
        if(this.props.componentName){
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "ShowOnboardingSections";
        }

        this.style = {
            blockStyle: {
                marginLeft: "10%",
                marginRight: "10%",
                marginTop: "10%"
            },
            section: {
                display: "flex",
                alignItems: "center",
                marginBottom: "5%"
            },
            titleStyle: {
                margiBottom: "10%"
            },
            failureIconStyle: {
                color: ColorPicker.errorRed,
                marginRight: "3%"
            },
            normalIconColor: {
                color: ColorPicker.newProgressBar,
                marginRight: "3%"
            },
            successIconColor: {
                color: ColorPicker.success,
                marginRight: "3%"
            },
            bottomHeaderStyle: {
                textAlign: "center",
                width: "100%",
                position: "fixed",
                bottom: "5rem"
            },
            listOfSections: {
                marginTop: "10%"
            }

        }
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    render() {
       return(
           <div>
               <ButtonAppBar header="" onCancel={this.props.onCancel} action="cancel" inverse="true" />

               <div style={this.style.blockStyle}>
                   <p className="headline5 highEmphasis" style={this.style.titleStyle}>{this.title}</p>
                   <div style={this.style.listOfSections}>
                       {this.listOfSections.map((section, idx) => (
                           <div key={idx} style={this.style.section}>
                               {this.type === "resumeOnboarding" ?
                                    (section.success === true ?
                                   <CheckCircleIcon align="center" style={this.style.successIconColor} /> :
                                   <CheckCircleIcon align="center" style={this.style.normalIconColor} />)
                                   :
                                   <ErrorIcon align="center" style={this.style.failureIconStyle} />
                               }
                               <span className="body2 highEmphasis">
                                   {section.text}
                               </span>
                           </div>
                       )
                       )}
                   </div>
               </div>

               <p style={this.style.bottomHeaderStyle}>{this.bottomHeader}</p>

               <div style={InputThemes.bottomButtonStyle}>
                       <PrimaryButtonComponent style={{ fontSize: "1rem", fontWeight: "400", fontFamily: "Roboto" }} btn_text={this.buttonText} onCheck={this.props.next} />
                       <p className="body2 highEmphasis">{this.bottomText}</p>
               </div>

           </div>
        )
    }

}

ShowOnboardingSections.propTypes = {
    payload: PropTypes.object,
    componentName: PropTypes.string,
    onCancel: PropTypes.func,
    next: PropTypes.func
}
