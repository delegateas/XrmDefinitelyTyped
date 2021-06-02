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

    /**
     * Interface for the ui of a form.
     */
    interface UiModule<T extends TabCollectionBase, U extends ControlCollectionBase> {
        /**
         * Method to cause the ribbon to re-evaluate data that controls what is displayed in it.
         */
        headerSection: HeaderSection;
    }

    interface HeaderSection {
        /**
         * Returns the header's body visibility.
         */
        getBodyVisible(): boolean;

        /**
         * Returns the command bar visibility.
         */
        getCommandBarVisible(): boolean;

        /**
         * Returns the tab navigator visibility.
         */
        getTabNavigatorVisible(): boolean;

        /**
         * Sets the header's body visibility.
         */
        setBodyVisible(isVisible: boolean);

        /**
         * Sets the command bar visibility.
         */
        setCommandBarVisible(isVisible: boolean);

        /**
         * Sets the tab navigator visibility.
         */
        setTabNavigatorVisible(isVisible: boolean);
    }

    type KBSeachControlMode = "Inline" | "Popout";

    /**
     * Interface for a KBSearchResult returned on the method getSelectedResults from the KBSearchControl.
     * All Date objects will be in the current user's time zone and format.
     */
    interface KBSearchResult {
        /**
         * The HTML markup containing the content of the article.
         */
        answer(): string;

        /**
         * The article ID in Dynamics 365.
         */
        articleId(): string;

        /**
         * The unique article ID in Dynamics 365.
         */
        articleUid(): string;

        /**
         * The date the article was created.
         */
        createdOn(): Date;

        /**
         * Indicates whether the article is associated with the parent record or not.
         */
        isAssociated(): boolean;

        /**
         * Date on which the article was last modified.
         */
        lastModifiedOn(): Date;

        /**
         * Support Portal URL of the article; blank if Portal URL option is turned off.
         */
        publicUrl(): string;

        /**
         * Indicates whether the article is in published state. True if published; otherwise False.
         */
        published(): boolean;

        /**
         * The title of the article.
         */
        question(): string;

        /**
         * The rating of the article.
         */
        rating(): number;

        /**
         * A short snippet of article content that contains the areas where the search query was hit.
         */
        searchBlurb(): string;

        /**
         * Link to the article in the Dynamics 365.
         */
        serviceDeskUri(): string;

        /**
         * The number of times an article is viewed on the portal by customers.
         */
        timesViewved(): number;
    }

    /**
     * Interface for a knowledge base search control.
     */
    interface KBSearchControl extends BaseControl {
        /**
         * Add an event handler to the PostSearch event.
         * @param functionRef The function to add.
         */
        addOnPostSearch(functionRef: (context?: ExecutionContext<this, undefined>) => any): void;

        /**
         * Add an event handler to the OnResultOpened event.
         * @param functionRef The function to add.
         */
        addOnResultOpened(functionRef: (context?: ExecutionContext<this, undefined>) => any): void;

        /**
         * Add an event handler to the OnSelection event.
         * @param functionRef The function to add.
         */
        addOnSelection(functionRef: (context?: ExecutionContext<this, undefined>) => any): void;

        /**
         * Get the text used as the search criteria for the knowledge base management control.
         */
        getSearchQuery(): string;

        /**
         * Get the currently selected result of the search control; the one that is currently open.
         * @return The currently selected result.
         */
        getSelectedResults(): KBSearchResult;

        /**
         * Gets the count of results found in the search control.
         * @return The count of the search result.
         */
        getTotalResultCount(): number;

        /**
         * Opens a search result in the search control by specifying the result number.
         * @param resultNumber Numerical value specifying the result number to be opened. Required.
         * @param mode Specify "Inline" or "Popout". Optional. Defaults to "Inline".
         * @return Returns 1 if successful; 0 if unsuccessful; -1 if the specified resultNumber is not present, or if the specified mode is invalid.
         */
        openSearchResult(resultNumber: number, mode?: KBSeachControlMode): number;

        /**
         * Use this method to remove an event handler from the PostSearch event.
         * @param functionRef The function to remove.
         */
        removeOnPostSearch(functionRef: Function): void;

        /**
         * Remove an event handler from the OnResultOpened event.
         * @param functionRef The function to remove.
         */
        removeOnResultOpened(functionRef: Function): void;

        /**
         * Remove an event handler from the OnSelection event.
         * @param functionRef The function to remove.
         */
        removeOnSelection(functionRef: Function): void;

        /**
         * Set the text used as the search criteria for the knowledge base management control.
         * @param text The text for the search query.
         */
        setSearchQuery(text: string): void;
    }

    interface PageEntity<T extends AttributeCollectionBase> {
        /**
         * Adds a function to be called when save event has completed; either successfully or with a failure.
         * @param functionRef The function to add to the PostSave event.
         * The execution context is automatically passed as the first parameter to this function.
         */
        addOnPostSave(functionRef: (context?: SaveEventContext<this>) => any): void;
    }
}
