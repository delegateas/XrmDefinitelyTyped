/**
 * `$batch` support.
 *
 * Several queries are packed into one `multipart/mixed` request. Read requests are emitted as
 * standalone parts; runs of change requests are wrapped in a changeset, which Dataverse executes as
 * a single transaction.
 *
 * See https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/execute-batch-operations-using-web-api
 */

import { getApiUrl, getFetch } from "../config.js";
import { makeError } from "../errors.js";
import { buildHeaders, resolveUrl, type RawResponse, type RequestHeader } from "../http.js";
import type { Query } from "./base.js";

const CRLF = "\r\n";

let batchCounter = 0;

function nextBoundary(kind: "batch" | "changeset"): string {
  batchCounter += 1;
  const unique = Math.random().toString(36).slice(2, 10);
  return `${kind}_${unique}_${batchCounter}`;
}

/** Result type of a batch: the result of each query, in the order the queries were given. */
export type BatchResults<T extends readonly Query<unknown>[]> = {
  [K in keyof T]: T[K] extends Query<infer R> ? R : never;
};

interface ParsedPart {
  status: number;
  headers: Headers;
  body: string;
}

/** Runs several queries in a single `$batch` request. */
export class BatchRequest<const T extends readonly Query<unknown>[]> {
  private additionalHeaders: RequestHeader[] = [];
  private abortSignal: AbortSignal | undefined;

  constructor(private queries: T) {}

  header(type: string, value: string): this {
    this.additionalHeaders.push({ type, value });
    return this;
  }

  /** Executes the whole batch on behalf of another user (`MSCRMCallerID`). */
  impersonate(userId: string): this {
    return this.header("MSCRMCallerID", userId);
  }

  signal(signal: AbortSignal): this {
    this.abortSignal = signal;
    return this;
  }

  /** @internal */
  buildBody(boundary: string): string {
    const lines: string[] = [];
    let changesetBoundary: string | null = null;
    let contentId = 0;

    const closeChangeset = (): void => {
      if (changesetBoundary === null) return;
      lines.push(`--${changesetBoundary}--`, "");
      changesetBoundary = null;
    };

    for (const query of this.queries) {
      const request = query.toRequest();
      const isRead = request.method === "GET";

      if (isRead) {
        closeChangeset();
        lines.push(`--${boundary}`);
      } else {
        if (changesetBoundary === null) {
          changesetBoundary = nextBoundary("changeset");
          lines.push(
            `--${boundary}`,
            `Content-Type: multipart/mixed;boundary=${changesetBoundary}`,
            "",
          );
        }
        lines.push(`--${changesetBoundary}`);
      }

      lines.push("Content-Type: application/http", "Content-Transfer-Encoding: binary");
      if (!isRead) {
        contentId += 1;
        lines.push(`Content-ID: ${contentId}`);
      }
      lines.push("");

      lines.push(`${request.method} ${resolveUrl(request.queryString)} HTTP/1.1`);
      lines.push("Accept: application/json");
      lines.push("Content-Type: application/json;type=entry");
      for (const header of request.headers) lines.push(`${header.type}: ${header.value}`);
      lines.push("");
      if (request.body !== undefined) lines.push(request.body, "");
    }

    closeChangeset();
    lines.push(`--${boundary}--`, "");

    return lines.join(CRLF);
  }

  /** Sends the batch and resolves with one result per query, in order. */
  async execute(): Promise<BatchResults<T>> {
    const boundary = nextBoundary("batch");
    const body = this.buildBody(boundary);
    const url = getApiUrl() + "$batch";

    const headers = buildHeaders([
      { type: "Content-Type", value: `multipart/mixed;boundary=${boundary}` },
      ...this.additionalHeaders,
    ]);

    const response = await getFetch()(url, {
      method: "POST",
      headers,
      body,
      signal: this.abortSignal,
    });
    const text = await response.text();
    if (!response.ok) throw makeError({ status: response.status, url, method: "POST", body: text });

    const parts = parseMultipart(text, response.headers.get("Content-Type"));
    if (parts.length !== this.queries.length) {
      throw new Error(
        `XrmQuery: $batch returned ${parts.length} responses for ${this.queries.length} requests.`,
      );
    }

    const results = [];
    for (let i = 0; i < this.queries.length; i++) {
      const part = parts[i];
      const query = this.queries[i];
      const queryUrl = resolveUrl(query.toRequest().queryString);

      if (part.status >= 400) {
        throw makeError({
          status: part.status,
          url: queryUrl,
          method: query.toRequest().method,
          body: part.body,
        });
      }

      const raw: RawResponse = { status: part.status, headers: part.headers, text: part.body };
      results.push(await query.handleRawResponse(raw));
    }

    return results as unknown as BatchResults<T>;
  }
}

function boundaryOf(contentType: string | null): string | null {
  if (!contentType) return null;
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
  if (!match) return null;
  return match[1] ?? match[2];
}

/**
 * Flattens a `$batch` response into one entry per original request. Changesets are recursed into, so
 * their sub-responses come out in the same order as the requests that produced them.
 */
function parseMultipart(text: string, contentType: string | null): ParsedPart[] {
  const boundary = boundaryOf(contentType);
  if (!boundary) throw new Error("XrmQuery: $batch response had no multipart boundary.");

  const parts: ParsedPart[] = [];
  for (const section of splitParts(text, boundary)) {
    const { headers, body } = splitHeadersAndBody(section);
    const nestedBoundary = boundaryOf(headers.get("Content-Type"));
    if (nestedBoundary) {
      parts.push(...parseMultipart(section, headers.get("Content-Type")));
    } else {
      parts.push(parseHttpPart(body));
    }
  }
  return parts;
}

function splitParts(text: string, boundary: string): string[] {
  return text
    .split(new RegExp(`--${escapeRegExp(boundary)}(?:--)?\r?\n?`))
    .slice(1, -1)
    .filter((part) => part.trim().length > 0);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitHeadersAndBody(section: string): { headers: Headers; body: string } {
  const separator = section.search(/\r?\n\r?\n/);
  if (separator < 0) return { headers: new Headers(), body: section };

  const headerText = section.slice(0, separator);
  const body = section.slice(separator).replace(/^\r?\n\r?\n/, "");
  return { headers: parseHeaders(headerText), body };
}

function parseHeaders(text: string): Headers {
  const headers = new Headers();
  for (const line of text.split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx > 0) headers.append(line.slice(0, idx).trim(), line.slice(idx + 1).trim());
  }
  return headers;
}

/** Parses the `application/http` payload of a part: a status line, headers, then the body. */
function parseHttpPart(text: string): ParsedPart {
  const trimmed = text.replace(/^\r?\n/, "");
  const statusMatch = trimmed.match(/^HTTP\/[\d.]+ (\d{3})/);
  const status = statusMatch ? parseInt(statusMatch[1], 10) : 0;

  const afterStatus = trimmed.slice(trimmed.indexOf("\n") + 1);
  const { headers, body } = splitHeadersAndBody(afterStatus);
  return { status, headers, body: body.trim() };
}
