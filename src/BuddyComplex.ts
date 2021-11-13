/* eslint-disable linebreak-style */
import {
    Chapter,
    ChapterDetails,
    HomeSection,
    LanguageCode,
    Manga,
    MangaUpdates,
    PagedResults,
    SearchRequest,
    Source,
    TagSection,

} from 'paperback-extensions-common'

import {
    BuddyComplexParser,
    UpdatedManga
} from './BuddyComplexParser'


// Set the version for the base, changing this version will change the versions of all sources
const BASE_VERSION = '1.0.0'
export const getExportVersion = (EXTENSION_VERSION: string): string => {
    return BASE_VERSION.split('.').map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index])).join('.')
}

export abstract class BuddyComplex extends Source {
    /**
     * The URL of the website. Eg. https://mangadark.com without a trailing slash
     */
    abstract baseUrl: string

    /**
     * The language code which this source supports.
     */
    abstract languageCode: LanguageCode

    /**
     * Helps with CloudFlare for some sources, makes it worse for others; override with empty string if the latter is true
     */
    userAgentRandomizer = `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/78.0${Math.floor(Math.random() * 100000)}`

    /**
     * Fallback image if no image is present
     * Default = "https://i.imgur.com/GYUxEX8.png"
     */
    fallbackImage = 'https://i.imgur.com/GYUxEX8.png'


    //----REQUEST MANAGER----
    requestManager = createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 15000,
    });

    parser = new BuddyComplexParser();


    override getMangaShareUrl(mangaId: string): string {
        return `${this.baseUrl}/${mangaId}/`
    }

    override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${mangaId}/`,
            method: 'GET',
            headers: this.constructHeaders({})
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseMangaDetails($, mangaId, this)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${mangaId}/`,
            method: 'GET',
            headers: this.constructHeaders({})
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseChapterList($, mangaId, this)
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${mangaId}/${chapterId}/`,
            method: 'GET',
            headers: this.constructHeaders({}),
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }

    override async getTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/`,
            method: 'GET',
            headers: this.constructHeaders({}),
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseTags($, this)
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1
        let request

        if (query.title) {
            request = createRequestObject({
                url: `${this.baseUrl}/page/${page}/?s=`,
                method: 'GET',
                headers: this.constructHeaders({}),
                param: encodeURI(query.title)
            })
        } else {
            request = createRequestObject({
                url: `${this.baseUrl}/`,
                method: 'GET',
                headers: this.constructHeaders({}),
                param: `genres/${query?.includedTags?.map((x: any) => x.id)[0]}/page/${page}`
            })
        }

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        const manga = this.parser.parseSearchResults($, this)
        //metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined
        metadata =  undefined
        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let updatedManga: UpdatedManga = {
            ids: [],
        };

        const request = createRequestObject({
            url: `${this.baseUrl}`,
            method: 'GET',
            headers: this.constructHeaders({}),
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)

        updatedManga = this.parser.parseUpdatedManga($, time, ids, this)
        if (updatedManga.ids.length > 0) {
            mangaUpdatesFoundCallback(createMangaUpdates({
                ids: updatedManga.ids
            }));
        }
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const section1 = createHomeSection({ id: 'hot_updates', title: 'Hot Updates', view_more: true })
        const section2 = createHomeSection({ id: 'latest_update', title: 'Latest Updates', view_more: true })
        const section3 = createHomeSection({ id: 'top_today', title: 'Top Today', view_more: true })
        const section4 = createHomeSection({ id: 'top_weekly', title: 'Top Weekly', view_more: true })
        const section5 = createHomeSection({ id: 'top_monthly', title: 'Top Monthly', view_more: true })

        const sections: any[] = [section1, section2, section3, section4, section5]

        const request = createRequestObject({
            url: `${this.baseUrl}/`,
            method: 'GET',
            headers: this.constructHeaders({})
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        this.parser.parseHomeSections($, sections, sectionCallback, this)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let param = ''
        switch (homepageSectionId) {
            case 'hot_updates':
                param = `popular`
                break
            case 'latest_update':
                param = `latest`
                break
            case 'top_today':
                param = `top/day`
                break
            case 'top_weekly':
                param = `top/week`
                break
            case 'top_monthly':
                param = `top/month`
                break
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }

        const request = createRequestObject({
            url: `${this.baseUrl}/`,
            method: 'GET',
            headers: this.constructHeaders({}),
            param: `${param}?page=${page}`,
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)

        const manga = this.parser.parseViewMore($, this)

        metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined
        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override getCloudflareBypassRequest() {
        return createRequestObject({
            url: `${this.baseUrl}/`,
            method: 'GET',
            headers: this.constructHeaders({})
        })
    }

    constructHeaders(headers: any, refererPath?: string): any {
        if (this.userAgentRandomizer !== '') {
            headers['user-agent'] = this.userAgentRandomizer
        }
        headers['referer'] = `${this.baseUrl}${refererPath ?? ''}/`
        return headers
    }

    CloudFlareError(status: any) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > <The name of this source> and press Cloudflare Bypass')
        }
    }

}
