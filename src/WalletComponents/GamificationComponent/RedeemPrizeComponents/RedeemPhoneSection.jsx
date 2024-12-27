import React from 'react';
import PropTypes from 'prop-types';

import Globals from "../../../Services/Config/config";
import constantObjects from '../../../Services/Constants';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import androidApiCallsService from '../../../Services/androidApiCallsService';
import PrimaryButtonComponent from '../../CommonUxComponents/PrimaryButtonComponent';
import SecondaryButtonComponent from '../../CommonUxComponents/SecondaryButtonComponent';
import { SHARE_TYPE_PHONE_REWARD } from '../../../Services/Gamification/GamificationTerms';
import FlexView from 'react-flexview';

export default function RedeemPhoneSection(props) {
    const { styles, state, localeObj, bottomButtonsRef, fromComponent, onShareWithFriendBtnPressed } = props;
    const { programData, contentHeight } = state;
    const { prizeDetails = {} } = programData;
    const { prizeTitle, prizeImageUrl, prizeTncUrl } = prizeDetails;
    const stylesheet = { ...styles };

    const whatsappRedirectHandler = () => {
        GeneralUtilities.sendActionMetrics(fromComponent, constantObjects.open_whatsapp);
        androidApiCallsService.openUrlInBrowserLegacy(Globals.getWACustomerCarePath());
    };

    const redeemTitle = localeObj.congratulations;
    const redeemSubtitle = GeneralUtilities.formattedString(localeObj.won_phone, [prizeTitle]);
    const claimTitle = localeObj.prize_description;
    const tncButtonRefStyles = GeneralUtilities.isNotEmpty(prizeTncUrl) ? { bottom: '5rem' } : {};

    return (
        <>
            {/* Redeem Reward Summary */}
            <FlexView
                column hAlignContent='center'
                className='px-16 py-30 scroll text-center'
                style={{ overflowY: 'auto', width: 'initial', maxHeight: contentHeight }}
            >
                <div className="headline5 highEmphasis">{redeemTitle}</div>
                <div className="subtitle4 highEmphasis my-10">{redeemSubtitle}</div>
                {
                    prizeImageUrl
                    && <div className='pt-32 pb-16 px-16'>
                        <img src={prizeImageUrl} alt='' style={stylesheet.rewardImageStyle} />
                    </div>
                }
                <div className="body2 highEmphasis mt-16">{claimTitle}</div>
            </FlexView>

            {/* Bottom Buttons Section */}
            <div
                ref={bottomButtonsRef}
                style={{ ...stylesheet.bottomContainerStyle, ...tncButtonRefStyles }} className='pt-10'
            >
                <PrimaryButtonComponent btn_text={localeObj.prize_whatsapp} onCheck={whatsappRedirectHandler} />
                <SecondaryButtonComponent btn_text={localeObj.share_with_friends_btn} onCheck={() => onShareWithFriendBtnPressed(SHARE_TYPE_PHONE_REWARD)} />
            </div>
        </>
    )
}

RedeemPhoneSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string,
    bottomButtonsRef: PropTypes.object,
    openSnackBarHandler: PropTypes.func,
    onShareWithFriendBtnPressed: PropTypes.func
};
