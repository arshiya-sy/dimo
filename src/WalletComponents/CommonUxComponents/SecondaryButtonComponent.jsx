import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ColorPicker from "../../Services/ColorPicker"
import PropTypes from 'prop-types';

const screenHeight = window.screen.height;
const screenWidth = window.screen.width;

const SecondaryButton = withStyles(() => ({
    root: {
        color: ColorPicker.darkHighEmphasis,
        border: "solid 1px " + ColorPicker.buttonAccent,
        borderRadius: "1.875rem",
        fontSize: "1rem",
        padding: `${(1.35 / 100) * screenHeight}px`,
        width: `${screenWidth * 0.9}px`,
        fontWeight: "400",
        lineHeight: "28px",
        boxShadow: "none",
        textAlign: 'center',
        textTransform: 'none',
        '&:hover': {
            border: "solid 1px " + ColorPicker.darkMediumEmphasis,
            boxShadow: "none",
        },
        '&:disabled': {
            color: ColorPicker.disabledTxt,
            backgroundColor: ColorPicker.secDisabled,
        },
        "& .MuiTouchRipple-root span": {
            border: "solid 1px " + + ColorPicker.darkMediumEmphasis,
            boxShadow: "none",
        },
    },
}))(Button);

const useStyles = makeStyles(() => ({
    margin: {
        marginTop: "0.5rem",
    },
}));

export default function SecondaryButtonComponent(props) {
    const classes = useStyles();

    const onCheck = () => {
        props.onCheck();
    }

    return (
        <SecondaryButton
            variant="outlined" className={classes.margin} style={props.styles}
            disabled={props.disabled} onClick={() => onCheck()}
        >
            {props.btn_text}
        </SecondaryButton>
    );
}

SecondaryButtonComponent.propTypes = {
    onCheck: PropTypes.func,
    btn_text: PropTypes.any,
    disabled: PropTypes.bool,
    icon: PropTypes.string,
    styles: PropTypes.object
};