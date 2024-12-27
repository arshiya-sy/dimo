import moment from 'moment';
import FlexView from "react-flexview";
import React from 'react';
import PropTypes from "prop-types";

import "../../styles/colorSelect.css";
import "../../styles/new_pix_style.css";
import "../../styles/genericFontStyles.css";

import List from '@material-ui/core/List';
import GridList from '@material-ui/core/GridList';
import ListItem from '@material-ui/core/ListItem';
import CircleIcon from '@mui/icons-material/Circle';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import GridListTile from '@material-ui/core/GridListTile';
import MetricsService from "../../Services/MetricsService";
import ListSubheader from '@material-ui/core/ListSubheader';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';

import PageState from "../../Services/PageState";
import InputThemes from '../../Themes/inputThemes';
import ColorPicker from '../../Services/ColorPicker';
import localeService from "../../Services/localeListService";
import GeneralUtilities from '../../Services/GeneralUtilities';
import SecondaryButtonComponent from '../CommonUxComponents/SecondaryButtonComponent';

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
    textAlign: "right"
  },
  iconTarrif: {
    marginRight: "0.5rem"
  }

}));

DisplayGrid.propTypes = {
  componentName: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  getNextPage: PropTypes.func,
  getPreviousPage: PropTypes.func,
  showPagination: PropTypes.bool,
  currentPage: PropTypes.number,
  pageData: PropTypes.object,
  txn: PropTypes.array
}
export default function DisplayGrid(props) {
  const classes = useStyles();
  if (Object.keys(localeObj).length === 0) {
    localeObj = localeService.getActionLocale();
  }
  let names = "";
  if (GeneralUtilities.emptyValueCheck(props.componentName)) {
    names = "TRANSACTION HISTORY FILTER DISPLAY";
  } else {
    names = props.componentName;
  }

  const onSelect = (transactionDetails) => {
    MetricsService.onPageTransitionStop(names, PageState.close);
    props.onSelect(transactionDetails);
  }

  const formatAmount = (amount, formatted, decimalSent) => {
    let full = "00";
    let decimal = "00";
    if (GeneralUtilities.emptyValueCheck(amount)) {
      full = formatted;
      decimal = decimalSent;
    } else {
      let amountInfo = amount.toString().split(".");
      full = amountInfo[0];
      decimal = amountInfo[1];
    }
    if (decimal) {
      switch (decimal.length) {
        case 0:
          decimal = "00";
          break;
        case 1:
          decimal = decimal + "0";
          break;
        default:
          decimal = decimal.substring(0, 2);
          break;
      }
    } else {
      decimal = "00";
    }

    if (full && full.length >= 4) {
      let newfull = "";
      let count = 0;
      let full_length = full.length;
      for (let i = full_length - 1; i >= 0; i--) {
        if (count === 3) {
          newfull = '.' + newfull;
          count = 0;
        }
        newfull = full[i] + newfull;
        count = count + 1;
      }
      full = newfull;
    }

    return full + "," + decimal;
  }

  const getNextPage = () => {
    props.getNextPage();
  }

  const getPreviousPage = () => {
    props.getPreviousPage();
  }

  const getTransactionNumberList = () => {
    if (props.showPagination && props.currentPage > 0) {
      let currentPageIndex = parseInt(props.currentPage) - 1;
      let trasactionBegin = (currentPageIndex * props.pageData.transactionsPerPage) + 1;
      let transactionEnd = props.currentPage * props.pageData.transactionsPerPage;
      if (props.pageData.totalTransactions <= props.pageData.transactionsPerPage || props.currentPage === props.pageData.maxPageNumber) {
        return [trasactionBegin.toString(), props.pageData.totalTransactions.toString(), props.pageData.totalTransactions.toString()];
      } else {
        return [trasactionBegin.toString(), transactionEnd.toString(), props.pageData.totalTransactions.toString()];
      }
    }
  }

  return (
    <div >
      <GridList cellHeight="auto" className={classes.gridList} cols={1}>
        {props.txn && props.txn.map((tile) => (
          <GridListTile key={tile.DateHeader} cols={1}>
            <ListSubheader className={classes.DateHeaderStyle} component="div"> {tile.DateHeader} </ListSubheader>
            {tile.transactions.map((item, index) => (
              <List key={index} style={{ width: "100%" }}>
                <ListItem onClick={() => onSelect(item)}>
                  <div style={{ display: (item.transaction === "C" || item.transaction === "B") ? 'block' : 'none', marginRight: "0.965rem", marginTop: "-1.25rem" }}>
                    <CircleIcon style={{ height: "0.75rem", width: "0.75rem", color: ColorPicker.transactionGreen }} />
                  </div>
                  <div style={{ display: (item.transaction === "D" && item.isFailed) ? 'block' : 'none', marginRight: "0.8rem", marginTop: "-1.25rem" }}>
                    <ErrorOutlineOutlinedIcon fontSize="small" style={{ color: ColorPicker.errorRed }} />
                  </div>
                  <div style={{ display: (item.transaction === "D" && !item.isFailed) ? 'block' : 'none', marginRight: "0.965rem", marginTop: "-1.25rem" }}>
                    <CircleIcon style={{ height: "0.75rem", width: "0.75rem", color: ColorPicker.errorRed }} />
                  </div>
                  <div style={{ display: (item.transaction === "E") ? 'block' : 'none', marginRight: "0.965rem", marginTop: "-1.25rem" }}>
                    <CircleIcon style={{ height: "0.75rem", width: "0.75rem", color: ColorPicker.errorRed }} />
                  </div>
                  <FlexView column style={{ width: "100%", marginRight: "0rem" }}>
                    <div style={{ justifyContent: "space-between" }}>
                      <span className="caption" style={{ textAlign: "left", float: "left", width: "70%", color: ColorPicker.darkMediumEmphasis }}>{item.description}</span>
                      <span className="caption" style={{ textAlign: "right", float: "right", width: "30%", color: ColorPicker.darkMediumEmphasis }}>{moment(item.date).format("DD/MM/YYYY")}</span>
                    </div>
                    <div style={{ justifyContent: "space-between" }}>
                      <span className="body2" style={{ textAlign: "left", float: "left", width: "70%", color: ColorPicker.darkHighEmphasis, overflowWrap: "break-word" }}>{item.nameOfParty}</span>
                      <span className="body2" style={{ textAlign: "right", float: "right", width: "30%", display: (item.transaction === "D") ? 'block' : 'none', color: ColorPicker.amountTxnRed }}>{"- R$ "}{formatAmount(item.amount, item.formatted_amount, item.decimal)}</span>
                      <span className="body2" style={{ textAlign: "right", float: "right", width: "30%", display: (item.transaction === "C" || item.transaction === "B") ? 'block' : 'none', color: ColorPicker.transactionGreen }}>{"R$ "}{formatAmount(item.amount, item.formatted_amount, item.decimal)}</span>
                      <span className="body2" style={{ textAlign: "right", float: "right", width: "30%", display: (item.transaction === "E") ? 'block' : 'none', color: ColorPicker.errorRed }}>{"R$ "}{formatAmount(item.amount, item.formatted_amount, item.decimal)}</span>
                    </div>
                  </FlexView>
                  <IconButton className={(item.isTarrif && item.isFailed) || ((!item.hasReceipt && item.transaction !== "C")) ? classes.iconTarrif : classes.iconNotTarrif} edge="end"  >
                    <ArrowForwardIosIcon style={{ color: ColorPicker.white, display: (!item.isTarrif && !item.isFailed && (item.hasReceipt || item.transaction === "C")) ? 'block' : 'none' }} fontSize="small" />
                  </IconButton>
                </ListItem>
              </List>
            ))}
          </GridListTile>
        ))}
      </GridList>
      <div style={{ ...InputThemes.bottomButtonStyle, display: (props.showPagination) ? "block" : "none" }}>
        <FlexView column align="center">
          <div className="caption highEmphasis" style={{ textAlign: "center", marginTop: "1rem", width: "90%", display: (props.showPagination) ? "block" : "none" }}>
            {GeneralUtilities.formattedString(localeObj.pagination_total_transactions_message, getTransactionNumberList())}
          </div>
          {props.showPagination && props.currentPage < props.pageData.maxPageNumber && props.pageData.maxPageNumber !== 1 &&
            <SecondaryButtonComponent btn_text={localeObj.pagination_next_page} onCheck={getNextPage} style={{ textAlign: "center" }} />
          }
          <div className="body2 highEmphasis" style={{ display: (props.showPagination && props.currentPage > 1) ? "block" : "none", textAlign: "center", marginTop: "1rem", marginLeft: "1rem", marginRight: "1rem", width: "85%" }} onClick={getPreviousPage}>
            {localeObj.pagination_previous_page}
          </div>
        </FlexView>
      </div>
    </div>
  );
}