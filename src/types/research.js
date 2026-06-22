'use strict';

class DeepResearchPlan {
    constructor({
        research_id = null,
        title = null,
        query = null,
        steps = [],
        eta_text = null,
        confirm_prompt = null,
        modify_prompt = null,
        confirmation_url = null,
        metadata = [],
        cid = null,
        response_text = null,
        raw_state = null,
    } = {}) {
        this.research_id = research_id;
        this.title = title;
        this.query = query;
        this.steps = steps;
        this.eta_text = eta_text;
        this.confirm_prompt = confirm_prompt;
        this.modify_prompt = modify_prompt;
        this.confirmation_url = confirmation_url;
        this.metadata = metadata;
        this.cid = cid;
        this.response_text = response_text;
        this.raw_state = raw_state;
    }
}

class DeepResearchStatus {
    constructor({
        research_id,
        state = 'running',
        title = null,
        query = null,
        cid = null,
        notes = [],
        done = false,
        raw_state = null,
        raw = null,
    } = {}) {
        this.research_id = research_id;
        this.state = state;
        this.title = title;
        this.query = query;
        this.cid = cid;
        this.notes = notes;
        this.done = done;
        this.raw_state = raw_state;
        this.raw = raw;
    }
}

class DeepResearchResult {
    constructor({ plan, start_output = null, final_output = null, statuses = [], done = false } = {}) {
        this.plan = plan;
        this.start_output = start_output;
        this.final_output = final_output;
        this.statuses = statuses;
        this.done = done;
    }

    get text() {
        return this.final_output ? this.final_output.text : '';
    }
}

module.exports = { DeepResearchPlan, DeepResearchStatus, DeepResearchResult };
