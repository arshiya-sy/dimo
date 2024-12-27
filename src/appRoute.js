import React from 'react';
import PropTypes from "prop-types";

import './App.css';
import Log from './Services/Log';
import { Redirect, Route } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import MetricsService from './Services/MetricsService';
import walletJwtService from './Services/walletJwtService';
import androidApiCalls from "./Services/androidApiCallsService";
import { AuthStateContext } from "./ContextProviders/AuthProvider";
import NoInternetComponent from './WalletComponents/CommonUxComponents/NoInternetComponent';

import GeneralUtilities from "./Services/GeneralUtilities";
import ImportantDetails from './WalletComponents/NewLaunchComponents/ImportantDetails';
import DataSyncBackendUtils from './Services/DataSyncBackendUtils';
import CustomizedProgressBars from './WalletComponents/CommonUxComponents/ProgressComponent';

class AppRoute extends React.Component {
    static contextType = AuthStateContext;
    
    state = {
        online: true,
        deeplink: false,
    }
    componentDidMount() {
        const { auth, updateAuth } = this.context;
        window.onStop = () => {
            Log.sDebug("Session Data stored - APP moved to recents","Session Metrics")
            MetricsService.saveSessionData();
        }

        window.getDataSyncProperties = () => {
            DataSyncBackendUtils.getDataSyncProperties();

        }
        window.listTokensDataSyncBackground = (response) =>    {
            Log.sDebug("listTokens response: " + response);
            let resArray = response.split("/");
            DataSyncBackendUtils.getCardDetails(resArray);
        }              
                
        window.onResume = () => {
            const hasNotificationDialog = GeneralUtilities.checkForNotificationDialog();
            if (!ImportantDetails.shareEnabled) {
                if (new Date().getTime() - ImportantDetails.pauseStartTime >= 5 * 60 * 1000) {
                    const { path } = this.props;
                    ImportantDetails.walletBalance = "";
                    ImportantDetails.walletDecimal = "";
                    ImportantDetails.pauseStartTime = 0;
                    ImportantDetails.fromRegisterPixKey = false;
                    ImportantDetails.balanceFetched = false;
                    this.pixKeysResponse = {};
                    MetricsService.reportPageReloginEventMetrics(path);
                    updateAuth(false, true);
                } else {
                    walletJwtService.setAuthorization();
                    ImportantDetails.pauseStartTime = 0;
                    const qrCode = androidApiCalls.getMotopayQRCode();
                    const deepLinkInfo = androidApiCalls.getMotopayDeepLinkUrl();
                    if ((qrCode !== "" && qrCode !== undefined) || (deepLinkInfo !== "" && deepLinkInfo !== undefined) || hasNotificationDialog) {
                        this.setState({deeplink: true})
                    } else {
                        this.setState({deeplink: false})
                    }
                }
            }
        }

        window.onPause = () => {
            ImportantDetails.setPauseTimers();
            Log.sDebug("AuthContext: " + auth);
        }

        window.addEventListener('offline', this.handleNetwork);
        window.addEventListener('online', this.handleNetwork);
    }

    handleNetwork = () => {
        console.log("Changes : " + window.navigator.onLine);
        this.setState({
            online: window.navigator.onLine
        })
    }

    render() {
        const { component: Component, path, isPrivate, ...rest } = this.props;
        let redirectPath = path;
        let prevState = this.props.location.state ? this.props.location.state : undefined
        const { auth } = this.context;

        return (
            <Route
                path={path}
                render={props =>
                    isPrivate && !auth ? (
                        <Redirect to={{
                            pathname: "/newLogin",
                            state: { followTo: redirectPath, followState: prevState, relogin: true }
                        }} />
                    ) : this.state.deeplink ?
                        (
                            <Redirect to={{
                                pathname: "/newLogin",
                                state: { followTo: redirectPath, followState: prevState, auth: auth, deeplink: this.state.deeplink }
                            }} />
                        ) : (!(navigator.onLine)) ?
                            (
                                <CSSTransition mountOnEnter={true} unmountOnExit={true} in={!(navigator.onLine) ? true : false} timeout={300} classNames="pageSliderLeft">
                                    <div style={{ display: (!(navigator.onLine) ? 'block' : 'none') }}>
                                        {!(navigator.onLine) && <NoInternetComponent onCheck={this.handleNetwork} />}
                                    </div>
                                </CSSTransition>
                            ) : (
                                <div>
                                    <div style={{ display: ((this.state.online) ? 'block' : 'none') }}>
                                        {
                                            this.state.online
                                            && <React.Suspense fallback={<CustomizedProgressBars />}>
                                                <Component {...props} />
                                            </React.Suspense>
                                        }
                                    </div>
                                    <div style={{ display: (!(this.state.online) ? 'block' : 'none') }}>
                                        <CSSTransition mountOnEnter={true} unmountOnExit={true} in={(!(this.state.online)) ? true : false} timeout={300} classNames="pageSliderLeft">
                                            <div style={{ display: (!(this.state.online) ? 'block' : 'none') }}>
                                                {!(this.state.online) && <NoInternetComponent onCheck={this.handleNetwork} />}
                                            </div>
                                        </CSSTransition>
                                    </div>
                                </div>
                            )
                }
                {...rest}
            />
        )
    }
}

AppRoute.propTypes = {
    location: PropTypes.object,
    component: PropTypes.string,
    path: PropTypes.string,
    isPrivate: PropTypes.bool
};

export default AppRoute;
