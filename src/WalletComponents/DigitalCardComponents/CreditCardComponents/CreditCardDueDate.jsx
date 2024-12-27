import React from 'react';
import FlexView from "react-flexview";
import PropTypes from 'prop-types';
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import { MuiThemeProvider } from '@material-ui/core/styles';
import { Card } from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import MuiAlert from '@material-ui/lab/Alert';
import Snackbar from '@material-ui/core/Snackbar';
import InputThemes from "../../../Themes/inputThemes";

import localeService from "../../../Services/localeListService";
import MetricServices from "../../../Services/MetricsService";
import PageState from '../../../Services/PageState';
import ColorPicker from '../../../Services/ColorPicker';
import PrimaryButtonComponent from '../../CommonUxComponents/PrimaryButtonComponent';
import constantObjects from '../../../Services/Constants';
import PageNames from '../../../Services/PageNames';

var localeObj = {};
const PageNameJSON = PageNames.CreditCardComponents;
export default class CreditCardDueDate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            field: "",
            menuOptions: ["05", "10", "15", "20", "25"],
            checkedValues: [],
            fieldText: "",
            snackBarOpen: false,
            dateSelected: false
        }

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNameJSON['credit_due_date']
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        // if (this.props && this.props.value && this.props.value !== "") {
        //     this.setInitialId(this.state.menuOptions.findIndex(obj => obj === this.props.value));
        // }
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

    async setInitialId(boxId) {
        let ele = await this.getElementByIdAsync(boxId);
        ele.style.borderWidth = "2px";
        ele.style.border = "2px solid transparent";
        ele.style.background = "linear-gradient(to right, #04294A,#04294A) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box";
        this.setState({
            currentId: boxId,
            checkedValues: [boxId],
            field: this.getField(boxId),
            fieldText: this.getTextField(boxId),
        })
    }

    getField = (index) => {
        return this.state.menuOptions[index];
    }

    getTextField = (index) => {
        switch (index) {
            case 0:
                return localeObj.due_date_text_05;
            case 1:
                return localeObj.due_date_text_10;
            case 2:
                return localeObj.due_date_text_15;
            case 3:
                return localeObj.due_date_text_20;
            case 4:
                return localeObj.due_date_text_25;
            default:
                break;
        }
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

    getElementByIdAsync = id => new Promise(resolve => {
        const getElement = () => {
            const element = document.getElementById(id);
            if (element) {
                resolve(element);
            } else {
                requestAnimationFrame(getElement);
            }
        };
        getElement();
    });

    setChecked = (boxId) => {
        let ele = document.getElementById(this.state.currentId);
        if (ele) {
            ele.style.borderWidth = "2px";
            ele.style.border = "2px solid transparent";
            ele.style.background = ColorPicker.newProgressBar;
        }
        document.getElementById(boxId).style.borderWidth = "2px";
        document.getElementById(boxId).style.border = "2px solid transparent";
        document.getElementById(boxId).style.background = "linear-gradient(to right,RGB(31, 63, 94),RGB(31, 63, 94)) padding-box, linear-gradient(to right, #ff554d, #FFBA8F) border-box";

        this.setState({
            currentId: boxId,
            checkedValues: [boxId],
            field: this.getField(boxId),
            fieldText: this.getTextField(boxId),
            dateSelected: true
        })
    }

    sendField = () => {
        if (this.state.field === "" || !this.state.dateSelected) {
            this.openSnackBar(localeObj.optionError);
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.recieveField(this.state.field);
        }
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

    render() {
        const screenHeight = window.screen.height;
        return (
            <div className="scroll" style={{ height: `${screenHeight * 0.71}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={InputThemes.initialMarginStyle}>
                    <FlexView column>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.invoice_header}
                        </div>
                        <div className="body2 highEmphasis" style={{ textAlign: "left", marginTop: "0.6rem" }}>
                            {localeObj.invoice_desc}
                        </div>
                    </FlexView>
                </div>
                <div style={{ margin: '2rem' }}>
                    <Grid container>
                        {this.state.menuOptions.map((opt, key) => (
                            <Grid key={key} align="center" item xs={4}>
                                <Card align="center" style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "4rem",
                                    width: "4rem",
                                    border: "2px solid transparent",
                                    backgroundColor: ColorPicker.newProgressBar,
                                    borderRadius: "1.25rem",
                                    marginBottom: "2rem"
                                }} id={key} elevation="0" onClick={() => { this.setChecked(key) }}>
                                    <span className="body1 highEmphasis">{opt}</span>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </div>
                <div style={{...InputThemes.bottomButtonStyle, textAlign: "center"}}>
                    <div className="body2 mediumEmphasis" style={{ textAlign: "center", margin: "1rem" }}>
                        {this.state.fieldText}
                    </div>
                    {/*<div className="body2 mediumEmphasis" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                        {localeObj.invoice_desc_2}
                    </div>*/}
                    <PrimaryButtonComponent btn_text={localeObj.motopay_continue} onCheck={this.sendField} />
                </div>
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}

CreditCardDueDate.propTypes = {
    recieveField: PropTypes.func,
    componentName: PropTypes.string.isRequired,
}
