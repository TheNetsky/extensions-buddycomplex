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

const TOONICLUB_DOMAIN = 'https://tooniclub.com'

export const TooniClubInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'TooniClub',
    description: 'Extension that pulls manga from TooniClub',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: TOONICLUB_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class TooniClub extends BuddyComplex {

    baseUrl: string = TOONICLUB_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
