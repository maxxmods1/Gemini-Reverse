'use strict';

const { inspect } = require('util');
const { WebImage, GeneratedImage } = require('./media');

function decodeHtml(str) {
    if (!str) return str;
    return str
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&copy;/g, '©')
        .replace(/&reg;/g, '®')
        .replace(/&trade;/g, '™')
        .replace(/&mdash;/g, '—')
        .replace(/&ndash;/g, '–')
        .replace(/&hellip;/g, '…')
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&lsquo;/g, '‘')
        .replace(/&rsquo;/g, '’');
}

class Candidate {
    constructor({
        rcid,
        text,
        text_delta = null,
        thoughts = null,
        thoughts_delta = null,
        web_images = [],
        generated_images = [],
        generated_videos = [],
        generated_media = [],
        deep_research_plan = null,
    } = {}) {
        this.rcid = rcid;
        this.text = decodeHtml(text);
        this.text_delta = text_delta;
        this.thoughts = thoughts ? decodeHtml(thoughts) : null;
        this.thoughts_delta = thoughts_delta;
        this.web_images = web_images;
        this.generated_images = generated_images;
        this.generated_videos = generated_videos;
        this.generated_media = generated_media;
        this.deep_research_plan = deep_research_plan;
    }

    get images() {
        return [...this.web_images, ...this.generated_images];
    }

    toString() { return this.text; }

    [inspect.custom]() {
        const lines = [`Candidate {`];
        lines.push(`  rcid: '${this.rcid}'`);
        lines.push(`  text: ${inspect(this.text)}`);
        if (this.thoughts) lines.push(`  thoughts: ${inspect(this.thoughts)}`);
        if (this.web_images.length) lines.push(`  web_images: ${inspect(this.web_images)}`);
        if (this.generated_images.length) lines.push(`  generated_images: ${inspect(this.generated_images)}`);
        if (this.generated_videos.length) lines.push(`  generated_videos: ${inspect(this.generated_videos)}`);
        if (this.generated_media.length) lines.push(`  generated_media: ${inspect(this.generated_media)}`);
        if (this.deep_research_plan) lines.push(`  deep_research_plan: DeepResearchPlan { research_id: '${this.deep_research_plan.research_id}' }`);
        lines.push('}');
        return lines.join('\n');
    }
}

class ModelOutput {
    constructor(metadata, candidates, chosen = 0) {
        this.metadata = metadata;
        this.candidates = candidates;
        this.chosen = chosen;
    }

    get text() { return this.candidates[this.chosen].text; }
    get text_delta() { return this.candidates[this.chosen].text_delta || ''; }
    get thoughts() { return this.candidates[this.chosen].thoughts; }
    get thoughts_delta() { return this.candidates[this.chosen].thoughts_delta || ''; }
    get images() { return this.candidates[this.chosen].images; }
    get videos() { return this.candidates[this.chosen].generated_videos || []; }
    get media() { return this.candidates[this.chosen].generated_media || []; }
    get deep_research_plan() { return this.candidates[this.chosen].deep_research_plan || null; }
    get rcid() { return this.candidates[this.chosen].rcid; }

    toString() { return this.text; }

    [inspect.custom]() {
        const [cid, rid] = this.metadata || [];
        const lines = ['ModelOutput {'];
        if (cid) lines.push(`  cid: '${cid}'`);
        if (rid) lines.push(`  rid: '${rid}'`);
        lines.push(`  rcid: '${this.rcid}'`);
        lines.push(`  text: ${inspect(this.text)}`);
        if (this.thoughts) lines.push(`  thoughts: ${inspect(this.thoughts)}`);
        lines.push(`  images: ${inspect(this.images)}`);
        lines.push(`  videos: ${inspect(this.videos)}`);
        lines.push(`  media: ${inspect(this.media)}`);
        if (this.deep_research_plan) lines.push(`  deep_research_plan: DeepResearchPlan { research_id: '${this.deep_research_plan.research_id}' }`);
        if (this.candidates.length > 1) lines.push(`  candidates: [ ${this.candidates.length} total, chosen: ${this.chosen} ]`);
        lines.push('}');
        return lines.join('\n');
    }
}

module.exports = { Candidate, ModelOutput };
