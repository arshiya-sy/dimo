import React from "react";
import FlexView from "react-flexview";
import PropTypes from "prop-types";

import localeService from "../../../Services/localeListService";
import androidApiCalls from "../../../Services/androidApiCallsService";
import layout from "../../../images/SpotIllustrations/Physical card.png"
import elo from "../../../images/SpotIllustrations/Account card.png";

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from "../../../Services/ColorPicker";
import MetricServices from "../../../Services/MetricsService";
import constantObjects from "../../../Services/Constants";

import { createMuiTheme, MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import NextIcon from '@material-ui/icons/ArrowForwardIos';
import { Divider } from "@mui/material";
import BottomSheetAccount from "../../CommonUxComponents/BottomSheetAccount";

const theme1 = createMuiTheme({
    overrides: {
        MuiPaper: {
            rounded: {
                borderRadius: "0.75rem",
                marginBottom: "1rem",
                padding: "0.75rem"
            },
        }
    }
});

const styles = InputThemes.singleInputStyle;
var localeObj = {};

class CardExistComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            details: props.details,
            open: false,
            enableCreditCard: constantObjects.featureEnabler.CREDIT_CARD_ENABLED
        };

        if (this.props.componentName) {
            this.componentName = this.props.componentName;
        } else {
            this.componentName = PageNames.physicalCardComponents.card;
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        this.setState({
            appBar: localeObj.account_card
        })
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

    action = (option) => {
        if (option === localeObj.more_options) {
            this.props.multipleSelection(true);
            this.setState({ open: true })
        } else {
            MetricServices.onPageTransitionStop(this.componentName, PageState.close);
            this.props.multipleSelection(false);
            this.props.action(option);
        }
    }

    handleClose = () => {
        this.props.multipleSelection(false);
        this.setState({ open: false })
    }

    render() {
        const { classes } = this.props;
        const screenScrollHeight = window.screen.height * 0.85;
        let menuOptions = [];
        let allOptions = [];
        if (this.props.menuOptions) {
            if (this.props.menuOptions.length > 3) {
                let options = [];
                let moreOptions = [];
                this.props.menuOptions.map((opt, key) => {
                    if (key === 1 || key === 2) {
                        options.push(opt);
                    } else {
                        moreOptions.push(opt);
                    }
                });
                options.push(localeObj.more_options);
                menuOptions = options;
                moreOptions.map((opt, key) => {
                    let data = { "name": opt, "value": key };
                    allOptions.push(data);
                });
            } else {
                menuOptions = this.props.menuOptions;
            }
        }
        if (!this.props.selection) {
            if (this.state.open) {
                this.setState({
                    open: false
                })
            }
        }
        return (
            <div style={{ height: `${screenScrollHeight}px`, overflowY: "auto", overflowX: "hidden" }}>
                <div style={{ position: 'relative', margin: "1.5rem", marginBottom: "0", textAlign: "center" }}>
                    {this.state.details.brand === "VISA" && <img style={{ width: "12rem" }} src={layout} alt=""></img>}
                    {this.state.details.brand !== "VISA" && <img style={{ width: "100%" }} src={elo} alt=""></img>}
                </div>
                {this.state.details.brand === "VISA" &&
                    <FlexView column>
                        <div className="body2 highEmphasis" style={{ margin: "1.5rem", textAlign: "center" }}>
                            {this.state.enableCreditCard === true ? localeObj.show_physical_card_with_credit_enabled : localeObj.show_physical_card}
                        </div>
                    </FlexView>
                }
                <FlexView column style={{ marginTop: "2rem", backgroundColor: "#001E2E" }}>
                    <Divider style={{ borderColor: "#808080", margin: "0 1.5rem" }} />
                    <div style={{ margin: "1rem 1.5rem" }}>
                        <div style={{ justifyContent: "space-between" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.name}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{this.state.details.name}</span>
                        </div>
                        <div style={{ justifyContent: "space-between", marginTop: "2rem" }}>
                            <span className="pixTableLeftContent tableLeftStyle mediumEmphasis" >{localeObj.card_number}</span>
                            <span className="pixTableRightContent tableRightStyle highEmphasis" >{this.state.details.number}</span>
                        </div>
                    </div>
                    <Divider style={{ borderColor: "#808080", margin: "0 1.5rem" }} />
                </FlexView>
                {this.state.details.brand !== "VISA" &&
                    <FlexView column>
                        <div className="body2 highEmphasis" style={{ margin: "1.5rem", textAlign: "center" }}>
                            {localeObj.show_elo_card}
                        </div>
                    </FlexView>
                }
                <div style={{ margin: "1.5rem 1.5rem 3rem 1.5rem" }}>
                    {menuOptions.map((opt, key) => (
                        <MuiThemeProvider key={opt} theme={theme1}>
                            <Paper className={classes.root} id={key} elevation="0"
                                onClick={() => { this.action(opt) }} style={{ backgroundColor: ColorPicker.newProgressBar }}>
                                <FlexView style={{width: '100%'}}>
                                    <FlexView hAlignContent="center" className="body2 highEmphasis" style={{ marginLeft: 'auto', marginRight: "auto", float: "right" }}>
                                        {opt}
                                    </FlexView>
                                    <FlexView hAlignContent="right">
                                        <NextIcon style={{ fill: ColorPicker.accent, width: "0.8rem", position: "relative", marginRight: "1rem", float: "right" }} />
                                    </FlexView>
                                </FlexView>
                            </Paper>
                        </MuiThemeProvider>
                    ))}
                </div>
                <div style={{ display: (this.state.open ? 'block' : 'none') }}>
                    {this.state.open && <BottomSheetAccount accountType={allOptions} heading={localeObj.more_options}
                        keySelected={this.action} handleClose={this.handleClose} type="card" />}
                </div>
            </div>
        );
    }
}

CardExistComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    details: PropTypes.shape({
      brand: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      number: PropTypes.string.isRequired
    }).isRequired,
    componentName: PropTypes.string,
    menuOptions: PropTypes.arrayOf(PropTypes.string),
    multipleSelection: PropTypes.func,
    selection: PropTypes.bool,
    action: PropTypes.func
  };

export default withStyles(styles)(CardExistComponent);