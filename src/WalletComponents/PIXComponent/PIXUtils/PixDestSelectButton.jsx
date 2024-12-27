import React from 'react';
import { makeStyles, MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { Button } from '@material-ui/core';
import "../../../styles/main.css";
import "../../../styles/new_pix_style.css";
import PropTypes from "prop-types";

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
    title: {
        flexGrow: 1,
    },
});


const theme1 = createMuiTheme({
    overrides: {
        MuiButton: {
            root: {
                width:"100%",
                justifyContent: "space-between",
            },
            endIcon: {
                color: "#02b2a1",
            }
        }
    }
});

export default function PixDestSelectButton(props) {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <MuiThemeProvider theme={theme1}>
                <Button
                    onClick={() => props.select()}
                    endIcon={<ArrowForwardIosIcon/>}
                    style={{paddingLeft:"0", paddingRight:"0"}}>
                    <div style={{display:"flex", flexDirection:"column"}}>
                        <span className="pixTwoLineButtonHeader body2 highEmphasis">
                            {props.header}
                        </span>
                        <span className="pixTwoLineButtonSubHeader body2 mediumEmphasis">
                            {props.hint}
                        </span>
                    </div>
                    </Button>
            </MuiThemeProvider>
        </div>
    );
}

PixDestSelectButton.propTypes = {
    hint: PropTypes.string,
    header: PropTypes.string,
    select: PropTypes.func

}


    