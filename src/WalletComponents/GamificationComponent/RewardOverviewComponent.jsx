import React from 'react';
import PropTypes from 'prop-types';
import FlexView from 'react-flexview';

import history from "../../history";
import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import ColorPicker from '../../Services/ColorPicker';
import constantObjects from '../../Services/Constants';
import MetricServices from "../../Services/MetricsService";
import CommonFunctions from '../../Services/CommonFunctions';
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import ProgramTNCSection from "./ProgramComponents/ProgramTNCSection";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import DrawOverviewSection from './ProgramOverviewComponents/DrawOverviewSection';
import TaskOverviewSection from './ProgramOverviewComponents/TaskOverviewSection';
import ProgramOverviewSection from './ProgramOverviewComponents/ProgramOverviewSection';
import AchievementBoardSection from './ProgramOverviewComponents/AchievementBoardSection';
import UserParticipationSection from './ProgramOverviewComponents/UserParticipationSection';
import { REWARD_TYPE_COUPON, REWARD_TYPE_LUCKY_NUMBER } from '../../Services/Gamification/GamificationTerms';

let localeObj = {};
const screenHeight = window.screen.height;
const gamificationConstObject = constantObjects.Gamification;

class RewardOverviewComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            drawHistoryData: [],
            totalRewardEarned: 0,
            fetchingDrawHistoryData: false,
            fetchingTotalRewardEarnedData: false,
            programData: this.props.location?.state?.programData ?? {},
        };

        this.componentName = PageNames.GamificationComponent.reward_overview;

        this.style = {
            overviewScrollContStyle: {
                position: 'relative',
                overflow: "hidden auto",
                height: screenHeight * 0.85,
            }
        };

        if (!GeneralUtilities.isNotEmpty(this.state.programData)) {
            return history.push('/completedRewards');
        }

        MetricServices.onPageTransitionStart(this.componentName);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        window.onBackPressed = () => this.onBackButtonPressed();
        CommonFunctions.addVisibilityEventListener(this.componentName);
    }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    onBackButtonPressed = () => GeneralUtilities.goBackHistoryPath();

    updateTotalRewardEarnedData = (totalRewardEarnedData) => {
        const { luckyNumbers: totalRewardEarned } = totalRewardEarnedData;

        this.setState((prevState) => ({
            totalRewardEarned,
            fetchingTotalRewardEarnedData: !prevState.fetchingTotalRewardEarnedData
        }));
    }
    
    updateDrawHistoryData = (drawHistoryData) => {
        this.setState((prevState) => ({
            drawHistoryData,
            fetchingDrawHistoryData: !prevState.fetchingDrawHistoryData
        }));
    }

    openDrawHistoryScreen = (openDrawId = null) => {
        const fromComponent = this.componentName;
        let { programData: drawScreenData, drawHistoryData } = this.state;
        const { drawHistoryListing, drawHistoryDetails } = gamificationConstObject;

        let pathname = "/rewardsHistory";
        let actionMetricsEventType = drawHistoryListing;

        if (GeneralUtilities.isNotEmpty(openDrawId)) {
            pathname = "/rewardsDetail";
            actionMetricsEventType = drawHistoryDetails;
            drawScreenData = drawHistoryData.find((drawDetailsData) => drawDetailsData.drawId === openDrawId);
        }

        const redirectComponentData = {
            pathname,
            fromComponent,
            state: { programData: drawScreenData, wonDetailsScreen: true }
        };

        GeneralUtilities.sendActionMetrics(fromComponent, actionMetricsEventType);

        this.moveToNextScreen(redirectComponentData);
    }

    openRewardOnboardingScreen = () => {
        const fromComponent = this.componentName;

        GeneralUtilities.sendActionMetrics(this.componentName, gamificationConstObject.learnHowToParticipate);
        
        const redirectComponentData = {
            pathname: "/gamificationOnboarding",
            fromComponent: fromComponent
        };

        this.moveToNextScreen(redirectComponentData);
    }

    openRedeemCouponScreen = (couponData) => {
        const fromComponent = this.componentName;
        const { programData } = this.state;
        const { prizeGenericImageUrl, prizeTncUrl } = programData?.prizeDetails;

        const redirectComponentData = {
            pathname: "/redeemReward",
            fromComponent: fromComponent,
            state: {
                programData: {
                    ...programData,
                    prizeDetails: { ...couponData, prizeType: REWARD_TYPE_COUPON, prizeGenericImageUrl, prizeTncUrl }
                }
            }
        };

        GeneralUtilities.sendActionMetrics(fromComponent, gamificationConstObject.redeemDrawReward);
        this.moveToNextScreen(redirectComponentData);
    }

    moveToNextScreen = (redirectComponentData) => {
        const { location:fromComponentData } = this.props;
        GeneralUtilities.pushHistoryPath(redirectComponentData, fromComponentData);
    }

    render() {
        const { overviewScrollContStyle } = this.style;
        const { rewardType } = this.state.programData;

        return (
            <div id="reward_overview_container">
                <ButtonAppBar
                    style={{ marginLeft: "7%" }} header={localeObj.program_overview}
                    onBack={this.onBackButtonPressed} action="help"
                    onHelp={() => CommonFunctions.onHelpButtonPressed(this.componentName)}
                />

                <FlexView column vAlignContent='center' hAlignContent='center'>
                    <div className='scroll' style={overviewScrollContStyle}>
                        {/* User Participation Section */}
                        <UserParticipationSection
                            localeObj={localeObj} state={this.state} styles={this.style}
                            fromComponent={this.componentName}
                            updateTotalRewardEarnedData={this.updateTotalRewardEarnedData}
                        />

                        {/* Program Overview Section */}
                        <ProgramOverviewSection
                            localeObj={localeObj} state={this.state} styles={this.style}
                            fromComponent={this.componentName}
                            updateDrawHistoryData={this.updateDrawHistoryData}
                            openDrawHistoryScreen={this.openDrawHistoryScreen}
                            openRedeemCouponScreen={this.openRedeemCouponScreen}
                            openRewardOnboardingScreen={this.openRewardOnboardingScreen}
                        />

                        <div className='mt-24 mb-16' style={{ backgroundColor: ColorPicker.tableBackground }}>
                            {/* Program Draws Overview Section */}
                            {
                                (rewardType === REWARD_TYPE_LUCKY_NUMBER || rewardType == null)
                                && <DrawOverviewSection
                                    localeObj={localeObj} state={this.state} styles={this.style}
                                    fromComponent={this.componentName}
                                    openDrawHistoryScreen={this.openDrawHistoryScreen}
                                /> 
                            }
                            
                            {/* Program Tasks Overview Section */}
                            {
                                rewardType === REWARD_TYPE_COUPON
                                && <TaskOverviewSection
                                    localeObj={localeObj} state={this.state} styles={this.style}
                                    fromComponent={this.componentName}
                                />
                            }

                            {/* Achievement Board Section */}
                            <AchievementBoardSection
                                localeObj={localeObj} state={this.state} styles={this.style}
                                fromComponent={this.componentName}
                            />

                            <div className='px-16 text-center'>
                                {/* Program Terms and Conditions */}
                                <ProgramTNCSection
                                    localeObj={localeObj} state={this.state} styles={this.style}
                                    fromComponent={this.componentName}
                                />
                            </div>
                        </div>
                    </div>
                </FlexView>
            </div>
        );
    }
}

RewardOverviewComponent.propTypes = {
    location: PropTypes.object
};

export default RewardOverviewComponent;
