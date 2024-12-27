import Log from "../Log";
import history from "./../../history";
import ArbiApiService from "../ArbiApiService";
import GeneralUtilities from "../GeneralUtilities";
import ImportantDetails from "../../WalletComponents/NewLaunchComponents/ImportantDetails";
import { 
    ACCOUNT_STATUS_ACTIVE, ACCOUNT_STATUS_BLOCKED, ACCOUNT_STATUS_CLOSED, ACCOUNT_STATUS_INACTIVE,
    ACCOUNT_STATUS_PROGRESS
} from "./UnblockAccountTerms";
import androidApiCallsService from "../androidApiCallsService";

function UnblockAccountService() {

    this.checkIfAccountIsBlocked = async (componentName) => {
        const accountStatusResponse = await ArbiApiService.getAccountCurrentStatus(componentName);
        
        if (!GeneralUtilities.isNotEmpty(accountStatusResponse) || !accountStatusResponse.success) {
            Log.sDebug(`Error while checking account active status: ${JSON.stringify(accountStatusResponse)}`, componentName);

            return { isAccountBlocked: false };
        }
        
        const { status, passivelDesbloqueio: canUnblockAccount } = accountStatusResponse.result;

        let isAccountBlocked = false;
        let accountStatusMessage = "";
        let redirectRoute = "";
        let redirectRouteData = {};

        if (status === ACCOUNT_STATUS_ACTIVE) {
            isAccountBlocked = false;
            if(androidApiCallsService.getFromPrefs(ImportantDetails.clientKey)){
                accountStatusMessage = "Unblock Account";
            }else{
                accountStatusMessage = "Normal Login Process";
            }
        } else if (status === ACCOUNT_STATUS_INACTIVE && canUnblockAccount) {
            // Account Blocked, Unblock Account Process
            isAccountBlocked = true;
            redirectRoute = "/unblockAccount";
            accountStatusMessage = "Account Blocked, Unblock Account Process";
        } else if (status === ACCOUNT_STATUS_PROGRESS) {
            // Account Unblocking in Progress Process
            isAccountBlocked = true;
            redirectRoute = "/accountStatus";
            accountStatusMessage = "Account Unblocking in Progress";
            redirectRouteData = { accountStatus: ACCOUNT_STATUS_PROGRESS };
        } else if (
            (status === ACCOUNT_STATUS_INACTIVE && !canUnblockAccount)
            || [ACCOUNT_STATUS_BLOCKED, ACCOUNT_STATUS_CLOSED].includes(status)
        ) {
            // Account Blocked, Contact Center For Unblocking Account Process
            isAccountBlocked = true;
            redirectRoute = "/accountStatus";
            accountStatusMessage = "Account Blocked, Contact Center For Unblocking Account";
            redirectRouteData = { accountStatus: ACCOUNT_STATUS_BLOCKED };
        } else {
            // status === ACCOUNT_STATUS_NOT_FOUND || Default case
            // No Account Found
            isAccountBlocked = false;
            accountStatusMessage = "No Account Found";
        }

        Log.sDebug(`${accountStatusMessage}: ${JSON.stringify(accountStatusResponse)}`, componentName);

        return { isAccountBlocked, redirectRoute, redirectRouteData };
    }

    this.unblockUserAccount = async (componentName, imageJwtToken, base64Image) => {
        const unblockAccountResponse = await ArbiApiService.unblockUserAccount(imageJwtToken, base64Image, componentName);

        if (!GeneralUtilities.isNotEmpty(unblockAccountResponse) || !unblockAccountResponse.success) {
            Log.sDebug(`Error while unblocking account: ${JSON.stringify(unblockAccountResponse)}`, componentName);

            return false;
        }

        return true;
    }

    this.clearLoginDataHomeRedirect = () => {
        ImportantDetails.resetAllFields();
        history.replace({ pathname: "/", state: { from: this.componentName }, transition: "right" });
    }
}

export default new UnblockAccountService();