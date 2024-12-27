import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import FlexView from "react-flexview";

import Paper from '@material-ui/core/Paper';
import HistoryIcon from '@mui/icons-material/History';

import ColorPicker from "../../../Services/ColorPicker";
import constantObjects from '../../../Services/Constants';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import GamificationService from '../../../Services/Gamification/GamificationService';
import { REWARD_TYPE_COUPON, REWARD_TYPE_LUCKY_NUMBER } from '../../../Services/Gamification/GamificationTerms';

import TrophyIcon from "../../../images/GamificationImages/common/trophy.png";
import CalendarIcon from "../../../images/GamificationImages/common/calendar.png";

const screenWidth = window.screen.width;

export default function RewardSummarySection(props) {
    useEffect(() => {
        GamificationService.setUserMomentTimezone();
    }, []);

    const [ programPrizeTitle, setProgramPrizeTitle ] = useState("");
    const [ programPrizeName, setProgramPrizeName ] = useState("");
    const [ programExpiryTitle, setProgramExpiryTitle ] = useState("");
    const [ programExpiryDate, setProgramExpiryDate ] = useState("");

    const { state, localeObj, styles, moveToNextScreen, fromComponent } = props;
    const { programData, wonDetailsScreen } = state;
    const { rewardType } = programData;

    const stylesheet = {
        ...styles,
        inlineDividerStyle: {
            borderLeft: '1px solid #0B2844',
            minHeight: '1.5rem'
        },
        programRewardCardStyle: {
            backgroundColor: ColorPicker.disableBlack,
            borderRadius: "1.25rem",
            marginBottom: "1rem",
            width: '100%',
            paddingBlock: '1rem'
        },
        rewardSvgIconStyle: {
            width: "1.25rem",
            verticalAlign: "middle",
            fill: ColorPicker.white,
            height: "max-content",
            marginRight: "0.625rem"
        },
        programDrawContStyle: {
            backgroundColor: ColorPicker.rewardCardBgLight,
            borderRadius: "1.25rem",
            width: '100%',
            paddingBlock: '0.625rem'
        },
    };

    const openProgramHistoryScreen = () => {
        GeneralUtilities.sendActionMetrics(fromComponent, constantObjects.Gamification.drawHistoryListing);
        moveToNextScreen('/rewardsHistory');
    };

    const prizeTxtMaxWidth = ((screenWidth * 0.8) / 2) - 20;

    useEffect(() => {
        switch (rewardType) {
            case REWARD_TYPE_COUPON:
                const startDate = moment();
                const endDate = moment(programData.programEndDate);
                const expiresInDays = endDate.diff(startDate, 'days');
                const formattedProgramExpiryDate = expiresInDays > 0 ? `${expiresInDays} ${localeObj.days}` : localeObj.today;

                setProgramPrizeTitle(localeObj.reward);
                setProgramPrizeName(localeObj.reward_coupon);
                setProgramExpiryTitle(localeObj.expires_in);
                setProgramExpiryDate(formattedProgramExpiryDate);
                break;
            case REWARD_TYPE_LUCKY_NUMBER:
            default:
                setProgramPrizeTitle(localeObj.prize);
                setProgramPrizeName(programData.prizeDetails?.prizeTitle);
                setProgramExpiryTitle(wonDetailsScreen ? localeObj.draw_date : localeObj.upcoming_draw);
                setProgramExpiryDate(moment(programData.drawDate).format('DD/MM/YYYY'));
        }
    }, [localeObj, programData, wonDetailsScreen, rewardType]);

    return (
        <Paper style={stylesheet.programRewardCardStyle} elevation="0">
            <FlexView vAlignContent='center' style={{ justifyContent: 'space-evenly' }}>
                <FlexView className='px-5' hAlignContent='center' vAlignContent='center' align='left'>
                    <img src={TrophyIcon} style={stylesheet.rewardSvgIconStyle} alt='' />
                    <div>
                        <div className="body2 highEmphasis">{programPrizeTitle}</div>
                        <div className="button2 highEmphasis" style={{ maxWidth: prizeTxtMaxWidth }}>
                            { programPrizeName }
                        </div>
                    </div>
                </FlexView>

                <div style={stylesheet.inlineDividerStyle}></div>

                <FlexView className='px-5' hAlignContent='center' vAlignContent='center' align='left'>
                    <img src={CalendarIcon} style={stylesheet.rewardSvgIconStyle} alt='' />
                    <div>
                        <div className="body2 highEmphasis">{ programExpiryTitle }</div>
                        <div className="button2 highEmphasis">{ programExpiryDate }</div>
                    </div>
                </FlexView>
            </FlexView>

            {
                [REWARD_TYPE_LUCKY_NUMBER].includes(rewardType)
                && <FlexView className='px-16 mt-16' hAlignContent='center' vAlignContent='center' align='center'>
                    <Paper
                        style={stylesheet.programDrawContStyle} elevation={0}
                        onClick={openProgramHistoryScreen}
                    >
                        <FlexView hAlignContent='center' vAlignContent='center' align='center'>
                            <HistoryIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1.25rem" }} />
                            <span className='highEmphasis CaptionBold ml-5'>{localeObj.previous_draws_btn}</span>
                        </FlexView>
                    </Paper>
                </FlexView>
            }
        </Paper>
    );
}

RewardSummarySection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string,
    moveToNextScreen: PropTypes.func,
};