XrmQuery (Web API)
==================

With XrmQuery you get full intellisense and type-support for creating a Web API query towards your Dynamics 365/CRM instance.


Features
--------
* Supports create, update and delete
* Supports basic query functionality (`retrieve`, `retrieveMultiple`, `retrieveRelated`, `retrieveRelatedMultiple`)
* Supports sending custom requests via `XrmQuery.sendRequest(..)` or `XrmQuery.promiseRequest(..)`
* Full type-support for all query options, such as `select`, `filter`, `expand` and `orderBy`
* Supports using FetchXML and pre-defined query filtering
* Automatically resolves all `@odata.nextLink`s in returned query result (for paging and expand on entity sets)
* Supports as many entities and attributes as desired, without increasing the size of the JavaScript library code 
  (which is 15KB minified, or 21KB with ES6-promise polyfill)
* No need to register a CRM app in the Azure AD in order to generate the declaration files
* Retrieve formatted values and access them as `<record>.<attribute-name>_formatted` instead of 
  `<record>["<attribute-name>@OData.Community.Display.V1.FormattedValue"]`


Planned features
----------------

* Support for [association and dissassociation](https://msdn.microsoft.com/en-us/library/mt607875.aspx)
* [Calling standard and custom actions](https://msdn.microsoft.com/en-us/library/mt607600.aspx)
* [Retrieve using an alternate key](https://msdn.microsoft.com/en-us/library/mt607871.aspx#Anchor_3)
* Allow manual control of paging


Usage
----------

XrmQuery relies mostly on functions to deduce the necessary types and actions used to perform the query. 
These functions are also meant to help the developer with intellisense and autocomplete in each function of XrmQuery.

Since TypeScript supports lambda functions (shortened function declarations, i.e. `x => x + 2`), you can use these 
to achieve neater looking code.

#### Example:

    [lang=typescript]
    XrmQuery.retrieveMultiple(x => x.accounts) // Tells XrmQuery to retrieve accounts
        .select(x => [x.accountnumber]) // Select which attributes to retrieve, in this case just accountnumber
        .filter(x => Filter.equals(x.name, "Contoso")) // Only get accounts which have a name equal to "Contoso"
        .execute(accounts => { 
            // Do something with the retrieved accounts
            console.dir(accounts);
        });

Each of these lambda functions use one argument, which I usually just call `x`. Inside the function call, you can use this
argument for all the autocomplete necessary by simply dotting it as an object (when you type `x.`, the intellisense will kick in).

Most functions in XrmQuery just expect you to return something directly on the argument object, like: `x => x.accounts`.
The only functions that differ are select-functions and and filter-functions, as seen above. 

Select-functions expect an array of properties on the argument, and the filter function expects you to return something from a `Filter.`-functions.


##### Try it out yourself - it's an absolute pleasure to use in any TypeScript IDE!
