/* eslint-disable linebreak-style */
import {
    LanguageCode,
    SourceInfo,
    TagType,
    ContentRating,
    HomeSection
} from 'paperback-extensions-common'

import {
    BuddyComplex,
    getExportVersion
} from '../BuddyComplex'

const MANGABUDDY_DOMAIN = 'https://mangabuddy.com'

export const MangaBuddyInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaBuddy',
    description: 'Extension that pulls manga from MangaBuddy',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGABUDDY_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class MangaBuddy extends BuddyComplex {

    baseUrl: string = MANGABUDDY_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const section1 = createHomeSection({ id: 'hot_updates', title: 'Hot Updates', view_more: true })
        const section2 = createHomeSection({ id: 'latest_update', title: 'Latest Updates', view_more: true })
        const section3 = createHomeSection({ id: 'top_today', title: 'Top Today', view_more: true })
        const section4 = createHomeSection({ id: 'top_weekly', title: 'Top Weekly', view_more: true })
        const section5 = createHomeSection({ id: 'top_monthly', title: 'Top Monthly', view_more: true })

        const sections: any[] = [section1, section2, section3, section4, section5]

        const request = createRequestObject({
            url: `${this.baseUrl}/home`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        this.parser.parseHomeSections($, sections, sectionCallback, this)
    }

}
