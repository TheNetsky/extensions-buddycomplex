/* eslint-disable linebreak-style */
import {
    Chapter,
    ChapterDetails,
    LanguageCode,
    Manga,
    MangaStatus,
    MangaTile,
    Tag,
    TagSection,
    HomeSection,
} from 'paperback-extensions-common'

import entities = require('entities')

export interface UpdatedManga {
    ids: string[];
}

export class BuddyComplexParser {

    parseMangaDetails($: CheerioSelector, mangaId: string, source: any): Manga {
        const titles = []
        titles.push(this.decodeHTMLEntity($('div.name.box > h1').text().trim()))

        const altTitles = $('div.name.box > h2').text().split(/, |; |\| |\/ /)
        for (const title of altTitles) {
            if (title == '') continue
            titles.push(this.decodeHTMLEntity(title.trim()))
        }

        const authorList = []
        for (const authorRaw of $('p:contains(Authors) > a', 'div.detail').toArray()) {
            let authorFormatted = $(authorRaw).text()
            authorFormatted = authorFormatted.replace(',', '')
            authorFormatted = authorFormatted.replace(';', '')
            authorFormatted = authorFormatted.replace('/', '')
            authorFormatted = authorFormatted.replace('\/', '')
            authorList.push(authorFormatted.trim())
        }

        const image = this.getImageSrc($('img', 'div.img-cover'))
        const description = this.decodeHTMLEntity($('div.section-body > p.content').text().trim())

        const arrayTags: Tag[] = []
        for (const tag of $('p:contains(Genres) > a', 'div.detail').toArray()) {
            const label = $(tag).text().trim()
            const id = encodeURI($(tag).attr('href')?.replace(`genres/`, '').replace(/\//g, '') ?? '')
            if (!id || !label) continue
            arrayTags.push({ id: id, label: label })
        }
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

        const rawStatus = $('p:contains(Status) > a', 'div.detail').first().text().trim()
        let status = MangaStatus.ONGOING
        switch (rawStatus.toUpperCase()) {
            case "ONGOING":
                status = MangaStatus.ONGOING
                break
            case "COMPLETED":
                status = MangaStatus.COMPLETED
                break
            default:
                status = MangaStatus.ONGOING
                break
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
        })
    }

    parseChapterList($: CheerioSelector, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []

        let langCode = source.languageCode

        for (const chapter of $('li', 'ul.chapter-list').toArray()) {
            const title = $('strong.chapter-title', chapter).text().trim()
            const id = $('a', chapter).attr('href')?.split('/').pop() ?? ''
            const date = this.parseDate($('time.chapter-update', chapter)?.text() ?? '')
            if (!id) continue

            const getNumber = id.split('-').pop() ?? ''
            const chapterNumberRegex = getNumber.match(/(\d+\.?\d?)/)
            let chapterNumber = 0
            if (chapterNumberRegex && chapterNumberRegex[1]) chapterNumber = Number(chapterNumberRegex[1])

            chapters.push(createChapter({
                id: id,
                mangaId,
                name: title,
                langCode: langCode,
                chapNum: chapterNumber,
                time: date,
            }))
        }
        return chapters
    }

    parseChapterDetails($: CheerioSelector, mangaId: string, chapterId: string): ChapterDetails {
        const pages: string[] = []

        for (const image of $('div.chapter-image', 'div#chapter-images.container').toArray()) {
            pages.push(this.getImageSrc($('img', image)))
        }

        const chapterDetails = createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        })

        return chapterDetails
    }

    parseTags($: CheerioSelector, source: any): TagSection[] {
        const arrayTags: Tag[] = []
        for (const tag of $('li', 'ul.genres__wrapper').toArray()) {
            const label = $(tag).text().trim()
            const id = encodeURI($(tag).attr('href')?.replace(`genres/`, '').replace(/\//g, '') ?? '')
            if (!id || !label) continue
            arrayTags.push({ id: id, label: label })
        }
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]
        return tagSections
    }

    parseSearchResults($: CheerioSelector, source: any): MangaTile[] {
        const mangas: MangaTile[] = []
        const collectedIds: string[] = []

        for (const manga of $('div.bs', 'div.listupd').toArray()) {
            const id = $('a', manga).attr('href') ?? ''
            const title = $('a', manga).attr('title')
            const image = this.getImageSrc($('img', manga))?.split('?resize')[0] ?? ''
            const subtitle = $('div.epxs', manga).text().trim()
            if (collectedIds.includes(id) || !id || !title) continue
            mangas.push(createMangaTile({
                id,
                image: image ? image : source.fallbackImage,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }))
            collectedIds.push(id)
        }
        return mangas
    }

    parseUpdatedManga($: CheerioStatic, time: Date, ids: string[], source: any): UpdatedManga {
        const updatedManga: string[] = []
        let loadMore = true

        const isLast = "" //this.isLastPage($) //Check if it's the last page or not, needed for some sites!
        if (!$(source.homescreen_LatestUpdate_selector_item, $(source.homescreen_LatestUpdate_selector_box)?.parent()?.next()).length) throw new Error('Unable to parse valid update section!')

        for (const manga of $(source.homescreen_LatestUpdate_selector_item, $(source.homescreen_LatestUpdate_selector_box).parent().next()).toArray()) {
            const id = $('a', manga).attr('href') ?? ''
            const mangaDate = new Date()

            //Check if manga time is older than the time porvided, is this manga has an update. Return this.
            if (!id) continue
            if (mangaDate > time) {
                if (ids.includes(id)) {
                    updatedManga.push(id)
                }
                // If there is an id but no mangadate, this means the site forgot to list the chapters on the front page. However this doesn't mean our search is over! (rare)
            } else if (id && mangaDate == null) {
                loadMore = true
                // If the latest mangaDate isn't older than our current time, we're done!
            } else {
                loadMore = false
            }
            //If the site does not have any more pages, we're done!
            if (isLast) loadMore = false
        }
        return {
            ids: updatedManga,
        }
    }

    parseHomeSections($: CheerioStatic, sections: HomeSection[], sectionCallback: (section: HomeSection) => void, source: any) {
        for (const section of sections) {
            //Hot Updates
            if (section.id == 'hot_updates') {
                const HotUpdates: MangaTile[] = []
                for (const manga of $('div.trending-item', 'div.main-carousel').toArray()) {
                    const id = $('a', manga).attr('href')?.replace('/', '') ?? ''
                    const title = $('a', manga).attr('title')
                    const image = this.getImageSrc($('img', manga))
                    const subtitle = $('span.latest-chapter', manga).text().trim()
                    if (!id || !title) continue
                    HotUpdates.push(createMangaTile({
                        id: id,
                        image: image ? image : source.fallbackImage,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                        subtitleText: createIconText({ text: subtitle }),
                    }))
                }
                section.items = HotUpdates
                sectionCallback(section)
            }

            //Latest Update
            if (section.id == 'latest_update') {
                const latestUpdate: MangaTile[] = []

                for (const manga of $('div.book-item.latest-item', 'div.section.box.grid-items').toArray()) {
                    let parsedJSON = null;

                    try {
                        const script = $('script', manga).html() ?? ''
                        parsedJSON = JSON.parse(script)
                    } catch (err) {
                        console.error(err)
                    }
                    if (!parsedJSON) throw new Error("Failed to parse JSON for the homescreen section!");

                    const id = parsedJSON.slug
                    const title = parsedJSON.name
                    const image = `https:${parsedJSON.cover}`

                    const subtitle = $('a', $('div.chap-item', manga).first()).text().trim()

                    if (!id || !title) continue
                    latestUpdate.push(createMangaTile({
                        id: id,
                        image: image ? image : source.fallbackImage,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                        subtitleText: createIconText({ text: subtitle }),
                    }))
                }
                section.items = latestUpdate
                sectionCallback(section)
            }

            //Top Today
            if (section.id == 'top_today') {
                const TopTodayManga: MangaTile[] = []
                for (const manga of $("div.top-item", $("div.tab-panel")[0]).toArray()) {
                    const id = $("a", manga).attr('href')?.replace("/", "") ?? '';
                    const title = $("h3.title", manga).text().trim();
                    const image = this.getImageSrc($('img', manga))
                    const subtitle = $("h4.chap-item", manga).text().trim();
                    if (!id || !title) continue;
                    TopTodayManga.push(createMangaTile({
                        id: id,
                        image: image,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                        subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) }),
                    }));
                }
                section.items = TopTodayManga
                sectionCallback(section)
            }

            //Top Weekly
            if (section.id == 'top_weekly') {
                const TopWeeklyManga: MangaTile[] = []
                for (const manga of $("div.top-item", $("div.tab-panel")[1]).toArray()) {
                    const id = $("a", manga).attr('href')?.replace("/", "") ?? '';
                    const title = $("h3.title", manga).text().trim();
                    const image = this.getImageSrc($('img', manga))
                    const subtitle = $("h4.chap-item", manga).text().trim();
                    if (!id || !title) continue;
                    TopWeeklyManga.push(createMangaTile({
                        id: id,
                        image: image,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                        subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) }),
                    }));
                }
                section.items = TopWeeklyManga
                sectionCallback(section)
            }

            //Top Monthly
            if (section.id == 'top_monthly') {
                const TopMonthlyManga: MangaTile[] = []
                for (const manga of $("div.top-item", $("div.tab-panel")[2]).toArray()) {
                    const id = $("a", manga).attr('href')?.replace("/", "") ?? ''
                    const title = $("h3.title", manga).text().trim()
                    const image = this.getImageSrc($('img', manga))
                    const subtitle = $("h4.chap-item", manga).text().trim();
                    if (!id || !title) continue;
                    TopMonthlyManga.push(createMangaTile({
                        id: id,
                        image: image,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                        subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) }),
                    }));
                }
                section.items = TopMonthlyManga
                sectionCallback(section)
            }

        }
    }

    parseViewMore = ($: CheerioStatic, source: any): MangaTile[] => {
        const mangas: MangaTile[] = []
        const collectedIds: string[] = []

        for (const manga of $('div.book-item', 'div.list').toArray()) {
            const id = $("a", manga).attr('href')?.replace("/", "") ?? ''
            const title = $('div.title', manga).text().trim()
            const image = this.getImageSrc($('img', manga))
            const subtitle = $('span.latest-chapter', manga).text().trim()
            if (collectedIds.includes(id) || !id || !title) continue
            mangas.push(createMangaTile({
                id,
                image: image ? image : source.fallbackImage,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subtitle }),
            }))
            collectedIds.push(id)
        }
        return mangas
    }

    isLastPage = ($: CheerioStatic): boolean => {
        let isLast = false

        const currentPage = Number($('a.link.active', 'div.paginator').text().trim())

        const pages = []
        for (const page of $('a.link', 'div.paginator').toArray()) {
            const p = Number($(page).text().trim())
            if (isNaN(p)) continue;
            pages.push(p);
        }
        const lastPage = Math.max(...pages);

        if (currentPage >= lastPage) isLast = true;

        console.log(isLast)
        return isLast
    }

    protected getImageSrc(imageObj: Cheerio | undefined): string {
        let image: any
        const dataLazy = imageObj?.attr('data-lazy-src')
        const srcset = imageObj?.attr('srcset')
        const dataSRC = imageObj?.attr('data-src')

        if ((typeof dataLazy != 'undefined') && !dataLazy?.startsWith('data')) {
            image = imageObj?.attr('data-lazy-src')
        } else if ((typeof srcset != 'undefined') && !srcset?.startsWith('data')) {
            image = imageObj?.attr('srcset')?.split(' ')[0] ?? ''
        } else if ((typeof dataSRC != 'undefined') && !dataSRC?.startsWith('data')) {
            image = imageObj?.attr('data-src')
        } else {
            image = null
        }

        const wpRegex = image?.match(/(https:\/\/i\d.wp.com)/)
        if (wpRegex) image = image.replace(wpRegex[0], '')

        if (image?.startsWith('//')) image = `https:${image}`
        if (!image?.startsWith('http')) image = `https://${image}`


        return encodeURI(decodeURI(this.decodeHTMLEntity(image?.trim() ?? '')))
    }

    protected decodeHTMLEntity(str: string): string {
        return entities.decodeHTML(str)
    }

    protected parseDate = (date: string): Date => {
        date = date.toUpperCase()
        let time: Date
        const number = Number((/\d*/.exec(date) ?? [])[0])
        if (date.includes('LESS THAN AN HOUR') || date.includes('JUST NOW')) {
            time = new Date(Date.now())
        } else if (date.includes('YEAR') || date.includes('YEARS')) {
            time = new Date(Date.now() - (number * 31556952000))
        } else if (date.includes('MONTH') || date.includes('MONTHS')) {
            time = new Date(Date.now() - (number * 2592000000))
        } else if (date.includes('WEEK') || date.includes('WEEKS')) {
            time = new Date(Date.now() - (number * 604800000))
        } else if (date.includes('YESTERDAY')) {
            time = new Date(Date.now() - 86400000)
        } else if (date.includes('DAY') || date.includes('DAYS')) {
            time = new Date(Date.now() - (number * 86400000))
        } else if (date.includes('HOUR') || date.includes('HOURS')) {
            time = new Date(Date.now() - (number * 3600000))
        } else if (date.includes('MINUTE') || date.includes('MINUTES')) {
            time = new Date(Date.now() - (number * 60000))
        } else if (date.includes('SECOND') || date.includes('SECONDS')) {
            time = new Date(Date.now() - (number * 1000))
        } else {
            time = new Date(date)
        }
        return time
    }

}
