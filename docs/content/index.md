XrmDefinitelyTyped
==================

XrmDefinitelyTyped generates [TypeScript](http://www.typescriptlang.org/) 
declaration files based on *your* Dynamics 365/CRM/xRM solution.

<form method="get" action="files/install-latest.cmd">
<center><button type="submit" class="btn">Download installer</button></center>
</form>

What is it?
-----------

It is the TypeScript equivalent of [CrmSvcUtil][crmsvcutil], but instead of generating early-bound .NET classes 
for server-side code, it generates TypeScript interfaces for all your client-side coding.

It generates data-specific declaration files for:

  * The [Xrm object model][xrm] for client-side coding of forms and custom pages
  * Global and entity-specific option sets
  * The standard [SDK.REST.js][rest] API for querying CRM via [OData][odata].
  * The standard [SDK.MetaData.js][metadata] API for querying the metadata of CRM.
  * [XrmQuery][xrmquery] for the Web API and the old REST endpoint. XrmQuery makes it
    possible to perform fully type-safe queries to CRM.


All this makes it possible to **catch bugs at compile-time** in your IDE (instead of at runtime on the CRM instance), 
as well as providing  **full intellisense** for the APIs and entities, which greatly enhances the coding experience!

Get started
-----------

Check out the [Getting started](getting-started.html) page, and which [options are available](tool-usage.html) for XrmDefinitelyTyped.

Then depending on what you need to do, check out how the different parts work by following the links in the side menu.

  [xrmquery]: xrmquery-web.html
  [xrm]: https://msdn.microsoft.com/en-us/library/gg328255.aspx
  [rest]: https://msdn.microsoft.com/en-us/library/gg334427.aspx#BKMK_SDKREST
  [metadata]: https://msdn.microsoft.com/en-us/library/gg594428.aspx
  [odata]: http://www.odata.org/documentation/odata-version-2-0/uri-conventions/
  [crmsvcutil]: https://msdn.microsoft.com/en-us/library/gg327844.aspx