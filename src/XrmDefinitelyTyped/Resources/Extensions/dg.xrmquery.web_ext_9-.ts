/// <reference path="..\dg.xrmquery.web.ts" />
namespace Filter {
  export function $in(val: string | number | XQW.Guid, listVal: (string | number | XQW.Guid)[]): WebFilter { return queryFunc("In", val, listVal) }
  export function notIn(val: string | number | XQW.Guid, listVal: (string | number | XQW.Guid)[]): WebFilter { return queryFunc("NotIn", val, listVal) }
  export function under(v1: XQW.Guid, v2: XQW.Guid): WebFilter { return queryFunc("Under", v1, v2) }
  export function underOrEqual(v1: XQW.Guid, v2: XQW.Guid): WebFilter { return queryFunc("UnderOrEqual", v1, v2) }
  export function notUnder(v1: XQW.Guid, v2: XQW.Guid): WebFilter { return queryFunc("NotUnder", v1, v2) }
  export function above(v1: XQW.Guid, v2: XQW.Guid): WebFilter { return queryFunc("Above", v1, v2) }
  export function equalUserId(prop: XQW.Guid): WebFilter { return queryFunc("EqualUserId", prop) }
  export function notEqualUserId(prop: XQW.Guid): WebFilter { return queryFunc("NotEqualUserId", prop) }
  export function equalBusinessId(prop: XQW.Guid): WebFilter { return queryFunc("EqualBusinessId", prop) }
  export function notEqualBusinessId(prop: XQW.Guid): WebFilter { return queryFunc("NotEqualBusinessId", prop) }

  /**
	 * @internal
	 */
  function queryFunc<T>(funcName: string, val1: T): WebFilter;
  function queryFunc<T, V>(funcName: string, val1: T, val2: V): WebFilter;
  function queryFunc<T, V>(funcName: string, val1: T, val2?: V): WebFilter {
    if (val2 != undefined) {
      return <WebFilter><any>(`Microsoft.Dynamics.CRM.${funcName}(PropertyName=${getVal(val1)}, PropertyValues${getVal(val2)})`);
    }
    else {
      return <WebFilter><any>(`Microsoft.Dynamics.CRM.${funcName}(PropertyName=${getVal(val1)})`);
    }
  }

  function getVal(v: any) {
    if (v == null) return "null"
    if (typeof v === "string") return `'${encodeSpecialCharacters(v)}'`;
    if (v instanceof Date) return encodeSpecialCharacters(v.toISOString());
    return encodeSpecialCharacters(v.toString());
  }

  /**
   * @internal
   */
  function encodeSpecialCharacters(queryString: string) {
    return encodeURI(queryString)
      .replace(/'/g, "''")
      .replace(/\+/g, "%2B")
      .replace(/\//g, "%2F")
      .replace(/\?/g, "%3F")
      .replace(/#/g, "%23")
      .replace(/&/g, "%26");
  }
}