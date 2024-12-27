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
        border: "1px solid " + ColorPicker.buttonAccent,
        minWidth: "8rem",
        '&:hover': {
            border: "solid 1px " + ColorPicker.buttonAccent,
            boxShadow: "none",
        },
        '&:disabled': {
            color: ColorPicker.disabledTxt,
            backgroundColor: ColorPicker.secDisabled,
        },
        "& .MuiTouchRipple-root span": {
            border: "solid 1px " + + ColorPicker.buttonAccent,
            boxShadow: "none",
        },
    },
}))(Button);

export default function ActionButtonComponent(props) {

    const onCheck = () => {
        props.entity ? props.onCheck(props.entity) : props.onCheck();
    }

    return (
        <ActionButton className="body2" variant="outlined" style={{marginTop: props.addTopMargin ? "1.5rem" : "0"}}
            disabled={props.disabled} onClick={() => onCheck()} startIcon={props.icon}>
            {props.btn_text}
        </ActionButton>
    );
}
ActionButtonComponent.propTypes = {
    entity: PropTypes.bool,
    disabled: PropTypes.bool,
    btn_text: PropTypes.string,
    icon: PropTypes.object,
    onCheck: PropTypes.func,
    addTopMargin: PropTypes.bool
  };
