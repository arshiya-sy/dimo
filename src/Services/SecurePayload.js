export class SecurePayload {
    constructor(payload, jwt, secret, route, type, header) {
        this.p = payload;
        this.j = jwt;
        this.s = secret;
        this.r = route;
        this.m = type;
        this.h = header;
    }
}