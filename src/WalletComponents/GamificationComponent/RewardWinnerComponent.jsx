import React from 'react';
import PropTypes from 'prop-types';
import FlexView from 'react-flexview';

import { withStyles } from "@material-ui/core/styles";

import history from "../../history";
import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import InputThemes from "../../Themes/inputThemes";
import constantObjects from '../../Services/Constants';
import MetricServices from "../../Services/MetricsService";
import CommonFunctions from '../../Services/CommonFunctions';
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import ProgramTNCSection from './ProgramComponents/ProgramTNCSection';
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import WonUserDetailSection from './WinnerComponents/WonUserDetailSection';
import PrimaryButtonComponent from '../CommonUxComponents/PrimaryButtonComponent';
import GamificationService from '../../Services/Gamification/GamificationService';

import DimoLogoImage from './../../images/DarkThemeImages/Dimo-Logo_4x.png';
import WinnerCardBgImage from './../../images/GamificationImages/winner/winner-card-bg.webp';

const styles = InputThemes.singleInputStyle;
const screenHeight = window.screen.height;
const screenWidth = window.screen.width;
let localeObj = {};

class RewardWinnerComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            programData: this.props.location?.state?.programData ?? {},
            contentHeight: 0
        };

        this.componentName = PageNames.GamificationComponent.reward_winner;

        this.style = {
            rewardScrollContStyle: {
                overflow: "hidden auto",
                height: screenHeight * 0.7
            },
            bottomContainerStyle: {
                width: '100%',
                textAlign: 'center',
                position: 'fixed',
                bottom: '1rem'
            },
            wonDetailsCardStyle: { 
                position: 'relative',
                width: 'initial',    
                backgroundImage: `url(${WinnerCardBgImage})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'round',
                borderRadius: '1.25rem',
                paddingBottom: '9rem'
            },
            dimoLogoImageStyle: {
                position: 'absolute',
                bottom: '1.25rem',
                maxWidth: screenWidth * 0.3
            }
        };

        this.appBarRef = React.createRef();
        this.bottomButtonsRef = React.createRef();

        if (!GeneralUtilities.isNotEmpty(this.state.programData, false)) {
            return history.push('/rewards');
        }

        MetricServices.onPageTransitionStart(this.componentName);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        window.onBackPressed = () => this.onBackButtonPressed();
        CommonFunctions.addVisibilityEventListener(this.componentName);

        const contentMaxHeight = GamificationService.calculateContentHeight(this.appBarRef, this.bottomButtonsRef);
        GeneralUtilities.isNotEmpty(contentMaxHeight) && this.setState({ contentHeight: contentMaxHeight });
    }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    onBackButtonPressed = () => GeneralUtilities.goBackHistoryPath();

    onBackToRewardsButtonPressed = () => {
        GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.gamificationHome);
        return history.replace({ pathname: "/rewards", transition: "right" });
    }

    render() {
        const { programData, contentHeight } = this.state;
        const programTitle = programData.programName;
        const drawDateTitle = `${localeObj.draw_date}: ${GamificationService.getFormattedDrawDate(programData.drawDate)}`;

        return (
            <div id="reward_winner_container">
                <div ref={this.appBarRef}>
                    <ButtonAppBar header="" onCancel={this.onBackButtonPressed} action="cancel" inverse="true" />
                </div>

                <FlexView
                    column vAlignContent='center' hAlignContent='center'
                    style={this.style.rewardScrollContStyle}
                >
                    <div
                        className='scroll px-24 py-30'
                        style={{overflowY: 'auto', maxHeight: contentHeight, width: 'initial'}}
                    >
                        <div className='px-16 py-30 text-center' style={this.style.wonDetailsCardStyle}>
                            {/* Won User Detail Section */}
                            <WonUserDetailSection localeObj={localeObj} state={this.state} styles={this.style} />

                            {/* Winner Reward Summary */}
                            <div className="overline highEmphasis textUppercase">{programTitle}</div>
                            <div className="body2 highEmphasis mt-5">{drawDateTitle}</div>

                            <FlexView hAlignContent='center' vAlignContent='center'>
                                <img src={DimoLogoImage} alt='' style={this.style.dimoLogoImageStyle} />
                            </FlexView>
                        </div>
                    </div>

                    {/* Bottom Buttons Section */}
                    <div 
                        ref={this.bottomButtonsRef} className='pt-10'
                        style={this.style.bottomContainerStyle}
                    >
                        <PrimaryButtonComponent btn_text={localeObj.continue_playing} onCheck={this.onBackToRewardsButtonPressed} />
                        <ProgramTNCSection 
                            localeObj={localeObj} styles={this.style} state={this.state}
                            fromComponent={this.componentName}
                        />
                    </div>
                </FlexView>
            </div>
        );
    }
}

RewardWinnerComponent.propTypes = {
    location: PropTypes.object
};

export default withStyles(styles)(RewardWinnerComponent);
