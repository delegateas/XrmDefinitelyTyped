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
    }
}