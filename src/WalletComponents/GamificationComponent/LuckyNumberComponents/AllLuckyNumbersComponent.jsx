import React from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";

import Grid from "@material-ui/core/Grid";
import Drawer from '@material-ui/core/Drawer';
import { withStyles } from "@material-ui/core/styles";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import InputThemes from "../../../Themes/inputThemes";
import MetricServices from "../../../Services/MetricsService";
import CommonFunctions from '../../../Services/CommonFunctions';
import localeService from "../../../Services/localeListService";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import ButtonAppBar from '../../CommonUxComponents/ButtonAppBarComponent';
import GamificationService from '../../../Services/Gamification/GamificationService';

import TicketImage from "../../../images/GamificationImages/luckyNumber/ticket.png";

var localeObj = {};
const inputStyles = InputThemes.singleInputStyle;

const screenHeight = window.screen.height;

class AllLuckyNumbersComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ...props.state,
            showBottomSheet: true,
        };

        this.componentName = PageNames.GamificationComponent.all_lucky_numbers;

        this.style = {
            ...props.styles,
            allLuckNumbersListCont: {
                paddingInline: '1.5rem',
                alignItems: 'center',
                height: screenHeight * 0.70,
                overflow: 'hidden scroll'
            },
        }

        MetricServices.onPageTransitionStart(this.componentName);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        CommonFunctions.addVisibilityEventListener(this.componentName);
        window.onBackPressed = () => this.onDismissHandler();
    }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    onDismissHandler = () => {
        if (this.state.showBottomSheet) {
            this.setState({ showBottomSheet: false });
            this.props.closeBottomSheetHandler();
        } else {
            GeneralUtilities.goBackHistoryPath();
        }
    }

    render() {
        const { classes, localeObj } = this.props;
        const stylesheet = this.style;
        const { showBottomSheet, userEarnedLNsData, processing, wonDetailsScreen } = this.state;

        return (
            <Drawer
                classes={{ paper: classes.fullScreenDrawer }}
                anchor="bottom"
                open={showBottomSheet}
                onClose={this.onDismissHandler}
            >
                <ButtonAppBar
                    style={{ marginLeft: "7%" }} header={localeObj.all_lucky_numbers_screen}
                    action={'help'}
                    onBack={this.onDismissHandler}
                    onHelp={() => CommonFunctions.onHelpButtonPressed(this.componentName)}
                />

                <div style={{ ...stylesheet.rewardScrollContStyle, overflowY: 'hidden', display: !processing ? 'block' : 'none' }}>
                    {/* All Lucky Number Header Section */}
                    <div className='mb-48' style={{ paddingInline: '1.5rem' }}>
                        <p className="headline5 highEmphasis mb-16">{localeObj.all_numbers}</p>
                    </div>

                    {/* All Lucky Numbers List */}
                    {
                        !processing
                        && <FlexView column style={stylesheet.allLuckNumbersListCont} className="scroll">
                            {
                                GeneralUtilities.isNotEmpty(userEarnedLNsData, false)
                                && <Grid container style={{ justifyContent: 'center' }}>
                                    {
                                        userEarnedLNsData.map((luckyNumberData, luckyNumberIndex) => {
                                            const formattedLN = GamificationService.getDisplayTicketString(luckyNumberData.luckyNumber);
                                            const isLostTicket = wonDetailsScreen && !luckyNumberData.won;
                                            const isWonTicket = wonDetailsScreen && luckyNumberData.won;

                                            return (
                                                <Grid
                                                    align="center" item xs={6} key={luckyNumberIndex}
                                                    className={isLostTicket ? 'disableReward' : ''}
                                                    style={{ position: 'relative', paddingInline: '0.25rem', alignSelf: 'center' }}
                                                >
                                                    <img
                                                        src={TicketImage} alt=""
                                                        className={`w-100 ${isWonTicket ? 'wonNormalTicketNumber' : ''}`}
                                                    />
                                                    <div className="p-5 w-100 body3 highEmphasis" style={stylesheet.ticketNumberStyle}>
                                                        { formattedLN }
                                                    </div>
                                                </Grid>
                                            );
                                        })
                                    }
                                </Grid>
                            }
                        </FlexView>
                    }
                </div>
            </Drawer>
        );
    }
}

AllLuckyNumbersComponent.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    classes: PropTypes.object,
    localeObj: PropTypes.object,
    closeBottomSheetHandler: PropTypes.func
};

export default withStyles(inputStyles)(AllLuckyNumbersComponent);