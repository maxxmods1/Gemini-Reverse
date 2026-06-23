'use strict';

const STREAMING_FLAG_INDEX = 7;
const GEM_FLAG_INDEX = 19;
const TEMPORARY_CHAT_FLAG_INDEX = 45;

const CARD_CONTENT_RE = /^http:\/\/googleusercontent\.com\/card_content\/\d+/;
const ARTIFACTS_RE = /http:\/\/googleusercontent\.com\/\w+\/\d+\n*/g;
const DEFAULT_METADATA = ['', '', '', null, null, null, null, null, null, ''];
const MODEL_HEADER_KEY = 'x-goog-ext-525001261-jspb';

function buildModelHeader(modelId, capacityTail, modelNumber = 1) {
    return {
        [MODEL_HEADER_KEY]: `[1,null,null,null,"${modelId}",null,null,0,[4,5,6,8],null,null,${capacityTail},null,null,${modelNumber}]`,
        'x-goog-ext-73010989-jspb': '[0]',
        'x-goog-ext-73010990-jspb': '[0,0,0]',
    };
}

const Endpoint = {
    GOOGLE: 'https://www.google.com',
    INIT: 'https://gemini.google.com/app',
    GENERATE: 'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate',
    ROTATE_COOKIES: 'https://accounts.google.com/RotateCookies',
    UPLOAD: 'https://content-push.googleapis.com/upload',
    BATCH_EXEC: 'https://gemini.google.com/_/BardChatUi/data/batchexecute',
};

const GRPC = {
    LIST_CHATS: 'MaZiqc',
    READ_CHAT: 'hNvQHb',
    GET_CONVERSATION_TURN: 'EqPOKe',
    DELETE_CHAT_1: 'GzXR5e',
    DELETE_CHAT_2: 'qWymEb',
    UPDATE_CONVERSATION: 'MUAZcd',
    MARK_LAST_CONVERSATION_TURN: 'kOWVAe',
    GENERATE_HEADLINE: 'ukz1Fe',

    LIST_GEMS: 'CNgdBe',
    CREATE_GEM: 'oMH3Zd',
    GET_GEM: 'HcT8bb',
    UPDATE_GEM: 'kHv0Vd',
    DELETE_GEM: 'UXcSJb',
    DELETE_GEM_AND_CONVERSATIONS: 'Nwkn9',

    CREATE_TASK: 'Jba3ib',
    GET_TASK: 'kwDCne',
    GET_ALL_TASKS: 'XPSWpd',
    GET_TASKS_IN_CONVERSATION: 'qWymEb',
    GET_CANDIDATES: 'PCck7e',
    LIST_DISCOVERY_CARDS: 'ku4Jyf',
    GET_DISCOVERY_CARD: 'oApPWc',
    LIST_DISCOVERY_BANNERS: 'Te6DCf',

    DEEP_RESEARCH_STATUS: 'kwDCne',
    DEEP_RESEARCH_PREFS: 'L5adhe',
    DEEP_RESEARCH_BOOTSTRAP: 'ku4Jyf',
    DEEP_RESEARCH_MODEL_STATE: 'qpEbW',
    DEEP_RESEARCH_CAPS: 'aPya6c',
    DEEP_RESEARCH_ACK: 'PCck7e',

    LIST_GEMINI_APP_ARTIFACTS: 'jGArJ',
    DELETE_GEMINI_APP_ARTIFACTS: 'PGX16d',

    LIST_MEMORIES: 'ZKcapf',
    CREATE_MEMORY: 'xVRQX',
    UPDATE_MEMORY: 'gSnMcd',
    DELETE_MEMORY: 'Ok9j9b',
    DELETE_ALL_MEMORIES: 'YgU2Cc',

    GET_USER_STATUS: 'otAQ7b',
    LIST_MODELS: 'otAQ7b',
    CHECK_GEMINI_QUOTA: 'qpEbW',
    CHECK_QUOTA: 'aPya6c',
    GET_FULL_SIZE_IMAGE: 'c8o8Fe',
    GET_ABUSE_STATUS: 'GPRiHf',
    UPDATE_USER_PREFERENCES: 'L5adhe',
    READ_USER_PREFERENCES: 'ESY5D',
    BARD_SETTINGS: 'ESY5D',
    CONTINUE_SHARED_CONVERSATION: 'ra9Swb',
    GET_USAGE_INFO: 'jSf9Qc',
};

const Headers = {
    REFERER: {
        'Origin': 'https://gemini.google.com',
        'Referer': 'https://gemini.google.com/',
    },
    SAME_DOMAIN: {
        'X-Same-Domain': '1',
    },
    GEMINI: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        'Origin': 'https://gemini.google.com',
        'Referer': 'https://gemini.google.com/',
    },
    ROTATE_COOKIES: {
        'Content-Type': 'application/json',
        'Origin': 'https://accounts.google.com',
    },
    UPLOAD: { 'X-Tenant-Id': 'bard-storage' },
    BATCH_EXEC: {
        'x-goog-ext-525001261-jspb': '[1,null,null,null,null,null,null,null,[4,5,6,8],null,null,null,null,null,null,null]',
        'x-goog-ext-73010989-jspb': '[0]',
    },
};

const _MODEL_KEYS = [
    'UNSPECIFIED',
    'BASIC_PRO', 'BASIC_FLASH', 'BASIC_LITE', 'BASIC_THINKING',
    'PLUS_PRO', 'PLUS_FLASH', 'PLUS_LITE',
    'ADVANCED_PRO', 'ADVANCED_FLASH', 'ADVANCED_LITE',
];

const Model = {
    UNSPECIFIED: { model_name: 'unspecified', model_header: {}, advanced_only: false },
    BASIC_PRO: {
        model_name: 'gemini-3-pro',
        model_header: buildModelHeader('9d8ca3786ebdfbea', 1, 3),
        advanced_only: false,
    },
    BASIC_FLASH: {
        model_name: 'gemini-3-flash',
        model_header: buildModelHeader('fbb127bbb056c959', 1, 1),
        advanced_only: false,
    },
    BASIC_LITE: {
        model_name: 'gemini-3-lite',
        model_header: buildModelHeader('cf41b0e0dd7d53e5', 1, 6),
        advanced_only: false,
    },
    BASIC_THINKING: {
        model_name: 'gemini-3-thinking',
        model_header: buildModelHeader('5bf011840784117a', 1, 15),
        advanced_only: false,
    },
    PLUS_PRO: {
        model_name: 'gemini-3-pro-plus',
        model_header: buildModelHeader('e6fa609c3fa255c0', 4, 3),
        advanced_only: true,
    },
    PLUS_FLASH: {
        model_name: 'gemini-3-flash-plus',
        model_header: buildModelHeader('56fdd199312815e2', 4, 1),
        advanced_only: true,
    },
    PLUS_LITE: {
        model_name: 'gemini-3-lite-plus',
        model_header: buildModelHeader('8c46e95b1a07cecc', 4, 6),
        advanced_only: true,
    },
    ADVANCED_PRO: {
        model_name: 'gemini-3-pro-advanced',
        model_header: buildModelHeader('e6fa609c3fa255c0', 2, 3),
        advanced_only: true,
    },
    ADVANCED_FLASH: {
        model_name: 'gemini-3-flash-advanced',
        model_header: buildModelHeader('56fdd199312815e2', 2, 1),
        advanced_only: true,
    },
    ADVANCED_LITE: {
        model_name: 'gemini-3-lite-advanced',
        model_header: buildModelHeader('8c46e95b1a07cecc', 2, 6),
        advanced_only: true,
    },
    fromName(name) {
        const lower = name.toLowerCase();
        for (const k of _MODEL_KEYS) {
            if (Model[k].model_name === lower) return Model[k];
        }
        const names = _MODEL_KEYS.map(k => Model[k].model_name).join(', ');
        throw new Error(`Unknown model name: ${name}. Available: ${names}`);
    },
    fromDict(d) {
        if (!d.model_name || !d.model_header || typeof d.model_header !== 'object') {
            throw new Error("model_name and model_header (object) required");
        }
        return { model_name: d.model_name, model_header: d.model_header, advanced_only: false };
    },
    modelId(model) {
        const headerValue = model && model.model_header && model.model_header[MODEL_HEADER_KEY];
        if (!headerValue) return '';
        try {
            const parsed = JSON.parse(headerValue);
            return (parsed && parsed[4]) || '';
        } catch {
            return '';
        }
    },
};

class AccountStatus {
    constructor(name, value, description) {
        this.name = name;
        this.value = value;
        this.description = description;
    }

    static fromStatusCode(code) {
        if (code == null || code === 1000) return AccountStatus.AVAILABLE;
        for (const status of Object.values(AccountStatus._all)) {
            if (status.value === code) return status;
        }
        return AccountStatus.ACCOUNT_REJECTED;
    }
}

AccountStatus.AVAILABLE = new AccountStatus('AVAILABLE', 1000, 'Account is authorized and has normal access.');
AccountStatus.ACCESS_TEMPORARILY_UNAVAILABLE = new AccountStatus('ACCESS_TEMPORARILY_UNAVAILABLE', 1014, 'Access is restricted, possibly due to regional or temporary session issues.');
AccountStatus.UNAUTHENTICATED = new AccountStatus('UNAUTHENTICATED', 1016, 'Session is not authenticated or cookies have expired. Please check your cookies.');
AccountStatus.ACCOUNT_REJECTED = new AccountStatus('ACCOUNT_REJECTED', 1021, 'Account access is rejected. Please check your Google Account settings.');
AccountStatus.ACCOUNT_UNTRUSTED = new AccountStatus('ACCOUNT_UNTRUSTED', 1033, 'Account did not pass safety or trust checks for some features.');
AccountStatus.TOS_PENDING = new AccountStatus('TOS_PENDING', 1040, 'You need to accept the latest Terms of Service to continue.');
AccountStatus.TOS_OUT_OF_DATE = new AccountStatus('TOS_OUT_OF_DATE', 1042, 'Terms of Service are out of date; please accept the new ones.');
AccountStatus.ACCOUNT_REJECTED_BY_GUARDIAN = new AccountStatus('ACCOUNT_REJECTED_BY_GUARDIAN', 1054, 'Access is blocked by a parent or guardian.');
AccountStatus.GUARDIAN_APPROVAL_REQUIRED = new AccountStatus('GUARDIAN_APPROVAL_REQUIRED', 1057, 'Access requires parent or guardian approval.');
AccountStatus.LOCATION_REJECTED = new AccountStatus('LOCATION_REJECTED', 1060, 'Gemini is not currently supported in your country/region.');

AccountStatus._all = {
    AVAILABLE: AccountStatus.AVAILABLE,
    ACCESS_TEMPORARILY_UNAVAILABLE: AccountStatus.ACCESS_TEMPORARILY_UNAVAILABLE,
    UNAUTHENTICATED: AccountStatus.UNAUTHENTICATED,
    ACCOUNT_REJECTED: AccountStatus.ACCOUNT_REJECTED,
    ACCOUNT_UNTRUSTED: AccountStatus.ACCOUNT_UNTRUSTED,
    TOS_PENDING: AccountStatus.TOS_PENDING,
    TOS_OUT_OF_DATE: AccountStatus.TOS_OUT_OF_DATE,
    ACCOUNT_REJECTED_BY_GUARDIAN: AccountStatus.ACCOUNT_REJECTED_BY_GUARDIAN,
    GUARDIAN_APPROVAL_REQUIRED: AccountStatus.GUARDIAN_APPROVAL_REQUIRED,
    LOCATION_REJECTED: AccountStatus.LOCATION_REJECTED,
};

const ErrorCode = {
    TEMPORARY_ERROR_1013: 1013,
    USAGE_LIMIT_EXCEEDED: 1037,
    MODEL_INCONSISTENT: 1050,
    MODEL_HEADER_INVALID: 1052,
    IP_TEMPORARILY_BLOCKED: 1060,
    FEATURE_NOT_AVAILABLE: 1097,
};

module.exports = {
    STREAMING_FLAG_INDEX,
    GEM_FLAG_INDEX,
    TEMPORARY_CHAT_FLAG_INDEX,
    CARD_CONTENT_RE,
    ARTIFACTS_RE,
    DEFAULT_METADATA,
    MODEL_HEADER_KEY,
    buildModelHeader,
    Endpoint,
    GRPC,
    Headers,
    Model,
    AccountStatus,
    ErrorCode,
};
