// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\xrm.d.ts" />
declare namespace _XRMNS_ {
  interface Utility {
    /**
     * Displays a dialog box containing an application-defined message.
     *
     * @param message The text of the message to display in the dialog.
     * @param onCloseCallback A function to execute when the OK button is clicked.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    alertDialog(message: string, onCloseCallback?: Function): void;

    /**
     * Displays a confirmation dialog box that contains an optional message as well as OK and Cancel buttons.
     *
     * @param message The text of the message to display in the dialog.
     * @param yesCloseCallback A function to execute when the OK button is clicked.
     * @param noCloseCallback A function to execute when the Cancel button is clicked.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    confirmDialog(message: string, yesCloseCallback?: Function, noCloseCallback?: Function): void;

    /**
     * Determine if an entity is an activity entity.
     *
     * @param entityName The logical name of an entity.
     */
    isActivityType(entityName: string): boolean;
  }

  interface context {
    /**
     * Returns the name of the current user.
     */
    getUserName(): string;
  }
}
