import React from "react";
import PropTypes from 'prop-types';

import { withStyles } from "@material-ui/core/styles";

import PageNames from "../../Services/PageNames";
import PageState from "../../Services/PageState";
import InputThemes from "../../Themes/inputThemes";
import MetricServices from "../../Services/MetricsService";
import localeService from "../../Services/localeListService";
import CommonFunctions from "../../Services/CommonFunctions";
import UnblockAccountInfoComponent from "./UnblockAccountInfoComponent";
import { ACCOUNT_STATUS_BLOCKED, ACCOUNT_STATUS_CLOSED, ACCOUNT_STATUS_INACTIVE, ACCOUNT_STATUS_PROGRESS } from "../../Services/UnblockAccount/UnblockAccountTerms";

let localeObj = {};
const styles = InputThemes.singleInputStyle;
const PageNameJSON = PageNames.UnblockAccountComponents;

class AccountStatusComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentState: props?.location?.accountStatus ?? ACCOUNT_STATUS_INACTIVE,
        };

        this.componentName = PageNameJSON.account_status_inactive;

        this.styles = {
        }

        MetricServices.onPageTransitionStart(this.componentName);

        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }

        this.setInitialComponentData();
    }

    componentDidMount = () => {
        CommonFunctions.addVisibilityEventListener(this.componentName);
    }

    componentWillUnmount() {
        CommonFunctions.removeVisibilityEventListener(this.componentName);
        MetricServices.onPageTransitionStop(this.componentName, PageState.close);
    }

    setInitialComponentData() {
        const { currentState } = this.state;

        switch(currentState) {
            case ACCOUNT_STATUS_PROGRESS: this.componentName = PageNameJSON.account_status_progress
                break;
            case ACCOUNT_STATUS_INACTIVE: this.componentName = PageNameJSON.account_status_inactive
                break;
            case ACCOUNT_STATUS_BLOCKED: this.componentName = PageNameJSON.account_status_blocked
                break;
            case ACCOUNT_STATUS_CLOSED: this.componentName = PageNameJSON.account_status_closed
                break;
            default:
                break;
        }
    }

    render() {
        const { currentState } = this.state;

        return (<UnblockAccountInfoComponent componentName={this.componentName} accountStatus={currentState} />);
    }
}

AccountStatusComponent.propTypes = {
    accountStatus: PropTypes.string,
    location: PropTypes.object
};

export default withStyles(styles)(AccountStatusComponent);