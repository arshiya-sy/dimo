import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import FlexView from "react-flexview";

import { Paper } from '@material-ui/core';
import LockIcon from '@mui/icons-material/Lock';
import CheckIcon from '@mui/icons-material/Check';
import NextIcon from '@material-ui/icons/ArrowForwardIos';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import ColorPicker from '../../../Services/ColorPicker';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import GamificationService from '../../../Services/Gamification/GamificationService';

export default function SingleCouponSection(props) {
    const { styles, state, localeObj, openRedeemPrizeScreen } = props;
    const { couponData } = state;
    let { prizeTitle, prizeImageUrl, couponCode, expiryDate, momentEndTime } = couponData;

    const stylesheet = {
        ...styles,
        allRewardDetailStyle: {
            width: "auto",
            display: "flex",
            alignItems: "center",
            paddingBlock: "0.75rem",
            paddingInline: '1.5rem'
        },
        rewardTaskImageContStyle: {
            marginRight: '0.625rem',
        },
        rewardNextIconStyle: {
            width: "1rem",
            right: "1.75rem",
            position: "absolute",
            fill: ColorPicker.accent,
        },
        lockIconStyle: {
            borderRadius: "50%",
            backgroundColor: ColorPicker.tableBackground,
            border: `1px solid ${ColorPicker.openInvoiceBlue}`,
        },
        lockIconSvgStyle: {
            fontSize: "1rem",
            fill: ColorPicker.white
        }
    };

    useEffect(() => {
        GamificationService.setUserMomentTimezone();
    }, []);

    let formattedExpiryDate = GeneralUtilities.isNotEmpty(expiryDate) ? expiryDate : false;
    formattedExpiryDate = formattedExpiryDate ? `${formattedExpiryDate} 23:59:59` : false;

    let isRewardExpired = formattedExpiryDate ? moment().isAfter(moment(formattedExpiryDate)) : false;
    const rewardValidTill = !isRewardExpired ? moment(formattedExpiryDate).format('DD/MM/YYYY') : '';
    let rewardValidityTitle = isRewardExpired
        ? localeObj.reward_expired 
        : <>{localeObj.valid_till} <span className='accent'>{rewardValidTill}</span></>;

    const getRewardActionIcon = () => {
        let actionIcon = "";

        if (isRewardExpired) {
            actionIcon = (<LockOutlinedIcon style={{ ...stylesheet.rewardNextIconStyle, width: "1.2rem" }} />);
        } else if (!isRewardExpired && GeneralUtilities.isNotEmpty(couponCode, false)) {
            actionIcon = (<CheckIcon style={{ ...stylesheet.rewardNextIconStyle, width: "1.2rem" }} />);
        } else {
            actionIcon = (<NextIcon style={stylesheet.rewardNextIconStyle} />);
        }

        return actionIcon;
    }

    if (!GeneralUtilities.isNotEmpty(couponCode)) {
        const formattedProgramEndDate = moment(momentEndTime).add(10, 'days');
        const isRewardRevealDateExpired = moment().isAfter(moment(`${formattedProgramEndDate.format('YYYY-MM-DD')} 23:59:59`));
        
        prizeTitle = localeObj.unclaimed_coupon;
        rewardValidityTitle = (<>{localeObj.reveal_before} <span className='accent'>{formattedProgramEndDate.format('DD/MM/YYYY')}</span></>);

        if (isRewardRevealDateExpired) {
            isRewardExpired = true;
            rewardValidityTitle = localeObj.reward_expired;
        }
    }

    return (
        <>
            <Paper
                align="left" elevation={0}
                style={{ ...stylesheet.rewardListCard, opacity: isRewardExpired ? '50%' : '100%' }}
                onClick={() => !isRewardExpired && openRedeemPrizeScreen()}
            >
                <div style={stylesheet.allRewardDetailStyle}>
                    {
                        GeneralUtilities.isNotEmpty(couponCode)
                        ? <FlexView className='mr-16'><img className='br-rounded' src={prizeImageUrl} alt='' width={40} /></FlexView>
                        : <FlexView className='mr-16 p-12' style={stylesheet.lockIconStyle}>
                            <LockIcon style={stylesheet.lockIconSvgStyle} />
                        </FlexView>
                    }

                    <FlexView column>
                        <div className="body2 highEmphasis mb-5">{prizeTitle}</div>
                        <div className="textUppercase overline mediumEmphasis">{rewardValidityTitle}</div>
                    </FlexView>

                    { getRewardActionIcon() }
                </div>
            </Paper>
        </>
    );
}

SingleCouponSection.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string,
    openRedeemPrizeScreen: PropTypes.func
};