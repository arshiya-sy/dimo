import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import FlexView from "react-flexview";
import MuiAlert from '@material-ui/lab/Alert';
import { MuiThemeProvider, withStyles, TextField } from "@material-ui/core";
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ColorPicker from '../../../Services/ColorPicker';
import InputThemes from '../../../Themes/inputThemes';

import PageState from '../../../Services/PageState';
import MetricServices from "../../../Services/MetricsService";
import localeService from '../../../Services/localeListService';

import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import constantObjects from '../../../Services/Constants';
import GeneralUtilities from '../../../Services/GeneralUtilities';
import PropTypes from "prop-types";

const theme2 = InputThemes.snackBarTheme;
const screenHeight = window.innerHeight;
const CustomCheckbox = withStyles({
    root: {
        color: ColorPicker.accent,
        '&$checked': {
            color: ColorPicker.accent,
        },
    },
    checked: {
    },
})((props) => <Checkbox color="default" {...props} />);

const styles = () => ({
    notchedOutline: {
        borderWidth: "1px",
        borderColor: ColorPicker.darkMediumEmphasis
    },
    input: {
        color: ColorPicker.darkHighEmphasis
    },
    finalInput: {
        fontSize: "1rem",
        color: ColorPicker.darkHighEmphasis,
    },
    underline: {
        borderBottom: '1px solid ' + ColorPicker.darkHighEmphasis,
    },
});

var localeObj = {};

class CancelReason extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false,
            fieldOpen: false,
            menuOptions: [],
            reason: "",
            explaination: "",
            isDisabled: true
        }
        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = "CANCEL ACCOUNT REASONS";
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
          }
        MetricServices.onPageTransitionStart(this.componentName)
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfInputIsActive);
        if (this.props.prevReasons && this.props.prevReasons.length > 0) {
                let index = this.props.prevReasons.findIndex(obj => obj.reason === localeObj.category_others);
                if (index > -1 && this.props.prevReasons[index].isSet) {
                    let explainationArray = this.props.reason.split(". ");
                    if(explainationArray.length > 0) {
                        let explanationString = explainationArray[explainationArray.length - 1];
                        this.setState({
                            explaination: explanationString,
                            isDisabled: !this.props.prevReasons[index].isSet
                        })
                    } else {
                        this.setState({
                            menuOptions: this.props.prevReasons
                        })
                    }
                }
                this.setState({
                    menuOptions: this.props.prevReasons
                })
            } else {
                var categoryList = [
                    {
                        reason: localeObj.reason_1,
                        isSet: false,
                        reasonCode: "reason_1"
                    },
                    {
                        reason: localeObj.reason_2,
                        isSet: false,
                        reasonCode: "reason_2"
                    },
                    {
                        reason: localeObj.reason_3,
                        isSet: false,
                        reasonCode: "reason_3"
                    },
                    {
                        reason: localeObj.reason_4,
                        isSet: false,
                        reasonCode: "reason_4"
                    },
                    {
                        reason: localeObj.reason_5,
                        isSet: false,
                        reasonCode: "reason_5"
                    },
                    {
                        reason: localeObj.reason_6,
                        isSet: false,
                        reasonCode: "reason_6"
                    },
                    {
                        reason: localeObj.reason_7,
                        isSet: false,
                        reasonCode: "reason_7"
                    },
                    {
                        reason: localeObj.category_others,
                        isSet: false,
                        reasonCode: "reason_8"
                    }
                ]
                this.setState({
                    menuOptions: categoryList
                })
            }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(this.componentName);
        }
    }

    checkIfInputIsActive = () => {
        if (window.innerHeight !== screenHeight) {
            this.setState({
                fieldOpen: true
            })
        } else {
            this.setState({
                fieldOpen: false
            })
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
        let selectedReasons = this.state.menuOptions.filter(
            function (item) { return (item.isSet ? item.reason : "") }
        );

        let reason_code = this.state.menuOptions.filter(
            function (item) { return (item.isSet ? item.reasonCode : "") }
        );

        

        if(selectedReasons.length === 0) {
            this.openSnackBar(localeObj.cancel_reason_warning2);
            return;
        }
        selectedReasons = selectedReasons.map(values => values.reason);
        reason_code = reason_code.map(values => values.reasonCode);
        let reasonCodeString = reason_code.join(" ");
        if (selectedReasons.includes(localeObj.category_others) && GeneralUtilities.emptyValueCheck(this.state.explaination)) {
            this.openSnackBar(localeObj.cancel_reason_warning1);
            return;
        } else if (selectedReasons.includes(localeObj.category_others)) {
            this.props.cancelAccount(selectedReasons.join(". ") + ". " + this.state.explaination, this.state.menuOptions, reasonCodeString);
        } else {
            this.props.cancelAccount(selectedReasons.join(". "), this.state.menuOptions, reasonCodeString);
        }
    }

    selectReason = (reason, idx) => {
        let categoriesAdd = this.state.menuOptions;
        categoriesAdd[idx].isSet = !categoriesAdd[idx].isSet;
        if (reason === localeObj.category_others) {
            let index = categoriesAdd.findIndex(obj => obj.reason === localeObj.category_others);
            if (index > -1) {
                let newExplanation = !this.state.isDisabled ? "" : this.state.explaination;
                this.setState({
                    isDisabled: !this.state.isDisabled,
                    explaination: newExplanation
                })
            }
        }
        this.setState({
            menuOptions: categoriesAdd
        })
    }

    handleChange = event => {
        let len = event.target.value.length;
        if (len <= 300) {
            this.setState({
                explaination: event.target.value
            });
        } else {
            this.openSnackBar(localeObj.comment_description);
        }
    };

    render() {
        const finalHeight = window.screen.height;
        const { classes } = this.props;
        return (
            <div className="scroll" style={{ height: `${0.7*finalHeight}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={{ display: !this.state.processing ? 'block' : 'none' }}>
                    <div style={InputThemes.initialMarginStyle}>
                        <FlexView column>
                            <div className="headline5 highEmphasis">
                                <span>{localeObj.cancel_reason_header}</span>
                            </div>
                        </FlexView>
                    </div>
                    <MuiThemeProvider theme={InputThemes.SearchInputTheme}>
                        <FlexView column style={{ margin: "1.5rem", display: this.state.fieldOpen ? "none" : "block" }} >
                            {
                                this.state.menuOptions.map((opt, index) => (
                                    <FormControlLabel key={index} style={{ width: "100%" }}
                                        control={<CustomCheckbox id="myAccount" checked={opt.isSet} onChange={() => this.selectReason(opt.reason, index)} />}
                                        label={<span className="body2 highEmphasis">{opt.reason}</span>}
                                    />
                                ))
                            }
                        </FlexView>
                    </MuiThemeProvider>
                    <MuiThemeProvider theme={InputThemes.feedbackTheme}>
                        <TextField variant="outlined"
                            value={this.state.explaination} disabled={this.state.isDisabled}
                            placeholder={localeObj.cancel_text_placeholder}
                            onChange={this.handleChange} multiline rows={3}
                            InputProps={{
                                classes: {
                                    notchedOutline: classes.notchedOutline
                                },
                                className: classes.input
                            }} />
                    </MuiThemeProvider>
                    <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                        <PrimaryButtonComponent className="body1 highEmphasis" btn_text={localeObj.cancel_my_account} onCheck={this.accountCancelled} />
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
            </div >

        )
    }
}
CancelReason.propTypes = {
    classes: PropTypes.object,
    componentName: PropTypes.string,
    prevReasons: PropTypes.array,
    cancelAccount: PropTypes.func,
    reason: PropTypes.string
};

export default withStyles(styles)(CancelReason);