import { describe, expect, it } from "vitest";
import { XrmQuery } from "../../src/index.js";
import { onlyRequest, useFakeFetch } from "../helpers/fakeFetch.js";

const fake = useFakeFetch();

describe("getFirst and the promise aliases", () => {
  it("gets the first record", async () => {
    fake.respondJson({ value: [{ accountnumber: 1 }] });

    const result = await XrmQuery.retrieveMultiple((x) => x.accounts).getFirst();

    expect(onlyRequest(fake).url).toBe("accounts?$top=1");
    expect(result).toEqual({ accountnumber: 1 });
  });

  it("resolves with null when there is no first record", async () => {
    fake.respondJson({ value: [] });

    const result = await XrmQuery.retrieveMultiple((x) => x.accounts).getFirst();

    expect(onlyRequest(fake).url).toBe("accounts?$top=1");
    expect(result).toBeNull();
  });

  it("keeps promise() as an alias of execute()", async () => {
    fake.respondJson({ value: [{ accountnumber: 1 }] });

    const result = await XrmQuery.retrieveMultiple((x) => x.accounts).promise();

    expect(onlyRequest(fake).url).toBe("accounts");
    expect(result).toEqual([{ accountnumber: 1 }]);
  });

  it("keeps promiseFirst() as an alias of getFirst()", async () => {
    fake.respondJson({ value: [{ accountnumber: 1 }] });

    const result = await XrmQuery.retrieveMultiple((x) => x.accounts).promiseFirst();

    expect(onlyRequest(fake).url).toBe("accounts?$top=1");
    expect(result).toEqual({ accountnumber: 1 });
  });

  it("returns every record with all()", async () => {
    fake.respondJson({ value: [{ accountnumber: 1 }, { accountnumber: 2 }] });

    const result = await XrmQuery.retrieveMultiple((x) => x.accounts).all();

    expect(result).toHaveLength(2);
  });
});
