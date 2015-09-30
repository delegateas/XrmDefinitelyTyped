/// <reference path="base.d.ts" />
/**
 * @internal
 */
declare module SDK {
  module REST {
    function createRecord(object: any, type: string, successCallback: (result: any) => any, errorCallback: (err: Error) => any): void;
    function deleteRecord(id: string, type: string, successCallBack: () => any, errorCallback: (err: Error) => any): void;
    function retrieveRecord(id: string, type: string, select: string, expand: string, successCallback: (result: any) => any, errorCallback: (err: Error) => any): void;
    function updateRecord(id: string, object: any, type: string, successCallBack: () => any, errorCallback: (err: Error) => any): void;
    function retrieveMultipleRecords(type: string, options: string, successCallback: (result: any[]) => any, errorCallback: (err: Error) => any, onComplete: any): void;
  }
}

module Filter {
  export function equals<T>(v1: T, v2: T): Filter { return XQC.Comp<T>(v1, "eq", v2) }
  export function notEquals<T>(v1: T, v2: T): Filter { return XQC.Comp<T>(v1, "ne", v2) }

  export function greaterThan<T extends Number|Date>(v1: T, v2: T): Filter { return XQC.Comp<T>(v1, "gt", v2) }
  export function greaterThanOrEqual<T extends Number|Date>(v1: T, v2: T): Filter { return XQC.Comp<T>(v1, "ge", v2) }
  export function lessThan<T extends Number|Date>(v1: T, v2: T): Filter { return XQC.Comp<T>(v1, "lt", v2) }
  export function lessThanOrEqual<T extends Number|Date>(v1: T, v2: T): Filter { return XQC.Comp<T>(v1, "le", v2) }

  export function and(f1: Filter, f2: Filter): Filter { return XQC.BiFilter(f1, "and", f2) }
  export function or(f1: Filter, f2: Filter): Filter { return XQC.BiFilter(f1, "or", f2) }
  export function not(f1: Filter): Filter { return <Filter><any>("not " + f1) }

  export function startsWith(v1: string, v2: string): Filter { return XQC.DataFunc("startswith", v1, v2) }
  export function substringOf(v1: string, v2: string): Filter { return XQC.DataFunc("substringof", v1, v2) }
  export function endsWith(v1: string, v2: string): Filter { return XQC.DataFunc("endswith", v1, v2) }
  
  /**
   * Makes a string into a GUID that can be sent to the OData source
   */
  export function makeGuid(id: string) { return <Guid><any>XQC.makeTag("(guid'" + id + "')") }
}


module XrmQuery {
  export function retrieveRecord<O, S, E, R>(entityPicker: (x: Entities) => QueryMapping<O, S, E, any, R>, id: string) {
    return new XQC.RetrieveRecord(entityPicker, id);
  }
  export function retrieveMultipleRecords<O, S, E, F, R>(entityPicker: (x: Entities) => QueryMapping<O, S, E, F, R>) {
    return new XQC.RetrieveMultipleRecords(entityPicker);
  }
  export function createRecord<O, R>(entityPicker: (x: Entities) => QueryMapping<O, any, any, any, R>, record: O) {
    return new XQC.CreateRecord(entityPicker, record);
  }
  export function updateRecord<O>(entityPicker: (x: Entities) => QueryMapping<O, any, any, any, any>, id: string, record: O) {
    return new XQC.UpdateRecord(entityPicker, id, record);
  }
  export function deleteRecord<O>(entityPicker: (x: Entities) => QueryMapping<O, any, any, any, any>, id: string) {
    return new XQC.DeleteRecord(entityPicker, id);
  }
}


module XQC {
  /**
   * @internal
   */
  function getVal(v: any) {
    if (v == null) return "null"
    if (typeof (v) === "string") return "'" + v + "'";
    if (Object.prototype.toString.call(v) === "[object Date]") return "DateTime'" + v.format('yyyy-MM-ddTHH:mm:ss') + "'";
    return v.toString();
  }

  /**
   * @internal
   */
  export function Comp<T>(val1: T, op: string, val2: T): Filter {
    return <Filter><any>(getVal(val1) + " " + op + " " + getVal(val2));
  }

  /**
   * @internal
   */
  export function DataFunc<T>(funcName: string, val1: T, val2: T): Filter {
    return <Filter><any>(funcName + "(" + getVal(val1) + ", " + getVal(val2) + ")");
  }

  /**
   * @internal
   */
  export function BiFilter(f1: Filter, conj: string, f2: Filter): Filter {
    return <Filter><any>("(" + f1 + " " + conj + " " + f2 + ")");
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
  var fPatt = /function[^\(]+\(([a-zA-Z0-9_]+)[^\{]+\{([\s\S]*)\}$/

  /**
   * @internal
   */
  function objRegex(oName: string) {
    return new RegExp("\\b" + oName + "\\.([a-zA-Z_$][0-9a-zA-Z_$]*)(\\.([a-zA-Z_$][0-9a-zA-Z_$]*))?", "g")
  }

  /**
   * @internal
   */
  function analyzeFunc(f: (x: any) => any) {
    var m = f.toString().match(fPatt); return { arg: m[1], body: m[2] }
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
  function tagMatches(f: (x: any) => any) {
    var funcInfo = analyzeFunc(f);
    var regex = objRegex(funcInfo.arg);

    var obj = {};
    var match;
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

    constructor(entityPicker: (x: Entities) => QueryMapping<any, S, E, any, R>, id: string) {
      this.logicalName = taggedExec(entityPicker).toString();
      this.id = id;
    }

    select(vars: (x: S) => Attribute<S>[]) {
      this.selects = this.selects.concat(<string[]><any>taggedExec(vars));
      return this;
    }

    expand<S2>(exps: (x: E) => Expandable<S, S2>, vars?: (x: S2) => Attribute<S2>[]) {
      var expName = taggedExec(exps).toString();
      this.expands.push(expName);
      if (vars) this.selects = this.selects.concat(taggedExec(vars).map(a => expName + "." + a));
      return this;
    }

    execute(successCallback: (record: R) => any, errorCallback?: (err: Error) => any) {
      var eCb = (errorCallback) ? errorCallback : () => { };
      SDK.REST.retrieveRecord(
        this.id,
        this.logicalName,
        (this.selects.length > 0) ? this.selects.join(",") : null,
        (this.expands.length > 0) ? this.expands.join(",") : null,
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
    private filters: Filter;
    /**
     * @internal
     */
    private skipAmount: number = null;
    /**
     * @internal
     */
    private topAmount: number = null;

    constructor(entityPicker: (x: Entities) => QueryMapping<any, S, E, F, R>) {
      this.logicalName = taggedExec(entityPicker).toString();
    }

    select(vars: (x: S) => Attribute<S>[]) {
      this.selects = this.selects.concat(<string[]><any>taggedExec(vars));
      return this;
    }

    expand<T2>(exps: (x: E) => Expandable<S, T2>, vars?: (x: T2) => Attribute<T2>[]) {
      var expName = taggedExec(exps).toString();
      this.expands.push(expName);
      if (vars) this.selects = this.selects.concat(taggedExec(vars).map(a => expName + "." + a));
      return this;
    }

    filter(filter: (x: F) => Filter) {
      this.filters = taggedExec(filter);
      return this;
    }

    /**
     * @internal
     */
    order(vars: (x: S) => Attribute<S>, by: string) {
      this.ordering.push(taggedExec(vars) + " " + by);
      return this;
    }

    orderAsc(vars: (x: S) => Attribute<S>) {
      return this.order(vars, "asc");
    }

    orderDesc(vars: (x: S) => Attribute<S>) {
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

    execute(successCallback: (records: R[]) => any, errorCallback?: (err: Error) => any, onComplete?: () => any) {
      SDK.REST.retrieveMultipleRecords(
        this.logicalName,
        this.getOptions(),
        successCallback,
        errorCallback ? errorCallback : NoOp,
        onComplete ? onComplete : NoOp);
    }

    /**
     * @internal
     */
    private getOptions(): string {
      var options = [];
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

    constructor(entityPicker: (x: Entities) => QueryMapping<O, any, any, any, R>, record: O) {
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

    constructor(entityPicker: (x: Entities) => QueryMapping<O, any, any, any, any>, id: string, record: O) {
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

    constructor(entityPicker: (x: Entities) => QueryMapping<O, any, any, any, any>, id: string) {
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