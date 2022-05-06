// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\xrm.d.ts" />
declare namespace Xrm {
  let Page: Xrm.PageBase<Xrm.AttributeCollectionBase, Xrm.TabCollectionBase, Xrm.ControlCollectionBase>;
  /**
   * Interface for the base of an Xrm.Page
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PageBase<T extends AttributeCollectionBase, U extends TabCollectionBase, V extends ControlCollectionBase> {
    /**
     * The context of the page.
     */
    context: Xrm.context;
  }

  interface context {
    /**
     * Returns the language code identifier (LCID) value that represents the base language for the organization.
     */
    getOrgLcid(): number;

    /**
     * Returns the unique text value of the organization?s name.
     */
    getOrgUniqueName(): string;

    /**
     * Returns a dictionary object of key value pairs that represent the query string arguments that were passed to the page.
     */
    getQueryStringParameters(): any; // eslint-disable-line @typescript-eslint/no-explicit-any

    /**
     * Returns the GUID of the SystemUser.Id value for the current user.
     */
    getUserId(): string;

    /**
     * Returns the LCID value that represents the provisioned language that the user selected as their preferred language.
     */
    getUserLcid(): number;

    /**
     * Returns an array of strings that represent the GUID values of each of the security roles that the user is associated with or any teams that the user is associated with.
     */
    getUserRoles(): string[];
  }

  /**
   * Interface for the entity on a form.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PageEntity<T extends AttributeCollectionBase> {
    /**
     * This is the equivalent of using the "Save and Close" command.
     */
    save(type: "saveandclose"): boolean;

    /**
     * This is the equivalent of using the "Save and New" command.
     */
    save(type: "saveandnew"): boolean;

    /**
     * Saves the record synchronously and performs the command according to the type given.
     */
    save(type: string): boolean;

    /**
     * Saves the record synchronously with the options to close the form or open a new form after the save is completed.
     */
    save(): boolean;
  }

  /**
   * Interface for the Xrm.Utility functionality.
   */
  interface Utility {
    /**
     * Opens an entity form for a new or existing entity record using the options you set as parameters.
     *
     * @param name The logical name of the entity.
     * @param id The string representation of a unique identifier or the record to open in the form. If not set, a form to create a new record is opened.
     * @param parameters A dictionary object that passes extra query string parameters to the form. Invalid query string parameters will cause an error.
     * @param windowOptions You can choose to open a form in a new window by passing a dictionary object with a boolean openInNewWindow property set to true.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    openEntityForm(name: string, id?: string, parameters?: any, windowOptions?: WindowOptions): void;

    /**
     * Opens an HTML web resource.
     *
     * @param webResourceName The name of the HTML web resource to open.
     * @param webResourceData Data to be passed into the data parameter.
     * @param width The width of the window to open in pixels.
     * @param height The height of the window to open in pixels.
     */
    openWebResource(webResourceName: string, webResourceData?: string, width?: number, height?: number): Window;
  }
}

interface Xrm<T extends Xrm.PageBase<Xrm.AttributeCollectionBase, Xrm.TabCollectionBase, Xrm.ControlCollectionBase>> extends BaseXrm {
  /**
   * The Xrm.Page object model, which contains data about the current page.
   */
  Page: T;
}
