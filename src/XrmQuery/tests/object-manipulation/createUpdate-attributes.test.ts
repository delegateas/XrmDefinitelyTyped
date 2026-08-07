import { describe, expect, it } from "vitest";
import { XrmQuery } from "../../src/index.js";
import { onlyRequest, useFakeFetch } from "../helpers/fakeFetch.js";

const fake = useFakeFetch();

describe("create/update/associate requests", () => {
  it("creates a record and returns the id from the OData-EntityId header", async () => {
    const relatedAccountId = "SOME_ACCOUNT_GUID";
    const newAccountId = "00000000-0000-0000-0000-000000000000";

    fake.respondWith({
      status: 204,
      headers: {
        "OData-EntityId": `https://organization.tld/api/data/v9.0/accounts(${newAccountId})`,
      },
    });

    const id = await XrmQuery.create((x) => x.accounts, {
      parentaccountid_bind$accounts: relatedAccountId,
    }).execute();

    const req = onlyRequest(fake);
    expect(req.method).toBe("POST");
    expect(req.url).toBe("accounts");
    expect(JSON.parse(req.body!)).toEqual({
      "parentaccountid@odata.bind": `/accounts(${relatedAccountId})`,
    });
    expect(id).toBe(newAccountId);
  });

  it("deletes a record without a body", async () => {
    fake.respondWith({ status: 204 });

    await XrmQuery.deleteRecord((x) => x.accounts, "SOME_ACCOUNT_GUID").execute();

    const req = onlyRequest(fake);
    expect(req.method).toBe("DELETE");
    expect(req.url).toBe("accounts(SOME_ACCOUNT_GUID)");
    expect(req.body).toBeUndefined();
  });

  it("updates a record", async () => {
    const accountId = "SOME_ACCOUNT_GUID";
    const newAccountId = "SOME_NEW_ACCOUNT_GUID";
    fake.respondWith({ status: 204 });

    await XrmQuery.update((x) => x.accounts, accountId, {
      parentaccountid_bind$accounts: newAccountId,
    }).execute();

    const req = onlyRequest(fake);
    expect(req.method).toBe("PATCH");
    expect(req.url).toBe(`accounts(${accountId})`);
    expect(JSON.parse(req.body!)).toEqual({
      "parentaccountid@odata.bind": `/accounts(${newAccountId})`,
    });
  });

  it("associates over a single-valued navigation property", async () => {
    const contactId = "SOME_CONTACT_GUID";
    const targetId = "SOME_ACCOUNT_GUID";
    fake.respondWith({ status: 204 });

    await XrmQuery.associateSingle(
      (x) => x.contacts,
      contactId,
      (x) => x.accounts,
      targetId,
      (x) => x.parentcustomerid_account,
    ).execute();

    const req = onlyRequest(fake);
    expect(req.method).toBe("PUT");
    expect(req.url).toBe(`contacts(${contactId})/parentcustomerid_account/$ref`);
    expect(JSON.parse(req.body!)).toEqual({ "@odata.id": `accounts(${targetId})` });
  });

  it("associates over a collection-valued navigation property", async () => {
    const accountId = "SOME_ACCOUNT_GUID";
    const targetId = "SOME_CONTACT_GUID";
    fake.respondWith({ status: 204 });

    await XrmQuery.associateCollection(
      (x) => x.accounts,
      accountId,
      (x) => x.contacts,
      targetId,
      (x) => x.dg_account_contact,
    ).execute();

    const req = onlyRequest(fake);
    expect(req.method).toBe("POST");
    expect(req.url).toBe(`accounts(${accountId})/dg_account_contact/$ref`);
    expect(JSON.parse(req.body!)).toEqual({ "@odata.id": `contacts(${targetId})` });
  });

  it("disassociates over a single-valued navigation property", async () => {
    const contactId = "SOME_CONTACT_GUID";
    fake.respondWith({ status: 204 });

    await XrmQuery.disassociateSingle(
      (x) => x.contacts,
      contactId,
      (x) => x.parentcustomerid_account,
    ).execute();

    const req = onlyRequest(fake);
    expect(req.method).toBe("DELETE");
    expect(req.url).toBe(`contacts(${contactId})/parentcustomerid_account/$ref`);
    expect(req.body).toBeUndefined();
  });

  it("disassociates over a collection-valued navigation property", async () => {
    const accountId = "SOME_ACCOUNT_GUID";
    const targetId = "SOME_CONTACT_GUID";
    fake.respondWith({ status: 204 });

    await XrmQuery.disassociateCollection(
      (x) => x.accounts,
      accountId,
      (x) => x.dg_account_contact,
      targetId,
    ).execute();

    const req = onlyRequest(fake);
    expect(req.method).toBe("DELETE");
    expect(req.url).toBe(`accounts(${accountId})/dg_account_contact(${targetId})/$ref`);
    expect(req.body).toBeUndefined();
  });
});
