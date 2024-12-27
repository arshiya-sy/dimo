import { Store, set, get, keys, del, clear } from "./IndexedDB";
import { persistValue, getValue } from "./androidApiCallsService";
import Log from "./Log";

const DB_NAME = "moto-place";
const customStore = new Store(DB_NAME, "states");
const CACHED = {};
const DELETED = "deleted";
const SCRATCHED_CARDS = "scratchedCards";
const SERVED_CARDS = "servedCards";
const UIPROFILE_STORE = new Store(DB_NAME, "ui_profile");
const ALL_INTERESTS = new Store(DB_NAME, "all_interests");
const ALL_LANGUAGES = new Store(DB_NAME, "all_languages");
let isPrefetched = false;

/**
 * Method to pre-fetch the entries of the indexedDB
 * @param {Boolean} forceFetch Flag to force a re-fetch of the entries in indexedDB
 */
async function preFetch(forceFetch = true) {
  //Check to ensure the prefetch is complete if forceFetch is set to false.
  if (!forceFetch && isPrefetched) return CACHED;
  let cachedKeys = await keys(customStore);
  let callList = [],
    obj = {};
  for (let key of cachedKeys) {
    callList.push(get(key, customStore).then(val => (obj[key] = val)));
  }
  await Promise.all(callList);
  return obj;
}

class DBService {
  constructor() {
    preFetch().then(x => {
      Object.assign(CACHED, x);
      isPrefetched = true;
    });
  }

  getWalletUser = key => {
    let val = getValue(key);
    try {
      return val;
    } catch (err) {
      //console.log(err);
      return [];
    }
  }
   /**
   * Method to set search history of device
   * @param {String} key The key associated with search history
   * @param {String} value Stringified history object
   */
  setUserName = (key, value) => {
    return persistValue(key, value);
  };

  /**
   * Method to delete the state of a card from the db
   * @param {String} cardId The contentid of the card
   */
  deleteCardState = cardId => {
    delete CACHED[cardId];
    del(cardId, customStore);
  };

  /**
   * Method to update the state of a card
   * @param {String} cardId The contentid of the card
   * @param {Object} state  The state of the card
   */
  updateCardState = (cardId, state) => {
    if (!state) {
      this.deleteCardState(cardId);
      return;
    }
    CACHED[cardId] = state;
    set(cardId, state, customStore).then(() => {});
  };

  getDeletedCards = () => {
    return CACHED[DELETED] || [];
  };

  /**
   * Method to update a saved card locally in the indexedDB
   * @param contentId
   */
  setDeletedCard = (contentId) => {
    let deletedCardsList = CACHED[DELETED] || [];
    if (contentId) {
      let deleteSet = new Set(deletedCardsList);
      deleteSet.add(contentId);
      deletedCardsList = [...deleteSet];
      this.updateCardState(DELETED, deletedCardsList);
    } else {
      Log.sDebug("Not a valid card contentId: " + contentId, "DB SERVICE");
    }
  };

  getScratchedCards = () => {
    return CACHED[SCRATCHED_CARDS] || [];
  };

  /**
   * Method to update a saved card locally in the indexedDB
   * @param contentId
   */
  setScratchedCard = (contentId) => {
    let scratchedCardsList = CACHED[SCRATCHED_CARDS] || [];
    if (contentId) {
      let scratchSet = new Set(scratchedCardsList);
      scratchSet.add(contentId);
      scratchedCardsList = [...scratchSet];
      this.updateCardState(SCRATCHED_CARDS, scratchedCardsList);
    } else {
      Log.sDebug("Not a valid card contentId: " + contentId,"DB SERVICE");
    }
  };

  getServedCards = () => {
    return CACHED[SERVED_CARDS] || [];
  };

  setServedCard = (contentId) => {
    let servedCardsList = CACHED[SERVED_CARDS] || [];
    if (contentId) {
      let servedSet = new Set(servedCardsList);
      servedSet.add(contentId);
      servedCardsList = [...servedSet];
      this.updateCardState(SERVED_CARDS, servedCardsList);
    } else {
      Log.sDebug("Not a valid card contentId: " + contentId, "DB SERVICE");
    }
  };

  clearServedCardList = () => {
    this.updateCardState(SERVED_CARDS, []);
  }
}

const clearDataBase = () => {
  clear(UIPROFILE_STORE);
  clear(ALL_INTERESTS);
  clear(ALL_LANGUAGES);
  clear(customStore);
  caches.delete('images');
  caches.delete('domResponse');
  caches.delete('runtimeCache');
  return true;
}

const clearProfData = () => {
  clear(UIPROFILE_STORE);
  caches.delete('domResponse');
  caches.delete('runtimeCache');
  return true;
}


export default new DBService();
export { preFetch, clearDataBase, clearProfData };
