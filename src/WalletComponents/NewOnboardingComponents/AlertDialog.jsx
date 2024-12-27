import React from 'react';
import PropTypes from "prop-types";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import androidApiCallsService from '../../Services/androidApiCallsService';
import ColorPicker from "../../Services/ColorPicker";
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { MuiThemeProvider, createMuiTheme, withStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography";

const dialogTheme = createMuiTheme({
  overrides: {
    MuiDialogActions: {
      root: {
        margin: '0',
        justifyContent: 'space-between'
      }
    },
    MuiPaper: {
      rounded: {
        borderRadius: '20px !important'
      },
    },
    MuiDialog: {
      paper: {
        display: 'inline'
      }
    },
  }
});

const radioTheme = createMuiTheme({
  overrides: {
    MuiFormControlLabel: {
      label: {
        '&$checked': {
          color: ColorPicker.highEmphasis
        }
      }
    }
  }
});

const styles = {
  formControlLabel: {
    '&$checked': {
      color: ColorPicker.highEmphasis
    }
  }
}

class AlertDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: true,
      radioValue: "",
      noSelection: true,
    };
  }

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false });
    this.props.handleClose();
  };

  grantPermission = () => {
    this.handleClose();
    androidApiCallsService.openCamerPermissionSettings();
  }

  selectEmail = () => {
    this.props.onSelect(this.state.radioValue);
  }

  handleChange = (event) => {
    this.setState({
      noSelection: false,
      radioValue: event.target.value
    })
  }

  render() {
    const cancelButtonStyle = {
      color: ColorPicker.permissionColor
    };

    return (
      <div>
        <MuiThemeProvider theme={dialogTheme}>
          <Dialog
            open={this.state.open}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title" >
              <Typography variant="h6" align="left"> {this.props.title}</Typography>
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {this.props.description}
                {this.props.allowRadio &&

                  <RadioGroup value={this.state.value} onChange={this.handleChange}>
                    {this.props.choice && this.props.choice.map((choices, idx) =>
                      <MuiThemeProvider theme={radioTheme} key={idx}>
                        <FormControlLabel style={{ color: this.state.noSelection ? ColorPicker.disableBlack : ColorPicker.highEmphasis }} value={choices} control={<Radio />} label={choices} />
                      </MuiThemeProvider>
                    )
                    }
                  </RadioGroup>

                }
              </DialogContentText>
            </DialogContent>
            <DialogActions style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={this.handleClose} style={cancelButtonStyle}>
                {this.props.neagtiveBtn}
              </Button>
              <Button disabled={this.props.type && this.props.type === "emailAutoPopulate" && this.state.noSelection} onClick={this.props.type && this.props.type === "emailAutoPopulate" ? this.selectEmail : this.grantPermission} style={{ color: (this.props.type === "emailAutoPopulate" && this.state.noSelection) ? ColorPicker.white : ColorPicker.highEmphasis }}>
                {this.props.positiveBtn}
              </Button>
            </DialogActions>
          </Dialog>
        </MuiThemeProvider>
      </div>
    );
  }
}

AlertDialog.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  neagtiveBtn: PropTypes.string,
  positiveBtn: PropTypes.string,
  type: PropTypes.string,
  allowRadio: PropTypes.bool,
  onSelect: PropTypes.func,
  choice: PropTypes.object,
  handleClose: PropTypes.func
};

export default withStyles(styles)(AlertDialog);