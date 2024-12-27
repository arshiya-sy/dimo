function GlobalDataStore() {
    this.data = {};
    this.subscriber = {};

    // eslint-disable-next-line no-unused-expressions
    this.updateData = (name, data) => {
        if (name) {
            if (this.data && this.data[name]) {
                this.data[name].prevData = this.data[name].newData;
                this.data[name].newData = data;
            } else {
                this.data[name] = {
                    newData: data
                }
            }
            this.emit(name, data);
        }
    };

    this.emit = (event, data) => {
        for (let i in this.subscriber[event]) {
            let func = this.subscriber[event][i];
            if (func && typeof func === "function") {
                try {
                    func(data, event);
                } catch (err) {
                    return;
                }
            }
        }
    };

    this.onStateChange = (event, func) => {
        this.subscriber[event] = (this.subscriber[event] || []).concat(func);
    };

    this.unSubscribe = (event) => {
        this.subscriber[event] = [];
    };

    // eslint-disable-next-line no-unused-expressions
    this.removeData = (name) => {
        if (name && this.data[name]) {
            delete this.data[name];
        }
    };

    this.getData = (name) => {
        if (this.data[name]) {
            return this.data[name];
        }
    };
}

const globalDataStore = new GlobalDataStore()
export default globalDataStore;
