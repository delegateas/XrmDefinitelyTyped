# Release Notes

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