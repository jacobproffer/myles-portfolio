import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    {name: 'about', title: 'About', default: true},
    {name: 'contact', title: 'Contact'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'role',
      type: 'string',
      group: 'about',
      description: 'e.g. Art Director',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'company',
      type: 'string',
      group: 'about',
      description: 'e.g. Elegant Seagulls',
    }),
    defineField({
      name: 'location',
      type: 'string',
      group: 'about',
      description: 'e.g. Marquette, MI',
    }),
    defineField({
      name: 'available',
      title: 'Available for work',
      type: 'boolean',
      group: 'about',
      initialValue: true,
    }),
    defineField({
      name: 'availabilityText',
      title: 'Availability text',
      type: 'string',
      group: 'about',
      initialValue: 'Available for select projects',
      hidden: ({document}) => !document?.available,
    }),
    defineField({
      name: 'email',
      type: 'string',
      group: 'contact',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'socials',
      type: 'array',
      group: 'contact',
      description: 'Used in the footer and the Index section.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'social',
          fields: [
            defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {select: {title: 'label', subtitle: 'url'}},
        }),
      ],
    }),
    defineField({
      name: 'seoDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      group: 'seo',
      validation: (rule) => rule.max(160).warning('Search engines truncate after ~160 characters.'),
    }),
    defineField({
      name: 'shareImage',
      title: 'Social share image',
      type: 'image',
      group: 'seo',
      description: 'Shown when the site is shared on social media. 1200×630 works best.',
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})
