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

const MANHWATUBE_DOMAIN = 'https://manhwatube.com'

export const ManhwaTubeInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'ManhwaTube',
    description: 'Extension that pulls manga from ManhwaTube',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANHWATUBE_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class ManhwaTube extends BuddyComplex {

    baseUrl: string = MANHWATUBE_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
