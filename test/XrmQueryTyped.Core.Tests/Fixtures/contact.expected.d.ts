declare namespace XDT {
  interface Contact_Fixed {
    contactid: string;
  }
  interface Contact_Result extends Contact_Fixed {
    account_primary_contact?: Account_Result[] | null;
    creditlimit: number | null;
    fullname: string | null;
    parentcustomerid_account?: Account_Result | null;
    parentcustomerid_contact?: Contact_Result | null;
    parentcustomerid_guid: string | null;
    transactioncurrencyid_guid: string | null;
  }
  interface Contact_FormattedResult {
    creditlimit_formatted?: string;
    parentcustomerid_formatted?: string;
    transactioncurrencyid_formatted?: string;
  }
  interface Contact_Select {
    contactid: WebAttribute<Contact_Select, { contactid: string | null }, object>;
    creditlimit: WebAttribute<Contact_Select, { creditlimit: number | null; transactioncurrencyid_guid: string | null }, { creditlimit_formatted?: string; transactioncurrencyid_formatted?: string }>;
    fullname: WebAttribute<Contact_Select, { fullname: string | null }, object>;
    parentcustomerid_guid: WebAttribute<Contact_Select, { parentcustomerid_guid: string | null }, { parentcustomerid_formatted?: string }>;
  }
  interface Contact_Filter {
    contactid: XQW.Guid;
    creditlimit: number;
    fullname: string;
    parentcustomerid_guid: XQW.Guid;
  }
  interface Contact_Expand {
    account_primary_contact: WebExpand<Contact_Expand, Account_Select, Account_Filter, { account_primary_contact: Account_Result[] }>;
    parentcustomerid_account: WebExpand<Contact_Expand, Account_Select, Account_Filter, { parentcustomerid_account: Account_Result }>;
    parentcustomerid_contact: WebExpand<Contact_Expand, Contact_Select, Contact_Filter, { parentcustomerid_contact: Contact_Result }>;
  }
  interface Contact_Create {
    contactid?: string | null;
    creditlimit?: number | null;
    parentcustomerid_account_bind$accounts?: string | null;
    parentcustomerid_contact_bind$contacts?: string | null;
  }
  interface Contact_Update {
    creditlimit?: number | null;
    parentcustomerid_account_bind$accounts?: string | null;
    parentcustomerid_contact_bind$contacts?: string | null;
  }
  interface Contact_RelatedOne {
    parentcustomerid_account: WebMappingRetrieve<Account_Select, Account_Expand, Account_Filter, Account_Fixed, Account_Result, Account_FormattedResult>;
    parentcustomerid_contact: WebMappingRetrieve<Contact_Select, Contact_Expand, Contact_Filter, Contact_Fixed, Contact_Result, Contact_FormattedResult>;
  }
  interface Contact_RelatedMany {
    account_primary_contact: WebMappingRetrieve<Account_Select, Account_Expand, Account_Filter, Account_Fixed, Account_Result, Account_FormattedResult>;
  }
}
interface WebEntitiesRetrieve {
  contacts: WebMappingRetrieve<XDT.Contact_Select, XDT.Contact_Expand, XDT.Contact_Filter, XDT.Contact_Fixed, XDT.Contact_Result, XDT.Contact_FormattedResult>;
}

interface WebEntitiesRelated {
  contacts: WebMappingRelated<XDT.Contact_RelatedOne, XDT.Contact_RelatedMany>;
}

interface WebEntitiesCUDA {
  contacts: WebMappingCUDA<XDT.Contact_Create, XDT.Contact_Update, XDT.Contact_Select>;
}
