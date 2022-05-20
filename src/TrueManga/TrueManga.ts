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

const TRUEMANGA_DOMAIN = 'https://truemanga.com'

export const TrueMangaInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'TrueManga',
    description: 'Extension that pulls manga from TrueManga',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: TRUEMANGA_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class TrueManga extends BuddyComplex {

    baseUrl: string = TRUEMANGA_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
