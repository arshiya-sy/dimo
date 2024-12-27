import React, { useEffect } from 'react';
import clsx from 'clsx';
import moment from 'moment';
import FlexView from 'react-flexview'
import PropTypes from 'prop-types';

import "../../styles/main.css";
import "../../styles/colorSelect.css";
import "../../styles/genericFontStyles.css";
import ColorPicker from '../../Services/ColorPicker';
import InputThemes from "../../Themes/inputThemes";

import Drawer from '@material-ui/core/Drawer';
import MuiAlert from '@material-ui/lab/Alert';
import Slider from '@material-ui/core/Slider';
import Snackbar from '@material-ui/core/Snackbar';
import { MuiThemeProvider, makeStyles, withStyles } from "@material-ui/core/styles";

import PageState from '../../Services/PageState';
import constantObjects from "../../Services/Constants";
import MetricsService from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import GeneralUtilities from "../../Services/GeneralUtilities";

import PrimaryButtonComponent from "../CommonUxComponents/PrimaryButtonComponent";

const theme2 = InputThemes.snackBarTheme;
const RecurrenceSlider = withStyles({
  root: {
    color: ColorPicker.accent,
    height: 3.53,
  },
  thumb: {
    height: "1rem",
    width: "1rem",
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  track: {
    color: ColorPicker.accent,
    height: 3.53,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

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
  SliderStyle: {
    ".MuiSlider-root": {
      color: ColorPicker.accent,
    }
  },
  fullList: {
    width: 'auto',
  },
  paper: {
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    backgroundColor: ColorPicker.newProgressBar
  }
});
let localeObj = {};

export default function BottomSheetRecurrence(props) {
  const classes = useStyles();
  const [state] = React.useState({ bottom: true });
  const [month, setMonth] = React.useState(1);
  const [pinExpiredSnackBarOpen, closeSnackBar] = React.useState(false);
  const [message, setMessage] = React.useState("");

  let names = "BottomSheetRecurrence";
  if (props.componentName !== undefined || props.componentName !== "" || props.componentName !== null) {
    names = props.componentName;
  }

  useEffect(() => {
    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
    moment.locale(GeneralUtilities.getLocale());
    const visibilityChange = () => {
      let visibilityState = document.visibilityState;
      if (visibilityState === "hidden") {
        MetricsService.onPageTransitionStop(names, PageState.recent);
      } else if (visibilityState === "visible") {
        MetricsService.onPageTransitionStart(names);
      }
    }
    document.addEventListener("visibilitychange", visibilityChange);
  }, [names]);

  const noSliderChange = () => {
    //No action when snackbar is on.
  };

  const handleSliderChange = (event, newValue) => {
    setMonth(newValue);
  };

  const confirmRecurrence = () => {
    let finalDate = moment(moment().endOf('d')).add(12, 'M');
    let checkerDate = moment(props.selectedMonth).add(month - 1, 'M');
    if (moment(checkerDate).isAfter(finalDate)) {
      setMessage(localeObj.exceeds_max_schdeule_date);
      closeSnackBar(true);
    } else {
      let scheduleJSON = {
        "action": "repeat",
        "repeatTime": month
      }
      MetricsService.onPageTransitionStop(names, PageState.close);
      props.recurrenceTime(scheduleJSON);
    }
  }

  const close = () => {
    closeSnackBar(false)
  }

  const onCancel = () => {
    let scheduleJSON = {
      "action": "cancel",
      "repeatTime": 1
    }
    MetricsService.onPageTransitionStop(names, PageState.cancel);
    props.cancel(scheduleJSON);
  }

  const slider = (anchor, selectedMonth) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'bottom',
      })}>
      <div style={{ margin: "1.5rem" }}>
        <FlexView align="center" column style={{ marginTop: "0.5rem" }}>
          <div className="headline6 highEmphasis" style={{ textAlign: "center" }}>
            {localeObj.recurrent_schedule}
          </div>
          <div className="subtitle2 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
            {localeObj.repeat_schedule}
          </div>
          <div className="headline5 highEmphasis" style={{ textAlign: "center", marginTop: "1rem" }}>
            {month + " "} {month > 1 ? localeObj.month_plural : localeObj.month_singluar}
          </div>
        </FlexView>
      </div>
      <RecurrenceSlider
        value={typeof month === 'number' ? month : 1} marks={true} min={1} step={1} max={12}
        onChange={pinExpiredSnackBarOpen ? noSliderChange : handleSliderChange} />
      <div style={{ justifyContent: "space-between" }}>
        <span className="body2 highEmphasis" style={{ textAlign: "left", float: "left", width: "70%" }}>{"1 " + localeObj.month_singluar}</span>
        <span className="body2 highEmphasis" style={{ textAlign: "right", float: "right", width: "30%" }}>{"12 " + localeObj.month_plural}</span>
      </div>
      <div style={{ justifyContent: "space-between" }}>
        <span className="body2 mediumEmphasis" style={{ textAlign: "left", float: "left", width: "70%" }}>{moment(selectedMonth).format("MMMM") + " " + moment(selectedMonth).format("YYYY")}</span>
        <span className="body2 mediumEmphasis" style={{ textAlign: "right", float: "right", width: "30%" }}>{moment(selectedMonth).add(11, "M").format("MMMM") + " " + moment(selectedMonth).add(11, "M").format("YYYY")}</span>
      </div>
      <div style={{ width: "100%", marginTop: "4rem", display: "flex", flexWrap: "wrap", justifyContent: "space-around", }}>
        <PrimaryButtonComponent btn_text={localeObj.confirm} onCheck={() => confirmRecurrence()} />
        <div className="body2 highEmphasis" style={{ marginTop: "1rem", marginBottom: "1rem" }} onClick={onCancel}>
          {localeObj.cancel}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <Drawer classes={{ paper: classes.paper }}
        PaperProps={{ elevation: 0 }}
        anchor={"bottom"}
        open={state["bottom"]}
      >
        <div style={{ margin: "0 1.5rem", marginBottom: "0.5rem" }}>
          {slider("bottom", props.selectedMonth)}
        </div>
      </Drawer>
      <MuiThemeProvider theme={theme2}>
        <Snackbar open={pinExpiredSnackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={close}>
          <MuiAlert elevation={6} variant="filled" icon={false}>{message}</MuiAlert>
        </Snackbar>
      </MuiThemeProvider>
    </div>
  );
}

BottomSheetRecurrence.propTypes = {
  componentName: PropTypes.string,
  selectedMonth: PropTypes.string,
  recurrenceTime: PropTypes.func,
  cancel: PropTypes.func,
};