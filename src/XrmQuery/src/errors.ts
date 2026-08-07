/** Error thrown for any non-2xx Web API response. */
export class XrmQueryError extends Error {
  /** HTTP status code. */
  readonly status: number;
  /** Dataverse error code, e.g. `0x80040217`, when the response carried one. */
  readonly errorCode: string | undefined;
  /** Absolute URL of the failed request. */
  readonly url: string;
  /** HTTP method of the failed request. */
  readonly method: string;
  /** Raw response body. */
  readonly body: string;
  /** Parsed `error` object from the response, when the body was JSON. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly odataError: any;

  constructor(init: {
    status: number;
    url: string;
    method: string;
    body: string;
    message?: string;
    errorCode?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    odataError?: any;
  }) {
    super(init.message ?? `XrmQuery: ${init.method} ${init.url} failed with status ${init.status}`);
    this.name = "XrmQueryError";
    this.status = init.status;
    this.url = init.url;
    this.method = init.method;
    this.body = init.body;
    this.errorCode = init.errorCode;
    this.odataError = init.odataError;
  }
}

/** Builds an {@link XrmQueryError} from a response body, pulling out the OData error details. */
export function makeError(init: {
  status: number;
  url: string;
  method: string;
  body: string;
}): XrmQueryError {
  let message: string | undefined;
  let errorCode: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let odataError: any;

  try {
    const parsed = JSON.parse(init.body);
    odataError = parsed?.error ?? parsed;
    if (typeof odataError?.message === "string") message = odataError.message;
    if (typeof odataError?.code === "string") errorCode = odataError.code;
  } catch {
    // Body was not JSON — keep it as-is on `body`.
  }

  return new XrmQueryError({ ...init, message, errorCode, odataError });
}
