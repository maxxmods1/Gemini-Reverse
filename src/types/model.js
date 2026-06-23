'use strict';

const { buildModelHeader } = require('../constants');

class RPCData {
    constructor({ rpcid, payload, identifier = 'generic' } = {}) {
        this.rpcid = rpcid;
        this.payload = payload;
        this.identifier = identifier;
    }

    serialize() {
        return [this.rpcid, this.payload, null, this.identifier];
    }

    toString() {
        return `RPCData(rpcid='${this.rpcid}', payload='${this.payload}', identifier='${this.identifier}')`;
    }
}

class AvailableModel {
    constructor({ model_id, model_name, display_name, description, capacity, capacity_field = 12, model_number = 1, is_available = true } = {}) {
        this.model_id = model_id;
        this.model_name = model_name;
        this.display_name = display_name;
        this.description = description;
        this.capacity = capacity;
        this.capacity_field = capacity_field;
        this.model_number = model_number;
        this.is_available = is_available;
    }

    get model_header() {
        let tail;
        if (this.capacity_field === 13) {
            tail = `null,${this.capacity}`;
        } else {
            tail = String(this.capacity);
        }
        return buildModelHeader(this.model_id, tail, this.model_number);
    }

    get advanced_only() {
        return !(this.capacity === 1 && this.capacity_field === 12);
    }

    toString() {
        return this.model_name || this.display_name;
    }

}

module.exports = { RPCData, AvailableModel };
