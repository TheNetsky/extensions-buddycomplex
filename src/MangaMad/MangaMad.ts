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

const MANGAMAD_DOMAIN = 'https://mangamad.com'

export const MangaMadInfo: SourceInfo = {
    version: getExportVersion('0.0.0'),
    name: 'MangaMad',
    description: 'Extension that pulls manga from MangaMad',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: 'icon.png',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: MANGAMAD_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
    ]
}

export class MangaMad extends BuddyComplex {

    baseUrl: string = MANGAMAD_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH

}
