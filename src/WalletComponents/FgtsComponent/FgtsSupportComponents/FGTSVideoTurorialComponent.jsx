// YoutTubePOC
import React from 'react';
import FlexView from "react-flexview";
import { styled } from '@mui/material/styles';
import YouTubeEmbed from '../../CommonUxComponents/YouTubeEmbedComponent';
import InputThemes from "../../../Themes/inputThemes";
import ColorPicker from '../../../Services/ColorPicker';
import List from '@mui/material/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Grid from '@material-ui/core/Grid';
import GeneralUtilities from "../../../Services/GeneralUtilities";
import constantObjects from "../../../Services/Constants";
import androidApiCalls from "../../../Services/androidApiCallsService";
import localeService from "../../../Services/localeListService";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import PrimaryButtonComponent from "../../CommonUxComponents/PrimaryButtonComponent";
let localeObj = {};

const FireNav = styled(List) < React.ElementType > ({
    '& .MuiListItemIcon-root': {
        minWidth: 0,
        marginRight: 8,
    }
});

class FGTSVideoTurorialComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            firstPage: true
        }

        this.styles = {
            cardStyle: {
                width: "90%",
                borderRadius: "0.5rem",
                margin: "0 1rem",
                align: "center"
            },
            circle: {
                width: "3rem",
                height: "3rem",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: ColorPicker.newProgressBar
            },
            numberCircle: {
                display: "flex",
                justifyContent: "left",
                marginRight: "1.125rem",
                alignItems: "left",
                color: ColorPicker.accent
            },
            verticalLine: {
                position: "absolute",
                top: "2rem",
                left: "3.5rem",
                width: "0.25rem",
                height: "80%",
                backgroundColor: '#2E5F89',
                transform: "translateX(-50%)",
                zIndex: 0
            },
            imgStyleMore: {
                borderRadius: "50%",
                height: "3rem",
                width: "3rem",
                verticalAlign: "middle",
                fill: ColorPicker.surface3,
                backgroundColor: ColorPicker.surface3,
                justifySelf: 'center',
                alignSelf: 'center',
                marginRight: "1rem",
                marginTop: "1rem"
            },
            transferStyle: {
                height: "1rem",
                width: "1.2rem",
                padding: "1.25rem 1rem"
            }
        }

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    componentDidUpdate() {
        window.onBackPressed = () => {
            this.onBackHome();
        }
    }

    onBackHome = () => {
        if (this.state.firstPage === false) {
            this.setState({
                firstPage: true
            });
        } else {
            let valuePropsEnable = androidApiCalls.getDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY);
            if (valuePropsEnable === "1") {
                androidApiCalls.setDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY, "4");
            } else {
                androidApiCalls.setDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY, "6");
            }
            this.props.history.replace({ pathname: "/fgtsHome", transition: "right", fromComponent: "video_tutorial" });
        }
    }

    handleOpenWhatApp = () => {
        androidApiCalls.openUrlInBrowserLegacy("https://api.whatsapp.com/send?phone=" + constantObjects.customerCareWADialer);
    }

    isFGTSAppInstalled = () => {
        let isAppInstalled = androidApiCalls.isPackageAvailable("br.gov.caixa.fgts.trabalhador");
        if (isAppInstalled) {
            androidApiCalls.openApp('package:br.gov.caixa.fgts.trabalhador#Intent;end;');
        } else {
            this.goToFgtsPlayStoreApk();
        }
    }

    goToFgtsPlayStoreApk = () => {
        let fgtsUrl = "https://play.google.com/store/apps/details?id=br.gov.caixa.fgts.trabalhador";
        androidApiCalls.openUrlInBrowserLegacy(fgtsUrl);
    }

    next = () => {
        if (this.state.firstPage === true) {
            this.setState({
                firstPage: false
            });
        } else {
            let valuePropsEnable = androidApiCalls.getDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY);
            if (valuePropsEnable === "1") {
                androidApiCalls.setDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY, "4");
            } else {
                androidApiCalls.setDAStringPrefs(GeneralUtilities.FGTSVALUEPROPS_KEY, "6");
            }
            this.props.history.replace({ pathname: "/fgtsHome", transition: "right", fromComponent: "video_tutorial" });
        }
    }

    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;

        return (
            <div>
                <ButtonAppBar header={localeObj.fgts_withdraw} onBack={this.onBackHome} action="none" />
                <FlexView column style={{ width: `${screenWidth}px`, height: `${screenHeight * 0.75}px`, overflowY: "auto", overflowX: "hidden" }}>
                    {this.state.firstPage && <YouTubeEmbed videoId="w5QHRhkzhQk" />}
                    {!this.state.firstPage && <YouTubeEmbed videoId="smLDNiG86AE" />}
                    <div>
                        <FlexView column style={{ width: "100%" }}>
                            <FlexView style={{ width: "100%", margin: "2rem 1.5rem 1.5rem 1rem" }}>
                                <ArrowDownwardIcon style={{ width: "1.5rem", height: "1.5rem", marginRight: "0.5rem", color: ColorPicker.white }} />
                                <div className="headline5 highEmphasis">
                                    {localeObj.fgts_step_by_step}
                                </div>
                            </FlexView>
                            <Grid container spacing={0} style={{ position: "relative" }}>
                                {this.state.firstPage &&
                                    <div>
                                        <div style={this.styles.cardStyle}>
                                            <ListItem button >
                                                <ListItemText>
                                                    <FlexView style={{ textAlign: "left" }}>
                                                        <span className="accent headline10" style={{
                                                            marginRight: "1.125rem",
                                                            alignItems: "left",
                                                            color: ColorPicker.accent
                                                        }}>{"1."}</span>
                                                        <span className="body2 highEmphasis">{localeObj.fgts_video_tutorial_1}&nbsp;</span>
                                                        <span className="body2 accent" onClick={this.goToFgtsPlayStoreApk}><u>{localeObj.fgts_video_tutorial_1_caption}</u></span>
                                                    </FlexView>
                                                </ListItemText>
                                            </ListItem>
                                        </div>
                                        <div style={this.styles.cardStyle}>
                                            <ListItem button >
                                                <ListItemText>
                                                    <FlexView style={{ textAlign: "left" }}>
                                                        <span className="accent headline10" style={{
                                                            marginRight: "1.125rem",
                                                            alignItems: "left",
                                                            color: ColorPicker.accent
                                                        }}>{"2."}</span>
                                                        <span className="body2 highEmphasis">{localeObj.fgts_video_tutorial_2}</span>
                                                    </FlexView>
                                                </ListItemText>
                                            </ListItem>
                                        </div>
                                    </div>}
                                {!this.state.firstPage &&
                                    <div>
                                        <div style={this.styles.cardStyle}>
                                            <ListItem button >
                                                <ListItemText>
                                                    <FlexView style={{ textAlign: "left" }}>
                                                        <span className="accent headline10" style={{
                                                            marginRight: "1.125rem",
                                                            alignItems: "left",
                                                            color: ColorPicker.accent
                                                        }}>{"3."}</span>
                                                        <span className="body2 highEmphasis">{localeObj.fgts_video_tutorial_3}</span>
                                                    </FlexView>
                                                </ListItemText>
                                            </ListItem>
                                        </div>
                                        <div style={this.styles.cardStyle}>
                                            <ListItem button >
                                                <ListItemText>
                                                    <FlexView style={{ textAlign: "left" }}>
                                                        <span className="accent headline10" style={{
                                                            marginRight: "1.125rem",
                                                            alignItems: "left",
                                                            color: ColorPicker.accent
                                                        }}>{"4."}</span>
                                                        <span className="body2 highEmphasis">{localeObj.fgts_video_tutorial_4}</span>
                                                    </FlexView>
                                                </ListItemText>
                                            </ListItem>
                                        </div>
                                        <div style={this.styles.cardStyle}>
                                            <ListItem button>
                                                <ListItemText>
                                                    <FlexView style={{ textAlign: "left" }}>
                                                        <span className="accent headline10" style={{
                                                            marginRight: "1.125rem",
                                                            alignItems: "left",
                                                            color: ColorPicker.accent
                                                        }}>{"5."}</span>
                                                        <span className="body2 highEmphasis">{localeObj.fgts_video_tutorial_5}</span>
                                                    </FlexView>
                                                </ListItemText>
                                            </ListItem>
                                        </div>
                                    </div>}
                            </Grid>
                            {!this.state.firstPage && <div className="body2 accent" style={{ margin: "2rem auto 2.5rem auto" }} onClick={this.handleOpenWhatApp}>
                                {localeObj.fgts_video_tutorial_caption}
                            </div>}
                        </FlexView>
                    </div>
                </FlexView>
                <div align="center" style={InputThemes.bottomButtonStyle}>
                    <PrimaryButtonComponent btn_text={this.state.firstPage === true ? localeObj.next : localeObj.Finished} onCheck={this.next} />
                </div>
            </div>
        );
    }
};

export default FGTSVideoTurorialComponent;
