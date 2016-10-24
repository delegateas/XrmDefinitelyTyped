
interface WebEntities {
  dg_buses: WebMapping<dg_bus, dg_bus_Select, dg_bus_Single, dg_bus_Filter, dg_bus, dg_bus_Formatted>;
}

interface dg_bus_Formatted {
}

interface dg_child {
  dg_name: string;
  dg_allowance: number;
}

interface dg_child_Select {
  dg_name: WebAttribute<dg_child_Select, { dg_name: string }, { dg_name_formatted: string }>;
  dg_allowance: WebAttribute<dg_child_Select, { dg_allowance: number }, { dg_allowance_formatted: string }>;
}

interface dg_child_Filter {

}

interface dg_man {
  dg_name: string;
}

interface dg_man_Select {
  dg_name: WebAttribute<dg_man_Select, { dg_name: string }, {}>;
}


interface dg_man_Filter {
  dg_name: string;
}

interface dg_bus_Select {
  dg_driver_lookup$dg_drivers: WebAttribute<dg_bus_Select, { dg_driver_lookup$dg_drivers: string }, {}>;
  dg_name: WebAttribute<dg_bus_Select, { dg_name: string }, {}>;
  dg_udkoerselsdato: WebAttribute<dg_bus_Select, { dg_udkoerselsdato: Date }, { dg_udkoerselsdato_formatted?: string }>;
  dg_udregnet: WebAttribute<dg_bus_Select, { dg_udregnet: number; _transactioncurrencyid_value: XQW.Guid }, { dg_udregnet_formatted?: string }>;
  dg_ticketprice: WebAttribute<dg_bus_Select, { dg_ticketprice: number; _transactioncurrencyid_value: XQW.Guid }, { dg_ticketprice_formatted?: string }>;
  createdon: WebAttribute<dg_bus_Select, { createdon: Date }, { createdon_formatted?: string }>;
}

interface dg_bus_Single {
  dg_Driver: WebExpand<dg_bus_Single, dg_man_Select, dg_man_Filter, { dg_Driver: WebEntityResult & dg_man }>;
}

interface dg_bus_Collection {
  dg_dg_bus_dg_child_Skolebus: WebExpand<dg_bus_Collection, dg_child_Select, dg_child_Filter, { dg_dg_bus_dg_child_Skolebus: (WebEntityResult & dg_child)[] }>;
}



interface dg_bus_Filter {

}

interface dg_bus {
  dg_name?: string;
  dg_udregnet?: number;
  createdon?: Date;
  _transactioncurrencyid_value?: XQW.Guid;
}



/** 
************************************************************************
************************************************************************
************************************************************************
************************************************************************
*/

interface WebEntities { }
declare var GetGlobalContext: any;

interface WebMapping<IEntity, ISelect, IExpand, IFilter, Result, FormattedResult> {
  __isWebMapping: IEntity;
}

interface WebAttribute<ISelect, Result, Formatted> {
  __isWebAttribute: ISelect;
}

interface WebExpand<IExpand, ChildSelect, ChildFilter, Result> {
  __isWebExpandable: IExpand;
}

interface WebFilter {
  __isWebFilter: any;
}

interface WebApiResult {
  "@odata.context": string;
}

interface WebEntityResult {
  "@odata.etag": string;
}


const enum SortOrder {
  Ascending = 1,
  Descending = 2,
}

interface ExtraExpandOptions<ISelect, IFilter> {
  filter?: (f: IFilter) => WebFilter;
  top?: number;
  orderBy?: (s: ISelect) => WebAttribute<ISelect, any, any>;
  sortOrder?: SortOrder;
}


namespace Filter {
  export function equals<T extends null | string | number | Date | XQW.Guid>(v1: T, v2: T): WebFilter { return comp(v1, "eq", v2) }
  export function notEquals<T extends null | string | number | Date | XQW.Guid>(v1: T, v2: T): WebFilter { return comp(v1, "ne", v2) }

  export function greaterThan<T extends number | Date>(v1: T, v2: T): WebFilter { return comp(v1, "gt", v2) }
  export function greaterThanOrEqual<T extends number | Date>(v1: T, v2: T): WebFilter { return comp(v1, "ge", v2) }
  export function lessThan<T extends number | Date>(v1: T, v2: T): WebFilter { return comp(v1, "lt", v2) }
  export function lessThanOrEqual<T extends number | Date>(v1: T, v2: T): WebFilter { return comp(v1, "le", v2) }

  export function and(f1: WebFilter, f2: WebFilter): WebFilter { return biFilter(f1, "and", f2) }
  export function or(f1: WebFilter, f2: WebFilter): WebFilter { return biFilter(f1, "or", f2) }
  export function not(f1: WebFilter): WebFilter { return <WebFilter><any>("not " + f1) }

  export function ands(fs: WebFilter[]): WebFilter { return nestedFilter(fs, "and") }
  export function ors(fs: WebFilter[]): WebFilter { return nestedFilter(fs, "or") }

  export function startsWith(v1: string, v2: string): WebFilter { return dataFunc("startswith", v1, v2) }
  export function substringOf(v1: string, v2: string): WebFilter { return dataFunc("substringof", v1, v2) }
  export function endsWith(v1: string, v2: string): WebFilter { return dataFunc("endswith", v1, v2) }

  /**
   * Makes a string into a GUID that can be sent to the OData source
   */
  export function makeGuid(id: string): XQW.Guid { return <XQW.Guid><any>XQW.makeTag(id) }

  /**
   * @internal
   */
  function getVal(v: any) {
    if (v == null) return "null"
    if (typeof v === "string") return `'${v}'`;
    if (v instanceof Date) return v.toISOString();
    return v.toString();
  }

  /**
   * @internal
   */
  function comp<T>(val1: T, op: string, val2: T): WebFilter {
    return <WebFilter><any>(`${getVal(val1)} ${op} ${getVal(val2)}`);
  }

  /**
   * @internal
   */
  function dataFunc<T>(funcName: string, val1: T, val2: T): WebFilter {
    return <WebFilter><any>(`${funcName}(${getVal(val1)}, ${getVal(val2)})`);
  }

  /**
   * @internal
   */
  function biFilter(f1: WebFilter, conj: string, f2: WebFilter): WebFilter {
    return <WebFilter><any>(`(${f1} ${conj} ${f2})`);
  }

  /**
   * @internal
   */
  function nestedFilter(fs: WebFilter[], conj: string): WebFilter {
    const last = fs.pop();
    return fs.reduceRight((acc, c) => biFilter(c, conj, acc), last);
  }
}

namespace XQW {
  export interface Guid {
    __XqwGuid: any;
  }

  /**
   * @internal
   */
  export function makeTag(name: string) {
    return { __str: name, toString: function () { return this.__str } }
  }

}


namespace XrmQuery {

  export var ApiUrl: string;

  export function retrieveMultiple<IEntity, ISelect, IExpand, IFilter, Result, FormattedResult>(entityPicker: (x: WebEntities) => WebMapping<IEntity, ISelect, IExpand, IFilter, Result, FormattedResult>) {
    return new XQW.RetrieveMultipleRecords(entityPicker);
  }

  export function retrieve<IEntity, ISelect, IExpand, IFilter, Result, FormattedResult>(entityPicker: (x: WebEntities) => WebMapping<IEntity, ISelect, IExpand, IFilter, Result, FormattedResult>, id: string) {
    return new XQW.RetrieveRecord(entityPicker, id);
  }

  export function create<IEntity>(entityPicker: (x: WebEntities) => WebMapping<IEntity, any, any, any, any, any>, record?: IEntity) {
    return new XQW.CreateRecord<IEntity>(entityPicker, record);
  }

  export function update<IEntity>(entityPicker: (x: WebEntities) => WebMapping<IEntity, any, any, any, any, any>, id?: string, record?: IEntity) {
    return new XQW.UpdateRecord<IEntity>(entityPicker, id, record);
  }

  export function deleteRecord<IEntity>(entityPicker: (x: WebEntities) => WebMapping<IEntity, any, any, any, any, any>, id?: string) {
    return new XQW.DeleteRecord<IEntity>(entityPicker, id);
  }

  export function sendCbRequest(type: XQW.HttpRequestType, queryString: string, data: any, successCb: (x: XMLHttpRequest) => any, errorCb: (err: Error) => any, preSend?: (req: XMLHttpRequest) => void) {
    let req = new XMLHttpRequest()
    req.open(type, encodeURI(XQW.getApiUrl() + queryString), true);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    if (preSend) preSend(req);

    req.onreadystatechange = function (this) {
      if (this.readyState == 4) {
        req.onreadystatechange = <any>null;
        if (this.status == 200 || this.status == 204) successCb(this);
        else errorCb(JSON.parse(this.response).error);
      }
    };
    req.send(data);
  }

  export function sendRequest(type: XQW.HttpRequestType, queryString: string, data: any, configure?: (req: XMLHttpRequest) => void) {
    if (!Promise) throw new Error("Promises are not natively supported in this browser. Add a polyfill to use it.");
    return new Promise<XMLHttpRequest>((resolve, reject) => {
      sendCbRequest(type, queryString, data, resolve, reject, configure);
    });
  }
}



namespace XQW {
  
  const FORMATTED_VALUE_ID = "OData.Community.Display.V1.FormattedValue";
  const FORMATTED_VALUE_SUFFIX = "@" + FORMATTED_VALUE_ID;
  const FORMATTED_VALUES_HEADER = { type: "Prefer", value: `odata.include-annotations="${FORMATTED_VALUE_ID}"` };
  const LOOKUP_ID = "_lookup$";

  export type HttpRequestType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  export interface RequestHeader {
    type: string;
    value: string;
  }

  function endsWith(str: string, suffix: string) {
    return str.substr(-suffix.length) == suffix;
  }

  function beginsWith(str: string, prefix: string) {
    return str.substr(0, prefix.length) == prefix;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  function reviver(name: string, value) {
    if (datePattern.test(value)) return new Date(value);
    let newName = name;
    const formatted = endsWith(newName, FORMATTED_VALUE_SUFFIX);

    if (formatted) newName = newName.substr(0, newName.length - 42);
    if (beginsWith(newName, '_') && endsWith(newName, '_value')) {
      newName = newName.substr(1, newName.length - 7);
      if (!formatted) newName += "_guid";
    }
    if (formatted) newName += "_formatted";
    if (newName != name) {
      this[newName] = value;
    } else {
      return value;
    }
  }

  /* A bit slower (but nicer) implementation using RegEx */
  //const pattern = /^(_)?(.+?)(_value)?(@OData\.Community\.Display\.V1\.FormattedValue)?$/;
  //function reviver(name: string, value) {
  //  if (datePattern.test(value)) return new Date(value);
  //  let m = pattern.exec(name);
  //  if (!m) return value;
  //  else if (m[4]) { this[m[2] + "_formatted"] = value; return; }
  //  else if (m[1] && m[3]) { this[m[2] + "_guid"] = value; return; }
  //  else return value;
  //}


  export abstract class Query<T> {
    protected additionalHeaders: RequestHeader[] = [];

    constructor(protected requestType: HttpRequestType) { }

    abstract getQueryString(): string;

    executePromise() {
      if (!Promise) throw new Error("Promises are not natively supported in this browser. Add a polyfill to use it.");
      return new Promise<T>((resolve, reject) => {
        this.execute(resolve, reject)
      });
    }

    execute(successCallback: (x: T) => any, errorCallback: (err: Error) => any = () => { }) {
      this._executeRaw(successCallback, errorCallback, true);
    }

    protected handleResponse = (req: XMLHttpRequest, useReviver?: boolean) => JSON.parse(req.response, useReviver ? reviver : undefined)
    protected getObjectToSend: () => any = () => null;

    /**
     * @internal
     */
    _executeRaw(successCallback: (x: T) => any, errorCallback: (err: Error) => any = () => { }, useReviver = false) {
      let configure = req => this.additionalHeaders.forEach(h => req.setRequestHeader(h.type, h.value));
      let successHandler = req => successCallback(this.handleResponse(req, useReviver));
      return XrmQuery.sendCbRequest(this.requestType, this.getQueryString(), this.getObjectToSend(), successHandler, errorCallback, configure);
    }
  }



  export class RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, FormattedResult, Result> extends Query<WebApiResult & Result> {
    /**
     * @internal
     */
    private entitySetName: string;
    /**
     * @internal
     */
    protected selects: string[] = [];
    /**
     * @internal
     */
    protected expands: string[] = [];
    /**
     * @internal
     */
    private ordering: string[] = [];
    /**
     * @internal
     */
    private filters: WebFilter;
    /**
     * @internal
     */
    private skipAmount: number | null = null;
    /**
     * @internal
     */
    private topAmount: number | null = null;

    getQueryString(): string {
      let options: string[] = [];
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
      return this.entitySetName + (options.length > 0 ? "?" + options.join("&") : "");
    }

    constructor(entityPicker: (x: WebEntities) => WebMapping<IEntity, ISelect, IExpand, IFilter, Result, FormattedResult>) {
      super("GET");
      this.entitySetName = taggedExec(entityPicker).toString();
    }

    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13, R14, F14, R15, F15>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>, WebAttribute<ISelect, R14, F14>, WebAttribute<ISelect, R15, F15>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13 & F14 & F15, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13 & R14 & R15>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13, R14, F14>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>, WebAttribute<ISelect, R14, F14>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13 & F14, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13 & R14>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3 & F4 & F5 & F6 & F7, R1 & R2 & R3 & R4 & R5 & R6 & R7>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3 & F4 & F5 & F6, R1 & R2 & R3 & R4 & R5 & R6>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3 & F4 & F5, R1 & R2 & R3 & R4 & R5>;
    select<R1, F1, R2, F2, R3, F3, R4, F4>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3 & F4, R1 & R2 & R3 & R4>;
    select<R1, F1, R2, F2, R3, F3>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2 & F3, R1 & R2 & R3>;
    select<R1, F1, R2, F2>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1 & F2, R1 & R2>;
    select<R1, F1>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, F1, R1>;
    select(vars: (x: ISelect) => WebAttribute<ISelect, any, any>[]): RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, FormattedResult, Result> {
      this.selects = this.selects.concat(<any>taggedExec(vars));
      return this;
    }


    expand<IExpSelect, IExpFilter, IExpResult>(
      exps: (x: IExpand) => WebExpand<IExpand, IExpSelect, IExpFilter, IExpResult>,
      selectVars?: (x: IExpSelect) => WebAttribute<IExpSelect, any, any>[],
      optArgs?: ExtraExpandOptions<IExpSelect, IExpFilter>)
      : RetrieveMultipleRecords<IEntity, ISelect, IExpand, IFilter, FormattedResult, Result & IExpResult> {

      const expand = taggedExec(exps).toString();
      this.selects.push(expand);

      let options: string[] = [];
      if (selectVars) options.push(`$select=${taggedExec(selectVars)}`);
      if (optArgs) {
        if (optArgs.top) options.push(`$top=${optArgs.top}`);
        if (optArgs.orderBy) options.push(`$orderby=${taggedExec(optArgs.orderBy)} ${optArgs.sortOrder != SortOrder.Descending ? "asc" : "desc"}`)
        if (optArgs.filter) options.push(`$filter=${taggedExec(optArgs.filter)}`);
      }
      this.expands.push(expand + (options.length > 0 ? `(${options.join(";")})` : ""));
      return this;
    }

    filter(filter: (x: IFilter) => WebFilter) {
      this.filters = taggedExec(filter);
      return this;
    }

    orFilter(filter: (x: IFilter) => WebFilter) {
      if (this.filters) this.filters = Filter.or(this.filters, taggedExec(filter));
      else this.filter(filter);
      return this;
    }

    andFilter(filter: (x: IFilter) => WebFilter) {
      if (this.filters) this.filters = Filter.and(this.filters, taggedExec(filter));
      else this.filter(filter);
      return this;
    }

    /**
     * @internal
     */
    private order(vars: (x: ISelect) => WebAttribute<ISelect, any, any>, by: string) {
      this.ordering.push(taggedExec(vars) + " " + by);
      return this;
    }

    orderAsc(vars: (x: ISelect) => WebAttribute<ISelect, any, any>) {
      return this.order(vars, "asc");
    }

    orderDesc(vars: (x: ISelect) => WebAttribute<ISelect, any, any>) {
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


    includeFormattedValues(): Query<WebApiResult & FormattedResult & Result> {
      this.additionalHeaders.push(FORMATTED_VALUES_HEADER);
      return this;
    }
  }



  export class RetrieveRecord<IEntity, ISelect, IExpand, FormattedResult, Result> extends Query<WebApiResult & Result> {
    /**
     * @internal
     */
    private entitySetName: string;
    /**
     * @internal
     */
    protected selects: string[] = [];
    /**
     * @internal
     */
    protected expands: string[] = [];

    constructor(entityPicker: (x: WebEntities) => WebMapping<IEntity, ISelect, IExpand, any, Result, FormattedResult>, private id?: string) {
      super("GET");
      this.entitySetName = taggedExec(entityPicker).toString();
    }

    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13, R14, F14, R15, F15>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>, WebAttribute<ISelect, R14, F14>, WebAttribute<ISelect, R15, F15>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13 & F14 & F15, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13 & R14 & R15>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13, R14, F14>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>, WebAttribute<ISelect, R14, F14>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13 & F14, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13 & R14>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8, R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3 & F4 & F5 & F6 & F7, R1 & R2 & R3 & R4 & R5 & R6 & R7>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3 & F4 & F5 & F6, R1 & R2 & R3 & R4 & R5 & R6>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3 & F4 & F5, R1 & R2 & R3 & R4 & R5>;
    select<R1, F1, R2, F2, R3, F3, R4, F4>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3 & F4, R1 & R2 & R3 & R4>;
    select<R1, F1, R2, F2, R3, F3>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2 & F3, R1 & R2 & R3>;
    select<R1, F1, R2, F2>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>]): RetrieveRecord<IEntity, ISelect, IExpand, F1 & F2, R1 & R2>;
    select<R1, F1>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>]): RetrieveRecord<IEntity, ISelect, IExpand, F1, R1>;
    select(vars: (x: ISelect) => WebAttribute<ISelect, any, any>[]): RetrieveRecord<IEntity, ISelect, IExpand, FormattedResult, Result> {
      this.selects = this.selects.concat(<any>taggedExec(vars));
      return this;
    }

    expand<IExpSelect, IExpFilter, IExpResult>(
      exps: (x: IExpand) => WebExpand<IExpand, IExpSelect, IExpFilter, IExpResult>,
      selectVars?: (x: IExpSelect) => WebAttribute<IExpSelect, any, any>[],
      optArgs?: ExtraExpandOptions<IExpSelect, IExpFilter>)
      : RetrieveRecord<IEntity, ISelect, IExpand, FormattedResult, Result & IExpResult> {

      const expand = taggedExec(exps).toString();
      this.selects.push(expand);

      let options: string[] = [];
      if (selectVars) options.push(`$select=${taggedExec(selectVars)}`);
      if (optArgs) {
        if (optArgs.top) options.push(`$top=${optArgs.top}`);
        if (optArgs.orderBy) options.push(`$orderby=${taggedExec(optArgs.orderBy)} ${optArgs.sortOrder != SortOrder.Descending ? "asc" : "desc"}`)
        if (optArgs.filter) options.push(`$filter=${taggedExec(optArgs.filter)}`);
      }
      this.expands.push(expand + (options.length > 0 ? `(${options.join(";")})` : ""));
      return this;
    }

    getQueryString(): string {
      let options: string[] = [];
      if (this.selects.length > 0) options.push("$select=" + this.selects.join(","));
      if (this.expands.length > 0) options.push("$expand=" + this.expands.join(","));
      return `${this.entitySetName}(${this.id})` + (options.length > 0 ? "?" + options.join("&") : "");
    }

    includeFormattedValues(): Query<WebApiResult & FormattedResult & Result> {
      this.additionalHeaders.push(FORMATTED_VALUES_HEADER);
      return this;
    }
  }


  /**
   * Contains information about a Create query
   */
  export class CreateRecord<IEntity> extends Query<string> {
    /** 
     * @internal 
     */
    private entitySetName: string;

    constructor(entityPicker: (x: WebEntities) => WebMapping<IEntity, any, any, any, any, any>, private record?: IEntity) {
      super("POST");
      this.entitySetName = taggedExec(entityPicker).toString();
    }

    setData(record: IEntity) {
      this.record = record;
      return this;
    }

    protected getObjectToSend = () => JSON.stringify(this.record, attrToCrm);

    protected handleResponse = (req: XMLHttpRequest) => {
      let header = req.getResponseHeader("OData-EntityId");
      return header && header.substr(-37, 36);
    }

    getQueryString(): string {
      return this.entitySetName;
    }
  }

  /**
   * Contains information about a Delete query
   */
  export class DeleteRecord<IEntity> extends Query<void> {
    /** 
     * @internal 
     */
    private entitySetName: string;

    constructor(entityPicker: (x: WebEntities) => WebMapping<IEntity, any, any, any, any, any>, private id?: string) {
      super("DELETE");
      this.entitySetName = taggedExec(entityPicker).toString();
    }

    setId(id: string) {
      this.id = id;
      return this;
    }

    getQueryString(): string {
      return `${this.entitySetName}(${this.id})`;
    }
  }


  /**
   * Contains information about an UpdateRecord query
   */
  export class UpdateRecord<IEntity> extends Query<void> {
    /** 
     * @internal 
     */
    private entitySetName: string;

    constructor(entityPicker: (x: WebEntities) => WebMapping<IEntity, any, any, any, any, any>, private id?: string, private record?: IEntity) {
      super("PATCH");
      this.entitySetName = taggedExec(entityPicker).toString();
    }

    setData(id: string, record: IEntity) {
      this.id = id;
      this.record = record;
      return this;
    }

    protected getObjectToSend = () => JSON.stringify(this.record, attrToCrm);

    getQueryString(): string {
      return `${this.entitySetName}(${this.id})`;
    }
  }


  /**
   * @internal
   */
  function taggedExec<T>(f: (x: any) => T): T {
    return f(tagMatches(f));
  }

  /**
   * @internal
   */
  const fPatt = /function[^\(]*\(([a-zA-Z0-9_]+)[^\{]*\{([\s\S]*)\}$/m

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
    let m = f.toString().match(fPatt);
    if (!m) throw new Error(`XrmQuery: Unable to properly parse function: ${f.toString()}`);
    return { arg: m[1], body: m[2] };
  }

  /**
   * @internal
   */
  function tagMatches(f: (x: any) => any) {
    let funcInfo = analyzeFunc(f);
    let regex = objRegex(funcInfo.arg);

    let obj = {};
    let match;
    while ((match = regex.exec(funcInfo.body)) != null) {
      if (!obj[match[1]]) {
        obj[match[1]] = XQW.makeTag(match[1]);
      }
      if (match[3]) {
        obj[match[1]][match[3]] = XQW.makeTag(match[1] + "/" + match[3]);
      }
    }
    return obj;
  }

  /**
   * @internal
   */
  export function getApiUrl() {
    let url = XrmQuery.ApiUrl;
    return url ? url : getClientUrl() + "/api/data/v8.1/";
  }

  declare var Xrm: any;
  /**
   * @internal
   */
  function getClientUrl() {
    if (GetGlobalContext && GetGlobalContext().getClientUrl) {
      return GetGlobalContext().getClientUrl();
    }
    else {
      if (Xrm && Xrm.Page && Xrm.Page.context) {
        try {
          return Xrm.Page.context.getClientUrl();
        } catch (e) {
          throw new Error("Xrm.Page.context.getClientUrl is not available.");
        }
      }
      else { throw new Error("Context is not available."); }
    }
  }

  function keyToCrm(name: string) {
    const idx = name.indexOf(LOOKUP_ID);
    if (idx == -1) return name;
    return `_${name.substr(0, idx)}_value`;
  }

  function parseObject(obj: any) {
    if (obj instanceof Object) {
      const f = attrToCrm.bind(obj);
      Object.keys(obj).forEach(key => {
        let v = f(key, parseObject(obj[key]));
        if (v !== undefined) obj[key] = v;
      });
      return obj;

    } else if (obj instanceof Array) {
      return obj.map(x => parseObject(x));

    } else {
      return obj;
    }
  }

  function attrToCrm(key: string, value: any) {
    const lookupIdx = key.indexOf(LOOKUP_ID);
    if (lookupIdx >= 0) {
      const entity = key.substr(lookupIdx + LOOKUP_ID.length);
      this[`${key.substr(0, lookupIdx)}@odata.bind`] = `/${entity}(${value})`;
      return;
    }
    return value;
  }
}