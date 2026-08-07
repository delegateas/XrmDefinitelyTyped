import { describe, expect, it } from "vitest";
import { Filter, XrmQuery } from "../../src/index.js";
import { onlyRequest, useFakeFetch } from "../helpers/fakeFetch.js";

const fake = useFakeFetch();

const accountId = "SOME_ACCOUNT_GUID";
const contactId = "SOME_CONTACT_GUID";
const currencyId = "SOME_CURRENCY_GUID";
const contactName = "John Doe";
const currencyName = "US Dollars";
const contactLogicalName = "contact";
const currencyLogicalName = "transactioncurrency";
const contactNavProperty = "account_primary_contact";
const currencyNavProperty = "transactioncurrency_account";

describe("lookup attribute renaming", () => {
  it("renames _XXX_value to XXX_guid in select and in the result", async () => {
    fake.respondJson({
      _primarycontactid_value: contactId,
      _transactioncurrencyid_value: currencyId,
    });

    const result = await XrmQuery.retrieve((x) => x.accounts, accountId)
      .select((x) => [x.primarycontactid_guid, x.transactioncurrencyid_guid])
      .execute();

    const req = onlyRequest(fake);
    expect(req.method).toBe("GET");
    expect(req.url).toBe(
      `accounts(${accountId})?$select=_primarycontactid_value,_transactioncurrencyid_value`,
    );
    expect(result).toEqual({
      primarycontactid_guid: contactId,
      transactioncurrencyid_guid: currencyId,
    });
  });

  it("renames _XXX_value to XXX_guid in filter", async () => {
    fake.respondJson({ value: [] });

    await XrmQuery.retrieveMultiple((x) => x.accounts)
      .filter((x) => Filter.equals(x.primarycontactid_guid, Filter.makeGuid("test")))
      .execute();

    expect(onlyRequest(fake).url).toBe("accounts?$filter=_primarycontactid_value%20eq%20test");
  });

  it("renames _XXX_value to XXX_guid in orderby", async () => {
    fake.respondJson({ value: [] });

    await XrmQuery.retrieveMultiple((x) => x.accounts)
      .orderAsc((x) => x.primarycontactid_guid)
      .execute();

    expect(onlyRequest(fake).url).toBe("accounts?$orderby=_primarycontactid_value%20asc");
  });

  it("renames formatted value keys and asks for them", async () => {
    fake.respondJson({
      _primarycontactid_value: contactId,
      _transactioncurrencyid_value: currencyId,
      "_primarycontactid_value@OData.Community.Display.V1.FormattedValue": contactName,
      "_transactioncurrencyid_value@OData.Community.Display.V1.FormattedValue": currencyName,
    });

    const result = await XrmQuery.retrieve((x) => x.accounts, accountId)
      .select((x) => [x.primarycontactid_guid, x.transactioncurrencyid_guid])
      .includeFormattedValues()
      .execute();

    const req = onlyRequest(fake);
    expect(req.url).toBe(
      `accounts(${accountId})?$select=_primarycontactid_value,_transactioncurrencyid_value`,
    );
    expect(req.headers["prefer"]).toBe(
      'odata.include-annotations="OData.Community.Display.V1.FormattedValue"',
    );
    expect(result).toEqual({
      primarycontactid_guid: contactId,
      primarycontactid_formatted: contactName,
      transactioncurrencyid_guid: currencyId,
      transactioncurrencyid_formatted: currencyName,
    });
  });

  it("renames formatted and lookup-property keys", async () => {
    fake.respondJson({
      _primarycontactid_value: contactId,
      _transactioncurrencyid_value: currencyId,
      "_primarycontactid_value@OData.Community.Display.V1.FormattedValue": contactName,
      "_primarycontactid_value@Microsoft.Dynamics.CRM.lookuplogicalname": contactLogicalName,
      "_primarycontactid_value@Microsoft.Dynamics.CRM.associatednavigationproperty":
        contactNavProperty,
      "_transactioncurrencyid_value@OData.Community.Display.V1.FormattedValue": currencyName,
      "_transactioncurrencyid_value@Microsoft.Dynamics.CRM.lookuplogicalname": currencyLogicalName,
      "_transactioncurrencyid_value@Microsoft.Dynamics.CRM.associatednavigationproperty":
        currencyNavProperty,
    });

    const result = await XrmQuery.retrieve((x) => x.accounts, accountId)
      .select((x) => [x.primarycontactid_guid, x.transactioncurrencyid_guid])
      .includeFormattedValuesAndLookupProperties()
      .execute();

    const req = onlyRequest(fake);
    expect(req.headers["prefer"]).toBe('odata.include-annotations="*"');
    expect(result).toEqual({
      primarycontactid_guid: contactId,
      primarycontactid_formatted: contactName,
      primarycontactid_lookuplogicalname: contactLogicalName,
      primarycontactid_navigationproperty: contactNavProperty,
      transactioncurrencyid_guid: currencyId,
      transactioncurrencyid_formatted: currencyName,
      transactioncurrencyid_lookuplogicalname: currencyLogicalName,
      transactioncurrencyid_navigationproperty: currencyNavProperty,
    });
  });

  it("parses ISO dates into Date objects", async () => {
    fake.respondJson({ createdon: "2020-01-02T03:04:05Z", name: "not a date" });

    const result = await XrmQuery.retrieve((x) => x.accounts, accountId)
      .select((x) => [x.createdon, x.name])
      .execute();

    expect(result.createdon).toBeInstanceOf(Date);
    expect((result.createdon as Date).toISOString()).toBe("2020-01-02T03:04:05.000Z");
    expect(result.name).toBe("not a date");
  });
});
