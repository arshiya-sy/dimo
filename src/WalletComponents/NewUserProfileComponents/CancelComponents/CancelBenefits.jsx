import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import FlexView from "react-flexview";
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider } from "@material-ui/core/styles";
import ColorPicker from '../../../Services/ColorPicker';
import InputThemes from '../../../Themes/inputThemes';

import PageState from '../../../Services/PageState';
import MetricServices from "../../../Services/MetricsService";
import localeService from '../../../Services/localeListService';

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import CustomizedProgressBars from '../../CommonUxComponents/ProgressComponent';
import constantObjects from '../../../Services/Constants';
import SecondaryButtonComponent from '../../CommonUxComponents/SecondaryButtonComponent';
import PropTypes from "prop-types";

const theme2 = InputThemes.snackBarTheme;
var localeObj = {};

class CancelBenefits extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false
        }

        this.styles = {
            item: {
                margin: "1.5rem"
            },
            description: {
                margin: "0 1.5rem",
                color: ColorPicker.highEmphasis
            },
            circle: {
                borderRadius: "50%",
                backgroundColor: ColorPicker.newProgressBar,
                padding: "0.75rem 1rem",
                marginRight: "1.5rem",
                boxSizing: "border-box",
                flexShrink: "0",
                width: "2.625rem",
                height: "2.625rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            },
        }
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "CANCEL ACCOUNT BENEFITS";
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(this.componentName)
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            message: message
        })
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        })
    }

    accountCancelled = () => {
        this.props.accountCancelled(true);
    }

    accountNotCancelled = () => {
        this.props.accountCancelled(false);
    }

    render() {
        return (
            <div>
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis">
                                <span>{localeObj.cancel_acc_header}</span>
                            </div>
                            <div className="body2 highEmphasis" style={{ marginTop: "1rem" }}>
                                <span>{localeObj.cancel_acc_desc}</span>
                            </div>
                        </FlexView>
                    </div>
                    <div style={this.styles.description}>
                        <div style={{ display: "flex", alignItems: "flex-start" }}>
                            <div style={this.styles.circle} className="body2 accent">{1}</div>
                            <div className="body2 mediumEmphasis">{localeObj.cancel_acc_desc1}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", marginTop: "1rem" }}>
                            <div style={this.styles.circle} className="body2 accent">{2}</div>
                            <div className="body2 mediumEmphasis">{localeObj.cancel_acc_desc2}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", marginTop: "1rem" }}>
                            <div style={this.styles.circle} className="body2 accent">{3}</div>
                            <div className="body2 mediumEmphasis">{localeObj.cancel_acc_desc3}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "flex-start", marginTop: "1rem"}}>
                            <div style={this.styles.circle} className="body2 accent">{4}</div>
                            <div className="body2 mediumEmphasis">{localeObj.cancel_acc_desc4}</div>
                        </div>

                    </div>
                    <div style={InputThemes.bottomButtonStyle}>
                        <PrimaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.do_not_cancel} onCheck={this.accountNotCancelled} />
                        <SecondaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.cancel_account} onCheck={this.accountCancelled} />
                    </div>
                </div>
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
                <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>

        )
    }
}
CancelBenefits.propTypes = {
    componentName: PropTypes.string,
    accountCancelled: PropTypes.func
};
export default CancelBenefits;