import React from "react";
import PropTypes from 'prop-types';
import SlotCounter from 'react-slot-counter';

export default function LNSlotCounter(props) {
    const { formattedLN } = props;

    return (
        <SlotCounter
            startValue={'00-00000'}
            startValueOnce
            value={formattedLN}
            animateUnchanged
            direction="top-bottom"
            autoAnimationStart={true}
            duration={2}
        />
    );
}

LNSlotCounter.propTypes = {
    formattedLN: PropTypes.string,
};