The REST API
===========

    [lang=typescript]
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
