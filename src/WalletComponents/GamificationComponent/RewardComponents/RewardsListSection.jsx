import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";

import Grid from "@material-ui/core/Grid";
import Paper from '@material-ui/core/Paper';
import NextIcon from '@material-ui/icons/ArrowForwardIos';

import ColorPicker from "../../../Services/ColorPicker";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import SingleCouponSection from '../CouponComponents/SingleCouponSection';
import GamificationService from '../../../Services/Gamification/GamificationService';
import { PRIZE_TYPE_COUPON, PRIZE_TYPE_PHONE } from '../../../Services/Gamification/GamificationTerms';

import { ReactComponent as PhoneIconSvg } from "../../../images/GamificationImages/common/phone.svg";

export default function RewardsListSection(props) {
    const { state, localeObj, styles, noRewardContent, openRedeemPrizeScreen, fromComponent } = props;
    const { userEarnedPrizesData } = state;

    useEffect(() => {
        GamificationService.setUserMomentTimezone();
    }, []);

    const stylesheet = {
        ...styles,
        allRewardDetailStyle: {
            display: "flex",
            alignItems: "center",
            width: "auto",
            paddingBlock: '1rem',
            paddingInline: '1.5rem'
        },
        rewardTaskIconStyle: {
            width: "2rem",
            verticalAlign: "middle",
            fill: ColorPicker.accent,
            height: "auto"
        },
        rewardNextIconStyle: {
            fill: ColorPicker.accent,
            width: "1rem",
            position: "absolute",
            right: "1.75rem"
        },
        rewardTaskImageContStyle: {}
    };

    const getRewardTypeImageUi = ({ prizeType, prizeImageUrl }) => {
        let prizeTypeImageUi = "";

        switch(prizeType) {
            case PRIZE_TYPE_COUPON: prizeTypeImageUi = (
                <FlexView className='mr-10'>
                    <img className='br-rounded' src={prizeImageUrl} alt='' width={40} />
                </FlexView>
            )
                break;
            case PRIZE_TYPE_PHONE:
            default: prizeTypeImageUi = (
                <div style={stylesheet.rewardTaskIconContStyle}>
                    <PhoneIconSvg style={{ ...stylesheet.rewardTaskIconStyle, width: '1.25rem' }} />
                </div>
            );
        }

        return prizeTypeImageUi;
    }

    return (
        <Grid container>
            {/* All User Earned Prize Section */}
            {
                GeneralUtilities.isNotEmpty(userEarnedPrizesData, false)
                && userEarnedPrizesData.map((prizeData, prizeIndex) => {
                    let rewardContainerStyles = {};
                    const { prizeTitle, prizeType } = prizeData;
                    
                    prizeData = { ...prizeData, ...prizeData.prizeDetails }; 

                    return (
                        prizeType === PRIZE_TYPE_COUPON
                        ? <SingleCouponSection
                            key={prizeIndex}
                            localeObj={localeObj} styles={stylesheet}
                            state={{ programData: {}, couponData: prizeData }}
                            fromComponent={fromComponent}
                            openRedeemPrizeScreen={() => openRedeemPrizeScreen(prizeData)}
                        />
                        : <Paper
                            align="left" key={prizeIndex} style={stylesheet.rewardListCard} elevation={0}
                            onClick={() => openRedeemPrizeScreen(prizeData)}
                        >
                            <div style={{ ...stylesheet.allRewardDetailStyle, ...rewardContainerStyles }}>
                                { getRewardTypeImageUi(prizeData) }

                                <div className="body2 highEmphasis">{prizeTitle}</div>

                                <NextIcon style={stylesheet.rewardNextIconStyle} />
                            </div>
                        </Paper>
                    );
                })
            }

            {/* No Prize Earned By User Section */}
            {
                !GeneralUtilities.isNotEmpty(userEarnedPrizesData, false)
                && noRewardContent(localeObj.no_reward)
            }
        </Grid>
    );
}

RewardsListSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    noRewardContent: PropTypes.any,
    fromComponent: PropTypes.string,
    openRedeemPrizeScreen: PropTypes.func,
};