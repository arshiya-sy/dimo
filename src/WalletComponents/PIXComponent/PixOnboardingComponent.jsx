import React from "react";
import MobileStepper from '@material-ui/core/MobileStepper';
import {Card} from "@material-ui/core";
import FlexView from "react-flexview";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";

import { MuiThemeProvider, createMuiTheme} from "@material-ui/core/styles";
import "../../styles/main.css";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import MetricServices from "../../Services/MetricsService";

import coins from "../../images/OnBoardingImages/Coins.png";
import CancelIcon from '@material-ui/icons/Close';
import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import PropTypes from "prop-types";


const theme1 = createMuiTheme({
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
                backgroundColor: ColorPicker.regularAccent,
            },
            dot: {
                width:"3rem",
                borderRadius:"0rem",
                height:".2rem",
                backgroundColor: ColorPicker.surface2
            },
            root: {
                backgroundColor: ColorPicker.white
            }
        }
    }
});

var localeObj = {};

export default class PixOnboardingComponent extends React.Component {

    constructor(props) {
        super(props);
        this.componentName = "PixOnboardingComponent";
        this.state = {
            selectedIndex : 0,
        };
        this.styles = {
            imageStyle: {
                borderRadius: "2rem",
                justifySelf: 'center',
                alignSelf: 'center',
                marginTop: `${(0.02) * window.screen.height}px`,
                width: `${(0.5) * window.screen.width}px`,
            },
            textStyle: {
                marginLeft: "10%",
                marginRight: "10%",
                marginTop: "1rem",
                height:"3rem",
                textAlign: "center"
            },
            textStyle1: {
                marginLeft: "10%",
                marginRight: "10%",
                height:"5rem",
                marginTop: "1rem",
                marginBottom: "1rem",
                textAlign: "center",
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onTransitionPageStart(PageNames.pixOnboarding['pix_onboarding_main']);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.onBackPressed = () => {
            this.onClose();
        }

        //Log.sDebug("Loaded " + this.state.selectedIndex + " card", this.componentName);

    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
          MetricServices.onTransitionPageStop(PageNames.pixOnboarding['pix_onboarding_main'], PageState.recent);
        } else if (visibilityState === "visible") {
          MetricServices.onTransitionPageStart(PageNames.pixOnboarding);
        }
    }


    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    render() {
        const  data = [
            {
                title: localeObj.pix_onboarding_title_1,
                text: localeObj.pix_onboarding_text_1,
                buttonText: localeObj.next,
                image:coins
            }, {
                title: localeObj.pix_onboarding_title_2,
                text: localeObj.pix_onboarding_text_2,
                buttonText: localeObj.next,
                image:coins
            }, {
                title: localeObj.pix_onboarding_title_3,
                text: localeObj.pix_onboarding_text_3,
                buttonText: localeObj.next,
                image:coins
            },{
                title: localeObj.pix_onboarding_title_4,
                text: localeObj.pix_onboarding_text_4,
                buttonText: localeObj.register_key,
                image:coins
            }
        ]

        const onClose = () => {
            this.props.onHandleOnboardingAction("close");
            MetricServices.onPageTransitionStop(PageNames.pixOnboarding['pix_onboarding_main'], PageState.cancel);
             //Log.sDebug("user closed " + data[this.state.selectedIndex] + " card", this.componentName);

        }

        const onNext = () => {
            //we are here means we reached end of the onboarding flow
            //redirect the user to Key registration page
            if (this.state.selectedIndex == data.length - 1) {
                MetricServices.onPageTransitionStop(PageNames.pixOnboarding['pix_onboarding_main'], PageState.close);
                this.props.onHandleOnboardingAction("register");
                 //Log.sDebug("user clicked register key", this.componentName);
            }
        }

        const responsive = {
            mobile: {
              breakpoint: { max: 464, min: 0 },
              items: 1,
              slidesToSlide: 1, // optional, default to 1.
              partialVisibilityGutter: 30
            }
          };

        const beforeChange = (index) => {
            this.setState({
                selectedIndex: index,
            });
        }

        return (
                <div style={{width:"90%", textAlign: "center"}}>
                    <Carousel
                        swipeable={true}
                        draggable={true}
                        arrows={false}
                        showDots={false}
                        responsive={responsive}
                        autoPlay={true}
                        partialVisible={true}
                        autoPlaySpeed={5000}
                        keyBoardControl={true}
                        beforeChange={beforeChange}
                        containerClass="carousel-container"
                        deviceType={this.props.deviceType}
                        dotListClass="custom-dot-list-style"
                        itemClass="carousel-item-padding-40-px">
                        {data.map((item) => (
                            <Card key = {item.title} align="center" style={{borderRadius:".5rem", marginRight:".5rem", marginLeft:".5rem", height:"100%"}} >
                                <div style={{width:"90%", marginTop:"5%", textAlign: "right"}}>
                                    <CancelIcon onClick={() => onClose()}/>
                                </div>
                                <img align="center" style={this.styles.imageStyle} src={item.image} />
                                <div style={{  marginTop: `${(0.02) * window.screen.height}px` }}>
                                    <FlexView column>
                                        <div className="headline5 highEmphasis">
                                            {item.title}
                                        </div>
                                        <div className="subtitle2 highEmphasis" style={{ margin: "1.5rem",  marginTop: `${(0.02) * window.screen.height}px` }}>
                                            {item.text}
                                        </div>
                                    </FlexView>
                                </div>
                                <div className="body2" style={{height:"4%", width:"50%", display:(this.state.selectedIndex == 3)? 'block' : 'none'}}>
                                    <PrimaryButtonComponent btn_text={item.buttonText} style={{backgroundColor:ColorPicker.regularAccent}} onCheck={onNext} />
                                </div>
                                <FlexView column hAlignContent="center"  style={{paddingBottom:"5%", paddingTop:"15%"}}>
                                    <MuiThemeProvider theme={theme1}>
                                        <MobileStepper
                                            variant="dots"
                                            steps={data.length}
                                            position="static"
                                            activeStep={this.state.selectedIndex}/>
                                    </MuiThemeProvider>
                                </FlexView>
                            </Card>
                        ))}
                    </Carousel>
                </div>
            );
        }
    }

    PixOnboardingComponent.propTypes = {
        classes: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        onHandleOnboardingAction: PropTypes.func,
        deviceType: PropTypes.string
    };