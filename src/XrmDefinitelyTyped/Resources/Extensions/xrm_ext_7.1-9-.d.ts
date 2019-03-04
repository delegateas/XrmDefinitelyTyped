/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {

  interface context {
    /** 
     * Returns the difference between the local time and Coordinated Universal Time (UTC).
     */
    getTimeZoneOffsetMinutes(): number;
  }

  interface Utility {
    /**
     * Opens a quick create form.
     * 
     * @param callback The function that will be called when a record is created. This function is passed a lookup object as a parameter.
     * @param entityLogicalName The logical name of the entity to create.
     * @param createFromEntity Designates a record that will provide default values based on mapped attribute values.
     * @param parameters A dictionary object that passes extra query string parameters to the form. Invalid query string parameters will cause an error.
     */
    openQuickCreate(callback: (lookup: Lookup) => any, entityLogicalName: string, createFromEntity?: Lookup, parameters?: any): void;
  }
}