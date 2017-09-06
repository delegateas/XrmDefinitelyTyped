/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
    interface SubGridControl extends BaseControl {
        /**
         * Add event handlers to this event to run every time the subgrid refreshes. 
         * This includes when users sort the values by clicking the column headings. 
         */
        addOnLoad(functionRef: (context?: ExecutionContext<this>) => any): void;

        /**
         * Use this method to get the logical name of the entity data displayed in the grid.
         */
        getEntityName(): string

        /**
         * Use this method to get access to the Grid available in the GridControl.
         */
        getGrid(): Grid;

        /**
         * Use this method to get access to the ViewSelector available for the GridControl.
         */
        getViewSelector(): ViewSelector;

        /**
         * Use this method to remove event handlers from the GridControl.OnLoad event.
         */
        removeOnLoad(reference: Function): void;

        /**
         * Use this method to get the logical name of the relationship used for the data displayed in the grid.
         */
        getRelationshipName(): string
    }

    interface Grid {
        /**
         * Returns a collection of every GridRow in the Grid.
         */
        getRows(): Collection<GridRow>;

        /**
         * Returns a collection of every selected GridRow in the Grid.
         */
        getSelectedRows(): Collection<GridRow>;

        /**
         * In the web application or the Dynamics CRM for Outlook client while connected to the server, this method returns the total number of records that match the filter criteria of the view, not limited by the number visible in a single page.
         * When the Dynamics CRM for Outlook client isn’t connected to the server, this number is limited to those records that the user has selected to take offline.
         * For Microsoft Dynamics CRM for tablets and Microsoft Dynamics CRM for phones this method will return the number of records in the subgrid.
         */
        getTotalRecordCount(): number;
    }

    interface GridRow {
        /**
         * Returns the GridRowData for the GridRow.
         */
        getData(): GridRowData;
    }

    interface GridRowData {
        /**
         * Returns the GridEntity for the GridRowData.
         */
        getEntity(): GridEntity;
    }

    interface GridEntity {
        /**
         * Returns the logical name for the record in the row.
         */
        getEntityName(): string;

        /**
         * Returns an entity reference for the record in the row.
         */
        getEntityReference(): Xrm.EntityReference;

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