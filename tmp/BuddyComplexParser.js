"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuddyComplexParser = void 0;
/* eslint-disable linebreak-style */
const paperback_extensions_common_1 = require("paperback-extensions-common");
const entities = require("entities");
class BuddyComplexParser {
    constructor() {
        this.parseViewMore = ($, source) => {
            var _a, _b;
            const mangas = [];
            const collectedIds = [];
            for (const manga of $('div.book-item', 'div.list').toArray()) {
                const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.replace('/', '')) !== null && _b !== void 0 ? _b : '';
                const title = $('div.title', manga).text().trim();
                const image = this.getImageSrc($('img', manga));
                const subtitle = $('span.latest-chapter', manga).text().trim();
                if (collectedIds.includes(id) || !id || !title)
                    continue;
                mangas.push(createMangaTile({
                    id,
                    image: image ? image : source.fallbackImage,
                    title: createIconText({ text: this.decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text: subtitle }),
                }));
                collectedIds.push(id);
            }
            return mangas;
        };
        this.isLastPage = ($) => {
            let isLast = false;
            const currentPage = Number($('a.link.active', 'div.paginator').text().trim());
            const pages = [];
            for (const page of $('a.link', 'div.paginator').toArray()) {
                const p = Number($(page).text().trim());
                if (isNaN(p))
                    continue;
                pages.push(p);
            }
            const lastPage = Math.max(...pages);
            if (currentPage >= lastPage)
                isLast = true;
            console.log(isLast);
            return isLast;
        };
        this.parseDate = (date) => {
            var _a;
            date = date.toUpperCase();
            let time;
            const number = Number(((_a = /\d*/.exec(date)) !== null && _a !== void 0 ? _a : [])[0]);
            if (date.includes('LESS THAN AN HOUR') || date.includes('JUST NOW')) {
                time = new Date(Date.now());
            }
            else if (date.includes('YEAR') || date.includes('YEARS')) {
                time = new Date(Date.now() - (number * 31556952000));
            }
            else if (date.includes('MONTH') || date.includes('MONTHS')) {
                time = new Date(Date.now() - (number * 2592000000));
            }
            else if (date.includes('WEEK') || date.includes('WEEKS')) {
                time = new Date(Date.now() - (number * 604800000));
            }
            else if (date.includes('YESTERDAY')) {
                time = new Date(Date.now() - 86400000);
            }
            else if (date.includes('DAY') || date.includes('DAYS')) {
                time = new Date(Date.now() - (number * 86400000));
            }
            else if (date.includes('HOUR') || date.includes('HOURS')) {
                time = new Date(Date.now() - (number * 3600000));
            }
            else if (date.includes('MINUTE') || date.includes('MINUTES')) {
                time = new Date(Date.now() - (number * 60000));
            }
            else if (date.includes('SECOND') || date.includes('SECONDS')) {
                time = new Date(Date.now() - (number * 1000));
            }
            else {
                time = new Date(date);
            }
            return time;
        };
    }
    parseMangaDetails($, mangaId, source) {
        var _a, _b, _c;
        const titles = [];
        titles.push(this.decodeHTMLEntity($('div.name.box > h1').text().trim()));
        const altTitles = $('div.name.box > h2').text().split(/, |; |\| |\/ /);
        for (const title of altTitles) {
            if (title == '')
                continue;
            titles.push(this.decodeHTMLEntity(title.trim()));
        }
        const authorList = [];
        for (const authorRaw of $('p:contains(Authors) > a', 'div.detail').toArray()) {
            const authorFormatted = (_a = $(authorRaw).attr('title')) !== null && _a !== void 0 ? _a : '';
            authorList.push(authorFormatted.trim());
        }
        const image = this.getImageSrc($('img', 'div.img-cover'));
        const description = this.decodeHTMLEntity($('div.section-body > p.content').text().trim());
        const arrayTags = [];
        for (const tag of $('p:contains(Genres) > a', 'div.detail').toArray()) {
            const label = $(tag).text().trim();
            const id = encodeURI((_c = (_b = $(tag).attr('href')) === null || _b === void 0 ? void 0 : _b.replace('genres/', '').replace(/\//g, '')) !== null && _c !== void 0 ? _c : '');
            if (!id || !label)
                continue;
            arrayTags.push({ id: id, label: label });
        }
        const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
        const rawStatus = $('p:contains(Status) > a', 'div.detail').first().text().trim();
        let status = paperback_extensions_common_1.MangaStatus.ONGOING;
        switch (rawStatus.toUpperCase()) {
            case 'ONGOING':
                status = paperback_extensions_common_1.MangaStatus.ONGOING;
                break;
            case 'COMPLETED':
                status = paperback_extensions_common_1.MangaStatus.COMPLETED;
                break;
            default:
                status = paperback_extensions_common_1.MangaStatus.ONGOING;
                break;
        }
        return createManga({
            id: mangaId,
            titles: titles,
            image: image ? image : source.fallbackImage,
            status: status,
            author: authorList.length > 0 ? authorList.join(', ') : 'Unknown',
            artist: 'Unknown',
            tags: tagSections,
            desc: description,
        });
    }
    parseChapterList($, mangaId, source) {
        var _a, _b, _c, _d, _e;
        const chapters = [];
        const langCode = source.languageCode;
        for (const chapter of $('li', 'ul.chapter-list').toArray()) {
            const title = $('strong.chapter-title', chapter).text().trim();
            const id = (_b = (_a = $('a', chapter).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/').pop()) !== null && _b !== void 0 ? _b : '';
            const date = this.parseDate((_d = (_c = $('time.chapter-update', chapter)) === null || _c === void 0 ? void 0 : _c.text()) !== null && _d !== void 0 ? _d : '');
            if (!id)
                continue;
            const getNumber = (_e = id.split('-').pop()) !== null && _e !== void 0 ? _e : '';
            const chapterNumberRegex = getNumber.match(/(\d+\.?\d?)/);
            let chapterNumber = 0;
            if (chapterNumberRegex && chapterNumberRegex[1])
                chapterNumber = Number(chapterNumberRegex[1]);
            chapters.push(createChapter({
                id: id,
                mangaId,
                name: title,
                langCode: langCode,
                chapNum: chapterNumber,
                time: date,
            }));
        }
        return chapters;
    }
    parseChapterDetails($, mangaId, chapterId) {
        const pages = [];
        for (const image of $('div.chapter-image', 'div#chapter-images.container').toArray()) {
            pages.push(this.getImageSrc($('img', image)));
        }
        const chapterDetails = createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        });
        return chapterDetails;
    }
    parseTags($, source) {
        var _a, _b;
        const arrayTags = [];
        for (const tag of $('li', 'ul.genres__wrapper').toArray()) {
            const label = $(tag).text().trim();
            const id = encodeURI((_b = (_a = $(tag).attr('href')) === null || _a === void 0 ? void 0 : _a.replace('genres/', '').replace(/\//g, '')) !== null && _b !== void 0 ? _b : '');
            if (!id || !label)
                continue;
            arrayTags.push({ id: id, label: label });
        }
        const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
        return tagSections;
    }
    parseSearchResults($, source) {
        var _a, _b, _c;
        const mangas = [];
        const collectedIds = [];
        for (const manga of $('div.bs', 'div.listupd').toArray()) {
            const id = (_a = $('a', manga).attr('href')) !== null && _a !== void 0 ? _a : '';
            const title = $('a', manga).attr('title');
            const image = (_c = (_b = this.getImageSrc($('img', manga))) === null || _b === void 0 ? void 0 : _b.split('?resize')[0]) !== null && _c !== void 0 ? _c : '';
            const subtitle = $('div.epxs', manga).text().trim();
            if (collectedIds.includes(id) || !id || !title)
                continue;
            mangas.push(createMangaTile({
                id,
                image: image ? image : source.fallbackImage,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }));
            collectedIds.push(id);
        }
        return mangas;
    }
    parseUpdatedManga($, time, ids, source) {
        var _a, _b, _c;
        const updatedManga = [];
        let loadMore = true;
        const isLast = ''; //this.isLastPage($) //Check if it's the last page or not, needed for some sites!
        if (!$(source.homescreen_LatestUpdate_selector_item, (_b = (_a = $(source.homescreen_LatestUpdate_selector_box)) === null || _a === void 0 ? void 0 : _a.parent()) === null || _b === void 0 ? void 0 : _b.next()).length)
            throw new Error('Unable to parse valid update section!');
        for (const manga of $(source.homescreen_LatestUpdate_selector_item, $(source.homescreen_LatestUpdate_selector_box).parent().next()).toArray()) {
            const id = (_c = $('a', manga).attr('href')) !== null && _c !== void 0 ? _c : '';
            const mangaDate = new Date();
            //Check if manga time is older than the time porvided, is this manga has an update. Return this.
            if (!id)
                continue;
            if (mangaDate > time) {
                if (ids.includes(id)) {
                    updatedManga.push(id);
                }
                // If there is an id but no mangadate, this means the site forgot to list the chapters on the front page. However this doesn't mean our search is over! (rare)
            }
            else if (id && mangaDate == null) {
                loadMore = true;
                // If the latest mangaDate isn't older than our current time, we're done!
            }
            else {
                loadMore = false;
            }
            //If the site does not have any more pages, we're done!
            if (isLast)
                loadMore = false;
        }
        return {
            ids: updatedManga,
        };
    }
    parseHomeSections($, sections, sectionCallback, source) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        for (const section of sections) {
            //Hot Updates
            if (section.id == 'hot_updates') {
                const HotUpdates = [];
                for (const manga of $('div.trending-item', 'div.main-carousel').toArray()) {
                    const id = (_b = (_a = $('a', manga).attr('href')) === null || _a === void 0 ? void 0 : _a.replace('/', '')) !== null && _b !== void 0 ? _b : '';
                    const title = $('a', manga).attr('title');
                    const image = this.getImageSrc($('img', manga));
                    const subtitle = $('span.latest-chapter', manga).text().trim();
                    if (!id || !title)
                        continue;
                    HotUpdates.push(createMangaTile({
                        id: id,
                        image: image ? image : source.fallbackImage,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                        subtitleText: createIconText({ text: subtitle }),
                    }));
                }
                section.items = HotUpdates;
                sectionCallback(section);
            }
            //Latest Update
            if (section.id == 'latest_update') {
                const latestUpdate = [];
                for (const manga of $('div.book-item.latest-item', 'div.section.box.grid-items').toArray()) {
                    let parsedJSON = null;
                    try {
                        const script = (_c = $('script', manga).html()) !== null && _c !== void 0 ? _c : '';
                        parsedJSON = JSON.parse(script);
                    }
                    catch (err) {
                        console.error(err);
                    }
                    if (!parsedJSON)
                        throw new Error('Failed to parse JSON for the homescreen section!');
                    const id = parsedJSON.slug;
                    const title = parsedJSON.name;
                    const image = `https:${parsedJSON.cover}`;
                    const subtitle = $('a', $('div.chap-item', manga).first()).text().trim();
                    if (!id || !title)
                        continue;
                    latestUpdate.push(createMangaTile({
                        id: id,
                        image: image ? image : source.fallbackImage,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                        subtitleText: createIconText({ text: subtitle }),
                    }));
                }
                section.items = latestUpdate;
                sectionCallback(section);
            }
            //Top Today
            if (section.id == 'top_today') {
                const TopTodayManga = [];
                for (const manga of $('div.top-item', $('div.tab-panel')[0]).toArray()) {
                    const id = (_e = (_d = $('a', manga).attr('href')) === null || _d === void 0 ? void 0 : _d.replace('/', '')) !== null && _e !== void 0 ? _e : '';
                    const title = $('h3.title', manga).text().trim();
                    const image = this.getImageSrc($('img', manga));
                    const subtitle = $('h4.chap-item', manga).text().trim();
                    if (!id || !title)
                        continue;
                    TopTodayManga.push(createMangaTile({
                        id: id,
                        image: image,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                        subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) }),
                    }));
                }
                section.items = TopTodayManga;
                sectionCallback(section);
            }
            //Top Weekly
            if (section.id == 'top_weekly') {
                const TopWeeklyManga = [];
                for (const manga of $('div.top-item', $('div.tab-panel')[1]).toArray()) {
                    const id = (_g = (_f = $('a', manga).attr('href')) === null || _f === void 0 ? void 0 : _f.replace('/', '')) !== null && _g !== void 0 ? _g : '';
                    const title = $('h3.title', manga).text().trim();
                    const image = this.getImageSrc($('img', manga));
                    const subtitle = $('h4.chap-item', manga).text().trim();
                    if (!id || !title)
                        continue;
                    TopWeeklyManga.push(createMangaTile({
                        id: id,
                        image: image,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                        subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) }),
                    }));
                }
                section.items = TopWeeklyManga;
                sectionCallback(section);
            }
            //Top Monthly
            if (section.id == 'top_monthly') {
                const TopMonthlyManga = [];
                for (const manga of $('div.top-item', $('div.tab-panel')[2]).toArray()) {
                    const id = (_j = (_h = $('a', manga).attr('href')) === null || _h === void 0 ? void 0 : _h.replace('/', '')) !== null && _j !== void 0 ? _j : '';
                    const title = $('h3.title', manga).text().trim();
                    const image = this.getImageSrc($('img', manga));
                    const subtitle = $('h4.chap-item', manga).text().trim();
                    if (!id || !title)
                        continue;
                    TopMonthlyManga.push(createMangaTile({
                        id: id,
                        image: image,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                        subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) }),
                    }));
                }
                section.items = TopMonthlyManga;
                sectionCallback(section);
            }
        }
    }
    getImageSrc(imageObj) {
        var _a, _b, _c;
        let image;
        const dataLazy = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-lazy-src');
        const srcset = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('srcset');
        const dataSRC = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-src');
        if ((typeof dataLazy != 'undefined') && !(dataLazy === null || dataLazy === void 0 ? void 0 : dataLazy.startsWith('data'))) {
            image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-lazy-src');
        }
        else if ((typeof srcset != 'undefined') && !(srcset === null || srcset === void 0 ? void 0 : srcset.startsWith('data'))) {
            image = (_b = (_a = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('srcset')) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) !== null && _b !== void 0 ? _b : '';
        }
        else if ((typeof dataSRC != 'undefined') && !(dataSRC === null || dataSRC === void 0 ? void 0 : dataSRC.startsWith('data'))) {
            image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-src');
        }
        else {
            image = null;
        }
        const wpRegex = image === null || image === void 0 ? void 0 : image.match(/(https:\/\/i\d.wp.com)/);
        if (wpRegex)
            image = image.replace(wpRegex[0], '');
        if (image === null || image === void 0 ? void 0 : image.startsWith('//'))
            image = `https:${image}`;
        if (!(image === null || image === void 0 ? void 0 : image.startsWith('http')))
            image = `https://${image}`;
        return encodeURI(decodeURI(this.decodeHTMLEntity((_c = image === null || image === void 0 ? void 0 : image.trim()) !== null && _c !== void 0 ? _c : '')));
    }
    decodeHTMLEntity(str) {
        return entities.decodeHTML(str);
    }
}
exports.BuddyComplexParser = BuddyComplexParser;
