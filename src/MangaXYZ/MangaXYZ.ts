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

const MANGAXYZ_DOMAIN = 'https://mangaxyz.com'

export const MangaXYZInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaXYZ',
    description: 'Extension that pulls manga from MangaXYZ',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGAXYZ_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class MangaXYZ extends BuddyComplex {

    baseUrl: string = MANGAXYZ_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
