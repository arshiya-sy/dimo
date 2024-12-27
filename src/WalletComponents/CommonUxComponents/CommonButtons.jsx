import React from "react";
import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import ColorPicker from "../../Services/ColorPicker";
import Button from '@material-ui/core/Button';
import { withStyles} from "@material-ui/core/styles";

const CommonButtons = Object.freeze({
    "ButtonTypeFilter": withStyles(() => ({
        root: {
            color: ColorPicker.darkHighEmphasis,
            borderRadius: "1.125rem",
            flexDirection: 'row',
            textTransform: 'none',
            height: "2.1875rem",
            textAlign: 'center',
            alignItems: 'stretch',
            boxShadow: "none",
            width: "auto",
            flex:1,
            justifyContent: "center",
            '&:hover': {
                border: "solid 0.063rem" + ColorPicker.darkHighEmphasis,
                boxShadow: "none",
            },
            "& .MuiTouchRipple-root span": {
                border: `solid 0.125rem
                        linear-gradient(to right, #04294A,#04294A) padding-box,
                        linear-gradient(to right, #ff554d, #FFBA8F) border-box`,
                boxShadow: "none",
            },
        }}),
    )(Button),

    "ButtonTypeBottom": withStyles(() => ({
        root: {
            color: ColorPicker.darkHighEmphasis,
            borderRadius: "1.875rem",
            fontSize: "0.875rem",
            fontWeight: "400",
            lineHeight: "1.25rem",
            padding: "0.5rem 1.5rem",
            textTransform: 'none',
            textAlign: 'center',
            boxShadow: "none",
            justifyContent: "center",
            border: "0.063rem solid " + ColorPicker.darkHighEmphasis,
            '&:hover': {
                border: "solid 0.063rem " + ColorPicker.darkHighEmphasis,
                boxShadow: "none",
            },
            "& .MuiTouchRipple-root span": {
                border: `solid 0.063rem
                        linear-gradient(to right, #04294A,#04294A) padding-box,
                        linear-gradient(to right, #ff554d, #FFBA8F) border-box`,
                boxShadow: "none",
            },
        },
    }))(Button),

    "ButtonTypeChip": withStyles(() => ({
        root: {
            color: ColorPicker.darkHighEmphasis,
            borderRadius: "1.875rem",
            fontSize: "0.875rem",
            fontWeight: "400",
            lineHeight: "1.25rem",
            padding: "0.5rem 1.5rem",
            textTransform: 'none',
            textAlign: 'center',
            boxShadow: "none",
            justifyContent: "center",
            border: "0.188 solid " + ColorPicker.darkHighEmphasis,
            '&:hover': {
                border: "solid 0.063rem " + ColorPicker.darkHighEmphasis,
                boxShadow: "none",
            },
            "& .MuiTouchRipple-root span": {
                border: "solid 0.188rem " + ColorPicker.btnMediumEmphasis,
                boxShadow: "none",
            },
        },
    }))(Button),

    "AwaitButton" : withStyles(() => ({
        root: {
            backgroundColor: ColorPicker.newProgressBar,
            borderRadius: "0.75rem",
            padding: "0.5rem",
            textTransform: 'none',
            textAlign: 'center',
            boxShadow: "none",
            justifyContent: "center",
            width: "100%"
        },
    }))(Button),

    "ColoredTextButton" : withStyles({
    root: {
        color: ColorPicker.duskHorizon,
        textTransform: "none"
    },
   })((props) => <Button color="default" {...props} />),
});


export default CommonButtons;