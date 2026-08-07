/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The ambient contract that XrmDefinitelyTyped-generated typings merge into.
 *
 * XDT emits declaration files that do `interface WebEntitiesRetrieve { accounts: WebMappingRetrieve<...> }`
 * in global scope, and reference `WebAttribute`, `WebExpand`, `WebFilter` and `XQW.Guid` by name.
 * Declaring them here means generated typings keep working unchanged — no `/// <reference>` needed;
 * having this package in `node_modules` is enough.
 *
 * The phantom marker properties deliberately mention only *some* of the type parameters, exactly as
 * the legacy `dg.xrmquery.web.d.ts` did. Inference of the remaining parameters relies on TypeScript's
 * positional inference between two references to the same generic type, which breaks if the markers
 * are widened to intersections.
 */

declare global {
  /**
   * Base of every generated entity interface (`interface Account_Base extends WebEntity`).
   *
   * XDT emits it in `dg.xrmquery.web.d.ts`, which this package replaces — so it has to live here.
   * It carries no members; declaring it again alongside a leftover `dg.xrmquery.web.d.ts` merges
   * harmlessly.
   */
  interface WebEntity {}

  // Merge targets — XDT adds one property per entity set to each of these.
  interface WebEntitiesRetrieve {}
  interface WebEntitiesRelated {}
  interface WebEntitiesCUDA {}

  interface WebMappingRetrieve<ISelect, IExpand, IFilter, IFixed, Result, FormattedResult> {
    __WebMappingRetrieve: ISelect;
  }

  interface WebMappingCUDA<ICreate, IUpdate, ISelect> {
    __WebMappingCUDA: ICreate & IUpdate & ISelect;
  }

  interface WebMappingRelated<ISingle, IMultiple> {
    __WebMappingRelated: ISingle & IMultiple;
  }

  interface WebAttribute<ISelect, Result, Formatted> {
    __WebAttribute: ISelect;
  }

  interface WebExpand<IExpand, ChildSelect, ChildFilter, Result> {
    __WebExpandable: IExpand;
  }

  interface WebFilter {
    __WebFilter: any;
  }

  /** Raw query-option overrides, bypassing the typed builder. */
  interface ExplicitQuery {
    select?: string;
    expand?: string;
    filter?: string;
    orderby?: string;
    skip?: string;
    top?: string;
    [key: string]: string | undefined;
  }

  interface ExpandOptions<ISelect, IFilter> {
    filter?: (f: IFilter) => WebFilter;
    top?: number;
    orderBy?: (s: ISelect) => WebAttribute<ISelect, any, any>;
    sortOrder?: SortOrder;
  }

  /**
   * Sort order for {@link ExpandOptions}.
   *
   * A type alias rather than the legacy `const enum` — ambient const enums are unusable under
   * `isolatedModules`. Import the `SortOrder` value from this package to get the named constants.
   */
  type SortOrder = 1 | 2;

  namespace XQW {
    /** A value the Web API should treat as a GUID rather than a quoted string. */
    interface Guid {
      __XqwGuid: any;
    }
  }
}

/**
 * Runtime counterpart of the global `SortOrder` type.
 *
 * The legacy library declared `SortOrder` as an ambient `const enum`, which the compiler inlined at
 * every call site. Ambient const enums are unusable under `isolatedModules`, so the values live here
 * and the global stays a plain `1 | 2` union — call sites need `import { SortOrder }`.
 */
export const SortOrder = {
  Ascending: 1,
  Descending: 2,
} as const;
