Migrating from 1.X to 2.0
===========================

Most of the renames and relocation of interfaces to different namespace can solved by using simple search and replace functionality, 
like `XrmQuery.` -> `XrmQuery.REST.` for the REST endpoint.


Following is a list of changes that may break your code:

### Forms

* The generation of `IPage` declaration files has been removed. Use [form intersections](form-intersection.html) instead.
* All interfaces previously in the `IPage`-namespace (i.e. `IPage.Attribute<string>`) have been moved to the `Xrm`-namespace
* `base.d.ts` has been renamed to `xrm.d.ts` (in case you are referencing it anywhere)
 
### XrmQuery (REST)

* To generate REST API files, you now need to specify the `-rest` argument to XrmDefinitelyTyped
* Use the newly added [`-jsLib` argument](tool-usage.html) to make XrmDefinitelyTyped automatically update your 
  local XrmQuery JavaScript files when necessary
* The JavaScript files have been renamed from `dg.xrmquery.js`/`dg.xrmquery.min.js` to 
  `dg.xrmquery.rest.js`/`dg.xrmquery.rest.min.js`
* All previous `XrmQuery` calls towards the SDK REST API endpoint can now be accessed at `XrmQuery.REST` instead
* Likewise has all related filter functionality from the REST endpoint been moved from `Filter` to `Filter.REST`