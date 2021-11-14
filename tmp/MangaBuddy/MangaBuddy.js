"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaBuddy = exports.MangaBuddyInfo = void 0;
/* eslint-disable linebreak-style */
const paperback_extensions_common_1 = require("paperback-extensions-common");
const BuddyComplex_1 = require("../BuddyComplex");
const MANGABUDDY_DOMAIN = 'https://mangabuddy.com';
exports.MangaBuddyInfo = {
    version: BuddyComplex_1.getExportVersion('0.0.0'),
    name: 'MangaBuddy',
    description: 'Extension that pulls manga from MangaBuddy',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: paperback_extensions_common_1.ContentRating.MATURE,
    websiteBaseURL: MANGABUDDY_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        },
    ]
};
class MangaBuddy extends BuddyComplex_1.BuddyComplex {
    constructor() {
        super(...arguments);
        this.baseUrl = MANGABUDDY_DOMAIN;
        this.languageCode = paperback_extensions_common_1.LanguageCode.ENGLISH;
    }
}
exports.MangaBuddy = MangaBuddy;
