import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";

import Utils from '../EngageCardComponent/Utils';
import localeService from "../../Services/localeListService"
import elementActions from '../EngageCardComponent/elementActions';

import '../../styles/main.css';

var localeObj = {};

const styles = () => ({
  button: {
    margin: 0,
    padding: 0,
    width: '100%',
    height: '100%'
  },
  input: {
    display: 'none',
  },
});

class RectButton extends React.Component {
  constructor(props) {
    super(props);
    this.cardId = props.story.contentid;
    this.metadataId = props.metadata.id;
  }

  componentDidMount = () => {
    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
  }

  clickAction = () => {
    elementActions.performAction(this.props.metadata.action, this.props.metadata, this.props.story, "", this.props);
  }

  render() {
    const { classes } = this.props;
    let { metadata, style, story } = this.props;
    let data = metadata.data;
    let styleobj = Utils.parseStyle(style);
    //extract color and delete the background
    let bkgColor = Utils.extractRGB(styleobj.background);
    delete styleobj.background;

    if (story.id.indexOf('cards') === -1) {
      styleobj = Utils.getScaledStyle(styleobj, story);
    }
    let borderRad = '0px';
    //Temporary check for Play Button localisation in Games Layput
    if (data.label.toLowerCase() === "play") {
      data.label = localeObj.play;
    }
    if (data.rounded) {
      borderRad = '16px';
      if (data.roundRadius) {
        borderRad = data.roundRadius;
      }
    }
    if (data.localizableString) {
      data.label = localeObj[data.localizableString] || data.label;
    }
    let styles = {
      backgroundColor: bkgColor,
      fontSize: styleobj.fontSize,
      color: styleobj.color,
      fontWeight: styleobj.fontWeight,
      borderRadius: borderRad,
      textAlign: styleobj.textAlign,
      lineHeight: styleobj.lineHeight,
      padding: styleobj.padding,
      textTransform: styleobj.textTransform,
    };

    if (data.textPadding) {
      styles.padding = data.textPadding;
      delete styleobj.padding;
    }

    let buttonTextAlignVal = styleobj.textAlign;
    const theme1 = createMuiTheme({
      overrides: {
        MuiButton: {
          root : {
            textTransform: 'none'
          }
        },
        MuiButtonBase: {
          root: {
            alignItems: buttonTextAlignVal,
            justifyContent: buttonTextAlignVal,
            display: buttonTextAlignVal
          }
        },
      }
    });
    return (
      <div style={styleobj}>
        <MuiThemeProvider theme={theme1}>
          <Button onClick={(e) => this.clickAction(e)} variant="contained" style={styles} className={classes.button}>
            {data.label}
          </Button>
        </MuiThemeProvider>
      </div>
    );
  }
}

RectButton.propTypes = {
  story: PropTypes.object,
  style: PropTypes.string,
  metadata: PropTypes.object,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RectButton);
