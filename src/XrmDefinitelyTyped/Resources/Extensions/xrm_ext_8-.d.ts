/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
    interface PageTab<T extends SectionCollectionBase> {
        /**
         * Add an event handler on tab state change.
         *
         * @param reference Event handler for tab state change.
         */
        addTabStateChange(reference: Function): void;
    }

    interface GridEntity {
        /**
         * Returns a collection of the attributes on this record.
         */
        getAttributes(): GridCollection<GridEntityAttribute>;
    }

    interface GridCollection<T> {
        /**
         * Returns a list of all attributes on this record.
         */
        getAll(): T[];
        /**
         * Returns a list of all attributes on this record which matches the filter.
         */
        getByFilter(filter: (a: T) => boolean): T[];
        /**
         * Returns the first attribute on this record which matches the filter.
         */
        getFirst(filter: (a: T) => boolean): T | null;
        /**
         * Returns the attribute on this record with the given name, if any.
         */
        getByName(name: string): T | null;
        /**
         * Returns the attribute on this record with the given index, if any.
         */
        getByIndex(idx: number): T | undefined;
        /**
         * Returns the amount of attributes in this entity grid.
         */
        getLength(): number;
        /**
         * Iterator function for the attributes.
         */
        forEach(delegate: ForEach<T>): void;
    }

    interface GridEntityAttribute {
        /**
         * Returns the logical name of the attribute.
         */
        getKey(): string;
        /**
         * Returns the logical name of the attribute.
         */
        getName(): string;
        /**
         * Returns the value of the attribute on this record.
         */
        getValue(): string | null;
        /**
         * Returns the parent entity of this attribute.
         */
        getParent(): GridEntity;
    }
}
