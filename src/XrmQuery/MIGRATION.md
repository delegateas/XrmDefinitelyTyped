# Migrating from the XrmDefinitelyTyped web resource

The XrmQuery that ships inside [XrmDefinitelyTyped](https://github.com/delegateas/XrmDefinitelyTyped)
is a script web resource (`dg.xrmquery.web.js`) exposing the globals `XrmQuery`, `Filter` and `XQW`.
This package is the same query language delivered as an npm module.

The builder surface is unchanged, so most call sites compile as-is once the imports are added. What
changes is how the library gets into your bundle, and the removal of everything that predates
`fetch` and `Promise`.

## 1. Install and import

```diff
+import { XrmQuery, Filter, SortOrder } from "@delegateas/xrmquery";
```

`XrmQuery` and `Filter` are no longer globals. Stop deploying `dg.xrmquery.web.js` as a web resource
and remove it from the form's script list — the code is bundled into your own script now.

## 2. Delete the old ambient declarations

XrmDefinitelyTyped emits `dg.xrmquery.web.d.ts` next to `WebEntities.d.ts`. **Delete it**, or exclude
it from `tsconfig.json`. It declares the same globals this package does (`WebEntity`, `WebAttribute`,
`WebMappingRetrieve`, `SortOrder`, `XQW`, …) and keeping both produces duplicate-identifier errors.

`WebEntities.d.ts` itself stays exactly as generated — it merges into the ambient interfaces this
package declares, with no `/// <reference>` needed.

## 3. Configure the endpoint if you are not in a model-driven app

Inside a form the base url still resolves from `Xrm.Utility.getGlobalContext().getClientUrl()`.
Outside one — Node, a test, a standalone SPA — set it, together with a `fetch` that carries your
token:

```ts
configure({ baseUrl: "https://contoso.crm4.dynamics.com/api/data/v9.2/", fetch: authedFetch });
```

This package does no authentication of its own. It assumes the caller is already authenticated.

## 4. Move to `execute()`

Everything is Promise-based.

```diff
-XrmQuery.retrieveMultiple(x => x.accounts).execute(onSuccess, onError);
+XrmQuery.retrieveMultiple(x => x.accounts).execute().then(onSuccess, onError);
```

`.promise()` is kept as an alias of `.execute()`, and `promiseFirst()` as an alias of `getFirst()`,
so existing `await …promise()` call sites need no change.

## Removed

| Removed                                               | Replacement                                                           |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| `execute(successCb, errorCb)`                         | `execute()` returning a `Promise`                                     |
| `executeSync()`                                       | none — synchronous XHR is gone for good                               |
| `executeRaw()`                                        | `execute()`, or `toRequest()` if you want the raw request shape       |
| `XrmQuery.request` / `sendRequest` / `promiseRequest` | call `fetch` directly, or use `XrmQuery.action` / `XrmQuery.function` |
| The `Promise`-polyfill build variant                  | none — a native `Promise` is assumed                                  |
| `dg.xrmquery.rest` (the 2011 OData endpoint)          | not ported; use the Web API                                           |
| The IIFE / web-resource build                         | ESM and CJS builds only                                               |

## Behaviour that changed

**`SortOrder` is a value import.** It used to be an ambient `const enum` the compiler inlined;
ambient const enums are unusable under `isolatedModules`, so the global is now a `1 | 2` type alias
and the constants come from the package.

```diff
-.expand(x => x.contact_customer_accounts, x => [x.fullname], { sortOrder: SortOrder.Descending })
+import { SortOrder } from "@delegateas/xrmquery";
```

**Errors are `XrmQueryError`, not `Error`.** A failed request rejects with `status`, `errorCode`,
`message`, `method`, `url` and `body` instead of a bare message string.

**Attribute paths are captured with a `Proxy`.** The legacy library regex-parsed
`Function.prototype.toString()`, which is why XrmDefinitelyTyped warns against minification. That
restriction is gone: minify and mangle freely. As a consequence the picker lambdas are actually
invoked, so keep them free of side effects — `x => [x.name]`, not `x => { log(); return [x.name]; }`.

**`select` has no 15-attribute limit.** The hand-written overload chain is replaced by a variadic
signature. Requires TypeScript 5.0+.

## Behaviour that deliberately did _not_ change

These are quirks of the [Web API](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/query/overview),
not of the old library, so they are kept:

- lookup values arrive as `x_guid` (renamed from the raw `_x_value`)
- formatted values arrive as `x_formatted`, with `x_lookuplogicalname` and `x_navigationproperty`
  under `includeFormattedValuesAndLookupProperties()`
- date attributes are revived as `Date` objects
- `@odata.nextLink` is followed transparently by `execute()`, on both records and expanded collections
- `Prefer` headers drive formatted values and `maxPageSize`
- create resolves to the id parsed out of the `OData-EntityId` response header
- `_bind$<entityset>` properties on create/update records become `<name>@odata.bind`

## New in this version

`XrmQuery.upsert`, alternate keys as record ids, `XrmQuery.action` / `XrmQuery.function`,
`XrmQuery.batch`, `pages()` / `all()`, `.signal(abortSignal)`, `.impersonate(userId)`, and
`XrmQueryError`. See the [README](./README.md).
