import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import "../../../styles/main.css";
import InputThemes from "../../../Themes/inputThemes";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css"

import localeService from "../../../Services/localeListService";
import { withStyles } from "@material-ui/core/styles";

import PageState from "../../../Services/PageState";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import MetricServices from "../../../Services/MetricsService";
import androidApiCallsService from "../../../Services/androidApiCallsService";
import GeneralUtilities from "../../../Services/GeneralUtilities";

const styles = InputThemes.payStyle;
const screenHeight = window.innerHeight;
var localeObj = {};

class PixKeyDescription extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayValue: "",
            name: "",
            bank: "",
            cpf: ""
        };
        this.confirm = this.confirm.bind(this);
        this.componentName = GeneralUtilities.emptyValueCheck(this.props.componentName) ? "ADD NEW CONTACT" : this.props.componentName;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    confirm = () => {
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
        this.props.setTransactionInfo(true);
    }

    componentDidMount() {
        if (!!this.props.requiredInfo && !!this.props.name) {
            this.setState({
                name: this.props.name,
                bank: this.props.requiredInfo["receiverInstitute"],
                cpf: this.props.requiredInfo["CPF"]
            })
        }
        window.addEventListener("resize", this.checkIfInputIsActive);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    componentWillUnmount() {
        androidApiCallsService.disableCopyPaste();
        window.removeEventListener("resize", this.checkIfInputIsActive);
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    checkIfInputIsActive = () => {
        if (window.innerHeight !== screenHeight) {
            this.setState({
                fieldOpen: true
            })
        } else {
            this.setState({
                fieldOpen: false
            })
        }
    }

    back = () => {
        this.props.onBack();
    }

    render() {
        const finalHeight = window.screen.height;
        return (
            <div className="scroll" style={{ height: this.state.fieldOpen ? `${finalHeight - 480}px` : `${finalHeight - 240}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={InputThemes.initialMarginStyle}>
                    <FlexView column>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left", userSelect: "none" }}>
                            {localeObj.confirm_rec_acc}
                        </div>
                    </FlexView>
                    <div style={{ marginTop: "3.5rem" }}>
                        <FlexView column>
                            <div className="subtitle5 highEmphasis" style={{ textAlign: "left", userSelect: "none" }}>
                                {this.state.name}
                            </div>
                            <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "0.4rem" }}>
                                {this.state.bank}
                            </div>
                            <div className="body2 mediumEmphasis" style={{ textAlign: "left", marginTop: "0.2rem" }}>
                                {GeneralUtilities.maskCpf(this.state.cpf)}
                            </div>
                        </FlexView>
                    </div>
                </div>
                <div style={this.state.fieldOpen ? InputThemes.hideButtonStyle : InputThemes.bottomButtonStyle}>
                    <PrimaryButtonComponent btn_text={localeObj.save_contact} onCheck={this.confirm} />
                </div>
            </div>
        )
    }
}

PixKeyDescription.propTypes = {
    onBack: PropTypes.object.isRequired,
    requiredInfo: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    setTransactionInfo: PropTypes.func.isRequired,
    componentName: PropTypes.string.isRequired,
};

export default withStyles(styles)(PixKeyDescription);