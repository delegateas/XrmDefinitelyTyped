/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
    interface PageTab<T extends SectionCollectionBase> {
        /**
         * Add an event handler on tab state change.
         *
         * @param reference Event handler for tab state change.
         */
        add_tabStateChange(reference: Function): void;
    }
}