import { getApiUrl, getCallerId, getConfiguredHeaders, getFetch } from "./config.js";
import { makeError } from "./errors.js";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestHeader {
  type: string;
  value: string;
}

export interface RawRequest {
  method: HttpMethod;
  /** Query string relative to the API url, e.g. `accounts(id)?$select=name`. */
  queryString: string;
  /** Already-serialized request body, if any. */
  body?: string;
  headers: RequestHeader[];
  signal?: AbortSignal;
}

export interface RawResponse {
  status: number;
  headers: Headers;
  text: string;
}

/** Spaces are the only character the legacy library escaped in the assembled url; keep that. */
function encodeSpaces(url: string): string {
  return url.replace(/ /g, "%20");
}

/** Turns a query string into the absolute url that will be requested. */
export function resolveUrl(queryString: string): string {
  return encodeSpaces(getApiUrl() + queryString);
}

export function baseHeaders(): Record<string, string> {
  return {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
    "OData-MaxVersion": "4.0",
    "OData-Version": "4.0",
  };
}

/** Merges default, configured and per-request headers. Later entries win. */
export function buildHeaders(extra: RequestHeader[]): Record<string, string> {
  const headers: Record<string, string> = { ...baseHeaders(), ...getConfiguredHeaders() };
  const callerId = getCallerId();
  if (callerId) headers["MSCRMCallerID"] = callerId;
  for (const { type, value } of extra) headers[type] = value;
  return headers;
}

/** Sends a request to an absolute url — used for `@odata.nextLink`, which is already absolute. */
export async function sendAbsolute(
  method: HttpMethod,
  url: string,
  body: string | undefined,
  extraHeaders: RequestHeader[],
  signal?: AbortSignal,
): Promise<RawResponse> {
  const response = await getFetch()(url, {
    method,
    headers: buildHeaders(extraHeaders),
    body,
    signal,
  });

  const text = await response.text();
  if (!response.ok) throw makeError({ status: response.status, url, method, body: text });
  return { status: response.status, headers: response.headers, text };
}

/** Sends a request to a query string relative to the configured Web API url. */
export function send(request: RawRequest): Promise<RawResponse> {
  return sendAbsolute(
    request.method,
    resolveUrl(request.queryString),
    request.body,
    request.headers,
    request.signal,
  );
}
