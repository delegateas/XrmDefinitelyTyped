XrmQuery (Web API)
==================

With XrmQuery you get full intellisense and type-support for creating a Web API query towards your Dynamics 365/CRM instance!


Example
-------



Features
--------
* Supports create, update and delete
* Supports basic query functionality (`retrieve`, `retrieveMultiple`, `retrieveRelated`, `retrieveRelatedMultiple`)
* Supports sending custom requests via `XrmQuery.sendRequest(..)` or `XrmQuery.promiseRequest(..)`
* Full type-support for all query options, such as `select`, `filter`, `expand` and `orderBy`
* Automatically resolves all `@odata.nextLink`s in returned query result (for paging and expand on entity sets)
* Supports as many entities and attributes as desired, without increasing the size of the JavaScript library code (which is 15KB minimized, or 21KB with ES6-promise polyfill)
* No need to register a CRM app in the Azure AD in order to generate the declaration files
* Retrieve formatted values and access them as `<record>.<attribute-name>_formatted` instead of `<record>["<attribute-name>@OData.Community.Display.V1.FormattedValue"]`
* [Execute pre-defined queries](https://msdn.microsoft.com/en-us/library/mt607533.aspx#Anchor_1)
* [Execute custom FetchXML](https://msdn.microsoft.com/en-us/library/mt607533.aspx#Anchor_2)


Planned features
----------------

* Support for [association and dissassociation](https://msdn.microsoft.com/en-us/library/mt607875.aspx)
* [Calling standard and custom actions](https://msdn.microsoft.com/en-us/library/mt607600.aspx)
* [Retrieve using an alternate key](https://msdn.microsoft.com/en-us/library/mt607871.aspx#Anchor_3)
* Allow manual control of paging