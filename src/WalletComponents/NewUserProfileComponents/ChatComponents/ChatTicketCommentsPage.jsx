import React from "react";
import localeService from "../../../Services/localeListService";
import "../../../styles/main.css";
import { withStyles } from "@material-ui/core/styles";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import ChatBox from "../../../Services/ChatBotPlugin/ChatBox";
import ChatBotUtils from "./ChatBotUtils";
import Log from "../../../Services/Log";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import apiService from "../../../Services/apiService";
import moment from "moment/moment";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import constantObjects from "../../../Services/Constants";
import androidApiCalls from "../../../Services/androidApiCallsService";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import MetricsService from "../../../Services/MetricsService";
import deploymentVersion from "../../../Services/deploymentVersion.json";
import { Snackbar } from "@material-ui/core";
import { MuiThemeProvider } from "@material-ui/core/styles";
import InputThemes from "../../../Themes/inputThemes";
import MuiAlert from '@material-ui/lab/Alert';
import AlertDialog from "../../NewOnboardingComponents/AlertDialog";
import PropTypes from "prop-types";
import ColorPicker from "../../../Services/ColorPicker";

const AGENT_ID = 2;
const USER_ID = 1;
const screenHeight = window.innerHeight;
const READ_EXT_STORAGE_PERMISSION = "android.permission.READ_EXTERNAL_STORAGE";
const READ_MEDIA_IMAGES_PERMISSION = "android.permission.READ_MEDIA_IMAGES";
const MAX_IMG_SIZE_LIMIT = 1024 * 1024 * 10;
const mime_type = ["image/*" , "application/pdf"];

var localeObj = {};

const styles = ({
    notchedOutline: {
        borderWidth: "1px",
        borderColor: ColorPicker.darkMediumEmphasis
    },
    input: {
        color: ColorPicker.darkHighEmphasis
    }
});

class ChatTicketResponse extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            chats: [],
            commentsArray: [],
            ticketDescription: "",
            ticketCreatedDate: "",
            isComments: false,
            chatCommentdate: "",
            latestCommentTimes: {},
            showTyping: true,
            inputComment: "",
            conversationArray: [],
            ticketClosed: false,
            filename: "",
            image: "",
            convertedblobs: "",
            attachments:[],
            ticketNumber: "",
            storagePermissionAlert: false,
            isBackClicked: false
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
            this.onBack();
        }

        this.getDeviceInformation();

        window.addEventListener('resize', this.checkIfKeyboardIsOpened);

        window.onAttachImageComplete = (response) => {
            if (response === "err_app_not_avail" || response === "err_img_fetch_failure") {
                this.openSnackBar(localeObj.upload_valid_image);
            } else {
                this.updatePreview(response);
            }
        }

        window.onRequestPermissionsResult = (permission, status) => {
            if (permission === READ_EXT_STORAGE_PERMISSION || permission === READ_MEDIA_IMAGES_PERMISSION) {
                if (status === true) {
                    androidApiCalls.uploadImage();
                } else {
                    if (androidApiCalls.isFeatureEnabledInApk("CAF_VALIDATION")) {
                        this.setState({
                            storagePermissionAlert: true
                        })
                    } else {
                        this.openSnackBar(localeObj.allow_storage);
                    }  
                }
            } 
        }

        this.performComponentInitialTasks().then(() => {
            this.getComments();
        })
    }

    performComponentInitialTasks = async () => {
        await ChatBotUtils.initializeAESAlgo();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.checkIfKeyboardIsOpened);
    }

    onBack = () => {
        if (this.state.isBackClicked) {
            return; 
        }
        this.setState({ 
            isBackClicked: true
        });
        this.props.history.replace({ pathname: "/ChatTicketDisplay", transition: "right"})
    }

    openSnackBar = (message) => {
        this.setState({
            snackBarOpen: true,
            snackBarMessage: message
        })
    }

    closeSnackBar = () => {
        this.setState({ snackBarOpen: false })
    }

    closestoragePermissionAlertDialog = () => {
        this.setState({
            storagePermissionAlert: false
        })
    }
    
    getDeviceInformation = async () => {
        let deviceInformation = await androidApiCalls.getDeviceInformation();
        deviceInformation = GeneralUtilities.notEmptyNullUndefinedCheck(deviceInformation, false) ? JSON.parse(deviceInformation) : null;
        deviceInformation = deviceInformation.deviceInfo;
        await this.setState({deviceInformation}, () => {
            this.handleConversationEncryption();
        });
    }

    handleConversationEncryption = (valJson) => {
        let jsonObject = {securePayload: '', secret: ''};

        try {
            const keyAndIv = ChatBotUtils.symmetric.getKeyAndIv();
            const encryptedKeyAndIv = ChatBotUtils.asymmetric.encrypt(keyAndIv, true);
            let lastUpdatedTimeStamp = "";
            let action = "";
            let action2 = "";

            if (this.props.location.additionalInfo !== "" && this.props.location.additionalInfo !== undefined) {
                action = this.props.location.additionalInfo["ticketId"];
                action2 = this.props.location.additionalInfo["ticketNumber"];
                if (action !== "" && action !== undefined) {
                    this.setState({ ticketNumber: action2 });
                }
            }

            let payloadJson = Object.assign({}, {});
            payloadJson.ticketId = action;
            
            if (this.props.location && this.props.location.dataJson) {
                payloadJson.ticketId = this.props.location.dataJson.ticketId;
                payloadJson.ticketStatus = this.props.location.dataJson.statusType;
                lastUpdatedTimeStamp = this.props.location.dataJson.lastUpdatedMoment
                this.setState({ticketNumber: this.props.location.dataJson.ticketNumber})
            }
            if(payloadJson.ticketStatus === constantObjects.ticket_closed_status){
                const currentMoment = moment(); 
                const hoursDifference = currentMoment.diff(lastUpdatedTimeStamp, 'hours');
                if (hoursDifference <= 72) {
                    this.setState({ticketClosed: false});
                } else {
                    this.setState({ticketClosed: true});
                }
            }
            
            payloadJson.clientKey = ImportantDetails.clientKey;
            payloadJson.accountKey = ImportantDetails.accountKey;
            payloadJson.deviceInfo = this.state.deviceInformation;
            payloadJson.webviewVersion = deploymentVersion.version;
            payloadJson.via = MetricsService.getAppEnterVia();
            payloadJson.entryPoint = ChatBotUtils.insideChat;
            payloadJson.comment = this.state.inputComment;
            payloadJson.attachments = this.state.attachments;

            if(valJson){
                jsonObject['securePayload'] = ChatBotUtils.symmetric.encrypt(JSON.stringify(valJson));
            } else {
                jsonObject['securePayload'] = ChatBotUtils.symmetric.encrypt(JSON.stringify(payloadJson));
            }
            jsonObject['secret'] = encryptedKeyAndIv;
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

    getComments = async () => {
        let encrypt= await this.handleConversationEncryption();
        this.showProgressDialog();
        apiService.getTicketComments(encrypt)
            .then(response => {
                const decryptedResponse = this.handleConversationDecryption(response.data);
                const currentMoment = moment();

                if (response.status === 200) {
                    this.hideProgressDialog();
                    let jsonItem = [];

                    if(decryptedResponse && decryptedResponse.data && decryptedResponse.data.length > 0){
                        for (const item of decryptedResponse.data) {
                            let jsonObj = {};
                            jsonObj["firstName"] = item.commenter.firstName;
                            jsonObj["lastName"] = item.commenter.lastName;
                            jsonObj["date"] = moment(item.commentedTime).format("DD MMM YYYY, HH:mm").replace(/\b\w/g, l => l.toUpperCase());
                            jsonObj["comment"] = item.content.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '');
                            jsonObj["type"] = item.commenter.type;
                            jsonObj["id"] = item.commenter.id;
                            jsonObj["isPublic"] = item.isPublic;
                            jsonObj["attachment"] = item.attachments;
                            if(item.attachments && item.attachments.length > 0){
                                jsonObj["attachmentName"] = item.attachments[0].name;
                            }
                            this.setState({
                                isPublicComment: item.isPublic
                            })
                            jsonItem.push(jsonObj);
                        }
                        this.setState({
                            isComments: true
                        })
                    }

                    if(decryptedResponse.ticketStatus === constantObjects.ticket_closed_status){
                        const hoursDifference = currentMoment.diff(moment(decryptedResponse.lastUpdatedTimeStamp), 'hours');
                        this.setState({ ticketClosed: hoursDifference > 72 });
                    }
                    
                    const ticketDate = moment(decryptedResponse.ticketCreatedDate).format("DD MMM YYYY, HH:mm").replace(/\b\w/g, l => l.toUpperCase());
                    this.setState({
                        ticketCreatedDate: ticketDate
                    })


                    this.addComments(jsonItem, decryptedResponse.ticketDescription)
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
                Log.sError("Not able to get comments: " + JSON.stringify(err));
            });
    }

    postComments = async () => {
        let encrypt= await this.handleConversationEncryption();
        apiService.postTicketComments(encrypt)
            .then(response => {
                if(response.status === 200){
                    Log.sError("Success");
                }
                else if(response.status === 500){
                    Log.sError("500 error");
                }
            }).catch(err => {
                Log.sError("Not able to get comments: " + JSON.stringify(err));
            });
    }

    addNewChatConversation(
        {
            message = '', chatId = (new Date().getTime()), isUserConversation = true,
            conversationType = 'text', commentTime = ''
        }
    ) {
        
        const newMessage = {
            id: chatId,
            author: {
              username: isUserConversation ? "User" : "Agent",
              id: isUserConversation ? USER_ID : AGENT_ID,
              avatarUrl: isUserConversation ? require("../../../images/user.png") : require("../../../images/moto_new.png"),
            },
            text: message,
            timestamp: +new Date(),
            type: conversationType,
            commentedTime: commentTime
        }
        return newMessage;
    }

    handleOnSendMessage = async (message) => {
        this.setState({
            attachments: [],
            inputComment: message
        });

        const userCommentTime = moment().format("DD MMM YYYY, HH:mm")
        const newMessage = this.addNewChatConversation({ message, commentTime: userCommentTime });
        this.setState({
            chats: [...this.state.chats, newMessage]
        });

        setTimeout(async () => {
            await this.postComments();
        }, 2000)
    }

    addComments(ticketComments, ticketDescription) {
        const comments = ticketComments;

        const description = ticketDescription;
        this.state.conversationArray.push(this.addNewChatConversation({message: description, commentTime: this.state.ticketCreatedDate}));

        if(this.state.isComments) {
            for(const item of comments) {
                if(item.id === constantObjects.user_ticket_id) {
                    this.state.conversationArray.push(this.addNewChatConversation({message: item.comment, commentTime: item.date}))
                    if(item.attachment && item.attachmentName){
                        this.state.conversationArray.push(this.addNewChatConversation({message: item.attachmentName + " " + localeObj.upload_success, commentTime: item.date}))
                    }
                }
                else if(item.isPublic) {
                    this.state.conversationArray.push(this.addNewChatConversation({message: item.comment, isUserConversation: false, commentTime: item.date}))
                }
            }
        }
        
        this.setState({
            chats: this.state.conversationArray
        })
    }

    checkIfKeyboardIsOpened = () => {
        if (window.innerHeight !== screenHeight) {
          this.setState({
            keyboardOpened: true,
            keyboardSize: screenHeight - window.innerHeight
          });
        } else {
          this.setState({
            keyboardOpened: false,
            keyboardSize: 0
          });
        }
    };

    updatePreview = (response) => {
        let filenames = Object.keys(response);
        let filename = filenames[0];
        let fileExtension = filename.split('.').pop();
        let mimeString = '';
        if (fileExtension === 'png') {
            mimeString = 'image/png';
        } else if (fileExtension === 'pdf') {
            mimeString = 'application/pdf';
        } else if (fileExtension === 'jpeg') {
            mimeString = 'image/jpeg';
        } else if (fileExtension === 'jpg'){
            mimeString = 'image/jpg';
        } else {
            this.openSnackBar(localeObj.invalid_file);
        }

        let image = this.state.image;
        let convertedblobs = this.state.convertedblobs;

        let dataURI = response[filename];
        let byteString = atob(dataURI);
        let ab = new ArrayBuffer(byteString.length);
        let ia = new Uint8Array(ab);
        for (let j = 0; j < byteString.length; j++) {
            ia[j] = byteString.charCodeAt(j);
        }
        let convertedblob = new Blob([ab], { type: mimeString });
        if (convertedblob.size > MAX_IMG_SIZE_LIMIT) {
            setTimeout(() => {
                this.openSnackBar(localeObj.chatbot_image_size_exceed);
            }, 3000);
        } else {
            image = response[filename];
            convertedblobs = convertedblob;
            this.finalUpload(mimeString, filename);
        }

        this.setState({
            image: image,
            convertedblobs: convertedblobs,
            filename: filename
        });

    }

    fetchImage = () => {
        let currentVersion = androidApiCalls.getAppVersion();
        let targetVersion =   constantObjects.target_version;
        if (androidApiCalls.getSDKVersion() < 33) {
            if (androidApiCalls.checkSelfPermission(READ_EXT_STORAGE_PERMISSION) === 0) {
                if(currentVersion >= targetVersion){
                    androidApiCalls.uploadImageChatBot(mime_type);
                }
                else{
                    androidApiCalls.uploadImage(false);
                }
            } else {
                if (androidApiCalls.shouldShowRequestPermissionRationale(READ_EXT_STORAGE_PERMISSION)) {
                    androidApiCalls.requestPermission(READ_EXT_STORAGE_PERMISSION);
                } else {
                    androidApiCalls.requestPermission(READ_EXT_STORAGE_PERMISSION);
                    this.setState({
                        showSnackBar: true
                    });
                }
            }
        } else {
            if ((androidApiCalls.checkSelfPermission(READ_EXT_STORAGE_PERMISSION) === 0) || (androidApiCalls.checkSelfPermission(READ_MEDIA_IMAGES_PERMISSION) === 0)) {
                if(currentVersion >= targetVersion){
                    androidApiCalls.uploadImageChatBot(mime_type);
                }
                else{
                    androidApiCalls.uploadImage(false);
                }
            } else {
                if (androidApiCalls.shouldShowRequestPermissionRationale(READ_MEDIA_IMAGES_PERMISSION)) {
                    androidApiCalls.requestPermission(READ_MEDIA_IMAGES_PERMISSION);
                } else {
                    androidApiCalls.requestPermission(READ_EXT_STORAGE_PERMISSION);
                    this.setState({
                        showSnackBar: true
                    });
                }
            }
        }
    }

    getSignedURL = async (mimeString, finalFilename) => {
        let jsonObject = {
            "objectName" : finalFilename,
            "contentType": mimeString
        }
        let finalJSON = await this.handleConversationEncryption(jsonObject)
        return new Promise((resolve, reject) => {
            apiService.signedUrlChatBot(finalJSON)
            .then(response => {
                const decryptedResponse = ChatBotUtils.symmetric.decrypt(response.data);
                if (response.status === 200) {
                    let receivedData = JSON.parse(decryptedResponse);
                    resolve(receivedData.url);
                }
            }).catch(err => {
                if (err.response) {
                    reject("");
                }
            });
        })

    }

    finalUpload = async (mimeString, filename) => {
        let curr_time = new Date();
        
        let finalFilename = ImportantDetails.clientKey + curr_time.getTime() + "/" + filename;
    
            await Promise.all([await this.getSignedURL(mimeString, finalFilename)])
            .then( values => {
                let uploadUrl = values;
                apiService.uploadImageFromChatBot(uploadUrl, this.state.convertedblobs, mimeString).then(() => {
                    this.setState({
                        showTyping: false,
                        attachments: [...this.state.attachments, finalFilename]
                    })
                    this.postComments();
                    const uploadTime = moment().format("DD MMM YYYY, HH:mm")
                    const newMessage = this.addNewChatConversation({ message: this.state.filename + " " + localeObj.upload_success, commentTime: uploadTime});
                    this.setState({
                        chats: [...this.state.chats, newMessage]
                    });
                    Log.debug(finalFilename + ' uploaded successfully.');
                }).catch(err => {
                    Log.debug(finalFilename + ' upload failed with error => ' + err + '. Retrying once');
                    apiService.uploadImageFromChatBot(uploadUrl, this.state.convertedblob, mimeString).then(() => {
                        this.addNewChatConversation({ message: this.state.filename + " " + localeObj.upload_success, isUserConversation: false});
                        Log.debug(finalFilename + 'uploaded successfully after retry.');
                    }).catch(err => {
                        this.openSnackBar(localeObj.image_upload_failed);
                        Log.debug(' upload failed for ' + finalFilename + ' ' + err);
                    })
                })
            }).catch( err => {
                Log.debug("errors are : " + JSON.stringify(err));
            });
    }
    
    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const chatInputBoxHeight = screenHeight - 155;

        return (
            <div>
                <ButtonAppBar header={"#" + this.state.ticketNumber} onBack={this.onBack} action="none" />

                <ChatBox
                    messages={this.state.chats}
                    userId={USER_ID}
                    width={`${screenWidth}px`}
                    height={`${this.state.keyboardOpened ? (chatInputBoxHeight - this.state.keyboardSize) : chatInputBoxHeight}px`}
                    authorToDepict = {{ username: 'Agent', id: AGENT_ID, avatarUrl: null }}
                    isTickets={true}
                    chatCommentdate={this.state.chatCommentdate}
                    isPublicComment={this.state.isPublicComment}
                    showTypingIndicator={this.state.showTyping}
                    onSendMessage={this.handleOnSendMessage}
                    placeholder={localeObj.type_query}
                    ticketClosed={this.state.ticketClosed}
                    fetchImage={this.fetchImage}
                />

                <div style={{ display: this.state.processing ? 'block' : 'none' }}>
                    {this.state.processing && <CustomizedProgressBars />}
                </div>

                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackBarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>

                {this.state.storagePermissionAlert &&
                    <AlertDialog  title ={localeObj.allow_storage_title} description = {localeObj.allow_storage} positiveBtn = {localeObj.grant_permission} neagtiveBtn = {localeObj.deny_permission}
                    handleClose= {this.closestoragePermissionAlertDialog}/>
                }
            </div>
        );
    }
}

ChatTicketResponse.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
}

export default withStyles(styles)(ChatTicketResponse);
