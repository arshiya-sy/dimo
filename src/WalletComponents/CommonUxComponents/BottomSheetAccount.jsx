import React from 'react';
import clsx from 'clsx';
import "../../styles/main.css";
import PropTypes from "prop-types";
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
import PageState from "../../Services/PageState";
import MetricsService from '../../Services/MetricsService';

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
    borderTopLeftRadius: "1.25rem",
    borderTopRightRadius: "1.25rem",
    backgroundColor: ColorPicker.newProgressBar
  }
});

const theme1 = InputThemes.SearchInputTheme;

export default function BottomSheetAccount(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({ bottom: true });
  let names = "BottomSheetAccount";
    if(props.componentName !== undefined &&
      props.componentName !== "" &&
      props.componentName !== null ){
        names = props.componentName;
    } else {
      names = "BOTTOM_SHEET_ACCOUNT"
    }

  const keySelected = (name, key) => {
    setState({ bottom:false });
    MetricsService.onPageTransitionStop(names, PageState.close);
    if(props.type === "card"){
      props.keySelected(name);
    } else {
      props.keySelected(key);
    }
  }

  const visibilityChange = () => {
    let visibilityState = document.visibilityState;
    if (visibilityState === "hidden") {
      MetricsService.onPageTransitionStop(names, PageState.recent);
    } else if (visibilityState === "visible") {
      MetricsService.onPageTransitionStart(names);
    }
}
 document.addEventListener("visibilitychange", visibilityChange);


  const list = (anchor, accountType, header) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'bottom',
      })}>
      <MuiThemeProvider theme={theme1}>
        <List>
          <div className="headline6 highEmphasis" style={{ margin: "1.5rem", textAlign: "center" }}>{header}</div>
          {accountType.map((keyVal) => (
            <ListItem button key={keyVal.name} onClick={() => keySelected(keyVal.name, keyVal.value)}>
              <ListItemText className="body2 highEmphasis" primary={keyVal.name} />
              <ArrowIcon style={{ fill: ColorPicker.accent, fontSize: "1rem" }} />
            </ListItem>
          ))}
        </List>
      </MuiThemeProvider>
    </div>
  );

  return (
      <Drawer classes={{ paper: classes.paper }}
        PaperProps={{ elevation: 0 }}
        anchor={"bottom"}
        open={state["bottom"]}
      >
        <div
          style={{
            margin: "0 1.5rem",
            marginBottom: "0.5rem" }}>
              {list("bottom", props.accountType, props.heading)}
        </div>
    </Drawer>
  );
}
BottomSheetAccount.propTypes = {
  classes: PropTypes.object,
  accountType: PropTypes.array,
  heading: PropTypes.string,
  keySelected: PropTypes.func,
  type: PropTypes.string,
  componentName: PropTypes.string
};