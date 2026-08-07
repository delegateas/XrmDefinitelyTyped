import { describe, expect, it } from "vitest";
import { XrmQuery } from "../../src/index.js";

const accountId = "SOME_ACCOUNT_GUID";
const viewId = "SOME_VIEW_GUID";
const fetchXml = `<fetch mapping='logical'><entity name='account'><attribute name='accountid'/><attribute name='name'/></entity></fetch>`;

describe("retrieveRelatedMultiple query string", () => {
  it("retrieves related records", () => {
    const qs = XrmQuery.retrieveRelatedMultiple(
      (x) => x.accounts,
      accountId,
      (x) => x.contact_customer_accounts,
    ).getQueryString();
    expect(qs).toBe(`accounts(${accountId})/contact_customer_accounts`);
  });

  it("builds a simple select", () => {
    const qs = XrmQuery.retrieveRelatedMultiple(
      (x) => x.accounts,
      accountId,
      (x) => x.contact_customer_accounts,
    )
      .select((x) => [x.fullname, x.parentcustomerid_guid])
      .getQueryString();
    expect(qs).toBe(
      `accounts(${accountId})/contact_customer_accounts?$select=fullname,_parentcustomerid_value`,
    );
  });

  it("builds a simple expand", () => {
    const qs = XrmQuery.retrieveRelatedMultiple(
      (x) => x.accounts,
      accountId,
      (x) => x.contact_customer_accounts,
    )
      .expand((x) => x.dg_TestAccount)
      .getQueryString();
    expect(qs).toBe(`accounts(${accountId})/contact_customer_accounts?$expand=dg_TestAccount`);
  });

  it("builds an expand with selects", () => {
    const qs = XrmQuery.retrieveRelatedMultiple(
      (x) => x.accounts,
      accountId,
      (x) => x.contact_customer_accounts,
    )
      .expand(
        (x) => x.dg_TestAccount,
        (x) => [x.accountnumber],
      )
      .getQueryString();
    expect(qs).toBe(
      `accounts(${accountId})/contact_customer_accounts?$expand=dg_TestAccount($select=accountnumber)`,
    );
  });

  it("encodes fetchXml", () => {
    const qs = XrmQuery.retrieveRelatedMultiple(
      (x) => x.accounts,
      accountId,
      (x) => x.account_master_account,
    )
      .useFetchXml(fetchXml)
      .getQueryString();
    expect(qs).toBe(
      `accounts(${accountId})/account_master_account?fetchXml=%3Cfetch%20mapping%3D'logical'%3E%3Centity%20name%3D'account'%3E%3Cattribute%20name%3D'accountid'%2F%3E%3Cattribute%20name%3D'name'%2F%3E%3C%2Fentity%3E%3C%2Ffetch%3E`,
    );
  });

  it("uses a userQuery", () => {
    const qs = XrmQuery.retrieveRelatedMultiple(
      (x) => x.accounts,
      accountId,
      (x) => x.account_master_account,
    )
      .usePredefinedQuery("userQuery", viewId)
      .getQueryString();
    expect(qs).toBe(`accounts(${accountId})/account_master_account?userQuery=${viewId}`);
  });

  it("uses a savedQuery", () => {
    const qs = XrmQuery.retrieveRelatedMultiple(
      (x) => x.accounts,
      accountId,
      (x) => x.account_master_account,
    )
      .usePredefinedQuery("savedQuery", viewId)
      .getQueryString();
    expect(qs).toBe(`accounts(${accountId})/account_master_account?savedQuery=${viewId}`);
  });
});
