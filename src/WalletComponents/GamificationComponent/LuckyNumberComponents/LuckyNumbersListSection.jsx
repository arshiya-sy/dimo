import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

import Lottie from "lottie-react";
import FlexView from "react-flexview";

import Chip from '@mui/material/Chip';
import Grid from "@material-ui/core/Grid";
import NextIcon from '@material-ui/icons/ArrowForwardIos';

import LNSlotCounter from './LNSlotCounter';
import ColorPicker from "../../../Services/ColorPicker";
import constantObjects from '../../../Services/Constants';
import AllLuckyNumbersComponent from './AllLuckyNumbersComponent';
import GeneralUtilities from "../../../Services/GeneralUtilities";
import androidApiCallsService from '../../../Services/androidApiCallsService';
import GamificationAPIs from '../../../Services/Gamification/GamificationAPIs';
import GamificationService from '../../../Services/Gamification/GamificationService';

import GlowBgJson from "../../../images/GamificationImages/common/glow_bg.json";
import TicketImage from "../../../images/GamificationImages/luckyNumber/ticket.png";
import ShinningTicketJson from "../../../images/GamificationImages/luckyNumber/shining-ticket.json";
import LuckyNumbersShimmerGif from "../../../images/GamificationImages/shimmer/lucky-numbers-shimmer.gif";

export default function LuckyNumbersListSection(props) {
    const [processing, setProcessing] = useState(false);
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [userEarnedLNsData, setUserEarnedLNsData] = useState([]);
    const [newLuckyNumberSet, setNewLuckyNumberSet] = useState([]);

    const { styles, state, fromComponent, localeObj } = props;
    const { programData, wonDetailsScreen, isRunningProgram } = state;
    const { programEndDate } = programData;
    const isProgramExpired = moment().isAfter(moment(programEndDate));

    const stylesheet = {
        ...styles,
        shimmerCardContStyle: {
            textAlign: 'center',
            backgroundColor: ColorPicker.tableBackground,
            lineHeight: 0
        },
        shimmerCardStyle: {
            border: 0,
            width: 'fit-content',
            height: 'min-content'
        },
        luckyNumbersSectionStyle: {
            border: 0,
            borderBlock: "0.125rem solid #00344B",
            alignItems: 'center',
            backgroundColor: ColorPicker.cardBackgroundColor,
            padding: '1rem 2.5rem',
            minHeight: "9rem"
        },
        newLNCountStyle: {
            ...styles.countChipStyle,
            marginLeft: ".875rem",
            position: "unset",
            backgroundColor: ColorPicker.success
        },
        ticketContStyle: {
            position: 'relative',
            paddingInline: '0.25rem',
            alignSelf: 'center',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.625rem'
        }
    };

    useEffect(() => {
        GamificationService.setUserMomentTimezone();
    }, []);

    useEffect(() => {
        const newLNAssignedHandler = (drawDurationEarnedLNData) => {
            const { programId } = programData;

            let drawDurationEarnedLNArray = [];
            let programOldEarnedLNArray = [];
            let allOldEarnedLNArray = androidApiCallsService.getDAStringPrefs('storedEarnedLuckyNumbersData');

            drawDurationEarnedLNData.forEach(
                (luckyNumberData) => drawDurationEarnedLNArray.push(luckyNumberData.luckyNumber)
            );

            try {
                allOldEarnedLNArray = JSON.parse(allOldEarnedLNArray);
            } catch (_) {
                const tempAllOldEarnedLNArray = allOldEarnedLNArray;
                allOldEarnedLNArray = {};
                allOldEarnedLNArray[programId] = tempAllOldEarnedLNArray;
            }

            programOldEarnedLNArray = allOldEarnedLNArray[programId] ?? '';

            if (GeneralUtilities.isNotEmpty(programOldEarnedLNArray)) {
                programOldEarnedLNArray = programOldEarnedLNArray.split(",");
                const newLuckyNumberSetData = drawDurationEarnedLNArray.filter(
                    (luckyNumber) => !programOldEarnedLNArray.includes(luckyNumber)
                );

                setNewLuckyNumberSet(newLuckyNumberSetData);
            }

            allOldEarnedLNArray[programId] = drawDurationEarnedLNArray.toString();
            androidApiCallsService.setDAStringPrefs('storedEarnedLuckyNumbersData', JSON.stringify(allOldEarnedLNArray));
        }

        const fetchUserEarnedLuckyNumbersListData = async () => {
            let { drawStartDate, drawEndDate, programId } = programData;
            drawStartDate = moment(drawStartDate).format('YYYY-MM-DD');
            drawEndDate = moment(drawEndDate).format('YYYY-MM-DD');
            const drawDurationEarnedLNData = await GamificationAPIs.fetchUserEarnedLuckyNumbersListAPI(programId, drawStartDate, drawEndDate);

            setUserEarnedLNsData(drawDurationEarnedLNData);

            !wonDetailsScreen && newLNAssignedHandler(drawDurationEarnedLNData);
        }

        const performInitialLNFetching = async () => {
            setProcessing(true);
            await fetchUserEarnedLuckyNumbersListData();
            setProcessing(false);
        }

        performInitialLNFetching();
    }, [programData, wonDetailsScreen]);

    const maxLuckyNumbersLimit = 4;
    const totalEarnedLuckyNumbers = userEarnedLNsData.length ?? 0;
    const earnedLuckyNumberTitle = `${localeObj.you_earned} ${totalEarnedLuckyNumbers} ${localeObj.lucky_numbers}`;

    const newLNAssignedCheck = (luckyNumberData) => {
        return newLuckyNumberSet?.includes(luckyNumberData.luckyNumber);
    };

    const showAllLNScreenHandler = () => {
        GeneralUtilities.sendActionMetrics(fromComponent, constantObjects.Gamification.seeAllLuckyNumbers);
        setShowBottomSheet(true);
    }

    const closeBottomSheetHandler = () => {
        setShowBottomSheet(false);
    }

    return (
        <>
            {/* Program Earned Lucky Numbers Section */}
            {
                processing
                && <div style={stylesheet.shimmerCardContStyle}>
                    <img src={LuckyNumbersShimmerGif} style={stylesheet.shimmerCardStyle} alt='' />
                </div>
            }
            {
                !processing
                && <FlexView column style={stylesheet.luckyNumbersSectionStyle}>
                    {/* Lucky Number Title Section */}
                    <div style={{ width: "100%", position: 'relative', justifyContent: "center", display: "flex" }}>
                        <div className="subtitle4 highEmphasis">
                            { totalEarnedLuckyNumbers < 1 || !wonDetailsScreen ? localeObj.lucky_numbers : earnedLuckyNumberTitle }
                        </div>

                        {
                            newLuckyNumberSet.length > 0
                            && <Chip
                                className="tagStyle" style={stylesheet.newLNCountStyle}
                                label={`+${newLuckyNumberSet.length} ${localeObj.new}`}
                            />
                        }
                    </div>

                    {
                        wonDetailsScreen
                        && GeneralUtilities.isNotEmpty(userEarnedLNsData, false)
                        && <div className="caption highEmphasis mt-5">{localeObj.this_week_numbers}</div>
                    }

                    {/* Limit Lucky Numbers Ticket Section */}
                    {
                        GeneralUtilities.isNotEmpty(userEarnedLNsData, false)
                        && <Grid container style={{ marginTop: '1.125rem', justifyContent: 'center' }}>
                            {
                                userEarnedLNsData.map((luckyNumberData, luckyNumberIndex) => {
                                    if ((luckyNumberIndex + 1) > maxLuckyNumbersLimit) { return null; }

                                    const formattedLN = GamificationService.getDisplayTicketString(luckyNumberData.luckyNumber);
                                    const newLNAssignedResult = newLNAssignedCheck(luckyNumberData);
                                    const isWonTicket = wonDetailsScreen && luckyNumberData.won;
                                    const isLostTicket = wonDetailsScreen && !luckyNumberData.won;
                                    const isNewTicket = newLNAssignedResult;

                                    return (
                                        <Grid
                                            align="center" item xs={6} key={luckyNumberIndex}
                                            className={isLostTicket ? 'disableReward' : ''}
                                            style={stylesheet.ticketContStyle}
                                        >
                                            {/* Won Or Normal Ticket Section */}
                                            {
                                                !isNewTicket
                                                && <img 
                                                    src={TicketImage} alt="" 
                                                    className={`w-100 z-1 ${isWonTicket ? 'wonNormalTicketNumber' : ''}`}
                                                />
                                            }
                                            
                                            {/* New Ticket Assigned Section */}
                                            {
                                                isNewTicket
                                                && (
                                                    <>
                                                        <Lottie
                                                            animationData={GlowBgJson} loop={true} className='z-0'
                                                            style={{ position: 'absolute', width: '130%', marginLeft: '-18%' }}
                                                        />
                                                        <Lottie 
                                                            animationData={ShinningTicketJson} loop={false} className='w-100 z-1'
                                                        />
                                                    </>
                                                )
                                            }
                                            
                                            {/* Text Animation on LN Section */}
                                            <div className="p-5 w-100 body3 highEmphasis z-2" style={stylesheet.ticketNumberStyle}>
                                               { isNewTicket ? <LNSlotCounter formattedLN={formattedLN} /> : formattedLN }
                                            </div>
                                        </Grid>
                                    );
                                })
                            }
                        </Grid>
                    }

                    {/* All Lucky Numbers Button Section */}
                    {
                        userEarnedLNsData.length > maxLuckyNumbersLimit
                        && <FlexView
                                style={{ alignItems: 'center', marginTop: '1.563rem' }}
                                onClick={showAllLNScreenHandler}
                        >
                            <div className="body2 ligtherAccent" style={{ textDecoration: 'underline' }}>
                                {localeObj.see_numbers}
                            </div>
                            <NextIcon style={{ ...stylesheet.rewardSvgIconStyle, width: '0.625rem', marginLeft: '0.388rem' }} />
                        </FlexView>
                    }

                    {/* No Lucky Number Section */}
                    {
                        !GeneralUtilities.isNotEmpty(userEarnedLNsData, false)
                        && <div className="caption highEmphasis mt-5 mb-5 text-center">
                            {
                                isRunningProgram
                                ? localeObj.no_lucky_number_running
                                : (isProgramExpired && wonDetailsScreen ? localeObj.no_lucky_number_end : localeObj.no_lucky_number_yet)
                            }
                        </div>
                    }
                </FlexView>
            }

            {/* All Lucky Numbers Bottom Sheet */}
            {
                showBottomSheet
                && <AllLuckyNumbersComponent
                    localeObj={localeObj} styles={stylesheet}
                    state={{ processing, wonDetailsScreen, userEarnedLNsData }}
                    closeBottomSheetHandler={closeBottomSheetHandler}
                />
            }
        </>
    );
}

LuckyNumbersListSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string,
    newLNAssignedCheck: PropTypes.func,
    moveToTransitionScreen: PropTypes.func
};