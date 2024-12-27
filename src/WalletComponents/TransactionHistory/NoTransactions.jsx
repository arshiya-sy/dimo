import React, { useEffect } from 'react';
import PropTypes from "prop-types";
import FlexView from 'react-flexview';
import '../../styles/main.css';
import '../../styles/new_pix_style.css';
import "../../styles/genericFontStyles.css";
import "../../styles/colorSelect.css";

import PageState from "../../Services/PageState";
import MetricsService from "../../Services/MetricsService";
import GeneralUtilities from '../../Services/GeneralUtilities';
import localeService from "../../Services/localeListService";
import emptyIcon from "../../images/DarkThemeImages/EmptyTransactionHistory_2x.png";
export default function NoTransactionComponent(props) {
  const localeObj = localeService.getActionLocale();
  let names = "";

  if (GeneralUtilities.emptyValueCheck(props.componentName)) {
    names = "TRANSACTION HISTORY NO TRANSACTIONS";
  } else {
    names = props.componentName;
  }

  useEffect(() => {
    MetricsService.onPageTransitionStart(names);
    document.addEventListener("visibilitychange", visibilityChange);
  }, []);

  const visibilityChange = () => {
    let visibilityState = document.visibilityState;
    if (visibilityState === "hidden") {
      MetricsService.onPageTransitionStop(names, PageState.recent);
    } else if (visibilityState === "visible") {
      MetricsService.onPageTransitionStart(names);
    }
  }

  return (
    <FlexView column style={{ overflowY: 'auto' }}>
      <div style={{ marginTop: "7.75rem", textAlign:"center" }}>
        <span>
          <img style={{ width: '6rem', height: "6rem" }} src={emptyIcon} alt="" />
        </span>
      </div>
      <div className="body1 highEmphasis" style={{ marginTop: "1rem", textAlign: "center" }} >
        {props.emptyTickets ? localeObj.no_tickets : props.filtermessage ? localeObj.no_transactions_ninetydays : localeObj.no_transactions_found}
      </div>
    </FlexView>
  )
}
NoTransactionComponent.propTypes = {
  componentName: PropTypes.string,
  emptyTickets: PropTypes.bool,
  filtermessage: PropTypes.string
}