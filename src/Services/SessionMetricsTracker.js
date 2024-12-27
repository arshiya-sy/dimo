import MetricsService from "./MetricsService";
import Log from "./Log";

class sessionMetricsTracker {
    sessionStartTime = new Date().getTime();
    prevSessionID = "";
    appLoadTime = new Date().getTime();
    appForegroundTime= 0;
    appBackgroundTime= 0;

    addForegroundTime (time) {
        this.appForegroundTime = parseInt(this.appForegroundTime) + parseInt(time);
    }

    addBackgroundTime (time) {
        this.appBackgroundTime = parseInt(this.appBackgroundTime) + parseInt(time);
    }

    setTimeTakenForLaunch () {
        this.appLoadTime = new Date().getTime();
        Log.sDebug("User notices first page at " + this.appLoadTime, "Metric Service");
    }

    setSessionStartTimers (){
        this.sessionStartTime = new Date().getTime();
    }

    createSessionId () {
        let sessionLocal = MetricsService.createSessionID();
        this.sessionID = sessionLocal
        MetricsService.setSessionData();
        return sessionLocal;
    }

    setPrevSessionId () {
        this.prevSessionID = this.sessionID;
    }

    setPrevSessionIdToEmpty () {
        this.prevSessionID = "";
    }
}

export default new sessionMetricsTracker();