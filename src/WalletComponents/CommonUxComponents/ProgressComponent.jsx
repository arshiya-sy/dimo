import React from 'react';
import { makeStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import ColorPicker from "../../Services/ColorPicker";
import PropTypes from 'prop-types';

const useStylesPageSpinner = makeStyles({
    root: {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    },
    timerRoot: {
        position:"fixed",
        top: "78.5%",
        left: "15%",
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

function LoadingCircularProgress(props) {
    const { rootStyles , timer, size = {} } = props;
    const classes = useStylesPageSpinner();

    return (
        <div className={timer === true ? classes.timerRoot : classes.root} style={rootStyles}>
            <CircularProgress
                variant="determinate"
                className={classes.bottom}
                size={size > 0 ? size : 54}
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
                size={size > 0 ? size : 54}
                thickness={3}
            />
        </div>
    );
}

LoadingCircularProgress.propTypes = {
    rootStyles: PropTypes.object,
    timer: PropTypes.string,
    size: PropTypes.object
};

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
});

export default function CustomizedProgressBars(props) {
    const classes = useStyles();
    const { rootStyles = {} } = props;
    const { timer, size = {} } = props;


    return (
        <div className={classes.root}>
            <MuiThemeProvider theme={theme1}>
                <LoadingCircularProgress rootStyles={rootStyles} size={size} timer={timer} />
            </MuiThemeProvider>
        </div>
    );
}

CustomizedProgressBars.propTypes = {
    rootStyles: PropTypes.object,
    timer: PropTypes.string,
    size: PropTypes.object
};
