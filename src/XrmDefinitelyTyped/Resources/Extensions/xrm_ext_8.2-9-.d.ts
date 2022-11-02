﻿// eslint-disable-next-line @typescript-eslint/triple-slash-reference 
/// <reference path="..\xrm.d.ts" />
declare namespace _XRMNS_ {
    interface StringControl extends Control<Attribute<string>> {
        /**
         * Use this to add a function as an event handler for the keypress event so that the function is called when you type a character in the specific text field.
         * You should use reference to a named function rather than an anonymous function if you may later want to remove the event handler for the field.
         *
         * @param functionRef The event handler for the OnKeyPressed event.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addOnKeyPress(functionRef: (context?: ExecutionContext<this, undefined>) => any): void;

        /**
         * Use this to remove an event handler for a text field that you added using addOnKeyPress.
         *
         * @param functionRef The event handler for the OnKeyPressed event.
         */
        // eslint-disable-next-line @typescript-eslint/ban-types
        removeOnKeyPress(functionRef: Function): void;

        /**
         * Use this to show up to 10 matching strings in a drop-down list as users press keys to type character in a specific text field.
         * You can also add a custom command with an icon at the bottom of the drop-down list.
         * On selecting an item in the drop-down list, the value in the text field changes to the selected item, the drop-down list disappears, and the OnChange event for the text field is invoked.
         * This methods isn’t supported for Dynamics 365 mobile clients (phones or tablets) and the interactive service hub. This methods are only available for Updated entities.
         *
         * @param resultSet to be shown in
         */
        showAutoComplete(resultSet: AutoCompleteResultSet): void;

        /**
         * Use this function to hide the auto-completion drop-down list you configured for a specific text field.
         * You don’t have to explicitly use the hideAutoComplete method because, by default, the drop-down list hides automatically if the user clicks elsewhere or if a new drop-down list is displayed.
         * * This methods isn’t supported for Dynamics 365 mobile clients (phones or tablets) and the interactive service hub. This methods are only available for Updated entities.
         */
        hideAutoComplete(): void;
    }


    interface OpenQuickCreateResult {
        /**
         * Identifies the record displayed or created
         */
        savedEntityReference: Lookup;
    }

    interface Utility {
        /**
         * Opens a quick create form.
         *
         * @param entityLogicalName The logical name of the entity to create.
         * @param createFromEntity Designates a record that will provide default values based on mapped attribute values.
         * @param parameters A dictionary object that passes extra query string parameters to the form. Invalid query string parameters will cause an error.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        openQuickCreate(entityLogicalName: string, createFromEntity?: Lookup, parameters?: any): Promise<OpenQuickCreateResult>;
    }
}
