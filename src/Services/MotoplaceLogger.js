import Globals from "../Services/Config/config"


function MotoplaceLogger() {
    var environment = Globals.get("env");

    if (environment !== "prod") {

        this.console = {
            'debug': window.console.info, // Use this log option for lacal develoupment debugging
            'info': window.console.info,
            'error': window.console.error,
            'warn': window.console.warn,
        };

    }
    else {

        this.console = {
            'info': window.console.info,
            'warn': window.console.warn,
            'error': window.console.error,
            'debug': function () { },
        };
    }

}

export default new MotoplaceLogger();


