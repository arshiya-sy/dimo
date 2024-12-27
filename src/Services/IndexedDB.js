import MotoplaceLogger from "../Services/MotoplaceLogger";
const StoreNames = [];
class Store {
  constructor(dbName = "keyval-store", storeName = "keyval") {
    this.storeName = storeName;
    StoreNames.push(this.storeName);
    this._dbp = new Promise((resolve, reject) => {
      const openreq = indexedDB.open(dbName, 4);
      openreq.onerror = () => reject(openreq.error);
      openreq.onsuccess = () => resolve(openreq.result);
      // First time setup: create an empty object store
      openreq.onupgradeneeded = () => {
        StoreNames.map(x => {
          try {
            openreq.result.createObjectStore(x);
          } catch (err) {
            return err;
          }
        });
      };
    });
  }

  _withIDBStore = (type, callback) => {
    return this._dbp.then(
      db =>
        new Promise((resolve, reject) => {
          const transaction = db.transaction(this.storeName, type);
          transaction.oncomplete = () => resolve();
          transaction.onabort = transaction.onerror = () =>
            reject(transaction.error);
          callback(transaction.objectStore(this.storeName));
        })
    );
  };
}

let store;

function clearDataBase(dbName) {
  return new Promise((resolve, reject) => {
    var req = indexedDB.deleteDatabase(dbName);
    req.onsuccess = function () {
      MotoplaceLogger.console.info("Deleted database successfully");
      resolve(true);
    };
    req.onerror = function (err) {
      MotoplaceLogger.console.info("Couldn't delete database");
      reject(err);
    };
    req.onblocked = function (err) {
      MotoplaceLogger.console.info(
        "Couldn't delete database due to the operation being blocked"
      );
      reject(err);
    };
  });
}

function getDefaultStore() {
  if (!store) store = new Store();
  return store;
}

function get(key, store = getDefaultStore()) {
  let req;
  return store
    ._withIDBStore("readonly", store => {
      req = store.get(key);
    })
    .then(() => req.result);
}

function set(key, value, store = getDefaultStore()) {
  return store._withIDBStore("readwrite", store => {
    store.put(value, key);
  });
}

function del(key, store = getDefaultStore()) {
  return store._withIDBStore("readwrite", store => {
    store.delete(key);
  });
}

function clear(store = getDefaultStore()) {
  return store._withIDBStore("readwrite", store => {
    store.clear();
  });
}

function keys(store = getDefaultStore()) {
  const keys = [];
  return store
    ._withIDBStore("readonly", store => {
      (store.openKeyCursor || store.openCursor).call(
        store
      ).onsuccess = function () {
        if (!this.result) return;
        keys.push(this.result.key);
        this.result.continue();
      };
    })
    .then(() => keys);
}

export { Store, get, set, del, clear, keys, clearDataBase };
