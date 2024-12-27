import React from "react";
import FlexView from "react-flexview";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PropTypes from "prop-types";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import ColorPicker from "../../../Services/ColorPicker";
import InputThemes from "../../../Themes/inputThemes";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import PageState from '../../../Services/PageState';
import ActionButtonComponent from "../../CommonUxComponents/ActionButton";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import NewUtilities from "../../../Services/NewUtilities";

var localeObj = {};
export default class ListAllRequests extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false
        }
        this.style = {
            textStyle: {
                margin: "1rem"
            },
            cardStyle: {
                width: "100%",
                borderRadius: "1.25rem",
                backgroundColor: ColorPicker.newProgressBar
            },
            itemStyle: {
                display: "flex",
                justifyContent: "space-between",
                margin: "5% 0",
                textAlign: 'left'
            }
        }
        this.handleClick = this.handleClick.bind(this);
        this.setAction = this.setAction.bind(this);

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "LIST REQUESTS";
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        androidApiCalls.enablePullToRefresh(false);
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

    setAction = element => () => {
        if (element.status === "rejected") {
            let jsonObject = {};
            jsonObject["name"] = element.name;
            jsonObject["cnpj"] = element.cnpj;
            jsonObject["bank"] = element.institution;
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.confirm(jsonObject);
        } else {
            this.props.cancel(element.portKey);
        }
    }

    handleClick = () => {
        this.props.onBack();
    };

    render() {
        const screenHeight = window.screen.height;
        const headerSelect = (status) => {
            switch (status) {
                case "active": return localeObj.active_request;
                case "cancelled": return localeObj.request_cancelled;
                case "rejected": return localeObj.request_rejected;
                case "sent": return localeObj.request_in_progress;
                case "approved": return localeObj.request_approved;
                default:
            }
        }
        const reasonSelect = (status, reason) => {
            switch (status) {
                case "cancelled": return reason;
                case "rejected": return localeObj.send_again;
                default:
            }
        }
        const btnTxtSelect = (status) => {
            switch (status) {
                case "rejected": return localeObj.verify_new;
                case "sent": return localeObj.cancel_portability;
                default:
            }
        }
        const faceMatchPending = (status) => {
            switch (status) {
                case "Facematch pendente": return true;
                case "Link para validação do facematch expirado": return true;
                default: return false;
            }
        }
        return (
            <div>
                <div className="headline5 highEmphasis" style={{ margin: "0 1.5rem", marginTop: "2rem", textAlign:"left" }}>
                    {localeObj.request_history}
                </div>
                <div className="scroll" style={{ height: `${screenHeight - 300}px`, overflowX: 'hidden', overflowY: 'auto' }}>
                    {this.props.portabilityList.map((element,index) =>
                        <div key={index} style={{ margin: "1rem 1.5rem" }}>
                            <Card align="center" style={this.style.cardStyle} elevation="0">
                                <CardContent style={{ paddingBottom: "0" }}>
                                    <FlexView column align="center">
                                        <span className="subtitle4 highEmphasis">{headerSelect(element.status)}</span>
                                    </FlexView>
                                    <FlexView column align="center" style={{
                                        display: element.status === "cancelled"
                                            || element.status === "rejected" ? "block" : "none", marginTop: "0.5rem"
                                    }}>
                                        <span className="body2 errorRed">{reasonSelect(element.status, element.cancelledBy)}</span>
                                    </FlexView>
                                    <FlexView column align="center" style={{
                                        display: faceMatchPending(element.requestStatus) ? "block" : "none", marginTop: "0.5rem"
                                    }}>
                                        <span className="body2 errorRed">{element.requestStatus}</span>
                                    </FlexView>
                                    <FlexView column style={{ margin: "1rem" }}>
                                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                                            <span className="tableLeftStyle mediumEmphasis" style={{ float: "left" }}>{localeObj.company_name}</span>
                                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{element.name}</span>
                                        </div>
                                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                                            <span className="tableLeftStyle mediumEmphasis" style={{ float: "left" }}>{localeObj.cnpj}</span>
                                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{NewUtilities.parseCnpj(element.cnpj).displayCPF}</span>
                                        </div>
                                        <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                                            <span className="tableLeftStyle mediumEmphasis" style={{ float: "left" }}>{localeObj.bank}</span>
                                            <span className="salaryTableRightContent tableRightStyle highEmphasis" >{element.code + " - " + element.institution}</span>
                                        </div>
                                        {element.date !== "" &&
                                            <div style={{ justifyContent: "space-between", marginTop: ".375rem" }}>
                                                <span className="salaryTableLeftContent tableLeftStyle mediumEmphasis">{element.status === "cancelled" ?
                                                    localeObj.cancelled_on : localeObj.last_updated_on}</span>
                                                <span className="pixTableRightContent tableRightStyle highEmphasis" >{element.status === "cancelled" ? element.cancelledDate : element.date}</span>
                                            </div>}
                                    </FlexView>
                                    {(element.status === "sent" || element.status === "rejected") &&
                                        <FlexView style={{ justifyContent: "center", marginBottom: "1rem" }}>
                                            <ActionButtonComponent
                                                btn_text={btnTxtSelect(element.status)}
                                                onCheck={this.setAction(element)}
                                            />
                                        </FlexView>
                                    }
                                </CardContent>
                            </Card>
                        </div>)
                    }
                </div>
                <div style={{...InputThemes.bottomButtonStyle,textAlign:"center"}}>
                    <PrimaryButtonComponent btn_text={localeObj.back} onCheck={this.handleClick} />
                </div>
            </div >
        );
    }
}
ListAllRequests.propTypes = {
    value: PropTypes.string,
    componentName: PropTypes.string,
    cancel: PropTypes.func.isRequired,
    confirm: PropTypes.func.isRequired,
    onBack: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    portabilityList: PropTypes.array,
  }