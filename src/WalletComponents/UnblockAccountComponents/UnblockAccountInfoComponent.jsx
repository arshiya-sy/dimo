import React from "react";
import PropTypes from 'prop-types';

import { withStyles } from "@material-ui/core/styles";

import PageNames from "../../Services/PageNames";
import InputThemes from "../../Themes/inputThemes";
import constantObjects from "../../Services/Constants";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import UnblockAccountService from "../../Services/UnblockAccount/UnblockAccountService";
import ImageHTMLInformationComponent from "../CommonUxComponents/ImageHTMLInformationComponent";
import { 
    ACCOUNT_STATUS_BLOCKED, ACCOUNT_STATUS_CLOSED, ACCOUNT_STATUS_INACTIVE,
    UNBLOCK_ACCOUNT_SECURITY, UNBLOCK_ACCOUNT_SELFIE_INFO, ACCOUNT_STATUS_PROGRESS,
    UNBLOCK_ACCOUNT_PROGRESS, UNBLOCK_ACCOUNT_FAILED, UNBLOCK_ACCOUNT_SELFIE_REVIEW,
} from "../../Services/UnblockAccount/UnblockAccountTerms";

import FaceImage from "./../../images/UnblockAccountImages/Face.webp";
import AlertImage from "./../../images/UnblockAccountImages/Error.webp";
import SafetyImage from "./../../images/UnblockAccountImages/Safe.webp";
import InfoCircleImage from "./../../images/UnblockAccountImages/light.webp";
import PhoneCircleImage from "./../../images/UnblockAccountImages/phone.webp";
import UserCircleImage from "./../../images/UnblockAccountImages/person.webp";
import EmptyStateImage from "./../../images/UnblockAccountImages/Empty state.webp";

const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.UnblockAccountComponents;
const constantObjectJSON = constantObjects.UnblockAccount;

var localeObj = {};

class UnblockAccountInfoComponent extends React.Component {
    constructor(props) {
        super(props);

        const { 
            componentName, accountStatus, 
            fourthDescriptionText, primaryBtnAction, secondaryBtnAction,
            onCancelButtonPressed, onBackButtonPressed, onTryAgainButtonPressed
        } = props;

        this.state = {
            currentState: accountStatus ?? ACCOUNT_STATUS_INACTIVE,
            componentName: componentName ?? PageNameJSON.account_status_inactive,
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
            onCancelButtonPressed: onCancelButtonPressed ?? null,
            onTryAgainButtonPressed: onTryAgainButtonPressed ?? null,
        };

        this.componentName = this.state.componentName;

        this.styles = {
            selfieInfoTextStyles: { display: "flex", alignItems: "center", textAlign: "left" },
            selfieInfoImageStyles: { marginRight: "1rem", marginLeft: "0.625rem", width: "3rem" },
            selfieReviewImageStyles: { display: "flex", justifyContent: "center", marginTop: "3rem" },
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
                componentName, accountStatus, 
                primaryBtnAction, secondaryBtnAction,
                onCancelButtonPressed, onBackButtonPressed, onTryAgainButtonPressed
            } = this.props;

            this.setState({
                currentState: accountStatus ?? ACCOUNT_STATUS_INACTIVE,
                componentName: componentName ?? PageNameJSON.account_status_inactive,
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
            onBackButtonPressed();
        } else {
            UnblockAccountService.clearLoginDataHomeRedirect();
        }
    }

    onCancelButtonPressed = () => {
        const { onCancelButtonPressed } = this.state;

        GeneralUtilities.sendActionMetrics(this.componentName, constantObjectJSON.closeAppBar);

        if (typeof onCancelButtonPressed === 'function') {
            onCancelButtonPressed();
        } else {
            UnblockAccountService.clearLoginDataHomeRedirect();
        }
    }

    onBackToHomeButtonPressed = () => {
        GeneralUtilities.sendActionMetrics(this.componentName, constantObjectJSON.backToHome);
        UnblockAccountService.clearLoginDataHomeRedirect();
    }

    setInitialInformationData = () => {
        const { selfieInfoImageStyles, selfieInfoTextStyles, selfieReviewImageStyles } = this.styles;
        let { currentState, primaryBtnAction, fourthDescriptionText } = this.state;
        const { customerCarePhoneNumberDisplay, customerCareWADisplay } = constantObjects;
        let firstHeaderText = "", secondSubHeaderText = "", thirdSuggestionText = "";
        let descriptionStyles = {}, subTextStyles = {}, tipStyles = {};
        let hasAppBar = true;
        let appBarTitle = "", appBarAction = "cancel", appBarInverse = true;
        let infoImageData = AlertImage;
        let fifthSubText = `${localeObj.account_call_us}:\n${customerCarePhoneNumberDisplay}`;
        let sixthTipText = `${localeObj.account_whatsapp}:\n${customerCareWADisplay}`;
        let primaryBtnText = localeObj.account_back_home;
        let onPrimaryBtnPressed = this.onBackToHomeButtonPressed;
        let secondaryBtnText = "";
        let onSecondaryBtnPressed = () => void 0;
        
        switch(currentState) {
            case ACCOUNT_STATUS_PROGRESS:
                infoImageData = EmptyStateImage;
                firstHeaderText = localeObj.account_progress_header;
                thirdSuggestionText = localeObj.account_progress_suggestion;
                fourthDescriptionText = localeObj.account_progress_description;
                break;
            case ACCOUNT_STATUS_CLOSED:
            case ACCOUNT_STATUS_BLOCKED:
            case ACCOUNT_STATUS_INACTIVE:
                firstHeaderText = localeObj.account_blocked_header;
                thirdSuggestionText = localeObj.account_blocked_suggestion;
                break;
            case UNBLOCK_ACCOUNT_SECURITY:
                infoImageData = SafetyImage;
                firstHeaderText = localeObj.unblock_security_header;
                thirdSuggestionText = localeObj.unblock_security_suggestion;
                fourthDescriptionText = localeObj.unblock_security_description;
                fifthSubText = "";
                sixthTipText = "";
                primaryBtnText = localeObj.unblock_next;
                onPrimaryBtnPressed = primaryBtnAction;
                break;
            case UNBLOCK_ACCOUNT_SELFIE_INFO:
                appBarAction = "none"; // show back button
                appBarInverse = false; // Don't show close icon
                appBarTitle = localeObj.unblock_selfie_info_app_title;
                infoImageData = FaceImage;
                firstHeaderText = localeObj.unblock_selfie_info_header;
                thirdSuggestionText = localeObj.unblock_selfie_info_suggestion;
                fourthDescriptionText = <><img style={selfieInfoImageStyles} src={UserCircleImage} alt="" /> {localeObj.unblock_selfie_info_description}</>;
                descriptionStyles = selfieInfoTextStyles;
                fifthSubText = <><img style={selfieInfoImageStyles} src={InfoCircleImage} alt="" /> {localeObj.unblock_selfie_info_subtext}</>;
                subTextStyles = selfieInfoTextStyles;
                sixthTipText = <><img style={selfieInfoImageStyles} src={PhoneCircleImage} alt="" /> {localeObj.unblock_selfie_info_tip}</>;
                tipStyles = selfieInfoTextStyles;
                primaryBtnText = localeObj.unblock_start;
                onPrimaryBtnPressed = primaryBtnAction;
                break;
            case UNBLOCK_ACCOUNT_SELFIE_REVIEW:
                appBarAction = "none";
                appBarInverse = false;
                appBarTitle = localeObj.unblock_selfie_info_app_title;
                infoImageData = "";
                firstHeaderText = localeObj.unblock_selfie_review_header;
                thirdSuggestionText = localeObj.unblock_selfie_review_suggestion;
                descriptionStyles = selfieReviewImageStyles;
                fifthSubText = "";
                sixthTipText = "";
                primaryBtnText = localeObj.unblock_selfie_review_primary_btn;
                onPrimaryBtnPressed = primaryBtnAction;
                secondaryBtnText = localeObj.unblock_selfie_review_secondary_btn;
                onSecondaryBtnPressed = this.onBackButtonPressed;
                break;
            case UNBLOCK_ACCOUNT_PROGRESS:
                infoImageData = EmptyStateImage;
                firstHeaderText = localeObj.unblock_progress_header;
                thirdSuggestionText = localeObj.unblock_progress_suggestion;
                fourthDescriptionText = localeObj.unblock_progress_description;
                break;
            case UNBLOCK_ACCOUNT_FAILED:
                firstHeaderText = localeObj.unblock_failed_header;
                thirdSuggestionText = localeObj.unblock_failed_suggestion;
                primaryBtnText = localeObj.unblock_try_again;
                onPrimaryBtnPressed = primaryBtnAction;
                secondaryBtnText = localeObj.account_back_home;
                onSecondaryBtnPressed = this.onBackToHomeButtonPressed;
                break;
            default:
                break;
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

UnblockAccountInfoComponent.propTypes = {
    accountStatus: PropTypes.string,
    componentName: PropTypes.string,
    fourthDescriptionText: PropTypes.any,
    primaryBtnAction: PropTypes.string,
    secondaryBtnAction: PropTypes.string,
    onCancelButtonPressed: PropTypes.string,
    onBackButtonPressed: PropTypes.string,
    onTryAgainButtonPressed: PropTypes.string
};

export default withStyles(styles)(UnblockAccountInfoComponent);