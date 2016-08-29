interface Entities { }

interface QueryMapping<O, S, E, F, R> {
    __isEntityMapping: O;
}

interface Attribute<T> {
    __isAttribute: T;
}

interface Expandable<T, U> extends Attribute<T> {
    __isExpandable: U;
}

interface Filter {
    __isFilter: any;
}

interface ValueContainerFilter<T> {
    Value: T;
}

interface Guid {
    __isGuid: any;
}

interface EntityReferenceFilter {
    Id: Guid;
    Name: string;
    LogicalName: string;
}
