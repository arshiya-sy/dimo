import React from 'react';
import clsx from 'clsx';
import "../../../styles/main.css";
import ColorPicker from "../../../Services/ColorPicker";
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ArrowIcon from '@material-ui/icons/ArrowForwardIos';
import { MuiThemeProvider } from "@material-ui/core/styles";
import InputThemes from '../../../Themes/inputThemes';
import PropTypes from "prop-types";

const useStyles = makeStyles({
  list: {
    color: ColorPicker.highEmphasis,
    backgroundColor: ColorPicker.surface3,
    borderRadius: "0.625rem",
    fontSize: "0.8rem",
    padding: "0.188rem",
    fontWeight: "300",
    lineHeight: "1.25rem",
    width: "25%",
    boxShadow: "none",
    textAlign: 'center',
    textTransform: 'none',
    size: 'small',
    '&:hover': {
      backgroundColor: "",
    },
    '&:disabled': {
      backgroundColor: ColorPicker.surface2,
    },
  },
  headingStyle: {
    textAlign: 'center',
    marginTop: "4%"
  },
  fullList: {
    width: 'auto',
  },
  paper: {
    borderTopLeftRadius: "1rem",
    borderTopRightRadius: "1rem",
    backgroundColor: ColorPicker.surface3
  }
});

const theme1 = InputThemes.SearchInputTheme;

export default function BottomSheetForKeys(props) {
  const classes = useStyles();
  const [state] = React.useState({ bottom: true });

  const keySelected = (key) => {
    //Log.sDebug("User has selected Key for " + key.action, "BottomSheetForKeys")
    props.keySelected(key)
  }
  window.onBackPressed = () => {
    props.onBack()
  }


  const list = (anchor, pixKeys, header) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'bottom',
      })}>
      <MuiThemeProvider theme={theme1}>
        <List>
          <div className="headline6 highEmphasis" style={{ marginTop: "1.5rem", textAlign:"center" }}>{header}</div>
          {
            pixKeys.map((keyVal) => (
              <ListItem button key={keyVal.type} onClick={() => keySelected(keyVal)}>
                <ListItemText primary={keyVal.type === "EVP" ? props.evp_key : keyVal.type} secondary={keyVal.key} />
                <ArrowIcon style={{ fill: ColorPicker.accent }} />
              </ListItem>
            ))}
        </List>
      </MuiThemeProvider>
    </div>
  );

  return (
    <div>
      <Drawer classes={{ paper: classes.paper }}
        PaperProps={{ elevation: 0 }}
        anchor={"bottom"}
        open={state.bottom}
      >
        <div style={{ margin: "0 1.5rem", marginBottom: "0.5rem" }}>{list("bottom", props.pixKey, props.heading)}</div>
      </Drawer>
    </div>
  );
}

BottomSheetForKeys.propTypes = {
  keySelected: PropTypes.func,
  onBack: PropTypes.func,
  evp_key: PropTypes.string,
  pixKey: PropTypes.string,
  heading: PropTypes.string
};