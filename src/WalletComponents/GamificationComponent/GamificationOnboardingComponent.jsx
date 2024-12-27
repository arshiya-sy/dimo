import React from 'react';
import Lottie from "lottie-react";
import PropTypes from 'prop-types';
import FlexView from "react-flexview";
import { Carousel } from 'react-responsive-carousel';

import Fab from '@material-ui/core/Fab';
import CheckIcon from '@mui/icons-material/Check';
import MobileStepper from '@material-ui/core/MobileStepper';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { createTheme, MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import PageState from '../../Services/PageState';
import PageNames from '../../Services/PageNames';
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";
import constantObjects from '../../Services/Constants';
import MetricServices from "../../Services/MetricsService";
import CommonFunctions from '../../Services/CommonFunctions';
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCalls from "../../Services/androidApiCallsService";
import ButtonAppBar from "./../CommonUxComponents/ButtonAppBarComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";

import PhoneImage from "./../../images/GamificationImages/onboarding/phone.json";
import RocketImage from "./../../images/GamificationImages/onboarding/rocket.json";
import MoneyPlantImage from "./../../images/GamificationImages/onboarding/money-plant.json";
import InformationImage from "./../../images/GamificationImages/onboarding/information.json";

import "react-responsive-carousel/lib/styles/carousel.min.css";
import "../../styles/main.css";
import "../../styles/colorSelect.css";
import "../../styles/new_pix_style.css";
import "../../styles/genericFontStyles.css";
import "../../styles/commonBsStyles.css";

const styles = InputThemes.singleInputStyle;
var localeObj = {};

const theme1 = createTheme({
  overrides: {
    MuiGrid: {
      item: {
        boxSizing: "none"
      },
    },
    MuiPaper: {
      elevation1: {
        boxShadow: "none"
      }
    },
    MuiMobileStepper: {
      dotActive: {
        backgroundColor: ColorPicker.white,
      },
      dot: {
        backgroundColor: ColorPicker.surface3
      },
      dots: {
        display: 'flex',
        flexDirection: 'row',
        marginLeft: 'auto',
        marginRight: 'auto'
      },
      root: {
        align: 'center',
        display: 'block',
        justifyContent: 'center',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: ColorPicker.surface0
      }
    }
  }
});

const screenHeight = window.screen.height;
const screenWidth = window.screen.width;

class GamificationOnboardingComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSlide: 0,
      processing: false,
      onboardingContentList: []
    }

    this.style = {
      textStyle: {
          marginBottom: "1rem",
          textAlign: "center"
      },
      subTextStyle: {
          textAlign: "center",
          alignItems: "center",
          marginInline: "1.5rem"
      },
      arrowIconStyle: {
        fill: ColorPicker.accent,
        width: "1rem",
        bottom: "4.125rem"
      },
      mobileStepperContStyle: {
        alignContent: 'center',
        alignSelf: 'center', 
        bottom: "4.215rem", 
        marginLeft: 'auto', 
        marginRight: 'auto'
      },
      fabButtonStyle: {
        maxWidth: screenWidth * 0.145,
        maxHeight: screenWidth * 0.145,
        marginRight: "2rem",
        backgroundColor: ColorPicker.lightBlueAccent
      }
    }

    this.componentName = PageNames.GamificationComponent.onboard_gamification;

    MetricServices.onPageTransitionStart(this.componentName);

    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
  }

  componentDidMount() {
    this.setState({
      onboardingContentList: [
        {
          index: 0,
          topImageUrl: PhoneImage,
          title: localeObj.gamify_onboard_1_title,
          subTitle: localeObj.gamify_onboard_1_subtitle,
          btnTxt: localeObj.gamify_onboard_1_btn_txt
        },
        {
          index: 1,
          topImageUrl: InformationImage,
          title: localeObj.gamify_onboard_2_title,
          subTitle: localeObj.gamify_onboard_2_subtitle,
        },
        {
          index: 2,
          topImageUrl: MoneyPlantImage,
          title: localeObj.gamify_onboard_3_title,
          subTitle: localeObj.gamify_onboard_3_subtitle
        },
        {
          index: 3,
          topImageUrl: RocketImage,
          title: localeObj.gamify_onboard_4_title,
          subTitle: localeObj.gamify_onboard_4_subtitle
        }
      ]
    });

    androidApiCalls.enablePullToRefresh(false);
    CommonFunctions.addVisibilityEventListener(this.componentName);
    window.onBackPressed = () => this.onBackButtonPressed();
  }

  componentWillUnmount() {
    CommonFunctions.removeVisibilityEventListener(this.componentName);
    MetricServices.onPageTransitionStop(this.componentName, PageState.close);
  }

  showProgressDialog = () => {
    this.setState({ processing: true });
  }

  hideProgressDialog = () => {
    this.setState({ processing: false });
  }

  nextSlide = (setGamificationEnable = false) => {
    setGamificationEnable && this.setGamificationEnabled();
    GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.onboardingForward);
    this.setState((state) => ({ currentSlide: state.currentSlide + 1 }));
  };

  prevSlide = () => {
    GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.onboardingBackward);
    this.setState((state) => ({ currentSlide: state.currentSlide - 1 }));
  };

  updateCurrentSlide = (index) => {
    const { currentSlide } = this.state;
    currentSlide !== index && this.setState({ currentSlide: index });
  };

  setGamificationEnabled = () => androidApiCalls.setDAStringPrefs(GeneralUtilities.GAMIFICATION_KEY, "enable");

  completeGamificationOnboarding = () => {
    GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.completeOnboarding);
    this.moveToProgramsListingScreen();
  }

  skipGamificationOnboarding = () => {
    GeneralUtilities.sendActionMetrics(this.componentName, constantObjects.Gamification.skipOnboarding);
    this.moveToProgramsListingScreen();
  }

  moveToProgramsListingScreen = () => {
    this.setGamificationEnabled();
    
    if (this.props?.location?.fromComponent) {
      return GeneralUtilities.goBackHistoryPath();
    }
    
    this.props.history.replace({ pathname: "/rewards" });
  }

  onBackButtonPressed = () => {
    if (this.props?.location?.fromComponent) {
      return GeneralUtilities.goBackHistoryPath();
    }

    GeneralUtilities.goBackToPreviousScreen(GeneralUtilities.getBackPressTracking(), this.props.history);
  }

  render() {
    const { onboardingContentList } = this.state;

    return (
      <div style={{ height: `${screenHeight}px`, overflowX: "hidden" }}>
        <div style={{ display: this.state.processing ? 'block' : 'none' }}>
          {this.state.processing && <CustomizedProgressBars />}
        </div>

        <ButtonAppBar
          style={{ marginLeft: "7%" }} header={localeObj.rewards_screen}
          onBack={this.onBackButtonPressed} onCancel={this.skipGamificationOnboarding} action="cancel"
        />

        <div>
          <Carousel
            axis='horizontal'
            infiniteLoop={false}
            showArrows={false}
            showIndicators={false}
            showStatus={false}
            selectedItem={this.state.currentSlide}
            onChange={this.updateCurrentSlide}
            swipeable={(this.state.currentSlide === 0) ? false : true}>
              {
                GeneralUtilities.isNotEmpty(onboardingContentList, false)
                && onboardingContentList.map((onboardingContent, onboardingContentIndex) => {
                  const totalOnboardingScreens = onboardingContentList.length - 1;
                  const currentScreenIndex = onboardingContent.index - 1;

                  return (
                    <div
                      key={onboardingContentIndex}
                      style={{ height: `${screenHeight * 0.85}px`, overflow: "hidden auto", position: "relative" }}
                    >
                      <FlexView
                        column className="scroll" vAlignContent='center'
                        style={{ height: `${screenHeight * 0.625}px`, overflow: 'hidden auto', padding: '1rem 2.25rem' }}
                      >
                        <div style={{ paddingBlock: '1rem', marginInline: 'auto' }}>
                          <Lottie animationData={onboardingContent.topImageUrl} loop={true} style={{width: screenWidth * 0.6}} />
                        </div>

                        <div style={this.style.textStyle}>
                          <span className="headline5 highEmphasis">{onboardingContent.title}</span>
                        </div>
                        <div style={this.style.subTextStyle}>
                          <span className="body2 highEmphasis">{onboardingContent.subTitle}</span>
                        </div>
                      </FlexView>
                      {
                          onboardingContent.subtitle1
                          ? <div style={this.style.subTextStyle}>
                              <span className="body2 mediumEmphasis">{onboardingContent.subtitle1}</span>
                          </div> : null
                      }

                      <div style={{...InputThemes.bottomButtonStyle, paddingBottom: '1rem'}}>
                        {
                          onboardingContent.index === 0
                          ? <PrimaryButtonComponent btn_text={onboardingContent.btnTxt} onCheck={this.nextSlide} />
                          : <FlexView vAlignContent='center' className='w-100' style={{ minHeight: '3.5rem', justifyContent:'space-around', alignItems: 'center' }}>
                              <ArrowBackIosIcon
                                onClick={this.prevSlide}
                                style={{ ...this.style.arrowIconStyle, marginLeft: "2rem" }}
                              />
                              <MuiThemeProvider theme={theme1} style={this.style.mobileStepperContStyle} >
                                <MobileStepper variant="dots" steps={totalOnboardingScreens} position="static" activeStep={currentScreenIndex} />
                              </MuiThemeProvider>
                              {
                                totalOnboardingScreens !== (currentScreenIndex + 1)
                                ? <ArrowForwardIosIcon
                                    onClick={this.nextSlide} 
                                    style={{ ...this.style.arrowIconStyle, marginRight: "2rem" }}
                                /> 
                                : <Fab aria-label="complete" onClick={this.completeGamificationOnboarding} style={this.style.fabButtonStyle}>
                                    <CheckIcon />
                                </Fab>
                              } 
                          </FlexView>
                        }
                      </div>
                    </div>
                  )
                })
              }
          </Carousel>
        </div>
      </div>
    );
  }
}

GamificationOnboardingComponent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object
};

export default withStyles(styles)(GamificationOnboardingComponent);