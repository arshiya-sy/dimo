const errorCodeList = Object.freeze({

    //LOGIN
    INVALID_USERNAME_PASSWORD : 47029,
    USER_BLOCKED: 47028,

    // user creation
    USER_ALREADY_EXISTS : 11026,
    VALIDATION_ERRORS : 40007,
    EMAIL_IN_USE : 40016,
    INVALID_CPF : 40011,

    //change user password
    ERROR_CHANGING_PASSWORD : 40022,
    INVALID_PASSWORD: 10007,

    //forgot 4 digit password
    INCORRECT_VERIFICATION_CODE: 23003,
    RESEND_WITHIN_1_MINUTE: 46001,

    //cellular recharge
    AREA_CODE_INVALID : 40050,

    //Boleto generation
    INVALID_EXPIRATION_DATE: 14007,

    //pix payment
    INCORRECT_PIN: 10007,
    INSUFFICIENT_BALANCE: 17000,
    PIX_KEY_NOT_FOUND: 40013,
    NO_KEY_FOUND_FOR_PARAMS: 41167,

    //pix claim
    INCORRECT_TOKEN: 11012,

    //duplicate idempotency error
    DUPLICATE_IDEMPOTENCY_ERROR: 40044,

    //Logged on from a new device
    NEW_DEVICE_LOGIN_DETECTED: 40123,

    //Wait list API
    ACCOUNT_ALREADY_EXISTS: 62000,
    WAITLIST_ALREADY_EXISTS: 62001,
    VACANCY_EXISTS: 62002,
    WAITLIST_NOT_FOUND: 62003,
    WAITLIST_APPROVED: 62004

});

export default errorCodeList