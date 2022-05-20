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

const MANGACUTE_DOMAIN = 'https://mangacute.com'

export const MangaCuteInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaCute',
    description: 'Extension that pulls manga from MangaCute',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGACUTE_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class MangaCute extends BuddyComplex {

    baseUrl: string = MANGACUTE_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
