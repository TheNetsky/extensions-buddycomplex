/* eslint-disable linebreak-style */
import {
    LanguageCode,
    SourceInfo,
    TagType,
    ContentRating
} from 'paperback-extensions-common'

import {
    BuddyComplex,
    getExportVersion
} from '../BuddyComplex'

const MANGAMAX_DOMAIN = 'https://mangamax.net'

export const MangaMaxInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaMax',
    description: 'Extension that pulls manga from MangaMax',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGAMAX_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class MangaMax extends BuddyComplex {

    baseUrl: string = MANGAMAX_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
