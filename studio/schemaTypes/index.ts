import {homePage} from './homePage'
import {project} from './project'
import {siteSettings} from './siteSettings'

export const schemaTypes = [project, homePage, siteSettings]

/** Document types that exist exactly once. */
export const singletonTypes = new Set(['homePage', 'siteSettings'])
