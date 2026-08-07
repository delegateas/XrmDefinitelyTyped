/**
 * `@odata.nextLink` following.
 *
 * Dataverse pages both the result set itself and any expanded collection that exceeds the page size,
 * and signals both with an `@odata.nextLink`. The legacy library chased those links with a
 * callback-counting helper; here it is plain `await`.
 */

import { NEXT_LINK_ID, parseResponseBody, type MultiResult } from "../parse.js";
import { sendAbsolute, type RequestHeader } from "../http.js";

interface FollowContext {
  headers: RequestHeader[];
  signal?: AbortSignal;
}

function getPage(url: string, ctx: FollowContext): Promise<MultiResult> {
  return sendAbsolute("GET", url, undefined, ctx.headers, ctx.signal).then((r) =>
    parseResponseBody<MultiResult>(r.text),
  );
}

/**
 * Pulls in every remaining page of the expanded collections on `record`, so the caller sees complete
 * arrays rather than a first page plus a link.
 */
export async function populateRecord(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: any,
  expandKeys: string[],
  ctx: FollowContext,
): Promise<void> {
  if (!record || expandKeys.length === 0) return;

  await Promise.all(
    expandKeys.map(async (key) => {
      const linkKey = key + NEXT_LINK_ID;
      let link: string | undefined = record[linkKey];
      if (!link) return;
      delete record[linkKey];

      while (link) {
        const page = await getPage(link, ctx);
        record[key] = (record[key] ?? []).concat(page.value);
        link = page[NEXT_LINK_ID];
      }
    }),
  );
}

/** Yields every page of a multi-record result, expanded collections already completed. */
export async function* iteratePages(
  first: MultiResult,
  expandKeys: string[],
  ctx: FollowContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): AsyncGenerator<any[], void, undefined> {
  let page: MultiResult | undefined = first;
  while (page) {
    await Promise.all(page.value.map((record) => populateRecord(record, expandKeys, ctx)));
    yield page.value;

    const next: string | undefined = page[NEXT_LINK_ID];
    page = next ? await getPage(next, ctx) : undefined;
  }
}

/** Follows every page and returns the concatenated records. */
export async function followPages(
  first: MultiResult,
  expandKeys: string[],
  ctx: FollowContext,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all: any[] = [];
  for await (const page of iteratePages(first, expandKeys, ctx)) all.push(...page);
  return all;
}
