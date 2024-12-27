import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import FlexView from "react-flexview";

import InfoIcon from '@material-ui/icons/InfoOutlined';

import GeneralUtilities from "../../../Services/GeneralUtilities";
import GamificationService from '../../../Services/Gamification/GamificationService';
import { REWARD_TYPE_LUCKY_NUMBER } from '../../../Services/Gamification/GamificationTerms';

export default function ProgramSummarySection(props) {
    useEffect(() => {
        GamificationService.setUserMomentTimezone();
    }, []);

    const { state, localeObj, styles, drawDelayed } = props;
    const { programData, wonDetailsScreen } = state;
    const stylesheet = {
        ...styles,
        programDetailSummary: {
            textAlign: "left", 
            position: "relative",
            width: "100%",
            marginBottom: '1rem'
        },
    };

    let programExpiresIn, programEndDate = null;
    let programName = programData.programName;
    let programDescription = programData.programDescription;
    let programStatus = localeObj.status_running;
    const rewardType = programData.rewardType;

    if (wonDetailsScreen) {
        programDescription = drawDelayed ? localeObj.draw_delayed : localeObj.draw_closed;
        programStatus = drawDelayed ? localeObj.draw_delayed_status : localeObj.program_draw_closed;
        programName = GamificationService.getFormattedDrawTitle(programData);
    } else {
        programEndDate = moment(programData.programEndDate);
        programExpiresIn = programEndDate.diff(moment(), "days");
    }

    return (
        <div style={stylesheet.programDetailSummary}>
            <div className="headline8 highEmphasis">{programName}</div>
            <div className={`textUppercase overline ${wonDetailsScreen ? 'errorRed' : 'accent'}`}>{programStatus}</div>
            <div className="body2 mediumEmphasis mt-10 mb-10">{programDescription}</div>

            {
                !wonDetailsScreen
                && [REWARD_TYPE_LUCKY_NUMBER].includes(rewardType)
                && <FlexView style={{ alignItems: 'center' }}>
                    <InfoIcon style={{ ...stylesheet.rewardSvgIconStyle, width: '1.125rem' }} />
                    <div className="CaptionBold highEmphasis">
                        {
                            programExpiresIn > 0
                            ? GeneralUtilities.formattedString(localeObj.program_expires_in, [programExpiresIn])
                            : localeObj.expires_today
                        }
                    </div>
                </FlexView>
            }
        </div>
    );
}

ProgramSummarySection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    drawDelayed: PropTypes.bool
};