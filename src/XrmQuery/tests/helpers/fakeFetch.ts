import { afterEach, beforeEach } from "vitest";
import { configure, resetConfig } from "../../src/config.js";

export interface RecordedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | undefined;
}

export interface FakeResponse {
  status?: number;
  headers?: Record<string, string>;
  body?: string;
}

type Responder = (request: RecordedRequest, index: number) => FakeResponse;

export interface FakeFetch {
  /** Every request made so far, in order. */
  requests: RecordedRequest[];
  /** Queues the response for the next request; call once per expected request. */
  respondWith(response: FakeResponse): void;
  /** Queues a JSON body with status 200. */
  respondJson(body: unknown, headers?: Record<string, string>): void;
}

function headersToObject(init: HeadersInit | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!init) return result;
  new Headers(init).forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Installs a stubbed `fetch` and an empty base url for the duration of each test, so query strings
 * show up verbatim as request urls — the same setup the upstream sinon fake-server tests used.
 */
export function useFakeFetch(): FakeFetch {
  const state: FakeFetch & { queue: FakeResponse[] } = {
    requests: [],
    queue: [],
    respondWith(response) {
      state.queue.push(response);
    },
    respondJson(body, headers) {
      state.queue.push({ status: 200, headers, body: JSON.stringify(body) });
    },
  };

  const responder: Responder = (request) => {
    const response = state.queue.shift();
    if (response === undefined) {
      throw new Error(`Unexpected request: ${request.method} ${request.url}`);
    }
    return response;
  };

  const impl: typeof globalThis.fetch = async (input, init) => {
    const signal = init?.signal;
    if (signal?.aborted) throw signal.reason ?? new Error("aborted");

    const request: RecordedRequest = {
      url: String(input),
      method: init?.method ?? "GET",
      headers: headersToObject(init?.headers),
      body: typeof init?.body === "string" ? init.body : undefined,
    };
    state.requests.push(request);

    const { status = 200, headers = {}, body = "" } = responder(request, state.requests.length - 1);
    return new Response(status === 204 || body === "" ? null : body, { status, headers });
  };

  beforeEach(() => {
    state.requests.length = 0;
    state.queue.length = 0;
    configure({ baseUrl: "", fetch: impl });
  });

  afterEach(() => {
    resetConfig();
  });

  return state;
}

/** The single request that should have been made. Fails loudly if there was not exactly one. */
export function onlyRequest(fake: FakeFetch): RecordedRequest {
  if (fake.requests.length !== 1) {
    throw new Error(`Expected exactly 1 request, got ${fake.requests.length}`);
  }
  return fake.requests[0];
}
