import React, { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";
import FlexView from 'react-flexview/lib';
import { makeStyles, MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import ColorPicker from "../../Services/ColorPicker";
import localeService from "../../Services/localeListService";

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Close';
import BackIcon from '@material-ui/icons/ArrowBack';
import HelpIcon from '@material-ui/icons/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
var localeObj = {};

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
        MuiPaper: {
            elevation4: {
                boxShadow: "none"
            }
        },
        MuiIconButton: {
            root: {
                padding: "1.5rem"
            }
        },
        MuiToolbar: {
            root: {
                justifyContent: "space-between"
            },
            regular: {
                height: "56px"
            },
            gutters: {
                paddingLeft: "0",
                paddingRight: "0"
            }
        }
    }
});

export default function ButtonAppBar(props) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget)
    }
    const [isClicked, setIsClicked] = useState(false);

    useEffect(() => {
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }, []);

    const handleViewTickets = () => {
        if (!isClicked) {
            setIsClicked(true);
            props.onViewTickets();
        }
    };

    return (
        <div className={classes.root}>
            <MuiThemeProvider theme={theme1}>
                <AppBar position="static" color="transparent" elevation="0">
                    <Toolbar>
                        <IconButton color="inherit" onClick={() => props.onBack()} >
                            {props.inverse ? "" : <BackIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1.25rem", padding: props.transaction ? '0.75rem' : null }} />}
                        </IconButton>
                        <span className="body2 highEmphasis" style={{ userSelect: "none", marginLeft: (props.action === "cancel" && props.header === "Receipt" ? "1rem" : "0") }}>
                            {props.header}
                        </span>
                        <IconButton color="inherit" style={{ display: (props.action === "cancel" ? 'block' : 'none') }} onClick={() => props.onCancel()}>
                            <CancelIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1.25rem" }} />
                        </IconButton>
                        <IconButton color="inherit" style={{ display: (props.action === "help" ? 'block' : 'none') }} onClick={() => props.onHelp()}>
                            <HelpIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1.25rem" }} />
                        </IconButton>
                        <IconButton color="inherit" style={{ display: (props.action === "settings" ? 'block' : 'none') }} onClick={() => props.onClickSettings()}>
                            <SettingsIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1.25rem" }} />
                        </IconButton>
                        {
                            props.action === "help-share"
                            && <FlexView>
                                <IconButton color="inherit" onClick={() => props.onHelp()} style={{ paddingRight: '1rem' }}>
                                    <HelpIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1.25rem" }} />
                                </IconButton>
                                <IconButton color="inherit" style={{ paddingLeft: 0 }} onClick={props.onShare}>
                                    <ShareIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1.25rem" }} />
                                </IconButton>
                            </FlexView>
                        }
                        <IconButton color="inherit" style={{ display: props.action === "more" ? "block" : "none" }} onClick={handleMenuOpen}>
                            <MoreVertIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1.25rem" }} />
                        </IconButton>
                        <IconButton disabled color="inherit" style={{ display: (props.action === "none" ? 'block' : 'none') }}>
                            <HelpIcon style={{ visibility: "hidden" }} />
                        </IconButton>

                        <Menu
                            id="long-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                            PaperProps={{
                                style: {
                                    background: ColorPicker.viewTicketMenu
                                },
                            }}
                            MenuListProps={{
                                style: {
                                    paddingTop: '0',
                                    paddingBottom: '0'
                                },
                            }}
                        >
                            <MenuItem onClick={handleViewTickets} style={{ textAlign: 'center', color: 'white' }} > {localeObj.view_tickets} </MenuItem>
                        </Menu>
                        <IconButton color="inherit" style={{ display: (props.action === "eye" ? 'block' : 'none') }} onClick={() => props.onAction()}>
                            <VisibilityOutlinedIcon style={{ fill: ColorPicker.darkHighEmphasis, fontSize: "1.25rem" }} />
                        </IconButton>
                    </Toolbar>
                </AppBar>
            </MuiThemeProvider>
        </div>
    );
}

ButtonAppBar.propTypes = {
    action: PropTypes.string,
    onAction: PropTypes.func,
    onViewTickets: PropTypes.func,
    onShare: PropTypes.func,
    onHelp: PropTypes.func,
    onClickSettings: PropTypes.func,
    onCancel: PropTypes.func,
    header: PropTypes.string,
    inverse: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool,
      ]),
    onBack: PropTypes.func,
    transaction: PropTypes.string
  };
