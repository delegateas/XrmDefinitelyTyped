# Release Notes

### 5.1.1 - February 13 2020
* Fix assembly reference issue when calling from Daxif

### 5.1.0 - February 11 2020
* Fixed casing error in PageInput - webResourceName
* Added support for client secret authentication

### 5.0.1 - January 28 2020
* Added getAttribute().setIsValid
* Fixed JSDoc for getAttribute().isValid

### 5.0.0 - January 10 2020
* Reworked typings of ExecutionContext to accommodate different getEventArgs and getEventSource (@sergeytunnik)
* Added typings for Xrm.Navigation.navigateTo (@mathiasbl)

### 4.4.6 - December 19 2019
* Added grid control methods and user settings properties (@mathiasbl)

### 4.4.4 - November 22 2019
* Fix issue with ts compiler issue due to form context containing invalid type "NoAttribute" due to bad metadata

### 4.4.3 - November 12 2019
* WebApi execute method now returns Fetch API Response object(@sergeytunnik)
* AlertStrings typing now supports title

### 4.4.2 - November 01 2019
* Added return void types to implicit any (@mathiasbl)
* Added support for property accesses data on Subgrids (@mkholt)

### 4.4.1 - October 16 2019
* Fixed a bug with the typings for Xrm.Navigation.openForm (@sergeytunnik)

### 4.4.0 - September 24 2019
* Added support for MFA (@StevenRasmussen)

### 4.3.14 - September 13 2019
* Added missing short-hands for BPF typings

### 4.3.13 - August 13 2019
* Fix bug where some formatted values replaced the base value instead of including the formatted value

### 4.3.12 - June 26 2019
* Added typings for getCurrentAppUrl() on the global context

### 4.3.11 - June 26 2019
* Added typings for getEntityTypes() on LookupControl (@CoreySutton)

### 4.3.10 - June 13 2019
* Fixed errors related to 4.3.6 with expand for the REST and Web API

### 4.3.9 - June 11 2019
* Fixed errors related to 4.3.6 with the REST API and expand for the Web API

### 4.3.8 - June 11 2019
* Fixed error with organization owned entities

### 4.3.7 - June 07 2019
* Added support for function `setEntityTypes` on lookup control (@san-86)

### 4.3.6 - June 07 2019
* It is now possible to set ownerId using XrmQuery. Using either .update or .associateSingle

### 4.3.5 - June 04 2019
* XrmQuery now checks for _guid at the end of the attribute name instead of guid in the name (@mdocter)

### 4.3.4 - May 28 2019
* Handled composite controls (address1_composite, address2_composite, fullname) not being available in UCI by marking them as possibly null

### 4.3.3 - May 24 2019
* Added support for emojis through labelMappings

### 4.3.2 - May 24 2019
* Fixed bug with stripGUID (@altmank)

### 4.3.1 - April 16 2019
* Fixed bug when using expand


### 4.3.0 - March 11 2019
* Added support for synchronous execution of XrmQuery. Should be used sparingly. (@majakubowski)

### 4.2.3 - March 05 2019
* Fixed error where .ts file was included for XrmQuery

### 4.2.2 - March 04 2019
* Fixed error where .d.ts file was missing for XrmQuery

### 4.2.1 - March 04 2019
* Fixed error in typings when generating for versions below 9.

### 4.2.0 - February 25 2019
* Add the following query functions to XrmQuery; `In`, `NotIn`, `Above`, `Under`, `UnderOrEqual`, `NotUnder`, `EqualUserId`, `NotEqualUserId`, `EqualBusinessId`, `NotEqualBusinessId`.
* Changed several Xrm functions to return promises instead of Then for version 9 and above.

### 4.1.0 - February 18 2019
* Added a more strict typing to Business Process Flow controls. This is a breaking change.
* Fixed a bug where typings were missing for fields from business process flows.

### 4.0.9 - February 18 2019
* Fixed errors with Xrm.WebAPI typings

### 4.0.8 - February 18 2019
* Fixed error where Xrm.Device.pickFile returned a single value instead of an array

### 4.0.7 - February 18 2019
* Added Xrm.ProcessModule.addOnProcessStatusChange (@majakubowski)
* Added Xrm.ProcessModule.removeOnProcessStatusChange (@majakubowski)
* Added Xrm.Process.getStatus (@majakubowski)

### 4.0.6 - January 17 2018
* Xrm.Utility.lookupObjects now returns an array of lookups (@mathiasbl)

### 4.0.5 - January 16 2018
* Added missing methods under Xrm.Encoding (@mathiasbl)

### 4.0.4 - September 14 2018
* Added option to include lookup properties (@pederwagner)

### 4.0.3 - September 14 2018
* Fixed LCID enums (problem with spaces and special characters)

### 4.0.2 - August 17 2018
* Bug fix

### 4.0.1 - August 17 2018
* Reduced the amount of proxies connected to an environment
* Bug fixes

### 4.0.0 - August 10 2018
* Only generates typings for active forms by default, added option sif to allow generation of inactive forms. Credit to PR #70

### 3.0.2 - August 10 2018
* Multiselect Optionsets are now supported.
* Added associate and disassociate support to XrmQuery

### 3.0.1 - July 18th 2018
* FormIntersects are now once again generated properly.

### 3.0.0 - July 13th 2018
* ViewIntersects added, functions just like form intersects, but for views. #55
* Typings are now generated for the logicalnames in entityreferences, as suggested in #38 

### 2.6.2 - June 12th 2018
* Increased dependencies to recent versions (including using D365 v9 assemblies)
* Removed dependency to Microsoft.IdentityModel
* Fixed casing with openInNewWindow in EntityFormOptions

### 2.6.1 - March 02 2018
* Made #44 optional

### 2.6.0 - February 28 2018
* Fixed issue 44: Be Able To Define Custom Interface Definition Creation, https://github.com/delegateas/XrmDefinitelyTyped/issues/44

### 2.5.2 - January 15 2018
* Fixed an issue where in the case of the NavigationPropteryName attributes being null in the relationship metadata, the generated definition file was not valid typescript code. 

### 2.5.1 - January 05 2018
* Updated .NET framwork to 4.6.2 in order to fix issue with connecting to Dynamics 9.0

### 2.5.0 - December 15 2017
* REST API interfaces are now sorted

### 2.4.0 - November 24 2017
* Reverted the name change after a more elegant fix was proposed, in which the user uses the namespace feature of XDT.

### 2.3.12 - November 23 2017
* The WebEntities interface has been split up, as to comply with standards made in Typescript 2.4
* As a fix for clashing names with the standard Typescript library in 2.4-2.6, all entity interfaces have been postfixed with "XDT" - this is a breaking change.

### 2.4.0 - November 24 2017
* Reverted the name change after a more elegant fix was proposed, in which the user uses the namespace feature of XDT.

### 2.3.12 - November 23 2017
* The WebEntities interface has been split up, as to comply with standards made in Typescript 2.4
* As a fix for clashing names with the standard Typescript library in 2.4-2.6, all entity interfaces have been postfixed with "XDT" - this is a breaking change.

### 2.3.11 - November 09 2017
* XrmQuery now handles additional cases where Guid parentheses can occur.

### 2.3.10 - November 09 2017
* Views, LCIDs and webresource images are now properly generated based on generation settings instead of rawstate.
* Increased support for CRM 9.0.
* Header and footer controls will no longer be generated when using CRM 2011.
* Two Options formatted as Lists now get the proper type boolean instead of number.
* Made XrmQuery automatically remove Guid parenthesis, if they are there.

### 2.3.9 - October 13 2017
* Forms with duplicate names are named starting from 1
* Forms with duplicate names are ordered by their guid, to ensure a deterministic order

### 2.3.8 - October 13 2017
* Duplicate names in forms are now allowed

### 2.3.7 - October 12 2017
* Fixed issue with updating a datetime or date only field using XrmQuery

### 2.3.6 - October 10 2017
* All functionality in this release is only for CRM version 8.2 and above
* A new argument, "views", has been added. When set, all Views in the loaded solutions will be generated and put into the supplied namespace.
* The available languages installed in CRM are now retrieved and useable as an enum called LCID.
* The image web resources for the loaded solutions are now retrieved and useable as a union type called WebResourceImage.
* A helper function is now available for custom view icons and tooltips introduced in CRM 8.2.

### 2.3.5 - September 6 2017
* A new argument, "useDeprecated", has been added that toggles whether to include or exclude deprecated functionality.
* The following functions have been moved into deprecation extensions due to the impending 9.0 release:
* Xrm.Page.context: getQueryStringParameters, getTimeZoneOffsetMinutes, getUserId, getUserLcid, getUserName, getUserRoles, getIsAutoSaveEnabled, getOrgLcid, getOrgUniqueName
* addOnKeyPress removeOnKeyPress, showAutoComplete, hideAutoComplete
* Xrm.Utility: alertDialog, confirmDialog, isActivityType, openEntityForm, openQuickCreate, openWebResource

### 2.3.4 - September 5 2017
* isOutlookClient() and isOutlookOnline() now correctly appears when using CRM 2011
* Xrm.Page.ui.process and OptionSetControl.getOptions() which where introduced in CRM 2015, no longer appears in previous versions
* Xrm.Page.data.process which where introduced in CRM 2016, no longer appears in previous versions

### 2.3.3 - September 1 2017
* Additonal form programming methods introduced in CRM 2013 as well as some introduced in CRM 2015, no longer appear when using CRM 2011

### 2.3.2 - August 29 2017
* Fixed a bug when generating typings for 2011

### 2.3.1 - August 29 2017
* Form programming methods introduced in CRM 2013 no longer appear when using CRM 2011

### 2.3.0 - July 19 2017
* Updated XrmQuery to be compatible with TypeScript 2.4.1

### 2.2.4 - June 29 2017
* Added new methods to grid control which are found in newer versions (i.e. `getAttributes()`)
* Moved `setDisabled` and `getDisabled` from the `BaseControl` interface to the `Control` interface
* Made an `AnyControl` type which collections of controls use instead of the `BaseControl` type

### 2.2.3 - June 29 2017
* Fix: Promise polyfill was not being included properly in the new gulp compilation setup

### 2.2.2 - June 28 2017
* Bind variables are now generated based on N:1 relationships, instead of Lookup attributes

### 2.2.1 - June 23 2017
* Fixed filtering and ordering by entity references in XrmQuery for the Web API

### 2.2.0 - June 20 2017
* Added some of the new Dynamics 365 form functionality
* `SDK.REST.retrieveRecord` now allows `null` values in the select and expand parameters
* `double` attributes are now typed as `number`s instead of `string`s for both endpoints
* `decimal` attributes are now typed as `number`s in the WebAPI, and as `string`s in the old REST endpoint
* Fixed generated output when targeting all entities

### 2.1.2 - May 24 2017
* Fixed bug when trying to access elements in the `Xrm`-namespace, while using `declare var Xrm: Xrm<...>`
* Replaced all returns of the `Empty...` interfaces with the `undefined` type

### 2.1.1 - May 20 2017
* Fixed creation of typings directories

### 2.1.0 - May 17 2017
* Removed NuGet dependencies and added necessary assemblies directly as files -- making it easy to use the tool straight from NuGet
* New argument `oneFile` makes XrmDefinitelyTyped concatenate all the dynamic parts of the typings into one file `context.d.ts`
* Automatic generation of config file, if one does not exist and no arguments are passed to executable
* Fixed automatic CRM version check
* General clean-up of code and structure

### 2.0.7 - February 7 2017
* `Result` and `FormattedResult` interfaces were incorrectly initialized for retrieve queries
* Removed string type as a valid parameter in certain function definitions of `xrm.d.ts`

### 2.0.6 - January 20 2017
* Made `boolean` a valid filter type in the Web API 

### 2.0.5 - January 10 2017
* Fix: `Filter.substringof` changed to be `Filter.contains` in the Web API
* Added matching generic return type on `promise()` of Query
* Helper function `promiseRequest` method now also correctly returns the promise

### 2.0.4 - December 16 2016
* Promises now works properly in all cases

### 2.0.3 - December 15 2016
* Generation of lib and declaration files is now properly skipped if they are not specified in the configuration

### 2.0.2 - December 8 2016
* Fix: Intersection entity interfaces were not generated properly for the Web API (no entity set name)

### 2.0.1 - December 8 2016
* More robust usage of `GetGlobalContext()`, since CRM will bug out in certain cases when it is executed

### 2.0.0 - December 2 2016
* [**The Web API is now supported**](xrmquery-web.html)
* Generation of REST and Web API entity interfaces is now opt-in, and they can be namespaced
* Generation of `Form` interfaces can now be skipped
* The `XrmQuery` functionality for the REST endpoint has been moved into `XrmQuery.Rest`
* The filter functionality for the REST endpoint has been moved into `Filter.Rest`
* `base.d.ts` has been renamed to `xrm.d.ts`
* Interfaces from the `IPage` namespace have been moved to the `Xrm` namespace
* `IPage` entity interfaces have been deprecated in favor of intersection forms
* It can now generate the context from a local metadata file via the new `save`- and `load`-arguments
* JavaScript library files (XrmQuery) can now be automatically updated when generating the context with the `jsLib`-argument

### 1.11.1 - November 1 2016
* Better handling of tabs and sections when intersecting forms

### 1.11.0 - October 6 2016
* Added union types throughout the generated declaration files to make it usable with TypeScript's `strictNullChecks`.
* ***XrmQuery update*** (new javascript code): 
  * Added `getAll` function to RetrieveMultipleRecords which concatenates all page results and serves it to the success callback.
  * Changed `execute` function of RetrieveMultipleRecords to have obligatory `errorCallback` and `onComplete` handlers to promote proper usage of paged results.

### 1.10.0 - September 5 2016
* Added the possibility of generating special declaration files, which are intersections of multiple forms.

### 1.9.1 - August 29 2016
* Fix: Removed the newly version-controlled function `addTabStateChange` from the base declaration file

### 1.9.0 - August 29 2016
* Split `base.d.ts` into more parts
* XrmDefinitelyTyped now retrieves the version from the targeted CRM and modifies the resulting `base.d.ts` to fit that version
  * Made AddTabStateChange function for specific CRM versions (Pre-CRM2016: `add_tabStateChange`, Post-CRM2016: `addTabStateChange`)
  * Made CRM 2015 Update 1 form functionality only available, when CRM is that version or higher
* Added more specific types when getting controls on an attribute via `<Attribute>.controls`
* Changed `IPage` module to be a namespace instead
* Made `IPage.ExecutionContext` generic, such that it contains the type of the event source

### 1.8.0 - August 2 2016
* Removed current implementation for supporting previous TypeScript versions
* Made use of string literal types for certain functions in base.d.ts
* Better error messages when encountering AggregateExceptions
* ***XrmQuery update*** (new javascript code): 
  * Added `getFirst` function to RetrieveMultipleRecords

### 1.7.9 - July 4 2016
* Added support for entities and option sets sharing the same name
* ***XrmQuery updates*** (new javascript code):
  * Fixed attribute select in expanded entities
  * Added new filter functions to make it easier to make chained conjunctions: `Filter.ors`, `Filter.ands`
  * Added new functions to RetrieveMultiple that make it possible to extend the current filter: `.orFilter` or `.andFilter`

### 1.7.8 - June 22 2016
* Fixed variable name: `Xrm.Page.ui.FormSelector` -> `Xrm.Page.ui.formSelector`

### 1.7.7 - June 21 2016
* Fixed bug in XrmQuery when using IE in which it would fail to execute in certain cases
* Changed `getInitialValue()` of option-sets to also return the corresponding enum value

### 1.7.6 - June 15 2016
* Changed the `Option` interface to be generic based on the type of the parent attribute/control
* Updated base.d.ts with more types to allow the use of `noImplicitAny` in the TypeScript compiler
* Added a few missing functions to base.d.ts

### 1.7.5 - May 3 2016
* Added CRM version check for BPF fields in order to support CRM2011

### 1.7.4 - February 24 2016
* Added "***/useconfig***" argument, see [usage for more information](tool-usage.html#Configuration-file)
* Renamed "***/config***" argument to "***/genconfig***"
* Changed exit-code for the executable to be 1 instead of 0, when it encounters an exception

### 1.7.3 - February 16 2016
* Added support for the new CRM 2016 form types
* Added version print when using the executable
* Added "***/config***" argument which generates a dummy configuration file to use

### 1.7.2 - December 29 2015
* Improved retrieval of CRM metadata

### 1.7.1 - December 21 2015
* Added CRM Online 2015 Update 1 functionality to subgrid controls

### 1.7.0 - December 18 2015
* Added filtering of which entities should be included in the context, see 
  [usage for more information](tool-usage.html).
* Fixed a missing generic type declaration on certain controls of type `OptionSetControl`
* Reduced version requirements to support backward-compatibility:
  * Reduced requirement of the dependency `Microsoft.CrmSdk.CoreAssemblies` to 5.0.18 or greater
  * Reduced used .NET Framework to version 4.5.2

### 1.6.0 - November 10 2015
* Added possibility of using `.exe.config` file to pass arguments
* Changed `IPage.Control` to be generic, depending on the attribute it contains
* Added `IPage.BaseControl` as a superclass to `IPage.Control` that is non-generic and has no
  `getAttribute()` function.
* Added `IPage.StringControl` and `IPage.NumberControl` as shorthand names for their corresponding
  attribute controls
* Updated entity IPage interfaces with new control types

### 1.5.6 - October 23 2015
* Added the attributes and controls that come along when `addressX_composite` is on a form
* Added interface `IPage.LookupAttribute` as a shorthand name for `IPage.Attribute<IPage.EntityReference[]>`

### 1.5.5 - September 30 2015
* Code refactoring in preparation for open-sourcing the project

### 1.5.4 - September 29 2015
* Added numbering to controls when there are multiple of the same field on a form
* Added `getAttribute` to form controls

### 1.5.3 - August 31 2015
* Changed to use more robust Date object check in XrmQuery (updated javascript files)

### 1.5.2 - August 27 2015
* Updated to use Microsoft.CrmSdk.CoreAssemblies 7.1.1
* Made XrmQuery and the SDK entities use enums instead of just numbers
* Altered the type when selecting XrmQuery `expand` attributes

### 1.5.1 - August 24 2015
* Added support for using `Date` objects when filtering in XrmQuery (updated javascript files)
* Added execution context object to the handler passed to `addOnChange` 

### 1.5.0 - August 19 2015
* Now generates declaration files for the newest TypeScript version
* New argument `tsversion` to specify which TypeScript version it should generate files for (newest version is default)
* All word characters are now allowed in declaration names
* Added check for empty string declarations, outputting `_Unknown` instead
* Eliminated duplicates of global enums and removed the obsolete file `optionsets.d.ts`
* Fixed escape of string literals that contained single/double quotes

### 1.4.4 - August 11 2015
* Fixed an incorrectly named function.

### 1.4.3 - August 11 2015
* Added interfaces for the `Xrm.Page.data.process` and `Xrm.Page.ui.process` objects.
* Changed an interface for the XrmQuery `expand` function.

### 1.4.2 - July 31 2015
* Fixed an incorrectly assigned interface

### 1.4.1 - July 31 2015
* New entity interfaces specifically for XrmQuery to ensure input correctness
* Updated `dg.xrmquery.js` and `dg.xrmquery.min.js`

### 1.4.0 - July 30 2015
* Added [XrmQuery](xrmquery-usage.html)

### 1.3.0 - July 23 2015
* Changed to use .NET Framework 4.6
* Added Business Process Flow fields to forms
* Added more functionality to `addOnSave` on forms
* Added missing functionality to `Xrm.Page.ui`

### 1.2.2 - July 21 2015
* Updated to use Microsoft.CrmSdk.CoreAssemblies 7.1.0
* Added more functionality to lookup controls

### 1.2.1 - July 7 2015
* `GetContext` now throws an exception when called programatically and an error occurs

### 1.2.0 - June 15 2015
* Separated declarations for `SDK.Metadata.js` into a new file `metadata.d.ts`.
* Added more specific declarations for the types gotten via Metadata calls
* Added install script for the NuGet package, which automatically copies the required DLLs into the same folder upon installation

### 1.1.2 - May 22 2015
* Fixed type of Money attributes sent and received through the REST API.

### 1.1.1 - May 7 2015
* Made the OptionSet attributes use the type of the actual corresponding 
  TypeScript enum instead of just the type `number`
* Fixed type of OptionSet attributes for `SDK.REST` calls.
* Fixed type of some TwoOption attributes for Form declaration files.
* Fixed bug when duplicates of the same field existed on a form.

### 1.1.0 - April 23 2015
* Introduced a new declaration file for each specific form.
  [Read more here.](xrm-dts-usage.html)
  - The previous IPage declaration files are still being generated in case 
    they are necessary.
  - Changes to `base.d.ts` to comply with the new Form declaration files
* Added docs to most of the base functionality.

### 1.0.1.1 - April 10 2015
* Updated some attribute types to be more specific
* Added generic Xrm<T> interface for different pages
* Added executable usage description
* Better executable error messages

### 1.0.1 - April 8 2015
* Added more specific types to some attributes
* Added support for `deleteRecord`, `associateRecords` and `disassociateRecords`
* Removed attributes from entities which were not available via OData
* Changed NuGet package structure and added batch script to copy necessary assemblies

### 1.0.0 - April 7 2015
* Initial public release