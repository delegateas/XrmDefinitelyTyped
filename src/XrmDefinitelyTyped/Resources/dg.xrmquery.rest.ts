interface RestEntities { }

/**
 * @internal
 */
declare namespace SDK {
  namespace REST {
    function createRecord(object: any, type: string, successCallback: (result: any) => any, errorCallback: (err: Error) => any): void;
    function deleteRecord(id: string, type: string, successCallBack: () => any, errorCallback: (err: Error) => any): void;
    function retrieveRecord(id: string, type: string, select: string | null, expand: string | null, successCallback: (result: any) => any, errorCallback: (err: Error) => any): void;
    function updateRecord(id: string, object: any, type: string, successCallBack: () => any, errorCallback: (err: Error) => any): void;
    function retrieveMultipleRecords(type: string, options: string | null, successCallback: (result: any[]) => any, errorCallback: (err: Error) => any, onComplete: any): void;
  }
}

interface RestMapping<O, S, E, F, R> {
  __RestMapping: O;
}

interface RestAttribute<T> {
  __RestAttribute: T;
}

interface RestExpand<T, U> extends RestAttribute<T> {
  __RestExpandable: U;
}

interface RestFilter {
  __RestFilter: any;
}

namespace Filter.REST {
  export function equals<T>(v1: T, v2: T): RestFilter { return Comp(v1, "eq", v2) }
  export function notEquals<T>(v1: T, v2: T): RestFilter { return Comp(v1, "ne", v2) }

  export function greaterThan<T extends Number | Date>(v1: T, v2: T): RestFilter { return Comp(v1, "gt", v2) }
  export function greaterThanOrEqual<T extends Number | Date>(v1: T, v2: T): RestFilter { return Comp(v1, "ge", v2) }
  export function lessThan<T extends Number | Date>(v1: T, v2: T): RestFilter { return Comp(v1, "lt", v2) }
  export function lessThanOrEqual<T extends Number | Date>(v1: T, v2: T): RestFilter { return Comp(v1, "le", v2) }

  export function and(f1: RestFilter, f2: RestFilter): RestFilter { return BiFilter(f1, "and", f2) }
  export function or(f1: RestFilter, f2: RestFilter): RestFilter { return BiFilter(f1, "or", f2) }
  export function not(f1: RestFilter): RestFilter { return <RestFilter><any>("not " + f1) }

  export function ands(fs: RestFilter[]): RestFilter { return NestedFilter(fs, "and") }
  export function ors(fs: RestFilter[]): RestFilter { return NestedFilter(fs, "or") }

  export function startsWith(v1: string, v2: string): RestFilter { return DataFunc("startswith", v1, v2) }
  export function substringOf(v1: string, v2: string): RestFilter { return DataFunc("substringof", v1, v2) }
  export function endsWith(v1: string, v2: string): RestFilter { return DataFunc("endswith", v1, v2) }

  /**
   * Makes a string into a GUID that can be sent to the OData source
   */
  export function makeGuid(id: string): XQR.Guid { return <XQR.Guid><any>XQR.makeTag(`(guid'${id}')`) }

  /**
   * @internal
   */
  function getVal(v: any) {
    if (v == null) return "null"
    if (typeof (v) === "string") return `'${v}'`;
    if (Object.prototype.toString.call(v) === "[object Date]") return `DateTime'${v.format('yyyy-MM-ddTHH:mm:ss')}'`;
    return v.toString();
  }

  /**
   * @internal
   */
  function Comp<T>(val1: T, op: string, val2: T): RestFilter {
    return <RestFilter><any>(`${getVal(val1)} ${op} ${getVal(val2)}`);
  }

  /**
   * @internal
   */
  function DataFunc<T>(funcName: string, val1: T, val2: T): RestFilter {
    return <RestFilter><any>(`${funcName}(${getVal(val1)}, ${getVal(val2)})`);
  }

  /**
   * @internal
   */
  function BiFilter(f1: RestFilter, conj: string, f2: RestFilter): RestFilter {
    return <RestFilter><any>(`(${f1} ${conj} ${f2})`);
  }

  /**
   * @internal
   */
  function NestedFilter(fs: RestFilter[], conj: string): RestFilter {
    var last = fs.pop();
    if (last === undefined) {
      return <RestFilter><any>('');
    }
    return fs.reduceRight((acc, c) => BiFilter(c, conj, acc), last);
  }
}



namespace XrmQuery.REST {
   
  export function stripGUID(guid: string) {
    if (guid.startsWith("{") && guid.endsWith("}"))
      return guid.substring(1, guid.length - 1);
    else
      return guid;
  }

  export function retrieveRecord<O, S, E, R>(entityPicker: (x: RestEntities) => RestMapping<O, S, E, any, R>, id: string) {
    return new XQR.RetrieveRecord(entityPicker, stripGUID(id));
  }
  export function retrieveMultipleRecords<O, S, E, F, R>(entityPicker: (x: RestEntities) => RestMapping<O, S, E, F, R>) {
    return new XQR.RetrieveMultipleRecords(entityPicker);
  }
  export function createRecord<O, R>(entityPicker: (x: RestEntities) => RestMapping<O, any, any, any, R>, record: O) {
    return new XQR.CreateRecord(entityPicker, record);
  }
  export function updateRecord<O>(entityPicker: (x: RestEntities) => RestMapping<O, any, any, any, any>, id: string, record: O) {
    return new XQR.UpdateRecord(entityPicker, stripGUID(id), record);
  }
  export function deleteRecord<O>(entityPicker: (x: RestEntities) => RestMapping<O, any, any, any, any>, id: string) {
    return new XQR.DeleteRecord(entityPicker, stripGUID(id));
  }
}


namespace XQR {

  export interface Guid {
    __XqrGuid: any;
  }

  export interface ValueContainerFilter<T> {
    Value: T;
  }

  export interface EntityReferenceFilter {
    Id: Guid;
    Name: string;
    LogicalName: string;
  }

  /**
   * @internal
   */
  export function makeTag(name: string) {
    return { __str: name, toString: function () { return this.__str } }
  }

  /**
   * @internal
   */
  function taggedExec<T>(f: (x: any) => T): T {
    var tagged = tagMatches(f);
    return f(tagged);
  }

  /**
   * @internal
   */
  var fPatt = /function[^\(]*\(([a-zA-Z0-9_]+)[^\{]*\{([\s\S]*)\}$/m

  /**
   * @internal
   */
  function objRegex(oName: string) {
    return new RegExp("\\b" + oName + "\\.([a-zA-Z_$][0-9a-zA-Z_$]*)(\\.([a-zA-Z_$][0-9a-zA-Z_$]*))?", "g");
  }

  /**
   * @internal
   */
  function analyzeFunc(f: (x: any) => any) {
    var m = f.toString().match(fPatt);
    if (!m) throw new Error(`XrmQuery: Unable to properly parse function: ${f.toString()}`);
    return { arg: m[1], body: m[2] };
  }


  /**
   * @internal
   */
  function tagMatches(f: (x: any) => any) {
    var funcInfo = analyzeFunc(f);
    var regex = objRegex(funcInfo.arg);

    var obj: { [k:string]: any } = {};
    var match: any;
    while ((match = regex.exec(funcInfo.body)) != null) {
      if (!obj[match[1]]) {
        obj[match[1]] = makeTag(match[1]);
      }
      if (match[3]) {
        obj[match[1]][match[3]] = makeTag(match[1] + "/" + match[3]);
      }
    }
    return obj;
  }

  /**
   * @internal
   */
  var NoOp = () => { };

  /**
   * Contains information about a Retrieve query
   */
  export class RetrieveRecord<S, E, R> {
    /** 
     * @internal 
     */
    private logicalName: string;
    /**
     * @internal
     */
    private selects: string[] = [];
    /**
     * @internal
     */
    private expands: string[] = [];
    /** 
     * @internal 
     */
    private id: string;

    constructor(entityPicker: (x: RestEntities) => RestMapping<any, S, E, any, R>, id: string) {
      this.logicalName = taggedExec(entityPicker).toString();
      this.id = id;
    }

    select(vars: (x: S) => RestAttribute<S>[]) {
      this.selects = this.selects.concat(<string[]><any>taggedExec(vars));
      return this;
    }

    expand<S2>(exps: (x: E) => RestExpand<S, S2>, vars?: (x: S2) => RestAttribute<S2>[]) {
      var expName = taggedExec(exps).toString();
      this.expands.push(expName);
      if (vars) this.selects = this.selects.concat(taggedExec(vars).map(a => expName + "." + a));
      return this;
    }

    execute(successCallback: (record: R) => any, errorCallback?: (err: Error) => any) {
      SDK.REST.retrieveRecord(
        this.id,
        this.logicalName,
        this.selects.length > 0 ? this.selects.join(",") : null,
        this.expands.length > 0 ? this.expands.join(",") : null,
        successCallback,
        errorCallback ? errorCallback : NoOp);
    }
  }

  /**
   * Contains information about a RetrieveMultiple query
   */
  export class RetrieveMultipleRecords<S, E, F, R> {
    /** 
     * @internal 
     */
    private logicalName: string;
    /**
     * @internal
     */
    private selects: string[] = [];
    /**
     * @internal
     */
    private expands: string[] = [];
    /**
     * @internal
     */
    private ordering: string[] = [];
    /**
     * @internal
     */
    private filters: RestFilter;
    /**
     * @internal
     */
    private skipAmount: number | null = null;
    /**
     * @internal
     */
    private topAmount: number | null = null;

    constructor(entityPicker: (x: RestEntities) => RestMapping<any, S, E, F, R>) {
      this.logicalName = taggedExec(entityPicker).toString();
    }

    select(vars: (x: S) => RestAttribute<S>[]) {
      this.selects = this.selects.concat(<string[]><any>taggedExec(vars));
      return this;
    }

    expand<T2>(exps: (x: E) => RestExpand<S, T2>, vars?: (x: T2) => RestAttribute<T2>[]) {
      var expName = taggedExec(exps).toString();
      this.expands.push(expName);
      if (vars) this.selects = this.selects.concat(taggedExec(vars).map(a => `${expName}/${a}`));
      return this;
    }

    filter(filter: (x: F) => RestFilter) {
      this.filters = taggedExec(filter);
      return this;
    }

    orFilter(filter: (x: F) => RestFilter) {
      if (this.filters) this.filters = Filter.REST.or(this.filters, taggedExec(filter));
      else this.filter(filter);
      return this;
    }

    andFilter(filter: (x: F) => RestFilter) {
      if (this.filters) this.filters = Filter.REST.and(this.filters, taggedExec(filter));
      else this.filter(filter);
      return this;
    }

    /**
     * @internal
     */
    private order(vars: (x: S) => RestAttribute<S>, by: string) {
      this.ordering.push(taggedExec(vars) + " " + by);
      return this;
    }

    orderAsc(vars: (x: S) => RestAttribute<S>) {
      return this.order(vars, "asc");
    }

    orderDesc(vars: (x: S) => RestAttribute<S>) {
      return this.order(vars, "desc");
    }

    skip(amount: number) {
      this.skipAmount = amount;
      return this;
    }

    top(amount: number) {
      this.topAmount = amount;
      return this;
    }

    /**
     * Executes the RetrieveMultiple. Note that the first function passed as an argument is called once per page returned from CRM.
     * @param pageSuccessCallback Called once per page returned from CRM
     * @param errorCallback Called if an error occurs during the retrieval
     * @param onComplete Called when all pages have been successfully retrieved from CRM
     */
    execute(pageSuccessCallback: (records: R[]) => any, errorCallback: (err: Error) => any, onComplete: () => any) {
      SDK.REST.retrieveMultipleRecords(
        this.logicalName,
        this.getOptionString(),
        pageSuccessCallback,
        errorCallback,
        onComplete);
    }

    /**
     * Executes the RetrieveMultiple and concatenates all the pages to a single array that is delivered to the success callback function.
     * @param successCallback Called with all records returned from the query
     * @param errorCallback Called if an error occures during the retrieval
     */
    getAll(successCallback: (records: R[]) => any, errorCallback?: (err: Error) => any) {
      let pages: any[][] = [];
      SDK.REST.retrieveMultipleRecords(
        this.logicalName,
        this.getOptionString(),
        (page) => {
          pages.push(page);
        },
        errorCallback ? errorCallback : NoOp,
        () => {
          successCallback([].concat.apply([], pages));
        });
    }

    /**
     * Executes the RetrieveMultiple, but only returns the first result (or null, if no record was found).
     * @param successCallback Called with the first result of the query (or null, if no record was found)
     * @param errorCallback Called if an error occures during the retrieval
     */
    getFirst(successCallback: (record: R | null) => any, errorCallback?: (err: Error) => any) {
      this.top(1);
      this.execute(recs => successCallback((recs.length > 0) ? recs[0] : null), errorCallback ? errorCallback : NoOp, NoOp);
    }


    getOptionString(): string {
      var options: string[] = [];
      if (this.selects.length > 0) {
        options.push("$select=" + this.selects.join(","));
      }
      if (this.expands.length > 0) {
        options.push("$expand=" + this.expands.join(","));
      }
      if (this.filters) {
        options.push("$filter=" + this.filters);
      }
      if (this.ordering.length > 0) {
        options.push("$orderby=" + this.ordering.join(","));
      }
      if (this.skipAmount != null) {
        options.push("$skip=" + this.skipAmount);
      }
      if (this.topAmount != null) {
        options.push("$top=" + this.topAmount);
      }
      return options.join("&");
    }
  }

  /**
   * Contains information about a Create query
   */
  export class CreateRecord<O, R> {
    /** 
     * @internal 
     */
    private logicalName: string;
    /** 
     * @internal 
     */
    private record: O;

    constructor(entityPicker: (x: RestEntities) => RestMapping<O, any, any, any, R>, record: O) {
      this.logicalName = taggedExec(entityPicker).toString();
      this.record = record;
    }

    execute(successCallback?: (record: R) => any, errorCallback?: (err: Error) => any) {
      SDK.REST.createRecord(
        this.record,
        this.logicalName,
        successCallback ? successCallback : NoOp,
        errorCallback ? errorCallback : NoOp);
    }
  }

  /**
   * Contains information about an Update query
   */
  export class UpdateRecord<O> {
    /** 
     * @internal 
     */
    private logicalName: string;
    /** 
     * @internal 
     */
    private id: string;
    /** 
     * @internal 
     */
    private record: O;

    constructor(entityPicker: (x: RestEntities) => RestMapping<O, any, any, any, any>, id: string, record: O) {
      this.logicalName = taggedExec(entityPicker).toString();
      this.id = id;
      this.record = record;
    }

    execute(successCallback?: () => any, errorCallback?: (err: Error) => any) {
      SDK.REST.updateRecord(
        this.id,
        this.record,
        this.logicalName,
        successCallback ? successCallback : NoOp,
        errorCallback ? errorCallback : NoOp);
    }
  }

  /**
   * Contains information about a Delete query
   */
  export class DeleteRecord<O> {
    /** 
     * @internal 
     */
    private logicalName: string;
    /** 
     * @internal 
     */
    private id: string;

    constructor(entityPicker: (x: RestEntities) => RestMapping<O, any, any, any, any>, id: string) {
      this.logicalName = taggedExec(entityPicker).toString();
      this.id = id;
    }

    execute(successCallback?: () => any, errorCallback?: (err: Error) => any) {
      SDK.REST.deleteRecord(
        this.id,
        this.logicalName,
        successCallback ? successCallback : NoOp,
        errorCallback ? errorCallback : NoOp);
    }
  }
}