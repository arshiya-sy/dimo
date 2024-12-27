import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";
import Carousel from "react-multi-carousel";

import Paper from '@material-ui/core/Paper';
import PersonIcon from '@mui/icons-material/Person';
import TicketIcon from '@mui/icons-material/ConfirmationNumberOutlined';

import ColorPicker from "../../../Services/ColorPicker";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import ShimmerComponent from '../../CommonUxComponents/ShimmerComponent';

import "react-multi-carousel/lib/styles.css";

export default function DrawOverviewSection(props) {
    const carouselRef = useRef();
    const [drawHistoryData, setDrawHistoryData] = useState([]);

    const { state, localeObj, styles, openDrawHistoryScreen } = props;
    const { drawHistoryData: fetchedDrawsData, fetchingDrawHistoryData } = state;
    let drawHistoryIndex = drawHistoryData.length;

    useEffect(() => {
        const formattedDrawsData = GeneralUtilities.isNotEmpty(fetchedDrawsData) ? fetchedDrawsData.slice(1, 3) : [];
        setDrawHistoryData(formattedDrawsData);
    }, [fetchedDrawsData]);

    const stylesheet = {
        ...styles,
        programDrawCardStyle: {
            borderRadius: "1rem",
            backgroundColor: ColorPicker.rewardCardBg
        },
        programDrawBtnStyle: {
            borderRadius: "1rem",
            backgroundColor: ColorPicker.rewardCardBgLight
        },
        ticketSvgIconStyle: {
            fontSize: "1rem",
            fill: ColorPicker.accent
        },
        personSvgIconStyle: {
            fontSize: "1rem",
            fill: ColorPicker.darkHighEmphasis,
            marginTop: '-2px'
        }
    };

    return (
        <div className='py-24'>
            <FlexView className='mb-16 px-24' vAlignContent='center' style={{ justifyContent: "space-between" }}>
                <span className='highEmphasis subtitle4'>{localeObj.previous_draw_overview}</span>
                <span className='highEmphasis subtitle4 text-underline' onClick={() => openDrawHistoryScreen()}>{localeObj.see_all_overview}</span>
            </FlexView>

            {
                fetchingDrawHistoryData
                && <ShimmerComponent
                    loadingComponents={[
                        {name: "title", classNames: "br-16 w-75"},
                        {name: "subtitle", classNames: "mt-5 br-16 w-50"},
                        {name: "header", classNames: "mt-10 br-16"}
                    ]}
                    containerClasses={{ pageClassNames: "pt-10", containerClassNames: "mx-24 br-16 p-16" }}
                />
            }

            {
                !fetchingDrawHistoryData
                && GeneralUtilities.isNotEmpty(drawHistoryData)
                && <Carousel
                    ref={carouselRef}
                    responsive={GeneralUtilities.getCarouselBreakPoint()}
                    swipeable={true}
                    draggable={true}
                    autoPlay={false}
                    infinite={false}
                    arrows={false}
                    showDots={drawHistoryData.length > 1}
                    keyBoardControl={true}
                    containerClass="carousel-container"
                    dotListClass="custom-dot-list-style"
                    itemClass={`carousel-item-padding pb-${drawHistoryData.length > 1 ? '24' : '0'}`}
                >
                    {
                        drawHistoryData.map((drawData, drawIndex) => {
                            const { drawId, rewardsCount } = drawData;
                            const drawName = GeneralUtilities.formattedString(localeObj.history_program_title, [drawHistoryIndex]);
                            const formattedEarnedLN = GeneralUtilities.formattedString(localeObj.overview_earned_ln, [rewardsCount]);
                            --drawHistoryIndex;

                            return (
                                <Paper key={drawIndex} style={stylesheet.programDrawCardStyle} className='px-24 py-16 mt-10 mx-24' elevation={0}>
                                    <div>
                                        <div className='highEmphasis body3'>{drawName}</div>

                                        <FlexView vAlignContent='center' className='mt-5'>
                                            <TicketIcon style={stylesheet.ticketSvgIconStyle} />    
                                            <div className='highEmphasis button2 ml-5' style={{opacity:'65%'}}>{formattedEarnedLN}</div>
                                        </FlexView>
                                    </div>

                                    <Paper style={stylesheet.programDrawBtnStyle} className='mt-10 px-24 py-10' elevation={0}>
                                        <FlexView vAlignContent="center" hAlignContent='center' align="center" onClick={() => openDrawHistoryScreen(drawId)}>
                                            <PersonIcon style={stylesheet.personSvgIconStyle} />
                                            <span className='highEmphasis CaptionBold ml-5'>{localeObj.check_winner_overview}</span>
                                        </FlexView>
                                    </Paper>
                                </Paper>
                            )
                        })
                    }
                </Carousel>
            }
        </div>
    );
}

DrawOverviewSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string,
    openDrawHistoryScreen: PropTypes.func
};