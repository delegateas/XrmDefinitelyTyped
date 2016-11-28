Form intersection
=================

Got client-side logic that needs to run on multiple forms which have similar attributes, control, tabs, etc.,
that you need to use in your code? 

Make a declaration file by doing a form intersection!

How it works
------------

A form intersection basically evaluates the forms you give it, and finds all common attributes and controls, 
tabs and sections between them. 

XrmDefinitelyTyped is then able to generate a declaration file for this intersection, 
which contains only the functionality that is available on all of given forms - making it possible to
create client-side code that can be used safely on multiple forms.

<center><img src="img/form-intersection.png" /></center><br />

You can generate as many form intersection files as you want, and they are defined by passing in the GUIDs 
of the forms you want to intersect with the `formIntersect`-argument. See [usage for more details](tool-usage.html).


How to find the GUID of a form
------------------------------

My preferred way is to just go to the desired form, and call 
`Xrm.Page.ui.formSelector.getCurrentItem().getId()` in a developer console.

Alternatively you can find it by opening the form in the form editor through your CRM solution, 
and finding the `formId` query-parameter in the URL:

<center><img src="img/form-id-through-ui.png" /></center>
