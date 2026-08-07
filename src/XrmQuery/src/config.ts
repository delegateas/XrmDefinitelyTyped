/** Global configuration: where the Web API lives, and how requests are sent. */

export const DEFAULT_API_VERSION = "9.2";

export interface XrmQueryConfig {
  /**
   * Full URL of the Web API endpoint, including the trailing slash — e.g.
   * `https://org.crm4.dynamics.com/api/data/v9.2/`. Defaults to the client URL reported by the `Xrm`
   * global when running inside a model-driven app, and to the relative `/api/data/v9.2/` otherwise.
   */
  baseUrl?: string | null;
  /** Web API version to use when `baseUrl` is not set explicitly. Defaults to `9.2`. */
  apiVersion?: string;
  /** `fetch` implementation to use. Defaults to `globalThis.fetch`. */
  fetch?: typeof globalThis.fetch;
  /** Headers added to every request. */
  headers?: Record<string, string>;
  /** GUID of the user to impersonate on every request (`MSCRMCallerID`). */
  callerId?: string;
}

interface ConfigState {
  apiUrl: string | null;
  apiVersion: string;
  fetch: typeof globalThis.fetch | null;
  headers: Record<string, string>;
  callerId: string | null;
}

const state: ConfigState = {
  apiUrl: null,
  apiVersion: DEFAULT_API_VERSION,
  fetch: null,
  headers: {},
  callerId: null,
};

/** Applies configuration. Only the properties present are changed. */
export function configure(config: XrmQueryConfig): void {
  if ("baseUrl" in config) state.apiUrl = config.baseUrl ?? null;
  if (config.apiVersion !== undefined) {
    state.apiVersion = config.apiVersion;
    if (!("baseUrl" in config)) state.apiUrl = null;
  }
  if (config.fetch !== undefined) state.fetch = config.fetch;
  if (config.headers !== undefined) state.headers = { ...config.headers };
  if ("callerId" in config) state.callerId = config.callerId ?? null;
}

/** Restores every setting to its default. Mainly useful between tests. */
export function resetConfig(): void {
  state.apiUrl = null;
  state.apiVersion = DEFAULT_API_VERSION;
  state.fetch = null;
  state.headers = {};
  state.callerId = null;
}

/**
 * Makes XrmQuery use the given custom url to access the Web API.
 * @param url The url targeting the API, for example `/api/data/v9.2/`. `null` restores the default.
 */
export function setApiUrl(url: string | null): void {
  state.apiUrl = url;
}

/**
 * Makes XrmQuery use the given version to access the Web API.
 * @param version Version to use, for example `9.1`.
 */
export function setApiVersion(version: string): void {
  state.apiVersion = version;
  state.apiUrl = null;
}

/** The Web API endpoint in use, with a trailing slash. */
export function getApiUrl(): string {
  if (state.apiUrl === null) return `${getClientUrl()}/api/data/v${state.apiVersion}/`;
  return state.apiUrl;
}

export function getConfiguredHeaders(): Record<string, string> {
  return state.headers;
}

export function getCallerId(): string | null {
  return state.callerId;
}

export function getFetch(): typeof globalThis.fetch {
  const impl = state.fetch ?? globalThis.fetch;
  if (typeof impl !== "function") {
    throw new Error(
      "XrmQuery: no fetch implementation available. Pass one with configure({ fetch }).",
    );
  }
  return impl;
}

/**
 * Best-effort discovery of the organization URL from the `Xrm` global. Returns an empty string when
 * there is no `Xrm` around, which leaves the API url relative — correct for anything served from the
 * same origin as Dataverse, and overridable with `configure({ baseUrl })` for everything else.
 */
function getClientUrl(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  const candidates = [
    () => g.Xrm.Utility.getGlobalContext().getClientUrl(),
    () => g.window.parent.window.Xrm.Utility.getGlobalContext().getClientUrl(),
    () => g.GetGlobalContext().getClientUrl(),
    () => g.Xrm.Page.context.getClientUrl(),
  ];
  for (const candidate of candidates) {
    try {
      const url = candidate();
      if (typeof url === "string") return url;
    } catch {
      // try the next one
    }
  }
  return "";
}
