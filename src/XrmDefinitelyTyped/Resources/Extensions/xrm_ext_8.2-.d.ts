/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
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
        fields: string[]
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
        action: () => any
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

    interface GridEntity {
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
        getRelatedEntities(): GridCollection<any>;

        isInHierarchy(): boolean;
    }
    
}