/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {

    /**
     * Interface for the ui of a form.
     */
    interface UiModule<T extends TabCollectionBase, U extends ControlCollectionBase> {
        /**
         * Access UI controls for the business process flow on the form.
         */
        process: UiProcessModule;
    }

    interface UiProcessModule {
        /**
         * Use this method to retrieve the display state for the business process control.
         */
        getDisplayState(): CollapsableDisplayState;

        /**
         * Use this method to expand or collapse the business process flow control.
         */
        setDisplayState(val: CollapsableDisplayState): void;

        /**
         * Use getVisible to retrieve whether the business process control is visible.
         */
        getVisible(): boolean;

        /**
         * Use setVisible to show or hide the business process control.
         */
        setVisible(visible: boolean): void;
    }

    interface context {
        /**
         * Returns whether Autosave is enabled for the organization.
         */
        getIsAutoSaveEnabled(): boolean;
    }
}