// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="..\xrm.d.ts" />

declare namespace Xrm {
    let Device: Device;
    let Encoding: Encoding;
    let Navigation: Navigation;
    let WebApi: WebApi;

    interface ImageOptions {
        /**
         * Indicates whether to edit the image before saving
         */
        allowEdit: boolean;

        /**
         * Height of the image to capture
         */
        height: number;

        /**
         * Indicates whether to capture image using the front camera of the device
         */
        preferFrontCamera: boolean;

        /**
         * Quality of the image file in percentage
         */
        quality: number;

        /**
         * Width of the image to capture
         */
        width: number;
    }

    type PickFileFileType = "audio" | "video" | "image";

    interface PickFileOptions {
        /**
         *  Image file types to select.
         */
        accept: PickFileFileType;

        /**
         * Indicates whether to allow selecting multiple files.
         */
        allowMultipleFiles: boolean;

        /**
         * Maximum size of the files(s) to be selected.
         */
        maximumAllowedFileSize: number;
    }

    /**
     * Interface for a File object
     */
    interface File {
        /**
         * Contents of the file. Base64 Encoded
         */
        fileContent: string;

        /**
         * Name of the file.
         */
        fileName: string;

        /**
         * Size of the file in KB.
         */
        fileSize: string;

        /**
         * MIME type of the file.
         */
        mimeType: string;
    }

    /**
     * Interface for geo location object acquired through Xrm.Device.getCurrentPosition
     */
  interface GeoObject {
        coords: any; // eslint-disable-line @typescript-eslint/no-explicit-any
        timestamp: number;
    }

    /**
     * Contains methods to use the device capabilities of mobile devices.
     */
    interface Device {
        /**
         * Invokes the device microphone to record audio.
         */
        captureAudio(): Then<File>;

        /**
         * Invokes the device camera to capture an image.
         * @param imageOptions Options for capturing the image.
         */
        captureImage(imageOptions: ImageOptions): Then<File>;

        /**
         * Invokes the device camera to record video.
         */
        captureVideo(): Then<File>;

        /**
         * Invokes the device camera to scan the barcode information, such as a product number.
         */
        getBarcodeValue(): Then<string>;

        /**
         * Returns the current location using the device geolocation capability.
         */
        getCurrentPosition(): Then<GeoObject>;

        /**
         * Opens a dialog box to select files from your computer (web client) or mobile device (mobile clients).
         * @param pickFileOptions Options for picking file(s)
         */
        pickFile(pickFileOptions: PickFileOptions): Then<File[]>;
    }

    /**
     * Contains methods related to applying attribute and XML encoding to strings.
     */
    interface Encoding {
        /**
         * Encodes the specified string so that it can be used in an HTML attribute.
         * @param arg String to be encoded.
         */
        htmlAttributeEncode(arg: string): string;

        /**
         * Converts a string that has been HTML-encoded into a decoded string.
         * @param arg HTML-encoded string to be decoded.
         */
        htmlDecode(arg: string): string;

        /**
         * Converts a string to an HTML-encoded string.
         * @param arg String to be encoded.
         */
        htmlEncode(arg: string): string;
        /**
         * Applies attribute encoding to a string.
         * @param arg String to be encoded.
         */
        xmlAttributeEncode(arg: string): string;

        /**
         * Applies XML encoding to a string.
         * @param arg String to be encoded.
         */
        xmlEncode(arg: string): string;
    }

    /**
     * Interface for an AlertStrings object
     */
    interface AlertStrings {
        /**
         * The confirm button label. If you do not specify the button label, OK is used as the button label.
         */
        confirmButtonLabel?: string;

        /**
         * The message to be displayed in the alert dialog.
         */
        text: string;

        /**
         * The title of the alert dialog.
         */
        title?: string;
    }

    /**
     * Interface for a ConfirmationStrings object
     */
    interface ConfirmStrings {
        /**
         * The cancel button label.If you do not specify the cancel button label, Cancel is used as the button label.
         */
        cancelButtonLabel?: string;

        /**
         * The confirm button label.If you do not specify the confirm button label, OK is used as the button label.
         */
        confirmButtonLabel?: string;

        /**
         * The subtitle to be displayed in the confirmation dialog.
         */
        subtitle?: string;

        /**
         * The message to be displyed in the confirmation dialog.
         */
        text: string;

        /**
         * The title to be displyed in the confirmation dialog.
         */
        title?: string;
    }

    /**
     * Interface for a SizeOptions object
     */
    interface SizeOptions {
        /**
         * Height of the alert dialog in pixels
         */
        height?: number;

        /**
         * Width of the alert dialog in pixels
         */
        width?: number;
    }

    /**
     * Interface for an ErrorOptions object
     */
    interface ErrorOptions {
        /**
         * Details about the error.
         * When you specify this, the Download Log File button is available in the error message,
         * and clicking it will let users download a text file with the content specified in this attribute.
         */
        details?: string;

        /**
         * The error code.
         * If you just set errorCode, the message for the error code is automatically retrieved from the server and displayed in the error dialog.
         * If you specify an invalid errorCode value, an error dialog with a default error message is displyed.
         */
        errorCode?: number;

        /**
         * The message to be displayed in the error dialog.
         */
        message?: string;
    }

    /**
     * An object describing whether to open or save the file
     */
    interface OpenFileOptions {
        /**
         * If you do not specify this parameter, by default 1 (open) is passed.
         * This parameter is only supported on Unified Interface
         */
        openMode?: OpenFileOptionsOpenMode;
    }

    const enum OpenFileOptionsOpenMode {
        Open = 1,
        Save = 2,
    }

    type EntityFormNavBar = "on" | "off" | "entity";

    const enum EntityFormWindowPosition {
        Center = 1,
        Side = 2,
    }

    const enum EntityFormRelationshipType {
        OneToMany = 1,
        ManyToMany = 2,
    }

    const enum EntityFormRelationshipRoleType {
        Referencing = 1,
        AssociationEntity = 2,
    }

    interface EntityFormRelationship {
        /**
         * Name of the attribute used for relationship.
         */
        attributeName: string;

        /**
         * Name of the relationship.
         */
        name: string;

        /**
         * Name for the navigation property for this relationship.
         */
        navigationPropertyName: string;

        /**
         * Relationship type.
         */
        relationshipType: EntityFormRelationshipType;

        /**
         * Role type in relationship.
         */
        roleType: EntityFormRelationshipRoleType;
    }

    /**
     * Interface for an EntityFormOptions object
     */
    interface EntityFormOptions {
        /**
         * Indicates whether to display the command bar. If you do not specify this parameter, the command bar is displayed by default.
         */
        cmdbar?: boolean;

        /**
         * Designates a record that will provide default values based on mapped attribute values.
         */
        createFromEntity?: Lookup;

        /**
         * ID of the entity record to display the form for.
         */
        entityId?: string;

        /**
         * Logical name of the entity to display the form for.
         */
        entityName?: string;

        /**
         * ID of the form instance to be displayed.
         */
        formId?: string;

        /**
         * Height of the form window to be displayed in pixels.
         */
        height?: number;

        /**
         *
         */
        isCrossEntityNavigate?: boolean;

        /**
         *
         */
        isOfflineSyncError?: boolean;

        /**
         * Controls whether the navigation bar is displayed and whether application navigation is available using the areas and subareas defined in the sitemap.
         * on: The navigation bar is displayed. This is the default behavior if the navBar parameter is not used.
         * off: The navigation bar is not displayed. People can navigate using other user interface elements or the back and forward buttons.
         * entity: On an entity form, only the navigation options for related entities are available. After navigating to a related entity, a back button is displayed in the navigation bar to allow returning to the original record.
         */
        navBar?: EntityFormNavBar;

        /**
         * Indicates whether to display form in a new window.
         */
        openInNewWindow?: boolean;

        /**
         * Window Position
         */
        windowPosition?: EntityFormWindowPosition;

        /**
         * ID of the business process to be displayed on the form.
         */
        processId?: string;

        /**
         * ID of the business process instance to be displayed on the form.
         */
        processInstanceId?: string;

        /**
         * A relationship object to display the related records on the form.
         */
        relationship?: EntityFormRelationship;

        /**
         * ID of the selected stage in business process instance.
         */
        selectedStageId?: string;

        /**
         * Indicates whether to open a quick create form.
         */
        useQuickCreateForm?: boolean;

        /**
         * Width of the form window to be displayed in pixels.
         */
        width?: number;
    }

    interface WindowOptions {
        /**
         * Height of the window to open in pixels.
         */
        height?: number;

        /**
         * Width of the window to open in pixels.
         */
        width?: number;
    }

    interface ConfirmDialogResult {
        confirmed: boolean;
    }

    interface OpenFormResult {
        /**
         * Identifies the record displayed or created
         */
        savedEntityReference: Lookup[];
    }

    type ViewType = "savedquery" | "userquery";

    interface EntityList {
        /**
         * The type of the page.
         */
        pageType: "entitylist";

        /**
         *  The logical name of the entity to load in the list control.
         */
        entityName: string;

        /**
         * The ID of the view to load. If you don't specify it, navigates to the default main view for the entity.
         */
        viewId?: string;

        /**
         * Type of view to load. Specify "savedquery" or "userquery".
         */
        viewType?: ViewType;
    }

    interface EntityRecord {
        /**
         * The type of the page.
         */
        pageType: "entityrecord";

        /**
         *  Logical name of the entity to display the form for.
         */
        entityName: string;

        /**
         * ID of the entity record to display the form for. If you don't specify this value, the form will be opened in create mode.
         */
        entityId?: string;

        /**
         * Designates a record that will provide default values based on mapped attribute values.
         */
        createFromEntity?: Lookup;

        /**
         * A dictionary object that passes extra parameters to the form.
         */
        data?: object;

        /**
         * ID of the form instance to be displayed.
         */
        formId?: string;

        /**
         * Indicates whether the form is navigated to from a different entity using cross-entity business process flow.
         */
        isCrossEntityNavigate?: boolean;

        /**
         * Indicates whether there are any offline sync errors.
         */
        isOfflineSyncError?: boolean;

        /**
         * ID of the business process to be displayed on the form.
         */
        processId?: string;

        /**
         * ID of the business process instance to be displayed on the form.
         */
        processInstanceId?: string;

        /**
         * Define a relationship object to display the related records on the form
         */
        relationship?: EntityFormRelationship;

        /**
         * ID of the selected stage in business process instance.
         */
        selectedStageId?: string;
    }

    interface WebResource {
        /**
         * Specify "webresource".
         */
        pageType: "webresource";

        /**
         * The name of the web resource to load.
         */
        webresourceName: string;

        /**
         *  The data to pass to the web resource.
         */
        data?: string;
    }
    interface Dashboard {
        /**
         * Specify "dashboard"
         */
        pageType: "dashboard";

        /**
         * The ID of the dashboard to load. If you don't specify the ID, navigates to the default dashboard.
         */
        dashboardId?: string;
    }
    
    interface CustomPage {
        /**
         * The type of the page.
         */
        pageType: "custom";

        /**
         * The logical name of the custom page to open.
         */
        name: string;

        /**
         * The logical name of the table to be made available in the custom page via Param("entityName").
         */
        entityName?: string;

        /**
         * ID of the table record to be made available in the custom page via Param("recordId").
         */
        recordId?: string;
    }
    
    const enum NavigationOptionsTarget {
        PageInline = 1,
        Dialog = 2,
    }

    type SizeValueUnit = "%" | "px";

    interface SizeValue {
        /**
         * The numerical value.
         */
        value: number;

        /**
         * The unit of measurement.Specify "%" or "px".Default value is "px".
         */
        unit: SizeValueUnit;
    }

    const enum NavigationOptionsPosition {
        Center = 1,
        Side = 2,
    }

    interface NavigationOptions {
        /**
         * Specify 1 to open the page inline; 2 to open the page in a dialog. Entity lists can only be opened inline; web resources can be opened either inline or in a dialog
         */
        target: NavigationOptionsTarget;

        /**
         * The width of dialog. To specify the width in pixels, just type a numeric value. To specify the width in percentage, specify an object of type SizeValue
         */
        width?: number | SizeValue;

        /**
         * The height of dialog. To specify the width in pixels, just type a numeric value. To specify the width in percentage, specify an object of type SizeValue
         */
        height?: number | SizeValue;

        /**
         * Specify 1 to open the dialog in center; 2 to open the dialog on the side. Default is 1 (center).
         */
        position?: NavigationOptionsPosition;

        /**
         * The dialog title on top of the center or side dialog.
         */
        title?: string;
    }

    /**
     * Contains methods for multi-page dialogs and task flow, and some methods moved from the Xrm.Utility namespace.
     */
    interface Navigation {
        /**
         * Navigates to the specified page.
         * @param pageInput Input about the page to navigate to. The object definition changes depending on the type of page to navigate to: entity list or HTML web resource.
         * @param navigationOptions Options for navigating to a page: whether to open inline or in a dialog. If you don't specify this parameter, page is opened inline by default.
         */
        navigateTo(pageInput: EntityRecord | EntityList | WebResource | Dashboard | CustomPage, navigationOptions?: NavigationOptions): Promise<undefined>;

        /**
         * Displays an alert dialog containing a message and a button.
         * @param alertStrings The string to be used in the alert dialog.
         * @param alertOptions The height and width options for alert dialog.
         */
        openAlertDialog(alertStrings: AlertStrings, alertOptions?: SizeOptions): Promise<undefined>;

        /**
         * Displays a confirmation dialog box containing a message and two buttons.
         * @param confirmStrings The strings to be used in the confirmation dialog.
         * @param confirmOptions The height and width options for confirmation dialog.
         */
        openConfirmDialog(confirmStrings: ConfirmStrings, confirmOptions?: SizeOptions): Promise<ConfirmDialogResult>;

        /**
         * Displays an error dialog.
         * @param errorOptions An object to specify the options for error dialog.
         * Either errorCode or message must be sat.
         */
        openErrorDialog(errorOptions: ErrorOptions): Promise<undefined>;

        /**
         * Opens a file.
         * @param file An object describing the file to open.
         * @param openFileOptions Specify whether to open or save the file.
         */
        openFile(file: Xrm.File, openFileOptions?: OpenFileOptions): void;

        /**
         * Opens an entity form or a quick create form.
         * @param entityFormOptions Entity form options for opening the form.
         * @param formParameters A dictionary object that passes extra parameters to the form.
         * See examples at: https://docs.microsoft.com/en-us/dynamics365/customer-engagement/developer/set-field-values-using-parameters-passed-form
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        openForm(entityFormOptions: EntityFormOptions, formParameters?: any): Then<OpenFormResult | undefined>;

        /**
         * Opens a URL, including file URLs.
         * @param url URL to open.
         * @param openUrlOptions Options to open the URL.
         */
        openUrl(url: string, openUrlOptions: SizeOptions): void;

        /**
         * Opens an HTML web resource.
         *
         * @param webResourceName The name of the HTML web resource to open.
         * @param windowOptions Window options for opening web resource.
         * @param data Data to be passed into the data parameter.
         */
        openWebResource(webResourceName: string, windowOptions?: WindowOptions, data?: string): void;
    }

    /**
     * Contains methods for displaying and hiding app-level global notifications.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface UI { }

    interface WebApiBase {
        /**
         * Creates an entity record.
         * We recommend using XrmQuery instead of this interface.
         * @param entityLogicalName Logical name of the entity you want to create. For example: "account".
         * @param data A JSON object defining the attributes and values for the new entity record.
         * See examples at: https://docs.microsoft.com/en-us/dynamics365/customer-engagement/developer/clientapi/reference/xrm-webapi/createrecord
         */
        createRecord(entityLogicalName: string, data: object): Promise<Lookup>;

        /**
         * Deletes an entity record.
         * We recommend using XrmQuery instead of this interface.
         * @param entityLogicalName The entity logical name of the record you want to delete. For example "account".
         * @param id GUID of the entity record you want to delete.
         */
        deleteRecord(entityLogicalName: string, id: string): Promise<Lookup>;

        /**
         * Retrieves an entity record.
         * We recommend using XrmQuery instead of this interface.
         * @param entityLogicalName The entity logical name of the records you want to retrieve. For example: "account".
         * @param id GUID of the entity record you want to retrieve.
         * @param options OData system query options, $select and $expand, to retrieve your data.
         * See examples at: https://docs.microsoft.com/en-us/dynamics365/customer-engagement/developer/clientapi/reference/xrm-webapi/retrieverecord
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        retrieveRecord(entityLogicalName: string, id: string, options?: string): Promise<any>;

        /**
         * Retrieves a collection of entity records.
         * We recommend using XrmQuery instead of this interface.
         * @param entityLogicalName The entity logical name of the records you want to retrieve. For example: "account".
         * @param options OData system query options or FetchXML query to retrieve your data.
         * See examples at: https://docs.microsoft.com/en-us/dynamics365/customer-engagement/developer/clientapi/reference/xrm-webapi/retrievemultiplerecords
         * @param maxPageSize Specify a positive number that indicates the number of entity records to be returned per page. If you do not specify this parameter, the default value is passed as 5000.
         * If the number of records being retrieved is more than the specified maxPageSize value, nextLink attribute in the returned promise object will contain a link to retrieve the next set of entities.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        retrieveMultipleRecords(entityLogicalName: string, options?: string, maxPageSize?: number): Promise<any>;

        /**
         * Updates an entity record.
         * We recommend using XrmQuery instead of this interface.
         * @param entityLogicalName The entity logical anem of the record you want to update. For example "account".
         * @param id GUID of the entity record you want to update.
         * @param data A JSON object containing key, value pairs where key is the property of the entity and value is the value of the property you want to update.
         * See examples at: https://docs.microsoft.com/en-us/dynamics365/customer-engagement/developer/clientapi/reference/xrm-webapi/updaterecord
         */
        updateRecord(entityLogicalName: string, id: string, data: object): Promise<Lookup>;
    }

    interface WebApiOffline extends WebApiBase {
        /**
         * Returns a boolean value indicating whether an entity is offline enabled.
         * We recommend using XrmQuery instead of this interface.
         * @param entityLogicalName Logical name of the entity. For example: "account".
         */
        isAvailableOffline(entityLogicalName: string): boolean;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface WebApiResponse extends Response { }

    interface WebApiOnline extends WebApiBase {
        /**
         * Execute a single action, function, or CRUD operation.
         * We recommend using XrmQuery instead of this interface.
         * @param request Object that will be passed to the Web API endpoint to execute an action, function, or CRUD request.
         * The object exposes a getMetadata method that lets you define the metadata for the action, function or CRUD request you want to execute.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        execute(request: any): Promise<WebApiResponse>;

        /**
         * Execute a collection of action, function, or CRUD operations.
         * If you want to execute multiple requests in a transaction, you must pass in a change set as a parameter to this method.
         * Change sets represent a collection of operations that are executed in a transaction.
         * You can also pass in individual requests and change sets together as parameters to this method.
         * We recommend using XrmQuery instead of this interface.
         * @param requests An array of requests and changesets. Requests are the same as for execute. Changesets are arrays of requests that will be executed in transaction.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        executeMultiple(requests: any): Promise<WebApiResponse[]>;
    }

    /**
     * Contains methods for performing CRUD operations on records; automatically switches between online and offline mode.
     * We recommend using XrmQuery instead of this interface
     */
    interface WebApi extends WebApiBase {
        /**
         * We recommend using XrmQuery instead of this interface
         */
        online: WebApiOnline;

        /**
         * We recommend using XrmQuery instead of this interface
         */
        offline: WebApiOffline;
    }

    interface LookupOptionsFilter {
        /**
         * The FetchXML filter element to apply.
         */
        filterXml: string;

        /**
         * The entity type to which to apply this filter.
         */
        entityLogicalName: string
    }

    interface LookupOptions {
        /**
         * Indicates whether the lookup allows more than one item to be selected.
         */
        allowMultiSelect?: boolean;

        /**
         * The default entity type to use.
         */
        defaultEntityType?: string;

        /**
         * The default view to use.
         */
        defaultViewId?: string;

        /**
         * Decides whether to display the most recently used(MRU) item. Available only for Unified Interface.
         */
        disableMru?: boolean;

        /**
         * The entity types to display.
         */
        entityTypes?: string[];

        /**
         * Used to filter the results. Each object in the array contains the following attributes.
         */
        filters?: LookupOptionsFilter[];

        /**
         * Indicates whether the lookup control should show the barcode scanner in mobile clients.
         */
        showBarcodeScanner?: boolean;

        /**
         * The views to be available in the view picker. Only system views are supported.
         */
        viewIds?: string[];
    }

    /**
     * Provides a container for useful methods.
     */
    interface Utility {
        /**
         * Closes a progress dialog box.
         * If no progress dialog is displayed currently, this method will do nothing.
         */
        closeProgressIndicator(): void;

        /**
         * Returns the valid state transitions for the specified entity type and state code.
         * @param entityName The logical name of the entity.
         * @param stateCode The state code to find out the allowed status transition values
         */
        getAllowedStatusTransitions(entityName: string, stateCode: number): Promise<number[] | null>;

        /**
         * Returns the entity metadata for the specified entity
         * @param entityName The logical name of the entity.
         * @param attributes The attributes to get metadata for.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getEntityMetadata(entityName: string, attributes?: string[]): Promise<any>;

        /**
         * Gets the global context.
         */
        getGlobalContext(): context;

        /**
         * Returns the name of the DOM attribute expected by the Learning Path (guided help) Content Designer for identifying UI controls in the Dynamics 365 Customer Engagement forms.
         * An attribute by this name must be added to the UI element that needs to be exposed to Learning Path (guided help).
         */
        getLearningPathAttributeName(): string;

        /**
         * Returns the localized string for a given key associated with the specified web resource.
         * @param webResourceName The name of the web resource.
         * @param key The key for the localized string.
         */
        getResourceString(webResourceName: string, key: string): string;

        /**
         * Invokes an action based on the specified parameters.
         * @param name of the process action to invoke.
         * @param parameters An object containing input parameters for the action. You define an object using key:value pairs of items, where key is of String type.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        invokeProcessAction(name: string, parameters?: any): Promise<undefined>;

        /**
         * Opens a lookup control to select one or more items.
         * @param lookupOptions Defines the options for opening the lookup dialog.
         */
        lookupObjects(lookupOptions: LookupOptions): Promise<Lookup[]>;

        /**
         * Refreshes the parent grid containing the specified record.
         * @param lookupOptions The record who's parent's grid to refresh.
         */
        refreshParentGrid(lookupOptions: Lookup): void;

        /**
         * Displays a progress dialog with the specified message.
         * Any subsequent call to this method will update the displayed message in the existing progress dialog with the message specified in the latest method call.
         * @param message The message to be displayed in the progress dialog.
         */
        showProgressIndicator(message: string): void;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-explicit-any
    interface PreProcessStatusChangeContext extends ExecutionContext<Process, any> { }

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface PreStageChangeContext extends ExecutionContext<Stage, StageChangeEventArguments> { }

    interface ProcessInstanceContext {
        CreatedOnDate: Date,
        ProccessDefinitionID: string,
        ProccessDefinitionName: string,
        ProcessInstanceID: string,
        ProcessInstanceName: string,
        StatusCodeName: string
    }

    interface ProcessModule {
        /**
         * Adds a function as an event handler for the OnPreProcessStatusChange event so that it will be called before the business process flow status changes.
         * @param handler The function to be executed when the business process flow status changes.
         *                The function will be added to the start of the event handler pipeline.
         *                The execution context is automatically passed as the first parameter to
         *                the function. See Execution context for more information.
         *                Use a reference to a named function rather than an
         *                anonymous function if you may later want to remove the
         *                event handler.
         * This client API is only supported on the Unified Client. The legacy web client does not support this client API.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addOnPreProcessStatusChange(handler: (context?: PreProcessStatusChangeContext) => any): void;

        /**
         * Removes an event handler from the OnPreProcessStatusChange event.
         * @param handler The function to be removed from the OnPreProcessStatusChange event.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        removeOnPreProcessStatusChange(handler: (context?: PreProcessStatusChangeContext) => any): void;

        /**
         * Adds a function as an event handler for the OnPreStageChange event so that it will be called before the business process flow stage changes.
         * @param handler The function that runs before the business process flow stage changes.
         *                The function will be added to the start of the event handler pipeline.
         *                The execution context is automatically passed as the first parameter
         *                to the function. See Execution context for more information.
         *                Use a reference to a named function rather than an
         *                anonymous function if you may later want to remove the
         *                event handler.
         * This client API is only supported on the Unified Client. The legacy web client does not support this client API.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addOnPreStageChange(handler: (context?: PreStageChangeContext) => any): void;

        /**
         * Removes an event handler from the OnPreStageChange event.
         * @param handler The function to be removed from the OnPreStageChange event.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        removeOnPreStageChange(handler: (context?: PreStageChangeContext) => any): void;

        /**
         * Returns all the process instances for the entity record that the calling user has access to.
         * @param handler The callback function is passed an object with the following attributes
         *                and their corresponding values as the key: value pair.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getProcessInstances(callbackFunction: (context?: ProcessInstanceContext) => any): void;

        /**
         * Sets a process instance as the active instance.
         * @param processInstanceid The Id of the process instance to set as the active instance.
         * @param callbackFunction A function to call when the operation is complete. This callback function is passed either string "succes" or "invalid" to indicate whether the operation succeeded:
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setActiveProcessInstance(processInstanceId: string, callbackFunction?: (succesOrInvalid: "success" | "invalid") => any): void;

        /**
         * Set a Process as the active process.
         *
         * @param processId The Id of the process to make the active process.
         * @param callback A function to call when the operation is complete. This callback function is passed one of the following string
         *    values to indicate whether the operation succeeded. Is "success" or "invalid".
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setActiveProcess(processId: string, callback?: (successOrInvalid: "success" | "invalid") => any): void;
    }

    /**
     * Form executionContext
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ExecutionContext<TSource, TArgs> {
        getFormContext(): Xrm.PageBase<Xrm.AttributeCollectionBase, Xrm.TabCollectionBase, Xrm.ControlCollectionBase>;
    }

    interface SaveOptions {
        /**
         * Specify a value indicating how the save event was initiated.
         * Note that setting the saveMode does not actually take the corresponding action; it is just to provide information to the OnSave event handlers about the reason for the save operation.
         */
        saveMode?: SaveMode;
    }

    /**
     * Interface for the data of a form.
     */
    interface DataModule<T extends AttributeCollectionBase> {
        /**
         * Collection of non-entity data on the form. Items in this collection are of the same type as the attributes collection, but they are not attributes of the form entity.
         */
        attributes: T;

        /**
         * Adds a function to be called when form data is loaded.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addOnLoad(myFunction: (context?: OnLoadEventContext) => any): void;

        /**
         * Gets a boolean value indicating whether the form data has been modified.
         */
        getIsDirty(): boolean;

        /**
         * Gets a boolean value indicating whether all of the form data is valid. This includes the main entity and any unbound attributes.
         */
        isValid(): boolean;

        /**
         * Removes a function to be called when form data is loaded.
         */
        // eslint-disable-next-line @typescript-eslint/ban-types
        removeOnLoad(myFunction: Function): void;

        /**
         * Asynchronously refreshes and optionally saves all the data of the form without reloading the page.
         *
         * @param save true if the data should be saved after it is refreshed, otherwise false.
         */
        refresh(save?: boolean): Promise<undefined>;

        /**
         * Saves the record asynchronously with the option to set callback functions to be executed after the save operation is completed.
         *
         * @param saveOptions This option is only applicable when used with appointment, recurring appointment, or service activity records.
         */
        save(saveOptions?: SaveOptions): Promise<undefined>;
    }

    /**
     * Specify options for saving the record. If no parameter is included in the method, the record will simply be saved. This is the equivalent of using the Save command.
     * You can specify one of the following values:
     * - saveandclose: This is the equivalent of using the Save and Close command.
     * - saveandnew: This is the equivalent of the using the Save and New command
     */
    type saveOption = "saveandclose" | "saveandnew";

    /**
     * Interface for the entity on a form.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface PageEntity<T extends AttributeCollectionBase> {
        /**
         * Returns a lookup value that references the record.
         */
        getEntityReference(): Lookup;

        /**
         * Gets a boolean value indicating whether all of the entity data is valid.
         */
        isValid(): boolean;

        /**
         * Saves the record synchronously with the options to close the form or open a new form after the save is completed.
         */
        save(saveOptions?: saveOption): void;
    }

    /**
     * Interface for an standard entity attribute.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Attribute<T> {

        /**
         * Returns a boolean value to indicate whether the value of an attribute is valid.
         */
        isValid(): boolean;
    }

    /**
     * Interface for the ui of a form.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface UiModule<T extends TabCollectionBase, U extends ControlCollectionBase> {
        /**
         * Adds a function to be called on the form OnLoad event.
         * @param myFunction The function to be executed on the form OnLoad event. The function will be added to the bottom of the event handler pipeline.
         * The execution context is automatically passed as the first parameter to the function. See Execution context for more information.
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addOnLoad(myFunction: (context?: OnLoadEventContext) => any): void;

        /**
         * Removes a function from the form OnLoad event.
         * @param myFunction The function to be removed from the form OnLoad event.
         */
        // eslint-disable-next-line @typescript-eslint/ban-types
        removeOnLoad(myFunction: Function): void;
    }

    interface dateFormattingInfo {
        AMDesignator: string;
        Calendar: Calendar;
        DateSeparator: string;
        FirstDayOfWeek: number;
        CalendarWeekRule: number;
        FullDateTimePattern: string;
        LongDatePattern: string;
        LongTimePattern: string;
        MonthDayPattern: string;
        PMDesignator: string;
        RFC1123Pattern: string;
        ShortDatePattern: string;
        ShortTimePattern: string;
        SortableDateTimePattern: string;
        TimeSeparator: string;
        UniversalSortableDateTimePattern: string;
        YearMonthPattern: string;
        AbbreviatedDayNames: string[];
        ShortestDayNames: string[];
        DayNames: string[];
        AbbreviatedMonthNames: string[];
        MonthNames: string[];
        IsReadOnly: boolean;
        NativeCalendarName: string;
        AbbreviatedMonthGenitiveNames: string[];
        MonthGenitiveNames: string[];
        eras: (null | number | string)[];
    }

    interface Calendar {
        MinSupportedDateTime: string;
        MaxSupportedDateTime: string;
        AlgorithmType: number;
        CalendarType: number;
        Eras: number[];
        TwoDigitYearMax: number;
        IsReadOnly: boolean;
    }

    interface userSettings {
        /**
         * The name of the current user.
         */
        dateFormattingInfo: dateFormattingInfo;

        /**
         * Returns the ID of the default dashboard for the current user.
         */
        defaultDashboardId: string;

        /**
         * Indicates whether high contrast is enabled for the current user.
         */
        isGuidedHelpEnabled: boolean;

        /**
         * Indicates whether guided help is enabled for the current user..
         */
        isHighContrastEnabled: boolean;

        /**
         * Indicates whether the language for the current user is a right-to-left (RTL) language.
         */
        isRTL: boolean;

        /**
         * The LCID value that represents the provisioned language that the user selected as their preferred language.
         */
        languageId: number;

        /**
         * The name of the current user.
         */
        userName: string;

        /**
         * Returns the difference between the local time and Coordinated Universal Time (UTC).
         */
        getTimeZoneOffsetMinutes(): number;

        /**
         * The GUID of the SystemUser.Id value for the current user.
         */
        userId: string;
    }

    interface organizationSettings {
        /**
         * Returns whether Autosave is enabled for the organization.
         */
        getIsAutoSaveEnabled(): boolean;

        /**
         * The language code identifier (LCID) value that represents the base language for the organization.
         */
        languageId: number;

        /**
         * The unique text value of the organization?s name.
         */
        uniqueName: string;
    }

    interface appProperties {
        appId: string;
        displayName: string;
        uniqueName: string;
        url: string;
        webResourceId: string;
        webResourceName: string;
        welcomePageId: string;
        welcomePageName: string;
    }

    interface context {
        /**
         * Returns information about the current user settings.
         */
        userSettings: userSettings;

        /**
         * Returns information about the current organization settings.
         */
        organizationSettings: organizationSettings;

        /**
         * Returns the URL of the current business app in Customer Engagement.
         */
        getCurrentAppUrl(): string;

        /**
         * Returns the name of the current business app in model-driven apps.
         */
        getCurrentAppName(): Promise<string>;

        /**
         * Returns the properties of the current business app in model-driven apps.
         */
        getCurrentAppProperties(): Promise<appProperties>;

        /**
         * Returns the version number of the model-driven apps instance.
         */
        getVersion(): string;

        /**
         * Returns the relative URL with the caching token for the specified web resource.
         */
        getWebResourceUrl(webResourceName: string): string;

        /**
         * Returns a boolean value indicating if the model-driven apps instance is hosted on-premises or online.
         */
        isOnPremises(): boolean;
    }

    /**
     * Interface for an MultiSelectOptionSet attribute.
     */
    interface MultiSelectOptionSetAttribute<T> extends Attribute<T[]> {
        /**
         * Collection of controls associated with the attribute.
         */
        controls: Collection<MultiSelectOptionSetControl<T>>;

        /**
         * Returns a value that represents the value set for a MultiSelectOptionSet when the form opened.
         */
        getInitialValue(): T | null;

        /**
         * Returns an array of string values of the text for the currently selected options for a multiselectoptionset attribute.
         */
        getText(): string[] | null;

        /**
         * Returns an option object with the value matching the argument passed to the method.
         */
        getOption(value: string): Option<T> | null;

        /**
         * Returns an option object with the value matching the argument passed to the method.
         */
        getOption(value: T): Option<T> | null;

        /**
         * Returns an array of option objects representing the valid options for an option-set attribute.
         */
        getOptions(): Option<T>[];

        /**
         * Returns the option object that is selected in an optionset attribute.
         */
        getSelectedOption(): Option<T>[] | null;
    }

    /**
     * Interface for an MultiSelectOptionSet form control.
     */
    interface MultiSelectOptionSetControl<T> extends Control<MultiSelectOptionSetAttribute<T>> {
        /**
         * Adds an option to an option set control.
         *
         * @param option An option object to add to the OptionSet.
         * @param index The index position to place the new option in. If not provided, the option will be added to the end.
         */
        addOption(option: Option<T>, index?: number): void;

        /**
         * Clears all options from an option set control.
         */
        clearOptions(): void;

        /**
         * Removes an option from an option set control.
         *
         * @param number The value of the option you want to remove.
         */
        removeOption(number: number): void;
    }

    interface LookupControl<T extends string> extends Control<LookupAttribute<T>> {
        /**
         * Use this method to set which entity types the lookup control will show the user
         */
        setEntityTypes(entityTypes: string[]): void;

        /**
         * Use this method to get which entity types the lookup control will show the user
         */
        getEntityTypes(): string[];
    }

    const enum GridType {
        HomePageGrid = 1,
        Subgrid = 2,
    }

    const enum SubGridControlClientType {
        Browser = 0,
        MobileApplication = 1,
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface SubGridControl<T extends string> extends BaseControl {
        /**
         * Gets the FetchXML query that represents the current data, including filtered and sorted data, in the grid control.
         */
        getFetchXml(): string;

        /**
         * Gets the FetchXML query that represents the current data, including filtered and sorted data, in the grid control.
         */
        getRelationship(): EntityFormRelationship;

        /**
         * Gets information about the relationship used to filter the subgrid.
         */
        getGridType(): GridType;

        /**
         * Gets the URL of the current grid control.
         */
        getUrl(client?: SubGridControlClientType): string;

        /**
         * Gets the URL of the current grid control.
         */
        openRelatedGrid(): void;

        /**
         * Refreshes the ribbon rules for the grid control.
         */
        refreshRibbon(): void;
    }

    interface GridRow<T extends string> {
        /**
         * A collection containing the GridRowData for the GridRow.
         */
        data: GridRowData<T>;
    }

    interface GridRowData<T extends string> {
        /**
         * Returns the GridEntity for the GridRowData.
         */
        entity: GridEntity<T>;
    }

    interface GridEntity<T extends string> {
        /**
         * Each attribute (GridAttribute) represents the data in the cell of an editable grid,
         * and contains a reference to all the cells associated with the attribute.
         */
        attributes: GridCollection<GridEntityAttribute<T>>;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-interface
    interface GridCollection<T> {
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-interface
    interface GridEntityAttribute<T extends string> {
    }

    type AddNotificationLevel = "RECOMMENDATION" | "ERROR";

    interface actionsObject {
        message?: string;
        actions?: Function[]; // eslint-disable-line @typescript-eslint/ban-types
    }

    interface AddNotificationObject {
        actions?: actionsObject[];
        messages: string[];
        notificationLevel: AddNotificationLevel;
        uniqueId: string;
    }

    interface BaseControl {
        addNotification(notification: AddNotificationObject): void;
    }
    interface ExternalControl {
        /**
         * Returns the content window that represents an IFRAME or web resource.
         */
        getContentWindow(): Promise<any>;
    }

    interface NavigationBehaviorObject {
        allowCreateNew(): boolean
    }

    interface Stage {
        /**
         * Returns a navigation behavior object for a stage that can be used to define whether the Create button is available for users to create other entity record in a cross-entity business process flow navigation scenario.
         */
        getNavigationBehavior(): NavigationBehaviorObject;
    }

    interface StageStep {
        /**
         * Returns the progress of the action step.
         */
        getProgress(): number;

        /**
         * Updates the progress of the action step.
         * @param stepProgress number value specifying the step progress:
         * 0: None
         * 1: Processing
         * 2: Completed
         * 3: Failure
         * 4: Invalid
         * @param message An optional message that is set as the Alt text on the icon for the step.
         */
        setProgress(stepProgress: number, message?: string): string;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Xrm<T extends Xrm.PageBase<Xrm.AttributeCollectionBase, Xrm.TabCollectionBase, Xrm.ControlCollectionBase>> extends BaseXrm {
    Device: Xrm.Device;
    Encoding: Xrm.Encoding;
    Navigation: Xrm.Navigation;
    //UI: Xrm.UI;
    WebApi: Xrm.WebApi;
}
