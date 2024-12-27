import React from 'react';
import PropTypes from "prop-types";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ColorPicker from "../../Services/ColorPicker"

const ActionButton = withStyles(() => ({
    root: {
        color: ColorPicker.darkHighEmphasis,
        borderRadius: "12px",
        fontSize: "0.875rem",
        fontWeight: "400",
        lineHeight: "20px",
        padding: "8px",
        textTransform: 'none',
        textAlign: 'center',
        boxShadow: "none",
        justifyContent: "center",
        border: "1px solid " + ColorPicker.newProgressBar,
        minWidth: "15rem",
        backgroundColor: ColorPicker.newProgressBar,
        '&:hover': {
            border: "solid 1px " + ColorPicker.newProgressBar,
            boxShadow: "none",
        },
        '&:disabled': {
            color: ColorPicker.disabledTxt,
            backgroundColor: ColorPicker.secDisabled,
        },
        "& .MuiTouchRipple-root span": {
            border: "solid 1px " + + ColorPicker.newProgressBar,
            boxShadow: "none",
        },
    },
}))(Button);
export default function EndActionButtonComponent(props) {

    const onCheck = () => {
        props.onCheck();
    }

    return (
        <ActionButton className="body2" variant="outlined"
            disabled={props.disabled} onClick={() => onCheck()} endIcon={props.icon}>
            {props.btn_text}
        </ActionButton>
    );
}

EndActionButtonComponent.propTypes = {
    onCheck: PropTypes.func,
    btn_text: PropTypes.string,
    disabled: PropTypes.bool,
    icon: PropTypes.string,
  };
