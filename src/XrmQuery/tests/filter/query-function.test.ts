import { describe, expect, it } from "vitest";
import { Filter, XrmQuery } from "../../src/index.js";

const accountId = "ACCOUNT_ID";

/** Builds the query string of an accounts query carrying only the given filter. */
function filterOf(build: (x: Account_Filter) => WebFilter): string {
  return XrmQuery.retrieveMultiple((x) => x.accounts)
    .filter(build)
    .getQueryString();
}

describe("CRM query-function filters", () => {
  it("In", () => {
    expect(filterOf((x) => Filter.$in(x.address1_city, ["12345"]))).toBe(
      "accounts?$filter=Microsoft.Dynamics.CRM.In(PropertyName='address1_city',PropertyValues=['12345'])",
    );
  });

  it("In on an attribute with an underscore in its name", () => {
    expect(filterOf((x) => Filter.$in(x.dg_test_med_underscore, ["12345"]))).toBe(
      "accounts?$filter=Microsoft.Dynamics.CRM.In(PropertyName='dg_test_med_underscore',PropertyValues=['12345'])",
    );
  });

  it("NotIn", () => {
    expect(filterOf((x) => Filter.notIn(x.accountnumber, ["12345"]))).toBe(
      "accounts?$filter=Microsoft.Dynamics.CRM.NotIn(PropertyName='accountnumber',PropertyValues=['12345'])",
    );
  });

  it("Under", () => {
    expect(filterOf((x) => Filter.under(x.parentaccountid_guid, accountId))).toBe(
      "accounts?$filter=Microsoft.Dynamics.CRM.Under(PropertyName='parentaccountid',PropertyValues='ACCOUNT_ID')",
    );
  });

  it("UnderOrEqual", () => {
    expect(filterOf((x) => Filter.underOrEqual(x.parentaccountid_guid, accountId))).toBe(
      "accounts?$filter=Microsoft.Dynamics.CRM.UnderOrEqual(PropertyName='parentaccountid',PropertyValues='ACCOUNT_ID')",
    );
  });

  it("NotUnder", () => {
    expect(filterOf((x) => Filter.notUnder(x.parentaccountid_guid, accountId))).toBe(
      "accounts?$filter=Microsoft.Dynamics.CRM.NotUnder(PropertyName='parentaccountid',PropertyValues='ACCOUNT_ID')",
    );
  });

  it("Above", () => {
    expect(filterOf((x) => Filter.above(x.parentaccountid_guid, accountId))).toBe(
      "accounts?$filter=Microsoft.Dynamics.CRM.Above(PropertyName='parentaccountid',PropertyValues='ACCOUNT_ID')",
    );
  });

  it("EqualUserId", () => {
    expect(filterOf((x) => Filter.equalUserId(x.ownerid_guid))).toBe(
      "accounts?$filter=Microsoft.Dynamics.CRM.EqualUserId(PropertyName='ownerid')",
    );
  });

  it("NotEqualUserId", () => {
    expect(filterOf((x) => Filter.notEqualUserId(x.ownerid_guid))).toBe(
      "accounts?$filter=Microsoft.Dynamics.CRM.NotEqualUserId(PropertyName='ownerid')",
    );
  });

  it("EqualBusinessId", () => {
    expect(filterOf((x) => Filter.equalBusinessId(x.owningbusinessunit_guid))).toBe(
      "accounts?$filter=Microsoft.Dynamics.CRM.EqualBusinessId(PropertyName='owningbusinessunit')",
    );
  });

  it("NotEqualBusinessId", () => {
    expect(filterOf((x) => Filter.notEqualBusinessId(x.owningbusinessunit_guid))).toBe(
      "accounts?$filter=Microsoft.Dynamics.CRM.NotEqualBusinessId(PropertyName='owningbusinessunit')",
    );
  });
});
