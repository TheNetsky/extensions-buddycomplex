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

const MANGASAGA_DOMAIN = 'https://mangasaga.com'

export const MangaSagaInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaSaga',
    description: 'Extension that pulls manga from MangaSaga',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGASAGA_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class MangaSaga extends BuddyComplex {

    baseUrl: string = MANGASAGA_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
