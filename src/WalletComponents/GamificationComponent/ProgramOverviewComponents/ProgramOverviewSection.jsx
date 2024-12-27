import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import FlexView from "react-flexview";

import Paper from '@material-ui/core/Paper';
import NextIcon from '@material-ui/icons/ArrowForwardIos';
import HelpIcon from '@mui/icons-material/LiveHelpOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import TrophyIcon from '@mui/icons-material/EmojiEventsOutlined';

import ColorPicker from "../../../Services/ColorPicker";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import ShimmerComponent from '../../CommonUxComponents/ShimmerComponent';
import AllCouponsComponent from '../CouponComponents/AllCouponsComponent';
import GamificationAPIs from '../../../Services/Gamification/GamificationAPIs';
import GamificationService from '../../../Services/Gamification/GamificationService';
import { REWARD_TYPE_COUPON, REWARD_TYPE_LUCKY_NUMBER } from '../../../Services/Gamification/GamificationTerms';

export default function ProgramOverviewSection(props) {
    let couponsListData = [];
    const parentBackButtonAction = window.onBackPressed;
    const [processing, setProcessing] = useState(false);
    const [sectionData, setSectionData] = useState({});
    const [fetchingCoupons, setFetchingCoupons] = useState(false);
    const [userEarnedCouponsData, setUserEarnedCouponsData] = useState([]);
    const [showCouponsBottomSheet, setShowCouponsBottomSheet] = useState(false);

    const { 
        state, localeObj, styles, fromComponent, openDrawHistoryScreen,
        openRedeemCouponScreen, openRewardOnboardingScreen, updateDrawHistoryData
    } = props;
    const { programData, fetchingTotalRewardEarnedData, totalRewardEarned } = state;

    const noParticipationUi = () => {
        return (<div className='mt-16 px-24 highEmphasis Body2'>{localeObj.overview_didnt_participated}</div>);
    }

    useEffect(() => {
        GamificationService.setUserMomentTimezone();
    }, []);

    const initializeInitialData = async () => {
        const { programId, programName, programEndDate, rewardType } = programData;
        const programEndedOn = GeneralUtilities.formattedString(localeObj.overview_end_on, [moment(programEndDate).fromNow()]);

        let title = programName, subTitle = programEndedOn, btnIcon = "", btnIconText = "";
        let btnOnClick = () => {};

        switch (rewardType) {
            case REWARD_TYPE_COUPON:
                btnIcon = (<TrophyIcon style={stylesheet.overviewBtnIconStyle} />);
                btnOnClick = () => openCouponsBottomSheet();

                setSectionData((prevState) => ({ ...prevState, title, subTitle, btnIcon, btnOnClick }));
                break;
            case REWARD_TYPE_LUCKY_NUMBER:
            default:
                setProcessing(true);
                updateDrawHistoryData([]);
        
                const fetchedDrawHistoryData = await GamificationAPIs.fetchCompletedDrawHistoryListAPI(programId);

                fetchedDrawHistoryData.sort().reverse();

                updateDrawHistoryData(fetchedDrawHistoryData);
                setProcessing(false);

                if (GeneralUtilities.isNotEmpty(fetchedDrawHistoryData?.[0])) {
                    const { drawId } = fetchedDrawHistoryData?.[0];

                    title = GeneralUtilities.formattedString(localeObj.history_program_title, [fetchedDrawHistoryData.length]);
                    btnOnClick = () => openDrawHistoryScreen(drawId);
                }

                btnIcon = (<PersonIcon style={stylesheet.overviewBtnIconStyle} />);
                btnIconText = localeObj.overview_see_winner;

                setSectionData((prevState) => ({ ...prevState, title, subTitle, btnIcon, btnIconText, btnOnClick }));
        }
    }

    const updateSectionData = () => {
        const { state } = props;
        const { totalRewardEarned } = state;
        const { rewardType } = programData;

        let btnIcon = "", btnIconText = "";
        let noParticipationSection = <></>, btnOnClick = () => {};

        switch (rewardType) {
            case REWARD_TYPE_COUPON:
                setProcessing(fetchingTotalRewardEarnedData);

                btnIconText = GeneralUtilities.formattedString(localeObj.overview_earned_coupons, [totalRewardEarned]);
                
                if (totalRewardEarned === 0) {
                    noParticipationSection = noParticipationUi();
                    btnIcon = (<HelpIcon style={stylesheet.overviewBtnIconStyle} />);
                    btnIconText = localeObj.overview_how_to_participate;
                    btnOnClick = () => openRewardOnboardingScreen();

                    setSectionData((prevState) => ({ ...prevState, btnIcon, btnOnClick }));
                }

                setSectionData({ ...sectionData, btnIconText, noParticipationSection });
                setProcessing(fetchingTotalRewardEarnedData);
                break;
            case REWARD_TYPE_LUCKY_NUMBER:
            default:
                if (totalRewardEarned === 0) {
                    noParticipationSection = noParticipationUi();
                }

                setSectionData((prevState) => ({ ...prevState, noParticipationSection }));
        }
    }

    useEffect(() => {
        initializeInitialData();
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [programData]);

    useEffect(() => {
        updateSectionData();
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [programData, fetchingTotalRewardEarnedData, totalRewardEarned]);

    const stylesheet = {
        ...styles,
        programOverviewBtnStyle: {
            borderRadius: "2rem",
            width: "max-content",
            marginInline: "auto",
            backgroundColor: ColorPicker.lightEmphasis
        },
        overviewBtnIconStyle: {
            fill: ColorPicker.accent
        },
        overviewBtnNextIconStyle: {
            width: "1rem",
            fill: ColorPicker.accent,
        },
    };

    const openCouponsBottomSheet = async () => {
        if (GeneralUtilities.isNotEmpty(couponsListData)) {
            setShowCouponsBottomSheet(true);
            return;
        }

        setFetchingCoupons(true);
        setShowCouponsBottomSheet(true);

        let { programStartDate, programEndDate, programId } = programData;
        programStartDate = moment(programStartDate).format('YYYY-MM-DD');
        programEndDate = moment(programEndDate).format('YYYY-MM-DD');

        const fetchedEarnedCouponsData = await GamificationAPIs.fetchUserEarnedCouponsListAPI(programId, programStartDate, programEndDate);
        
        setFetchingCoupons(false);
        couponsListData = fetchedEarnedCouponsData;
        setUserEarnedCouponsData(fetchedEarnedCouponsData);
    }

    const openRedeemPrizeScreen = (couponData) => {
        closeBottomSheetHandler();
        openRedeemCouponScreen(couponData);
    }

    const closeBottomSheetHandler = () => {
        setShowCouponsBottomSheet(false);

        window.onBackPressed = () => parentBackButtonAction();
    }

    if (processing) {
        return (<ShimmerComponent
            loadingComponents={[
                {name: "header", classNames: "br-16"},
                {name: "subtitle", classNames: "mt-5 br-16"},
                {name: "btn", classNames: "mt-16 br-24"}
            ]}
            containerClasses={{ pageClassNames: "mt-24", containerClassNames: "mx-24 br-24 p-16" }}
        />);
    }

    const { title, subTitle, btnIcon, btnIconText, btnOnClick, noParticipationSection } = sectionData;

    return (
        <>
            <div className='mt-24 px-24 text-center'>
                <div className='highEmphasis headline8'>{title}</div>
                <div className='highEmphasis button2' style={{ opacity: "65%" }}>{subTitle}</div>

                { noParticipationSection }

                <Paper 
                    className='mt-16' elevation={0}
                    style={stylesheet.programOverviewBtnStyle}
                    onClick={btnOnClick}
                >
                    <FlexView
                        hAlignContent='center' vAlignContent='center'
                        className='px-24 py-16' style={{ position: "relative", justifyContent: 'space-between' }}
                    >
                        <FlexView hAlignContent='center' vAlignContent='center'>
                            {btnIcon} <span className='highEmphasis Body2 ml-10'>{btnIconText}</span>
                        </FlexView>

                        <NextIcon className='ml-24' style={stylesheet.overviewBtnNextIconStyle} />
                    </FlexView>
                </Paper>
            </div>

            {/* All Coupons Bottom Sheet */}
            {
                showCouponsBottomSheet
                && <AllCouponsComponent
                    localeObj={localeObj} styles={stylesheet}
                    state={{ programData, processing: fetchingCoupons, userEarnedCouponsData }}
                    fromComponent={fromComponent}
                    openRedeemPrizeScreen={openRedeemPrizeScreen}
                    closeBottomSheetHandler={closeBottomSheetHandler}
                />
            }
        </>
    );
}

ProgramOverviewSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string,
    openDrawHistoryScreen: PropTypes.func,
    openRedeemCouponScreen: PropTypes.func,
    openRewardOnboardingScreen: PropTypes.func,
};