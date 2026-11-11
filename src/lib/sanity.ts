import {createClient} from "@sanity/client";
import {createImageUrlBuilder, type SanityImageSource} from "@sanity/image-url";

/*
  Content is fetched at build time from a public dataset, so no token is needed.
  Publishing in Sanity requires a rebuild (deploy hook) to show up on the site.
*/
export const client = createClient({
  projectId: "eoxa1e6t",
  dataset: "production",
  apiVersion: "2025-02-19",
  useCdn: false,
});

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

// Results are cached for the duration of a build, so every component can call these freely.
// In dev, fetch fresh each time so edits in the Studio show up on reload.
const cache = new Map<string, Promise<unknown>>();
const fetchOnce = <T>(query: string): Promise<T> => {
  if (import.meta.env.DEV) return client.fetch<T>(query);
  if (!cache.has(query)) cache.set(query, client.fetch<T>(query));
  return cache.get(query) as Promise<T>;
};

export const getProjects = () =>
  fetchOnce<Project[]>(`*[_type == "project"] | order(orderRank) {
    _id, title, client, role, year, cover, link
  }`);

export const getSiteSettings = () =>
  fetchOnce<SiteSettings | null>(`*[_id == "siteSettings"][0]`).then((s) => s ?? {});

export const getHomePage = () =>
  fetchOnce<HomePage | null>(`*[_id == "homePage"][0]`).then((h) => h ?? {});

/** ① ② ③ … for footnote numbers 1–9. */
export const circled = (n: number) => String.fromCharCode(0x2460 + n - 1);
