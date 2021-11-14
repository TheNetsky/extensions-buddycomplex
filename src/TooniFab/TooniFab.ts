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

const TOONIFAB_DOMAIN = 'https://toonifab.com'

export const TooniFabInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'TooniFab',
    description: 'Extension that pulls manga from TooniFab',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: TOONIFAB_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class TooniFab extends BuddyComplex {

    baseUrl: string = TOONIFAB_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
