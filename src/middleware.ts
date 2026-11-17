import {defineMiddleware} from "astro:middleware";
import {DRAFT_MODE_COOKIE, draftModeCookieValue} from "./preview/draftMode";

// Turns on draft mode for /preview when the Studio has signed this browser in.
// Static pages are built ahead of time and never see cookies, so they always get published content.
export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();

  const cookie = context.cookies.get(DRAFT_MODE_COOKIE)?.value;
  context.locals.draftMode = !!cookie && cookie === (await draftModeCookieValue());

  const response = await next();
  // Drafts must never be cached by Netlify's CDN or the browser.
  if (context.locals.draftMode) response.headers.set("Cache-Control", "private, no-store");
  return response;
});
