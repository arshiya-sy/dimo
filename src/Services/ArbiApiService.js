import Globals from "./Config/config";
import { arbiEnvironment } from "./Config/config";
import androidApiCalls from "./androidApiCallsService";
import httpRequest from "./httpRequest";
import ImportantDetails from "../WalletComponents/NewLaunchComponents/ImportantDetails";
import ClientCreationJson from "./ClientCreationJson";
import ArbiApiUrls from "./ArbiApiUrls";
import Log from "./Log";
import constantObjects from "./Constants";
import ArbiApiMetrics from "./ArbiApiMetrics";
import GeneralUtilities from "./GeneralUtilities";
import Base64 from 'crypto-js/enc-base64'
import Utf8 from 'crypto-js/enc-utf8'
import { v4 as uuidv4 } from 'uuid';
import NewUtilities from "./NewUtilities";
import apiService from "./apiService";

function ArbiApiService() {

  this.HTTP_SUCCESS = 200;
  this.HTTP_SERVER_ERROR = 500;
  this.isSecure = androidApiCalls.getArbiApiCallSecurityLevel();
  this.organizationUnitId = Globals.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX ? 3 : constantObjects.featureEnabler.PROD_ORGID;
  this.productId = Globals.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX ? "e86ed3fd-4b9c-49aa-80d4-3c6113fa8cf7" : "c098e090-9101-4c94-85af-65e2e0438ade";
  this.tipo_send_to = Globals.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX ? 2 : 1;
  this.tipo_accept = Globals.getDigitalAccountEvironment() === arbiEnvironment.SANDBOX ? 3 : 2;
  this.clientJson = {};
  this.newClientJson = {};
  this.docType = "";

  this.getMetadata = () => {
    let metadata = [
      {
        "tipoMetadado": 1,
        "valor": NewUtilities.getMetadataForDeviceType()
      },
      {
        "tipoMetadado": 2,
        "valor": androidApiCalls.getSystemStringProperty("ro.product.model")
      }
    ]
    return metadata;
  }

  this.authWalletProfile = function (payloadJson) {
    let url = Globals.getArbiUrl("autenticar/cliente");
    payloadJson["MinutosValidosSessao"] = 1440;
    payloadJson["chaveDeIdempotencia"] = uuidv4();
    payloadJson["metadados"] = this.getMetadata();
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure);
  }

  this.getTransactionHistory = function (fromDate, lastDate, type, pageNumber, pageName) {
    let tipo = []
    if (type === "all") {
      tipo = [30, 40]
    } else if (type === "Sent") {
      tipo = [40]
    } else {
      tipo = [30]
    }
    let url = Globals.getArbiUrl("conta/consultar-extrato-completo");

    const accountKey = ImportantDetails.accountKey;

    Log.debug('from date and last date are ' + fromDate + " " + lastDate);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "dataInicio": fromDate,
      "dataFim": lastDate,
      "tiposTransacao": tipo,
      "pagina": pageNumber,
      "porPagina": 50,
      "tipoOrdenacao": 0
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }


  this.getTransactionHistoryForFilters = function (fromDate, lastDate, pageName) {
    let tipo = [30, 40];
    let url = Globals.getArbiUrl("conta/consultar-extrato-completo");
    const accountKey = ImportantDetails.accountKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "dataInicio": fromDate,
      "dataFim": lastDate,
      "tiposTransacao": tipo,
      "tipoOrdenacao": 0
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getReceiptForTransactions = function (transactionId) {
    let url = Globals.getArbiUrl("comprovante/consultar-comprovantes-por-id-transacao");
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "transacaoId": transactionId,
      "metadados": this.getMetadata(),
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.getUserBalance = function (pageName, accountKeyParam = "") {
    let url = Globals.getArbiUrl("conta/consultar-saldo");
    const accountKey = accountKeyParam ? accountKeyParam : ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getAllClientData = function (pageName) {
    Log.debug("getAllClientData");
    let url = Globals.getArbiUrl("cliente/obter-dados-pessoa-fisica-por-chave");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": ImportantDetails.clientKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.uploadFront = function (docJson, isCaf, pageName) {
    let url = Globals.getArbiUrl("cliente/enviar-documento");
    const clientKey = ImportantDetails.clientKey;

    let type = 1;
    if (ImportantDetails.uploadDocType === constantObjects.DOC_TYPE.CNH) {
      type = 3;
    }
    let image = { "extensao": 1};
    if (isCaf) {
      image["url"]= docJson.url
    } else {
      image["base64"]=docJson.base64
    }
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata(),
      "arquivo": image,
      "tipoDocumento": type
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.uploadBack = function (docJson, isCaf, pageName) {
    let url = Globals.getArbiUrl("cliente/enviar-documento");
    const clientKey = ImportantDetails.clientKey;

    let type = 2;
    if (ImportantDetails.uploadDocType === constantObjects.DOC_TYPE.CNH) {
      type = 4;
    }
    let image = { "extensao": 1};
    if (isCaf) {
      image["url"]= docJson.url
    } else {
      image["base64"]=docJson.base64
    }
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata(),
      "arquivo": image,
      "tipoDocumento": type
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.uploadSelfie = function (docJson, isCaf, pageName) {
    let url = Globals.getArbiUrl("cliente/enviar-documento");
    let type = 9
    const clientKey = ImportantDetails.clientKey
    let image = {};
    if (isCaf) {
      image = {
        "extensao": 2,
        "url": docJson.url
      };
    } else {
      image = {
        "extensao": 2,
        "base64": docJson.base64
      };
    }
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata(),
      "arquivo": image,
      "tipoDocumento": type
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.twoFactorAuth = function () {
    let url = Globals.getArbiUrl("token/gerar-2fa-assinatura-de-termo");
    const clientKey = ImportantDetails.clientKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata(),
      "tipoToken": this.tipo_send_to
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.extractOcrFromDoc = function (docType, pageName) {
    let url = Globals.getArbiUrl("cliente/extrair-ocr-documento");
    const clientKey = ImportantDetails.clientKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata(),
      "tipoDocumento": docType
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getTOS = function (from) {
    let url = Globals.getArbiUrl("cliente/obter-termo-generico");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
    }
    const accessToken = ImportantDetails.accessToken;
    ArbiApiMetrics.setAdditionalData(from);
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, from);
  }

  this.getTOA = function (from) {
    let url = Globals.getArbiUrl("cliente/obter-declaracao-de-residencia-generica");
    const clientKey = ImportantDetails.clientKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    ArbiApiMetrics.setAdditionalData(from);
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, from);
  }

  this.acceptTermsofService = function (tokenObj, pageName) {
    let url = Globals.getArbiUrl("cliente/assinar-termo")
    const clientKey = ImportantDetails.clientKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": this.tipo_accept,
        "token": tokenObj.token
      },
      //add API to fetch IP address
      //Find if local IP is needed or Public IP
      "ipAssinatura": "198.168.0.103"
    }
    const accessToken = ImportantDetails.accessToken;
    Log.debug(`get User name : ${clientKey} ${accessToken}`);
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.acceptTermsofAddress = function (tokenObj, pageName) {
    let url = Globals.getArbiUrl("cliente/assinar-declaracao-de-residencia")
    const clientKey = ImportantDetails.clientKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": 3,
        "token": tokenObj.token
      },
      //add API to fetch IP address
      //Find if local IP is needed or Public IP
      "ipAssinatura": "198.168.0.103"
    }
    const accessToken = ImportantDetails.accessToken;
    Log.debug(`get User name : ${clientKey} ${accessToken}`);
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getOPC = function (cardObj, walletId, deviceId) {
    let url = Globals.getArbiUrl("carteira-digital/opaque-card-info")
    var pkg = "commotorolacccnotification";

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": cardObj.pin
      },
      "chaveDeCartao": cardObj.cardKey,
      "metadados": this.getMetadata(),
      "clientWalletAccountId": walletId,
      "clientDeviceId": deviceId,
      "clientAppId": pkg
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.getCreditCardTransactionHistory = function (fromDate, toDate, pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GUARENTEED_CREDIT_TRANSACTION_HISTORY;
    let url = Globals.getArbiUrl(api);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "inicio": fromDate,
      "fim": toDate,
      "tipoOrdenacao": 0,
      "pagina": 0,
      "porPagina": 50
    }
    const accessToken = ImportantDetails.accessToken;
    let customUrl = "cartao-garantia/extrato";
    return httpRequest.getRequestToArbiSecure(url, payloadJson, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.getCreditCardInvoiceHistory = function (fromDate, toDate, pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GUARENTEED_CREDIT_INVOICE_HISTORY;
    let url = Globals.getArbiUrl(api);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "inicio": fromDate,
      "fim": toDate,
    }
    const accessToken = ImportantDetails.accessToken;
    let customUrl = "cartao-garantia/faturas";
    return httpRequest.getRequestToArbiSecure(url, payloadJson, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.getCreditCardInvoiceHistoryDetails = function (faturaId, pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GUARENTEED_CREDIT_INVOICE_HISTORY + "/" + faturaId + "/detalhes";
    let url = Globals.getArbiUrl(api);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4()
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.getRequestToArbiSecure(url, payloadJson, this.isSecure, accessToken, "", 0, pageName);
  }

  this.getCreditCardFutureInvoiceList = function (fromDate, pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GUARENTEED_CREDIT_INVOICE_HISTORY;
    let url = Globals.getArbiUrl(api);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "from_inicio": fromDate,
    }
    const accessToken = ImportantDetails.accessToken;
    let customUrl = "cartao-garantia/faturas";
    return httpRequest.getRequestToArbiSecure(url, payloadJson, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.getCreditCardFutureInvoiceDetails = function (faturafuturaId, pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GUARENTEED_CREDIT_INVOICE_HISTORY + "/" + faturafuturaId + "/detalhes";
    let url = Globals.getArbiUrl(api);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4()
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.getRequestToArbiSecure(url, payloadJson, this.isSecure, accessToken, "", 0, pageName);
  }

  this.getClientStatus = function (pageName) {
    let url = Globals.getArbiUrl("cliente/verificar-status-cliente");
    const clientKey = ImportantDetails.clientKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.createAccount = function (accountJson, pageName) {
    let url = Globals.getArbiUrl("conta/cadastrar-conta");
    const clientKey = ImportantDetails.clientKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata(),
      "chaveDeProduto": accountJson.productId,
      "tipoContaBancaria": 1,
      "primeiroPin": accountJson.pin
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  //..................General Account APIs..................
  this.changePassword = function (passwordObj, pageName) {
    let url = Globals.getArbiUrl("usuarios/alterar-senha-acesso-cliente");
    const clientKey = ImportantDetails.clientKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata(),
      "novaSenha": passwordObj.novaSenha
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.forgotPassword = function (cpfObj) {
    let url = Globals.getArbiUrl("usuarios/solicitar-reset-senha-por-token");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "identificacaoFiscal": cpfObj.cpf,
      "metadados": this.getMetadata(),
      "organizationUnitId": this.organizationUnitId
    }
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure);
  }

  this.changeForgottenPassword = function (pinObj, pageName) {
    let url = Globals.getArbiUrl("usuarios/alterar-senha-usuario-por-token");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "identificacaoFiscal": pinObj.cpf,
      "metadados": this.getMetadata(),
      "organizationUnitId": this.organizationUnitId,
      "autenticacao2FA": {
        "tipo": 3,
        "token": pinObj.token
      },
      "novaSenha": pinObj.newPassword,
      "confirmarNovaSenha": pinObj.newPassword
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.changeAccountPin = function (pinObj, pageName) {

    let url = Globals.getArbiUrl("conta/trocar-pin-conta-sync-pin-cartoes");
    const accountKey = ImportantDetails.accountKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": pinObj.pinOld
      },
      "pinNovo": pinObj.pinNew
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.forgotAccountPin2fa = function (pageName) {
    let url = Globals.getArbiUrl("token/gerar-2fa-alteracao-pin-conta");
    const accountKey = ImportantDetails.accountKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "tipoToken": this.tipo_send_to
    }
    console.log("payloadddd " + JSON.stringify(payloadJson))
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.forgotAccountPin = function (pinObj, pageName) {
    let url = Globals.getArbiUrl("conta/alterar-pin-conta-por-token-sync-pin-cartoes");
    const accountKey = ImportantDetails.accountKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": this.tipo_accept,
        "token": pinObj.token
      },
      "pinNovo": pinObj.newPin
    }
    console.log("pin payload " + JSON.stringify(payloadJson))
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  //..................ATM APIs..................
  this.withdrawMoneyFromAtm = function (payloadObject, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.WITHDRAW_ATM_URL);
    const accountKey = ImportantDetails.accountKey;
    const valorQrCode = payloadObject["qrCodeValue"];
    const pin = payloadObject["pin"];
    const amount = payloadObject["amount"];

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": pin
      },
      "metadados": this.getMetadata(),
      "valorQRCode": valorQrCode,
      "valor": amount,
      "chaveDeConta": accountKey
    }
    Log.debug(JSON.stringify(payloadJson))
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  //..................Card APIs..................
  this.getCardDetails = function (accountKey, pageName) {
    let url = Globals.getArbiUrl("cartao/consultar-cartoes-por-chave-conta");
    const accessToken = ImportantDetails.accessToken;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": GeneralUtilities.emptyValueCheck(ImportantDetails.accountKey) ? accountKey : ImportantDetails.accountKey
    }

    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);

  }

  this.requestVirtualCard = function (cardPIN, pageName) {
    let url = Globals.getArbiUrl("cartao/solicitar-cartao-virtual");
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "categoria": 1,
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey,
      "primeiroPin": cardPIN
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.blockCardtemp = function (cardKey, pageName) {
    let url = Globals.getArbiUrl("cartao/bloquear-cartao-pedido-cliente");

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCartao": cardKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.blockCardDamaged = function (cardKey, pageName) {
    let url = Globals.getArbiUrl("cartao/bloquear-cartao-danificado");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCartao": cardKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.blockCardStolen = function (cardKey, pageName) {
    let url = Globals.getArbiUrl("cartao/bloquear-cartao-roubo");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCartao": cardKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.blockCardLost = function (cardKey, pageName) {
    let url = Globals.getArbiUrl("cartao/bloquear-cartao-perda");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCartao": cardKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.unblockCardbyIssue = function (cardObj, pageName) {
    let url = Globals.getArbiUrl("cartao/desbloquear-cartao-emissao-sync-senha-conta");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": cardObj.pin
      },
      "chaveDeCartao": cardObj.cardKey,
      "metadados": this.getMetadata(),
      "cvv": cardObj.cvv,
      "dataValidade": cardObj.expiryDate
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.unblockCardTemp = function (cardKey, pageName) {
    let url = Globals.getArbiUrl("cartao/desbloquear-cartao-pedido-cliente");

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCartao": cardKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.unblockCardIncorrectPin = function (cardObj, pageName) {
    let url = Globals.getArbiUrl("cartao/desbloquear-cartao-por-senha-incorreta");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": cardObj.pin,
      },
      "metadados": this.getMetadata(),
      "chaveDeCartao": cardObj.cardKey
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.changeCardPin = function (cardObj) {
    let url = Globals.getArbiUrl("cartao/alterar-senha");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": cardObj.oldPin,
      },
      "metadados": this.getMetadata(),
      "novoPIN": cardObj.newPin,
      "chaveDeCartao": cardObj.cardKey
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.forgotCardPin2fa = function (cardKey) {
    let url = Globals.getArbiUrl("token/gerar-2fa-alteracao-pin-cartao");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCartao": cardKey,
      "metadados": this.getMetadata(),
      "tipoToken": this.tipo_send_to
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.forgotCardPin = function (pinObj) {
    let url = Globals.getArbiUrl("cartao/alterar-senha-por-token");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCartao": pinObj.cardKey,
      "autenticacao2FA": {
        "tipo": this.tipo_accept,
        "token": pinObj.token
      },
      "metadados": this.getMetadata(),
      "novoPin": pinObj.newPin
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.requestPhysicalCard = function (category, pageName) {
    let url = Globals.getArbiUrl("cartao/solicitar-cartao-fisico");
    const accountKey = ImportantDetails.accountKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "categoria": category,
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey,
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.requestSecondCopy = function (json, pageName) {
    let url = Globals.getArbiUrl("cartao/solicitar-segunda-via-cartao-fisico");
    const accountKey = ImportantDetails.accountKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "chaveDeCartao": json.cardKey,
      "metadados": this.getMetadata(),
      "motivo": json.reason
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  //..................Celluar Recharge APIs..................
  this.getServiceProviders = function (areaCode, pageName) {
    let url = Globals.getArbiUrl("recarga/consultar-provedores-celular");
    const accountKey = ImportantDetails.accountKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "ddd": areaCode
    }
    Log.debug('the area code : ' + areaCode);
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getRechargeValues = function (areaCode, operatorId, pageName) {
    let url = Globals.getArbiUrl("recarga/consultar-valores");
    const accountKey = ImportantDetails.accountKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "provedorId": operatorId,
      "ddd": areaCode
    }
    Log.debug('the area code and provider id : ' + areaCode + " " + operatorId);
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.CompleteCelluarRecharge = function (valObj, pageName) {
    let url = Globals.getArbiUrl("recarga/recarregar-celular")
    const accountKey = ImportantDetails.accountKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "valor": valObj.amount,
      "provedorId": valObj.provedorId,
      "autenticacao2FA": {
        "tipo": 1,
        "token": valObj.token
      },
      "ddi": 55,
      "ddd": valObj.ddd,
      "numero": valObj.numero
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  //..................TED Transfer APIs.................
  this.tedInternalTransfer = function (tedIntObj) {
    let url = Globals.getArbiUrl("transferencias/efetuar-transferencia-entre-contas-arbi");
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": tedIntObj.token
      },
      "metadados": this.getMetadata(),
      "chaveContaOrigem": accountKey,
      "identificacaoFiscalDestinatario": tedIntObj.cpf.replace(/[^0-9]/g, ''),
      "nomeDestinatario": tedIntObj.beneficiary,
      "valor": parseFloat(tedIntObj.amount + "." + tedIntObj.decimal),
      "agenciaDestino": tedIntObj.agency,
      "contaDestino": tedIntObj.account
    }

    Log.debug("Performing Internal TED");
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.tedExternalTransfer = function (tedExtObj, pageName) {
    let url = Globals.getArbiUrl("transferencias/efetuar-ted");
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": tedExtObj.token
      },
      "contaDestino": {
        "nome": tedExtObj.beneficiary,
        "identificacaoFiscal": tedExtObj.cpf.replace(/[^0-9]/g, ''),
        "banco": tedExtObj.bank,
        "agencia": tedExtObj.agency,
        "numero": tedExtObj.account,
        "tipoConta": tedExtObj.accountType
      },
      "valor": parseFloat(tedExtObj.amount + "." + tedExtObj.decimal),
      "dataAgendamento": new Date().toISOString()
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  //..................PIX APIs.................
  this.createCpfPixKey = function (pageName) {
    let url = Globals.getArbiUrl("pix/enderecamento/cadastrar-chave-identificacao-fiscal");
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.createEvpPixKey = function (pageName) {
    let url = Globals.getArbiUrl("pix/enderecamento/cadastrar-chave-evp");
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }


  this.createEmailPixKey = function (pixKey, userPin, pageName) {
    let url = Globals.getArbiUrl("pix/enderecamento/cadastrar-chave-email");
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "chaveEnderecamento": pixKey,
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": 3,
        "token": userPin
      }
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }


  this.createPhonePixKey = function (pixKey, userPin, pageName) {
    let url = Globals.getArbiUrl("pix/enderecamento/cadastrar-chave-celular");
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "chaveEnderecamento": pixKey,
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": 2,
        "token": userPin
      }
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.sendTokenToPixKey = function (pixKey, pageName) {
    let url = Globals.getArbiUrl("pix/enderecamento/gerar-token-validacao");
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "chaveEnderecamento": pixKey,
      "metadados": this.getMetadata()
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getPixKeyDetails = function (pixKey, pageName) {
    let url = Globals.getArbiUrl("pix/enderecamento/consultar-dados-por-chave");
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "chaveEnderecamento": pixKey,
      "metadados": this.getMetadata()
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.pixTransferForAKey = function (payLoad, pageName) {
    let url = Globals.getArbiUrl("pix/operacao/enviar-ordem-pagamento-por-chave");
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "descricao": payLoad["description"],
      "autenticacao2FA": {
        "tipo": 1,
        "token": payLoad["pin"]
      },
      "metadados": this.getMetadata(),
      "valorOperacao": payLoad["amount"] + "." + payLoad["decimal"],
      "chaveEnderecamento": payLoad["pixKey"]
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.pixTransferForAAccount = function (payLoad, pageName) {
    let url = Globals.getArbiUrl("pix/operacao/enviar-ordem-pagamento-por-agencia");
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "descricao": payLoad["description"],
      "autenticacao2FA": {
        "tipo": 1,
        "token": payLoad["pin"]
      },
      "metadados": this.getMetadata(),
      "valorOperacao": payLoad["amount"] + "." + payLoad["decimal"],
      "codInstituicaoBeneficiario": payLoad["receiverIspb"],
      "agenciaBeneficiario": payLoad["agency"],
      "contaBeneficiario": payLoad["account"],
      "tipoContaBeneficiario": payLoad["accountType"],
      "identificacaoFiscalBeneficiario": payLoad["CPF"],
      "nomeBeneficiario": payLoad["name"]
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);

  }


  this.getAllPixKeys = function (pageName) {

    let url = Globals.getArbiUrl("pix/enderecamento/consultar-chaves");
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata()
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);
  }

  this.generateStaticQrCodeForPixKey = function (payLoad, pageName) {

    let url = Globals.getArbiUrl("pix/qrcode/gerar-qrcode-estatico");
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "descricao": payLoad["description"],
      "metadados": this.getMetadata(),
      "chaveEnderecamento": payLoad["pixKey"],
      "valorOperacao": payLoad["Amount"]
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);
  }

  this.deletePixKey = function (pixKey, pixKeyType, pageName) {
    let url = Globals.getArbiUrl("pix/enderecamento/excluir-chave");
    const accountKey = ImportantDetails.accountKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "chaveEnderecamento": pixKey,
      "tipoPix": pixKeyType
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  //..................Boleto APIs.................
  this.getBoletoDetails = function (payLoad, pageName) {

    let url = Globals.getArbiUrl(ArbiApiUrls.FETCH_BOLETO_DETAILS);
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad =
    {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata()
    }

    let qrCodeType = payLoad["manual"] ? "linhaDigitavel" : "codigoDeBarras"
    finalPayLoad[qrCodeType] = payLoad["qrCodeValue"];
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);

  }

  this.payBoleto = function (payLoad, pageName) {

    let url = Globals.getArbiUrl(ArbiApiUrls.PAY_BOLETO);
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": payLoad["pin"]
      },
      "linhaDigitavel": payLoad["digitableLine"],
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "valor": payLoad["amount"]
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);

  }


  this.getDetailsOfQrCode = function (qrCodeValue, pageName) {

    let url = Globals.getArbiUrl("pix/qrcode/processar-qrcode");
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "qrCode": qrCodeValue,
      "metadados": this.getMetadata()
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);

  }

  this.payForAPixQrCode = function (payLoad, pageName) {
    let url = Globals.getArbiUrl("pix/operacao/enviar-ordem-pagamento-por-qrcode");
    const accountKey = ImportantDetails.accountKey;
    let qrCodeType = payLoad["qrCodeType"] === "ESTATICO" ? 1 : 2;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "descricao": payLoad["description"],
      "autenticacao2FA": {
        "tipo": 1,
        "token": payLoad["pin"]
      },
      "metadados": this.getMetadata(),
      "valorOperacao": parseFloat(payLoad["amount"] + "." + payLoad["decimal"]),
      "chaveEnderecamento": payLoad["receiverKey"],
      "endToEnd": payLoad["endToEnd"],
      "referenciaInterna": payLoad["internalReference"],
      "tipoQRCode": qrCodeType,
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);
  }


  this.payForAPixWithdraw = function (payLoad, pageName) {
    let url = Globals.getArbiUrl("pix/operacao/enviar-ordem-pagamento-por-qrcode");
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "descricao": payLoad["description"],
      "autenticacao2FA": {
        "tipo": 1,
        "token": payLoad["pin"]
      },
      "metadados": this.getMetadata(),
      "valorOperacao": 0,
      "tipoPix": payLoad["pixType"],
      "valorSaqueTroco": parseInt(payLoad["amount"]),
      "chaveEnderecamento": payLoad["receiverKey"],
      "endToEnd": payLoad["endToEnd"],
      "referenciaInterna": payLoad["internalReference"],
      "tipoQRCode": payLoad["qrCodeType"],
      "finalidadeDaTransacao": payLoad["transactionPurpose"],
      "modalidadeAgente": payLoad["modalityAgent"],
      "prestadorDoServicoDeSaque": payLoad["providerOfWithdrawService"]
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);
  }

  this.confirmEmailId = function (pageName) {
    let url = Globals.getArbiUrl("cliente/confirmacao-email");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": ImportantDetails.clientKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.createNewWalletUser = function (userObject) {
    let url = Globals.getArbiUrl(ArbiApiUrls.CREATE_USER);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "organizationUnitId": this.organizationUnitId,
      "nome": userObject.name,
      "sobrenome": "",
      "identificacaoFiscal": userObject.cpf,
      "email": userObject.email,
      "senha": userObject.password,
      "enviarPassword": false,
      "apelido": userObject.name,
      "metadados": this.getMetadata(),
      "celular": {
        "ddd": userObject.areaCode,
        "numero": userObject.phoneNumber
      }
    }
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, "", 0, userObject.pageName)
  }

  this.getUserWithCPF = function (userObject) {
    let url = Globals.getArbiUrl(ArbiApiUrls.GET_USER_WITH_CPF);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "organizationUnitId": this.organizationUnitId,
      "identificacaoFiscal": userObject.cpf,
      "metadados": this.getMetadata()
    }
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, "", 0, userObject.pageName)
  }

  this.authenticateUserWithClientKey = function (payloadJson, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.AUTHENTICATE_USER);
    payloadJson["MinutosValidosSessao"] = 1440;
    payloadJson["chaveDeIdempotencia"] = uuidv4();
    payloadJson["metadados"] = this.getMetadata();
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, "", 0, pageName);
  }

  this.consultCEP = function (cep, pageName) {
    let url = Globals.getArbiUrl("utilidades/consultar-cep");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "cep": cep
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.createClientPayloadJson = function (field, detailsObject) {
    if (field === "address") {
      this.newClientJson["endereco"] = {
        "rua": detailsObject.street,
        "numero": detailsObject.number,
        "complemento": detailsObject.complement,
        "bairro": detailsObject.neighborhood,
        "cep": detailsObject.cep,
        "cidade": detailsObject.city,
        "uf": detailsObject.uf
      };
    } else if (field === "userInfo") {
      this.newClientJson["telefoneMovel"] = {
        "ddd": detailsObject.ddd,
        "numero": detailsObject.mobileNumber
      };
      this.newClientJson["telefoneFixo"] = {
        "ddd": "",
        "numero": ""
      };
    } else if (field === "rg") {
      this.newClientJson["dataNascimento"] = detailsObject.dob;
      this.newClientJson["nomeMae"] = detailsObject.motherName;
      this.newClientJson["nomePai"] = detailsObject.fatherName;
      this.newClientJson["nome"] = detailsObject.name;
      this.newClientJson["rg"] = {
        "numero": detailsObject.rgNumber,
        "dataEmissao": detailsObject.issueDate ? detailsObject.issueDate : "0001-01-01T00:00:00",
        "orgaoEmissor": detailsObject.issueBody,
        "ufOrgaoEmissor": detailsObject.issueState,
      };
    } else if (field === "politicallyExposed") {
      this.newClientJson["pessoaPoliticamenteExposta"] = {
        "cargo": detailsObject.position,
        "inicioExposicao": detailsObject.startDate,
        "fimExposicao": detailsObject.endDate
      };
    } else {
      this.newClientJson[field] = detailsObject;
    }
    Log.debug("createClientPayloadJson " + JSON.stringify(this.newClientJson));
  }

  function deepMerge(target, source) {
    for (let key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) {
              target[key] = {};
          }
          deepMerge(target[key], source[key]);
      } else {
          if (key === "dataNascimento" || key === "rendaMensal") {
            continue;
          }
          if (source[key] !== null && source[key] !== "") {
            target[key] = source[key];
        }
      }
  }
  return target;
  }

  this.initializeClientCreation = function () {
    this.newClientJson = deepMerge(this.newClientJson, ClientCreationJson);
    this.newClientJson["nacionalidade"] = "N";
    Log.debug("initializeClientCreation " + JSON.stringify(this.newClientJson));
  }

  this.createNewClient = function (pageName) {
    let url = Globals.getArbiUrl("cliente/cadastrar-pessoa-fisica");
    this.newClientJson["chaveDeIdempotencia"] = uuidv4();
    this.newClientJson["metadados"] = this.getMetadata();
    // this.newClientJson["organizationUnitId"] = 3;
    if (this.newClientJson['pessoaPoliticamenteExposta'] == null) {
      delete this.newClientJson['pessoaPoliticamenteExposta'];
    }
    let payloadJson = this.newClientJson;
    Log.debug("Client Creation " + JSON.stringify(payloadJson));
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.createBoleto = function (payload, pageName) {
    let url = Globals.getArbiUrl("deposito/solicitar-boleto-para-deposito");
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "dataVencimento": payload.expiryDate,
      "valorOperacao": payload.amount,
      "gerarImpressao": true
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);
  }

  this.cancelBoleto = function (slipNumber, pageName) {
    let url = Globals.getArbiUrl("deposito/cancelar-boleto-de-deposito");
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "nossoNumero": slipNumber
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);
  }

  this.getAllBoletos = function (fromDate, lastDate, pageName) {
    let url = Globals.getArbiUrl("deposito/consultar-boletos-de-deposito-por-data-emissao");
    const accountKey = ImportantDetails.accountKey;
    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "dataInicio": fromDate,
      "dataFim": lastDate,
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);

  }

  this.getBoletoPDF = function (boletoID, pageName) {
    let url = Globals.getArbiUrl("deposito/consultar-boleto");
    const accountKey = ImportantDetails.accountKey;
    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "boletoId": boletoID,
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);

  }

  this.getSignedGenericTerms = function (pageName) {
    let url = Globals.getArbiUrl("cliente/obter-termo-assinado");
    const clientKey = ImportantDetails.clientKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata(),
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getSignedAddressTerms = function (pageName) {
    let url = Globals.getArbiUrl("cliente/obter-declaracao-de-residencia-assinada");
    const clientKey = ImportantDetails.clientKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.portEmailPixKey = function (payload, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.PIX_EMAIL_CLAIM_URL);
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "chaveEnderecamento": payload["pixKey"],
      "autenticacao2FA": {
        "tipo": 3, // means token was received through email
        "token": payload["token"]
      },
      "metadados": this.getMetadata(),
      "tipoReivindicacao": payload["claimType"]
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);
  }


  this.portPhoneNumberPixKey = function (payload, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.PIX_PHONE_CLAIM_URL);
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "chaveEnderecamento": payload["pixKey"],
      "autenticacao2FA": {
        "tipo": 2, // means token was received through email
        "token": payload["token"]
      },
      "metadados": this.getMetadata(),
      "tipoReivindicacao": payload["claimType"]
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);
  }


  this.portCpfPixKey = function (pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.PIX_CPF_CLAIM_URL);
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);
  }

  this.getPixKeyClaimStatus = function (pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.PIX_CLAIM_CONSULT_URL);
    const accountKey = ImportantDetails.accountKey;

    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.confirmPixClaim = function (claimId, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.PIX_CONFIRM_CLAIM_URL);
    const accountKey = ImportantDetails.accountKey;

    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "claimId": claimId
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.cancelPixClaim = function (payloadComponent, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.PIX_CANCEL_CLAIM_URL);
    const accountKey = ImportantDetails.accountKey;

    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "claimId": payloadComponent["claimId"]
    }

    if (payloadComponent["type"] && payloadComponent["token"]) {
      payload["autenticacao2FA"] = {
        "tipo": payloadComponent["type"],
        "token": payloadComponent["token"],
      }
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }


  this.concludePixClaim = function (payloadComponent, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.PIX_CONCLUDE_CLAIM_URL);
    const accountKey = ImportantDetails.accountKey;

    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "claimId": payloadComponent["claimId"],
      "autenticacao2FA": {
        "tipo": payloadComponent["type"],
        "token": payloadComponent["token"]
      }
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.getPixTransactionHistory = function (fromDate, lastDate, pageName) {
    let url = Globals.getArbiUrl("pix/operacao/consultar-extrato");
    const accountKey = ImportantDetails.accountKey;

    Log.debug('from date and last date are ' + fromDate + " " + lastDate);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "dataInicio": fromDate,
      "dataFim": lastDate
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.processPixReturnAmount = function (returnObj, pageName) {
    let url = Globals.getArbiUrl("pix/operacao/enviar-ordem-devolucao");
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "endToEnd": returnObj.endtoend,
      "motivos": [
        {
          "codigo": 7,
          "descricao": returnObj.description
        }
      ],
      "autenticacao2FA": {
        "tipo": 1,
        "token": returnObj.pin
      },
      "valorOperacao": parseFloat(returnObj.amount)
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getTariff = function (json, pageName) {
    let url = Globals.getArbiUrl("limites-tarifas/consultar-tarifa-operacao");
    const accountKey = ImportantDetails.accountKey;

    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "motivoTransacao": json["code"],
      "valorTransacao": json["amount"]
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.getBankList = function (filter) {
    let url = Globals.getArbiUrl("banco/consultar-bancos");
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "filtro": filter,
      "pagina": 0,
      "porPagina": 0
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken);
  }

  this.verifyAgency = function (jsonObject) {
    let url = Globals.getArbiUrl("banco/verificar-agencia");
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "codigoBanco": jsonObject["bank"],
      "codigoAgencia": jsonObject["agency"],
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken);
  }

  this.sendTokenToCancelAccount = function (pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.SEND_TOKEN_TO_CANCEL_ACCOUNT);
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": ImportantDetails.clientKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.cancelAccount = function (result, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.CANCEL_ACCOUNT);
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": ImportantDetails.accountKey,
      "metadados": this.getMetadata(),
      "motivoCancelamento": result["reason"],
      "autenticacao2FA": {
        "tipo": 2, // by sms
        "token": result["token"]
      }
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.logOut = function (pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.LOG_OUT);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "metadados": this.getMetadata()
    };
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.pixScheduleTransferForKey = function (scheduleObject, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.PIX_SCHEDULE_TRANSFER_KEY);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "descricao": scheduleObject.description,
      "autenticacao2FA": {
        "tipo": 1,
        "token": scheduleObject.pin,
      },
      "valorOperacao": scheduleObject.amount + "." + scheduleObject.decimal,
      "chaveEnderecamento": scheduleObject.pixKey,
      "recorrencia": scheduleObject.recurrence,
      "dataPagamento": scheduleObject.sendDate,
      "horaPagamento": 0
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.cancelPixScheduledTransactions = function (cancelObject, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.PIX_SCHEDULE_CANCEL);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "listaIdAgendamento": [cancelObject.scheduleId],
      "autenticacao2FA": {
        "tipo": 1,
        "token": cancelObject.pin,
      },
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.getPixScheduledTransactions = function (type, from, to, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.PIX_SCHEDULE_TRANSACTION_HISTORY);
    let status = 1;
    if (type === "cancelled") {
      status = 3;
    }
    else if (type === "scheduled") {
      status = 1;
    }
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "dataInicial": from,
      "dataFinal": to,
      "status": status,
      "pagina": 1,
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.pixEditScheduleForKey = function (scheduleObject, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.PIX_SCHEDULE_EDIT_KEY);
    const accessToken = ImportantDetails.accessToken;

    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "descricao": scheduleObject.description,
      "autenticacao2FA": {
        "tipo": 1,
        "token": scheduleObject.pin,
      },
      "valorOperacao": scheduleObject.amount + "." + scheduleObject.decimal,
      "chaveEnderecamento": scheduleObject.pixKey,
      "idAgendamento": scheduleObject.txnId,
      "dataPagamento": scheduleObject.sendDate,
      "horaPagamento": 0
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.tedScheduleInternal = function (scheduleObject) {
    const url = Globals.getArbiUrl(ArbiApiUrls.TED_SCHEDULE_INTERNAL);
    const accessToken = ImportantDetails.accessToken;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveContaOrigem": ImportantDetails.accountKey,
      "autenticacao2FA": {
        "tipo": 1,
        "token": scheduleObject.token,
      },
      "agenciaDestino": scheduleObject.agency,
      "contaDestino": scheduleObject.account,
      "valor": parseFloat(scheduleObject.amount + "." + scheduleObject.decimal),
      "dataAgendamento": scheduleObject.sendDate,
      "numeroOcorrencias": scheduleObject.recurrence
    }

    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.tedScheduleExternal = function (tedExtObj, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.TED_SCHEDULE_EXTERNAL);
    const accessToken = ImportantDetails.accessToken;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "autenticacao2FA": {
        "tipo": 1,
        "token": tedExtObj.token,
      },
      "contaDestino": {
        "nome": tedExtObj.beneficiary,
        "identificacaoFiscal": tedExtObj.cpf.replace(/[^0-9]/g, ''),
        "banco": tedExtObj.bank,
        "agencia": tedExtObj.agency,
        "numero": tedExtObj.account,
        "tipoConta": tedExtObj.accountType
      },
      "valor": parseFloat(tedExtObj.amount + "." + tedExtObj.decimal),
      "dataAgendamento": tedExtObj.sendDate,
      "numeroRecorrencias": tedExtObj.recurrence
    }
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);

  }

  this.getAllScheduledTransactions = function (from, to, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.GET_ALL_SHCEDULED_TRANSACTIONS);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "dataDe": from,
      "dataAte": to,
      "chaveDeConta": ImportantDetails.accountKey,
      "tiposAgendamento": [1, 2, 3, 4],
      "tipoOrdenacao": 1,
      "pagina": 1,
      "porPagina": 100
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.getTedInternalScheduledTransactionDetails = function (transactionId, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.TED_SCHEDULE_TRANSACTION_DETAILS_INTERNAL);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "idAgendamento": transactionId
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.getTedExternalScheduledTransactionDetails = function (transactionId, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.TED_SCHEDULE_TRANSACTION_DETAILS_EXTERNAL);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "idAgendamento": transactionId
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }


  this.getBoletoScheduledTransactionDetails = function (transactionId, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.BOLETO_SCHEDULE_TRANSACTION_DETAILS);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "idAgendamento": transactionId
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.getPixScheduledTransactionDetails = function (transactionId, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.PIX_SCHEDULE_TRANSACTION_DETAILS);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "idAgendamento": transactionId
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.getTedScheduledTransactions = function (from, to) {
    const url = Globals.getArbiUrl(ArbiApiUrls.TED_SCHEDULE_TRANSACTION_HISTORY);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "dataDe": from,
      "dataAte": to,
      "chaveDeConta": ImportantDetails.accountKey,
      "tiposAgendamento": [1, 2, 3, 4],
      "tipoOrdenacao": 1,
      "pagina": 1,
      "porPagina": 100
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken);
  }

  this.getPixLimits = function (pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.ACCESS_LIMITS);
    const clientKey = ImportantDetails.clientKey;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata()
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.requestLimitChange = function (payLoad, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.CHANGE_LIMITS);
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "autenticacao2FA": {
        "tipo": 1,
        "token": payLoad["pin"]
      },
      "metadados": this.getMetadata(),
      "novoValorLimite": payLoad["amount"],
      "tipoLimite":  1,
      "motivoTransacao": 4028
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);
  }

  this.getPendingLimitChange = function (pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.PIX_PENDING_LIMIT_REQUEST);
    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "organizationUnitId": this.organizationUnitId,
      "chaveDeCliente": ImportantDetails.clientKey,
      "identificacaoFiscal": ImportantDetails.cpf,
      "nome": ImportantDetails.nickName,
      "tipoOperacaoLimiteClienteEnum": 4028,
      "pagina": 0,
      "porPagina": 0
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);

  }

  this.scheduleBoletoPayment = function (payLoad, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.BOLETO_SCHEDULE_PAYMENT);
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": payLoad["pin"],
      },
      "linhaDigitavel": payLoad["digitableLine"],
      "chaveDeConta": accountKey,
      "dataPagamento": payLoad["scheduledDate"]
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken, 0, pageName);
  }

  this.cancelBoletoScheduledTransactions = function (cancelObject, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.BOLETO_SCHEDULE_CANCEL);

    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": cancelObject.pin,
      },
      "chaveDeConta": ImportantDetails.accountKey,
      "idAgendamentos": [cancelObject.scheduleId],
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.editScheduledBoleto = function (scheduleObject, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.BOLETO_SCHEDULE_EDIT);
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": scheduleObject.pin,
      },
      "chaveDeConta": ImportantDetails.accountKey,
      "idAgendamento": scheduleObject.txnId,
      "dataAgendamento": scheduleObject.sendDate
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.tedInternalScheduleCancel = function (cancelObject, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.TED_SCHEDULE_INTERNAL_CANCEL);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": cancelObject.pin,
      },
      "chaveDeConta": ImportantDetails.accountKey,
      "idAgendamentos": [cancelObject.scheduleId],
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.tedExternalScheduleCancel = function (cancelObject, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.TED_SCHEDULE_EXTERNAL_CANCEL);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "listaIdAgendamento": [cancelObject.scheduleId],
      "autenticacao2FA": {
        "tipo": 1,
        "token": cancelObject.pin,
      }
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.tedInternalScheduleEdit = function (editObject, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.TED_SCHEDULE_INTERNAL_EDIT);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": editObject.token,
      },
      "chaveDeConta": ImportantDetails.accountKey,
      "idAgendamento": editObject.txnId,
      "valor": parseFloat(editObject.amount + "." + editObject.decimal),
      "dataAgendamento": editObject.sendDate
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.tedExternalScheduleEdit = function (editObject, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.TED_SCHEDULE_EXTERNAL_EDIT);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "idAgendamento": editObject.txnId,
      "chaveDeConta": ImportantDetails.accountKey,
      "autenticacao2FA": {
        "tipo": 1,
        "token": editObject.token,
      },
      "novaDataAgendamento": editObject.sendDate,
      "novoValor": parseFloat(editObject.amount + "." + editObject.decimal)
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.isDatePublicHoliday = function (date, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.IS_HOLIDAY);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "diaAConsultar": date
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.fetchAllFavorites = function (filter, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.FETCH_ALL_CONTACTS);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "tipoOrdenacao": 1,
      "filtroNomeApelido": filter,
      "pagina": 0,
      "porPagina": 0
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.addNewContact = function (payloadObj, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.REGISTER_CONTACT);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "identificacaoFiscal": payloadObj["CPF"],
      "nomeCompleto": payloadObj["name"],
      "apelido": payloadObj["nickName"],
      "chaves": [
        {
          "agencia": payloadObj["agency"],
          "conta": payloadObj["account"],
          "tipoDeConta": payloadObj["accountType"] ? payloadObj["accountType"] : 1,
          "codigoOuISPB": payloadObj["bank"],
          "chavePix": payloadObj["pixKey"] ? payloadObj["pixKey"] : "",
          "tipoChavePix": GeneralUtilities.getPixType(payloadObj["transferType"])
        }
      ]
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.getContactDetails = function (contactDetails, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.GET_CONTACT_DETAILS);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "identificacaoFiscal": contactDetails.contactCpf,
      "favoritoId": contactDetails.contactId,
      "tipoChaveFiltro": 3,//3-> ALL DETAILS
      "pagina": 0,
      "porPagina": 20
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.deleteContactKey = function (contactDetails, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.DELETE_CONTACT_KEY);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "identificacaoFiscal": contactDetails.contactCpf,
      "favoritoId": contactDetails.contactId,
      "chaveFavoritoId": contactDetails.keyId
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.deleteContact = function (cpf, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.DELETE_CONTACT);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "identificacaoFiscal": cpf
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.editContact = function (payloadObj, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.EDIT_CONTACT_DETAIL);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "identificacaoFiscal": payloadObj["cpf"],
      "favoritoId": payloadObj["contactId"],
      "favoritoChaveId": payloadObj["keyId"],
      "nomeCompleto": payloadObj["name"],
      "apelido": payloadObj["nickName"],
      "chave":
      {
        "agencia": payloadObj["agency"],
        "conta": payloadObj["account"],
        "tipoDeConta": payloadObj["accountType"] ? payloadObj["accountType"] : 1,
        "codigoOuISPB": payloadObj["receiverIspb"],
        "chavePix": payloadObj["pixKey"] ? payloadObj["pixKey"] : "",
        "tipoChavePix": payloadObj["pixType"] ? payloadObj["pixType"] : 6
      }
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.isVacancyAvailable = function () {
    const url = Globals.getArbiUrl(ArbiApiUrls.CHECK_FOR_VACANCY);
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "organizationUnitId": this.organizationUnitId
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure);
  }

  this.checkWaitListStatus = function (cpf) {
    const url = Globals.getArbiUrl(ArbiApiUrls.CHECK_WAITLIST_STATUS);
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "organizationUnitId": this.organizationUnitId,
      "identificacaoFiscal": cpf
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure);
  }

  this.registerToWaitList = function (userObject) {
    const url = Globals.getArbiUrl(ArbiApiUrls.REGISTER_TO_WAITLIST);
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "organizationUnitId": this.organizationUnitId,
      "identificacaoFiscal": userObject.cpf,
      "email": userObject.email,
      "nomeCompleto": userObject.name,
      "telefoneMovel": {
        "ddd": "0" + userObject.ddd,
        "numero": userObject.mobNum
      }
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure);
  }

  // FGTS APIs
  this.getAuthorizedFgtsValue = function (value, pageName) {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl(`conta/${ImportantDetails.accountKey}/antecipacao/fgts/simulacao-autorizadora`);
    let customURL = ArbiApiUrls.FGTS_ANTICIPATE_API;
    let params = {
      "chaveDeConta": ImportantDetails.accountKey
    }
    if(value && value.amount && value.decimal){
      params["valorSolicitado"] = parseFloat(value.amount + "." + value.decimal)
    } else {
      params["valorSolicitado"] = 0
    }
    
    return httpRequest.getRequestToArbiSecure(url, params, this.isSecure, accessToken, customURL, 0, pageName);
  }

  this.getFgtsTermsForContract = function (pageName) {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl(`conta/${ImportantDetails.accountKey}/antecipacao/fgts/termo`);
    let customURL = ArbiApiUrls.FGTS_GET_TERMS_API;
    let params = {
      "chaveDeConta": ImportantDetails.accountKey,
    }
    return httpRequest.getRequestToArbiSecure(url, params, this.isSecure, accessToken, customURL, 0, pageName);
  }

  this.getTokenAndContractID = function (value, pageName) {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl(`conta/${ImportantDetails.accountKey}/antecipacao/fgts/proposta`);
    let customURL = ArbiApiUrls.FGTS_GET_PROPOSALID_API;
    let params = {
      "chaveDeConta": ImportantDetails.accountKey,
    }
    let payloadJson = {
      "valorSolicitado": parseFloat(value.amount + "." + value.decimal)
    }
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName, customURL);
  }

  this.signFGTSContract = function (fgtsObject, pageName) {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl(`conta/${ImportantDetails.accountKey}/antecipacao/fgts/proposta/${fgtsObject.contractId}/faceauth/${fgtsObject.faceAuthId}/contrato`);
    const customUrl = ArbiApiUrls.FGTS_SIGN_CONTRACT;
    // let params = {
    //   "chaveDeConta": ImportantDetails.accountKey,
    //   "propostaId": fgtsObject.contractId,
    //   "faceAuthId": fgtsObject.faceAuthId
    // }
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "propostaId": fgtsObject.contractId,
      "faceAuthId": fgtsObject.faceAuthId
    }
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName, customUrl);
  }

  this.createFaceAuthId = function (fgtsObject, pageName) {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl(`clientes/${ImportantDetails.clientKey}/faceauth`);
    let customURL = ArbiApiUrls.FGTS_GET_FACEAUTH_ID;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      //"imagejwt": fgtsObject.jwt,
      "encodedUrl": fgtsObject.jwt,
      "dispositivo": {
        "sistemaOperacional": "Android",
        "impressaoDigital": NewUtilities.getMetadataForDeviceType(),
        "fabricante": androidApiCalls.getSystemStringProperty("ro.product.name"),
        "modelo": androidApiCalls.getSystemStringProperty("ro.product.model")
      }
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName, customURL);
  }

  this.fetchSignedFgtsContract = function (contractId, pageName) {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl(`conta/${ImportantDetails.accountKey}/antecipacao/fgts/termo/${contractId}`);
    const customUrl = ArbiApiUrls.FGTS_GET_SIGNED_CONTRACT;
    let params = {
      "chaveDeConta": ImportantDetails.accountKey,
      "contratoId": contractId
    }
    return httpRequest.getRequestToArbiSecure(url, params, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.getFgtsContractsList = function (values, pageName) {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl(`conta/${ImportantDetails.accountKey}/antecipacao/fgts/contratos`);
    let customURL = ArbiApiUrls.FGTS_GET_CONTRACT_LIST
    let params = {
      "chaveDeConta": ImportantDetails.accountKey,
      "Ordenacao": values.sortOrder,
      "Pagina": values.Pagina,
      "porPagina": values.porPagina
    }
    return httpRequest.getRequestToArbiSecure(url, params, this.isSecure, accessToken, customURL, 0, pageName);
  }

  this.requestSalaryPortability = function (jsonObject, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.REQUEST_SALARY_PORTABILITY);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "identificacaoFiscalEmpresaOrigem": jsonObject.cnpj,
      "razaoSocialEmpresaOrigem": jsonObject.name,
      "codigoBancoOrigem": jsonObject.bank,
      "autenticacao2FA": {
        "tipo": 1,
        "token": jsonObject.token
      },
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.listAllPortabilityRequests = function (pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.LIST_PORTABILITY_REQUESTS);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "pagina": 0,
      "porPagina": 0,
      "tipoOrdenacao": 0
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.cancelSalaryPortability = function (jsonObject, pageName) {
    const url = Globals.getArbiUrl(ArbiApiUrls.CANCEL_PORTABILITY_REQUESTS);
    const accessToken = ImportantDetails.accessToken;
    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDePortabilidade": jsonObject.portKey,
      "motivoCancelamento": jsonObject.reason,
      "complementoMotivoCancelamento": jsonObject.details,
      "autenticacao2FA": {
        "tipo": 1,
        "token": jsonObject.token
      },
    }
    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.getDetailsOfDimoQrCode = function (qrCodeValue) {
    let url = Globals.getArbiUrl(ArbiApiUrls.DIMO_GET_DETAILS_OF_CODE);
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "qrCode": Base64.stringify(Utf8.parse(qrCodeValue)),
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken);
  }

  this.payForDimoQrCode = function (payLoad) {
    let url = Globals.getArbiUrl(ArbiApiUrls.DIMO_PAY_QR_CODE);
    const accountKey = ImportantDetails.accountKey;

    let finalPayLoad = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "autenticacao2FA": {
        "tipo": 1,
        "token": payLoad["pin"]
      },
      "metadados": this.getMetadata(),
      "qrCode": Base64.stringify(Utf8.parse(payLoad["code"]))
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, finalPayLoad, this.isSecure, accessToken);
  }

  this.migrateCard = function (cardKey, pageName) {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl(ArbiApiUrls.MIGRATE_TO_VISA);

    let params = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "chaveDeProdutoNovo": cardKey,
    }
    return httpRequest.postRequestToArbi(url, params, this.isSecure, accessToken, 0, pageName);
  }

  this.getMigrationPermission = function (pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.PERMISSION_TO_MIGRATE);
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getRequestCategory = function (pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.GET_REQUEST_CATEGORY);
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getIframe = function (hash) {
    const domailUrl = Globals.getIframeUrl("card-details");
    let finalUrl = domailUrl + "?hash=" + hash;
    Log.sDebug("URL for hashing " + finalUrl + "for card with key " + ImportantDetails.virtualCardKey, "API SERVICE");
    return finalUrl;
  }

  this.getIframehash = function (cardKey, pin) {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl("cartao/obter-cartao-completo-por-chave-cartao");

    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDoCartao": cardKey,
      "autenticacao2FA": {
        "tipo": 1,
        "token": pin
      }
    }

    return httpRequest.postRequestToArbiHash(url, payload, this.isSecure, accessToken);
  }

  this.validatePin = function (pin, pageName) {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl(ArbiApiUrls.VALIDATE_ACCOUNT_PIN);

    let payload = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": ImportantDetails.accountKey,
      "autenticacao2FA": {
        "tipo": 1,
        "token": pin
      }
    }

    return httpRequest.postRequestToArbi(url, payload, this.isSecure, accessToken, 0, pageName);
  }

  this.getProductKey = function () {
    let url = Globals.getArbiUrl(ArbiApiUrls.FETCH_PRODUCT_KEY);

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeCliente": ImportantDetails.clientKey,
      "organizationUnitId": this.organizationUnitId
    }

    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.listFinancingContracts = function () {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl(`financiamento/mobile/contas/${ImportantDetails.accountKey}/contratos`);
    const customUrl = ArbiApiUrls.LIST_FINANCING_CONTRACTS;
    let params = {};
    return httpRequest.getRequestToArbiSecure(url, params, this.isSecure, accessToken, customUrl);
  }

  this.listContractDetails = function (contractId) {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl(`financiamento/mobile/contas/${ImportantDetails.accountKey}/contratos/${contractId}`);
    const customUrl = ArbiApiUrls.LIST_CONTRACT_DETAILS;
    let params = {};
    return httpRequest.getRequestToArbiSecure(url, params, this.isSecure, accessToken, customUrl);
  }

  this.listContractInvestments = function (contractId) {
    const accessToken = ImportantDetails.accessToken;
    const url = Globals.getArbiUrl(`financiamento/mobile/contas/${ImportantDetails.accountKey}/contratos/${contractId}/parcelas`);
    const customUrl = ArbiApiUrls.LIST_INSTALLMENT_DETAILS;
    let params = {};
    return httpRequest.getRequestToArbiSecure(url, params, this.isSecure, accessToken, customUrl);
  }

  this.getDeliveryAddress = function () {
    let url = Globals.getArbiUrl(ArbiApiUrls.GET_DELIVERY_ADDRESS);
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  //Credit card APIS
  this.getGuaranteedCreditStatus = function (pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GUARENTEED_CREDIT_STATUS;
    let url = Globals.getArbiUrl(api);
    const accessToken = ImportantDetails.accessToken;
    let params = {
      "chaveDeIdempotencia": uuidv4()
    };
    return httpRequest.getRequestToArbiSecure(url, params, this.isSecure, accessToken, "", 0, pageName);
  }

  this.getGuaranteedCreditInvestmentInfo = function (pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GUARENTEED_CREDIT_INVESTMENT_INFO;
    let url = Globals.getArbiUrl(api);
    const accessToken = ImportantDetails.accessToken;
    let params = {
      "chaveDeIdempotencia": uuidv4()
    };
    return httpRequest.getRequestToArbiSecure(url, params, this.isSecure, accessToken, "", 0, pageName);
  }

  this.analyseCreditScore = function () {
    let url = Globals.getArbiUrl(ArbiApiUrls.ANALYSE_CREDIT_SCORE);
    const accountKey = ImportantDetails.accountKey;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.configureCreditCard = function (payLoad, pageName) {
    const accountKey = ImportantDetails.accountKey;

    let api = "contas/" + accountKey + ArbiApiUrls.CONFIGURE_CREDIT_CARD;
    let url = Globals.getArbiUrl(api);

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey,
      "valor": payLoad["creditLimit"],
      "diaVencimentoFatura": payLoad["dueDate"],
      "debitoAutomatico": payLoad["autoDebit"],
    }
    let params = {};
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, "", 0, true, pageName);
  }

  this.getCreditCardInvestmentOnboarding = function (pageName) {
    const accountKey = ImportantDetails.accountKey;

    let api = "contas/" + accountKey + ArbiApiUrls.CONFIGURE_CREDIT_CARD;
    let url = Globals.getArbiUrl(api);

    let payloadJson = {
      "chaveDeIdempotencia": androidApiCalls.generateGuid(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.getRequestToArbiSecure(url, payloadJson, this.isSecure, accessToken, "", 0, pageName);
  }

  this.fetchCreditContract = function (pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.FETCH_CREDIT_CONTRACT;
    let url = Globals.getArbiUrl(api);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey
    }
    const accessToken = ImportantDetails.accessToken;
    let params = {};
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, "", 0, true, pageName);
  }

  this.getCreditContract = function (pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GET_CREDIT_CONTRACT;
    let url = Globals.getArbiUrl(api);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.getRequestToArbiSecure(url, payloadJson, this.isSecure, accessToken, "", 0, pageName);
  }

  this.signCreditContract = function (payLoad, pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.SIGN_CREDIT_CONTRACT;
    let url = Globals.getArbiUrl(api);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey,
      "contratoid": payLoad["contractId"],
      "autenticacao2FA": {
        "tipo": 1,
        "token": payLoad["token"],
        "agente": "",
        "faceMatch": payLoad["selfieObj"]

      },
      "ipAssinatura": "198.168.0.103"
    }
    let params = {};
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, "", 0, true, pageName);
  }

  this.faceMatchRedeem = function (payLoad, pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GUARENTEED_FACEMATCH_REDEEM;
    let url = Globals.getArbiUrl(api);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey,
      "valorResgate": payLoad["redeemAmount"],
      "autenticacao2FA": {
        "tipo": 1,
        "token": payLoad["token"],
        "agente": "",
        "faceMatch": payLoad["selfieObj"]
      },
    }
    const accessToken = ImportantDetails.accessToken;
    let params = {};
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, "", 0, true, pageName);
  }

  this.faceMatchInvestMore = function (payLoad, pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GUARENTEED_FACEMATCH_INVEST_MORE;
    let url = Globals.getArbiUrl(api);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey,
      "autenticacao2FA": {
        "tipo": 1,
        "token": payLoad["token"],
        "agente": "",
        "faceMatch": payLoad["selfieObj"]
      },
      "ipAssinatura": "198.168.0.103"
    }
    const accessToken = ImportantDetails.accessToken;
    let params = {};
    let customUrl = "cartao-garantia/contrato-corrente/aditivo/assinatura";
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, customUrl, 0, true, pageName);

  }

  this.getCreditInvestmentHomePageDetails = function (pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GUARENTEED_CREDIT_INVESTMENT_HOME_PAGE;
    let url = Globals.getArbiUrl(api);
    const accessToken = ImportantDetails.accessToken;
    let params = {
      "chaveDeIdempotencia": uuidv4(),
    };
    let customUrl = "cartao-garantia/posicao"
    return httpRequest.getRequestToArbiSecure(url, params, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.simulateRedeemInvestment = function (redeemAmount, pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GUARENTEED_SIMULATE_REDEEM;
    let url = Globals.getArbiUrl(api);
    const accessToken = ImportantDetails.accessToken;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "valor": redeemAmount
    }
    let params = {};
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, "", 0, true, pageName);
  }

  this.simulateInvestMore = function (investAmount, pageName) {
    const accountKey = ImportantDetails.accountKey;
    let api = "contas/" + accountKey + ArbiApiUrls.GUARENTEED_SIMULATE_INVEST_MORE;
    let url = Globals.getArbiUrl(api);
    const accessToken = ImportantDetails.accessToken;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "valor": investAmount
    }

    let params = {};
    let customUrl = "cartao-garantia/contrato-corrente/aditivo";
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, customUrl, 0, true, pageName);
  }

  this.getCreditCardData = function (pageName) {
    const accountKey = ImportantDetails.accountKey;
    let url = Globals.getArbiUrl("contas/" + accountKey + ArbiApiUrls.GUARENTEED_CREDIT_CARD_HOME_PAGE)
    const accessToken = ImportantDetails.accessToken;
    let params = {
      "chaveDeIdempotencia": uuidv4(),
    };
    let customUrl = "contas/accountKey" + ArbiApiUrls.GUARENTEED_CREDIT_CARD_HOME_PAGE;
    return httpRequest.getRequestToArbiSecure(url, params, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.getCreditCardSettingsData = function (cardKey, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.GUARENTEED_CREDIT_CARD_SETTINGS)
    const accessToken = ImportantDetails.accessToken;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeCartao": cardKey
    }
    let params = {};
    let customUrl = "cartao/obter-configuracoes"
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, customUrl, 0, true, pageName);
  }

  this.updateCreditCardLimitValue = function (limitValue) {
    let url = Globals.getArbiUrl("creditoclean/configuracoes-portador")
    const accessToken = ImportantDetails.accessToken;

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "datadevencimentofatura": limitValue
    }
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.updateCreditCardIncreaseCreditLimit = function (limitValue) {
    let url = Globals.getArbiUrl("creditoclean/analise-de-credito")
    const accessToken = ImportantDetails.accessToken;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": ImportantDetails.accountKey,
      "valorcreditoescolhido": limitValue
    }
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.updateCreditCardInvoiceDueDate = function (invoiceDate, pageName) {
    let url = Globals.getArbiUrl("contas/" + ImportantDetails.accountKey + ArbiApiUrls.GUARENTEED_CREDIT_CARD_CHANGE_DUE_DATE)
    const accessToken = ImportantDetails.accessToken;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "diaVencimentoFatura": invoiceDate
    }
    let customUrl = "contas/accountKey/cartao-garantia/data-vencimento";
    return httpRequest.putRequestToArbi(url, payloadJson, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.getInvoiceDetails = function (invoiceId, pageName) {
    let url = Globals.getArbiUrl("contas/" + ImportantDetails.accountKey + "/cartao-garantia/faturas/" + invoiceId + "/detalhes");
    let customUrl = "contas/accountKey/cartao-garantia/faturas/invoiceId/detalhes";
    let params = {
      "chaveDeIdempotencia": uuidv4(),
    };
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.getRequestToArbiSecure(url, params, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.simulatePayment = function (payLoad, pageName) {
    let url = Globals.getArbiUrl("contas/" + ImportantDetails.accountKey + "/cartao-garantia/faturas/" + payLoad["invoiceId"] + "/simulacao-pagamento");

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "valor": payLoad["value"]
    }
    const accessToken = ImportantDetails.accessToken;
    let params = {};
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, "", 0, true, pageName);
  }

  this.updateCreditCardContactlessPayments = function (contactlessPaymentsStatus, cardKey, pageName) {
    let url = Globals.getArbiUrl("cartao/configurar-contactless")
    const accessToken = ImportantDetails.accessToken;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "permiteContactless": contactlessPaymentsStatus,
      "chaveDeCartao": cardKey
    }
    let customUrl = "cartao/configurar-contactless";
    return httpRequest.putRequestToArbi(url, payloadJson, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.updateCreditCardAutomaticDebit = function (autoDebit, pageName) {
    let url = Globals.getArbiUrl("contas/" + ImportantDetails.accountKey + ArbiApiUrls.GUARENTEED_CREDIT_CARD_CHANGE_AUTOMATIC_DEBIT)
    const accessToken = ImportantDetails.accessToken;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "debitoAutomatico": autoDebit
    }
    let customUrl = "contas/accountKey/cartao-garantia/debito-automatico";
    return httpRequest.putRequestToArbi(url, payloadJson, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.simulatePaymentInstallments = function (payLoad) {
    let url = Globals.getArbiUrl("contas/" + ImportantDetails.accountKey + "/cartao-garantia/faturas/simulacao-pagamento-parcelado");

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "valorEntrada": parseFloat(payLoad["value"]),
      "parcelamento": payLoad["installments"]
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.payTheBillWithPix = function (payLoad) {
    let url = Globals.getArbiUrl("contas/" + ImportantDetails.accountKey + "/cartao-garantia/faturas/" + payLoad["invoiceId"] + "/qr-code-pix");
    let payloadJson = {}
    const accessToken = ImportantDetails.accessToken;
    let customUrl = "contas/accountKey/cartao-garantia/faturas/invoiceId/qr-code-pix";
    let params = {};
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, customUrl);
  }

  this.payTheBillWithBoleto = function (payLoad) {
    let url = Globals.getArbiUrl("contas/" + ImportantDetails.accountKey + "/cartao-garantia/faturas/" + payLoad["invoiceId"] + "/boleto");
    let payloadJson = {}
    const accessToken = ImportantDetails.accessToken;
    let customUrl = "contas/accountKey/cartao-garantia/faturas/invoiceId/boleto";
    let params = {};
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, customUrl);
  }

  this.payTheBillDirectDebit = function (payLoad, pageName) {
    const accountKey = ImportantDetails.accountKey;
    let url = Globals.getArbiUrl("contas/" + accountKey + "/cartao-garantia/faturas/" + payLoad["invoiceId"] + "/debito-conta");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "faturaId": payLoad["invoiceId"],
      "autenticacao2FA": {
        "tipo": 1,
        "token": payLoad["token"]
      },
      "valor": payLoad["value"]
    }
    const accessToken = ImportantDetails.accessToken;
    let customUrl = "contas/accountKey/cartao-garantia/faturas/invoiceId/debito-conta"
    let params = {};
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, customUrl, 0, true, pageName);
  }

  this.getGiftCardAccessToken = function () {
    let url = Globals.getArbiUrl("autenticar/device");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "deviceId": androidApiCalls.getDeviceId()
    }
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, "");
  }

  this.consultCEPGiftCard = function (cep, pageName) {
    let url = Globals.getArbiUrl("utilidades/consultar-cep");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "cep": cep
    }
    const accessToken = ImportantDetails.giftCardAccessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getAllClientDataGiftCard = function (gcClientKey, pageName) {
    Log.debug("getAllClientData");
    let url = Globals.getArbiUrl("cliente/obter-dados-pessoa-fisica-por-chave");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": gcClientKey,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.giftCardAccessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.createGiftCard = function (jsonObject, address, clientId, pageName) {
    let url = Globals.getArbiUrl("clientes/cartao-presente/cadastrar");
    let gc_clientId = clientId;
    let gc_cpf = jsonObject.cpf;
    androidApiCalls.storeToPrefs("giftCardClientId", gc_clientId);
    androidApiCalls.storeToPrefs("giftCardCPF", gc_cpf);
    let UO = Globals.getGiftCardUO();
    let customUrl = "gc-clientes/gc-cartao-presente/cadastrar";
    let payloadJson =
    {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "gc_chaveDeCliente": gc_clientId,
      "chaveDeCliente": gc_clientId,
      "unidadeOrganizacionalId": UO,
      "identificacaoFiscal": jsonObject.cpf,
      "nome": jsonObject.name,
      "dataNascimento": jsonObject.dob,
      "nomeMae": "MOTOROLA DIMO",//jsonObject.motherName,
      "celular": {
        "ddd": "0" + jsonObject.ddd,
        "numero": jsonObject.mobNum
      },
      "email": jsonObject.email,
      "Endereco": address,
      "primeiroPin": "1234"
    }
    let params = {};
    const accessToken = ImportantDetails.giftCardAccessToken;
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, customUrl, 0, true, pageName);
  }

  this.listTokensGiftCard = function (gcClientKey, gcAccountKey, gcCardKey, pageName) {
    let customUrl = "carteira-digital/listar-tokens-visa";
    let api = "carteira-digital/listar-tokens-visa/" + gcCardKey
    let url = Globals.getArbiUrl(api);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "gc_chaveDeCliente": gcClientKey,
      "gc_chaveDeConta": gcAccountKey,
      "gc_chaveDeCartao": gcCardKey,
    }

    const accessToken = ImportantDetails.giftCardAccessToken;
    return httpRequest.getRequestToArbiSecure(url, payloadJson, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.verifyGiftCardStatus = function (clientKey, pageName) {
    let url = Globals.getArbiUrl("cliente/verificar-status-cliente");

    let payloadJson =
    {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeCliente": clientKey,
      "gc_chaveDeCliente": clientKey
    }
    let customUrl = "cliente/gc-verificar-status-cliente";
    let params = {};
    const accessToken = ImportantDetails.giftCardAccessToken;
    return httpRequest.postWithParamsRequestToArbiSecure(url, payloadJson, params, this.isSecure, accessToken, customUrl, 0, true, pageName);
  }

  this.loadMoneyToGiftCard = function (clientKey, accountKey, amount, pageName) {
    let url = Globals.getArbiUrl("tesouraria/cartao-presente/creditar-conta-cliente");
    let treasurekey = Globals.getGiftCardTreasureAccountKey();
    let payloadJson =
    {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeCliente": clientKey,
      "chaveDeConta": accountKey,
      "gc_chaveDeCliente": clientKey,
      "gc_chaveDeConta": accountKey,
      "chaveDeContaTesouraria": treasurekey,
      "motivo": 3062,
      "valor": amount
    }
    const accessToken = ImportantDetails.giftCardAccessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getGiftCardAccountKey = function (clientKey, pageName) {
    let url = Globals.getArbiUrl("conta/consultar-contas");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": clientKey,
      "metadados": this.getMetadata(),
      "listarSubcontas": true
    }
    const accessToken = ImportantDetails.giftCardAccessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getGCCardKey = function (accountKey, pageName) {
    let url = Globals.getArbiUrl("cartao/consultar-cartoes-por-chave-conta");
    const accessToken = ImportantDetails.giftCardAccessToken;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey
    }
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);

  }

  this.requestGCVirtualCard = function (cardPIN, accountKey, pageName) {
    let url = Globals.getArbiUrl("cartao/solicitar-cartao-virtual");

    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "categoria": 1,
      "metadados": this.getMetadata(),
      "chaveDeConta": accountKey,
      "primeiroPin": cardPIN
    }
    const accessToken = ImportantDetails.giftCardAccessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }


  this.giftCardForgotAccountPin = function (accountKey, pageName) {
    let url = Globals.getArbiUrl("conta/alterar-pin-conta-por-token-sync-pin-cartoes");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "autenticacao2FA": {
        "tipo": this.tipo_accept,
        "token": "987633"
      },
      "pinNovo": "1234"
    }
    const accessToken = ImportantDetails.giftCardAccessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getOPCGiftCard = function (cardObj, walletId, deviceId) {
    let url = Globals.getArbiUrl("carteira-digital/opaque-card-info")
    var pkg = "commotorolacccnotification";
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "autenticacao2FA": {
        "tipo": 1,
        "token": cardObj.pin
      },
      "chaveDeCartao": cardObj.cardKey,
      "metadados": this.getMetadata(),
      "clientWalletAccountId": walletId,
      "clientDeviceId": deviceId,
      "clientAppId": pkg
    }
    const accessToken = ImportantDetails.giftCardAccessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken);
  }

  this.getGiftCardTransactionHistory = function (fromDate, lastDate, type, accountKey, pageName) {
    let tipo = []
    if (type === "all") {
      tipo = [30, 40]
    } else if (type === "Sent") {
      tipo = [40]
    } else {
      tipo = [30]
    }
    let url = Globals.getArbiUrl("conta/consultar-extrato-completo");



    Log.debug('from date and last date are ' + fromDate + " " + lastDate);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeConta": accountKey,
      "metadados": this.getMetadata(),
      "dataInicio": fromDate,
      "dataFim": lastDate,
      "tiposTransacao": tipo,
      "pagina": 1,
      "porPagina": 50,
      "tipoOrdenacao": 0
    }

    const accessToken = ImportantDetails.giftCardAccessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  // Unblock Account Arbi APIs
  this.getAccountCurrentStatus = function (pageName) {
    const accessToken = ImportantDetails.accessToken;
    const accountNumber = ImportantDetails.accountNumber;
    const formattedAccountNumber = accountNumber.replaceAll("-", "");

    const customUrl = ArbiApiUrls.ACCOUNT_CURRENT_STATUS_URL;
    const api = `${ArbiApiUrls.ACCOUNT_UNBLOCK_PREFIX}/${formattedAccountNumber}/${ArbiApiUrls.ACCOUNT_CURRENT_STATUS_SUFFIX}`;
    const url = Globals.getArbiUrl(api);
    const payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "idContaCorrente": formattedAccountNumber
    };

    Log.sDebug(`Check user account status request: ${JSON.stringify(payloadJson)}`, "ArbiApiService");

    return httpRequest.getRequestToArbiSecure(url, payloadJson, this.isSecure, accessToken, customUrl, 0, pageName, formattedAccountNumber);
  }

  this.unblockUserAccount = function (imageJwtToken, base64Image, pageName) {
    const accessToken = ImportantDetails.accessToken;
    const accountNumber = ImportantDetails.accountNumber;
    const formattedAccountNumber = accountNumber.replaceAll("-", "");

    const customUrl = ArbiApiUrls.ACCOUNT_UNBLOCK_URL;
    const api = `${ArbiApiUrls.ACCOUNT_UNBLOCK_PREFIX}/${formattedAccountNumber}/${ArbiApiUrls.ACCOUNT_UNBLOCK_SUFFIX}`;
    const url = Globals.getArbiUrl(api);
    const payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "idContaCorrente": formattedAccountNumber,
      "imagemJwt": imageJwtToken,
      "imagemBase64": base64Image
    };

    Log.sDebug(`Sending unblocking account request: ${JSON.stringify(payloadJson)}`, "ArbiApiService");

    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName, customUrl);
  }

  this.generateEmailOtp = function (email, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.CHANGE_USER_EMAIL);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": ImportantDetails.clientKey,
      "email": email,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.generatePhoneOtp = function (phoneObj, pageName) {
    let url = Globals.getArbiUrl(ArbiApiUrls.CHANGE_USER_PHONE_NUMBER);
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "chaveDeCliente": ImportantDetails.clientKey,
      "telefone": phoneObj,
      "metadados": this.getMetadata()
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.updatePhoneDetails = function (userObject, pageName) {
    let url = Globals.getArbiUrl("cliente/" + ImportantDetails.clientKey + "/telefone");
    const accessToken = ImportantDetails.accessToken;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "telefone": userObject.profileUpdateData,
      "autenticacao2FA": {
        "tipo": 2,
        "token": userObject["token"],
        "agente": "",
        "faceMatch": userObject["selfieObj"]
      }
    }
    let customUrl = "contas/clientKey/telefone";
    return httpRequest.putRequestToArbi(url, payloadJson, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.updateEmailDetails = function (userObject, pageName) { //here
    let url = Globals.getArbiUrl("cliente/" + ImportantDetails.clientKey + "/email");
    const accessToken = ImportantDetails.accessToken;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "email": userObject.profileUpdateData,
      "autenticacao2FA": {
        "tipo": 3,
        "token": userObject["token"],
        "agente": "",
        "faceMatch": userObject["selfieObj"]
      }
    }
    let customUrl = "contas/clientKey/email";
    return httpRequest.putRequestToArbi(url, payloadJson, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.updateAddressDetails = function (userObject, pageName) {
    let url = Globals.getArbiUrl("cliente/" + ImportantDetails.clientKey + "/endereco-correspondencia");
    const accessToken = ImportantDetails.accessToken;
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "metadados": this.getMetadata(),
      "enderecoCorrespondencia": userObject.profileUpdateData,
      "autenticacao2FA": {
        "tipo": 1,
        "token": userObject["token"],
        "agente": "",
        "faceMatch": userObject["selfieObj"]
      }
    }
    let customUrl = "contas/clientKey/endereco-correspondencia";
    return httpRequest.putRequestToArbi(url, payloadJson, this.isSecure, accessToken, customUrl, 0, pageName);
  }

  this.getOnboardingClient = async () => {
    return new Promise((resolve, reject) => {
        apiService.getOnboardingClientId()
            .then(response => {
                console.log("success", response);
                resolve(response);
            })
            .catch(err => {
                console.error("Error fetching onboarding client ID", err);
                if (err.response) {
                    reject("");
                }
            });
    });
  };

  this.getOnboardingAuthToken = async function () {
      try {
          const clientResponse = await this.getOnboardingClient();
          console.log("Client Response: ", clientResponse);
          const client_id = clientResponse.data.clientId;
          const client_secret = clientResponse.data.clientSecret;

          // if (!client_id || !client_secret) {
          //     throw new Error("Client ID or Client Secret is missing");
          // }

          let url = Globals.getOnboardingUrl("v1/onboarding-dimo/auth/token");
          const qs = require('qs');
          
          const payload = qs.stringify({
              client_id: client_id,
              client_secret: client_secret,
              grant_type: 'client_credentials'
          });

          return httpRequest.postRequestUrlencoded(url, payload);
      } catch (error) {
          console.error("Error in getOnboardingAuthToken", error);
          throw error;
      }
  };

  this.getOnboardingKey = function (cpf, name) {
    let url = Globals.getOnboardingUrl("v1/onboarding-dimo/onboarding");
    const accessToken = ImportantDetails.onboardingAcessToken;
    let payloadJson = {
      "identificacaoFiscal": cpf,
      "apelido": name
    } 
    return httpRequest.postRequestOnboarding(url, payloadJson, accessToken);
  }

  this.getOnboardingStatus = function (cpf) {
    let url = Globals.getOnboardingUrl(`v1/onboarding-dimo/onboarding/identificacao-fiscal/${cpf}/status`);
    let accessToken = ImportantDetails.onboardingAcessToken;
    return httpRequest.getRequestOnboarding(url, accessToken);
  }

  this.registerEmailOnboarding = function (email) {
    let chaveOnboarding = ImportantDetails.chaveOnboarding;
    let url = Globals.getOnboardingUrl(`v1/onboarding-dimo/onboarding/${chaveOnboarding}/email`);
    let accessToken = ImportantDetails.onboardingAcessToken;
    let payloadJson = {
      "email": email
    }
    return httpRequest.patchRequestUrlencoded(url, payloadJson, accessToken);
  }

  this.sendingOTPToken = function (phoneNumber) {
    let chaveOnboarding = ImportantDetails.chaveOnboarding;
    let url = Globals.getOnboardingUrl(`v1/onboarding-dimo/onboarding/${chaveOnboarding}/token`);
    let accessToken = ImportantDetails.onboardingAcessToken;
    let payloadJson = {
      "canal": 1,
      "celular": {
          "ddd": "0" + phoneNumber.ddd,
          "numero": phoneNumber.phoneNumber
      }
    }
    return httpRequest.postRequestOnboarding(url, payloadJson, accessToken);
  }

  this.validateOTPToken = function (otp) {
    let chaveOnboarding = ImportantDetails.chaveOnboarding;
    let url = Globals.getOnboardingUrl(`v1/onboarding-dimo/onboarding/${chaveOnboarding}/token/validar`);
    const accessToken = ImportantDetails.onboardingAcessToken;
    let payloadJson = {
      "token": otp,
      "ipAssinatura": "192.168.20.19"
    }
    return httpRequest.postRequestOnboarding(url, payloadJson, accessToken);
  }

  this.userCreation = function (password, locationFetched, latitude, longitude) {
    let chaveOnboarding = ImportantDetails.chaveOnboarding;
    let url = Globals.getOnboardingUrl(`v1/onboarding-dimo/onboarding/${chaveOnboarding}/usuario`);
    const accessToken = ImportantDetails.onboardingAcessToken;
    const deviceInformation = androidApiCalls.getDeviceInformation();
    let deviceInformationObj = JSON.parse(deviceInformation);
    let payloadJson = 
    {
      "senha": password,
      "dispositivo": {
        "idDispositivo": androidApiCalls.getDeviceId(),
        "modeloDispositivo": deviceInformationObj.deviceInfo.model,
        "nomeDispositivo": "motoedge",
        "latitude": locationFetched? latitude : 0.0000,
        "longitude": locationFetched? longitude : 0.0000,
        "tipoSo": "android",
        "versaoSo": "10"
      }
    }
    return httpRequest.postRequestOnboarding(url, payloadJson, accessToken);
  }

  this.forgotPasswordPhone = function (cpfObj) {
    let url = Globals.getArbiUrl("usuarios/solicitar-reset-senha-por-token-sms");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "identificacaoFiscal": cpfObj.cpf,
      "metadados": this.getMetadata(),
      "organizationUnitId": this.organizationUnitId
    }
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure);
  }

  this.changeForgottenPasswordPhone = function (pinObj, pageName) {
    let url = Globals.getArbiUrl("usuarios/alterar-senha-usuario-por-token");
    let payloadJson = {
      "chaveDeIdempotencia": uuidv4(),
      "identificacaoFiscal": pinObj.cpf,
      "metadados": this.getMetadata(),
      "organizationUnitId": this.organizationUnitId,
      "autenticacao2FA": {
        "tipo": 3,
        "token": pinObj.token
      },
      "novaSenha": pinObj.newPassword,
      "confirmarNovaSenha": pinObj.newPassword
    }
    const accessToken = ImportantDetails.accessToken;
    return httpRequest.postRequestToArbi(url, payloadJson, this.isSecure, accessToken, 0, pageName);
  }

  this.getTerms = function () {
    let url = Globals.getOnboardingUrl("v1/onboarding-dimo/onboarding/termos");
    let accessToken = ImportantDetails.onboardingAcessToken;
    return httpRequest.getRequestOnboarding(url, accessToken);
  }
}

export default new ArbiApiService();
