import React from "react";
import PropTypes from 'prop-types';

import { withStyles } from "@material-ui/core/styles";
import InputThemes from "../../Themes/inputThemes";
import localeService from "../../Services/localeListService";
import ImageHTMLInformationComponent from "../CommonUxComponents/ImageHTMLInformationComponent";

import FaceImage from "./../../images/UnblockAccountImages/Face.webp";
import AlertImage from "./../../images/UnblockAccountImages/Error.webp";
import InfoCircleImage from "./../../images/UnblockAccountImages/light.webp";
import PhoneCircleImage from "./../../images/UnblockAccountImages/phone.webp";
import UserCircleImage from "./../../images/UnblockAccountImages/person.webp";

const styles = InputThemes.singleInputStyle;

var localeObj = {};

class FaceMatchAuth extends React.Component {
    constructor(props) {
        super(props);

        const {
            componentName, imageStatus,
            fourthDescriptionText, primaryBtnAction, secondaryBtnAction,
            onBackButtonPressed
        } = props;

        this.state = {
            currentState: imageStatus,
            componentName: componentName,
            hasAppBar: false,
            appBarTitle: "",
            appBarAction: "",
            appBarInverse: "",
            infoImageData: "",
            firstHeaderText: "",
            secondSubHeaderText: "",
            thirdSuggestionText: "",
            fourthDescriptionText: fourthDescriptionText ?? "",
            descriptionStyles: {},
            fifthSubText: "",
            subTextStyles: {},
            sixthTipText: "",
            tipStyles: {},
            primaryBtnText: "",
            primaryBtnAction: primaryBtnAction ?? null,
            secondaryBtnText: "",
            secondaryBtnAction: secondaryBtnAction ?? null,
            onBackButtonPressed: onBackButtonPressed ?? null,
        };

        this.componentName = componentName;

        this.styles = {
            selfieInfoTextStyles: { display: "flex", alignItems: "center", textAlign: "left" },
            selfieInfoImageStyles: { marginRight: "1rem", marginLeft: "0.625rem", width: "3rem" },
            selfieReviewImageStyles: { display: "flex", justifyContent: "center", marginTop: "3rem" }
        };

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount = () => {
        window.onBackPressed = () => this.onBackButtonPressed();

        this.setInitialInformationData();
    }

    componentDidUpdate(prevProps) {
        if (this.props !== prevProps) {
            const {
                componentName, imageStatus,
                primaryBtnAction, secondaryBtnAction,
                onCancelButtonPressed, onBackButtonPressed, onTryAgainButtonPressed
            } = this.props;

            this.setState({
                currentState: imageStatus,
                componentName: componentName,
                primaryBtnAction: primaryBtnAction ?? null,
                secondaryBtnAction: secondaryBtnAction ?? null,
                onBackButtonPressed: onBackButtonPressed ?? null,
                onCancelButtonPressed: onCancelButtonPressed ?? null,
                onTryAgainButtonPressed: onTryAgainButtonPressed ?? null,
            }, () => {
                this.componentName = this.state.componentName;
                this.setInitialInformationData();
            });
        }
    }

    onBackButtonPressed = () => {
        const { onBackButtonPressed } = this.state;

        if (typeof onBackButtonPressed === 'function') {
            this.props.onBackButtonPressed();
        }
    }

    setInitialInformationData = () => {
        const { selfieInfoImageStyles, selfieInfoTextStyles, selfieReviewImageStyles } = this.styles;
        let { currentState, primaryBtnAction, fourthDescriptionText, primaryBtnText, onPrimaryBtnPressed } = this.state;
        let firstHeaderText = "", secondSubHeaderText = "", thirdSuggestionText = "";
        let descriptionStyles = {}, subTextStyles = {}, tipStyles = {};
        let hasAppBar = true;
        let appBarTitle = "", appBarAction = "cancel", appBarInverse = true;
        let infoImageData = AlertImage;
        let fifthSubText = "";
        let sixthTipText = "";
        let secondaryBtnText = "";
        let onSecondaryBtnPressed = () => void 0;

        switch (currentState) {
            case "Selfie info":
                appBarAction = "none";
                appBarInverse = false;
                appBarTitle = localeObj.unblock_selfie_info_app_title;
                infoImageData = FaceImage;
                firstHeaderText = localeObj.unblock_selfie_info_header;
                thirdSuggestionText = localeObj.unblock_selfie_info_suggestion;
                fourthDescriptionText = <><img style={selfieInfoImageStyles} src={UserCircleImage} alt="" /> {localeObj.unblock_selfie_info_description}</>;
                descriptionStyles = selfieInfoTextStyles;
                fifthSubText = <><img style={selfieInfoImageStyles} src={InfoCircleImage} alt="" /> {localeObj.unblock_selfie_info_subtext}</>;
                subTextStyles = selfieInfoTextStyles;
                sixthTipText = <><img style={selfieInfoImageStyles} src={PhoneCircleImage} alt="" /> {localeObj.selfie_third_tip}</>;
                tipStyles = selfieInfoTextStyles;
                primaryBtnText = localeObj.selfie_profile_btn;
                onPrimaryBtnPressed = primaryBtnAction;
                break;
            case "FGTS Selfie":
                appBarAction = "none";
                appBarInverse = false;
                appBarTitle = "";
                hasAppBar = false;
                infoImageData = FaceImage;
                firstHeaderText = localeObj.unblock_selfie_info_header;
                thirdSuggestionText = localeObj.unblock_selfie_info_suggestion;
                fourthDescriptionText = <><img style={selfieInfoImageStyles} src={UserCircleImage} alt="" /> {localeObj.unblock_selfie_info_description}</>;
                descriptionStyles = selfieInfoTextStyles;
                fifthSubText = <><img style={selfieInfoImageStyles} src={InfoCircleImage} alt="" /> {localeObj.unblock_selfie_info_subtext}</>;
                subTextStyles = selfieInfoTextStyles;
                sixthTipText = <><img style={selfieInfoImageStyles} src={PhoneCircleImage} alt="" /> {localeObj.selfie_third_tip}</>;;
                tipStyles = selfieInfoTextStyles;
                primaryBtnText = localeObj.open_cam;
                onPrimaryBtnPressed = primaryBtnAction;
                break;
            case "Selfie review":
                appBarAction = "none";
                appBarInverse = false;
                appBarTitle = localeObj.unblock_selfie_info_app_title;
                infoImageData = "";
                firstHeaderText = localeObj.profile_selfie_review_header;
                thirdSuggestionText = localeObj.profile_selfie_review_suggestion;
                descriptionStyles = selfieReviewImageStyles;
                fifthSubText = "";
                sixthTipText = "";
                primaryBtnText = localeObj.send;
                onPrimaryBtnPressed = primaryBtnAction;
                secondaryBtnText = localeObj.profile_selfie_review_secondary_btn;
                onSecondaryBtnPressed = this.onBackButtonPressed;
                break;
            default: ;
        }

        this.setState({
            hasAppBar, appBarTitle, appBarAction, appBarInverse, infoImageData,
            firstHeaderText, secondSubHeaderText, thirdSuggestionText, fourthDescriptionText, fifthSubText, sixthTipText,
            primaryBtnText, primaryBtnAction: onPrimaryBtnPressed, secondaryBtnText, secondaryBtnAction: onSecondaryBtnPressed,
            descriptionStyles, subTextStyles, tipStyles
        });
    }

    render() {
        const {
            hasAppBar, appBarTitle, appBarAction, appBarInverse, infoImageData,
            firstHeaderText, secondSubHeaderText, thirdSuggestionText, fourthDescriptionText, fifthSubText, sixthTipText,
            primaryBtnText, primaryBtnAction, secondaryBtnText, secondaryBtnAction,
            descriptionStyles, subTextStyles, tipStyles
        } = this.state;

        return (
            <ImageHTMLInformationComponent
                type={this.componentName}
                appBar={hasAppBar} appBarTitle={appBarTitle} appBarAction={appBarAction} appBarInverse={appBarInverse}
                icon={infoImageData} noAction={true}
                onBack={this.onBackButtonPressed}
                onCancel={this.onCancelButtonPressed}
                header={firstHeaderText}
                subHeader={secondSubHeaderText}
                suggestion={thirdSuggestionText}
                description={fourthDescriptionText}
                descriptionStyles={descriptionStyles}
                subText={fifthSubText}
                subTextStyles={subTextStyles}
                tip={sixthTipText}
                tipStyles={tipStyles}
                btnText={primaryBtnText} next={primaryBtnAction}
                secBtnText={secondaryBtnText} close={secondaryBtnAction}
            />
        );
    }
}

FaceMatchAuth.propTypes = {
    imageStatus: PropTypes.string
};

export default withStyles(styles)(FaceMatchAuth);