import Log from "./Log";
import DBService from "./DBService";
import apiService from "./apiService";
import constantObjects from "./Constants";
import walletJwtService from "./walletJwtService";
import GeneralUtilities from "./GeneralUtilities";
import ImportantDetails from "../WalletComponents/NewLaunchComponents/ImportantDetails";

export default class GeneralAPIs {
    
    static fetchCardsListAPI = async (tabName, componentName) => {
        let domCardsArr = [];

        await apiService.getDomResponse(tabName).then(async response => {
            try {
                Log.sDebug("Server sent " + response.data.cards.length + " cards", componentName);

                const deletedCards = DBService.getDeletedCards();

                response.data.cards.forEach((cardResponseData) => {
                    cardResponseData.data.forEach((domCardData) => {
                        try {
                            if (deletedCards.includes(domCardData.id) || domCardsArr.length >= 10) {
                                return;
                            }
                        } catch (e) {
                            return;
                        }

                        const idArray = domCardData.id.split("~#");
                        const domData = {
                            ...domCardData,
                            'streamId': cardResponseData.streamid,
                            'tabId': cardResponseData.tabid,
                            'storyId': cardResponseData.storyid,
                            'cardIndex': parseInt(idArray.at(-1)) + 1
                        };

                        domCardsArr.push(domData);
                    });
                });
            } catch (err) {
                Log.debug(err)
                Log.sDebug("Receiving exception for offers cards" + err, componentName, constantObjects.LOG_PROD);
            }
        });

        return domCardsArr;
    }

    static fetchTokenForCAF = async (componentName) => {
        const cpf = ImportantDetails.cpf;
        
        try {
            const CAFAuth = await walletJwtService.CAFAuthentication(cpf);
            
            if (!GeneralUtilities.isNotEmpty(CAFAuth[0])) {
                Log.sDebug("Empty Auth Token For CAF Retrying", componentName);

                await walletJwtService.CAFAuthentication(cpf);
            }
        } catch (error) {
            Log.sDebug(`Error while Fetching Token For CAF: ${error.message}`, componentName);

            await walletJwtService.CAFAuthentication(cpf);
        }
    }
}
