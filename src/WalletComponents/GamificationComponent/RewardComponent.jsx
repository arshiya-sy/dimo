import React from 'react';
import PropTypes from 'prop-types';
import FlexView from 'react-flexview';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import { Card } from "@mui/material";
import Tabs from '@mui/material/Tabs';
import Grid from "@material-ui/core/Grid";
import { MuiThemeProvider } from "@material-ui/core";
import { createTheme, withStyles } from "@material-ui/core/styles";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";
import GeneralAPIs from '../../Services/GeneralAPIs';
import constantObjects from '../../Services/Constants';
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import CommonFunctions from '../../Services/CommonFunctions';
import GeneralUtilities from "../../Services/GeneralUtilities";
import OffersListSection from './OfferComponents/OffersListSection';
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import RewardsListSection from './RewardComponents/RewardsListSection';
import WinnersListSection from './WinnerComponents/WinnersListSection';
import ProgramsListSection from './ProgramComponents/ProgramsListSection';
import GamificationAPIs from '../../Services/Gamification/GamificationAPIs';
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import { TabPanel, TabProps } from './RewardComponents/RewardTabPanelSection';
import GamificationService from '../../Services/Gamification/GamificationService';
import SecondaryButtonComponent from '../CommonUxComponents/SecondaryButtonComponent';
import { OFFERS_TAB_INDEX, PLAY_DIMO_TAB_INDEX, ALL_REWARDS_TAB_INDEX, PLAY_DIMO_TAB_ACTION, ALL_REWARDS_TAB_ACTION, OFFERS_TAB_ACTION } from '../../Services/Gamification/GamificationTerms';

import rewardIcon from "../../images/GamificationImages/common/reward.png";

import "../../styles/commonBsStyles.css";
import "../../styles/gamificationStyles.css";

const theme1 = createTheme({
    overrides: {
        MuiGrid: {
            item: { boxSizing: "none" }
        },
        MuiPaper: {
            elevation1: { boxShadow: "none" }
        },
        MuiMobileStepper: {
            dotActive: {
                backgroundColor: ColorPicker.darkMediumEmphasis,
            },
            dot: {
                backgroundColor: ColorPicker.disableBlack
            },
            root: {
                backgroundColor: ColorPicker.surface0
            }
        }
    }
});
const styles = InputThemes.singleInputStyle;
const screenHeight = window.screen.height;
var localeObj = {};

class RewardComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            processing: false,
            selectedTabIndex: this.props?.location?.state?.selectedTabIndex ?? 0,
            ongoingProgramData: [],
            wonProgramsData: [],
            userEarnedPrizesData: [],
            canScrollTabContent: true,
            initialCanScrollTabContent: true,
            wonProgramListLoading: false,
            bottomButtonHeight: 0,
            offerCardsData: [],
            showFullScreenLoader: false
        };

        this.componentName = PageNames.GamificationComponent.programs_list;

        this.style = {
            rewardScrollContStyle: {
                whiteSpace: "pre-wrap",
                height: screenHeight * 0.82,
                overflowX: "hidden",
                backgroundColor: ColorPicker.btnHighEmphasis,
                position: 'relative'
            },
            rewardListCard: {
                backgroundColor: ColorPicker.disableBlack,
                borderRadius: "1.25rem",
                marginBottom: "1rem",
                width: '100%',
                position: "relative"
            },
            rewardTitle: {
                textAlign: "center",
                margin: 0,
                padding: "0.5rem"
            },
            rewardSubtitle: {
                textAlign: "center"
            },
            noRewardCardStyle: {
                backgroundColor: "transparent",
                marginBottom: "0.5rem",
                paddingInline: 35
            },
            noRewardStyle: {
                textAlign: "center",
                textTransform: "uppercase"
            },
            gridTitleStyle: {
                display: "flex",
                width: "auto"
            },
            rewardTaskIconContStyle: {
                borderRadius: "50%",
                fill: ColorPicker.surface3,
                backgroundColor: ColorPicker.surface3,
                placeSelf: 'center',
                marginRight: "1rem",
                display: 'flex'
            },
            shimmerCardConStyle: {
                backgroundColor: ColorPicker.disableBlack,
                fontSize: 0,
                textAlign: 'center',
                borderRadius: '1.25rem',
                marginBottom: '1rem',
                width: '100%'
            },
            spinnerRootStyles: {
                marginTop: '25%'
            },
            taskSvgIconStyle: {
                width: "1.2rem",
                alignSelf: "middle",
                fill: ColorPicker.white,
                height: "auto",
                border: `2px solid ${ColorPicker.white}`,
                borderRadius: '50%',
                padding: '1rem',
                position: 'relative'
            },
            completeProgramBtnContStyle: {
                position: 'fixed',
                bottom: 0,
                left: '50%',
                paddingBottom: '1rem',
                backgroundColor: ColorPicker.tableBackground,
                transform: 'translate(-50%, 0)',
                width: '100%'
            }
        };

        this.stickyHeaderRef = React.createRef();
        this.unStickyHeaderRef = React.createRef();
        this.scrollSectionRef = React.createRef();
        this.bottomButtonRef = React.createRef();

        GamificationService.setUserMomentTimezone();

        MetricServices.onPageTransitionStart(this.componentName);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        this.initialRewardPageDeeplinkCheck();
        CommonFunctions.addVisibilityEventListener(this.componentName);
        this.scrollSectionRef.addEventListener("scroll", this.trackScroll);
        window.onBackPressed = () => this.onBackButtonPressed();

        const dynamicStyles = `
            #rewards_container .stickyHeader ~ div[role="tabpanel"] {
                padding-top: ${(this.stickyHeaderRef.clientHeight) / 16}rem;
            }
        `;

        GeneralUtilities.appendDynamicCss(dynamicStyles);
    }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
        this.scrollSectionRef.removeEventListener("scroll", this.trackScroll);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    initialRewardPageDeeplinkCheck = async () => {
        const { location } = this.props;

        if (GeneralUtilities.isNotEmpty(location?.additionalInfo)) {
            this.setState({ showFullScreenLoader: true });

            const additionalInfo = location?.additionalInfo;
            const rewardAction = additionalInfo["rewardActions"];
            const rewardProgramId = additionalInfo["rewardProgramId"];
            const openProgramId = additionalInfo["openProgramId"];
            const lastDrawProgramId = additionalInfo["lastDrawProgramId"];

            let selectedTabIndex = OFFERS_TAB_INDEX;

            if (
                rewardAction === PLAY_DIMO_TAB_ACTION
                || GeneralUtilities.isNotEmpty(openProgramId)
                || GeneralUtilities.isNotEmpty(lastDrawProgramId)
            ) {
                selectedTabIndex = PLAY_DIMO_TAB_INDEX;
            } else if (rewardAction === ALL_REWARDS_TAB_ACTION || GeneralUtilities.isNotEmpty(rewardProgramId)) {
                selectedTabIndex = ALL_REWARDS_TAB_INDEX;
            } else if (rewardAction === OFFERS_TAB_ACTION) {
                selectedTabIndex = OFFERS_TAB_INDEX;
            }

            await new Promise(accept => this.setState({ selectedTabIndex }, accept));
        }

        switch (this.state.selectedTabIndex) {
            case PLAY_DIMO_TAB_INDEX: await this.fetchPlayDimoTabData();
                break;
            case ALL_REWARDS_TAB_INDEX: await this.fetchAllPrizesTabData();
                break;
            default: await this.fetchOffersTabData();
        }

        this.checkIfEmptyTabContent();
    }

    rewardPageDeeplinkCheck = (dataArray, checkParameter, { wonDetailsScreen = false, rewardScreen = false, isRunningProgram = false }) => {
        const { location } = this.props;

        if (!GeneralUtilities.isNotEmpty(location?.additionalInfo)) { return; }

        let programId = location?.additionalInfo[checkParameter];

        if (!GeneralUtilities.isNotEmpty(programId)) { return; }

        const foundData = dataArray.find((data) => data.programId === programId);

        this.setState({ processing: false, showFullScreenLoader: false });

        if (!GeneralUtilities.isNotEmpty(foundData, false)) { return; }

        location.additionalInfo = "";

        const eventType = wonDetailsScreen ? constantObjects.Gamification.drawDetails : constantObjects.Gamification.programDetails;

        return rewardScreen
            ? this.openRedeemPrizeScreen(foundData)
            : this.openDetailSection(foundData, eventType, { wonDetailsScreen, isRunningProgram });
    }

    fetchOffersTabData = async () => {
        this.setState({ processing: true });
        const offerCardsData = await GeneralAPIs.fetchCardsListAPI(constantObjects.OFFERS_TAB_NAME, this.componentName);
        this.setState({ offerCardsData, processing: false });
    }

    updateOfferCardsData = async (offerCardsData) => {
        this.setState({ offerCardsData });
    }

    fetchWonProgramsListData = async () => {
        const wonProgramsData = await GamificationAPIs.fetchWonProgramsListAPI();
        this.setState({ wonProgramsData, wonProgramListLoading: false });
        this.rewardPageDeeplinkCheck(wonProgramsData, 'lastDrawProgramId', { wonDetailsScreen: true });
    }

    fetchPlayDimoTabData = async () => {
        this.setState({ processing: true, wonProgramListLoading: true });
        this.fetchWonProgramsListData();
        const ongoingProgramData = await GamificationAPIs.fetchUserProgramsListAPI();
        this.setState({ ongoingProgramData });
        this.rewardPageDeeplinkCheck(ongoingProgramData, 'openProgramId', { isRunningProgram: true });
        this.setState({ processing: false });

        if (
            GeneralUtilities.isNotEmpty(this.bottomButtonRef, false)
            && this.state.bottomButtonHeight <= 0
        ) {
            this.setState({ bottomButtonHeight: this.bottomButtonRef?.clientHeight });
        }
    }

    fetchAllPrizesTabData = async () => {
        this.setState({ processing: true });
        const userEarnedPrizesData = await GamificationAPIs.fetchAllPrizesListAPI();
        this.setState({ userEarnedPrizesData, processing: false });
        this.rewardPageDeeplinkCheck(userEarnedPrizesData, 'rewardProgramId', { rewardScreen: true });
    }

    checkIfEmptyTabContent = () => {
        const { selectedTabIndex, ongoingProgramData, userEarnedPrizesData, offerCardsData } = this.state;
        let canScrollTabContent = true;
        let initialCanScrollTabContent = true;

        if (
            (selectedTabIndex === OFFERS_TAB_INDEX && !GeneralUtilities.isNotEmpty(offerCardsData, false))
            || (selectedTabIndex === PLAY_DIMO_TAB_INDEX && !GeneralUtilities.isNotEmpty(ongoingProgramData, false))
            || (selectedTabIndex === ALL_REWARDS_TAB_INDEX && !GeneralUtilities.isNotEmpty(userEarnedPrizesData, false))
        ) {
            this.scrollSectionRef && this.scrollSectionRef.scrollTo(0, 0);
            canScrollTabContent = false;
            initialCanScrollTabContent = false;
        }

        this.setState({ canScrollTabContent, initialCanScrollTabContent });
    }

    trackScroll = () => {
        if (!GeneralUtilities.isNotEmpty(this.scrollSectionRef, false)) {
            return;
        }

        const hasStickyHeaderClass = this.stickyHeaderRef.classList.contains('stickyHeader');
        const addStickyHeader = this.scrollSectionRef.scrollTop >= this.unStickyHeaderRef.clientHeight;

        if (addStickyHeader && !hasStickyHeaderClass) {
            this.stickyHeaderRef.classList.add("stickyHeader");
        } else if (!addStickyHeader && hasStickyHeaderClass) {
            this.stickyHeaderRef.classList.remove("stickyHeader");
        }
    };

    handleTabChange = async (event, selectedTabIndex) => {
        const { processing, offerCardsData, userEarnedPrizesData } = this.state;

        if (processing) return;

        await new Promise(accept => this.setState({ selectedTabIndex }, accept));

        switch (selectedTabIndex) {
            case PLAY_DIMO_TAB_INDEX:
                this.componentName = PageNames.GamificationComponent.programs_list;
                await this.fetchPlayDimoTabData();
                GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.programsListing);
                break;
            case ALL_REWARDS_TAB_INDEX:
                this.componentName = PageNames.GamificationComponent.all_rewards_list;
                !GeneralUtilities.isNotEmpty(userEarnedPrizesData) && await this.fetchAllPrizesTabData();
                GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.allPrizes);
                break;
            default:
                this.componentName = PageNames.GamificationComponent.programs_list;
                !GeneralUtilities.isNotEmpty(offerCardsData) && await this.fetchOffersTabData();
                GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.programsListing);
        }

        this.checkIfEmptyTabContent();
    }

    noRewardContent = (content) => {
        return (
            <Card align="center" style={this.style.noRewardCardStyle} elevation={0}>
                <p style={this.style.noRewardStyle} className="overline mediumEmphasis">{content}</p>
            </Card>
        );
    }

    onBackButtonPressed = () => {
        GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
    }

    openDetailSection = (programData, eventType, { wonDetailsScreen = false, isRunningProgram = false } = {}) => {
        const redirectComponentData = {
            pathname: "/rewardsDetail",
            state: { programData, wonDetailsScreen, isRunningProgram }
        };

        GeneralUtilities.sendActionMetrics(this.componentName, eventType);
        this.moveToNextScreen(redirectComponentData);
    }

    openRedeemPrizeScreen = (prizeData) => {
        const redirectComponentData = {
            pathname: "/redeemReward",
            state: {
                programData: { prizeDetails: { ...prizeData, ...prizeData.prizeDetails } }
            }
        };

        GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.redeemDrawReward);
        this.moveToNextScreen(redirectComponentData);
    }

    openCompletedProgramScreen = () => {
        GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.completedPrograms);
        this.moveToNextScreen({ pathname: '/completedRewards' })
    }

    moveToNextScreen = (redirectComponentData) => {
        const fromComponentData = {
            ...this.props?.location,
            state: { selectedTabIndex: this.state.selectedTabIndex }
        };

        GeneralUtilities.pushHistoryPath(redirectComponentData, fromComponentData, { isInitialRoute: true });
    }

    getProcessingSpinnerSection = () => {
        if (this.state.processing) {
            return (<div style={this.style.shimmerCardConStyle}>
                <CustomizedProgressBars rootStyles={this.style.spinnerRootStyles} />
            </div>);
        }
    }

    stopScrollHandler = () => {
        this.setState({ canScrollTabContent: false });
    }

    startScrollHandler = () => {
        this.setState({ canScrollTabContent: true });
    }

    render() {
        const {
            processing, ongoingProgramData, selectedTabIndex, canScrollTabContent,
            wonProgramsData, bottomButtonHeight, showFullScreenLoader
        } = this.state;

        const bottomButtonHeightValue = bottomButtonHeight === 0 ? '1rem' : bottomButtonHeight;

        const isProgramTabPanelEmpty = !GeneralUtilities.isNotEmpty(ongoingProgramData, false)
            && !GeneralUtilities.isNotEmpty(wonProgramsData, false);


        if (showFullScreenLoader) {
            return (<div ref={(el) => this.scrollSectionRef = el}><CustomizedProgressBars /></div>);
        }

        return (
            <div id="rewards_container">
                <ButtonAppBar
                    style={{ marginLeft: "7%" }} header={localeObj.rewards_screen}
                    onBack={this.onBackButtonPressed} action="help"
                    onHelp={() => CommonFunctions.onHelpButtonPressed(this.componentName)}
                />

                <div
                    ref={(el) => this.scrollSectionRef = el}
                    style={{
                        ...this.style.rewardScrollContStyle,
                        overflowY: canScrollTabContent ? 'auto' : 'hidden'
                    }}
                >
                    <MuiThemeProvider theme={theme1}>
                        {/* Reward Header Section */}
                        <FlexView
                            column hAlignContent="center"
                            ref={(el) => this.unStickyHeaderRef = el}
                            className="rewardsHeaderSection"
                        >
                            <div style={{ borderRadius: 14, width: "min-content" }}>
                                <img style={{ width: 24, padding: "10px 20px" }} src={rewardIcon} alt="" />
                            </div>
                        </FlexView>

                        <div ref={(el) => this.stickyHeaderRef = el} className="rewardsHeaderSection">
                            <p style={this.style.rewardTitle} className="headline5 highEmphasis">{localeObj.dimo_rewards}</p>
                            <div style={this.style.rewardSubtitle} className="body2 highEmphasis px-24">
                                {localeObj.dimo_rewards_subtitle_1}<br />
                                {localeObj.dimo_rewards_subtitle_2}<br />
                                {localeObj.dimo_rewards_subtitle_3}
                            </div>

                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs
                                    value={selectedTabIndex}
                                    onChange={this.handleTabChange}
                                    variant="fullWidth"
                                >
                                    <Tab label={localeObj.reward_program} {...TabProps(PLAY_DIMO_TAB_INDEX)} />
                                    <Tab label={localeObj.offers} {...TabProps(OFFERS_TAB_INDEX)} />
                                    <Tab label={localeObj.all_rewards} {...TabProps(ALL_REWARDS_TAB_INDEX)} />
                                </Tabs>
                            </Box>
                        </div>

                        {/* Offers List Tab Content */}
                        <TabPanel
                            value={selectedTabIndex} index={OFFERS_TAB_INDEX}
                            style={{ backgroundColor: ColorPicker.tableBackground }}
                        >
                            {this.getProcessingSpinnerSection()}

                            {/* Offers List Section */}
                            {
                                !processing
                                && <OffersListSection
                                    state={this.state} localeObj={localeObj} styles={this.style}
                                    noRewardContent={this.noRewardContent}
                                    updateOfferCardsData={this.updateOfferCardsData}
                                    startScrollHandler={this.startScrollHandler}
                                    stopScrollHandler={this.stopScrollHandler}
                                />
                            }
                        </TabPanel>

                        {/* Ongoing Programs and Winner List Tab Content */}
                        <TabPanel
                            value={selectedTabIndex} index={PLAY_DIMO_TAB_INDEX}
                            style={{ backgroundColor: ColorPicker.tableBackground }}
                        >
                            {this.getProcessingSpinnerSection()}

                            <Grid container style={{ marginBottom: bottomButtonHeightValue }}>
                                {/* Winner List Section */}
                                <WinnersListSection
                                    state={this.state} localeObj={localeObj} styles={this.style}
                                    openDetailSection={this.openDetailSection}
                                />

                                {/* Ongoing Programs List Section */}
                                {
                                    !processing
                                    && <ProgramsListSection
                                        state={this.state} localeObj={localeObj} styles={this.style}
                                        openDetailSection={this.openDetailSection}
                                    />
                                }

                                {/* No Ongoing Program and No Winner Data Section */}
                                {
                                    !processing
                                    && isProgramTabPanelEmpty
                                    && this.noRewardContent(localeObj.no_running_program)
                                }
                            </Grid>

                            {/* Completed Program Button */}
                            <FlexView
                                ref={(el) => this.bottomButtonRef = el}
                                style={this.style.completeProgramBtnContStyle}
                                hAlignContent='center' vAlignContent='center'
                            >
                                <SecondaryButtonComponent
                                    btn_text={localeObj.completed_programs}
                                    onCheck={this.openCompletedProgramScreen}
                                />
                            </FlexView>

                        </TabPanel>

                        {/* All Rewards Tab Content */}
                        <TabPanel
                            value={selectedTabIndex} index={ALL_REWARDS_TAB_INDEX}
                            style={{ backgroundColor: ColorPicker.tableBackground }}
                        >
                            {this.getProcessingSpinnerSection()}

                            {/* All Rewards List Section */}
                            {
                                !processing
                                && <RewardsListSection
                                    state={this.state} localeObj={localeObj} styles={this.style}
                                    noRewardContent={this.noRewardContent}
                                    openRedeemPrizeScreen={this.openRedeemPrizeScreen}
                                    fromComponent={this.componentName}
                                />
                            }
                        </TabPanel>
                    </MuiThemeProvider>
                </div>
            </div>
        );
    }
}

RewardComponent.propTypes = {
    history: PropTypes.object,
    location: PropTypes.object
};

export default withStyles(styles)(RewardComponent);
