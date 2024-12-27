import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MetricsService from "../../Services/MetricsService";
import GeneralUtilities from "../../Services/GeneralUtilities";


class ScratchCardCanvas extends Component {
    constructor(props) {
        super(props);
        this.state = { loaded: false, finished: false };
        document.getElementById('root').style.overflow = 'inherit';
    }

    componentDidMount() {
        this.isDrawing = false;
        this.lastPoint = null;
        this.ctx = this.canvas.getContext("2d");

        this.image = new Image();
        this.image.crossOrigin = "Anonymous";
        this.image.onload = () => {
            this.ctx.drawImage(this.image, 0, 0, this.props.width, this.props.height);
            this.setState({ loaded: true });
        };

        this.image.src = this.props.image;

        if (this.props.customBrush) {
            this.brushImage = new Image(
                this.props.customBrush.width,
                this.props.customBrush.height
            );
            this.brushImage.src = this.props.customBrush.image;
        }
    }

    reset = () => {
        try {
            this.canvas.style.opacity = "1";
            this.ctx.globalCompositeOperation = "source-over";
            this.ctx.drawImage(this.image, 0, 0, this.props.width, this.props.height);
            this.isFinished = false;
        } catch (e) {
            //console.log(e, 'ScratchCardCanvas');
        }
    };

    getFilledInPixels(stride) {
        try {
            if (!stride || stride < 1) {
                stride = 1;
            }

            let x = 0;
            let y = 0;
            let width = this.canvas.width;
            let height = this.canvas.height;
            const pixels = this.ctx.getImageData(x, y, width, height);
            const total = pixels.data.length / stride;
            let count = 0;

            for (let i = 0; i < pixels.data.length; i += stride) {
                // @ts-ignore
                if (parseInt(pixels.data[i], 10) === 0) {
                    count++;
                }
            }

            return Math.round((count / total) * 100);
        } catch (e) {
            //console.log(e, 'ScratchCardCanvas');
        }
    }

    getMouse(e, canvas) {
        try {
            const { top, left } = canvas.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft =
                window.pageXOffset || document.documentElement.scrollLeft;

            let x = 0;
            let y = 0;

            if (e && e.pageX && e.pageY) {
                x = e.pageX - left - scrollLeft;
                y = e.pageY - top - scrollTop;
            } else if (e && e.touches) {
                x = e.touches[0].clientX - left - scrollLeft;
                y = e.touches[0].clientY - top - scrollTop;
            }

            return { x, y };
        } catch (e) {
            //console.log(e, 'ScratchCardCanvas');
        }
    }

    distanceBetween(point1, point2) {
        try {
            if (point1 && point2) {
                return Math.sqrt(
                    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
                );
            }
        } catch (e) {
            //console.log(e, 'ScratchCardCanvas');
        }

        return 0;
    }

    angleBetween(point1, point2) {
        try {
            if (point1 && point2) {
                return Math.atan2(point2.x - point1.x, point2.y - point1.y);
            }
        } catch (e) {
            //console.log(e, 'ScratchCardCanvas');
        }

        return 0;
    }

    handlePercentage(filledInPixels = 0) {
        try {
            if (this.isFinished) {
                return;
            }

            if (! this.scratchAttempted && filledInPixels > 0.5) {
                this.scratchAttempted = true;
                this.reportScratchAttempt();
            }

            let finishPercent = 70;
            if (this.props.finishPercent !== undefined) {
                finishPercent = this.props.finishPercent;
            }

            if (filledInPixels > finishPercent) {
                document.getElementById('root').style.overflow = 'inherit';
                this.setState({ finished: true });
                if (this.props.onComplete) {
                    this.props.onComplete();
                }

                this.isFinished = true;
            }
        } catch (e) {
            //console.log(e, 'ScratchCardCanvas');
        }
    }

    reportScratchAttempt = () => {
        try {
            let { card = {} } = this.props;
            if (! GeneralUtilities.isNotEmpty(card, false)) return;

            let { id = "", cardIndex = "", storyId = "", streamId = "", streamType = "Engage", tabId = "" } = card;
            let data = {
                index: cardIndex,
                storyId: storyId,
                streamId: streamId,
                streamType: streamType,
                cardTabId: tabId
            };

            MetricsService.reportActions(id, "scratchAttempt", data).then(() => {});
            this.props.cardScratchAttempted && this.props.cardScratchAttempted();
        } catch (e) {
            //console.log(e, 'ScratchCardCanvas');
        }
    }

    handleMouseUp = () => {
        document.getElementById('root').style.overflow = 'inherit';
        this.isDrawing = false;
    };

    handleMouseDown = (e) => {
        document.getElementById('root').style.overflow = 'hidden';
        
        try {
            this.isDrawing = true;
            this.lastPoint = this.getMouse(e, this.canvas);
        } catch (e) {
            //console.log(e, 'ScratchCardCanvas');
        }
    };

    handleMouseMove = (e) => {
        try {
            if (!this.isDrawing) {
                return;
            }

            const currentPoint = this.getMouse(e, this.canvas);
            const distance = this.distanceBetween(this.lastPoint, currentPoint);
            const angle = this.angleBetween(this.lastPoint, currentPoint);

            let x, y;

            for (let i = 0; i < distance; i++) {
                x = this.lastPoint ? this.lastPoint.x + Math.sin(angle) * i : 0;
                y = this.lastPoint ? this.lastPoint.y + Math.cos(angle) * i : 0;
                this.ctx.globalCompositeOperation = "destination-out";

                if (this.brushImage && this.props.customBrush) {
                    this.ctx.drawImage(
                        this.brushImage,
                        x,
                        y,
                        this.props.customBrush.width,
                        this.props.customBrush.height
                    );
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, this.props.brushSize || 20, 0, 2 * Math.PI, false);
                    this.ctx.fill();
                }
            }

            this.lastPoint = currentPoint;
            this.handlePercentage(this.getFilledInPixels(32));
        } catch (e) {
            //console.log(e, 'ScratchCardCanvas');
        }
    };

    render() {
        const containerStyle = {
            width: "100%",
            height: this.props.height + "px",
            position: "relative",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            userSelect: "none",
            border: '1px solid transparent'
        };

        const canvasStyle = {
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 99,
            width: "100%",
            height: "100%",
            borderRadius: this.props.borderRadius ?? "0"
        };

        const resultStyle = {
            visibility: this.state.loaded ? "visible" : "hidden",
            width: "100%",
            height: "100%",
            border: '1px solid transparent'
        };

        return (
            <div className="ScratchCard__Container" style={containerStyle}>
                <canvas
                    ref={(ref) => this.canvas = ref}
                    className="ScratchCard__Canvas"
                    style={canvasStyle}
                    width={this.props.width}
                    height={this.props.height}
                    onMouseDown={this.handleMouseDown}
                    onTouchStart={this.handleMouseDown}
                    onMouseMove={this.handleMouseMove}
                    onTouchMove={this.handleMouseMove}
                    onMouseUp={this.handleMouseUp}
                    onTouchEnd={this.handleMouseUp}
                />
                <div className="ScratchCard__Result" style={resultStyle}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

ScratchCardCanvas.propTypes = {
    card: PropTypes.object,
    image: PropTypes.string,
    children: PropTypes.any,
    width: PropTypes.number,
    height: PropTypes.number,
    onComplete: PropTypes.func,
    brushSize: PropTypes.number,
    customBrush: PropTypes.object,
    borderRadius: PropTypes.string,
    finishPercent: PropTypes.number,
    cardScratchAttempted: PropTypes.func
};

export default ScratchCardCanvas;

export const CUSTOM_BRUSH_PRESET = {
    image:
        "data:image/png;base64,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",
    width: 50,
    height: 50
};
