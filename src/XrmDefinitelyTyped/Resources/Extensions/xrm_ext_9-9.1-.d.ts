// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\xrm.d.ts" />

declare namespace _XRMNS_ {
    interface userSettings {
        /**
         * An array of strings that represent the GUID values of each of the security roles that the user is associated with or any teams that the user is associated with.
         */
        securityRoles: string[];
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-explicit-any
    interface OnLoadEventContext extends ExecutionContext<UiModule<TabCollectionBase, ControlCollectionBase>, any> { }
}
