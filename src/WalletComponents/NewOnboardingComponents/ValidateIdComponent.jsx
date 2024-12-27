import React from "react";
import "../../styles/main.css";
import PropTypes from "prop-types";
import CircularProgress from "@material-ui/core/CircularProgress"
import OcrProperties from "../../Services/OcrProperties";
import localeService from "../../Services/localeListService";
import { extractDetails } from "../OnBoardingSupportComponents/RgFormComponent";
import ImportantDetails from "../NewLaunchComponents/ImportantDetails";
import MetricsService from "../../Services/MetricsService";
import PageState from "../../Services/PageState";
import Log from "../../Services/Log";
import constantObjects from "../../Services/Constants";
import PageNames from "../../Services/PageNames";
import ColorPicker from "../../Services/ColorPicker";
import ArbiApiService from "../../Services/ArbiApiService";
import { makeStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const useStylesFacebook = makeStyles({
    root: {
        position: "fixed",
        top: "40%",
        left: "50%",
        transform: "translate(-50%, -50%)"
    },
    bottom: {
        color: ColorPicker.secDisabled,
    },
    top: {
        color: ColorPicker.accent,
        animationDuration: '1000ms',
        position: 'absolute',
        left: 0,
    },
    circle: {
        strokeLinecap: 'round',
    },
});

const theme1 = createMuiTheme({
    overrides: {
        MuiCircularProgress: {
            circleIndeterminate: {
                strokeDasharray: "80px, 200px"
            },
        },
    }
});

var localeObj = {};

function LoadingCircularProgress() {
    const classes = useStylesFacebook();

    return (
        <div className={classes.root}>
            <CircularProgress
                variant="determinate"
                className={classes.bottom}
                size={54}
                thickness={3}
                value={100}
            />
            <CircularProgress
                variant="indeterminate"
                disableShrink
                className={classes.top}
                classes={{
                    circle: classes.circle,
                }}
                size={54}
                thickness={3}
            />
        </div>
    );
}

export default class ValidateIdComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showProgressDialog: true,
            payload: this.props.location.state ? this.props.location.state : {},
            step: this.props.location && this.props.location.state && this.props.location.state.step ? this.props.location.state.step : 13
        }
        this.componentName = PageNames.validateId;

        this.style = {
            blockStyle: {
                display: "flex",
                flexDirection: "column",
                minHeight: "inherit",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "10%",
                marginRight: "10%",
                position: "fixed",
                top: "45%",
            },
            title: {
                marginTop: "1rem",
                textAlign: "center"
            },
            subTitle: {
                marginTop: "1rem",
                textAlign: "center"
            }
        }
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        MetricsService.onPageTransitionStart(this.componentName);
    }

    componentDidMount() {
        Log.sDebug("componentDidMount", this.componentName);
        document.addEventListener("visibilitychange", this.visibilityChange);

        if (!OcrProperties.isOcrAlreadyInitated()) {
            OcrProperties.readOcr(this.componentName);
        }

        let isOcrDone = false;

        let ocrResult = {};

        const max_frequency = 6;
        let frequency = 0;

        let timeoutId = setInterval(() => {
            frequency = frequency + 1;
            if (isOcrDone || frequency >= max_frequency) {
                clearInterval(timeoutId);
                this.setState({ showProgressDialog: false });
                this.moveToIdInfoScreen(ocrResult);
            }
        }, 5 * 1000);

        OcrProperties.getOcrPoperties().then((response) => {
            Log.sDebug("Ocr for doc is successfull ");
            isOcrDone = true;
            ocrResult = response;
        }).catch((reject) => {
            Log.debug("Ocr for front doc is unsuccessfull " + reject);
            isOcrDone = true;
        })

    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(this.componentName, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(this.componentName);
        }
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
    }

    moveToIdInfoScreen = (ocrResult) => {

        let extractedDetails = {}
        if (Object.keys(ocrResult).length !== 0) {
            let isItRg = ImportantDetails.uploadDocType === constantObjects.DOC_TYPE.RG;
            extractedDetails = extractDetails(ocrResult, isItRg);
            Log.verbose("extractedDetails " + JSON.stringify(extractedDetails));
        }

        let dataTobeSent = {
            "rgNumber": extractedDetails["rgNumber"] || "",
            "rgNum": extractedDetails["rgNumber"] || "",
            "issueBody": extractedDetails["issueBody"] || "",
            "issueState": extractedDetails["issueState"] || "",
            "issueDate": extractedDetails["issueDate"] || "",
            "name": extractedDetails["name"] || "",
            "dob": extractedDetails["dob"] || "",
            "fatherName": extractedDetails["fatherName"] || "",
            "motherName": extractedDetails["motherName"] || ""
        }

        let nextUrlPayload = this.state.payload["nextUrlPayload"] ? this.state.payload["nextUrlPayload"] : {};
        nextUrlPayload["details"] = dataTobeSent;
        nextUrlPayload["creationState"] = "rg";
        nextUrlPayload["step"] = this.props.location && this.props.location.state && this.props.location.state.step ? this.props.location.state.step : 13;
        MetricsService.onPageTransitionStop(this.componentName, PageState.close);
        this.props.history.replace({ pathname: "/docInformation", state: nextUrlPayload, });
    }

    onBack = () => {
    }

    render() {
        return (
            <div>
                <div style={this.style.blockStyle}>
                    {this.state.showProgressDialog && <div>
                        <MuiThemeProvider theme={theme1}>
                            <LoadingCircularProgress />
                        </MuiThemeProvider>
                    </div>}
                    <div className="headline5 highEmphasis" style={this.style.title}>{localeObj.validate_id_title} </div>
                    <span className="body2 highEmphasis" style={this.style.subTitle}>{localeObj.validate_id_desc} </span>
                </div>
            </div>
        )
    }
}

ValidateIdComponent.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object
}
