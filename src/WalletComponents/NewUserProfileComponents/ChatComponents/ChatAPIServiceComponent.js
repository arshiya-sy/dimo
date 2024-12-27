import arbiApiService from "../../../Services/ArbiApiService";
import ArbiResponseHandler from "../../../Services/ArbiResponseHandler";
import moment from "moment";
import GeneralUtilities from "../../../Services/GeneralUtilities";
import androidApiCalls from "../../../Services/androidApiCallsService";
import Log from "../../../Services/Log";
import PageNames from "../../../Services/PageNames";
import ImportantDetails from "../../NewLaunchComponents/ImportantDetails";

function ChatAPIServiceComponent() {

  let txData = [];
  var localeObj = {};

  this.checkPixLimit = () => {
      return new Promise((resolve) => {
        (async () => {
          try {
              const response = await arbiApiService.getPendingLimitChange(PageNames.chatComponent);
              if (response.success) {
                let processorResponse =
                  ArbiResponseHandler.processPendingChnangePixLimitResponse(
                    response.result
                  );
                if (
                  processorResponse.success &&
                  GeneralUtilities.notEmptyNullUndefinedCheck(
                    processorResponse.pendingObj.requestDateTime,
                    false
                  )
                ) {
                  const device_locale = androidApiCalls.getLocale();
                  const pixDate = processorResponse?.pendingObj?.requestDateTime;
                  let pixLimitDate = processorResponse?.pendingObj?.requestDate;
                  const pixIdentifier = processorResponse?.pendingObj?.pixRequestIdentifier;

              pixLimitDate = moment(pixLimitDate, "DD/MM/YYYY").format("YYYY-MM-DD");
              const formattedPixLimitDate = device_locale.includes("en")
                ? moment(pixLimitDate).format("YYYY-MM-DD")
                : moment(pixLimitDate).format("DD-MM-YYYY");
              const has48HoursPassed = moment().diff(pixDate, "hours") >= 48;
              if (has48HoursPassed) {
                const requestValue =
                  processorResponse.pendingObj.requestedValue;
                resolve({
                  name: "AGREEABLE_LIMIT",
                  amount: requestValue,
                  date: formattedPixLimitDate,
                  pixId: pixIdentifier
                });
              } else {
                resolve({ name: "USER_WAIT", date: pixDate });
              }
            } else {
              resolve("PIX_REDIRECT");
            }
          } else {
            resolve("");
          }
        } catch (e) {
          Log.Debug("getPendingLimitChange failed", e);
          resolve("");
        }
      })();
    });
  };

  this.checkAccountStatus = () => {
    return new Promise((resolve) => {
      const userAccountStatus = ImportantDetails.pendingObj.accountStatus;
      resolve(userAccountStatus);
    });
  };

  this.getTransactionHistoryfor180days = () => {
    const startDate = moment().subtract(90, 'days');
    const prevEndDate = startDate.clone().subtract(1, 'days');
    const prevStartDate = prevEndDate.clone().subtract(90, 'days');
    const stDate = prevStartDate.toISOString();
    const edDate = prevEndDate.toISOString();


      return new Promise((resolve) => {
        arbiApiService.getTransactionHistory(stDate, edDate, "all", 0, PageNames.chatComponent)
          .then(response => {
              if (response.success) {
                  let processorResponse = ArbiResponseHandler.processTransactionHistoryApiResponse(response.result);
                  if (processorResponse.success) {
                      txData = processorResponse.transactionData;
                      let lastTransactionDate = "";
                      if(txData.length > 0){
                        lastTransactionDate = txData[0].formatDate;
                      }
                      const isTransactions = this.processTransactions();
                      if (isTransactions) {
                        resolve({ areTransactionsAvailable: true, date: lastTransactionDate });
                      } else {
                        resolve({ areTransactionsAvailable: false});
                      } 
                  } else {
                      resolve(false);
                  }
          } else {
            resolve(false);
          }
        });
    });
  }

  this.getPagewiseTransactionsForPeriod = () => {
    const currentDate = moment();
    const startDate = moment().subtract(90, 'days');
    const stDate = startDate.toISOString();
    const edDate = currentDate.toISOString();

    return new Promise((resolve) => {
      arbiApiService.getTransactionHistory(stDate, edDate, "all")
        .then(response => {
          if (response.success) {
            let processorResponse = ArbiResponseHandler.processTransactionHistoryApiResponse(response.result);
            if (processorResponse.success) {
              txData = processorResponse.transactionData;
              let lastTransactionDate = "";
              if (txData.length > 0) {
                lastTransactionDate = txData[0].formatDate;
              }
              const isTransactions = this.processTransactions();
              if (isTransactions) {
                resolve({ areTransactionsAvailable: true, date: lastTransactionDate });
              } else {
                resolve({ areTransactionsAvailable: false });
              }
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        });
    });
  };

  this.processTransactions = () => {
    const TransactionArray = GeneralUtilities.transactionHistoryDateOrganizer(txData, localeObj);
    const finalArray = TransactionArray.filter(entry => Object.keys(entry.transactions).length !== 0);
    return finalArray.length > 0;
  };

}

export default new ChatAPIServiceComponent();
