'use strict';

function decodeHtml(str) {
    if (!str) return str;
    return str
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
        .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, ' ')
        .replace(/&copy;/g, '\u00a9').replace(/&reg;/g, '\u00ae').replace(/&trade;/g, '\u2122')
        .replace(/&mdash;/g, '\u2014').replace(/&ndash;/g, '\u2013').replace(/&hellip;/g, '\u2026')
        .replace(/&laquo;/g, '\u00ab').replace(/&raquo;/g, '\u00bb')
        .replace(/&ldquo;/g, '\u201c').replace(/&rdquo;/g, '\u201d')
        .replace(/&lsquo;/g, '\u2018').replace(/&rsquo;/g, '\u2019');
}

class Response {
    constructor({ text, thoughts = null, images = [], videos = [], media = [], cid, rid, rcid } = {}) {
        this.text = text ? decodeHtml(text) : '';
        this.thoughts = thoughts ? decodeHtml(thoughts) : null;
        this.images = images;
        this.videos = videos;
        this.media = media;
        Object.defineProperty(this, '_cid', { value: cid, enumerable: false, writable: true });
        Object.defineProperty(this, '_rid', { value: rid, enumerable: false, writable: true });
        Object.defineProperty(this, '_rcid', { value: rcid, enumerable: false, writable: true });
    }

    toString() { return this.text; }
}

module.exports = { Response };
