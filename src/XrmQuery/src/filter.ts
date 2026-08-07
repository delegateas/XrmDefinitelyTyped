/**
 * Filter expression builders. Everything here returns an opaque `WebFilter` that stringifies to an
 * OData `$filter` fragment.
 *
 * Includes what the legacy library shipped as a separate "9+" extension file (`$in`, `under`,
 * `equalUserId`, …) — those query functions are supported on every version this package targets.
 */

import { stripGuid } from "./parse.js";
import { tag } from "./proxy.js";

/** Anything a filter can compare against: a captured attribute, or a literal. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Comparable = any;

function asFilter(expression: string): WebFilter {
  return expression as unknown as WebFilter;
}

/**
 * URL-escapes a filter value. `'` is doubled (OData's own escaping) and the characters that would
 * otherwise be read as query-string syntax are percent-encoded.
 */
function encodeSpecialCharacters(value: string): string {
  return encodeURI(value)
    .replace(/'/g, "''")
    .replace(/\+/g, "%2B")
    .replace(/\//g, "%2F")
    .replace(/\?/g, "%3F")
    .replace(/#/g, "%23")
    .replace(/&/g, "%26");
}

function getVal(value: Comparable): string {
  if (value === undefined || value === null) return "null";
  if (typeof value === "string") return `'${encodeSpecialCharacters(value)}'`;
  if (value instanceof Date) return encodeSpecialCharacters(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(getVal).join(",")}]`;
  return encodeSpecialCharacters(String(value));
}

function comp<T>(val1: T, op: string, val2: T): WebFilter {
  return asFilter(`${getVal(val1)} ${op} ${getVal(val2)}`);
}

function dataFunc<T>(funcName: string, val1: T, val2: T): WebFilter {
  return asFilter(`${funcName}(${getVal(val1)}, ${getVal(val2)})`);
}

function biFilter(f1: WebFilter, conj: string, f2: WebFilter): WebFilter {
  return asFilter(`(${f1} ${conj} ${f2})`);
}

function nestedFilter(filters: WebFilter[], conj: string): WebFilter {
  const rest = [...filters];
  const last = rest.pop();
  if (last === undefined) return asFilter("");
  return rest.reduceRight((acc, current) => biFilter(current, conj, acc), last);
}

/**
 * `PropertyName` for the CRM query functions wants the plain lookup name, but the captured attribute
 * has already been rewritten to `_xxx_value`. Undo that here.
 */
function parsePropertyName(name: string): string {
  const match = name.match(/^_(.+)_value$/);
  return match ? match[1] : name;
}

function queryFunc<T>(funcName: string, val1: T): WebFilter;
function queryFunc<T, V>(funcName: string, val1: T, val2: V): WebFilter;
function queryFunc<T, V>(funcName: string, val1: T, val2?: V): WebFilter {
  const property = `PropertyName='${parsePropertyName(String(val1))}'`;
  if (val2 === undefined) return asFilter(`Microsoft.Dynamics.CRM.${funcName}(${property})`);
  return asFilter(`Microsoft.Dynamics.CRM.${funcName}(${property},PropertyValues=${getVal(val2)})`);
}

type Primitive = null | string | number | Date | XQW.Guid | boolean;

export const Filter = {
  equals<T extends Primitive>(v1: T, v2: T): WebFilter {
    return comp(v1, "eq", v2);
  },
  notEquals<T extends Primitive>(v1: T, v2: T): WebFilter {
    return comp(v1, "ne", v2);
  },

  greaterThan<T extends number | Date>(v1: T, v2: T): WebFilter {
    return comp(v1, "gt", v2);
  },
  greaterThanOrEqual<T extends number | Date>(v1: T, v2: T): WebFilter {
    return comp(v1, "ge", v2);
  },
  lessThan<T extends number | Date>(v1: T, v2: T): WebFilter {
    return comp(v1, "lt", v2);
  },
  lessThanOrEqual<T extends number | Date>(v1: T, v2: T): WebFilter {
    return comp(v1, "le", v2);
  },

  and(f1: WebFilter, f2: WebFilter): WebFilter {
    return biFilter(f1, "and", f2);
  },
  or(f1: WebFilter, f2: WebFilter): WebFilter {
    return biFilter(f1, "or", f2);
  },
  not(f1: WebFilter): WebFilter {
    return asFilter(`not ${f1}`);
  },
  ands(fs: WebFilter[]): WebFilter {
    return nestedFilter(fs, "and");
  },
  ors(fs: WebFilter[]): WebFilter {
    return nestedFilter(fs, "or");
  },

  startsWith(val: string, prefix: string): WebFilter {
    return dataFunc("startswith", val, prefix);
  },
  contains(val: string, needle: string): WebFilter {
    return dataFunc("contains", val, needle);
  },
  endsWith(val: string, suffix: string): WebFilter {
    return dataFunc("endswith", val, suffix);
  },

  /** Makes a string into a GUID that can be sent to the OData source, i.e. unquoted. */
  makeGuid(id: string): XQW.Guid {
    return tag(stripGuid(id)) as XQW.Guid;
  },

  // --- CRM query functions ---------------------------------------------------------------------

  $in<T extends string | number | XQW.Guid>(val: T, listVal: T[]): WebFilter {
    return queryFunc("In", val, listVal);
  },
  notIn<T extends string | number | XQW.Guid>(val: T, listVal: T[]): WebFilter {
    return queryFunc("NotIn", val, listVal);
  },
  under(v1: XQW.Guid, v2: string | XQW.Guid): WebFilter {
    return queryFunc("Under", v1, v2);
  },
  underOrEqual(v1: XQW.Guid, v2: string | XQW.Guid): WebFilter {
    return queryFunc("UnderOrEqual", v1, v2);
  },
  notUnder(v1: XQW.Guid, v2: string | XQW.Guid): WebFilter {
    return queryFunc("NotUnder", v1, v2);
  },
  above(v1: XQW.Guid, v2: string | XQW.Guid): WebFilter {
    return queryFunc("Above", v1, v2);
  },
  equalUserId(prop: XQW.Guid): WebFilter {
    return queryFunc("EqualUserId", prop);
  },
  notEqualUserId(prop: XQW.Guid): WebFilter {
    return queryFunc("NotEqualUserId", prop);
  },
  equalBusinessId(prop: XQW.Guid): WebFilter {
    return queryFunc("EqualBusinessId", prop);
  },
  notEqualBusinessId(prop: XQW.Guid): WebFilter {
    return queryFunc("NotEqualBusinessId", prop);
  },
};
