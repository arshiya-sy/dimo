import React from 'react';
import PropTypes from 'prop-types';
import FlexView from 'react-flexview';

import GeneralUtilities from '../../../Services/GeneralUtilities';

export default function WonUserDetailSection(props) {
    const screenWidth = window.screen.width;
    const { state, styles, localeObj } = props;
    const { programData } = state;
    const stylesheet = {
        ...styles,
        winnerNameContStyle: {
            content: " ",
            background: 'linear-gradient(to bottom right, #FC6A5B, #FF6F4D, #FEA17F)',
            marginInline: 'auto',
            borderRadius: '100%',
            overflow: 'hidden'
        }
    };

    const getWonUserNameInitials = (wonUserName) => {
        const userNameSplitArray = wonUserName.split(' ');

        return userNameSplitArray.length > 1 
                ? `${(userNameSplitArray.at(0)).at(0)}${(userNameSplitArray.at(-1)).at(0)}`
                : `${wonUserName.at(0)}${wonUserName.at(1)}`;
    }

    const winnerName = programData.wonUserName ?? 'NA';
    const winnerPhoneNumber = `${localeObj.winner_phone}: ${programData.wonUserPhoneNumber}`;
    const winnerTitle = GeneralUtilities.formattedString(localeObj.winner_title, [winnerName]);
    const winnerImageUrl = programData.wonUserImageUrl;
    const winnerImageContSize = `${(screenWidth * (winnerImageUrl ? 0.45 : 0.17)) / 16}rem`;

    return (
        <div className={`mt-32 mb-${winnerImageUrl ? '16' : '24'}`}>
            <div className="headline5 highEmphasis mb-5">{winnerTitle}</div>
            {
                GeneralUtilities.isNotEmpty(programData.wonUserPhoneNumber, false)
                && <div className="subtitle2 highEmphasis">{winnerPhoneNumber}</div>
            }

            {/* Winning User Image */}
            <FlexView 
                className={`mt-${winnerImageUrl ? '16' : '24'}`} hAlignContent='center' vAlignContent='center'
                style={{...stylesheet.winnerNameContStyle, width: winnerImageContSize, height: winnerImageContSize}} 
            >
                {
                    GeneralUtilities.isNotEmpty(winnerImageUrl)
                    && <img src={winnerImageUrl} alt='' className='w-100' />
                }
                {
                    !GeneralUtilities.isNotEmpty(winnerImageUrl)
                    && <div className='H5 btnMediumEmphasis textUppercase'>
                        {getWonUserNameInitials(winnerName)}
                    </div>
                }
            </FlexView>
        </div>
    );
}

WonUserDetailSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
};