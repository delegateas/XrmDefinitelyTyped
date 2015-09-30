/// <reference path="base.d.ts" />
declare module Filter {
    function equals<T>(v1: T, v2: T): Filter;
    function notEquals<T>(v1: T, v2: T): Filter;
    function greaterThan<T extends Number | Date>(v1: T, v2: T): Filter;
    function greaterThanOrEqual<T extends Number | Date>(v1: T, v2: T): Filter;
    function lessThan<T extends Number | Date>(v1: T, v2: T): Filter;
    function lessThanOrEqual<T extends Number | Date>(v1: T, v2: T): Filter;
    function and(f1: Filter, f2: Filter): Filter;
    function or(f1: Filter, f2: Filter): Filter;
    function not(f1: Filter): Filter;
    function startsWith(v1: string, v2: string): Filter;
    function substringOf(v1: string, v2: string): Filter;
    function endsWith(v1: string, v2: string): Filter;
    /**
     * Makes a string into a GUID that can be sent to the OData source
     */
    function makeGuid(id: string): Guid;
}
declare module XrmQuery {
    function retrieveRecord<O, S, E, R>(entityPicker: (x: Entities) => QueryMapping<O, S, E, any, R>, id: string): XQC.RetrieveRecord<S, E, R>;
    function retrieveMultipleRecords<O, S, E, F, R>(entityPicker: (x: Entities) => QueryMapping<O, S, E, F, R>): XQC.RetrieveMultipleRecords<S, E, F, R>;
    function createRecord<O, R>(entityPicker: (x: Entities) => QueryMapping<O, any, any, any, R>, record: O): XQC.CreateRecord<O, R>;
    function updateRecord<O>(entityPicker: (x: Entities) => QueryMapping<O, any, any, any, any>, id: string, record: O): XQC.UpdateRecord<O>;
    function deleteRecord<O>(entityPicker: (x: Entities) => QueryMapping<O, any, any, any, any>, id: string): XQC.DeleteRecord<O>;
}
declare module XQC {
    /**
     * Contains information about a Retrieve query
     */
    class RetrieveRecord<S, E, R> {
        constructor(entityPicker: (x: Entities) => QueryMapping<any, S, E, any, R>, id: string);
        select(vars: (x: S) => Attribute<S>[]): RetrieveRecord<S, E, R>;
        expand<S2>(exps: (x: E) => Expandable<S, S2>, vars?: (x: S2) => Attribute<S2>[]): RetrieveRecord<S, E, R>;
        execute(successCallback: (record: R) => any, errorCallback?: (err: Error) => any): void;
    }
    /**
     * Contains information about a RetrieveMultiple query
     */
    class RetrieveMultipleRecords<S, E, F, R> {
        constructor(entityPicker: (x: Entities) => QueryMapping<any, S, E, F, R>);
        select(vars: (x: S) => Attribute<S>[]): RetrieveMultipleRecords<S, E, F, R>;
        expand<T2>(exps: (x: E) => Expandable<S, T2>, vars?: (x: T2) => Attribute<T2>[]): RetrieveMultipleRecords<S, E, F, R>;
        filter(filter: (x: F) => Filter): RetrieveMultipleRecords<S, E, F, R>;
        orderAsc(vars: (x: S) => Attribute<S>): RetrieveMultipleRecords<S, E, F, R>;
        orderDesc(vars: (x: S) => Attribute<S>): RetrieveMultipleRecords<S, E, F, R>;
        skip(amount: number): RetrieveMultipleRecords<S, E, F, R>;
        top(amount: number): RetrieveMultipleRecords<S, E, F, R>;
        execute(successCallback: (records: R[]) => any, errorCallback?: (err: Error) => any, onComplete?: () => any): void;
    }
    /**
     * Contains information about a Create query
     */
    class CreateRecord<O, R> {
        constructor(entityPicker: (x: Entities) => QueryMapping<O, any, any, any, R>, record: O);
        execute(successCallback?: (record: R) => any, errorCallback?: (err: Error) => any): void;
    }
    /**
     * Contains information about an Update query
     */
    class UpdateRecord<O> {
        constructor(entityPicker: (x: Entities) => QueryMapping<O, any, any, any, any>, id: string, record: O);
        execute(successCallback?: () => any, errorCallback?: (err: Error) => any): void;
    }
    /**
     * Contains information about a Delete query
     */
    class DeleteRecord<O> {
        constructor(entityPicker: (x: Entities) => QueryMapping<O, any, any, any, any>, id: string);
        execute(successCallback?: () => any, errorCallback?: (err: Error) => any): void;
    }
}
