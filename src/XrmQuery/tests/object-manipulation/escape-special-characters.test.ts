import { describe, expect, it } from "vitest";
import { Filter, XrmQuery } from "../../src/index.js";
import { onlyRequest, useFakeFetch } from "../helpers/fakeFetch.js";

const fake = useFakeFetch();

const special = "*._-~'!()/+@?=:#;,$& %^[]{}<>\"\\|`";
const fetchXmlSpecial = `<fetch mapping='logical'><entity name='account'><attribute name='accountid'/><attribute name='name'/><filter><condition attribute="name" operator="eq" value="*._-~&apos;!()/+@?=:#;,$&amp; %^[]{}&lt;&gt;&quot;\\|\`" /></filter></entity></fetch>`;

describe("special characters in the final url", () => {
  it("escapes a simple filter", async () => {
    fake.respondJson({ value: [] });

    const result = await XrmQuery.retrieveMultiple((x) => x.accounts)
      .filter((x) => Filter.equals(x.accountnumber, special))
      .execute();

    expect(onlyRequest(fake).url).toBe(
      "accounts?$filter=accountnumber%20eq%20'*._-~''!()%2F%2B@%3F=:%23;,$%26%20%25%5E%5B%5D%7B%7D%3C%3E%22%5C%7C%60'",
    );
    expect(result).toEqual([]);
  });

  it("escapes an expand filter", async () => {
    const accountId = "ACCOUNT_ID";
    fake.respondJson({});

    const result = await XrmQuery.retrieve((x) => x.accounts, accountId)
      .expand(
        (x) => x.contact_customer_accounts,
        (x) => [x.fullname],
        { filter: (x) => Filter.equals(x.firstname, special) },
      )
      .execute();

    expect(onlyRequest(fake).url).toBe(
      `accounts(${accountId})?$expand=contact_customer_accounts($select=fullname;$filter=firstname%20eq%20'*._-~''!()%2F%2B@%3F=:%23;,$%26%20%25%5E%5B%5D%7B%7D%3C%3E%22%5C%7C%60')`,
    );
    expect(result).toEqual({});
  });

  it("escapes fetchXml", async () => {
    fake.respondJson({ value: [] });

    await XrmQuery.retrieveMultiple((x) => x.accounts)
      .useFetchXml(fetchXmlSpecial)
      .execute();

    expect(onlyRequest(fake).url).toBe(
      "accounts?fetchXml=%3Cfetch%20mapping%3D'logical'%3E%3Centity%20name%3D'account'%3E%3Cattribute%20name%3D'accountid'%2F%3E%3Cattribute%20name%3D'name'%2F%3E%3Cfilter%3E%3Ccondition%20attribute%3D%22name%22%20operator%3D%22eq%22%20value%3D%22*._-~%26apos%3B!()%2F%2B%40%3F%3D%3A%23%3B%2C%24%26amp%3B%20%25%5E%5B%5D%7B%7D%26lt%3B%26gt%3B%26quot%3B%5C%7C%60%22%20%2F%3E%3C%2Ffilter%3E%3C%2Fentity%3E%3C%2Ffetch%3E",
    );
  });
});
