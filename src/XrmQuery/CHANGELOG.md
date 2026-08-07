# @contextand/xrmquery

## 0.1.0

Initial release: the XrmQuery runtime as a standalone, `fetch`-only npm package. Ports the full
legacy builder surface (retrieve, retrieveMultiple, related queries, create/update/delete, associate,
`Filter` including the Dataverse query functions) on top of a minifier-safe `Proxy` path recorder,
and adds upsert, alternate keys, actions and functions, `$batch`, async paging, `AbortSignal`,
impersonation and structured `XrmQueryError`s.
