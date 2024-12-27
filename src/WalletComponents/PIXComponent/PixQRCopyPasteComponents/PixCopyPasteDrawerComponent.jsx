import React from 'react';
import PropTypes from "prop-types";
import InputThemes from "../../../Themes/inputThemes";
import "../../../styles/main.css";
import "../../../styles/new_pix_style.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import FlexView from "react-flexview";

import Log from "../../../Services/Log";
import PageName from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";

import TextField from "@material-ui/core/TextField";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, createMuiTheme, withStyles } from "@material-ui/core/styles";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../../CommonUxComponents/SecondaryButtonComponent";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import ColorPicker from '../../../Services/ColorPicker';
import constantObjects from '../../../Services/Constants';
import utilities from "../../../Services/NewUtilities";

const theme1 = createMuiTheme({
    overrides: {
        MuiInput: {
            root: {
                fontSize: "1rem",
                color: ColorPicker.darkHighEmphasis,
            },
            underline: {
                '&:before': {
                    borderBottom: '1px solid ' + ColorPicker.darkMediumEmphasis,
                },
                '&:after': {
                    borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                    borderBottom: "3.5px solid",
                    borderImageSlice: 1,
                },
                "&.Mui-error": {
                    '&:after': {
                        borderBottomColor: ColorPicker.errorRed,
                    }
                },
            },
        },
        MuiFormControlLabel: {
            label: {
                fontSize: "1rem",
                color: ColorPicker.darkMediumEmphasis
            }
        },
        MuiFormLabel: {
            root: {
                "&.Mui-error": {
                    fontSize: '0.875rem',
                    color: ColorPicker.darkHighEmphasis
                },
                "&$focused": {
                    fontSize: '0.875rem',
                    color: ColorPicker.darkHighEmphasis
                },
                "&.Mui-disabled": {
                    fontSize: '0.875rem',
                    color: ColorPicker.darkMediumEmphasis
                },
            }
        },
        MuiFormControl: {
            root: {
                margin: "0 1rem",
            },
            underline: {
                '&:before': {
                    borderBottom: '1px solid ' + ColorPicker.darkMediumEmphasis,
                },
                '&:after': {
                    borderImageSource: "linear-gradient(to right, RGBA(255, 85, 77, 0.99), RGB(255, 186, 143))",
                    borderBottom: "3.5px solid",
                    borderImageSlice: 1,
                },
                "&.Mui-error": {
                    '&:after': {
                        borderBottomColor: ColorPicker.errorRed,
                    }
                }
            }
        }
    }
});
const styles = InputThemes.singleInputStyle;
var localeObj = {};

class PixCopyPasteDrawerComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            code: "",
            invalidCode: false
        };
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageName.pixCopyPasteBottomSheet);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageName.pixCopyPasteBottomSheet, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageName.pixCopyPasteBottomSheet);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    handleLogging = (logs) => {
        Log.sDebug(logs, PageName.pixCopyPasteBottomSheet);

    }

    handleOpenClose = val => () => {
        if (val) {
            this.handleLogging("opened")
        } else {
            this.setState({ 
                code: "",
                invalidCode: false
            });
            MetricServices.onPageTransitionStop(PageName.pixCopyPasteBottomSheet, PageState.cancel);
            this.handleLogging("closed/cancelled")
        }
        MetricServices.onPageTransitionStop(PageName.pixCopyPasteBottomSheet, PageState.close);
        this.props.handleOpenClose(val);
    }

    handleOnChange = (event) => {
        this.handleLogging("value entered")
        this.setState({ code: event.target.value });
    }

    handleNext = () => {
        if (this.state.code.replace(/ /g, "") === "") {
            this.openSnackBar(localeObj.enter_field + " " + localeObj.pix_link.toLowerCase());
        } else {
            this.handleLogging("clicked next");
            if(utilities.validateParameters("qr", this.state.code)){
                this.props.next(this.state.code);
            } else {
                this.setState({
                    invalidCode: true
                });
                this.handleLogging("Entered an invalid code")
                return;
            }
        }
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                <React.Fragment key={'bottom'}>
                    <SwipeableDrawer
                        anchor='bottom'
                        open={this.props.open}
                        onOpen={this.handleOpenClose(true)}
                        onClose={this.handleOpenClose(false)}
                        onBackdropClick={this.handleOpenClose(false)}
                        PaperProps={{ className: classes.paper }}
                    >
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
                                    {localeObj.pix_link}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
                                    {localeObj.pix_copy_paste}
                                </div>
                            </FlexView>
                        </div>
                        <MuiThemeProvider theme={theme1}>
                            <TextField style={{ width: "70%", alignSelf: "center", marginBottom: "1.5rem" }}
                                multiline
                                onChange={this.handleOnChange} autoComplete='off'
                                InputProps={{ className: classes.smallInput }}
                                value={this.state.code}
                                InputLabelProps={{ shrink: true }}
                                placeholder={localeObj.pix_paste}
                                FormHelperTextProps={{ className: classes.helpertextstyle }}
                                helperText={ this.state.invalidCode ? localeObj.invalid_pix_code : "" }
                                error={this.state.invalidCode}
                            />
                        </MuiThemeProvider>
                        <div style={{ width: "100%", marginBottom: "1.5rem",textAlign: "center" }}>
                            <PrimaryButtonComponent btn_text={localeObj.next} onCheck={this.handleNext} />
                            <SecondaryButtonComponent btn_text={localeObj.cancel} onCheck={this.handleOpenClose(false)} />
                        </div>
                    </SwipeableDrawer>
                </React.Fragment>
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

PixCopyPasteDrawerComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    handleOpenClose: PropTypes.func,
    next: PropTypes.func,
    open: PropTypes.bool
};

export default withStyles(styles)(PixCopyPasteDrawerComponent);