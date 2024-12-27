import Log from "../../../Services/Log";
import {SymmetricCrypto} from "../../../Services/SymmetricCrypto";
import {AsymmetricCrypto} from "../../../Services/AsymmetricCrypto";
import MetricsService from "../../../Services/MetricsService";
import GeneralUtilities from "../../../Services/GeneralUtilities";

class ChatBotUtils {
    chats = [];
    sessionID= "";
    onbackMinute= "";
    isFAQVal="";
    cardKey="";
    checkIfDemarcationIsPresent= false;
    isPortuguese=false;
    firstTimeFAQ="";
    inChat="";
    isDisabled="";
    disabledMenus= {};
    deviceInformation= "";
    isMenuChip= "";
    shouldHideKeyboard= "";
    mainMenu= "";
    clientKey= "";
    trnxIndex= "";

    resetAllFields() {
        this.chats = [];
        this.sessionID = "";
        this.symmetric = "";
        this.asymmetric = "";
        this.chatLanguage ="";
        this.cardKey = "";
    }

    setChats(chatvals) {
        this.chats = chatvals;
    }

    isFAQOnback(isFaq){
        this.isFAQVal = isFaq;
    }

    isHideKeyboard(hide){
        this.shouldHideKeyboard = hide;
    }

    storeMenuChip(isChip){
        this.isMenuChip = isChip;
    }

    storeDemarcationChip(isChip){
        this.isDemarcationChip = isChip;
    }

    storeIsMainMenu(isMainMenu){
        this.mainMenu = isMainMenu;
    }

    isPortugueseLang(isItPortuguese){
        this.isPortuguese = isItPortuguese;
    }

    onBackTime(onbackMinutes){
        this.onbackMinute = onbackMinutes;
    }

    IsDemarcationPresent(checkIfDemarcationIsPresent){
        this.checkIfDemarcationPresent = checkIfDemarcationIsPresent;
    }

    firstFAQ(firstTimeFAQ){
        this.isFirstTimeFAQ = firstTimeFAQ;
    }

    insideChatBot(inChat){
        this.insideChat = inChat;
    }

    storetrnxIndex(index){
        this.trnxIndex = index;
    }

    disableButtons(isDisabled) {
        this.isButtonDisabled = isDisabled; 
    }

    storeClientKey(clientKey) {
        this.clientKey = clientKey;
    }

    storeDeviceInfo(chatDeviceInformation) {
        Log.sDebug("CHATBOT: Storing deviceInformation");
        this.deviceInformation = chatDeviceInformation;
    }

    storeSessionID(chatSessionID) {
        Log.sDebug("CHATBOT: Storing sessionID");
        this.sessionID = chatSessionID;
    }

    storeChatLanguage(chatLanguage) {
        Log.sDebug("CHATBOT: Storing selected Language");
        this.chatLanguage = chatLanguage;
    }

    setCardKey(key) {
        Log.sDebug("CHATBOT: Storing card key");
        this.cardKey = key;
    }


    initializeAESAlgo = async () => {
        try {
            const publicKey = await MetricsService.extractPublicKey();
            this.symmetric = new SymmetricCrypto();
            this.asymmetric = new AsymmetricCrypto(publicKey);
        } catch (e) {
            Log.Debug("Error initializing AES algorithm");
        }
    }

    formatUnauthorizedTransactionMessage(transaction, localeObj, type) {
        let string_to_backend = transaction.transactionId.toString() + " " + transaction.formatForChatbot + " " + transaction.amount + " " + type;
        let message = localeObj.chatbot_report_unauthorized_header + "\n" +
                      localeObj.chatbot_report_unauthorized_type + " : "+ GeneralUtilities.captitalizeStrings(type) + "\n" +
                      localeObj.transaction_code + " : " + transaction.transactionId.toString() +"\n" +
                      localeObj.date + " : " +  transaction.formatForChatbot +"\n"+
                      localeObj.amount + " : " + transaction.amount
        return ({"sendToBackend": string_to_backend , "showToUser" :message})
    }

}

export default new ChatBotUtils();
