import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Utils from './Utils';
import localeService from '../../Services/localeListService';
import playstoreImg from "../../images/playstore_dialog.png";
import GeneralUtilities from "../../Services/GeneralUtilities";
import androidApiCallsService from '../../Services/androidApiCallsService';

import "../../styles/main.css";

var localeObj = {};

export default class RateUsCard extends Component {
    constructor(props) {
        super(props)
        this.data = (props.data && props.data.configData) || {};
    }

    componentDidMount() {
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    handleOk = () => {
        this.setState({ openStatus: false });
        const deviceInformationObj = GeneralUtilities.getDeviceInformationObject();
        deviceInformationObj &&
        androidApiCallsService.openApp(`market://details?id=${deviceInformationObj.pkgName}`, false);
        androidApiCallsService.persistValue(this.data.elemId, true);
        let eventObj = {
            src: "rate_now",
            answer: this.data.answer,
            elem_id: this.data.elemId,
            story_id: this.data.storyid,
            content_id: this.data.contentid,
            open_ps_threshold: this.data.openPsThreshold
        };
        this.closeDialog();
        Utils.reportMetrics("ps_rating", "open_ps", eventObj);
    }

    handleSkip = () => {
        let eventObj = {
            answer: this.data.answer,
            elem_id: this.data.elemId,
            story_id: this.data.storyid,
            content_id: this.data.contentid
        };
        this.closeDialog();
        Utils.reportMetrics("ps_rating", "click_not_now", eventObj);
    }

    closeDialog = () => {
        this.props.closeModal && this.props.closeModal();
    }

    render() {
        return (<div className='rateus-container'>
            <section className='rateus-top-section'>
                <img className='rateus-image' src={playstoreImg} alt="" />
                <div className='rateus-text'>{localeObj.rate_us_desc}</div>
            </section>
            <section className='rateus-button-section' >
                <button className='rateus-later' onClick={this.handleSkip} >{localeObj.not_now}</button>
                <button className='rateus-now' onClick={this.handleOk}>{localeObj.rate_us}</button>
            </section>
        </div>);
    }
}

RateUsCard.propTypes = {
    data: PropTypes.object,
    closeModal: PropTypes.func,
  };
