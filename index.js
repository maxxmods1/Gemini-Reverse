'use strict';

const { Gemini } = require('./src/gemini');
const { ChatSession } = require('./src/chat');
const { Model, ErrorCode } = require('./src/constants');
const { AuthError, APIError, GeminiError, UsageLimitExceeded, ModelInvalid, TemporarilyBlocked } = require('./src/errors');
const { AvailableModel } = require('./src/types/model');
const { ModelOutput, Candidate } = require('./src/types/output');
const { Gem, GemJar } = require('./src/types/gem');
const { ChatTurn, ChatHistory, ChatInfo } = require('./src/types/chat');
const { DeepResearchPlan, DeepResearchStatus, DeepResearchResult } = require('./src/types/research');
const { Image, WebImage, GeneratedImage, Video, GeneratedVideo, GeneratedMedia } = require('./src/types/media');

module.exports = {
    Gemini,
    ChatSession,
    Model,
    ErrorCode,
    AuthError,
    APIError,
    GeminiError,
    UsageLimitExceeded,
    ModelInvalid,
    TemporarilyBlocked,
    AvailableModel,
    ModelOutput,
    Candidate,
    Gem,
    GemJar,
    ChatTurn,
    ChatHistory,
    ChatInfo,
    DeepResearchPlan,
    DeepResearchStatus,
    DeepResearchResult,
    Image,
    WebImage,
    GeneratedImage,
    Video,
    GeneratedVideo,
    GeneratedMedia,
};
