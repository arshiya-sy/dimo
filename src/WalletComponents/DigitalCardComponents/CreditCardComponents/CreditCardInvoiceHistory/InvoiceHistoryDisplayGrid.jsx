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
import androidApiCallsService from '../../../../Services/androidApiCallsService';

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

export default function InvoiceHistoryDisplayGrid(props) {
  const classes = useStyles();
  const tz = androidApiCallsService.getLocale() === "en_US" ? "en" : "pt-br";
  moment.locale(tz);
  if (Object.keys(localeObj).length === 0) {
    localeObj = localeService.getActionLocale();
  }
  let names = "";
  if (GeneralUtilities.emptyValueCheck(props.componentName)) {
    names = "CREDIT CARD INVOICE HISTORY";
  } else {
    names = props.componentName;
  }

  useEffect(() => {
    const tz = androidApiCallsService.getLocale() === "en_US" ? "en" : "pt-br";
    moment.locale(tz);
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

  const onSelect = (transactionDetails, tile) => {
    MetricsService.onPageTransitionStop(names, PageState.close);
    props.onSelect(transactionDetails, tile);
  }
  // let showFutureInvoices = () => {
  //   props.showFutureInvoices();
  // }

  const getInvoiceDescriptionText = (invoiceStatus) => {
    let invoiceText = "";
    switch(invoiceStatus) {
      case "open" : invoiceText = localeObj.open_invoice; break;
      case "closed" : invoiceText = localeObj.closed_invoice; break;
      case "partial" : invoiceText = localeObj.partially_paid; break;
      case  "paid": invoiceText = localeObj.paid_invoice; break;
      case "installment": invoiceText = localeObj.installments; break;
      default : invoiceText = localeObj.closed_invoice; break;
    }
    return invoiceText;
  }

  const getInvoiceHistoryGridColor = (invoiceStatus) => {
    let histColor = ColorPicker.darkMediumEmphasis;
    switch(invoiceStatus) {
      case "open": histColor = ColorPicker.openInvoiceBlue; break;
      case "closed" : histColor = ColorPicker.errorRed; break;
      case "partial" : histColor = ColorPicker.transactionGreen; break;
      case "paid": histColor = ColorPicker.transactionGreen; break;
      case "installment": histColor = ColorPicker.transactionGreen; break;
      default : histColor = ColorPicker.errorRed; break;
    }
    return histColor;

  }

  

const finalHeight = window.screen.height;

  return (
    
    <div style={{ height: `${finalHeight * 0.8}px`, overflowY: "auto", overflowX: "hidden", margin: "0.5rem"}}>

      
     {/* <GridList cellHeight="auto" className={classes.gridList} cols={1}>
      <div style={{ justifyContent: "space-between", margin: "1rem"}} onClick={showFutureInvoices}>
        <span className="body2" style={{ textAlign: "left", float: "left", width: "50%", color:ColorPicker.accent }}>{localeObj.see_future_invoice}</span>
        <span className="body2" style={{ textAlign: "right", float: "right", width: "45%", display: 'block', color: ColorPicker.accent }}>
          {"R$ "}{"100,00"}
          <IconButton className = {classes.iconNotTarrif} edge="end"  >
            <ArrowForwardIosIcon style={{ color: ColorPicker.accent, display: 'block'}} fontSize = "small" />
          </IconButton>
          </span>
  </div>*/}
    <GridList cellHeight="auto" className={classes.gridList} cols={1}>
        {props.txn && props.txn.map((tile) => (
          <GridListTile key={tile.DateHeader} cols={1}>
            <ListSubheader className={classes.DateHeaderStyle} component="div"> {tile.DateHeader} </ListSubheader>
            {tile.transactions.map((item) => (
              <List key={moment(item.dueDate).format("MMMM")} style={{ width: "100%" }}>
                <ListItem onClick={() => onSelect(item,props.txn)}>
                  <FlexView column style={{ width: "100%", marginRight: "0rem" }}>
                    <div style={{ justifyContent: "space-between" }}>
                      <span className="body1" style={{ textAlign: "left", float: "left", width: "70%", color: ColorPicker.darkHighEmphasis, overflowWrap: "break-word" }}>{GeneralUtilities.captitalizeFirstLetter(moment(item.dueDate).format("MMMM"))}</span>
                    </div>
                    <div>
                    <div style={{ justifyContent: "space-between" }}>
                      <span className="body2" style={{ textAlign: "left", float: "left", width: "50%", color: getInvoiceHistoryGridColor(item.invoiceStatus), overflowWrap: "break-word" }}>{getInvoiceDescriptionText(item.invoiceStatus)}</span>
                      <span className="body2" style={{ textAlign: "right", float: "right", width: "45%", display: 'block', color: getInvoiceHistoryGridColor(item.invoiceStatus), overflowWrap: "break-word" }}>
                        {"R$ "}{GeneralUtilities.formatAmount(item.amount)}
                        <IconButton className = {classes.iconNotTarrif} edge="end"  >
                    <ArrowForwardIosIcon style={{ color: ColorPicker.accent, display: 'block'}} fontSize="small" />
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

InvoiceHistoryDisplayGrid.propTypes = {
  componentName: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
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