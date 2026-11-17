import type {APIRoute} from "astro";
import {validatePreviewUrl} from "@sanity/preview-url-secret";
import {SANITY_API_READ_TOKEN} from "astro:env/server";
import {client} from "@lib/sanity";
import {PREVIEW_TOKEN_PARAM, createPreviewToken} from "../../../preview/draftMode";

export const prerender = false;

/*
  Called by the Studio's Presentation tool with a one-time secret it stores in the dataset.
  If the secret checks out, the browser is sent to /preview with a signed, expiring preview token.
*/
export const GET: APIRoute = async ({request, redirect, url}) => {
  if (!SANITY_API_READ_TOKEN) {
    console.error("Draft mode: SANITY_API_READ_TOKEN is not set");
    return new Response("Preview is not configured: SANITY_API_READ_TOKEN is missing.", {status: 500});
  }

  let result;
  try {
    result = await validatePreviewUrl(client.withConfig({token: SANITY_API_READ_TOKEN}), request.url);
  } catch (error) {
    console.error("Draft mode: Sanity rejected the request (check SANITY_API_READ_TOKEN)", error);
    return new Response("Preview error: Sanity rejected the read token. Check SANITY_API_READ_TOKEN.", {status: 500});
  }
  if (!result.isValid) {
    console.warn("Draft mode: preview secret not found or expired");
    return new Response("Preview link expired. Reload the Preview tab in the Studio.", {status: 401});
  }

  const destination = new URL(result.redirectTo ?? "/preview", url);
  destination.searchParams.set(PREVIEW_TOKEN_PARAM, await createPreviewToken());
  return redirect(destination.pathname + destination.search + destination.hash, 307);
};
