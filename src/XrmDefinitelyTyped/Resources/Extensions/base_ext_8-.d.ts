/// <reference path="..\base.d.ts" />
declare module IPage {
    interface PageTab<T extends SectionCollectionBase> extends EmptyPageTab {
        /**
         * Add an event handler on tab state change.
         *
         * @param reference Event handler for tab state change.
         */
        addTabStateChange(reference: Function): void;
    }
}