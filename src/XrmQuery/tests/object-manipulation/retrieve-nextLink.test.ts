import { describe, expect, it } from "vitest";
import { XrmQuery } from "../../src/index.js";
import { useFakeFetch } from "../helpers/fakeFetch.js";

const fake = useFakeFetch();

const accountId = "SOME_ACCOUNT_GUID";
const accountNumber = "SOME_ACCOUNTNUMBER";
const linkUrl = "https://organization.tld/api/data/v9.2/NEXT_LINK_URL";

describe("@odata.nextLink following", () => {
  it("follows the page nextLink of retrieveMultiple and concatenates results", async () => {
    fake.respondJson({
      value: [{ accountNumber: 1 }, { accountNumber: 2 }],
      "@odata.nextLink": linkUrl,
    });
    fake.respondJson({ value: [{ accountNumber: 3 }] });

    const result = await XrmQuery.retrieveMultiple((x) => x.accounts).execute();

    expect(fake.requests.map((r) => r.url)).toEqual(["accounts", linkUrl]);
    expect(fake.requests.every((r) => r.method === "GET")).toBe(true);
    expect(result).toEqual([{ accountNumber: 1 }, { accountNumber: 2 }, { accountNumber: 3 }]);
  });

  it("follows the expand nextLink of a record result and inserts the results", async () => {
    fake.respondJson({
      accountNumber,
      contact_customer_accounts: [],
      "contact_customer_accounts@odata.nextLink": linkUrl,
    });
    fake.respondJson({ value: [{ contact: 1 }, { contact: 2 }] });

    const result = await XrmQuery.retrieve((x) => x.accounts, accountId)
      .expand((x) => x.contact_customer_accounts)
      .execute();

    expect(fake.requests.map((r) => r.url)).toEqual([
      `accounts(${accountId})?$expand=contact_customer_accounts`,
      linkUrl,
    ]);
    expect(result).toEqual({
      accountNumber,
      contact_customer_accounts: [{ contact: 1 }, { contact: 2 }],
    });
  });

  it("yields one page at a time from pages()", async () => {
    fake.respondJson({ value: [{ accountnumber: "1" }], "@odata.nextLink": linkUrl });
    fake.respondJson({ value: [{ accountnumber: "2" }] });

    const pages: unknown[][] = [];
    for await (const page of XrmQuery.retrieveMultiple((x) => x.accounts)
      .maxPageSize(1)
      .pages()) {
      pages.push(page);
    }

    expect(pages).toEqual([[{ accountnumber: "1" }], [{ accountnumber: "2" }]]);
    expect(fake.requests[0].headers["prefer"]).toBe("odata.maxpagesize=1");
    expect(fake.requests[1].headers["prefer"]).toBe("odata.maxpagesize=1");
  });
});
