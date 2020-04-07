/// <reference path="..\xrm.d.ts" />

declare namespace Xrm {
    interface userSettings {
        /**
         * An array of strings that represent the GUID values of each of the security roles that the user is associated with or any teams that the user is associated with.
         */
        securityRoles: string[];
    }
}
