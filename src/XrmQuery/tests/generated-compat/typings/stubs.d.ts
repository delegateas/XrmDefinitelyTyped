/**
 * Stand-ins for the two entities `account.d.ts` points at through its polymorphic `ownerid` lookup.
 * A real run generates these the same way as `account.d.ts`; here they carry just enough members to
 * be usable from `consumer.ts`.
 */

declare namespace XDT {
  interface Team_Fixed {
    teamid: string;
  }
  interface Team_Result extends Team_Fixed {
    name: string | null;
  }
  interface Team_FormattedResult {}
  interface Team_Select {
    name: WebAttribute<Team_Select, { name: string | null }, object>;
  }
  interface Team_Filter {
    name: string;
  }
  interface Team_Expand {}

  interface SystemUser_Fixed {
    systemuserid: string;
  }
  interface SystemUser_Result extends SystemUser_Fixed {
    domainname: string | null;
  }
  interface SystemUser_FormattedResult {}
  interface SystemUser_Select {
    domainname: WebAttribute<SystemUser_Select, { domainname: string | null }, object>;
  }
  interface SystemUser_Filter {
    domainname: string;
  }
  interface SystemUser_Expand {}
}
