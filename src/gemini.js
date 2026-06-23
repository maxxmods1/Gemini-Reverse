'use strict';

const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const {
    Endpoint, GRPC, Headers, Model, AccountStatus, ErrorCode,
    TEMPORARY_CHAT_FLAG_INDEX, STREAMING_FLAG_INDEX, GEM_FLAG_INDEX,
    CARD_CONTENT_RE, ARTIFACTS_RE, DEFAULT_METADATA, MODEL_HEADER_KEY,
} = require('./constants');
const { APIError, GeminiError, UsageLimitExceeded, ModelInvalid, TemporarilyBlocked } = require('./errors');
const { AvailableModel, RPCData } = require('./types/model');
const { Candidate, ModelOutput } = require('./types/output');
const { WebImage, GeneratedImage, GeneratedVideo, GeneratedMedia } = require('./types/media');
const { DeepResearchPlan, DeepResearchStatus, DeepResearchResult } = require('./types/research');
const { ChatTurn, ChatHistory, ChatInfo } = require('./types/chat');
const { Gem, GemJar } = require('./types/gem');
const fs = require('fs');
const path = require('path');
const { getAccessToken, cookieStr, parseCookies, parseProxy, rotate1psidts } = require('./utils/auth');
const { uploadFile, parseFileName } = require('./utils/upload');
const { getDeltaByFpLen, getNestedValue, extractJsonFromResponse, StreamingFrameParser } = require('./utils/parser');
const { extractDeepResearchPlan, extractDeepResearchStatusPayload } = require('./utils/research');
const { ChatSession } = require('./chat');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const BARD_SETTINGS_PAYLOAD = '[[["adaptive_device_responses_enabled","advanced_mode_theme_override_triggered","advanced_zs_upsell_dismissal_count","advanced_zs_upsell_last_dismissed","ai_transparency_notice_dismissed","audio_overview_discovery_dismissal_count","audio_overview_discovery_last_dismissed","bard_in_chrome_link_sharing_enabled","bard_sticky_mode_disabled_count","canvas_create_discovery_tooltip_seen_count","combined_files_button_tag_seen_count","indigo_banner_explicit_dismissal_count","indigo_banner_impression_count","indigo_banner_last_seen_sec","current_popup_id","deep_research_has_seen_file_upload_tooltip","deep_research_model_update_disclaimer_display_count","default_bot_id","disabled_discovery_card_feature_ids","disabled_model_discovery_tooltip_feature_ids","disabled_mode_disclaimers","disabled_new_model_badge_mode_ids","disabled_settings_discovery_tooltip_feature_ids","disablement_disclaimer_last_dismissed_sec","disable_advanced_beta_dialog","disable_advanced_beta_non_en_banner","disable_advanced_resubscribe_ui","disable_at_mentions_discovery_tooltip","disable_autorun_fact_check_u18","disable_bot_create_tips_card","disable_bot_docs_in_gems_disclaimer","disable_bot_onboarding_dialog","disable_bot_save_reminder_tips_card","disable_bot_send_prompt_tips_card","disable_bot_shared_in_drive_disclaimer","disable_bot_try_create_tips_card","disable_colab_tooltip","disable_collapsed_tool_menu_tooltip","disable_continue_discovery_tooltip","disable_debug_info_moved_tooltip_v2","disable_enterprise_mode_dialog","disable_export_python_tooltip","disable_extensions_discovery_dialog","disable_extension_one_time_badge","disable_fact_check_tooltip_v2","disable_free_file_upload_tips_card","disable_generated_image_download_dialog","disable_get_app_banner","disable_get_app_desktop_dialog","disable_googler_in_enterprise_mode","disable_human_review_disclosure","disable_ice_open_vega_editor_tooltip","disable_image_upload_tooltip","disable_legal_concern_tooltip","disable_llm_history_import_disclaimer","disable_location_popup","disable_memory_discovery","disable_memory_extraction_discovery","disable_new_conversation_dialog","disable_onboarding_experience","disable_personal_context_tooltip","disable_photos_upload_disclaimer","disable_power_up_intro_tooltip","disable_scheduled_actions_mobile_notification_snackbar","disable_storybook_listen_button_tooltip","disable_streaming_settings_tooltip","disable_take_control_disclaimer","disable_teens_only_english_language_dialog","disable_tier1_rebranding_tooltip","disable_try_advanced_mode_dialog","enable_advanced_beta_mode","enable_advanced_mode","enable_googler_in_enterprise_mode","enable_memory","enable_memory_extraction","enable_personal_context","enable_personal_context_gemini","enable_personal_context_gemini_using_photos","enable_personal_context_gemini_using_workspace","enable_personal_context_search","enable_personal_context_youtube","enable_token_streaming","enforce_default_to_fast_version","mayo_discovery_banner_dismissal_count","mayo_discovery_banner_last_dismissed_sec","gempix_discovery_banner_dismissal_count","gempix_discovery_banner_last_dismissed","get_app_banner_ack_count","get_app_banner_seen_count","get_app_mobile_dialog_ack_count","guided_learning_banner_dismissal_count","guided_learning_banner_last_dismissed","has_accepted_agent_mode_fre_disclaimer","has_received_streaming_response","has_seen_agent_mode_tooltip","has_seen_bespoke_tooltip","has_seen_deepthink_mustard_tooltip","has_seen_deepthink_v2_tooltip","has_seen_deep_think_tooltip","has_seen_first_youtube_video_disclaimer","has_seen_ggo_tooltip","has_seen_image_grams_discovery_banner","has_seen_image_preview_in_input_area_tooltip","has_seen_kallo_discovery_banner","has_seen_kallo_tooltip","has_seen_model_picker_in_input_area_tooltip","has_seen_model_tooltip_in_input_area_for_gempix","has_seen_redo_with_gempix2_tooltip","has_seen_veograms_discovery_banner","has_seen_video_generation_discovery_banner","is_imported_chats_panel_open_by_default","jumpstart_onboarding_dismissal_count","last_dismissed_deep_research_implicit_invite","last_dismissed_discovery_feature_implicit_invites","last_dismissed_immersives_canvas_implicit_invite","last_dismissed_immersive_share_disclaimer_sec","last_dismissed_strike_timestamp_sec","last_dismissed_zs_student_aip_banner_sec","last_get_app_banner_ack_timestamp_sec","last_get_app_mobile_dialog_ack_timestamp_sec","last_human_review_disclosure_ack","last_selected_mode_id_in_embedded","last_selected_mode_id_on_web","last_two_up_activation_timestamp_sec","last_winter_olympics_interaction_timestamp_sec","memory_extracted_greeting_name","mini_gemini_tos_closed","mode_switcher_soft_badge_disabled_ids","mode_switcher_soft_badge_seen_count","personalization_first_party_onboarding_cross_surface_clicked","personalization_first_party_onboarding_cross_surface_seen_count","personalization_one_p_discovery_card_seen_count","personalization_one_p_discovery_last_consented","personalization_zero_state_card_last_interacted","personalization_zero_state_card_seen_count","popup_zs_visits_cooldown","require_reconsent_setting_for_personalization_banner_seen_count","show_debug_info","side_nav_open_by_default","student_verification_dismissal_count","student_verification_last_dismissed","task_viewer_cc_banner_dismissed_count","task_viewer_cc_banner_dismissed_time_sec","tool_menu_new_badge_disabled_ids","tool_menu_new_badge_impression_counts","tool_menu_soft_badge_disabled_ids","tool_menu_soft_badge_impression_counts","upload_disclaimer_last_consent_time_sec","viewed_student_aip_upsell_campaign_ids","voice_language","voice_name","web_and_app_activity_enabled","wellbeing_nudge_notice_last_dismissed_sec","zs_student_aip_banner_dismissal_count"]]]';

function normalizeCookies(cookies) {
    if (!cookies) return {};
    if (typeof cookies === 'string') {
        const resolved = path.resolve(cookies);
        let raw;
        try {
            raw = fs.readFileSync(resolved, 'utf8');
        } catch (e) {
            throw new Error(`cookies: cannot read file "${cookies}": ${e.message}`);
        }
        try {
            cookies = JSON.parse(raw);
        } catch (e) {
            throw new Error(`cookies: invalid JSON in "${cookies}": ${e.message}`);
        }
    }
    if (Array.isArray(cookies)) {
        const out = {};
        for (const c of cookies) {
            if (c && typeof c.name === 'string' && c.value !== undefined) {
                out[c.name] = String(c.value);
            }
        }
        return out;
    }
    if (typeof cookies === 'object') return { ...cookies };
    return {};
}

class Gemini {
    constructor({
        secure_1psid = null,
        secure_1psidts = null,
        proxy = null,
        cookies = {},
        timeout = 300000,
        autoClose = false,
        closeDelay = 300000,
        autoRefresh = true,
        refreshInterval = 540000,
        verbose = false,
        watchdogTimeout = 30000,
    } = {}) {
        this.cookies = normalizeCookies(cookies);
        this.proxy = proxy;
        this.verbose = verbose;
        this.timeout = timeout;
        this.autoClose = autoClose;
        this.closeDelay = closeDelay;
        this.autoRefresh = autoRefresh;
        this.refreshInterval = refreshInterval;
        this.watchdogTimeout = watchdogTimeout;
        const cookiePsid = secure_1psid;
        const cookiePsidts = secure_1psidts;

        this._ready = false;
        this._authed = false;
        this._anonymous = !cookiePsid && !this.cookies['__Secure-1PSID'];
        this.accessToken = null;
        this.buildLabel = null;
        this.sessionId = null;
        this.language = 'en';
        this.pushId = 'feeds/mcudyrk2a4khkz';
        this.accountStatus = AccountStatus.AVAILABLE;
        this.closeTask = null;
        this.refreshTask = null;
        this._sessionid = uuidv4().toUpperCase();
        this._reqid = Math.floor(Math.random() * 90000) + 10000;
        this._modelRegistry = {};
        this._recentChats = null;
        this._gemsCache = null;
        this._quotas = {};
        this._usageInfo = {};
        this._abuseStatus = null;
        this._lastActivityTime = 0;
        this._activityTask = null;
        this._initPromise = null;

        if (cookiePsid) {
            this.cookies['__Secure-1PSID'] = cookiePsid;
            if (cookiePsidts) this.cookies['__Secure-1PSIDTS'] = cookiePsidts;
        }
    }

    async _ensure() {
        if (this._ready) return;
        if (this._initPromise) return this._initPromise;
        this._initPromise = (async () => {
            this._ready = true;
            try {
                if (this._anonymous) {
                    await this._getAnonymousCookie();
                    this._modelRegistry['fbb127bbb056c959'] = new AvailableModel({
                        model_id: 'fbb127bbb056c959', model_name: 'gemini-3-flash',
                        display_name: 'Flash', description: 'Anonymous mode',
                        capacity: 1, capacity_field: 12, model_number: 1, is_available: true,
                    });
                    this.accountStatus = AccountStatus.UNAUTHENTICATED;
                } else {
                    const [accessToken, buildLabel, sessionId, language, pushId, validCookies] = await getAccessToken(
                        this.cookies, this.proxy, this.verbose,
                    );
                    this.accessToken = accessToken;
                    this.buildLabel = buildLabel;
                    this.sessionId = sessionId;
                    this.language = language || 'en';
                    this.pushId = pushId || 'feeds/mcudyrk2a4khkz';
                    this.cookies = validCookies;
                    this._sessionid = uuidv4().toUpperCase();
                    this._reqid = Math.floor(Math.random() * 90000) + 10000;

                    if (this.autoClose) this._resetCloseTask();
                    if (this.autoRefresh) this._startAutoRefresh();

                    await this._fetchUserStatus();

                    if (this._activityTask) { clearTimeout(this._activityTask); this._activityTask = null; }
                    if (this.autoRefresh && this._checkAccountStatus()) this._startActivityWatchdog();
                }
            } catch (e) {
                this._ready = false;
                this._initPromise = null;
                await this.close();
                throw e;
            }
        })();
        return this._initPromise;
    }

    async init() { return this._ensure(); }

    async _ensureResources() {
        await this._ensure();
        if (!this._authed) {
            this._authed = true;
            await this._syncActivity();
            await this._fetchRecentChats();
            await this._fetchQuota();
            await this._fetchExtraQuota();
            await this._fetchAbuseStatus();
            await this._fetchUsageInfo();
        }
    }

    _resolveModel(model) {
        if (!model || model === Model.UNSPECIFIED) return Model.UNSPECIFIED;
        if (model instanceof AvailableModel) return model;
        if (typeof model === 'string') return this._resolveModelByName(model);
        if (typeof model === 'object' && !model.model_name) return Model.fromDict(model);
        if (typeof model === 'object' && model.model_header !== undefined) {
            if (!(model instanceof AvailableModel)) {
                const mid = Model.modelId(model);
                if (mid && mid in this._modelRegistry) return this._modelRegistry[mid];
            }
            return model;
        }
        return model;
    }

    _resolveModelByName(name) {
        if (name in this._modelRegistry) return this._modelRegistry[name];
        const lower = name.toLowerCase();
        for (const m of Object.values(this._modelRegistry)) {
            if (m.model_name.toLowerCase() === lower || m.display_name.toLowerCase() === lower) return m;
        }
        return Model.fromName(name);
    }

    newChat({ model = Model.UNSPECIFIED, temporary = false, gem = null } = {}) {
        return new ChatSession(this, { model, temporary, gem });
    }

    async chats() {
        if (this._anonymous) return [];
        await this._ensureResources();
        if (!this._recentChats) return [];
        return this._recentChats;
    }

    async readChat(cid, limit = 10) {
        if (this._anonymous) throw new APIError('Chat history not available in anonymous mode.');
        await this._ensure();
        const response = await this._batchExecute([
            new RPCData({ rpcid: GRPC.READ_CHAT, payload: JSON.stringify([cid, limit, null, 1, [1], [4], null, 1]) }),
        ]);
        const responseJson = extractJsonFromResponse(response.data);
        for (const part of responseJson) {
            const bodyStr = getNestedValue(part, [2]);
            if (!bodyStr) continue;
            let body; try { body = JSON.parse(bodyStr); } catch { continue; }
            const turnsData = getNestedValue(body, [0]);
            if (!turnsData) continue;
            const turns = [];
            for (const convTurn of turnsData) {
                const rid = getNestedValue(convTurn, [0, 1], '');
                const candidatesList = getNestedValue(convTurn, [3, 0]);
                if (candidatesList) {
                    for (const cd of candidatesList) {
                        const rcid = getNestedValue(cd, [0]);
                        if (!rcid) continue;
                        const [text, thoughts, webImgs, genImgs, genVids, genMedia] = this._parseCandidate(cd, cid, rid, rcid);
                        turns.push({ role: 'model', text, thoughts, images: [...webImgs, ...genImgs], videos: genVids, media: genMedia });
                    }
                }
                const userText = getNestedValue(convTurn, [2, 0, 0], '');
                if (userText) turns.push({ role: 'user', text: userText });
            }
            return turns;
        }
        return [];
    }

    async deleteChat(cid) {
        if (this._anonymous) throw new APIError('Chat management not available in anonymous mode.');
        await this._ensure();
        await this._batchExecute([new RPCData({ rpcid: GRPC.DELETE_CHAT_1, payload: JSON.stringify([cid]) })]);
        await this._batchExecute([new RPCData({ rpcid: GRPC.DELETE_CHAT_2, payload: JSON.stringify([cid, [1, null, 0, 1]]) })]);
    }

    async gems() {
        if (this._anonymous) throw new APIError('Gems not available in anonymous mode.');
        await this._ensure();
        const language = this.language || 'en';
        const response = await this._batchExecute([
            new RPCData({ rpcid: GRPC.LIST_GEMS, payload: `[3,['${language}'],0]`, identifier: 'system' }),
            new RPCData({ rpcid: GRPC.LIST_GEMS, payload: `[2,['${language}'],0]`, identifier: 'custom' }),
        ]);
        const responseJson = extractJsonFromResponse(response.data);
        let predefined = [], custom = [];
        for (const part of responseJson) {
            const id = getNestedValue(part, [-1]);
            const bodyStr = getNestedValue(part, [2]);
            if (!bodyStr) continue;
            const body = JSON.parse(bodyStr);
            if (id === 'system') predefined = getNestedValue(body, [2], []);
            else if (id === 'custom') custom = getNestedValue(body, [2], []);
        }
        const out = [];
        const push = (arr, predef) => {
            for (const g of arr) {
                if (g && g[0]) out.push({ id: g[0], name: g[1]?.[0] || '', description: g[1]?.[1] || '', prompt: g[2]?.[0] || null, predefined: predef });
            }
        };
        push(predefined, true);
        push(custom, false);
        this._gemsCache = out;
        return out;
    }

    async addGem({ name, prompt, description = '' } = {}) {
        if (this._anonymous) throw new APIError('Gems not available in anonymous mode.');
        await this._ensure();
        if (!name || !prompt) throw new Error('Name and prompt required.');
        const response = await this._batchExecute([
            new RPCData({ rpcid: GRPC.CREATE_GEM, payload: JSON.stringify([[name, description, prompt, null, null, null, null, null, 0, null, 1, null, null, null, []]]) }),
        ]);
        const responseJson = extractJsonFromResponse(response.data);
        const bodyStr = getNestedValue(responseJson, [0, 2]);
        if (!bodyStr) throw new APIError('Failed to create gem.');
        const id = getNestedValue(JSON.parse(bodyStr), [0]);
        if (!id) throw new APIError('Failed to create gem.');
        const gem = { id, name, description, prompt, predefined: false };
        if (this._gemsCache) this._gemsCache.push(gem);
        return gem;
    }

    async setGem({ gem, name, prompt, description = '' } = {}) {
        if (this._anonymous) throw new APIError('Gems not available in anonymous mode.');
        await this._ensure();
        const id = typeof gem === 'object' ? gem.id : gem;
        if (!id) throw new Error('Gem ID required.');
        await this._batchExecute([
            new RPCData({ rpcid: GRPC.UPDATE_GEM, payload: JSON.stringify([id, [name, description, prompt, null, null, null, null, null, 0, null, 1, null, null, null, [], 0]]) }),
        ]);
        return { id, name, description, prompt, predefined: false };
    }

    async delGem(gem) {
        if (this._anonymous) throw new APIError('Gems not available in anonymous mode.');
        await this._ensure();
        const id = typeof gem === 'object' ? gem.id : gem;
        if (!id) throw new Error('Gem ID required.');
        await this._batchExecute([new RPCData({ rpcid: GRPC.DELETE_GEM, payload: JSON.stringify([id]) })]);
    }

    async models() {
        await this._ensure();
        const vals = Object.values(this._modelRegistry);
        return vals.length ? vals : [];
    }

    async research(prompt, { wait = true, pollInterval = 10000, timeout = 600000, onStatus = null } = {}) {
        if (this._anonymous) throw new APIError('Deep research not available in anonymous mode.');
        const chat = this.newChat({ model: Model.UNSPECIFIED });
        const plan = await this._createDeepResearchPlan(prompt, chat);
        if (!plan) throw new GeminiError('Failed to create deep research plan.');
        await this._startDeepResearch(plan, chat);
        if (!wait) return { plan };
        const result = await this._waitDeepResearch(plan, pollInterval, timeout, onStatus);
        result.plan = plan;
        return result;
    }

    async account() {
        await this._ensure();
        if (this._anonymous) {
            const modelList = await this.models();
            return { status: { name: 'UNAUTHENTICATED' }, models: modelList.slice(0, 1), quotas: {}, abuse_clean: null };
        }
        await this._ensureResources();
        const models = await this.models();
        return {
            status: { code: this.accountStatus?.value, name: this.accountStatus?.name },
            models: models.map(m => ({ id: m.model_id, name: m.model_name, display_name: m.display_name, available: m.is_available })),
            usage: { ...this._usageInfo },
            quotas: { ...this._quotas },
            abuse_clean: this._abuseStatus?.is_clean ?? null,
        };
    }

    async ask(prompt, { model, gem, temporary, files, extended_thinking } = {}) {
        const chat = this.newChat({ model, gem, temporary });
        return chat.generateContent({ prompt, files, extended_thinking });
    }

    async close(delay = 0) {
        if (delay) await sleep(delay);
        this._ready = false;
        if (this.closeTask) { clearTimeout(this.closeTask); this.closeTask = null; }
        if (this.refreshTask) { clearTimeout(this.refreshTask); this.refreshTask = null; }
        if (this._activityTask) { clearTimeout(this._activityTask); this._activityTask = null; }
    }

    async _generateContent({ prompt, files = null, model = Model.UNSPECIFIED, gem = null, chat = null, temporary = false, deep_research = false, extended_thinking = false }) {
        await this._ensure();
        if (this._anonymous && files) throw new APIError('File upload not available in anonymous mode.');
        if (this._anonymous && deep_research) throw new APIError('Deep research not available in anonymous mode.');
        let fileData = null;
        if (files && files.length) {
            await this._syncActivity();
            const uploaded = await Promise.all(files.map(f => uploadFile(f, this.proxy, this.pushId, this.cookies)));
            fileData = uploaded.map((url, i) => [[url], parseFileName(files[i])]);
        }
        const ss = { last_texts: {}, last_thoughts: {} };
        let output = null;
        for await (const out of this._generate({ prompt, fileData, model, gem, chat, temporary, ss, deep_research, extended_thinking })) output = out;
        if (!output) throw new GeminiError('Failed to generate contents.');
        if (chat) { output.metadata = chat.metadata; chat.lastOutput = output; }
        return output;
    }

    async *_generateContentStream({ prompt, files = null, model = Model.UNSPECIFIED, gem = null, chat = null, temporary = false, deep_research = false, extended_thinking = false }) {
        await this._ensure();
        if (this._anonymous && files) throw new APIError('File upload not available in anonymous mode.');
        if (this._anonymous && deep_research) throw new APIError('Deep research not available in anonymous mode.');
        let fileData = null;
        if (files && files.length) {
            await this._syncActivity();
            const uploaded = await Promise.all(files.map(f => uploadFile(f, this.proxy, this.pushId, this.cookies)));
            fileData = uploaded.map((url, i) => [[url], parseFileName(files[i])]);
        }
        const ss = { last_texts: {}, last_thoughts: {} };
        let output = null;
        for await (const out of this._generate({ prompt, fileData, model, gem, chat, temporary, ss, deep_research, extended_thinking })) {
            output = out;
            yield out;
        }
        if (output && chat) { output.metadata = chat.metadata; chat.lastOutput = output; }
    }

    async *_generate({ prompt, fileData = null, model = Model.UNSPECIFIED, gem = null, chat = null, temporary = false, ss = null, deep_research = false, extended_thinking = false }, retries = 5) {
        if (!prompt) throw new Error('Prompt cannot be empty.');
        if (this._anonymous) {
            for await (const out of this._streamAnonymous({ prompt, chat, ss })) yield out;
            return;
        }
        model = this._resolveModel(model);
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                for await (const out of this._stream({ prompt, fileData, model, gem, chat, temporary, ss, deep_research, extended_thinking })) yield out;
                return;
            } catch (e) {
                if (e instanceof GeminiError || e instanceof ModelInvalid || e instanceof UsageLimitExceeded || e instanceof TemporarilyBlocked) throw e;
                if (attempt >= retries) throw e;
                await sleep(1000 * (attempt + 1));
            }
        }
    }

    async *_stream({ prompt, fileData = null, model = Model.UNSPECIFIED, gem = null, chat = null, temporary = false, ss = null, deep_research = false, extended_thinking = false }) {
        const _reqid = this._reqid;
        this._reqid += 100000;
        const gemId = gem?.id || gem;
        const chatBackup = chat ? { metadata: [...chat.metadata], cid: chat.cid, rid: chat.rid, rcid: chat.rcid } : null;

        const inner = new Array(81).fill(null);
        inner[0] = [prompt, 0, null, fileData, null, null, 0];
        inner[1] = [this.language || 'en'];
        inner[2] = chat ? chat.metadata : [...DEFAULT_METADATA];
        if (deep_research) {
            inner[3] = '!' + crypto.randomBytes(1950).toString('base64url');
            inner[4] = crypto.randomUUID().replace(/-/g, '');
        }
        inner[6] = [1];
        inner[STREAMING_FLAG_INDEX] = 1;
        inner[10] = 1;
        inner[11] = 0;
        inner[17] = [[0]];
        inner[18] = 0;
        if (gemId) inner[GEM_FLAG_INDEX] = gemId;
        inner[27] = 1;
        inner[30] = [4];
        inner[41] = [1];
        if (temporary) inner[TEMPORARY_CHAT_FLAG_INDEX] = 1;
        if (deep_research) inner[49] = 1;
        inner[53] = 0;
        if (deep_research) { inner[54] = [[[[[1]]]]]; inner[55] = [[1]]; }
        inner[61] = [];
        inner[68] = 1;
        inner[80] = extended_thinking ? 2 : 1;

        const uid = uuidv4().toUpperCase();
        inner[59] = uid;

        const modelHeaders = { ...model.model_header };
        if (MODEL_HEADER_KEY in modelHeaders) {
            try {
                const parsed = JSON.parse(modelHeaders[MODEL_HEADER_KEY]);
                const modelNumber = typeof parsed[parsed.length - 1] === 'number' ? parsed[parsed.length - 1] : null;
                if (typeof modelNumber === 'number') inner[79] = modelNumber;
                parsed.push(extended_thinking ? 2 : 1);
                parsed.push(this.sessionId || null);
                modelHeaders[MODEL_HEADER_KEY] = JSON.stringify(parsed);
            } catch {}
        }

        const params = new URLSearchParams({ hl: this.language || 'en', _reqid: String(_reqid), rt: 'c' });
        if (this.buildLabel) params.set('bl', this.buildLabel);
        if (this.sessionId) params.set('f.sid', this.sessionId);

        const body = new URLSearchParams({ at: this.accessToken || '', 'f.req': JSON.stringify([null, JSON.stringify(inner)]) });

        let hasGeneratedText = false;
        const sleepTime = 10000;

        const res = await axios.post(`${Endpoint.GENERATE}?${params}`, body.toString(), {
            headers: {
                ...Headers.GEMINI, ...modelHeaders,
                'x-goog-ext-525005358-jspb': `["${uid}",1]`,
                ...Headers.SAME_DOMAIN, 'Cookie': cookieStr(this.cookies),
            },
            responseType: 'stream',
            timeout: this.timeout,
            validateStatus: null,
            ...(this.proxy ? { proxy: parseProxy(this.proxy) } : {}),
        });

        if (res.status !== 200) { await this.close(); throw new APIError(`Generate failed. Status: ${res.status}`); }
        Object.assign(this.cookies, parseCookies(res.headers));

        const lTxt = ss ? ss.last_texts : {};
        const lThought = ss ? ss.last_thoughts : {};
        let lastProg = Date.now();
        let isThinking = false, isQueueing = false, hasCandidates = false;
        let isCompleted = false, isFinalChunk = false;
        let cid = chat ? chat.cid : '';
        let rid = chat ? chat.rid : '';
        let videoChipUUID = null;
        const frameParser = new StreamingFrameParser();

        const processParts = (parts) => {
            const outs = [];
            for (const part of parts) {
                const ec = getNestedValue(part, [5, 2, 0, 1, 0]);
                if (ec) {
                    switch (ec) {
                        case ErrorCode.USAGE_LIMIT_EXCEEDED: throw new UsageLimitExceeded(`Usage limit exceeded.`);
                        case ErrorCode.MODEL_INCONSISTENT: throw new ModelInvalid('Model inconsistent with conversation history.');
                        case ErrorCode.MODEL_HEADER_INVALID: throw new ModelInvalid(`Model unavailable or request structure outdated.`);
                        case ErrorCode.IP_TEMPORARILY_BLOCKED: throw new TemporarilyBlocked('IP temporarily blocked by Google.');
                        case ErrorCode.TEMPORARY_ERROR_1013: throw new APIError('Temporary error (1013).');
                        case ErrorCode.FEATURE_NOT_AVAILABLE: throw new UsageLimitExceeded('This feature (e.g. video/media generation) is not available for your account plan.');
                        default: throw new APIError(`Unknown API error: ${ec}`);
                    }
                }

                if (JSON.stringify(part).includes('data_analysis_tool')) { isThinking = true; isQueueing = false; }
                const status = getNestedValue(part, [5]);
                if (Array.isArray(status) && status.length && !isThinking) isQueueing = true;

                const innerStr = getNestedValue(part, [2]);
                if (!innerStr) continue;
                let pj; try { pj = JSON.parse(innerStr); } catch { continue; }

                const mData = getNestedValue(pj, [1]);
                if (mData) {
                    const newCid = getNestedValue(mData, [0]);
                    const newRid = getNestedValue(mData, [1]);
                    if (newCid) cid = newCid;
                    if (newRid) rid = newRid;
                    if (chat) chat.metadata = mData;
                }

                const ctx = getNestedValue(pj, [25]);
                if (typeof ctx === 'string') {
                    isFinalChunk = true; isThinking = false; isQueueing = false;
                    if (chat) { const m = [...chat.metadata]; m[9] = ctx; chat.metadata = m; }
                }

                const clist = getNestedValue(pj, [4], []);
                if (!clist || !clist.length) continue;

                const outCands = [];
                for (let i = 0; i < clist.length; i++) {
                    const cd = clist[i];
                    const rcid = getNestedValue(cd, [0]);
                    if (!rcid) continue;
                    if (chat) chat.rcid = rcid;

                    const [text, thoughts, webImgs, genImgs, genVideos, genMedia] = this._parseCandidate(cd, cid, rid, rcid);

                    if (!videoChipUUID) {
                        const entry65 = getNestedValue(cd, [12, 0, '65']);
                        if (Array.isArray(entry65) && entry65.length >= 2) videoChipUUID = entry65[1];
                    }

                    let drPlan = null;
                    if (deep_research) {
                        const planData = extractDeepResearchPlan(cd, text);
                        if (planData) drPlan = new DeepResearchPlan({ ...planData, cid: chat ? chat.cid : null });
                    }

                    const indicator = getNestedValue(cd, [8, 0]);
                    isCompleted = indicator === 2;

                    const lastSentText = lTxt[rcid] || lTxt[`idx_${i}`] || '';
                    const [td, nft] = getDeltaByFpLen(text, lastSentText, isCompleted || indicator == null);
                    let thdelta = '', nfth = '';
                    if (thoughts) {
                        const lastSentThought = lThought[rcid] || lThought[`idx_${i}`] || '';
                        [thdelta, nfth] = getDeltaByFpLen(thoughts, lastSentThought, isCompleted || indicator == null);
                    }

                    if (td || thdelta || webImgs.length || genImgs.length || genVideos.length || genMedia.length || drPlan) hasCandidates = true;

                    lTxt[rcid] = lTxt[`idx_${i}`] = nft;
                    lThought[rcid] = lThought[`idx_${i}`] = nfth;

                    outCands.push(new Candidate({
                        rcid, index: i, text, text_delta: td, thoughts: thoughts || null, thoughts_delta: thdelta,
                        web_images: webImgs, generated_images: genImgs, generated_videos: genVideos,
                        generated_media: genMedia, deep_research_plan: drPlan, done: isCompleted,
                    }));
                }

                if (outCands.length) { isThinking = false; isQueueing = false; outs.push(new ModelOutput(getNestedValue(pj, [1], []), outCands, { model: model?.model_name || '', gem: gemId || null })); }
            }
            return outs;
        };

        const yielded = [];
        await new Promise((resolve, reject) => {
            const watchdog = setInterval(() => {
                if (!isThinking && !isQueueing && (Date.now() - lastProg) > Math.min(this.timeout, this.watchdogTimeout)) {
                    clearInterval(watchdog);
                    reject(new APIError('Response stalled (zombie stream).'));
                }
            }, 1000);

            res.data.on('data', chunk => {
                try {
                    const parts = frameParser.feed(chunk.toString('utf8'));
                    const outs = processParts(parts);
                    for (const o of outs) yielded.push(o);
                    if (outs.length || isThinking || isQueueing) lastProg = Date.now();
                } catch (e) { clearInterval(watchdog); reject(e); }
            });

            res.data.on('end', () => {
                clearInterval(watchdog);
                try {
                    const remaining = frameParser.flush();
                    for (const o of processParts(remaining)) yielded.push(o);
                    const hasMediaOrVideo = yielded.some(o => o.videos?.length > 0 || o.media?.length > 0);
                    if (!isCompleted && !isFinalChunk && !hasMediaOrVideo) reject(new APIError('Stream interrupted or truncated.'));
                    else resolve();
                } catch (e) { reject(e); }
            });

            res.data.on('error', e => { clearInterval(watchdog); reject(new APIError(`Stream error: ${e.message}`)); });
        });

        hasGeneratedText = yielded.length > 0;

        if ((!isCompleted || isThinking || isQueueing) && cid && isFinalChunk) {
            const pollStart = Date.now();
            while (true) {
                if ((Date.now() - pollStart) > this.timeout) {
                    await this.close();
                    throw hasGeneratedText ? new GeminiError('Connection lost. Recovery timed out.') : new APIError('Polling timed out.');
                }
                await this._syncActivity();
                const recovered = await this._readChatInternal(cid);
                if (recovered?.turns?.length > 0 && recovered.turns[0].role === 'model') {
                    const recoveredOut = recovered.turns[0].model_output;
                    if (recoveredOut?.candidates && (recoveredOut.text || recoveredOut.thoughts || recoveredOut.images?.length || recoveredOut.videos?.length || recoveredOut.media?.length)) {
                        const recRcid = recoveredOut.rcid;
                        const prevRcid = chatBackup ? chatBackup.rcid : '';
                        if (recRcid !== prevRcid) {
                            if (chat) { recoveredOut.metadata = chat.metadata; chat.rcid = recRcid; }
                            yield recoveredOut;
                            return;
                        }
                    }
                }
                await sleep(sleepTime);
            }
        }

        if (videoChipUUID && !yielded.some(o => o.videos?.length) && cid) {
            const pollStart = Date.now();
            while ((Date.now() - pollStart) < this.timeout) {
                await this._syncActivity();
                const recovered = await this._readChatInternal(cid);
                const recoveredOut = recovered?.turns?.find(t => t.role === 'model')?.model_output;
                if (recoveredOut?.videos?.length > 0) {
                    if (chat) { recoveredOut.metadata = chat.metadata; chat.rcid = recoveredOut.rcid; }
                    yield recoveredOut;
                    return;
                }
                await sleep(sleepTime);
            }
        }

        for (const o of yielded) { hasGeneratedText = true; yield o; }
    }

    async _getAnonymousCookie() {
        const res = await axios.post(Endpoint.BATCH_EXEC + '?rpcids=maGuAc&source-path=%2F&hl=en-US&_reqid=1&rt=c',
            'f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&',
            { headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' } }
        );
        const cookies = parseCookies(res.headers);
        if (cookies['__Secure-1PSID']) this.cookies['__Secure-1PSID'] = cookies['__Secure-1PSID'];
        Object.assign(this.cookies, cookies);
        this.accessToken = '';
        this.buildLabel = 'boq_assistant-bard-web-server_20260618.10_p0';
        this.sessionId = '6921068608429233100';
        this.language = 'en-US';
        this._sessionid = uuidv4().toUpperCase();
        this._reqid = Math.floor(Math.random() * 90000) + 10000;
    }

    async *_streamAnonymous({ prompt, chat = null, ss = null }) {
        const _reqid = this._reqid;
        this._reqid += 100000;

        const chatMeta = chat ? [...chat.metadata] : ['', '', '', null, null, null, null, null, null, ''];
        const inner = [
            [prompt, 0, null, null, null, null, 0], [this.language || 'en-US'],
            chatMeta, null, null, null, [1], 1, null, null, 1, 0, null, null, null, null, null, [[0]], 1,
            null, null, null, null, null,
            ['', '', '', null, null, null, null, null, 0, null, 1, null, null, null, []],
            null, null, 1, null, null, null, null, null, null, null,
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            1, null, null, null, null, [1],
        ];

        const uid = uuidv4().toUpperCase();
        const params = new URLSearchParams({ hl: this.language || 'en-US', _reqid: String(_reqid), rt: 'c' });
        if (this.buildLabel) params.set('bl', this.buildLabel);
        if (this.sessionId) params.set('f.sid', this.sessionId);
        const body = new URLSearchParams({ 'f.req': JSON.stringify([null, JSON.stringify(inner)]) });

        const res = await axios.post(`${Endpoint.GENERATE}?${params}`, body.toString(), {
            headers: {
                'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'x-goog-ext-525001261-jspb': '[1,null,null,null,"fbb127bbb056c959",null,null,0,[4,6],null,null,1,null,null,1]',
                'x-goog-ext-525005358-jspb': `["${uid}",1]`,
                'x-goog-ext-73010989-jspb': '[0]',
                'x-goog-ext-73010990-jspb': '[0,0,0]',
                'x-same-domain': '1',
                'origin': 'https://gemini.google.com',
                'referer': 'https://gemini.google.com/',
                'cookie': cookieStr(this.cookies),
            },
            timeout: this.timeout,
            validateStatus: null,
        });

        if (res.status !== 200) throw new APIError(`Generate failed. Status: ${res.status}`);
        Object.assign(this.cookies, parseCookies(res.headers));

        const lTxt = ss ? ss.last_texts : {};
        const raw = typeof res.data === 'string' ? res.data : res.data.toString();
        const frameParser = new StreamingFrameParser();
        const parts = frameParser.feed(raw);
        parts.push(...frameParser.flush());

        let isCompleted = false;
        let cid = chat ? chat.cid : '';
        let rid = chat ? chat.rid : '';

        for (const part of parts) {
            const ec = getNestedValue(part, [5, 2, 0, 1, 0]);
            if (ec) {
                if (ec === ErrorCode.USAGE_LIMIT_EXCEEDED) throw new UsageLimitExceeded('Usage limit exceeded.');
                if (ec === ErrorCode.IP_TEMPORARILY_BLOCKED) throw new TemporarilyBlocked('IP temporarily blocked.');
                if (ec === 1096 || ec === 1097) throw new APIError('Session continuation not available in anonymous mode. Use authenticated mode for multi-turn chat.');
                throw new APIError(`Anonymous API error code: ${ec}.`);
            }

            const innerStr = getNestedValue(part, [2]);
            if (!innerStr) continue;
            let pj; try { pj = JSON.parse(innerStr); } catch { continue; }

            const mData = getNestedValue(pj, [1]);
            if (mData) {
                if (mData[0]) cid = mData[0];
                if (mData[1]) rid = mData[1];
                if (chat) chat.metadata = mData;
            }

            const ctx = getNestedValue(pj, [25]);
            if (typeof ctx === 'string' && chat) {
                const m = [...chat.metadata];
                m[9] = ctx;
                chat.metadata = m;
            }

            const clist = getNestedValue(pj, [4], []);
            if (!clist || !clist.length) continue;

            for (let i = 0; i < clist.length; i++) {
                const cd = clist[i];
                const rcid = getNestedValue(cd, [0]);
                if (!rcid) continue;
                if (chat) chat.rcid = rcid;

                const text = getNestedValue(cd, [1, 0], '');
                const indicator = getNestedValue(cd, [8, 0]);
                isCompleted = indicator === 2;

                const lastSentText = lTxt[rcid] || lTxt[`idx_${i}`] || '';
                const [td, nft] = getDeltaByFpLen(text, lastSentText, isCompleted || indicator == null);
                lTxt[rcid] = lTxt[`idx_${i}`] = nft;

                const cand = new Candidate({ rcid, index: i, text, text_delta: td, done: isCompleted });
                yield new ModelOutput(getNestedValue(pj, [1], []), [cand], { model: 'gemini-3-flash' });
            }
        }
    }

    async _getFullSizeImage(cid, rid, rcid, imageId) {
        try {
            const payload = [[[null, null, null, [null, null, null, null, null, '']], [imageId, 0], null, [19, ''], null, null, null, null, null, ''], [rid, rcid, cid, null, ''], 1, 0, 1];
            const response = await this._batchExecute([new RPCData({ rpcid: GRPC.GET_FULL_SIZE_IMAGE, payload: JSON.stringify(payload) })]);
            const responseData = extractJsonFromResponse(response.data);
            const bodyStr = getNestedValue(responseData, [0, 2], '[]');
            return getNestedValue(JSON.parse(bodyStr), [0]);
        } catch { return null; }
    }

    _parseCandidate(candidateData, cid, rid, rcid) {
        let text = getNestedValue(candidateData, [1, 0], '');
        if (CARD_CONTENT_RE.test(text)) text = getNestedValue(candidateData, [22, 0]) || text;
        ARTIFACTS_RE.lastIndex = 0;
        text = text.replace(ARTIFACTS_RE, '');
        const thoughts = getNestedValue(candidateData, [37, 0, 0]) || '';

        const webImages = [];
        for (const [imgIdx, wi] of (getNestedValue(candidateData, [12, 1], []) || []).entries()) {
            const url = getNestedValue(wi, [0, 0, 0]);
            if (url) webImages.push(new WebImage({ url, title: `[Image ${imgIdx + 1}]`, alt: getNestedValue(wi, [0, 4], ''), proxy: this.proxy, client_ref: this }));
        }

        const generatedImages = [];
        const genImgSources = [
            ...(getNestedValue(candidateData, [12, 7, 0], []) || []),
            ...(getNestedValue(candidateData, [12, 0, '8', 0], []) || []),
        ];
        for (const [imgIdx, gi] of genImgSources.entries()) {
            const url = getNestedValue(gi, [0, 3, 3]);
            if (url) {
                let imageId = getNestedValue(gi, [1, 0]);
                if (!imageId) imageId = `http://googleusercontent.com/image_generation_content/${imgIdx}`;
                generatedImages.push(new GeneratedImage({ url, title: `[Generated Image ${imgIdx}]`, alt: getNestedValue(gi, [0, 3, 2], ''), proxy: this.proxy, client_ref: this, cid, rid, rcid, image_id: imageId }));
            }
        }

        const generatedVideos = [];
        for (const vItem of (getNestedValue(candidateData, [12, 0, '60', 0, 0, 0]) || [])) {
            const urls = getNestedValue(vItem, [7], []);
            if (Array.isArray(urls) && urls.length >= 2)
                generatedVideos.push(new GeneratedVideo({ url: urls[1], thumbnail: urls[0], cid, rid, rcid, client_ref: this, proxy: this.proxy }));
        }

        const generatedMedia = [];
        const mediaData = getNestedValue(candidateData, [12, 86], []);
        if (mediaData) {
            let mp3Url = '', mp3Thumb = '';
            const mp3List = getNestedValue(mediaData, [0, 1, 7], []);
            if (Array.isArray(mp3List) && mp3List.length >= 2) { mp3Thumb = mp3List[0]; mp3Url = mp3List[1]; }
            let mp4Url = '', mp4Thumb = '';
            const mp4List = getNestedValue(mediaData, [1, 1, 7], []);
            if (Array.isArray(mp4List) && mp4List.length >= 2) { mp4Thumb = mp4List[0]; mp4Url = mp4List[1]; }
            if (mp3Url || mp4Url) {
                generatedMedia.push(new GeneratedMedia({ url: mp4Url, thumbnail: mp4Thumb, mp3_url: mp3Url, mp3_thumbnail: mp3Thumb, cid, rid, rcid, client_ref: this, proxy: this.proxy }));
            }
        }

        return [text, thoughts, webImages, generatedImages, generatedVideos, generatedMedia];
    }

    async _createDeepResearchPlan(prompt, chat) {
        const snapshot = await this._inspectAccountStatus();
        if (!snapshot.summary?.deep_research_feature_present) {
            throw new GeminiError('Account not eligible for deep research.');
        }
        const output = await this._collectResearchOutput(chat, prompt);
        const plan = output.deep_research_plan;
        if (!plan) throw new GeminiError(`Gemini did not return a deep research plan. Preview: ${(output.text || '').slice(0, 1200)}`);
        plan.metadata = [...chat.metadata];
        plan.cid = chat.cid || plan.cid;
        if (!plan.confirm_prompt) plan.confirm_prompt = 'Start research';
        if (!plan.response_text) plan.response_text = output.text;
        return plan;
    }

    async _startDeepResearch(plan, chat) {
        const prompt = plan.confirm_prompt || 'Start research';
        const output = await this._collectResearchOutput(chat, prompt);
        return output;
    }

    async _collectResearchOutput(chat, prompt) {
        let recoverableError = null;
        try {
            const output = await this._generateContent({ prompt, chat, deep_research: true });
            if (output.deep_research_plan || (output.text || '').trim()) {
                chat.lastOutput = output;
                return output;
            }
        } catch (e) {
            if (e instanceof UsageLimitExceeded || e instanceof ModelInvalid || e instanceof TemporarilyBlocked) throw e;
            if (e instanceof GeminiError || e instanceof APIError) recoverableError = e;
            else throw e;
        }
        if (chat.cid) {
            const fallback = await this._readChatInternal(chat.cid);
            if (fallback) { chat.lastOutput = fallback; return fallback; }
        }
        if (recoverableError) throw recoverableError;
        throw new GeminiError(`Gemini returned no usable output for deep research.`);
    }

    async _readChatInternal(cid) {
        try {
            const response = await this._batchExecute([
                new RPCData({ rpcid: GRPC.READ_CHAT, payload: JSON.stringify([cid, 5, null, 1, [1], [4], null, 1]) }),
            ]);
            const responseJson = extractJsonFromResponse(response.data);
            for (const part of responseJson) {
                const bodyStr = getNestedValue(part, [2]);
                if (!bodyStr) continue;
                let body; try { body = JSON.parse(bodyStr); } catch { continue; }
                const turnsData = getNestedValue(body, [0]);
                if (!turnsData) continue;
                const turns = [];
                for (const convTurn of turnsData) {
                    const candidatesList = getNestedValue(convTurn, [3, 0]);
                    if (candidatesList) {
                        for (const cd of candidatesList) {
                            const rcid = getNestedValue(cd, [0]);
                            if (!rcid) continue;
                            const [text, thoughts, webImgs, genImgs, genVids, genMedia] = this._parseCandidate(cd, cid, '', rcid);
                            turns.push({ role: 'model', text, model_output: new ModelOutput([cid, ''], [new Candidate({ rcid, index: 0, text, thoughts, web_images: webImgs, generated_images: genImgs, generated_videos: genVids, generated_media: genMedia, done: true })]) });
                        }
                    }
                    const userText = getNestedValue(convTurn, [2, 0, 0], '');
                    if (userText) turns.push({ role: 'user', text: userText });
                }
                return { cid, turns };
            }
            return null;
        } catch { return null; }
    }

    async _inspectAccountStatus() {
        const probes = [
            ['activity', GRPC.READ_USER_PREFERENCES, '[[["bard_activity_enabled"]]]'],
            ['research_status', GRPC.LIST_DISCOVERY_CARDS, '["en",null,null,null,4,null,null,[2,4,7,15],null,[[5]]]'],
            ['advanced_quota', GRPC.CHECK_GEMINI_QUOTA, '[[[1,4],[6,6],[1,15]]]'],
            ['flash_quota', GRPC.CHECK_GEMINI_QUOTA, '[[[1,11],[2,11],[6,11]]]'],
            ['extra_caps', GRPC.CHECK_QUOTA, '[]'],
        ];
        const result = { source_path: '/app', rpc: {} };
        for (const [probeName, rpcid, payload] of probes) {
            try {
                const response = await this._batchExecute([new RPCData({ rpcid, payload })], 2, false);
                const parsed = [];
                let rejectCode = null;
                const parts = extractJsonFromResponse(response.data);
                for (const part of parts) {
                    if (getNestedValue(part, [0]) !== 'wrb.fr') continue;
                    if (getNestedValue(part, [1]) !== rpcid) continue;
                    const code = getNestedValue(part, [5, 0]);
                    if (typeof code === 'number') rejectCode = code;
                    const body = getNestedValue(part, [2]);
                    if (typeof body === 'string') {
                        try { parsed.push(JSON.parse(body)); } catch { parsed.push(body); }
                    } else if (body != null) { parsed.push(body); }
                }
                result.rpc[probeName] = { rpcid, ok: true, status_code: response.status, parsed, reject_code: rejectCode };
            } catch (e) {
                result.rpc[probeName] = { rpcid, ok: false, error: `${e.constructor.name}: ${e.message}` };
            }
        }
        const drProbes = ['research_status', 'advanced_quota', 'flash_quota', 'extra_caps'];
        const drAvailable = drProbes.every(p => result.rpc[p]?.ok && result.rpc[p]?.reject_code == null);
        const rejected = Object.entries(result.rpc).filter(([, v]) => v?.reject_code === 7).map(([k]) => k);
        result.summary = { deep_research_feature_present: drAvailable, rejected_probes: rejected };
        return result;
    }

    async _waitDeepResearch(plan, pollInterval = 10000, timeout = 600000, onStatus = null) {
        if (!plan.research_id) throw new GeminiError('Cannot poll: plan.research_id is missing.');
        const start = Date.now();
        const statuses = [];
        const chat = this.newChat({ metadata: [...plan.metadata], model: Model.UNSPECIFIED });
        chat.cid = plan.cid;
        while ((Date.now() - start) < timeout) {
            const status = plan.research_id ? await this._getDeepResearchStatus(plan.research_id) : null;
            if (status) {
                statuses.push(status);
                if (onStatus) onStatus(status);
                if (status.done) break;
            }
            await sleep(pollInterval);
        }
        if (!statuses.length || !statuses[statuses.length - 1].done) {
            console.warn(`Deep research [${plan.research_id}] timed out after ${timeout}ms`);
        }
        let finalOutput = null;
        if (chat.cid) {
            const recovered = await this._readChatInternal(chat.cid);
            if (recovered?.turns?.length) {
                const modelTurn = recovered.turns.find(t => t.role === 'model');
                if (modelTurn?.model_output) finalOutput = modelTurn.model_output;
            }
        }
        const done = statuses.length > 0 && statuses[statuses.length - 1].done;
        return new DeepResearchResult({ plan, statuses, final_output: finalOutput, done });
    }

    async _getDeepResearchStatus(researchId) {
        const response = await this._batchExecute([
            new RPCData({ rpcid: GRPC.DEEP_RESEARCH_STATUS, payload: JSON.stringify([researchId]) }),
        ]);
        const responseJson = extractJsonFromResponse(response.data);
        for (const part of responseJson) {
            const bodyStr = getNestedValue(part, [2]);
            if (!bodyStr) continue;
            let body; try { body = JSON.parse(bodyStr); } catch { continue; }
            const parsed = extractDeepResearchStatusPayload(body);
            if (parsed) return new DeepResearchStatus(parsed);
        }
        return null;
    }

    _checkAccountStatus() {
        return this.accountStatus === AccountStatus.AVAILABLE ||
            this.accountStatus === AccountStatus.ACCOUNT_UNTRUSTED;
    }

    _resetCloseTask() {
        if (this.closeTask) { clearTimeout(this.closeTask); this.closeTask = null; }
        this.closeTask = setTimeout(() => this.close(), this.closeDelay);
    }

    _startAutoRefresh() {
        const baseInterval = Math.max(this.refreshInterval, 60000);
        const jitter = () => (Math.random() - 0.5) * 30000;
        const scheduleNext = () => {
            if (!this._ready) return;
            this.refreshTask = setTimeout(async () => {
                if (!this._ready) return;
                try {
                    const [new1psidts, rotatedCookies] = await rotate1psidts(this.cookies, this.proxy);
                    if (rotatedCookies) Object.assign(this.cookies, rotatedCookies);
                    if (!new1psidts && this.verbose) console.warn('Rotation response did not contain a new __Secure-1PSIDTS.');
                } catch (e) {
                    if (this.verbose) console.warn(`Cookie refresh error: ${e.message}`);
                }
                scheduleNext();
            }, Math.max(60000, baseInterval + jitter()));
        };
        scheduleNext();
    }

    _startActivityWatchdog() {
        const scheduleNext = () => {
            if (!this._ready) return;
            const interval = 60000 + Math.random() * 240000;
            this._activityTask = setTimeout(async () => {
                if (!this._ready) return;
                if (!this._checkAccountStatus()) return;
                try { await this._syncActivity(); } catch {}
                scheduleNext();
            }, interval);
        };
        scheduleNext();
    }

    async _fetchUserStatus() {
        try {
            const response = await this._batchExecute([
                new RPCData({ rpcid: GRPC.GET_USER_STATUS, payload: '[]' }),
            ]);
            const responseJson = extractJsonFromResponse(response.data);
            for (const part of responseJson) {
                const partBodyStr = getNestedValue(part, [2]);
                if (!partBodyStr) continue;
                let partBody;
                try { partBody = JSON.parse(partBodyStr); } catch { continue; }

                const statusCode = getNestedValue(partBody, [14]);
                this.accountStatus = AccountStatus.fromStatusCode(statusCode);

                const isUnauthenticated = this.accountStatus === AccountStatus.UNAUTHENTICATED;
                if (this.accountStatus !== AccountStatus.AVAILABLE && !isUnauthenticated) {
                    console.warn(`Account status: ${this.accountStatus.name} - ${this.accountStatus.description}`);
                    if ([
                        AccountStatus.LOCATION_REJECTED,
                        AccountStatus.ACCOUNT_REJECTED,
                        AccountStatus.ACCESS_TEMPORARILY_UNAVAILABLE,
                        AccountStatus.ACCOUNT_REJECTED_BY_GUARDIAN,
                        AccountStatus.GUARDIAN_APPROVAL_REQUIRED,
                    ].includes(this.accountStatus)) continue;
                }

                const modelsList = getNestedValue(partBody, [15]);
                if (!Array.isArray(modelsList)) continue;

                const tierFlags = Array.isArray(getNestedValue(partBody, [16], [])) ? getNestedValue(partBody, [16], []) : [];
                const capabilityFlags = Array.isArray(getNestedValue(partBody, [17], [])) ? getNestedValue(partBody, [17], []) : [];
                const [capacity, capacityField] = AvailableModel.computeCapacity(tierFlags, capabilityFlags);
                const idNameMapping = AvailableModel.buildModelIdNameMapping();
                const idNumberMapping = AvailableModel.buildModelIdNumberMapping();

                if (isUnauthenticated) this.accountStatus = AccountStatus.AVAILABLE;

                for (const modelData of modelsList) {
                    if (!Array.isArray(modelData)) continue;
                    const modelId = getNestedValue(modelData, [0], '');
                    const displayName = getNestedValue(modelData, [1], '');
                    const description = getNestedValue(modelData, [2], '');
                    if (modelId && displayName) {
                        this._modelRegistry[modelId] = new AvailableModel({
                            model_id: modelId, model_name: idNameMapping[modelId] || '',
                            display_name: displayName, description, capacity,
                            capacity_field: capacityField, model_number: idNumberMapping[modelId] || 1,
                            is_available: true,
                        });
                    }
                }
                return;
            }
        } catch (e) {
            if (this.verbose) console.debug(`_fetchUserStatus failed: ${e.message}`);
        }
    }

    async _syncActivity() {
        this._lastActivityTime = Date.now();
        if (!this._checkAccountStatus()) return;
        await this._batchExecute([
            new RPCData({ rpcid: GRPC.READ_USER_PREFERENCES, payload: '[[["bard_activity_enabled"]]]' }),
        ]);
    }

    async _fetchQuota() {
        if (!this._checkAccountStatus()) return;
        const payloads = [
            { key: 'flash', payload: '[[[1,11],[2,11],[6,11]]]' },
            { key: 'advanced', payload: '[[[1,4],[6,6],[1,15]]]' },
        ];
        const actionLabels = { 4: 'Gemini Pro', 11: 'Gemini Flash', 15: 'Gemini Flash Thinking' };
        for (const { key, payload } of payloads) {
            try {
                const res = await this._batchExecute([new RPCData({ rpcid: GRPC.CHECK_GEMINI_QUOTA, payload })]);
                const parts = extractJsonFromResponse(res.data);
                for (const part of parts) {
                    const bodyStr = getNestedValue(part, [2]);
                    if (!bodyStr) continue;
                    let body; try { body = JSON.parse(bodyStr); } catch { continue; }
                    const items = getNestedValue(body, [0]);
                    if (!Array.isArray(items)) continue;
                    for (const item of items) {
                        const actionId = getNestedValue(item, [0, 1]);
                        const usageLevel = getNestedValue(item, [2]);
                        const resetTs = getNestedValue(item, [3, 0]);
                        const total = getNestedValue(item, [4]);
                        const remaining = getNestedValue(item, [5]);
                        const label = actionLabels[actionId] || `Gemini ${key}`;
                        this._quotas[`${actionId}`] = { label, remaining, total, usage_percentage: usageLevel, reset_time: resetTs };
                    }
                }
            } catch {}
        }
    }

    async _fetchExtraQuota() {
        try {
            const res = await this._batchExecute([new RPCData({ rpcid: GRPC.CHECK_QUOTA, payload: '[]' })]);
            const parts = extractJsonFromResponse(res.data);
            for (const part of parts) {
                const bodyStr = getNestedValue(part, [2]);
                if (!bodyStr) continue;
                let body; try { body = JSON.parse(bodyStr); } catch { continue; }
                const isBlocked = getNestedValue(body, [0]);
                const usageLevel = getNestedValue(body, [1]);
                const resetTs = getNestedValue(body, [2, 0]);
                if (!this._quotas.extra) this._quotas.extra = {};
                this._quotas.extra.default = {
                    is_blocked: isBlocked,
                    usage_percentage: typeof usageLevel === 'number' ? usageLevel * 100 : null,
                    reset_time: resetTs,
                };
            }
        } catch {}
    }

    async _fetchAbuseStatus() {
        try {
            const res = await this._batchExecute([new RPCData({ rpcid: GRPC.GET_ABUSE_STATUS, payload: '[]' })]);
            const parts = extractJsonFromResponse(res.data);
            for (const part of parts) {
                const bodyStr = getNestedValue(part, [2]);
                if (!bodyStr) continue;
                let body; try { body = JSON.parse(bodyStr); } catch { continue; }
                const abuseInfo = getNestedValue(body, [1]);
                if (!abuseInfo) {
                    this._abuseStatus = { is_clean: true, status_code: null, signal: null };
                } else {
                    const rawStatus = getNestedValue(abuseInfo, [1]);
                    const signal = getNestedValue(abuseInfo, [3, 1]);
                    const statusCode = typeof rawStatus === 'number' ? Math.floor(rawStatus / 1000000) : null;
                    this._abuseStatus = { is_clean: false, status_code: statusCode, signal };
                }
            }
        } catch {}
    }

    _deriveTierFromRegistry() {
        const tierLabels = { 1: 'FREE', 2: 'PRO', 3: 'ULTRA', 4: 'PLUS', 6: 'ULTRA' };
        const models = Object.values(this._modelRegistry);
        if (!models.length) return { id: null, label: null };
        const hasUltra = models.some(m => m.capacity === 3);
        const hasAdvanced = models.some(m => m.capacity === 2 && m.capacity_field === 12);
        const hasPlus = models.some(m => m.capacity === 4);
        const hasHelium = models.some(m => m.capacity_field === 13);
        let tierId = 1;
        if (hasUltra) tierId = 3;
        else if (hasAdvanced) tierId = 2;
        else if (hasPlus) tierId = 4;
        else if (hasHelium) tierId = 2;
        return { id: tierId, label: tierLabels[tierId] || null };
    }

    async _fetchUsageInfo() {
        if (!this._checkAccountStatus()) return;
        const tierLabels = { 1: 'FREE', 2: 'PRO', 3: 'ULTRA', 4: 'PLUS', 6: 'ULTRA' };
        const metricWindows = { 1: ['current_5h', '5h'], 2: ['weekly', 'weekly'] };
        try {
            const res = await this._batchExecute([new RPCData({ rpcid: GRPC.GET_USAGE_INFO, payload: '[]' })], 2, false, '/usage');
            const parts = extractJsonFromResponse(res.data);
            for (const part of parts) {
                const bodyStr = getNestedValue(part, [2]);
                if (typeof bodyStr !== 'string') continue;
                let body; try { body = JSON.parse(bodyStr); } catch { continue; }
                if (!Array.isArray(body)) continue;
                const tierId = getNestedValue(body, [0]);
                if (tierId === null || tierId === undefined) continue;
                const usageItems = getNestedValue(body, [1], []);
                const useOverage = getNestedValue(body, [2]);
                const info = {
                    tier: { id: tierId, label: tierLabels[tierId] || null },
                    use_overage_ai_credits: useOverage,
                    current_5h: null, weekly: null,
                };
                if (Array.isArray(usageItems)) {
                    for (const item of usageItems) {
                        const remaining = getNestedValue(item, [0]);
                        const usageLevel = getNestedValue(item, [1]);
                        const metricType = getNestedValue(item, [2]);
                        const resetTs = getNestedValue(item, [3, 0, 0]);
                        if (metricType === 3) { info.ai_credits_remaining = remaining; continue; }
                        const [metricLabel] = metricWindows[metricType] || [`type_${metricType}`];
                        info[metricLabel] = {
                            type: metricType, remaining_credits: remaining, usage_level: usageLevel,
                            usage_percentage: typeof usageLevel === 'number' ? Math.round(usageLevel * 100) : null,
                            reset_at: resetTs,
                        };
                    }
                }
                this._usageInfo = info;
                this._quotas.usage_info = info;
                return;
            }
        } catch {}
        if (!this._usageInfo.tier || this._usageInfo.tier.id === null) {
            const tier = this._deriveTierFromRegistry();
            this._usageInfo = { tier, use_overage_ai_credits: null, current_5h: null, weekly: null };
            this._quotas.usage_info = this._usageInfo;
        }
    }

    async _fetchRecentChats(recent = 13) {
        if (!this._checkAccountStatus()) return;
        const fetchBatch = (payload) => this._batchExecute([
            new RPCData({ rpcid: GRPC.LIST_CHATS, payload: JSON.stringify([recent, null, payload]) }),
        ]);
        const [resp1, resp2] = await Promise.all([fetchBatch([1, null, 1]), fetchBatch([0, null, 1])]);
        const recentChats = [];
        const seenCids = new Set();
        for (const response of [resp1, resp2]) {
            const chatsJson = extractJsonFromResponse(response.data);
            for (const part of chatsJson) {
                const bodyStr = getNestedValue(part, [2]);
                if (!bodyStr) continue;
                let body; try { body = JSON.parse(bodyStr); } catch { continue; }
                const chatList = getNestedValue(body, [2]);
                if (!Array.isArray(chatList)) continue;
                for (const chatData of chatList) {
                    if (!Array.isArray(chatData) || chatData.length < 2) continue;
                    const cid = getNestedValue(chatData, [0], '');
                    const title = getNestedValue(chatData, [1], '');
                    const is_pinned = Boolean(getNestedValue(chatData, [2]));
                    const tsData = getNestedValue(chatData, [5]);
                    let timestamp = 0;
                    if (Array.isArray(tsData) && tsData.length >= 2) {
                        timestamp = Number(tsData[0]) + Number(tsData[1]) / 1e9;
                    }
                    if (cid && !seenCids.has(cid)) {
                        seenCids.add(cid);
                        recentChats.push({ cid, title, pinned: is_pinned, timestamp });
                    }
                }
                break;
            }
        }
        this._recentChats = recentChats;
    }

    async _batchExecute(payloads, retries = 2, closeOnError = true, sourcePath = '/app') {
        let lastErr;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const _reqid = this._reqid;
                this._reqid += 100000;
                const params = new URLSearchParams({
                    rpcids: payloads.map(p => p.rpcid).join(','),
                    hl: this.language || 'en',
                    _reqid: String(_reqid),
                    rt: 'c',
                    'source-path': sourcePath,
                });
                if (this.buildLabel) params.set('bl', this.buildLabel);
                if (this.sessionId) params.set('f.sid', this.sessionId);
                const body = new URLSearchParams({
                    at: this.accessToken || '',
                    'f.req': JSON.stringify([payloads.map(p => p.serialize())]),
                });
                const res = await axios.post(
                    `${Endpoint.BATCH_EXEC}?${params}`,
                    body.toString(),
                    {
                        headers: {
                            ...Headers.GEMINI, ...Headers.BATCH_EXEC, ...Headers.SAME_DOMAIN,
                            'Cookie': cookieStr(this.cookies),
                        },
                        timeout: this.timeout,
                        ...(this.proxy ? { proxy: parseProxy(this.proxy) } : {}),
                        validateStatus: null,
                    },
                );
                Object.assign(this.cookies, parseCookies(res.headers));
                if (res.status !== 200) {
                    if (closeOnError) await this.close();
                    throw new APIError(`Batch execution failed with status code ${res.status}`);
                }
                return res;
            } catch (e) {
                lastErr = e;
                if (attempt < retries) await sleep(1000 * (attempt + 1));
            }
        }
        throw lastErr;
    }
}

module.exports = { Gemini };
