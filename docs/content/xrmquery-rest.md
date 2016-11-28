XrmQuery (REST)
===============

With XrmQuery you can get intellisense for creating your query to your Dynamics 365/CRM database!

Use the `-jsLib` argument of XrmDefinitelyTyped to define where the necessary JavaScript files should be placed.

With the JavaScript in place, you can write the following code with full intellisense on 
the entity and all of its attributes and relationships! It also provides helper functions which 
create the filter string for the query correctly based on the types given. XrmQuery provides intellisense
and helper functions for all the options one can query with for [OData on CRM][odata-options].

Here is a small example where a complex filter is applied to a RetrieveMultiple on accounts:

    [lang=typescript]
    XrmQuery.REST.retrieveMultipleRecords(x => x.Account)
        .select(acc => [acc.Name, acc.EMailAddress1])
        .filter(acc =>
            Filter.REST.and(
                Filter.REST.or(
                    Filter.REST.equals(acc.Address1_ShippingMethodCode.Value, account_address1_shippingmethodcode.Airborne),
                    Filter.REST.greaterThan(acc.CreditLimit.Value, 1000)
                ),
                Filter.REST.equals(acc.PrimaryContactId.Id, Filter.REST.makeGuid("0000-SOME-GUID"))
            ))
        .getAll(records => {
            // Success callback function for the accounts.
            console.log(records)
        });

The execute function also has the possibility to add a callback handler for errors and onComplete, 
like the standard SDK.REST API. These have been made optional, since they aren't necessary for a
succesful run of the function.

Check out the generated declaration file at `dg.xrmquery.rest.d.ts` to see what can be 
accomplished with XrmQuery!

[minified]: files/dg.xrmquery.rest.min.js
[odata-options]: https://msdn.microsoft.com/en-us/library/gg309461.aspx