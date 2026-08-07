import { describe, expect, it } from "vitest";
import {
  XrmQuery,
  XrmQueryError,
  configure,
  getApiUrl,
  setApiUrl,
  setApiVersion,
} from "../src/index.js";
import { onlyRequest, useFakeFetch } from "./helpers/fakeFetch.js";

const fake = useFakeFetch();

describe("transport", () => {
  it("sends the standard OData headers", async () => {
    fake.respondJson({ value: [] });
    await XrmQuery.retrieveMultiple((x) => x.accounts).execute();

    const { headers } = onlyRequest(fake);
    expect(headers["accept"]).toBe("application/json");
    expect(headers["odata-maxversion"]).toBe("4.0");
    expect(headers["odata-version"]).toBe("4.0");
    expect(headers["content-type"]).toBe("application/json; charset=utf-8");
  });

  it("adds per-request and configured headers", async () => {
    configure({ headers: { "x-global": "1" } });
    fake.respondJson({ value: [] });

    await XrmQuery.retrieveMultiple((x) => x.accounts)
      .header("x-request", "2")
      .execute();

    const { headers } = onlyRequest(fake);
    expect(headers["x-global"]).toBe("1");
    expect(headers["x-request"]).toBe("2");
  });

  it("impersonates per request and globally", async () => {
    fake.respondJson({ value: [] });
    await XrmQuery.retrieveMultiple((x) => x.accounts)
      .impersonate("{SOME-USER-GUID}")
      .execute();
    expect(onlyRequest(fake).headers["mscrmcallerid"]).toBe("SOME-USER-GUID");

    configure({ callerId: "GLOBAL-USER" });
    fake.respondJson({ value: [] });
    await XrmQuery.retrieveMultiple((x) => x.accounts).execute();
    expect(fake.requests[1].headers["mscrmcallerid"]).toBe("GLOBAL-USER");
  });

  it("threads an AbortSignal into fetch", async () => {
    const controller = new AbortController();
    controller.abort(new Error("nope"));

    await expect(
      XrmQuery.retrieveMultiple((x) => x.accounts)
        .signal(controller.signal)
        .execute(),
    ).rejects.toThrow("nope");
    expect(fake.requests).toHaveLength(0);
  });

  it("maps an OData error response onto XrmQueryError", async () => {
    fake.respondWith({
      status: 404,
      body: JSON.stringify({ error: { code: "0x80040217", message: "Does not exist" } }),
    });

    const error = await XrmQuery.retrieve((x) => x.accounts, "MISSING")
      .execute()
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(XrmQueryError);
    const xrmError = error as XrmQueryError;
    expect(xrmError.status).toBe(404);
    expect(xrmError.errorCode).toBe("0x80040217");
    expect(xrmError.message).toBe("Does not exist");
    expect(xrmError.method).toBe("GET");
    expect(xrmError.url).toBe("accounts(MISSING)");
  });

  it("keeps a non-JSON error body verbatim", async () => {
    fake.respondWith({ status: 500, body: "<html>boom</html>" });

    const error = (await XrmQuery.retrieveMultiple((x) => x.accounts)
      .execute()
      .catch((e: unknown) => e)) as XrmQueryError;

    expect(error.status).toBe(500);
    expect(error.body).toBe("<html>boom</html>");
    expect(error.errorCode).toBeUndefined();
  });
});

describe("configuration", () => {
  it("builds the api url from the version when no base url is set", () => {
    setApiUrl(null);
    expect(getApiUrl()).toBe("/api/data/v9.2/");
    setApiVersion("9.1");
    expect(getApiUrl()).toBe("/api/data/v9.1/");
  });

  it("uses an explicit base url", () => {
    setApiUrl("https://org.crm4.dynamics.com/api/data/v9.2/");
    expect(getApiUrl()).toBe("https://org.crm4.dynamics.com/api/data/v9.2/");
  });

  it("prefixes requests with the configured base url", async () => {
    configure({ baseUrl: "https://org.crm4.dynamics.com/api/data/v9.2/" });
    fake.respondJson({ value: [] });

    await XrmQuery.retrieveMultiple((x) => x.accounts)
      .select((x) => [x.name])
      .execute();

    expect(onlyRequest(fake).url).toBe(
      "https://org.crm4.dynamics.com/api/data/v9.2/accounts?$select=name",
    );
  });
});
