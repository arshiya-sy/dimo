import moment from "moment";

import ImportantDetails from "../WalletComponents/NewLaunchComponents/ImportantDetails";
import androidApiCalls from "./androidApiCallsService";
import GeneralUtilities from "./GeneralUtilities";
import NewUtilities from "./NewUtilities";
import ClientCreationJson, { copyParametersIntoClientCreationJson } from "./ClientCreationJson";
import Globals from "./Config/config";
import { arbiEnvironment } from "./Config/config"
import TransactionTypeFilter from "./TransactionTypeFilter";
import { ONBOARD_STATUS } from "../Services/MetricsService";
import Log from "./Log";
import constantObjects from "./Constants";

class ResponseObject {

  constructor(success, payload) {
    this.success = success;
    this.payload = payload;
  }

}

const clientCreationStatus = Object.freeze({
  UPLOAD_DOCUMENT: "UPLOAD_DOCUMENT",
  UPLOAD_SELFIE: "UPLOAD_SELFIE",
  ADD_ID_DETAILS: "ADD_ID_DETAILS",
  ADD_OTHER_INFO: "ADD_OTHER_INFO",
  SIGN_TERMS: "SIGN_TERMS",
  VALIDATE_EMAIL: "VALIDATE_EMAIL",
  CAF_ANALISE: "CAF_ANALISE",
  KYC_ANALISE: "KYC_ANALISE",
  CAF_REJECTED: "CAF_REJECTED",
  KYC_REJECTED: "KYC_REJECTED",
  REGISTRATION_COMPLETE: "REGISTRATION_COMPLETE",
  UNKNOWN_STATUS: "UNKNOWN_STATUS"
});

function ArbiResponseHandler() {

  this.AUTH_INVALID_CREDENTIALS = "Invalid user name or password";
  this.EXECUTION_SUCCESSFUL = "FINALIZADA_COM_SUCESSO";
  this.temp_credit_success = "FINALIZADA_COM_ERROS";
  this.INCOORRECT_PIN = "PIN incorreto";
  this.organizationUnitId = Globals.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX ? 3 : constantObjects.featureEnabler.PROD_ORGID;
  this.productId = Globals.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX ? "e86ed3fd-4b9c-49aa-80d4-3c6113fa8cf7" : "c098e090-9101-4c94-85af-65e2e0438ade";

  //Onboardong sections
  this.DOCUMENTS = "Documentos";
  this.SELFIE = "Selfie";

  this.processCreateWalletUserResponse = function (result) {
    if (!result) {
      return { "success": false }
    }
    else {
      ImportantDetails.clientKey = result.chaveDeCliente;
      androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.USER_CREATED);
      return { "success": true, "message": result.mensagem, "clientKey": result.chaveDeCliente }
    }
  }

  this.processEmailIdResponse = function (result) {
    if (!result) {
      return { "success": false }
    } else {
      return { "success": true, "message": result.mensagem }
    }
  }

  this.processGetAllClientDataResponse = function (result, from) {
    if (result.idStatusExecucao === 0 || result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      copyParametersIntoClientCreationJson(result);
      ImportantDetails.setUploadDocType(result.ultimoTipoDocumentoValido);

      let city = "";
      if (result.endereco && result.endereco.cidade) {
        city = result.endereco.cidade;
      }

      if (from === "profile") {
        let profileObj = ClientCreationJson;
        profileObj["emailConfirmado"] = result.emailConfirmado;
        return { "success": true, "data": JSON.parse(JSON.stringify(profileObj)) };
      } else if (from === "onBoard") {
        return { "success": true, "emailConfirmed": result.emailConfirmado }
      }
      return { "success": true, "data": JSON.parse(JSON.stringify(ClientCreationJson)), "city": city };
    }
    return { "success": false }
  }

  this.processUploadFrontDocResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false }
    }
  }

  this.processUploadBackDocResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.DOCUMENT_UPLOADED);

      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false }
    }
  }

  this.processUploadSelfieDocResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {

      androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.SELFIE_UPLOADED);

      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false }
    }
  }

  this.processOcrResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return new ResponseObject(true, result.dadosOcr);
    } else {
      return new ResponseObject(false);
    }
  }

  this.processCreateClientResponse = function (data) {
    if (data.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true };
    } else {
      return { "success": false }
    }
  }

  this.processGetToaResponse = function (data) {
    if (data.arquivo.base64 !== "") {
      let toa = data.arquivo.base64;
      return { "success": true, "toa": toa };
    } else {
      return { "success": false }
    }
  }

  this.processGetTosResponse = function (data) {
    if (data.arquivo.base64 !== "") {
      let tos = data.arquivo.base64;
      return { "success": true, "tos": tos };
    } else {
      return { "success": false }
    }
  }

  this.processAcceptTermsResponse = function (result, count) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      if (count === 2) {
        androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.TERMS_AND_CONDITIONS_SIGNED);
      }

      return { "success": true }
    } else {
      return { "success": false }
    }
  }

  this.processGetStatusResponse = function (data) {
    let returnObj = {};
    if (data.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let status = data.statusCadastroClienteId;
      let Pendencies = data.pendencias;
      let remainingIncompleteSections = data.pendentesOnboard;

      let sections = data.erros.map(errorObject => {
        return errorObject.sessaoId;
      });
      switch (status) {
        case 1:
          // PreCadastro
          if (remainingIncompleteSections.length === 0) {
            // ideally we should not get into this case, it should be in waiting for signature state
            returnObj["success"] = true;
            returnObj["status"] = clientCreationStatus.SIGN_TERMS;

            androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.PERSONAL_INFO_ENTERED);

          } else {
            if (remainingIncompleteSections.indexOf(this.DOCUMENTS) !== -1) {
              returnObj["success"] = true;
              returnObj["status"] = clientCreationStatus.UPLOAD_DOCUMENT;
            } else if (remainingIncompleteSections.indexOf(this.SELFIE) !== -1) {
              returnObj["success"] = true;
              returnObj["status"] = clientCreationStatus.UPLOAD_SELFIE;
            } else {
              returnObj["success"] = true;
              returnObj["status"] = clientCreationStatus.ADD_ID_DETAILS;
              returnObj["Pendencies"] = Pendencies;
            }
          }
          break;
        case 2:
          // CadastroCompleto
          returnObj["success"] = true;
          returnObj["status"] = clientCreationStatus.REGISTRATION_COMPLETE;
          break;
        case 3:
          // KYCAnalise
          returnObj["success"] = true;
          returnObj["status"] = clientCreationStatus.KYC_ANALISE;
          break;
        case 5:
          // KYCNegado
          returnObj["success"] = true;
          returnObj["status"] = clientCreationStatus.KYC_REJECTED;
          returnObj["Pendencies"] = Pendencies;

          androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.CLIENT_REJECTED_OTHER);

          break;
        case 7:
          // CAFAnalise
          returnObj["success"] = true;
          returnObj["status"] = clientCreationStatus.CAF_ANALISE;
          break;
        case 8:
          // CAFNegado
          returnObj["success"] = true;
          returnObj["status"] = clientCreationStatus.CAF_REJECTED;
          returnObj["sections"] = sections;
          break;
        case 9:
          // AguardandoAssinatura
          returnObj["success"] = true;
          returnObj["status"] = clientCreationStatus.SIGN_TERMS;
          androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.PERSONAL_INFO_ENTERED);
          break;
        case 13:
          // AguardandoConfirmacaoEmail
          returnObj["success"] = true;
          returnObj["status"] = clientCreationStatus.VALIDATE_EMAIL;
          androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.PERSONAL_INFO_ENTERED);
          break;
        default:
          returnObj["success"] = false;
          returnObj["status"] = clientCreationStatus.UNKNOWN_STATUS;
          break;
      }
    } else {
      returnObj["success"] = false;
      returnObj["status"] = clientCreationStatus.UNKNOWN_STATUS;
    }
    return returnObj;
  }

  this.processCreateAccountResponse = function (data) {
    if (data.success === true) {
      let accountInfo = data.result;
      const accountKey = accountInfo.chaveDeConta;
      const userName = accountInfo.nomeCliente;
      const nickName = accountInfo.apelido;
      const bankDetails = accountInfo.contaBancarizada;
      const bankNumber = bankDetails.banco;
      const agencyNumber = bankDetails.agencia;
      const accountNumber = bankDetails.conta;
      const accountType = bankDetails.tipoConta;
      const cpf = accountInfo.identificacaoFiscal;
      const startDate = accountInfo.dataAbertura;

      if (GeneralUtilities.areAllArgsValid(accountKey, userName, bankNumber, agencyNumber, accountNumber, accountType, cpf)) {

        ImportantDetails.accountNumber = accountNumber;
        ImportantDetails.agencyNumber = agencyNumber.split("-")[0];
        ImportantDetails.bankNumber = bankNumber;
        ImportantDetails.accountType = accountType;

        ImportantDetails.userName = userName;
        ImportantDetails.accountKey = accountKey;
        ImportantDetails.cpf = cpf;
        ImportantDetails.nickName = nickName;
        ImportantDetails.dateOfOpening = startDate;
        ImportantDetails.fetchedAccountData = true;

        androidApiCalls.setOnboardingProgressInfo(ONBOARD_STATUS.ACCOUNT_CREATED);
        return { "success": true };
      }
    } else {
      return { "success": false };
    }
  }

  this.processChangePasswordResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true }
    } else {
      return { "success": false }
    }
  }

  this.processChangeAccountPinResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true }
    } else {
      return { "success": false }
    }
  }

  this.processforgotAccountPin2faResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      Log.sDebug("Token Sent", "ARBI API SERVICE");
      return { "success": true }
    } else {
      return { "success": false }
    }
  }

  this.processforgotAccountPinResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true }
    } else {
      return { "success": false }
    }
  }

  this.processChangeCardPinResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      //Log.sDebug("Card PIN reset");
      return { "success": true }
    } else {
      return { "success": false }
    }
  }

  this.processForgotPasswordResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      //message not being displayed
      let len = result.mensagem.split(" ").length;
      if (len >= 1) {
        let message = result.mensagem.split(" ")[len - 1];
        return { "success": true, "message": message }
      } else {
        return { "success": false }
      }
    } else {
      return { "success": false }
    }
  }

  this.processBalanceApiResponse = function (result) {
    let balance = result.saldo;
    ImportantDetails.balanceFetched = true;
    return { "success": true, "balance": balance };
  }

  this.processTransactionHistoryApiResponse = function (result) {
    let transactionData = [];
    let paginationDetails = {
      "maxPageNumber": result.qtdPaginas,
      "totalTransactions": result.totalItems,
      "transactionsPerPage": result.qtdPorPagina
    }
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      const device_locale = androidApiCalls.getLocale();
      for (const item of result.items) {
        let transactionType = "C";
        if (item.descricaoTipoTransacao === "DEBITO") {
          transactionType = "D";
        }
        let formatted = "";
        let decimal = "";
        const dateOfTransaction = item.dataHoraTransacao;
        const formattedDate = moment(item.dataHoraTransacao).format('DD/MM/YYYY');
        const formatForChatbot = device_locale.includes("en") ? moment(item.dataHoraTransacao).format('YYYY-MM-DD') : moment(item.dataHoraTransacao).format('DD-MM-YYYY');
        const hour = moment(item.dataHoraTransacao).format('HH');
        const mins = moment(item.dataHoraTransacao).format('mm');
        let typeID = item.motivoTransacaoId;
        let txnType = TransactionTypeFilter.findTxnType(typeID);
        if (item.valorBRL !== null || !(item.valorBRL === "")) {
          formatted = item.valorBRL.toString().split(".")[0];
          if (item.valorBRL.toString().length > 1) {
            decimal = item.valorBRL.toString().split(".")[1] ? '' + item.valorBRL.toString().split(".")[1] : "00";
          } else {
            decimal = "00"
          }
        } else {
          formatted = "0";
          decimal = "00";
        }
        transactionData.push(
          {
            date: dateOfTransaction,
            formatDate: formattedDate,
            formatForChatbot: formatForChatbot,
            description: item.descricaoAbreviada,
            nameOfParty: item.detalhe,
            transaction: transactionType,
            amount: item.valorBRL,
            formatted_amount: formatted,
            decimal: decimal,
            transactionId: item.transacaoId,
            autenticacao: item.autenticacao,
            hour: hour,
            mins: mins,
            isTarrif: item.tarifa,
            hasReceipt: item.temComprovante,
            isBoleto: false,
            isScheduled: false,
            isFailed: !item.processada,
            transactionTypeID: typeID.toString(),
            transactionTypeName: txnType.toUpperCase()
          });
      }
      return {
        "success": true,
        "transactionData": transactionData,
        "paginationData": paginationDetails
      }
    } else {
      return { "success": false }
    }
  }

  this.processTransactionHistoryApiResponseForFilter = function (result, filterType) {
    let transactionData = [];
    let paginationDetails = {
      "maxPageNumber": result.qtdPaginas,
      "totalTransactions": result.totalItems,
      "transactionsPerPage": result.qtdPorPagina
    };
    let tempTotalTxns = 0;
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      for (const item of result.items) {
        let transactionType = "C";
        if (item.descricaoTipoTransacao === "DEBITO") {
          transactionType = "D";
        }
        let formatted = "";
        let decimal = "";
        const dateOfTransaction = item.dataHoraTransacao;
        const formattedDate = moment(item.dataHoraTransacao).format('DD/MM/YYYY');
        const formatForChatbot = moment(item.dataHoraTransacao).format('YYYY-MM-DD');
        const hour = moment(item.dataHoraTransacao).format('HH');
        const mins = moment(item.dataHoraTransacao).format('mm');
        let typeID = item.motivoTransacaoId;
        let txnType = TransactionTypeFilter.findTxnType(typeID);
        if (item.valorBRL !== null || !(item.valorBRL === "")) {
          formatted = item.valorBRL.toString().split(".")[0];
          if (item.valorBRL.toString().length > 1) {
            decimal = item.valorBRL.toString().split(".")[1] ? '' + item.valorBRL.toString().split(".")[1] : "00";
          } else {
            decimal = "00"
          }
        } else {
          formatted = "0";
          decimal = "00";
        }
        if (filterType.toUpperCase() === "ALL TYPES" || filterType.toUpperCase() === txnType.toUpperCase()) {
          tempTotalTxns = tempTotalTxns + 1;
          transactionData.push({
            date: dateOfTransaction,
            formatDate: formattedDate,
            formatForChatbot: formatForChatbot,
            description: item.descricaoAbreviada,
            nameOfParty: item.detalhe,
            transaction: transactionType,
            amount: item.valorBRL,
            formatted_amount: formatted,
            decimal: decimal,
            transactionId: item.transacaoId,
            autenticacao: item.autenticacao,
            hour: hour,
            mins: mins,
            isTarrif: item.tarifa,
            hasReceipt: item.temComprovante,
            isBoleto: false,
            isScheduled: false,
            isFailed: !item.processada,
            transactionTypeID: typeID.toString(),
            transactionTypeName: txnType.toUpperCase()
          });
        }
      }
      paginationDetails.totalTransactions = tempTotalTxns;
      return {
        "success": true,
        "transactionData": transactionData,
        "paginationData": paginationDetails
      }
    } else {
      return { "success": false }
    }
  }

  this.processGetReceiptForTransactions = function (result) {
    let recepitJSON = result.result.dadosComprovante;
    recepitJSON["autenticacao"] = result.result.autenticacao;
    //Log.sDebug("responsehandler" + JSON.stringify(recepitJSON));
    return { "success": true, "receiptObj": recepitJSON }
  }

  this.processBoletoHistoryApiResponse = function (result, locale) {
    let boletoData = [];
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      for (const item of result.listaBoletos) {
        if (item.linhaDigitavel && item.nossoNumero) {
          const createdDate = item.dataEmissao;
          const dueDate = item.dataVencimento;
          let itemDate = new Date(item.dataVencimento);
          let currentDate = new Date();
          let transactionType = false;
          let description;
          switch (item.statusBoletoDescricao) {
            case "Pago":
              description = locale.paid_boleto;
              transactionType = "C";
              break;
            case "Aberto":
              if (itemDate.getFullYear() < currentDate.getFullYear() ||
                (itemDate.getFullYear() === currentDate.getFullYear() &&
                  itemDate.getMonth() < currentDate.getMonth()) ||
                (itemDate.getFullYear() === currentDate.getFullYear() &&
                  itemDate.getMonth() === currentDate.getMonth() &&
                  itemDate.getDate() < currentDate.getDate())) {
                description = locale.expired;
                transactionType = "E";
              } else {
                description = locale.boleto_payment;
                transactionType = "B";
              }
              break;
            case "Baixado":
            case "Float":
              transactionType = "E";
              if (itemDate.getFullYear() < currentDate.getFullYear() ||
                (itemDate.getFullYear() === currentDate.getFullYear() &&
                  itemDate.getMonth() < currentDate.getMonth()) ||
                (itemDate.getFullYear() === currentDate.getFullYear() &&
                  itemDate.getMonth() === currentDate.getMonth() &&
                  itemDate.getDate() < currentDate.getDate())) {
                description = locale.expired;
              } else {
                description = locale.cancelled;
              }
              break;
            default:
              description = locale.boleto_payment;
              transactionType = "E";
              break;
          }
          boletoData.push({
            date: createdDate, expiryDate: dueDate, number: item.linhaDigitavel, amount: item.valorNominal, boletoId: item.boletoId,
            bankSlip: item.nossoNumero, description: description, nameOfParty: locale.created, transaction: transactionType,
            isTarrif: false,
            isBoleto: true
          });
        }
      }
      return {
        "success": true,
        "boletoData": boletoData
      }
    } else {
      return { "success": false }
    }
  }

  this.processTedInternalTransferResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "transactionId": result.identificacaoTransacao,
        "date": result.dataCriacao
      }
    } else {
      return { "success": false }
    }
  }

  this.processTedExternalTransferResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "transactionId": result.identificacaoTransacao,
        "date": result.dataCriacao
      }
    } else {
      return { "success": false }
    }
  }


  this.processAtmWithdrawlApi = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "transactionCode": result.idTransacaoSaque }
    } else {
      return { "success": false }
    }
  }

  this.processPixWithdrawlApi = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true }
    } else {
      return { "success": false }
    }
  }

  /* this handler returns the virtual card details */
  this.processGetCardDetailsApi = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      if (result.items.length !== 0) {
        let virtualCardDetails = result.items.filter(item => item.fisico === false);
        let physicalCardDetails = result.items.filter(item => item.fisico === true);
        if (physicalCardDetails.length !== 0) {
          return {
            "success": true,
            "result": result,
            "virtualCardDetails": virtualCardDetails,
            "physicalCardDetails": physicalCardDetails,
          }
        } else if (virtualCardDetails.length !== 0 && physicalCardDetails.length === 0) {
          return {
            "success": false,
            "result": result,
            "error": "VIRTUAL_CARD_ONLY",
            "virtualCardDetails": virtualCardDetails,
          }
        } else {
          return {
            "success": false,
            "error": "NO_CARDS"
          }
        }
      } else {
        return {
          "success": false,
          "error": "NO_CARDS"
        }
      }
    } else {
      return { "success": false, "error": "Cards currently unavailable" }
    }
  }

  this.processGetCreditCardDetailsApi = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      if (result.items.length !== 0) {
        let physicalVisaCardDetails = result.items.filter(item => item.fisico === true && item.bandeiraNome === "VISA");
        if (physicalVisaCardDetails.length !== 0) {
          return {
            "success": true,
            "result": result,
            "physicalCardDetails": physicalVisaCardDetails,
          }
        } else {
          return {
            "success": false,
            "error": "NO_CARDS"
          }
        }
      } else {
        return {
          "success": false,
          "error": "NO_CARDS"
        }
      }
    } else {
      return { "success": false, "error": "Cards currently unavailable" }
    }
  }

  this.processRequestVirtaulCardAPI = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "virtualCardDetails": result
      }
    } else {
      return { "success": false, "error": "ERROR_GETTING_DETAILS" }
    }
  }

  this.processRequestPhysicalCardAPI = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let physicalCardDetails = result;
      let cardNumber = physicalCardDetails.cartaoNumero.replace(/X/g, "*").replace(/ /g,);
      let cardExpiry = physicalCardDetails.cartaoDataExpiracao.split("/").join("");
      let physicalCardKey = physicalCardDetails.chaveDeCartao;
      androidApiCalls.storeToPrefs("physicalCardKey", physicalCardKey);
      return {
        "success": true,
        "cardDetails": {
          "cardNumber": cardNumber,
          "cardExpiry": cardExpiry
        }
      }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processSecondCopyRequest = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let physicalCardDetails = result;
      let cardNumber = physicalCardDetails.cartaoNumero.replace(/X/g, "*").replace(/ /g,);
      let cardExpiry = physicalCardDetails.cartaoDataExpiracao.split("/").join("");
      let physicalCardKey = physicalCardDetails.chaveDeCartao;
      androidApiCalls.storeToPrefs("physicalCardKey", physicalCardKey);
      return {
        "success": true,
        "cardDetails": {
          "cardNumber": cardNumber,
          "cardExpiry": cardExpiry
        }
      }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processUnblockCardByIssueResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      //Log.sDebug("Card Unblocked");
      return { "success": true }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processUnblockCardTempResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      //Log.sDebug("Card Unblocked");
      return { "success": true }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processGetOPCResponse = function (result) {
    //Log.sDebug(JSON.stringify(result), "ARBI API RESPONSE HANDLER SERVICE");
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }


  this.processUnblockCardIncorrectPinResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processBlockCardTempResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processBlockCardDamagedResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processBlockCardStolenResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processBlockCardLostResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processforgotCardPin2faResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false }
    }
  }

  this.processforgotCardPinResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true }
    } else {
      return { "success": false }
    }
  }

  this.processgetDetailsofChosenCardResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      //Log.sDebug("Card Details Fetched");
      return {
        "success": true,
        "cardDetails": {
          "cvv": result.cvv,
          "cardNumber": result.cartaoNumero,
          "expiryDate": result.cartaoDataExpiracao,
          "status": result.descricaoStatusCartao,
          "name": ImportantDetails.userName
        }
      }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processCpfSetUpPixKeyResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "pixKey": result.chaveEnderecamento }
    } else {
      return { "success": false, "details": result.mensagem }
    }
  }

  this.processCreateEmailPixKeyResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "pixKey": result.chaveEnderecamento }
    } else {
      return { "success": false, "details": result.mensagem }
    }
  }

  this.processCreatePhonePixKeyResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "pixKey": result.chaveEnderecamento }
    } else {
      return { "success": false, "details": result.mensagem }
    }
  }

  this.processCreateEvpPixKeyResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "pixKey": result.chaveEnderecamento }
    } else {
      return { "success": false, "details": result.mensagem }
    }
  }

  this.processGetPixKeyDetailsResponse = function (result, pixKey, localeObj) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {

      return {
        "success": true,
        pixKeyDetails: {
          "endToEnd": result.endToEnd,
          "pixKeyType": result.tipoChave,
          "name": result.nome,
          "CPF": result.identificaoFiscal,
          "accountNum": result.conta,
          "accAgency": result.agencia,
          "bankCode": result.codInstituicao,
          "institute": result.nomeInstituicao.toString().toUpperCase().includes("ARBI S.A") ? localeObj.bank_name : result.nomeInstituicao,
          "date": result.data,
          "pixKey": result.chaveEnderecamento,
          "sameUser": result.mesmoDetentor
        }
      }

    } else {
      return { "success": false }
    }
  }

  this.processpixTransferForKeyResponse = function (result, localeObj) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {

      let jsonObject = {
        "success": true,
        "transactionDetails": {
          "receiver": {
            [localeObj.name]: result.nomeBeneficiario,
            [localeObj.cpf]: GeneralUtilities.maskCpf(result.identificacaoFiscalBeneficiario),
            [localeObj.Institution]: result.nomeInstituicaoBeneficiario.toUpperCase(),
          },
          "payer": {
            [localeObj.name]: result.nomePagador,
            [localeObj.cpf]: GeneralUtilities.maskCpf(result.identificacaoFiscalPagador),
            [localeObj.Institution]: localeObj.bank_name,
          },
          "amount": result.valorOperacao.toString().split(".")[0],
          "decimal": result.valorOperacao.toString().split(".")[1] ? '' + result.valorOperacao.toString().split(".")[1] : "00",
          "transactionCode": result.idTransacao.toString(),
          "externalTransactionCode": result.endToEnd.toString(),
          "date": result.data
        }
      };
      return jsonObject;
    } else {
      return { "success": false }
    }
  }

  this.processpixTransferForAccountResponse = function (result, localeObj) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {

      let jsonObject = {
        "success": true,
        "transactionDetails": {
          "receiver": {
            [localeObj.name]: result.nomeBeneficiario,
            [localeObj.cpf]: GeneralUtilities.maskCpf(result.identificacaoFiscalBeneficiario),
            [localeObj.Institution]: result.nomeInstituicaoBeneficiario.toUpperCase(),
          },
          "payer": {
            [localeObj.name]: result.nomePagador,
            [localeObj.cpf]: GeneralUtilities.maskCpf(result.identificacaoFiscalPagador),
            [localeObj.Institution]: result.nomeInstituicaoPagador.toString().toUpperCase().includes("ARBI S.A") ? localeObj.bank_name : result.nomeInstituicaoPagador,
          },
          "amount": result.valorOperacao.toString().split(".")[0],
          "decimal": result.valorOperacao.toString().split(".")[1] ? '' + result.valorOperacao.toString().split(".")[1] : "00",
          "transactionCode": result.idTransacao.toString(),
          "externalTransactionCode": result.endToEnd.toString(),
          "date": result.data,
        }
      };
      return jsonObject;
    } else {
      return { "success": false }
    }
  }

  this.processGetAllPixKeysResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let pixKeys = [];

      result.chaves.forEach(element => {
        if (element.chaveEnderecamento) {
          let individualKey = {
            "key_type": element.tipoChave,
            "key_value": element.chaveEnderecamento,
            "cpf": element.identificaoFiscal,
            "name": element.nome,
            "institution": element.nomeInstituicao,
            "registered": element.dataCriacao
          }
          pixKeys.push(individualKey);
        }
      });

      return { "success": true, "pixKeys": pixKeys };
    } else {
      return { "success": false }
    }

  }

  this.processdeletePixKeyResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "message": result.mensagem
      }
    } else {
      return { "success": false }
    }
  }

  this.processGenerateStaticQrCodeResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL && result.arquivo) {
      return {
        "success": true, qrCode: {
          data: result.arquivo.base64,
          format: result.arquivo.extensao,
          copyCode: result.codigoCopiaCola
        }
      }
    } else {
      return { "success": false }
    }
  }

  this.processGetBoletoDetails = function (result, localeObj) {
    if (result.idStatusExecucao === 0) {

      if (!result["linhaDigitavel"] && !result["valorAtualizado"]) {
        //these two are mandatory fields
        return { "success": false }
      }

      let boletoInfo = {
        [localeObj.beneficiary]: result["nomeBeneficiario"],
        [localeObj.cnpj]: result["identificacaoFiscalBeneficiario"],
        [localeObj.payer]: result["nomePagador"],
        [localeObj.payerscpf]: result["identificacaoFiscalPagador"],
        [localeObj.amount]: [localeObj.currency] + NewUtilities.formatAmount(result["valor"]),
        [localeObj.totalfine]: [localeObj.currency] + NewUtilities.formatAmount(result["totalJurosMulta"]),
        [localeObj.totaldiscount]: [localeObj.currency] + NewUtilities.formatAmount(result["totalDesconto"]),
        [localeObj.final_amount]: [localeObj.currency] + NewUtilities.formatAmount(result["valorAtualizado"])
      };

      let modifiedBoletoInfo = {};

      //remove null/undefined values
      for (const key in boletoInfo) {
        if (Object.hasOwnProperty.call(boletoInfo, key)) {
          const element = boletoInfo[key];
          if (GeneralUtilities.areAllArgsValid(element)) {
            modifiedBoletoInfo[key] = element;
          }
        }
      }
      let expiryDate = Date.parse(result["dataVencimento"]);

      if (expiryDate) {
        modifiedBoletoInfo[localeObj.due_date] = moment(expiryDate).format('DD/MM/YYYY')
        Log.verbose("modified boleto " + JSON.stringify(modifiedBoletoInfo));
      }

      if (result["horarioInicioPagamento"] && result["horarioLimitePagamento"]) {
        modifiedBoletoInfo[localeObj.payment_time] = result["horarioInicioPagamento"] + "-" + result["horarioLimitePagamento"];
      }

      return {
        "success": true,
        "boletoInformation": {
          "receiver": modifiedBoletoInfo,
          "digitableLine": result["linhaDigitavel"],
          "payableAmount": result["valorAtualizado"],
          "amount": result["valorAtualizado"] ? result["valorAtualizado"].toString().split(".")[0] : "",
          "decimal": result["valorAtualizado"] ? (result["valorAtualizado"].toString().split(".")[1] ? result["valorAtualizado"].toString().split(".")[1] : "00") : "",
          "transferType": "Boleto",
          "dueDate": result["dataVencimento"]
        }
      }
    } else {
      return {
        "success": false
      }
    }
  }

  this.processPayBoletoApi = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "transactionId": result.idTransacao,
        "date": result.data ? result.data : new Date().toISOString()
      }
    } else {
      return {
        "success": false
      }
    }
  }

  this.processCancelBoletoApi = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": result.boletoBaixado,
      }
    } else {
      return {
        "success": false
      }
    }
  }

  this.processPayForAPixKey = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "transactionId": result.endToEnd.toString()
      }
    } else {
      return { "success": false }
    }
  }

  this.processServiceProvidersApiResponse = function (result) {
    var providerID = []
    var providerList = []
    let i = 4;
    if (result.provedores === undefined || result.provedores.length === 0) {
      return { "success": false }
    } else {
      for (const provider of result.provedores) {
        let operator = provider.nome;
        switch (operator.toString()) {
          case "Vivo": providerList[0] = operator.toString();
            providerID[0] = provider.id;
            break;
          case "Claro": providerList[1] = operator.toString();
            providerID[1] = provider.id;
            break;
          case "Tim": providerList[2] = operator.toString();
            providerID[2] = provider.id;
            break;
          case "Oi": providerList[3] = operator.toString();
            providerID[3] = provider.id;
            break;
          default: providerList[i] = operator.toString();
            providerID[i] = provider.id;
            i++;
            break;
        }
      }
      return { "success": true, "providerId": providerID, "providers": providerList };
    }
  }

  this.processRechargeValuesApiResponse = function (result) {
    var valueList = []
    var valueNumber = []
    if ((result && result.valores === undefined) || (result && result.valores.length === 0)) {
      return { "success": false }
    } else {
      for (const value of result.valores) {
        valueNumber.push(value.valorMax)
        valueList.push(value.nomeProduto);
      }
      return { "success": true, "displayAmountList": valueList, "amountList": valueNumber };
    }
  }

  this.processCellularRechargeResponse = function (result) {
    var reciept = ""
    var transactionId = ""

    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      reciept = result.comprovante;
      transactionId = result.idTransacao;
      return { "success": true, "reciept": reciept, "transactionId": transactionId, "date": result.data };
    } else {
      return { "success": false }
    }
  }

  this.processGetAddressResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      if (GeneralUtilities.areAllArgsValid(result.localidade, result.uf)) {
        let addressObj = {
          'street': result.logradouro,
          'neighbourhood': result.bairro,
          //'complement': result.complemento,
          'city': result.localidade,
          'uf': result.uf
        }
        return { "success": true, "address": addressObj }
      }
    }
    return { "success": false }
  }

  this.processCpfValidationResponse = function (result) {
    let clientKey = "";
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      if (!result.clientes || result.clientes.length === 0) {
        return { "success": false };
      } else {
        for (const info of result.clientes) {
          if (info.organizationUnitId === this.organizationUnitId) {
            clientKey = info.chaveDeCliente;
          }
        }
        ImportantDetails.clientKey = clientKey;
        return { "success": true, "clientKey": clientKey };
      }
    } else {
      return { "success": false };
    }
  }

  this.processCpfAlreadyExistsResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      if (!result.clientes || result.clientes.length === 0) {
        return { "success": true };
      } else {
        return { "success": false };
      }
    } else {
      return { "success": true };
    }
  }

  this.processAuthenticateUserApiResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let loginData = result["login"];
      if (loginData["accessToken"] && loginData["expireInSeconds"]) {
        ImportantDetails.accessToken = loginData["accessToken"];
        ImportantDetails.accessTokenExpiryTime = Date.now() + loginData["expireInSeconds"] * 1000 - 4 * 60 * 60 * 1000;
      }

      //message not displayed to user
      if (result.contas.length === 0) {
        return { "loginSuccess": true, "accountSuccess": false, "message": "NO_ACCOUNT" };
      }

      let jsonObj = {};
      for (const item of result.contas) {
        jsonObj["accountStatus"] = item.idStatusConta;
      }
      ImportantDetails.pendingObj = jsonObj;

      const accountInfo = result.contas[0];
      const accountKey = accountInfo.chaveDeConta;
      const userName = accountInfo.nomeCliente;
      const nickName = accountInfo.apelido;
      const bankDetails = accountInfo.contaBancarizada;
      const bankNumber = bankDetails.banco;
      const agencyNumber = bankDetails.agencia;
      const accountNumber = bankDetails.conta;
      const accountType = bankDetails.tipoConta;
      const cpf = accountInfo.identificacaoFiscal;
      const startDate = accountInfo.dataAbertura;

      if (GeneralUtilities.areAllArgsValid(accountKey, userName, bankNumber, agencyNumber, accountNumber, accountType, cpf)) {

        ImportantDetails.accountNumber = accountNumber;
        ImportantDetails.agencyNumber = agencyNumber.split("-")[0];
        ImportantDetails.bankNumber = bankNumber;
        ImportantDetails.accountType = accountType;

        ImportantDetails.userName = userName;
        ImportantDetails.accountKey = accountKey;
        ImportantDetails.cpf = cpf;
        ImportantDetails.nickName = nickName;
        ImportantDetails.dateOfOpening = startDate;
        ImportantDetails.fetchedAccountData = true;

        let editedCpf = cpf.substring(0, 3) + "." + cpf.substring(3, 6) + "." + cpf.substring(6, 9) + "-" + cpf.substring(9, 11)

        return {
          "loginSuccess": true, "accountSuccess": true, "userName": userName, "accountKey": accountKey,
          "agency": agencyNumber, "accountNumber": accountNumber,
          "cpf": cpf, "edited": editedCpf
        };
      } else {
        return { "loginSuccess": true, "accountSuccess": false };
      }
    } else {
      return { "loginSuccess": false }
    }
  }

  this.processDetailsOfPixQRTransaction = function (result, localeObj) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {

      let jsonObject = {
        "success": true,
        "transactionDetails": {
          "receiver": {
            [localeObj.name]: result.nomeBeneficiario,
            [localeObj.cpf]: result.identificacaoFiscalBeneficiario,
            [localeObj.Institution]: result.nomeInstituicaoBeneficiario.toUpperCase(),
          },
          "payer": {
            [localeObj.name]: result.nomePagador,
            [localeObj.cpf]: result.identificacaoFiscalPagador,
            [localeObj.Institution]: result.nomeInstituicaoPagador.toString().toUpperCase().includes("ARBI S.A") ? localeObj.bank_name : result.nomeInstituicaoPagador,
          },
          "date": result.data,
          "amount": result.valorOperacao.toString().split(".")[0],
          "decimal": result.valorOperacao.toString().split(".")[1] ? result.valorOperacao.toString().split(".")[1] : "00",
          "transactionCode": result.endToEnd.toString(),
        }
      };
      return jsonObject;
    } else {
      return { "success": false }
    }
  }

  this.processDetailsOfPixQrCode = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "info": {
          "receiverInstitute": result.nomeInstituicaoBeneficiario,
          "agency": result.agenciaBeneficiario,
          "accountNumber": result.contaBeneficiario,
          "accountType": result.tipoContaBeneficiario,
          "CPF": result.identificaoFiscalBeneficiario,
          "name": result.nomeBeneficiario,
          "receiverKey": result.chaveEnderecamento,
          "endToEnd": result.endToEnd,
          "internalReference": result.referencia,
          "description": result.descricao,
          "qrCodeType": result.tipoQRCode,
          "pixKeyType": "Pix QR Code",
          "amount": result.valorFinal.toString().split(".")[0],
          "decimal": result.valorFinal.toString().split(".")[1] ? '' + result.valorFinal.toString().split(".")[1] : "00",
          "pixType": result.tipoPix
        }
      }
    } else {
      return { "success": false }
    }
  }

  this.processCreateBoletoResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "number": result.linhaDigitavel,
        "doc": result.arquivo
      }
    } else {
      return { "success": false }
    }
  }

  this.processGetAllKeysResponse = function (result) {
    let pixKeys = [];
    let detailsOfUser = {};
    result.chaves.forEach(element => {
      if (element.chaveEnderecamento) {
        let jsonObj = {
          "type": element.tipoChave,
          "key": element.chaveEnderecamento
        }
        pixKeys.push(jsonObj);
      }
    });
    if (result.chaves[0] && result.chaves[0].chaveEnderecamento) {
      detailsOfUser = {
        "name": result.chaves[0].nome,
        "cpf": result.chaves[0].identificaoFiscal.replace(/X/g, "*").replace(/ /g,)
      }
    }
    return { "keys": pixKeys, "userInfo": detailsOfUser }
  }

  this.processPixClaimResponse = function (result) {
    return { "success": result.idStatusExecucao === this.EXECUTION_SUCCESSFUL };
  }

  this.processPixStatusResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let outgoingClaims = [];
      let incomingClaims = [];
      for (const claim of result.reivindicacoes) {
        let concisedClaim = {
          "pixKeyType": claim.tipoChave,
          "pixKeyValue": claim.chaveEnderecamento,
          "claimType": claim.tipoReivindicacao ? (claim.tipoReivindicacao.toUpperCase() === "OWNERSHIP" ? 1 : 2) : 2,
          "claimId": claim.id,
          "requestDate": moment(claim.dataInicio).format('DD/MM/YYYY'),
          "completionDate": moment(claim.limiteResolucao).format('DD/MM/YYYY'),
          "institutionRequesting": claim.contaRequisitante.nomeInstituicao,
          "intitutionDonating": claim.contaDoador.nomeInstituicao,
          "requestersName": claim.requisitante.nomeCliente,
          "requestersCpf": claim.requisitante.identificacaoFiscal,
          "status": claim.statusReivindicacao ? claim.statusReivindicacao : "",
          "blocked": claim.bloqueada
        }
        if (claim.flagRequisitante) {
          outgoingClaims.push(concisedClaim);
        } else {
          incomingClaims.push(concisedClaim);
        }
      }
      return { "success": true, "incomingClaims": incomingClaims, "outgoingClaims": outgoingClaims }
    }
    return { "success": false }
  }

  this.processConcludePixResponse = function (result) {
    return (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL);
  }

  this.processConfirmPixResponse = function (result) {
    return (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL)
  }

  this.processCancelPixResponse = function (result) {
    return (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL)
  }

  this.processGetSignedGenericTermsResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "text": result.arquivo.base64
      }
    } else {
      return { "success": false }
    }
  }

  this.processGetSignedAddressTermsResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "text": result.arquivo.base64,
      }
    } else {
      return { "success": false }
    }
  }

  this.processGetPixTransactionHistoryResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {

      let transactionData = [];
      for (const item of result.extratos) {
        const dateOfTransaction = item.dataMovimento
        const cpfOfParty = item.identificacaoFiscalContraParte;
        transactionData.push({
          date: dateOfTransaction,
          description: item.descricao,
          newDescription: item.campoLivre,
          transaction: item.natureza,
          endToEnd: item.endToEnd,
          amount: item.valorOperacao,
          formatted_amount: item.valorOperacao.toString().split(".")[0],
          decimal: item.valorOperacao.toString().split(".")[1] ? '' + item.valorOperacao.toString().split(".")[1] : "00",
          returnAmount: item.valorDevolucao.toString().split(".")[0],
          returnDecimal: item.valorDevolucao.toString().split(".")[1] ? '' + item.valorOperacao.toString().split(".")[1] : "00",
          returnEligibility: item.indElegivelDevolucao,
          nameOfParty: item.nomeContraParte,
          cpfOfParty: cpfOfParty.substring(0, 3) + "." + cpfOfParty.substring(3, 6) + "." + cpfOfParty.substring(6, 9) + "-" + cpfOfParty.substring(9, 11),
          institutionOfParty: item.nomeInstituicaoLancamento,
          txnId: item.transacaoId,
          cpfUser: item.identificacaoFiscal,
          isTarrif: false,
          isScheduled: false,
          hasReceipt: true
        });

      }
      /* message = 1 -> No transactions yet
         message = 2 -> Error */
      if (result.extratos.length === 0) {
        return ({ "sucess": false, "message": 1 })
      }
      else {
        return ({ "success": true, "txn": transactionData });
      }
    } else {
      return ({ "sucess": false, "message": 2 })
    }
  }

  this.processPixReturnAmountResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {

      return {
        "success": true,
        "transactionId": result.idTransacao,
        "endtoend": result.endToEnd,
        "date": result.data
      }
    } else {
      return { "success": false }
    }
  }

  this.processBankDetails = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let bankOptions = [];
      let codeOptions = [];
      let ispbOptions = [];
      result.items.forEach(element => {
        if (element.idStatusExecucao === 0) {
          bankOptions.push(element.nomeInstituicao);
          codeOptions.push(element.codigo);
          ispbOptions.push(element.ispb);
        }
      });
      return { "success": true, "bankOptions": bankOptions, "codeOptions": codeOptions, "ispbOptions": ispbOptions }
    } else {
      return { "success": false }
    }
  }

  this.processTEDBankDetails = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let bankOptions = [];
      let codeOptions = [];
      let ispbOptions = [];
      result.items.forEach(element => {
        if (element.idStatusExecucao === 0 && element.codigo != "213") {
          bankOptions.push(element.nomeInstituicao);
          codeOptions.push(element.codigo);
          ispbOptions.push(element.ispb);
        }
      });
      return { "success": true, "bankOptions": bankOptions, "codeOptions": codeOptions, "ispbOptions": ispbOptions }
    } else {
      return { "success": false }
    }
  }

  this.processGetISPB = function (result, bankCode) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let selectedBank = result.items.filter(bankDetails => bankDetails.codigo === bankCode);
      if (selectedBank.length === 0) {
        return { "success": false, "message": "Incorrect Details" }
      } else {
        return { "success": true, "ispbNum": selectedBank[0].ispb };
      }
    } else {
      return { "success": false }
    }
  }

  this.processTariffResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let tariff;
      if (result.tarifasOperacao.length === 0) {
        tariff = 0;
      } else {
        result.tarifasOperacao.forEach(element => {
          tariff = element.valorTarifa ? element.valorTarifa : 0;
        });
      }
      tariff = NewUtilities.formatAmount(tariff)
      return { "success": true, "tariff": tariff }
    } else {
      return { "success": false }
    }
  }

  this.processAgencyVerification = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true }
    } else {
      return { "success": false }
    }
  }

  this.processSendTokenToCancelAccount = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {

      const regex = new RegExp('[0-9X]{9}$');
      let messageReturned = result.mensagem;

      let indexOfPhoneNumber = messageReturned.search(regex);
      let phoneNumber = "";

      if (indexOfPhoneNumber !== -1) {
        phoneNumber = messageReturned.slice(indexOfPhoneNumber);
      }

      return { "success": true, "phoneNumber": phoneNumber }
    } else {
      return { "success": false }
    }
  }

  this.processCancelAccountResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false }
    }
  }

  this.processpixScheduleTransferForKeyResponse = function (result, localeObj) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let resultJSON = result.pixAgendado[0];
      let jsonObject = {
        "success": true,
        "transactionDetails": {
          "receiver": {
            [localeObj.name]: resultJSON.nomeBeneficiario,
            [localeObj.cpf]: GeneralUtilities.maskCpf(resultJSON.identificacaoFiscalBeneficiario),
            [localeObj.Institution]: GeneralUtilities.emptyValueCheck(resultJSON.nomeInstituicaoBeneficiario) ? localeObj.bank_name : resultJSON.nomeInstituicaoBeneficiario,
          },
          "payer": {
            [localeObj.name]: ImportantDetails.userName,
            [localeObj.cpf]: GeneralUtilities.maskCpf(ImportantDetails.cpf),
            [localeObj.Institution]: localeObj.bank_name
          },
          "amount": resultJSON.valor.toString().split(".")[0],
          "decimal": resultJSON.valor.toString().split(".")[1] ? '' + resultJSON.valor.toString().split(".")[1] : "00",
          "transactionCode": resultJSON.idAgendamento.toString(),
          "date": resultJSON.dataAgendamento,
          "type": "D"
        }
      };
      return jsonObject;
    } else {
      return { "success": false }
    }
  }

  this.processTedScheduleInternalResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let tedInternalScheduleResult = result.agendamentos[0];
      return {
        "success": true,
        "transactionId": tedInternalScheduleResult.idAgendamento,
        "date": moment().toISOString(),
        "scheduledDate": tedInternalScheduleResult.dataAgendamento,
      }
    } else {
      return { "success": false }
    }
  }

  this.processTedScheduleExternalResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let tedExternalScheduleResult = result.items[0];
      return {
        "success": true,
        "transactionId": tedExternalScheduleResult.idAgendamento,
        "date": tedExternalScheduleResult.dataCriacao,
        "scheduledDate": tedExternalScheduleResult.dataAgendamento
      }
    } else {
      return { "success": false }
    }
  }

  this.processGetPixScheduledTransactions = function (result, localeObj) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let scheduledtransactionData = [];
      let cancelledtransactionData = [];
      for (const item of result.items) {
        const dateOfTransaction = item.dataAgendamento
        const cpfOfParty = item.identificacaoFiscalBeneficiario;
        let currentStatus = item.statusDescricao;

        if (currentStatus === 3 || currentStatus === 4) {
          cancelledtransactionData.push({
            date: dateOfTransaction,
            description: localeObj.pix_schedule_transfer,
            transaction: "D",
            amount: item.valor,
            formatted_amount: item.valor.toString().split(".")[0],
            decimal: item.valor.toString().split(".")[1] ? '' + item.valor.toString().split(".")[1] : "00",
            returnEligibility: false,
            nameOfParty: item.nomeBeneficiario,
            cpfOfParty: GeneralUtilities.formatCPF(cpfOfParty),
            institutionOfParty: GeneralUtilities.emptyValueCheck(item.nomeInstituicaoBeneficiario) ? localeObj.bank_name : item.nomeInstituicaoBeneficiario,
            txnId: item.idAgendamento,
            cpfUser: GeneralUtilities.formatCPF(ImportantDetails.cpf),
            isTarrif: false,
            key: item.chaveEnderecamentoBeneficiario,
            isScheduled: false
          });
        } else {
          let recurrent = item.numeroDeOcorrencias.toString();
          let finalrecurrent = recurrent[0]
          scheduledtransactionData.push({
            date: dateOfTransaction,
            description: localeObj.pix_schedule_transfer,
            transaction: "D",
            amount: item.valor,
            formatted_amount: item.valor.toString().split(".")[0],
            decimal: item.valor.toString().split(".")[1] ? '' + item.valor.toString().split(".")[1] : "00",
            returnEligibility: false,
            nameOfParty: item.nomeBeneficiario,
            cpfOfParty: GeneralUtilities.formatCPF(cpfOfParty),
            institutionOfParty: GeneralUtilities.emptyValueCheck(item.nomeInstituicaoBeneficiario) ? localeObj.bank_name : item.nomeInstituicaoBeneficiario,
            txnId: item.idAgendamento,
            cpfUser: GeneralUtilities.formatCPF(ImportantDetails.cpf),
            key: item.chaveEnderecamentoBeneficiario,
            isTarrif: false,
            recurrence: finalrecurrent,
            isScheduled: true
          });
        }
      }
      /* message = 1 -> No Scheduled transactions yet
         message = 2 -> Error */
      if (result.items.length === 0) {
        return ({ "sucess": false, "message": 1 })
      }
      else {
        return ({ "success": true, "txn_cancelled": cancelledtransactionData, "txn_scheduled": scheduledtransactionData });
      }
    } else {
      return ({ "sucess": false, "message": 2 })
    }
  }

  this.processCancelPixScheduledTransactions = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL && result.statusId === 3) {
      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false }
    }
  }

  this.processPixEditScheduleForKeyResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let jsonObject = {
        "success": true,
        "transactionDetails": {
          "amount": result.valor.toString().split(".")[0],
          "decimal": result.valor.toString().split(".")[1] ? '' + result.valor.toString().split(".")[1] : "00",
          "transactionCode": result.idAgendamento.toString(),
          "date": result.dataAgendamento,
          "type": "D"
        }
      };
      return jsonObject;
    } else {
      return { "success": false }
    }
  }

  this.processTedScheduleInternalResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let tedInternalScheduleResult = result.agendamentos[0];
      return {
        "success": true,
        "transactionId": tedInternalScheduleResult.idAgendamento,
        "date": moment().toISOString(),
        "scheduledDate": tedInternalScheduleResult.dataAgendamento,
      }
    } else {
      return { "success": false }
    }
  }

  this.processTedScheduleExternalResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let tedExternalScheduleResult = result.items[0];
      return {
        "success": true,
        "transactionId": tedExternalScheduleResult.idAgendamento,
        "date": tedExternalScheduleResult.dataCriacao,
        "scheduledDate": tedExternalScheduleResult.dataAgendamento
      }
    } else {
      return { "success": false }
    }
  }

  this.processGetAllScheduledTransactions = function (result, localeObj) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let scheduledtransactionData = [];
      for (const item of result.items) {
        let typeOfTransaction = "";
        if (item.tipoAgendamentoEnumId === 1 || item.tipoAgendamentoEnumId === 2) {
          typeOfTransaction = localeObj.ted_schedule_transfer;
        } else if (item.tipoAgendamentoEnumId === 3) {
          typeOfTransaction = localeObj.boleto_schedule_transfer;
        } else {
          typeOfTransaction = localeObj.pix_schedule_transfer;
        }
        const dateOfTransaction = item.dataAgendamento
        scheduledtransactionData.push({
          date: dateOfTransaction,
          description: typeOfTransaction,
          typeofSchedule: item.tipoAgendamentoEnum,
          transaction: "D",
          amount: item.valor,
          formatted_amount: item.valor.toString().split(".")[0],
          decimal: item.valor.toString().split(".")[1] ? '' + item.valor.toString().split(".")[1] : "00",
          returnEligibility: false,
          nameOfParty: item.destinatario,
          txnId: item.idAgendamento,
          cpfUser: GeneralUtilities.formatCPF(ImportantDetails.cpf),
          cpfOfParty: GeneralUtilities.formatCPF(item.identificacaoFiscal),
          isTarrif: false,
          isScheduled: true
        });
      }
      /* message = 1 -> No Scheduled transactions yet
         message = 2 -> Error */
      if (result.items.length === 0) {
        return ({ "success": false, "message": 1 })
      }
      else {
        return ({ "success": true, "txn_scheduled": scheduledtransactionData });
      }
    } else {
      return ({ "success": false, "message": 2 })
    }
  }

  this.processGetTedInternalScheduledTransactionDetails = function (result, localeObj) {
    if (!(JSON.stringify(result) === '{}')) {
      const dateOfTransaction = result.dataAgendamento;
      const cpfOfParty = result.identificacaoFiscalDestino;
      let recurrent = result.numeroRecorrencias.toString();
      let finalrecurrent = recurrent[0]
      let scheduledtransactionData = {
        typeOfTed: "INTERNAL",
        date: dateOfTransaction,
        description: localeObj.ted_schedule_transfer,
        transaction: "D",
        nameOfParty: result.nomeDestino,
        amount: result.valor,
        cpfForSend: cpfOfParty,
        formatted_amount: result.valor.toString().split(".")[0],
        decimal: result.valor.toString().split(".")[1] ? '' + result.valor.toString().split(".")[1] : "00",
        returnEligibility: false,
        finalEditDate: result.dataUltimaAlteracao,
        cpfOfParty: GeneralUtilities.formatCPF(cpfOfParty),
        institutionOfParty: localeObj.bank_name,
        txnId: result.idAgendamento,
        cpfUser: GeneralUtilities.maskCpf(ImportantDetails.cpf),
        agency: result.agenciaDestino,
        accountNumber: result.contaDestino,
        isTarrif: false,
        recurrence: finalrecurrent,
        isScheduled: true
      }
      return ({ "success": true, "scheduleData": scheduledtransactionData });
    } else {
      return ({ "success": false })
    }
  }

  this.processGetTedExternalScheduledTransactionDetails = function (result, localeObj) {
    if (!(JSON.stringify(result) === '{}')) {
      const dateOfTransaction = result.dataAgendamento;
      const cpfOfParty = result.identificacaoFiscal;
      let recurrent = result.numeroRecorrencias.toString();
      let finalrecurrent = recurrent[0];
      let scheduledtransactionData = {
        typeOfTed: "EXTERNAL",
        date: dateOfTransaction,
        description: localeObj.ted_schedule_transfer,
        transaction: "D",
        amount: result.valor,
        formatted_amount: result.valor.toString().split(".")[0],
        decimal: result.valor.toString().split(".")[1] ? '' + result.valor.toString().split(".")[1] : "00",
        returnEligibility: false,
        nameOfParty: result.nome,
        finalEditDate: result.dataUltimaAlteracao,
        cpfOfParty: GeneralUtilities.formatCPF(cpfOfParty),
        cpfForSend: cpfOfParty,
        accountType: result.tipoConta,
        institutionOfParty: result.bancoNome,
        txnId: result.idAgendamento,
        cpfUser: GeneralUtilities.maskCpf(ImportantDetails.cpf),
        agency: result.agencia,
        accountNumber: result.numero,
        bankNumber: result.banco,
        isTarrif: false,
        recurrence: finalrecurrent,
        isScheduled: true
      }
      return ({ "success": true, "scheduleData": scheduledtransactionData });
    } else {
      return ({ "success": false })
    }
  }

  this.processGetBoletoScheduledTransactionDetails = function (result, localeObj) {
    if (!(JSON.stringify(result) === '{}')) {
      const dateOfTransaction = result.dataAgendamento;
      const cpfOfParty = result.identificacaoDestinatario;
      let scheduledtransactionData = {
        date: dateOfTransaction,
        description: localeObj.boleto_schedule_transfer,
        transaction: "D",
        amount: result.valor,
        formatted_amount: result.valor.toString().split(".")[0],
        decimal: result.valor.toString().split(".")[1] ? '' + result.valor.toString().split(".")[1] : "00",
        returnEligibility: false,
        nameOfParty: result.destinatario,
        cpfOfParty: GeneralUtilities.formatCPF(cpfOfParty),
        institutionOfParty: localeObj.bank_name,
        txnId: result.idAgendamento,
        cpfUser: GeneralUtilities.formatCPF(ImportantDetails.cpf),
        listDigitavel: result.linhaDigitavel,
        code: result.codigoDeBarras,
        isTarrif: false,
        recurrence: "1",
        isScheduled: true
      }
      return ({ "success": true, "scheduleData": scheduledtransactionData });
    } else {
      return ({ "success": false })
    }
  }

  this.processGetPixScheduledTransactionDetails = function (result, localeObj) {
    if (!(JSON.stringify(result) === '{}')) {
      const dateOfTransaction = result.dataAgendamento;
      const cpfOfParty = result.identificacaoFiscalBeneficiario;
      let recurrent = result.numeroDeOcorrencias.toString();
      let finalrecurrent = recurrent[0];
      let scheduledtransactionData = {
        date: dateOfTransaction,
        description: localeObj.pix_schedule_transfer,
        transaction: "D",
        amount: result.valor,
        formatted_amount: result.valor.toString().split(".")[0],
        decimal: result.valor.toString().split(".")[1] ? '' + result.valor.toString().split(".")[1] : "00",
        returnEligibility: false,
        nameOfParty: result.nomeBeneficiario,
        cpfOfParty: GeneralUtilities.formatCPF(cpfOfParty),
        institutionOfParty: GeneralUtilities.emptyValueCheck(result.nomeInstituicaoBeneficiario) ? localeObj.bank_name : result.nomeInstituicaoBeneficiario,
        txnId: result.idAgendamento,
        agency: result.agenciaBeneficiario,
        accountNumber: result.contaBeneficiario,
        cpfUser: GeneralUtilities.maskCpf(ImportantDetails.cpf),
        key: result.chaveEnderecamentoBeneficiario,
        isTarrif: false,
        recurrence: finalrecurrent,
        isScheduled: true
      }
      return ({ "success": true, "scheduleData": scheduledtransactionData });
    } else {
      return ({ "success": false })
    }
  }

  this.processScheduleBoletoPaymentResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "transactionId": result.idAgendamento,
        "date": result.dataPagamento
      }
    } else {
      return {
        "success": false
      }
    }
  }

  this.processCancelBoletoScheduledTransactions = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL && result.statusId === 3) {
      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false }
    }
  }

  this.processEditScheduledBoletoResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "transactionId": result.idAgendamento,
        "date": result.dataPagamento
      }
    } else {
      return {
        "success": false
      }
    }
  }

  this.processPixLimitResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let dailyLimit = 0;
      for (const item of result.limitesClientes) {
        if (item.operacaoId === 4028 && item.periodoTarifaDescricao === "Diario") {
          dailyLimit = item.maxAtual;
        }
      }
      return {
        "success": true, "dailyLimit": dailyLimit
      }
    } else {
      return { "success": false }
    }
  }

  this.processTedScheduleExternalResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let tedExternalScheduleResult = result.items[0];
      return {
        "success": true,
        "transactionId": tedExternalScheduleResult.idAgendamento,
        "date": tedExternalScheduleResult.dataCriacao,
        "scheduledDate": tedExternalScheduleResult.dataAgendamento
      }
    } else {
      return { "success": false }
    }
  }

  this.processChangeLimitResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      if (result.statusAlteracaoClienteDescricao === "Aprovado") {
        return { "success": true, "message": result.mensagem }
      }
      return { "success": true }
    } else {
      return { "success": false }
    }
  }

  this.processTedInternalScheduleCancel = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false }
    }
  }

  this.processTedExternalScheduleCancel = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false }
    }
  }

  this.processPendingChnangePixLimitResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let jsonObj = {};
      let pendingRequest = false;
      for (const item of result.items) {
        if (item.tipoOperacaoLimiteClienteId === 4028) {
          pendingRequest = true;
          jsonObj["dailyLimit"] = item.valorAtual;
          jsonObj["pendingLimit"] = item.valorSolicitado;
          jsonObj["requestDate"] = moment(item.dataSolicitacao).format('DD/MM/YYYY');
          jsonObj["requestDateTime"] = moment(item.dataSolicitacao).format('YYYY-MM-DD HH:mm:ss');
          jsonObj["requestedValue"] = item.valorSolicitado;
          jsonObj["pixRequestIdentifier"] = item.limiteSolicitacaoClienteId;
        }
      }
      return {
        "success": true, "isRequestPending": pendingRequest, "pendingObj": jsonObj
      }
    } else {
      return { "success": false }
    }
  }

  this.processTedInternalScheduleEdit = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false }
    }
  }

  this.processTedExternalScheduleEdit = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let jsonObject = {
        "success": true,
        "transactionDetails": {
          "amount": result.novoValor.toString().split(".")[0],
          "decimal": result.novoValor.toString().split(".")[1] ? '' + result.novoValor.toString().split(".")[1] : "00",
          "transactionId": result.idAgendamento.toString(),
          "date": result.dataAlterada,
          "scheduledDate": result.dataAlterada,
          "type": "D"
        }
      };
      return jsonObject;
    } else {
      return { "success": false }
    }
  }

  this.processIsDatePublicHolidayResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "workingDay": result.proximoDiaUtil }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processFetchingAllContacts = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let contacts = [];
      result.items.forEach(element => {
        contacts.push(element);
      });
      return { "success": true, "contacts": contacts }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processIsVacancyAvailable = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      ImportantDetails.vacancyAvaialable = result.possuiVagas;
      return { "success": true, "available": result.possuiVagas };
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processRegisteringContact = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processGetContactDetailsResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let contactDetails = [];
      result.items.forEach(element => {
        contactDetails.push(element);
      });
      return { "success": true, "contactDetails": contactDetails }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processDeleteContact = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }
  this.processCheckWaitListStatus = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let jsonObject = {
        "success": true,
        "onboardingStatus": result.statusFilaOnboard,
        "waitlistId": result.posicaoFilaOnboard,
        "noOfDays": result.numeroDiasRestantesFila
      };
      androidApiCalls.setDAStringPrefs(GeneralUtilities.WAITLIST_KEY, result.chaveDeFilaOnboarding);
      ImportantDetails.waitListId = result.chaveDeFilaOnboarding;
      return jsonObject;
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processRegisterToWaitList = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      ImportantDetails.waitListId = result.chaveDeFilaOnboarding;
      androidApiCalls.setDAStringPrefs(GeneralUtilities.WAITLIST_KEY, result.chaveDeFilaOnboarding);
      return { "success": true, "onboardingStatus": result.statusFilaOnboard, "waitlistId": result.posicaoFilaOnboard, "noOfDays": result.numeroDiasRestantesFila };
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processRequestPortability = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "protocol": result.protocoloPortabilidade };
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processUpdateProfileDetails = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "result": result };
    } else {
      return { "success": false, "result": result };
    }
  }

  this.procesGetAuthorizedFgtsValue = function (result) {
    if (JSON.stringify(result) !== "{}") {
      let installments = [];
      result.recebiveis.forEach(element => {
        let date = new Date(element.dataVencimento);
        let amount = GeneralUtilities.formatBalance(element.valor.toString().split(".")[0]);
        let decimal = element.valor.toString().split(".")[1] ? '' + element.valor.toString().split(".")[1] : "00";
        installments.push({
          "year": date.getFullYear(),
          "value": amount + "," + NewUtilities.formatDecimal(decimal)
        });
      });

      let finalJsonObject = {
        valueReleased: {
          "amount": result.liberado.toString().split(".")[0],
          "decimal": NewUtilities.formatDecimal(result.liberado.toString().split(".")[1] ? '' + result.liberado.toString().split(".")[1] : "00")
        },
        totalReceiveable: GeneralUtilities.formatBalance(result.totalRecebiveis.toString().split(".")[0]) + "," + (result.totalRecebiveis.toString().split(".")[1] ? '' + result.totalRecebiveis.toString().split(".")[1] : "00"),
        numberOfYears: result.prazo,
        tableValues: installments,
        interestRate: result.taxaContratoMensal.toString() + "%",
        maxValue: {
          "amount": GeneralUtilities.formatBalance(result.valorMaximoLiberado.toString().split(".")[0]),
          "decimal": NewUtilities.formatDecimal(result.valorMaximoLiberado.toString().split(".")[1] ? '' + result.valorMaximoLiberado.toString().split(".")[1] : "00"),
        }
      }
      return { "success": true, installmentObject: finalJsonObject };
    } else {
      return { "success": false }
    }
  }

  this.processGetFgtsTermsForContract = function (data) {
    if (data.termo !== "") {
      return { "success": true, "fgtsTerms": data.termo };
    } else {
      return { "success": false }
    }
  }

  this.processListAllPortabilities = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let portabilities = [];
      if (result.totalItems > 0) {
        result.items.forEach(element => {
          if (element.chaveDePortabilidade) {
            let individualRequest = {
              "portKey": element.chaveDePortabilidade,
              "name": element.razaoSocialEmpresaOrigem,
              "cnpj": element.identificacaoFiscalEmpresaOrigem,
              "institution": element.nomeBancoOrigem,
              "code": element.codigoBancoOrigem,
              "date": element.dataAtualizacao ? moment(element.dataAtualizacao).format('MM/DD/YYYY') : "",
              "status": GeneralUtilities.findStatus(element.situacaoPortabilidade, element.situacaoPortabilidadeCip),
              "requestStatus": element.statusPortabilidade,
              "cancelledBy": element.motivoCancelamentoDescricao,
              "cancelledDue": element.complementoMotivoCancelamento,
              "cancelledDate": element.situacaoPortabilidade === "Cancelada" ?
                moment(element.dataCancelamento).format('MM/DD/YYYY') : "",
            }
            portabilities.push(individualRequest);
          }
        });
      }
      return { "success": true, "portabilities": portabilities, "requests": result.totalItems };
    } else {
      return { "success": false, "message": result.mensagem, }
    }
  }

  this.processGetTokenAndContractID = function (data) {
    if (data.codigoProposta !== "") {
      return { "success": true, "contractId": data.codigoProposta };
    } else {
      return { "success": false }
    }
  }

  this.processSignFGTSContract = function (data) {
    if (data.id !== "") {
      return { "success": true, "finalContractId": data.id };
    } else {
      return { "success": false }
    }
  }

  this.processFetchSignedFgtsContract = function (result) {
    if (JSON.stringify(result) !== "{}") {
      return {
        "success": true,
        "text": result.termo
      }
    } else {
      return { "success": false }
    }
  }

  this.processGetFgtsTermsForContract = function (data) {
    if (data.termo !== "") {
      return { "success": true, "fgtsTerms": data.termo };
    } else {
      return { "success": false }
    }
  }

  this.processGetFgtsFaceAuthId = function (result) {
    if (result && result.isMatch == true) {
      return { "success": true, "faceAuthId": result.faceAuthId };
    } else {
      return { "success": false, "faceAuthId": 0 }
    }
  }

  this.procesGetFgtsContractsList = function (result) {
    if (JSON.stringify(result) !== "{}") {
      let contractsList = [];
      result.items.forEach(element => {
        if (element.statusContratoAntecipacao !== "CANCELADO") {
          let startDate = moment(element.data).format('DD/MM/YYYY');
          let endDate = moment(element.dataConclusao).format('DD/MM/YYYY');
          contractsList.push({
            "ativo": element.ativo,
            "valorFinanciado": element.valorFinanciado,
            "startContractDate": startDate,
            "endContractDate": endDate,
            "contrato": element.contrato
          });
        }
      });
      let finalJsonObject = {
        totalItems: result.totalItems,
        qtdPaginas: result.qtdPaginas,
        qtdPorPagina: result.qtdPorPagina,
        pagina: result.pagina,
        idStatusExecucao: result.idStatusExecucao,
        contractValues: contractsList
      }
      return { "success": true, "fgtsContractsList": finalJsonObject };
    } else {
      return { "success": false, "fgtsContractsList": { "contractValues": [] } }
    }
  }

  this.processDetailsOfDimoQrCode = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return {
        "success": true,
        "info": {
          "name": result.nomeComerciante,
          "paymentId": result.pagamentoId,
          "amount": result.valor.toString().split(".")[0],
          "decimal": result.valor.toString().split(".")[1] ? '' + result.valor.toString().split(".")[1] : "00"
        }
      }
    } else {
      return { "success": false }
    }
  }

  this.processDetailsOfDimoQRTransaction = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "date": result.data };
    } else {
      return { "success": false }
    }
  }

  this.processMigrateCardResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processMigratePermissionResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      if (result.precisaMigracao) {
        return { "success": result.precisaMigracao, "productId": result.produtoParaMigracao.chaveDeProduto }
      } else {
        return { "success": false }
      }
    }
  }

  this.processValidatePinResponse = function (result) {
    if (result.sucesso) {
      return { "success": true, "message": result.mensagem }
    } else {
      return { "success": false, "message": result.mensagem }
    }
  }

  this.processRequestCategory = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      if (result.cartoesDoProduto.length !== 0) {
        let virtualCardCategory = result.cartoesDoProduto.filter(item => item.fisico === false);
        let physicalCardCategory = result.cartoesDoProduto.filter(item => item.fisico === true);
        if (virtualCardCategory.length > 0 && physicalCardCategory.length > 0) {
          return {
            "success": true,
            "virtualCardCategory": virtualCardCategory[0].categoria,
            "physicalCardCategory": physicalCardCategory[0].categoria,
          }
        } else {
          return { "success": false, "error": "NO_CATEGORY" }
        }
      } else {
        return {
          "success": false,
          "error": "NO_CATEGORY"
        }
      }
    } else {
      return { "success": false, "error": "Category currently unavailable" }
    }
  }

  this.processGetProductKey = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      if (result.produtos.length !== 0) {
        return { "success": true, "productkey": result.produtos[0].chaveDeProduto }
      } else {
        //Log.sDebug("No products in product Array");
        return { "success": false }
      }
    }
  }

  this.processListContracts = function (result) {
    let contractsList = [];
    if (result.contratos && result.contratos.length !== 0) {
      result.contratos.forEach(element => {
        if (element.idContrato && element.statusContrato !== "CANCELADO" && element.statusContrato !== "EXCLUIDO") {
          let individualRequest = {
            "idContrato": element.idContrato,
            "valorRecebivel": element.valorRecebivel,
            "statusContrato": element.statusContrato,
            "dataFinanciamento": moment(element.dataFinanciamento).format('DD/MM/YYYY'),
            "emAtraso": element.emAtraso
          }
          contractsList.push(individualRequest);
        }
      });
    }
    return { "success": true, "contractsList": contractsList };
  }

  this.processContractDetails = function (result) {
    if (result.idContrato) {
      let contractDetails = {
        "financedIn": moment(result["dataFinanciamento"]).format('DD/MM/YYYY'),
        "totalAmount": result["valorTotalFinanciado"],
        "remainingAmount": result["valorEmAberto"],
        "paidAmount": result["valorPago"],
        "installmentAmount": result["valorRecebivel"],
        "totalInstallments": result["numeroDeParcelas"],
        "paidInstallments": result["numeroDeParcelasPagas"],
        "firstDueDate": moment(result["primeiroVencimento"]).format('DD/MM/YYYY'),
        "lastDueDate": moment(result["ultimoVencimento"]).format('DD/MM/YYYY'),
        "nextDueDate": moment(result["dataProximoVencimento"]).format('DD/MM/YYYY'),
        "contract": result["idContrato"],
        "overDue": result["emAtraso"],
        "device": result["modelo"]
      }
      return { "success": true, "contractDetails": contractDetails };
    } else {
      return { "success": false }
    }
  }

  this.processInstallmentDetails = function (result) {
    let paidDetails = [];
    let outstandingDetails = [];
    if (result.recebiveis && result.recebiveis.length !== 0) {
      result.recebiveis.forEach(element => {
        if (element.statusPagamento === "Pago") {
          let individualRequest = {
            "value": element.valor,
            "installment": element.numParcela,
            "actualValue": element.valorAtual,
            "installmentDate": moment(element.vencimento).format('DD/MM/YYYY'),
          }
          paidDetails.push(individualRequest);
        } else {
          let individualRequest = {
            "status": element.statusPagamento,
            "value": element.valor,
            "installment": element.numParcela,
            "actualValue": element.valorAtual,
            "installmentDate": moment(element.vencimento).format('DD/MM/YYYY'),
          }
          outstandingDetails.push(individualRequest);
        }
      });
    }
    return { "success": true, "paidDetails": paidDetails, "outstandingDetails": outstandingDetails };
  }

  this.processBoletoLimitResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let boletoLimit = 500; //Default limit
      for (const item of result.limitesClientes) {
        if (item.operacaoId === 3001 && item.operacao === "RECARGA_VIA_BOLETO") {
          boletoLimit = item.maxAtual;
        }
      }
      return {
        "success": true, "boletoLimit": boletoLimit
      }
    }
  }

  this.processGuaranteedCreditStatusResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200 || result.httpStatus === 201) {
      let creditStatus = {
        "cardStatus": result.statusCadastro
      };
      return { "success": true, "creditStatus": creditStatus }
    } else {
      return { "success": false }
    }
  }

  this.processGuaranteedCreditInvestmentInfoResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let creditInvestmentInfo = {
        "index": result.indice,
        "indexPercentage": result.percentualDoIndice,
        "minInvestment": result.investimentoMinimo,
        "maxInvestment": result.investimentoMaximo,
        "liquidity": result.liquidez,
        "dueDate": result.dataFim
      };
      return { "success": true, "creditInvestmentInfo": creditInvestmentInfo }
    } else {
      return { "success": false }
    }
  }

  this.processCreditInvestmentHomePageDetails = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      let creditInvestmentInfo = {
        valueInvested: result.valorInvestido,
        income: result.rendimentoTotal,
        amountAvailableToRedeem: result.saldoDisponivelResgate,
        creditLimit: result.limiteCreditoAtual,
        fromDate: result.dataInicioInvestimento,
        toDate: result.dataFimInvestimento,
        taxes: result.tributos,
        grossPosition: result.posicaoBruta,
        cleanCreditValue: result.valorCreditoClean
      };
      return { "success": true, "creditInvestmentInfo": creditInvestmentInfo }
    } else {
      return { "success": false }
    }
  }

  this.processSimulateRedeemDetails = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      let creditRedeemInfo = {
        valueInvested: result.saldoTotalInvestido,
        income: result.rendimentos,
        creditLimit: result.limiteCredito,
        valueInvestedPostRedeem: result.saldoInvestidoPosResgate,
        creditLimitPostRedeem: result.limiteCreditoPosResgate,
        redeemAmount: result.saldoResgate

      };
      return { "success": true, "creditRedeemInfo": creditRedeemInfo }
    } else {
      return { "success": false }
    }
  }

  this.processSimulateInvestMore = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      return { "success": true }
    } else {
      return { "success": false }
    }
  }

  this.processValidateCreditScoreResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "cardStatus": result.statusCadastro, "limit": result.valorLiberado }
    } else {
      return { "success": false }
    }
  }

  this.processCleanConfigureCreditResponse = function (result) {
    if (GeneralUtilities.emptyValueCheck(result));
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let creditStatus = {
        "cardStatus": result.statusCadastro,
        "autoDebit": result.debitoAutomatico,
        "setLimit": result.valorCreditoEscolhido,
        "dueDate": '' + result.dataVencimentoFatura
      };
      return { "success": true, "creditStatus": creditStatus }
    } else {
      return { "success": false }
    }
  }

  this.processGetDeliveryAddressResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let addressObj = {
        'street': result.endereco.rua,
        'neighbourhood': result.endereco.bairro,
        'complement': result.endereco.complemento,
        'city': result.endereco.cidade,
        'uf': result.endereco.uf,
        'cep': result.endereco.cep
      }
      return { "success": true, "address": addressObj }
    }
  }

  this.processCreditContractResponse = function (result) {
    if (result.contractDocumentText !== "") {
      let toc = result.contractDocumentText;
      return { "success": true, "toc": toc, "contractId": result.contractId };
    } else {
      return { "success": false }
    }
  }

  this.processCreditCardInvestmentOnboardingResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "valueInvested": result.valor, "dueDate": result.diaVencimentoFatura };
    } else {
      return { "success": false }
    }
  }


  this.processSignCreditContractResponse = function (result) {
    if (result.idStatusExecucao === this.temp_credit_success || result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      return { "success": true, "requestFacialMatch": result.requerValidacaoFacial }
    } else {
      return { "success": false }
    }
  }

  this.processCreditCardDetailsData = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      let invoiceStatus = result.statusFatura;
      let usedLimit = result.limiteUtilizado;
      let availableLimit = result.limiteDisponivel;
      let dueDate = result.dataVencimento;
      let totallimit = result.limiteTotal;
      let automaticDebit = result.debitoAutomatico;
      let value = result.valor;
      let bestDaytoPurchase = result.melhorDiaCompra;
      invoiceStatus = "closed";
      //Log.sDebug("statusfatura: " + result.statusfatura);
      if (result.statusFatura === "ABERTA") {
        invoiceStatus = "open"; // Open invoice
      } else if (result.statusFatura === "FECHADA") {
        invoiceStatus = "closed"; // Closed invoice
      }
      if (result.statusPagamento === "ABAIXO_DO_MINIMO") {
        invoiceStatus = "partial"; // If the sum of the value of payments done by the client is lower than the minimum payment
      } else if (result.statusPagamento === "MINIMO") {
        invoiceStatus = "partial" // If the sum of the value of payments done by the client is equal ou higher than the invoice minimum value
      } else if (result.statusPagamento === "INTEGRAL") {
        invoiceStatus = "paid"; // If the sum of the value of payments done by the client is equal ou higher than the invoice total value
      } else if (result.statusPagamento === "PARCELADO") {
        invoiceStatus = "installment"; // If the client accepted the payment in installments for this invoice
      }
      return {
        "success": true,
        "usedLimit": usedLimit,
        "availableLimit": availableLimit,
        "dueDate": dueDate,
        "totalLimit": totallimit,
        "result": result,
        "valor": value,
        "status": invoiceStatus,
        "autoDebit": automaticDebit,
        "invoiceId": result.faturaId,
        "redeemStatus": result.statusResgate,
        "bestDay": bestDaytoPurchase
      }
    } else {
      return { "success": true }
    }
  }

  this.processCreditCardSettingsDetailsData = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let dueDateValue = result.dataVencimentoFatura;
      let autoDebit = result.debitoAutomatico;
      let contactlessPayment = result.permiteContactless;
      return {
        "success": true,
        "dueDate": dueDateValue,
        "autoDebit": autoDebit,
        "contactlessPayment": contactlessPayment,
        "response": result
      }
    } else {
      return { "success": false }
    }
  }

  this.processInvoiceDetails = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      let transactionData = [];
      for (const item of result.items) {
        let transactionType = "D";
        if (item.idTipoTransacao === 2) {
          transactionType = "C";
        } else if (item.idTipoTransacao === 3) {
          transactionType = "E";
        }
        const dateOfTransaction = item.dataHoraTransacao;
        const formattedDate = moment.utc(item.dataHoraTransacao).format('DD/MM/YYYY');
        const formattedDateTime = moment.utc(item.dataHoraTransacao).format('DD/MM/YYYY - HH:mm');
        const hour = moment.utc(item.dataHoraTransacao).format('HH');
        const mins = moment.utc(item.dataHoraTransacao).format('mm');
        let formatted_amount = GeneralUtilities.formatAmountDecimal(item.valorBRL);
        if (transactionType !== "E") {
          transactionData.push(
            {
              date: dateOfTransaction,
              formatDate: formattedDate,
              formattedDateTime: formattedDateTime,
              description: GeneralUtilities.isNotEmpty(item.nomeEstabelecimento) ? item.nomeEstabelecimento : item.descricaoAbreviada,
              transaction: transactionType,
              amount: item.valorBRL,
              formatted_amount: formatted_amount,
              transactionId: item.transacaoId,
              hour: hour,
              mins: mins,
              processed: item.processada,
              noOfInstallments: item.parcelamento,
              currentInstallmentNo: item.parcelaNumero,
              isInstallment: item.descricaoAbreviada === "Parcela Lojista Visa" || item.descricaoAbreviada === "Parcela Cliente Visa" ? true : false,
              transactionDescription: item.descricaoAbreviada,
              contested: item.contestacaoId,
              date1: new Date(dateOfTransaction).getTime()
            });
        }
      }
      let tr = transactionData;
      let trDesc;
      if (tr !== null && tr !== undefined) {
        trDesc = tr.sort((a, b) => b.date1 - a.date1);
      }
      let invoiceStatus = "closed";
      //Log.sDebug("statusfatura: " + result.statusfatura);
      if (result.statusFatura === "ABERTA") {
        invoiceStatus = "open"; // Open invoice
      } else if (result.statusFatura === "FECHADA") {
        invoiceStatus = "closed"; // Closed invoice
      }
      if (result.statusPagamento === "ABAIXO_DO_MINIMO") {
        invoiceStatus = "partial"; // If the sum of the value of payments done by the client is lower than the minimum payment
      } else if (result.statusPagamento === "MINIMO") {
        invoiceStatus = "partial" // If the sum of the value of payments done by the client is equal ou higher than the invoice minimum value
      } else if (result.statusPagamento === "INTEGRAL") {
        invoiceStatus = "paid"; // If the sum of the value of payments done by the client is equal ou higher than the invoice total value
      } else if (result.statusPagamento === "PARCELADO") {
        invoiceStatus = "installment"; // If the client accepted the payment in installments for this invoice
      }
      return {
        "success": true,
        "closeDate": result.dataFechamento,
        "expiryDate": result.dataVencimento,
        "payableDate": result.dataPagamento,
        "nationalCharges": result.totalNacional,
        "internationalCharges": result.totalInternacional,
        "taxes": result.taxasTotais,
        "pendingBalance": result.saldoPendente,
        "status": invoiceStatus,
        "realStatus": result.statusFatura,
        "alreadyPaid": result.creditoAnterior,
        "minPayment": result.pagamentoMinimo,
        "invoiceValue": result.valorFatura,
        "history": result.items,
        "transactionData": trDesc
      }
    } else {
      return { "success": false }
    }
  }

  this.processSimulatePaymentInstallments = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      return {
        "success": true,
        "siumulationId": result.simulacaoId,
        "expiryDate": result.dataVencimento,
        "intrestRate": result.juros,
        "invoiceOriginalValue": result.valorOriginal,
        "downPaymentValue": result.valorParcelaInicial,
        "numberOfInstallments": result.numeroDeParcelas,
        "installmentValue": result.valorParcelas,
        "toBePaid": result.valorTotalFatura,
        "intrestTotal": result.jurosTotais,
        "invoiceList": result.parcelas,
        "invoiceListLength": result.parcelas.length,
        "result": result
      }
    } else {
      return { "success": false }
    }
  }

  this.processCreditCardSettingsCardData = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      let creditLimitValue = result.valorCreditoEscolhido;
      let dueDateValue = result.dataVencimentoFatura;
      let description = result.descricaoStatusExecucao;
      let status = result.statusCadastro;
      let autoDebit = result.debitoAutomatico;
      let contactlessPayment = result.contactless;
      return {
        "success": true,
        "limitValue": creditLimitValue,
        "dueDate": dueDateValue,
        "description": description,
        "status": status,
        "autoDebit": autoDebit,
        "contactlessPayment": contactlessPayment,
        "response": result
      }
    } else {
      return { "success": false }
    }
  }

  this.processCreditCardInvoiceDueDateChanges = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      let dueDateValue = result.dueDate;
      return {
        "success": true,
        "dueDate": dueDateValue,
        "response": result
      }
    } else {
      return { "success": false, result: result }
    }
  }

  this.processSimulationPayment = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      return {
        "success": true,
        "expiryDate": result.dataVencimento,
        "leftToBePaid": result.restante,
        "initialAmount": result.valorInicialProximaFatura,
        "taxes": result.taxasTotais,
        "totalInvoice": result.pagarTotal,
        "simulationId": result.simulacaoId
      }
    } else {
      return { "success": false }
    }
  }

  this.processSimulationPaymentInstallment = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      return {
        "success": true,
        "simulationId": result.simulacaoId,
        "expiryDate": result.dataVencimento,
        "intrestRate": result.juros,
        "initialAmount": result.valorOriginal,
        "downPaymentValue": result.valorParcelaInicial,
        "numberOfInstallmentsSelected": result.numeroDeParcelas,
        "installmentValue": result.valorParcela,
        "totalInvoice": result.valorTotalFatura,
        "taxes": result.jurosTotais,
        "items": result.parcelas
      }
    } else {
      return { "success": false }
    }
  }

  this.processUpdateCreditCardLimitValueApi = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      let changeLimitValue = result.valorCreditoEscolhido;
      let status = result.statusCadastro;
      return {
        "success": true,
        "limitValue": changeLimitValue,
        "status": status,
        "response": result
      }
    } else {
      return { "success": false }
    }
  }

  this.processPaymentInfo = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      return {
        "success": true,
        "expiryDate": result.dataVencimento,
        "pixCode": result.codigoCopiaCola,
        "doc": result.arquivo,
        "number": result.linhaDigitavel,
        "installment": result.parcelamentoId
      }
    } else {
      return { "success": false }
    }
  }

  this.processBoletoPaymentInfo = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      return {
        "success": true,
        "expiryDate": result.dataVencimento,
        "doc": result.arquivo,
        "number": result.linhaDigitavel
      }
    } else {
      return { "success": false }
    }
  }

  this.processPixPaymentInfo = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      return {
        "success": true,
        "expiryDate": result.data,
        "pixCode": result.codigoCopiaCola,
        "doc": result.arquivo,
        "data": result.arquivo.base64,
        "format": result.arquivo.extensao
      }
    } else {
      return { "success": false }
    }
  }

  this.processDirectDebitPaymentInfo = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200 || result.httpStatus === 201) {
      return {
        "success": true,
        "expiryDate": result.data
      }
    } else {
      return { "success": false }
    }
  }

  this.processCreditCardIncreaseCreditLimit = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      return {
        "success": true,
        "result": result
      }
    } else {
      return { "success": false, "result": result }
    }
  }

  this.processUpdateCreditCardContactlessPayments = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      let contactlessPayments = result.permiteContactless
      return {
        "success": true,
        "contactlessPayments": contactlessPayments,
        "result": result
      }
    } else {
      return { "success": false, "result": result }
    }
  }

  this.processUpdateCreditCardAutomaticDebit = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      let autoDebit = result.isDebitAutomatic
      return {
        "success": true,
        "autoDebit": autoDebit,
        "result": result
      }
    } else {
      return { "success": false, "result": result }
    }
  }

  this.processBlockingOfCreditCard = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      let autoDebit = result.debitoAutomatico
      return {
        "success": true,
        "autoDebit": autoDebit,
        "result": result
      }
    } else {
      return { "success": false, "result": result }
    }
  }

  this.processCreditCardTransactionHistoryData = function (result) {
    //Log.sDebug("processCreditCardTransactionHistoryData" + JSON.stringify(result));
    let transactionData = [];
    let paginationDetails = {
      "maxPageNumber": result.qtdPaginas,
      "totalTransactions": result.totalItems,
      "transactionsPerPage": result.qtdPorPagina
    }

    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      let tr = result.transacoes;
      let trDesc;
      if (tr !== null && tr !== undefined) {
        trDesc = tr.sort((a, b) => new Date(b.dataHoraTransacao) - new Date(a.dataHoraTransacao));
      }
      for (const item of trDesc) {
        let transactionType = "D";
        if (item.idTipoTransacao === 2) {
          transactionType = "C";
        } else if (item.idTipoTransacao === 3) {
          transactionType = "E";
        }
        const dateOfTransaction = item.dataHoraTransacao;
        const formattedDate = moment.utc(item.dataHoraTransacao).format('DD/MM/YYYY');
        const formattedDateTime = moment.utc(item.dataHoraTransacao).format('DD/MM/YYYY - HH:mm');
        const hour = moment.utc(item.dataHoraTransacao).format('HH');
        const mins = moment.utc(item.dataHoraTransacao).format('mm');
        if (transactionType !== "E") {
          transactionData.push(
            {
              date: dateOfTransaction,
              formatDate: formattedDate,
              formattedDateTime: formattedDateTime,
              description: GeneralUtilities.isNotEmpty(item.nomeEstabelecimento) ? item.nomeEstabelecimento : item.descricaoAbreviada,
              transaction: transactionType,
              amount: item.valorBRL,
              formatted_amount: GeneralUtilities.formatAmountDecimal(item.valorBRL),
              transactionId: item.transacaoId,
              hour: hour,
              mins: mins,
              processed: item.processada,
              noOfInstallments: item.parcelamento,
              currentInstallmentNo: item.parcelaNumero,
              isInstallment: item.descricaoAbreviada === "Parcela Lojista Visa" || item.descricaoAbreviada === "Parcela Cliente Visa" ? true : false,
              transactionDescription: item.descricaoAbreviada,
              contested: item.contestacaoId
            });
        }
      }
      return {
        "success": true,
        "transactionData": transactionData,
        "paginationData": paginationDetails
      }
    } else {
      return { "success": false }
    }
  }

  this.processCreditCardInvoiceHistoryData = function (result) {
    let invoiceHistoryData = [];
    let formatted = "";
    let decimal = "";
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      for (const item of result.items) {
        if (item.valor !== null || !(item.valor === "")) {
          formatted = item.valor.toString().split(".")[0];
          if (item.valor.toString().length > 1) {
            decimal = item.valor.toString().split(".")[1] ? '' + item.valor.toString().split(".")[1] : "00";
          } else {
            decimal = "00"
          }
        } else {
          formatted = "0";
          decimal = "00";
        }
        let invoiceStatus = "closed";
        //Log.sDebug("statusfatura: " + item.statusfatura);
        if (item.statusFatura === "ABERTA") {
          invoiceStatus = "open"; // Open invoice
        } else if (item.statusFatura === "FECHADA") {
          invoiceStatus = "closed"; // Closed invoice
        }
        if (item.statusPagamento === "ABAIXO_DO_MINIMO") {
          invoiceStatus = "partial"; // If the sum of the value of payments done by the client is lower than the minimum payment
        } else if (item.statusPagamento === "MINIMO") {
          invoiceStatus = "partial" // If the sum of the value of payments done by the client is equal ou higher than the invoice minimum value
        } else if (item.statusPagamento === "INTEGRAL") {
          invoiceStatus = "paid"; // If the sum of the value of payments done by the client is equal ou higher than the invoice total value
        } else if (item.statusPagamento === "PARCELADO") {
          invoiceStatus = "installment"; // If the client accepted the payment in installments for this invoice
        }
        const tz = androidApiCalls.getLocale() === "en_US" ? "en" : "pt-br";
        moment.locale(tz);
        const invoiceMonth = moment.utc(item.vencimento).format("MMM-YYYY");
        const invoiceYear = moment.utc(item.vencimento).year();
        invoiceHistoryData.push(
          {
            "invoiceId": item.faturaId,
            "dueDate": item.vencimento,
            "invoiceStatus": invoiceStatus,
            "amount": item.valor,
            "formatted_amount": formatted,
            "decimal": decimal,
            "isFutureInvoice": false,
            "invoiceMonth": invoiceMonth,
            "invoiceYear": invoiceYear
          }
        )

      }
      return {
        "success": true,
        "invoiceHistoryData": invoiceHistoryData

      }

    } else {
      return { "success": false }
    }

  }

  this.processCreditCardInvoiceHistoryDetails = function (result) {
    //Log.sDebug("processCreditCardInvoiceHistoryDetails" + JSON.stringify(result));
    let transactionData = [];
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      for (const item of result.items) {
        let transactionType = "D";
        if (item.idTipoTransacao === 2) {
          transactionType = "C";
        } else if (item.idTipoTransacao === 3) {
          transactionType = "E";
        }
        const dateOfTransaction = item.dataHoraTransacao;
        const formattedDate = moment.utc(item.dataHoraTransacao).format('DD/MM/YYYY');
        const formattedDateTime = moment.utc(item.dataHoraTransacao).format('DD/MM/YYYY - HH:mm');
        const hour = moment.utc(item.dataHoraTransacao).format('HH');
        const mins = moment.utc(item.dataHoraTransacao).format('mm');
        let formatted_amount = GeneralUtilities.formatAmountDecimal(item.valorBRL);
        if (transactionType !== "E") {
          transactionData.push(
            {
              date: dateOfTransaction,
              formatDate: formattedDate,
              formattedDateTime: formattedDateTime,
              description: GeneralUtilities.isNotEmpty(item.nomeEstabelecimento) ? item.nomeEstabelecimento : item.descricaoAbreviada,
              transaction: transactionType,
              amount: item.valorBRL,
              formatted_amount: formatted_amount,
              transactionId: item.transacaoId,
              hour: hour,
              mins: mins,
              processed: item.processada,
              noOfInstallments: item.parcelamento,
              currentInstallmentNo: item.parcelaNumero,
              contested: item.contestacaoId,
              isInstallment: item.descricaoAbreviada === "Parcela Lojista Visa" || item.descricaoAbreviada === "Parcela Cliente Visa" ? true : false,
              transactionDescription: item.descricaoAbreviada,
              date1: new Date(dateOfTransaction).getTime()
            });
        }
      }
      let tr = transactionData;
      let trDesc;
      if (tr !== null && tr !== undefined) {
        trDesc = tr.sort((a, b) => b.date1 - a.date1);
      }
      let invoiceStatus = "closed";
      //Log.sDebug("statusfatura: " + result.statusfatura);
      if (result.statusFatura === "ABERTA") {
        invoiceStatus = "open"; // Open invoice
      } else if (result.statusFatura === "FECHADA") {
        invoiceStatus = "closed"; // Closed invoice
      }
      if (result.statusPagamento === "ABAIXO_DO_MINIMO") {
        invoiceStatus = "partial"; // If the sum of the value of payments done by the client is lower than the minimum payment
      } else if (result.statusPagamento === "MINIMO") {
        invoiceStatus = "partial" // If the sum of the value of payments done by the client is equal ou higher than the invoice minimum value
      } else if (result.statusPagamento === "INTEGRAL") {
        invoiceStatus = "paid"; // If the sum of the value of payments done by the client is equal ou higher than the invoice total value
      } else if (result.statusPagamento === "PARCELADO") {
        invoiceStatus = "installment"; // If the client accepted the payment in installments for this invoice
      }
      let invoiceData = {
        "dueDate": result.dataVencimento,
        "invoiceStatus": invoiceStatus,
        "paymentDate": result.dataPagamento,
        "closeDate": result.dataFechamento, /* TO_DO change it to close date */
        "amount": result.valorFatura,
        "formatted_amount": GeneralUtilities.formatAmountDecimal(result.valorFatura),
        "nationalTotal": GeneralUtilities.getFormattedAmount(result.totalNacional),
        "internationalTotal": GeneralUtilities.getFormattedAmount(result.totalInternacional),
        "minPaymentAmount": GeneralUtilities.getFormattedAmount(result.pagamentoMinimo),
        "prevCredit": GeneralUtilities.getFormattedAmount(result.creditoAnterior),
        "totalTax": GeneralUtilities.getFormattedAmount(result.taxasTotais),
        "change": GeneralUtilities.getFormattedAmount(result.cambio),
        "pendingBalance": GeneralUtilities.getFormattedAmount(result.saldoPendente),
        "isFutureInvoice": false
      };


      return {
        "success": true,
        "transactionData": trDesc,
        "invoiceData": invoiceData
      }
    } else {
      return { "success": false }
    }

  }


  this.processCreditCardFutureInvoiceData = function (result) {
    let invoiceHistoryData = [];
    let formatted = "";
    let decimal = "";
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      for (const item of result.items) {
        if (item.valor !== null || !(item.valor === "")) {
          formatted = item.valor.toString().split(".")[0];
          if (item.valor.toString().length > 1) {
            decimal = item.valor.toString().split(".")[1] ? '' + item.valor.toString().split(".")[1] : "00";
          } else {
            decimal = "00"
          }
        } else {
          formatted = "0";
          decimal = "00";
        }
        invoiceHistoryData.push(
          {
            "futureInvoiceId": item.faturaFuturaId,
            "dueDate": item.vencimento,
            "amount": item.valor,
            "formatted_amount": formatted,
            "decimal": decimal,
            "isFutureInvoice": true,
            "invoiceStatus": "future"
          }
        )

      }
      return {
        "success": true,
        "futureInvoiceData": invoiceHistoryData

      }

    } else {
      return { "success": false }
    }

  }

  this.processCreditCardFutureInvoiceDetails = function (result) {
    //Log.sDebug("processCreditCardFutureInvoiceDetails" + JSON.stringify(result));
    let transactionData = [];
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      for (const item of result.items) {
        let transactionType = "D";
        if (item.idTipoTransacao === 2) {
          transactionType = "C";
        } else if (item.idTipoTransacao === 3) {
          transactionType = "E";
        }
        const dateOfTransaction = item.dataHoraTransacao;
        const formattedDate = moment.utc(item.dataHoraTransacao).format('DD/MM/YYYY');
        const formattedDateTime = moment.utc(item.dataHoraTransacao).format('DD/MM/YYYY - HH:MM');
        const hour = moment.utc(item.dataHoraTransacao).format('HH');
        const mins = moment.utc(item.dataHoraTransacao).format('mm');
        let formatted_amount = GeneralUtilities.formatAmountDecimal(item.valorBRL);
        if (transactionType !== "E") {
          transactionData.push(
            {
              date: dateOfTransaction,
              formatDate: formattedDate,
              formattedDateTime: formattedDateTime,
              description: GeneralUtilities.isNotEmpty(item.nomeEstabelecimento) ? item.nomeEstabelecimento : item.descricaoAbreviada,
              transaction: transactionType,
              amount: item.valorBRL,
              formatted_amount: formatted_amount,
              transactionId: item.transacaoId,
              hour: hour,
              mins: mins,
              processed: item.processada,
              noOfInstallments: item.parcelamento,
              currentInstallmentNo: item.parcelaNumero,
              isInstallment: item.descricaoAbreviada === "Parcela Lojista Visa" || item.descricaoAbreviada === "Parcela Cliente Visa" ? true : false,
              transactionDescription: item.descricaoAbreviada,
              contested: item.contestacaoId,
              date1: new Date(dateOfTransaction).getTime()
            });
        }
      }
      let tr = transactionData;
      let trDesc;
      if (tr !== null && tr !== undefined) {
        trDesc = tr.sort((a, b) => b.date1 - a.date1);
      }
      let invoiceData = {
        "dueDate": result.dataVencimento,
        "paymentDate": result.dataPagamento,
        "amount": result.valorFatura,
        "formatted_amount": GeneralUtilities.formatAmountDecimal(result.valorFatura),
        "nationalTotal": GeneralUtilities.getFormattedAmount(result.totalNacional),
        "internationalTotal": GeneralUtilities.getFormattedAmount(result.totalInternacional),
        "isFutureInvoice": true,
        "invoiceStatus": "future"
      };


      return {
        "success": true,
        "transactionData": trDesc,
        "invoiceData": invoiceData
      }
    } else {
      return { "success": false }
    }

  }

  this.processverifyGiftCardStatus = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      return {
        "success": true,
        "gcCreationStatus": result.statusCadastroClienteId
      }
    } else {
      return { "success": false, "result": result }
    }
  }

  this.processGiftCardAccessTokenResponse = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      if (result["accessToken"] && result["expiresIn"]) {
        ImportantDetails.giftCardAccessToken = result["accessToken"];
        ImportantDetails.giftCardAccessTokenExpiryTime = Date.now() + result["expiresIn"] * 1000;

        return { "success": true }
      }
    }
    return { "success": false }
  }

  this.processGetAddressResponseGiftCard = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL) {
      if (GeneralUtilities.areAllArgsValid(result.localidade, result.uf)) {
        let addressObj = {
          'street': result.logradouro,
          'neighbourhood': result.bairro,
          //'complement': result.complemento,
          "cep": result.cep,
          'city': result.localidade,
          'uf': result.uf
        }
        return { "success": true, "address": addressObj }
      }
    }
    return { "success": false }
  }

  this.processGetGiftCardAccountKey = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      const accountInfo = result.contas[0];
      return {
        "success": true,
        "gcAccountKey": accountInfo?.chaveDeConta,
        "gcClientKey": accountInfo?.chaveDeCliente
      }
    } else {
      return { "success": false, "result": result }
    }
  }

  this.processListTokensGiftCard = function (result) {
    if (!result) {
      return { "success": false }
    }
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus == 200) {
      if (GeneralUtilities.isArrayEmpty(result.tokens)) {
        return {
          "success": true,
          "tokenStatus": "NOT_GENERATED"
        }

      } else {
        let tokens = result.tokens[0];
        return {
          "success": true,
          "tokenStatus": tokens.tokenStatus
        }
      }

    } else {
      return { "success": false, "result": result }
    }
  }

  this.processGetGCCardKey = function (result) {
    if (result.idStatusExecucao === this.EXECUTION_SUCCESSFUL || result.httpStatus === 200) {
      const cardInfo = result.items[0];
      if (result.items.length > 0) {
        return {
          "success": true,
          "gcCardKey": cardInfo?.chaveDeCartao,
          "number": cardInfo?.cartaoNumero,
          "name": cardInfo?.nomeImpresso,
          "noCards": false

        }

      } else {
        return {
          "success": true,
          "noCards": true

        }

      }

    } else {
      return { "success": false, "result": result }
    }
  }

  this.processOtpForProfileResponse = function (result) {
    if (result.mensagem) {
      let len = result.mensagem.split(" ").length;
      if (len >= 1) {
        let message = result.mensagem.split(" ")[len - 1];
        return { "success": true, "message": message }
      } else {
        return { "success": false }
      }
    } else {
      return { "success": false }
    }
  }

  this.processGetOnboardingKeyResponse = function (result) {
    if (result.chaveOnboarding) {
      return { "success": true, "chaveOnboarding": result.chaveOnboarding, "status": result.status }
    }
    return { "success": false }
  }
}
export default new ArbiResponseHandler();
export { clientCreationStatus }
