# @contextand/xrmquery

Type-safe queries against the Dataverse (Dynamics 365) Web API.

This is the XrmQuery runtime, rebuilt as a proper npm package. The typings still come from
[XrmDefinitelyTyped](https://github.com/delegateas/XrmDefinitelyTyped) — its generated declaration
files merge into the ambient interfaces this package declares, so `WebEntities.d.ts` works unchanged.

What is different from the version that ships inside XrmDefinitelyTyped:

- **`fetch` only.** The caller is assumed to be authenticated already (a model-driven app, or a Node
  process with its own auth). No `XMLHttpRequest`, no callbacks, no `executeSync`.
- **Minifier-safe.** Attribute selection is captured with a recording `Proxy` instead of a regex over
  `Function.prototype.toString()`. Bundle and minify freely.
- **No overload cap.** `select` takes any number of attributes (the legacy version stopped at 15).
- **Modern Web API surface**: actions and functions, upsert, alternate keys, `$batch`, async paging,
  `AbortSignal`, impersonation, structured errors.

See [MIGRATION.md](./MIGRATION.md) if you are coming from the web-resource version.

## Install

```bash
npm install @contextand/xrmquery
```

Requires TypeScript 5.0+ (for `const` type parameters) and a runtime with a global `fetch`
(Node 18+, or any browser).

Point your `tsconfig.json` at the XrmDefinitelyTyped output as usual — no `/// <reference>` is needed
for the XrmQuery types themselves, having the package in `node_modules` is enough:

```jsonc
{
  "include": ["src/**/*", "typings/XRM/**/*.d.ts"],
}
```

## Quick start

```ts
import { XrmQuery, Filter } from "@contextand/xrmquery";

const accounts = await XrmQuery.retrieveMultiple((x) => x.accounts)
  .select((x) => [x.name, x.revenue, x.primarycontactid_guid])
  .filter((x) => Filter.startsWith(x.name, "Contoso"))
  .orderDesc((x) => x.revenue)
  .top(10)
  .execute();

//    accounts: { accountid: string; name: string | null; revenue: number | null;
//                primarycontactid_guid: string | null }[]
```

Inside a model-driven app the base url is taken from `Xrm.Utility.getGlobalContext().getClientUrl()`.
Anywhere else, configure it:

```ts
import { configure } from "@contextand/xrmquery";

configure({
  baseUrl: "https://contoso.crm4.dynamics.com/api/data/v9.2/",
  fetch: myAuthenticatedFetch, // e.g. one that attaches a bearer token
});
```

`configure` accepts `{ baseUrl, apiVersion, fetch, headers, callerId }`; `setApiUrl` and
`setApiVersion` are kept as thin wrappers. `resetConfig()` restores the defaults — useful in tests.

## Retrieving

```ts
// A single record.
const account = await XrmQuery.retrieve((x) => x.accounts, accountId)
  .select((x) => [x.name])
  .expand(
    (x) => x.contact_customer_accounts,
    (x) => [x.fullname],
  )
  .execute();

// By alternate key.
await XrmQuery.retrieve((x) => x.accounts, { accountnumber: "ABC-123" }).execute();

// Related records.
await XrmQuery.retrieveRelated(
  (x) => x.accounts,
  accountId,
  (x) => x.primarycontactid,
).execute();

await XrmQuery.retrieveRelatedMultiple(
  (x) => x.accounts,
  accountId,
  (x) => x.contact_customer_accounts,
).execute();

// The first match only, or null.
const first = await XrmQuery.retrieveMultiple((x) => x.accounts)
  .filter((x) => Filter.equals(x.name, "Contoso"))
  .getFirst();
```

Builder methods on a retrieve query: `select`, `selectMore`, `expand`, `filter`, `orFilter`,
`andFilter`, `orderAsc`, `orderDesc`, `top`, `skip`, `maxPageSize`, `explicit`, `useFetchXml`,
`usePredefinedQuery`, `includeFormattedValues`, `includeFormattedValuesAndLookupProperties`,
`header`, `impersonate`, `signal`.

`getQueryString()` returns the url a query would request, without sending it — handy in tests.

### Expanding

`expand` takes the navigation property, an optional select, and optional options:

```ts
await XrmQuery.retrieveMultiple((x) => x.accounts)
  .expand(
    (x) => x.contact_customer_accounts,
    (x) => [x.fullname],
    {
      top: 5,
      orderBy: (x) => x.firstname,
      sortOrder: SortOrder.Descending,
      filter: (x) => Filter.equals(x.lastname, "Smith"),
    },
  )
  .execute();
```

### Formatted values

`includeFormattedValues()` widens the result type with the `_formatted` companions XDT generates:

```ts
const [account] = await XrmQuery.retrieveMultiple((x) => x.accounts)
  .select((x) => [x.revenue])
  .includeFormattedValues()
  .execute();

account.revenue; // number | null
account.revenue_formatted; // string — "kr. 1.000,00"
```

Lookups come back with the raw `_x_value` property renamed to `x_guid`, and
`includeFormattedValuesAndLookupProperties()` additionally gives you `x_lookuplogicalname` and
`x_navigationproperty`. Date attributes are revived as `Date` objects.

### Paging

`execute()` follows `@odata.nextLink` until every page has been read. To handle pages yourself:

```ts
const query = XrmQuery.retrieveMultiple((x) => x.accounts)
  .select((x) => [x.name])
  .maxPageSize(500);

for await (const page of query.pages()) {
  console.log(page.length);
}
```

### FetchXML and saved queries

```ts
await XrmQuery.retrieveMultiple((x) => x.accounts)
  .useFetchXml(xml)
  .execute();

await XrmQuery.retrieveMultiple((x) => x.accounts)
  .usePredefinedQuery("savedQuery", viewId)
  .execute();
```

## Filters

```ts
Filter.equals(x.name, "Contoso");
Filter.notEquals(x.name, "Contoso");
Filter.greaterThan(x.revenue, 1000);
Filter.greaterThanOrEqual(x.createdon, new Date(2024, 0, 1));
Filter.lessThan(x.revenue, 1000);
Filter.lessThanOrEqual(x.revenue, 1000);

Filter.and(f1, f2);
Filter.or(f1, f2);
Filter.not(f);
Filter.ands([f1, f2, f3]);
Filter.ors([f1, f2, f3]);

Filter.startsWith(x.name, "Con");
Filter.contains(x.name, "nto");
Filter.endsWith(x.name, "oso");

// Compare an id or lookup against a GUID rather than a quoted string.
Filter.equals(x.accountid, Filter.makeGuid(id));
```

Dataverse query functions:

```ts
Filter.$in(x.accountid, [Filter.makeGuid(a), Filter.makeGuid(b)]);
Filter.notIn(x.accountid, [Filter.makeGuid(a)]);
Filter.under(x.owningbusinessunit_guid, businessUnitId);
Filter.underOrEqual(x.owningbusinessunit_guid, businessUnitId);
Filter.notUnder(x.owningbusinessunit_guid, businessUnitId);
Filter.above(x.owningbusinessunit_guid, businessUnitId);
Filter.equalUserId(x.ownerid_guid);
Filter.notEqualUserId(x.ownerid_guid);
Filter.equalBusinessId(x.owningbusinessunit_guid);
Filter.notEqualBusinessId(x.owningbusinessunit_guid);
```

## Creating, updating, deleting

```ts
const id = await XrmQuery.create((x) => x.accounts, {
  name: "Contoso",
  primarycontactid_bind$contacts: contactId, // sent as primarycontactid@odata.bind
}).execute();

await XrmQuery.update((x) => x.accounts, id, { name: "Contoso A/S" }).execute();

// Upsert — create when missing, update when present. Resolves to the new id, or
// undefined when the record already existed.
const newId = await XrmQuery.upsert(
  (x) => x.accounts,
  { accountnumber: "ABC-123" },
  { name: "Contoso" },
).execute();

// Restrict an upsert to one direction.
await XrmQuery.upsert((x) => x.accounts, id, record)
  .updateOnly()
  .execute(); // If-Match: *
await XrmQuery.upsert((x) => x.accounts, id, record)
  .createOnly()
  .execute(); // If-None-Match: *

await XrmQuery.deleteRecord((x) => x.accounts, id).execute();
```

### Associate and disassociate

```ts
await XrmQuery.associateSingle(
  (x) => x.contacts,
  contactId,
  (x) => x.accounts,
  accountId,
  (x) => x.parentcustomerid_account,
).execute();

await XrmQuery.associateCollection(
  (x) => x.accounts,
  accountId,
  (x) => x.contacts,
  contactId,
  (x) => x.contact_customer_accounts,
).execute();

await XrmQuery.disassociateSingle(
  (x) => x.contacts,
  contactId,
  (x) => x.parentcustomerid_account,
).execute();

await XrmQuery.disassociateCollection(
  (x) => x.accounts,
  accountId,
  (x) => x.contact_customer_accounts,
  contactId,
).execute();
```

## Actions and functions

Parameters are untyped for now — XrmDefinitelyTyped does not generate metadata for them — so pass
the expected result type explicitly.

```ts
const { UserId } = await XrmQuery.function<{ UserId: string }>("WhoAmI").execute();

await XrmQuery.function("GetTimeZoneCodeByLocalizedName", {
  LocalizedStandardName: "Romance Standard Time",
  LocaleId: 1033,
}).execute();

await XrmQuery.action("WinOpportunity", { Status: 3 }).execute();

// Bound to a record.
await XrmQuery.action(
  "Merge",
  { Discard: true },
  { entitySet: "accounts", id: accountId },
).execute();
```

## Batching

Queries passed to `XrmQuery.batch` are sent as one `$batch` request. Consecutive change requests are
grouped into a changeset, so they commit or roll back together. Results come back positionally, each
with the type its query would have produced on its own.

```ts
const read = XrmQuery.retrieveMultiple((x) => x.accounts).select((x) => [x.name]);
const create = XrmQuery.create((x) => x.accounts, { name: "Contoso" });

const [accounts, createdId] = await XrmQuery.batch([read, create]).execute();
```

## Cancellation, impersonation, headers

Every query supports these:

```ts
const controller = new AbortController();

await XrmQuery.retrieveMultiple((x) => x.accounts)
  .signal(controller.signal)
  .impersonate(otherUserId) // MSCRMCallerID
  .header("Prefer", 'odata.include-annotations="*"')
  .execute();
```

A default `callerId` and default `headers` can also be set globally through `configure`.

## Errors

A non-2xx response rejects with an `XrmQueryError`:

```ts
import { XrmQueryError } from "@contextand/xrmquery";

try {
  await XrmQuery.retrieve((x) => x.accounts, id).execute();
} catch (e) {
  if (e instanceof XrmQueryError) {
    e.status; // 404
    e.errorCode; // "0x80040217"
    e.message; // "Does not exist"
    e.method; // "GET"
    e.url; // "accounts(...)"
    e.body; // the raw response text
  }
}
```

## License

MIT. XrmQuery was originally created by [Delegate A/S](https://github.com/delegateas) as part of
XrmDefinitelyTyped; this package is an independent rewrite of its runtime.
