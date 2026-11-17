import type {APIRoute} from "astro";
import {validatePreviewUrl} from "@sanity/preview-url-secret";
import {SANITY_API_READ_TOKEN} from "astro:env/server";
import {client} from "@lib/sanity";
import {DRAFT_MODE_COOKIE, draftModeCookieOptions, draftModeCookieValue} from "../../../preview/draftMode";

export const prerender = false;

/*
  Called by the Studio's Presentation tool with a one-time secret it stores in the dataset.
  If the secret checks out, this browser gets the draft-mode cookie and is sent to /preview.
*/
export const GET: APIRoute = async ({request, cookies, redirect, url}) => {
  if (!SANITY_API_READ_TOKEN) return new Response("Preview is not configured", {status: 500});

  const {isValid, redirectTo = "/preview"} = await validatePreviewUrl(
    client.withConfig({token: SANITY_API_READ_TOKEN}),
    request.url,
  ).catch((error) => {
    console.error("Draft mode: could not validate the preview secret", error);
    return {isValid: false, redirectTo: undefined};
  });
  if (!isValid) return new Response("Invalid secret", {status: 401});

  cookies.set(DRAFT_MODE_COOKIE, await draftModeCookieValue(), draftModeCookieOptions(url));
  return redirect(redirectTo, 307);
};
