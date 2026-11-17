import type {APIRoute} from "astro";

export const prerender = false;

// Leaving preview just means dropping the token from the URL.
export const GET: APIRoute = ({redirect}) => redirect("/", 307);
