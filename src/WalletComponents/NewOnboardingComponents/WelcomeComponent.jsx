import React from "react";
import "../../styles/main.css";
import PropTypes from "prop-types";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import welcomeIcon from "../../images/SpotIllustrations/Phone copy.png";
import InformationPageComponent from "../CommonUxComponents/ImageInformationComponent";
import PageNames from "../../Services/PageNames";

var localeObj = {};

export default class WelcomeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.next = this.next.bind(this);
        this.componentName = PageNames.welcomePage;
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
        this.props.history.replace("/setUpPin");
    }

    onCancel = () => {
        this.props.history.replace({ pathname: "/", transition: "right" });
    }

    render() {
        return (
            <div style={{ overflowX: "hidden" }}>
                <div style={{ marginTop: "3rem" }}>
                    <InformationPageComponent header={localeObj.welcome_header} onCancel={this.onCancel} icon={welcomeIcon} appBar={false}
                        description={localeObj.welcome_description} btnText={localeObj.next} next={this.next} type={this.componentName} />
                </div>
            </div >
        );
    }
}

WelcomeComponent.propTypes = {
    history: PropTypes.object
}
