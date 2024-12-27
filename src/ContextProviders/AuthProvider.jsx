import React from 'react';
import Log from '../Services/Log';
import constantObjects from '../Services/Constants';
import MetricsService from '../Services/MetricsService';
import GeneralUtilities from '../Services/GeneralUtilities';
import androidApiCalls from "../Services/androidApiCallsService";
import SessionMetricsTracker from '../Services/SessionMetricsTracker';
import PropTypes from "prop-types";

export const AuthStateContext = React.createContext();

export class AuthProvider extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            auth : false,
        };
        this.backgroundStartTime = "";
    }
    updateAuth = (auth, sendMetrics) => {
        if(!auth && sendMetrics) {
            MetricsService.reportSessionMetrics(true);
        }
        this.setState({ auth });
    }

    componentWillUnmount() {
        document.removeEventListener('beforeunload', this.beforeunload);
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            androidApiCalls.setDAStringPrefs("sessionActiveStatus", false);
            this.backgroundStartTime = new Date().getTime();
            SessionMetricsTracker.addForegroundTime(new Date().getTime() - this.foregroundStartTime);
        } else if (visibilityState === "visible") {
            androidApiCalls.setDAStringPrefs("sessionActiveStatus", true);
            SessionMetricsTracker.addBackgroundTime(new Date().getTime() - this.backgroundStartTime)
            this.foregroundStartTime = new Date().getTime();
        }
    }

    beforeunload = function() {
        SessionMetricsTracker.addForegroundTime(new Date().getTime() - this.foregroundStartTime);
        Log.sDebug("APP UNMOUNTS", "AUTH PROVIDER");
    };

    componentDidMount() {
        this.foregroundStartTime = GeneralUtilities.emptyValueCheck(SessionMetricsTracker.sessionStartTime) ? new Date().getTime() : SessionMetricsTracker.sessionStartTime;
        androidApiCalls.setDimoLoggingDefaults(JSON.stringify(constantObjects.loggerDefaultJSON));
        window.addEventListener('beforeunload', this.beforeunload);
        document.addEventListener("visibilitychange", this.visibilityChange);
    }

    render(){
        const { children } = this.props
        const { auth } = this.state
        const {updateAuth } = this
        return (
            <AuthStateContext.Provider value={{
                auth,
                updateAuth
            }}>
             {children}
            </AuthStateContext.Provider>
        );
    }
}
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};