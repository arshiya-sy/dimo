import React from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";

import PageNames from '../../../Services/PageNames';
import constantObjects from '../../../Services/Constants';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import GamificationService from '../../../Services/Gamification/GamificationService';
import SecondaryButtonComponent from '../../CommonUxComponents/SecondaryButtonComponent';

import UserIcon from "../../../images/GamificationImages/common/user.png";
import TrophyIcon from "../../../images/GamificationImages/common/trophy.png";
import TicketImage from "../../../images/GamificationImages/luckyNumber/ticket.png";
import DrawDelayedBgImage from "../../../images/GamificationImages/draw/draw-delayed-bg.png";
import GoldenTicketImage from "../../../images/GamificationImages/luckyNumber/golden-ticket.png";

const screenWidth = window.screen.width;
const screenHeight = window.screen.height;

export default function WinnerDetailsSection(props) {
    const { state, localeObj, styles, drawDelayed, wonLuckyNumber, moveToNextScreen } = props;
    const { programData } = state;
    const stylesheet = {
        ...styles,
        rewardRedeemBtnStyle: {
            maxWidth: screenWidth * 0.7,
            width: 'max-content',
            padding: '0.625rem 1.5rem',
            marginTop: '0.75rem'
        },
        drawDelayedCardStyle: {
            paddingInline: 24,
            backgroundImage: `url(${DrawDelayedBgImage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            minHeight: `${(screenHeight *  0.232)/16}rem`
        },
        drawnNumberContStyle: { 
            position: 'relative', 
            paddingInline: '0.25rem', 
            alignSelf: 'center', 
            marginBlock: '1rem' 
        },
        goldenTicketNumberStyle: { 
            color: '#967850'
        },
    };

    const currentUserWon = programData.won;
    const formattedLN = GamificationService.getDisplayTicketString(wonLuckyNumber);
    let programRewardCardStyle = stylesheet.programRewardCardStyle;
    let programRewardDivSection = { marginBlock: ".75rem", lineHeight: '1.4rem' };

    if (drawDelayed) {
        programRewardCardStyle = { ...programRewardCardStyle, ...stylesheet.drawDelayedCardStyle };
        programRewardDivSection = { ...programRewardDivSection, maxWidth: '75%', marginInline: 'auto' };
    }

    const moveToNextScreenHandler = () => {
        let redirectPath =  '/rewardWinner';
        let eventType = constantObjects.Gamification.seeDrawWinner;

        if (currentUserWon) {
            redirectPath = '/redeemReward';
            eventType = constantObjects.Gamification.redeemDrawReward;
        }

        GeneralUtilities.sendActionMetrics(PageNames.GamificationComponent.draw_details, eventType);
        moveToNextScreen(redirectPath);
    }

    return (
        <FlexView
            column className='px-24'
            style={{ ...programRewardCardStyle, textAlign: 'center' }}
        >
            <div style={programRewardDivSection}>
                {/* Draw Title Section */}
                <div className="textUppercase overline highEmphasis mb-10">
                    {drawDelayed ? localeObj.draw_pending_title : localeObj.drawn_lucky_number}
                </div>

                {
                    !drawDelayed
                    && <>
                        {/* Lucky Number Ticket Section */}
                        <FlexView style={stylesheet.drawnNumberContStyle}>
                            <img
                                className={currentUserWon ? 'wonGoldenTicketNumber' : 'wonNormalTicketNumber'}
                                src={currentUserWon ? GoldenTicketImage : TicketImage}
                                alt="" style={{ width: '50%', marginInline: 'auto' }}
                            />
                            <div
                                className="body3 highEmphasis w-100 p-5"
                                style={
                                    currentUserWon
                                        ? { ...stylesheet.ticketNumberStyle, ...stylesheet.goldenTicketNumberStyle } 
                                        : stylesheet.ticketNumberStyle
                                }
                            >
                                {formattedLN}
                            </div>
                        </FlexView>
                        
                       {/* Winner Subtitle Section */}
                        <div className="body2 highEmphasis" style={{ paddingInline: '0.625rem' }}>
                            {
                                currentUserWon
                                    ? (!programData.isRedeemed ? localeObj.won_program : localeObj.won_already_redeemed)
                                    : localeObj.not_won_program
                            }
                        </div>
                    </>
                }
                
                {/* Draw Subtitle Section */}
                {
                    drawDelayed
                    && <div className="headline5 highEmphasis">{localeObj.draw_pending_subtitle}</div>
                }

                {/* Reward Redeem Button Section */}
                {
                    !programData.isRedeemed
                    && (
                        currentUserWon
                        || (!currentUserWon && GeneralUtilities.isNotEmpty(programData.wonUserName))
                    )
                    && <SecondaryButtonComponent
                        onCheck={moveToNextScreenHandler}
                        styles={stylesheet.rewardRedeemBtnStyle}
                        btn_text={(
                            <FlexView style={{ alignItems: 'center', textAlign: 'center' }}>
                                <img 
                                    src={currentUserWon ? TrophyIcon : UserIcon} alt=''
                                    style={{ ...stylesheet.rewardSvgIconStyle, width: '1rem' }}
                                />
                                <div className="body2 highEmphasis">
                                    {currentUserWon ? localeObj.redeem_reward : localeObj.see_winner}
                                </div>
                            </FlexView>
                        )}
                    />
                }
            </div>
        </FlexView>
    );
}

WinnerDetailsSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    drawDelayed: PropTypes.bool,
    localeObj: PropTypes.object,
    wonLuckyNumber: PropTypes.string,
    moveToNextScreen: PropTypes.func,
};