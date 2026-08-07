/**
 * Response shaping.
 *
 * The Dataverse Web API returns lookups as `_primarycontactid_value` and hangs annotations off them
 * with `@`-suffixed keys. XrmQuery has always rewritten those into the flat, typed shape that
 * XrmDefinitelyTyped generates (`primarycontactid_guid`, `primarycontactid_formatted`, …), and the
 * generated typings depend on that rewrite, so it is preserved exactly.
 *
 * See https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/query/overview
 */

export const FORMATTED_VALUE_ID = "OData.Community.Display.V1.FormattedValue";
export const LOOKUP_LOGICALNAME_ID = "Microsoft.Dynamics.CRM.lookuplogicalname";
export const LOOKUP_NAVIGATIONPROPERTY_ID = "Microsoft.Dynamics.CRM.associatednavigationproperty";
export const NEXT_LINK_ID = "@odata.nextLink";

const FORMATTED_VALUE_SUFFIX = "@" + FORMATTED_VALUE_ID;
const LOOKUP_LOGICALNAME_SUFFIX = "@" + LOOKUP_LOGICALNAME_ID;
const LOOKUP_NAVIGATIONPROPERTY_SUFFIX = "@" + LOOKUP_NAVIGATIONPROPERTY_ID;

const GUID_ENDING = "_guid";
const FORMATTED_ENDING = "_formatted";
const LOOKUP_LOGICALNAME_ENDING = "_lookuplogicalname";
const LOOKUP_NAVIGATIONPROPERTY_ENDING = "_navigationproperty";

const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

/**
 * JSON.parse reviver. Renames keys in place on the parent object and drops the original key by
 * returning `undefined`, so it must stay a `function` — it relies on `this`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function reviver(this: any, name: string, value: any): any {
  if (typeof value === "string" && datePattern.test(value)) return new Date(value);

  let newName = name;
  const formatted = newName.endsWith(FORMATTED_VALUE_SUFFIX);
  const lookupLogicalName = newName.endsWith(LOOKUP_LOGICALNAME_SUFFIX);
  const lookupNavProperty = newName.endsWith(LOOKUP_NAVIGATIONPROPERTY_SUFFIX);

  if (formatted) newName = newName.slice(0, -FORMATTED_VALUE_SUFFIX.length);
  else if (lookupLogicalName) newName = newName.slice(0, -LOOKUP_LOGICALNAME_SUFFIX.length);
  else if (lookupNavProperty) newName = newName.slice(0, -LOOKUP_NAVIGATIONPROPERTY_SUFFIX.length);

  if (newName.startsWith("_") && newName.endsWith("_value")) {
    newName = newName.substring(1, newName.length - "_value".length);
    if (formatted) newName += FORMATTED_ENDING;
    else if (lookupLogicalName) newName += LOOKUP_LOGICALNAME_ENDING;
    else if (lookupNavProperty) newName += LOOKUP_NAVIGATIONPROPERTY_ENDING;
    else newName += GUID_ENDING;
  } else if (formatted) {
    newName += FORMATTED_ENDING;
  }

  if (newName !== name) {
    this[newName] = value;
    return undefined;
  }
  return value;
}

/** Parses a Web API response body, applying the XrmQuery key rewrites. */
export function parseResponseBody<T>(text: string): T {
  return JSON.parse(text, reviver) as T;
}

/** A `retrieveMultiple`-shaped response page. */
export interface MultiResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any[];
  [NEXT_LINK_ID]?: string;
}

/** Strips the curly braces CRM sometimes wraps GUIDs in. */
export function stripGuid(guid: string): string {
  if (guid.startsWith("{") && guid.endsWith("}")) return guid.substring(1, guid.length - 1);
  return guid;
}
