import React from 'react';
import PropTypes from 'prop-types';
import FlexView from "react-flexview";

import Grid from "@material-ui/core/Grid";
import Drawer from '@material-ui/core/Drawer';
import CloseIcon from '@mui/icons-material/Close';
import { withStyles } from "@material-ui/core/styles";

import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import InputThemes from "../../../Themes/inputThemes";
import SingleCouponSection from './SingleCouponSection';
import ColorPicker from '../../../Services/ColorPicker';
import MetricServices from "../../../Services/MetricsService";
import CommonFunctions from '../../../Services/CommonFunctions';
import localeService from "../../../Services/localeListService";
import GeneralUtilities from '../../../Services/GeneralUtilities';
import ShimmerComponent from '../../CommonUxComponents/ShimmerComponent';

var localeObj = {};
const inputStyles = InputThemes.singleInputStyle;

const screenHeight = window.screen.height;

class AllCouponsComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ...props.state,
            showBottomSheet: true,
        };

        this.componentName = PageNames.GamificationComponent.all_coupons;

        this.style = {
            ...props.styles,
            allCouponsListCont: {
                paddingInline: '1.5rem',
                alignItems: 'center',
                height: screenHeight * 0.65,
                overflow: 'hidden scroll'
            },
            rewardListCard: {
                width: '100%',
                position: "relative",
                marginBottom: "1rem",
                borderRadius: "0.75rem",
                backgroundColor: ColorPicker.lightEmphasis,
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

    componentDidUpdate(prevProps, prevState) {
        if (this.props?.state?.userEarnedCouponsData !== prevProps?.state?.userEarnedCouponsData) {
            const { processing, userEarnedCouponsData } = this.props?.state;

            this.setState({ processing, userEarnedCouponsData });
        }
      }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    onDismissHandler = () => {
        this.setState({ showBottomSheet: false });
        this.props.closeBottomSheetHandler();
    }

    render() {
        const stylesheet = this.style;
        const { classes, localeObj, fromComponent, openRedeemPrizeScreen } = this.props;
        const { showBottomSheet, userEarnedCouponsData, wonDetailsScreen, processing, programData } = this.state;

        return (
            <Drawer
                classes={{ paper: classes.paper }}
                anchor="bottom"
                open={showBottomSheet}
                onClose={this.onDismissHandler}
            >
                <div style={{ ...stylesheet.rewardScrollContStyle, overflowY: 'hidden' }}>
                    <FlexView hAlignContent='right' className='py-16 pl-24 pr-16'>
                        <CloseIcon onClick={this.onDismissHandler} style={{ fill: ColorPicker.white }} />
                    </FlexView>

                    {/* All Coupons Header Section */}
                    <div className='mb-16 text-center' style={{ paddingInline: '1.5rem' }}>
                        <div className="headline5 highEmphasis mb-16">{localeObj.coupons_so_far}</div>
                        <div className="caption highEmphasis">{localeObj.earned_coupons_subtitle}</div>
                    </div>

                    {
                        processing
                        && <ShimmerComponent
                            totalComponents={4}
                            loadingComponents={[
                                {
                                    name: "inline-content", classNames: "br-16",
                                    inlineLeftContents: [{ name: "icon", classNames: "br-rounded" }],
                                    inlineRightContents: [{name: "subtitle", classNames: "br-16"}, {name: "subtitle", classNames: "mt-5 br-16"}]
                                },
                            ]}
                            containerClasses={{ pageClassNames: "mt-16", containerClassNames: "mx-24 br-12 py-16 px-24 mb-16" }}
                        />
                    }

                    {/* All Coupons List */}
                    {
                        !processing
                        && <FlexView className="scroll" column style={stylesheet.allCouponsListCont}>
                            {
                                GeneralUtilities.isNotEmpty(userEarnedCouponsData, false)
                                && <Grid container style={{ justifyContent: 'center' }}>
                                    {
                                        userEarnedCouponsData.map((couponData, couponIndex) => (
                                            <SingleCouponSection
                                                key={couponIndex}
                                                localeObj={localeObj} styles={stylesheet}
                                                state={{ programData, couponData, couponIndex, wonDetailsScreen }}
                                                fromComponent={fromComponent}
                                                openRedeemPrizeScreen={() => openRedeemPrizeScreen(couponData)}
                                            />
                                        ))
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

AllCouponsComponent.propTypes = {
    state: PropTypes.object,
    styles: PropTypes.object,
    classes: PropTypes.object,
    localeObj: PropTypes.object,
    fromComponent: PropTypes.string,
    openRedeemPrizeScreen: PropTypes.func,
    closeBottomSheetHandler: PropTypes.func
};

export default withStyles(inputStyles)(AllCouponsComponent);