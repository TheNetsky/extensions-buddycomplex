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

const MANGAFAB_DOMAIN = 'https://mangafab.com'

export const MangaFabInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaFab',
    description: 'Extension that pulls manga from MangaFab',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGAFAB_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class MangaFab extends BuddyComplex {

    baseUrl: string = MANGAFAB_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
