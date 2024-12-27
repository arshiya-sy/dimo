import ArbiApiService from "./ArbiApiService";
import ArbiResponseHandler from "./ArbiResponseHandler";
import Log from "./Log";

const componentName = "SAVE CONTACTS UTILS";

export default new SaveContactUtils();

function SaveContactUtils() {

    this.getSaveContactStaus = async function(cpfOfContact, typeOfContact, contactToStore) {
        return new Promise((resolve) => {
            let timeoutId = setInterval(async () => {
                clearInterval(timeoutId);
                await Promise.all([await this.getSaveStatusFromAllContacts()]).then(value=> {
                let allContactsList = value[0]
                if(allContactsList.length === 0) {
                    //Log.sDebug("No contacts are stored hence save a new contact")
                    resolve(true);
                } else {
                    let finalContact = this.findCpfInContact(cpfOfContact, allContactsList);
                    if(finalContact.length === 0) {
                        //Log.sDebug("No contacts are stored with given cpf hence save a new contact")
                        resolve(true);
                    } else {
                        let finalData = this.formatJSON(finalContact[0]);
                        let timeoutId2 = setInterval(async () => {
                            clearInterval(timeoutId2);
                            await Promise.all([await this.getContactDetails(finalData)]).then(value => {
                            let contactDetails = value[0]
                            if(contactDetails.isContactPresent) {
                                let contactJSON =  this.searchForContact(contactDetails.contactDetails , contactToStore, typeOfContact);
                                if (contactJSON.length === 0) {
                                    //Log.sDebug("No contacts are stored with given type and value hence save a new contact")
                                    resolve(true);
                                } else {
                                    //Log.sDebug("Contact Available hence no need to save", componentName, constantObjects.LOG_STAGING)
                                    resolve(false);
                                }
                            } else {
                                //Log.sDebug("ERRORR FOUND save a new contact", componentName, constantObjects.LOG_STAGING)
                                resolve(true);
                            }
                        }).catch(() => {
                                // Log.sDebug("ERRORR FOUND save a new contact", componentName, constantObjects.LOG_STAGING)
                                resolve(true);
                        })
                        },100);
                    }
                }
            }).catch(err => {
                Log.sDebug("ERRORR FOUND save a new contact", err)
                return false
            })
            },100);
        })
    }

    this.getSaveStatusFromAllContacts = async function() {
        //Log.sDebug("Checking if Contacts are available");
        return new Promise((resolve) => {
            ArbiApiService.fetchAllFavorites("", componentName).then(response => {
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processFetchingAllContacts(response.result);
                    if (processedResponse.success) {
                        resolve(processedResponse.contacts)
                }
            } else {
                //Log.sDebug("Error in api show option to save", componentName, constantObjects.LOG_PROD)
                resolve([])
            }})
        })
    }

    this.formatJSON = function (finalContact) {
        //Log.sDebug("Creating a formated JSON");
        let jsonObject = {
            "favId" : finalContact.favoritoId,
            "cpf" : finalContact.identificacaoFiscal,
            "nickName" : finalContact.apelido,
            "fullName" : finalContact.nomeCompleto
        };
        return jsonObject
    }

    this.findCpfInContact = function (cpf, contactslist) {
        //Log.sDebug("Searching for given CPF in contacts");
        return contactslist.filter (
                function(item) { return item.identificacaoFiscal === cpf; }
            );
    }

    this.getContactDetails = async function (json) {
        //Log.sDebug("Getting all details of a contact");
        let requestJson= {
            "contactCpf": json.cpf,
            "contactId": json.favId,
            "contactName": json.fullName,
            "nickName": json.nickName,
        }
        return new Promise((resolve) => {
            ArbiApiService.getContactDetails(requestJson, componentName).then(response => {
                if (response.success) {
                    let processedResponse = ArbiResponseHandler.processGetContactDetailsResponse(response.result);
                    if (processedResponse.success) {
                        requestJson["contactDetails"] = processedResponse.contactDetails;
                        if (processedResponse.contactDetails.length === 0) {
                            requestJson["isContactPresent"] = false;
                        } else {
                           requestJson["isContactPresent"] = true;
                        }
                        resolve(requestJson);
                    }
                } else {
                   requestJson["isContactPresent"] = false;
                   resolve(requestJson);
                }
            });
           })
    }

    this.searchForContact = function (contactDetails, contactValue, type) {
        //Log.sDebug("Searching entered values amidst the contact")
        if(type === "AgenciaConta") {
            return contactDetails.filter(
                function(item) { return (item.conta === contactValue); }
            );
        } else {
            return contactDetails.filter(
                function(item) { return (item.tipoChavePix === type && item.chavePix === contactValue); }
            );
        }
    }

}

