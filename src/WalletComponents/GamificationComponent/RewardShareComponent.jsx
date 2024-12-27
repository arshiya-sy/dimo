import React from 'react';
import PropTypes from 'prop-types';
import * as html2canvas from 'html2canvas';

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider, withStyles } from "@material-ui/core/styles";

import Log from '../../Services/Log';
import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import InputThemes from "../../Themes/inputThemes";
import constantObjects from '../../Services/Constants';
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import CommonFunctions from '../../Services/CommonFunctions';
import GeneralUtilities from '../../Services/GeneralUtilities';
import RewardShareSection from './ShareComponents/RewardShareSection';
import ButtonAppBar from '../CommonUxComponents/ButtonAppBarComponent';
import androidApiCallsService from '../../Services/androidApiCallsService';
import PrimaryButtonComponent from '../CommonUxComponents/PrimaryButtonComponent';
import { SHARE_TYPE_PHONE_PROGRAM } from '../../Services/Gamification/GamificationTerms';

let localeObj = {};
const screenHeight = window.screen.height;
const styles = InputThemes.singleInputStyle;
const snackBarTheme = InputThemes.snackBarTheme;

class RewardShareComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            programData: this.props.location?.state?.programData ?? {},
            shareType: this.props.location?.state?.shareType ?? SHARE_TYPE_PHONE_PROGRAM,
            fromComponent: this.props.location?.fromComponent ?? "",
            disableShareBtn: false,
            isSnackBarOpen: false,
            snackBarMessage: ''
        };

        this.componentName = PageNames.GamificationComponent.share_reward;

        this.style = {
            rewardScrollContStyle: {
                overflow: "hidden auto",
                height: screenHeight * 0.74
            },
            bottomContainerStyle: {
                width: '100%',
                textAlign: 'center',
                position: 'fixed',
                bottom: '1rem'
            },
        };

        MetricServices.onPageTransitionStart(this.componentName);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidMount() {
        window.onBackPressed = () => this.onBackButtonPressed();
        CommonFunctions.addVisibilityEventListener(this.componentName);
    }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    onBackButtonPressed = () => {
        const { fromComponent } = this.state;

        if (fromComponent === PageNames.GamificationComponent.redeem_reward) {
            return this.props.history.replace({
                pathname: "/redeemReward",
                transition: "right",
                state: { ...this.props.location?.state }
            });
        }

        GeneralUtilities.goBackHistoryPath();
    };

    openSnackBar = (message) => {
        this.setState({ isSnackBarOpen: true, snackBarMessage: message });
    }

    closeSnackBar = () => {
        this.setState({ isSnackBarOpen: false });
    }

    shareBtnHandler = () => {
        this.setState({ disableShareBtn: true });

        Log.sDebug("Clicked on share", this.componentName);

        androidApiCallsService.copyToClipBoard("https://dimomotorola.com.br/rewards?rewardActions=allPrograms");

        this.openSnackBar(localeObj.link_copied);

        const fileName = "comprovante_Gamification_";

        html2canvas(
            document.getElementById('share_section'),
            { allowTaint: true, useCORS: true }
        ).then((canvas) => {
            const imgData = canvas.toDataURL('image/png').split(';base64,')[1];
            androidApiCallsService.shareWalletImage(imgData, localeObj.pix_receipt_share_header, fileName);
        });

        setTimeout(() => this.setState({ disableShareBtn: false }), 1500);
        return;
    }

    render() {
        const { programData, shareType, disableShareBtn, isSnackBarOpen, snackBarMessage } = this.state;

        return (
            <div id="share_reward_container">
                <ButtonAppBar header={localeObj.reward_share_screen} onBack={this.onBackButtonPressed} action="none" />

                <div style={this.style.rewardScrollContStyle} className="scroll">
                    <div className='px-24 mt-10'>
                        <div className="headline5 highEmphasis">{localeObj.reward_share_title}</div>
                        <div className="body2 mediumEmphasis mt-5">{localeObj.reward_share_subtitle}</div>
                    </div>
                    <div className='p-24'>
                        <RewardShareSection
                            programData={programData} styles={this.style} localeObj={localeObj}
                            shareType={shareType}
                        />
                    </div>
                    {/* Bottom Buttons Section */}
                    <div style={this.style.bottomContainerStyle} className='pt-10'>
                        <PrimaryButtonComponent
                            btn_text={localeObj.reward_share_btn} onCheck={this.shareBtnHandler}
                            disabled={disableShareBtn}
                        />
                    </div>
                </div>


                {/* Snackbar Section */}
                <MuiThemeProvider theme={snackBarTheme}>
                    <Snackbar
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        open={isSnackBarOpen}
                        onClose={this.closeSnackBar}
                        autoHideDuration={constantObjects.SNACK_BAR_DURATION}
                    >
                        <MuiAlert elevation={6} variant="filled" icon={false}>{snackBarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

RewardShareComponent.propTypes = {
    location: PropTypes.object
};

export default withStyles(styles)(RewardShareComponent);
