// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\Dist\dg.xrmquery.web.d.ts" />
declare namespace Filter {
  function $in<T extends string | number | XQW.Guid>(val: T, listVal: T[]): WebFilter;
  function notIn<T extends string | number | XQW.Guid>(val: T, listVal: T[]): WebFilter;
  function under(v1: XQW.Guid, v2: string | XQW.Guid): WebFilter;
  function underOrEqual(v1: XQW.Guid, v2: string | XQW.Guid): WebFilter;
  function notUnder(v1: XQW.Guid, v2: string | XQW.Guid): WebFilter;
  function above(v1: XQW.Guid, v2: string | XQW.Guid): WebFilter;
  function equalUserId(prop: XQW.Guid): WebFilter;
  function notEqualUserId(prop: XQW.Guid): WebFilter;
  function equalBusinessId(prop: XQW.Guid): WebFilter;
  function notEqualBusinessId(prop: XQW.Guid): WebFilter;
}
