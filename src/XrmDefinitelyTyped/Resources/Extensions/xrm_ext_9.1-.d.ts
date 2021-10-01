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
         * Collection of lookup-like objects containing the GUID and display name of each of the security role or teams
         * that the user is associated with.
         */
        roles: Collection<Role>;

        /**
         * Returns an array of strings that represent the GUID values of each of the security role privilege that the
         * user is associated with or any teams that the user is associated with.
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

    interface OnLoadEventContext extends ExecutionContext<UiModule<TabCollectionBase, ControlCollectionBase>, LoadEventArgs> {
    }

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
         * Returns a value indicating whether the lookup tag click event has been canceled because the preventDefault
         * method was used in this event handler or a previous event handler.
         */
        isDefaultPrevented(): boolean;

        /**
         * Cancels the lookup tag click event, but all remaining handlers for the event will still be executed.
         */
        preventDefault(): void;
    }

    interface OnLookupTagClickContext extends ExecutionContext<any, OnLookupTagClickEventArgs> {
    }

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

        /**
         * Return a value that indicates whether the form is currently visible
         */
        getVisible(visibility: boolean);
    }

    /**
     * Interface for the ui of a form.
     */
    interface UiModule<T extends TabCollectionBase, U extends ControlCollectionBase> {
        /**
         * Method to cause the ribbon to re-evaluate data that controls what is displayed in it.
         */

        /**
         * Provides information on how to set the visibility of header section.
         */
        headerSection: HeaderSection;

        /**
         * Provides information on how to set the visibility of footer section.
         */
        footerSection: FooterSection;
        
        /**
         * Provides objects and methods to interact with the business process flow control on a form.
         * More information: formContext.ui.process
         */
        process: UiProcess;
        
        
        //quickViewControl: QuickViewControl;

        // /**
        //  * Adds a function to be called on the form OnLoad event.
        //  * @param onLoadFunction The function to be executed on the form OnLoad event. 
        //  * The function will be added to the bottom of the event handler pipeline. 
        //  * The execution context is automatically passed as the first parameter to the function. 
        //  * See Execution context for more information.
        //  */
        // addOnLoad(onLoadFunction); figure out function ref
        //
        // /**
        //  * Removes a function from the form OnLoad event.
        //  * @param onLoadFunction The function to be removed from the form OnLoad event.
        //  */
        // removeOnLoad(onLoadFunction): void; figure out function ref

        /**
         * Sets the name of the table to be displayed on the form.
         * @param tableName Name of the table to be displayed on the form.
         */
        setFormEntityName(tableName: string): void;

        /**
         * Displays form level notifications.
         * You can display any number of notifications and they will be displayed until they are removed using clearFormNotification.
         * The height of the notification area is limited so each new message will be added to the top. 
         * Users can scroll down to view older messages that have not yet been removed.
         * @param messageText The text of the notification message.
         * @param level The level of the message, which defines how the message will be displayed. Specify one of the following values:
         * ERROR : Notification will use the system error icon.
         * WARNING : Notification will use the system warning icon.
         * INFO : Notification will use the system info icon.
         * @param uniqueId A unique identifier for the message that can be used later with clearFormNotification to remove the notification.
         * returns true if the method succeeded; false otherwise.  
         */
        setFormNotification(messageText: string, level: string, uniqueId: string): boolean;

        /**
         * Removes form level notifications.
         * @param uniqueId A unique identifier for the message to be cleared that was set using the setFormNotification method.
         * returns true if the method succeeded, false otherwise.
         */
        clearFormNotification(uniqueId: string): boolean;

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
         * @param isVisible Specify true to show the body; false to hide the body.
         */
        setBodyVisible(isVisible: boolean): void;

        /**
         * Sets the command bar visibility.
         * @param isVisible Specify true to show the command bar; false to hide the command bar.
         */
        setCommandBarVisible(isVisible: boolean): void;

        /**
         * Sets the tab navigator visibility.
         * @param isVisible Specify true to show the tab navigator; false to hide the tab navigator.
         */
        setTabNavigatorVisible(isVisible: boolean): void;
    }

    interface FooterSection {
        /**
         * Returns the footer section visibility
         * returns true if the footer section is visible; false otherwise.
         */
        getVisible(): boolean;

        /**
         * Sets the visibility of the footer section
         * @param isVisible Specify true to show the footer section; false to hide the footer section.
         */

        setVisible(isVisible: boolean): void;
    }

    interface UiProcess {
        /**
         * Retrieves the display state for the business process control.
         * Returns "expanded" or "collapsed" on the legacy web client; returns "expanded", "collapsed", or "floating" on Unified Interface.
         */
        getDisplayState(): string;

        /**
         * Returns a value indicating whether the business process control is visible.
         * returns true if the control is visible; false otherwise.
         */
        getVisible(): boolean;

        /**
         * Reflows the UI of the business process control. Parameters are optional
         * @param updateUI Specify true to update the UI of the process control; false otherwise.
         * @param parentStage Specify the ID of the parent stage in the GUID format.
         * @param nextStage Specify the ID of the next stage in the GUID format.
         */
        reflow(updateUI?: boolean, parentStage?: string, nextStage?: string): void;

        /**
         * Sets the display state of the business process control.
         * @param state Specify "expanded", "collapsed", or "floating". The value "floating" is not supported on the web client.
         */
        setDisplayState(state: string): void;

        /**
         * Shows or hides the business process control.
         * @param visibility Specify true to show the control; false to hide the control.
         */
        setVisible(visibility: boolean): void;

    }
    
    // This needs to be created in F# to get it working
    // interface QuickViewControl {
    //     /**
    //      * Gets the control on a form.
    //      * @param arg Optional. You can access a single control in the constituent controls collection by passing an
    //      * argument as either the name or the index value of the constituent control in a quick view control.
    //      * For example: quickViewControl.getControl("firstname") or quickViewControl.getControl(0)
    //      * Returns an Object or Object collection
    //      */
    //     getControl(arg?);
    //      figure out return type call
    //
    //     /**
    //      * Returns a string value that categorizes quick view controls.
    //      * For a quick view control, the method returns "quickform". 
    //      * For a constituent control in a quick view control, the method returns the actual category of the control.
    //      */
    //     getControlType(): string;
    //
    //     /**
    //      * Gets a boolean value indicating whether the control is disabled.
    //      * true if disabled; false otherwise.
    //      */
    //     getDisabled(): boolean;
    //
    //     /**
    //      * Returns the label for the quick view control.
    //      */
    //     getLabel(): string;
    //
    //     /**
    //      * Returns the name assigned to the quick view control.
    //      */
    //     getName(): string;
    //
    //     /**
    //      * Returns a reference to the section object that contains the control.
    //      */
    //     getParent() PageSection<Collection<QuickViewControl>>;
    //    figure out return type call
    //                 UiModule<Collection<PageTab<Collection<PageSection>>>, Collection<BaseControl>>    
    //
    //     /**
    //      * Returns a value that indicates whether the quick view control is currently visible.
    //      * Returns true if the control is visible; false otherwise.
    //      */
    //     getVisible(): boolean;
    //
    //     /**
    //      * Returns whether the data binding for the constituent controls in a quick view control is complete.
    //      * true if the data binding for a constituent control is complete; false otherwise.
    //      */
    //     isLoaded(): boolean;
    //
    //     /**
    //      * Refreshes the data displayed in a quick view control.
    //      */
    //     refresh(): void;
    //
    //     /**
    //      * Sets the state of the control to either enabled or disabled.
    //      * @param disabled Specify true or false to disable or enable the control.
    //      */
    //     setDisabled(disabled: boolean): void;
    //
    //     /**
    //      * Sets focus on the control.
    //      */
    //     setFocus(): void;
    //
    //     /**
    //      * Sets the label for the quick view control.
    //      * @param label The new label of the quick view control.
    //      */
    //     setLabel(label: string): void;
    //
    //     /**
    //      * Displays or hides a control.
    //      * @param visible Specify true or false to display or hide the control.
    //      */
    //     setVisible(visible: boolean): void;
    //
    // }


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

    // interface PageTab<T extends SectionCollectionBase> {
    //     /**
    //      * Collection of sections within this tab.
    //      */
    //     sections: T;
    //
    //     /**
    //      * Adds a function to be called when the TabStateChange event occurs.
    //      * @param tabStateChangeFunction The function to be executed on the TabStateChange event. 
    //      * The function will be added to the bottom of the event handler pipeline. 
    //      * The execution context is automatically passed as the first parameter to the function. 
    //      * See Execution context for more information.
    //      */
    //     addTabStateChange(tabStateChangeFunction): void; figure out function ref
    //
    //     /**
    //      * Returns the content type.
    //      * only supported on unified interface
    //      * Returns "cardSections" or "singleComponent".
    //      */
    //     // getContentType() ; // figure out return value
    //    
    //     /**
    //      * Removes a function to be called when the TabStateChange event occurs.
    //      * @param tabStateChangeFunction The function to be removed from the TabStateChange event.
    //      */
    //     removeTabStateChange(tabStateChangeFunction): void; figure out function ref
    //
    //     /**
    //      * Sets the content type.
    //      * only supported on unified interface
    //      * @param contentType Defines the content type. It has the following parameters:
    //      - cardSections: The default tab behavior.
    //      - singleComponent: Maximizes the content of the first component in the tab.
    //      */
    //     setContentType(contentType: string): void;
    //    
    //
    // }

}
