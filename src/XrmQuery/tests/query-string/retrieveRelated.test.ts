import { describe, expect, it } from "vitest";
import { Filter, SortOrder, XrmQuery } from "../../src/index.js";

const accountId = "ACCOUNT_ID";

describe("retrieveRelated query string", () => {
  it("retrieves a related record", () => {
    const qs = XrmQuery.retrieveRelated(
      (x) => x.accounts,
      accountId,
      (x) => x.primarycontactid,
    ).getQueryString();
    expect(qs).toBe(`accounts(${accountId})/primarycontactid`);
  });

  it("builds a simple select", () => {
    const qs = XrmQuery.retrieveRelated(
      (x) => x.accounts,
      accountId,
      (x) => x.primarycontactid,
    )
      .select((x) => [x.fullname, x.parentcustomerid_guid])
      .getQueryString();
    expect(qs).toBe(
      `accounts(${accountId})/primarycontactid?$select=fullname,_parentcustomerid_value`,
    );
  });

  it("builds a simple expand", () => {
    const qs = XrmQuery.retrieveRelated(
      (x) => x.accounts,
      accountId,
      (x) => x.primarycontactid,
    )
      .expand((x) => x.dg_TestAccount)
      .getQueryString();
    expect(qs).toBe(`accounts(${accountId})/primarycontactid?$expand=dg_TestAccount`);
  });

  it("builds an expand with selects", () => {
    const qs = XrmQuery.retrieveRelated(
      (x) => x.accounts,
      accountId,
      (x) => x.primarycontactid,
    )
      .expand(
        (x) => x.dg_TestAccount,
        (x) => [x.accountnumber],
      )
      .getQueryString();
    expect(qs).toBe(
      `accounts(${accountId})/primarycontactid?$expand=dg_TestAccount($select=accountnumber)`,
    );
  });

  it("builds an expand with selects and extra options", () => {
    const qs = XrmQuery.retrieveRelated(
      (x) => x.accounts,
      accountId,
      (x) => x.primarycontactid,
    )
      .expand(
        (x) => x.contact_customer_contacts,
        (x) => [x.fullname],
        { top: 2, sortOrder: SortOrder.Descending, orderBy: (x) => x.firstname },
      )
      .getQueryString();
    expect(qs).toBe(
      `accounts(${accountId})/primarycontactid?$expand=contact_customer_contacts($select=fullname;$top=2;$orderby=firstname desc)`,
    );
  });

  it("builds an expand with selects and filters", () => {
    const contactId = "CONTACT_ID";
    const contactFirstName = "CONTACT_NAME";

    const qs = XrmQuery.retrieveRelated(
      (x) => x.accounts,
      accountId,
      (x) => x.primarycontactid,
    )
      .expand(
        (x) => x.contact_customer_contacts,
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
      `accounts(${accountId})/primarycontactid?$expand=contact_customer_contacts($select=fullname;$filter=(firstname eq '${contactFirstName}' and contactid eq ${contactId}))`,
    );
  });
});
