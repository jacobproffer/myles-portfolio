import {defineMiddleware} from "astro:middleware";
import {PREVIEW_TOKEN_PARAM, isValidPreviewToken} from "./preview/draftMode";

// Turns on draft mode for /preview when the URL carries a valid preview token from the Studio.
// Static pages are built ahead of time and never see the URL's query, so they always get published content.
export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();

  context.locals.draftMode = await isValidPreviewToken(context.url.searchParams.get(PREVIEW_TOKEN_PARAM));

  const response = await next();
  if (context.locals.draftMode) {
    // Drafts must never be cached by Netlify's CDN or the browser.
    response.headers.set("Cache-Control", "private, no-store");
    // Don't leak the token to other sites through links on the page.
    response.headers.set("Referrer-Policy", "same-origin");
  }
  return response;
});
