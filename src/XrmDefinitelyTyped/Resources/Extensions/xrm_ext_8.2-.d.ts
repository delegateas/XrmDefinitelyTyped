﻿// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\xrm.d.ts" />

//Function helper type for a function that can be set to be called by a view column to show an image with a tooltip instead of the ordinary data
type TooltipFunc = (rowData: string, lcid: LCID) => [WebResourceImage, string];

declare namespace _XRMNS_ {
  const enum ProcessStatus {
    Active = "active",
    Aborted = "aborted",
    Finished = "finished",
  }

  /**
   * Interface for a single result in the auto-completion list.
   */
  interface AutoCompleteResult {
    /**
     * Unique id for the result
     */
    id: string;
    /**
     * Result icon defined by an image url
     */
    icon: string;
    /**
     * Values to display in the result. Support up to three values
     */
    fields: string[];
  }

  /**
   * Interface for a command button in lower right corner of the auto-completion drop-down list.
   */
  interface AutoCompleteCommand {
    /**
     * Unique id for the command
     */
    id: string;
    /**
     * Command icon defined by an image url
     */
    icon: string;
    /**
     * Label for the command
     */
    label: string;
    /**
     * Command action
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action: () => any;
  }

  /**
   * Interface for the result set to be shown in auto-completion list.
   */
  interface AutoCompleteResultSet {
    /**
     * List of returned results
     */
    results: AutoCompleteResult[];
    /**
     * Command at the bottom of the auto-completion drop-down list (optional)
     */
    commands: AutoCompleteCommand;
  }

  interface StringControl extends Control<Attribute<string>> {
    /**
     * Gets the latest value in a control as the user types characters in a specific text or number field.
     * The getValue method is different from the attribute getValue method because the control method retrieves the value from the control as the user is typing in the control as opposed to the attribute getValue method that retrieves the value after the user commits (saves) the field.
     */
    getValue(): string;

    /**
     * Use this to manually fire an event handler that you created for a specific text field to be executed on the keypress event.
     */
    fireOnKeyPress(): void;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface GridEntity<T extends string> {
    /**
     * Returns the GUID of the record.
     */
    getKey(): string;
    getIsDirty(): boolean;
    getDataXml(): string | null;

    /**
     * Returns a collection of the related entities for this record.
     * TODO: Unsure as to what type of elements are returned in the collection.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getRelatedEntities(): GridCollection<any>;

    isInHierarchy(): boolean;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-interface 
  interface ProcessStatusChangeContext extends ExecutionContext<Process, any> { }

  interface ProcessModule {
    /**
     * Use this to add a function as an event handler for the OnProcessStatusChange event so that it will be called when the
     * business process flow status changes.
     * @param handler The function will be added to the bottom of the event
     *                handler pipeline. The execution context is automatically
     *                set to be the first parameter passed to the event handler.
     *                Use a reference to a named function rather than an
     *                anonymous function if you may later want to remove the
     *                event handler.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addOnProcessStatusChange(handler: (context?: ProcessStatusChangeContext) => any): void;

    /**
     * Use this to remove a function as an event handler for the OnProcessStatusChange event.
     * @param handler If an anonymous function is set using the addOnProcessStatusChange method it
     *                cannot be removed using this method.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeOnProcessStatusChange(handler: (context?: ProcessStatusChangeContext) => any): void;

    /**
     * Returns the unique identifier of the process instance.
     */
    getInstanceId(): string;

    /**
     * Returns the name of the process instance.
     */
    getInstanceName(): string;

    /**
     * Returns the current status of the process instance.
     */
    getStatus(): ProcessStatus;

    /**
     * Sets the current status of the active process instance.
     * @param status The new status. The values can be active, aborted, or finished.
     * @param callbackFunction A function to call when the operation is complete. This callback function is passed the new status as a string value.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setStatus(status: ProcessStatus, callbackFunction?: (status: ProcessStatus) => any): ProcessStatus;
  }
}
