import React from "react";
import "../../styles/main.css";

import CircularProgress from "@material-ui/core/CircularProgress"
import localeService from "../../Services/localeListService";
import ColorPicker from "../../Services/ColorPicker";
import { makeStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const useStylesFacebook = makeStyles({
    root: {
        position: "fixed",
        top: "40%",
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

var localeObj = {};

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

export default class GiftCardLoader extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showProgressDialog: true
        }

        this.style = {
            blockStyle: {
                display: "flex",
                flexDirection: "column",
                minHeight: "inherit",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "10%",
                marginRight: "10%",
                position: "fixed",
                top: "45%",
            },
            title: {
                marginTop: "1rem",
                textAlign: "center"
            },
            subTitle: {
                marginTop: "1rem",
                textAlign: "center"
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    render() {
        return (
            <div>
                <div style={this.style.blockStyle}>
                    {this.state.showProgressDialog && <div>
                        <MuiThemeProvider theme={theme1}>
                            <LoadingCircularProgress />
                        </MuiThemeProvider>
                    </div>}
                    <div className="headline5 highEmphasis"  style={this.style.title}>{localeObj.gift_card_dimo} </div>
                    <span className="body2 highEmphasis" style={this.style.subTitle}>{localeObj.gift_card_desc} </span>
                </div>
            </div>
        )
    }
}