import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import PropTypes from 'prop-types';

const screenHeight = window.screen.height;
const screenWidth = window.screen.width;

const PrimaryButton = withStyles(() => ({
    root: {
        textTransform: 'none',
        textAlign: 'center',
        boxShadow: "none",
        backgroundColor: ColorPicker.buttonAccent,
        borderRadius: "1.875rem",
        padding: `${(1.4 / 100) * screenHeight}px`,
        width: `${screenWidth * 0.9}px`,
        fontSize: "1rem",
        fontFamily: "Roboto",
        letterSpacing :"0.5px",
        lineHeight: "28px",
        fontWeight: "400",
        color: ColorPicker.btnHighEmphasis,
        '&:hover': {
            backgroundColor: ColorPicker.buttonAccent,
            boxShadow: "none"
        },
        '&:disabled': {
            color: ColorPicker.disabledTxt,
            backgroundColor: ColorPicker.secDisabled,
        },
        "& .MuiTouchRipple-root span": {
            backgroundColor: ColorPicker.buttonAccent,
            boxShadow: "none",
        },
        '&.Mui-disabled': {
            color: ColorPicker.disabledTxt,
            backgroundColor: ColorPicker.secDisabled,
        },
        "&.MuiTouchRipple-root span": {
            backgroundColor: ColorPicker.buttonAccent,
            boxShadow: "none",
        },
        "&.MuiButton-contained.Mui-disabled" : {
            color: ColorPicker.disabledTxt,
            backgroundColor: ColorPicker.secDisabled,
        },
        "&.MuiButton-contained:hover.Mui-disabled" : {
            color: ColorPicker.disabledTxt,
            backgroundColor: ColorPicker.secDisabled,
        }
    },
}))(Button);

export default function PrimaryButtonComponent(props) {

    const onCheck = () => {
        props.onCheck();
    }

    return (
        <PrimaryButton variant="contained" disabled={props.disabled}
            onClick={() => onCheck()} startIcon={props.icon}>
            {props.btn_text}
        </PrimaryButton>
    );
}

PrimaryButtonComponent.propTypes = {
    onCheck: PropTypes.func,
    btn_text: PropTypes.string,
    disabled: PropTypes.bool,
    icon: PropTypes.string,
};