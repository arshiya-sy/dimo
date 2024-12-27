import React from 'react';
import PropTypes from "prop-types";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ColorPicker from "../../Services/ColorPicker"

const ActionButton = withStyles(() => ({
    root: {
        color: ColorPicker.darkHighEmphasis,
        borderRadius: "30px",
        fontSize: "0.875rem",
        fontWeight: "400",
        lineHeight: "20px",
        padding: "8px 24px",
        textTransform: 'none',
        textAlign: 'center',
        boxShadow: "none",
        justifyContent: "center",
        border: "1px solid " + ColorPicker.darkDisabled,
        minWidth: "8rem",
        '&:hover': {
            border: "solid 1px " + ColorPicker.darkDisabled,
            boxShadow: "none",
        },
        '&:disabled': {
            color: ColorPicker.disabledTxt,
            backgroundColor: ColorPicker.secDisabled,
        },
        "& .MuiTouchRipple-root span": {
            border: "solid 1px " + + ColorPicker.darkDisabled,
            boxShadow: "none",
        },
    },
}))(Button);
export default function AndroidActionButton(props) {

    const onCheck = () => {
        props.onCheck();
    }

    return (
        <ActionButton className="body2" variant="outlined"
            disabled={props.disabled} onClick={() => onCheck()} startIcon={props.icon}>
            {props.btn_text}
        </ActionButton>
    );
}

AndroidActionButton.propTypes = {
    entity: PropTypes.bool,
    disabled: PropTypes.bool,
    btn_text: PropTypes.string,
    icon: PropTypes.object,
    onCheck: PropTypes.func,
    addTopMargin: PropTypes.bool
  };