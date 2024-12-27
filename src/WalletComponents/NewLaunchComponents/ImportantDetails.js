import constantObjects from "../../Services/Constants";
import GeneralUtilities from "../../Services/GeneralUtilities";
import Log from "../../Services/Log";


class ImportantDetails {

    // Avoid storing dynamically into this object, so that we have a track of what all is stored in this object
    accountNumber = "";
    agencyNumber = "";
    bankNumber = "";
    accountType = "";
    clientKey = "";
    accessToken = "";
    accessTokenExpiryTime = 0;
    onboardingAcessToken = "";
    onboardingAcessTokenExpiryTime = 0;
    chaveOnboarding = "";
    giftCardAccessToken = "";
    giftCardAccessTokenExpiryTime = 0;
    accountKey = "";
    userName = "";
    cpf = "";
    nickName = "";
    dateOfOpening = "";
    fetchedAccountData = false;
    uploadDocType = constantObjects.DOC_TYPE.RG;
    lastBoletoFetchedDetails = {};
    pendingObj = {};
    transactionEntryPoint = "";
    walletBalance = "";
    walletDecimal = "";
    balanceFetched = false;
    sessionStartTime = new Date().getTime();
    waitListId = "";
    vacancyAvaialable = "";
    pauseStartTime = 0;
    shareEnabled = false;
    virtualCardKey = "";
    dimoPayEntryPoint = "";
    shouldShowCAF = true;
    jwtForCAF = "";
    cancelAccountReason = "";
    componentEntryPoint = "";
    pixKeysResponse = {};
    fromRegisterPixKey = false;
    cardDetailResponse = {};
    creditStatus = -1;
    smartAlert = false;
    latestAlertResp = [];
    alertSessionFlag = true;
    autoDebit = false;
    onboarding_data = {
        rg: {},
        salary: "",
        gender: "",
        genderDisplay: ""
    };


    resetAllFieldsIfUserIsDifferent(clientKey) {
        if (this.isUserDifferentThanTheCurrentOne(clientKey)) {
            this.resetAllFields();
        }
    }

    isUserDifferentThanTheCurrentOne(clientKey) {
        return this.clientKey !== clientKey;
    }

    resetAllFields() {
        this.accountNumber = "";
        this.agencyNumber = "";
        this.bankNumber = "";
        this.accountType = "";
        this.clientKey = "";
        this.accessToken = "";
        this.pendingObj = {};
        this.accessTokenExpiryTime = 0;
        this.giftCardAccessToken = "";
        this.giftCardAccessTokenExpiryTime = 0;
        this.accountKey = "";
        this.userName = "";
        this.cpf = "";
        this.nickName = "";
        this.dateOfOpening = "";
        this.fetchedAccountData = false;
        this.transactionEntryPoint = "";
        this.walletBalance = "";
        this.walletDecimal = "";
        this.balanceFetched = false;
        this.sessionStartTime = new Date().getTime();
        this.virtualCardKey = "";
        this.dimoPayEntryPoint = "";
        this.shouldShowCAF = true;
        this.jwtForCAF = "";
        this.cancelAccountReason = "";
        this.pixKeysResponse = {};
        this.fromRegisterPixKey = false;
        this.cardDetailResponse = {};
        this.creditStatus = -1;
        this.smartAlert = false;
        this.latestAlertResp = [];
        this.alertSessionFlag = true;
        this.autoDebit = false;
        this.onboarding_data = {
            rg: {},
            salary: "",
            gender: "",
            genderDisplay: ""
        };
    }

    resetAccessToken() {
        this.accessToken = "";
        this.accessTokenExpiryTime = 0;
        this.giftCardAccessToken = "";
        this.giftCardAccessTokenExpiryTime = 0;
    }

    setUploadDocType(docType) {
        if (docType) {
            if (docType.toUpperCase() === "CNH") {
                this.uploadDocType = constantObjects.DOC_TYPE.CNH;
                return;
            }else if (docType.toUpperCase() === "RNE") {
                this.uploadDocType = constantObjects.DOC_TYPE.RNE;
                return;
            } else {
                this.uploadDocType = constantObjects.DOC_TYPE.RG;
                return;
            }
        }
    }

    setTransactionEntryPoint(value) {
        this.transactionEntryPoint = value;
    }

    setComponentEntryPoint(contentId, entryPointValue = "") {
        if (entryPointValue) {
            this.componentEntryPoint = entryPointValue;
            return;
        }

        let entryPoint = "";

        if (contentId.indexOf('~#cards') !== -1) {
            entryPoint = constantObjects.entrypoint_card;
        } else if (contentId.indexOf('~#dialog') !== -1) {
            entryPoint = constantObjects.entrypoint_dialog;
        } else if (contentId.indexOf('~#reels') !== -1) {
            entryPoint = constantObjects.entrypoint_reel;
        }

        this.componentEntryPoint = entryPoint;
    }

    resetComponentEntryPoint() {
        if (GeneralUtilities.isNotEmpty(this.componentEntryPoint)) {
            this.componentEntryPoint = "";
        }
    }

    setBalance(balance, decimal) {
        if(this.balanceFetched){
            this.walletBalance = balance;
            this.walletDecimal = decimal;
        }
    }

    setTimeTakenForLaunch() {
        this.appLoadTime = new Date().getTime();
        Log.sDebug("User notices first page at " + this.appLoadTime);
    }

    setSessionStartTimers() {
        this.sessionStartTime = new Date().getTime();
    }

    setVirtualCardKey(key) {
        this.virtualCardKey = key;
    }

    setPauseTimers() {
        this.pauseStartTime = new Date().getTime();
    }

    setCAFAllowed(cafPermission, error) {
        Log.sDebug("CAF set to false because of sdk crash" + error)
        this.shouldShowCAF = cafPermission;
    }

    saveCancelAccountReason(reason) {
        this.cancelAccountReason = reason
    }
}

export default new ImportantDetails();
