import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";

import GeneralUtilities from '../../../Services/GeneralUtilities';
import {
    SHARE_TYPE_PHONE_PROGRAM, SHARE_TYPE_COUPON_PROGRAM, SHARE_TYPE_COUPON_REWARD, SHARE_TYPE_PHONE_REWARD
} from '../../../Services/Gamification/GamificationTerms';

import DimoLogoImage from './../../../images/DarkThemeImages/Dimo-Logo_4x.png';
import PhoneRewardShareBgImage from './../../../images/GamificationImages/share/phone-reward-share-bg.webp';
import CouponRewardShareBgImage from './../../../images/GamificationImages/share/coupon-reward-share-bg.webp';
import PhoneProgramShareBgImage from './../../../images/GamificationImages/share/phone-program-share-bg.webp';
import CouponProgramShareBgImage from './../../../images/GamificationImages/share/coupon-program-share-bg.webp';

const screenWidth = window.screen.width;
const screenHeight = window.screen.height;

export default function RewardShareSection(props) {
    const [shareContentUi, setShareContentUi] = useState("");
    const [shareContentBgImage, setShareContentBgImage] = useState("");

    const { programData, shareType, styles, localeObj } = props;
    const { prizeDetails } = programData;

    const stylesheet = {
        ...styles,
        rewardScrollContStyle: {
            overflow: "hidden auto"
        },
        rewardImageStyle: {
            verticalAlign: "middle",
            height: "max-content",
            width: screenWidth * (shareType === SHARE_TYPE_COUPON_REWARD ? 0.2 : 0.4)
        },
        wonDetailsCardStyle: {
            position: 'relative',
            width: 'initial',
            backgroundImage: `url(${shareContentBgImage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'round',
            borderRadius: '1.25rem',
            minHeight: screenHeight * 0.55,
            paddingBottom: '2rem'
        },
        dimoLogoImageStyle: {
            position: 'absolute',
            bottom: '1.25rem',
            maxWidth: screenWidth * 0.3
        }
    };

    useEffect(() => {
        const { rewardImageStyle } = stylesheet;
        const { prizeTitle, prizeType, prizeImageUrl } = prizeDetails;
        let shareFirstSection = "", shareSecondSection = "", shareThirdSection = "";
        let shareContentBgImage = "";

        const getTitleSectionUi = (shareTitle, marginStyleClass = "") => (
            <div className={`headline5 highEmphasis ${marginStyleClass}`}>{shareTitle}</div>
        );

        const getSubTitleSectionUi = (shareSubTitle) => (
            <div className="subtitle7 highEmphasis mt-16">{shareSubTitle}</div>
        );

        const getImageSectionUi = (prizeImageUrl, imageStyleClass = "") => (            
            <div className='py-16 px-16'><img className={imageStyleClass} src={prizeImageUrl} alt='' style={rewardImageStyle} /></div>
        );

        switch(shareType) {
            case SHARE_TYPE_PHONE_PROGRAM:
                const phoneProgramShareTitle = GeneralUtilities.formattedString(localeObj.phone_program_share, [prizeTitle]);
                shareFirstSection = getTitleSectionUi(phoneProgramShareTitle);
                shareSecondSection = getSubTitleSectionUi(localeObj.reward_share_click_too);
                shareContentBgImage = PhoneProgramShareBgImage;
                break;
            case SHARE_TYPE_COUPON_PROGRAM:
                const couponProgramShareTitle = GeneralUtilities.formattedString(localeObj.coupon_program_share, [localeObj.reward_coupon]);
                shareFirstSection = getTitleSectionUi(couponProgramShareTitle);
                shareSecondSection = getSubTitleSectionUi(localeObj.reward_share_click_too);
                shareContentBgImage = CouponProgramShareBgImage;
                break;
            case SHARE_TYPE_PHONE_REWARD:
                const phoneShareTitle = GeneralUtilities.formattedString(localeObj.phone_reward_share, [prizeTitle]);
                shareFirstSection = getTitleSectionUi(phoneShareTitle, "mb-16");
                shareSecondSection = getImageSectionUi(prizeImageUrl);
                shareContentBgImage = PhoneRewardShareBgImage;
                break;
            case SHARE_TYPE_COUPON_REWARD:
            default:
                const couponShareTitle = GeneralUtilities.formattedString(localeObj.coupon_reward_share, [prizeTitle]);
                shareFirstSection = getImageSectionUi(prizeImageUrl, "br-rounded");
                shareSecondSection = getTitleSectionUi(couponShareTitle);
                shareThirdSection = getSubTitleSectionUi(localeObj.reward_share_click_too);
                shareContentBgImage = CouponRewardShareBgImage;
        }

        const shareContentUi = (<>{shareFirstSection} {shareSecondSection} {shareThirdSection}</>);

        setShareContentUi(shareContentUi);
        setShareContentBgImage(shareContentBgImage);

    }, [localeObj, prizeDetails, shareType]);

    return (
        <>
            {/* Reward Share Section */}
            <div id="share_section" className='w-100'>
                <FlexView
                    column vAlignContent='center' hAlignContent='center'
                    style={stylesheet.rewardScrollContStyle}
                >
                    <div
                        className='scroll'
                        style={{ overflowY: 'auto', width: 'initial' }}
                    >
                        <FlexView
                            className='px-32' style={stylesheet.wonDetailsCardStyle}
                            column hAlignContent='center' vAlignContent='center' align="center"
                        >
                           { shareContentUi }

                            <FlexView hAlignContent='center' vAlignContent='center'>
                                <img src={DimoLogoImage} alt='' style={stylesheet.dimoLogoImageStyle} />
                            </FlexView>
                        </FlexView>
                    </div>
                </FlexView>
            </div>
        </>
    );
}

RewardShareSection.propTypes = {
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    programData: PropTypes.object,
};