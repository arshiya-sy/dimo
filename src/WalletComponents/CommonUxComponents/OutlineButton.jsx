import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ColorPicker from "../../Services/ColorPicker";

const OutlineButton = withStyles(() => ({
    root: {
        color: ColorPicker.darkHighEmphasis,
        borderRadius: "30px",
        fontSize: "0.875rem",
        padding: "8px 24px",
        fontWeight: "400",
        lineHeight: "20px",
        boxShadow: "none",
        textAlign: 'center',
        textTransform: 'none',
        justifyContent: "center",
        minWidth: "8rem",
        width: "90%",
        border: "1px solid " + ColorPicker.darkDisabled,
        '&:hover': {
            border: "solid 1px " + ColorPicker.darkDisabled,
            boxShadow: "none",
        },
        '&:disabled': {
            color: ColorPicker.disabledTxt,
            backgroundColor: ColorPicker.secDisabled,
        },
        "& .MuiTouchRipple-root span": {
            border: "solid 1px " + ColorPicker.darkDisabled,
            boxShadow: "none",
        },
    },
}))(Button);

const useStyles = makeStyles(() => ({
    margin: {
        marginBottom: "12px",
    },
}));

export default function OutlineButtonComponent(props) {
    const classes = useStyles();

    const onCheck = () => {
        props.onCheck();
    }

    return (
        <OutlineButton variant="outlined" className={classes.margin}
            disabled={props.disabled} onClick={() => onCheck()}>
            {props.btn_text}
        </OutlineButton>
    );
}

OutlineButtonComponent.propTypes = {
    onCheck: PropTypes.func,
    btn_text: PropTypes.string,
    disabled: PropTypes.bool,
};