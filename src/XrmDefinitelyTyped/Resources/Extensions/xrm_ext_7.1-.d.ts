﻿// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\xrm.d.ts" />
declare namespace _XRMNS_ {
  interface SubGridControl<T extends string> extends BaseControl {
    /**
     * Add event handlers to this event to run every time the subgrid refreshes.
     * This includes when users sort the values by clicking the column headings.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addOnLoad(functionRef: (context?: ExecutionContext<this, any>) => any): void;

    /**
     * Use this method to get the logical name of the entity data displayed in the grid.
     */
    getEntityName(): string;

    /**
     * Use this method to get access to the Grid available in the GridControl.
     */
    getGrid(): Grid<T>;

    /**
     * Use this method to get access to the ViewSelector available for the GridControl.
     */
    getViewSelector(): ViewSelector;

    /**
     * Use this method to remove event handlers from the GridControl.OnLoad event.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    removeOnLoad(reference: Function): void;

    /**
     * Use this method to get the logical name of the relationship used for the data displayed in the grid.
     */
    getRelationshipName(): string;
  }

  interface Grid<T extends string> {
    /**
     * Returns a collection of every GridRow in the Grid.
     */
    getRows(): Collection<GridRow<T>>;

    /**
     * Returns a collection of every selected GridRow in the Grid.
     */
    getSelectedRows(): Collection<GridRow<T>>;

    /**
     * In the web application or the Dynamics CRM for Outlook client while connected to the server, this method returns the total number of records that match the filter criteria of the view, not limited by the number visible in a single page.
     * When the Dynamics CRM for Outlook client isn’t connected to the server, this number is limited to those records that the user has selected to take offline.
     * For Microsoft Dynamics CRM for tablets and Microsoft Dynamics CRM for phones this method will return the number of records in the subgrid.
     */
    getTotalRecordCount(): number;
  }

  interface GridRow<T extends string> {
    /**
     * Returns the GridRowData for the GridRow.
     */
    getData(): GridRowData<T>;
  }

  interface GridRowData<T extends string> {
    /**
     * Returns the GridEntity for the GridRowData.
     */
    getEntity(): GridEntity<T>;
  }

  interface GridEntity<T extends string> {
    /**
     * Returns the logical name for the record in the row.
     */
    getEntityName(): string;

    /**
     * Returns an entity reference for the record in the row.
     */
    getEntityReference(): _XRMNS_.EntityReference<T>;

    /**
     * Returns the id for the record in the row.
     */
    getId(): string;

    /**
     * Returns the primary attribute value for the record in the row.
     */
    getPrimaryAttributeValue(): string;
  }

  /**
   * Interface for a DateTime form control.
   */
  interface DateControl extends Control<Attribute<Date>> {
    /**
     * Get whether a date control shows the time portion of the date.
     */
    getShowTime(): boolean;
  }
}
