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

const TOONILYME_DOMAIN = 'https://toonily.me'

export const ToonilyMeInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'ToonilyMe',
    description: 'Extension that pulls manga from ToonilyMe',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: TOONILYME_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class ToonilyMe extends BuddyComplex {

    baseUrl: string = TOONILYME_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
