import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {defineDocuments, defineLocations, presentationTool} from 'sanity/presentation'
import {schemaTypes, singletonTypes} from './schemaTypes'
import {structure} from './structure'

/*
  The site's /preview page shows drafts (see the root README → "Content preview").
  Set SANITY_STUDIO_SITE_URL in studio/.env.production before `sanity deploy`; defaults to the local dev server.
*/
const siteUrl = (process.env.SANITY_STUDIO_SITE_URL || 'http://localhost:4321').replace(/\/+$/, '')

// Everything currently renders on the one-page site.
const homeLocation = {title: 'Home page', href: '/preview'}

export default defineConfig({
  name: 'default',
  title: 'Myles Portfolio',

  projectId: 'eoxa1e6t',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    presentationTool({
      title: 'Preview',
      previewUrl: {
        initial: `${siteUrl}/preview`,
        previewMode: {enable: '/api/draft-mode/enable', disable: '/api/draft-mode/disable'},
      },
      resolve: {
        // Which document to open when a page is shown in the preview
        mainDocuments: defineDocuments([{route: '/preview', filter: `_id == "homePage"`}]),
        // "Used on" links shown at the top of each document
        locations: {
          homePage: defineLocations({locations: [homeLocation]}),
          siteSettings: defineLocations({locations: [homeLocation]}),
          project: defineLocations({
            select: {title: 'title'},
            resolve: (doc) => ({locations: [{title: doc?.title || 'Untitled', href: '/preview#work'}, homeLocation]}),
          }),
        },
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // Hide singletons from the "New document" menu
    templates: (templates) => templates.filter(({schemaType}) => !singletonTypes.has(schemaType)),
  },

  document: {
    // Singletons can't be duplicated or deleted
    actions: (actions, {schemaType}) =>
      singletonTypes.has(schemaType)
        ? actions.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : actions,
  },
})
