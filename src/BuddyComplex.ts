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
    Request,
    Response

} from 'paperback-extensions-common'

import {
    BuddyComplexParser,
    UpdatedManga
} from './BuddyComplexParser'

import { URLBuilder } from './BuddyComplexHelper'

// Set the version for the base, changing this version will change the versions of all sources
const BASE_VERSION = '1.1.0'
export const getExportVersion = (EXTENSION_VERSION: string): string => {
    return BASE_VERSION.split('.').map((x, index) => Number(x) + Number(EXTENSION_VERSION.split('.')[index])).join('.')
}

export abstract class BuddyComplex extends Source {
    /**
     * The URL of the website. Eg. https://mangafab.com without a trailing slash
     */
    abstract baseUrl: string

    /**
     * The language code which this source supports.
     */
    abstract languageCode: LanguageCode

    /**
     * Sets the to be used UserAgent for requests
     */
    userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1'

    /**
     * Fallback image if no image is present
     * Default = "https://i.imgur.com/GYUxEX8.png"
     */
    fallbackImage = 'https://i.imgur.com/GYUxEX8.png'


    //----REQUEST MANAGER----
    requestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': this.userAgent,
                        'referer': `${this.baseUrl}/`
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    });

    parser = new BuddyComplexParser();


    override getMangaShareUrl(mangaId: string): string {
        return `${this.baseUrl}/${mangaId}/`
    }

    override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${this.baseUrl}/${mangaId}/`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseMangaDetails($, mangaId, this)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${this.baseUrl}/api/manga/${mangaId}/chapters?source=detail`,
            method: 'GET',
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
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseTags($, this)
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1

        const url = new URLBuilder(this.baseUrl)
            .addPathComponent('search')
            .addQueryParameter('page', page)
            .addQueryParameter('q', encodeURI(query?.title || ''))
            .addQueryParameter('genre', query.includedTags?.map((x: any) => x.id).join('%5B%5D'))
            .buildUrl()

        const request = createRequestObject({
            url: url,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        const manga = this.parser.parseViewMore($, this)
        metadata = !this.parser.isLastPage($) ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let updatedManga: UpdatedManga = {
            ids: [],
        }

        const request = createRequestObject({
            url: `${this.baseUrl}/`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)

        updatedManga = this.parser.parseUpdatedManga($, time, ids, this)
        if (updatedManga.ids.length > 0) {
            mangaUpdatesFoundCallback(createMangaUpdates({
                ids: updatedManga.ids
            }))
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
                param = 'popular'
                break
            case 'latest_update':
                param = 'latest'
                break
            case 'top_today':
                param = 'top/day'
                break
            case 'top_weekly':
                param = 'top/week'
                break
            case 'top_monthly':
                param = 'top/month'
                break
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }

        const request = createRequestObject({
            url: `${this.baseUrl}/`,
            method: 'GET',
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
            headers: {
                'user-agent': this.userAgent
            }
        })
    }

    CloudFlareError(status: any) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > <The name of this source> and press Cloudflare Bypass')
        }
    }

}
