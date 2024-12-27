import React from 'react';
import PropTypes from 'prop-types';
import ReactSwipe from 'react-swipe';
import StoryStepperDash from './StoryStepperDash';

import Log from '../../../Services/Log';
import Observer from "@researchgate/react-intersection-observer";
import androidApiCallsService from '../../../Services/androidApiCallsService';

class CardPreviewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: this.props.initialIndex ? this.props.initialIndex : 0,
            isIntersecting: false,
            initProgress: false
        }
        this.stepperDotsRef = React.createRef();
        this.reactSwipeWraper = React.createRef();
        const { reactSwipStyle = {}, autoSlideTimeout } = props;
        this.autoSlideTimeout = autoSlideTimeout || 2000;

        this.styles = {
            Swiper: {
                container: {
                    borderRadius: "7px 7px 0 0",
                    overflow: "hidden",
                    visibility: "visible",
                    position: "relative",
                    ...reactSwipStyle.container
                }, wrapper: {
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'row',
                    width: "100% !important",
                },
                child: {
                    position: "relative",
                }
            }
        }

        this.componentName = "CardPreviewer";
    }

    componentDidMount = () => {
        try {
            let elem = this.reactSwipeWraper.current;
            elem.addEventListener("touchstart", this.touchStart, false);
            elem.addEventListener("touchend", this.touchEnd);

        } catch (error) {
            Log.sDebug("Error inside componentDidMount: " + error.message, this.componentName);
        }
    }

    componentWillUnmount = () => {
        try {
            let elem = this.reactSwipeWraper.current;
            elem.removeEventListener("touchstart", this.touchStart, false);
            elem.removeEventListener("touchend", this.touchEnd);
            this.stopTimers();
        } catch (error) {
            Log.sDebug("Error inside componentWillUnmount: " + error.message, this.componentName);
        }

    }

    touchStart = () => {
        if (this.props.handlePullToRefresh) {
            androidApiCallsService.enablePullToRefresh(false);
        }
        this.touchStartTimer = setTimeout(() => {
            this.pauseAnimation();
            this.setState({ isIntersecting: false });
        }, 300);

    }

    pauseAnimation = () => {
        try {
            let wrapperElement = this.reactSwipeWraper.current;
            wrapperElement.querySelector(".activeProgressBar").style.animationPlayState = "paused";
        } catch (error) {
            Log.sDebug("Error inside pauseAnimation: " + error.message, this.componentName);
        }
    }

    resumeAnumation = () => {
        try {
            let wrapperElement = this.reactSwipeWraper.current;
            wrapperElement.querySelector(".activeProgressBar").style.animationPlayState = "running";
        } catch (error) {
            Log.sDebug("Error inside resumeAnumation: " + error.message, this.componentName);
        }
    }

    touchEnd = () => {
        if (this.props.handlePullToRefresh) {
            androidApiCallsService.enablePullToRefresh(true);
        }
        this.touchEndTimer = setTimeout(() => {
            if (!this.state.isIntersecting) {
                this.resumeAnumation();
                this.setState({ isIntersecting: true });
            }
        }, 1000);
    }

    stopTimers = () => {
        try {
            if (this.touchEndTimer) {
                clearTimeout(this.touchEndTimer);
                this.touchEndTimer = null;
            }
            if (this.touchStartTimer) {
                clearTimeout(this.touchStartTimer);
                this.touchStartTimer = null;
            }
        } catch (error) {
            Log.sDebug("Error inside stopTimers: " + error.message, this.componentName);
        }
    }

    handleStepChange = (activeStep, cardItems) => {
        try {
            if (cardItems && (activeStep === cardItems.length - 1)) {
                let { closeOnCompletion } = this.props;
                if (closeOnCompletion) {
                    setTimeout(() => {
                        closeOnCompletion();
                    }, this.autoSlideTimeout);
                }
            }
            this.setState({ activeStep, isIntersecting: true });
        }
        catch (error) {
            Log.sError("Error inside handleStepChange: " + error.message, this.componentName);
        }
    };

    updateStepper = (index) => {
        this.stopTimers();
        this.resumeAnumation();
        this.stepperDotsRef && this.stepperDotsRef.current && this.stepperDotsRef.current.handleStepChange(index);
    }

    handleIntersection = (event) => {
        try {
            if (event.isIntersecting || event.intersectionRatio > 0) {
                this.setState({ isIntersecting: true, initProgress: true });
            } else {
                this.stopTimers();

                this.setState({ isIntersecting: false });
            }
        } catch (error) {
            Log.sError("error");
        }
    }

    render() {
        let { cardItems, swiperContainerStyle = {}, stepperStyle = {}, interSectionRoot = "", closeOnCompletion = false } = this.props;
        const { activeStep, isIntersecting, initProgress } = this.state;
        const swipeOptions = {
            startSlide: activeStep,
            speed: 300,
            auto: (isIntersecting ? this.autoSlideTimeout : undefined),
            continuous: (cardItems.length > 2 && !closeOnCompletion) ? true : false,
            transitionEnd: (index) => this.handleStepChange(index, cardItems),
            callback: (index) => this.updateStepper(index),
        };
        const options = {
            onChange: (e) => this.handleIntersection(e),
            root: interSectionRoot || "#cardContainer",
            rootMargin: "-5% 0% -5%",
            threshold: [0, 0.1]
        };

        return (
            <Observer {...options}>
                <div ref={this.reactSwipeWraper} style={swiperContainerStyle}>
                    <ReactSwipe
                        swipeOptions={swipeOptions}
                        ref={reactSwipe => (this.reactSwipe = reactSwipe)}
                        style={this.styles.Swiper}
                    >
                        {cardItems}
                    </ReactSwipe>
                    <StoryStepperDash
                        activeStep={this.state.activeStep}
                        cardItems={cardItems}
                        ref={this.stepperDotsRef}
                        initProgress={initProgress}
                        stepperStyle={stepperStyle}
                        autoSlideTimeout={this.autoSlideTimeout}
                    />
                </div   >
            </Observer>

        );
    }
}

CardPreviewer.propTypes = {
    cardItems: PropTypes.object,
    initialIndex: PropTypes.number,
    stepperStyle: PropTypes.number,
    reactSwipStyle: PropTypes.object,
    autoSlideTimeout: PropTypes.bool,
    closeOnCompletion: PropTypes.bool,
    interSectionRoot: PropTypes.string,
    handlePullToRefresh: PropTypes.bool,
    swiperContainerStyle: PropTypes.number,
};

export default CardPreviewer;


