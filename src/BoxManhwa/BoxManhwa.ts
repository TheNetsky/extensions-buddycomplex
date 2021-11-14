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

const BOXMANHWA_DOMAIN = 'https://boxmanhwa.com'

export const BoxManhwaInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'BoxManhwa',
    description: 'Extension that pulls manga from BoxManhwa',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: BOXMANHWA_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class BoxManhwa extends BuddyComplex {

    baseUrl: string = BOXMANHWA_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
