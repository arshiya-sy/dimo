import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import FlexView from 'react-flexview';

import LockIcon from '@mui/icons-material/Lock';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';

import Log from '../../../Services/Log';
import ColorPicker from '../../../Services/ColorPicker';
import constantObjects from "../../../Services/Constants";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import androidApiCallsService from '../../../Services/androidApiCallsService';
import GamificationAPIs from '../../../Services/Gamification/GamificationAPIs';
import GamificationService from '../../../Services/Gamification/GamificationService';
import PrimaryButtonComponent from '../../CommonUxComponents/PrimaryButtonComponent';
import SecondaryButtonComponent from '../../CommonUxComponents/SecondaryButtonComponent';
import ImageHTMLInformationComponent from '../../CommonUxComponents/ImageHTMLInformationComponent';
import { COUPON_TYPE_LINK, SHARE_TYPE_COUPON_REWARD } from '../../../Services/Gamification/GamificationTerms';

import TimerImage from "../../../images/SpotIllustrations/Timer.png";
import ErrorImage from "../../../images/UnblockAccountImages/Error.webp";
import CopyIcon from "../../../images/GamificationImages/common/copy.svg";

export default function RedeemCouponSection(props) {

    const [redeemHeaderImage, setRedeemHeaderImage] = useState("");
    const [redeemTitle, setRedeemTitle] = useState("");
    const [redeemSubTitle, setRedeemSubTitle] = useState("");
    const [couponExpiryTitle, setCouponExpiryTitle] = useState("");
    const [couponClaimTitle, setCouponClaimTitle] = useState("");
    const [fetchingCouponCode, setFetchingCouponCode] = useState(false);
    const [showNoCouponAvailable, setShowNoCouponAvailable] = useState(false);
    const [couponData, setCouponData] = useState({
        couponCode: null,
        expiryDate: null,
        prizeTitle: "",
        prizeImageUrl: "",
        prizeDescription: "",
        prizeRedirectionUrl: "",
        prizeTncUrl: "",
        vendorName: "",
        valueType: ""
    });

    const screenWidth = window.screen.width;
    const { 
        styles, state, localeObj, bottomButtonsRef, fromComponent,
        onBackButtonPressed, openSnackBarHandler, onShareWithFriendBtnPressed, updateProgramPrizeDetails
    } = props;
    const { programData, contentHeight } = state;
    const { prizeDetails = {}, communication = {} } = programData;
    const { rewardId, momentEndTime } = prizeDetails;

    const stylesheet = {
        ...styles,
        copyCodeContStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            margin: 'auto',
            borderRadius: '1.25rem',
            border: `1px solid ${ColorPicker.openInvoiceBlue}`,
            width: 'max-content',
            padding: '0.625rem 2rem',
            marginTop: '0.625rem'
        },
        redirectTextStyle: {
            marginBlock: '1rem',
            paddingInline: '1.5rem'
        },
        rewardIconStyle: {
            ...styles.rewardIconStyle,
            color: ColorPicker.white
        },
        lockIconStyle: {
            padding: "2rem",
            width: 'max-content',
            backgroundColor: ColorPicker.tableBackground,
            border: `1px solid ${ColorPicker.openInvoiceBlue}`,
            borderRadius: "50%",
            lineHeight: 0
        },
        lockIconSvgStyle: {
            fontSize: "2rem",
            fill: ColorPicker.white
        }
    }

    const isRewardRevealDateExpired = moment().isAfter(moment(momentEndTime).add(10, 'days'));

    useEffect(() => {
        GamificationService.setUserMomentTimezone();
    }, []);

    useEffect(() => {
        let { couponCode, expiryDate, vendorName, prizeTitle } = couponData;
        let tempHeaderImage = "", tempRedeemTitle = "", tempRedeemSubTitle = "",  tempCouponExpiyTitle = "",
            tempCouponClaimTitle = ""; 

        expiryDate = getFormattedCouponExpiryDate(expiryDate);

        if (GeneralUtilities.isNotEmpty(expiryDate) && moment().isAfter(expiryDate)) {
            // Coupon Revealed & Coupon Expired
            tempRedeemTitle = localeObj.redeem_title_expired;
            tempRedeemSubTitle = GeneralUtilities.formattedString(localeObj.redeem_subtitle_expired, [prizeTitle]);
            tempCouponExpiyTitle = localeObj.redeem_date_expired;
            tempCouponClaimTitle = GeneralUtilities.formattedString(localeObj.redeem_claim_reveal_expired, [vendorName]);
        } else if (!GeneralUtilities.isNotEmpty(couponCode) && isRewardRevealDateExpired) {
            // Coupon Not Revealed & Coupon Expired
            tempHeaderImage = <img src={TimerImage} style={{ width: screenWidth * 0.55 }} alt='' />;
            tempRedeemTitle = localeObj.redeem_title_expired;
            tempCouponClaimTitle = localeObj.redeem_claim_expired;
        } else if (!GeneralUtilities.isNotEmpty(couponCode) && !isRewardRevealDateExpired) {
            // Coupon Not Revealed & Coupon Not Expired
            const formattedProgramEndDate = moment(momentEndTime).add(10, 'days').format('DD/MM/YYYY');

            tempRedeemTitle = localeObj.congratulations;
            tempRedeemSubTitle = `${localeObj.redeem_subtitle_reveal_1}\n${localeObj.redeem_subtitle_reveal_2}`;
            tempCouponExpiyTitle = (<>{localeObj.reveal_before} <span className='accent'>{formattedProgramEndDate}</span></>);
        } else {
            // Coupon Revealed & Coupon Not Expired (Active Coupon State)
            const expiresInDays = moment(expiryDate).diff(moment(), 'days');
            const formattedExpiresInDays = expiresInDays < 1 ? localeObj.today : `${expiresInDays} ${localeObj.days}`;

            tempRedeemTitle = localeObj.congratulations;
            tempRedeemSubTitle = GeneralUtilities.formattedString(localeObj.won_coupon, [prizeTitle]);
            tempCouponExpiyTitle = (<>{localeObj.expires_in} <span className='accent'>{formattedExpiresInDays}</span></>);
            tempCouponClaimTitle = GeneralUtilities.formattedString(localeObj.redeem_claim_active, [vendorName]);
        }

        setRedeemHeaderImage(tempHeaderImage);
        setRedeemTitle(tempRedeemTitle);
        setRedeemSubTitle(tempRedeemSubTitle);
        setCouponExpiryTitle(tempCouponExpiyTitle);
        setCouponClaimTitle(tempCouponClaimTitle);

    }, [localeObj, isRewardRevealDateExpired, momentEndTime, couponData, programData]);

    useEffect(() => setCouponData(programData.prizeDetails), [programData]);

    const getFormattedCouponExpiryDate = (expiryDate) => GeneralUtilities.isNotEmpty(expiryDate) ? `${expiryDate} 23:59:59` : expiryDate;

    const getCouponCodeSectionUi = () => {
        const { couponCode, valueType } = couponData;

        if (!GeneralUtilities.isNotEmpty(couponCode) && isRewardRevealDateExpired) {
            // Coupon Not Revealed & Coupon Expired
            return;
        }

        if (fetchingCouponCode) {
            return (
                <FlexView
                    column hAlignContent='center'
                    className="shimmer-container w-100" 
                    style={{ position: 'relative' }}
                >
                    <section className="shimmer-card-wraper m-0">
                        <div className="shimmer-card-bar shimming m-0" style={{ height: '2.5rem', width: '10.5rem' }}></div>
                    </section>
                </FlexView>
            );
        }

        if (GeneralUtilities.isNotEmpty(couponCode)) {
            // Coupon Revealed
            return (
                <FlexView style={stylesheet.copyCodeContStyle} onClick={() => copyCodeHandler(couponCode)}>
                    {
                        valueType === COUPON_TYPE_LINK
                        ? <div className="body3 highEmphasis">{localeObj.claim_reward_link}</div>
                        : <>
                            <div className="body3 highEmphasis">{couponCode}</div>
                            <img src={CopyIcon} alt='' style={{ ...stylesheet.rewardIconStyle, marginLeft: '0.5rem' }} />
                        </>
                    }
                </FlexView>
            );
        } else {
            // Coupon Not Revealed
            return (
                <FlexView style={stylesheet.copyCodeContStyle} onClick={revealCodeHandler}>
                    <RemoveRedEyeOutlinedIcon style={{ ...stylesheet.rewardIconStyle, marginRight: '0.5rem' }} />
                    <div className="body3 highEmphasis">{localeObj.reveal_coupon}</div>
                </FlexView>
            );
        }
    }

    const getBottomButtonSectionUi = () => {
        let { couponCode, expiryDate, prizeTncUrl, valueType } = couponData;
        const tncButtonRefStyles = GeneralUtilities.isNotEmpty(prizeTncUrl) || GeneralUtilities.isNotEmpty(communication?.termsConditionUrl) ? { bottom: '5rem' } : {};
        const primaryBtnText = valueType === COUPON_TYPE_LINK ? localeObj.claim_reward_link : localeObj.copy_redeem;

        expiryDate = getFormattedCouponExpiryDate(expiryDate);

        if (!GeneralUtilities.isNotEmpty(couponCode) && isRewardRevealDateExpired) {
            // Coupon Not Revealed & Coupon Expired
            return;
        }

        let bottomButtonSectionUi = <></>;

        const redirectWebsiteSection = (
            <div className="body2 mediumEmphasis" style={stylesheet.redirectTextStyle}>
                {localeObj.redirect_website}
            </div>
        );

        const primaryBottomButtonSection = (
            <PrimaryButtonComponent
                btn_text={primaryBtnText}
                onCheck={() => copyCodeHandler(couponCode, true)}
                disabled={!GeneralUtilities.isNotEmpty(couponData.couponCode, false)}
            />
        );

        const secondaryBottomButtonSection = (
            <SecondaryButtonComponent
                btn_text={localeObj.share_with_friends_btn}
                onCheck={() => onShareWithFriendBtnPressed(SHARE_TYPE_COUPON_REWARD)}
            />
        );

        if (GeneralUtilities.isNotEmpty(expiryDate) && moment().isAfter(expiryDate)) {
            // Coupon Revealed & Coupon Expired
            bottomButtonSectionUi = secondaryBottomButtonSection;
        } else if (!GeneralUtilities.isNotEmpty(couponCode) && !isRewardRevealDateExpired) {
            // Coupon Not Revealed & Coupon Not Expired
            bottomButtonSectionUi = (<>{redirectWebsiteSection} {primaryBottomButtonSection}</>);
        } else {
            // Coupon Revealed & Coupon Not Expired (Active Coupon State)
            bottomButtonSectionUi = (<>{redirectWebsiteSection} {primaryBottomButtonSection} {secondaryBottomButtonSection}</>);
        }

        return (
            <div
                ref={bottomButtonsRef}
                style={{ ...stylesheet.bottomContainerStyle, ...tncButtonRefStyles }} className='pt-10'
            >
                {bottomButtonSectionUi}
            </div>
        );
    }

    const revealCodeHandler = async () => {
        GeneralUtilities.sendActionMetrics(fromComponent, constantObjects.revealCode);

        setFetchingCouponCode(true);

        const revealedCouponData = await GamificationAPIs.revealUserEarnedCouponAPI(rewardId);

        if (GeneralUtilities.isNotEmpty(revealedCouponData)) {
            updateProgramPrizeDetails(revealedCouponData);

            setCouponData(revealedCouponData);
        } else {
            Log.sDebug("Error: while revealing coupon code, no coupons available", fromComponent);

            setShowNoCouponAvailable(true);
        }

        setFetchingCouponCode(false);
    }

    const copyCodeHandler = (string, shouldRedirect = false) => {
        const { prizeRedirectionUrl, valueType } = couponData;

        GeneralUtilities.sendActionMetrics(fromComponent, constantObjects.copy_code);

        if (valueType === COUPON_TYPE_LINK) {
            shouldRedirect = true;
        } else {
            androidApiCallsService.copyToClipBoard(string);
            openSnackBarHandler(localeObj.code_copied);
        }

        if (shouldRedirect && GeneralUtilities.isNotEmpty(prizeRedirectionUrl)) {
            androidApiCallsService.openUrlInBrowser(prizeRedirectionUrl);
        }
    }

    if (showNoCouponAvailable) {
        const infoImageData = ErrorImage;
        const firstHeaderText = localeObj.no_coupon_title;
        const thirdSuggestionText = localeObj.no_coupon_subtitle;
        const secondaryBtnText = localeObj.no_coupon_sec_btn;

        return <ImageHTMLInformationComponent
            type={fromComponent}
            appBar={false} appBarInverse={false} noAction={true}
            icon={infoImageData}
            onBack={onBackButtonPressed}
            header={firstHeaderText}
            suggestion={thirdSuggestionText}
            secBtnText={secondaryBtnText} close={onBackButtonPressed}
        />;
    }

    const { couponCode, prizeImageUrl } = couponData;

    return (
        <>
            {/* Redeem Reward Summary */}
            <FlexView
                column hAlignContent='center'
                className='px-24 py-30 scroll text-center'
                style={{ overflowY: 'auto', width: 'initial', maxHeight: contentHeight }}
            >
                { redeemHeaderImage }
                
                <div className="headline5 highEmphasis" style={{ whiteSpace: "pre-wrap" }}>{redeemTitle}</div>
                
                {
                    GeneralUtilities.isNotEmpty(redeemSubTitle)
                    && <div className="subtitle4 highEmphasis" style={{ marginBlock: 10, whiteSpace: "pre-wrap" }}>
                        {redeemSubTitle}
                    </div> 
                }
                
                {
                    GeneralUtilities.isNotEmpty(prizeImageUrl)
                    ? <div className='py-16 mb-10'><img alt='' className='br-rounded' style={{ width: screenWidth * 0.25 }} src={prizeImageUrl} /></div>
                    : <></>
                }
                
                {
                    !GeneralUtilities.isNotEmpty(couponCode) && !isRewardRevealDateExpired
                    && <div className='py-16 mb-10'>
                        <div style={stylesheet.lockIconStyle}><LockIcon style={stylesheet.lockIconSvgStyle} /></div>
                    </div>
                }

                { getCouponCodeSectionUi() }

                <div className="caption highEmphasis mt-16">{couponExpiryTitle}</div>

                <div className="body2 highEmphasis mt-24 px-24">{couponClaimTitle}</div>
            </FlexView>

            {/* Bottom Buttons Section */}
            { getBottomButtonSectionUi() }
        </>
    )
}

RedeemCouponSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string,
    bottomButtonsRef: PropTypes.object,
    openSnackBarHandler: PropTypes.func,
    updateProgramPrizeDetails: PropTypes.func,
    onShareWithFriendBtnPressed: PropTypes.func,
};