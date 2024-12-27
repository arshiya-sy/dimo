import React from "react";
import PropTypes from 'prop-types';

import CloseIcon from '@mui/icons-material/Close';
import Observer from "@researchgate/react-intersection-observer";

import Story from "../Story";
import Log from "../../Services/Log";
import StoryComp from "./StoryComponents/StoryComp";
import constantObjects from "../../Services/Constants";
import CardPreviewer from "./StoryComponents/CardPreviewer";

import "../../styles/main.css";
import "../../styles/loadingPlaceholder.css";

class StoryModeDialog extends React.Component {
    constructor(props) {
        super(props)
        this.storyArryRef = React.createRef();
        this.state = {
            sliderData: [],
            showLoading: true
        }
    }

    getCardStyleForEngage = () => {
        let cardStyle = {
            width: window.innerWidth + "px",
            height: window.innerHeight + "px",
            backgroundSize: "contain",
            boxShadow: "inherit",
            backgroundColor: "inerit",
            padding: "0px"
        };
        return {
            cardStyle
        };
    }

    getCardStyle = (data, index) => {
        try {
            let cardStyle = {};
            let rippleStyle = {
                width: "inherit",
                height: "inherit",
                backgroundSize: "contain",
                boxShadow: "inherit",
                backgroundColor: "inerit",
                padding: "0px"
            };
            if (data.dom.parentsize.height) {
                this.height = 310 * (window.innerWidth) / 338;
                cardStyle.height = (data.dom.parentsize.height * this.height) / 100 + "px";

            } else {
                cardStyle.height = "auto";
            }
            if (data.dom.parentsize.width) {
                cardStyle.width = data.dom.parentsize.width;
            } else {
                cardStyle.width = "auto";
            }
            rippleStyle.marginLeft = (index === 0) ? "0px" : "6px";
            return { cardStyle, rippleStyle };
        } catch (error) {
            return {};
        }
    };

    handleIntersection = () => {}

    componentDidMount = () => {
        try {
            const dialogData = this.props.data.dialogData;
            const versionedData = dialogData['A'] || dialogData['B'];
            const [locale] = Object.keys(versionedData);

            this.setState({
                sliderData: versionedData[locale],
                showLoading: false
            });
        } catch (error) {
            Log.sDebug("No story mode data", error, constantObjects.LOG_PROD);
        }

    }

    render() {
        if (this.state.showLoading) {
            return (
                <div
                    id="loadingPlaceholder"
                    style={{
                        width: "100%",
                        margin: "0 !important",
                        justifyContent: "center",
                        alignItems: "center",
                        background: "black",
                        height: "100%",
                        borderRadius: "0px",
                        flexDirection: "column",
                    }}
                >
                    <div className="topBar" style={{ width: "90%" }}></div>
                    <div className="card" style={{ width: "96%", filter: "brightness(0.5)" }}>
                        <div className="image loading">
                        </div>
                        <div className="bars">
                            <div className="bar bar1 loading" style={{ width: "40%" }}></div>
                            <div className="bar bar3 loading" style={{ width: "50%" }}></div>
                            <div className="barsset">
                                <div className="bar bar3 loading" style={{ width: "90%" }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
        else {
            let cardWithStoryArray;
            let { cardIndex } = this.props.data ? this.props.data : "";

            Log.sDebug("sliderData:"+ JSON.stringify(this.state.sliderData));
            cardWithStoryArray = this.state.sliderData.map((card, i) => {
                let randomKey = parseInt(Math.random() * 1000000);
                Log.sDebug("card:"+ JSON.stringify(card));
                let storyObj = new Story(
                    card,
                    "Engage"

                );
                storyObj.storyObj_id = storyObj.contentid ? storyObj.contentid + "_" + randomKey : randomKey;
                storyObj.uniqueKey = storyObj.streamid ? storyObj.streamid + "_" + randomKey : randomKey;
                storyObj.index = i + 1;
                storyObj.id = storyObj.contentid;
                // storyObj.streamtype = "newsBulletinSlider";
                return storyObj;
            })


            let respdata = cardWithStoryArray;
            let storyComp = [];

            for (let index in respdata) {
                let data = respdata[index];
                let cardStyles = this.getCardStyle(data, index);
                if (respdata.length === 1) {
                    cardStyles.cardStyle.minWidth = `${window.screen.availWidth - 40}px`;
                }
                const options = {
                    onChange: () => this.handleIntersection(),
                    root: "#storyDialogContainer",
                    rootMargin: '0px',
                    threshold: 1.0
                };

                let obj = (
                    <Observer {...options} key={index}>
                        <StoryComp
                            style={cardStyles.cardStyle}
                            card={data}
                            className="transform"
                            streamid={data.streamid}
                            dontObserve={true}
                        />
                    </Observer>
                );
                storyComp.push(obj);
            }
            const reactSwipStyle = { container: { borderRadius: "0px" } }
            let cardItems = (
                <CardPreviewer
                    initialIndex={cardIndex ? (cardIndex - 1) : 0}
                    cardItems={storyComp}
                    swiperContainerStyle={{ width: window.innerWidth + "px" }}
                    stepperStyle={{ top: "0px" }}
                    interSectionRoot="#storyDialogContainer"
                    //For now no close on slide completion is required
                    closeOnCompletion={() => { }}
                    reactSwipStyle={reactSwipStyle}
                    autoSlideTimeout={4000}
                    handlePullToRefresh={true}
                />)

            return (
                <div id="storyDialogContainer" className="cardWithStoryArray" ref={this.storyArryRef} style={{ width: window.innerWidth + "px", height: window.innerHeight + "px" }} >
                    <CloseIcon onClick={() => { this.props.closeModal() }} style={{ position: "absolute", top: "38px", width: "30px", right: "20px", color: "white", }}/>
                    {cardItems}
                </div>
            )
        }
    }
}

StoryModeDialog.propTypes = {
    data: PropTypes.object,
    closeModal: PropTypes.func,
};

export default StoryModeDialog;


