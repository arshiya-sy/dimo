import React, { useEffect, useState } from 'react';
import FlexView from 'react-flexview';
import '../../styles/main.css';
import '../../styles/new_pix_style.css';
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import { MuiThemeProvider } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

import localeService from "../../Services/localeListService";
import PrimaryButtonComponent from "./PrimaryButtonComponent";
import NoInternet from "../../images/SpotIllustrations/Alert.png";
import ButtonAppBar from './ButtonAppBarComponent';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from '../../Services/Constants';
const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

export default function NoInternetComponent(props) {
    const [snackBarOpen, setSnackbar] = useState();
    const [message, setMessage] = useState();
    const [disable, setDisable] = useState();
    const finalHeight = window.screen.height;
    const finalWidth = window.screen.width;

    useEffect(() => {
        window.onBackPressed = () => {  window.Android.closeWindow(); }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }, []);

    const onCheckNetwork = () => {
        if (!navigator.onLine) {
            setDisable(true);
            setSnackbar(true);
            setMessage(localeObj.no_internet_check);
            return;
        }
        props.onCheck();
        return;
    }

    const closeSnackBar = () => {
        setSnackbar(false);
        setDisable(false);
    }

    return (
        <div>
            <FlexView column>
                <ButtonAppBar header="" inverse="true" />
                <div className="scroll" style={{ height: `${finalHeight * 0.7}px`, overflowY: "auto", overflowX: "hidden" }}>
                    <FlexView hAlignContent="center" vAlignContent="center" column>
                        <span>
                            <img style={{ width: `${finalWidth * 0.7}px`, marginTop: "3.5rem" }} src={NoInternet} alt="" />
                        </span>
                    </FlexView>
                    <div className="headline5 highEmphasis" style={{ margin: "0 2rem", textAlign: "center" }} >
                        {localeObj.no_internet}
                    </div>
                    <div className="body2 highEmphasis" style={{ margin: "1rem 2rem", textAlign: "center", wordWrap: "break-word" }}>
                        {localeObj.no_internet_subheader}
                    </div>

                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                        <PrimaryButtonComponent btn_text={localeObj.no_internet_retry} onCheck={() => onCheckNetwork()} disabled={disable} />
                    </div>
                </div>
            </FlexView>
            <MuiThemeProvider theme={theme2}>
                <Snackbar open={snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={() => closeSnackBar()}>
                    <MuiAlert elevation={6} variant="filled" icon={false}>{message}</MuiAlert>
                </Snackbar>
            </MuiThemeProvider>
        </div>
    )
}

NoInternetComponent.propTypes = {
    onCheck: PropTypes.func.isRequired,
};