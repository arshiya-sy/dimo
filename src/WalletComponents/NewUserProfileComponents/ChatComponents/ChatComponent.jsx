import React from "react";
import Globals from "../../../Services/Config/config";
import { Snackbar, MuiThemeProvider, withStyles } from "@material-ui/core";
import MuiAlert from '@material-ui/lab/Alert';
import "../../../styles/main.css";
import PageNames from "../../../Services/PageNames";
import PageState from "../../../Services/PageState";
import MetricsService from "../../../Services/MetricsService";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import androidApiCalls from "../../../Services/androidApiCallsService";
import InputThemes from "../../../Themes/inputThemes";
import CustomizedProgressBars from "../../CommonUxComponents/ProgressComponent";
import constantObjects from "../../../Services/Constants";
import ButtonAppBar from "../../CommonUxComponents/ButtonAppBarComponent";
import ColorPicker from "../../../Services/ColorPicker";
import ChatBox from "../../../Services/ChatBotPlugin/ChatBox";
import Log from "../../../Services/Log";
import axios from "axios";
import localeService from "../../../Services/localeListService";
import moment from "moment";
import ChatBotUtils from "./ChatBotUtils";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";
import isTransactionPresent from "../../../Services/TransactionTypeFilter";
import arbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import ChatAPIServiceComponent from "./ChatAPIServiceComponent";
import apiService from "../../../Services/apiService";
import deploymentVersion from "../../../Services/deploymentVersion.json";
import AlertDialog from "../../NewOnboardingComponents/AlertDialog";
import PropTypes from "prop-types";

const screenHeight = window.innerHeight;
const CHAT_BOT_ID = 2;
const USER_ID = 1;
const KEY_USER_BALANCE = 'get_user_balance';
const KEY_TXN_HISTORY = 'get_transaction_history';
const KEY_GET_ALL_BLOCK_CARDS = 'GET_ALL_CARDS_BLOCKED';
const KEY_GET_ALL_UNBLOCK_CARDS = 'GET_ALL_CARDS_UNBLOCKED';
const KEY_BLOCK_CARD_TEMP = 'block_card_temporarily';
const KEY_UNBLOCK_CARD_TEMP = 'unblock_card_temporarily';
const BUTTON_TYPE_QUICK_REPLY = 'QUICK_REPLY';
const BUTTON_TYPE_URL = 'URL';
const REROUTE_TO_TRANSACTION_HISTORY= "choose_transaction";
const CARD_CHOSEN_FOR_BLOCK_CARD = 'CARD_CHOSEN_FOR_BLOCK_CARD';
const CARD_CHOSEN_FOR_UNBLOCK_CARD = 'CARD_CHOSEN_FOR_UNBLOCK_CARD';
const READ_EXT_STORAGE_PERMISSION = "android.permission.READ_EXTERNAL_STORAGE";
const READ_MEDIA_IMAGES_PERMISSION = "android.permission.READ_MEDIA_IMAGES";
const device_locale = androidApiCalls.getLocale();
const MODIFY_PIX_LIMIT = "MODIFY_PIX_LIMIT";
const REROUTE_TO_PIX = "pix_limit_modify";
const ATTACH_IMAGE = "attach_file";
const HELP_PAGE = "GO_TO_HELP_PAGE"
const MAX_IMG_SIZE_LIMIT = 1024 * 1024 * 10;
const mime_type = ["image/png", "application/pdf", "image/jpg", "image/jpeg"];
const CHECK_ACCOUNT_STATUS = "CHECK_ACCOUNT_STATUS";

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

class ChatComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sessionId: '',
            showSnackBar: false,
            keyboardOpened: false,
            keyboardSize: 0,
            chatStarted: false,
            chatEnded: false,
            languageBackendUrls: {
                "portuguese": Globals.getChatBotPath(),
                "english": Globals.getChatBotPath(),
            },
            languageBackend: {
                "portuguese": "pt-BR",
                "english": "en-US",
            },
            selectedLanguage: device_locale,
            selectedLanguageUrl: Globals.getChatBotPath(),
            isLanguageSelected: false,
            chats: [
                {
                    id: new Date().getTime(),
                    text: "",
                    timestamp: +new Date(),
                    type: "notification"
                }
            ],
            inactivityIntervalId: null,
            closeConversationIntervalId: null,
            deviceInformation: null,
            userInformation: null,
            transactionType: "",
            showTyping: false,
            isFAQ: false,
            isFirstTimeFAQ: false,
            demarcation: false,
            checkInactivity: false,
            checkIfDemarcationPresent: false,
            isDemarcation: false,
            isPortuguese: false,
            feedbackSnackbar: "",
            selectedFeedback: "",
            filename: "",
            image: "",
            convertedblobs: "",
            checkUseCase: "",
            isMainMenu: false,
            displayMenuChip: false,
            hideKeyboard: false,
            isMenuChipDisabled: false,
            isThankYouChipDisabled: false,
            isBackClicked: false,
            isProcessChatApis: false,
            demarcationChip: false,
            attachImageIndex: ""
        };
        this.symmetric = null;
        this.asymmetric = null;
        this.chatInputBox = null;
        this.blockUnblockCardKey = null;
        this.onbackMinute = null;

        this.loadText();
        MetricsService.onPageTransitionStart(PageNames.chatComponent);
    }

    componentDidUpdate() {
        this.chatInputBox = document.querySelector('.react-chat-inputBox');
        !this.state.isLanguageSelected && this.toggleChatInputBoxVisibility();
    }

    componentDidMount = () => {
        ChatAPIServiceComponent.getPagewiseTransactionsForPeriod();
        this.chatInputBox = document.querySelector('.react-chat-inputBox');
        this.toggleChatInputBoxVisibility();
        if (this.props.location && this.props.location.from && ChatBotUtils.chats.length !== 0) {
            this.loadText();
            if (this.props.location.from === "reportUnAuthorized") {
                if (Object.keys(localeObj).length === 0) {
                    localeObj = localeService.getActionLocale();
                }
                let transactionMessage = this.generateSingleTransactionChip(this.props.location.transactionList, localeObj);
                this.setState({
                    sessionId: ChatBotUtils.sessionID,
                    chatStarted: true,
                    chats: ChatBotUtils.chats,
                    isLanguageSelected: true,
                    deviceInformation: ChatBotUtils.deviceInformation
                })
                this.setInactivityTimer();
                this.addChatEndEventListeners();
                ChatBotUtils.setChats([]);

                this.timeoutHandleOne = setTimeout(() => {
                    this.addNewChatConversation({ message: transactionMessage });
                    this.handleServerRequests(this.props.location.messageToBackend, "", false, true);
                }, 300);
            }
        } else if (ChatBotUtils.chats.length !== 0) {
            this.loadText();
            this.setState({
                sessionId: ChatBotUtils.sessionID,
                chatStarted: true,
                chats: ChatBotUtils.chats,
                isLanguageSelected: true,
                deviceInformation: ChatBotUtils.deviceInformation
            })
            this.setInactivityTimer();
            this.addChatEndEventListeners();
            ChatBotUtils.setChats([]);

            this.setState({
                isLanguageSelected: true,
                isFirstTimeFAQ: ChatBotUtils.isFirstTimeFAQ
            });
            this.timeoutHandleOne = setTimeout(() => {
                let currTime = moment();
                let onbackPrevTime = ChatBotUtils.onbackMinute;
                let demarcationPresent = ChatBotUtils.checkIfDemarcationPresent;
                if (!demarcationPresent && currTime.diff(onbackPrevTime, 'minutes') >= 10) {
                    this.handleOnSendMessage('', 'END_CONVERSATION_INACTIVE_AUTO');
                    this.setState({
                        chats: this.state.chats.concat({
                            id: new Date().getTime(),
                            timestamp: +new Date(),
                            type: "demarcation",
                            text: localeObj.chatbot_inactive_message,
                            addLine: true
                        }),
                        isFAQ: false,
                        checkIfDemarcationPresent: true,
                        isPortuguese: ChatBotUtils.isPortuguese && !device_locale.includes("en"),
                        sessionId: ""
                    });
                    ChatBotUtils.storeSessionID(this.state.sessionId);
                    ChatBotUtils.IsDemarcationPresent(this.state.checkIfDemarcationPresent);
                }
                else {
                    this.setState({
                        checkIfDemarcationPresent: false
                    })
                }
                this.setState({
                    isFAQ: ChatBotUtils.isFAQVal,
                    displayMenuChip: ChatBotUtils.isMenuChip,
                    hideKeyboard: ChatBotUtils.shouldHideKeyboard,
                    isMainMenu: ChatBotUtils.mainMenu,
                    demarcationChip: ChatBotUtils.isDemarcationChip
                })
            }, 300);
        } else {
            ChatBotUtils.storeClientKey(ImportantDetails.clientKey);
            this.performComponentInitTasks().then(() => {
                ChatBotUtils.setChats([]);
                this.setInactivityTimer();
                this.addChatEndEventListeners();
            });
        }

        androidApiCalls.enablePullToRefresh(false);
        document.addEventListener("visibilitychange", this.visibilityChange);
        window.addEventListener("resize", this.checkIfKeyboardIsOpened);
        window.onBackPressed = () => this.onBack();

        window.onAttachImageComplete = (response) => {
            if (response === "err_app_not_avail" || response === "err_img_fetch_failure") {
                this.fetchImage();
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
    }


    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.visibilityChange);
        window.removeEventListener("resize", this.checkIfKeyboardIsOpened);

        this.removeChatEndEventListeners();
        this.stopTimeInterval();
    }

    handleConversationEncryption = (payloadObj) => {
        let jsonObject = { securePayload: '', secret: '' };

        try {
            const keyAndIv = ChatBotUtils.symmetric.getKeyAndIv();
            const encryptedKeyAndIv = ChatBotUtils.asymmetric.encrypt(keyAndIv, true);
            jsonObject['securePayload'] = ChatBotUtils.symmetric.encrypt(JSON.stringify(payloadObj));
            jsonObject['secret'] = encryptedKeyAndIv;
        } catch (err) {
            //Log.sDebug(err, PageNames.chatComponent, constantObjects.LOG_PROD);
        }

        return jsonObject;
    }

    handleConversationDecryption = (encryptedObj) => {
        let decryptedObject = {};

        //Log.sDebug('CHATBOT: decrypting handleConversationDecryption encryptedObj');
        try {
            let decryptedResponse = ChatBotUtils.symmetric.decrypt(encryptedObj.data);
            //Log.sDebug('CHATBOT: decrypting successfully handleConversationDecryption');
            decryptedObject = GeneralUtilities.notEmptyNullUndefinedCheck(decryptedResponse, false)
                ? JSON.parse(decryptedResponse)
                : decryptedObject;
        } catch (err) {
            //Log.sDebug('CHATBOT: error while decrypting handleConversationDecryption', err, constantObjects.LOG_PROD);
            //Log.sDebug(err, PageNames.chatComponent, constantObjects.LOG_PROD);
        }

        return decryptedObject;
    }

    addChatEndEventListeners = () => {
        window.addEventListener('load', this.resetInactivityTimer, true);
        const events = ['mousedown', 'mousemove', 'keypress', 'keydown'];
        events.forEach((name) => {
            document.addEventListener(name, this.resetInactivityTimer, true);
        });
    }

    removeChatEndEventListeners = () => {
        window.removeEventListener('load', this.resetInactivityTimer, true);
        const events = ['mousedown', 'mousemove', 'keypress', 'keydown'];
        events.forEach((name) => {
            document.removeEventListener(name, this.resetInactivityTimer, true);
        });
    }

    performComponentInitTasks = async () => {
        await ChatBotUtils.initializeAESAlgo();
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
        const chatsData = this.state.chats[0];
        chatsData.text = localeObj.chat_joined;
        this.setState({
            chats: [chatsData]
        });
        await this.showLanguageSelectionOptions();
        let deviceInformation = await androidApiCalls.getDeviceInformation();
        deviceInformation = GeneralUtilities.notEmptyNullUndefinedCheck(deviceInformation, false) ? JSON.parse(deviceInformation) : null;
        deviceInformation = deviceInformation.deviceInfo;
        let userInformation = null;
        await arbiApiService.getAllClientData(PageNames.chatComponent).then(response => {
            if (response.success) {
                userInformation = ArbiResponseHandler.processGetAllClientDataResponse(response.result);
                userInformation = GeneralUtilities.notEmptyNullUndefinedCheck(userInformation, false) ? userInformation.data : userInformation;
            }
        });
        await this.setState({ deviceInformation, userInformation });
    }

    resetInactivityTimer = () => {
        if (!GeneralUtilities.notEmptyNullUndefinedCheck(this.state.inactivityIntervalId, false)) {
            return;
        }
        this.stopTimeInterval();
        this.setInactivityTimer();
    }

    stopTimeInterval = () => {
        clearInterval(this.state.inactivityIntervalId);
        clearInterval(this.state.closeConversationIntervalId);
    }

    setInactivityTimer = () => {
        const inactivityIntervalId = ChatBotUtils.checkIfDemarcationPresent ? "" : setInterval(this.addInactivityConversation, 300000);
        this.setState({ inactivityIntervalId });
    }

    setCloseConversationTimer = () => {
        const closeConversationIntervalId = setInterval(this.addCloseConversation, 180000);
        this.setState({ closeConversationIntervalId });
    }

    addInactivityConversation = () => {
        if (!ChatBotUtils.checkIfDemarcationPresent) {
            this.handleOnSendMessage('', 'USER_INACTIVE', true, true);
            this.setCloseConversationTimer();
        }
    }

    addCloseConversation = () => {
        this.handleOnSendMessage('', 'END_CONVERSATION_INACTIVE_ON_SCREEN', true, true, true);
        this.stopTimeInterval();
        this.removeChatEndEventListeners();
        this.toggleChatInputBoxVisibility();
        this.timeoutHandleOne = setTimeout(() => {
            this.setState({
                chatEnded: true,
                isFAQ: false
            })
        }, 100);
    }

    toggleChatInputBoxVisibility = (showInputBox = false) => {
        if (GeneralUtilities.notEmptyNullUndefinedCheck(this.chatInputBox)) this.chatInputBox.style.display = showInputBox ? 'flex' : 'none';
    }

    checkIfKeyboardIsOpened = () => {
        if (window.innerHeight !== screenHeight) {
            this.setState({
                keyboardOpened: true,
                keyboardSize: screenHeight - window.innerHeight
            })
        } else {
            this.setState({
                keyboardOpened: false,
                keyboardSize: 0
            })
        }
    }

    visibilityChange = () => {
        let visibilityState = document.visibilityState;
        if (visibilityState === "hidden") {
            MetricsService.onPageTransitionStop(PageNames.chatComponent, PageState.recent);
        } else if (visibilityState === "visible") {
            MetricsService.onPageTransitionStart(PageNames.chatComponent);
        }
    }

    handleSnackbar = () => {
        if (androidApiCalls.checkIfMpOnly()) {
            androidApiCalls.openApp('package:com.motorola.dimo#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;end;');
        } else {
            androidApiCalls.openApp('package:com.motorola.ccc.notification#Intent;action=android.settings.APPLICATION_DETAILS_SETTINGS;end;');
        }
        this.setState({
            showSnackBar: false
        })
    };

    hideSnackBar = () => {
        this.setState({
            showSnackBar: false
        })
    }

    showProgressDialog = () => {
        this.setState({
            chatStarted: false
        })
    }

    hideProgressDialog = () => {
        this.setState({
            chatStarted: true
        })
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

    closestoragePermissionAlertDialog = () => {
        this.setState({
            storagePermissionAlert: false
        })
    }

    loadText = async () => {
        if (Object.keys(localeObj).length === 0) {
            localeObj = localeService.getActionLocale();
        }
    }

    onBack = () => {
        if (this.state.isBackClicked) {
            return;
        }
        this.setState({ isBackClicked: true })

        if (!this.state.chatStarted) {
            this.openSnackBar(localeObj.no_action);
        } else {

            this.onbackMinute = moment();
            ChatBotUtils.onBackTime(this.onbackMinute);
            ChatBotUtils.isFAQOnback(this.state.isFAQ);
            ChatBotUtils.storeMenuChip(this.state.displayMenuChip);
            ChatBotUtils.isHideKeyboard(this.state.hideKeyboard);
            ChatBotUtils.storeIsMainMenu(this.state.isMainMenu);
            ChatBotUtils.storeDemarcationChip(this.state.demarcationChip)
            ChatBotUtils.isPortugueseLang(!device_locale.includes("en"));
            ChatBotUtils.IsDemarcationPresent(this.state.checkIfDemarcationPresent);
            ChatBotUtils.firstFAQ(this.state.isFirstTimeFAQ);
            ChatBotUtils.storeSessionID(this.state.sessionId);
            ChatBotUtils.setChats(this.state.chats);
            ChatBotUtils.storeDeviceInfo(this.state.deviceInformation);
            MetricsService.onPageTransitionStop(PageNames.chatComponent, PageState.back);
            if(ChatBotUtils.insideChat === constantObjects.user_profile_entrypoint){
                this.props.history.replace({ pathname: "/myAccount", transition: "right" });
            } else if(ChatBotUtils.insideChat === constantObjects.creditCardHomePage){
                this.props.history.push({
                    pathname: '/creditCard',
                    state: {
                        "creditStatus": {},
                        "entryPoint": "walletlanding"
                    }
                });
            } else {
                this.props.history.replace({ pathname: "/newWalletLaunch", transition: "right" });
            }
        }

        setTimeout(() => {
            this.setState({ isBackClicked: false });
        }, 300)
    }

    processChatApis = async (chatId, responseToUser) => {
        for (const processApi of responseToUser.processingApis) {
            let textResponse = '';
            let chatType = 'text';
            let buttons = [];

            this.setState({ isProcessChatApis: true });

            if (processApi.apiName === KEY_USER_BALANCE) {
                await GeneralUtilities.getUserAccountBalance().then((balanceResponse) => {
                    textResponse = `${localeObj.chat_balance} <br><b>${balanceResponse}</b>`;
                    this.resetInactivityTimer();
                });
            } else if (processApi.apiName === KEY_BLOCK_CARD_TEMP || processApi.apiName === KEY_UNBLOCK_CARD_TEMP) {
                await this.blockUnblockUserCard(processApi.apiName === KEY_BLOCK_CARD_TEMP)
                    .then((blockUnblockResponse) => {
                        textResponse = blockUnblockResponse;
                        this.resetInactivityTimer();
                        this.handleOnSendMessage('', 'END_CONVERSATION_EVENT', true);
                    });
            } else if (processApi.apiName === KEY_GET_ALL_BLOCK_CARDS || processApi.apiName === KEY_GET_ALL_UNBLOCK_CARDS) {
                const getBlockedCards = processApi.apiName === KEY_GET_ALL_BLOCK_CARDS;
                await GeneralUtilities.getUserAllCards({ getBlockedCards, getUnblockedCards: !getBlockedCards })
                    .then(async (userCards) => {
                        this.resetInactivityTimer();
                        if (GeneralUtilities.notEmptyNullUndefinedCheck(userCards, false)) {
                            textResponse = `${responseToUser.textToBeShownToUser} <br>`;
                            userCards.forEach((card) => buttons.push({
                                type: BUTTON_TYPE_QUICK_REPLY,
                                title: (card.brand === "VISA" ? localeObj.visa_deb : localeObj.elo_pre) + '\n' + card.number,
                                payload: getBlockedCards ? CARD_CHOSEN_FOR_UNBLOCK_CARD : CARD_CHOSEN_FOR_BLOCK_CARD,
                                payloadKey: card.cardKey
                            }));
                        } else {
                            textResponse = `<b>${getBlockedCards ? localeObj.no_block_card : localeObj.no_unblock_card}</b>`;
                            this.handleOnSendMessage('', 'END_CONVERSATION_EVENT', true);
                        }
                    });
            } else if (processApi.apiName === KEY_TXN_HISTORY) {
                await GeneralUtilities.getUserTransactionHistory().then((txnHistory) => {
                    if (GeneralUtilities.notEmptyNullUndefinedCheck(txnHistory, false)) {
                        const totalTxnToShow = responseToUser.apiParams && responseToUser.apiParams.noOfTransactions ? responseToUser.apiParams.noOfTransactions : 5;
                        const lastTransactions = txnHistory.slice(0, parseInt(totalTxnToShow));
                        textResponse = this.generateTxnHistoryHtml(lastTransactions, responseToUser).toString();
                    } else {
                        textResponse = `<b>${localeObj.chat_no_transactions}</b>`;
                    }
                    this.resetInactivityTimer();
                });
            } else if (processApi.apiName === MODIFY_PIX_LIMIT) {
                await ChatAPIServiceComponent.checkPixLimit().then((response) => {
                    if (response === "PIX_REDIRECT") {
                        this.handleOnSendMessage('', 'NO_PIX_LIMIT_REQUEST', true);
                    }
                    else if (response.name === "USER_WAIT") {
                        this.handleOnSendMessage('', 'RECENT_REQUEST', true);
                    }
                    else if (response.name === "AGREEABLE_LIMIT") {
                        this.handleServerRequests(response.amount + " " + response.date + " " + response.pixId);
                    }
                    textResponse = `${responseToUser.textToBeShownToUser} <br>`;
                    this.resetInactivityTimer();

                });
            } else if (processApi.apiName === CHECK_ACCOUNT_STATUS) {
                await ChatAPIServiceComponent.checkAccountStatus().then(async (response) => {
                textResponse = `${responseToUser.textToBeShownToUser} <br>`;
                if (response === 1) {
                    response = "Desbloqueada";
                    await ChatAPIServiceComponent.getPagewiseTransactionsForPeriod().then(async (result) => {
                        if (result.areTransactionsAvailable === true) {
                            let lastTransactionDate = result.date;
                            let formattedDate;
                            if (ChatBotUtils.isPortuguese) {
                                formattedDate = moment(lastTransactionDate, "DD/MM/YYYY").format("DD-MM-YYYY");
                            } else {
                                formattedDate = moment(lastTransactionDate, "DD/MM/YYYY").format("YYYY-MM-DD");
                            }
                            this.handleServerRequests(response + " Ativa " + formattedDate);
                        }
                        else {
                            await ChatAPIServiceComponent.getTransactionHistoryfor180days().then((ans) => {
                                if (ans.areTransactionsAvailable === true) {
                                    let lastTransactionDate = ans.date;
                                    let formattedDate;
                                    if (ChatBotUtils.isPortuguese) {
                                        formattedDate = moment(lastTransactionDate, "DD/MM/YYYY").format("DD-MM-YYYY");
                                    } else {
                                        formattedDate = moment(lastTransactionDate, "DD/MM/YYYY").format("YYYY-MM-DD");
                                    }
                                    this.handleServerRequests(response + " Ativa " + formattedDate);
                                } else {
                                    this.handleServerRequests(response + " Inativa");
                                }
                            });
                        }
                    });
                }
                else {
                    let statusResponse = GeneralUtilities.accountStatusMapping(response);
                    let status = statusResponse.replace(/([A-Z])/g, ' $1').trim();
                    this.handleServerRequests(status);
                }
            });

            }

            this.state.chats.forEach((chat) => {
                if (chat.id === chatId) {
                    chat.text = textResponse;
                    chat.type = chatType;
                    chat.buttons = buttons;
                }
            });
            this.setState({ chats: this.state.chats });
        }
    }

    blockUnblockUserCard = async (blockCard = true) => {
        let textResponse = '';
        if (blockCard) {
            const blockResponse = await GeneralUtilities.blockUserCardTemp(ChatBotUtils.cardKey);
            textResponse = blockResponse ? `${localeObj.card_blocked}` : `${localeObj.chatbot_block_error + "\n " + localeObj.chatbot_generic_error}`;
        } else {
            const unBlockResponse = await GeneralUtilities.unblockUserCardTemp(ChatBotUtils.cardKey);
            textResponse = unBlockResponse ? `${localeObj.card_unblocked}` : `${localeObj.chatbot_unblock_error + "\n " + localeObj.chatbot_generic_error}`;
        }

        return textResponse;
    }

    generateTxnHistoryHtml = (transactions, responseToUser) => {
        let transactionHtmlString = transactions.reduce((transactionString, transaction) => {
            let transactionType = '';
            if (transaction.card) {
                transactionType = "Compra a Vista ELO";
                //Log.sDebug("Transaction Type " + transactionType, "ChatComponent");
            } else if (transaction.isScheduled) {
                transactionType = "Schedule";
                //Log.sDebug("Transaction Type " + transactionType, "ChatComponent");
            } else {
                transactionType = isTransactionPresent.findTransactionType(transaction.transactionTypeID);
                if (transactionType === "tarrifs") {
                    transactionType = localeObj.chat_tarrif;
                }
                else if (transactionType === "recharge") {
                    transactionType = localeObj.chat_recharge;
                }
                //Log.sDebug("Transaction Type " + transactionType, "ChatComponent");
            }

            transactionString += `<div class="react-chat-message-buttonGroupLeft" style="white-space: normal; line-height: 1.5; background-color: #001736; font-size: smaller; margin-block: 10px; border-radius: 5px; padding: 8px;">
                <span>${localeObj.pix_type}: <b>${GeneralUtilities.captitalizeStrings(transactionType)}</b></span><br>
                <span>${localeObj.beneficiary} ${localeObj.name}: <b>${GeneralUtilities.notEmptyNullUndefinedCheck(transaction.nameOfParty, 'N/a')}</b></span><br>
                <span>${localeObj.amount}: <b style="color: ${transaction.transaction === 'C' ? ColorPicker.transactionGreen : ColorPicker.errorRed}">R$ ${GeneralUtilities.getFormattedAmount(transaction.amount)}</b></span><br>
                <span>${localeObj.date}: <b>${moment(transaction.date).format("DD/MM/YYYY")}</b></span><br>
            </div>`;

            return transactionString;
        }, `<p>${responseToUser.textToBeShownToUser}</p>`)

        transactionHtmlString += `<p>${localeObj.chat_more_transaction}</p>`;

        return transactionHtmlString;
    }

    generateSingleTransactionChip = (transaction, localeObj) => {
        const updatedChats = ChatBotUtils.chats.map((chat, index) => {
            if (index === ChatBotUtils.trnxIndex) {
              chat.isMenuDisabled = true;
            }
            return chat;
        });
        this.setState({
            chats: updatedChats
        });
        let transactionString = `<p>${localeObj.chatbot_report_unauthorized_header + "\n"}</p>`;
        let transactionType = '';
        if (transaction.card) {
            transactionType = "Compra a Vista ELO";
            //Log.sDebug("Transaction Type " + transactionType, "ChatComponent");
        } else if (transaction.isScheduled) {
            transactionType = "Schedule";
            //Log.sDebug("Transaction Type " + transactionType, "ChatComponent");
        } else {
            transactionType = isTransactionPresent.findTransactionType(transaction.transactionTypeID);
            //Log.sDebug("Transaction Type " + transactionType, "ChatComponent");
        }

        transactionString += `<div class="react-chat-message-buttonGroupLeft-col" style="white-space: normal; line-height: 1.5; background-color: #001736; font-size: smaller; margin-block: 10px; border-radius: 5px; padding: 8px;">
                <span>${localeObj.pix_type}: <b>${GeneralUtilities.captitalizeStrings(transactionType)}</b></span><br>
                <span>${localeObj.beneficiary} ${localeObj.name}: <b>${GeneralUtilities.notEmptyNullUndefinedCheck(transaction.nameOfParty, 'N/a')}</b></span><br>
                <span>${localeObj.amount}: <b style="color: ${transaction.transaction === 'C' ? ColorPicker.transactionGreen : ColorPicker.errorRed}">R$ ${GeneralUtilities.getFormattedAmount(transaction.amount)}</b></span><br>
                <span>${localeObj.date}: <b>${moment(transaction.date).format("DD/MM/YYYY")}</b></span><br>
            </div>`;
        return transactionString;
    }


    showLanguageSelectionOptions = async () => {
        this.toggleChatInputBoxVisibility(false);
        this.setState({
            isPortuguese: !device_locale.includes("en"),
            hideKeyboard: true
        })
        const selectedLanguage = device_locale.includes("en") ? this.state.languageBackend.english : this.state.languageBackend.portuguese;
        ChatBotUtils.isPortugueseLang(!device_locale.includes("en"));
        await this.setState({ isLanguageSelected: true, selectedLanguage, showTyping: true });
        ChatBotUtils.storeChatLanguage(selectedLanguage);

        this.handleOnSendMessage('', 'Welcome', true, false);
        this.setState({ chatStarted: true });
    }

    handleRerouting = async (payload) => {
        if (payload.response === REROUTE_TO_TRANSACTION_HISTORY) {
            this.moveToTransaction("ReportUnauth", payload.index);
        } else if (payload.response === REROUTE_TO_PIX) {
            this.moveToPixLimit();
        } else if (payload.response === ATTACH_IMAGE) {
            this.setState({ attachImageIndex: payload.index })
            this.fetchImage();
        } else if (payload.response === HELP_PAGE) {
            let event = {
                eventType: constantObjects.open_help_page,
                page_name: PageNames.chatComponent,
            };
            MetricsService.reportActionMetrics(event, new Date().getTime());
            GeneralUtilities.openHelpSection();
        } else {
            await this.addNewChatConversation({ message: payload.response });
            this.handleOnSendMessage(payload.response, '', true);
        }
    }

    handleFeedback = async (selectedFeedback) => {
        this.handleServerRequests(selectedFeedback, "", false, false, false, true);
    }

    handleQuickReply = async (payload) => {
        const updatedChats = this.state.chats.map((chat, index) => {
            if (index === payload.index) {
                chat.isMenuDisabled = true;
            }
            return chat;
        });

        this.setState({
            chats: updatedChats
        });
        if (payload.response === CARD_CHOSEN_FOR_BLOCK_CARD || payload.response === CARD_CHOSEN_FOR_UNBLOCK_CARD) {
            await this.addNewChatConversation({ message: payload.responseText });
            this.blockUnblockCardKey = payload.key;
            ChatBotUtils.setCardKey(payload.key);
            this.handleOnSendMessage(payload.response, '', true);
        } else {
            await this.addNewChatConversation({ message: payload.responseText });
            this.handleOnSendMessage(payload.response, '', true);
            if (ChatBotUtils.checkIfDemarcationPresent) {
                this.setState({
                    checkIfDemarcationPresent: false
                });
                ChatBotUtils.IsDemarcationPresent(this.state.checkIfDemarcationPresent)
                this.setInactivityTimer();
            }
        }
    }

    callInactivityTimer = () => {
        if (ChatBotUtils.checkIfDemarcationPresent) {
            this.setState({
                checkIfDemarcationPresent: false
            });
            ChatBotUtils.IsDemarcationPresent(false)
            this.setInactivityTimer();
        }
    }

    addNewChatConversation(
        {
            message = '', chatId = (new Date().getTime()), isUserConversation = true,
            conversationType = 'text', buttons = []
        }
    ) {
        if (isUserConversation) {
            this.setState({ displayMenuChip: false })
        }
        this.setState({
            chats: this.state.chats.concat({
                id: chatId,
                author: {
                    username: isUserConversation ? "You" : "Dimo Bot",
                    id: isUserConversation ? USER_ID : CHAT_BOT_ID,
                    avatarUrl: isUserConversation ? require('../../../images/user.png') : require('../../../images/moto_new.png')
                },
                text: message,
                timestamp: +new Date(),
                type: conversationType,
                buttons
            }),
            showTyping: false
        });
    }

    handleOnSendMessage = (message, event = '', initialMessage = false, endConversationMessage = false, sessionEnded = false, isFeedback = false) => {
        if (navigator.onLine) {
            let actionEvent = {
                eventType: constantObjects.chat,
                page_name: PageNames.chatComponent,
            };
            MetricsService.reportActionMetrics(actionEvent, new Date().getTime());

            if (!this.state.isLanguageSelected && !initialMessage) {
                this.openSnackBar(localeObj.chat_language_required);
                return;
            }

            if (!initialMessage) {
                this.setState({
                    isFirstTimeFAQ: false
                })
                ChatBotUtils.firstFAQ(this.state.isFirstTimeFAQ);
                this.addNewChatConversation({ message: message });
            }

            this.handleServerRequests(message, event, initialMessage, endConversationMessage, sessionEnded, isFeedback);

        } else {
            this.openSnackBar(localeObj.noNetwork);
        }

        if (!endConversationMessage) {
            this.resetInactivityTimer();
        }
    };

    handleServerRequests = (message, event, initialMessage, endConversationMessage, sessionEnded, isFeedback) => {
        let payloadJson = Object.assign({}, {});
        ChatBotUtils.storeSessionID(this.state.sessionId)
        payloadJson.sessionId = ChatBotUtils.sessionID;
        payloadJson.queryText = message;
        payloadJson.event = event;
        payloadJson.locale = device_locale.includes("en") ? this.state.languageBackend.english : this.state.languageBackend.portuguese;
        payloadJson.deviceInfo = this.state.deviceInformation;
        payloadJson.clientKey = ImportantDetails.clientKey;
        payloadJson.accountKey = ImportantDetails.accountKey;
        payloadJson.entryPoint = ChatBotUtils.insideChat;
        payloadJson.webviewVersion = deploymentVersion.version;
        payloadJson.via = MetricsService.getAppEnterVia();
        const encryptedPayload = this.handleConversationEncryption(payloadJson);

        axios.create({}).request({
            method: 'post',
            url: this.state.selectedLanguageUrl,
            data: encryptedPayload,
            headers: { 'Content-Type': 'application/json' }
        })
            .then((response) => {
                if (!endConversationMessage) {
                    this.resetInactivityTimer();
                }
                //Log.sDebug('CHATBOT: handleServerRequests and encryptedPayload start');
                const decryptedResponse = this.handleConversationDecryption(response.data);
                //Log.sDebug('CHATBOT: handleServerRequests and handleConversationDecryption end');
                if (response.status !== 200) {
                    this.openSnackBar(this.state.tryAgainLater);
                    Log.sError("Not able to submit chat: " + JSON.stringify(decryptedResponse));
                    return;
                }
                const chatId = new Date().getTime();
                let responseData = decryptedResponse;
                let responseToUser = responseData.responseToUser;
                let transactionTypeFromUser = responseToUser.apiParams && responseToUser.apiParams.Transaction_Type;
                if (transactionTypeFromUser === null) {
                    return;
                }
                else if (transactionTypeFromUser === "CELLULAR RECHARGE") {
                    this.setState({
                        transactionType: "recharge"
                    });
                }
                else if (transactionTypeFromUser === "ATM WITHDRAWAL") {
                    this.setState({
                        transactionType: "atm"
                    });
                }


                let textualResponse = '';
                let responseType = 'text';
                let buttons = [];
                let useCase = '';

                this.toggleChatInputBoxVisibility(!endConversationMessage);

                if (
                    GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.type, false)
                    && GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.processingApis, false)
                    && responseToUser.type === 'preProcess'
                ) {
                    responseType = 'indicator';
                    this.processChatApis(chatId, responseToUser).then(() => { });
                }
                else if (
                    GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.type, false)
                    && GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.payload, false)
                    && (responseToUser.type === BUTTON_TYPE_QUICK_REPLY || responseToUser.type === BUTTON_TYPE_URL)
                ) {
                    responseToUser.type === BUTTON_TYPE_QUICK_REPLY && this.toggleChatInputBoxVisibility();
                    if (GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.payload.choices, false)) {
                        responseToUser.payload.choices.forEach((choice) => {
                            choice.payloadKey = responseToUser.payloadKey ?? '';
                            choice.internal = choice.isItInternal;
                            choice.payload = responseToUser.type === BUTTON_TYPE_URL ? choice.Link : choice.returnText;
                            choice.type = responseToUser.type;
                            choice.title = choice.displayText;
                            // choice.icon = choice.icon;
                        });
                        this.setState({ displayMenuChip: false });
                    }
                    if (responseToUser.payload.context === "main_menu") {
                        this.setState({ isMainMenu: true });
                    }
                    else {
                        this.setState({ isMainMenu: false, displayMenuChip: true });
                    }

                    if (responseToUser.payload.tag === "FAQ_MENU") {
                        this.setState({
                            isFirstTimeFAQ: true,
                            isFAQ: true,
                            displayMenuChip: false
                        })
                        ChatBotUtils.firstFAQ(this.state.isFirstTimeFAQ);
                    }

                    useCase = GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.payload.useCase, '');
                    textualResponse = GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.payload.textToBeShownToUser, '');
                    buttons = GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.payload.choices, []);
                    if (responseToUser.isItOptional) {
                        this.setState({ hideKeyboard: false });
                        this.toggleChatInputBoxVisibility(true);
                    } else {
                        this.setState({ hideKeyboard: true });
                        this.toggleChatInputBoxVisibility(false);
                    }
                }
                else if (
                    GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.type, false)
                    && GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.payload, false)
                    && (responseToUser.type === "TOAST")
                ) {
                    responseToUser.type === "TOAST" && this.toggleChatInputBoxVisibility();
                    this.setState({
                        feedbackSnackbar: GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.payload.textToBeShownToUser, '')
                    })
                    this.openSnackBar(this.state.feedbackSnackbar);
                }
                else if (GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.payload, false)) {
                    this.setState({
                        hideKeyboard: false
                    })
                    if (GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.backendResult, false)) {
                        textualResponse = GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.backendResult, '');
                    }
                    else {
                        textualResponse = GeneralUtilities.notEmptyNullUndefinedCheck(responseToUser.payload.textToBeShownToUser, '');
                        document.querySelector('.react-chat-textarea').focus();
                        this.toggleChatInputBoxVisibility(true);
                    }
                }
                let statsData = { sessionId: responseData.sessionId ?? 'e41b54d1-a809-43b9-9a9b-bdc00bd198d1' };

                if (initialMessage) {
                    statsData = { ...statsData, chatStarted: true };
                }

                this.setState(statsData);

                if (!isFeedback) {
                    this.addNewChatConversation({
                        message: textualResponse,
                        chatId,
                        isUserConversation: false,
                        conversationType: responseType
                    });
                }

                this.setState({
                    checkUseCase: useCase,
                    demarcation: responseToUser.payload.sessionEnded
                })

                if (buttons.length > 0) {
                    this.addNewChatConversation({
                        message: '',
                        chatId,
                        buttons,
                        isUserConversation: false,
                        conversationType: responseType
                    });
                }

                if (sessionEnded) {

                    this.setState({
                        chats: this.state.chats.concat({
                            id: new Date().getTime(),
                            timestamp: +new Date(),
                            type: "demarcation",
                            text: localeObj.chatbot_exit_message,
                            addLine: true
                        })
                    });
                    this.setState({
                        checkIfDemarcationPresent: true,
                        demarcationChip: true,
                        sessionId: "",
                        hideKeyboard: true,
                        displayMenuChip: false
                    })
                    this.toggleChatInputBoxVisibility(false);
                    ChatBotUtils.IsDemarcationPresent(this.state.checkIfDemarcationPresent)
                }

                if (this.state.demarcation && !sessionEnded) {
                    this.setState({
                        chats: this.state.chats.concat({
                            id: new Date().getTime(),
                            timestamp: +new Date(),
                            type: "demarcation",
                            text: localeObj.chatEndMessage,
                            addLine: true
                        })
                    });
                    this.setState({
                        checkIfDemarcationPresent: true,
                        demarcationChip: true,
                        sessionId: "",
                        hideKeyboard: true,
                        displayMenuChip: false
                    })
                    this.toggleChatInputBoxVisibility(false);
                    ChatBotUtils.IsDemarcationPresent(this.state.checkIfDemarcationPresent)
                }

                if (responseData.endConversation) {
                    this.timeoutHandleOne = setTimeout(() => {
                        this.handleOnSendMessage('', 'END_CONVERSATION_EVENT', true);
                    }, 300);
                }
            })
            .catch(err => {
                this.setState({ displayMenuChip: false })
                this.hideProgressDialog();
                if (!this.state.isProcessChatApis) {
                    this.openSnackBar(localeObj.error_message);
                }
                Log.sError("Not able to submit chat: " + JSON.stringify(err));
            });
    }

    moveToTransaction = (type, trnxIndex) => {
        ChatBotUtils.storetrnxIndex(trnxIndex);
        ChatBotUtils.storeSessionID(this.state.sessionId);
        ChatBotUtils.storeDeviceInfo(this.state.deviceInformation);
        ChatBotUtils.storeMenuChip(this.state.displayMenuChip);
        ChatBotUtils.isHideKeyboard(this.state.hideKeyboard);
        ChatBotUtils.setChats(this.state.chats);
        MetricsService.onPageTransitionStop(PageNames.chatComponent, PageState.close);
        this.props.history.replace({
            pathname: '/newTransactionHistory',
            transition: "left",
            from: "chatBot",
            type: this.state.transactionType,
            checkUseCase: this.state.checkUseCase,
            feature: type,
            balanceData: { "balance": ImportantDetails.walletBalance, "decimal": ImportantDetails.decimal }
        })
    }

    moveToPixLimit = () => {
        ChatBotUtils.storeSessionID(this.state.sessionId);
        ChatBotUtils.storeDeviceInfo(this.state.deviceInformation);
        ChatBotUtils.storeMenuChip(this.state.displayMenuChip);
        ChatBotUtils.isHideKeyboard(this.state.hideKeyboard);
        ChatBotUtils.setChats(this.state.chats);
        MetricsService.onPageTransitionStop(PageNames.chatComponent, PageState.close);
        this.props.history.replace({
            pathname: '/pixLimits',
            transition: "left",
            from: "chatBot"
        })
    }

    invokeMenu = () => {
        this.toggleChatInputBoxVisibility(false);
        this.timeoutHandleOne = setTimeout(() => {
            this.setState({
                isFAQ: false
            })
        }, 100);
        this.handleOnSendMessage('', 'Welcome', true);
    }

    selectedThankYouChip = () => {
        if (this.state.isThankYouChipDisabled) {
            return;
        }
        this.setState({
            isThankYouChipDisabled: true
        });
        this.timeoutHandleOne = setTimeout(() => {
            this.addNewChatConversation({ message: localeObj.thankyouChip })
            this.handleOnSendMessage('', 'END_CONVERSATION', true, true, false);
            this.setState({
                isFAQ: false,
                isThankYouChipDisabled: false,
                displayMenuChip: false
            })
        }, 300);
    }

    selectedMenuChip = () => {
        if (this.state.isMenuChipDisabled) {
            return;
        }
        this.setState({
            isMenuChipDisabled: true
        });
        this.timeoutHandleOne = setTimeout(() => {
            this.addNewChatConversation({ message: localeObj.MainMenuChip });
            this.invokeMenu()
            this.setState({
                isFAQ: false,
                displayMenuChip: false,
                isMenuChipDisabled: false
            })
        });
    }

    handleMenuButton = () => {
        this.timeoutHandleOne = setTimeout(() => {
            this.invokeMenu()
            this.setState({
                isFAQ: false,
                demarcationChip: false
            })
        }, 300);
    }

    getTicket = () => {
        ChatBotUtils.insideChatBot(constantObjects.chatbot_entrypoint);
        ChatBotUtils.storeSessionID(this.state.sessionId);
        ChatBotUtils.storeDeviceInfo(this.state.deviceInformation);
        ChatBotUtils.storeMenuChip(this.state.displayMenuChip);
        ChatBotUtils.isHideKeyboard(this.state.hideKeyboard);
        ChatBotUtils.storeDemarcationChip(this.state.demarcationChip)
        ChatBotUtils.IsDemarcationPresent(this.state.checkIfDemarcationPresent);
        ChatBotUtils.isFAQOnback(this.state.isFAQ);
        ChatBotUtils.firstFAQ(this.state.isFirstTimeFAQ);
        ChatBotUtils.setChats(this.state.chats);
        MetricsService.onPageTransitionStop(PageNames.chatComponent, PageState.close);
        this.props.history.replace({
            pathname: '/ChatTicketDisplay',
            transition: "left",
            from: "chatBot"
        })
    }

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
        } else if (fileExtension === 'jpg') {
            mimeString = 'image/jpg';
        } else {
            this.openSnackBar(localeObj.invalid_file);
            return;
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
            this.finalUpload(mimeString);
        }

        this.setState({
            image: image,
            convertedblobs: convertedblobs,
            filename: filename
        });

    }

    fetchImage = () => {
        let currentVersion = androidApiCalls.getAppVersion();
        let targetVersion = constantObjects.target_version;
        if (androidApiCalls.getSDKVersion() < 33) {
            if (androidApiCalls.checkSelfPermission(READ_EXT_STORAGE_PERMISSION) === 0) {
                if (currentVersion >= targetVersion) {
                    androidApiCalls.uploadImageChatBot(mime_type);
                }
                else {
                    androidApiCalls.uploadImage(false);
                }
            } else {
                androidApiCalls.requestPermission(READ_EXT_STORAGE_PERMISSION);
                if (!androidApiCalls.shouldShowRequestPermissionRationale(READ_EXT_STORAGE_PERMISSION)) {
                    this.setState({
                        showSnackBar: true
                    });
                }
            }
        } else {
            if ((androidApiCalls.checkSelfPermission(READ_EXT_STORAGE_PERMISSION) === 0) || (androidApiCalls.checkSelfPermission(READ_MEDIA_IMAGES_PERMISSION) === 0)) {
                if (currentVersion >= targetVersion) {
                    androidApiCalls.uploadImageChatBot(mime_type);
                }
                else {
                    androidApiCalls.uploadImage(false);
                }
            } else {
                androidApiCalls.requestPermission(READ_EXT_STORAGE_PERMISSION);
                if (!androidApiCalls.shouldShowRequestPermissionRationale(READ_EXT_STORAGE_PERMISSION)) {
                    this.setState({
                        showSnackBar: true
                    });
                }
            }
        }
    }

    getSignedURL = async (mimeString, extension, finalFilename) => {
        let jsonObject = {
            "objectName": finalFilename,
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

    finalUpload = async (mimeString) => {
        let curr_time = new Date();
        let extension = '';
        if(mimeString === 'image/png'){
            extension = '.png';
        } else if(mimeString === 'application/pdf'){
            extension = '.pdf';
        } else if(mimeString === 'image/jpeg'){
            extension = '.jpeg'; 
        } else if(mimeString === 'image/jpg'){
            extension = '.jpg'; 
        } else {
            this.openSnackBar(localeObj.invalid_file);
        }

        let finalFilename = ImportantDetails.clientKey + curr_time.getTime() + extension;

        await Promise.all([await this.getSignedURL(mimeString, extension, finalFilename)])
            .then(values => {
                let uploadUrl = values;
                apiService.uploadImageFromChatBot(uploadUrl, this.state.convertedblobs, mimeString).then(() => {
                    const updatedChats = this.state.chats.map((chat, index) => {
                        if (index === this.state.attachImageIndex) {
                            chat.isMenuDisabled = true;
                        }
                        return chat;
                    });

                    this.setState({
                        chats: updatedChats
                    });
                    this.setState({
                        showTyping: false
                    })
                    this.addNewChatConversation({ message: this.state.filename + " " + localeObj.upload_success, isUserConversation: false });
                    this.handleServerRequests(finalFilename, "", false);
                    Log.debug(finalFilename + 'uploaded successfully.');
                }).catch(err => {
                    Log.debug(finalFilename + 'upload failed with error => ' + err + '. Retrying once');
                    apiService.uploadImageFromChatBot(uploadUrl, this.state.convertedblob, mimeString).then(() => {
                        const updatedChats = this.state.chats.map((chat, index) => {
                            if (index === this.state.attachImageIndex) {
                                chat.isMenuDisabled = true;
                            }
                            return chat;
                        });

                        this.setState({
                            chats: updatedChats
                        });

                        this.addNewChatConversation({ message: this.state.filename + " " + localeObj.upload_success, isUserConversation: false });
                        this.handleServerRequests(finalFilename, "");
                        Log.debug(finalFilename + 'uploaded successfully after retry.');
                    }).catch(err => {
                        this.openSnackBar(localeObj.image_upload_failed);
                        this.handleOnSendMessage('', 'MONEY_NOT_CREDITED_OUTSIDE_DIMO_ATTACH_FILE_FAILED', true);
                        Log.debug(' upload failed for ' + finalFilename + ' ' + err);
                    })
                })
            }).catch(err => {
                Log.debug("errors are : " + JSON.stringify(err));
            });
    }

    render() {
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        const chatInputBoxHeight = screenHeight - 155;

        return (
            <div>
                <div>
                    <ButtonAppBar header={localeObj.chat} onBack={this.onBack} action="more" onViewTickets={this.getTicket} />

                    {!this.state.chatStarted
                        ? <CustomizedProgressBars />
                        : <ChatBox
                            messages={this.state.chats}
                            userId={USER_ID}
                            onSendMessage={this.handleOnSendMessage}
                            handleQuickReply={this.handleQuickReply}
                            handleRerouting={this.handleRerouting}
                            handleFeedback={this.handleFeedback}
                            endConversation={this.selectedThankYouChip}
                            menu={this.selectedMenuChip}
                            ticket={this.getTicket}
                            showMenuChip={this.state.checkIfDemarcationPresent ? false : (this.state.isFirstTimeFAQ ? this.state.isFAQ : false)}
                            showChips={this.state.checkIfDemarcationPresent ? false : (this.state.isFirstTimeFAQ ? false : this.state.isFAQ)}
                            showMainMenuChip={this.state.isMainMenu || this.state.checkIfDemarcationPresent || this.state.isFAQ ? false : this.state.displayMenuChip}
                            width={`${screenWidth}px`}
                            height={`${this.state.keyboardOpened ? (chatInputBoxHeight - this.state.keyboardSize) : chatInputBoxHeight}px`}
                            showTypingIndicator={this.state.showTyping}
                            authorToDepict={{ username: 'Dimo Bot', id: CHAT_BOT_ID, avatarUrl: null }}
                            placeholder={localeObj.type_query}
                            callTimer={this.callInactivityTimer}
                            handleMenuButton={this.handleMenuButton}
                            displayDemarcationChip={this.state.demarcationChip}
                            hideKeyboard={this.state.hideKeyboard}
                        />}

                </div>
                {this.state.storagePermissionAlert &&
                    <AlertDialog title={localeObj.allow_storage_title} description={localeObj.allow_storage}
                        positiveBtn={localeObj.grant_permission} neagtiveBtn={localeObj.deny_permission}
                        handleClose={this.closestoragePermissionAlertDialog} />
                }
                <MuiThemeProvider theme={InputThemes.snackBarTheme}>
                    <Snackbar open={this.state.snackBarOpen} autoHideDuration={constantObjects.SNACK_BAR_DURATION} onClose={this.closeSnackBar}>
                        <MuiAlert elevation={6} variant="filled" icon={false}>{this.state.snackBarMessage}</MuiAlert>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}
ChatComponent.propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
}

export default withStyles(styles)(ChatComponent);
