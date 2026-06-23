'use strict';

const { DEFAULT_METADATA } = require('./constants');
const { Model } = require('./constants');

class ChatSession {
    constructor(client, { model = Model.UNSPECIFIED, temporary = false, gem = null, metadata = null } = {}) {
        this.client = client;
        this._meta = [...DEFAULT_METADATA];
        this.gem = gem;
        this.temporary = temporary;
        this.model = client._resolveModel(model);
        if (metadata) {
            for (let i = 0; i < metadata.length && i < 10; i++) {
                if (metadata[i] != null) this._meta[i] = metadata[i];
            }
        }
    }

    get cid() { return this._meta[0]; }
    set cid(v) { this._meta[0] = v; }
    get rid() { return this._meta[1]; }
    set rid(v) { this._meta[1] = v; }
    get rcid() { return this._meta[2]; }
    set rcid(v) { this._meta[2] = v; }
    get metadata() { return this._meta; }
    set metadata(v) {
        if (!Array.isArray(v)) return;
        for (let i = 0; i < v.length && i < 10; i++) {
            if (v[i] != null) this._meta[i] = v[i];
        }
    }

    async generateContent({ prompt, files = null, deep_research = false, extended_thinking = false } = {}) {
        if (!prompt) throw new Error('Prompt cannot be empty.');
        const output = await this.client._generateContent({
            prompt, files, model: this.model, gem: this.gem,
            chat: this, temporary: this.temporary,
            deep_research, extended_thinking,
        });
        this.lastOutput = output;
        return output;
    }

    async *generateContentStream({ prompt, files = null, deep_research = false, extended_thinking = false } = {}) {
        if (!prompt) throw new Error('Prompt cannot be empty.');
        let lastOutput;
        for await (const out of this.client._generateContentStream({
            prompt, files, model: this.model, gem: this.gem,
            chat: this, temporary: this.temporary,
            deep_research, extended_thinking,
        })) {
            lastOutput = out;
            yield out;
        }
        if (lastOutput) {
            this.lastOutput = lastOutput;
        }
    }

    chooseCandidate(index) {
        if (!this.lastOutput) throw new Error('No response yet.');
        if (index < 0 || index >= this.lastOutput.candidates.length) throw new Error('Invalid candidate index.');
        this.rcid = this.lastOutput.candidates[index].rcid;
        this.lastOutput.chosen = index;
    }

    async delete() {
        if (this.cid) await this.client.deleteChat(this.cid);
    }
}

module.exports = { ChatSession };
