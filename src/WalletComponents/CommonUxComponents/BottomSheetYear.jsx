import React from 'react';
import PropTypes from "prop-types";
import clsx from 'clsx';
import "../../styles/main.css";
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowIcon from '@material-ui/icons/ArrowForwardIos';
import { MuiThemeProvider } from "@material-ui/core/styles";

import "../../styles/main.css";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import InputThemes from "../../Themes/inputThemes";
import ColorPicker from "../../Services/ColorPicker";

const useStyles = makeStyles({
    list: {
        color: ColorPicker.darkHighEmphasis,
        backgroundColor: ColorPicker.newProgressBar,
        fontSize: "0.8rem",
        padding: "3px",
        fontWeight: "400",
        lineHeight: "20px",
        width: "25%",
        boxShadow: "none",
        textAlign: 'center',
        textTransform: 'none',
        size: 'small',
    },
    headingStyle: {
        fontSize: "1.25rem",
        fontWeight: 500,
        lineHeight: "1.2rem",
        color: ColorPicker.darkHighEmphasis,
        textAlign: 'center',
        marginTop: "4%"
    },
    fullList: {
        width: 'auto',
    },
    paper: {
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        backgroundColor: ColorPicker.newProgressBar,
        height: 'calc(100% - 120px)',
        top: 120
    },
    paperWithoutHeight: {
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        backgroundColor: ColorPicker.newProgressBar,
    }
});

const theme1 = InputThemes.SearchInputTheme;

export default function BottomSheetYear(props) {
    const classes = useStyles();
    const [state, setState] = React.useState({ bottom: true });

    const keySelected = (key) => {
        props.keySelected(key)
    }

    const toggleDrawer = (anchor, open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setState({ ...state, [anchor]: open });
    };

    const list = (anchor, year, header) => (
        <div
            className={clsx(classes.list, {
                [classes.fullList]: anchor === 'bottom',
            })}
            onClick={toggleDrawer(anchor, true)}
            onKeyDown={toggleDrawer(anchor, false)}>
            <MuiThemeProvider theme={theme1}>
                <List>
                    <div className="headline6 highEmphasis" style={{ margin: "1.5rem", textAlign: "center" }}>{header}</div>
                    {year.map((keyVal) => (
                        <ListItem button key={keyVal} onClick={() => keySelected(keyVal)}>
                            <ListItemText className="body2 highEmphasis" primary={keyVal} />
                            <ArrowIcon style={{ fill: ColorPicker.accent }} />
                        </ListItem>
                    ))}
                </List>
            </MuiThemeProvider>
        </div>
    );
    let len = props.year.length;
    return (
        <div>
            <Drawer classes={{ paper: len > 10 ? classes.paper : classes.paperWithoutHeight }}
                PaperProps={{ elevation: 0 }}
                anchor={"bottom"}
                open={state["bottom"]}
            >
                <div
                    style={{
                        margin: "0 1.5rem",
                        marginBottom: "0.5rem" }}>
                    {list("bottom", props.year, props.heading)}
                </div>
            </Drawer>
        </div>
    );
}

BottomSheetYear.propTypes = {
    year: PropTypes.array,
    heading: PropTypes.string,
    keySelected: PropTypes.string
  };