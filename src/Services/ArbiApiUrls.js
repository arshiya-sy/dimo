const ArbiApiUrls = Object.freeze({

    CREATE_USER: "usuarios/criar-usuario",
    GET_USER_WITH_CPF: "usuarios/listar-usuarios-por-identificacao-fiscal",
    AUTHENTICATE_USER: "app/login",
    UPLOAD_DOC: "cliente/enviar-documento",
    OCR_API_URL: "cliente/extrair-ocr-documento",
    UPDATE_USER_PROFILE_DETAILS: "cliente/solicitar-alteracao-de-dados-email-caf",

    SEND_TOKEN_TO_CANCEL_ACCOUNT: "token/gerar-2fa-cancelamento-de-conta-multipla",
    CANCEL_ACCOUNT: "conta/cancelar-conta",

    PIX_EMAIL_CLAIM_URL: "pix/reivindicacao/reivindicar-email",
    PIX_PHONE_CLAIM_URL: "pix/reivindicacao/reivindicar-celular",
    PIX_CPF_CLAIM_URL: "pix/reivindicacao/reivindicar-identificacao-fiscal",

    PIX_CLAIM_CONSULT_URL: "pix/reivindicacao/consultar-reinvidicacoes",

    PIX_CONFIRM_CLAIM_URL: "pix/reivindicacao/confirmar",
    PIX_CANCEL_CLAIM_URL: "pix/reivindicacao/cancelar",
    PIX_CONCLUDE_CLAIM_URL: "pix/reivindicacao/concluir",

    LOG_OUT: "autenticar/desconectar",

    WITHDRAW_ATM_URL: "saque/solicitar-saque-atm",

    FETCH_BOLETO_DETAILS: "pagamento/validar-boleto",
    PAY_BOLETO: "pagamento/pagar-boleto",

    PIX_SCHEDULE_TRANSFER_KEY: "pix/operacao/efetuar-agendamento-pix-chave",
    PIX_SCHEDULE_TRANSACTION_HISTORY: "pix/operacao/consultar-agendamento-pix",
    PIX_SCHEDULE_CANCEL: "pix/operacao/cancelar-agendamento-pix",
    PIX_SCHEDULE_EDIT_KEY: "pix/operacao/alterar-agendamento-pix-chave",
    TED_SCHEDULE_INTERNAL: "transferencias/efetuar-agendamento-transferencia-entre-contas-arbi",
    TED_SCHEDULE_EXTERNAL: "transferencias/efetuar-agendamento-ted",

    ACCESS_LIMITS: "limites-cliente/consultar-limites",
    CHANGE_LIMITS: "limites-cliente/solicitar-alteracao-limite-operacao",
    PIX_CHANGE_NIGHTLY_LIMIT: "limites-cliente/alterar-limite-noturno-pix",

    PIX_PENDING_LIMIT_REQUEST: "limites-cliente/consultar-solicitacoes-pendentes",
    TED_SCHEDULE_TRANSACTION_HISTORY: "transferencias/consultar-agendamentos-ted",

    BOLETO_SCHEDULE_TRANSACTION_HISTORY: "pagamento/consultar-agendamento-boleto",

    TED_SCHEDULE_INTERNAL_CANCEL: "transferencias/cancelar-agendamento-transferencia-interna",
    TED_SCHEDULE_EXTERNAL_CANCEL: "transferencias/excluir-agendamento-ted",
    TED_SCHEDULE_INTERNAL_EDIT: "transferencias/alterar-agendamento-transferencia-interna",
    TED_SCHEDULE_EXTERNAL_EDIT: "transferencias/alterar-agendamento-ted",

    GET_ALL_SHCEDULED_TRANSACTIONS: "conta/consultar-agendamentos",
    TED_SCHEDULE_TRANSACTION_DETAILS_INTERNAL: "transferencias/obter-agendamento-transferencia-interna",
    TED_SCHEDULE_TRANSACTION_DETAILS_EXTERNAL: "transferencias/obter-agendamento-ted",
    BOLETO_SCHEDULE_TRANSACTION_DETAILS: "pagamento/obter-agendamento-boleto",
    PIX_SCHEDULE_TRANSACTION_DETAILS: "pix/operacao/obter-agendamento-pix",

    BOLETO_SCHEDULE_PAYMENT: "pagamento/efetuar-agendamento-boleto",
    BOLETO_SCHEDULE_CANCEL: "pagamento/cancelar-agendamento-boleto",
    BOLETO_SCHEDULE_EDIT: "pagamento/alterar-agendamento-boleto",

    IS_HOLIDAY: "utilidades/consultar-proximo-dia-util",

    FETCH_ALL_CONTACTS: "favorito/consultar-favoritos",
    REGISTER_CONTACT: "favorito/cadastrar-favorito",
    GET_CONTACT_DETAILS: "favorito/consultar-chaves-favorito",
    DELETE_CONTACT_KEY: "favorito/excluir-chave-favorito",
    DELETE_CONTACT: "favorito/excluir-contato-favorito",
    EDIT_CONTACT_DETAIL: "favorito/atualizar-favorito",

    CHECK_FOR_VACANCY: "onboarding/verificar-possui-vagas",
    CHECK_WAITLIST_STATUS: "onboarding/obter-posicao-fila",
    REGISTER_TO_WAITLIST: "onboarding/cadastrar-cliente-fila",

    REQUEST_SALARY_PORTABILITY: "portabilidade-salarial/solicitar",
    LIST_PORTABILITY_REQUESTS: "portabilidade-salarial/listar",
    CANCEL_PORTABILITY_REQUESTS: "portabilidade-salarial/cancelar",

    DIMO_GET_DETAILS_OF_CODE: "dimoqrcode/validar",
    DIMO_PAY_QR_CODE: "dimoqrcode/efetuar-pagamento",
    MIGRATE_TO_VISA : "conta/migracao-de-produtos",
    PERMISSION_TO_MIGRATE: "conta/obter-dados-conta",
    VALIDATE_ACCOUNT_PIN: "conta/validar-pin-conta",
    GET_REQUEST_CATEGORY: "cartao/consultar-cartoes-disponiveis-para-conta",
    FETCH_PRODUCT_KEY : "produto/consultar-produtos-disponiveis-cliente",

    FGTS_ANTICIPATE_API: "antecipacao/fgts/simulacao-autorizadora",
    FGTS_GET_TERMS_API: "antecipacao/fgts/termo",
    FGTS_GET_PROPOSALID_API: "conta/AccountKey/antecipacao/fgts/proposta",
    FGTS_GET_SIGNED_CONTRACT : "antecipacao/fgts/termo/contractId",
    FGTS_GET_CONTRACT_LIST : "antecipacao/fgts/contratos",
    FGTS_SIGN_CONTRACT : "fgts/Proposta/proposalId/faceauth/faceAuthId/contrato",
    FGTS_GET_FACEAUTH_ID : "clientes/clientKey/faceauth",

    LIST_FINANCING_CONTRACTS: "financiamento/mobile/contas/chaveDeConta",
    LIST_CONTRACT_DETAILS: "financiamento/mobile/contas/key/contratos/contractId",
    LIST_INSTALLMENT_DETAILS: "financiamento/mobile/contas/accountKey/contratos/contractoId/parcelas",


    GET_DELIVERY_ADDRESS: "conta/consultar-endereco-entrega",
    GUARENTEED_CREDIT_STATUS: "/cartao-garantia/contratacao/situacao",
    GUARENTEED_CREDIT_INVESTMENT_INFO: "/cartao-garantia/produto-investimento",
    GUARENTEED_CREDIT_INVESTMENT_HOME_PAGE: "/cartao-garantia/posicao",
    ANALYSE_CREDIT_SCORE: "creditoclean/analise-de-credito",
    CONFIGURE_CREDIT_CARD: "/cartao-garantia/configuracao",
    FETCH_CREDIT_CONTRACT: "/cartao-garantia/contratos",
    GET_CREDIT_CONTRACT: "/cartao-garantia/contrato-corrente",
    SIGN_CREDIT_CONTRACT: "/cartao-garantia/contrato-corrente/assinatura",
    GUARENTEED_SIMULATE_REDEEM: "/cartao-garantia/simulacao-resgate",
    GUARENTEED_SIMULATE_INVEST_MORE: "/cartao-garantia/contrato-corrente/aditivo",
    GUARENTEED_FACEMATCH_REDEEM: "/cartao-garantia/solicitar-resgate",
    GUARENTEED_FACEMATCH_INVEST_MORE: "/cartao-garantia/contrato-corrente/aditivo/assinatura",
    GUARENTEED_CREDIT_TRANSACTION_HISTORY: "/cartao-garantia/extrato",
    GUARENTEED_CREDIT_INVOICE_HISTORY: "/cartao-garantia/faturas",

    GUARENTEED_CREDIT_CARD_HOME_PAGE : "/cartao-garantia/informacoes-uso",
    GUARENTEED_CREDIT_CARD_SETTINGS : "cartao/obter-configuracoes",
    GUARENTEED_CREDIT_CARD_CHANGE_DUE_DATE : "/cartao-garantia/data-vencimento",
    GUARENTEED_CREDIT_CARD_CHANGE_AUTOMATIC_DEBIT : "/cartao-garantia/debito-automatico",

    ACCOUNT_CURRENT_STATUS_URL: "gestao-contas/conta-corrente/idContaCorrente/status",
    ACCOUNT_UNBLOCK_URL: "gestao-contas/conta-corrente/idContaCorrente/desbloquear",

    ACCOUNT_UNBLOCK_PREFIX: "gestao-contas/conta-corrente",
    ACCOUNT_CURRENT_STATUS_SUFFIX: "status",
    ACCOUNT_UNBLOCK_SUFFIX: "desbloquear",

    CHANGE_USER_PHONE_NUMBER: "token/gerar-2fa-alteracao-celular",
    CHANGE_USER_EMAIL: "token/gerar-2fa-alteracao-email"
});


export default ArbiApiUrls;