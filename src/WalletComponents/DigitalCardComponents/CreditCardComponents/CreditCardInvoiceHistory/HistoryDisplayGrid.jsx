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
import CircleIcon from '@mui/icons-material/Circle';
var localeObj = {};
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
    align: "right"
  },
  iconTarrif: {
    marginRight: "0.5rem"
  }

}));

export default function HistoryDisplayGrid(props) {
  const classes = useStyles();
  if (Object.keys(localeObj).length === 0) {
    localeObj = localeService.getActionLocale();
  }
  let names = "";
  if (GeneralUtilities.emptyValueCheck(props.componentName)) {
    names = "CREDIT CARD TRANSACTION HISTORY FILTER DISPLAY";
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

  const onSelect = (transactionDetails) => {
    MetricsService.onPageTransitionStop(names, PageState.close);
    props.onSelect(transactionDetails);
  }


  return (
    <div >
      <GridList cellHeight="auto" className={classes.gridList} cols={1}>
        {props.txn && props.txn.map((tile) => (
          <GridListTile key={tile.DateHeader} cols={1}>
            <ListSubheader className={classes.DateHeaderStyle} component="div"> {tile.DateHeader} </ListSubheader>
            {tile.transactions.map((item) => (
              <List key={item.date} style={{ width: "100%" }}>
                <ListItem onClick={() => onSelect(item)}>
                  <div style={{ display: (item.transaction === "C") ? 'block' : 'none', marginRight: "0.965rem", marginTop: "-1.25rem" }}>
                    <CircleIcon style={{ height: "0.75rem", width: "0.75rem", color: ColorPicker.transactionGreen }} />
                  </div>
                  <div style={{ display: (item.transaction === "D" && !item.isFailed) ? 'block' : 'none', marginRight: "0.965rem", marginTop: "-1.25rem" }}>
                    <CircleIcon style={{ height: "0.75rem", width: "0.75rem", color: ColorPicker.errorRed }} />
                  </div>
                  <FlexView column style={{ width: "100%", marginRight: "0rem" }}>
                    <div style={{ justifyContent: "space-between" }}>
                      <span className="body2" style={{ textAlign: "left", float: "left", width: "70%", color: ColorPicker.darkHighEmphasis, overflowWrap: "break-word" }}>{item.description}</span>
                      <span className="body2" style={{ textAlign: "right", float: "right", width: "30%", overflowWrap: "break-word", color: item.transaction === "D" ? ColorPicker.errorRed : ColorPicker.transactionGreen }}>{"R$ "}{GeneralUtilities.formatAmount(item.amount)}</span>
                    </div>
                    <div style={{ justifyContent: "space-between" }}>
                      <span className="caption" style={{ textAlign: "left", float: "left", width: "70%", color: ColorPicker.darkMediumEmphasis, overflowWrap: "break-word" }}>
                        {moment.utc(item.date).format("DD/MM/YYYY - HH:mm")}
                      </span>
                      <span className="caption" style={{ textAlign: "right", float: "right", width: "30%", color: ColorPicker.darkMediumEmphasis, overflowWrap: "break-word" }}>
                        {
                          (item.transactionDescription === "Compra a Vista" ? localeObj.in_cash : (item.isInstallment ? GeneralUtilities.formattedString(localeObj.in_installments, [item.currentInstallmentNo, item.noOfInstallments]) : ""))
                        }
                      </span>
                    </div>
                  </FlexView>
                  <IconButton className={classes.iconNotTarrif} edge="end"  >
                    <ArrowForwardIosIcon style={{ color: ColorPicker.white, display: 'block' }} fontSize="small" />
                  </IconButton>
                </ListItem>
              </List>
            ))}
          </GridListTile>
        ))}
      </GridList>
    </div>
  );
}

HistoryDisplayGrid.propTypes = {
  componentName: PropTypes.string,
  onSelect: PropTypes.func,
  txn: PropTypes.arrayOf(
    PropTypes.shape({
      DateHeader: PropTypes.string,
      transactions: PropTypes.arrayOf(
        PropTypes.shape({
          dueDate: PropTypes.string,
          amount: PropTypes.number,
          // Add more specific PropTypes if needed for transaction details
        })
      )
    })
  )
};