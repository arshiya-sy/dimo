const constantObjects = Object.freeze({

    //enable features from webview
    featureEnabler: {
        ENABLE_EMAIL_AUTOPOPULATE: true,
        ENABLE_PHONE_AUTOPOPULATE: true,
        ENABLE_DOGFOOD_LOGGING: false, //set true for Int DF & Ext DF release
        PROD_ORGID: 10, // Set 195 for Int DF release & 10 for Ext DF release
        CAF_ENABLED: true,
        DISABLE_CHATBOT: false, // Enabled chatbot in Production - DON'T CHANGE
        DISABLE_GAMIFICATION: false, // Enabled gamification in Production - DON'T CHANGE
        CREDIT_CARD_ENABLED: true, // Enabled Credit Card in production - DON'T CHANGE
        GIFT_CARD_ENABLED: true
    },
    
    CANCEL_ALERT_DURATION: 1000,
    TOO_SHORT_DURATION: 1500,
    SHORT_SNACK_DURATION: 2000,
    SNACK_BAR_DURATION: 4000,
    LONG_SNACK_DURATION: 7000,
    EXPIRY_ERROR: "Senha inválida. Sua senha foi bloqueada",
    DOC_TYPE: Object.freeze({ RG: 1, CNH: 2, RNE: 3 }),

    stateMapping: Object.freeze({
        "AC": "Acre",
        "AL": "Alagoas",
        "AM": "Amazonas",
        "AP": "Amapá",
        "BA": "Bahia",
        "CE": "Ceará",
        "DF": "Distrito Federal",
        "ES": "Espírito Santo",
        "GO": "Goiás",
        "MA": "Maranhão",
        "MG": "Minas Gerais",
        "MS": "Mato Grosso do Sul",
        "MT": "Mato Grosso",
        "PA": "Pará",
        "PB": "Paraíba",
        "PE": "Pernambuco",
        "PI": "Piauí",
        "PR": "Paraná",
        "RJ": "Rio de Janeiro",
        "RN": "Rio Grande do Norte",
        "RO": "Rondônia",
        "RR": "Roraima",
        "RS": "Rio Grande do Sul",
        "SC": "Santa Catarina",
        "SE": "Sergipe",
        "SP": "São Paulo",
        "TO": "Tocantins",
    }),

    //APP ENTERY POINTS
    pixSend: "PAYMENT VIA PIX SEND",
    pixQR: "PAYMENT VIA SCAN PIX QR CODE",
    pixQRPaste: "PAYMENT VIA PIX QR CODE PASTE",
    pixReceive: "RECEIVE VIA PIX QR",
    tedInternal: "PAYMENT VIA TED INTERNAL",
    tedExternal: "PAYMENT VIA TED EXTERNAL",
    boletoManual: "PAYMENT VIA BOLETO MANUAL ENTRY",
    boletoScan: "PAYMENT VIA BOLETO SCAN",
    fgtsFromSimulte: "FGTS ANTICIPATE FROM SIMULATE PAGE",
    fgtsFromAnticipate: "FGTS ANTICIPATE FROM FGTS HOME PAGE",

    //Button Metrics
    hideBalance: "HIDE_BALANCE",
    showBalance: "SHOW_BALANCE",
    walletPageEvent: "OPEN_",
    customerCare: "CALL CUSTOMER CARE",
    copyAccountDetails: "COPY ACCOUNT DETAILS",
    submitFeedback: "SUBMIT FEEDBACK",
    chat: "CHAT SUPPORT",
    privacy: "VIEW PRIVACY CONTRACT",
    tos: "VIEW GENERIC TERMS CONTRACT",
    tor: "VIEW TERMS OF RESIDENCE CONTRACT",
    firstAccess: "FIRST ACCESS ",
    cellularRecharge: "CELLULAR RECHARGE SMARTALERT CLICK",
    creditCard: "INVOICE DUE PAYMENT SMARTALERT CLICK",
    boleto: "BOLETO BILL PAYMENT SMARTALERT CLICK",
    cashin: "CASHIN SMARTALERT CLICK",

    //fgts event mertics
    fgtsTutorial: "VIEW FGTS TUTIORAL",
    fgtsStopTutorial: "CLOSE FGTS TUTORIAL",
    fgtsAnticipageValue: "FGTS ANTICIPATE VALUE",
    fgtsAnticipateCancel: "FGTS ANTICIPATE CANCEL",
    fgtsAnticipateNotRightNow: "FGTS ANTICIPATE NOT RIGHT NOW",
    fgtsAnticipateComplete: "FGTS ANTICIPATE COMPLETE",
    fgtsTutorialNextPage: "VIEW NEXT FGTS TUTORIAL PAGE",
    fgtsTutorialPrevPage: "VIEW PREVIOUS FGTS TUTORIAL PAGE",
    fgtsInstallmentTable: "VIEW sIMULATE INSTALLMENT TABLE",
    fgtsDefineOtherValue: "FGTS SIMUATE WITH NEW VALUE",
    fgtsSelectOption: "FGTS USER SELECT",
    fgtsDownloadContract: "FGTS DOWNLOAD CONTRACT",
    fgtsShareContract: "FGTS SHARE CONTRACT",
    googlePay: "GOOGLE PAY",
    moreOptions: "MORE CARD OPTIONS",
    addCardToGooglePay: "ADD CARD TO GOOGLE PAY",
    removeCardFromGooglePay: "REMOVE CARD FROM GOOGLE PAY",
    setCardAsDefaultCardInGPay: "SET CARD AS DEAFAULT CARD IN GPAY",
    installGPay: "INSTALL GPAY",
    backToGPay: "BACK TO GOOGLE PAY",
    addVCardToGpay: "ADD VIRTUAL CARD TO GPAY",

    //Credit card event metrics
    investConfirm: "CREDIT CARD INVESTMENT CONFIRM",
    amountEnter: "CREDIT CARD ENTER AMOUNT CONFIRM",
    sendPix: "CREDIT CARD SEND PIX TO MY ACCOUNT",
    dueDate: "CREDIT CARD SELECT DUE DATE",
    acceptContract: "CREDIT CARD ACCEPT CONTRACT",
    inputPin: "CREDIT CARD INPUT PIN",
    facematch: "CREDIT CARD START FACEMATCH",
    facematchSuccess: "CREDIT CARD FACE MATCH SUCCESS",
    expandCreditCardHomeDetails: "CREDIT CARD HOME PAGE MORE DETAILS",
    contractCreditCardHomeDetails: "CREDIT CARD HOME PAGE LESS DETAILS",
    creditCardSettings: "CREDIT CARD SETTINGS",
    creditCardInvoicePayment: "CREDIT CARD INVOICE PAYMENT",
    creditCardBlockedInvoicePayment: "CREDIT CARD BLOCKED INVOICE PAYMENT",
    creditCardInvoiceDetails: "CREDIT CARD INVOICE DETAILS",
    creditCardOpenMyCards: "CREDIT CARD OPEN MY CARDS",
    creditCardChangeDueDate: "CREDIT CARD SETTINGS CHANGE DUE DATE",
    creditCardChangeAutomaticDebit: "CREDIT CARD SETTINGS CHANGE AUTOMATIC DEBIT",

    //Gift card event metrics
    confirmForm: "GIFT CARD CONFIRM INFORMATION",
    mayBeLaterForm: "GIFT CARD FORM MAY BE LATER",
    acceptGCCreation: "GIFT CARD ACCEPT AND CLAIM REWARD",
    newJourneyPrimary: "ADD YOUR DIMO CARD TO GPAY",
    newJourneySecondary: "ADD PAYMENT CARD TO GPAY",
    gcInEligiblePrimary: "GET DIMO CREDIT CARD",
    gcInEligibleSecondary: "BACK TO HOME",
    wantDimoAccount: "I WANT A DIMO ACCOUNT",
    claimReward: "GIFT CARD CLAIM REWARD",
    mayBeLater: "GIFT CARD MAY BE LATER",

    //onboarding error
    issueDateError: "ISSUE DATE MORE THAN 10 YRS",

    //virtual card event metrics
    vCardLearnMore: "VIRTUAL CARD LEARN MORE",
    vCardView: "VIRTUAL CARD VIEW CARD",
    vCardGpay: "VIRTUAL CARD GPAY",
    vCardBlock: "VIRTUAL CARD BLOCK",
    vCardUnblock: "VIRTUAL CARD UNBLOCK",
    vCardDelete: "VIRTUAL CARD UNBLOCK",
    vCardSuccess: "VIRTUAL CARD SUCCESS CANCEL OPTION",

    actionButton: "Button_Metrics",
    pageMetrics: "Page_Metrics",
    sessionMetrics: "Session_Metrics",
    sessionMetricMarkedBy: "Webview",

    //fgtsBalance
    minFgtsBalance: 50.00,
    maxFgtsBalance: 50000.00,
    minFgtsValue: 50.00,

    //Salary portability
    viewPortabilityRequests: "VIEW REQUESTS",
    requestPortability: "REQUEST PORTABILITY",
    cancelPortability: "CANCEL PORTABILITY REQUEST",
    triggerPortability: "ENTER PORTABILITY",

    //Contacts
    saveContactAfterTransaction: "SAVE NEW CONTACT AFTER A SUCCESSFUL TRANSACTION",

    //Card requests
    migrateToVisa: "MIGRATE TO VISA",
    migrationSuccess: "MIGRATION SUCCESSFUL",
    requestCreditCard: "REQUEST CREDIT CARD",

    //Smart Financing
    smartFinancing: "SMART FINANCING",
    seeDetails: "SEE DETAILS",
    seeInstallments: "SEE INSTALLMENTS",

    //Google pay
    CARD_NETWORK_ELO: 12,
    TSP_ELO: 14,
    CARD_NETWORK_VISA: 4,
    TSP_VISA: 4,

    //Chatbot 
    home_page_entrypoint: "FROM_HOME_PAGE",
    user_profile_entrypoint: "FROM_USER_PROFILE",
    chatbot_entrypoint: "FROM_CHATBOT",
    pix_send_entrypoint: "FROM_PIX_LIMIT",
    pix_error_entrypoint: "FROM_PIX_TRANSACTION_ERROR",
    transaction_receipt_entrypoint: "FROM_TRANSACTION_RECEIPT",
    fgts_contracts_entrypoint: "FROM_FGTS_CONTRACTS",
    atm_card_entrypoint: "FROM_ATM_WITHDRAW",
    pix_limit_entrypoint: "FROM_PIX_LIMIT",
    credit_card_settings: "FROM_CREDIT_CARD_SETTINGS",
    invoice_details_entrypoint: "FROM_INVOICE_DETAILS",
    atm_bottomcard_entrypoint: "FROM_ATM_BOTTOMCARD",
    button_liked: "Like",
    button_disliked: "Dislike",
    user_ticket_id: "676659000013267643",
    target_version: 179690,
    ticket_closed_status: "Fechado",
    open_help_page: "OPEN_HELP_PAGE",
    open_whatsapp: "OPEN_WHATSAPP",
    copy_code: "COPY_CODE",
    creditCardHomePage: "FROM_CREDIT_CARD_HOME_PAGE",
    entrypoint_card: "ENTRYPOINT_CARD",
    entrypoint_dialog: "ENTRYPOINT_DIALOG",
    entrypoint_reel: "ENTRYPOINT_REEL",
    entrypoint_instant_dialog: "ENTRYPOINT_INSTANT_DIALOG",

    //Insurance
    insurance_entrypoint: "OPEN_INSURANCE_PAGE",

    //QRWidgetPage
    qrWidgetFeatureFlag: "SCAN_QR_WIDGET",

    //default_loggerJSON
    loggerDefaultJSON: {
        "logViaScheduler": false,
        "schedulerFrequency": 24,
        "logLengthLimitWhileUsingApp": 2000,
        "arbiLogLengthLimit": 6000,
        "logLengthLimitWhileClosingAp": 20000,
        "sendPageLogs": true,
        "sendAlertLogs": true,
        "sendArbiLogs": true,
        "sendErrorLogs": true,
        "sendSessionLogs": true,
        "oldLogLimit": 100,
        "sendDimoAnalytics": true
    },

    //Gamification
    Gamification: {
        'onboarding': 'GAMIFICATION_ONBOARDING',
        'onboardingForward': 'GAMIFICATION_ONBOARDING_FORWARD',
        'onboardingBackward': 'GAMIFICATION_ONBOARDING_BACKWARD',
        'skipOnboarding': 'GAMIFICATION_SKIP_ONBOARDING',
        'completeOnboarding': 'GAMIFICATION_COMPLETE_ONBOARDING',

        'allPrizes': 'GAMIFICATION_ALL_PRIZES',
        'redeemDrawReward': 'GAMIFICATION_REDEEM_DRAW_REWARD',
        'redeemRewardTncUrl': 'GAMIFICATION_REDEEM_REWARD_TNC_URL',

        'programsListing': 'GAMIFICATION_PROGRAMS_LISTING',
        'programDetails': 'GAMIFICATION_PROGRAM_DETAILS',
        'seeAllLuckyNumbers': 'GAMIFICATION_SEE_ALL_LUCKY_NUMBERS',
        'seeAllCoupons': 'GAMIFICATION_SEE_ALL_COUPONS',
        'programTncUrl': 'GAMIFICATION_PROGRAM_TNC_URL',

        'drawDetails': 'GAMIFICATION_DRAW_DETAILS',
        'seeDrawWinner': 'GAMIFICATION_SEE_DRAW_WINNER',
        'revealCode': 'GAMIFICATION_REVEAL_CODE',
        'gamificationHome': 'GAMIFICATION_HOME',

        'completedProgramOverview': 'GAMIFICATION_COMPLETED_PROGRAM_OVERVIEW',
        'drawHistoryListing': 'GAMIFICATION_DRAW_HISTORY_LISTING',
        'drawHistoryDetails': 'GAMIFICATION_DRAW_HISTORY_DETAILS',

        'completedPrograms': 'GAMIFICATION_COMPLETED_PROGRAMS',
        'showInstantDialog': 'GAMIFICATION_SHOW_INSTANT_DIALOG',
        'closeInstantDialog': 'GAMIFICATION_CLOSE_INSTANT_DIALOG',
        'progressInstantDialog': 'GAMIFICATION_PROGRESS_INSTANT_DIALOG',

        'shareProgramDetails': 'GAMIFICATION_SHARE_PROGRAM_DETAILS',
        'shareDrawWinner': 'GAMIFICATION_SHARE_DRAW_WINNER',

        'learnHowToParticipate': 'GAMIFICATION_LEARN_TO_PARTICIPATE',
        'getRewards': 'GAMIFICATION_GET_REWARDS',
    },

    // Unblock Account
    UnblockAccount: {
        'closeAppBar': 'UNBLOCK_CLOSE_APP_BAR',
        'backToHome': 'UNBLOCK_BACK_TO_HOME',
        'tryAgain': 'UNBLOCK_TRY_AGAIN',
        'unblockAccountSecurityNext': 'UNBLOCK_ACCOUNT_SECURITY_NEXT',
        'unblockAccountSelfieInfoStart': 'UNBLOCK_ACCOUNT_SELFIE_INFO_START',
        'unblockAccountFaceMatch': 'UNBLOCK_ACCOUNT_START_FACE_MATCH',
        'unblockAccountTakePhoto': 'UNBLOCK_ACCOUNT_TAKE_PHOTO',
        'unblockAccountSendPhoto': 'UNBLOCK_ACCOUNT_SEND_PHOTO',
        'unblockAccountFailedTryAgain': 'UNBLOCK_ACCOUNT_FAILED_TRY_AGAIN',
    },

    //caf SDK unknown message code
    "CAF_MESSAGE_CODE": "50",

    //Log Levels
    LOG_PROD: 2,
    LOG_STAGING: 1,
    LOG_DEV: 0,

    customerCareWADisplay: "55 11 5198 0000",
    customerCareWADialer: "551151980000",
    customerCarePhoneNumberDisplay: "0800 5198 000",
    customerCarePhoneNumberDialer: "08005198000",

    HOME_TAB_NAME: "Wallet",
    OFFERS_TAB_NAME: "DimoClube",

    //Insurance
    DIMO_CODE: "dimo20",
    MINIMAL_APK_VERSION: 179809
});

export default constantObjects
