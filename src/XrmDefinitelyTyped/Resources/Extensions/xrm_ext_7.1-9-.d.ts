/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
  interface context {
    /**
     * Returns the difference between the local time and Coordinated Universal Time (UTC).
     */
    getTimeZoneOffsetMinutes(): number;
  }

  interface OpenQuickCreateResult {
    /**
     * Identifies the record displayed or created
     */
    savedEntityReference: Lookup;
}

  interface Utility {
    /**
     * Opens a quick create form.
     *
     * @param entityLogicalName The logical name of the entity to create.
     * @param createFromEntity Designates a record that will provide default values based on mapped attribute values.
     * @param parameters A dictionary object that passes extra query string parameters to the form. Invalid query string parameters will cause an error.
     */
    openQuickCreate(entityLogicalName: string, createFromEntity?: Lookup, parameters?: any): Promise<OpenQuickCreateResult>;
  }
}
