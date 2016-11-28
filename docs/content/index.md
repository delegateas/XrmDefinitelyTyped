XrmDefintelyTyped
=================

XrmDefinitelyTyped generates [TypeScript](http://www.typescriptlang.org/) 
declaration files based on *your* Dynamics 365/CRM/xRM solution.

What is it?
-----------

It is the TypeScript equivalent of [CrmSvcUtil][crmsvcutil], but instead of generating early-bound .NET classes 
for server-side code, it generates TypeScript interfaces for all your client-side coding.

It generates data-specific declaration files for:

  * Entity types and attributes
  * Global and entity-specific option sets
  * The [Xrm object model][xrm] for client-side coding of forms and custom pages
  * The standard [SDK.REST.js][rest] API for querying CRM via [OData][odata].
  * The standard [SDK.MetaData.js][metadata] API for querying the metadata of CRM.
  * [XrmQuery][xrmquery], which uses the generated declaration files to make it
    possible to perform type-safe queries to CRM.

All this makes it possible to **catch bugs at compile-time** in your IDE (instead of at runtime on the CRM instance), 
as well as providing  **full intellisense** for the APIs and entities, which greatly enhances the coding experience!

Getting Started
---------------

Check out the [Getting started](getting-started.html) page and how to [generate the declaration files](tool-usage.html).

Then depending on what you need to do, see how the different parts work in your 
code:

  * [Xrm object model](xrm-dts-usage.html)
  * [XrmQuery][xrmquery]
  * [REST API](rest-dts-usage.html)
  * [Option sets](os-dts-usage.html)

  [xrmquery]: xrmquery-web.html
  [xrm]: https://msdn.microsoft.com/en-us/library/gg328255.aspx
  [rest]: https://msdn.microsoft.com/en-us/library/gg334427.aspx#BKMK_SDKREST
  [metadata]: https://msdn.microsoft.com/en-us/library/gg594428.aspx
  [odata]: http://www.odata.org/documentation/odata-version-2-0/uri-conventions/
  [crmsvcutil]: https://msdn.microsoft.com/en-us/library/gg327844.aspx