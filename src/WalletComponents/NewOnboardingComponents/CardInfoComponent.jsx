import React from "react";
import "../../styles/main.css";
import PropTypes from "prop-types";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import sendingCardIcon from "../../images/SpotIllustrations/Rocket vcard.png";
import InformationPageComponent from "../CommonUxComponents/ImageInformationComponent";
import PageNames from "../../Services/PageNames";

var localeObj = {};

export default class CardInfoComponent extends React.Component {
    constructor(props) {
        super(props);
        this.next = this.next.bind(this);
        this.componentName=PageNames.cardInfo;

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
        this.props.history.replace({pathname: "/locationConsent", newOnboarding: true });
    }

    onCancel = () => {
        if (this.props.location && this.props.location.fromComponent
            && this.props.location.fromComponent === "AllServices") {
            this.props.history.replace({ pathname: "/allServices", transition: "right" });
        }else{
            this.props.history.replace({ pathname: "/", transition: "right" });
        }
    }

    render() {
        return (
            <div style={{ overflowX: "hidden" }}>
                    <InformationPageComponent header={localeObj.card_info_header} onCancel={this.onCancel} icon={sendingCardIcon} appBar={true}
                        description={localeObj.card_info_description} subText={localeObj.card_info_subtext} btnText={localeObj.access_account}
                        next={this.next} type={this.componentName} noBottomSheet={true}/>
            </div >
        );
    }
}

CardInfoComponent.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object
}