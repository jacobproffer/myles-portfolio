import {defineArrayMember, defineField, defineType} from 'sanity'
import type {ReactNode} from 'react'

const stringList = (description?: string) => ({
  type: 'array' as const,
  of: [defineArrayMember({type: 'string'})],
  description,
})

const SerifItalic = (props: {children: ReactNode}) => (
  <em style={{fontFamily: 'Georgia, serif'}}>{props.children}</em>
)
const Accent = (props: {children: ReactNode}) => (
  <span style={{color: '#ff3b00'}}>{props.children}</span>
)

export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'intro', title: 'Intro'},
    {name: 'capabilities', title: 'Capabilities'},
    {name: 'index', title: 'Index'},
  ],
  fields: [
    // Hero
    defineField({
      name: 'heroBlurb',
      title: 'Hero blurb',
      type: 'text',
      rows: 2,
      group: 'hero',
      validation: (rule) => rule.max(120).warning('Keep it short — it sits in the top corner.'),
    }),
    defineField({
      name: 'marquee',
      title: 'Marquee words',
      group: 'hero',
      ...stringList('Every other word is set in the serif italic.'),
      validation: (rule) => rule.min(2),
    }),

    // Intro
    defineField({
      name: 'introStatement',
      title: 'Intro statement',
      type: 'array',
      group: 'intro',
      description:
        'The big paragraph. Use "Serif" and "Accent" to style words, and "Footnote" to add a ①② marker.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [
              {title: 'Serif', value: 'serif', component: SerifItalic},
              {title: 'Accent', value: 'accent', component: Accent},
            ],
            annotations: [],
          },
          of: [
            defineArrayMember({
              type: 'object',
              name: 'footnoteRef',
              title: 'Footnote',
              fields: [
                defineField({
                  name: 'number',
                  type: 'number',
                  description: 'Matches the footnote below (1 = ①).',
                  validation: (rule) => rule.required().integer().min(1).max(9),
                }),
              ],
              preview: {
                select: {number: 'number'},
                prepare: ({number}) => ({title: `Footnote ${number ?? '?'}`}),
              },
            }),
          ],
        }),
      ],
      validation: (rule) => rule.max(1).error('Keep the statement to one paragraph.'),
    }),
    defineField({
      name: 'footnotes',
      group: 'intro',
      ...stringList('Shown in order as ①, ②, ③…'),
      validation: (rule) => rule.max(9),
    }),

    // Capabilities
    defineField({
      name: 'capabilities',
      group: 'capabilities',
      ...stringList('The rotating 3D list. Enter each once; 5–8 items work best.'),
      validation: (rule) =>
        rule.min(3).max(8).unique().warning('The cylinder is tuned for 5–8 items.'),
    }),
    defineField({
      name: 'capabilitiesCaption',
      title: 'Capabilities caption',
      type: 'text',
      rows: 2,
      group: 'capabilities',
    }),

    // Index
    defineField({name: 'services', group: 'index', ...stringList()}),
    defineField({name: 'industries', group: 'index', ...stringList()}),
    defineField({
      name: 'recognition',
      group: 'index',
      ...stringList('e.g. (3) Awwwards SOTD'),
    }),
    defineField({name: 'interests', group: 'index', ...stringList()}),
    defineField({
      name: 'currently',
      group: 'index',
      ...stringList('e.g. Reading — Book Title'),
    }),
  ],
  preview: {prepare: () => ({title: 'Home page'})},
})
