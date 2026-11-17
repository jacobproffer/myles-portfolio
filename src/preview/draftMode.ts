import {SANITY_API_READ_TOKEN} from "astro:env/server";

export const DRAFT_MODE_COOKIE = "sanity-draft-mode";

/*
  The cookie holds a hash derived from the server-only read token, so it can't be forged by
  setting the cookie by hand. Rotating the token signs everyone out of draft mode.
*/
export async function draftModeCookieValue(): Promise<string> {
  if (!SANITY_API_READ_TOKEN) throw new Error("SANITY_API_READ_TOKEN is not set");
  const data = new TextEncoder().encode(`draft-mode:${SANITY_API_READ_TOKEN}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const draftModeCookieOptions = (url: URL) => ({
  path: "/",
  httpOnly: true,
  // The preview is shown inside the Studio's iframe on another site, so the cookie must be cross-site.
  sameSite: "none" as const,
  secure: url.protocol === "https:" || url.hostname === "localhost",
  partitioned: true,
});
