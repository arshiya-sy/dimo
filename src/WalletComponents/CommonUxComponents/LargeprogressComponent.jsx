import React from 'react';
import { makeStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import ColorPicker from "../../Services/ColorPicker";

const useStylesFacebook = makeStyles({
    root: {
        position: "fixed",
        top: "25%",
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
                size={72}
                thickness={3}
                value={2500}
            />
            <CircularProgress
                variant="indeterminate"
                disableShrink
                className={classes.top}
                classes={{
                    circle: classes.circle,
                }}
                size={72}
                thickness={3}
            />
        </div>
    );
}

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
});


export default function CustomizedProgressBars() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <MuiThemeProvider theme={theme1}>
                <LoadingCircularProgress />
            </MuiThemeProvider>
        </div>
    );
}