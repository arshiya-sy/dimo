const PageNames = Object.freeze({
  //landing page
  intro: "INTRO",

  //login page,
  login: {
    "cpf": "LOGIN ENTER CPF",
    "password": "LOGIN ENTER PASSWORD",
    "error": "LOGIN ERROR",
    "clientRejected": "ONBOARD CLIENT REJECTED INFO,",
    "clientRejectedMultipleReasons": "ONBOARD CLIENT REJECTED MULTIPLE REASONS INFO",
    "resumeOnboarding": "ONBBOARD RESUME INFO"
  },

  //personal info screen
  personalInfo: {
    "start": "ONBOARD ACCEPT  PRIVACY",
    "privacy": "ONBOARD TERMS AND PRIVACY COMPONENT",
    "custom": "ONBOARD CUSTOMER CARE DETAILS",
    "end": "ONBOARD PERSONAL INFO INTRO"
  },

  //userId Creation
  userId: {
    "name": "ONBOARD ENTER NAME",
    "cpf": "ONBOARD ENTER CPF",
    "email": "ONBOARD ENTER EMAIL",
    "phoneNumber": "ONBOARD ENTER PHONENUMBER",
    "password": "ONBOARD ENTER PASSWORD",
    "notification": "ONBOARD FIRST ACCESS PUSH NOTIFICATION OPTIN",
    "repeatPassword": "ONBOARD CONFIRM PASSWORD"
  },

  motoPayValueProps: "INTRO DISPLAY VALUE PROPS",

  //identification page
  identificationInfo: "ONBOARD DOCUMENT UPLOAD INTRO",

  //New device login
  newDeviceLogin: "NEW_DEVICE_LOGGING_IN",

  //Non moto device login
  nonMotoDeviceLogin: "NON_MOTO_DEVICE_LOGGING_IN",

  //identity
  identityData: {
    "doc": "ONBOARD SELECT DOCUMENT TYPE",
    "tips": "ONBOARD DOCUMENT UPLOAD TIPS",
    "photo": "ONBOARD UPLOAD FRONT DOC INFO",
    "caf": "ONBOARD UPLOAD CAF DOCUMENT UPLOAD PAGE",
    "upload_file": "ONBOARD UPLOAD FILE DOCUMENT"
  },

  //doc upload
  doumentUpload: {
    "front": "ONBOARD UPLOAD FRONT DOC TAKE PHOTO",
    "frontReview": "ONBOARD UPLOAD FRONT DOC REVIEW PHOTO",
    "back": "ONBOARD UPLOAD BACK DOC TAKE PHOTO",
    "backCam": "ONBOARD UPLOAD BACK DOC INFO",
    "backPreview": "ONBOARD UPLOAD BACK DOC REVIEW PHOTO",
    "selfie": "ONBOARD UPLOAD SELFIE TAKE PHOTO",
    "selfieCam": "ONBOARD UPLOAD SELFIE INFO",
    "selfieReview": "ONBOARD UPLOAD SELFIE REVIEW PHOTO",
    "selfieCAF": "ONBOARD UPLOAD CAF SELFIE UPLOAD PAGE",
    "pdf": "ONBOARD UPLOAD FRONT AND BACK PDF DOC",
  },

  //validate ocr
  validateId: "ONBOARD EXTRACT OCR",

  //client Creation
  clientCreation: {
    "rg": "ONBOARD ENTER ID DETAILS",
    "gender": "ONBOARD SELECT GENDER",
    "political": "ONBOARD SELECT POLITICAL EXPOSURE",
    "form": "ONBOARD ENTER POLITICAL EXPOSURE DETAILS",
    "salary": "ONBOARD ENTER SALARY",
    "cep": "ONBOARD ENTER CEP",
    "address_incomplete": "ONBOARDING ENTER ADDRESS DETAILS MANUALLY",
    "address": "ONBOARD VERIFY AUTO POPULATED ADDRESS",
    "addNum": "ONBOARD ENTER ADDRESS NUMBER",
    "complement": "ONBOARD ENTER ADDRESS COMPLEMENT",
    "revision": "ONBOARD REVIEW INFO BEFORE SUBMIT",
    "address_edit": "ONBOARD EDIT ADDRESS DETAILS"
  },

  //review onboarding details
  revisionPage: {
    "name": "ONBOARD RE-ENTER NAME",
    "phoneNumber": "ONBOARD RE-ENTER PHONE-NUMBER",

  },

  //Onbording Terms and condtions
  displayTorTos: "ONBOARD READ TOR AND TOA",

  //sign Agreement and Phone verfication
  agreement: "ONBOARD ENTER TOKEN TO SIGN TERMS",

  //validating email
  validating: "ONBOARD VALIDATE EMAIL",

  //waiting for approval
  waiting: "ONBOARD WAIT FOR APPROVAL",

  //account approved
  accountApproved: "ONBOARD ACCOUNT APPROVED",

  firstAccessAccountApproved: "FA ACCOUNT APPROVED",

  activateGuaranteedCreditCard: "GCC FA DETAILS",

  gccHowItWorks: "GCC FA HOW IT WORKS",

  gccInvestmentAmountComponent: "GCC FA ENTER AMOUNT",

  gccPixRecieveQRCodeComponent: "GCC FA PIX RECEIVE QRCODE",

  //location consent
  locationConsent: {
    "initial": "ONBOARD SAFETY OPTIN",
    "optin": "ONBOARD LOCATION OPTIN"
  },

  firstAccessCard: "FIRST ACCESS CARDS",

  firstAccessVCard: "FIRST ACCESS VIRTUAL CARD",

  //account confirmation
  accountConfirmation: "ONBOARD ACCOUNT CREATED",

  //welcome screen
  welcomePage: "FA ONBOARD WELCOME SCREEN",

  //onboarding set pin
  setPin: "FA ONBOARD SET ACCOUNT PIN",

  //Push notification in first access
  pushOptin: "ONBOARD FIRST ACCESS PUSH NOTIFICATION OPTIN",

  //Launch Page
  launchPage: "HOME PAGE",

  //all Services page
  allServices: "DISPLAY ALL SERVICES PAGE",
  allServicesPage: "ALL SERVICES",

  //External Help Page
  externalHelp: "EXTERNAL HELP PAGE",

  //Progress Bar
  progressPage: "PROGRESS BAR",

  //PIX
  pixLandingPage: "PIX LANDING PAGE",

  //Pix Send and Schdule
  pixSendComponent: {
    "select": "PIX SEND SELECT METHOD OF PAY",
    "list": "PIX SEND VIEW ALL CONTACTS",
    "view_details": "PIX SEND SELECT KEY TO SEND",
    "transfer_to": "ENTER PIX KEY",
    "get_amount": "PIX SEND ENTER AMOUNT",
    "pix_key_selected": "PIX SEND VIA KEY- ENTER PIX KEY",
    "institute": "PIX SEND VIA ACCOUNT - SELECT INSTITUTE ",
    "accountType": "PIX SEND VIA ACCOUNT - SELECT ACCOUNT TYPE",
    "beneficiary": "PIX SEND VIA ACCOUNT - ENTER BENEFICIARY DETAILS",
    "agency": "PIX SEND VIA ACCOUNT - ENTER AGENCY",
    "accountNumber": "PIX SEND VIA ACCOUNT - ENTER ACCOUNT NUMBER",
    "pix_review_for_account": "PIX SEND VIA ACCOUNT - REVIEW DETAILS",
    "verify_pin_for_account": "PIX SEND VIA ACCOUNT - ENTER PIN",
    "pix_receipt_for_account": "PIX SEND VIA ACCOUNT - RECEIPT",
    "pix_review_for_key": "PIX SEND VIA KEY - REVIEW DETAILS",
    "verify_pin_for_key": "PIX SEND VIA KEY- ENTER PIN",
    "pix_receipt_for_key": "PIX SEND VIA KEY- RECEIPT",
    "transaction_schedule": "PIX SEND VIA KEY - CHOOSE SCHEDULE",
    "select_date": "PIX SCHEDULE VIA KEY - SELECT DATE",
    "recurrence": "PIX SCHEDULE VIA KEY - SELECT REPEAT MONTHS",
    "scheduled_pix_review": "PIX SCHEDULE VIA KEY - REVIEW DETAILS",
    "verify_pin_for_schedule": "PIX SCHEDULE VIA KEY- ENTER PIN",
    "pix_receipt_for_schedule": "PIX SCHEDULE VIA KEY- RECEIPT",
    "error": "PIX FAILED",
    "customError": "PIX PENDING"
  },

  //Pix keys and operations
  pixMyKeysComponent: "PIX DISPLAY KEYS",
  collectNewKeyDetails: "PIX ENTER NEW KEY DETAILS",
  keyInformation: "PIX DISPLAY KEY INFORMATION",
  newKeyRequestOTP: "PIX NEW KEY ENTER OTP",
  confirmPortability: "PIX CONFIRM KEY PORTABILITY",
  registerNewKey: "PIX REGISTER NEW KEY COMPONENT",

  //pixCopyPasteQRCode
  pixCopyPasteQRCode: {
    "get_amount": "PIX QR CODE ENTER AMOUNT",
    "pix_review": "PIX QR CODE REVIEW DETAILS",
    "verify_pin": "PIX QR CODE ENTER PIN",
    "pix_receipt": "PIX QR CODE RECEIPT",
    "error": "PIX QR CODE ERROR",
  },

  pixCopyPasteBottomSheet: "PIX QR CARD BOTTOM SHEET",

  pixDestinationSelect: "PIX SELECT DESTINATION TYPE",

  pixRecieve: {
    "amount": "PIX RECEIVE ENTER AMOUNT",
    "pix_review": "PIX RECEIVE REVIEW DETAILS",
    "generate_qr_code": "PIX RECEIVE DISPLAY GENERATED QR CODE"
  },

  pixMainTransactions: {
    "display_transactions": "PIX TRANSACTION HISTORY DISPLAY TRANSACTIONS",
    "show_receipt": "PIX TRANSACTION HISTORY SHOW RECEIPT",
    "amount": "PIX RETURN ENTER AMOUNT",
    "pix_review": "PIX RETURN REVIEW DETAILS",
    "enter_pin": "PIX RETURN ENTER CAR",
    "final_receipt": "PIX RETURN RECEIPT",
    "error": "PIX RETURN ERROR"
  },

  pixTransactionsDisplayFilters: {
    "All": "PIX TRANSACTIONS DISPLAY ALL",
    "Sent": "PIX TRANSACTIONS DISPLAY SENT",
    "Received": "PIX TRANSACTIONS DISPLAY RECEIVED",
    "Schedule": "PIX TRANSACTIONS DISPLAY SCHEDULED",
    "DateRange": "PIX TRANSACTIONS DISPLAY WITHIN DATE RANGE",
    "Date": "PIX TRANSACTIONS SELECT DATE RANGE",
    "Empty": "PIX NO TRANSACTIONS FOR DISPLAY",
  },

  //ATM Component
  atmwithdraw: {
    "amount": "ATM ENTER AMOUNT",
    "review": "ATM REVIEW DETAILS",
    "pin": "ATM ENTER PIN",
    "completed": "ATM RECEIPT",
    "error": "ATM ERROR"
  },

  //PIX Component
  pixWithdraw: {
    "amount": "PIX WITHDRAW ENTER AMOUNT",
    "review": "PIX WITHDRAW REVIEW DETAILS",
    "pin": "PIX WITHDRAW ENTER PIN",
    "completed": "PIX WITHDRAW RECEIPT",
    "error": "PIX WITHDRAW ERROR",
    "customError": "PIX WITHDRAW CUSTOM ERROR"
  },

  pixOnboarding: {
    "pix_onboarding_main": "PIX ONBOARDING INTRO",
    "pix_onboarding_know_more": "PIX ONBOARDING KNOW MORE"
  },

  //Cellular recharge Component
  CellularRecharge: {
    "inputNumber": "RECHARGE ENTER PHONE NUMBER",
    "operator": "RECHARGE CHOOSE OPERATOR",
    "amount": "RECHARGE CHOOSE AMOUNT",
    "review": "RECHARGE REVIEW DETAILS",
    "pin": "RECHARGE ENTER PIN",
    "result": "RECHARGE SUCESS PAGE",
    "reciept": "RECHARGE RECEIPT",
    "error": "RECHARGE ERROR"
  },

  //boleto slip generation
  boletoGeneration: {
    "input": "BOLET GENERATION ENTER AMOUNT",
    "date": "BOLETO GENERATION SET DUE DATE",
    "review": "BOLETO GENERATION REVIEW DETAILS",
    "doc": "BOLETO GENERATION RECEIPT",
    "error": "BOLETO GENERATION ERROR"
  },

  insertBoleto: "BOLETO ENTER CODE MANUALLY",

  cardHomePage: "CARD HOME PAGE",

  cardArrivalComponent: {
    "arrival": "CARD DISPLAY ARRIVAL DETAILS ",
    "review": "CARD UNBLOCK REVIEW DETAILS",
    "due": "CARD UNBLOCK ENTER EXPIRY DATE",
    "code": "CARD UNBLOCK ENTER CVV",
    "pin": "CARD UNBLOCK ENTER PIN",
    "repeat": "CARD UNBLOCK REPEAT PIN",
    "token": "CARD UNBLOCK ENTER OTP",
    "success": "CARD UNBLOCK SUCCESS",
    "error": "CARD UNBLOCK ERROR"
  },

  FailRequest: "CARD IS NOT AVAILABLE",

  physicalCardComponents: {
    "card": "CARD DISPLAY DETAILS AND OPERATIONS",
    "cancel": "CANCEL CARD SELECT REASONS",
    "confirm_copy": "NEW COPY REQUEST ",
    "google_pay": "GOOGLE PAY INTEGRATION",
    "google_pay_bottom_dialog": "GOOGLE PAY INTEGRATION DIALOG",
    "google_pay_error": "GOOGLE PAY ERROR SCREEN",
    "new_copy": "NEW COPY REQUEST SELECT REASON",
    "address": "NEW COPY REQUEST CONFIRM ADDRESS",
    "new_pin": "UNBLOCK CARD ENTER NEW PIN",
    "enter_pin": "ADD CARD TO GPAY ENTER PIN",
    "error": "PHYSICAL CARD ERROR",
    "success": "PHYSICAL CARD OPERATION SUCCESS",
    "request_not_allowed": "REQUEST NOT ALLOWED PAGE"
  },

  digitalCardRequest: {
    "request": "REQUEST ACCOUNT CARD MAIN PAGE",
    "address": "REQUEST ACCOUNT CARD CONFIRM ADDRESS",
    "success": "REQUEST ACCOUNT CARD SUCCESS",
    "error": "REQUEST ACCOUNT CARD ERROR"
  },

  migrateCardRequest: {
    "initial": "MIGRATE CARD MAIN PAGE",
    "success": "MIGRATE CARD SUCCESS",
    "error": "MIGRATE CARD ERROR"
  },

  //depositlandingPage
  depositLandingPage: "DEPOSIT LANDING PAGE",

  //tedDeposit
  tedDepsitDetailsPage: "TED DEPOSIT DETAILS PAGE",

  //User Profile
  myAccountMenu: "USER PROFILE MENU",

  helpComponent: {
    "help_main": "HELP MAIN PAGE",
    "faq_selected": "HELP FAQ SELECTION PAGE",
    "qa_state": "HELP FAQ ANSWER STATE",
    "show_tarrif": "HELP RENDER TARRIF RATES",
    "show_time": "HELP RENDER PAYMENT TIMES"
  },

  aboutApp: "ABOUT APP PAGE",

  ossLicences: "OSS LICENCES",

  feedBackComponent: "GET USER FEEDBACK",

  contractAndTermsComponent: {
    "select_contract": "SELECT CONTRACT MENU",
    "display_toa": "DISPLAY TERMS OF ADDRESS",
    "display_tos": "DISPLAY  GENERIC TERMS OF SERVICE",
    "display_privacy": "DISPLAY PRIVACY CONTRACT",
  },

  chatComponent: "CHAT SUPPORT",
  chatTicketDisplay: "CHAT TICKETS DISPLAY",

  insuranceComponent: "INSURANCE",

  userProfileSecurity: "SECURITY MAIN MENU",

  passwordChangeComponent: {
    "new_password": "CHANGE PASSWORD - ENTER NEW PASSWORD",
    "retype_password": "CHANGE PASSWORD - RETYPE NEW PASSWORD",
    "success": "CHANGE PASSWORD - SUCCESS"
  },

  forgotPasswordComponent: {
    "code": "FORGOT PASSWORD -ENTER OTP",
    "new_password": "FORGOT PASSWORD -ENTER NEW PASSWORD",
    "retype_password": "FORGOT PASSWORD -RETYPE NEW PASSWORD",
    "success": "FORGOT PASSWORD - SUCCESS",
    "error": "FORGOT PASSWORD - ERROR"
  },

  forgotPinComponent: {
    "code": "FORGOT PIN -ENTER OTP",
    "new_pin": "FORGOT PIN -ENTER NEW PIN",
    "retype_pin": "FORGOT PIN -RETYPE NEW PIN",
    "success": "FORGOT PIN - SUCCESS",
    "error": "FORGOT PIN - ERROR"
  },

  changePinComponent: {
    "old_pin": "CHANGE PIN - ENTER OLD PIN",
    "new_pin": "CHANGE PIN - ENTER NEW PIN",
    "retype_pin": "CHANGE PIN - ENTER RETYPE NEW PIN",
    "success": "CHANGE PIN - SUCCESS",
  },

  userProfileDetails: {
    "profile" : "DISPLAY PROFILE DETAILS",
    "update_email" : "UPDATE PROFILE DETAILS ENTER NEW EMAIL",
    "update_phonenumber" : "UPDATE PROFILE DETAILS ENTER NEW PHONE NUMBER",
    "update_address" : "UPDATE PROFILE DETAILS ENTER NEW ADDRESS",
    "input_pin" : "PIN VERIFICATION FOR UPDATE PROFILE DETAILS",
    "input_otp" : "OTP VERIFICATION SCREEN FOR PROFILE DETAILS",
    "update_profile_details_facematch" : "FACEMATCH VERIFICATION FOR UPDATE PROFILE DETAILS",
    "update_profile_details_selfie_review" : "SELFIE REVIEW FOR UPDATE PROFILE DETAILS",
  },

  marketOptinSettings: "MARKET OPTIN SETTINGS",

  mainTransactionHistory: {
    "display_transactions": "MAIN TRANSACTION HISTORY DISPLAY TRANSACTIONS",
    "show_receipt": "MAIN TRANSACTION HISTORY DISPLAY RECEIPT",
    "Date": "MAIN TRANSACTION HISTORY SELECT DATE RANGE",
    "enter_pin": "MAIN TRANSACTION HISTORY ENTER PIN",
    "reciept": "MAIN TRANSACTION HISTORY DISPLAY BOLETO SLIP",
    "cancel": "MAIN TRANSACTION HISTORY BOLETO CANCEL SUCCESS",
    "error": "MAIN TRANSACTION HISTORY ERROR",
    "period_selection" : "MAIN TRANSACTION HISTORY START AND FINISH DATE"
  },

  //send main page
  sendPage: "SELECT TYPE OF TRANSACTION FOR SEND",

  //Ted Send and Schedule
  tedComponent: {
    "amount": "TED ENTER AMOUNT",
    "institute": "TED SELECT INSTITUTE",
    "path_option": "TED SELECT METHOD FOR ADDING DETAILS",
    "list": "TED VIEW ALL CONTACTS",
    "view_details": "TED SELECT CONTACT FOR SEND",
    "accountType": "TED SELECT ACCOUNT TYPE",
    "beneficiary": "TED ENTER BENEFICIARY DETAILS",
    "agency": "TED ENTER AGENCY",
    "accountNumber": "TED ENTER ACCOUNT NUMBER",
    "review": "TED REVIEW",
    "pin_immediate": "TED VERIFY PIN",
    "success_immediate": "TED RECEIPT",
    "select_date": "TED SCHEDULE SELECT DATE",
    "recurrence": "TED SCHEDULE REPEAT MONTHS",
    "scheduled_ted_review": "TED SCHEDULE REVIEW",
    "pin_schedule": "TED SCHEDULE VERIFY PIN",
    "success_schedule": "TED SCHEDULE RECEIPT",
    "error": "TED ERROR"
  },

  boletoComponent: {
    "boletoLoad": "BOLETO REVIEW",
    "pin_immediate": "BOLETO VERIFY PIN",
    "success_immediate": "BOLETO RECEIPT",
    "transaction_schedule": "BOLETO CHOOSE SCHEDULE",
    "select_date": "BOLETO SCHEDULE SELECT DATE",
    "boletoScheduleReview": "BOLETO SCHEDULE REVIEW",
    "pin_schedule": "BOLETO SCHEDULE VERIFY PIN",
    "success_schedule": "BOLETO SCHEDULE RECEIPT",
    "error": "BOLETO ERROR"
  },

  //Pix limit
  pixLimitComponent: {
    "pix_limit_review": "PIX LIMIT REVIEW",
    "pix_change_limit": "PIX LIMIT CHANGE - ENTER AMOUNT",
    "verify_pin_for_limit": "PIX LIMIT CHANGE - ENTER PIN",
    "error": "PIX LIMIT FAILED"
  },

  //contacts
  contactViewComponent: {
    "list": "CONTACTS VIEW ALL",
    "view_details": "CONTACTS VIEW SAVED DETAILS",
    "edit_contact": "CONTACTS EDIT BASIC DETAILS",
    "edit_contact_info": "CONTACTS EDIT ACCOUNT INFORMATION"
  },

  AddContactsComponent: {
    "new_contact": "ADD CONTACT ENTER NICKNAME",
    "selectAccount": "ADD CONTACT SELECT TYPE OF CONTACT",
    "select": "ADD CONTACT SELECT TYPE OF KEY",
    "pix_key_selected": "ADD CONTACT ENTER PIX KEY DETAILS",
    "pix_key_description": "ADD CONTACT KEY REVIEW DETAILS",
    "institute": "ADD CONTACT ENTER INSTITUTION",
    "accountType": "ADD CONTACT SELECT ACCOUNT TYPE",
    "beneficiary": "ADD CONTACT ENTER NAME",
    "agency": "ADD CONTACT ENTER AGENCY",
    "accountNumber": "ADD CONTACT ACCOUNT NUMBER",
    "success": "ADD CONTACT SUCCESS PAGE",
    "error": "ADD CONTACT ERROR"
  },

  saveContactAfterTransaction: {
    "new_contact": "SAVE CONTACT DISPLAY LIST OF CONTACTS",
    "beneficiary": "SAVE CONTACT ENTER NEW CONTACT NICKNAME",
    "list_contact": "SAVE CONTACT LIST ALL CONTACTS IN THE BACKGROUND",
    "success": "SAVE CONTACT SUCCESS PAGE",
    "error": "SAVE CONTACT ERROR"
  },

  waitListComponent: {
    "initial": "WAIT LIST CHECK STATUS",
    "show_waitlist": "WAIT LIST REGISTER SUCCESS",
    "register": "WAIT LIST REGISTER NEW USER",
    "success": "WAIT LIST USER INVITED",
    "expired": "WAIT LIST EXPIRED",
    "acc_exists": "ACCOUNT ALREDY EXISTS",
    "error": "WAIT LIST FAILED"
  },

  FgtsHomePage: "FGTS HOME PAGE",

  FgtsWithdraw: "FGTS WITHDRAW VALUE PROPS",

  FgtsSimulate: {
    "get_amount": "FGTS SIMULATE ENTER BALANCE AMOUNT",
    "show_installments": "FGTS SIMULATE SHOW AMOUNT AND INSTALLMENT DETAILS",
    "error": "FGTS SIMULATE ERROR"
  },

  FgtsAnticipate: {
    "show_intro": "FGTS ANTICIPATE SHOW DETAILS OF PROCESS",
    "anticipate_verification": "FGTS VERIFYS THE USER ACCOUNT AND VALIDATES ACCOUNT DETAILS",
    "anticipate_verification_error": "FGTS ANTICIPATION ERROR DETAILS",
    "show_installments": "FGTS ANTICIPATE SHOW AMOUNT AND INSTALLMENT DETAILS",
    "get_amount": "FGTS ANTICIPATE ENTER NEW AMOUNT",
    "confirm_anticipation": "FGTS ANTICIPATE REVIEW AND CONFIRM SCREEN",
    "display_terms": "FGTS ANTICIPATE DISPLAY TERMS AND CONDITIONS",
    "error": "FGTS SIMULATE ERROR",
    "phone_number_review": "FGTS ANTICIPATE PHONE NUMBER REVIEW",
    "verify_token": "FGTS ANTICIPATE ENTER TOKEN",
    "verify_pin": "FGTS ANTICIPATE ENTER PIN",
    "faceauth": "FGTS ANTICIPATE FACE AUTHENTICATION",
    "faceauth_success": "FGTS ANTICIPATE FACE AUTH REVIEW",
    "anticipation_success": "FGTS ANTICIPATE SUCCESS",
    "anticipate_tutorial": "FGTS ANTICIPATE YOUTUBE TUTORIAL",
    "anticipate_high_value": "FGTS ANTICIPATE HIGH VALUE BOTTOM SHEET",
    "no_sufficient_balance": "FGTS NO SUFFICIENT BALANCE ERROR PAGE",
    "arbi_not_registered": "FGTS ARBI NOT REGISTERED ERROR PAGE",
    "anniversary_too_close": "FGTS ANNIVERSARY TOO CLOSE ERROR PAGE",
    "failed_to_contact_caixa": "FGTS FAILED TO CONTACT CAIXA ERROR PAGE",
  },

  FgtsContracts: "VIEW ALL FGTS CONTRACTS",

  SalaryPortabilityHomePage: "SALARY PORTABILITY INFORMATION",

  SalaryPortabilityRequest: {
    "cnpj": "SALARY PORTABILITY ENTER CNPJ",
    "name": "SALARY PORTABILITY ENTER COMPANY",
    "bank": "SALARY PORTABILITY ENTER BANK",
    "review": "SALARY PORTABILITY REQUEST REVIEW",
    "pin": "SALARY PORTABILITY AUTHENTICATION",
    "success": "SALARY PORTABILITY REQUEST SUCCESS",
    "error": "SALARY PORTABILITY REQUEST FAILED"
  },

  SalaryPortabilityRequestProcess: {
    "load": "VIEW PORTABILITY REQUESTS",
    "reason": "PORTABILITY CANCEL REASON",
    "details": "PORTABILITY CANCEL DETAILS",
    "pin": "SALARY PORTABILITY AUTHENTICATION",
    "error": "SALARY PORTABILITY CANCEL FAILED"
  },

  DimoPay: {
    "dimo_review": "DIMO PAY REVIEW DETAILS",
    "verify_pin": "DIMO PAY ENTER PIN",
    "receipt": "DIMO PAY RETURN RECEIPT",
    "error": "DIMO PAY RETURN ERROR"
  },

  dataSync: "DATA SYNC TO BACKEND",

  VirtualCardInfoScreen: "DISPLAY VIRTUAL CARD INFORMATION",

  DigitalCardScreen: "ACCOUNT CARD HOME PAGE",

  VirtualCardComponent: {
    "verify_pin": "VIRTUAL CARD ENTER PIN",
    "show_vcard_details": "VIRTUAL CARD VIEW CARD AND CHOOSE OPTIONS",
    "verify_pin_delete": "VIRTUAL CARD ENTER PIN TO DELETE CARD",
    "delete": "VIRTUAL CARD DELETE CARD WARNING",
    "success": "VIRTUAL CARD SUCCESS SCREEN",
    "error": "VIRTUAL CARD ERROR SCREEN",
    "google_pay": "VIRTUAL CARD GOOGLE PAY INTEGRATION",
    "google_pay_error": "VIRTUAL CARD GOOGLE PAY ERROR SCREEN",
    "enter_pin": "VIRTUAL CARD ADD CARD TO GPAY ENTER PIN",
    "google_pay_bottom_dialog": "VIRTUAL CARD GOOGLE PAY INTEGRATION DIALOG",
    "google_pay_error_dialog": "VIRTUAL CARD GOOGLE PAY ERROR SCREEN DIALOG",
  },

  FinancingHomePage: "FINANCING HOME PAGE",
  ViewContaractDetails: "FINANCING CONTRACT DETAILS",
  ViewInstallmentDetails: "FINANCING INSTALLMENT DETAILS",

  CancelAccountComponents: {
    "benefits": "CANCEL ACCOUNT BENEFITS",
    "cancel_reasons": "CANCEL ACCOUNT REASONS",
    "receiveTokenToCancelAccount": "CANCEL ACCOUNT RECEIVE TOKEN",
    "success": "CANCEL ACCOUNT SUCCESS",
    "error": "CANCEL ACCOUNT ERROR",
    "description": "CANCEL FEATURES"
  },
  
  GamificationComponent: {
    "programs_list": "PROGRAMS LIST",
    "program_details": "PROGRAM DETAILS",
    "program_history": "PROGRAM HISTORY",
    "redeem_reward": "REDEEM REWARD",
    "reward_winner": "REWARD WINNER",
    "completed_programs": "COMPLETED PROGRAMS",
    "onboard_gamification": "ONBOARD GAMIFICATION",
    "all_lucky_numbers": "ALL LUCKY NUMBERS",
    "instant_popup_dialog": "INSTANT DIALOG",
    "share_reward": "SHARE REWARD",
    "draw_details": "DRAW DETAILS",
    "all_rewards_list": "ALL REWARDS LIST",
    "offer_cards_list": "OFFER CARDS LIST",
    "all_coupons": "ALL COUPONS",
    "reward_overview": "REWARD OVERVIEW",
  },

  CreditHomePageComponents: {
    "input": "HOME PAGE COMPONENT",
    "details": "INVOICE DETAILS",
  },

  CreditCardComponents: {
    "card_info": "CREDIT CARD BASIC INFO",
    "credit_invest": "CREDIT CARD ONBOARDING INVESTMENT INFO",
    "credit_invest_amount": "CREDIT CARD ENTER AMOUNT",
    "credit_edit_amount": "CREDIT CARD ENTER AMOUNT EDIT",
    "receive_pix": "CREDIT CARD RECEIVE PIX",
    "register_key": "CREDIT CARD REGISTER PIX KEY",
    "credit_due_date": "CREDIT CARD SELECT DUE DATE",
    "credit_edit_due_date": "CREDIT CARD SELECT DUE DATE EDIT",
    "credit_contract": "CREDIT CARD CONTRACT",
    "credit_pin_input": "CREDIT CARD PIN INPUT",
    "error": "CREDIT CARD ERROR",
    "credit_facematch": "CREDIT CARD FACE MATCH",
    "credit_facematch_success": "CREDIT CARD FACEMATCH SUCCESS",
    "credit_success": "CREDIT CARD INVESTMENT PENDING ONBOARDING",
    "cardError": "CREDIT CARD NO CARDS ERROR",
    "credit_card_invoice_details": "CREDIT CARD INVOICE DETAILS",
    "credit_card_settings": "CREDIT CARD SETTINGS",
    "credit_card_settings_change_due_date":" CREDIT CARD SETTINGS CHANGE DUE DATE",
    "credit_card_settings_change_automatic_debit":" CREDIT CARD SETTINGS CHANGE AUTOMATIC DEBIT",
    "invoice_payment": "CREDIT CARD INVOICE PAYEMENT",
    "invoice_history": "CREDIT CARD INVOICE HISTORY",
    "investment": "CREDIT CARD INVESTMENT HOME PAGE",
    "credit_card_homepage": "CREDIT CARD HOME PAGE",
    "transactionDetails": "CREDIT CARD TRANSACTION RECEIPT",
    "credit_resume_onboarding": "CREDIT CARD RESUME ONBOARDING",
    "more_options_component": "CREDIT CARD MORE OPTIONS",
    "credit_card_history_homepage": "CREDIT CARD HISTORY HOME PAGE"
  },

  gccCreditCardComponent: {
    "card": "GCC FA CREDIT CARD",
    "credit_facematch_success": "GCC FA CREDIT CARD FACEMATCH SUCCESS",
    "may_be_later": "GCC FA MAYBELATER",
    "due_date": "GCC FA DUE DATE",
    "contract": "GCC FA CONTRACT",
    "pin": "GCC FA VERIFY PIN",
    "error": "GCC FA ERROR",
    "facematch": "GCC FA FACEMATCH",
    "onboard_complete": "GCC FA CREDIT CARD ONBOARD COMPLETE",
    "request_card": "GCC FA REQUEST VISA PHYSICAL CARD",
    "card_shipped": "GCC FA CARD SHIPPED",
    "create_evp_key": "GCC FA CREATE EVP KEY",
  },

  CreditCardInvestmentComponents: {
    'investInfo': "CREDIT CARD INVESTMENT HOME PAGE",
    "credit_invest": "CREDIT CARD INVEST MORE INFO",
    "credit_invest_amount": "CREDIT CARD INVESTMENT ENTER AMOUNT",
    "receive_pix": "CREDIT CARD INVESTMENT RECEIVE PIX",
    "register_key": "CREDIT CARD INVESTMENT REGISTER PIX KEY",
    "credit_contract": "CREDIT CARD INVESTMENT CONTRACT",
    "credit_pin_input": "CREDIT CARD INVESTMENT PIN INPUT",
    "error": "CREDIT CARD INVESTMENT ERROR",
    "credit_facematch": "CREDIT CARD INVESTMENT FACE MATCH",
    "investMore_facematch_success": "CREDIT CARD INVESTMENT FACEMATCH SUCCESS",
    "credit_success": "CREDIT CARD INVESTMENT PENDING",
    "redeem":"CREDIT CARD REDEEM PAGE",
    "redeem_amount":"CREDIT CARD REDEEM ENTER AMOUNT",
    "redeem_details":"CREDIT CARD REDEEM DETAILS",
    "redeem_facematch_success":"CREDIT CARD REDEEM FACEMATCH SUCCESS",

  },

  GiftCardComponents: {
    "gift_card_form": "GIFT CARD FORM COMPONENT",
    "gift_card_address" : "GIFT CARD COMPLETE ADDRESS",
    "create_card" : "GIFT CARD CREATION",
    "error" : "GIFT CARD ERROR PAGE",
    "add_card_to_gpay" : "GIFT CARD NEW JOURNEY",
    "google_pay" : "GIFT CARD GOOGLE PAY",
    "privacy_policy" : "GIFT CARD PRIVACY",
    "success" : "GIFT CARD SUCCESS SCREEN", 
    "not_eligible_gift_card" : "GIFT CARD INELIGIBLE"

  },

  CreditInvoicePaymentComponents: {
    "input": "CREDIT CARD INVOICE ENTER AMOUNT",
    "pay_installments": "CREDIT CARD PAY IN INSTALLMENTS AMOUNT",
    "boleto_success": "CREDIT CARD INVOICE BOLETO PAYMENT SUCCESS",
    "success": "CREDIT CARD INVOICE BALANCE PAYMENT SUCCESS",
    "pix_success": "CREDIT CARD INVOICE PIX PAYMENT SUCCESS",
    "error": "CREDIT CARD INVOICE PAYMENT FAILURE",
    "details": "CREDIT CARD INVOICE BILL DETAILS",
    "method": "CREDIT CARD INVOICE PAYMENT METHODS",
    "partial": "CREDIT CARD INVOICE PARTIAL PAYMENT WARNING",
    "partial_excess": "CREDIT CARD INVOICE EXCESS PAYMENT WARNING",
    "pin": "CREDIT CARD INVOICE PAYMENT AUTHENTICATION",
    "boleto": "CREDIT CARD INVOICE BOLETO PAYMENT WARNING",
    "simulate": "CREDIT CARD INVOICE PARTIAL PAYMENT SIMULATION",
  },

  UpgradeAppPage: "UPGRADE APP PAGE",

  UnblockAccountComponents: {
    "account_status_progress": "ACCOUNT STATUS PROGRESS",
    "account_status_inactive": "ACCOUNT STATUS INACTIVE",
    "account_status_closed": "ACCOUNT STATUS CLOSED",
    "account_status_blocked": "ACCOUNT STATUS BLOCKED",

    "unblock_account_security": "UNBLOCK ACCOUNT SECURITY",
    "unblock_account_selfie_info": "UNBLOCK ACCOUNT SELFIE INFO",
    "unblock_account_face_auth": "UNBLOCK ACCOUNT FACE AUTH",
    "unblock_account_selfie_review": "UNBLOCK ACCOUNT SELFIE REVIEW",
    "unblock_account_failed": "UNBLOCK ACCOUNT FAILED",
    "unblock_account_progress": "UNBLOCK ACCOUNT PROGRESS",
    "unblock_account_success" : "UNBLOCK ACCOUNT SUCCESS"
  },
  
  ErrorBoundary: "CHUNK ERROR BOUNDARY"
});

export default PageNames;
