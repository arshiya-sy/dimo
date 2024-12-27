import React from 'react';


import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import 'react-multi-carousel/lib/styles.css';


import { MuiThemeProvider } from '@material-ui/core/styles';
import localeService from "../../Services/localeListService";
import MetricServices from "../../Services/MetricsService";
import PageState from '../../Services/PageState';

import InputThemes from '../../Themes/inputThemes';
import ColorPicker from '../../Services/ColorPicker';
import { CircularProgress } from '@material-ui/core';
import { withStyles, makeStyles, createMuiTheme } from '@material-ui/core/styles';
import PropTypes from "prop-types";
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import constantObjects from '../../Services/Constants';
import Gift_Card_Google1 from '../../images/SpotIllustrations/Gift_Card_Google1.webp'
import Gift_Card_Google2 from '../../images/SpotIllustrations/Gift_Card_Google2.webp'
import Gift_Card_Google3 from '../../images/SpotIllustrations/Gift_Card_Google3.webp'
import GiftCardPhotoCarousel from './GiftCardPhotoCarousel';
import PageNames from '../../Services/PageNames';
const theme2 = InputThemes.snackBarThemeForMyCards;
const styles = InputThemes.singleInputStyle;

var localeObj = {};
const PageNameJSON = PageNames.GiftCardComponents;
const useStylesFacebook = makeStyles({
    root: {
        position: "fixed",
        top: "45%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    },
    bottom: {
        color: ColorPicker.secDisabled,
    },
    top: {
        color: ColorPicker.accent,
        animationDuration: '1000ms',
        position: 'absolute',
        left: 0,
    },
    circle: {
        strokeLinecap: 'round',
    },
});

const theme1 = createMuiTheme({
    overrides: {
        MuiCircularProgress: {
            circleIndeterminate: {
                strokeDasharray: "80px, 200px"
            },
        },
    }
});


function LoadingCircularProgress() {
    const classes = useStylesFacebook();

    return (
        <div className={classes.root}>
            <CircularProgress
                variant="determinate"
                className={classes.bottom}
                size={54}
                thickness={3}
                value={100}
            />
            <CircularProgress
                variant="indeterminate"
                disableShrink
                className={classes.top}
                classes={{
                    circle: classes.circle,
                }}
                size={54}
                thickness={3}
            />
        </div>
    );
}

const photos = [
    Gift_Card_Google1,
    Gift_Card_Google2,
    Gift_Card_Google3,
    // Add more photo URLs as needed
  ];


class GiftCardCreation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showProgressDialog: true,
            timer: this.props.retryVerification ? 60 :180,
            timerString: this.props.retryVerification ? "01:00" : "03:00",
            snackBarOpen: false,
            
        };
        this.style = {
            blockStyle: {
                display: "flex",
                flexDirection: "column",
                minHeight: "inherit",
                alignItems: "center",
                justifyContent: "center",
                margin: "10%",
                position: "fixed",
                top: "45%",
            },
            title: {
                marginTop: "1.5rem",
                textAlign:"center"
            },
            subTitle: {
                marginTop: "1rem",
                textAlign: "center"
            }
        }
        this.componentName = PageNameJSON['create_card'];
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricServices.onPageTransitionStart(this.componentName);
       
    }

    componentDidMount() {
        document.addEventListener("visibilitychange", this.visibilityChange);
        const interval = setInterval(() => {
        this.setState({
            timer : this.state.timer - 1
        }, () => {
            const totalSeconds = this.state.timer;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const result = `${this.padTo2Digits(minutes)}:${this.padTo2Digits(seconds)}`;
            this.setState({
                timerString: result
            }, () => {
                if (this.state.timer === 0) {
                    clearInterval(interval); 
                    this.props.verifyGiftCardStatus("notification", true);
                    MetricServices.onPageTransitionStop(this.componentName, PageState.close);     
                } else if (this.state.timer < 121 && this.state.timer % 15 === 0) {
                    this.props.verifyGiftCardStatus("notification", false);
                    MetricServices.onPageTransitionStop(this.componentName, PageState.close);
                }
            });  
        });
            
        }, 1000);

        window.onBackPressed = () => {
            this.setState({
                snackBarOpen: true,
                snackBarMessage: localeObj.gift_card_no_action
            })
           
        }
        
    }

    padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
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

    render() {
        return (
            <div>
                <GiftCardPhotoCarousel photos={photos}/>
                <div style={this.style.blockStyle}>
                    {this.state.showProgressDialog && <div>
                        <MuiThemeProvider theme={theme1}>
                            <LoadingCircularProgress />
                        </MuiThemeProvider>
                    </div>}
                    <div className="headline5 highEmphasis" style={this.style.title}>{localeObj.gift_card_creation_head} </div>
                    <div className="body2 highEmphasis" style={this.style.subTitle}>{localeObj.gift_card_creation_desc} </div>
                </div>
                <MuiThemeProvider theme={theme2}>  
                <Snackbar open={true} autoHideDuration={constantObjects.SNACK_BAR_DURATION}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{
                            <div className="body2 highEmphasis" style={{marginLeft:"1rem"}}>
                            <span style={{color: ColorPicker.accent}} className='headline6'>{this.state.timerString}</span>
                            <span style={{marginLeft:"1rem"}}>{localeObj.gift_card_creation_snackbar}</span>
                        </div>
                        }</MuiAlert>
                    </Snackbar>
               </MuiThemeProvider>
               <MuiThemeProvider theme={theme2}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackBarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
            
        );
    }
}
GiftCardCreation.propTypes = {
    classes: PropTypes.object.isRequired,
    retryVerification: PropTypes.bool,
    verifyGiftCardStatus: PropTypes.func,
};

export default withStyles(styles)(GiftCardCreation);
