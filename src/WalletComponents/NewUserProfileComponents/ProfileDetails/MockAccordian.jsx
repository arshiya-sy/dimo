import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from '@material-ui/core/Button';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';

import "../../../styles/main.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";
import ColorPicker from "../../../Services/ColorPicker";
import PropTypes from "prop-types";

const useStyles = makeStyles(() => ({
  buttonStyle: {
    textTransform: 'none',
    marginLeft: "5%",
    marginRight: "5%",
    align: "center",
    background: ColorPicker.newProgressBar,
    color: ColorPicker.darkHighEmphasis,
    padding: "0.5rem",
    borderRadius: "0.75rem",
    width: "100%",
    border: "0px",
    fontWeight: 400,
    '&:hover': {
      backgroundColor: ColorPicker.newProgressBar,
      boxShadow: "none"
    },
    "& .MuiTouchRipple-root span": {
      backgroundColor: ColorPicker.newProgressBar,
      boxShadow: "none",
    },
  },
  accSum: {
    height: "4rem",
    marginBottom: -1,
    '&$expanded': {
      height: "7.5rem",
    },
  },
  MuiAccordionroot: {
    "&.MuiAccordion-root:before": {
      backgroundColor: "transparent",
    },
    MuiAccordianDetails: {
      "&.MuiAccordionDetails-root": {
        padding: "8 16 8 0"
      },
    }
  }

}));

MockAccordionComponent.propTypes = {
  primary: PropTypes.string,
  secondary: PropTypes.string,
  button1: PropTypes.string,
  button2: PropTypes.string
};
export default function MockAccordionComponent(props) {
  const classes = useStyles();

  return (
    <div >
      <Accordion elevation={0} classes={{ root: classes.MuiAccordionroot }} square expanded={true}>
        <AccordionSummary className={classes.accSum} expandIcon={<ExpandMoreIcon style={{ color: ColorPicker.accent }} />}>
          <List style={{ margin: "0 0.5rem" }}>
            <ListItemText align="left" className="body1 highEmphasis" primary={props.primary} secondary={props.secondary} />
          </List>
        </AccordionSummary>
        <AccordionDetails style={{ paddingTop: "0.5rem", paddingBottom: "0.25rem" }}>
          <Button className={classes.buttonStyle}>{props.button1}</Button>
        </AccordionDetails>
        <AccordionDetails style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
          {props.button2 && <Button className={classes.buttonStyle}>{props.button2}</Button>}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}