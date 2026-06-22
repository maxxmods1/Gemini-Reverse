'use strict';

class ChatTurn {
    constructor({ role, text, model_output = null } = {}) {
        this.role = role;
        this.text = text;
        this.model_output = model_output;
    }

    toString() {
        const preview = this.text && this.text.length > 100 ? this.text.slice(0, 100) + '...' : (this.text || '');
        return `${this.role.toUpperCase()}: ${preview}`;
    }
}

class ChatHistory {
    constructor({ cid, turns } = {}) {
        this.cid = cid;
        this.turns = turns || [];
    }

    toString() {
        return `ChatHistory(cid=${this.cid})`;
    }
}

class ChatInfo {
    constructor({ cid, title, is_pinned = false, timestamp } = {}) {
        this.cid = cid;
        this.title = title;
        this.is_pinned = is_pinned;
        this.timestamp = timestamp;
    }

    toString() {
        const pin = this.is_pinned ? '[Pinned] ' : '';
        const title = this.title || `Chat(${this.cid})`;
        const dt = new Date(this.timestamp * 1000).toISOString().replace('T', ' ').slice(0, 19);
        return `${pin}${title} (${dt})`;
    }
}

module.exports = { ChatTurn, ChatHistory, ChatInfo };
