import React, { Fragment } from "react";
import PropTypes from 'prop-types';

import Utils from "./Utils";
import Log from "../../Services/Log";
import elementActions from "./elementActions";
import DBService from "../../Services/DBService";
import localeService from "../../Services/localeListService";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";

const percentageConst = 4.25; //For pixel scale down values;
const thirtySec = 30000;
var localeObj = {};

class CountDownTimer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            showFlash: true,
            removeTimer: false,
        }

        try {
            let { metadata } = this.props;
            let data = metadata.data;
            let { 
                    "Timer config": {
                        "Font color": Fontcolor,
                        "Font family": Fontfamily,
                        "Font size": Fontsize,
                        "Bold": boldFontTimer,
                        "Italic": italicFontTimer 
                    } = {},
                    "Label config": {
                        "Font color": labelFontColor,
                        "Font family": labelFontfamily,
                        "Font size": labelFontsize,
                        "Bold": boldFontLabel,
                        "Italic": italicFontLabel
                    } = {} 
                } = data;

            this.timeUnitStyle = {
                color: Fontcolor,
                fontSize: this.formalizeFontSize(Fontsize),
                fontFamily: Fontfamily,
                fontWeight: boldFontTimer ? "bold" : "normal",
                fontStyle: italicFontTimer ? "italic" : "normal"
            }

            this.labelStyle = {
                color: labelFontColor,
                fontSize: this.formalizeFontSize(labelFontsize),
                fontFamily: labelFontfamily,
                fontWeight: boldFontLabel ? "bold" : "normal",
                fontStyle: italicFontLabel ? "italic" : "normal"
            }
        } catch (error) {
            Log.debug(`CountDownTimer constructor timer styling config error: ${error}`);
        }
    }

    componentDidMount = () => {
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }

        this.adjustContentCard();
        this.initTimer();
    }

    componentWillUnmount = () => {
        clearInterval(this.timerInterval);
    }

    formalizeFontSize = (Fontsize) => {
        const num = parseFloat(Fontsize);
        const cssUnit = Fontsize.match(/%|em/);

        return this.scaledFontSize(
            isNaN(num) ? '' : (cssUnit ? (num + cssUnit) : `${Math.round(num)}px`)
        );
    }

    scaledFontSize = (Fontsize) => {
        if (Fontsize.match(/px/)) {
            return ((percentageConst * (Fontsize.match(/\d+/)[0])) + "%");
        } else return Fontsize;
    }

    makeCardVisible = (contentId) => {
        let cardBanner = document.querySelector(`[data-content-id="${contentId}"]`);
        if (cardBanner) {
            cardBanner.style.visibility = "visible";
        }
    }

    initTimer = () => {
        const self = this;
        const { metadata, story } = this.props;
        const { data } = metadata;
        const contentId = story.contentid || story.id;
        const second = 1000;
        const minute = second * 60;
        const hour = minute * 60;
        const day = hour * 24;

        let adjustedTimestamp = data["Expiry time"] && String(data["Expiry time"]);
        let expiryTime = new Date(Number(adjustedTimestamp));
        const expiryTimestamp = new Date(expiryTime).getTime();

        this.makeCardVisible(contentId);

        if (this.isIsoDate(expiryTime)) {
            expiryTime = new Date(String(data["Expiry time"])).getTime();
        } else {
            adjustedTimestamp = new Date(Number(adjustedTimestamp)).getTime();
        }

        if (!adjustedTimestamp) {
            adjustedTimestamp = new Date(String(data["Expiry time"])).getTime();
        }

        adjustedTimestamp = this.getAdjustedTimeStamp(adjustedTimestamp);

        if (!expiryTime || isNaN(expiryTime)) {
            this.setState({ removeTimer: true });
            return;
        }

        this.timerInterval = setInterval(function () {
            try {
                const currentTimestamp = new Date().getTime();
                const remainingTimestamp = expiryTimestamp - currentTimestamp;
                const remainingDays = Math.floor(remainingTimestamp / (day));
                const remainingHours = Math.floor((remainingTimestamp % (day)) / (hour));
                const remainingMinutes = Math.floor((remainingTimestamp % (hour)) / (minute));
                const remainingSeconds = Math.floor((remainingTimestamp % (minute)) / second);

                self.setState({
                    days: remainingDays > 0 ? remainingDays : 0,
                    hours: remainingHours > 0 ? remainingHours : 0,
                    minutes: remainingMinutes > 0 ? remainingMinutes : 0,
                    seconds: remainingSeconds > 0 ? remainingSeconds : 0,
                    showFlash: false, removeTimer: false
                });

                //do something later when date is reached
                if (remainingTimestamp < 0) {
                    let deviceTimeChanged = false;
                    
                    if (
                        self.lastSavedDeviceTime 
                        && (Math.abs(new Date().getTime() - self.lastSavedDeviceTime) > thirtySec)
                    ) { 
                        //To handle drastic device time from recent
                        deviceTimeChanged = true;
                        clearInterval(self.timerInterval);
                        self.setState({ removeTimer: true });
                    }

                    deviceTimeChanged ? self.initTimer() : self.handleExpire();
                } else {
                    self.lastSavedDeviceTime = new Date().getTime();
                }

                if (
                    self.lastDistance 
                    && (Math.abs(remainingTimestamp - self.lastDistance) > thirtySec)
                ) {
                    clearInterval(self.timerInterval);
                    self.lastDistance = remainingTimestamp;
                    self.setState({ removeTimer: true });
                    self.initTimer();
                } else {
                    self.lastDistance = remainingTimestamp;
                }
            } catch (error) {
                Log.debug(`CountDownTimer timer interval error: ${error}`);
            }
        }, 1000);
    }

    handleExpire = () => {
        const { metadata = {}, story } = this.props;
        const { action } = metadata;
        const actionType = action && action[0] && action[0].type;
        const contentId = story.contentid || story.id;

        if (actionType === "showContentCard") {
            let timerCard = document.getElementById(`${contentId}_delete`);
            let contentCard = document.getElementById(`${contentId}_delete`).nextSibling;
            
            if (timerCard) {
                timerCard.style.display = "none";
            }

            if (contentCard) {
                contentCard.style.display = "block";
                contentCard.style.width = "100%";
                let innerContent = contentCard.querySelector("[data-content-id]");
                innerContent.style.left = "0px";
                innerContent.style.width = "100%";
            }

            clearInterval(this.timerInterval);
        } else {
            clearInterval(this.timerInterval);
            this.setState({ removeTimer: true });
            DBService.setDeletedCard(contentId);
            story.removeStoryFromCards && story.removeStoryFromCards(contentId);
        }
    }

    getCurrentDate() {
        const todayDate = new Date();
        const calculatedDate = (new Date(
            8 * 60 * 60000 
            + todayDate.valueOf() 
            + (todayDate.getTimezoneOffset() * 60000)
        )).toString();
        const dateNoon = calculatedDate.getHours() < 12 ? 'AM' : 'PM';

        return calculatedDate.substring(0, calculatedDate.indexOf(' GMT')) + ' ' + dateNoon;
    }

    adjustContentCard = () => {
        try {
            const { story } = this.props;
            const contentId = story.contentid || story.id;
            const container = document.getElementById(`${contentId}`);
            const cardBanner = document.querySelector(`[data-content-id="${contentId}"]`);
            const contentCard = document.getElementById(`${contentId}_delete`).nextSibling;
            if (contentCard && cardBanner && container) {
                contentCard.style.display = "none";
                container.style.paddingRight = "0px";
                cardBanner.style.width = "100%";
                cardBanner.style.visibility = "hidden";
            }
        } catch (error) {
            Log.debug(`CountDownTimer adjust content card error: ${error}`);
        }
    }

    isIsoDate = (str) => {
        if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
        var d = new Date(str);
        return d.toISOString() === str;
    }

    getAdjustedTimeStamp = (expiryTime) => {
        let diffInTimestamp = (String(new Date().getTime()).length - String(expiryTime).length);
        
        if (diffInTimestamp > 0) {
            for (let i = 0; i < diffInTimestamp; i++) {
                expiryTime += "0";
            }
        } else if (expiryTime < 0) {
            expiryTime = expiryTime.substring(0, String(new Date().getTime()).length);
        }
        
        return expiryTime;
    }

    elementClickAction = ($event) => {
        try {
            if ($event.defaultPrevented) return;

            $event.preventDefault();
            const { metadata, story } = this.props;
            const { action } = metadata;

            if (action.actionType !== "Dismiss card") {
                elementActions.performAction(action, metadata, story, "", this.props);
            }
        } catch (error) {
            Log.debug(`CountDownTimer element click action error: ${error}`);
        }
    }

    render() {
        const { timeUnitStyle, labelStyle } = this;
        const { days, hours, minutes, seconds, showFlash, removeTimer } = this.state;
        const { metadata, style, story } = this.props;
        const { data } = metadata;
        const UnitSeparator = data["Unit seperator"];
        const ShowLabels = data["Show labels"];
        const nonScaledFontSize = { fontSize: "16px" };
        const formattedDays = ('0' + days).slice(-2);
        const formattedHours = ('0' + hours).slice(-2);
        const formattedMinutes = ('0' + minutes).slice(-2);
        const formattedSeconds = ('0' + seconds).slice(-2);

        const dataHiddenItems = data["Hidden items"];
        let hiddenItems = dataHiddenItems
            && (typeof dataHiddenItems === "string" ? dataHiddenItems.toLowerCase().split(",") : []);

        let hideDays = hiddenItems.indexOf("days") > -1;
        let hideHours = hiddenItems.indexOf("hours") > -1;
        let hideMinutes = hiddenItems.indexOf("minutes") > -1;
        let hideSeconds = hiddenItems.indexOf("seconds") > -1;

        let styleObj = Utils.parseStyle(style);

        if (story.id.indexOf('cards') === -1) {
            styleObj = Utils.getScaledStyle(styleObj, story);
        }
        
        return (
            <div onClick={this.elementClickAction} id="countdown" style={styleObj}>
                {
                    !removeTimer
                    && <Fragment>
                        {
                            showFlash
                                ? <CustomizedProgressBars size={45} rootStyles={{ marginTop: '0.875rem' }}/>
                                : <div className="countdownWrapper" style={{ ...timeUnitStyle, ...nonScaledFontSize }}>
                                    <div className="timeCounter" style={timeUnitStyle}>
                                        {
                                            !hideDays
                                            && <Fragment>
                                                <span id="days" className="countdownTimerUnit">{formattedDays}</span>
                                                <span className="countdownTimerSplitter">{UnitSeparator}</span>
                                            </Fragment>
                                        }
                                        {
                                            !hideHours
                                            && <Fragment>
                                                <span id="hours" className="countdownTimerUnit">{formattedHours}</span>
                                                <span className="countdownTimerSplitter">{UnitSeparator}</span>
                                            </Fragment>
                                        }
                                        {
                                            !hideMinutes 
                                            && <span id="minutes" className="countdownTimerUnit">{formattedMinutes}</span>
                                        }
                                        {
                                            !hideMinutes 
                                            && !hideSeconds 
                                            && <span className="countdownTimerSplitter">{UnitSeparator}</span>
                                        }
                                        {
                                            !hideSeconds 
                                            && <span id="seconds" className="countdownTimerUnit">{formattedSeconds}</span>
                                        }
                                    </div>

                                    {ShowLabels && <div className="labelCounter" style={timeUnitStyle}>
                                        {
                                            !hideDays 
                                            && <Fragment>
                                                <span className="countdownTimerLabel" style={labelStyle}>
                                                    { days > 1 ? localeObj.timer_days_plural : localeObj.timer_day_singular }
                                                </span>
                                                <span className="countdownLabelSplitter">{UnitSeparator}</span>
                                            </Fragment>
                                        }
                                        {
                                            !hideHours 
                                            && <Fragment>
                                                <span className="countdownTimerLabel" style={labelStyle}>
                                                    { hours > 1 ? localeObj.timer_hours_plural : localeObj.timer_hour_singular }
                                                </span>
                                            <span className="countdownLabelSplitter">{UnitSeparator}</span></Fragment>}
                                        {
                                            !hideMinutes 
                                            && <span className="countdownTimerLabel" style={labelStyle}>
                                                { minutes > 1 ? localeObj.timer_minutes_plural : localeObj.timer_minute_singular }
                                            </span>
                                        }
                                        {
                                            !hideMinutes 
                                            && !hideSeconds 
                                            && <span className="countdownLabelSplitter">{UnitSeparator}</span>
                                        }
                                        {
                                            !hideSeconds 
                                            && <span className="countdownTimerLabel" style={labelStyle}>
                                                { seconds > 1 ? localeObj.timer_seconds_plural : localeObj.timer_second_singular }
                                            </span>
                                        }
                                    </div>}
                                </div>
                        }
                    </Fragment>
                }
            </div>
        )
    }
}

CountDownTimer.propTypes = {
    story: PropTypes.object,
    style: PropTypes.string,
    metadata: PropTypes.object,
};

export default CountDownTimer;