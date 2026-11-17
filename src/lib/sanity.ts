import {createClient, type SanityClient} from "@sanity/client";
import {createImageUrlBuilder, type SanityImageSource} from "@sanity/image-url";
import {SANITY_API_READ_TOKEN, SANITY_STUDIO_URL} from "astro:env/server";

/*
  Production: content is fetched at build time from the public dataset, so no token is needed.
  Publishing in Sanity requires a rebuild (deploy hook) to show up on the site.

  Preview (draft mode): the preview site renders on request, reads unpublished drafts with a
  Viewer token, and stega-encodes strings so the Studio's Presentation tool can map text on the
  page back to its field. Draft mode is switched on per browser by /api/draft-mode/enable.
*/
export const client = createClient({
  projectId: "eoxa1e6t",
  dataset: "production",
  apiVersion: "2025-02-19",
  useCdn: false,
});

// Fields that are never displayed as visible text, so they must not carry invisible stega characters.
const NO_STEGA = new Set(["seoDescription", "alt", "marks"]);

let draftClient: SanityClient | undefined;
const getDraftClient = () =>
  (draftClient ??= client.withConfig({
    token: SANITY_API_READ_TOKEN,
    perspective: "drafts",
    stega: {
      enabled: true,
      studioUrl: SANITY_STUDIO_URL,
      filter: (props) => !props.sourcePath.some((p) => NO_STEGA.has(String(p))) && props.filterDefault(props),
    },
  }));

const builder = createImageUrlBuilder(client);
export const urlFor = (source: SanityImageSource) => builder.image(source).auto("format");

/* ---------------------------------------------------------------- Types */

export interface SanityImage {
  asset: {_ref: string};
  hotspot?: {x: number; y: number};
  alt?: string;
}

export interface Project {
  _id: string;
  title: string;
  client: string;
  role: string;
  year: number;
  cover?: SanityImage;
  link?: string;
}

export interface Social {
  label: string;
  url: string;
}

export interface SiteSettings {
  role?: string;
  company?: string;
  location?: string;
  available?: boolean;
  availabilityText?: string;
  email?: string;
  socials?: Social[];
  seoDescription?: string;
  shareImage?: SanityImage;
}

/** A Portable Text block from the intro statement field. */
export interface IntroBlock {
  _type: "block";
  children: Array<
    | {_type: "span"; _key: string; text: string; marks?: string[]}
    | {_type: "footnoteRef"; _key: string; number?: number}
  >;
}

export interface HomePage {
  heroBlurb?: string;
  marquee?: string[];
  introStatement?: IntroBlock[];
  footnotes?: string[];
  capabilities?: string[];
  capabilitiesCaption?: string;
  services?: string[];
  industries?: string[];
  recognition?: string[];
  interests?: string[];
  currently?: string[];
}

/* -------------------------------------------------------------- Queries */

// Every component calls these freely, so results are cached per request (or per page at build time).
// Pass `Astro.locals` so draft mode is picked up when the middleware turned it on.
const caches = new WeakMap<App.Locals, Map<string, Promise<unknown>>>();
const fetchOnce = <T>(locals: App.Locals, query: string): Promise<T> => {
  let cache = caches.get(locals);
  if (!cache) caches.set(locals, (cache = new Map()));
  if (!cache.has(query)) cache.set(query, (locals.draftMode ? getDraftClient() : client).fetch<T>(query));
  return cache.get(query) as Promise<T>;
};

export const getProjects = (locals: App.Locals) =>
  fetchOnce<Project[]>(locals, `*[_type == "project"] | order(orderRank) {
    _id, title, client, role, year, cover, link
  }`);

export const getSiteSettings = (locals: App.Locals) =>
  fetchOnce<SiteSettings | null>(locals, `*[_id == "siteSettings"][0]`).then((s) => s ?? {});

export const getHomePage = (locals: App.Locals) =>
  fetchOnce<HomePage | null>(locals, `*[_id == "homePage"][0]`).then((h) => h ?? {});

/** ① ② ③ … for footnote numbers 1–9. */
export const circled = (n: number) => String.fromCharCode(0x2460 + n - 1);
