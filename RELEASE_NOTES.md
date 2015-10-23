# Release Notes

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