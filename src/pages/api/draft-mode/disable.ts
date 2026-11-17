import type {APIRoute} from "astro";
import {DRAFT_MODE_COOKIE, draftModeCookieOptions} from "../../../preview/draftMode";

export const prerender = false;

export const GET: APIRoute = ({cookies, redirect, url}) => {
  cookies.delete(DRAFT_MODE_COOKIE, draftModeCookieOptions(url));
  return redirect("/preview", 307);
};
