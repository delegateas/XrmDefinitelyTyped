/**
 * Actions and functions.
 *
 * XrmDefinitelyTyped does not generate metadata for these, so the parameters and results are
 * untyped — pass a result type explicitly when you know it.
 *
 * See https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/use-web-api-actions
 * and https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/use-web-api-functions
 */

import { serializeRecord } from "../body.js";
import { idToString, type RecordId } from "../id.js";
import type { RawResponse } from "../http.js";
import { parseResponseBody } from "../parse.js";
import { Query } from "./base.js";

const CRM_NAMESPACE = "Microsoft.Dynamics.CRM.";

/** Identifies the record an action or function is bound to. */
export interface BoundTo {
  /** Logical name of the entity set, e.g. `accounts`. */
  entitySet: string;
  id: RecordId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Parameters = Record<string, any>;

function boundPrefix(boundTo: BoundTo | undefined, name: string): string {
  if (!boundTo) return name;
  return `${boundTo.entitySet}(${idToString(boundTo.id)})/${CRM_NAMESPACE}${name}`;
}

/** Formats a function parameter as an inline OData literal. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function functionParam(value: any): string {
  if (value === undefined || value === null) return "null";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return `'${encodeURIComponent(value.replace(/'/g, "''"))}'`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return encodeURIComponent(JSON.stringify(value));
}

/** A `POST` to an action, bound or unbound. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ActionRequest<Result = any> extends Query<Result | undefined> {
  constructor(
    private name: string,
    private params?: Parameters,
    private boundTo?: BoundTo,
  ) {
    super("POST");
  }

  /** @internal */
  protected handleResponse(response: RawResponse): Result | undefined {
    return response.text ? parseResponseBody<Result>(response.text) : undefined;
  }

  /** @internal */
  protected getObjectToSend(): string | undefined {
    return this.params ? serializeRecord(this.params) : undefined;
  }

  getQueryString(): string {
    return boundPrefix(this.boundTo, this.name);
  }
}

/** A `GET` of a function, bound or unbound. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class FunctionRequest<Result = any> extends Query<Result> {
  constructor(
    private name: string,
    private params?: Parameters,
    private boundTo?: BoundTo,
  ) {
    super("GET");
  }

  /** @internal */
  protected handleResponse(response: RawResponse): Result {
    return parseResponseBody<Result>(response.text);
  }

  getQueryString(): string {
    const args = this.params
      ? Object.keys(this.params)
          .map((key) => `${key}=${functionParam(this.params![key])}`)
          .join(",")
      : "";
    return `${boundPrefix(this.boundTo, this.name)}(${args})`;
  }
}
