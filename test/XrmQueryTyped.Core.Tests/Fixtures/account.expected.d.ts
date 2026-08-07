declare namespace XDT {
  interface Account_Fixed {
    accountid: string;
  }
  interface Account_Result extends Account_Fixed {
    accountcategorycode: account_accountcategorycode | null;
    contact_customer_accounts?: Contact_Result[] | null;
    createdon: Date | null;
    merged: boolean | null;
    name: string | null;
    navigationPropertyNameNotDefined?: Account_Result[] | null;
    ownerid_guid: string | null;
    parentaccountid_guid: string | null;
    primarycontactid_guid: string | null;
    revenue: number | null;
    transactioncurrencyid_guid: string | null;
  }
  interface Account_FormattedResult {
    accountcategorycode_formatted?: string;
    createdon_formatted?: string;
    ownerid_formatted?: string;
    parentaccountid_formatted?: string;
    primarycontactid_formatted?: string;
    revenue_formatted?: string;
    transactioncurrencyid_formatted?: string;
  }
  interface Account_Select {
    accountcategorycode: WebAttribute<Account_Select, { accountcategorycode: account_accountcategorycode | null }, { accountcategorycode_formatted?: string }>;
    accountid: WebAttribute<Account_Select, { accountid: string | null }, object>;
    createdon: WebAttribute<Account_Select, { createdon: Date | null }, { createdon_formatted?: string }>;
    merged: WebAttribute<Account_Select, { merged: boolean | null }, object>;
    name: WebAttribute<Account_Select, { name: string | null }, object>;
    ownerid_guid: WebAttribute<Account_Select, { ownerid_guid: string | null }, { ownerid_formatted?: string }>;
    parentaccountid_guid: WebAttribute<Account_Select, { parentaccountid_guid: string | null }, { parentaccountid_formatted?: string }>;
    primarycontactid_guid: WebAttribute<Account_Select, { primarycontactid_guid: string | null }, { primarycontactid_formatted?: string }>;
    revenue: WebAttribute<Account_Select, { revenue: number | null; transactioncurrencyid_guid: string | null }, { revenue_formatted?: string; transactioncurrencyid_formatted?: string }>;
  }
  interface Account_Filter {
    accountcategorycode: account_accountcategorycode;
    accountid: XQW.Guid;
    createdon: Date;
    merged: boolean;
    name: string;
    ownerid_guid: XQW.Guid;
    parentaccountid_guid: XQW.Guid;
    primarycontactid_guid: XQW.Guid;
    revenue: number;
  }
  interface Account_Expand {
    contact_customer_accounts: WebExpand<Account_Expand, Contact_Select, Contact_Filter, { contact_customer_accounts: Contact_Result[] }>;
    navigationPropertyNameNotDefined: WebExpand<Account_Expand, Account_Select, Account_Filter, { navigationPropertyNameNotDefined: Account_Result[] }>;
    navigationPropertyNameNotDefined1: WebExpand<Account_Expand, Account_Select, Account_Filter, { navigationPropertyNameNotDefined: Account_Result[] }>;
    ownerid: WebExpand<Account_Expand, Team_Select, Team_Filter, { ownerid: Team_Result }> & WebExpand<Account_Expand, SystemUser_Select, SystemUser_Filter, { ownerid: SystemUser_Result }>;
    parentaccountid: WebExpand<Account_Expand, Account_Select, Account_Filter, { parentaccountid: Account_Result }>;
    primarycontactid: WebExpand<Account_Expand, Contact_Select, Contact_Filter, { primarycontactid: Contact_Result }>;
  }
  interface Account_Create {
    accountcategorycode?: account_accountcategorycode | null;
    accountid?: string | null;
    name?: string | null;
    ownerid_bind$systemusers?: string | null;
    ownerid_bind$teams?: string | null;
    parentaccountid_bind$accounts?: string | null;
    primarycontactid_bind$contacts?: string | null;
    revenue?: number | null;
  }
  interface Account_Update {
    accountcategorycode?: account_accountcategorycode | null;
    name?: string | null;
    ownerid_bind$systemusers?: string | null;
    ownerid_bind$teams?: string | null;
    parentaccountid_bind$accounts?: string | null;
    primarycontactid_bind$contacts?: string | null;
    revenue?: number | null;
  }
  interface Account_RelatedOne {
    ownerid: WebMappingRetrieve<Team_Select, Team_Expand, Team_Filter, Team_Fixed, Team_Result, Team_FormattedResult> & WebMappingRetrieve<SystemUser_Select, SystemUser_Expand, SystemUser_Filter, SystemUser_Fixed, SystemUser_Result, SystemUser_FormattedResult>;
    parentaccountid: WebMappingRetrieve<Account_Select, Account_Expand, Account_Filter, Account_Fixed, Account_Result, Account_FormattedResult>;
    primarycontactid: WebMappingRetrieve<Contact_Select, Contact_Expand, Contact_Filter, Contact_Fixed, Contact_Result, Contact_FormattedResult>;
  }
  interface Account_RelatedMany {
    contact_customer_accounts: WebMappingRetrieve<Contact_Select, Contact_Expand, Contact_Filter, Contact_Fixed, Contact_Result, Contact_FormattedResult>;
    navigationPropertyNameNotDefined: WebMappingRetrieve<Account_Select, Account_Expand, Account_Filter, Account_Fixed, Account_Result, Account_FormattedResult>;
    navigationPropertyNameNotDefined1: WebMappingRetrieve<Account_Select, Account_Expand, Account_Filter, Account_Fixed, Account_Result, Account_FormattedResult>;
  }
}
interface WebEntitiesRetrieve {
  accounts: WebMappingRetrieve<XDT.Account_Select, XDT.Account_Expand, XDT.Account_Filter, XDT.Account_Fixed, XDT.Account_Result, XDT.Account_FormattedResult>;
}

interface WebEntitiesRelated {
  accounts: WebMappingRelated<XDT.Account_RelatedOne, XDT.Account_RelatedMany>;
}

interface WebEntitiesCUDA {
  accounts: WebMappingCUDA<XDT.Account_Create, XDT.Account_Update, XDT.Account_Select>;
}
