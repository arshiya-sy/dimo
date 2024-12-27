import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ColorPicker from "../../Services/ColorPicker";

const OnboardingButton = withStyles(() => ({
    root: {
        color: ColorPicker.highEmphasis,
        backgroundColor: ColorPicker.regularAccent,
        borderRadius: "30px",
        fontSize: "0.875rem",
        fontWeight: "400",
        lineHeight: "28px",
        textTransform: 'none',
        textAlign: 'center',
        boxShadow: "none",
        '&:hover': {
            backgroundColor: ColorPicker.buttonPressState,
        },
        '&:disabled': {
            backgroundColor: ColorPicker.surface2,
        },
        "& .MuiTouchRipple-root span": {
            backgroundColor: ColorPicker.buttonPressState,
            boxShadow: "none",
        },
    },
}))(Button);


const useStyles = makeStyles(() => ({
    margin: {
        margin: "4px",
    },
}));

export default function OnboardingButtonComponent(props) {
    const classes = useStyles();

    const onCheck = () => {
        props.onCheck();
    }

    return (
        <OnboardingButton variant="contained"
        className={classes.margin} onClick={() => onCheck()}>
           {props.btn_text}
        </OnboardingButton>
    );
}

OnboardingButtonComponent.propTypes = {
    onCheck: PropTypes.func,
    btn_text: PropTypes.string
};