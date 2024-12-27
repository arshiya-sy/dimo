import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core";
import CircleCheckedFilled from '@material-ui/icons/CheckCircle';
import ColorPicker from "../../Services/ColorPicker";

const useStyles = makeStyles(theme => ({
  dividerContainer: {
    display: "flex",
    alignItems: "center"
  },
  border: {
    borderBottom: "2px solid" + ColorPicker.darkDisabled,
    width: "100%"
  },
  scrollBroder:{
    borderBottom: "3px solid" + ColorPicker.accent,
    width: "100%"
  },
  content: {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    fontWeight: 500,
    fontSize: 22,
  }
}));

export default function IconDivider(props) {
  const classes = useStyles();
  return (
    <div className={classes.dividerContainer}>
      <div className={props.divScrolled ? classes.scrollBroder : classes.border} />
      <span className={classes.content}>
        <CircleCheckedFilled style={{ fill: props.divScrolled ? ColorPicker.accent : ColorPicker.darkDisabled }} />
      </span>
      <div className={props.divScrolled ? classes.scrollBroder : classes.border} />
    </div>

  );
}

IconDivider.propTypes = {
  classes: PropTypes.object,
  divScrolled: PropTypes.bool
};