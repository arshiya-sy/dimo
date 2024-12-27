import React from 'react';
import PropTypes from "prop-types";
import "../../styles/main.css";
import "../../styles/new_pix_style.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";

import { MuiThemeProvider, createMuiTheme, withStyles } from "@material-ui/core/styles";
import MobileStepper from '@material-ui/core/MobileStepper';
import FlexView from "react-flexview";

import PageState from '../../Services/PageState';
import PageNames from '../../Services/PageNames';
import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";
import SecondaryButtonComponent from "../CommonUxComponents/SecondaryButtonComponent";
import CustomizedProgressBars from "../CommonUxComponents/ProgressComponent";
import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import MetricServices from "../../Services/MetricsService";
import dimo_logo from "../../images/DarkThemeImages/Dimo-Logo_4x.png";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dimoValueProp01 from "../../images/DarkThemeImages/03_image.webp";
import dimoValueProp02 from "../../images/DarkThemeImages/04_image.webp";
import dimoValueProp03 from "../../images/DarkThemeImages/01_image.webp";
import dimoValuePropBackground01 from "../../images/DarkThemeImages/Dimo_ValueProps_background_01.png";
import dimoValuePropBackground02 from "../../images/DarkThemeImages/Dimo_ValueProps_background_02.png";
import dimoValuePropBackground03 from "../../images/DarkThemeImages/Dimo_ValueProps_background_03.png";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import CloseIcon from '@mui/icons-material/Close';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import { Image } from 'react-bootstrap';
import new_dimo_rebranding_image from "../../images/DarkThemeImages/log-in-page-image-1.png";
import GeneralUtilities from "../../Services/GeneralUtilities";

const styles = InputThemes.singleInputStyle;
const PageName = PageNames.motoPayValueProps;
var localeObj = {};

const theme1 = createMuiTheme({
    overrides: {
        MuiGrid: {
            item: {
                boxSizing: "none"
            },
        },
        MuiPaper: {
            elevation1: {
                boxShadow: "none"
            }
        },
        MuiMobileStepper: {
            dotActive: {
                backgroundColor: ColorPicker.white,
            },
            dot: {
                backgroundColor: ColorPicker.surface3
            },
            dots: {
                display: 'flex',
                flexDirection: 'row',
                marginLeft: 'auto',
                marginRight: 'auto'
            },
            root: {
                align: 'center',
                display: 'block',
                justifyContent: 'center',
                marginLeft: 'auto',
                marginRight: 'auto',
                backgroundColor: ColorPicker.surface0
            }
        }
    }
});

const screenHeight = window.screen.height;
const screenWidth = window.screen.width;

const swipeStyles = {
    imageStyle: {
        backgroundSize: "100% 50%"
    },
    imageTextStyle: {
        position: 'absolute',
        top: 0,
        left: 0
    },
    containerStyle: {
        position: 'relative'
    }
};

class NewMotoPayValuePropsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentSlide: 0,
            processing: true,
            ValuePropsVisibility: false,
            bottom: true,
            tempDisabled: true,
            isNonMoto: androidApiCalls.checkIfNm()
        }
        this.styles = {
            bodyDiv: {
                width: "100%"
            },
            span1: {
                textAlign: 'center',
                margin: "1.5rem",
                marginBottom: "1rem"
            },
            span2: {
                margin: '0% 10%',
                textAlign: 'center',
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(PageName);
    }

    componentDidMount() {
        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        this.timeoutHandleOne = setTimeout(() => {
            clearTimeout(this.timeoutHandleOne);
            this.setState({
                processing: false,
                ValuePropsVisibility: true
            });
        }, 2000);
        window.onBackPressed = () => {
            MetricServices.onPageTransitionStop(PageName, PageState.back);
            if (androidApiCalls.checkIfMpOnly()) {
                window.Android.closeWindow();
            } else {
                androidApiCalls.openHY();
            }
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

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricServices.onPageTransitionStop(PageName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricServices.onPageTransitionStart(PageName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    help = () => {
        MetricServices.onPageTransitionStop(PageName, PageState.close);
        GeneralUtilities.openHelpSection();
    }

    next = () => {
        this.setState((state) => ({
            currentSlide: state.currentSlide + 1,
        }));
    };

    prev = () => {
        this.setState((state) => ({
            currentSlide: state.currentSlide - 1,
        }));
    };

    updateCurrentSlide = (index) => {
        if (index == 3) {
            MetricServices.onPageTransitionStop(PageName, PageState.close);
            this.props.enableDisableValueProp(false)
        }
        const { currentSlide } = this.state;

        if (currentSlide !== index) {
            this.setState({
                currentSlide: index,
            });
        }
    };

    render() {
        let Styles = this.styles;
        let dimoImageWidth = screenWidth * 3.37;
        let dimoImageHeight = screenHeight * 0.68;
        let dimoImageTopMargin = screenHeight * 0.6;
        let dimoNavigationMargin = screenHeight > 780 ? screenHeight * 0.86 : screenHeight * 0.82;
        let dimoValuePropImageHeight = screenHeight * 0.6;
        let dimoBackgroundLeftMargin2 = screenWidth * 0.33;
        let dimoBackgroundLeftMargin3 = screenWidth * 0.369;
        let dimoSubTextHeight = screenHeight * 0.22;
        // Below strings are hard coded to portuguese as in some phones we can see undefined before CSS loading in value props.
        const valuePropsKeys = [
            {
                index: "0",
                valuePropText01: localeObj.value_props_01_title_01 == undefined ? "Cartão de crédito grátis, " : localeObj.value_props_01_title_01,
                valuePropText02: localeObj.value_props_01_title_02 == undefined ? "sem análise de crédito!" : localeObj.value_props_01_title_02,
                valuePropSubTitle: localeObj.value_props_01_subtitle == undefined ? "E você ainda ganha 1% de cashback em todas as compras.*" : localeObj.value_props_01_subtitle,
                valuePropCaption: localeObj.value_props_01_caption == undefined ? "*limitado a R$25/mês" : localeObj.value_props_01_caption
            },
            {
                index: "1",
                valuePropText01: localeObj.value_props_02_title_01 == undefined ? "Seu dinheiro " : localeObj.value_props_02_title_01,
                valuePropText02: localeObj.value_props_02_title_02 == undefined ? "rende mais" : localeObj.value_props_02_title_02,
                valuePropText03: localeObj.value_props_02_title_03 == undefined ? " que a poupança" : localeObj.value_props_02_title_03,
                valuePropSubTitle: localeObj.value_props_02_subtitle == undefined ? "Abra sua conta gratuita e invista no CDB que rende 106% CDI." : localeObj.value_props_02_subtitle
            },
            {
                index: "2",
                valuePropText01: localeObj.value_props_03_title_01 == undefined ? "Quanto mais você " : localeObj.value_props_03_title_01,
                valuePropText02: localeObj.value_props_03_title_02 == undefined ? "usa" : localeObj.value_props_03_title_02,
                valuePropText03: localeObj.value_props_03_title_03 == undefined ? ", mais você " : localeObj.value_props_03_title_03,
                valuePropText04: localeObj.value_props_03_title_04 == undefined ? "ganha" : localeObj.value_props_03_title_04,
                valuePropSubTitle: localeObj.value_props_03_subtitle == undefined ? "Até 20% OFF em smartphones Motorola e a chance de você ganhar um novo a cada semana!" : localeObj.value_props_03_subtitle,
                valuePropCaption: localeObj.value_props_03_caption == undefined ? "*Corra promoção por tempo limitado! Confira condições no app." : localeObj.value_props_03_caption
            }
        ];

        return (
            <div style={{
                width: `${screenWidth}px`,
                height: `${screenHeight}px`,
                overflowX: "hidden"
            }}>
                {this.state.ValuePropsVisibility &&
                    <div
                        style={{
                            width: "100%",
                            backgroundColor: ColorPicker.surface1,
                            color: ColorPicker.highEmphasis,
                            textAlign: "center"
                        }}>
                        <Carousel
                            axis='horizontal'
                            infiniteLoop={false}
                            showArrows={false}
                            showIndicators={false}
                            showStatus={false}
                            selectedItem={this.state.currentSlide}
                            onChange={this.updateCurrentSlide}
                            swipeable={(this.state.currentSlide == 3) ? false : true}>
                            <div>
                                <FlexView vAlignContent="top" >
                                    <div style={{
                                        width: "100%",
                                        height: `${dimoValuePropImageHeight}px`
                                    }}>
                                        <Image
                                            style={swipeStyles.imageStyle}
                                            responsive
                                            src={dimoValueProp01}>
                                        </Image>
                                        <CloseIcon onClick={() => this.props.enableDisableValueProp(false)}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                float: "right",
                                                fill: ColorPicker.white,
                                                width: "1.6rem",
                                                marginBottom: "1rem",
                                                marginRight: "2.5rem",
                                                marginTop: "2.75rem",
                                                zIndex: "2"
                                            }} />
                                    </div>
                                </FlexView>
                                <FlexView column
                                    vAlignContent="bottom"
                                    style={{
                                        height: `${dimoImageHeight}px`,
                                        overflowY: "auto",
                                        width: "100%",
                                        position: "relative"
                                    }}>
                                    <FlexView column
                                        vAlignContent="bottom"
                                        style={{
                                            "width": `${screenWidth}px`,
                                            height: `${dimoImageHeight}px`,
                                            border: "1px solid transparent",
                                            borderRadius: "1rem 1rem 0px 0px",
                                            background: ColorPicker.tableBackground
                                        }}>
                                        <div>
                                            <Image
                                                style={{
                                                    width: `${dimoImageWidth}px`,
                                                    height: `${dimoImageHeight}px`,
                                                    position: 'fixed',
                                                    top: `${dimoImageTopMargin}px`,
                                                    left: 0,
                                                    float: "right",
                                                    objectFit: 'cover'
                                                }}
                                                src={dimoValuePropBackground01}>
                                            </Image>
                                            <div
                                                className="scroll cardScroll"
                                                style={{
                                                    width: `${screenWidth}px`,
                                                    height: `${dimoSubTextHeight}px`,
                                                    position: 'fixed',
                                                    top: `${dimoImageTopMargin}px`,
                                                    overflowY: 'auto',
                                                    overflowX: 'hidden'
                                                }}>
                                                <div className="headline5 highEmphasis"
                                                    style={{
                                                        textAlign: 'center',
                                                        margin: screenHeight > 780 ? "1.5rem 2rem" : "1rem 1rem",
                                                        marginBottom: "1rem"
                                                    }}>
                                                    <span>
                                                        {valuePropsKeys[0].valuePropText01}
                                                    </span>
                                                    <span style={{ color: ColorPicker.valuePropsRed }}>
                                                        {valuePropsKeys[0].valuePropText02}
                                                    </span>
                                                </div>
                                                <div className="subtitle2 highEmphasis"
                                                    style={{
                                                        margin: screenHeight > 780 ? '1rem 2rem' : '0.5rem 1rem',
                                                        textAlign: 'center'
                                                    }}>
                                                    {valuePropsKeys[0].valuePropSubTitle}
                                                </div>
                                                <div className="caption highEmphasis"
                                                    style={{
                                                        margin: screenHeight > 780 ? '1rem 2rem' : '0.5rem 1rem',
                                                        textAlign: 'left'
                                                    }}>
                                                    {valuePropsKeys[0].valuePropCaption}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    flexDirection: "row",
                                                    display: 'flex',
                                                    justifyContent: 'space-around',
                                                    paddingBottom: "1rem",
                                                    width: "100%",
                                                    position: 'fixed',
                                                    bottom: "0.25rem",
                                                    paddingLeft: '3rem',
                                                    top: `${dimoNavigationMargin}px`
                                                }}>
                                                <MuiThemeProvider
                                                    theme={theme1}
                                                    style={{
                                                        bottom: "2.5rem",
                                                        marginLeft: 'auto',
                                                        marginRight: 'auto'
                                                    }}>
                                                    <MobileStepper
                                                        variant="dots"
                                                        steps={3}
                                                        position="static"
                                                        activeStep={0}
                                                    />
                                                </MuiThemeProvider>
                                                <ArrowForwardIosIcon
                                                    onClick={this.next}
                                                    style={{
                                                        fill: ColorPicker.accent,
                                                        width: "1rem",
                                                        marginRight: "2rem",
                                                        bottom: "2.5rem"
                                                    }} />
                                            </div>
                                        </div>
                                    </FlexView>
                                </FlexView>
                            </div>
                            <div>
                                <FlexView vAlignContent="top" >
                                    <div style={{
                                        width: "100%",
                                        height: `${dimoValuePropImageHeight}px`
                                    }}>
                                        <Image
                                            style={swipeStyles.imageStyle}
                                            responsive
                                            src={dimoValueProp02}>
                                        </Image>
                                        <CloseIcon onClick={() => this.props.enableDisableValueProp(false)}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                float: "right",
                                                fill: ColorPicker.white,
                                                width: "1.6rem",
                                                marginBottom: "1rem",
                                                marginRight: "2.5rem",
                                                marginTop: "2.75rem",
                                                zIndex: "2"
                                            }} />
                                    </div>
                                </FlexView>
                                <FlexView column
                                    vAlignContent="bottom"
                                    style={{
                                        height: `${dimoImageHeight}px`,
                                        overflowY: "auto",
                                        width: "100%",
                                        position: "relative"
                                    }}>
                                    <FlexView column
                                        vAlignContent="bottom"
                                        style={{
                                            "width": screenWidth,
                                            height: `${dimoImageHeight}px`,
                                            border: "1px solid transparent",
                                            borderRadius: "1rem 1rem 0px 0px",
                                            background: ColorPicker.tableBackground
                                        }}>
                                        <div>
                                            <Image
                                                style={{
                                                    width: `${dimoImageWidth}px`,
                                                    height: `${dimoImageHeight}px`,
                                                    position: 'fixed',
                                                    top: `${dimoImageTopMargin}px`,
                                                    left: `${dimoBackgroundLeftMargin2}px`,
                                                    float: "right",
                                                    objectFit: 'cover'
                                                }}
                                                src={dimoValuePropBackground02}>
                                            </Image>
                                            <div
                                                className="scroll cardScroll"
                                                style={{
                                                    width: "100%",
                                                    height: `${dimoSubTextHeight}px`,
                                                    position: 'fixed',
                                                    top: `${dimoImageTopMargin}px`,
                                                    overflowY: 'auto',
                                                    overflowX: 'hidden'
                                                }}>
                                                <div className="headline5 highEmphasis" style={{
                                                    textAlign: 'center',
                                                    margin: screenHeight > 780 ? "1.5rem 2rem" : "1rem 1rem"
                                                }}>
                                                    <span>
                                                        {valuePropsKeys[1].valuePropText01}
                                                    </span>
                                                    <span style={{ color: ColorPicker.valuePropsRed }}>
                                                        {valuePropsKeys[1].valuePropText02}
                                                    </span>
                                                    <span>
                                                        {valuePropsKeys[1].valuePropText03}
                                                    </span>
                                                </div>
                                                <div className="subtitle2 highEmphasis scroll"
                                                    style={{
                                                        width: `${screenWidth * 0.9}px`,
                                                        margin: screenHeight > 780 ? '1rem 2rem' : '0.5rem 1rem',
                                                        textAlign: 'center'
                                                    }}>
                                                    {valuePropsKeys[1].valuePropSubTitle}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    flexDirection: "row",
                                                    display: 'flex',
                                                    justifyContent: 'space-around',
                                                    paddingBottom: "1rem",
                                                    width: "100%",
                                                    position: 'fixed',
                                                    bottom: "0.25rem",
                                                    top: `${dimoNavigationMargin}px`
                                                }}>
                                                <ArrowBackIosIcon onClick={this.prev}
                                                    style={{
                                                        fill: ColorPicker.accent,
                                                        width: "1rem",
                                                        marginLeft: "2rem",
                                                        bottom: "4.125rem"
                                                    }} />
                                                <MuiThemeProvider theme={theme1}
                                                    style={{
                                                        alignContent: 'center',
                                                        align: 'center',
                                                        bottom: "4.215rem",
                                                        marginLeft: 'auto',
                                                        marginRight: 'auto'
                                                    }}>
                                                    <MobileStepper
                                                        variant="dots"
                                                        steps={3}
                                                        position="static"
                                                        activeStep={1}
                                                    />
                                                </MuiThemeProvider>
                                                <ArrowForwardIosIcon onClick={this.next}
                                                    style={{
                                                        fill: ColorPicker.accent,
                                                        width: "1rem",
                                                        marginRight: "2rem",
                                                        bottom: "4.125rem"
                                                    }} />
                                            </div>
                                        </div>
                                    </FlexView>
                                </FlexView>
                            </div>
                            <div>
                                <FlexView vAlignContent="top" >
                                    <div style={{
                                        width: "100%",
                                        height: `${dimoValuePropImageHeight}px`
                                    }}>
                                        <Image
                                            style={swipeStyles.imageStyle}
                                            responsive
                                            src={dimoValueProp03}>
                                        </Image>
                                        <CloseIcon onClick={() => this.props.enableDisableValueProp(false)}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0,
                                                float: "right",
                                                fill: ColorPicker.white,
                                                width: "1.6rem",
                                                marginBottom: "1rem",
                                                marginRight: "2.5rem",
                                                marginTop: "2.75rem",
                                                zIndex: "2"
                                            }} />
                                    </div>
                                </FlexView>
                                <FlexView column
                                    vAlignContent="bottom"
                                    style={{
                                        height: `${dimoImageHeight}px`,
                                        overflowY: "auto",
                                        width: "100%",
                                        position: "relative"
                                    }}>
                                    <FlexView column
                                        vAlignContent="bottom"
                                        style={{
                                            width: screenWidth,
                                            height: `${dimoImageHeight}px`,
                                            border: "1px solid transparent",
                                            borderRadius: "1rem 1rem 0px 0px",
                                            background: ColorPicker.tableBackground
                                        }}>
                                        <div>
                                            <Image
                                                style={{
                                                    width: `${dimoImageWidth}px`,
                                                    height: `${dimoImageHeight}px`,
                                                    position: 'fixed',
                                                    top: `${dimoImageTopMargin}px`,
                                                    left: `${dimoBackgroundLeftMargin3}px`,
                                                    float: "right",
                                                    objectFit: 'cover'
                                                }}
                                                src={dimoValuePropBackground03}>
                                            </Image>
                                            <div
                                                className="scroll cardScroll"
                                                style={{
                                                    width: "100%",
                                                    height: `${dimoSubTextHeight}px`,
                                                    position: 'fixed',
                                                    top: `${dimoImageTopMargin}px`,
                                                    overflowY: 'auto',
                                                    overflowX: 'hidden'
                                                }}>
                                                <div className="headline5 highEmphasis"
                                                    style={{
                                                        textAlign: 'center',
                                                        margin: screenHeight > 780 ? "1.5rem 2rem" : "1rem 1rem"
                                                    }}>
                                                    <span>
                                                        {valuePropsKeys[2].valuePropText01}
                                                    </span>
                                                    <span style={{ color: ColorPicker.valuePropsRed }}>
                                                        {valuePropsKeys[2].valuePropText02}
                                                    </span>
                                                    <span>
                                                        {valuePropsKeys[2].valuePropText03}
                                                    </span>
                                                    <span style={{ color: ColorPicker.valuePropsRed }}>
                                                        {valuePropsKeys[2].valuePropText04}
                                                    </span>
                                                </div>
                                                <div className="subtitle2 highEmphasis"
                                                    style={{
                                                        width: `${screenWidth * 0.9}px`,
                                                        margin: screenHeight > 780 ? '1rem 2rem' : '0.5rem 1rem',
                                                        textAlign: 'center'
                                                    }}>
                                                    {valuePropsKeys[2].valuePropSubTitle}
                                                </div>
                                                <div className="caption highEmphasis"
                                                    style={{
                                                        width: `${screenWidth * 0.9}px`,
                                                        margin: screenHeight > 780 ? '1rem 2rem' : '0.5rem 1rem',
                                                        textAlign: 'left'
                                                    }}>
                                                    {valuePropsKeys[2].valuePropCaption}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    flexDirection: "row",
                                                    display: 'flex',
                                                    justifyContent: 'space-around',
                                                    paddingBottom: "1rem",
                                                    width: "100%",
                                                    position: 'fixed',
                                                    bottom: "0.25rem",
                                                    top: `${dimoNavigationMargin}px`
                                                }}>
                                                <ArrowBackIosIcon onClick={this.prev}
                                                    style={{
                                                        fill: ColorPicker.accent,
                                                        width: "1rem",
                                                        marginLeft: "2rem",
                                                        bottom: "4.125rem"
                                                    }} />
                                                <MuiThemeProvider theme={theme1}
                                                    style={{
                                                        width: "100%",
                                                        alignContent: 'center',
                                                        align: 'center',
                                                        bottom: "4.215rem",
                                                        display: 'block',
                                                        marginLeft: 'auto',
                                                        marginRight: 'auto'
                                                    }}>
                                                    <MobileStepper
                                                        variant="dots"
                                                        steps={3}
                                                        position="static"
                                                        activeStep={2}
                                                    />
                                                </MuiThemeProvider>
                                                <ArrowForwardIosIcon onClick={this.next}
                                                    style={{
                                                        fill: ColorPicker.accent,
                                                        width: "1rem",
                                                        marginRight: "2rem",
                                                        bottom: "4.125rem"
                                                    }} />
                                            </div>
                                        </div>
                                    </FlexView>
                                </FlexView>
                            </div>
                            <div style={{ width: screenWidth, overflow: "scroll", position: "relative" }}>
                                <FlexView column hAlignContent="center" style={{ width: screenWidth }}>
                                    <img style={{ marginTop: "1.5rem", height: `${0.095 * screenHeight}px` }} src={dimo_logo} alt=""></img>
                                </FlexView>
                                <FlexView column hAlignContent="center">
                                    <img style={{ marginTop: "2.5rem", height: `${0.4 * screenHeight}px`, width: screenWidth, marginBottom: "1.5rem" }} src={new_dimo_rebranding_image} alt=""></img>
                                </FlexView>
                                <FlexView column hAlignContent="center" style={InputThemes.bottomButtonStyle}>
                                    <div className="headline5 highEmphasis" style={{ ...Styles.span1 }}>
                                        {localeObj.say_hello}
                                    </div>
                                    <div className="subtitle2 highEmphasis" style={{ ...Styles.span2, marginBottom: "1.5rem" }}>
                                        {this.state.isNonMoto ? localeObj.nm_banking_operation : localeObj.new_motopay_welcome_page}
                                    </div>
                                    <PrimaryButtonComponent btn_text={localeObj.sign_up} onCheck={() => this.props.signup()} />
                                    <SecondaryButtonComponent btn_text={localeObj.log_in} onCheck={() => this.props.login(false)} />
                                    <div className="body2 highEmphasis" style={{ ...Styles.span2, marginTop: "1rem" }} onClick={() => this.props.help()}>
                                        {localeObj.help}
                                    </div>
                                </FlexView>
                            </div>
                        </Carousel>
                    </div>}
                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>
            </div>
        );
    }
}

NewMotoPayValuePropsComponent.propTypes = {
    history: PropTypes.object,
    enableDisableValueProp: PropTypes.func,
    signup: PropTypes.func,
    login: PropTypes.func,
    help: PropTypes.func
}

export default withStyles(styles)(NewMotoPayValuePropsComponent);
