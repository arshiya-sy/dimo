import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import FlexView from "react-flexview";

import { Card } from "@mui/material";
import Grid from "@material-ui/core/Grid";

import ColorPicker from "../../../Services/ColorPicker";
import constantObjects from '../../../Services/Constants';
import TasksListSection from '../TaskComponents/TasksListSection';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import GamificationService from '../../../Services/Gamification/GamificationService';
import { REWARD_TYPE_LUCKY_NUMBER } from '../../../Services/Gamification/GamificationTerms';

import TimerIcon from "../../../images/GamificationImages/common/timer.png";
import TrophyIcon from "../../../images/GamificationImages/common/trophy.png";

export default function ProgramsListSection(props) {
    useEffect(() => {
        GamificationService.setUserMomentTimezone();
    }, [])

    const { state, localeObj, styles, openDetailSection } = props;
    const { ongoingProgramData } = state;
    const stylesheet = {
        ...styles,
        prizeTimerBoxStyle: { 
            position: "relative", 
            paddingTop: "0.5rem", 
            paddingBottom: "1.5rem",
            display: 'flex',
            justifyContent: 'center'
        },
        prizeTimerContStyle: {
            display: 'flex',
            justifyContent: 'center'
        },
        prizeTimerHeaderCont: { 
            display: 'flex',
            flexDirection: 'column',
            height: `100%`, 
            backgroundColor: "#12314E",
            borderRadius: ".5rem"
        },
        prizeTimerCard: { 
            height: `1.375rem`, 
            width: `1.07rem`, 
            backgroundColor: ColorPicker.surface3,
            borderRadius: ".3rem"
        },
    };

    return (
        <>
            {
                GeneralUtilities.isNotEmpty(ongoingProgramData, false)
                && ongoingProgramData.map((programData, programDataIndex) => {
                    const rewardType = programData.rewardType;
                    const programTitle = programData.programName;
                    const momentDescription = programData.momentDescription;
                    const programStatus = localeObj.status_running;
                    const prizeUrl = programData.prizeDetails.prizeImageUrl;
                    const programDrawDate = moment(programData.drawDate);
                    const todayDate = moment();
                    const drawRemainingDays = programDrawDate.diff(todayDate, "days");
                    const drawRemainingHours = 24 - moment().hour();

                    return (
                        <Card
                            align="left" key={programDataIndex}
                            style={stylesheet.rewardListCard} elevation={0} 
                            onClick={() => openDetailSection(programData, constantObjects.Gamification.programDetails, { isRunningProgram: true })}
                        >
                            <div style={{ padding: "1rem 1.5rem", paddingBottom: 0 }}>
                                <div style={{ textAlign: "left", position: "relative", width: "100%" }}>
                                    <div className="headline6 highEmphasis">{programTitle}</div>
                                    <div className="textUppercase overline accent mt-5">{programStatus}</div>
                                    <div className="body2 mediumEmphasis my-10">{momentDescription}</div>
                                </div>
                            </div>

                            {/* Program Prize Details Section */}
                            {
                                [REWARD_TYPE_LUCKY_NUMBER].includes(rewardType)
                                && <div className="rewardPrizeSection" style={stylesheet.prizeTimerBoxStyle}>
                                    <Grid container spacing={1} style={stylesheet.prizeTimerContStyle}>
                                        <Grid item xs={5}>
                                            <Card align="center" style={stylesheet.prizeTimerHeaderCont} elevation={0}>
                                                <FlexView align="center" hAlignContent='center' vAlignContent='center' className='px-5 py-10'>
                                                    <div className='mr-5 lh-0'><img src={TrophyIcon} style={{ width: '.875rem' }} alt="" /></div>
                                                    <div className="CaptionBold highEmphasis">{localeObj.prize}</div>
                                                </FlexView>
                                                <hr style={{ margin: 0, borderColor: "#74889B" }} />
                                                <FlexView className='p-10' column hAlignContent='center' vAlignContent='center' style={{ height: '100%' }}>
                                                    <img src={prizeUrl} style={{ width: '4rem' }} alt="" />
                                                </FlexView>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={5}>
                                            <Card align="center" style={stylesheet.prizeTimerHeaderCont} elevation={0}>
                                                <FlexView align="center" hAlignContent='center' vAlignContent='center' className='px-5 py-10'>
                                                    <div className='mr-5 lh-0'><img src={TimerIcon} style={{ width: '.75rem' }} alt="" /></div>
                                                    <div className="CaptionBold highEmphasis">{localeObj.draw_time_remaining}</div>
                                                </FlexView>
                                                <hr style={{ margin: 0, borderColor: "#74889B" }} />
                                                <FlexView className='p-10' column hAlignContent='center' vAlignContent='center' style={{ height: '100%' }}>
                                                    <div className="CaptionBold highEmphasis text-center">{localeObj.draw_count_down}</div>
                                                    <FlexView align="center" className='py-10'>
                                                        <FlexView>
                                                            <Card align="center" className='mr-5' style={stylesheet.prizeTimerCard} elevation={0}>
                                                                <span className="body2 highEmphasis">{Math.floor(drawRemainingDays / 10)}</span>
                                                            </Card>
                                                            <Card align="center" style={stylesheet.prizeTimerCard} elevation={0}>
                                                                <span className="body2 highEmphasis">{drawRemainingDays % 10}</span>
                                                            </Card>
                                                        </FlexView>
                                                        <span className="body2 highEmphasis mx-5">:</span>
                                                        <FlexView>
                                                            <Card align="center" className='mr-5' style={stylesheet.prizeTimerCard} elevation={0}>
                                                                <span className="body2 highEmphasis">{Math.floor(drawRemainingHours / 10)}</span>
                                                            </Card>
                                                            <Card align="center" style={stylesheet.prizeTimerCard} elevation={0}>
                                                                <span className="body2 highEmphasis">{drawRemainingHours % 10}</span>
                                                            </Card>
                                                        </FlexView>
                                                    </FlexView>
                                                    <FlexView align="center">
                                                        <span className="body2 highEmphasis textUppercase">{localeObj.days}</span>
                                                        <span className='mx-5'>&nbsp;</span>
                                                        <span className="body2 highEmphasis textUppercase">{localeObj.hours}</span>
                                                    </FlexView>
                                                </FlexView>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                </div>
                            }

                            {/* Program Task List Section */}
                            <TasksListSection localeObj={localeObj} programData={programData} styles={stylesheet} />
                        </Card>
                    );
                })
            }
        </>
    );
}

ProgramsListSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    openDetailSection: PropTypes.func
};