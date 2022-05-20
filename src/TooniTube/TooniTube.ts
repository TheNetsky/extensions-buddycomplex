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

const TOONITUBE_DOMAIN = 'https://toonitube.com'

export const TooniTubeInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'TooniTube',
    description: 'Extension that pulls manga from TooniTube',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: TOONITUBE_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class TooniTube extends BuddyComplex {

    baseUrl: string = TOONITUBE_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
