/// <reference path="..\xrm.d.ts" />

declare namespace Xrm {
    /**
     * Lookup-like type object for userSettings.roles.
     */
    interface Role {
        id: string;
        name: string;
    }

    interface userSettings {
        /**
         * Collection of lookup-like objects containing the GUID and display name of each of the security role or teams that the user is associated with.
         */
        roles: Collection<Role>;

        /**
         * Returns an array of strings that represent the GUID values of each of the security role privilege that the user is associated with or any teams that the user is associated with.
         */
        securityRolePrivileges: string[]
    }

    /**
     * Interface for an standard entity attribute.
     */
    interface Attribute<T> {

        /**
         * Sets a value for an attribute to determine whether it is valid or invalid with a message.
         */
        setIsValid(bool: boolean, message?: string): void;
    }

    const enum LoadState {
        InitialLoad = 1,
        Save = 2,
        Refresh = 3,
    }

    interface LoadEventArgs {
        /**
         * Gets the state of the data load.
         */
        getDataLoadState(): LoadState;
    }

    interface OnLoadEventContext extends ExecutionContext<UiModule<TabCollectionBase, ControlCollectionBase>, LoadEventArgs> { }

    interface LookupTagValue extends Lookup {
        /**
         * The originating lookup field that raised the event.
         */
        fieldName: string;
    }

    interface OnLookupTagClickEventArgs {
        /**
         * Gets the selected tag value.
         */
        getTagValue(): LookupTagValue;

        /**
         * Returns a value indicating whether the lookup tag click event has been canceled because the preventDefault method was used in this event hander or a previous event handler.
         */
        isDefaultPrevented(): boolean;

        /**
         * Cancels the lookup tag click event, but all remaining handlers for the event will still be executed.
         */
        preventDefault(): void;
    }

    interface OnLookupTagClickContext extends ExecutionContext<any, OnLookupTagClickEventArgs> { }

    interface LookupControl<T extends string> extends Control<LookupAttribute<T>> {
        /**
         * Adds an event handler to the OnLookupTagClick event.
         */
        addOnLookupTagClick(myFunction: (context?: OnLookupTagClickContext) => any): void;

        /**
         * Removes an event handler from the OnLookupTagClick event.
         */
        removeOnLookupTagClick(functionRef: Function): void;
    }

    interface FormItem {
        /**
        * Sets a value that indicates whether the control is visible.
        */
        setVisible(visibility: boolean): void;
    }
}
