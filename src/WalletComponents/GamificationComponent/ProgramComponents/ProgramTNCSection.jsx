import React from 'react';
import PropTypes from 'prop-types';

import constantObjects from '../../../Services/Constants';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import androidApiCalls from "../../../Services/androidApiCallsService";
import FlexView from 'react-flexview';

export default function ProgramTNCSection(props) {
    const { state, localeObj, styles, fromComponent, isRedeemReward = false } = props;
    const { programData } = state;

    const stylesheet = {
        ...styles,
        termsConditionContainerStyle: {
            bottom: 0,
            position: 'relative',
            paddingBlock: "1.5rem 1rem",
        },
    };

    const openTermsAndCondition = () => {
        let tncUrl = programData?.communication?.termsConditionUrl;
        let buttonMetrics = constantObjects.Gamification.programTncUrl;

        if (isRedeemReward) {
            tncUrl = programData?.prizeDetails?.prizeTncUrl;
            buttonMetrics = constantObjects.Gamification.redeemRewardTncUrl;
        }

        if (GeneralUtilities.isNotEmpty(tncUrl)) {
            GeneralUtilities.sendActionMetrics(fromComponent, buttonMetrics);
            androidApiCalls.openUrlInBrowser(tncUrl);
        }
    }

    return (
        <FlexView hAlignContent='center' style={stylesheet.termsConditionContainerStyle}>
            <div className="body2 highEmphasis w-max-text" onClick={openTermsAndCondition}>
                {localeObj.program_terms}
            </div>
        </FlexView>
    );
}

ProgramTNCSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string
};
