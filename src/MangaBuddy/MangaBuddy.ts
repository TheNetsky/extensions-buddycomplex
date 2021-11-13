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

}
