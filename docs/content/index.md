XrmDefinitelyTyped
======================


<div class="row">
  <div class="span1"></div>
  <div class="span6">
    <div class="well well-small" id="nuget">
      The XrmDefinitelyTyped executable can be 
      <a href="https://nuget.org/packages/Delegate.XrmDefinitelyTyped">
        installed from NuGet
      </a>:
      <pre>PM> Install-Package Delegate.XrmDefinitelyTyped</pre>
    </div>
  </div>
  <div class="span1"></div>
</div>


What is it?
-----------

XrmDefinitelyTyped generates [TypeScript](http://www.typescriptlang.org/) 
declaration files (`*.d.ts`) based on *your* Microsoft CRM/xRM solution.

It is the TypeScript equivalent of [CrmSvcUtil][crmsvcutil], but instead of 
generating early-bound .NET classes for server-side code, it generates 
TypeScript interfaces for all your client-side coding.

It generates data-specific declaration files for:

  * Entity types and attributes
  * Global and entity-specific option sets
  * The [Xrm object model][xrm] for client-side programming of forms and custom 
    pages
  * The standard [SDK.REST.js][rest] API for querying CRM via [OData][odata].
  * The standard [SDK.MetaData.js][metadata] API for querying the metadata of 
    CRM.
  * The query API [XrmQuery][xrmquery], which uses the generated metadata to help
    make type-safe queries to CRM.


Both the [Xrm object model][xrm] and the [SDK.REST.js][rest] API incorporate 
the produced entity types and attributes.
This further improves your coding efficiency, by only allowing valid
data strings to be entered into the APIs, as well as providing entity and 
attribute types everywhere.


All this makes it possible to **catch bugs at compile-time** in your IDE 
(instead of at runtime on the CRM server), as well as providing 
**full intellisense** for the APIs and entities, which greatly enhances 
the coding experience!

  [xrm]: https://msdn.microsoft.com/en-us/library/gg328255.aspx
  [rest]: https://msdn.microsoft.com/en-us/library/gg334427.aspx#BKMK_SDKREST
  [metadata]: https://msdn.microsoft.com/en-us/library/gg594428.aspx
  [odata]: http://www.odata.org/documentation/odata-version-2-0/uri-conventions/
  [crmsvcutil]: https://msdn.microsoft.com/en-us/library/gg327844.aspx

Getting Started
---------------

Check out the how to [generate the declaration files](tool-usage.html).

Then depending on what you need to do, see how the different parts work in your 
code:

  * [Xrm object model](xrm-dts-usage.html)
  * [XrmQuery][xrmquery]
  * [REST API](rest-dts-usage.html)
  * [Option sets](os-dts-usage.html)

[xrmquery]: xrmquery-usage.html
