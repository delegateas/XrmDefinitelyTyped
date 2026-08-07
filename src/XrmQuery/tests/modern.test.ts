/** The surface that did not exist in the legacy library: upsert, actions/functions and $batch. */

import { describe, expect, it } from "vitest";
import { XrmQuery } from "../src/index.js";
import { onlyRequest, useFakeFetch } from "./helpers/fakeFetch.js";

const fake = useFakeFetch();

describe("upsert", () => {
  it("patches an alternate key and returns the created id", async () => {
    const newId = "00000000-0000-0000-0000-000000000001";
    fake.respondWith({
      status: 204,
      headers: { "OData-EntityId": `https://organization.tld/api/data/v9.2/accounts(${newId})` },
    });

    const id = await XrmQuery.upsert(
      (x) => x.accounts,
      { accountnumber: "ABC" },
      { name: "Acme" },
    ).execute();

    const req = onlyRequest(fake);
    expect(req.method).toBe("PATCH");
    expect(req.url).toBe("accounts(accountnumber='ABC')");
    expect(JSON.parse(req.body!)).toEqual({ name: "Acme" });
    expect(id).toBe(newId);
  });

  it("resolves undefined when the record already existed", async () => {
    fake.respondWith({ status: 204 });

    const id = await XrmQuery.upsert((x) => x.accounts, "SOME_ID", { name: "Acme" }).execute();

    expect(id).toBeUndefined();
  });

  it("restricts to update-only and create-only", async () => {
    fake.respondWith({ status: 204 });
    await XrmQuery.upsert((x) => x.accounts, "SOME_ID", { name: "a" })
      .updateOnly()
      .execute();
    expect(onlyRequest(fake).headers["if-match"]).toBe("*");

    fake.respondWith({ status: 204 });
    await XrmQuery.upsert((x) => x.accounts, "SOME_ID", { name: "a" })
      .createOnly()
      .execute();
    expect(fake.requests[1].headers["if-none-match"]).toBe("*");
  });
});

describe("actions and functions", () => {
  it("posts an unbound action", async () => {
    fake.respondJson({ Result: 42 });

    const result = await XrmQuery.action<{ Result: number }>("WinOpportunity", {
      Status: 3,
    }).execute();

    const req = onlyRequest(fake);
    expect(req.method).toBe("POST");
    expect(req.url).toBe("WinOpportunity");
    expect(JSON.parse(req.body!)).toEqual({ Status: 3 });
    expect(result).toEqual({ Result: 42 });
  });

  it("posts a bound action", async () => {
    fake.respondWith({ status: 204 });

    await XrmQuery.action(
      "Merge",
      { Discard: true },
      { entitySet: "accounts", id: "ID" },
    ).execute();

    expect(onlyRequest(fake).url).toBe("accounts(ID)/Microsoft.Dynamics.CRM.Merge");
  });

  it("gets an unbound function with inline parameters", async () => {
    fake.respondJson({ UserId: "U" });

    const result = await XrmQuery.function<{ UserId: string }>("WhoAmI").execute();

    expect(onlyRequest(fake).url).toBe("WhoAmI()");
    expect(result).toEqual({ UserId: "U" });
  });

  it("renders function parameters as literals", async () => {
    fake.respondJson({});

    await XrmQuery.function("GetTimeZoneCodeByLocalizedName", {
      LocalizedStandardName: "Romance Standard Time",
      LocaleId: 1033,
    }).execute();

    expect(onlyRequest(fake).url).toBe(
      "GetTimeZoneCodeByLocalizedName(LocalizedStandardName='Romance%20Standard%20Time',LocaleId=1033)",
    );
  });
});

describe("$batch", () => {
  it("packs reads standalone and mutations into a changeset", async () => {
    const boundary = "batchresponse_1";
    const newId = "00000000-0000-0000-0000-000000000002";
    fake.respondWith({
      status: 200,
      headers: { "Content-Type": `multipart/mixed;boundary=${boundary}` },
      body: [
        `--${boundary}`,
        "Content-Type: application/http",
        "Content-Transfer-Encoding: binary",
        "",
        "HTTP/1.1 200 OK",
        "Content-Type: application/json; odata.metadata=minimal",
        "",
        JSON.stringify({ value: [{ name: "Acme" }] }),
        "",
        `--${boundary}`,
        "Content-Type: multipart/mixed;boundary=changesetresponse_1",
        "",
        "--changesetresponse_1",
        "Content-Type: application/http",
        "Content-Transfer-Encoding: binary",
        "",
        "HTTP/1.1 204 No Content",
        `OData-EntityId: https://organization.tld/api/data/v9.2/accounts(${newId})`,
        "",
        "",
        "--changesetresponse_1--",
        "",
        `--${boundary}--`,
        "",
      ].join("\r\n"),
    });

    const read = XrmQuery.retrieveMultiple((x) => x.accounts).select((x) => [x.name]);
    const create = XrmQuery.create((x) => x.accounts, { name: "Acme" });

    const [accounts, createdId] = await XrmQuery.batch([read, create]).execute();

    const req = onlyRequest(fake);
    expect(req.method).toBe("POST");
    expect(req.url).toBe("$batch");
    expect(req.headers["content-type"]).toMatch(/^multipart\/mixed;boundary=batch_/);
    expect(req.body).toContain("GET accounts?$select=name HTTP/1.1");
    expect(req.body).toContain("POST accounts HTTP/1.1");
    expect(req.body).toContain("Content-ID: 1");
    expect(req.body).toMatch(/Content-Type: multipart\/mixed;boundary=changeset_/);

    expect(accounts).toEqual([{ name: "Acme" }]);
    expect(createdId).toBe(newId);
  });
});
