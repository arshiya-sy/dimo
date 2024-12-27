import moment from 'moment';
import FlexView from "react-flexview";
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import "../../../../styles/colorSelect.css";
import "../../../../styles/new_pix_style.css";
import "../../../../styles/genericFontStyles.css";

import List from '@material-ui/core/List';
import GridList from '@material-ui/core/GridList';
import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import GridListTile from '@material-ui/core/GridListTile';
import MetricsService from "../../../../Services/MetricsService";
import ListSubheader from '@material-ui/core/ListSubheader';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import PageState from "../../../../Services/PageState";
import ColorPicker from '../../../../Services/ColorPicker';
import localeService from "../../../../Services/localeListService";
import GeneralUtilities from '../../../../Services/GeneralUtilities';

const useStyles = makeStyles(() => ({
  grid: {
    display: 'flex',
    justifyContent: 'space-between',
    width: "100%",
    direction: "column",
    flexWrap: 'wrap',
  },
  gridList: {
    width: "100%",
    height: "100%",
  },
  DateHeaderStyle: {
    fontSize: "0.875rem",
    lineHeight: "1.33rem",
    fontWeight: 500,
    letterSpacing: "0.35px",
    color: ColorPicker.darkHighEmphasis,
    textAlign: "left",
    float: "left",
    marginTop: "3%",
    marginBottom: "2%"
  },
  iconNotTarrif: {
    align: "right",
    height: "8px"
  },
  iconTarrif: {
    marginRight: "0.5rem"
  }

}));

var localeObj = {};
export default function FutureInvoiceDisplayGrid(props) {
  const classes = useStyles();
  if (Object.keys(localeObj).length === 0) {
    localeObj = localeService.getActionLocale();
  }
  let names = "";
  if (GeneralUtilities.emptyValueCheck(props.componentName)) {
    names = "CREDIT CARD FUTURE INVOICE";
  } else {
    names = props.componentName;
  }

  useEffect(() => {
    document.addEventListener("visibilitychange", visibilityChange);
    MetricsService.onPageTransitionStart(names);
  }, [names]);

  const visibilityChange = () => {
    let visibilityState = document.visibilityState;
    if (visibilityState === "hidden") {
      MetricsService.onPageTransitionStop(names, PageState.recent);
    } else if (visibilityState === "visible") {
      MetricsService.onPageTransitionStart(names);
    }
  }

  const onSelectFutureInvoice = (transactionDetails, tile) => {
    MetricsService.onPageTransitionStop(names, PageState.close);
    props.onSelectFutureInvoice(transactionDetails, tile);
  }

  const capitalize = (s) => {
    return s && s[0].toUpperCase() + s.slice(1);
  }


  const finalHeight = window.screen.height;

  return (
    <div style={{ height: `${finalHeight * 0.8}px`, overflowY: "auto", overflowX: "hidden", margin: "0.5rem" }}>
      <GridList cellHeight="auto" className={classes.gridList} cols={1}>
        {props.txn && props.txn.map((tile) => (
          <GridListTile key={tile.DateHeader} cols={1}>
            <ListSubheader className={classes.DateHeaderStyle} component="div"> {tile.DateHeader} </ListSubheader>
            {tile.transactions.map((item) => (
              <List key={item.amount} style={{ width: "100%" }}>
                <ListItem onClick={() => onSelectFutureInvoice(item, tile)}>
                  <FlexView column style={{ width: "100%", marginRight: "0rem" }}>
                    <div style={{ justifyContent: "space-between" }}>
                      <span className="body1" style={{ textAlign: "left", float: "left", width: "70%", color: ColorPicker.darkHighEmphasis, overflowWrap: "break-word" }}>{capitalize(moment(item.dueDate).format("MMMM"))}</span>
                    </div>
                    <div>
                      <div style={{ justifyContent: "space-between" }}>
                        <span className="body2" style={{ textAlign: "left", float: "left", width: "50%", color: ColorPicker.accent, overflowWrap: "break-word" }}>{localeObj.future_invoice}</span>
                        <span className="body2" style={{ textAlign: "right", float: "right", width: "45%", display: 'block', color: ColorPicker.accent, overflowWrap: "break-word" }}>
                          {"R$ "}{GeneralUtilities.formatAmount(item.amount)}
                          <IconButton className={classes.iconNotTarrif} edge="end"  >
                            <ArrowForwardIosIcon style={{ color: ColorPicker.accent, display: 'block' }} fontSize="small" />
                          </IconButton>
                        </span>
                      </div>
                    </div>
                  </FlexView>

                </ListItem>
              </List>
            ))}
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

FutureInvoiceDisplayGrid.propTypes = {
  componentName: PropTypes.string,
  onSelectFutureInvoice: PropTypes.func.isRequired,
  txn: PropTypes.arrayOf(
    PropTypes.shape({
      DateHeader: PropTypes.string.isRequired,
      transactions: PropTypes.arrayOf(
        PropTypes.shape({
          dueDate: PropTypes.string.isRequired,
          amount: PropTypes.number.isRequired,
          // Add more specific PropTypes if needed for transaction details
        })
      )
    })
  )
};