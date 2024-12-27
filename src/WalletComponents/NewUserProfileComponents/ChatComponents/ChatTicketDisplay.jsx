import React from "react";
import localeService from "../../../Services/localeListService";
import "../../../styles/main.css";
import MetricsService from "../../../Services/MetricsService";
import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import { MuiThemeProvider, withStyles} from "@material-ui/core/styles";
import { Snackbar } from "@material-ui/core";
import MuiAlert from '@material-ui/lab/Alert';
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import ColorPicker from "../../../Services/ColorPicker";
import { Paper } from "@mui/material";
import apiService from "../../../Services/apiService";
import ChatBotUtils from "./ChatBotUtils";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import Log from "../../../Services/Log";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import moment from "moment/moment";
import NoTransactionComponent from "../../TransactionHistory/NoTransactions";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import PixErrorComponent from "../../CommonUxComponents/ErrorTemplate";
import androidApiCalls from "../../../Services/androidApiCallsService";
import deploymentVersion from "../../../Services/deploymentVersion.json";
import ChatRatings from "./ChatRatings";
import Drawer from '@material-ui/core/Drawer';
import FlexView from "react-flexview/lib";
import InputThemes from "../../../Themes/inputThemes";
import StarRating from './StarRating';
import constantObjects from "../../../Services/Constants";
import MetricServices from "../../../Services/MetricsService";
import PropTypes from "prop-types";

var localeObj = {};

const styles = InputThemes.singleInputStyle;
const profilePageName = PageNames.userProfileDetails;

class ChatTicket extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ticketResponse:[],
            ticketArray:[],
            isTicket:false,
            emptyTickets:false,
            ticketState:"",
            isBackClicked: false,
            userRating: 0,
            selectedTicketId: "",
            userRated: false,
            clickedSurvey: false,
            ticketNumber: "",
            isTicketClicked: false
        }
    }

    showProgressDialog = () => {
        this.setState({
            processing: true
        })
    }

    hideProgressDialog = () => {
        this.setState({
            processing: false
        })
    }

    componentDidMount() {
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }

        window.onBackPressed = () => {
            if (this.state.bottomSheetEnabled) {
                this.setState({ bottomSheetEnabled: false });
            } else if (this.state.thankyouBottomSheetEnabled){
                this.setState({ thankyouBottomSheetEnabled: false });
            } else {
                MetricServices.onPageTransitionStop(profilePageName, PageState.back);
                this.props.history.replace({ pathname: "/chat", transition: "right"})
            }
        }

        this.getDeviceInformation();

        this.performComponentInitialTasks().then(() => {
            this.showProgressDialog();
            this.getTickets();
        })
    }

    performComponentInitialTasks = async () => {
        await ChatBotUtils.initializeAESAlgo();
    }

    componentWillUnmount() {
        window.removeEventListener('focus', this.handleFocus);
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            snackBarMessage: message
        })
    }

    handleFocus = () => {
        if (document.hasFocus()) {
            this.handleThankyouBottomSheet(true)();
        }
    };

    onBack = () => {
        if (this.state.isBackClicked) {
            return; 
        }
        this.setState({ 
            isBackClicked: true
        });
        this.props.history.replace({ pathname: "/chat", transition: "right"})
    }

    getDeviceInformation = async () => {
        let deviceInformation = await androidApiCalls.getDeviceInformation();
        deviceInformation = GeneralUtilities.notEmptyNullUndefinedCheck(deviceInformation, false) ? JSON.parse(deviceInformation) : null;
        deviceInformation = deviceInformation.deviceInfo;
        await this.setState({deviceInformation}, () => {
            this.handleConversationEncryption();
        });
    }

    handleConversationEncryption = (ratingJson) => {
        let jsonObject = {securePayload: '', secret: ''};

        try {
            const keyAndIv = ChatBotUtils.symmetric.getKeyAndIv();
            const encryptedKeyAndIv = ChatBotUtils.asymmetric.encrypt(keyAndIv, true);

            let payloadJson = Object.assign({}, {});
            payloadJson.clientKey = ImportantDetails.clientKey;
            payloadJson.accountKey = ImportantDetails.accountKey;
            payloadJson.deviceInfo = this.state.deviceInformation;
            payloadJson.webviewVersion = deploymentVersion.version;
            payloadJson.via = MetricsService.getAppEnterVia();
            payloadJson.entryPoint = ChatBotUtils.insideChat;

            if(ratingJson){
                jsonObject['securePayload'] = ChatBotUtils.symmetric.encrypt(JSON.stringify(ratingJson));
                jsonObject['secret'] = encryptedKeyAndIv;
            } else{
                jsonObject['securePayload'] = ChatBotUtils.symmetric.encrypt(JSON.stringify(payloadJson));
                jsonObject['secret'] = encryptedKeyAndIv;
            }
        } catch (err) {
            //Log.sDebug(err);
        }

        return jsonObject;
    }

    handleConversationDecryption = (encryptedObj) => {
        let decryptedObject = {};

        //Log.sDebug('CHATBOT: decrypting handleConversationDecryption encryptedObj');
        try {
            let decryptedResponse = ChatBotUtils.symmetric.decrypt(encryptedObj);
            //Log.sDebug('CHATBOT: decrypting successfully handleConversationDecryption');
            decryptedObject = GeneralUtilities.notEmptyNullUndefinedCheck(decryptedResponse, false)
                ? JSON.parse(decryptedResponse)
                : decryptedObject;
        } catch (err) {
            //Log.sDebug('CHATBOT: error while decrypting handleConversationDecryption', err);
            //Log.sDebug(err);
        }

        return decryptedObject;
    }

    getTickets = async () => {
        let encrypt= await this.handleConversationEncryption();
        this.showProgressDialog();
        apiService.getZohoTickets(encrypt)
            .then(response => {
                const decryptedResponse = this.handleConversationDecryption(response.data);

                if(response.status === 200 && (decryptedResponse === null || decryptedResponse.length === 0 || JSON.stringify(decryptedResponse) === "{}")){
                    this.hideProgressDialog();
                    this.setState({
                        ticketState: "noTickets",
                        emptyTickets: true
                    })
                }
                else if (response.status === 200 && decryptedResponse.length > 0) {
                    this.hideProgressDialog();
                    let jsonItem = [];
                    for (const item of decryptedResponse) {
                        let jsonObj = {};
                        jsonObj["ticketNumber"] = item.ticketNumber;
                        jsonObj["ticketId"] = item.ticketId;
                        const subject = item.ticketSubject.length > 24? item.ticketSubject.substring(0,24) + "..." : item.ticketSubject;
                        jsonObj["subject"] = subject;
                        jsonObj["statusType"] = item.ticketStatus;
                        const unixTimeStamp = item.lastUpdatedTimeStamp.seconds;
                        jsonObj["date"] = moment.unix(unixTimeStamp).format("YYYY-MM-DD");
                        jsonObj["time"] = moment.unix(unixTimeStamp).format("HH:mm:ss");
                        jsonObj["lastUpdatedMoment"] =  moment.unix(unixTimeStamp);
                        jsonObj["ratings"] = item.noOfRatings;
                        jsonItem.push(jsonObj);
                    }
                    this.setState({
                        ticketArray: jsonItem,
                        ticketState: "ticketsPresent"
                    })
                    //Log.sDebug("Success in getting tickets data from backend", this.componentName);
                }
                else if(response.status === 500){
                    this.hideProgressDialog();
                    let jsonObj = {}
                    jsonObj["header"] = localeObj.tickets_failure_title;

                    this.setState({
                        ticketState: "error",
                        tixErrorJson: jsonObj
                    })
                }
            }).catch(err => {
                Log.sError("Not able to submit chat: " + JSON.stringify(err));
            });
    }

    displayTicketComments = (ticket) => {
        if (this.state.isTicketClicked) {
            return; 
        }
        this.setState({ 
            isTicketClicked: true
        });
        MetricsService.onPageTransitionStop(PageNames.chatTicketDisplay, PageState.close);
        this.props.history.replace({
            pathname: '/ChatTicketCommentsPage',
            transition: "left",
            dataJson: ticket
        })
    }

    goToChatbot = () => {
        MetricsService.onPageTransitionStop(PageNames.chatTicketDisplay, PageState.close);
        this.props.history.replace({
            pathname: '/chat',
            transition: "right"
        })
    }

    handleBottomSheet = (val, ticketId = "") => () => {
        if (val) {
            this.setState({ userRating: 0 });
        }
        this.setState({
            bottomSheetEnabled: val,
            selectedTicketId: ticketId,
        });
    }

    handleThankyouBottomSheet = val => () => {
        this.setState({
            thankyouBottomSheetEnabled: val
        });
    }

    handleRatingChange = (value) => {
        this.setState({ userRating: value });
    };

    postRatings = async () => {
        let ratingJson = {};
        ratingJson.ticketId = this.state.selectedTicketId;
        ratingJson.noOfRatings = this.state.userRating;

        let index = this.state.ticketIndex;

        let encrypt= await this.handleConversationEncryption(ratingJson);
        apiService.postTicketRatings(encrypt)
            .then(response => {
                if(response.status === 200){
                    this.setState({
                        userRated: true
                    })
                    this.setState(prevState => {
                        const updatedTicketArray = [...prevState.ticketArray];
                        updatedTicketArray[index].ratings = prevState.userRating;
                        return { ticketArray: updatedTicketArray };
                    })
                    // this.state.ticketArray[index].ratings = this.state.userRating;
                    // Log.sError("Success");
                }
                else if(response.status === 500){
                    // Log.sError("500 error");
                }
            }).catch(
                // Log.sError("Not able to get comments: " + JSON.stringify(err));
            );
    }

    onClickSurvey = () => {
        this.handleBottomSheet(false, "")();
        const externalLink = `https://seufeedback.dimomotorola.com.br/jazztech/form/ChatBotoDimo/formperma/iMUl95gX40P5XO9GV2FiFGxqNGIB5kc-iyUcDVCv5ow?ticketNumber=${this.state.ticketNumber}`;
        window.open(externalLink, '_blank');
        setTimeout(() => {
            this.handleThankyouBottomSheet(true)();
        }, 2000);
    }

    handleRating = (e, ticketId, ticketNumber, alreadyRated, index, ratings) => {
        e.stopPropagation();
        this.handleBottomSheet(true, ticketId)();
        this.setState({ticketNumber: ticketNumber, alreadyRated: alreadyRated, ticketIndex: index, displayRating: ratings})
    }

    render() {
        const ticketStatus = this.state.ticketState;
        const screenHeight = window.screen.height;
        const { classes } = this.props;

        return (
            <div>
                {ticketStatus !== "error" &&
                    <div>
                        <ButtonAppBar header={localeObj.view_tickets} onBack={this.onBack} action="none" />
                    </div>
                }

                <div className="body2 highEmphasis text-center text-secondary react-chat-notification" style={{ display: (ticketStatus !== "" && ticketStatus !== "error" && ticketStatus !== "noTickets" ? 'block' : 'none')}}> {localeObj.ticket_sub_header} </div>

                <FlexView vAlignContent="center" hAlignContent="center" style={{ display: (ticketStatus === "noTickets" && !this.state.processing ? 'block' : 'none') }}>
                    <NoTransactionComponent emptyTickets={true} componentName="CHAT TICKET" />
                </FlexView>

                <div style={{ display: (ticketStatus === "error" && !this.state.processing ? 'block' : 'none') }}>
                    {ticketStatus === "error" && <PixErrorComponent errorJson={this.state.tixErrorJson} onClick={this.goToChatbot} btnText={localeObj.back_chat} componentName={PageNames.chatTicketDisplay}/>}
                </div>

                <div style={{overflowY: "auto", maxHeight: `${screenHeight * 0.80}px`}}>
                {
                    GeneralUtilities.notEmptyNullUndefinedCheck(this.state.ticketArray, false)
                    && this.state.ticketArray.map((ticket, index) => (
                        <Paper key={index} elevation="0" style={{margin: "0.75rem", background: ColorPicker.newProgressBar, height: ticket.statusType === "Fechado"? "7.938rem": "4.625rem", borderRadius: "1.25rem", marginBottom: "1rem"}}
                            onClick={()=>this.displayTicketComments(ticket)}>
                            <div style={{display: "flex", justifyContent: "space-between", margin: "0.75rem", paddingInline : "0.625rem", alignItems: "center"}}>
                                <div style={{display: "flex", flexDirection: "column", marginTop: "1rem"}}>
                                    <p className="body2 highEmphasis" style={{margin: 0}}>{ticket.subject.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())} </p>
                                    <p className="body2 disabled" style={{margin: 0}}>{`${ticket.date} ${","} ${ticket.time}`}</p>
                                </div>
                                <div style={{display: "flex", flexDirection: "column", alignItems: "flex-end", marginTop: "1rem"}}>
                                    <p className="subtitle4" style={{ color: ticket.statusType === "Open" ? ColorPicker.success : ColorPicker.buttonAccent, margin: 0}}>{ticket.statusType.toUpperCase()} </p>
                                    <p className="body2 highEmphasis" style={{margin: 0}}>{`${localeObj.ticket} ${" #"} ${ticket.ticketNumber}`} </p>
                                </div>
                            </div>
                            {ticket.statusType === "Fechado" && (
                                <div style={{ display: "flex", justifyContent: "center", margin: "0.75rem", paddingInline : "0.625rem", marginTop: "1.188rem" }}>
                                    <ChatRatings ratings={ticket.ratings} handleRating={this.handleRating} ticketId={ticket.ticketId} ticketNumber={ticket.ticketNumber} rateCustomerService={localeObj.rate_customer_service} userRated={this.state.userRated} index={index}/>
                                </div>
                            )}
                        </Paper>
                    ))
                }
                </div>

                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>

                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer
                        anchor="bottom"
                        open={this.state.bottomSheetEnabled}
                        onOpen={this.handleBottomSheet(true)}
                        onClose={this.handleBottomSheet(false)}
                        onBackdropClick={this.handleBottomSheet(false)}
                        classes={{ paper: classes.paper }}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ textAlign: "center", marginTop: "0.5rem" }}>
                                <div className="headline6 highEmphasis">
                                    {localeObj.rating_header}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ marginTop: "1rem", width: "19.5rem", height:"5rem", marginLeft: '1.5rem' }}>
                                    {localeObj.rating_body}
                                </div>
                                <div>
                                    <StarRating onChange={this.handleRatingChange} displayRating={this.state.displayRating}/>
                                </div>
                                { (this.state.userRated || this.state.alreadyRated) &&
                                    <FlexView coloumn style={{ width: "19.5rem", height: "12.375rem", backgroundColor: ColorPicker.surveyBackground, justifyContent: "center", margin: "1.5rem", borderRadius: "0.75rem", flexDirection: "column", alignItems:"center", alignSelf: "center"}}>
                                        <div className="subtitle4 highEmphasis">{localeObj.survey_header}</div>
                                        <div className="body2 mediumEmphasis" style={{width: "16.875rem", height: "6.25rem", margin: "0.5rem"}}>
                                            {localeObj.survey_body}
                                        </div>
                                    </FlexView>
                                }
                                { this.state.userRated || this.state.alreadyRated ? (
                                    <button className="body2 btnHighEmphasis" style={{ marginTop: "2.604rem", width:"20.5rem", height:"3rem", background: ColorPicker.buttonAccent, borderRadius: '1.5rem', border: 'none', alignSelf: "center" }} onClick={this.onClickSurvey} >
                                        {localeObj.continue_to_survey}
                                    </button>
                                ) : (
                                    this.state.userRating > 0 ? (
                                        <button className="body2 btnHighEmphasis" style={{ marginTop: "2.604rem", width:"20.5rem", height:"3rem", background: ColorPicker.buttonAccent, borderRadius: '1.5rem', border: 'none', alignSelf: "center" }} onClick={this.postRatings} >
                                            {localeObj.rate_customer_service}
                                        </button>
                                    ) : (
                                        <button className="body2 highEmphasis" style={{ marginTop: "2.604rem", width:"20.5rem", height:"3rem", background:"rgba(255, 255, 255, 0.08)", borderRadius: '1.5rem', border: 'none', alignSelf: "center" }} onClick={this.postRatings} >
                                            {localeObj.rate_customer_service}
                                        </button>
                                    )
                                )}
                                <div className="body2 highEmphasis" style={{margin: "1.5rem"}} onClick={this.handleBottomSheet(false)}>{localeObj.back}</div>
                            </FlexView>
                        </div>
                    </Drawer>
                </div>
                
                <div id="outer" style={{ width: "100%" }} className="accountOuterContainer">
                    <Drawer
                        anchor="bottom"
                        open={this.state.thankyouBottomSheetEnabled}
                        onOpen={this.handleThankyouBottomSheet(true)}
                        onClose={this.handleThankyouBottomSheet(false)}
                        onBackdropClick={this.handleThankyouBottomSheet(false)}
                        classes={{ paper: classes.paper }}>
                        <div style={{ margin: "1.5rem" }}>
                            <FlexView column style={{ textAlign: "center", marginTop: "0.5rem", alignItems:"center" }}>
                                <div className="headline6 highEmphasis">
                                    {localeObj.thankyou_feedback_header}
                                </div>
                                <div className="body2 mediumEmphasis" style={{ marginTop: "1rem", width: "19.5rem", height:"5rem"}}>
                                    {localeObj.thankyou_feedback_body_1}
                                    <br />
                                    {localeObj.thankyou_feedback_body_2}
                                </div>
                                <button className="body2 btnHighEmphasis" style={{ marginTop: "2.604rem", width:"20.5rem", height:"3rem", background: ColorPicker.buttonAccent, borderRadius: '1.5rem', border: 'none'}} onClick={this.handleThankyouBottomSheet(false)} >
                                    {localeObj.back}
                                </button>
                            </FlexView>
                        </div>
                    </Drawer>
                </div>

                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackBarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>

            </div>
        );
    }
}

ChatTicket.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
}

export default withStyles(styles)(ChatTicket);