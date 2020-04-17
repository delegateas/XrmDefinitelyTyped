/// <reference path="..\xrm.d.ts" />

declare namespace Xrm {
    /**
     * Lookup-like type object for userSettings.roles.
     */
    interface Role {
        id: string;
        name: string;
    }

    interface userSettings {
        /**
         * Collection of lookup-like objects containing the GUID and display name of each of the security role or teams that the user is associated with.
         */
        roles: Collection<Role>;

        /**
         * Returns an array of strings that represent the GUID values of each of the security role privilege that the user is associated with or any teams that the user is associated with.
         */
        securityRolePrivileges: string[]
    }
}
