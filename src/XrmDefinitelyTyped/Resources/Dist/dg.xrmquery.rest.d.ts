interface RestEntities {
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
declare namespace Filter.REST {
    function equals<T>(v1: T, v2: T): RestFilter;
    function notEquals<T>(v1: T, v2: T): RestFilter;
    function greaterThan<T extends Number | Date>(v1: T, v2: T): RestFilter;
    function greaterThanOrEqual<T extends Number | Date>(v1: T, v2: T): RestFilter;
    function lessThan<T extends Number | Date>(v1: T, v2: T): RestFilter;
    function lessThanOrEqual<T extends Number | Date>(v1: T, v2: T): RestFilter;
    function and(f1: RestFilter, f2: RestFilter): RestFilter;
    function or(f1: RestFilter, f2: RestFilter): RestFilter;
    function not(f1: RestFilter): RestFilter;
    function ands(fs: RestFilter[]): RestFilter;
    function ors(fs: RestFilter[]): RestFilter;
    function startsWith(v1: string, v2: string): RestFilter;
    function substringOf(v1: string, v2: string): RestFilter;
    function endsWith(v1: string, v2: string): RestFilter;
    /**
     * Makes a string into a GUID that can be sent to the OData source
     */
    function makeGuid(id: string): XQR.Guid;
}
declare namespace XrmQuery.REST {
    function retrieveRecord<O, S, E, R>(entityPicker: (x: RestEntities) => RestMapping<O, S, E, any, R>, id: string): XQR.RetrieveRecord<S, E, R>;
    function retrieveMultipleRecords<O, S, E, F, R>(entityPicker: (x: RestEntities) => RestMapping<O, S, E, F, R>): XQR.RetrieveMultipleRecords<S, E, F, R>;
    function createRecord<O, R>(entityPicker: (x: RestEntities) => RestMapping<O, any, any, any, R>, record: O): XQR.CreateRecord<O, R>;
    function updateRecord<O>(entityPicker: (x: RestEntities) => RestMapping<O, any, any, any, any>, id: string, record: O): XQR.UpdateRecord<O>;
    function deleteRecord<O>(entityPicker: (x: RestEntities) => RestMapping<O, any, any, any, any>, id: string): XQR.DeleteRecord<O>;
}
declare namespace XQR {
    interface Guid {
        __XqrGuid: any;
    }
    interface ValueContainerFilter<T> {
        Value: T;
    }
    interface EntityReferenceFilter {
        Id: Guid;
        Name: string;
        LogicalName: string;
    }
    /**
     * Contains information about a Retrieve query
     */
    class RetrieveRecord<S, E, R> {
        constructor(entityPicker: (x: RestEntities) => RestMapping<any, S, E, any, R>, id: string);
        select(vars: (x: S) => RestAttribute<S>[]): this;
        expand<S2>(exps: (x: E) => RestExpand<S, S2>, vars?: (x: S2) => RestAttribute<S2>[]): this;
        execute(successCallback: (record: R) => any, errorCallback?: (err: Error) => any): void;
    }
    /**
     * Contains information about a RetrieveMultiple query
     */
    class RetrieveMultipleRecords<S, E, F, R> {
        constructor(entityPicker: (x: RestEntities) => RestMapping<any, S, E, F, R>);
        select(vars: (x: S) => RestAttribute<S>[]): this;
        expand<T2>(exps: (x: E) => RestExpand<S, T2>, vars?: (x: T2) => RestAttribute<T2>[]): this;
        filter(filter: (x: F) => RestFilter): this;
        orFilter(filter: (x: F) => RestFilter): this;
        andFilter(filter: (x: F) => RestFilter): this;
        orderAsc(vars: (x: S) => RestAttribute<S>): this;
        orderDesc(vars: (x: S) => RestAttribute<S>): this;
        skip(amount: number): this;
        top(amount: number): this;
        /**
         * Executes the RetrieveMultiple. Note that the first function passed as an argument is called once per page returned from CRM.
         * @param pageSuccessCallback Called once per page returned from CRM
         * @param errorCallback Called if an error occurs during the retrieval
         * @param onComplete Called when all pages have been successfully retrieved from CRM
         */
        execute(pageSuccessCallback: (records: R[]) => any, errorCallback: (err: Error) => any, onComplete: () => any): void;
        /**
         * Executes the RetrieveMultiple and concatenates all the pages to a single array that is delivered to the success callback function.
         * @param successCallback Called with all records returned from the query
         * @param errorCallback Called if an error occures during the retrieval
         */
        getAll(successCallback: (records: R[]) => any, errorCallback?: (err: Error) => any): void;
        /**
         * Executes the RetrieveMultiple, but only returns the first result (or null, if no record was found).
         * @param successCallback Called with the first result of the query (or null, if no record was found)
         * @param errorCallback Called if an error occures during the retrieval
         */
        getFirst(successCallback: (record: R | null) => any, errorCallback?: (err: Error) => any): void;
        getOptionString(): string;
    }
    /**
     * Contains information about a Create query
     */
    class CreateRecord<O, R> {
        constructor(entityPicker: (x: RestEntities) => RestMapping<O, any, any, any, R>, record: O);
        execute(successCallback?: (record: R) => any, errorCallback?: (err: Error) => any): void;
    }
    /**
     * Contains information about an Update query
     */
    class UpdateRecord<O> {
        constructor(entityPicker: (x: RestEntities) => RestMapping<O, any, any, any, any>, id: string, record: O);
        execute(successCallback?: () => any, errorCallback?: (err: Error) => any): void;
    }
    /**
     * Contains information about a Delete query
     */
    class DeleteRecord<O> {
        constructor(entityPicker: (x: RestEntities) => RestMapping<O, any, any, any, any>, id: string);
        execute(successCallback?: () => any, errorCallback?: (err: Error) => any): void;
    }
}
