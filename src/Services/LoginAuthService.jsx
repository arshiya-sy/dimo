import androidApiCallsService from "./androidApiCallsService";
import Log from "./Log";
import { ONBOARD_STATUS } from "./MetricsService";
export const ACCOUNT_REJECT_NEXT_ACTION = Object.freeze({
    CONTACT_CUSTOMER_CARE : "CONTACT_CUSTOMER_CARE",
    REUPLOAD_DOCUMENTS : "REUPLOAD_DOCUMENTS",
    REUPLOAD_SELFIE : "REUPLOAD_SELFIE",
    VALIDATE_DOCUMENT_INFO : "VALIDATE_DOCUMENT_INFO"
})

export function returnCafRejectedMessages(errorSections, listOfStrings) {

    let returnableObject = {
        title: "",
        subtitle: "",
        buttonText: "",
        nextAction: []
    };

    let descriptionArray = [];
    let validErrorSections = [2, 3, 4, 6];
    let filteredSections = errorSections.filter((element) => {
        return validErrorSections.indexOf(element) !== -1;
    });

    let uniqueSections = [...new Set(filteredSections)];

    Log.debug("filtered sections are: " + JSON.stringify(uniqueSections));

    if (uniqueSections === 0) {

        returnableObject.title = listOfStrings.client_reject_header;
        returnableObject.subtitle = listOfStrings.client_reject_descr;
        returnableObject.buttonText = listOfStrings.contact_customer_care;
        returnableObject.nextAction.push(ACCOUNT_REJECT_NEXT_ACTION.CONTACT_CUSTOMER_CARE);

        androidApiCallsService.setOnboardingProgressInfo(ONBOARD_STATUS.CLIENT_REJECTED_OTHER);
    } else if (uniqueSections.length === 1) {
        returnableObject = getMessageForErrors(filteredSections[0], listOfStrings);
    } else {
        uniqueSections.forEach((error) => {
            switch (error) {
                case 2:
                case 3:
                    descriptionArray.push({ "success": false, "text": listOfStrings.identification_section });
                    returnableObject.nextAction.push(ACCOUNT_REJECT_NEXT_ACTION.VALIDATE_DOCUMENT_INFO);
                    break;
                case 4:
                    descriptionArray.push({ "success": false, "text": listOfStrings.documents_section });
                    returnableObject.nextAction.push(ACCOUNT_REJECT_NEXT_ACTION.REUPLOAD_DOCUMENTS);
                    break;
                case 6:
                    descriptionArray.push({ "success": false, "text": listOfStrings.selfie_section });
                    returnableObject.nextAction.push(ACCOUNT_REJECT_NEXT_ACTION.REUPLOAD_SELFIE);
                    break;
                default: break;
            }
        });


        returnableObject.title = listOfStrings.multiple_issues;
        returnableObject.subtitle = descriptionArray;
        returnableObject.buttonText = listOfStrings.register_again;

        androidApiCallsService.setOnboardingProgressInfo(ONBOARD_STATUS.CLIENT_REJECTED_ERROR_MULTIPLE);

    }

    return returnableObject;
}

function getMessageForErrors(errorSection, listOfStrings) {
    let returnableObject = {
        title: "",
        subtitle: "",
        buttonText: "",
        nextAction: []
    };

    switch(errorSection) {

        case 2:
        case 3:
            // user needs to recheck the rg/cnh information sent
        returnableObject.title =  listOfStrings.document_info_error_title;
        returnableObject.subtitle = listOfStrings.document_info_error_desc;
        returnableObject.buttonText = listOfStrings.document_info_next_action;
        returnableObject.nextAction.push(ACCOUNT_REJECT_NEXT_ACTION.VALIDATE_DOCUMENT_INFO);

        androidApiCallsService.setOnboardingProgressInfo(ONBOARD_STATUS.CLIENT_REJECTED_ERROR_DOC_INFO);
        break;

        case 4:
            // user needs to reupload the document
        returnableObject.title =  listOfStrings.document_error_title;
        returnableObject.subtitle = listOfStrings.document_error_desc;
        returnableObject.buttonText = listOfStrings.document_error_next_action;
        returnableObject.nextAction.push(ACCOUNT_REJECT_NEXT_ACTION.REUPLOAD_DOCUMENTS);

        androidApiCallsService.setOnboardingProgressInfo(ONBOARD_STATUS.CLIENT_REJECTED_ERROR_DOCS)
        break;

        case 6:
            // user needs to reupload selfie
        returnableObject.title =  listOfStrings.selfie_error_title;
        returnableObject.subtitle = listOfStrings.selfie_error_desc;
        returnableObject.buttonText = listOfStrings.selfie_error_next_action;
        returnableObject.nextAction.push(ACCOUNT_REJECT_NEXT_ACTION.REUPLOAD_SELFIE);

        androidApiCallsService.setOnboardingProgressInfo(ONBOARD_STATUS.CLIENT_REJECTED_ERROR_SELFIE)

        break;
        default: break;

    }

    return returnableObject;

}


export function returnOnboardResumeSections(nextSection, listOfStrings) {
    let allSections = [
    {"success": false, "text": listOfStrings.pre_registration},
    {"success": false, "text": listOfStrings.documents_section},
    {"success": false, "text": listOfStrings.selfie_section},
    // {"success": false, "text": listOfStrings.identification_section},
    // {"success": false, "text": listOfStrings.address_section},
    // {"success": false, "text": listOfStrings.verification_section}
   ];

    for (let i = 0; i < allSections.length; i++) {
        if (i < nextSection) {
            allSections[i].success = true;
        }
    }

    return allSections;

}
