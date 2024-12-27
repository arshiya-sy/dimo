import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import FlexView from "react-flexview";

import Grid from "@material-ui/core/Grid";
import NextIcon from '@material-ui/icons/ArrowForwardIos';

import ColorPicker from "../../../Services/ColorPicker";
import AllCouponsComponent from './AllCouponsComponent';
import SingleCouponSection from './SingleCouponSection';
import constantObjects from '../../../Services/Constants';
import GeneralUtilities from "../../../Services/GeneralUtilities";
import GamificationAPIs from '../../../Services/Gamification/GamificationAPIs';
import GamificationService from '../../../Services/Gamification/GamificationService';
import { INFINITE_TERM_NUMBER, REWARD_TYPE_COUPON } from '../../../Services/Gamification/GamificationTerms';

import CouponsShimmerGif from "../../../images/GamificationImages/shimmer/coupons-shimmer.gif";

export default function CouponsListSection(props) {
    const [processing, setProcessing] = useState(false);
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [userEarnedCouponsData, setUserEarnedCouponsData] = useState([]);
    const parentBackButtonAction = window.onBackPressed;
    const { styles, state, localeObj, fromComponent, fromLocationData } = props;
    const { programData, wonDetailsScreen } = state;
    const { rewardsEligible, prizeDetails = {} } = programData;

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
        ContainerSectionStyle: {
            border: 0,
            borderBlock: "0.125rem solid #00344B",
            alignItems: 'center',
            backgroundColor: ColorPicker.cardBackgroundColor,
            padding: '1.5rem',
            minHeight: "9rem"
        },
        CouponContainerStyle: {
            position: 'relative',
            paddingInline: '0.25rem',
            alignSelf: 'center',
            display: 'flex',
            alignItems: 'center',
            marginBottom: '0.625rem'
        },
        rewardListCard: {
            width: '100%',
            position: "relative",
            marginBottom: "1rem",
            borderRadius: "0.75rem",
            backgroundColor: ColorPicker.newProgressBar,
        },
    };

    useEffect(() => {
        GamificationService.setUserMomentTimezone();

        const fetchUserEarnedCouponsListData = async () => {
            let { programStartDate, programEndDate, programId } = programData;
            programStartDate = moment(programStartDate).format('YYYY-MM-DD');
            programEndDate = moment(programEndDate).format('YYYY-MM-DD');
            const durationEarnedCouponsData = await GamificationAPIs.fetchUserEarnedCouponsListAPI(programId, programStartDate, programEndDate);
            setUserEarnedCouponsData(durationEarnedCouponsData);
        }

        const performInitialCouponsFetching = async () => {
            setProcessing(true);
            await fetchUserEarnedCouponsListData();
            setProcessing(false);
        }

        performInitialCouponsFetching();
    }, [programData, wonDetailsScreen]);

    const maxCouponsLimit = 2;
    const totalEarnedCoupons = userEarnedCouponsData.length ?? 0;
    const earnedCouponsTitle = GeneralUtilities.formattedString(localeObj.earned_coupons, [totalEarnedCoupons]);

    const showAllCouponScreenHandler = () => {
        GeneralUtilities.sendActionMetrics(fromComponent, constantObjects.Gamification.seeAllCoupons);
        setShowBottomSheet(true);
    }

    const closeBottomSheetHandler = () => {
        setShowBottomSheet(false);

        window.onBackPressed = () => parentBackButtonAction();
    }

    const openRedeemPrizeScreen = (couponData) => {
        closeBottomSheetHandler();

        const { prizeGenericImageUrl, prizeTncUrl } = prizeDetails;

        const redirectComponentData = {
            pathname: "/redeemReward",
            fromComponent,
            state: {
                programData: {
                    ...programData,
                    prizeDetails: { ...couponData, prizeType: REWARD_TYPE_COUPON, prizeGenericImageUrl, prizeTncUrl }
                },
                wonDetailsScreen
            }
        };

        GeneralUtilities.sendActionMetrics(fromComponent, constantObjects.Gamification.redeemDrawReward);
        return GeneralUtilities.pushHistoryPath(redirectComponentData, fromLocationData);
    }

    return (
        <>
            {/* Program Earned Coupons Section */}
            {
                processing
                && <div style={stylesheet.shimmerCardContStyle}>
                    <img src={CouponsShimmerGif} style={stylesheet.shimmerCardStyle} alt='' />
                </div>
            }
            {
                !processing
                && <FlexView column style={stylesheet.ContainerSectionStyle}>
                    {/* Coupons Title Section */}
                    <FlexView hAlignContent='center'>
                        <span className="subtitle4 highEmphasis text-center">{localeObj.coupons_received}</span>
                    </FlexView>
                    {
                        GeneralUtilities.isNotEmpty(userEarnedCouponsData, false)
                        && <div className="caption mediumEmphasis mt-5 text-center">{earnedCouponsTitle}</div>
                    }

                    {/* Limit Coupons Section */}
                    {
                        GeneralUtilities.isNotEmpty(userEarnedCouponsData, false)
                        && <Grid container style={{ marginTop: '1.125rem', justifyContent: 'center' }}>
                            {
                                userEarnedCouponsData.map((couponData, couponIndex) => {
                                    if ((couponIndex + 1) > maxCouponsLimit) { return null; }

                                    return (
                                        <SingleCouponSection
                                            key={couponIndex}
                                            localeObj={localeObj} styles={stylesheet}
                                            state={{ programData, couponData, wonDetailsScreen }}
                                            fromComponent={fromComponent}
                                            openRedeemPrizeScreen={() => openRedeemPrizeScreen(couponData)}
                                        />
                                    );
                                })
                            }
                        </Grid>
                    }

                    {/* All Coupons Button Section */}
                    {
                        totalEarnedCoupons > maxCouponsLimit
                        && <FlexView
                            style={{ alignItems: 'center', marginTop: '0.5rem' }}
                            onClick={showAllCouponScreenHandler}
                        >
                            <div className="body2 ligtherAccent" style={{ textDecoration: 'underline' }}>
                                {localeObj.see_all_coupons}
                            </div>
                            <NextIcon style={{ ...stylesheet.rewardSvgIconStyle, width: '0.625rem', marginLeft: '0.388rem' }} />
                        </FlexView>
                    }

                    {/* No Coupons Section */}
                    {
                        !GeneralUtilities.isNotEmpty(userEarnedCouponsData, false)
                        && <div align="center" className="caption highEmphasis mt-5 mb-5">
                            {
                                rewardsEligible >= INFINITE_TERM_NUMBER
                                ? localeObj.no_limit_no_coupon_earned
                                : GeneralUtilities.formattedString(localeObj.no_coupon_earned, [rewardsEligible])
                            }
                        </div>
                    }
                </FlexView>
            }

            {/* All Coupons Bottom Sheet */}
            {
                showBottomSheet
                && <AllCouponsComponent
                    localeObj={localeObj} styles={stylesheet}
                    state={{ programData, processing, userEarnedCouponsData, wonDetailsScreen }}
                    fromComponent={fromComponent}
                    openRedeemPrizeScreen={openRedeemPrizeScreen}
                    closeBottomSheetHandler={closeBottomSheetHandler}
                />
            }
        </>
    );
}

CouponsListSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string,
    fromLocationData: PropTypes.object
};