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

const MANHUASITE_DOMAIN = 'https://manhuasite.com'

export const ManhuaSiteInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'ManhuaSite',
    description: 'Extension that pulls manga from ManhuaSite',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANHUASITE_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class ManhuaSite extends BuddyComplex {

    baseUrl: string = MANHUASITE_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
