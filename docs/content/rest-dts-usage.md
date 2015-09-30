The REST API
===========

To work with the REST API you will need to reference the declaration file for 
it, which can be found at `typings/XRM/rest.d.ts`. 

To work on further with specific entities you should reference these as well.
They are located in the `typings/XRM/Entity/` folder:

    [lang=typescript]
    /// <reference path="../../typings/XRM/rest.d.ts" />
    /// <reference path="../../typings/XRM/Entity/account.d.ts" />

    SDK.REST.retrieveRecord("<SomeGuid>",
        "Account", // Entity type
        "", // Select string
        "", // Expand string
        function (account) { // Success callback
            // Code here..
        },
        function (error) { // Error callback

        }
    );


From the given entity type in the function call, the TypeScript compiler can
figure out that it is an Account entity result that should be expected in the
success callback handler.

By knowing this, it can provide full intellisense for the retrieved account 
record and all of its attributes and relations!

<img src="img/intellisense-example.png" class="code" />
