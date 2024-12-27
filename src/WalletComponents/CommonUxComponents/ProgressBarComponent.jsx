import React from 'react';
import { makeStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import ColorPicker from "../../Services/ColorPicker";
import PropTypes from 'prop-types';

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
});

const theme1 = createMuiTheme({
    overrides: {
        MuiMobileStepper: {
            root:{
                background: ColorPicker.newProgressBar,
                padding:"0"
            },
            progress: {
                width: "100%"
            },
            dotActive: {
                backgroundColor: ColorPicker.regularAccent,
            }
        },
        MuiLinearProgress: {
            root:{
                height: "0.5rem",
            },
            bar: {
                borderRadius: "0.25rem"
            },
            barColorPrimary: {
                backgroundColor: ColorPicker.accent
            },
            colorPrimary: {
                backgroundColor: ColorPicker.newProgressBar
            }
        }
    }
});

export default function ProgressBar(props) {
    const classes = useStyles();
    return (
        <MuiThemeProvider theme={theme1}>
            <MobileStepper
                variant="progress"
                steps={props.incrementMaxSteps ? 26 : 25}
                position="static"
                activeStep={parseInt(props.size)}
                className={classes.root}
            />
        </MuiThemeProvider>
    );
}

ProgressBar.propTypes = {
    incrementMaxSteps: PropTypes.bool,
    size: PropTypes.string
};