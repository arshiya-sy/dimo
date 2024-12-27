import React from "react";
import GiftCardFormComp from "./WalletComponents/GiftCardComponents/GiftCardFormComp";
import GiftCardCreation from "./WalletComponents/GiftCardComponents/GiftCardCreation";
import GiftCardMain from "./WalletComponents/GiftCardComponents/GiftCardMain";
import UpgradeAppPage from "./WalletComponents/NewOnboardingComponents/UpgradeAppPageComponent";

// new on boarding components
const PhysicalCardComponent = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CardCreatedComponents/PhysicalCardComponent"));
const PortabilityConfirmationComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PixKeyHandleComponents/PortabilityConfirmationComponent"));

const ValidateIdComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/ValidateIdComponent"));
const DigitalCardRequestComponent = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CardRequestComponents/DigitalCardRequestComponent"));
const FailRequestComponent = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CardRequestComponents/FailRequestComponent"));

const DigitalCardArrivalComponent = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CardArrivalComponents/DigitalCardArrivalComponent"));
const TedDepositComponent = React.lazy(() => import("./WalletComponents/NewDepositComponents/TedDepositComponent"));
const LocationConsent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/LocationConsent"));
const RevisionComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/RevisionComponent"));
const ForgotPasswordComp = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/PasswordandPinOperations/ForgotPasswordComponent"));
const FeedbackComp = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/FeedbackComp"));
const PixLimitComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PixLimitComponents/PixLimitComponent"));
const PixWithdrawComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PixWithdrawComponent"));
const ValidateEmailComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/ValidateEmailComponent"));
const MarketOptinSettings = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/MarketOptinSettings"));
const ContactComponent = React.lazy(() => import("./WalletComponents/ContactComponents/ContactComponent"));
const AddContactsComponent = React.lazy(() => import("./WalletComponents/ContactComponents/RegisterContactComponents/AddContactsComponent"));
const CheckWaitListIdComp = React.lazy(() => import("./WalletComponents/WaitListComponents/CheckWaitListIdComp"));
const SaveContactsComponent = React.lazy(() => import("./WalletComponents/ContactComponents/RegisterContactComponents/SaveContactsComponent"));
const PushNotificationOptinComp = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/PushNotificationOptinComp"));
const NonMotoDeviceLandingComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/NonMotoLandingPage"));
const FgtsHomePage = React.lazy(() => import("./WalletComponents/FgtsComponent/FgtsHomePage"));
const FGTSVideoTurorialComponent = React.lazy(() => import("./WalletComponents/FgtsComponent/FgtsSupportComponents/FGTSVideoTurorialComponent"));
const FgtsAnticipateFlow = React.lazy(() => import("./WalletComponents/FgtsComponent/FgtsAnticipateFlow"));
const FgtsContractsPage = React.lazy(() => import("./WalletComponents/FgtsComponent/FgtsSupportComponents/FgtsContractsPage"));
const SalaryWithdrawComponent = React.lazy(() => import("./WalletComponents/SalaryWithdrawComponents/SalaryWithdrawComponent"));
const RequestSalaryPortability = React.lazy(() => import("./WalletComponents/SalaryWithdrawComponents/RequestSalaryPortability"));
const LoadPortabilityRequests = React.lazy(() => import("./WalletComponents/SalaryWithdrawComponents/LoadPortabilityRequests"));
const DimoQrCodePayment = React.lazy(() => import("./WalletComponents/DimoPayment/DimoQrCodePayment"));
const MigrateEloCardComp = React.lazy(() => import("./WalletComponents/DigitalCardComponents/MigrateEloCardComp"));
const virtualCardInfo = React.lazy(() => import("./WalletComponents/DigitalCardComponents/VirtualCardComponents/VirtualCardInfoPage"));
const virtualCardComponenet = React.lazy(() => import("./WalletComponents/DigitalCardComponents/VirtualCardComponents/VirtualCardComponents"));
const FinancingComponent = React.lazy(() => import("./WalletComponents/FinancingAppComponents/FinancingComponent"));
const ContractDetails = React.lazy(() => import("./WalletComponents/FinancingAppComponents/ContractDetails"));
const InstallmentDetails = React.lazy(() => import("./WalletComponents/FinancingAppComponents/InstallmentDetails"));
const CancelAccount = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/CancelComponents/CancelAccount"));
const CreditCardComponent = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CreditCardComponent"));
const CreditCardSettingsPage = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CreditCardComponents/CreditCardSettingsPage"));
const CreditCardChangeDueDatePage = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CreditCardComponents/CreditCardChangeDueDateComponent"));
//import CreditCardChangeTravelNoticePage from "./WalletComponents/DigitalCardComponents/CreditCardComponents/CreditCardChangeTravelNoticeComponent";
//import CreditCardChangeLimitComponent from "./WalletComponents/DigitalCardComponents/CreditCardComponents/CreditCardChangeLimitComponent";
const CreditCardIncreaseLimitPage = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CreditCardComponents/CreditCardIncreaseLimitReason"));
const CreditCardSuccess = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CreditCardComponents/CreditCardSuccess"));
const InvoicePaymentComp = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CreditPaymentComponents/InvoicePaymentComponent"));
const PrivacyPortuguese2022 = React.lazy(() => import("./PrivacyFiles/Privacy_pt_2022"));
const PrivacyPortuguese2024 = React.lazy(() => import("./PrivacyFiles/Privacy_pt_2024"));
const PrivacyPortuguese2023 = React.lazy(() => import("./PrivacyFiles/Privacy_pt_2023"));
const CreditCardInvestmentComp = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CreditCardComponents/CreditCardInvestmentComp"));
const CreditCardHistory = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CreditCardComponents/CreditCardInvoiceHistory/CreditCardHistory"));
const CreditCardInvoiceHistory = React.lazy(() => import("./WalletComponents/DigitalCardComponents/CreditCardComponents/CreditCardInvoiceHistory/CreditCardInvoiceHistoryHomePage"));
const DimoVoz = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/DimoVoz"));
const TransactionOptions = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/TransactionOptions"));

const NewMotoPayLandingPage = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/NewMotoPayLandingComponent"));
const NewMotoPayValuePropsComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/NewMotoPayValuePropsComponent"));
const NewDeviceAlertPage = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/NewDeviceAlertComponent"));
const PersonalPage = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/PersonalInfoComponent"));
const UserIdCreation = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/UserIdCreationComponent"));
const IdentificationPage = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/IdentificationPageComponent"));
const IdentityCreation = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/IdentityCreationComponent"));
const IdAndOtherInfoComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/ClientCreationComponent"));
const TermsComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/TermsComponent"));
const AgreementComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/AgreementComponent"));
const DocumentUploadComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/DocumentUploadComponent"));
const LoginAuthenticateComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/LoginAuthenticateComponent"));
const SetPinComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/SetPinComponent"));
const waitingApprovalComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/WaitingApproval"));
const AccountApproveComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/AccountApproveComponent"));
const AccountConfirmationComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/AccountConfirmationComponent"));
const ActivateGuaranteedCreditCard = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/ActivateGuaranteedCreditCard"));
const GCCHowItWorks = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/GCCHowItWorks"));
const PrivacyComponent = React.lazy(() => import("./WalletComponents/OnBoardingSupportComponents/PrivacyComponent"));
const GCCFirstAccessComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/GCCFirstAccess"));
const GCCPixRecieveQRCode = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/GCCPixRecieveQRCode"));
const GCCInvesmentAmountComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/GCCInvesmentAmountComponent"));
const WelcomeComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/WelcomeComponent"));
const CardInfoComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/CardInfoComponent"));
const WalletLandingPageComponent = React.lazy(() => import("./WalletComponents/NewLaunchComponents/WalletLandingPageComponent"));
const AllServicesLandingComponent = React.lazy(() => import("./WalletComponents/NewLaunchComponents/AllServicesLandingComponent"));
const ExternalHelpPage = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/ExternalHelpPage"));
const NewTrasactionHistory = React.lazy(() => import("./WalletComponents/TransactionHistory/TransactionComponent"));
const PhoneNumberVerification = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/PhoneNumberVerification"));
const EmailVerificationComponent = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/EmailVerificationComponent"));
const ChangeEmail = React.lazy(() => import("./WalletComponents/NewOnboardingComponents/ChangeEmail"));

//WidgetPage
const WidgetPage = React.lazy(() => import("./WalletComponents/WidgetComponent/WidgetPage"));

// PIX
const PixFirstAccess = React.lazy(() => import("./WalletComponents/PIXComponent/PixOnboarding/PixOnboardingMain"));
const PixKnowMore = React.lazy(() => import("./WalletComponents/PIXComponent/PixOnboarding/PixKnowMore"));
const PixOnboardingComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PixOnboardingComponent"));
const PIXLandingComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PIXLandingComponent"));
const MyPixKeysComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PixKeyHandleComponents/MyPixKeysComponent"));
const RegisterNewKeyComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PixKeyHandleComponents/RegisterNewKeyComponent"));
const KeyInformationComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PixKeyHandleComponents/KeyInformationComponent"));
const CollectNewKeyDetailsComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PixKeyHandleComponents/CollectNewKeyDetailsComponent"));
const OTPConfirmationComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PixKeyHandleComponents/OTPConfirmationComponent"));
const PixReceive = React.lazy(() => import("./WalletComponents/PIXComponent/PixNewRecieve/PixReceiveComponents"));
const PixSendComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PixSendComponents/PixSendComponent"));
const PixQRCopyPasteComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PixQRCopyPasteComponents/PixQRCopyPasteComponent"));
const PixTransactionsComponent = React.lazy(() => import("./WalletComponents/PIXComponent/PixTransactions/PixTransactionsComponent"));

// Boleto, TED and deposit
const BoletoComponent = React.lazy(() => import("./WalletComponents/BoletoComponents/BoletoComponent"));
const InsertBoletoComponent = React.lazy(() => import("./WalletComponents/BoletoComponents/InsertBoletoComponent"));
const BoletoGenerationComponent = React.lazy(() => import("./WalletComponents/NewDepositComponents/BoletoGenerationComponent"));
const DepositLandingComponent = React.lazy(() => import("./WalletComponents/NewDepositComponents/DepositLandingComponent"));
const TedTransferComponent = React.lazy(() => import("./WalletComponents/TedTransferComponents/TedTransferComponent"));
const SendComponent = React.lazy(() => import("./WalletComponents/TedTransferComponents/SendComponent"));
const DigitalCardComponent = React.lazy(() => import("./WalletComponents/DigitalCardComponents/DigitalCardComponent"));
const CellularRecharge = React.lazy(() => import("./WalletComponents/CellularRechargeComponents/CellularRechargeComponent"));
const AtmComponent = React.lazy(() => import("./WalletComponents/AtmComponent/AtmComponent"));

// UserProfile
const MyAccount = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/MyAccountPage"));
const ProfileDetails = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/ProfileDetails/ProfileDetailsComponent"));
const NewChangePassword = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/PasswordandPinOperations/ChangePasswordComponent"));
const NewChangePin = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/PasswordandPinOperations/PinChangeComponent"));
const NewForgotPin = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/PasswordandPinOperations/ForgotPinComponent"));
const HelpPage = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/HelpPage"));
const AppSettings = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/AppSettings"));
const AboutComp = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/AboutApp"));
const OssComp = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/OssLicenses"));
const ContractsAndTerms = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/ContractAndTerms/ContractMenuComponent"));
const Chat = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/ChatComponents/ChatComponent"));
const ConsultComp = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/ContractAndTerms/ConsultComponent"));
const SecurityComp = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/PasswordandPinOperations/Security"));

// Chatbot
const ChatTicketDisplay = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/ChatComponents/ChatTicketDisplay"));
const ChatTicketCommentsPage = React.lazy(() => import("./WalletComponents/NewUserProfileComponents/ChatComponents/ChatTicketCommentsPage"));

// Gamification Pages
const GamificationOnboardingComponent = React.lazy(() => import("./WalletComponents/GamificationComponent/GamificationOnboardingComponent"));
const RewardComponent = React.lazy(() => import("./WalletComponents/GamificationComponent/RewardComponent"));
const RewardDetailComponent = React.lazy(() => import("./WalletComponents/GamificationComponent/RewardDetailComponent"));
const RewardHistoryComponent = React.lazy(() => import("./WalletComponents/GamificationComponent/RewardHistoryComponent"));
const RedeemRewardComponent = React.lazy(() => import("./WalletComponents/GamificationComponent/RedeemRewardComponent"));
const RewardWinnerComponent = React.lazy(() => import("./WalletComponents/GamificationComponent/RewardWinnerComponent"));
const CompletedRewardComponent = React.lazy(() => import("./WalletComponents/GamificationComponent/CompletedRewardComponent"));
const RewardShareComponent = React.lazy(() => import("./WalletComponents/GamificationComponent/RewardShareComponent"));
const RewardOverviewComponent = React.lazy(() => import("./WalletComponents/GamificationComponent/RewardOverviewComponent"));

//Insurance
const InsuranceComponent = React.lazy(() => import("./WalletComponents/InsuranceComponents/InsuranceComponent"));

// Unblock Account Pages
const AccountStatusComponent = React.lazy(() => import("./WalletComponents/UnblockAccountComponents/AccountStatusComponent"));
const UnblockAccountComponent = React.lazy(() => import("./WalletComponents/UnblockAccountComponents/UnblockAccountComponent"));

// WARNING:
// 1. DO NOT CHANGE isPrivate status of URL without review.
// 2. If a new URL is not part of initial setup (before user sets password), then that link should be marked PRIVATE.

const routes = [
  {
    path: "/tedTransfer",
    component: TedTransferComponent,
    isPrivate: true,
  },
  {
    path: "/sendComponent",
    component: SendComponent,
    isPrivate: true,
  },
  {
    path: "/newTransactionHistory",
    component: NewTrasactionHistory,
    isPrivate: true,
  },
  {
    path: "/pixTransactionHistory",
    component: PixTransactionsComponent,
    isPrivate: true,
  },
  {
    path: "/cellularRecharge",
    component: CellularRecharge,
    isPrivate: true,
  },
  {
    path: "/atmWithdraw",
    component: AtmComponent,
    isPrivate: true,
  },
  {
    path: "/pixReceive",
    component: PixReceive,
    isPrivate: true,
  },
  {
    path: "/userIdCreation",
    component: UserIdCreation,
    isPrivate: false,
  },
  {
    path: "/phoneNumberVerification",
    component: PhoneNumberVerification,
    isPrivate: false,
  },
  {
    path: "/EmailVerification",
    component: EmailVerificationComponent,
    isPrivate: true,
  },
  {
    path: "/ChangeEmail",
    component: ChangeEmail,
    isPrivate: false,
  },
  {
    path: "/newSignUpPageComp",
    component: PersonalPage,
    isPrivate: false,
  },
  {
    path: "/identification",
    component: IdentificationPage,
    isPrivate: true,
  },
  {
    path: "/identityCreation",
    component: IdentityCreation,
    isPrivate: true,
  },
  {
    path: "/validateIdCreation",
    component: ValidateIdComponent,
    isPrivate: true,
  },
  {
    path: "/docInformation",
    component: IdAndOtherInfoComponent,
    isPrivate: false,
  },
  {
    path: "/contract",
    component: AgreementComponent,
    isPrivate: true,
  },
  {
    path: "/terms",
    component: TermsComponent,
    isPrivate: true,
  },
  {
    path: "/newDocUpload",
    component: DocumentUploadComponent,
    isPrivate: true,
  },
  {
    path: "/newLogin",
    component: LoginAuthenticateComponent,
    isPrivate: false,
  },
  {
    path: "/newWalletLaunch",
    component: WalletLandingPageComponent,
    isPrivate: true,
  },
  {
    path: "/allServices",
    component: AllServicesLandingComponent,
    isPrivate: true,
  },
  {
    path: "/setUpPin",
    component: SetPinComponent,
    isPrivate: true,
  },
  {
    path: "/locationConsent",
    component: LocationConsent,
    isPrivate: true,
  },
  {
    path: "/pushOptin",
    component: PushNotificationOptinComp,
    isPrivate: false,
  },
  {
    path: "/waitingApproval",
    component: waitingApprovalComponent,
    isPrivate: true,
  },
  {
    path: "/validateEmail",
    component: ValidateEmailComponent,
    isPrivate: true,
  },
  {
    path: "/accountAprove",
    component: AccountApproveComponent,
    isPrivate: true,
  },
  {
    path: "/accountConfirmation",
    component: AccountConfirmationComponent,
    isPrivate: true,
  },
  {
    path: "/activateCreditCard",
    component: ActivateGuaranteedCreditCard,
    isPrivate: true,
  },
  {
    path: "/gccHowItWorks",
    component: GCCHowItWorks,
    isPrivate: true,
  },
  {
    path: "/gccInvestmentAmount",
    component: GCCInvesmentAmountComponent,
    isPrivate: true,
  },
  {
    path: "/gccPixRecieveQRCode",
    component: GCCPixRecieveQRCode,
    isPrivate: true,
  },
  {
    path: "/gccFirstAccess",
    component: GCCFirstAccessComponent,
    isPrivate: true,
  },
  {
    path: "/privacyComp",
    component: PrivacyComponent,
    isPrivate: false,
  },
  {
    path: "/failRequest",
    component: FailRequestComponent,
    isPrivate: true,
  },
  {
    path: "/welcomeComponent",
    component: WelcomeComponent,
    isPrivate: true,
  },
  {
    path: "/cardInfoComponent",
    component: CardInfoComponent,
    isPrivate: true,
  },
  {
    path: "/pixLandingComponent",
    component: PIXLandingComponent,
    isPrivate: true,
  },
  {
    path: "/pixOnboardingComponent",
    component: PixOnboardingComponent,
    isPrivate: true,
  },
  {
    path: "/pixFirstAccess",
    component: PixFirstAccess,
    isPrivate: true,
  },
  {
    path: "/pixKnowMore",
    component: PixKnowMore,
    isPrivate: true,
  },
  {
    path: "/myPixKeysComponent",
    component: MyPixKeysComponent,
    isPrivate: true,
  },
  {
    path: "/registerNewKeyComponent",
    component: RegisterNewKeyComponent,
    isPrivate: true,
  },
  {
    path: "/keyInformationComponent",
    component: KeyInformationComponent,
    isPrivate: true,
  },
  {
    path: "/collectNewKeyDetailsComponent",
    component: CollectNewKeyDetailsComponent,
    isPrivate: true,
  },
  {
    path: "/otpConfirmationComponent",
    component: OTPConfirmationComponent,
    isPrivate: true,
  },
  {
    path: "/portabilityConfirmationComponent",
    component: PortabilityConfirmationComponent,
    isPrivate: true,
  },
  {
    path: "/pixQrCopyPasteComponent",
    component: PixQRCopyPasteComponent,
    isPrivate: true,
  },
  {
    path: "/pixSendComponent",
    component: PixSendComponent,
    isPrivate: true,
  },
  {
    path: "/pixLimits",
    component: PixLimitComponent,
    isPrivate: true,
  },
  {
    path: "/pixWithdraw",
    component: PixWithdrawComponent,
    isPrivate: true
  },
  {
    path: "/myAccount",
    component: MyAccount,
    isPrivate: true,
  },
  {
    path: "/profileDetails",
    component: ProfileDetails,
    isPrivate: true,
  },
  {
    path: "/newChangePassword",
    component: NewChangePassword,
    isPrivate: true,
  },
  {
    path: "/newChangePin",
    component: NewChangePin,
    isPrivate: true,
  },
  {
    path: "/newForgotPin",
    component: NewForgotPin,
    isPrivate: true,
  },
  {
    path: "/forgotPassword",
    component: ForgotPasswordComp,
    isPrivate: false,
  },
  {
    path: "/contractsAndTerms",
    component: ContractsAndTerms,
    isPrivate: true,
  },
  {
    path: "/chat",
    component: Chat,
    isPrivate: true,
  },
  {
    path: "/privacy2022",
    component: PrivacyPortuguese2022,
    isPrivate: true,
  },
  {
    path: "/privacy2023",
    component: PrivacyPortuguese2023,
    isPrivate: true,
  },
  {
    path: "/privacy2024",
    component: PrivacyPortuguese2024,
    isPrivate: true,
  },
  {
    path: "/helpPage",
    component: HelpPage,
    isPrivate: false,
  },
  {
    path: "/appSettings",
    component: AppSettings,
    isPrivate: true,
  },
  {
    path: "/marketOptin",
    component: MarketOptinSettings,
    isPrivate: true,
  },
  {
    path: "/dimoVoz",
    component: DimoVoz,
    isPrivate: true,
  },
  {
    path: "/transactionOptions",
    component: TransactionOptions,
    isPrivate: true
  },
  {
    path: "/aboutComp",
    component: AboutComp,
    isPrivate: true,
  },
  {
    path: "/ossComp",
    component: OssComp,
    isPrivate: true,
  },
  {
    path: "/consultComp",
    component: ConsultComp,
    isPrivate: true,
  },
  {
    path: "/securityComp",
    component: SecurityComp,
    isPrivate: true,
  },
  {
    path: "/depositLandingComponent",
    component: DepositLandingComponent,
    isPrivate: true,
  },
  {
    path: "/generateBoleto",
    component: BoletoGenerationComponent,
    isPrivate: true,
  },
  {
    path: "/tedDeposit",
    component: TedDepositComponent,
    isPrivate: true,
  },
  {
    path: "/boleto",
    component: BoletoComponent,
    isPrivate: true,
  },
  {
    path: "/insertBoleto",
    component: InsertBoletoComponent,
    isPrivate: true,
  },
  {
    path: "/digitalCard",
    component: DigitalCardComponent,
    isPrivate: true,
  },
  {
    path: "/digitalCardCreated",
    component: PhysicalCardComponent,
    isPrivate: true,
  },
  {
    path: "/cardRequest",
    component: DigitalCardRequestComponent,
    isPrivate: true,
  },
  {
    path: "/digitalCardArrival",
    component: DigitalCardArrivalComponent,
    isPrivate: true,
  },
  {
    path: "/revision",
    component: RevisionComponent,
    isPrivate: true,
  },
  {
    path: "/externalHelpPage",
    component: ExternalHelpPage,
    isPrivate: false,
  },
  {
    path: "/feedback",
    component: FeedbackComp,
    isPrivate: true,
  },
  {
    path: "/newDeviceAlert",
    component: NewDeviceAlertPage,
    isPrivate: false,
  },
  {
    path: "/contacts",
    component: ContactComponent,
    isPrivate: true,
  },
  {
    path: "/addContact",
    component: AddContactsComponent,
    isPrivate: true,
  },
  {
    path: "/fgtsHome",
    component: FgtsHomePage,
    isPrivate: true
  },
  {
    path: "/fgtsVideoTutorial",
    component: FGTSVideoTurorialComponent,
    isPrivate: true
  },
  {
    path: "/fgtsAnticipate",
    component: FgtsAnticipateFlow,
    isPrivate: true
  },
  {
    path: "/fgtsContracts",
    component: FgtsContractsPage,
    isPrivate: true
  },
  {
    path: "/virtualCardInfo",
    component: virtualCardInfo,
    isPrivate: true
  },
  {
    path: "/virtualCardComponent",
    component: virtualCardComponenet,
    isPrivate: true
  },
  {
    path: "/checkWaitlistId",
    component: CheckWaitListIdComp,
    isPrivate: false,
  },
  {
    path: "/saveContactFromTransaction",
    component: SaveContactsComponent,
    isPrivate: true,
  },
  {
    path: "/nonMotoDeviceLogin",
    component: NonMotoDeviceLandingComponent,
    isPrivate: false,
  },
  {
    path: "/salaryPortability",
    component: SalaryWithdrawComponent,
    isPrivate: true,
  },
  {
    path: "/requestSalaryPortability",
    component: RequestSalaryPortability,
    isPrivate: true,
  },
  {
    path: "/loadPortabilityRequests",
    component: LoadPortabilityRequests,
    isPrivate: true,
  },
  {
    path: "/dimoPayComponent",
    component: DimoQrCodePayment,
    isPrivate: true,
  },
  {
    path: "/migrateCard",
    component: MigrateEloCardComp,
    isPrivate: true,
  },
  {
    path: "/financing",
    component: FinancingComponent,
    isPrivate: true,
  },
  {
    path: "/seeContractDetails",
    component: ContractDetails,
    isPrivate: true,
  },
  {
    path: "/seeInstallments",
    component: InstallmentDetails,
    isPrivate: true,
  },

  // Gamification Routes
  {
    path: "/gamificationOnboarding",
    component: GamificationOnboardingComponent,
    isPrivate: true,
  },
  {
    path: "/rewards",
    component: RewardComponent,
    isPrivate: true,
  },
  {
    path: "/rewardsDetail",
    component: RewardDetailComponent,
    isPrivate: true,
  },
  {
    path: "/redeemReward",
    component: RedeemRewardComponent,
    isPrivate: true,
  },
  {
    path: "/rewardsHistory",
    component: RewardHistoryComponent,
    isPrivate: true,
  },
  {
    path: "/rewardWinner",
    component: RewardWinnerComponent,
    isPrivate: true,
  },
  {
    path: "/completedRewards",
    component: CompletedRewardComponent,
    isPrivate: true,
  },
  {
    path: "/shareReward",
    component: RewardShareComponent,
    isPrivate: true,
  },
  {
    path: "/programOverview",
    component: RewardOverviewComponent,
    isPrivate: true,
  },

  // Unblock Account Routes
  {
    path: "/accountStatus",
    component: AccountStatusComponent,
    isPrivate: true,
  },
  {
    path: "/unblockAccount",
    component: UnblockAccountComponent,
    isPrivate: true,
  },

  {
    path: "/cancelAccount",
    component: CancelAccount,
    isPrivate: true,
  },
  {
    path: "/creditCard",
    component: CreditCardComponent,
    isPrivate: true,
  },
  {
    path: "/CreditCardSuccess",
    component: CreditCardSuccess,
    isPrivate: true,
  },
  {
    path: "/creditCardSettingsPage",
    component: CreditCardSettingsPage,
    isPrivate: true,
  },
  {
    path: "/creditCardChangeDueDatePage",
    component: CreditCardChangeDueDatePage,
    isPrivate: true,
  },
  // {
  //   path: "/creditCardChangeTravelNoticePage",
  //   component: CreditCardChangeTravelNoticePage,
  //   isPrivate: true,
  // },
  // {
  //   path: "/creditCardChangeLimitPage",
  //   component: CreditCardChangeLimitComponent,
  //   isPrivate: true,
  // },
  {
    path: "/creditCardIncreaseLimitPage",
    component: CreditCardIncreaseLimitPage,
    isPrivate: true
  },
  {
    path: "/invoicePayment",
    component: InvoicePaymentComp,
    isPrivate: true,
  },
  {
    path: "/CreditCardInvestmentComp",
    component: CreditCardInvestmentComp,
    isPrivate: true
  },
  {
    path: "/creditCardHistoryPage",
    component: CreditCardHistory,
    isPrivate: true,
  },
  {
    path: "/creditCardInvoiceHistory",
    component: CreditCardInvoiceHistory,
    isPrivate: true,
  },
  {
    //Even though it is a duplicate path we need this to support toggle between HY/MP/Market place shortcuts
    path: "/motoPayLandingPage",
    component: NewMotoPayLandingPage,
    isPrivate: false,
  },
  {
    path: "/motoPayValuePropsPage",
    component: NewMotoPayValuePropsComponent,
    isPrivate: false,
  },
  {
    path: "/ChatTicketDisplay",
    component: ChatTicketDisplay,
    isPrivate: true,
  },
  {
    path: "/WidgetQRPage",
    component: WidgetPage,
    isPrivate: true,
  },
  {
    path: "/ChatTicketCommentsPage",
    component: ChatTicketCommentsPage,
    isPrivate: true,
  },
  {
    path: "/insurance",
    component: InsuranceComponent,
    isPrivate: true,
  },
  {
    path: "/giftCardComp",
    component: GiftCardFormComp,
    isPrivate: false,
  },
  {
    path: "/giftCardCreation",
    component: GiftCardCreation,
    isPrivate: false,
  },
  {
    path: "/giftCardMain",
    component: GiftCardMain,
    isPrivate: false,
  },
  {
    path: "/upgradeAppPage",
    component: UpgradeAppPage,
    isPrivate: false,
  },
  {
    path: "/",
    component: NewMotoPayLandingPage,
    isPrivate: false,
  }

  
];
export default routes;
