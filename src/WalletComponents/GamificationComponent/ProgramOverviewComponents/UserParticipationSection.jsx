import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";

import Paper from '@material-ui/core/Paper';
import EventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';

import ColorPicker from "../../../Services/ColorPicker";
import ShimmerComponent from '../../CommonUxComponents/ShimmerComponent';
import GamificationAPIs from '../../../Services/Gamification/GamificationAPIs';

export default function UserParticipationSection(props) {
    const [processing, setProcessing] = useState(false);
    const [userRewardParticipationData, setUserRewardParticipationData] = useState({});

    const { state, localeObj, styles, updateTotalRewardEarnedData } = props;
    const { programData } = state;
    const { programId, rewardType } = programData;

    useEffect(() => {
        (async () => {
            setProcessing(true);
            updateTotalRewardEarnedData({});
            
            const userRewardParticipationData = await GamificationAPIs.fetchUserRewardParticipationAPI(programId, rewardType);
            setUserRewardParticipationData(userRewardParticipationData);
            
            setProcessing(false);
            updateTotalRewardEarnedData(userRewardParticipationData);
        })();
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [programId, rewardType]);

    const stylesheet = {
        ...styles,
        programRewardCardStyle: {
            position: "relative",
            borderRadius: "1.5rem",
            backgroundColor: ColorPicker.disableBlack
        },
        rewardSvgIconStyle: {
            fontSize: "1.25rem",
            fill: ColorPicker.darkHighEmphasis
        }
    };

    if (processing) {
        return (<ShimmerComponent
            loadingComponents={[{ name: "btn" }]}
            containerClasses={{ pageClassNames: "mt-16", containerClassNames: "mx-24 br-24" }}
        />);
    }

    const { luckyNumbers, prizes } = userRewardParticipationData;

    return (
        <Paper className="mx-24 mt-16" style={stylesheet.programRewardCardStyle} elevation={0}>
            <FlexView 
                hAlignContent='center' vAlignContent='center' 
                style={{ justifyContent: 'space-between' }} className='px-24 py-16'
            >
                <span className='highEmphasis body3'>{localeObj.your_participation}:</span>

                <FlexView>
                    <FlexView hAlignContent='center' vAlignContent='center' className='mr-16'>
                        <ConfirmationNumberOutlinedIcon style={stylesheet.rewardSvgIconStyle} />
                        <span className='highEmphasis body3 ml-5'>{luckyNumbers}</span>
                    </FlexView>

                    <FlexView hAlignContent='center' vAlignContent='center'>
                        <EventsOutlinedIcon style={stylesheet.rewardSvgIconStyle} />
                        <span className='highEmphasis body3 ml-5'>{prizes}</span>
                    </FlexView>
                </FlexView>
            </FlexView>
        </Paper>
    );
}

UserParticipationSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string,
    updateTotalRewardEarnedData: PropTypes.func
};