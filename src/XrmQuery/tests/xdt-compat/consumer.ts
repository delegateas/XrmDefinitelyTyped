/**
 * Type-level compatibility check against real XrmDefinitelyTyped output.
 *
 * `typings/WebEntities.d.ts` is a verbatim XDT-generated `Account` declaration from a live org; the
 * only thing this file proves is that it compiles against the package's ambient contract and that
 * inference flows through the builder. Nothing here runs — the project is `noEmit`.
 *
 * It is a separate tsconfig because it declares `accounts` on the global merge interfaces, which
 * would collide with `tests/fixtures/entities.d.ts` in the root project.
 */

import { Filter, SortOrder, XrmQuery } from "@contextand/xrmquery";

/** Compile-time assertion that `Actual` is exactly `Expected`. */
type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
declare function expectType<Expected>(): <Actual>(
  ...args: Equals<Actual, Expected> extends true ? [Actual] : ["TYPE MISMATCH", Actual]
) => void;

const guid = "00000000-0000-0000-0000-000000000000";

/* -------------------------------------------------------------------------- */
/* retrieve: select well past the legacy 15-attribute overload cap            */
/* -------------------------------------------------------------------------- */

async function bigSelect() {
  const account = await XrmQuery.retrieve((x) => x.accounts, guid)
    .select((x) => [
      x.name,
      x.accountnumber,
      x.telephone1,
      x.telephone2,
      x.telephone3,
      x.emailaddress1,
      x.emailaddress2,
      x.emailaddress3,
      x.address1_city,
      x.address1_country,
      x.address1_postalcode,
      x.address1_line1,
      x.address1_line2,
      x.address1_line3,
      x.websiteurl,
      x.description,
      x.numberofemployees,
      x.creditonhold,
      x.msys_cvrnum,
      x.msys_accountnumber,
      x.msys_erpaccount,
      x.msys_combinedaddress,
      x.createdon,
      x.modifiedon,
    ])
    .execute();

  expectType<string | null>()(account.name);
  expectType<string | null>()(account.msys_cvrnum);
  expectType<number | null>()(account.numberofemployees);
  expectType<boolean | null>()(account.creditonhold);
  expectType<Date | null>()(account.createdon);
  // `_Fixed` members are always present.
  expectType<string>()(account["@odata.etag"]);
  expectType<string>()(account.accountid);
}

/* -------------------------------------------------------------------------- */
/* option sets, multi-property attributes, formatted values                    */
/* -------------------------------------------------------------------------- */

async function optionSetsAndFormatted() {
  const account = await XrmQuery.retrieve((x) => x.accounts, guid)
    .select((x) => [x.statecode, x.revenue, x.msys_accounttype])
    .includeFormattedValues()
    .execute();

  expectType<account_statecode | null>()(account.statecode);
  expectType<number | null>()(account.revenue);
  expectType<msys_accounttype | null>()(account.msys_accounttype);
  // `revenue` is a money field: XDT makes it carry the currency lookup along.
  expectType<string | null>()(account.transactioncurrencyid_guid);

  expectType<string | undefined>()(account.revenue_formatted);
  expectType<string | undefined>()(account.statecode_formatted);
  expectType<string | undefined>()(account.transactioncurrencyid_formatted);
}

/* -------------------------------------------------------------------------- */
/* selectMore, filter, ordering, paging                                        */
/* -------------------------------------------------------------------------- */

async function filtering() {
  const accounts = await XrmQuery.retrieveMultiple((x) => x.accounts)
    .select((x) => [x.name, x.accountnumber])
    .selectMore((x) => [x.msys_cvrnum, x.emailaddress1])
    .filter((x) =>
      Filter.ands([
        Filter.equals(x.msys_accountvalidated, true),
        Filter.startsWith(x.name, "Contoso"),
        Filter.notEquals(x.statecode, 1 as account_statecode),
        Filter.equals(x.primarycontactid_guid, Filter.makeGuid(guid)),
      ]),
    )
    .orderAsc((x) => x.name)
    .orderDesc((x) => x.createdon)
    .top(50)
    .maxPageSize(20)
    .execute();

  expectType<string | null>()(accounts[0]!.name);
  expectType<string | null>()(accounts[0]!.msys_cvrnum);
}

async function paging() {
  const query = XrmQuery.retrieveMultiple((x) => x.accounts)
    .select((x) => [x.name])
    .maxPageSize(500);

  for await (const page of query.pages()) {
    expectType<string | null>()(page[0]!.name);
  }

  const first = await query.getFirst();
  expectType<string | null | undefined>()(first?.name);
}

/* -------------------------------------------------------------------------- */
/* expand — including the intersection-typed `ownerid` polymorphic lookup       */
/* -------------------------------------------------------------------------- */

async function expanding() {
  const account = await XrmQuery.retrieve((x) => x.accounts, guid)
    .select((x) => [x.name])
    .expand(
      (x) => x.primarycontactid,
      (x) => [x.fullname, x.emailaddress1],
    )
    .expand(
      (x) => x.contact_customer_accounts,
      (x) => [x.fullname],
      { top: 10, orderBy: (s) => s.lastname, sortOrder: SortOrder.Descending },
    )
    .expand(
      (x) => x.owninguser,
      (x) => [x.domainname],
    )
    .execute();

  expectType<string | null>()(account.name);
  expectType<string | null | undefined>()(account.primarycontactid.fullname);
  expectType<string | null | undefined>()(account.contact_customer_accounts[0]!.fullname);
  expectType<string | null | undefined>()(account.owninguser.domainname);
}

/* -------------------------------------------------------------------------- */
/* related records                                                             */
/* -------------------------------------------------------------------------- */

async function related() {
  const owner = await XrmQuery.retrieveRelated(
    (x) => x.accounts,
    guid,
    (x) => x.primarycontactid,
  )
    .select((x) => [x.fullname])
    .execute();
  expectType<string | null>()(owner.fullname);

  const notes = await XrmQuery.retrieveRelatedMultiple(
    (x) => x.accounts,
    guid,
    (x) => x.Account_Annotation,
  )
    .select((x) => [x.name])
    .execute();
  expectType<string | null>()(notes[0]!.name);
}

/* -------------------------------------------------------------------------- */
/* create / update / upsert / delete, incl. `_bind$` lookups                    */
/* -------------------------------------------------------------------------- */

async function mutating() {
  const id = await XrmQuery.create((x) => x.accounts, {
    name: "Contoso A/S",
    msys_cvrnum: "12345678",
    creditonhold: false,
    primarycontactid_bind$contacts: guid,
    ownerid_bind$systemusers: guid,
    msys_SubUnion_bind$teams: guid,
  }).execute();
  expectType<string>()(id);

  await XrmQuery.update((x) => x.accounts, guid, { telephone1: "+45 12 34 56 78" }).execute();

  await XrmQuery.upsert((x) => x.accounts, { accountnumber: "ABC-123" }, { name: "Contoso" })
    .createOnly()
    .execute();

  await XrmQuery.deleteRecord((x) => x.accounts, guid).execute();

  await XrmQuery.associateSingle(
    (x) => x.accounts,
    guid,
    // Only `accounts` is declared by the pasted file, so associate over the self-referencing
    // `parentaccountid` lookup rather than inventing a second entity set.
    (x) => x.accounts,
    guid,
    (x) => x.parentaccountid,
  ).execute();

  await XrmQuery.disassociateCollection(
    (x) => x.accounts,
    guid,
    (x) => x.contact_customer_accounts,
    guid,
  ).execute();
}

/* -------------------------------------------------------------------------- */
/* alternate keys, impersonation, abort                                        */
/* -------------------------------------------------------------------------- */

async function modernExtras() {
  const controller = new AbortController();

  const account = await XrmQuery.retrieve((x) => x.accounts, { accountnumber: "ABC-123" })
    .select((x) => [x.name])
    .impersonate(guid)
    .signal(controller.signal)
    .header("Prefer", "odata.include-annotations=*")
    .execute();

  expectType<string | null>()(account.name);
}

/* -------------------------------------------------------------------------- */
/* things that must NOT compile                                                */
/* -------------------------------------------------------------------------- */

function negatives() {
  // @ts-expect-error — `nosuchattribute` is not on Account_Select.
  XrmQuery.retrieve((x) => x.accounts, guid).select((x) => [x.nosuchattribute]);

  // @ts-expect-error — Contact attributes are not on Account_Select.
  XrmQuery.retrieveMultiple((x) => x.accounts).select((x) => [x.fullname]);

  // @ts-expect-error — a select picker cannot pick from another entity's expand set.
  XrmQuery.retrieve((x) => x.accounts, guid).expand((x) => x.name);

  // @ts-expect-error — `name` is a string, not a boolean.
  XrmQuery.retrieveMultiple((x) => x.accounts).filter((x) => Filter.equals(x.name, true));

  XrmQuery.create((x) => x.accounts, {
    // @ts-expect-error — `nosuchfield` is not on Account_Create.
    nosuchfield: 1,
  });
}

export { bigSelect, optionSetsAndFormatted, filtering, paging, expanding, related, mutating };
export { modernExtras, negatives };
