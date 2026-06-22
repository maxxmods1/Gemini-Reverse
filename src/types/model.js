'use strict';

const { buildModelHeader, MODEL_HEADER_KEY, Model } = require('../constants');

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

    static computeCapacity(tierFlags, capabilityFlags) {
        if (tierFlags.includes(21)) return [1, 13];
        if (tierFlags.includes(22)) return [2, 13];
        if (capabilityFlags.includes(115)) return [4, 12];
        if (tierFlags.includes(16) || capabilityFlags.includes(106)) return [3, 12];
        if (tierFlags.includes(8) || (!capabilityFlags.includes(106) && capabilityFlags.includes(19))) return [2, 12];
        return [1, 12];
    }

    static buildModelIdNameMapping() {
        const result = {};
        const keys = [
            'BASIC_PRO', 'BASIC_FLASH', 'BASIC_LITE',
            'PLUS_PRO', 'PLUS_FLASH', 'PLUS_LITE',
            'ADVANCED_PRO', 'ADVANCED_FLASH', 'ADVANCED_LITE',
        ];
        for (const key of keys) {
            const member = Model[key];
            if (!member) continue;
            const headerValue = member.model_header[MODEL_HEADER_KEY];
            if (!headerValue) continue;
            try {
                const parsed = JSON.parse(headerValue);
                const modelId = parsed && parsed[4];
                if (modelId && !(modelId in result)) {
                    const baseSuffix = key.split('_').slice(1).join('_');
                    const baseKey = 'BASIC_' + baseSuffix;
                    const baseMember = Model[baseKey] || member;
                    result[modelId] = baseMember.model_name;
                }
            } catch {
                continue;
            }
        }
        return result;
    }

    static buildModelIdNumberMapping() {
        const result = {};
        const keys = [
            'BASIC_PRO', 'BASIC_FLASH', 'BASIC_LITE',
            'PLUS_PRO', 'PLUS_FLASH', 'PLUS_LITE',
            'ADVANCED_PRO', 'ADVANCED_FLASH', 'ADVANCED_LITE',
        ];
        for (const key of keys) {
            const member = Model[key];
            if (!member) continue;
            const headerValue = member.model_header[MODEL_HEADER_KEY];
            if (!headerValue) continue;
            try {
                const parsed = JSON.parse(headerValue);
                const modelId = parsed && parsed[4];
                const modelNumber = parsed && parsed[parsed.length - 1];
                if (modelId && typeof modelNumber === 'number' && !(modelId in result)) {
                    result[modelId] = modelNumber;
                }
            } catch {
                continue;
            }
        }
        return result;
    }
}

module.exports = { RPCData, AvailableModel };
