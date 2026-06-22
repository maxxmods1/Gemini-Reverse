export interface ModelHeader {
    'x-goog-ext-525001261-jspb'?: string;
    'x-goog-ext-73010989-jspb'?: string;
    'x-goog-ext-73010990-jspb'?: string;
    [key: string]: string | undefined;
}

export interface ModelDef {
    model_name: string;
    model_header: ModelHeader;
    advanced_only: boolean;
}

export interface ModelDict {
    model_name: string;
    model_header: ModelHeader;
}

export type ModelInput = string | ModelDef | ModelDict | AvailableModel | null;

export declare function buildModelHeader(modelId: string, capacityTail: string | number, modelNumber?: number): ModelHeader;

export declare const MODEL_HEADER_KEY: string;
export declare const STREAMING_FLAG_INDEX: number;
export declare const GEM_FLAG_INDEX: number;
export declare const TEMPORARY_CHAT_FLAG_INDEX: number;
export declare const CARD_CONTENT_RE: RegExp;
export declare const ARTIFACTS_RE: RegExp;
export declare const DEFAULT_METADATA: (string | null)[];

export declare const Model: {
    readonly UNSPECIFIED: ModelDef;
    readonly BASIC_PRO: ModelDef;
    readonly BASIC_FLASH: ModelDef;
    readonly BASIC_LITE: ModelDef;
    readonly PLUS_PRO: ModelDef;
    readonly PLUS_FLASH: ModelDef;
    readonly PLUS_LITE: ModelDef;
    readonly ADVANCED_PRO: ModelDef;
    readonly ADVANCED_FLASH: ModelDef;
    readonly ADVANCED_LITE: ModelDef;
    fromName(name: string): ModelDef;
    fromDict(d: ModelDict): ModelDef;
    modelId(model: ModelDef): string;
};

export declare class AccountStatus {
    readonly name: string;
    readonly value: number;
    readonly description: string;
    constructor(name: string, value: number, description: string);
    static fromStatusCode(code: number | null | undefined): AccountStatus;
    static readonly AVAILABLE: AccountStatus;
    static readonly ACCESS_TEMPORARILY_UNAVAILABLE: AccountStatus;
    static readonly UNAUTHENTICATED: AccountStatus;
    static readonly ACCOUNT_REJECTED: AccountStatus;
    static readonly ACCOUNT_UNTRUSTED: AccountStatus;
    static readonly TOS_PENDING: AccountStatus;
    static readonly TOS_OUT_OF_DATE: AccountStatus;
    static readonly ACCOUNT_REJECTED_BY_GUARDIAN: AccountStatus;
    static readonly GUARDIAN_APPROVAL_REQUIRED: AccountStatus;
    static readonly LOCATION_REJECTED: AccountStatus;
}

export declare const ErrorCode: {
    readonly TEMPORARY_ERROR_1013: 1013;
    readonly USAGE_LIMIT_EXCEEDED: 1037;
    readonly MODEL_INCONSISTENT: 1050;
    readonly MODEL_HEADER_INVALID: 1052;
    readonly IP_TEMPORARILY_BLOCKED: 1060;
};

export declare const GRPC: Record<string, string>;
export declare const Endpoint: Record<string, string>;
export declare const Headers: Record<string, Record<string, string>>;

export declare class AuthError extends Error { name: 'AuthError'; }
export declare class APIError extends Error { name: 'APIError'; }
export declare class ImageGenerationError extends APIError { name: 'ImageGenerationError'; }
export declare class GeminiError extends Error { name: 'GeminiError'; }
export declare class TimeoutError extends GeminiError { name: 'TimeoutError'; }
export declare class UsageLimitExceeded extends GeminiError { name: 'UsageLimitExceeded'; }
export declare class ModelInvalid extends GeminiError { name: 'ModelInvalid'; }
export declare class TemporarilyBlocked extends GeminiError { name: 'TemporarilyBlocked'; }

export declare class AvailableModel {
    model_id: string;
    model_name: string;
    display_name: string;
    description: string;
    capacity: number;
    capacity_field: number;
    model_number: number;
    is_available: boolean;
    constructor(opts: {
        model_id: string;
        model_name: string;
        display_name: string;
        description: string;
        capacity: number;
        capacity_field?: number;
        model_number?: number;
        is_available?: boolean;
    });
    get model_header(): ModelHeader;
    get advanced_only(): boolean;
    toString(): string;
    static computeCapacity(tierFlags: number[], capabilityFlags: number[]): [number, number];
    static buildModelIdNameMapping(): Record<string, string>;
    static buildModelIdNumberMapping(): Record<string, number>;
}

export declare class RPCData {
    rpcid: string;
    payload: string;
    identifier: string;
    constructor(opts: { rpcid: string; payload: string; identifier?: string });
    serialize(): [string, string, null, string];
    toString(): string;
}

export declare class WebImage {
    url: string;
    alt: string;
    type: 'web';
    constructor(opts: { url: string; alt?: string });
}

export declare class GeneratedImage {
    url: string;
    alt: string;
    type: 'generated';
    constructor(opts: { url: string; alt?: string });
}

export declare class GeneratedVideo {
    url: string;
    thumbnail: string;
    constructor(opts: { url: string; thumbnail?: string });
}

export declare class GeneratedMedia {
    url: string;
    thumbnail: string;
    mp3_url: string;
    mp3_thumbnail: string;
    constructor(opts: { url?: string; thumbnail?: string; mp3_url?: string; mp3_thumbnail?: string });
}

export declare class DeepResearchPlan {
    research_id: string | null;
    title: string | null;
    query: string | null;
    steps: string[];
    eta_text: string | null;
    confirm_prompt: string | null;
    modify_prompt: string | null;
    confirmation_url: string | null;
    metadata: (string | null)[];
    cid: string | null;
    response_text: string | null;
    raw_state: number | null;
    constructor(opts?: Partial<DeepResearchPlan>);
}

export declare class DeepResearchStatus {
    research_id: string;
    state: string;
    title: string | null;
    query: string | null;
    cid: string | null;
    notes: string[];
    done: boolean;
    raw_state: number | null;
    raw: unknown;
    constructor(opts: {
        research_id: string;
        state?: string;
        title?: string | null;
        query?: string | null;
        cid?: string | null;
        notes?: string[];
        done?: boolean;
        raw_state?: number | null;
        raw?: unknown;
    });
}

export declare class DeepResearchResult {
    plan: DeepResearchPlan;
    final_output: ModelOutput | null;
    statuses: DeepResearchStatus[];
    done: boolean;
    constructor(opts: {
        plan: DeepResearchPlan;
        final_output?: ModelOutput | null;
        statuses?: DeepResearchStatus[];
        done?: boolean;
    });
    get text(): string;
}

export declare class Candidate {
    rcid: string;
    text: string;
    text_delta: string | null;
    thoughts: string | null;
    thoughts_delta: string | null;
    web_images: WebImage[];
    generated_images: GeneratedImage[];
    generated_videos: GeneratedVideo[];
    generated_media: GeneratedMedia[];
    deep_research_plan: DeepResearchPlan | null;
    constructor(opts: {
        rcid: string;
        text: string;
        text_delta?: string | null;
        thoughts?: string | null;
        thoughts_delta?: string | null;
        web_images?: WebImage[];
        generated_images?: GeneratedImage[];
        generated_videos?: GeneratedVideo[];
        generated_media?: GeneratedMedia[];
        deep_research_plan?: DeepResearchPlan | null;
    });
    get images(): (WebImage | GeneratedImage)[];
    toString(): string;
}

export declare class ModelOutput {
    metadata: (string | null)[];
    candidates: Candidate[];
    chosen: number;
    constructor(metadata: (string | null)[], candidates: Candidate[], chosen?: number);
    get text(): string;
    get text_delta(): string;
    get thoughts(): string | null;
    get thoughts_delta(): string;
    get images(): (WebImage | GeneratedImage)[];
    get videos(): GeneratedVideo[];
    get media(): GeneratedMedia[];
    get deep_research_plan(): DeepResearchPlan | null;
    get rcid(): string;
    toString(): string;
}

export declare class Response {
    text: string;
    thoughts: string | null;
    images: (WebImage | GeneratedImage)[];
    videos: GeneratedVideo[];
    media: GeneratedMedia[];
    constructor(opts: {
        text?: string;
        thoughts?: string | null;
        images?: (WebImage | GeneratedImage)[];
        videos?: GeneratedVideo[];
        media?: GeneratedMedia[];
        cid?: string;
        rid?: string;
        rcid?: string;
    });
    toString(): string;
}

export declare class ChatTurn {
    role: 'user' | 'model';
    text: string;
    model_output: ModelOutput | null;
    constructor(opts: { role: 'user' | 'model'; text: string; model_output?: ModelOutput | null });
    toString(): string;
}

export declare class ChatHistory {
    cid: string;
    turns: ChatTurn[];
    constructor(opts: { cid: string; turns?: ChatTurn[] });
    toString(): string;
}

export declare class ChatInfo {
    cid: string;
    title: string;
    is_pinned: boolean;
    timestamp: number;
    constructor(opts: { cid: string; title: string; is_pinned?: boolean; timestamp: number });
    toString(): string;
}

export declare class Gem {
    id: string;
    name: string;
    description: string | null;
    prompt: string | null;
    predefined: boolean;
    constructor(opts: { id: string; name: string; description?: string | null; prompt?: string | null; predefined: boolean });
    toString(): string;
}

export interface GemGetOptions {
    id?: string | null;
    name?: string | null;
    defaultVal?: Gem | null;
}

export interface GemFilterOptions {
    predefined?: boolean | null;
    name?: string | null;
}

export declare class GemJar {
    constructor(entries?: [string, Gem][]);
    set(id: string, gem: Gem): void;
    get(opts: GemGetOptions): Gem | null;
    filter(opts?: GemFilterOptions): GemJar;
    values(): Gem[];
    keys(): string[];
    entries(): [string, Gem][];
    [Symbol.iterator](): Iterator<Gem>;
    toObject(): Record<string, Gem>;
}

export interface GeminiOptions {
    secure_1psid?: string | null;
    secure_1psidts?: string | null;
    proxy?: string | null;
    cookies?: Record<string, string>;
    timeout?: number;
    autoClose?: boolean;
    closeDelay?: number;
    autoRefresh?: boolean;
    refreshInterval?: number;
    verbose?: boolean;
    watchdogTimeout?: number;
}

export interface NewChatOptions {
    model?: ModelInput;
    temporary?: boolean;
    gem?: Gem | string | null;
    metadata?: (string | null)[] | null;
}

export interface GenerateContentOptions {
    prompt: string;
    files?: string[] | null;
    deep_research?: boolean;
    extended_thinking?: boolean;
}

export interface ResearchOptions {
    wait?: boolean;
    pollInterval?: number;
    timeout?: number;
    onStatus?: ((status: DeepResearchStatus) => void) | null;
}

export interface AddGemOptions {
    name: string;
    prompt: string;
    description?: string;
}

export interface SetGemOptions {
    gem: Gem | string;
    name: string;
    prompt: string;
    description?: string;
}

export interface AccountInfo {
    status: { code: number | undefined; name: string };
    models: { id: string; name: string; display: string; available: boolean }[];
    quotas: Record<string, unknown>;
    abuse_clean: boolean | null;
}

export declare class Gemini {
    cookies: Record<string, string>;
    proxy: string | null;
    accessToken: string | null;
    buildLabel: string | null;
    sessionId: string | null;
    language: string;
    pushId: string;
    accountStatus: AccountStatus;
    timeout: number;
    autoClose: boolean;
    closeDelay: number;
    autoRefresh: boolean;
    refreshInterval: number;
    verbose: boolean;
    watchdogTimeout: number;

    constructor(opts?: GeminiOptions);

    init(): Promise<void>;
    close(delay?: number): Promise<void>;

    newChat(opts?: NewChatOptions): ChatSession;

    models(): Promise<AvailableModel[]>;
    account(): Promise<AccountInfo>;

    chats(): Promise<unknown[]>;
    readChat(cid: string, limit?: number): Promise<{ role: string; text: string }[]>;
    deleteChat(cid: string): Promise<void>;

    gems(): Promise<{ id: string; name: string; description: string; prompt: string | null; predefined: boolean }[]>;
    addGem(opts: AddGemOptions): Promise<{ id: string; name: string; description: string; prompt: string; predefined: boolean }>;
    setGem(opts: SetGemOptions): Promise<{ id: string; name: string; description: string; prompt: string; predefined: boolean }>;
    delGem(gem: { id: string } | string): Promise<void>;

    research(prompt: string, opts?: ResearchOptions): Promise<{ plan: DeepResearchPlan; text?: string; done?: boolean }>;
}

export declare class ChatSession {
    client: Gemini;
    model: ModelDef | AvailableModel;
    gem: Gem | string | null;
    temporary: boolean;
    lastOutput: ModelOutput | null;

    constructor(client: Gemini, opts?: NewChatOptions);

    get metadata(): (string | null)[];
    set metadata(v: (string | null)[]);
    get cid(): string;
    set cid(v: string);
    get rid(): string;
    set rid(v: string);
    get rcid(): string;
    set rcid(v: string);

    generateContent(opts: GenerateContentOptions): Promise<Response>;
    generateContentStream(opts: GenerateContentOptions): AsyncGenerator<string>;

    delete(): Promise<void>;
}
