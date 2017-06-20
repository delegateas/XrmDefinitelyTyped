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
     * Use this to add a function as an event handler for the keypress event so that the function is called when you type a character in the specific text field.
     * You should use reference to a named function rather than an anonymous function if you may later want to remove the event handler for the field.
     *
     * @param functionRef The event handler for the OnKeyPressed event.
     */
    addOnKeyPress(functionRef: (context?: ExecutionContext<this>) => any): void;

    /**
     * Use this to remove an event handler for a text field that you added using addOnKeyPress.
     *
     * @param functionRef The event handler for the OnKeyPressed event.
     */
    removeOnKeyPress(functionRef: Function): void;

    /**
     * Use this to manually fire an event handler that you created for a specific text field to be executed on the keypress event.
     */
    fireOnKeyPress(): void;

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
}