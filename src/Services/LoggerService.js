
import { AsymmetricCrypto } from '../Services/AsymmetricCrypto';
import { SymmetricCrypto } from '../Services/SymmetricCrypto';
import apiService from "../Services/apiService";

export default new LoggerService();

function LoggerService() {

    this.logEncryptedEvents = (category, event) => {
        try {
            const publicKey = "MIIBHTANBgkqhkiG9w0BAQEFAAOCAQoAMIIBBQKB/QLQ2sKqv6+hq4X4gM2Stcs9q4EnSbuhdzjom1w/E4zCH6HiQQ7FX3B3a8JBzlFclFjHbgUreOM/gberVon4cZRh5po9PxLh8jIC86Oeg+nt8x/IECj/Q+HAxSjNhDyPj0Oorw2cl8a8Tcx5NBMMUaJRCzZimCH3gdY4HDa4Qf0bx644FBg2fHrCDDTw5U4bH/J+0ZHte4WqP8m8boEB5ppttSTBxX95HjpTv2vW+qtKnGDJMMbT/nmyx1/d8tZs8Jof4fYHMEIVPOTMG5dpjMgCL+ZDkPcDSu5iJ4TKTjKmWiCv99u7lXcM9e6do+3jSApR3TT4Xk/4ct2zbzcCAwEAAQ==";
            this.symmetric = new SymmetricCrypto();
            this.asymmetric = new AsymmetricCrypto(publicKey);
            const keyAndIv = this.symmetric.getKeyAndIv();
            const encryptedKeyAndIv = this.asymmetric.encrypt(keyAndIv, true);
            var jsonObject = {};
            var payload = this.createEventJson(category, "encrypted", event);
            jsonObject["payload"] = this.symmetric.encrypt(JSON.stringify(payload));
            jsonObject["secret"] = encryptedKeyAndIv;
            this.reportEncryptedLogs(jsonObject);
        } catch (err) {
            console.error(err);
        }
    }

    this.logPlainEvents = (category, event) => {
        var jsonObject = this.createEventJson(category, "plain", event);
        this.reportLogs(jsonObject);
    }

    this.createEventJson = (category, logType, event) => {
        let ms = 1 * 60 * 1000;
        let curr_time = new Date();
        let jsonObject = {};
        jsonObject["category"] = category;
        jsonObject["type"] = "log";
        jsonObject["dtime"] = curr_time.getTime();
        jsonObject["logType"] = logType;
        jsonObject["tz"] = new Date().getTimezoneOffset() * ms * -1;
        jsonObject["event"] = event;
        return jsonObject;
    }

    this.reportLogs = (jsonObject) => {
        apiService.reportMetrics(jsonObject)
            .then(response => {
                if (response.status === 200) {
                    console.error("Data saved");
                }
            }).catch(err => {
                if (err.response) {
                    console.log(err.response.status);
                }
            });
    }

    this.reportEncryptedLogs = (jsonObject) => {
        apiService.reportEncryptedLogs(jsonObject)
            .then(response => {
                if (response.status === 200) {
                    console.error("Data saved");
                }
            }).catch(err => {
                if (err.response) {
                    console.log(err.response.status);
                }
            });
    }
}


