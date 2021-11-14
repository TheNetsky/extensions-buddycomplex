"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuddyComplex = exports.getExportVersion = void 0;
/* eslint-disable linebreak-style */
const paperback_extensions_common_1 = require("paperback-extensions-common");
const BuddyComplexParser_1 = require("./BuddyComplexParser");
// Set the version for the base, changing this version will change the versions of all sources
const BASE_VERSION = '1.0.0';
const getExportVersion = (EXTENSION_VERSION) => {
    return BASE_VERSION.split('.').map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index])).join('.');
};
exports.getExportVersion = getExportVersion;
class BuddyComplex extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        /**
         * Helps with CloudFlare for some sources, makes it worse for others; override with empty string if the latter is true
         */
        this.userAgentRandomizer = `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/78.0${Math.floor(Math.random() * 100000)}`;
        /**
         * Fallback image if no image is present
         * Default = "https://i.imgur.com/GYUxEX8.png"
         */
        this.fallbackImage = 'https://i.imgur.com/GYUxEX8.png';
        //----REQUEST MANAGER----
        this.requestManager = createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 15000,
        });
        this.parser = new BuddyComplexParser_1.BuddyComplexParser();
    }
    getMangaShareUrl(mangaId) {
        return `${this.baseUrl}/${mangaId}/`;
    }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/${mangaId}/`,
                method: 'GET',
                headers: this.constructHeaders({})
            });
            const response = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            return this.parser.parseMangaDetails($, mangaId, this);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/${mangaId}/`,
                method: 'GET',
                headers: this.constructHeaders({})
            });
            const response = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            return this.parser.parseChapterList($, mangaId, this);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/${mangaId}/${chapterId}/`,
                method: 'GET',
                headers: this.constructHeaders({}),
            });
            const response = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            return this.parser.parseChapterDetails($, mangaId, chapterId);
        });
    }
    getTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/`,
                method: 'GET',
                headers: this.constructHeaders({}),
            });
            const response = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            return this.parser.parseTags($, this);
        });
    }
    getSearchResults(query, metadata) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            let request;
            if (query.title) {
                request = createRequestObject({
                    url: `${this.baseUrl}/page/${page}/?s=`,
                    method: 'GET',
                    headers: this.constructHeaders({}),
                    param: encodeURI(query.title)
                });
            }
            else {
                request = createRequestObject({
                    url: `${this.baseUrl}/`,
                    method: 'GET',
                    headers: this.constructHeaders({}),
                    param: `genres/${(_b = query === null || query === void 0 ? void 0 : query.includedTags) === null || _b === void 0 ? void 0 : _b.map((x) => x.id)[0]}/page/${page}`
                });
            }
            const response = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            const manga = this.parser.parseSearchResults($, this);
            //metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined
            metadata = undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            let updatedManga = {
                ids: [],
            };
            const request = createRequestObject({
                url: `${this.baseUrl}`,
                method: 'GET',
                headers: this.constructHeaders({}),
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            updatedManga = this.parser.parseUpdatedManga($, time, ids, this);
            if (updatedManga.ids.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: updatedManga.ids
                }));
            }
        });
    }
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const section1 = createHomeSection({ id: 'hot_updates', title: 'Hot Updates', view_more: true });
            const section2 = createHomeSection({ id: 'latest_update', title: 'Latest Updates', view_more: true });
            const section3 = createHomeSection({ id: 'top_today', title: 'Top Today', view_more: true });
            const section4 = createHomeSection({ id: 'top_weekly', title: 'Top Weekly', view_more: true });
            const section5 = createHomeSection({ id: 'top_monthly', title: 'Top Monthly', view_more: true });
            const sections = [section1, section2, section3, section4, section5];
            const request = createRequestObject({
                url: `${this.baseUrl}/`,
                method: 'GET',
                headers: this.constructHeaders({})
            });
            const response = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            this.parser.parseHomeSections($, sections, sectionCallback, this);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            let param = '';
            switch (homepageSectionId) {
                case 'hot_updates':
                    param = 'popular';
                    break;
                case 'latest_update':
                    param = 'latest';
                    break;
                case 'top_today':
                    param = 'top/day';
                    break;
                case 'top_weekly':
                    param = 'top/week';
                    break;
                case 'top_monthly':
                    param = 'top/month';
                    break;
                default:
                    throw new Error(`Invalid homeSectionId | ${homepageSectionId}`);
            }
            const request = createRequestObject({
                url: `${this.baseUrl}/`,
                method: 'GET',
                headers: this.constructHeaders({}),
                param: `${param}?page=${page}`,
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = this.parser.parseViewMore($, this);
            metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
    getCloudflareBypassRequest() {
        return createRequestObject({
            url: `${this.baseUrl}/`,
            method: 'GET',
            headers: this.constructHeaders({})
        });
    }
    constructHeaders(headers, refererPath) {
        if (this.userAgentRandomizer !== '') {
            headers['user-agent'] = this.userAgentRandomizer;
        }
        headers['referer'] = `${this.baseUrl}${refererPath !== null && refererPath !== void 0 ? refererPath : ''}/`;
        return headers;
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > <The name of this source> and press Cloudflare Bypass');
        }
    }
}
exports.BuddyComplex = BuddyComplex;
