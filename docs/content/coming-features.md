Coming Features
===============

* **Query**
  - Support for `associateRecords` and `disassociateRecords`
  - Support for SOAP exclusive actions such as `SetState`, `Assign`, etc.
  - Use of [string literals](https://github.com/Microsoft/TypeScript/pull/5185) 
    instead of function calls to indicate attributes etc.

* **Xrm object model:**
  - [String literals](https://github.com/Microsoft/TypeScript/pull/5185) 
    (or [enums](https://github.com/Microsoft/TypeScript/issues/1206#issuecomment-131001547)) 
    for accessing attributes/controls/etc
  - Possibly more specific collections for some objects (i.e. controls on attribute)

* **SDK.REST.js:**
  - Intellisense for the `relationshipName` string used by `associateRecords` 
    and `disassociateRecords`

* **Misc:**
  - Better way to install it, since executables with dependencies are not
    very practical with NuGet.
  - Docs to all of the generated TypeScript based on the metadata
