import { describe, expect, it } from "vitest";
import { Filter, SortOrder, XrmQuery } from "../../src/index.js";

const accountId = "ACCOUNT_ID";

describe("retrieve query string", () => {
  it("retrieves an account", () => {
    const qs = XrmQuery.retrieve((x) => x.accounts, accountId).getQueryString();
    expect(qs).toBe(`accounts(${accountId})`);
  });

  it("builds a simple select", () => {
    const qs = XrmQuery.retrieve((x) => x.accounts, accountId)
      .select((x) => [x.name, x.accountnumber])
      .getQueryString();
    expect(qs).toBe(`accounts(${accountId})?$select=name,accountnumber`);
  });

  it("leaves attribute names that merely contain _guid alone", () => {
    const qs = XrmQuery.retrieve((x) => x.accounts, accountId)
      .select((x) => [x.name, x.dg_somestringwith_guids])
      .getQueryString();
    expect(qs).toBe(`accounts(${accountId})?$select=name,dg_somestringwith_guids`);
  });

  it("rewrites lookup selects to their _value form", () => {
    const qs = XrmQuery.retrieve((x) => x.accounts, accountId)
      .select((x) => [x.name, x.primarycontactid_guid])
      .getQueryString();
    expect(qs).toBe(`accounts(${accountId})?$select=name,_primarycontactid_value`);
  });

  it("appends to the selection with selectMore", () => {
    const qs = XrmQuery.retrieve((x) => x.accounts, accountId)
      .select((x) => [x.name])
      .selectMore((x) => [x.accountnumber])
      .getQueryString();
    expect(qs).toBe(`accounts(${accountId})?$select=name,accountnumber`);
  });

  it("builds a simple expand", () => {
    const qs = XrmQuery.retrieve((x) => x.accounts, accountId)
      .expand((x) => x.contact_customer_accounts)
      .getQueryString();
    expect(qs).toBe(`accounts(${accountId})?$expand=contact_customer_accounts`);
  });

  it("builds an expand with selects", () => {
    const qs = XrmQuery.retrieve((x) => x.accounts, accountId)
      .expand(
        (x) => x.contact_customer_accounts,
        (x) => [x.fullname, x.emailaddress1],
      )
      .getQueryString();
    expect(qs).toBe(
      `accounts(${accountId})?$expand=contact_customer_accounts($select=fullname,emailaddress1)`,
    );
  });

  it("builds an expand with selects and extra options", () => {
    const qs = XrmQuery.retrieve((x) => x.accounts, accountId)
      .expand(
        (x) => x.contact_customer_accounts,
        (x) => [x.fullname],
        { top: 2, sortOrder: SortOrder.Descending, orderBy: (x) => x.firstname },
      )
      .getQueryString();
    expect(qs).toBe(
      `accounts(${accountId})?$expand=contact_customer_accounts($select=fullname;$top=2;$orderby=firstname desc)`,
    );
  });

  it("builds an expand with selects and filters", () => {
    const contactId = "CONTACT_ID";
    const contactFirstName = "CONTACT_NAME";

    const qs = XrmQuery.retrieve((x) => x.accounts, accountId)
      .expand(
        (x) => x.contact_customer_accounts,
        (x) => [x.fullname],
        {
          filter: (x) =>
            Filter.and(
              Filter.equals(x.firstname, contactFirstName),
              Filter.equals(x.contactid, Filter.makeGuid(contactId)),
            ),
        },
      )
      .getQueryString();

    expect(qs).toBe(
      `accounts(${accountId})?$expand=contact_customer_accounts($select=fullname;$filter=(firstname eq '${contactFirstName}' and contactid eq ${contactId}))`,
    );
  });

  it("escapes special characters in an expand filter", () => {
    const qs = XrmQuery.retrieve((x) => x.accounts, accountId)
      .expand(
        (x) => x.contact_customer_accounts,
        (x) => [x.fullname],
        { filter: (x) => Filter.equals(x.firstname, "*._-~'!()/+@?=:#;,$& %^[]{}<>\"\\|`") },
      )
      .getQueryString();

    expect(qs).toBe(
      `accounts(${accountId})?$expand=contact_customer_accounts($select=fullname;$filter=firstname eq '*._-~''!()%2F%2B@%3F=:%23;,$%26%20%25%5E%5B%5D%7B%7D%3C%3E%22%5C%7C%60')`,
    );
  });

  it("addresses a record by alternate key", () => {
    const qs = XrmQuery.retrieve((x) => x.accounts, { accountnumber: "ABC 123" })
      .select((x) => [x.name])
      .getQueryString();
    expect(qs).toBe("accounts(accountnumber='ABC%20123')?$select=name");
  });

  it("strips the braces CRM puts around guids", () => {
    const qs = XrmQuery.retrieve((x) => x.accounts, `{${accountId}}`).getQueryString();
    expect(qs).toBe(`accounts(${accountId})`);
  });
});
