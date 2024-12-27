import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import FlexView from "react-flexview";

import { Card } from "@mui/material";
import Grid from "@material-ui/core/Grid";
import Paper from '@material-ui/core/Paper';

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import ColorPicker from '../../Services/ColorPicker';
import constantObjects from '../../Services/Constants';
import MetricServices from "../../Services/MetricsService";
import CommonFunctions from '../../Services/CommonFunctions';
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import GamificationAPIs from '../../Services/Gamification/GamificationAPIs';
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import GamificationService from '../../Services/Gamification/GamificationService';

const screenHeight = window.screen.height;
var localeObj = {};

class CompletedRewardComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            processing: false,
            completedProgramsList: []
        };

        this.componentName = PageNames.GamificationComponent.completed_programs;

        this.style = {
            rewardScrollContStyle: {
                position: 'relative',
                overflow: "hidden auto",
                width: 'inherit',
                height: screenHeight * 0.82
            },
            rewardListCard: {
                width: '100%',
                position: "relative",
                backgroundColor: ColorPicker.disableBlack,
                borderRadius: "0.75rem",
                marginBottom: "1rem",
            },
            allRewardDetailStyle: {
                paddingBlock: '1rem',
                paddingInline: '1.5rem'
            },
            rewardTaskIconContStyle: {
                borderRadius: "50%",
                fill: ColorPicker.surface3,
                backgroundColor: ColorPicker.surface3,
                placeSelf: 'center',
                marginRight: "1rem",
                display: 'flex'
            },
            rewardTaskIconStyle: {
                width: "2rem",
                verticalAlign: "middle",
                fill: ColorPicker.accent,
                height: "auto"
            },
            noRewardCardStyle: {
                backgroundColor: 'transparent',
                marginBottom: '0.5rem',
                paddingInline: '2rem'
            },
        };

        GamificationService.setUserMomentTimezone();

        MetricServices.onPageTransitionStart(this.componentName);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        this.performInitialFetching();
        CommonFunctions.addVisibilityEventListener(this.componentName);
        window.onBackPressed = () => this.onBackButtonPressed();
    }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    performInitialFetching = async () => {
        this.setState({ processing: true });
        const completedProgramsList = await GamificationAPIs.fetchCompletedProgramsListAPI();
        this.setState({ completedProgramsList, processing: false });
    }

    onBackButtonPressed = () => GeneralUtilities.goBackHistoryPath();

    openProgramOverviewScreen = (programData) => {
        const redirectComponentData = {
            pathname: "/programOverview",
            state: { programData },
            fromComponent: this.componentName
        };
        
        GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.completedProgramOverview);
        this.moveToNextScreen(redirectComponentData);
    }

    moveToNextScreen = (redirectComponentData) => {
        const fromComponentData = this.props?.location;

        GeneralUtilities.pushHistoryPath(redirectComponentData, fromComponentData);
    }

    render() {
        const { processing, completedProgramsList } = this.state;
        const stylesheet = this.style;

        return (
            <div id="completed_programs_container">
                <ButtonAppBar
                    style={{ marginLeft: "7%" }} header={localeObj.completed_programs}
                    onBack={this.onBackButtonPressed} action="help"
                    onHelp={() => CommonFunctions.onHelpButtonPressed(this.componentName)}
                />

                {processing && <CustomizedProgressBars />}

                <div className="scroll p-24" style={stylesheet.rewardScrollContStyle}>
                    <Grid container>
                        {/* All Completed Programs List Section */}
                        {
                            GeneralUtilities.isNotEmpty(completedProgramsList, false)
                            && completedProgramsList.map((programData, programDataIndex) => {
                                const programName = programData.programName;
                                const programExpireDate = moment(programData.programEndDate).format('MM/DD/YYYY');

                                return (
                                    <Paper
                                        align="left" key={programDataIndex} style={stylesheet.rewardListCard} elevation={0}
                                        onClick={() => this.openProgramOverviewScreen(programData)}
                                    >
                                        <div className='px-24 py-16'>
                                            <div className="headline8 highEmphasis mb-5">{programName}</div>
                                            <FlexView vAlignContent='center'>
                                                <div className="textUppercase Overline1 errorRed mr-5">{localeObj.ended_on}:</div>
                                                <div className="button2 highEmphasis">{programExpireDate}</div>
                                            </FlexView>
                                        </div>
                                    </Paper>
                                );
                            })
                        }

                        {/* No Completed Programs Section */}
                        {
                            !GeneralUtilities.isNotEmpty(completedProgramsList, false)
                            && !processing
                            && <Card align="center" style={stylesheet.noRewardCardStyle} elevation={0}>
                                <p className="overline mediumEmphasis textUppercase">
                                    {localeObj.no_completed_program_1}
                                </p>
                                <p className="overline mediumEmphasis textUppercase">
                                    {localeObj.no_completed_program_2}
                                </p>
                            </Card>
                        }
                    </Grid>
                </div>
            </div>
        );
    }
}

CompletedRewardComponent.propTypes = {
    location: PropTypes.object
};

export default CompletedRewardComponent;
