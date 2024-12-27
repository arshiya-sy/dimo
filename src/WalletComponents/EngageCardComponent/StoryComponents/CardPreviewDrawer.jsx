
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CardPreviewer from './CardPreviewer';
import StoryComp from '../StoryComponents/StoryComp';

import "../../../styles/main.css";

class CardPreviewDrawer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            respdata: props.card
        }
        this.styles = {
            containerStyle: {
                // background: "#ffffff",
                transition: "height .5s ease-out",
                width: `${window.screen.availWidth - 16}px`,
                borderRadius: "20px",
                height: "260px",
                overflow: "hidden",
                position: "relative"
            },
            stepperStyle: {
                borderRadius: "0px 0px 20px 20px"
            }
        }
    }


    getCardStyle = data => {
        let containerStyle = { background: "green" };
        let cardStyle = {};
        containerStyle.width = data.dom.parentsize.width + "%";
        if (data.dom.parentsize.height) {
            cardStyle.height =
                (data.dom.parentsize.height * this.height) / 100 + "px";
            if (data.dom.parentsize.relToDeviceHeight == "height") {
                try {
                    let heightType = "default";
                    if (window.innerHeight < 600) {
                        heightType = "small";
                    }
                    cardStyle.height = (data.dom.parentsize.height[heightType] * window.innerHeight) / 100 + "px";
                } catch (err) {
                    cardStyle.height = (23.1 * window.innerHeight) / 100 + "px";
                }
            }
        } else {
            cardStyle.height = "auto";
        }

        if (data.dom.cardborder) {
            containerStyle.padding = "5px";
            containerStyle.border = "1px green solid";
            containerStyle.borderRadius = "0px !important";
        }

        cardStyle.width = `${window.screen.availWidth - 16}px`
        cardStyle.height = "260px";
        return { containerStyle, cardStyle };
    };

    render() {
        let { respdata } = this.state;
        let storyComp = [];

        for (let index in respdata) {
            let data = respdata[index];
            let cardStyles = this.getCardStyle(data);
            let obj = (
                <StoryComp
                    style={cardStyles.cardStyle}
                    card={data}
                    className="transform"
                    streamid={this.props.stream}
                    key={index}
                />
            );
            storyComp.push(obj);
        }

        let cardItems = (
            <CardPreviewer
                cardItems={storyComp}
                stepperStyle={this.styles.stepperStyle}
            />)

        return (
            <React.Fragment>
                {respdata && (respdata.length > 0) ? <div className={respdata.length > 0 ? `searchResultFadein` : ""}
                    style={this.styles.containerStyle}>
                    {cardItems}
                </div> : <div></div>}
            </React.Fragment>
        )
    }
}

CardPreviewDrawer.propTypes = {
    stream: PropTypes.any,
    card: PropTypes.object,
};

export default CardPreviewDrawer;