import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required().max(40).warning('Long titles may crowd the card.'),
    }),
    defineField({
      name: 'client',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      type: 'string',
      description: 'e.g. Art Direction, Brand Identity',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'year',
      type: 'number',
      validation: (rule) => rule.required().integer().min(2000).max(2100),
    }),
    defineField({
      name: 'cover',
      title: 'Cover image',
      type: 'image',
      description: 'Shown square in the grid. Set the hotspot to control the crop.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Describe the image for screen readers.',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'url',
      description: 'Optional. Where the card goes when clicked (live site, Behance, etc.).',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    orderRankField({type: 'project'}),
  ],
  preview: {
    select: {title: 'title', client: 'client', year: 'year', media: 'cover'},
    prepare: ({title, client, year, media}) => ({
      title,
      subtitle: [client, year].filter(Boolean).join(' — '),
      media,
    }),
  },
})
