import React from 'react';
import PropTypes from 'prop-types';

import Log from "../../../Services/Log";

import "../../../styles/main.css";

class StoryStepperDash extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: this.props.activeStep ? this.props.activeStep : 0,
        }
        this.autoSlideTimeout = props.autoSlideTimeout || 2000;
        this.autoSlideTimeout = (this.autoSlideTimeout / 1000) + "s"

        this.styles = {
            container: {
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'center',
                height: '19px',
                alignItems: 'center',
                position: 'absolute',
                bottom: '0px',
                borderRadius: '0px 0px 20px 20px',
                "--slide-timeout": this.autoSlideTimeout,
                ...props.stepperStyle
            }
        }

        this.componentName = "StoryStepperDash";
    }

    handleStepChange = (activeStep) => {
        try {
            this.setState({ activeStep })
        }
        catch (error) {
            Log.sDebug("Error inside handleStepChange: " + error.message, this.componentName);
        }
    };


    render() {
        let { cardItems, initProgress } = this.props;
        let steps = cardItems.length;
        let { styles } = this;
        let { activeStep } = this.state;
        let width = `${300 / steps}px`

        return (
            <div style={styles.container} >
                <div style={{ display: "flex", flexDirection: "row", width: "82%" }}>
                    {cardItems.map((item, index) => {
                        return (
                            <div style={{
                                width, height: "3px",
                                background: "#293455",
                            }}
                                className="progressbar"
                                key={`progressBar${index}`}>
                                <div
                                    className={!initProgress ? "unfilledProgressBar" : index < activeStep
                                        ? "filledProgressBar"
                                        : index === activeStep
                                            ? "activeProgressBar"
                                            : "unfilledProgressBar"}
                                ></div>

                            </div>
                        )
                    })}
                </div>
            </div>
        );
    }
}

StoryStepperDash.propTypes = {
    cardItems: PropTypes.array,
    initProgress: PropTypes.bool,
    activeStep: PropTypes.number,
    stepperStyle: PropTypes.object,
    autoSlideTimeout: PropTypes.any,
};

export default StoryStepperDash;