import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import FlexView from 'react-flexview';

import constantObjects from '../../../Services/Constants';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import CouponsListSection from '../CouponComponents/CouponsListSection';
import PrimaryButtonComponent from '../../CommonUxComponents/PrimaryButtonComponent';
import GamificationService from '../../../Services/Gamification/GamificationService';
import LuckyNumbersListSection from '../LuckyNumberComponents/LuckyNumbersListSection';
import { PLAY_DIMO_TAB_ACTION, REWARD_TYPE_COUPON, REWARD_TYPE_LUCKY_NUMBER } from '../../../Services/Gamification/GamificationTerms';

export default function ShowRewardSection(props) {
    const { state, localeObj, styles, fromComponent, fromLocationData, moveToNextScreen } = props;
    const { programData, wonDetailsScreen } = state;
    const { rewardType, programEndDate } = programData;
    const stylesheet = { ...styles, };

    useEffect(() => {
        GamificationService.setUserMomentTimezone();
    }, []);

    const redirectToOnboarding = () => {
        GeneralUtilities.sendActionMetrics(fromComponent, constantObjects.Gamification.learnHowToParticipate);

        return moveToNextScreen("/gamificationOnboarding");
    }

    const redirectToRunningProgram = () => {
        GeneralUtilities.sendActionMetrics(fromComponent, constantObjects.Gamification.getRewards);

        return moveToNextScreen(
            "/rewards", true, {wonDetailsScreen: false},
            { additionalInfo: { rewardActions: PLAY_DIMO_TAB_ACTION, openProgramId: programData.programId } }
        );
    }

    const isProgramExpired = moment().isAfter(moment(programEndDate));
    const rewardTypeLabel = GeneralUtilities.getTranslatedString("reward_", rewardType, localeObj);
    const getRewardsText = GeneralUtilities.formattedString(localeObj.get_rewards_btn, [`${(rewardTypeLabel).toLowerCase()}s`]);
    const primaryBtnText = isProgramExpired ? localeObj.learn_to_participate_btn : getRewardsText;
    const primaryBtnAction = isProgramExpired ? redirectToOnboarding : redirectToRunningProgram;

    return (
       <>
        {/* Lucky Numbers List Section */}
        {
            rewardType === REWARD_TYPE_LUCKY_NUMBER
            && <LuckyNumbersListSection
                localeObj={localeObj} styles={stylesheet} state={state}
                fromComponent={fromComponent}
            />
        }

        {/* Coupons List Section */}
        {
            rewardType === REWARD_TYPE_COUPON
            && <CouponsListSection
                localeObj={localeObj} styles={stylesheet} state={state}
                fromComponent={fromComponent}
                fromLocationData={fromLocationData}
            />
        }

        {/* Program Draw and Expire Button */}
        {
            wonDetailsScreen
            && <FlexView hAlignContent='center' className='mt-24'>
                <PrimaryButtonComponent btn_text={primaryBtnText} onCheck={primaryBtnAction} /> 
            </FlexView>
        }
       </>
    );
}

ShowRewardSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string,
    fromLocationData: PropTypes.object,
    moveToNextScreen: PropTypes.func
};