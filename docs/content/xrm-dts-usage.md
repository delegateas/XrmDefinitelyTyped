Xrm Object Model
================

The [Xrm object model][xrm] can be accessed from web resources in your 
solution. To start using the declaration files, one can drag in a reference to 
`xrm.d.ts` which is located in the root folder, `typings/XRM/`. 
This contains the base description of the API.

  [xrm]: https://msdn.microsoft.com/en-us/library/gg328255.aspx
  [rest]: https://msdn.microsoft.com/en-us/library/gg334427.aspx#BKMK_SDKREST


The Xrm object model also allows access to entity specific attributes 
and controls when it is used on a entity-specific page (such as a form). 
The following section will show an example of this usage on a specific
Contact entity form.


Specific Contact Form Example
-----------------------------

First off you need to reference the declaration file which matches the form 
you want to add some client-side code to. These declaration files can be found 
at `typings/XRM/Form/<EntityType>/<FormType>/<FormName>.d.ts`.

In this example, we want to add code to the standard Contact form called 
'Information', which is of the 'Main' form type. This can be found at 
`typings/XRM/Form/contact/Main/Information.d.ts`. Simply by adding this, 
you get access to the entire Xrm object model API for the current form page!


We just need to tell the compiler what page we are currently on 
(`Form.contact.Main.Information`), which can be done in two ways:

    [lang=typescript]
    // Either declare the Xrm variable to be of the wanted type
    declare var Xrm: Xrm<Form.contact.Main.Information>;

    // .. or just cast the page itself in a new variable
    var Page = <Form.contact.Main.Information> Xrm.Page;


Below is an example of an initial setup for your code file.

    [lang=typescript]
    /// <reference path="../../typings/XRM/Form/contact/Main/Information.d.ts" />

    namespace DG.Contact {
        declare var Xrm: Xrm<Form.contact.Main.Information>;

        export function onLoad() {
            // Code here..
        }
    }


> Note when using modules, you need to export all functions you want to call 
> outside of it. In this case the `onLoad()` function needs to be used by CRM, 
> and therefore needs to be exported.


In your desired IDE, you will now get intellisense for that specific 
contact form, with all of its attributes, controls, tabs and sections:

<img src="img/control-intellisense.gif" class="code" />

Each attribute and control on the form will have the correct type, which 
gives you type safety on the following values and functions!

In case an invalid string is entered as an argument to one of the 
string-specific functions, it will return an empty interface with no
functionality. This makes it easy to see if a string has been entered 
incorrectly, or if you are trying to access an element that is not present 
on the form.

