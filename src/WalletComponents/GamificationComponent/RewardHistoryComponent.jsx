import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

import { Card } from "@mui/material";
import Grid from "@material-ui/core/Grid";
import Paper from '@material-ui/core/Paper';
import { MuiThemeProvider } from "@material-ui/core";
import NextIcon from '@material-ui/icons/ArrowForwardIos';
import { createTheme, withStyles } from "@material-ui/core/styles";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";
import constantObjects from '../../Services/Constants';
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import CommonFunctions from '../../Services/CommonFunctions';
import GeneralUtilities from "../../Services/GeneralUtilities";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import GamificationAPIs from '../../Services/Gamification/GamificationAPIs';
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import GamificationService from '../../Services/Gamification/GamificationService';

const theme1 = createTheme({
    overrides: {
        MuiGrid: {
            item: { boxSizing: "none" }
        },
        MuiPaper: {
            elevation1: { boxShadow: "none" }
        }
    }
});
const styles = InputThemes.singleInputStyle;
const screenHeight = window.screen.height;
let localeObj = {};

class RewardHistoryComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            processing: false,
            programData: this.props?.location?.state?.programData ?? {},
            rewardHistoryData: this.props?.location?.state?.drawHistoryData ?? [],
            completedProgramScreen: this.props?.location?.state?.completedProgramScreen ?? false,
        };

        this.componentName = PageNames.GamificationComponent.program_history;

        this.style = {
            rewardScrollContStyle: {
                whiteSpace: "pre-wrap",
                height: screenHeight * 0.8,
                overflowX: "hidden",
                width: 'auto',
                padding: '1rem 1.5rem'
            }, 
            historyListCard: { 
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                paddingInline: 0,
                position: 'relative'
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
            rewardIconStyle: {
                width: "1rem",
                verticalAlign: "middle",
                fill: ColorPicker.white,
                height: "max-content",
                marginRight: "0.3125rem"
            },
            rewardNextIconStyle: {
                fill: ColorPicker.accent,
                width: "1rem",
                position: "absolute",
                right: "1rem"
            },
            allRewardDetailStyle: {
                paddingBlock: '1rem',
                paddingInline: '1.5rem'
            },
        };

        GamificationService.setUserMomentTimezone();

        MetricServices.onPageTransitionStart(this.componentName);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        this.performInitGamificationFetching();
        CommonFunctions.addVisibilityEventListener(this.componentName);
        window.onBackPressed = () =>  this.onBackButtonPressed();
    }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    performInitGamificationFetching = async () => {
        const { programData } = this.state;
        
        this.setState({ processing: true });
        
        const fetchedRewardHistoryData = await GamificationAPIs.fetchProgramHistoryListAPI(programData?.programId);
        
        this.setState({ rewardHistoryData: fetchedRewardHistoryData, processing: false });
    }

    noRewardContent = (content) => {
        return (
            <Card align="center" style={this.style.noRewardCardStyle} elevation={0}>
                <p style={this.style.noRewardStyle} className="overline mediumEmphasis">{content}</p>
            </Card>
        );
    }

    onBackButtonPressed = () => GeneralUtilities.goBackHistoryPath();

    openDrawDetailsScreen = (drawDetailsData) => {
        const redirectComponentData = {
            pathname: "/rewardsDetail",
            state: { programData: drawDetailsData, wonDetailsScreen: true }
        };

        GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.drawDetails);
        GeneralUtilities.pushHistoryPath(redirectComponentData, this.props?.location);
    }

    render() {
        const { programData, rewardHistoryData, completedProgramScreen } = this.state;
        let appBarTitle = localeObj.history_screen;
        let screenTitle = localeObj.reward_history_title;
        let screenSubTitle = localeObj.reward_history_subtitle;
        let drawHistoryIndex = 
            GeneralUtilities.isNotEmpty(rewardHistoryData, false) 
            && GeneralUtilities.arrayColumnCount(rewardHistoryData, 'monthlyDrawHistory');

        if (completedProgramScreen) {
            appBarTitle = localeObj.program_detail_screen;
            screenTitle = programData.programName;
            screenSubTitle = localeObj.completed_history_subtitle;
        }

        return (
            <div id="rewards_history_container">
                <ButtonAppBar 
                    style={{ marginLeft: "7%" }} action="help" header={appBarTitle} 
                    onBack={this.onBackButtonPressed} 
                    onHelp={() => CommonFunctions.onHelpButtonPressed(this.componentName)}
                />

                <div style={{ display: this.state.processing ? 'block' : 'none' }}>{this.state.processing && <CustomizedProgressBars />}</div>
                <div
                    style={{ ...this.style.rewardScrollContStyle, display: !this.state.processing ? 'block' : 'none' }}
                    className="scroll"
                >
                    <MuiThemeProvider theme={theme1}>
                        {/* Reward Header Section */}
                        <div className='mb-48'>
                            <p className="headline5 highEmphasis mb-16">{screenTitle}</p>
                            {
                                GeneralUtilities.isNotEmpty(rewardHistoryData, false)
                                && <div className="body2 highEmphasis">{screenSubTitle}</div>
                            }
                        </div>
                        
                        {/* <hr className='mb-32' /> */}

                        {/* Rewards History Content */}
                        <Grid container className='mt-10'>
                            {
                                GeneralUtilities.isNotEmpty(rewardHistoryData, false)
                                && rewardHistoryData.map((historyData, historyDataIndex) => {
                                    const { month, year, monthlyDrawHistory } = historyData;
                                    const monthTitle = moment(`${year}-${String(month).padStart(2, '0')}`).format('MMMM');
                                    const drawMonthHistoryList = monthlyDrawHistory;

                                    if (!GeneralUtilities.isNotEmpty(drawMonthHistoryList)) return null;

                                    drawMonthHistoryList.sort().reverse();

                                    if (drawMonthHistoryList.length === 1 && !GamificationService.checkToShowDrawDelayed(drawMonthHistoryList[0])) return null;

                                    return (
                                        <div className='w-100 mb-48' key={historyDataIndex}>
                                            <div className="headline6 highEmphasis mb-24 textCapitalize">{monthTitle}</div>
                                            {
                                                GeneralUtilities.isNotEmpty(drawMonthHistoryList, false)
                                                && drawMonthHistoryList.map((monthHistoryData, monthHistoryIndex) => {
                                                    const drawTitle = GeneralUtilities.formattedString(localeObj.history_program_title, [drawHistoryIndex]);
                                                    const formattedDrawDuration = GamificationService.getFormattedDrawDuration(monthHistoryData);
                                                    --drawHistoryIndex;
                                                    
                                                    if (!GamificationService.checkToShowDrawDelayed(monthHistoryData)) { return null; }
                                                    
                                                    return (
                                                        <Paper
                                                            align='left' style={this.style.historyListCard}
                                                            className='w-100 mt-24' key={monthHistoryIndex} elevation={0}
                                                            onClick={() => this.openDrawDetailsScreen(monthHistoryData)}
                                                        >
                                                            <div>
                                                                <div className="subtitle8 highEmphasis">{drawTitle}</div>
                                                                <div className='body2 mediumEmphasis'>{formattedDrawDuration}</div>
                                                            </div>
                                                            <NextIcon style={this.style.rewardNextIconStyle} />
                                                        </Paper>
                                                    );
                                                })
                                            }
                                        </div>
                                    );
                                })
                            }
                            {
                                !GeneralUtilities.isNotEmpty(rewardHistoryData, false) 
                                && this.noRewardContent(localeObj.no_draw_history)
                            }
                        </Grid>
                    </MuiThemeProvider>
                </div>
            </div>
        );
    }
}

RewardHistoryComponent.propTypes = {
    location: PropTypes.object
};

export default withStyles(styles)(RewardHistoryComponent);
