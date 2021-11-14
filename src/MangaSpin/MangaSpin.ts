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

const MANGASPIN_DOMAIN = 'https://mangaspin.com'

export const MangaSpinInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaSpin',
    description: 'Extension that pulls manga from MangaSpin',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGASPIN_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class MangaSpin extends BuddyComplex {

    baseUrl: string = MANGASPIN_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
