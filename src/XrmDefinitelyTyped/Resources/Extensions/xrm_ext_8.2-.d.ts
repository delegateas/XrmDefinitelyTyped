/// <reference path="..\xrm.d.ts" />

//Function helper type for a function that can be set to be called by a view column to show an image with a tooltip instead of the ordinary data
type TooltipFunc = (rowData: string, lcid: LCID) => [WebResourceImage, string]

declare namespace Xrm {
    const enum ProcessStatus {
        Active = "active",
        Aborted = "aborted",
        Finished = "finished"
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
        getRelatedEntities(): GridCollection<any>;

        isInHierarchy(): boolean;
    }

    interface Process {
        /**
         * Use this method to get the current status of the process instance
         * @returns The current status of the process
         */
        getStatus(): ProcessStatus;
    }

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
        addOnProcessStatusChange(handler: (context?: ExecutionContext<this>) => any): void;

        /**
         * Use this to remove a function as an event handler for the OnProcessStatusChange event.
         * @param handler If an anonymous function is set using the addOnProcessStatusChange method it
         *                cannot be removed using this method.
         */
        removeOnProcessStatusChange(handler: (context?: ExecutionContext<this>) => any): void;
    }
}