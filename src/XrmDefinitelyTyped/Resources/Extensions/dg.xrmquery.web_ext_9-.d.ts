/// <reference path="..\Dist\dg.xrmquery.web.d.ts" />
declare namespace Filter {
  function $in(val: string | number | XQW.Guid, listVal: (string | number | XQW.Guid)[]): WebFilter;
  function notIn(val: string | number | XQW.Guid, listVal: (string | number | XQW.Guid)[]): WebFilter;
  function under(v1: XQW.Guid, v2: string | XQW.Guid): WebFilter;
  function underOrEqual(v1: XQW.Guid, v2: string | XQW.Guid): WebFilter;
  function notUnder(v1: XQW.Guid, v2: string | XQW.Guid): WebFilter;
  function above(v1: XQW.Guid, v2: string | XQW.Guid): WebFilter;
  function equalUserId(prop: XQW.Guid): WebFilter;
  function notEqualUserId(prop: XQW.Guid): WebFilter;
  function equalBusinessId(prop: XQW.Guid): WebFilter;
  function notEqualBusinessId(prop: XQW.Guid): WebFilter;
}
