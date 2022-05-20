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

const MANGABUDDY_DOMAIN = 'https://manhuanow.com'

export const ManhuaNowInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'ManhuaNow',
    description: 'Extension that pulls manga from ManhuaNow',
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

export class ManhuaNow extends BuddyComplex {

    baseUrl: string = MANGABUDDY_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
