/// <reference path="base.d.ts" />
var Filter;
(function (Filter) {
    function equals(v1, v2) { return XQC.Comp(v1, "eq", v2); }
    Filter.equals = equals;
    function notEquals(v1, v2) { return XQC.Comp(v1, "ne", v2); }
    Filter.notEquals = notEquals;
    function greaterThan(v1, v2) { return XQC.Comp(v1, "gt", v2); }
    Filter.greaterThan = greaterThan;
    function greaterThanOrEqual(v1, v2) { return XQC.Comp(v1, "ge", v2); }
    Filter.greaterThanOrEqual = greaterThanOrEqual;
    function lessThan(v1, v2) { return XQC.Comp(v1, "lt", v2); }
    Filter.lessThan = lessThan;
    function lessThanOrEqual(v1, v2) { return XQC.Comp(v1, "le", v2); }
    Filter.lessThanOrEqual = lessThanOrEqual;
    function and(f1, f2) { return XQC.BiFilter(f1, "and", f2); }
    Filter.and = and;
    function or(f1, f2) { return XQC.BiFilter(f1, "or", f2); }
    Filter.or = or;
    function not(f1) { return ("not " + f1); }
    Filter.not = not;
    function startsWith(v1, v2) { return XQC.DataFunc("startswith", v1, v2); }
    Filter.startsWith = startsWith;
    function substringOf(v1, v2) { return XQC.DataFunc("substringof", v1, v2); }
    Filter.substringOf = substringOf;
    function endsWith(v1, v2) { return XQC.DataFunc("endswith", v1, v2); }
    Filter.endsWith = endsWith;
    /**
     * Makes a string into a GUID that can be sent to the OData source
     */
    function makeGuid(id) { return XQC.makeTag("(guid'" + id + "')"); }
    Filter.makeGuid = makeGuid;
})(Filter || (Filter = {}));
var XrmQuery;
(function (XrmQuery) {
    function retrieveRecord(entityPicker, id) {
        return new XQC.RetrieveRecord(entityPicker, id);
    }
    XrmQuery.retrieveRecord = retrieveRecord;
    function retrieveMultipleRecords(entityPicker) {
        return new XQC.RetrieveMultipleRecords(entityPicker);
    }
    XrmQuery.retrieveMultipleRecords = retrieveMultipleRecords;
    function createRecord(entityPicker, record) {
        return new XQC.CreateRecord(entityPicker, record);
    }
    XrmQuery.createRecord = createRecord;
    function updateRecord(entityPicker, id, record) {
        return new XQC.UpdateRecord(entityPicker, id, record);
    }
    XrmQuery.updateRecord = updateRecord;
    function deleteRecord(entityPicker, id) {
        return new XQC.DeleteRecord(entityPicker, id);
    }
    XrmQuery.deleteRecord = deleteRecord;
})(XrmQuery || (XrmQuery = {}));
var XQC;
(function (XQC) {
    /**
     * @internal
     */
    function getVal(v) {
        if (v == null)
            return "null";
        if (typeof (v) === "string")
            return "'" + v + "'";
        if (Object.prototype.toString.call(v) === "[object Date]")
            return "DateTime'" + v.format('yyyy-MM-ddTHH:mm:ss') + "'";
        return v.toString();
    }
    /**
     * @internal
     */
    function Comp(val1, op, val2) {
        return (getVal(val1) + " " + op + " " + getVal(val2));
    }
    XQC.Comp = Comp;
    /**
     * @internal
     */
    function DataFunc(funcName, val1, val2) {
        return (funcName + "(" + getVal(val1) + ", " + getVal(val2) + ")");
    }
    XQC.DataFunc = DataFunc;
    /**
     * @internal
     */
    function BiFilter(f1, conj, f2) {
        return ("(" + f1 + " " + conj + " " + f2 + ")");
    }
    XQC.BiFilter = BiFilter;
    /**
     * @internal
     */
    function taggedExec(f) {
        var tagged = tagMatches(f);
        return f(tagged);
    }
    /**
     * @internal
     */
    var fPatt = /function[^\(]+\(([a-zA-Z0-9_]+)[^\{]+\{([\s\S]*)\}$/;
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
        return { arg: m[1], body: m[2] };
    }
    /**
     * @internal
     */
    function makeTag(name) {
        return { __str: name, toString: function () { return this.__str; } };
    }
    XQC.makeTag = makeTag;
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
    var NoOp = function () { };
    /**
     * Contains information about a Retrieve query
     */
    var RetrieveRecord = (function () {
        function RetrieveRecord(entityPicker, id) {
            /**
             * @internal
             */
            this.selects = [];
            /**
             * @internal
             */
            this.expands = [];
            this.logicalName = taggedExec(entityPicker).toString();
            this.id = id;
        }
        RetrieveRecord.prototype.select = function (vars) {
            this.selects = this.selects.concat(taggedExec(vars));
            return this;
        };
        RetrieveRecord.prototype.expand = function (exps, vars) {
            var expName = taggedExec(exps).toString();
            this.expands.push(expName);
            if (vars)
                this.selects = this.selects.concat(taggedExec(vars).map(function (a) { return expName + "." + a; }));
            return this;
        };
        RetrieveRecord.prototype.execute = function (successCallback, errorCallback) {
            var eCb = (errorCallback) ? errorCallback : function () { };
            SDK.REST.retrieveRecord(this.id, this.logicalName, (this.selects.length > 0) ? this.selects.join(",") : null, (this.expands.length > 0) ? this.expands.join(",") : null, successCallback, errorCallback ? errorCallback : NoOp);
        };
        return RetrieveRecord;
    })();
    XQC.RetrieveRecord = RetrieveRecord;
    /**
     * Contains information about a RetrieveMultiple query
     */
    var RetrieveMultipleRecords = (function () {
        function RetrieveMultipleRecords(entityPicker) {
            /**
             * @internal
             */
            this.selects = [];
            /**
             * @internal
             */
            this.expands = [];
            /**
             * @internal
             */
            this.ordering = [];
            /**
             * @internal
             */
            this.skipAmount = null;
            /**
             * @internal
             */
            this.topAmount = null;
            this.logicalName = taggedExec(entityPicker).toString();
        }
        RetrieveMultipleRecords.prototype.select = function (vars) {
            this.selects = this.selects.concat(taggedExec(vars));
            return this;
        };
        RetrieveMultipleRecords.prototype.expand = function (exps, vars) {
            var expName = taggedExec(exps).toString();
            this.expands.push(expName);
            if (vars)
                this.selects = this.selects.concat(taggedExec(vars).map(function (a) { return expName + "." + a; }));
            return this;
        };
        RetrieveMultipleRecords.prototype.filter = function (filter) {
            this.filters = taggedExec(filter);
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
        RetrieveMultipleRecords.prototype.execute = function (successCallback, errorCallback, onComplete) {
            SDK.REST.retrieveMultipleRecords(this.logicalName, this.getOptions(), successCallback, errorCallback ? errorCallback : NoOp, onComplete ? onComplete : NoOp);
        };
        /**
         * @internal
         */
        RetrieveMultipleRecords.prototype.getOptions = function () {
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
        };
        return RetrieveMultipleRecords;
    })();
    XQC.RetrieveMultipleRecords = RetrieveMultipleRecords;
    /**
     * Contains information about a Create query
     */
    var CreateRecord = (function () {
        function CreateRecord(entityPicker, record) {
            this.logicalName = taggedExec(entityPicker).toString();
            this.record = record;
        }
        CreateRecord.prototype.execute = function (successCallback, errorCallback) {
            SDK.REST.createRecord(this.record, this.logicalName, successCallback ? successCallback : NoOp, errorCallback ? errorCallback : NoOp);
        };
        return CreateRecord;
    })();
    XQC.CreateRecord = CreateRecord;
    /**
     * Contains information about an Update query
     */
    var UpdateRecord = (function () {
        function UpdateRecord(entityPicker, id, record) {
            this.logicalName = taggedExec(entityPicker).toString();
            this.id = id;
            this.record = record;
        }
        UpdateRecord.prototype.execute = function (successCallback, errorCallback) {
            SDK.REST.updateRecord(this.id, this.record, this.logicalName, successCallback ? successCallback : NoOp, errorCallback ? errorCallback : NoOp);
        };
        return UpdateRecord;
    })();
    XQC.UpdateRecord = UpdateRecord;
    /**
     * Contains information about a Delete query
     */
    var DeleteRecord = (function () {
        function DeleteRecord(entityPicker, id) {
            this.logicalName = taggedExec(entityPicker).toString();
            this.id = id;
        }
        DeleteRecord.prototype.execute = function (successCallback, errorCallback) {
            SDK.REST.deleteRecord(this.id, this.logicalName, successCallback ? successCallback : NoOp, errorCallback ? errorCallback : NoOp);
        };
        return DeleteRecord;
    })();
    XQC.DeleteRecord = DeleteRecord;
})(XQC || (XQC = {}));
