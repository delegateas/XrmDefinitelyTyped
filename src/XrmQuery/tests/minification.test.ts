/**
 * The regression that motivated the Proxy rewrite.
 *
 * The legacy library recovered attribute names by running a regex over the *source text* of the
 * picker lambdas, so any minifier that renamed `x` or mangled property accesses silently produced
 * the wrong query — which is why XrmDefinitelyTyped told consumers not to minify. Here the picker is
 * actually called, so the names come from the property accesses themselves.
 */

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { afterAll, expect, it } from "vitest";

const dir = mkdtempSync(join(tmpdir(), "xrmquery-minify-"));

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

const entry = join(dir, "entry.js");
const bundle = join(dir, "bundle.mjs");

const source = `
import { Filter, XrmQuery, setApiUrl } from ${JSON.stringify(resolve("src/index.ts"))};

setApiUrl("");

export function queryString() {
  return XrmQuery.retrieveMultiple((someParameterName) => someParameterName.accounts)
    .select((attributes) => [attributes.name, attributes.primarycontactid_guid])
    .filter((attributes) => Filter.startsWith(attributes.accountnumber, "admin"))
    .expand(
      (expansions) => expansions.contact_customer_accounts,
      (attributes) => [attributes.fullname],
    )
    .orderDesc((attributes) => attributes.name)
    .getQueryString();
}
`;

const expected =
  "accounts?$select=name,_primarycontactid_value" +
  "&$expand=contact_customer_accounts($select=fullname)" +
  "&$filter=startswith(accountnumber, 'admin')" +
  "&$orderby=name desc";

it("produces the same query string after minification", async () => {
  writeFileSync(entry, source);

  await build({
    entryPoints: [entry],
    outfile: bundle,
    bundle: true,
    minify: true,
    format: "esm",
    platform: "neutral",
    logLevel: "silent",
  });

  const minified = (await import(pathToFileURL(bundle).href)) as { queryString(): string };
  expect(minified.queryString()).toBe(expected);
});
