XrmQuery (Web API)
==================


With XrmQuery you can utilize intellisense and type-support to create and structure Web API queries for your 
Dynamics 365/CRM instance.

The syntax of XrmQuery is very similar the [method syntax of LINQ](https://msdn.microsoft.com/en-us/library/bb397947.aspx).

***Try it out yourself - it's an absolute pleasure to use in any IDE with TypeScript support!***

Supported features
--------
* Create, update and delete
* Basic query functionality - `retrieve`, `retrieveMultiple`, `retrieveRelated`, `retrieveRelatedMultiple`
* Full type-support for all query options, such as `select`, `filter`, `expand` and `orderBy`
* FetchXML and pre-defined query filtering
* ES6 promises - use `dg.xrmquery.promise.min.js` to include polyfill for IE
* Custom requests via `XrmQuery.sendRequest(..)` or `XrmQuery.promiseRequest(..)`
* Automatically resolves all `@odata.nextLink`s in returned query result (for paging and expand on entity sets)
* Handle as many entities and attributes as desired, without increasing the size of the JavaScript library code 
  (which is 15KB minified, or 21KB with ES6-promise polyfill)
* No need to register a CRM app in the Azure AD to generate the declaration files
* Retrieval of formatted values, and accessing them as `<record>.<attribute-name>_formatted` instead of 
  `<record>["<attribute-name>@OData.Community.Display.V1.FormattedValue"]`


Usage
----------

XrmQuery relies mostly on functions to deduce the necessary types and actions used to perform the query. 
These functions are meant to help the developer with intellisense and autocomplete in each function of XrmQuery.

Since TypeScript supports lambda functions (shortened function declarations, i.e. `x => x + 2`), you can use these 
to achieve neater looking code. This is just like [using lambda expressions for the method syntax of LINQ](https://msdn.microsoft.com/en-us/library/bb397947.aspx#Anchor_1).

**Example:**

    [lang=typescript]
    XrmQuery.retrieveMultiple(x => x.accounts) // Tells XrmQuery to retrieve accounts
        .select(x => [ x.accountnumber ]) // Select which attributes to retrieve, in this case just accountnumber
        .filter(x => Filter.equals(x.name, "Contoso")) // Only get accounts which have a name equal to "Contoso"
        .execute(accounts => { 
            // Do something with the retrieved accounts
            console.dir(accounts);
        });

Each of these lambda functions use one argument, which I usually just call `x`. Inside the function call, you can use this
argument for all the autocomplete necessary by simply dotting it as an object (when you type `x.`, the intellisense will kick in).
Most functions in XrmQuery just expect you to return something directly on the argument object, like: `x => x.accounts`.

The only functions that differ are select-functions and and filter-functions (as seen above). 
Select-functions expect an array of properties, and the filter function expects you to return a call to one of the `Filter`-functions.




Planned features
----------------

* Support for [association and dissassociation](https://msdn.microsoft.com/en-us/library/mt607875.aspx)
* [Calling standard and custom actions](https://msdn.microsoft.com/en-us/library/mt607600.aspx)
* [Retrieve using an alternate key](https://msdn.microsoft.com/en-us/library/mt607871.aspx#Anchor_3)
* Allow manual control of paging