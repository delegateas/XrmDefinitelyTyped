XrmQuery
=========

With XrmQuery you can get intellisense for creating your query to the CRM dynamics database!
Simply add a reference to the declaration file `typings/XRM/dg.xrmquery.d.ts`, and be sure 
to include the javascript code for XrmQuery on the page/form you want to use it on.

A minified version of the necessary javascript code of XrmQuery can be [found here][minified]. 
The code is also included in the NuGet package.

With the javascript in place, you can write the following code with full intellisense on 
the entity and all of its attributes and relationships! It also provides helper functions which 
create the filter string for the query correctly based on the types given. XrmQuery provides intellisense
and helper functions for all the options one can query with for [OData on CRM][odata-options].

Here is a small example where a complex filter is applied to a RetrieveMultiple on accounts:

    [lang=typescript]
    /// <reference path="../../typings/xrm/dg.xrmquery.d.ts" />
    /// <reference path="../../typings/xrm/entity/account.d.ts" />

    XrmQuery.retrieveMultipleRecords(x => x.Account)
        .select(acc => [acc.Name, acc.EMailAddress1])
        .filter(acc =>
            Filter.and(
                Filter.or(
                    Filter.equals(acc.Address1_ShippingMethodCode.Value, account_address1_shippingmethodcode.Airborne),
                    Filter.greaterThan(acc.CreditLimit.Value, 1000)
                ),
                Filter.equals(acc.PrimaryContactId.Id, Filter.makeGuid("0000-SOME-GUID"))
            ))
        .getAll(records => {
            // Success callback function for the accounts.
            console.log(records)
        });

The execute function also has the possibility to add a callback handler for errors and onComplete, 
like the standard SDK.REST API. These have been made optional, since they aren't necessary for a
succesful run of the function.

Check out the generated declaration file at `typings/XRM/dg.xrmquery.d.ts` to see what can be 
accomplished with XrmQuery!

[minified]: libs/dg.xrmquery.min.js
[odata-options]: https://msdn.microsoft.com/en-us/library/gg309461.aspx