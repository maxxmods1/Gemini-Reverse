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
        index = 0,
        text,
        text_delta = null,
        thoughts = null,
        thoughts_delta = null,
        web_images = [],
        generated_images = [],
        generated_videos = [],
        generated_media = [],
        deep_research_plan = null,
        done = false,
    } = {}) {
        this.index = index;
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
        this.done = done;
    }

    get images() { return [...this.web_images, ...this.generated_images]; }
    get videos() { return this.generated_videos; }
    get media() { return this.generated_media; }

    toString() { return this.text; }

    [inspect.custom]() {
        const lines = [`  Candidate {`];
        lines.push(`    index: ${this.index}`);
        lines.push(`    rcid: '${this.rcid}'`);
        lines.push(`    done: ${this.done}`);
        lines.push(`    text: ${inspect(this.text)}`);
        if (this.thoughts) lines.push(`    thoughts: ${inspect(this.thoughts)}`);
        if (this.images.length) lines.push(`    images: [${this.images.length}]`);
        if (this.videos.length) lines.push(`    videos: [${this.videos.length}]`);
        if (this.media.length) lines.push(`    media: [${this.media.length}]`);
        if (this.deep_research_plan) lines.push(`    deep_research_plan: '${this.deep_research_plan.research_id}'`);
        lines.push(`  }`);
        return lines.join('\n');
    }
}

class ModelOutput {
    constructor(metadata, candidates, { chosen = 0, model = '', gem = null } = {}) {
        this.cid = metadata?.[0] || '';
        this.rid = metadata?.[1] || '';
        this.model = model;
        this.gem = gem;
        this.created = Date.now();
        this.candidates = candidates;
        this.chosen = chosen;
        this._metadata = metadata;
    }

    get rcid() { return this.candidates[this.chosen]?.rcid || ''; }
    get done() { return this.candidates.length > 0 && this.candidates.every(c => c.done); }

    get text() { return this.candidates[this.chosen]?.text || ''; }
    get text_delta() { return this.candidates[this.chosen]?.text_delta || ''; }
    get thoughts() { return this.candidates[this.chosen]?.thoughts || null; }
    get thoughts_delta() { return this.candidates[this.chosen]?.thoughts_delta || ''; }
    get images() { return this.candidates[this.chosen]?.images || []; }
    get videos() { return this.candidates[this.chosen]?.videos || []; }
    get media() { return this.candidates[this.chosen]?.media || []; }
    get deep_research_plan() { return this.candidates[this.chosen]?.deep_research_plan || null; }

    get metadata() { return this._metadata; }
    set metadata(v) { this._metadata = v; }

    async saveAll({ path = 'temp', verbose = false } = {}) {
        const c = this.candidates[this.chosen];
        if (!c) return { images: [], videos: [], media: [] };
        const images = await Promise.all(c.images.map(img => img.save({ path, verbose })));
        const videos = await Promise.all(c.videos.map(vid => vid.save({ savePath: path, verbose })));
        const media = await Promise.all(c.media.map(m => m.save({ savePath: path, verbose })));
        return { images, videos, media };
    }

    toString() { return this.text; }

    [inspect.custom]() {
        const lines = ['ModelOutput {'];
        lines.push(`  cid: '${this.cid}'`);
        lines.push(`  rid: '${this.rid}'`);
        lines.push(`  rcid: '${this.rcid}'`);
        lines.push(`  model: '${this.model}'`);
        if (this.gem) lines.push(`  gem: '${this.gem}'`);
        lines.push(`  created: ${this.created}`);
        lines.push(`  done: ${this.done}`);
        lines.push(`  candidates: [`);
        for (const c of this.candidates) lines.push(inspect(c));
        lines.push(`  ]`);
        lines.push('}');
        return lines.join('\n');
    }
}

module.exports = { Candidate, ModelOutput };
