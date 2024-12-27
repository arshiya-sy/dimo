import React, { useEffect } from 'react';
import FlexView from 'react-flexview';
import '../../../../styles/main.css';
import '../../../../styles/new_pix_style.css';
import "../../../../styles/genericFontStyles.css";
import "../../../../styles/colorSelect.css";
import PropTypes from 'prop-types';
import PageState from "../../../../Services/PageState";
import MetricsService from "../../../../Services/MetricsService";
import GeneralUtilities from '../../../../Services/GeneralUtilities';
import localeService from "../../../../Services/localeListService";
import Empty from "../../../../images/OnBoardingImages/Empty state.png";

var localeObj = {};
export default function NoInvoiceHistoryComponent(props) {
    let names ="";
    if (Object.keys(localeObj).length === 0) {
        localeObj = localeService.getActionLocale();
    }
    if(GeneralUtilities.emptyValueCheck(props.componentName)){
        names = "CREDIT CARD INVOICE HISTORY NO HISTORY";
      } else {
        names = props.componentName;
      }

    useEffect(() => {
        document.addEventListener("visibilitychange", visibilityChange);
        MetricsService.onPageTransitionStart(names);
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
        <FlexView column>
            <div style={{marginTop:"7.75rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center"}}>
                <span>
                    <img style={{ width: '6rem', height: "6rem" }} src={Empty} alt="" />
                </span>
            </div>
            <div className="body1 highEmphasis" style={{ marginTop: "1rem", textAlign: "center" }} >
                {props.msg}
  
            </div>
        </FlexView>
    )
}

NoInvoiceHistoryComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    msg: PropTypes.string.isRequired,
    componentName: PropTypes.string.isRequired,
  };