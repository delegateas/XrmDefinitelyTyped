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

	interface GridEntity<T extends string> {
        /**
         * Returns a collection of the attributes on this record.
         */
        getAttributes(): GridCollection<GridEntityAttribute<T>>;
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

    interface GridEntityAttribute<T extends string> {
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
        getParent(): GridEntity<T>;
    }

    /**
     * Interface for the data of a form.
     */
    interface DataModule<T extends AttributeCollectionBase> {
        /**
         * Access various functionality for a business process flow.
         */
        process: ProcessModule;
    }

    type ProcessStageMoveAnswer = "success" | "crossEntity" | "end" | "invalid" | "dirtyForm";
    type ProcessStageSetAnswer = "crossEntity" | "unreachable" | "dirtyForm" | "invalid";

    /**
     * Interface for the business process flow on a form.
     */
    interface ProcessModule {
        /**
         * Returns a Process object representing the active process.
         */
        getActiveProcess(): Process;

        /**
         * Set a Process as the active process.
         *
         * @param processId The Id of the process to make the active process.
         * @param callback A function to call when the operation is complete. This callback function is passed one of the following string 
              values to indicate whether the operation succeeded. Is "success" or "invalid".
         */
        setActiveProcess(processId: string, callback: (successOrInvalid: string) => any): void;

        /**
         * Returns a Stage object representing the active stage.
         */
        getActiveStage(): Stage;

        /**
         * Set a completed stage as the active stage.
         * This method can only be used when the selected stage and the active stage are the same.
         *
         * @param stageId The ID of the completed stage for the entity to make the active stage.
         * @param callback The callback function will be passed a string value of “success” if the operation completes successfully.
              If the stageId represents a stage that isn't valid, the stage won't be made active and the callback function will be passed a string value indicating the reason. 
              "crossEntity": The stage must be one for the current entity.
              "unreachable": The stage exists on a different path.
              "dirtyForm": This value will be returned if the data in the page is not saved.
              "invalid":  
                - The stageId parameter is a non-existent stage ID value
                              OR
                - The active stage isn’t the selected stage.
                              OR
                - The record hasn’t been saved yet.
         */
        setActiveStage(stageId: string, callback?: (stringVal: ProcessStageSetAnswer) => any): void;

        /**
         * Use this method to get a collection of stages currently in the active path with methods to interact with the stages displayed in the business process flow control.
         * The active path represents stages currently rendered in the process control based on the branching rules and current data in the record.
         */
        getActivePath(): Collection<Stage>;

        /**
         * Use this method to asynchronously retrieve the enabled business process flows that the user can switch to for an entity.
         *
         * @param callback The callback function must accept a parameter that contains an object with dictionary properties where the name of the property is the Id of the 
                business process flow and the value of the property is the name of the business process flow.
                The enabled processes are filtered according to the user’s privileges. The list of enabled processes is the same ones a user can see in the UI 
                if they want to change the process manually.
         */
        getEnabledProcesses(callback: (enabledProcesses: ProcessContainer) => any): void;

        /**
         * Use this method to get the currently selected stage.
         */
        getSelectedStage(): Stage;

        /**
         * Use this to add a function as an event handler for the OnStageChange event so that it will be called when the business process flow stage changes.
         * You should use a reference to a named function rather than an anonymous function if you may later want to remove the event handler.
         *
         * @param handler The function will be added to the bottom of the event handler pipeline.
         */
        addOnStageChange(handler: (context?: ExecutionContext<this>) => any): void;

        /**
         * Use this to remove a function as an event handler for the OnStageChange event.
         *
         * @param handler If an anonymous function is set using the addOnStageChange method it cannot be removed using this method.
         */
        removeOnStageChange(handler: (context?: ExecutionContext<this>) => any): void;

        /**
         * Use this to add a function as an event handler for the OnStageSelected event so that it will be called when a business process flow stage is selected.
         * You should use a reference to a named function rather than an anonymous function if you may later want to remove the event handler.
         *
         * @param handler The function will be added to the bottom of the event handler pipeline.
         */
        addOnStageSelected(handler: (context?: ExecutionContext<this>) => any): void;

        /**
         * Use this to remove a function as an event handler for the OnStageSelected event.
         *
         * @param handler If an anonymous function is set using the addOnStageSelected method it cannot be removed using this method.
         */
        removeOnStageSelected(handler: (context?: ExecutionContext<this>) => any): void;

        /**
         * Progresses to the next stage.
         * Will cause the OnStageChange event to occur.
         * This method can only be used when the selected stage and the active stage are the same.
         *
         * @param callback An optional function to call when the operation is complete. This callback function is passed one of the following string values to indicate whether the operation succeeded:
                "success": The operation succeeded.
                "crossEntity": The next stage is for a different entity.
                "end": The active stage is the last stage of the active path.
                "invalid": The operation failed because the selected stage isn’t the same as the active stage.
                "dirtyForm": This value will be returned if the data in the page is not saved.
         */
        moveNext(callback?: (stringVal: ProcessStageMoveAnswer) => any): void;

        /**
         * Moves to the previous stage.
         * Will cause the OnStageChange event to occur.
         * This method can only be used when the selected stage and the active stage are the same.
         *
         * @param callback An optional function to call when the operation is complete. This callback function is passed one of the following string values to indicate whether the operation succeeded:
                "success": The operation succeeded.
                "crossEntity": The previous stage is for a different entity.
                "end": The active stage is the last stage of the active path.
                "invalid": The operation failed because the selected stage isn’t the same as the active stage.
                "dirtyForm": This value will be returned if the data in the page is not saved.
         */
        movePrevious(callback?: (stringVal: ProcessStageMoveAnswer) => any): void;
    }

    /**
     * Interface for an OptionSet form control.
     */
    interface OptionSetControl<T> extends Control<OptionSetAttribute<T>> {
        /**
         * Returns an array of option objects representing the valid options for an option-set control.
         */
        getOptions(): Option<T>[];
    }
}
