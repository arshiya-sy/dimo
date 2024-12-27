import React from 'react';
import FlexView from "react-flexview";
import PropTypes from "prop-types";
import "../../../styles/main.css";
import "../../../styles/new_pix_style.css";
import "../../../styles/genericFontStyles.css";
import "../../../styles/colorSelect.css";

import ColorPicker from '../../../Services/ColorPicker';
import localeService from "../../../Services/localeListService";

import Table from '@material-ui/core/Table';
import Paper from '@material-ui/core/Paper';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableContainer from '@material-ui/core/TableContainer';
import { withStyles, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  table: {
    borderBottom: "none"
  },
});

const StyledTableCell = withStyles(() => ({
  root: {
    borderBottom: "none",
    width: "50%"
  },
  head: {
    backgroundColor: ColorPicker.tableBackground,
    color: ColorPicker.darkHighEmphasis
  },
  body: {
    color: ColorPicker.darkHighEmphasis
  }
}))(TableCell);

const StyledTableCell2ndCol = withStyles(() => ({
  root: {
    borderBottom: "none",
    paddingTop: "0.25rem",
    paddingBottom: "0.25rem",
    paddingLeft: "0.5rem",
    paddingRight: "0rem",
    width: "80%"
  },
  head: {
    backgroundColor: ColorPicker.tableBackground,
    color: ColorPicker.darkHighEmphasis
  },
  body: {
    color: ColorPicker.darkHighEmphasis
  }
}))(TableCell);


const StyledTableCellHeader = withStyles(() => ({
  root: {
    borderBottom: "none",
    paddingTop: "0.25rem",
    paddingBottom: "0.25rem",
    paddingLeft:"0.5rem",
    paddingRight:"0.5rem",
    width: "80%"
  },
  head: {
    backgroundColor: ColorPicker.tableBackground,
    color: ColorPicker.darkHighEmphasis
  },
  body: {
    color: ColorPicker.darkHighEmphasis
  }
}))(TableCell);

const StyledTableRow = withStyles(() => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: ColorPicker.highEmphasis,
    },
    '&:nth-of-type(even)': {
      backgroundColor: ColorPicker.tableBackground,
    },
    color: ColorPicker.darkHighEmphasis,
    borderBottom: "none"
  },
}))(TableRow);

var localeObj = {};

export default function FgtsInstallmentTable(props) {
  if (Object.keys(localeObj).length === 0) {
    localeObj = localeService.getActionLocale();
}
  const classes = useStyles();

  return (
    <FlexView column style={{ margin: "0.5rem 0.5rem" }}>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="customized table">
          <TableHead>
            <TableRow className="subtitle3 highEmphasis">
              <StyledTableCell align="left" >{localeObj.fgts_simulate_loan_year}</StyledTableCell>
              <StyledTableCellHeader align="right" colSpan="2">{localeObj.fgts_simulate_loan_intstallment}</StyledTableCellHeader>
            </TableRow>
          </TableHead>
          <TableBody className='body2 highEmphasis'>
            {props.installmentValues.map((row) => (
              <StyledTableRow key={row.year}>
                <StyledTableCell align="left" component="th" scope="row" >{row.year}</StyledTableCell>
                {/* <StyledTableCell2ndCol padding="none" align="right" className='body2 highEmphasis' >{"R$ "}</StyledTableCell2ndCol> */}
                <StyledTableCell align="right" className='body2 highEmphasis' >{"R$ "}{row.value}</StyledTableCell>
              </StyledTableRow>
            ))}
            <StyledTableRow>
                <StyledTableCell align="left" component="th" scope="row" >{localeObj.fgts_total}</StyledTableCell>
                {/* <StyledTableCell2ndCol padding="none" align="right" className='body2 highEmphasis' >{"R$ "}</StyledTableCell2ndCol> */}
                <StyledTableCell align="right" className='body2 highEmphasis' >{"R$ "}{props.totalReceivable}</StyledTableCell>
              </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </FlexView>
  )
}

FgtsInstallmentTable.propTypes = {
  installmentValues: PropTypes.array
};