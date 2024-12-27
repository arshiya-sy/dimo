import React from 'react';
import PropTypes from 'prop-types';

import androidApiCalls from "../../Services/androidApiCallsService";
import ScratchCardCanvas from './ScratchCardCanvas';
import DBService from "../../Services/DBService";
import GeneralUtilities from '../../Services/GeneralUtilities';

class ScratchCardWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            scratchThresholdExceeded: false,
            cardId: this.props?.card?.id
        }

        this.scratchedCards = this.props?.scratchedCards;
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        
        setTimeout(() => this.props.initialScratchCardHandler && this.props.initialScratchCardHandler(), 100);

        if (!GeneralUtilities.isNotEmpty(this.scratchedCards, false)) {
            this.scratchedCards = DBService.getScratchedCards();
        }
        
        this.scratchedCards.includes(this.state.cardId) && this.setState({ scratchThresholdExceeded: true });
    }

    onComplete = () => {
        this.setState({ scratchThresholdExceeded: true });
        DBService.setScratchedCard(this.state.cardId);
        this.props.cardScratchCompleted(this.state.cardId);
    }

    render() {
        const { children, height } = this.props;
        const { scratchThresholdExceeded } = this.state;

        return (
            <div style={{ position: 'relative', width: '100%', height, overflow: 'hidden', borderRadius: "16px" }}>
                {
                    ! scratchThresholdExceeded
                    ? <ScratchCardCanvas {...this.props} onComplete={this.onComplete}>{children}</ScratchCardCanvas>
                    : children
                }
            </div>
        );
    }
}

ScratchCardWrapper.propTypes = {
    card: PropTypes.object,
    children: PropTypes.any,
    height: PropTypes.number,
    scratchedCards: PropTypes.array,
    cardScratchCompleted: PropTypes.func,
    initialScratchCardHandler: PropTypes.func
};


export default ScratchCardWrapper;
