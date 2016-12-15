var Filter;
(function (Filter) {
    var REST;
    (function (REST) {
        function equals(v1, v2) { return Comp(v1, "eq", v2); }
        REST.equals = equals;
        function notEquals(v1, v2) { return Comp(v1, "ne", v2); }
        REST.notEquals = notEquals;
        function greaterThan(v1, v2) { return Comp(v1, "gt", v2); }
        REST.greaterThan = greaterThan;
        function greaterThanOrEqual(v1, v2) { return Comp(v1, "ge", v2); }
        REST.greaterThanOrEqual = greaterThanOrEqual;
        function lessThan(v1, v2) { return Comp(v1, "lt", v2); }
        REST.lessThan = lessThan;
        function lessThanOrEqual(v1, v2) { return Comp(v1, "le", v2); }
        REST.lessThanOrEqual = lessThanOrEqual;
        function and(f1, f2) { return BiFilter(f1, "and", f2); }
        REST.and = and;
        function or(f1, f2) { return BiFilter(f1, "or", f2); }
        REST.or = or;
        function not(f1) { return ("not " + f1); }
        REST.not = not;
        function ands(fs) { return NestedFilter(fs, "and"); }
        REST.ands = ands;
        function ors(fs) { return NestedFilter(fs, "or"); }
        REST.ors = ors;
        function startsWith(v1, v2) { return DataFunc("startswith", v1, v2); }
        REST.startsWith = startsWith;
        function substringOf(v1, v2) { return DataFunc("substringof", v1, v2); }
        REST.substringOf = substringOf;
        function endsWith(v1, v2) { return DataFunc("endswith", v1, v2); }
        REST.endsWith = endsWith;
        /**
         * Makes a string into a GUID that can be sent to the OData source
         */
        function makeGuid(id) { return XQR.makeTag("(guid'" + id + "')"); }
        REST.makeGuid = makeGuid;
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
        /**
         * @internal
         */
        function DataFunc(funcName, val1, val2) {
            return (funcName + "(" + getVal(val1) + ", " + getVal(val2) + ")");
        }
        /**
         * @internal
         */
        function BiFilter(f1, conj, f2) {
            return ("(" + f1 + " " + conj + " " + f2 + ")");
        }
        /**
         * @internal
         */
        function NestedFilter(fs, conj) {
            var last = fs.pop();
            return fs.reduceRight(function (acc, c) { return BiFilter(c, conj, acc); }, last);
        }
    })(REST = Filter.REST || (Filter.REST = {}));
})(Filter || (Filter = {}));
var XrmQuery;
(function (XrmQuery) {
    var REST;
    (function (REST) {
        function retrieveRecord(entityPicker, id) {
            return new XQR.RetrieveRecord(entityPicker, id);
        }
        REST.retrieveRecord = retrieveRecord;
        function retrieveMultipleRecords(entityPicker) {
            return new XQR.RetrieveMultipleRecords(entityPicker);
        }
        REST.retrieveMultipleRecords = retrieveMultipleRecords;
        function createRecord(entityPicker, record) {
            return new XQR.CreateRecord(entityPicker, record);
        }
        REST.createRecord = createRecord;
        function updateRecord(entityPicker, id, record) {
            return new XQR.UpdateRecord(entityPicker, id, record);
        }
        REST.updateRecord = updateRecord;
        function deleteRecord(entityPicker, id) {
            return new XQR.DeleteRecord(entityPicker, id);
        }
        REST.deleteRecord = deleteRecord;
    })(REST = XrmQuery.REST || (XrmQuery.REST = {}));
})(XrmQuery || (XrmQuery = {}));
var XQR;
(function (XQR) {
    /**
     * @internal
     */
    function makeTag(name) {
        return { __str: name, toString: function () { return this.__str; } };
    }
    XQR.makeTag = makeTag;
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
            SDK.REST.retrieveRecord(this.id, this.logicalName, this.selects.length > 0 ? this.selects.join(",") : null, this.expands.length > 0 ? this.expands.join(",") : null, successCallback, errorCallback ? errorCallback : NoOp);
        };
        return RetrieveRecord;
    }());
    XQR.RetrieveRecord = RetrieveRecord;
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
                this.selects = this.selects.concat(taggedExec(vars).map(function (a) { return expName + "/" + a; }));
            return this;
        };
        RetrieveMultipleRecords.prototype.filter = function (filter) {
            this.filters = taggedExec(filter);
            return this;
        };
        RetrieveMultipleRecords.prototype.orFilter = function (filter) {
            if (this.filters)
                this.filters = Filter.REST.or(this.filters, taggedExec(filter));
            else
                this.filter(filter);
            return this;
        };
        RetrieveMultipleRecords.prototype.andFilter = function (filter) {
            if (this.filters)
                this.filters = Filter.REST.and(this.filters, taggedExec(filter));
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
        /**
         * Executes the RetrieveMultiple. Note that the first function passed as an argument is called once per page returned from CRM.
         * @param pageSuccessCallback Called once per page returned from CRM
         * @param errorCallback Called if an error occurs during the retrieval
         * @param onComplete Called when all pages have been successfully retrieved from CRM
         */
        RetrieveMultipleRecords.prototype.execute = function (pageSuccessCallback, errorCallback, onComplete) {
            SDK.REST.retrieveMultipleRecords(this.logicalName, this.getOptionString(), pageSuccessCallback, errorCallback, onComplete);
        };
        /**
         * Executes the RetrieveMultiple and concatenates all the pages to a single array that is delivered to the success callback function.
         * @param successCallback Called with all records returned from the query
         * @param errorCallback Called if an error occures during the retrieval
         */
        RetrieveMultipleRecords.prototype.getAll = function (successCallback, errorCallback) {
            var pages = [];
            SDK.REST.retrieveMultipleRecords(this.logicalName, this.getOptionString(), function (page) {
                pages.push(page);
            }, errorCallback ? errorCallback : NoOp, function () {
                successCallback([].concat.apply([], pages));
            });
        };
        /**
         * Executes the RetrieveMultiple, but only returns the first result (or null, if no record was found).
         * @param successCallback Called with the first result of the query (or null, if no record was found)
         * @param errorCallback Called if an error occures during the retrieval
         */
        RetrieveMultipleRecords.prototype.getFirst = function (successCallback, errorCallback) {
            this.top(1);
            this.execute(function (recs) { return successCallback((recs.length > 0) ? recs[0] : null); }, errorCallback ? errorCallback : NoOp, NoOp);
        };
        RetrieveMultipleRecords.prototype.getOptionString = function () {
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
    }());
    XQR.RetrieveMultipleRecords = RetrieveMultipleRecords;
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
    }());
    XQR.CreateRecord = CreateRecord;
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
    }());
    XQR.UpdateRecord = UpdateRecord;
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
    }());
    XQR.DeleteRecord = DeleteRecord;
})(XQR || (XQR = {}));
