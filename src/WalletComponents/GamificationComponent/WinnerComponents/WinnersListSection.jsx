import React from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";

import { Card } from "@mui/material";

import ColorPicker from "../../../Services/ColorPicker";
import constantObjects from '../../../Services/Constants';
import GeneralUtilities from "../../../Services/GeneralUtilities";
import GamificationService from '../../../Services/Gamification/GamificationService';

import StarTicketIcon from "../../../images/GamificationImages/common/star-ticket.png";
import NumberDrawnShimmerGif from "../../../images/GamificationImages/shimmer/number-drawn-shimmer.gif";

export default function WinnersListSection(props) {
    const { state, localeObj, styles, openDetailSection } = props;
    const { wonProgramListLoading, processing, wonProgramsData } = state;
    const stylesheet = {
        ...styles,
        shimmerCardStyle: {
            width: '100%',
            height: 'min-content',
            borderRadius: '1.25rem'
        },
        drawnNumberBoxStyle: {
            backgroundColor: '#0D2944',
            borderRadius: "0.438rem",
            width: 'auto',
            padding: '1rem 1.5rem',
            alignItems: 'center',
            textAlign: 'center'
        },
        rewardIconStyle: {
            width: "1rem",
            verticalAlign: "middle",
            fill: ColorPicker.white,
            height: "max-content",
            marginRight: "0.3125rem"
        },
    };

    return (
        <>
            {
                wonProgramListLoading && !processing
                && <div style={stylesheet.shimmerCardConStyle}>
                    <img src={NumberDrawnShimmerGif} style={stylesheet.shimmerCardStyle} alt="" />
                </div>
            }
            {
                !wonProgramListLoading
                && GeneralUtilities.isNotEmpty(wonProgramsData, false)
                && wonProgramsData.map((wonProgram, wonProgramIndex) => {
                    let wonLuckyNumber = GamificationService.getDisplayTicketString(wonProgram.wonLuckyNumber);
                    const drawDelayed = !GeneralUtilities.isNotEmpty(wonLuckyNumber, false);
                    const drawTitle = GamificationService.getFormattedDrawTitle(wonProgram);
                    const drawStatus = drawDelayed ? localeObj.draw_delayed_status : localeObj.program_draw_closed;
                    const drawDescription = drawDelayed ? localeObj.draw_delayed : localeObj.draw_closed;

                    if (!GamificationService.checkToShowDrawDelayed(wonProgram)) { return null; }
                    if (drawDelayed) { wonLuckyNumber = localeObj.draw_delayed_update; }

                    return (
                        <Card
                            key={wonProgramIndex} align="left" elevation={0} 
                            style={{ ...stylesheet.rewardListCard, padding: "1rem 1.5rem" }}
                            onClick={() => openDetailSection(wonProgram, constantObjects.Gamification.programDetails, { wonDetailsScreen: true })}
                        >
                            <div style={{ textAlign: "left", width: "100%" }}>
                                <div className="headline6 highEmphasis truncateCharacters">{drawTitle}</div>
                                <div className="textUppercase overline errorRed mt-5">{drawStatus}</div>
                                <div className="body2 mediumEmphasis" style={{ marginBlock: '0.625rem 0.938rem' }}>{drawDescription}</div>
                            </div>
                            <div style={stylesheet.drawnNumberBoxStyle}>
                                <FlexView vAlignContent='center' hAlignContent='center'>
                                    <img src={StarTicketIcon} style={stylesheet.rewardIconStyle} alt='' />
                                    <div className="subtitle4 highEmphasis">{localeObj.number_drawn}</div>
                                </FlexView>
                                <div className="headline5 highEmphasis mt-5">{wonLuckyNumber}</div>
                            </div>
                        </Card>
                    );
                })
            }
        </>
    );
}

WinnersListSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    openDetailSection: PropTypes.func,
};