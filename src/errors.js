'use strict';

class AuthError extends Error {
    constructor(m) { super(m); this.name = 'AuthError'; }
}

class APIError extends Error {
    constructor(m) { super(m); this.name = 'APIError'; }
}

class GeminiError extends Error {
    constructor(m) { super(m); this.name = 'GeminiError'; }
}

class UsageLimitExceeded extends GeminiError {
    constructor(m) { super(m); this.name = 'UsageLimitExceeded'; }
}

class ModelInvalid extends GeminiError {
    constructor(m) { super(m); this.name = 'ModelInvalid'; }
}

class TemporarilyBlocked extends GeminiError {
    constructor(m) { super(m); this.name = 'TemporarilyBlocked'; }
}

module.exports = { AuthError, APIError, GeminiError, UsageLimitExceeded, ModelInvalid, TemporarilyBlocked };
