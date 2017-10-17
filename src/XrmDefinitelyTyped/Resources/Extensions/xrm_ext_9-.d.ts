/// <reference path="..\xrm.d.ts" />

declare namespace Xrm {
	/**
    * Form executionContext
    */
	interface ExecutionContext<T> {
		getUrl(): string;

		getFormContext(): Xrm.PageBase<Xrm.AttributeCollectionBase, Xrm.TabCollectionBase, Xrm.ControlCollectionBase>;
	}

	interface userSettings {
		/**
         * The name of the current user.
         */
		userName: string;

		/** 
         * Returns the difference between the local time and Coordinated Universal Time (UTC).
         */
		getTimeZoneOffsetMinutes(): number;

        /**
         * The GUID of the SystemUser.Id value for the current user.
         */
		userId: string;

        /**
         * The LCID value that represents the provisioned language that the user selected as their preferred language.
         */
		languageId: number;

        /**
         * An array of strings that represent the GUID values of each of the security roles that the user is associated with or any teams that the user is associated with.
         */
		securityRoles: string[];
	}

	interface organizationSettings {
		/**
         * Returns whether Autosave is enabled for the organization.
         */
		getIsAutoSaveEnabled(): boolean;

		/**
         * The language code identifier (LCID) value that represents the base language for the organization.
         */
		languageId: number;

        /**
         * The unique text value of the organization?s name.
         */
		uniqueName: string;
	}

	interface context {
		userSettings: userSettings;
		organizationSettings: organizationSettings;
	}

	interface Utility {
		getGlobalContext(): context;
    }

}