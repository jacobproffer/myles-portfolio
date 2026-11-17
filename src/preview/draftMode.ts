import {SANITY_API_READ_TOKEN} from "astro:env/server";

/*
  Draft mode is carried in the URL (?preview-token=…) rather than a cookie, so it works in every
  browser regardless of third-party cookie settings inside the Studio's iframe.

  The token is "<expiry>.<signature>", signed with a key derived from the server-only read token,
  so it can't be forged or extended by hand. Rotating the read token invalidates every link.
*/
export const PREVIEW_TOKEN_PARAM = "preview-token";
const TTL_SECONDS = 8 * 60 * 60;

const encoder = new TextEncoder();
let key: Promise<CryptoKey> | undefined;
const signingKey = () =>
  (key ??= crypto.subtle.importKey(
    "raw",
    encoder.encode(`draft-mode:${SANITY_API_READ_TOKEN}`),
    {name: "HMAC", hash: "SHA-256"},
    false,
    ["sign", "verify"],
  ));

const toBase64Url = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromBase64Url = (value: string) =>
  Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

/** A new token, valid for TTL_SECONDS. */
export async function createPreviewToken(): Promise<string> {
  const expires = String(Math.floor(Date.now() / 1000) + TTL_SECONDS);
  const signature = await crypto.subtle.sign("HMAC", await signingKey(), encoder.encode(expires));
  return `${expires}.${toBase64Url(signature)}`;
}

/** True if the token was signed by this site and hasn't expired. */
export async function isValidPreviewToken(token: string | null): Promise<boolean> {
  if (!token || !SANITY_API_READ_TOKEN) return false;
  const [expires, signature] = token.split(".");
  if (!/^\d+$/.test(expires ?? "") || !signature || Number(expires) < Date.now() / 1000) return false;
  try {
    return await crypto.subtle.verify("HMAC", await signingKey(), fromBase64Url(signature), encoder.encode(expires));
  } catch {
    return false; // malformed signature
  }
}
