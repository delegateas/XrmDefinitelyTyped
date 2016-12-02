Form intersection
=================

Got client-side logic that needs to run on multiple forms which have similar attributes, control, tabs, etc.,
that you need to use in your code? 

Make a declaration file using form intersection!

How it works
------------

Form intersection evaluates the forms specified, and combines all common attributes and controls, 
tabs and sections into a single form interface. 

This makes it possible to create client-side code that can be used and shared safely across multiple forms.

<center><img src="img/form-intersection.png" /></center><br />

You can generate as many form intersection files as you want, and they are defined by passing in the GUIDs 
of the forms you want to intersect with the `formIntersect`-argument. See [usage for more details](tool-usage.html).

The intersection form interfaces can be found at `Form._special.<NAME-OF-FORM>`.


How to find the GUID of a form
------------------------------

My recommended way is to open the desired form, and execute `Xrm.Page.ui.formSelector.getCurrentItem().getId()` 
in a developer console.

Alternatively, you can find it by opening the form in the form editor through your CRM solution, 
and examining the `formId` query-parameter in the URL:

<center><img src="img/form-id-through-ui.png" /></center>
