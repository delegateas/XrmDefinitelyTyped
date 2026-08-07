import { describe, expect, it } from "vitest";
import { Filter, XrmQuery } from "../../src/index.js";

const viewId = "SOME_VIEW_ID";
const fetchXml = `<fetch mapping='logical'><entity name='account'><attribute name='accountid'/><attribute name='name'/></entity></fetch>`;
const fetchXmlSpecial = `<fetch mapping='logical'><entity name='account'><attribute name='accountid'/><attribute name='name'/><filter><condition attribute="name" operator="eq" value="*._-~&apos;!()/+@?=:#;,$&amp; %^[]{}&lt;&gt;&quot;\\|\`" /></filter></entity></fetch>`;

describe("retrieveMultiple query string", () => {
  it("retrieves accounts", () => {
    expect(XrmQuery.retrieveMultiple((x) => x.accounts).getQueryString()).toBe("accounts");
  });

  it("builds a simple select", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .select((x) => [x.name, x.accountnumber])
      .getQueryString();
    expect(qs).toBe("accounts?$select=name,accountnumber");
  });

  it("leaves attribute names that merely contain _guid alone", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .select((x) => [x.name, x.dg_somestringwith_guids])
      .getQueryString();
    expect(qs).toBe("accounts?$select=name,dg_somestringwith_guids");
  });

  it("combines multiple query settings", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .skip(5)
      .top(3)
      .getQueryString();
    expect(qs).toBe("accounts?$skip=5&$top=3");
  });

  it("orders by several attributes", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .orderAsc((x) => x.accountnumber)
      .orderDesc((x) => x.name)
      .getQueryString();
    expect(qs).toBe("accounts?$orderby=accountnumber asc,name desc");
  });

  it("rewrites lookups in orderby", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .orderAsc((x) => x.primarycontactid_guid)
      .getQueryString();
    expect(qs).toBe("accounts?$orderby=_primarycontactid_value asc");
  });

  it("builds a simple filter", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .filter((x) => Filter.equals(x.accountnumber, "12345"))
      .getQueryString();
    expect(qs).toBe("accounts?$filter=accountnumber eq '12345'");
  });

  it("escapes special characters in a filter", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .filter((x) => Filter.equals(x.accountnumber, "*._-~'!()/+@?=:#;,$& %^[]{}<>\"\\|`"))
      .getQueryString();
    expect(qs).toBe(
      "accounts?$filter=accountnumber eq '*._-~''!()%2F%2B@%3F=:%23;,$%26%20%25%5E%5B%5D%7B%7D%3C%3E%22%5C%7C%60'",
    );
  });

  it("builds a complex filter", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .filter((x) =>
        Filter.and(Filter.startsWith(x.name, "admin"), Filter.equals(x.accountnumber, "12345")),
      )
      .orFilter((x) => Filter.notEquals(x.accountid, Filter.makeGuid("SOME-GUID")))
      .getQueryString();
    expect(qs).toBe(
      "accounts?$filter=((startswith(name, 'admin') and accountnumber eq '12345') or accountid ne SOME-GUID)",
    );
  });

  it("ands an extra filter on", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .filter((x) => Filter.equals(x.name, "a"))
      .andFilter((x) => Filter.equals(x.accountnumber, "b"))
      .getQueryString();
    expect(qs).toBe("accounts?$filter=(name eq 'a' and accountnumber eq 'b')");
  });

  it("uses the given filter when there is nothing to and/or onto", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .andFilter((x) => Filter.equals(x.name, "a"))
      .getQueryString();
    expect(qs).toBe("accounts?$filter=name eq 'a'");
  });

  it("builds a simple expand", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .expand((x) => x.contact_customer_accounts)
      .getQueryString();
    expect(qs).toBe("accounts?$expand=contact_customer_accounts");
  });

  it("builds an expand with selects", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .expand(
        (x) => x.contact_customer_accounts,
        (x) => [x.fullname, x.emailaddress1],
      )
      .getQueryString();
    expect(qs).toBe("accounts?$expand=contact_customer_accounts($select=fullname,emailaddress1)");
  });

  it("overrides options explicitly", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .select((x) => [x.name])
      .explicit({ select: "name,accountnumber", top: "4" })
      .getQueryString();
    expect(qs).toBe("accounts?$select=name,accountnumber&$top=4");
  });

  it("encodes fetchXml", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .useFetchXml(fetchXml)
      .getQueryString();
    expect(qs).toBe(
      "accounts?fetchXml=%3Cfetch%20mapping%3D'logical'%3E%3Centity%20name%3D'account'%3E%3Cattribute%20name%3D'accountid'%2F%3E%3Cattribute%20name%3D'name'%2F%3E%3C%2Fentity%3E%3C%2Ffetch%3E",
    );
  });

  it("encodes fetchXml with special characters", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .useFetchXml(fetchXmlSpecial)
      .getQueryString();
    expect(qs).toBe(
      "accounts?fetchXml=%3Cfetch%20mapping%3D'logical'%3E%3Centity%20name%3D'account'%3E%3Cattribute%20name%3D'accountid'%2F%3E%3Cattribute%20name%3D'name'%2F%3E%3Cfilter%3E%3Ccondition%20attribute%3D%22name%22%20operator%3D%22eq%22%20value%3D%22*._-~%26apos%3B!()%2F%2B%40%3F%3D%3A%23%3B%2C%24%26amp%3B%20%25%5E%5B%5D%7B%7D%26lt%3B%26gt%3B%26quot%3B%5C%7C%60%22%20%2F%3E%3C%2Ffilter%3E%3C%2Fentity%3E%3C%2Ffetch%3E",
    );
  });

  it("uses a userQuery", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .usePredefinedQuery("userQuery", viewId)
      .getQueryString();
    expect(qs).toBe(`accounts?userQuery=${viewId}`);
  });

  it("uses a savedQuery", () => {
    const qs = XrmQuery.retrieveMultiple((x) => x.accounts)
      .usePredefinedQuery("savedQuery", viewId)
      .getQueryString();
    expect(qs).toBe(`accounts?savedQuery=${viewId}`);
  });
});
