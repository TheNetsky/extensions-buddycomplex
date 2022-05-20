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

const BEEHENTAI_DOMAIN = 'https://beehentai.com'

export const BeeHentaiInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'BeeHentai',
    description: 'Extension that pulls manga from BeeHentai',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: BEEHENTAI_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class BeeHentai extends BuddyComplex {

    baseUrl: string = BEEHENTAI_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
