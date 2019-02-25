namespace XrmQuery {
	/**
	 * Instantiates specification of a query that can retrieve a specific record.
	 * @param entityPicker Function to select which entity-type should be targeted.
	 * @param id GUID of the wanted record.
	 */
  export function retrieve<ISelect, IExpand, IFixed, FormattedResult, Result>(
    entityPicker: (x: WebEntitiesRetrieve) => WebMappingRetrieve<ISelect, IExpand, any, IFixed, Result, FormattedResult>,
    id: string) {
    return XQW.RetrieveRecord.Get<ISelect, IExpand, IFixed, FormattedResult, Result>(entityPicker, id);
  }

	/**
	 * Instantiates specification of a query that can retrieve multiple records of a certain entity.
	 * @param entityPicker Function to select which entity should be targeted.
	 */
  export function retrieveMultiple<ISelect, IExpand, IFilter, IFixed, FormattedResult, Result>(
    entityPicker: (x: WebEntitiesRetrieve) => WebMappingRetrieve<ISelect, IExpand, IFilter, IFixed, Result, FormattedResult>) {
    return XQW.RetrieveMultipleRecords.Get<ISelect, IExpand, IFilter, IFixed, FormattedResult, Result>(entityPicker);
  }

	/**
	 * Instantiates specification of a query that can retrieve a related record of a given record.
	 * @param entityPicker Function to select which entity-type the related record should be retrieved from.
	 * @param id GUID of the record of which the related record should be retrieved.
	 * @param relatedPicker Function to select which navigation property points to the related record.
	 */
  export function retrieveRelated<ISingle, ISelect, IExpand, IFixed, FormattedResult, Result>(
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<ISingle, any>,
    id: string,
    relatedPicker: (x: ISingle) => WebMappingRetrieve<ISelect, IExpand, any, IFixed, Result, FormattedResult>) {
    return XQW.RetrieveRecord.Related<ISingle, ISelect, IExpand, IFixed, FormattedResult, Result>(entityPicker, id, relatedPicker);
  }

	/**
	 * Instantiates specification of a query that can retrieve multiple related records of a given record.
	 * @param entityPicker  Function to select which entity-type the related records should be retrieved from.
	 * @param id GUID of the record of which the related records should be retrieved.
	 * @param relatedPicker Function to select which navigation property points to the related records.
	 */
  export function retrieveRelatedMultiple<IMultiple, ISelect, IExpand, IFilter, IFixed, FormattedResult, Result>(
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<any, IMultiple>,
    id: string,
    relatedPicker: (x: IMultiple) => WebMappingRetrieve<ISelect, IExpand, IFilter, IFixed, Result, FormattedResult>) {
    return XQW.RetrieveMultipleRecords.Related<IMultiple, ISelect, IExpand, IFilter, IFixed, FormattedResult, Result>(entityPicker, id, relatedPicker);
  }

	/**
	 * Instantiates a query that can create a record.
	 * @param entityPicker Function to select which entity-type should be created.
	 * @param record Object of the record to be created.
	 */
  export function create<ICreate>(
    entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<ICreate, any, any>,
    record?: ICreate) {
    return new XQW.CreateRecord<ICreate>(entityPicker, record);
  }

	/**
	 * Instantiates a query that can update a specific record.
	 * @param entityPicker Function to select which entity-type should be updated.
	 * @param id GUID of the record to be updated.
	 * @param record Object containing the attributes to be updated.
	 */
  export function update<IUpdate>(
    entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, IUpdate, any>,
    id?: string,
    record?: IUpdate) {
    return new XQW.UpdateRecord<IUpdate>(entityPicker, id, record);
  }

  /**
   * Instantiates a query that can associate two specific records with a N:1 relation.
   * @param entityPicker Function to select the entity-type of the source entity.
   * @param id GUID of the source entity.
   * @param entityTargetPicker Function to select the entity-type of the target entity.
   * @param targetId GUID of the target entity.
   * @param relationPicker Function to select which N:1 relation (lookup-field) should be used to associate.
   */
  export function associateSingle<ISingle, ISelect>(
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<ISingle, any>,
    id: string,
    entityTargetPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, any, ISelect>,
    targetId: string,
    relationPicker: (x: ISingle) => WebMappingRetrieve<ISelect, any, any, any, any, any>) {
    return new XQW.AssociateRecordSingle<ISingle, ISelect>(entityPicker, id, entityTargetPicker, targetId, relationPicker);
  }

  /**
   * Instantiates a query that can associate two specific records with a N:N or 1:N relation.
   * @param entityPicker Function to select the entity-type of the source entity.
   * @param id GUID of the source entity.
   * @param entityTargetPicker Function to select the entity-type of the target entity.
   * @param targetId GUID of the target entity.
   * @param relationPicker Function to select which N:N or 1:N relation should be used to associate.
   */
  export function associateCollection<IMultiple, ISelect>(
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<any, IMultiple>,
    id: string,
    entityTargetPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, any, ISelect>,
    targetId: string,
    relationPicker: (x: IMultiple) => WebMappingRetrieve<ISelect, any, any, any, any, any>) {
    return new XQW.AssociateRecordCollection<IMultiple, ISelect>(entityPicker, id, entityTargetPicker, targetId, relationPicker);
  }

  /**
   * Instantiates a query that can disassociate two specific records with a N:1 relation.
   * @param entityPicker Function to select the entity-type of the source entity.
   * @param id GUID of the source entity.
   * @param relationPicker Function to select which N:1 relation (lookup-field) should be used to disassociate.
   */

  export function disassociateSingle<ISingle, ISelect>(
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<ISingle, any>,
    id: string,
    relationPicker: (x: ISingle) => WebMappingRetrieve<ISelect, any, any, any, any, any>) {
    return XQW.DisassociateRecord.Single<ISingle, ISelect>(entityPicker, id, relationPicker);
  }

  /**
   * Instantiates a query that can disassociate two specific records with a N:N or 1:N relation.
   * @param entityPicker Function to select the entity-type of the source entity.
   * @param id GUID of the source entity.
   * @param relationPicker Function to select which N:N or 1:N relation should be used to disassociate.
   * @param targetId GUID of the target entity.
   */

  export function disassociateCollection<IMultiple, ISelect>(
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<any, IMultiple>,
    id: string,
    relationPicker: (x: IMultiple) => WebMappingRetrieve<ISelect, any, any, any, any, any>,
    targetId: string) {
    return XQW.DisassociateRecord.Collection<IMultiple, ISelect>(entityPicker, id, relationPicker, targetId);
  }

	/**
	 * Instantiates a query that can delete a specific record.
	 * @param entityPicker Function to select which entity-type should be deleted.
	 * @param id GUID of the record to be updated.
	 */
  export function deleteRecord(
    entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, any, any>,
    id?: string) {
    return new XQW.DeleteRecord(entityPicker, id);
  }

	/**
	 * Makes XrmQuery use the given custom url to access the Web API.
	 * @param url The url targeting the API. For example: '/api/data/v8.2/'
	 */
  export function setApiUrl(url: string | null) {
    XQW.ApiUrl = url;
  }

	/**
	 * Makes XrmQuery use the given version to access the Web API.
	 * @param v Version to use for the API. For example: '8.2'
	 */
  export function setApiVersion(v: string) {
    XQW.ApiUrl = XQW.getDefaultUrl(v);
  }

	/**
	 * @internal
	 */
  export function request(type: XQW.HttpRequestType, url: string, data: any, successCb: (x: XMLHttpRequest) => any, errorCb: (err: Error) => any = () => { }, preSend?: (req: XMLHttpRequest) => void) {
    let req = new XMLHttpRequest()
    req.open(type, url, true);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    if (preSend) preSend(req);

    req.onreadystatechange = function (this) {
      if (this.readyState == 4) {
        req.onreadystatechange = <any>null;
        if (this.status == 200 || this.status == 204) successCb(this);
        else errorCb(new Error(this.response));
      }
    };
    req.send(data);
  }

	/**
	 * Sends a request to the Web API with the given parameters.
	 * @param type Type of request, i.e. "GET", "POST", etc
	 * @param queryString Query-string to use for the API. For example: 'accounts?$count=true'
	 * @param data Object to send with request
	 * @param successCb Success callback handler function
	 * @param errorCb Error callback handler function
	 * @param configure Modify the request before it it sent to the endpoint - like adding headers.
	 */
  export function sendRequest(type: XQW.HttpRequestType, queryString: string, data: any, successCb: (x: XMLHttpRequest) => any, errorCb?: (err: Error) => any, configure?: (req: XMLHttpRequest) => void): void {
    request(type, encodeSpaces(XQW.getApiUrl() + queryString), data, successCb, errorCb, configure);
  }

	/**
	 * Sends a request to the Web API with the given parameters and returns a promise.
	 * @param type Type of request, i.e. "GET", "POST", etc
	 * @param queryString Query-string to use for the API. For example: 'accounts?$count=true'
	 * @param data Object to send with request
	 * @param configure Modify the request before it it sent to the endpoint - like adding headers.
	 */
  export function promiseRequest(type: XQW.HttpRequestType, queryString: string, data: any, configure?: (req: XMLHttpRequest) => void): Promise<XMLHttpRequest> {
    return XQW.promisifyCallback((success, error?) => sendRequest(type, queryString, data, success, error, configure));
  }

  function encodeSpaces(str: string): string {
    return str.replace(/ /g, "%20");
  }
}


namespace Filter {
  export function equals<T extends null | string | number | Date | XQW.Guid | boolean>(v1: T, v2: T): WebFilter { return comp(v1, "eq", v2) }
  export function notEquals<T extends null | string | number | Date | XQW.Guid | boolean>(v1: T, v2: T): WebFilter { return comp(v1, "ne", v2) }

  export function greaterThan<T extends number | Date>(v1: T, v2: T): WebFilter { return comp(v1, "gt", v2) }
  export function greaterThanOrEqual<T extends number | Date>(v1: T, v2: T): WebFilter { return comp(v1, "ge", v2) }
  export function lessThan<T extends number | Date>(v1: T, v2: T): WebFilter { return comp(v1, "lt", v2) }
  export function lessThanOrEqual<T extends number | Date>(v1: T, v2: T): WebFilter { return comp(v1, "le", v2) }

  export function and(f1: WebFilter, f2: WebFilter): WebFilter { return biFilter(f1, "and", f2) }
  export function or(f1: WebFilter, f2: WebFilter): WebFilter { return biFilter(f1, "or", f2) }
  export function not(f1: WebFilter): WebFilter { return <WebFilter><any>("not " + f1) }

  export function ands(fs: WebFilter[]): WebFilter { return nestedFilter(fs, "and") }
  export function ors(fs: WebFilter[]): WebFilter { return nestedFilter(fs, "or") }

  export function startsWith(val: string, prefix: string): WebFilter { return dataFunc("startswith", val, prefix) }
  export function contains(val: string, needle: string): WebFilter { return dataFunc("contains", val, needle) }
  export function endsWith(val: string, suffix: string): WebFilter { return dataFunc("endswith", val, suffix) }

	/**
	 * Makes a string into a GUID that can be sent to the OData source
	 */
  export function makeGuid(id: string): XQW.Guid { return <XQW.Guid><any>XQW.makeTag(XQW.stripGUID(id)) }

	/**
	 * @internal
	 */
  function getVal(v: any) {
    if (v == null) return "null"
    if (typeof v === "string") return `'${encodeSpecialCharacters(v)}'`;
    if (v instanceof Date) return encodeSpecialCharacters(v.toISOString());
    return encodeSpecialCharacters(v.toString());
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
    if (last === undefined) {
      return <WebFilter><any>('');
    }
    return fs.reduceRight((acc, c) => biFilter(c, conj, acc), last);
  }

  /**
   * @internal
   */
  function encodeSpecialCharacters(queryString: string) {
    return encodeURI(queryString)
      .replace(/'/g, "''")
      .replace(/\+/g, "%2B")
      .replace(/\//g, "%2F")
      .replace(/\?/g, "%3F")
      .replace(/#/g, "%23")
      .replace(/&/g, "%26");
  }
}

interface WebEntitiesRetrieve { }
interface WebEntitiesRelated { }
interface WebEntitiesCUDA { }

declare var GetGlobalContext: any;

interface WebMappingRetrieve<ISelect, IExpand, IFilter, IFixed, Result, FormattedResult> {
  __WebMappingRetrieve: ISelect;
}

interface WebMappingCUDA<ICreate, IUpdate, ISelect> {
  __WebMappingCUDA: ICreate & IUpdate & ISelect;
}

interface WebMappingRelated<ISingle, IMultiple> {
  __WebMappingRelated: ISingle & IMultiple;
}

interface WebAttribute<ISelect, Result, Formatted> {
  __WebAttribute: ISelect;
}

interface WebExpand<IExpand, ChildSelect, ChildFilter, Result> {
  __WebExpandable: IExpand;
}

interface WebFilter {
  __WebFilter: any;
}

const enum SortOrder {
  Ascending = 1,
  Descending = 2,
}

interface ExpandOptions<ISelect, IFilter> {
  filter?: (f: IFilter) => WebFilter;
  top?: number;
  orderBy?: (s: ISelect) => WebAttribute<ISelect, any, any>;
  sortOrder?: SortOrder;
}


namespace XQW {

  const FORMATTED_VALUE_ID = "OData.Community.Display.V1.FormattedValue";
  const FORMATTED_VALUE_SUFFIX = "@" + FORMATTED_VALUE_ID;
  const FORMATTED_VALUES_HEADER = { type: "Prefer", value: `odata.include-annotations="${FORMATTED_VALUE_ID}"` };
  const LOOKUP_LOGICALNAME_ID = "Microsoft.Dynamics.CRM.lookuplogicalname";
  const LOOKUP_LOGICALNAME_SUFFIX = "@" + LOOKUP_LOGICALNAME_ID;
  const LOOKUP_NAVIGATIONPROPERTY_ID = "Microsoft.Dynamics.CRM.associatednavigationproperty";
  const LOOKUP_NAVIGATIONPROPERTY_SUFFIX = "@" + LOOKUP_NAVIGATIONPROPERTY_ID;
  const INCLUDE_ANNOTATIONS_HEADER = { type: "Prefer", value: `odata.include-annotations="*"` };
  const BIND_ID = "_bind$";
  const ID_ID = "_id$";
  const GUID_ENDING = "_guid";
  const FORMATTED_ENDING = "_formatted";
  const LOOKUP_LOGICALNAME_ENDING = "_lookuplogicalname";
  const LOOKUP_NAVIGATIONPROPERTY_ENDING = "_navigationproperty";
  const NEXT_LINK_ID = "@odata.nextLink";

  const MaxPageSizeHeader = (size: number) => ({ type: "Prefer", value: `odata.maxpagesize=${size}` });

  export type HttpRequestType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  export interface RequestHeader {
    type: string;
    value: string;
  }

  export interface Guid {
    __XqwGuid: any;
  }

  export function makeTag(name: string) {
    return { __str: name, toString: function () { return this.__str } }
  }


  function endsWith(str: string, suffix: string) {
    return str.substr(-suffix.length) == suffix;
  }

  function beginsWith(str: string, prefix: string) {
    return str.substr(0, prefix.length) == prefix;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
  function reviver(name: string, value: any) {
    if (datePattern.test(value)) return new Date(value);
    let newName = name;
    const formatted = endsWith(newName, FORMATTED_VALUE_SUFFIX);
    const lookupLogicalName = endsWith(newName, LOOKUP_LOGICALNAME_SUFFIX);
    const lookupNavProperty = endsWith(newName, LOOKUP_NAVIGATIONPROPERTY_SUFFIX);

    if (formatted) newName = newName.substr(0, newName.length - FORMATTED_VALUE_SUFFIX.length);
    else if (lookupLogicalName) newName = newName.substr(0, newName.length - LOOKUP_LOGICALNAME_SUFFIX.length);
    else if (lookupNavProperty) newName = newName.substr(0, newName.length - LOOKUP_NAVIGATIONPROPERTY_SUFFIX.length);

    if (beginsWith(newName, '_') && endsWith(newName, '_value')) {
      newName = newName.substr(1, newName.length - 7);
      if (formatted) newName += FORMATTED_ENDING;
      else if (lookupLogicalName) newName += LOOKUP_LOGICALNAME_ENDING;
      else if (lookupNavProperty) newName += LOOKUP_NAVIGATIONPROPERTY_ENDING;
      else newName += GUID_ENDING;
    }
    
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

  export function stripGUID(guid: string) {
      if (startsWith("{", guid) && endsWith("}", guid))
      return guid.substring(1, guid.length - 1);
    else
      return guid;
  }

  function parseRetrievedData<T>(req: XMLHttpRequest): T {
    return JSON.parse(req.response, reviver)
  }

  function isStringArray(arr: any[] | string[]): arr is string[] {
    return arr.length > 0 && typeof (arr[0]) === "string";
  }

  export function promisifyCallback<T>(callbackFunc: (success: (t: T) => any, errorCb?: (e: Error) => any) => any): Promise<T> {
    if (!Promise) throw new Error("Promises are not natively supported in this browser. Add a polyfill to use it.");
    return new Promise<T>((resolve, reject) => {
      callbackFunc(resolve, reject)
    });
  }


  interface MultiResult {
    value: any[];
    "@odata.nextLink": string;
  }

  interface ExpandKey {
    arrKey: string;
    linkKey: string;
  }

  abstract class LinkHelper {
    private missingCallbacks = 0;
    private isDoneSending = false;
    private isDoingWork = false;

    constructor(protected toReturn: any, private successCallback: Function, protected errorCallback: (e: Error) => any) {
    }

    protected followLink(linkUrl: string, expandKeys: ExpandKey[], valPlacer: (vs: any[]) => void) {
      this.performingCallback();

      XrmQuery.request("GET", linkUrl, null, (req) => {
        let resp = parseRetrievedData<MultiResult>(req);

        PageLinkHelper.followLinks(resp, expandKeys, (vals) => {
          valPlacer(vals);
          this.callbackReceived();

        }, this.errorCallback);
      },
        (err: Error) => {
          this.callbackReceived();
          this.errorCallback(err);
        });
    }

    protected populateRecord(rec: any, expandKeys: ExpandKey[]) {
      this.performingCallback();
      EntityLinkHelper.followLinks(rec, expandKeys, this.callbackReceived, this.errorCallback)
    }

    protected allSent() {
      if (!this.isDoingWork) return this.successCallback(this.toReturn);
      this.isDoneSending = true;
    }

    private performingCallback() {
      this.missingCallbacks++;
      this.isDoingWork = true;
    }


    protected callbackReceived = () => {
      this.missingCallbacks--;
      if (this.allSent && this.missingCallbacks == 0) {
        this.successCallback(this.toReturn);
      }
    }
  }

  class EntityLinkHelper extends LinkHelper {

    static followLinks(rec: any, expandKeys: ExpandKey[] | string[], successCallback: (t: any) => any, errorCallback: (e: Error) => any) {
      if (expandKeys.length == 0) return successCallback(rec);

      if (isStringArray(expandKeys)) {
        expandKeys = expandKeys.map(k => ({ arrKey: k, linkKey: k + NEXT_LINK_ID }));
      }

      return new EntityLinkHelper(rec, expandKeys, successCallback, errorCallback);
    }

    private constructor(rec: any, expandKeys: ExpandKey[], successCallback: (t: any) => any, errorCallback: (e: Error) => any) {
      super(rec, successCallback, errorCallback);

      expandKeys.forEach(exp => {
        let linkUrl = rec[exp.linkKey];
        if (linkUrl) {
          delete rec[exp.linkKey];

          this.followLink(linkUrl, [], vals => {
            rec[exp.arrKey] = rec[exp.arrKey].concat(vals);
          });
        }
      });

      this.allSent();
    }
  }

	/**
	 * Helper class to expand on all @odata.nextLink, both pages and on entities retrieved
	 */
  class PageLinkHelper extends LinkHelper {

    static followLinks(obj: MultiResult, expandKeys: ExpandKey[] | string[], successCallback: (t: any) => any, errorCallback: (e: Error) => any) {
      if (!obj["@odata.nextLink"] && (obj.value.length == 0 || expandKeys.length == 0)) return successCallback(obj.value);

      if (expandKeys.length == 0) {
        return new PageLinkHelper(obj, [], successCallback, errorCallback);
      }

      if (isStringArray(expandKeys)) {
        expandKeys = expandKeys.map(k => ({ arrKey: k, linkKey: k + NEXT_LINK_ID }));
      }

      if (obj.value.length == 0) {
        return new PageLinkHelper(obj, expandKeys, successCallback, errorCallback);

      } else { // Trim expand keys down to the ones that may have nextLinks
        let firstRec = obj.value[0];
        let toKeep = expandKeys.filter(exp => firstRec[exp.linkKey]);
        return new PageLinkHelper(obj, toKeep, successCallback, errorCallback);
      }
    }

    private constructor(obj: MultiResult, expandKeys: ExpandKey[], successCallback: (t: any) => any, errorCallback: (e: Error) => any) {
      super(obj.value, successCallback, errorCallback);

      let nextPage = obj["@odata.nextLink"];
      if (nextPage) {
        this.followLink(nextPage, expandKeys, vals => {
          this.toReturn = this.toReturn.concat(vals);
        });
      }

      if (expandKeys.length > 0) {
        obj.value.forEach(r => this.populateRecord(r, expandKeys));
      }

      this.allSent();
    }
  }



  export abstract class Query<T> {
    protected additionalHeaders: RequestHeader[] = [];

    constructor(protected requestType: HttpRequestType) { }

    abstract getQueryString(): string;
    protected abstract handleResponse(req: XMLHttpRequest, successCallback: (t: T) => any, errorCallback: (e: Error) => any): void;
    protected getObjectToSend: () => any = () => null;

    promise(): Promise<T> {
      return promisifyCallback<T>(this.execute.bind(this));
    }

    execute(successCallback: (x: T) => any, errorCallback: (err: Error) => any = () => { }): void {
      this.executeRaw(successCallback, errorCallback, true);
    }


		/**
		 * @internal
		 */
    executeRaw(successCallback: (x: T) => any, errorCallback: (err: Error) => any, parseResult: true): void;
    executeRaw(successCallback: (x: XMLHttpRequest) => any, errorCallback: (err: Error) => any, parseResult: false): void;
    executeRaw(successCallback: ((x: T) => any) & ((x: XMLHttpRequest) => any), errorCallback: (err: Error) => any = () => { }, parseResult: boolean = false): void {
      let config = (req: XMLHttpRequest) => this.additionalHeaders.forEach(h => req.setRequestHeader(h.type, h.value));
      let successHandler = (req: XMLHttpRequest) => parseResult ? this.handleResponse(req, successCallback, errorCallback) : successCallback(req);
      return XrmQuery.sendRequest(this.requestType, this.getQueryString(), this.getObjectToSend(), successHandler, errorCallback, config);
    }
  }


  export class RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, FormattedResult, Result> extends Query<Result[]> {
		/**
		 * @internal
		 */
    private specialQuery: string | undefined = undefined;
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
    private expandKeys: string[] = [];
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

    static Get<ISelect, IExpand, IFilter, IFixed, FormattedResult, Result>(
      entityPicker: (x: WebEntitiesRetrieve) => WebMappingRetrieve<ISelect, IExpand, IFilter, IFixed, Result, FormattedResult>) {
      return new RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, FormattedResult, Result>(taggedExec(entityPicker).toString());
    }

    static Related<IMultiple, ISelect, IExpand, IFilter, IFixed, FormattedResult, Result>(
      entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<any, IMultiple>,
      id: string,
      relatedPicker: (x: IMultiple) => WebMappingRetrieve<ISelect, IExpand, IFilter, IFixed, Result, FormattedResult>) {
      return new RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, FormattedResult, Result>(taggedExec(entityPicker).toString(), id, taggedExec(relatedPicker).toString());
    }

    private constructor(private entitySetName: string, private id?: string, private relatedNav?: string) {
      super("GET");
      this.id = id !== undefined ? stripGUID(id) : id;
    }

    protected handleResponse(req: XMLHttpRequest, successCallback: (r: Result[]) => any, errorCallback: (e: Error) => any) {
      PageLinkHelper.followLinks(parseRetrievedData<MultiResult>(req), this.expandKeys, successCallback, errorCallback);
    }

    getFirst(successCallback: (r: Result | null) => any, errorCallback?: (e: Error) => any) {
      this.top(1);
      this.execute(res => successCallback(res && res.length > 0 ? res[0] : null), errorCallback);
    }

    promiseFirst(): Promise<Result> {
      return promisifyCallback<Result>(this.getFirst.bind(this));
    }


    getQueryString(): string {
      let prefix = this.entitySetName;
      if (this.id && this.relatedNav) {
        prefix += `(${this.id})/${this.relatedNav}`;
      }
      if (this.specialQuery) return prefix + this.specialQuery;

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
      return prefix + (options.length > 0 ? `?${options.join("&")}` : "");
    }



    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13, R14, F14, R15, F15>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>, WebAttribute<ISelect, R14, F14>, WebAttribute<ISelect, R15, F15>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13 & F14 & F15, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13 & R14 & R15>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13, R14, F14>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>, WebAttribute<ISelect, R14, F14>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13 & F14, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13 & R14>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6, IFixed & R1 & R2 & R3 & R4 & R5 & R6>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5, IFixed & R1 & R2 & R3 & R4 & R5>;
    select<R1, F1, R2, F2, R3, F3, R4, F4>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4, IFixed & R1 & R2 & R3 & R4>;
    select<R1, F1, R2, F2, R3, F3>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3, IFixed & R1 & R2 & R3>;
    select<R1, F1, R2, F2>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2, IFixed & R1 & R2>;
    select<R1, F1>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1, IFixed & R1>;
    select(vars: (x: ISelect) => WebAttribute<ISelect, any, any>[]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, FormattedResult, Result> {
      this.selects = parseSelects(vars);
      return this;
    }

    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13, R14, F14, R15, F15>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>, WebAttribute<ISelect, R14, F14>, WebAttribute<ISelect, R15, F15>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13 & F14 & F15, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13 & R14 & R15>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13, R14, F14>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>, WebAttribute<ISelect, R14, F14>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13 & F14, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13 & R14>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5 & F6, Result & R1 & R2 & R3 & R4 & R5 & R6>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4 & F5, Result & R1 & R2 & R3 & R4 & R5>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3 & F4, Result & R1 & R2 & R3 & R4>;
    selectMore<R1, F1, R2, F2, R3, F3>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2 & F3, Result & R1 & R2 & R3>;
    selectMore<R1, F1, R2, F2>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1 & F2, Result & R1 & R2>;
    selectMore<R1, F1>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, F1, Result & R1>;
    selectMore(vars: (x: ISelect) => WebAttribute<ISelect, any, any>[]): RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, FormattedResult, Result> {
      this.selects = this.selects.concat(parseSelects(vars));
      return this;
    }


    expand<IExpSelect, IExpFilter, IExpResult>(
      exps: (x: IExpand) => WebExpand<IExpand, IExpSelect, IExpFilter, IExpResult>,
      selectVarFunc?: (x: IExpSelect) => WebAttribute<IExpSelect, any, any>[])
      : RetrieveMultipleRecords<ISelect, IExpand, IFilter, IFixed, FormattedResult, IExpResult & Result> {

      const expand = taggedExec(exps).toString();
      this.selects.push(expand);
      this.expandKeys.push(expand);

      let options: string[] = [];
      if (selectVarFunc) options.push(`$select=${parseSelects(selectVarFunc)}`);

      this.expands.push(expand + (options.length > 0 ? `(${options.join(";")})` : ""));
      return <any>this;
    }

    filter(filter: (x: IFilter) => WebFilter) {
      this.filters = parseWithTransform(filter);
      return this;
    }

    orFilter(filter: (x: IFilter) => WebFilter) {
      if (this.filters) this.filters = Filter.or(this.filters, parseWithTransform(filter));
      else this.filter(filter);
      return this;
    }

    andFilter(filter: (x: IFilter) => WebFilter) {
      if (this.filters) this.filters = Filter.and(this.filters, parseWithTransform(filter));
      else this.filter(filter);
      return this;
    }

		/**
		 * @internal
		 */
    private order(varFunc: (x: ISelect) => WebAttribute<ISelect, any, any>, by: string) {
      this.ordering.push(parseWithTransform(varFunc) + " " + by);
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

    maxPageSize(size: number) {
      this.additionalHeaders.push(MaxPageSizeHeader(size));
      return this;
    }


		/**
		 * Sets a header that lets you retrieve formatted values as well. Should be used after using select and expand of attributes.
		 */
    includeFormattedValues(): Query<(FormattedResult & Result)[]> {
      this.additionalHeaders.push(FORMATTED_VALUES_HEADER);
      return <any>this;
    }

        /**
         * Sets a header that lets you retrieve formatted values and lookup properties as well. Should be used after using select and expand of attributes.
         */
    includeFormattedValuesAndLookupProperties(): Query<(FormattedResult & Result)[]> {
      this.additionalHeaders.push(INCLUDE_ANNOTATIONS_HEADER);
      return <any>this;
    }

		/**
		 * Sets up the query to filter the entity using the provided FetchXML
		 * @param xml The query in FetchXML format
		 */
    useFetchXml(xml: string): Query<Result[]> {
      this.specialQuery = `?fetchXml=${encodeURIComponent(xml)}`;
      return this;
    }


		/**
		 * Sets up the query to filter the entity using the predefined-query.
		 * @param xml The query in FetchXML format
		 */
    usePredefinedQuery(type: "savedQuery", guid: string): Query<Result[]>;
    usePredefinedQuery(type: "userQuery", guid: string): Query<Result[]>;
    usePredefinedQuery(type: string, guid: string): Query<Result[]> {
      this.specialQuery = `?${type}=${guid}`;
      return this;
    }
  }



  export class RetrieveRecord<ISelect, IExpand, IFixed, FormattedResult, Result> extends Query<Result> {
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
    protected expandKeys: string[] = [];

    static Related<ISingle, ISelect, IExpand, IFixed, FormattedResult, Result>(
      entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<ISingle, any>,
      id: string,
      relatedPicker: (x: ISingle) => WebMappingRetrieve<ISelect, IExpand, any, IFixed, Result, FormattedResult>) {
      return new RetrieveRecord<ISelect, IExpand, IFixed, FormattedResult, Result>(taggedExec(entityPicker).toString(), id, taggedExec(relatedPicker).toString());
    }

    static Get<ISelect, IExpand, IFixed, FormattedResult, Result>(
      entityPicker: (x: WebEntitiesRetrieve) => WebMappingRetrieve<ISelect, IExpand, any, IFixed, Result, FormattedResult>,
      id: string) {
      return new RetrieveRecord<ISelect, IExpand, IFixed, FormattedResult, Result>(taggedExec(entityPicker).toString(), id);
    }

    private constructor(private entitySetName: string, private id: string, private relatedNav?: string) {
      super("GET");
      this.id = stripGUID(id);
    }

    protected handleResponse(req: XMLHttpRequest, successCallback: (r: Result) => any, errorCallback: (e: Error) => any) {
      EntityLinkHelper.followLinks(parseRetrievedData<any>(req), this.expandKeys, successCallback, errorCallback);
    }

    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13, R14, F14, R15, F15>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>, WebAttribute<ISelect, R14, F14>, WebAttribute<ISelect, R15, F15>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13 & F14 & F15, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13 & R14 & R15>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13, R14, F14>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>, WebAttribute<ISelect, R14, F14>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13 & F14, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13 & R14>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7, IFixed & R1 & R2 & R3 & R4 & R5 & R6 & R7>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6, IFixed & R1 & R2 & R3 & R4 & R5 & R6>;
    select<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5, IFixed & R1 & R2 & R3 & R4 & R5>;
    select<R1, F1, R2, F2, R3, F3, R4, F4>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4, IFixed & R1 & R2 & R3 & R4>;
    select<R1, F1, R2, F2, R3, F3>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3, IFixed & R1 & R2 & R3>;
    select<R1, F1, R2, F2>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2, IFixed & R1 & R2>;
    select<R1, F1>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>]): RetrieveRecord<ISelect, IExpand, IFixed, F1, IFixed & R1>;
    select(varFunc: (x: ISelect) => WebAttribute<ISelect, any, any>[]): RetrieveRecord<ISelect, IExpand, IFixed, FormattedResult, Result> {
      this.selects = parseSelects(varFunc);
      return this;
    }

    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13, R14, F14, R15, F15>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>, WebAttribute<ISelect, R14, F14>, WebAttribute<ISelect, R15, F15>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13 & F14 & F15, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13 & R14 & R15>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13, R14, F14>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>, WebAttribute<ISelect, R14, F14>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13 & F14, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13 & R14>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12, R13, F13>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>, WebAttribute<ISelect, R13, F13>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12 & F13, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12 & R13>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11, R12, F12>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>, WebAttribute<ISelect, R12, F12>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11 & F12, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11 & R12>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10, R11, F11>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>, WebAttribute<ISelect, R11, F11>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10 & F11, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10 & R11>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9, R10, F10>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>, WebAttribute<ISelect, R10, F10>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9 & F10, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9 & R10>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8, R9, F9>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>, WebAttribute<ISelect, R9, F9>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8 & F9, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8 & R9>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7, R8, F8>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>, WebAttribute<ISelect, R8, F8>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7 & F8, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7 & R8>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6, R7, F7>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>, WebAttribute<ISelect, R7, F7>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6 & F7, Result & R1 & R2 & R3 & R4 & R5 & R6 & R7>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5, R6, F6>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>, WebAttribute<ISelect, R6, F6>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5 & F6, Result & R1 & R2 & R3 & R4 & R5 & R6>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4, R5, F5>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>, WebAttribute<ISelect, R5, F5>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4 & F5, Result & R1 & R2 & R3 & R4 & R5>;
    selectMore<R1, F1, R2, F2, R3, F3, R4, F4>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>, WebAttribute<ISelect, R4, F4>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3 & F4, Result & R1 & R2 & R3 & R4>;
    selectMore<R1, F1, R2, F2, R3, F3>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>, WebAttribute<ISelect, R3, F3>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2 & F3, Result & R1 & R2 & R3>;
    selectMore<R1, F1, R2, F2>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>, WebAttribute<ISelect, R2, F2>]): RetrieveRecord<ISelect, IExpand, IFixed, F1 & F2, Result & R1 & R2>;
    selectMore<R1, F1>(vars: (x: ISelect) => [WebAttribute<ISelect, R1, F1>]): RetrieveRecord<ISelect, IExpand, IFixed, F1, Result & R1>;
    selectMore(varFunc: (x: ISelect) => WebAttribute<ISelect, any, any>[]): RetrieveRecord<ISelect, IExpand, IFixed, FormattedResult, Result> {
      this.selects = this.selects.concat(parseSelects(varFunc));
      return this;
    }

    expand<IExpSelect, IExpFilter, IExpResult>(
      exps: (x: IExpand) => WebExpand<IExpand, IExpSelect, IExpFilter, IExpResult>,
      selectVarFunc?: (x: IExpSelect) => WebAttribute<IExpSelect, any, any>[],
      optArgs?: ExpandOptions<IExpSelect, IExpFilter>)
      : RetrieveRecord<ISelect, IExpand, IFixed, FormattedResult, IExpResult & Result> {

      const expand = taggedExec(exps).toString();
      this.selects.push(expand);
      this.expandKeys.push(expand);

      let options: string[] = [];
      if (selectVarFunc) options.push(`$select=${parseSelects(selectVarFunc)}`);
      if (optArgs) {
        if (optArgs.top) options.push(`$top=${optArgs.top}`);
        if (optArgs.orderBy) options.push(`$orderby=${parseWithTransform(optArgs.orderBy)} ${optArgs.sortOrder != SortOrder.Descending ? "asc" : "desc"}`)
        if (optArgs.filter) options.push(`$filter=${parseWithTransform(optArgs.filter)}`);
      }
      this.expands.push(expand + (options.length > 0 ? `(${options.join(";")})` : ""));
      return <any>this;
    }

    getQueryString(): string {
      let options: string[] = [];
      if (this.selects.length > 0) options.push("$select=" + this.selects.join(","));
      if (this.expands.length > 0) options.push("$expand=" + this.expands.join(","));

      let prefix = `${this.entitySetName}(${this.id})`;
      if (this.relatedNav) {
        prefix += `/${this.relatedNav}`;
      }
      return prefix + (options.length > 0 ? "?" + options.join("&") : "");
    }

      /**
       * Sets a header that lets you retrieve formatted values as well. Should be used after using select and expand of attributes.
       */
    includeFormattedValues(): Query<FormattedResult & Result> {
      this.additionalHeaders.push(FORMATTED_VALUES_HEADER);
      return <any>this;
    }

      /**
       * Sets a header that lets you retrieve formatted values and lookup properties as well. Should be used after using select and expand of attributes.
       */
    includeFormattedValuesAndLookupProperties(): Query<(FormattedResult & Result)[]> {
      this.additionalHeaders.push(INCLUDE_ANNOTATIONS_HEADER);
      return <any>this;
    }
  }


	/**
	 * Contains information about a Create query
	 */
  export class CreateRecord<ICreate> extends Query<string> {
		/** 
		 * @internal 
		 */
    private entitySetName: string;

    constructor(entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<ICreate, any, any>, private record?: ICreate) {
      super("POST");
      this.entitySetName = taggedExec(entityPicker).toString();
    }

    protected handleResponse(req: XMLHttpRequest, successCallback: (r: string) => any, errorCallback: (e: Error) => any) {
      let header = req.getResponseHeader("OData-EntityId");
      if (header) successCallback(header!.substr(-37, 36))
      else errorCallback(new Error("No valid OData-EntityId found in header."));
    }

    setData(record: ICreate) {
      this.record = record;
      return this;
    }

    protected getObjectToSend = () => JSON.stringify(transformObject(this.record));

    getQueryString(): string {
      return this.entitySetName;
    }
  }

	/**
	 * Contains information about a Delete query
	 */
  export class DeleteRecord extends Query<undefined> {
		/** 
		 * @internal 
		 */
    private entitySetName: string;

    constructor(entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, any, any>, private id?: string) {
      super("DELETE");
      this.id = id !== undefined ? stripGUID(id) : id;
      this.entitySetName = taggedExec(entityPicker).toString();
    }

    protected handleResponse(req: XMLHttpRequest, successCallback: (x?: undefined) => any) {
      successCallback();
    }

    setId(id: string) {
      this.id = stripGUID(id);
      return this;
    }

    getQueryString(): string {
      return `${this.entitySetName}(${this.id})`;
    }
  }


	/**
	 * Contains information about an UpdateRecord query
	 */
  export class UpdateRecord<IUpdate> extends Query<undefined> {
		/** 
		 * @internal 
		 */
    private entitySetName: string;

    constructor(entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, IUpdate, any>, private id?: string, private record?: IUpdate) {
      super("PATCH");
      this.id = id !== undefined ? stripGUID(id) : id;
      this.entitySetName = taggedExec(entityPicker).toString();
    }

    protected handleResponse(req: XMLHttpRequest, successCallback: (x?: undefined) => any) {
      successCallback();
    }

    setData(id: string, record: IUpdate) {
      this.id = stripGUID(id);
      this.record = record;
      return this;
    }

    protected getObjectToSend = () => JSON.stringify(transformObject(this.record));

    getQueryString(): string {
      return `${this.entitySetName}(${this.id})`;
    }
  }
  /**
 * Contains information about an AssociateRecord query for single-valued properties
 */
  export class AssociateRecordSingle<ISingle, ISelect> extends Query<undefined> {
    /** 
     * @internal 
     */
    private entitySetName: string;
    private entitySetNameTarget: string;
    private targetId: string;
    private relation: string;
    private record: any;

    constructor(
      entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<ISingle, any>,
      private id: string,
      entityTargetPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, any, ISelect>,
      targetid: string,
      relationPicker: (x: ISingle) => WebMappingRetrieve<ISelect, any, any, any, any, any>) {
      super("PUT")
      this.entitySetName = taggedExec(entityPicker).toString();
      this.id = id !== undefined ? stripGUID(id) : id;
      this.entitySetNameTarget = taggedExec(entityTargetPicker).toString();
      this.targetId = targetid !== undefined ? stripGUID(targetid) : targetid;
      this.relation = taggedExec(relationPicker).toString();
      this.record = {};
      this.record["_id$" + this.entitySetNameTarget] = this.targetId;
    }

    protected handleResponse(req: XMLHttpRequest, successCallback: (x?: undefined) => any) {
      successCallback();
    }

    setData(id: string, record: any) {
      this.id = stripGUID(id);
      this.record = record;
      return this;
    }

    protected getObjectToSend = () => JSON.stringify(transformObject(this.record));

    getQueryString(): string {
      return `${this.entitySetName}(${this.id})/${this.relation}/$ref`;
    }
  }
  /**
 * Contains information about an AssociateRecord query for collection-valued properties
 */
  export class AssociateRecordCollection<IMultiple, ISelect> extends Query<undefined> {
    /** 
     * @internal 
     */
    private entitySetName: string;
    private entitySetNameTarget: string;
    private targetId: string;
    private relation: string;
    private record: any;

    constructor(
      entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<any, IMultiple>,
      private id: string,
      entityTargetPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, any, ISelect>,
      targetid: string,
      relationPicker: (x: IMultiple) => WebMappingRetrieve<ISelect, any, any, any, any, any>) {
      super("POST");
      this.entitySetName = taggedExec(entityPicker).toString();
      this.id = id !== undefined ? stripGUID(id) : id;
      this.entitySetNameTarget = taggedExec(entityTargetPicker).toString();
      this.targetId = targetid !== undefined ? stripGUID(targetid) : targetid;
      this.relation = taggedExec(relationPicker).toString();
      this.record = {};
      this.record["_id$" + this.entitySetNameTarget] = this.targetId;
    }

    protected handleResponse(req: XMLHttpRequest, successCallback: (x?: undefined) => any) {
      successCallback();
    }

    setData(id: string, record: any) {
      this.id = stripGUID(id);
      this.record = record;
      return this;
    }

    protected getObjectToSend = () => JSON.stringify(transformObject(this.record));

    getQueryString(): string {
      return `${this.entitySetName}(${this.id})/${this.relation}/$ref`;
    }
  }

  /**
   * Contains information about a Disassociate query
   */
  export class DisassociateRecord<ISelect> extends Query<undefined> {
    /** 
     * @internal 
     */
    private entitySetName: string;
    private relation: string;
    private targetId: string | undefined;


    static Single<ISingle, ISelect>(
      entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<ISingle, any>,
      id: string,
      relationPicker: (x: ISingle) => WebMappingRetrieve<ISelect, any, any, any, any, any>) {
      return new DisassociateRecord<ISelect>(taggedExec(entityPicker).toString(), id, taggedExec(relationPicker).toString())
    }

    static Collection<IMultiple, ISelect>(
      entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<any, IMultiple>,
      id: string,
      relationPicker: (x: IMultiple) => WebMappingRetrieve<ISelect, any, any, any, any, any>,
      targetId: string) {
      return new DisassociateRecord<ISelect>(taggedExec(entityPicker).toString(), id, taggedExec(relationPicker).toString(), targetId)
    }

    constructor(entityName: string, private id: string, rel: string, private targetid?: string) {
      super("DELETE");
      this.entitySetName = entityName;
      this.id = id !== undefined ? stripGUID(id) : id;
      this.relation = rel;
      this.targetId = targetid !== undefined ? stripGUID(targetid) : targetid;
    }

    protected handleResponse(req: XMLHttpRequest, successCallback: (x?: undefined) => any) {
      successCallback();
    }

    setId(id: string) {
      this.id = stripGUID(id);
      return this;
    }

    getQueryString(): string {
      if (this.targetId == undefined)
        // single-valued
        return `${this.entitySetName}(${this.id})/${this.relation}/$ref`;
      else
        // collection-valued
        return `${this.entitySetName}(${this.id})/${this.relation}(${this.targetId})/$ref`;;
    }
  }

  /**
   * @internal
   */
  function startsWith(needle: string, haystack: string) {
    return haystack.lastIndexOf(needle, 0) === 0;
  }
	/**
	 * @internal
	 */
  function taggedExec<T>(f: (x: any) => T, transformer?: (x: string) => string): T {
    return f(tagMatches(f, transformer));
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
  function tagMatches(f: (x: any) => any, transformer?: (x: string) => string) {
    let funcInfo = analyzeFunc(f);
    let regex = objRegex(funcInfo.arg);

    let transformerFunc = transformer ? transformer : (x: string) => x;
    let obj: { [k: string]: any } = {};
    let match: any;
    while ((match = regex.exec(funcInfo.body)) != null) {
      if (!obj[match[1]]) {
        obj[match[1]] = XQW.makeTag(transformerFunc(match[1]));
      }
      if (match[3]) {
        obj[match[1]][match[3]] = XQW.makeTag(match[1] + "/" + transformerFunc(match[3]));
      }
    }
    return obj;
  }


	/**
	 * @internal
	 */
  export var ApiUrl: string | null = null;
  const DefaultApiVersion = "8.0";

  export function getDefaultUrl(v: string) {
    return getClientUrl() + `/api/data/v${v}/`;
  }
  export function getApiUrl() {
    if (ApiUrl === null) ApiUrl = getDefaultUrl(DefaultApiVersion);
    return ApiUrl;
  }

  declare var Xrm: any;
	/**
	 * @internal
	 */
  function getClientUrl() {
    try {
      if (GetGlobalContext && GetGlobalContext().getClientUrl) {
        return GetGlobalContext().getClientUrl();
      }
    } catch (e) { }
    try {
      if (Xrm && Xrm.Page && Xrm.Page.context) {
        return Xrm.Page.context.getClientUrl();
      }
    } catch (e) { }
    throw new Error("Context is not available.");
  }

	/**
	 * Converts a XrmQuery select/filter name to the Web API format
	 * @param name
	 */
  function xrmQueryToCrm(name: string) {
    const idx = name.indexOf(GUID_ENDING);
    if (idx == -1) return name;
    return `_${name.substr(0, idx)}_value`;
  }


	/**
	 * Helper function to perform tagged execution and mapping to array of selects
	 * @internal
	 */
  function parseSelects(selectFunc: (x: any) => any[]): string[] {
    return parseWithTransform(selectFunc).map((x: any) => x.toString());
  }

	/**
	 * Parses a given function and transforms any XrmQuery-specific values to it's corresponding CRM format
	 * @param filterFunc
	 */
  function parseWithTransform(filterFunc: (x: any) => any) {
    return taggedExec(filterFunc, xrmQueryToCrm);
  }

	/**
	 * Transforms an object XrmQuery format to a CRM format
	 * @param obj
	 */
  function transformObject(obj: any) {
    if (obj instanceof Date) {
      return obj;

    } else if (typeof (obj) === 'string' && startsWith("{", obj) && endsWith("}", obj)) {
      return obj.substring(1, obj.length - 1);

    } else if (obj instanceof Array) {
      var arr: any[] = [];
      obj.forEach((v, idx) => arr[idx] = transformObject(v));
      return arr;

    } else if (obj instanceof Object) {
      var newObj = {};
      Object.keys(obj).forEach(key => parseAttribute(key, transformObject(obj[key]), newObj));
      return newObj;
    }
    else {
      return obj;
    }
  }

	/**
	 * Parses attributes from XrmQuery format to CRM format
	 * @param key
	 * @param value
	 */
  function parseAttribute(key: string, val: any, newObj: any) {
    if (key.indexOf(BIND_ID) >= 0) {
      const lookupIdx = key.indexOf(BIND_ID);
      if (lookupIdx >= 0) {
        const setName = key.substr(lookupIdx + BIND_ID.length);
        newObj[`${key.substr(0, lookupIdx)}@odata.bind`] = `/${setName}(${val})`;
      }
    }
    else if (key.indexOf(ID_ID) >= 0) {
      const lookupIdx = key.indexOf(ID_ID);
      if (lookupIdx >= 0) {
        const setName = key.substr(lookupIdx + ID_ID.length);
        const url = getDefaultUrl(DefaultApiVersion);
        newObj[`${key.substr(0, lookupIdx)}@odata.id`] = `${url}${setName}(${val})`;
      }
    }
    else {
      newObj[key] = val;
    }
  }
}
