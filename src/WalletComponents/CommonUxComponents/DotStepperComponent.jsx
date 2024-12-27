import React from 'react';
import PropTypes from "prop-types";
import { makeStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import ColorPicker from "../../Services/ColorPicker"

const useStyles = makeStyles({
    root: {
        maxWidth: 400,
        flexGrow: 1,
    },
});

const theme1 = createMuiTheme({
    overrides: {
        MuiMobileStepper: {
            root: {
                background: ColorPicker.white
            },
            dotActive: {
                backgroundColor: ColorPicker.regularAccent,
            },
            progress: {
                width: "100%"
            },
            dot :{
                margin: "0 4px"
            }
        },
    }
});


export default function DotStepperComponent(props) {
    const classes = useStyles();
    const [activeStep] = React.useState(parseInt(props.size));

    return (
        <MuiThemeProvider theme={theme1}>
            <MobileStepper
                variant="dots"
                steps={4}
                position="static"
                activeStep={activeStep}
                className={classes.root}
            />
        </MuiThemeProvider>
    );
}

DotStepperComponent.propTypes = {
    classes: PropTypes.object,
    size: PropTypes.string
  };
