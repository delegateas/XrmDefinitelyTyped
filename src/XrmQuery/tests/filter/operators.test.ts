import { describe, expect, it } from "vitest";
import { Filter, XrmQuery } from "../../src/index.js";

/** Builds the query string of an accounts query carrying only the given filter. */
function filterOf(build: (x: Account_Filter) => WebFilter): string {
  return XrmQuery.retrieveMultiple((x) => x.accounts)
    .filter(build)
    .getQueryString()
    .replace("accounts?$filter=", "");
}

describe("Filter operators", () => {
  it("compares", () => {
    expect(filterOf((x) => Filter.equals(x.name, "a"))).toBe("name eq 'a'");
    expect(filterOf((x) => Filter.notEquals(x.name, "a"))).toBe("name ne 'a'");
    expect(filterOf((x) => Filter.greaterThan(x.revenue, 5))).toBe("revenue gt 5");
    expect(filterOf((x) => Filter.greaterThanOrEqual(x.revenue, 5))).toBe("revenue ge 5");
    expect(filterOf((x) => Filter.lessThan(x.revenue, 5))).toBe("revenue lt 5");
    expect(filterOf((x) => Filter.lessThanOrEqual(x.revenue, 5))).toBe("revenue le 5");
  });

  it("renders string functions", () => {
    expect(filterOf((x) => Filter.startsWith(x.name, "a"))).toBe("startswith(name, 'a')");
    expect(filterOf((x) => Filter.contains(x.name, "a"))).toBe("contains(name, 'a')");
    expect(filterOf((x) => Filter.endsWith(x.name, "a"))).toBe("endswith(name, 'a')");
  });

  it("combines filters", () => {
    expect(
      filterOf((x) => Filter.or(Filter.equals(x.name, "a"), Filter.equals(x.accountnumber, "b"))),
    ).toBe("(name eq 'a' or accountnumber eq 'b')");

    expect(filterOf((x) => Filter.not(Filter.equals(x.name, "a")))).toBe("not name eq 'a'");
  });

  it("folds a list of filters with ands/ors", () => {
    expect(
      filterOf((x) =>
        Filter.ands([
          Filter.equals(x.name, "a"),
          Filter.equals(x.accountnumber, "b"),
          Filter.equals(x.address1_city, "c"),
        ]),
      ),
    ).toBe("(name eq 'a' and (accountnumber eq 'b' and address1_city eq 'c'))");

    expect(
      filterOf((x) =>
        Filter.ors([
          Filter.equals(x.name, "a"),
          Filter.equals(x.accountnumber, "b"),
          Filter.equals(x.address1_city, "c"),
        ]),
      ),
    ).toBe("(name eq 'a' or (accountnumber eq 'b' or address1_city eq 'c'))");
  });

  it("leaves guids unquoted", () => {
    expect(filterOf((x) => Filter.equals(x.accountid, Filter.makeGuid("{SOME-GUID}")))).toBe(
      "accountid eq SOME-GUID",
    );
  });

  it("renders null and dates", () => {
    expect(filterOf((x) => Filter.equals<string | null>(x.name, null))).toBe("name eq null");
    expect(filterOf((x) => Filter.greaterThan(x.createdon, new Date("2020-01-02T03:04:05Z")))).toBe(
      "createdon gt 2020-01-02T03:04:05.000Z",
    );
  });
});
