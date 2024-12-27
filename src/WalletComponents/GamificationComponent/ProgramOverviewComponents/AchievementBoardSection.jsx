import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";

import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

import ColorPicker from "../../../Services/ColorPicker";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import ShimmerComponent from '../../CommonUxComponents/ShimmerComponent';
import GamificationAPIs from '../../../Services/Gamification/GamificationAPIs';

const { width: screenWidth } = window.screen;

export default function AchievementBoardSection(props) {
    const maxContentWidth = (screenWidth - 32) / 3;
    const [processing, setProcessing] = useState(false);
    const [achievementBoardData, setAchievementBoardData] = useState({});

    const { state, localeObj, styles } = props;
    const { programData } = state;
    const { programId, rewardType } = programData;
    
    useEffect(() => {
        (async () => {
            setProcessing(true);
            
            const achievementBoardData = await GamificationAPIs.fetchAchievementBoardAPI(programId, rewardType);
            setAchievementBoardData(achievementBoardData);
            
            setProcessing(false);
        })();
    }, [programId, rewardType]);

    const stylesheet = {
        ...styles,
        programRewardCardStyle: {
            borderColor: ColorPicker.disableBlack,
            backgroundColor: ColorPicker.cardBackgroundColor,
        },
        rewardSvgIconStyle: {
            fontSize: "1.25rem",
            fill: ColorPicker.accent
        },
        achievementBoardContentStyle: {
            paddingInline: "1rem",
            maxWidth: maxContentWidth
        }
    };

    if (processing) {
        return (<ShimmerComponent
            loadingComponents={[{ name: "box", classNames: "h-10-r" }]}
            containerClasses={{ pageClassNames: "br-0" }}
        />);
    }
    
    const { usersParticipated: totalUsersParticipated, luckyNumbers: totalLuckyNumbersAllocated, prizes: totalPrizesGiven } = achievementBoardData;
    const formattedTotalUsersParticipated = GeneralUtilities.formattedString(localeObj.total_user_participated, [GeneralUtilities.numDifferentiation(totalUsersParticipated)]);
    const formattedTotalLNAllocated = GeneralUtilities.formattedString(localeObj.total_lucky_numbers_allocated, [GeneralUtilities.numDifferentiation(totalLuckyNumbersAllocated)]);
    const formattedTotalPrizeAllocated = GeneralUtilities.formattedString(localeObj.total_prizes_allocated, [totalPrizesGiven]);

    const achievementBoardContents = [
        {
            icon: <PeopleAltIcon style={stylesheet.rewardSvgIconStyle} />,
            title: formattedTotalUsersParticipated
        },
        {
            icon: <ConfirmationNumberIcon style={stylesheet.rewardSvgIconStyle} />,
            title: formattedTotalLNAllocated,
            hasBorderInline: true
        },
        {
            icon: <AttachMoneyIcon style={stylesheet.rewardSvgIconStyle} />,
            title: formattedTotalPrizeAllocated
        },
    ];

    return (
        <FlexView
            column hAlignContent='center' vAlignContent='center'
            className='p-16 text-center' style={stylesheet.programRewardCardStyle}
        >
            <span className='highEmphasis subtitle4'>{localeObj.achievement_board}</span>

            <FlexView style={{ justifyContent: 'space-around' }} className='py-16'>
                {
                    achievementBoardContents.map(({icon, title, hasBorderInline}, index) => (
                        <FlexView
                            key={index} 
                            column hAlignContent='center'
                            style={{
                                ...stylesheet.achievementBoardContentStyle,
                                borderInline: hasBorderInline ? `2px solid ${ColorPicker.borderColor}` : 'none'
                            }}
                        >
                            {icon} <span className='highEmphasis caption mt-10'>{title}</span>
                        </FlexView>
                    ))
                }
            </FlexView>
        </FlexView>
    );
}

AchievementBoardSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string
};