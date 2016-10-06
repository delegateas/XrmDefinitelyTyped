/**
 * SDK module
 */
declare namespace SDK {
    /**
     * Interface for an entity reference for the OData endpoint.
     */
    export interface EntityReference {
        /**
         * GUID of the entity reference.
         */
        Id: string | null;
        /**
         * Logical name of the entity.
         */
        LogicalName: string | null;
        /**
         * Name of the entity.
         */
        Name?: string | null;
    }

    /**
     * Interface for an option set value attribute for the OData endpoint.
     */
    interface OptionSet<T> {
        /**
         * Integer value for the option.
         */
        Value: T | null;
    }

    /**
     * Interface for a money attribute for the OData endpoint.
     */
    interface Money {
        /**
         * Decimal value of the amount as a string.
         */
        Value: string | null;
    }

    /**
     * Interface for an expanded result from the OData endpoint.
     */
    interface Results<T> {
        /**
         * Array containing all the results of the expanded entity relations.
         */
        results: T[];
    }
}
