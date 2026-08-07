/**
 * Request-body shaping — the mirror image of `parse.ts`.
 *
 * XrmDefinitelyTyped generates lookup setters as `<attribute>_bind$<entityset>` and
 * `<attribute>_id$<entityset>`, because `@odata.bind` is not a legal TypeScript identifier. Those
 * are translated back into the OData annotations the Web API expects.
 */

import { getApiUrl } from "./config.js";

const BIND_ID = "_bind$";
const ID_ID = "_id$";

/** Transforms a record from XrmQuery format into the shape the Web API accepts. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformObject(obj: any): any {
  if (obj instanceof Date) return obj;
  if (typeof obj === "string" && obj.startsWith("{") && obj.endsWith("}")) {
    return obj.substring(1, obj.length - 1);
  }
  if (Array.isArray(obj)) return obj.map(transformObject);
  if (obj instanceof Object) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newObj: any = {};
    for (const key of Object.keys(obj)) parseAttribute(key, transformObject(obj[key]), newObj);
    return newObj;
  }
  return obj;
}

/** Translates a single `_bind$` / `_id$` attribute onto `newObj`; copies anything else verbatim. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseAttribute(key: string, val: any, newObj: any): void {
  const bindIdx = key.indexOf(BIND_ID);
  if (bindIdx >= 0) {
    const setName = key.substring(bindIdx + BIND_ID.length);
    newObj[`${key.substring(0, bindIdx)}@odata.bind`] = `/${setName}(${val})`;
    return;
  }

  const idIdx = key.indexOf(ID_ID);
  if (idIdx >= 0) {
    const setName = key.substring(idIdx + ID_ID.length);
    newObj[`${key.substring(0, idIdx)}@odata.id`] = `${getApiUrl()}${setName}(${val})`;
    return;
  }

  newObj[key] = val;
}

/** Serializes a record for sending. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeRecord(record: any): string {
  return JSON.stringify(transformObject(record));
}
