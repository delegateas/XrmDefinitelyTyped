# XrmDefinitelyTyped compatibility project

`typings/WebEntities.d.ts` is real XDT output — an `Account` declaration from a live org, ~190
attributes and ~90 relationships, pasted exactly as generated and excluded from Prettier so it stays
that way. `typings/stubs.d.ts` fills in what a single-entity excerpt cannot resolve on its own: the
option-set enums, `Account_Fixed`, and the `_Select`/`_Filter`/`_Expand`/`_Fixed`/`_Result`/
`_FormattedResult` sets of the 47 entities Account points at.

`WebEntity` is deliberately absent from both — it has to come from this package's `declare global`
block, which is the main thing under test. XDT emits it in `dg.xrmquery.web.d.ts`, the file
[MIGRATION.md](../../MIGRATION.md) tells you to delete.

`consumer.ts` never runs; it type-checks. Run it with:

```bash
npm run typecheck:xdt
```

It lives in its own `tsconfig.json` because it declares `accounts` on the global merge interfaces,
which collides with `tests/fixtures/entities.d.ts` in the root project — hence the root
`"exclude": ["tests/xdt-compat"]`.
