import React from "react";
import PropTypes from "prop-types";
import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import ColorPicker from "../../../Services/ColorPicker";

import PageState from "../../../Services/PageState";
import PageNames from "../../../Services/PageNames";
import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import MetricServices from "../../../Services/MetricsService";
import { MuiThemeProvider, withStyles} from "@material-ui/core/styles";

import List from '@material-ui/core/List';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import InputThemes from "../../../Themes/inputThemes";

import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
import constantObjects from "../../../Services/Constants";

const theme2 = InputThemes.snackBarTheme;
const screenHeight = window.screen.height;
const pageName = PageNames.pixOnboarding['pix_onboarding_know_more'];

const styles = {
    root: {
        background: "#6A7580"
    },
    gridStyle: {
        color: "#001428",
        backgroundColor: ColorPicker.surface1,
        padding: "3%",
        fontWeight: 400,
        width: "92%",
        height: "180",
        boxShadow: "none",
        borderRadius: "0.5rem",
        textAlign: 'center',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: "",
        },
    },
    paper: InputThemes.singleInputStyle.paper
};

var localeObj = {};

class PixKnowMorePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            snackBarOpen: false
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(pageName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);

        window.onBackPressed = () => {
            this.props.handleBack();
        }
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(pageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(pageName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    gotIt = () => {
        MetricServices.onPageTransitionStop(pageName, PageState.close);
        this.props.onGotIt();
    }

    onBack = () => {
        MetricServices.onPageTransitionStop(pageName, PageState.back);
        this.props.handleBack();
    }

    render() {

        const KnowMoreItems = [
            {
                "header": localeObj.pix_know_more_header1,
                "detail": localeObj.pix_know_more_detail1
            },
            {
                "header": localeObj.pix_know_more_header2,
                "detail": localeObj.pix_know_more_detail2
            },
            {
                "header": localeObj.pix_know_more_header3,
                "detail": localeObj.pix_know_more_detail3
            },
            {
                "header": localeObj.pix_know_more_header4,
                "detail": localeObj.pix_know_more_detail4
            },
            {
                "header": localeObj.pix_know_more_header5,
                "detail": localeObj.pix_know_more_detail5
            },
        ]

       
        return (
            <div style= {{height: `${screenHeight-180}px`, overflowY: "scroll"}}>
                <ButtonAppBar header={localeObj.pix_benefits} onBack={this.onBack} action="none" />
                    <div>
                        
                        <div style={{ marginLeft: "1.5rem", marginRight: "1.5rem", textAlign: "left"}}>
                            <List>
                                {
                                    KnowMoreItems.map((opt) => (
                                            <div key = {opt.header} style={{ marginTop: "2rem" }} >
                                                <div className="headline5 highEmphasis" >{opt.header} </div>
                                                <div style={{marginTop: "0.5rem"}} className="body2 highEmphasis">{opt.detail} </div>
                                            </div>
                                    ))
                                }
                            </List>
                        </div>
                        <div style={{ width: "100%", position: "fixed", bottom: "1.5rem", marginTop:"4.5rem", textAlign: "center"}}>
                            <PrimaryButtonComponent btn_text={localeObj.pix_got_it} onCheck={this.onBack} />
                        </div>
                            <MuiThemeProvider theme={theme2}>
                                <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                                    <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.message}</MuiAlert>
                                </Snackbar>
                            </MuiThemeProvider>
                    </div>
            </div>
        )
    }
}

PixKnowMorePage.propTypes = {
    classes: PropTypes.object.isRequired,
    handleBack: PropTypes.func,
    onGotIt: PropTypes.func,
};

export default withStyles(styles)(PixKnowMorePage);