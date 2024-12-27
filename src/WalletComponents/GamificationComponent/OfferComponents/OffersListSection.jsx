import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import { Card } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider } from "@material-ui/core/styles";

import PageNames from '../../../Services/PageNames';
import DBService from '../../../Services/DBService';
import InputThemes from '../../../Themes/inputThemes';
import ColorPicker from "../../../Services/ColorPicker";
import constantObjects from '../../../Services/Constants';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import DomRenderComponent from '../../EngageCardComponent/DomRenderComponent';
import ScratchCardWrapper from '../../ScratchCardComponent/ScratchCardWrapper';
import { CUSTOM_BRUSH_PRESET } from '../../ScratchCardComponent/ScratchCardCanvas';

const snackBarTheme = InputThemes.snackBarTheme;

export default function OffersListSection(props) {
    const { state, localeObj, styles, noRewardContent, updateOfferCardsData, startScrollHandler, stopScrollHandler } = props;
    const { initialCanScrollTabContent } = state;

    const offerCardRef = useRef(null);
    const [isSnackBarOpen, setIsSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [offerCardsData, setOfferCardsData] = useState(state.offerCardsData);
    const [scratchedCards, setScratchedCards] = useState([]);
    const [offerCardWidth, setOfferCardWidth] = useState(0);

    useEffect(() => {
        setScratchedCards(DBService.getScratchedCards());
    }, []);

    useEffect(() => {
        setOfferCardsData(props.state.offerCardsData);
    }, [props.state.offerCardsData]);

    useLayoutEffect(() => {
        setOfferCardWidth(offerCardRef?.current?.offsetWidth);
    }, []);

    const stylesheet = {
        ...styles,
        cardScrollStyle: {
            width: '100%',
            height: "11rem",
            position: "relative",
            marginBottom: "1rem",
            borderRadius: '0.5rem',
            backgroundColor: ColorPicker.disableBlack
        },
    };

    const removeCardFromOffers = async (offerCardId) => {
        if (GeneralUtilities.isNotEmpty(offerCardsData, false)) {
            const offersListData = offerCardsData.filter((offerCardData) => offerCardData.id !== offerCardId);
            updateOfferCardsData(offersListData);
        }
    }

    const onclickEngageCardsHandler = (action) => GeneralUtilities.onclickEngageCards(action, PageNames.GamificationComponent.offer_cards_list);

    const cardScratchCompleted = (storyId) => {
        setScratchedCards(prevScratchedCards => [...prevScratchedCards, storyId]);

        initialCanScrollTabContent && startScrollHandler();
    };

    const cardScratchAttempted = () => initialCanScrollTabContent && stopScrollHandler();

    const openSnackBar = (message) => {
        setIsSnackBarOpen(true);
        setSnackBarMessage(message);
    }

    const closeSnackBar = () => setIsSnackBarOpen(false);

    return (
        <>
            <Grid container>
                {/* All User Earned Reward Section */}
                {
                    GeneralUtilities.isNotEmpty(offerCardsData, false)
                    && <div className='highEmphasis subtitle4 mb-16'>{localeObj.offers_for_you}</div>
                }
                {
                    GeneralUtilities.isNotEmpty(offerCardsData, false)
                    && offerCardsData.map((offerCardData, offerCardIndex) => {
                        offerCardData.removeStoryFromCards = (storyId) => removeCardFromOffers(storyId);
                        offerCardData.openSnackBar = (message) => openSnackBar(message);

                        const storyDomObject = offerCardData.dom;
                        const hasScratchCard =
                            GeneralUtilities.isNotEmpty(storyDomObject, false)
                            && GeneralUtilities.isNotEmpty(storyDomObject.scratchCover, false)
                            && storyDomObject.scratchcard
                            && !scratchedCards.includes(offerCardData.id);

                        const domRenderElement = (
                            <Card ref={offerCardRef} style={stylesheet.cardScrollStyle} key={offerCardIndex}>
                                <DomRenderComponent
                                    index={offerCardIndex}
                                    length={offerCardsData.length}
                                    storydom={offerCardData}
                                    onclickEngageCards={onclickEngageCardsHandler}
                                />
                            </Card>
                        );

                        if (hasScratchCard) {
                            const width = offerCardWidth;
                            const height = 11 * 16;
                            const scratchCardWrapperData = {
                                width,
                                height,
                                image: storyDomObject.scratchCover,
                                customBrush: CUSTOM_BRUSH_PRESET,
                                finishPercent: 40,
                                cardScratchAttempted,
                                cardScratchCompleted,
                                initialScratchCardHandler: () => { },
                                card: offerCardData,
                                scratchedCards,
                                borderRadius: 'unset'
                            };

                            return (
                                <div
                                    className="hasScratchCard" key={offerCardIndex}
                                    data-index={offerCardIndex} data-story={offerCardData.id}
                                    style={{ width: '100%', height, marginBottom: '1rem' }}
                                >
                                    <ScratchCardWrapper {...scratchCardWrapperData}>{domRenderElement}</ScratchCardWrapper>
                                </div>
                            );
                        }

                        return domRenderElement;
                    })
                }

                {/* No Reward Earned By User Section */}
                {
                    !GeneralUtilities.isNotEmpty(offerCardsData, false)
                    && noRewardContent(localeObj.no_offers)
                }
            </Grid>

            <MuiThemeProvider theme={snackBarTheme}>
                <Snackbar
                    open={isSnackBarOpen}
                    autoHideDuration={constantObjects.SNACK_BAR_DURATION}
                    onClose={closeSnackBar}
                >
                    <MuiAlert elevation={6} variant="filled" icon={false}>{snackBarMessage}</MuiAlert>
                </Snackbar>
            </MuiThemeProvider>
        </>
    );
}

OffersListSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    noRewardContent: PropTypes.any,
    stopScrollHandler: PropTypes.func,
    startScrollHandler: PropTypes.func,
    updateOfferCardsData: PropTypes.func,
};