// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\xrm.d.ts" />
declare namespace _XRMNS_ {
  interface BaseControl {
    /**
     * Display a message near the control to indicate that data isn?t valid. When this method is used on Microsoft Dynamics CRM for tablets a red "X" icon appears next to the control. Tapping on the icon will display the message.
     *
     * @param message The message to display.
     * @param uniqueId The ID to use to clear just this message when using clearNotification.
     */
    setNotification(message: string, uniqueId?: string): boolean;

    /**
     * Remove a message already displayed for a control.
     *
     * @param uniqueId The ID to use to clear a specific message set using setNotification.
     */
    clearNotification(uniqueId?: string | null): boolean;
  }

  interface LookupControl<T extends string> extends Control<LookupAttribute<T>> {
    /**
     * Use to add filters to the results displayed in the lookup. Each filter will be combined with any previously added filters as an 'AND' condition.
     *
     * @param fetchXml The fetchXml filter element to apply.
     * @param entityType If this is set, the filter only applies to that entity type. Otherwise, it applies to all types of entities returned.
     */
    addCustomFilter(fetchXml: string, entityType?: string): void;

    /**
     * Use this method to apply changes to lookups based on values current just as the user is about to view results for the lookup.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    addPreSearch(handler: Function): void;

    /**
     * Use this method to remove event handler functions that have previously been set for the PreSearch event.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    removePreSearch(handler: Function): void;
  }

  interface DateControl extends Control<Attribute<Date>> {
    /**
     * Specify whether a date control should show the time portion of the date.
     */
    setShowTime(doShow: boolean): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PageEntity<T extends AttributeCollectionBase> {
    /**
     * Gets a string for the value of the primary attribute of the entity.
     */
    getPrimaryAttributeValue(): string;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface BaseAttribute<T> {
    /**
     * Determine whether a lookup attribute represents a partylist lookup.
     */
    getIsPartyList(): boolean;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface UiModule<T extends TabCollectionBase, U extends ControlCollectionBase> {
    /**
     * Use this method to remove form level notifications.
     *
     * @param uniqueId Id of the notification to remove.
     */
    clearFormNotification(uniqueId: string): boolean;

    /**
     * Use this method to display form level notifications. You can display any number of notifications and they will be displayed until
     * they are removed using clearFormNotification. The height of the notification area is limited so each new message will be added to the top.
     * Users can scroll down to view older messages that have not yet been removed.
     *
     * @param message The text of the message.
     * @param level The level of the message.
     * @param uniqueId A unique identifier for the message used with clearFormNotification to remove the notification.
     */
    setFormNotification(message: string, level: NotificationLevel, uniqueId: string): boolean;
  }

  type ClientType = "Web" | "Outlook" | "Mobile";
  type ClientState = "Online" | "Offline";

  interface client {
    /**
     * Returns a value to indicate which client the script is executing in.
     */
    getClient(): ClientType;

    /**
     * Use this instead of the removed isOutlookOnline method.
     */
    getClientState(): ClientState;
  }

  interface context {
    /**
     * Provides access to the getClient and getClientState methods you can use to determine which client is being used and whether the client is connected to the server.
     */
    client: client;
  }
}
