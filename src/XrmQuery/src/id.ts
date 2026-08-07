import { stripGuid } from "./parse.js";

/**
 * How a record is addressed: either its GUID, or an alternate key — one or more attribute/value
 * pairs that together identify the record, e.g. `{ accountnumber: "ABC" }` → `accounts(accountnumber='ABC')`.
 *
 * See https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/retrieve-entity-using-web-api#retrieve-using-an-alternate-key
 */
export type RecordId = string | AlternateKey;

export type AlternateKey = Record<string, string | number | boolean | Date>;

function keyValue(value: string | number | boolean | Date): string {
  if (value instanceof Date) return `'${value.toISOString()}'`;
  if (typeof value === "string") return `'${encodeURIComponent(value.replace(/'/g, "''"))}'`;
  return String(value);
}

/** Renders a record identifier for use inside the parentheses of an entity-set url. */
export function idToString(id: RecordId): string {
  if (typeof id === "string") return stripGuid(id);
  return Object.keys(id)
    .map((key) => `${key}=${keyValue(id[key])}`)
    .join(",");
}
