import React from 'react';
import FlexView from "react-flexview";
import "../../styles/main.css";
import ColorPicker from "../../Services/ColorPicker";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Card from '@material-ui/core/Card';
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import PageState from '../../Services/PageState';
import PageNames from '../../Services/PageNames';
import PrivacyPortuguese2024 from '../../PrivacyFiles/Privacy_pt_2024';
import PropTypes from "prop-types";


const theme1 = createMuiTheme({
    overrides: {
        MuiTypography: {
            root: {
                color: ColorPicker.darkMediumEmphasis
            }
        },
        MuiPaper: {
            elevation4: {
                boxShadow: "none"
            },
            outlined: {
                border: "none"
            }
        },
        MuiIconButton: {
            root: {
                padding: "1.5rem"
            }
        },
        MuiToolbar: {
            root: {
                justifyContent: "flex-start"
            },
            regular: {
                height: "56px"
            },
            gutters: {
                paddingLeft: "0",
                paddingRight: "0"
            }
        },
        MuiCard: {
            root: {
                overflowY: "scroll",
                overflowX: "hidden"
            }
        },
        MuiListItem: {
            gutters: {
                paddingLeft: 0,
                paddingRight: 0
            }
        }
    }
});

const PageNameJSON = PageNames.GiftCardComponents;

const PageName= PageNameJSON['privacy_policy'];
var localeObj = {};

export default class GiftCardPrivacyComp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            disabled: true,
            firstScroll: false,
            backState: false
        }
        this.style = {
            terms: {
                align: "left",
            },
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener('scroll', this.trackScrolling);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    trackScrolling = () => {
        const wrappedElement = document.getElementById('bottom');
        if (this.isBottom(wrappedElement)) {
            this.setState({
                disabled: false
            })
            document.removeEventListener('scroll', this.trackScrolling);
        }
    };

    isBottom(el) {
        return el.getBoundingClientRect().bottom <= window.innerHeight;
    }

    onBack = () => {
        MetricServices.onPageTransitionStop(PageName, PageState.back);
        this.props.back();
    }

    onNext = () => {
        MetricServices.onPageTransitionStop(PageName, PageState.close);
        this.props.next();
    }

    render() {
        const screenHeight = window.screen.height;
        return (
            <div style={{ overflowX: "hidden" }}>
                <MuiThemeProvider theme={theme1}>

                    <div style={{ margin: "1rem 1.5rem" }}>
                        <div className="headline5 highEmphasis" style={{ textAlign: "left" }}>
                            {localeObj.terms_privacy}
                        </div>
                        <div className="scroll" style={{ height: `${screenHeight * 0.8}px`, overflowY: "auto", marginTop: "2rem" }} onScroll={this.trackScrolling}>
                            <Card variant="outlined" style={{ marginRight: "1rem", background: "none" }}>
                                <List component="nav">
                                    <ListItem>
                                        <FlexView column>
                                            <div className="body2 highEmphasis">
                                                {localeObj.privacy_header}
                                            </div>
                                            <div className="body2 highEmphasis" style={this.style.terms}>
                                                {androidApiCalls.getLocale() === "en_US" ? <PrivacyPortuguese2024 /> : <PrivacyPortuguese2024/>}
                                            </div>
                                        </FlexView>
                                    </ListItem>
                                    <div id="bottom"></div>
                                </List>
                            </Card>
                        </div>
                    </div>
                </MuiThemeProvider>
            </div>
        );
    }
}

GiftCardPrivacyComp.propTypes = {
    back: PropTypes.func,
    next: PropTypes.func
}