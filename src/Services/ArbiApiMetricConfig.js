import GeneralUtilities from "./GeneralUtilities";
import ImportantDetails from "../WalletComponents/NewLaunchComponents/ImportantDetails";

const ArbiApiMetricConfig = Object.freeze({
    "usuarios/listar-usuarios-por-identificacao-fiscal": { "apiName": "CPF Validation", "properties": ["pageName"] },
    "usuarios/criar-usuario": { "apiName": "Create user", "properties": ["nome", "ddd", "email", "numero", "identificacaoFiscal", "chaveDeCliente", "pageName"] },
    "app/login": { "apiName": "Authenticate user", "properties": ["pageName"], "processorFunction": returnMetricsForLogin },

    "cliente/confirmacao-email": { "apiName": "Confirm email", "properties": ["pageName"] },
    "cliente/enviar-documento": { "apiName": "Upload doc", "properties": ["tipoDocumento", "pageName"] },
    "cliente/extrair-ocr-documento": { "apiName": "Get OCR details", "properties": ["tipoDocumento", "pageName"], "processorFunction": returnMetricsForOcr },
    "cliente/cadastrar-pessoa-fisica": { "apiName": "Create client", "properties": ["nome", "organizationUnitId", "email", "dataNascimento", "rendaMensal", "cidade", "cep", "sexo", "nacionalidade", "uf", "pageName"],},// "processorFunction": returnMetricsForCreateClient },

    "utilidades/consultar-cep": { "apiName": "Get cep", "properties": ["cep", "pageName"], "processorFunction": returnMetricsForCep },
    "cliente/obter-termo-generico": { "apiName": "Fetch general terms", "properties": ["pageName"] },
    "cliente/obter-declaracao-de-residencia-generica": { "apiName": "Fetch terms of address", "properties": ["pageName"] },
    "cliente/assinar-termo": { "apiName": "Accept generic terms", "properties": ["pageName"] },
    "cliente/assinar-declaracao-de-residencia": { "apiName": "Accept address terms", "properties": ["pageName"] },


    "cliente/verificar-status-cliente": { "apiName": "Verify client status", "properties": ["statusCadastroClienteDescricao", "statusCadastroClienteId", "erros", "pendencias", "pendentesOnboard", "pageName"] },
    "cliente/obter-dados-pessoa-fisica-por-chave": { "apiName": "Obtain client data", "properties": ["emailConfirmado", "pageName"] },

    "conta/consultar-contas": { "apiName": "Get accounts", "properties": ["dataEncerramento", "dataAbertura", "descricaoConta", "chaveDeProduto", "pageName"] },
    "conta/cadastrar-conta": { "apiName": "Create account", "properties": ["tipoContaBancaria", "tipoConta", "dataAbertura", "chaveDeProduto", "chaveDeConta", "idTipoContaBancaria", "idStatusConta", "pageName"] },
    "conta/consultar-extrato-completo": { "apiName": "Get transaction history", "properties": ["dataInicio", "dataFim", "pageName"], "processorFunction": returnMetricsForMainTransactionHistory },
    "comprovante/consultar-comprovantes-por-id-transacao": { "apiName": "Get reciept from transaction id", "properties": ["comprovanteId", "dataOperacao", "autenticacao", "motivoTransacaoId", "motivoTransacao", "pageName"], "processorFunction": returnMetricsForTransactionId },
    "usuarios/alterar-senha-acesso-cliente": { "apiName": "Change password", "properties": ["pageName"] },
    "usuarios/solicitar-alteracao-senha": { "apiName": "forgot password", "properties": ["pageName"] },

    "conta/trocar-pin-conta": { "apiName": "Change pin", "properties": ["pageName"] },
    "token/gerar-2fa-alteracao-pin-conta": { "apiName": "Forgot 2fa pin", "properties": ["pageName"] },
    "conta/alterar-pin-conta-por-token": { "apiName": "forgot pin", "properties": ["pageName"] },

    "conta/consultar-saldo": { "apiName": "Get balance", "properties": ["pageName"], "processorFunction": returnMetricsForBalance },
    "pix/operacao/consultar-extrato": { "apiName": "Get pix transaction history", "properties": ["dataInicio", "dataFim", "pageName"] },

    "pix/enderecamento/cadastrar-chave-identificacao-fiscal": { "apiName": "Create pix key cpf", "properties": ["chaveEnderecamento", "pageName"] },
    "pix/enderecamento/cadastrar-chave-email": { "apiName": "Create pix key email", "properties": ["chaveEnderecamento", "pageName"] },
    "pix/enderecamento/cadastrar-chave-celular": { "apiName": "Create pix key phoneNumber", "properties": ["chaveEnderecamento", "pageName"] },
    "pix/enderecamento/cadastrar-chave-evp": { "apiName": "Create pix key evp", "properties": ["chaveEnderecamento", "pageName"] },

    "pix/operacao/enviar-ordem-pagamento-por-chave": { "apiName": "Pix transfer for key", "properties": ["data", "valorOperacao", "statusOrdem", "infoOrdemPagamento", "idTransacao", "codInstituicaoBeneficiario", "nomeInstituicaoBeneficiario", "agenciaBeneficiario", "idComprovante", "pageName", "endToEnd"] },
    "pix/operacao/enviar-ordem-pagamento-por-agencia": { "apiName": "Pix transfer for account", "properties": ["data", "valorOperacao", "statusOrdem", "infoOrdemPagamento", "idTransacao", "codInstituicaoBeneficiario", "nomeInstituicaoBeneficiario", "agenciaBeneficiario", "tipoContaBeneficiario", "idComprovante", "pageName", "endToEnd"] },
    "pix/operacao/enviar-ordem-pagamento-por-qrcode": { "apiName": "Pix transfer for QRCode", "properties": ["data", "valorOperacao", "statusOrdem", "infoOrdemPagamento", "idTransacao", "codInstituicaoBeneficiario", "nomeInstituicaoBeneficiario", "agenciaBeneficiario", "idComprovante", "pageName", "endToEnd", "valorSaqueTroco", "prestadorDoServicoDeSaque"] },
    "pix/qrcode/processar-qrcode": { "apiName": "Pix details QRCode", "properties": ["data", "valorOperacao", "tipoQRCode", "codInstituicaoBeneficiario", "nomeInstituicaoBeneficiario", "agenciaBeneficiario", "tipoContaBeneficiario", "tipoChaveBeneficiario", "indRecebivelAposVencimento", "pageName"] },
    "pix/operacao/enviar-ordem-devolucao": { "apiName": "Pix return", "properties": ["statusOrdem", "infoOrdemPagamento", "idTransacao", "infoOrdemPagamento", "idComprovante", "pageName", "endToEnd"] },

    "pix/enderecamento/consultar-dados-por-chave": { "apiName": "Get pix key details", "properties": ["pageName"] },
    "pix/enderecamento/consultar-chaves": { "apiName": "Get all pix keys", "properties": ["pageName"], "processorFunction": metricsForGetAllPixKeys },
    "pix/enderecamento/excluir-chave": { "apiName": "Delete pix keys", "properties": ["tipoPix", "pageName"] },

    "pix/reivindicacao/reivindicar-email": { "apiName": "Claim email api", "properties": ["tipoReivindicacao", "pageName"] },
    "pix/reivindicacao/reivindicar-celular": { "apiName": "Claim phone number api", "properties": ["tipoReivindicacao", "pageName"] },
    "pix/reivindicacao/reivindicar-identificacao-fiscal": { "apiName": "Claim cpf api", "properties": ["pageName"] },

    "pix/reivindicacao/concluir": { "apiName": "Pix conclude api", "properties": ["claimId", "pageName"] },
    "pix/reivindicacao/cancelar": { "apiName": "Pix cancel api", "properties": ["claimId", "pageName"] },
    "pix/reivindicacao/confirmar": { "apiName": "Pix confirm api", "properties": ["claimId", "pageName"] },

    "pix/reivindicacao/consultar-reinvidicacoes": { "apiName": "Pix consult claim", "properties": ["pageName"] },

    "autenticar/desconectar": { "apiName": "Log out", "properties": ["pageName"] },
    "token/gerar-2fa-cancelamento-de-conta-multipla": { "apiName": "Send token to cancel account", "properties": ["pageName"] },
    "conta/cancelar-conta": { "apiName": "Cancel account", "properties": ["contaEncerradaBanco", "statusEncerramento", "pageName"], "processorFunction": returnMetricsForCancelAccount },

    "cartao/consultar-cartoes-por-chave-conta": { "apiName": "List cards", "properties": ["descricaoStatusExecucao", "mensagem", "totalCount", "chaveDeConta", "pageName"], "processorFunction": returnMetricsForGetAllCards },
    "cartao/obter-cartao-completo-por-chave-cartao": { "apiName": "Get hash for IFrame", "properties": ["chaveDoCartao", "pageName"] },
    "cartao/solicitar-cartao-fisico": { "apiName": "Request first physical card", "properties": ["chaveDeCartao", "descricaoStatusCartao", "idStatusCartao", "fisico", "categoria", "bandeiraNome", "pageName"] },
    "cartao/desbloquear-cartao-emissao-sync-senha-conta": { "apiName": "Unblock new card", "properties": ["chaveDeCartao", "descricaoStatusCartao", "idStatusCartao", "pageName"] },

    "cartao/bloquear-cartao-pedido-cliente": { "apiName": "Block card", "properties": ["chaveDeCartao", "descricaoStatusCartao", "idStatusCartao", "descricaoStatusExecucao", "mensagem", "data", "pageName"] },
    "cartao/desbloquear-cartao-pedido-cliente": { "apiName": "Unblock card", "properties": ["chaveDeCartao", "descricaoStatusCartao", "idStatusCartao", "descricaoStatusExecucao", "mensagem", "data", "pageName"] },

    "cartao/bloquear-cartao-danificado": { "apiName": "Cancel damaged card", "properties": ["chaveDeCartao", "descricaoStatusCartao", "idStatusCartao", "descricaoStatusExecucao", "pageName"] },
    "cartao/bloquear-cartao-roubo": { "apiName": "Cancel stoen card", "properties": ["chaveDeCartao", "descricaoStatusCartao", "idStatusCartao", "descricaoStatusExecucao", "pageName"] },
    "cartao/bloquear-cartao-perda": { "apiName": "Cancel lost card", "properties": ["chaveDeCartao", "descricaoStatusCartao", "idStatusCartao", "descricaoStatusExecucao", "pageName"] },

    "cartao/solicitar-segunda-via-cartao-fisico": { "apiName": "Request second card", "properties": ["chaveDeCartao", "descricaoStatusCartao", "idStatusCartao", "fisico", "motivo", "bandeiraNome", "pageName"] },
    "conta/migracao-de-produtos": { "apiName": "Migrate to visa card", "properties": ["chaveDeProdutoNovo", "mensagem", "chaveDeConta", "pageName"] },
    "conta/obter-dados-conta": { "apiName": "Permission to migrate to visa card", "properties": ["precisaMigracao", "mensagem", "chaveDeConta", "pageName"] },
    "cartao/solicitar-cartao-virtual": { "apiName": "Request new virtual card", "properties": ["chaveDeConta", "chaveDeCartaoidStatusCartao", "descricaoStatusCartao", "bandeira", "bandeiraNome", "data", "fisico", "categoria", "chaveDeCartao", "pageName"] },
    "cartao/consultar-cartoes-disponiveis-para-conta": { "apiName": "List card category", "properties": ["descricaoStatusExecucao", "mensagem", "chaveDeConta", "pageName"], "processorFunction": returnMetricsForGetCardCategory },

    "transferencias/efetuar-transferencia-entre-contas-arbi": { "apiName": "Transfer internal", "properties": ["valor", "dataCriacao", "dataEfetivacao", "statusTransferencia", "idComprovante", "pageName"], "processorFunction": returnMetricsForInternalTransfer },
    "transferencias/efetuar-ted": { "apiName": "TED transfer", "properties": ["valor", "dataCriacao", "dataEfetivacao", "statusTransferencia", "banco", "bancoNome", "agencia", "tipoConta", "idComprovante", "pageName"], "processorFunction": returnMetricsForTedTransfer },
    "deposito/solicitar-boleto-para-deposito": { "apiName": "Create boleto", "properties": ["valorNominal", "valorTarifa", "valorTotal", "dataEmissao", "dataVencimento", "dataFinalizado", "statusBoletoDescricao", "statusBoletoId", "pageName"] },
    "saque/solicitar-saque-atm": { "apiName": "ATM withdraw", "properties": ["valor", "valorQRCode", "idComprovante", "idTransacao", "pageName"] },

    "recarga/consultar-provedores-celular": { "apiName": "Get recharge providers", "properties": ["ddd", "pageName"], "processorFunction": returnMetricsForGetRechargeProviders },
    "recarga/consultar-valores": { "apiName": "Get recharge values", "properties": ["ddd", "provedorId", "pageName"], "processorFunction": returnMetricsForGetRechargeValues },
    "recarga/recarregar-celular": { "apiName": "Recharge cellular", "properties": ["ddd", "provedorId", "valor", "provedor", "idComprovante", "idTransacao", "pageName"] },

    "pagamento/validar-boleto": { "apiName": "Get boleto details", "properties": ["pageName"], "processorFunction": returnMetricsForFetchBoletoDetails },
    "pagamento/pagar-boleto": { "apiName": "Pay boleto", "properties": ["valorPago", "statusPagamento", "idComprovante", "pageName"], "processorFunction": returnMetricsForPayBoletoDetails },

    "limites-tarifas/consultar-tarifa-operacao": { "apiName": "Get tariffs", "properties": ["motivoTransacao", "valorTransacao", "pageName"], "processorFunction": returnMetricsForGetTariffs },

    "MOTOPAY CUSTOM LOGIN EVENT": { "apiName": "Dimo custom login event", "properties": ["isFpSet", "sessionId", "loggedInViaFp", "latitude", "longitude", "pageName"] },

    "pix/operacao/efetuar-agendamento-pix-chave": { "apiName": "Pix schedule transfer key", "properties": ["valorOperacao", "recorrencia", "dataPagamento", "horaPagamento", "pageName"], "processorFunction": returnMetricsForScheduleTransferKey },

    "pix/operacao/cancelar-agendamento-pix": { "apiName": "Pix schedule cancel", "properties": ["dataDeCancelamento", "statusId", "statusDescricao", "pageName"], "processorFunction": returnMetricsForCancelSchedule },

    "pix/operacao/consultar-agendamento-pix": { "apiName": "Pix schedule transaction history", "properties": ["dataInicial", "status", "dataFinal", "pagina", "porPagina", "qtdPaginas", "qtdPorPagina", "pageName"] },

    "pix/operacao/alterar-agendamento-pix-chave": { "apiName": "Pix schedule edit key", "properties": ["valor", "dataPagamento", "horaPagamento", "dataAgendamento", "idAgendamento", "statusId", "statusDescricao", "numeroDeOcorrencias", "pageName"] },

    "transferencias/efetuar-agendamento-ted": { "apiName": "TED schedule external", "properties": ["pageName"], "processorFunction": returnMetricsForTedExternalTransfer },

    "transferencias/alterar-agendamento-ted": { "apiName": "TED schedule external edit", "properties": ["novoValor", "idAgendamento", "dataAlterada", "pageName"] },

    "transferencias/excluir-agendamento-ted": { "apiName": "TED schedule external cancel", "properties": ["descricaoStatusExecucao", "pageName"], "processorFunction": returnMetricsForCancelSchedule },

    "transferencias/efetuar-agendamento-transferencia-entre-contas-arbi": { "apiName": "TED schedule internal", "properties": ["pageName"], "processorFunction": returnMetricsForTedInternalTransfer },

    "transferencias/alterar-agendamento-transferencia-interna": { "apiName": "TED schedule internal edit", "properties": ["mensagem", "idAgendamento", "dataAgendamento", "valor", "pageName"] },

    "transferencias/cancelar-agendamento-transferencia-interna": { "apiName": "TED schedule internal cancel", "properties": ["dataDeCancelamento", "statusDescricao", "pageName"], "processorFunction": returnMetricsForCancelScheduled },

    "pagamento/efetuar-agendamento-boleto": { "apiName": "Boleto schedule payment", "properties": ["idAgendamento", "dataPagamento", "pageName"] },

    "pagamento/cancelar-agendamento-boleto": { "apiName": "Boleto schedule cancel", "properties": ["dataDeCancelamento", "statusDescricao", "pageName"], "processorFunction": returnMetricsForCancelScheduled },

    "pagamento/alterar-agendamento-boleto": { "apiName": "Boleto schedule edit", "properties": ["idAgendamento", "dataPagamento", "pageName"] },

    "conta/consultar-lancamentos-futuros": { "apiName": "Get all scheduled transactions", "properties": ["dataDe", "dataAte", "tiposAgendamento", "tipoOrdenacao", "pageName"], "processorFunction": returnMetricsForScheduledTransactionHistory },

    "transferencias/obter-agendamento-transferencia-interna": { "apiName": "TED schedule transaction details internal", "properties": ["idAgendamento", "dataAgendamento", "valor", "dataUltimaAlteracao", "pageName"] },

    "transferencias/obter-agendamento-ted": { "apiName": "TED schedule transaction details external", "properties": ["idAgendamento", "dataAgendamento", "numeroRecorrencias", "valor", "dataUltimaAlteracao", "pageName"] },

    "pagamento/obter-agendamento-boleto": { "apiName": "Boleto schedule transaction details", "properties": ["idAgendamento", "dataAgendamento", "valor", "pageName"] },

    "pix/operacao/obter-agendamento-pix": { "apiName": "Pix schedule transaction details", "properties": ["idAgendamento", "dataAgendamento", "numeroDeOcorrencias", "valor", "pageName"] },

    "onboarding/verificar-possui-vagas": { "apiName": "Check for vacancy", "properties": ["organizationUnitId", "possuiVagas", "pageName"] },

    "onboarding/cadastrar-cliente-fila": { "apiName": "Register for waitlist", "properties": ["organizationUnitId", "mensagemAmigavel", "numeroDiasRestantesFila", "statusFilaOnboard", "chaveDeFilaOnboarding", "posicaoFilaOnboard", "pageName"] },

    "onboarding/obter-posicao-fila": { "apiName": "Check waitlist status", "properties": ["organizationUnitId", "mensagemAmigavel", "numeroDiasRestantesFila", "statusFilaOnboard", "chaveDeFilaOnboarding", "posicaoFilaOnboard", "pageName"] },

    "favorito/consultar-favoritos": { "apiName": "Fetch all contacts", "properties": ["tipoOrdenacao", "filtroNomeApelido", "qtdPaginas", "qtdPorPagina", "totalItems", "pagina", "pageName"], "processorFunction": returnMetricsForFetchAllContacts },

    "favorito/cadastrar-favorito": { "apiName": "Register contact", "properties": ["pageName"], "processorFunction": returnMetricsForRegisteringContact },

    "favorito/consultar-chaves-favorito": { "apiName": "Get contact details", "properties": ["favoritoId", "tipoChaveFiltro", "pagina", "porPagina", "pageName"], "processorFunction": returnMetricsForGettingContactDetails },

    "favorito/excluir-chave-favorito": { "apiName": "Delete contact key", "properties": ["favoritoId", "chaveFavoritoId", "pageName"] },

    "favorito/atualizar-favorito": { "apiName": "Edit contact detail", "properties": ["favoritoId", "favoritoChaveId", "pageName"], "processorFunction": returnMetricsForEditingContact },

    "portabilidade-salarial/solicitar": { "apiName": "Request Salary Portability", "properties": ["identificacaoFiscalEmpresaOrigem", "razaoSocialEmpresaOrigem", "codigoBancoOrigem", "chaveDePortabilidade", "protocoloPortabilidade", "pageName"] },
    "portabilidade-salarial/listar": {
        "apiName": "List portability requests", "properties": ["identificacaoFiscalEmpresaOrigem", "razaoSocialEmpresaOrigem", "codigoBancoOrigem", "nomeBancoOrigem", "dataCriacao", "dataCancelamento", "dataAtualizacao", "pageName",
            "situacaoPortabilidade", "situacaoPortabilidadeCip", "motivoCancelamento", "chaveDePortabilidade", "complementoMotivoCancelamento"]
    },
    "portabilidade-salarial/cancelar": { "apiName": "Cancel portability requests", "properties": ["mensagem", "chaveDePortabilidade", "motivoCancelamento", "complementoMotivoCancelamento", "pageName"] },

    "dimoqrcode/validar": { "apiName": "Validate dimo QR code", "properties": ["qrCode", "nomeComerciante", "pagamentoId", "valor", "qrStatusValidacao", "pageName"] },
    "dimoqrcode/efetuar-pagamento": { "apiName": "Pay dimo QR code", "properties": ["qrCode", "mensagem", "data", "transacaoId", "pageName"] },

    "produto/consultar-produtos-disponiveis-cliente": { "apiName": "Fetch product key", "properties": ["data", "mensagem", "pageName"], "processorFunction": returnProductKey },
    "carteira-digital/opaque-card-info": { "apiName": "Get OPC", "properties": ["chaveDeCartao", "mensagem", "data", "pageName"] },

    "antecipacao/fgts/simulacao-autorizadora": { "apiName": "FGTS Anticipation", "properties": ["valorSolicitado", "taxaContratoAnual", "taxaContratoMensal", "liberado", "totalRecebiveis", "prazo", "taxaIofAnual", "taxaIofComp", "valorMinimoLiberado", "valorMaximoLiberado", "pageName"], "processorFunction": returnMetricsForFgtsInstallments },
    "antecipacao/fgts/termo": { "apiName": "Fetch FGTS terms", "properties": ["pageName"] },
    "conta/AccountKey/antecipacao/fgts/proposta": { "apiName": "Fetch FGTS Proposal Id", "properties": ["valorSolicitado", "codigoProposta", "pageName"] },
    "antecipacao/fgts/termo/contractId": { "apiName": "Fetch signed FGTS contract", "properties": ["pageName"] },
    "fgts/Proposta/proposalId/faceauth/faceAuthId/contrato": {
        "apiName": "Sign FGTS contract", "properties": ["contratoId", "codigoContrato", "localizador", "valorLiberado", "taxaCetMes", "taxaCetAno", "taxaIof", "taxaIofComplementar", "prazo", "valorIof", "valorTarifas",
            "valorRecebivel", "taxaContrato", "taxaIrr", "taxaMulta", "valorJuros", "valorSeguro", "valorSolicitacao", "liberado", "totalRecebiveis", "taxaContratoAnual", "pageName", "id",
            "taxaContratoMensal", "saldoDevedor", "valorFinanciado", "financeiraValorPagar", "prazoDeOperacao", "ultimoVencimento", "primeiroVencimento", "propostaId", "faceAuthId"]
    },
    "antecipacao/fgts/contratos": { "apiName": "Fetch all FGTS contracts", "properties": ["Ordenacao", "Pagina", "porPagina", "qtdPaginas", "qtdPorPagina", "totalItems", "pageName"], "processorFunction": returnMetricsForFgtsContracts },
    "clientes/clientKey/faceauth": { "apiName": "Fetch FGTS face auth id", "properties": ["faceAuthId", "pageName"] },

    "financiamento/mobile/contas/chaveDeConta": { "apiName": "List financing contracts", "properties": ["pageName"], "processorFunction": returnMetricsForListContracts },
    "financiamento/mobile/contas/key/contratos/contractId": {
        "apiName": "List contract details", "properties": ["dataFinanciamento", "valorTotalFinanciado", "valorEmAberto", "valorPago", "valorRecebivel", "numeroDeParcelas",
            "numeroDeParcelasPagas", "primeiroVencimento", "ultimoVencimento", "dataProximoVencimento", "idContrato", "emAtraso", "modelo", "pageName"]
    },
    "financiamento/mobile/contas/accountKey/contratos/contractoId/parcelas": { "apiName": "List installment details", "properties": ["pageName"], "processorFunction": processInstallmentDetails },
    "cliente/clientKey/arquivo": { "apiName": "Upload doc via CAF", "properties": ["tipoDocumento", "pageName"] },

    // Credit Card Onboarding APIs
    "cartao-garantia/contratacao/situacao": { "apiName": "Get credit onboarding status", "properties": ["statusCadastro", "pageName"] },
    "cartao-garantia/produto-investimento": { "apiName": "Get credit investment info", "properties": ["dataFim", "liquidez", "investimentoMaximo", "investimentoMinimo", "percentualDoIndice", "data", "detalhesErro", "indice", "pageName"] },
    "cartao-garantia/contratos": { "apiName": "Fetch credit contract", "properties": ["contractId", "data", "detalhesErro", "pageName"] },
    "cartao-garantia/contrato-corrente": { "apiName": "Get credit contract", "properties": ["contractId", "data", "detalhesErro", "pageName"] },
    "cartao-garantia/configuracao": { "apiName": "Configure credit investment", "properties": ["debitoAutomatico", "diaVencimentoFatura", "valor", "data", "pageName"] },
    "cartao-garantia/contrato-corrente/assinatura": { "apiName": "Sign credit contract", "properties": ["contratoid", "data", "detalhesErro", "pageName"] },

    // Credit Card Home Page
    "contas/accountKey/cartao-garantia/informacoes-uso": { "apiName": "Credit card home page", "properties": ["statusFatura", "limiteUtilizado", "limiteDisponivel", "dataVencimento", "limiteTotal", "debitoAutomatico", "valor", "detalhesErro", "faturaId", "statusResgate", "debitoAutomatico", "pageName"] },

    // Credit Card Invest/Redeem APIs
    "cartao-garantia/posicao": { "apiName": "Get credit investment details", "properties": ["valorInvestido", "rendimentoTotal", "saldoDisponivelResgate", "limiteCreditoAtual", "dataInicioInvestimento", "dataFimInvestimento", "posicaoBruta", "tributos", "valorCreditoClean", "pageName"] },
    "cartao-garantia/simulacao-resgate": { "apiName": "Simulate redeem investment", "properties": ["valor", "saldoTotalInvestido", "rendimentos", "limiteCredito", "saldoInvestidoPosResgate", "limiteCreditoPosResgate", "saldoResgate", "pageName"] },
    "cartao-garantia/contrato-corrente/aditivo": { "apiName": "Simulate invest more", "properties": ["valor", "pageName"] },
    "cartao-garantia/solicitar-resgate": { "apiName": "Sign redeem investment", "properties": ["valorResgate", "pageName"] },
    "cartao-garantia/contrato-corrente/aditivo/assinatura": { "apiName": "Sign invest more", "properties": ["pageName"] },

    // Credit Card Transaction History
    "cartao-garantia/extrato": { "apiName": "Credit card transaction history", "properties": ["qtdPaginas", "totalItems", "qtdPorPagina", "transacoes", "detalhesErro", "dataInicio", "dataFim", "tipoOrdenacao", "pagina", "porPagina", "pageName"] },

    // Credit Card Invoice History
    "cartao-garantia/faturas": { "apiName": "Credit card invoice history", "properties": ["items", "detalhesErro", "pageName"] },

    // Credit Card Settings APIs
    "cartao/obter-configuracoes": { "apiName": "Credit card settings page", "properties": ["dataVencimentoFatura", "debitoAutomatico", "permiteContactless", "chaveDeCartao", "valor", "data", "pageName"] },
    "contas/accountKey/cartao-garantia/data-vencimento": { "apiName": "Credit card settings change invoice due date", "properties": ["dueDate", "diaVencimentoFatura", "detalhesErro", "pageName"] },
    "cartao/configurar-contactless": { "apiName": "Credit card CHANGE contactless settings", "properties": ["contactless", "permiteContactless", "chaveDeCartao", "pageName"] },
    "contas/accountKey/cartao-garantia/debito-automatico": { "apiName": "Credit card settings automatic debit", "properties": ["debitoAutomatico", "pageName"] },

    // Credit Card Invoice details and payment APIs
    "contas/accountKey/cartao-garantia/faturas/invoiceId/detalhes": { "apiName": "Credit card invoice details", "properties": ["statusFatura", "dataVencimento", "dataPagamento", "totalNacional", "totalInternacional", "taxasTotais", "saldoPendente", "creditoAnterior", "pagamentoMinimo", "valorFatura", "items", "pageName"] },
    "contas/accountKey/cartao-garantia/faturas/invoiceId/qr-code-pix": { "apiName": "Credit card invoice payment via Pix", "properties": ["data", "codigoCopiaCola", "arquivo", "pageName"] },
    "contas/accountKey/cartao-garantia/faturas/invoiceId/boleto": { "apiName": "Credit card card invoice payment via boleto", "properties": ["dataVencimento", "arquivo", "linhaDigitavel", "pageName"] },
    "contas/accountKey/cartao-garantia/faturas/invoiceId/debito-conta": { "apiName": "Credit card card invoice payment via direct payment", "properties": ["data", "valor", "pageName"] },

    //Gift Card
    "gc-clientes/gc-cartao-presente/cadastrar": { "apiName": "Create gift card account", "properties": ["gc_chaveDeCliente", "unidadeOrganizacionalId", "identificacaoFiscal", "nome", "dataNascimento", "nomeMae", "ddd", "numero", "email", "pageName"] },
    "cliente/gc-verificar-status-cliente": { "apiName": "Verify gift card creation status", "properties": ["gc_chaveDeCliente", "statusCadastroClienteDescricao", "statusCadastroClienteId", "pendencias", "erros", "pendentesOnboard", "codigoCopiaCola", "arquivo", "pageName"] },
    "tesouraria/cartao-presente/creditar-conta-cliente": { "apiName": "Load money to gift card", "properties": ["gc_chaveDeCliente", "gc_chaveDeConta", "chaveDeContaTesouraria", "valor", "pageName"] },
    "carteira-digital/listar-tokens-visa": { "apiName": "List tokens", "properties": ["gc_chaveDeCliente", "gc_chaveDeConta", "gc_chaveDeCartao", "panReferenceId", "tokenReferenceId", "tokenRequestorId", "clientWalletAccountId", "tokenType", "tokenStatus", "pageName"] },

    // Unblock Account
    "gestao-contas/conta-corrente/idContaCorrente/status": { "apiName": "Account current status", "properties": ["idContaCorrente", "pageName"] },
    "gestao-contas/conta-corrente/idContaCorrente/desbloquear": { "apiName": "Unblock account", "properties": ["idContaCorrente", "pageName"], "processorFunction": returnMetricsForUnblockAccount },

    // Profile detail changes
    "token/gerar-2fa-alteracao-celular": { "apiName": "Generate cellular token", "properties": ["mensagem", "pageName"] },
    "token/gerar-2fa-alteracao-email": { "apiName": "Generate email token", "properties": ["mensagem", "pageName"] },
    "contas/clientKey/telefone": { "apiName": "Modify phone number", "properties": ["mensagem", "pageName"],  "processorFunction": returnMetricsForTelephone},
    "contas/clientKey/email": { "apiName": "Modify email address", "properties": ["email", "mensagem", "pageName"] },
    "contas/clientKey/endereco-correspondencia": { "apiName": "Modify mailing address", "properties": ["pageName"], "processorFunction": returnMetricsForChangeAddress },
});

function returnMetricsForUnblockAccount(request, response) {
    const { imagemJwt, imagemBase64 } = request;

    return {
        "imagemJwt": GeneralUtilities.isNotEmpty(imagemJwt) ? imagemJwt.slice(0, 50) : null,
        "imagemBase64": GeneralUtilities.isNotEmpty(imagemBase64) ? imagemBase64.slice(0, 50) : null,
    };
}

function returnMetricsForFetchBoletoDetails(request, response) {
    let metrics = {
        "valor": response.valor,
        "valorTotal": response.valorAtualizado,
        "totalDesconto": response.totalDesconto,
        "juros": response.juros,
        "multa": response.multa,
        "totalJurosMulta": response.totalJurosMulta,
        "dataVencimento": response.dataVencimento,
        "nomeBeneficiario": response.nomeBeneficiario,
        "nomePagador": response.nomePagador,
        "cedente": response.cedente,
        "liquidacaoProximoDiaUtil": response.liquidacaoProximoDiaUtil,
        "permiteAlterarValor": response.permiteAlterarValor,
        "horarioInicioPagamento": response.horarioInicioPagamento,
        "horarioLimitePagamento": response.horarioLimitePagamento,
    }
    ImportantDetails.lastBoletoFetchedDetails = metrics;
    return metrics;
}

function returnMetricsForPayBoletoDetails(request, response) {
    let metrics = {
        "idTransacao": response.idTransacao
    }
    return { ...metrics, ...ImportantDetails.lastBoletoFetchedDetails };
}

function returnMetricsForGetAllCards(request, response) {
    let cardArray = [];
    if (response.items) {
        response.items.forEach((card) => {
            cardArray.push({
                "chaveDeCartao": card.chaveDeCartao,
                "descricaoStatusCartao": card.descricaoStatusCartao,
                "idStatusCartao": card.idStatusCartao,
                "fisico": card.fisico,
                "bandeira": card.bandeira,
                "bandeiraNome": card.bandeiraNome
            });
        });
    }
    return { "cardDetails": JSON.stringify(cardArray) }
}

function returnMetricsForChangeAddress(request, response) {
    let jsonObj = request.enderecoCorrespondencia;
    let metrics = {
        'street': jsonObj.rua,
        'neighbourhood': jsonObj.bairro,
        'cep': jsonObj.cep,
        'cidade': jsonObj.cidade,
        'uf': jsonObj.uf,
        'message': response.mensagem
    };
    return metrics;
}

function returnMetricsForTelephone(request, response) {
    return { "ddd": request.telefone.ddd, "numero": request.telefone.numero }
}

function returnMetricsForGetCardCategory(request, response) {
    let cardArray = [];
    if (response.cartoesDoProduto) {
        response.cartoesDoProduto.forEach((card) => {
            cardArray.push({
                "descricao": card.descricao,
                "categoria": card.categoria,
                "fisico": card.fisico,
                "bandeira": card.bandeira,
                "bandeiraNome": card.bandeiraNome
            });
        });
    }
    return { "cardDetails": JSON.stringify(cardArray) }
}

function returnMetricsForBalance(request, response) {
    return { "balance": response.saldo }
}

function returnMetricsForOcr(request, response) {
    return { "noOfOcrProps": response.dadosOcr ? Object.keys(response.dadosOcr).length : 0 }
}

function returnMetricsForCep(request, response) {
    let metrics = {
        'street': response.logradouro,
        'neighbourhood': response.bairro,
        'complement': response.complemento,
        'city': response.localidade,
        'uf': response.uf
    };
    return metrics;
}

function returnMetricsForLogin(request) {
    let json = {};
    if (request && request.metadados && request.metadados !== "") {
        request.metadados.forEach((metadata) => {
            if (metadata.tipoMetadado === 8) {
                json["latitude"] = metadata.valor;
            } else if (metadata.tipoMetadado === 9) {
                json["longitude"] = metadata.valor;
            } else if (metadata.tipoMetadado === 1) {
                json["barcode"] = metadata.valor;
            } else if (metadata.tipoMetadado === 2) {
                json["model"] = metadata.valor;
            }
        });
    }
    return json;
}

// function returnMetricsForCreateClient(request) {
//     return { "telefoneFixo": JSON.stringify(request.telefoneFixo), "ddd": request.telefoneMovel.ddd, "numero": request.telefoneMovel.numero }
// }

function metricsForGetAllPixKeys(request, response) {
    if (!response.chaves) {
        return {};
    }
    let createdArray = [];
    let typeOfKey = [];
    response.chaves.forEach((chave) => {
        createdArray.push(chave.dataCriacao);
        typeOfKey.push(chave.tipoChave)
    });
    return { "dataCriacao": JSON.stringify(createdArray) }
}

function returnMetricsForInternalTransfer(request, response) {
    return { "idTransacao": response.identificacaoTransacao }
}

function returnMetricsForTedTransfer(request, response) {
    return { "idTransacao": response.identificacaoTransacao }
}

function returnMetricsForGetRechargeProviders(request, response) {
    if (!response.provedores) {
        return {}
    }
    return { "NoOfProvedores": response.provedores.length }
}

function returnMetricsForGetRechargeValues(request, response) {
    if (!response.valores) {
        return {}
    }
    return { "NoOfValores": response.valores.length }
}

function returnMetricsForGetTariffs(request, response) {
    return { "tarifasOperacao": JSON.stringify(response.tarifasOperacao) }
}

function returnMetricsForScheduleTransferKey(request, response) {
    let scheduleArray = [];
    if (response.pixAgendado) {
        response.pixAgendado.forEach((schedule) => {
            scheduleArray.push({
                "idAgendamento": schedule.idAgendamento,
                "numeroDeOcorrencias": schedule.numeroDeOcorrencias,
                "statusDescricao": schedule.statusDescricao,
                "valor": schedule.valor,
                "agenciaBeneficiario": schedule.agenciaBeneficiario,
                "codInstituicaoBeneficiario": schedule.codInstituicaoBeneficiario,
                "nomeInstituicaoBeneficiario": schedule.nomeInstituicaoBeneficiario
            });
        });
    }
    return { "pixAgendado": JSON.stringify(scheduleArray) }
}

function returnMetricsForCancelSchedule(request) {
    return ({ "listaIdAgendamento": request.listaIdAgendamento.join("") });
}

function returnMetricsForCancelScheduled(request) {
    return ({ "idAgendamentos": request.idAgendamentos.join("") });
}

function returnMetricsForTedInternalTransfer(request, response) {
    let scheduleArray = [];
    if (response.agendamentos) {
        response.agendamentos.forEach((schedule) => {
            scheduleArray.push({
                "idAgendamento": schedule.idAgendamento,
                "ocorrencia": schedule.ocorrencia,
                "dataAgendamento": schedule.dataAgendamento
            });
        });
    }
    return { "agendamentos": JSON.stringify(scheduleArray) }
}

function returnMetricsForTedExternalTransfer(request, response) {
    let scheduleArray = [];
    if (response.items) {
        response.items.forEach((schedule) => {
            scheduleArray.push({
                "idAgendamento": schedule.idAgendamento,
                "ocorrencia": schedule.ocorrencia,
                "dataAgendamento": schedule.dataAgendamento
            });
        });
    }
    return { "agendamentos": JSON.stringify(scheduleArray) }
}

function returnMetricsForMainTransactionHistory(request, response) {
    let txnArray = [];
    if (response.items) {
        response.items.forEach((txn) => {
            txnArray.push({
                "transacaoId": txn.transacaoId,
                "descricaoTipoTransacao": txn.descricaoTipoTransacao,
                "dataAgendamento": txn.dataHoraTransacao,
                "valorBRL": txn.valorBRL
            });
            return { "items": JSON.stringify(txnArray), "tiposTransacao": JSON.stringify(request.tiposTransacao) }
        });
    }
}

function returnMetricsForTransactionId(request, response) {
    let metrics = {
        'value': response.dadosComprovante.valor,
        'internalTransactionId': response.dadosComprovante.transacaoId,
        'typeOfOperation': response.dadosComprovante.tipoOperacao,
        'identificacaoFiscalPagador': response.dadosComprovante.identificacaoFiscalPagador,
        'bancoDebito': response.dadosComprovante.bancoDebito,
        'bancoDebitoDescricao': response.dadosComprovante.bancoDebitoDescricao,
        'agenciaDebito': response.dadosComprovante.agenciaDebito,
        'contaDebito': response.dadosComprovante.contaDebito,
        'tarifa': response.dadosComprovante.tarifa,
        'bancoDestino': response.dadosComprovante.bancoDestino,
        'bancoDestinoDescricao': response.dadosComprovante.bancoDestinoDescricao,
        'instituicaoDestino': response.dadosComprovante.instituicaoDestino,
        'agenciaDestino': response.dadosComprovante.agenciaDestino,
        'contaDestino': response.dadosComprovante.contaDestino,
        'chavePixDestino': response.dadosComprovante.chavePixDestino,
        'endToEndPix': response.dadosComprovante.endToEndPix,
        'endToEnd': response.dadosComprovante.endToEnd,
        'descricaoPix': response.dadosComprovante.descricaoPix,
        'linhaDigitavelBoleto': response.dadosComprovante.linhaDigitavelBoleto,
        'dataVencimentoBoleto': response.dadosComprovante.dataVencimentoBoleto,
        'operadoraRecarga': response.dadosComprovante.operadoraRecarga,
        'operadoraRecargaDescricao': response.dadosComprovante.operadoraRecargaDescricao,
        'ddiRecarga': response.dadosComprovante.ddiRecarga,
        'numeroRecarga': response.dadosComprovante.numeroRecarga,
        'identificadorSaque': response.dadosComprovante.identificadorSaque
    };
    return metrics;
}

function returnMetricsForScheduledTransactionHistory(request, response) {
    let txnArray = [];
    if (response.items) {
        response.items.forEach((txn) => {
            txnArray.push({
                "idAgendamento": txn.idAgendamento,
                "tipoAgendamentoEnum": txn.tipoAgendamentoEnum,
                "dataAgendamento": txn.dataAgendamento,
                "valor": txn.valor
            });
            return { "items": JSON.stringify(txnArray), "tiposTransacao": JSON.stringify(request.tiposTransacao) }
        });
    }
}

function returnMetricsForFetchAllContacts(request, response) {
    let contactArray = [];
    if (response.items) {
        response.items.forEach((contact) => {
            contactArray.push({
                "favoritoId": contact.favoritoId,
            });
        });
        return { "items": JSON.stringify(contactArray) }
    } else {
        return { "items": "" }
    }
}

function returnMetricsForRegisteringContact(request) {
    let contactArray = {
        "agencia": request.chaves.agencia,
        "tipoDeConta": request.chaves.tipoDeConta,
        "codigoOuISPB": request.chaves.codigoOuISPB,
        "tipoChavePix": request.chaves.tipoChavePix
    }
    return { "chaves": JSON.stringify(contactArray) }
}

function returnMetricsForGettingContactDetails(request, response) {
    let contactArray = [];
    if(response.items) {
        response.items.forEach((contact) => {
            contactArray.push({
                "id": contact.id,
                "agencia": contact.agencia,
                "codigoOuISPB": contact.codigoOuISPB,
                "nomeInstituicao": contact.codigoOuISPB,
                "tipoChavePix": contact.tipoChavePix,
                "tipoDeConta": contact.tipoDeConta
            });
            return { "items": JSON.stringify(contactArray) }
        });
    }
}

function returnMetricsForEditingContact(request) {
    if (request.chave) {
        let contactArray = {
            "agencia": request.chave.agencia,
            "tipoDeConta": request.chave.tipoDeConta,
            "codigoOuISPB": request.chave.codigoOuISPB,
            "tipoChavePix": request.chave.tipoChavePix
        }
        return { "chave": JSON.stringify(contactArray) }
    } else {
        return {};
    }
}

function returnProductKey(request, response) {
    if (response.produtos && response.produtos.length !== 0) {
        return { "chaveDeProduto": response.produtos[0].chaveDeProduto }
    } else {
        return {};
    }
}

function returnMetricsForFgtsInstallments(request, response) {
    let fgtsArray = [];
    if (response.recebiveis && response.recebiveis.length !== 0) {
        response.recebiveis.forEach((installment) => {
            fgtsArray.push({
                "valor": installment.valor,
                "dataVencimento": installment.dataVencimento,
            });
        });
        return { "recebiveis": JSON.stringify(fgtsArray) }
    } else {
        return {};
    }
}

function returnMetricsForFgtsContracts(request, response) {
    let fgtsArray = [];
    if (response.items && response.items.length !== 0) {
        response.items.forEach((item) => {
            fgtsArray.push({
                "statusContratoAntecipacao": item.statusContratoAntecipacao,
                "localizador": item.localizador,
                "contrato": item.contrato,
                "data": item.data,
                "dataConclusao": item.dataConclusao,
                "prazo": item.prazo,
                "valorLiberado": item.valorLiberado,
                "valorFinanciado": item.valorFinanciado,
                "taxaJuros": item.taxaJuros,
                "cetAno": item.cetAno,
                "ativo": item.ativo
            });
        });
        return { "items": JSON.stringify(fgtsArray) }
    } else {
        return {};
    }
}

function returnMetricsForListContracts(request, response) {
    let contractsList = [];
    if (response.contratos && response.contratos.length !== 0) {
        response.contratos.forEach(element => {
            if (element.idContrato) {
                let individualRequest = {
                    "idContrato": element.idContrato,
                    "valorRecebivel": element.valorRecebivel,
                    "statusContrato": element.statusContrato,
                    "dataFinanciamento": element.dataFinanciamento,
                    "emAtraso": element.emAtraso
                }
                contractsList.push(individualRequest);
            }
        });
        return { "contractsList": JSON.stringify(contractsList) };
    } else {
        return {};
    }
}

function processInstallmentDetails(request, response) {
    let details = [];
    if (response.recebiveis && response.recebiveis.length !== 0) {
        response.recebiveis.forEach(element => {
            let individualRequest = {
                "value": element.valor,
                "installment": element.numParcela,
                "actualValue": element.valorAtual,
                "installmentDate": element.vencimento,
                "status": element.statusPagamento
            }
            details.push(individualRequest);
        });
        return { "details": JSON.stringify(details) };
    } else {
        return {};
    }
}

function returnMetricsForCancelAccount() {
    return { "motivoCancelamento": ImportantDetails.cancelAccountReason }
}

export default ArbiApiMetricConfig;
