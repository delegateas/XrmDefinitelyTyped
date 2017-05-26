var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var XrmQuery;
(function (XrmQuery) {
    /**
     * Instantiates specification of a query that can retrieve a specific record.
     * @param entityPicker Function to select which entity-type should be targeted.
     * @param id GUID of the wanted record.
     */
    function retrieve(entityPicker, id) {
        return XQW.RetrieveRecord.Get(entityPicker, id);
    }
    XrmQuery.retrieve = retrieve;
    /**
     * Instantiates specification of a query that can retrieve multiple records of a certain entity.
     * @param entityPicker Function to select which entity should be targeted.
     */
    function retrieveMultiple(entityPicker) {
        return XQW.RetrieveMultipleRecords.Get(entityPicker);
    }
    XrmQuery.retrieveMultiple = retrieveMultiple;
    /**
     * Instantiates specification of a query that can retrieve a related record of a given record.
     * @param entityPicker Function to select which entity-type the related record should be retrieved from.
     * @param id GUID of the record of which the related record should be retrieved.
     * @param relatedPicker Function to select which navigation property points to the related record.
     */
    function retrieveRelated(entityPicker, id, relatedPicker) {
        return XQW.RetrieveRecord.Related(entityPicker, id, relatedPicker);
    }
    XrmQuery.retrieveRelated = retrieveRelated;
    /**
     * Instantiates specification of a query that can retrieve multiple related records of a given record.
     * @param entityPicker  Function to select which entity-type the related records should be retrieved from.
     * @param id GUID of the record of which the related records should be retrieved.
     * @param relatedPicker Function to select which navigation property points to the related records.
     */
    function retrieveRelatedMultiple(entityPicker, id, relatedPicker) {
        return XQW.RetrieveMultipleRecords.Related(entityPicker, id, relatedPicker);
    }
    XrmQuery.retrieveRelatedMultiple = retrieveRelatedMultiple;
    /**
     * Instantiates a query that can create a record.
     * @param entityPicker Function to select which entity-type should be created.
     * @param record Object of the record to be created.
     */
    function create(entityPicker, record) {
        return new XQW.CreateRecord(entityPicker, record);
    }
    XrmQuery.create = create;
    /**
     * Instantiates a query that can update a specific record.
     * @param entityPicker Function to select which entity-type should be updated.
     * @param id GUID of the record to be updated.
     * @param record Object containing the attributes to be updated.
     */
    function update(entityPicker, id, record) {
        return new XQW.UpdateRecord(entityPicker, id, record);
    }
    XrmQuery.update = update;
    /**
     * Instantiates a query that can delete a specific record.
     * @param entityPicker Function to select which entity-type should be deleted.
     * @param id GUID of the record to be updated.
     */
    function deleteRecord(entityPicker, id) {
        return new XQW.DeleteRecord(entityPicker, id);
    }
    XrmQuery.deleteRecord = deleteRecord;
    /**
     * Makes XrmQuery use the given custom url to access the Web API.
     * @param url The url targeting the API. For example: '/api/data/v8.2/'
     */
    function setApiUrl(url) {
        XQW.ApiUrl = url;
    }
    XrmQuery.setApiUrl = setApiUrl;
    /**
     * Makes XrmQuery use the given version to access the Web API.
     * @param v Version to use for the API. For example: '8.2'
     */
    function setApiVersion(v) {
        XQW.ApiUrl = XQW.getDefaultUrl(v);
    }
    XrmQuery.setApiVersion = setApiVersion;
    /**
     * @internal
     */
    function request(type, url, data, successCb, errorCb, preSend) {
        if (errorCb === void 0) { errorCb = function () { }; }
        var req = new XMLHttpRequest();
        req.open(type, url, true);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        if (preSend)
            preSend(req);
        req.onreadystatechange = function () {
            if (this.readyState == 4) {
                req.onreadystatechange = null;
                if (this.status == 200 || this.status == 204)
                    successCb(this);
                else
                    errorCb(new Error(this.response));
            }
        };
        req.send(data);
    }
    XrmQuery.request = request;
    /**
     * Sends a request to the Web API with the given parameters.
     * @param type Type of request, i.e. "GET", "POST", etc
     * @param queryString Query-string to use for the API. For example: 'accounts?$count=true'
     * @param data Object to send with request
     * @param successCb Success callback handler function
     * @param errorCb Error callback handler function
     * @param configure Modify the request before it it sent to the endpoint - like adding headers.
     */
    function sendRequest(type, queryString, data, successCb, errorCb, configure) {
        request(type, encodeURI(XQW.getApiUrl() + queryString), data, successCb, errorCb, configure);
    }
    XrmQuery.sendRequest = sendRequest;
    /**
     * Sends a request to the Web API with the given parameters and returns a promise.
     * @param type Type of request, i.e. "GET", "POST", etc
     * @param queryString Query-string to use for the API. For example: 'accounts?$count=true'
     * @param data Object to send with request
     * @param configure Modify the request before it it sent to the endpoint - like adding headers.
     */
    function promiseRequest(type, queryString, data, configure) {
        return XQW.promisifyCallback(function (success, error) { return sendRequest(type, queryString, data, success, error, configure); });
    }
    XrmQuery.promiseRequest = promiseRequest;
})(XrmQuery || (XrmQuery = {}));
var Filter;
(function (Filter) {
    function equals(v1, v2) { return comp(v1, "eq", v2); }
    Filter.equals = equals;
    function notEquals(v1, v2) { return comp(v1, "ne", v2); }
    Filter.notEquals = notEquals;
    function greaterThan(v1, v2) { return comp(v1, "gt", v2); }
    Filter.greaterThan = greaterThan;
    function greaterThanOrEqual(v1, v2) { return comp(v1, "ge", v2); }
    Filter.greaterThanOrEqual = greaterThanOrEqual;
    function lessThan(v1, v2) { return comp(v1, "lt", v2); }
    Filter.lessThan = lessThan;
    function lessThanOrEqual(v1, v2) { return comp(v1, "le", v2); }
    Filter.lessThanOrEqual = lessThanOrEqual;
    function and(f1, f2) { return biFilter(f1, "and", f2); }
    Filter.and = and;
    function or(f1, f2) { return biFilter(f1, "or", f2); }
    Filter.or = or;
    function not(f1) { return ("not " + f1); }
    Filter.not = not;
    function ands(fs) { return nestedFilter(fs, "and"); }
    Filter.ands = ands;
    function ors(fs) { return nestedFilter(fs, "or"); }
    Filter.ors = ors;
    function startsWith(val, prefix) { return dataFunc("startswith", val, prefix); }
    Filter.startsWith = startsWith;
    function contains(val, needle) { return dataFunc("contains", val, needle); }
    Filter.contains = contains;
    function endsWith(val, suffix) { return dataFunc("endswith", val, suffix); }
    Filter.endsWith = endsWith;
    /**
     * Makes a string into a GUID that can be sent to the OData source
     */
    function makeGuid(id) { return XQW.makeTag(id); }
    Filter.makeGuid = makeGuid;
    /**
     * @internal
     */
    function getVal(v) {
        if (v == null)
            return "null";
        if (typeof v === "string")
            return "'" + v + "'";
        if (v instanceof Date)
            return v.toISOString();
        return v.toString();
    }
    /**
     * @internal
     */
    function comp(val1, op, val2) {
        return (getVal(val1) + " " + op + " " + getVal(val2));
    }
    /**
     * @internal
     */
    function dataFunc(funcName, val1, val2) {
        return (funcName + "(" + getVal(val1) + ", " + getVal(val2) + ")");
    }
    /**
     * @internal
     */
    function biFilter(f1, conj, f2) {
        return ("(" + f1 + " " + conj + " " + f2 + ")");
    }
    /**
     * @internal
     */
    function nestedFilter(fs, conj) {
        var last = fs.pop();
        return fs.reduceRight(function (acc, c) { return biFilter(c, conj, acc); }, last);
    }
})(Filter || (Filter = {}));
var XQW;
(function (XQW) {
    var FORMATTED_VALUE_ID = "OData.Community.Display.V1.FormattedValue";
    var FORMATTED_VALUE_SUFFIX = "@" + FORMATTED_VALUE_ID;
    var FORMATTED_VALUES_HEADER = { type: "Prefer", value: "odata.include-annotations=\"" + FORMATTED_VALUE_ID + "\"" };
    var BIND_ID = "_bind$";
    var GUID_ENDING = "_guid";
    var FORMATTED_ENDING = "_formatted";
    var NEXT_LINK_ID = "@odata.nextLink";
    var MaxPageSizeHeader = function (size) { return ({ type: "Prefer", value: "odata.maxpagesize=" + size }); };
    /**
     * @internal
     */
    function makeTag(name) {
        return { __str: name, toString: function () { return this.__str; } };
    }
    XQW.makeTag = makeTag;
    function endsWith(str, suffix) {
        return str.substr(-suffix.length) == suffix;
    }
    function beginsWith(str, prefix) {
        return str.substr(0, prefix.length) == prefix;
    }
    var datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
    function reviver(name, value) {
        if (datePattern.test(value))
            return new Date(value);
        var newName = name;
        var formatted = endsWith(newName, FORMATTED_VALUE_SUFFIX);
        if (formatted)
            newName = newName.substr(0, newName.length - 42);
        if (beginsWith(newName, '_') && endsWith(newName, '_value')) {
            newName = newName.substr(1, newName.length - 7);
            if (!formatted)
                newName += GUID_ENDING;
        }
        if (formatted)
            newName += FORMATTED_ENDING;
        if (newName != name) {
            this[newName] = value;
        }
        else {
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
    function parseRetrievedData(req) {
        return JSON.parse(req.response, reviver);
    }
    function isStringArray(arr) {
        return arr.length > 0 && typeof (arr[0]) === "string";
    }
    function promisifyCallback(callbackFunc) {
        if (!Promise)
            throw new Error("Promises are not natively supported in this browser. Add a polyfill to use it.");
        return new Promise(function (resolve, reject) {
            callbackFunc(resolve, reject);
        });
    }
    XQW.promisifyCallback = promisifyCallback;
    var LinkHelper = (function () {
        function LinkHelper(toReturn, successCallback, errorCallback) {
            var _this = this;
            this.toReturn = toReturn;
            this.successCallback = successCallback;
            this.errorCallback = errorCallback;
            this.missingCallbacks = 0;
            this.isDoneSending = false;
            this.isDoingWork = false;
            this.callbackReceived = function () {
                _this.missingCallbacks--;
                if (_this.allSent && _this.missingCallbacks == 0) {
                    _this.successCallback(_this.toReturn);
                }
            };
        }
        LinkHelper.prototype.followLink = function (linkUrl, expandKeys, valPlacer) {
            var _this = this;
            this.performingCallback();
            XrmQuery.request("GET", linkUrl, null, function (req) {
                var resp = parseRetrievedData(req);
                PageLinkHelper.followLinks(resp, expandKeys, function (vals) {
                    valPlacer(vals);
                    _this.callbackReceived();
                }, _this.errorCallback);
            }, function (err) {
                _this.callbackReceived();
                _this.errorCallback(err);
            });
        };
        LinkHelper.prototype.populateRecord = function (rec, expandKeys) {
            this.performingCallback();
            EntityLinkHelper.followLinks(rec, expandKeys, this.callbackReceived, this.errorCallback);
        };
        LinkHelper.prototype.allSent = function () {
            if (!this.isDoingWork)
                return this.successCallback(this.toReturn);
            this.isDoneSending = true;
        };
        LinkHelper.prototype.performingCallback = function () {
            this.missingCallbacks++;
            this.isDoingWork = true;
        };
        return LinkHelper;
    }());
    var EntityLinkHelper = (function (_super) {
        __extends(EntityLinkHelper, _super);
        function EntityLinkHelper(rec, expandKeys, successCallback, errorCallback) {
            var _this = _super.call(this, rec, successCallback, errorCallback) || this;
            expandKeys.forEach(function (exp) {
                var linkUrl = rec[exp.linkKey];
                if (linkUrl) {
                    delete rec[exp.linkKey];
                    _this.followLink(linkUrl, [], function (vals) {
                        rec[exp.arrKey] = rec[exp.arrKey].concat(vals);
                    });
                }
            });
            _this.allSent();
            return _this;
        }
        EntityLinkHelper.followLinks = function (rec, expandKeys, successCallback, errorCallback) {
            if (expandKeys.length == 0)
                return successCallback(rec);
            if (isStringArray(expandKeys)) {
                expandKeys = expandKeys.map(function (k) { return ({ arrKey: k, linkKey: k + NEXT_LINK_ID }); });
            }
            return new EntityLinkHelper(rec, expandKeys, successCallback, errorCallback);
        };
        return EntityLinkHelper;
    }(LinkHelper));
    /**
     * Helper class to expand on all @odata.nextLink, both pages and on entities retrieved
     */
    var PageLinkHelper = (function (_super) {
        __extends(PageLinkHelper, _super);
        function PageLinkHelper(obj, expandKeys, successCallback, errorCallback) {
            var _this = _super.call(this, obj.value, successCallback, errorCallback) || this;
            var nextPage = obj["@odata.nextLink"];
            if (nextPage) {
                _this.followLink(nextPage, expandKeys, function (vals) {
                    _this.toReturn = _this.toReturn.concat(vals);
                });
            }
            if (expandKeys.length > 0) {
                obj.value.forEach(function (r) { return _this.populateRecord(r, expandKeys); });
            }
            _this.allSent();
            return _this;
        }
        PageLinkHelper.followLinks = function (obj, expandKeys, successCallback, errorCallback) {
            if (!obj["@odata.nextLink"] && (obj.value.length == 0 || expandKeys.length == 0))
                return successCallback(obj.value);
            if (expandKeys.length == 0) {
                return new PageLinkHelper(obj, [], successCallback, errorCallback);
            }
            if (isStringArray(expandKeys)) {
                expandKeys = expandKeys.map(function (k) { return ({ arrKey: k, linkKey: k + NEXT_LINK_ID }); });
            }
            if (obj.value.length == 0) {
                return new PageLinkHelper(obj, expandKeys, successCallback, errorCallback);
            }
            else {
                var firstRec_1 = obj.value[0];
                var toKeep = expandKeys.filter(function (exp) { return firstRec_1[exp.linkKey]; });
                return new PageLinkHelper(obj, toKeep, successCallback, errorCallback);
            }
        };
        return PageLinkHelper;
    }(LinkHelper));
    var Query = (function () {
        function Query(requestType) {
            this.requestType = requestType;
            this.additionalHeaders = [];
            this.getObjectToSend = function () { return null; };
        }
        Query.prototype.promise = function () {
            return promisifyCallback(this.execute.bind(this));
        };
        Query.prototype.execute = function (successCallback, errorCallback) {
            if (errorCallback === void 0) { errorCallback = function () { }; }
            this.executeRaw(successCallback, errorCallback, true);
        };
        Query.prototype.executeRaw = function (successCallback, errorCallback, parseResult) {
            var _this = this;
            if (errorCallback === void 0) { errorCallback = function () { }; }
            if (parseResult === void 0) { parseResult = false; }
            var config = function (req) { return _this.additionalHeaders.forEach(function (h) { return req.setRequestHeader(h.type, h.value); }); };
            var successHandler = function (req) { return parseResult ? _this.handleResponse(req, successCallback, errorCallback) : successCallback(req); };
            return XrmQuery.sendRequest(this.requestType, this.getQueryString(), this.getObjectToSend(), successHandler, errorCallback, config);
        };
        return Query;
    }());
    XQW.Query = Query;
    var RetrieveMultipleRecords = (function (_super) {
        __extends(RetrieveMultipleRecords, _super);
        function RetrieveMultipleRecords(entitySetName, id, relatedNav) {
            var _this = _super.call(this, "GET") || this;
            _this.entitySetName = entitySetName;
            _this.id = id;
            _this.relatedNav = relatedNav;
            /**
             * @internal
             */
            _this.specialQuery = undefined;
            /**
             * @internal
             */
            _this.selects = [];
            /**
             * @internal
             */
            _this.expands = [];
            /**
             * @internal
             */
            _this.expandKeys = [];
            /**
             * @internal
             */
            _this.ordering = [];
            /**
             * @internal
             */
            _this.skipAmount = null;
            /**
             * @internal
             */
            _this.topAmount = null;
            return _this;
        }
        RetrieveMultipleRecords.Get = function (entityPicker) {
            return new RetrieveMultipleRecords(taggedExec(entityPicker).toString());
        };
        RetrieveMultipleRecords.Related = function (entityPicker, id, relatedPicker) {
            return new RetrieveMultipleRecords(taggedExec(entityPicker).toString(), id, taggedExec(relatedPicker).toString());
        };
        RetrieveMultipleRecords.prototype.handleResponse = function (req, successCallback, errorCallback) {
            PageLinkHelper.followLinks(parseRetrievedData(req), this.expandKeys, successCallback, errorCallback);
        };
        RetrieveMultipleRecords.prototype.getFirst = function (successCallback, errorCallback) {
            this.top(1);
            this.execute(function (res) { return successCallback(res && res.length > 0 ? res[0] : null); }, errorCallback);
        };
        RetrieveMultipleRecords.prototype.promiseFirst = function () {
            return promisifyCallback(this.getFirst.bind(this));
        };
        RetrieveMultipleRecords.prototype.getQueryString = function () {
            var prefix = this.entitySetName;
            if (this.id && this.relatedNav) {
                prefix += "(" + this.id + ")/" + this.relatedNav;
            }
            if (this.specialQuery)
                return prefix + this.specialQuery;
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
            return prefix + (options.length > 0 ? "?" + options.join("&") : "");
        };
        RetrieveMultipleRecords.prototype.select = function (vars) {
            this.selects = parseSelects(vars);
            return this;
        };
        RetrieveMultipleRecords.prototype.selectMore = function (vars) {
            this.selects = this.selects.concat(parseSelects(vars));
            return this;
        };
        RetrieveMultipleRecords.prototype.expand = function (exps, selectVars) {
            var expand = taggedExec(exps).toString();
            this.selects.push(expand);
            this.expandKeys.push(expand);
            var options = [];
            if (selectVars)
                options.push("$select=" + parseSelects(selectVars));
            this.expands.push(expand + (options.length > 0 ? "(" + options.join(";") + ")" : ""));
            return this;
        };
        RetrieveMultipleRecords.prototype.filter = function (filter) {
            this.filters = taggedExec(filter);
            return this;
        };
        RetrieveMultipleRecords.prototype.orFilter = function (filter) {
            if (this.filters)
                this.filters = Filter.or(this.filters, taggedExec(filter));
            else
                this.filter(filter);
            return this;
        };
        RetrieveMultipleRecords.prototype.andFilter = function (filter) {
            if (this.filters)
                this.filters = Filter.and(this.filters, taggedExec(filter));
            else
                this.filter(filter);
            return this;
        };
        /**
         * @internal
         */
        RetrieveMultipleRecords.prototype.order = function (vars, by) {
            this.ordering.push(taggedExec(vars) + " " + by);
            return this;
        };
        RetrieveMultipleRecords.prototype.orderAsc = function (vars) {
            return this.order(vars, "asc");
        };
        RetrieveMultipleRecords.prototype.orderDesc = function (vars) {
            return this.order(vars, "desc");
        };
        RetrieveMultipleRecords.prototype.skip = function (amount) {
            this.skipAmount = amount;
            return this;
        };
        RetrieveMultipleRecords.prototype.top = function (amount) {
            this.topAmount = amount;
            return this;
        };
        RetrieveMultipleRecords.prototype.maxPageSize = function (size) {
            this.additionalHeaders.push(MaxPageSizeHeader(size));
            return this;
        };
        /**
         * Sets a header that lets you retrieve formatted values as well. Should be used after using select and expand of attributes.
         */
        RetrieveMultipleRecords.prototype.includeFormattedValues = function () {
            this.additionalHeaders.push(FORMATTED_VALUES_HEADER);
            return this;
        };
        /**
         * Sets up the query to filter the entity using the provided FetchXML
         * @param xml The query in FetchXML format
         */
        RetrieveMultipleRecords.prototype.useFetchXml = function (xml) {
            this.specialQuery = "?fetchXml=" + encodeURI(xml);
            return this;
        };
        RetrieveMultipleRecords.prototype.usePredefinedQuery = function (type, guid) {
            this.specialQuery = "?" + type + "=" + guid;
            return this;
        };
        return RetrieveMultipleRecords;
    }(Query));
    XQW.RetrieveMultipleRecords = RetrieveMultipleRecords;
    var RetrieveRecord = (function (_super) {
        __extends(RetrieveRecord, _super);
        function RetrieveRecord(entitySetName, id, relatedNav) {
            var _this = _super.call(this, "GET") || this;
            _this.entitySetName = entitySetName;
            _this.id = id;
            _this.relatedNav = relatedNav;
            /**
             * @internal
             */
            _this.selects = [];
            /**
             * @internal
             */
            _this.expands = [];
            /**
             * @internal
             */
            _this.expandKeys = [];
            return _this;
        }
        RetrieveRecord.Related = function (entityPicker, id, relatedPicker) {
            return new RetrieveRecord(taggedExec(entityPicker).toString(), id, taggedExec(relatedPicker).toString());
        };
        RetrieveRecord.Get = function (entityPicker, id) {
            return new RetrieveRecord(taggedExec(entityPicker).toString(), id);
        };
        RetrieveRecord.prototype.handleResponse = function (req, successCallback, errorCallback) {
            EntityLinkHelper.followLinks(parseRetrievedData(req), this.expandKeys, successCallback, errorCallback);
        };
        RetrieveRecord.prototype.select = function (vars) {
            this.selects = parseSelects(vars);
            return this;
        };
        RetrieveRecord.prototype.selectMore = function (vars) {
            this.selects = this.selects.concat(parseSelects(vars));
            return this;
        };
        RetrieveRecord.prototype.expand = function (exps, selectVars, optArgs) {
            var expand = taggedExec(exps).toString();
            this.selects.push(expand);
            this.expandKeys.push(expand);
            var options = [];
            if (selectVars)
                options.push("$select=" + parseSelects(selectVars));
            if (optArgs) {
                if (optArgs.top)
                    options.push("$top=" + optArgs.top);
                if (optArgs.orderBy)
                    options.push("$orderby=" + taggedExec(optArgs.orderBy) + " " + (optArgs.sortOrder != 2 /* Descending */ ? "asc" : "desc"));
                if (optArgs.filter)
                    options.push("$filter=" + taggedExec(optArgs.filter));
            }
            this.expands.push(expand + (options.length > 0 ? "(" + options.join(";") + ")" : ""));
            return this;
        };
        RetrieveRecord.prototype.getQueryString = function () {
            var options = [];
            if (this.selects.length > 0)
                options.push("$select=" + this.selects.join(","));
            if (this.expands.length > 0)
                options.push("$expand=" + this.expands.join(","));
            var prefix = this.entitySetName + "(" + this.id + ")";
            if (this.relatedNav) {
                prefix += "/" + this.relatedNav;
            }
            return prefix + (options.length > 0 ? "?" + options.join("&") : "");
        };
        RetrieveRecord.prototype.includeFormattedValues = function () {
            this.additionalHeaders.push(FORMATTED_VALUES_HEADER);
            return this;
        };
        return RetrieveRecord;
    }(Query));
    XQW.RetrieveRecord = RetrieveRecord;
    /**
     * Contains information about a Create query
     */
    var CreateRecord = (function (_super) {
        __extends(CreateRecord, _super);
        function CreateRecord(entityPicker, record) {
            var _this = _super.call(this, "POST") || this;
            _this.record = record;
            _this.getObjectToSend = function () { return JSON.stringify(transformObject(_this.record)); };
            _this.entitySetName = taggedExec(entityPicker).toString();
            return _this;
        }
        CreateRecord.prototype.handleResponse = function (req, successCallback, errorCallback) {
            var header = req.getResponseHeader("OData-EntityId");
            if (header)
                successCallback(header.substr(-37, 36));
            else
                errorCallback(new Error("No valid OData-EntityId found in header."));
        };
        CreateRecord.prototype.setData = function (record) {
            this.record = record;
            return this;
        };
        CreateRecord.prototype.getQueryString = function () {
            return this.entitySetName;
        };
        return CreateRecord;
    }(Query));
    XQW.CreateRecord = CreateRecord;
    /**
     * Contains information about a Delete query
     */
    var DeleteRecord = (function (_super) {
        __extends(DeleteRecord, _super);
        function DeleteRecord(entityPicker, id) {
            var _this = _super.call(this, "DELETE") || this;
            _this.id = id;
            _this.entitySetName = taggedExec(entityPicker).toString();
            return _this;
        }
        DeleteRecord.prototype.handleResponse = function (req, successCallback) {
            successCallback();
        };
        DeleteRecord.prototype.setId = function (id) {
            this.id = id;
            return this;
        };
        DeleteRecord.prototype.getQueryString = function () {
            return this.entitySetName + "(" + this.id + ")";
        };
        return DeleteRecord;
    }(Query));
    XQW.DeleteRecord = DeleteRecord;
    /**
     * Contains information about an UpdateRecord query
     */
    var UpdateRecord = (function (_super) {
        __extends(UpdateRecord, _super);
        function UpdateRecord(entityPicker, id, record) {
            var _this = _super.call(this, "PATCH") || this;
            _this.id = id;
            _this.record = record;
            _this.getObjectToSend = function () { return JSON.stringify(transformObject(_this.record)); };
            _this.entitySetName = taggedExec(entityPicker).toString();
            return _this;
        }
        UpdateRecord.prototype.handleResponse = function (req, successCallback) {
            successCallback();
        };
        UpdateRecord.prototype.setData = function (id, record) {
            this.id = id;
            this.record = record;
            return this;
        };
        UpdateRecord.prototype.getQueryString = function () {
            return this.entitySetName + "(" + this.id + ")";
        };
        return UpdateRecord;
    }(Query));
    XQW.UpdateRecord = UpdateRecord;
    /**
     * @internal
     */
    function taggedExec(f) {
        return f(tagMatches(f));
    }
    /**
     * @internal
     */
    var fPatt = /function[^\(]*\(([a-zA-Z0-9_]+)[^\{]*\{([\s\S]*)\}$/m;
    /**
     * @internal
     */
    function objRegex(oName) {
        return new RegExp("\\b" + oName + "\\.([a-zA-Z_$][0-9a-zA-Z_$]*)(\\.([a-zA-Z_$][0-9a-zA-Z_$]*))?", "g");
    }
    /**
     * @internal
     */
    function analyzeFunc(f) {
        var m = f.toString().match(fPatt);
        if (!m)
            throw new Error("XrmQuery: Unable to properly parse function: " + f.toString());
        return { arg: m[1], body: m[2] };
    }
    /**
     * @internal
     */
    function tagMatches(f) {
        var funcInfo = analyzeFunc(f);
        var regex = objRegex(funcInfo.arg);
        var obj = {};
        var match;
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
    XQW.ApiUrl = null;
    var DefaultApiVersion = "8.0";
    function getDefaultUrl(v) {
        return getClientUrl() + ("/api/data/v" + v + "/");
    }
    XQW.getDefaultUrl = getDefaultUrl;
    function getApiUrl() {
        if (XQW.ApiUrl === null)
            XQW.ApiUrl = getDefaultUrl(DefaultApiVersion);
        return XQW.ApiUrl;
    }
    XQW.getApiUrl = getApiUrl;
    /**
     * @internal
     */
    function getClientUrl() {
        try {
            if (GetGlobalContext && GetGlobalContext().getClientUrl) {
                return GetGlobalContext().getClientUrl();
            }
        }
        catch (e) { }
        try {
            if (Xrm && Xrm.Page && Xrm.Page.context) {
                return Xrm.Page.context.getClientUrl();
            }
        }
        catch (e) { }
        throw new Error("Context is not available.");
    }
    /**
     * Converts a select object to CRM format
     * @param name
     */
    function selectToCrm(name) {
        var idx = name.indexOf(GUID_ENDING);
        if (idx == -1)
            return name;
        return "_" + name.substr(0, idx) + "_value";
    }
    /**
     * Helper function to perform tagged execution and mapping to array of selects
     * @internal
     */
    function parseSelects(f) {
        return taggedExec(f).map(function (x) { return selectToCrm(x.toString()); });
    }
    /**
     * Transforms an object XrmQuery format to a CRM format
     * @param obj
     */
    function transformObject(obj) {
        if (obj instanceof Object) {
            var newObj = {};
            Object.keys(obj).forEach(function (key) { return parseAttribute(key, transformObject(obj[key]), newObj); });
            return newObj;
        }
        else if (obj instanceof Array) {
            var arr = [];
            obj.forEach(function (v, idx) { return arr[idx] = transformObject(v); });
            return arr;
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
    function parseAttribute(key, val, newObj) {
        var lookupIdx = key.indexOf(BIND_ID);
        if (lookupIdx >= 0) {
            var setName = key.substr(lookupIdx + BIND_ID.length);
            newObj[key.substr(0, lookupIdx) + "@odata.bind"] = "/" + setName + "(" + val + ")";
        }
        else {
            newObj[key] = val;
        }
    }
})(XQW || (XQW = {}));
