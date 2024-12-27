import React from "react";
import "../../styles/main.css";
import PropTypes from "prop-types";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import InformationPage from "../CommonUxComponents/ImageInformationComponent";
import logo from "../../images/SpotIllustrations/Checkmark.png";
import PageNames from "../../Services/PageNames";
import GeneralUtilities from "../../Services/GeneralUtilities";

var localeObj = {};

export default class waitingApprovalComponent extends React.Component {
    constructor(props) {
        super(props);
        this.next = this.next.bind(this);
        this.componentName = PageNames.waiting;
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        window.onBackPressed = () => {
            this.onCancel();
        }
    }

    next = () => {
        this.props.history.replace("/motoPayLandingPage");
    }

    onHelp = () => {
        GeneralUtilities.openHelpSection();
    }

    onCancel = () => {
        this.props.history.replace({ pathname: "/", transition: "right" });
    }

    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        return (
            <div className='sucessPage' style={{ overflowX: "hidden", width: screenWidth, height: screenHeight }}>
                <InformationPage description={localeObj.allset_descr} icon={logo} appBar={true}
                    header={localeObj.all_set}
                    btnText={localeObj.understood}
                    next={this.next} noAction={true}
                    from={"waitingApproval"}
                    onHelp={this.onHelp} type={this.componentName} />
            </div>
        );
    }
}

waitingApprovalComponent.propTypes = {
    history: PropTypes.object
}
