import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import CancelIcon from '@material-ui/icons/Cancel';
import { MuiThemeProvider } from "@material-ui/core/styles";

import Utils from "../EngageCardComponent/Utils";
import InputThemes from "../../Themes/inputThemes";
import constantObjects from "../../Services/Constants";
import MetricServices from '../../Services/MetricsService';
import GeneralUtilities from "../../Services/GeneralUtilities";
import DomRenderComp from "../EngageCardComponent/DomRenderComponent";
import androidApiCallsService from "../../Services/androidApiCallsService";
import { PopupModalHocManger } from "../EngageCardComponent/PopupModalHoc";
import ScratchCardWrapper from "../ScratchCardComponent/ScratchCardWrapper";
import { CUSTOM_BRUSH_PRESET } from "../ScratchCardComponent/ScratchCardCanvas";

import '../../styles/main.css';

const theme2 = InputThemes.snackBarTheme;
const ActionTypes = Utils.getActionTypes();

class CustomAlertDialogs extends Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.state = {
            openStatus: true,
            showDialogContent: true,
            snackbarOpen: false,
            snackbarMessage: null
        }

         try {
            const dialogData = this.props.data.dialogData;
            const versionedData = dialogData['A'] || dialogData['B'];

            this.cancellable = versionedData.default[0].dom.dialogcancellable;
            this.dialogId = versionedData.default[0].id;
            this.alignDialog = versionedData.default[0].dom.aligndialog.toLowerCase() || "center";
            if (versionedData.default[0].dom.dialogOptionMenu) {
                this.showXIcon = versionedData.default[0].dom.dialogOptionMenu.toLowerCase() === "close";
            } else {
                this.showXIcon = false;
            }
         } catch (err) {
             this.cancellable = false;
             this.alignDialog = "center";
             this.showXIcon = false;
         }

        this.styles = {
            container: Object.assign({
                position: 'relative',
                height: '60%',
                width: '60%',
                background: 'black',
                overflow: 'auto',
                borderRadius: 'inherit',
            }, props.style),
            xIcon: {
                position: 'absolute',
                zIndex: '100',
                width: '20px',
                height: '20px',
                fontSize: '20px',
                backgroundColor: 'white',
                top: '5px',
                right: '5px',
                borderRadius: '50%',
                border: "1px solid white",
                color: 'black'
            }
        };
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }


    handleClickOutside(event) {
        if (!this.cancellable)
            return;
        if (this.ref.current && !this.ref.current.contains(event.target)) {
            this.handleClose();
        }
    }

    componentDidMount = () => {
        androidApiCallsService.enablePullToRefresh(false);
        document.addEventListener('click', this.handleClickOutside, true);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside, true);
    }

    handleClose = () => {
        const idArray = this.dialogId && this.dialogId.split("~#");
        const storyIndex = idArray && parseInt(idArray[idArray.length - 1]) + 1;
        const eventObj = {
            index: storyIndex,
            streamId: "Engage",
            story_id: idArray && idArray[0],
            streamType: "Engage",
            cardTabId : androidApiCallsService.getWalletTabId(),
            contentid : this.dialogId,
            category: "dialog"
        };
      
        MetricServices.reporteOperationMetrics({action: ActionTypes.CLOSE_BTN_CLICK, story: eventObj}).then(() => {});
        PopupModalHocManger.closeModal();
    }

    closeSnackBar = () => {
        this.setState({ snackbarOpen: false });
    }

    openSnackBar = (message) => {
        this.setState({
            snackbarOpen: true,
            snackbarMessage: message
        });
    }

    render() {
        let dialogData = {};
        try {
            const data = this.props.data.dialogData;
            const versionedData = data['A'] || data['B'];

            dialogData = versionedData.default[0];
        } catch (err) {
            return null;
        }

        let styles = Object.assign({}, this.props.styles);
        styles.color = styles.color || "#00A098";
        let scaledStandardWidth = window.innerWidth;
        let scaledStandardHeight = window.innerHeight * 0.47;

        let dialogWidth = (dialogData.dom.parentsize.width * scaledStandardWidth) / 100;
        let dialogHeight = (dialogData.dom.parentsize.height * scaledStandardHeight) / 100;
        // let dialogLeftPadding = (window.innerWidth - dialogWidth)/2;
        // let dialogLeftPaddingPx = dialogLeftPadding + "px";
        // let dialogLeft = (dialogWidth - 27 + dialogLeftPadding) + "px";
        // if (dialogWidth > scaledStandardWidth) {
        //     dialogLeft = (window.innerWidth - 27) + "px";
        // }
        // let xButtonStyle = Object.assign({ ...this.styles.xIcon, left: dialogLeft});
        dialogData.openSnackBar = (message) => this.openSnackBar(message);
        let domRenderElement = (<DomRenderComp storydom={dialogData} onclickEngageCards={this.props.onclickEngageCards} />);
        const storyDomObject = dialogData.dom;
        const hasScratchCard = GeneralUtilities.isNotEmpty(storyDomObject, false)
            && GeneralUtilities.isNotEmpty(storyDomObject.scratchCover, false)
            && storyDomObject.scratchcard;

        if (hasScratchCard) {
            const scratchCardWrapperData = {
                width: dialogWidth,
                height: dialogHeight,
                image: storyDomObject.scratchCover,
                finishPercent: 40,
                customBrush: CUSTOM_BRUSH_PRESET,
                cardScratchAttempted: () => {},
                cardScratchCompleted: () => {}
            };

            domRenderElement = (<ScratchCardWrapper {...scratchCardWrapperData} card={dialogData}>{domRenderElement}</ScratchCardWrapper>);
        }

        return (
            <Fragment>
                {this.showXIcon && <CancelIcon onClick={() => this.handleClose()} style={this.styles.xIcon}/>}
                <div className="row" style={{ height: dialogHeight, width: dialogWidth }}  ref = {this.ref}>
                  {domRenderElement}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackbarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION}
                        onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackbarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </Fragment>
        );

    }
}

CustomAlertDialogs.propTypes = {
    data: PropTypes.object,
    style: PropTypes.object,
    styles: PropTypes.object,
    onclickEngageCards: PropTypes.func,
};

export default CustomAlertDialogs;
