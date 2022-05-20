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

const MANGAFOREST_DOMAIN = 'https://mangaforest.com'

export const MangaForestInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaForest',
    description: 'Extension that pulls manga from MangaForest',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGAFOREST_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class MangaForest extends BuddyComplex {

    baseUrl: string = MANGAFOREST_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
