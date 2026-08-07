/**
 * A hand-written stand-in for XrmDefinitelyTyped output.
 *
 * The shapes here mirror what XDT generates (`<Entity>_Select`, `_Filter`, `_Expand`, `_Fixed`,
 * `_Result`, `_FormattedResult`, `_Create`, `_Update`, `_RelatedOne`, `_RelatedMany`) and merge into
 * the ambient interfaces the package declares. If this file type-checks against the package without
 * a single `/// <reference>`, so does real generated output.
 *
 * Only the entities and attributes the ported upstream tests touch are declared, plus a wide
 * `Account_Select` so the variadic `select` can be exercised past the legacy 15-attribute cap.
 */

interface Account_Select {
  accountid: WebAttribute<Account_Select, { accountid: string }, object>;
  name: WebAttribute<Account_Select, { name: string | null }, object>;
  accountnumber: WebAttribute<Account_Select, { accountnumber: string | null }, object>;
  address1_city: WebAttribute<Account_Select, { address1_city: string | null }, object>;
  address1_line1: WebAttribute<Account_Select, { address1_line1: string | null }, object>;
  address1_line2: WebAttribute<Account_Select, { address1_line2: string | null }, object>;
  address1_line3: WebAttribute<Account_Select, { address1_line3: string | null }, object>;
  address1_country: WebAttribute<Account_Select, { address1_country: string | null }, object>;
  address1_postalcode: WebAttribute<Account_Select, { address1_postalcode: string | null }, object>;
  address2_city: WebAttribute<Account_Select, { address2_city: string | null }, object>;
  address2_line1: WebAttribute<Account_Select, { address2_line1: string | null }, object>;
  address2_line2: WebAttribute<Account_Select, { address2_line2: string | null }, object>;
  address2_line3: WebAttribute<Account_Select, { address2_line3: string | null }, object>;
  address2_country: WebAttribute<Account_Select, { address2_country: string | null }, object>;
  address2_postalcode: WebAttribute<Account_Select, { address2_postalcode: string | null }, object>;
  emailaddress1: WebAttribute<Account_Select, { emailaddress1: string | null }, object>;
  telephone1: WebAttribute<Account_Select, { telephone1: string | null }, object>;
  websiteurl: WebAttribute<Account_Select, { websiteurl: string | null }, object>;
  description: WebAttribute<Account_Select, { description: string | null }, object>;
  createdon: WebAttribute<
    Account_Select,
    { createdon: Date | null },
    { createdon_formatted: string }
  >;
  revenue: WebAttribute<Account_Select, { revenue: number | null }, { revenue_formatted: string }>;
  /** An attribute whose name merely *contains* `_guid` — must not be rewritten to `_value`. */
  dg_somestringwith_guids: WebAttribute<
    Account_Select,
    { dg_somestringwith_guids: string | null },
    object
  >;
  dg_test_med_underscore: WebAttribute<
    Account_Select,
    { dg_test_med_underscore: string | null },
    object
  >;
  primarycontactid_guid: WebAttribute<
    Account_Select,
    { primarycontactid_guid: string | null },
    { primarycontactid_formatted: string }
  >;
  transactioncurrencyid_guid: WebAttribute<
    Account_Select,
    { transactioncurrencyid_guid: string | null },
    { transactioncurrencyid_formatted: string }
  >;
  parentaccountid_guid: WebAttribute<
    Account_Select,
    { parentaccountid_guid: string | null },
    { parentaccountid_formatted: string }
  >;
  ownerid_guid: WebAttribute<
    Account_Select,
    { ownerid_guid: string | null },
    { ownerid_formatted: string }
  >;
  owningbusinessunit_guid: WebAttribute<
    Account_Select,
    { owningbusinessunit_guid: string | null },
    { owningbusinessunit_formatted: string }
  >;
}

interface Account_Filter {
  accountid: XQW.Guid;
  name: string;
  accountnumber: string;
  address1_city: string;
  dg_test_med_underscore: string;
  emailaddress1: string;
  revenue: number;
  createdon: Date;
  primarycontactid_guid: XQW.Guid;
  parentaccountid_guid: XQW.Guid;
  ownerid_guid: XQW.Guid;
  owningbusinessunit_guid: XQW.Guid;
}

interface Account_Expand {
  contact_customer_accounts: WebExpand<
    Account_Expand,
    Contact_Select,
    Contact_Filter,
    { contact_customer_accounts: Contact_Result[] }
  >;
  primarycontactid: WebExpand<
    Account_Expand,
    Contact_Select,
    Contact_Filter,
    { primarycontactid: Contact_Result }
  >;
}

interface Account_Fixed {
  accountid: string;
}

interface Account_Result extends Account_Fixed {
  name: string | null;
  accountnumber: string | null;
}

interface Account_FormattedResult {
  revenue_formatted: string;
}

interface Account_Create {
  name?: string;
  accountnumber?: string;
  revenue?: number;
  parentaccountid_bind$accounts?: string;
  primarycontactid_bind$contacts?: string;
}

interface Account_Update extends Account_Create {}

interface Account_RelatedOne {
  primarycontactid: WebMappingRetrieve<
    Contact_Select,
    Contact_Expand,
    Contact_Filter,
    Contact_Fixed,
    Contact_Result,
    Contact_FormattedResult
  >;
  parentaccountid: WebMappingRetrieve<
    Account_Select,
    Account_Expand,
    Account_Filter,
    Account_Fixed,
    Account_Result,
    Account_FormattedResult
  >;
}

interface Account_RelatedMany {
  contact_customer_accounts: WebMappingRetrieve<
    Contact_Select,
    Contact_Expand,
    Contact_Filter,
    Contact_Fixed,
    Contact_Result,
    Contact_FormattedResult
  >;
  dg_account_contact: WebMappingRetrieve<
    Contact_Select,
    Contact_Expand,
    Contact_Filter,
    Contact_Fixed,
    Contact_Result,
    Contact_FormattedResult
  >;
  account_master_account: WebMappingRetrieve<
    Account_Select,
    Account_Expand,
    Account_Filter,
    Account_Fixed,
    Account_Result,
    Account_FormattedResult
  >;
}

interface Contact_Select {
  contactid: WebAttribute<Contact_Select, { contactid: string }, object>;
  fullname: WebAttribute<Contact_Select, { fullname: string | null }, object>;
  firstname: WebAttribute<Contact_Select, { firstname: string | null }, object>;
  lastname: WebAttribute<Contact_Select, { lastname: string | null }, object>;
  emailaddress1: WebAttribute<Contact_Select, { emailaddress1: string | null }, object>;
  parentcustomerid_guid: WebAttribute<
    Contact_Select,
    { parentcustomerid_guid: string | null },
    { parentcustomerid_formatted: string }
  >;
}

interface Contact_Filter {
  contactid: XQW.Guid;
  fullname: string;
  firstname: string;
  lastname: string;
  emailaddress1: string;
  parentcustomerid_guid: XQW.Guid;
}

interface Contact_Expand {
  dg_TestAccount: WebExpand<
    Contact_Expand,
    Account_Select,
    Account_Filter,
    { dg_TestAccount: Account_Result }
  >;
  contact_customer_contacts: WebExpand<
    Contact_Expand,
    Contact_Select,
    Contact_Filter,
    { contact_customer_contacts: Contact_Result[] }
  >;
}

interface Contact_Fixed {
  contactid: string;
}

interface Contact_Result extends Contact_Fixed {
  fullname: string | null;
  firstname: string | null;
}

interface Contact_FormattedResult {
  parentcustomerid_formatted: string;
}

interface Contact_Create {
  firstname?: string;
  lastname?: string;
  parentcustomerid_bind$accounts?: string;
}

interface Contact_Update extends Contact_Create {}

interface Contact_RelatedOne {
  parentcustomerid_account: WebMappingRetrieve<
    Account_Select,
    Account_Expand,
    Account_Filter,
    Account_Fixed,
    Account_Result,
    Account_FormattedResult
  >;
}

interface Contact_RelatedMany {
  contact_customer_contacts: WebMappingRetrieve<
    Contact_Select,
    Contact_Expand,
    Contact_Filter,
    Contact_Fixed,
    Contact_Result,
    Contact_FormattedResult
  >;
}

interface WebEntitiesRetrieve {
  accounts: WebMappingRetrieve<
    Account_Select,
    Account_Expand,
    Account_Filter,
    Account_Fixed,
    Account_Result,
    Account_FormattedResult
  >;
  contacts: WebMappingRetrieve<
    Contact_Select,
    Contact_Expand,
    Contact_Filter,
    Contact_Fixed,
    Contact_Result,
    Contact_FormattedResult
  >;
}

interface WebEntitiesRelated {
  accounts: WebMappingRelated<Account_RelatedOne, Account_RelatedMany>;
  contacts: WebMappingRelated<Contact_RelatedOne, Contact_RelatedMany>;
}

interface WebEntitiesCUDA {
  accounts: WebMappingCUDA<Account_Create, Account_Update, Account_Select>;
  contacts: WebMappingCUDA<Contact_Create, Contact_Update, Contact_Select>;
}
