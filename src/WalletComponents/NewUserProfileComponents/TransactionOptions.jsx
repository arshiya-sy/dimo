import React from "react";
import PropTypes from "prop-types";
import "../../styles/main.css";

import localeService from "../../Services/localeListService";
import androidApiCalls from "../../Services/androidApiCallsService";
import ColorPicker from "../../Services/ColorPicker";
import ArrowForwardIosIcon from "@material-ui/icons/ArrowForwardIos";
import { MuiThemeProvider } from "@material-ui/core/styles";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Log from "../../Services/Log";
import ButtonAppBar from "../CommonUxComponents/ButtonAppBarComponent";
import InputThemes from "../../Themes/inputThemes";
import FlexView from "react-flexview";

const styles = {
  iconStyle: {
    color: ColorPicker.accent,
    fontSize: "1rem",
  },
};

var localeObj = {};

class TransactionOptions extends React.Component {
  constructor(props){
    super(props);
    if (Object.keys(localeObj).length === 0) {
      localeObj = localeService.getActionLocale();
    }
  }
  componentDidMount() {
    androidApiCalls.enablePullToRefresh(false);
    document.addEventListener("visibilitychange", this.visibilityChange);

    window.onBackPressed = () => {
      this.props.history.replace({
        pathname: "/myAccount",
        transition: "right",
      });
    };
  }

  componentWillUnmount() {
    document.removeEventListener("visibilitychange", this.visibilityChange);
  }

  onSelectOption(type) {
    Log.sDebug("Type chosen " + type);
    switch (type) {
      case "voz":
      default:
        this.props.history.replace("/dimoVoz");
        break;
    }
  }

  render() {
    const onBack = () => {
      this.props.history.replace({
        pathname: "/myAccount",
        transition: "right",
      });
    };

    const transactionOptions = [
      {
        primary: localeObj.dimo_voz,
        action: "voz",
      },
    ];

    return (
      <div>
        <ButtonAppBar
          header={localeObj.transaction_options}
          onBack={onBack}
          action="none"
        />
        <FlexView column align="left" style={{ margin: "1.5rem" }}>
          <MuiThemeProvider theme={InputThemes.SearchInputTheme}>
            <List>
              {transactionOptions.map((opt, key) => (
                <ListItem key={key}
                  disablePadding={true}
                  align="left"
                  onClick={() => this.onSelectOption(opt.action)}
                >
                  <ListItemText
                    align="left"
                    className="body1 highEmphasis"
                    primary={opt.primary}
                  />
                  <span style={{ marginRight: "2%" }}>
                    <ArrowForwardIosIcon style={styles.iconStyle} />
                  </span>
                </ListItem>
              ))}
            </List>
          </MuiThemeProvider>
        </FlexView>
      </div>
    );
  }
}

TransactionOptions.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  classes: PropTypes.object.isRequired,
};

export default TransactionOptions;
