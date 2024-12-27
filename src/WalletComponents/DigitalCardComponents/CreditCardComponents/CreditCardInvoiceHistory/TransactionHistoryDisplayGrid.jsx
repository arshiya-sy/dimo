import moment from 'moment';
import FlexView from "react-flexview";
import React from 'react';

import PropTypes from 'prop-types';
import "../../../../styles/colorSelect.css";
import "../../../../styles/new_pix_style.css";
import "../../../../styles/genericFontStyles.css";

import List from '@material-ui/core/List';
import GridList from '@material-ui/core/GridList';
import ListItem from '@material-ui/core/ListItem';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';

import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

import ColorPicker from '../../../../Services/ColorPicker';
import localeService from "../../../../Services/localeListService";
import GeneralUtilities from '../../../../Services/GeneralUtilities';
import CircleIcon from '@mui/icons-material/Circle';

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

  iconNotTarrif: {
    align: "right"
  },
  iconTarrif: {
    marginRight: "0.5rem"
  }

}));

var localeObj = {};
export default function TransactionHistoryDisplayGrid(props) {
  const classes = useStyles();
  if (Object.keys(localeObj).length === 0) {
    localeObj = localeService.getActionLocale();
  }
  const onSelectTransaction = (transactionDetails) => {
    props.onSelectTransaction(transactionDetails);
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

  return (
    <div style={{ marginLeft: "0.25rem", marginTop: "1.5rem" }}>
      <GridList cellHeight="auto" className={classes.gridList} cols={1}>
        {props.txn && props.txn.map((item) => (
          <List key={item.transaction} style={{ width: "100%" }}>
            <ListItem onClick={() => onSelectTransaction(item)}>
              <div style={{ display: (item.transaction === "C") ? 'block' : 'none', marginRight: "0.965rem", marginTop: "-1.25rem" }}>
                <CircleIcon style={{ height: "0.75rem", width: "0.75rem", color: ColorPicker.transactionGreen }} />
              </div>
              <div style={{ display: (item.transaction === "D" && !item.isFailed) ? 'block' : 'none', marginRight: "0.965rem", marginTop: "-1.25rem" }}>
                <CircleIcon style={{ height: "0.75rem", width: "0.75rem", color: ColorPicker.errorRed }} />
              </div>

              <FlexView column style={{ width: "100%", marginRight: "0rem" }}>
                <div style={{ justifyContent: "space-between" }}>
                  <span className="body2" style={{ textAlign: "left", float: "left", width: "70%", color: ColorPicker.darkHighEmphasis, overflowWrap: "break-word" }}>{item.description}</span>
                  <span className="body2" style={{ textAlign: "right", float: "right", width: "30%", color: item.transaction === "D" ? ColorPicker.errorRed : ColorPicker.transactionGreen, overflowWrap: "break-word" }}>{"R$ "}{formatAmount(item.amount, item.formatted_amount, item.decimal)}</span>
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
      </GridList>
    </div>
  );
}

TransactionHistoryDisplayGrid.propTypes = {
  txn: PropTypes.arrayOf(PropTypes.shape({
    transaction: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    formatted_amount: PropTypes.string.isRequired,
    decimal: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    transactionDescription: PropTypes.string.isRequired,
    isInstallment: PropTypes.bool.isRequired,
    currentInstallmentNo: PropTypes.number,
    noOfInstallments: PropTypes.number,
    isFailed: PropTypes.bool.isRequired,
  })).isRequired,
  onSelectTransaction: PropTypes.func.isRequired,
};
