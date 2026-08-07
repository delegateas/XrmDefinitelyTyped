import { RetrieveRecord } from "./query/retrieve.js";
import { RetrieveMultipleRecords } from "./query/retrieveMultiple.js";
import { CreateRecord, DeleteRecord, UpdateRecord, UpsertRecord } from "./query/mutate.js";
import {
  AssociateRecordCollection,
  AssociateRecordSingle,
  DisassociateRecord,
} from "./query/associate.js";
import { ActionRequest, FunctionRequest, type BoundTo, type Parameters } from "./query/action.js";
import { BatchRequest } from "./query/batch.js";
import type { Query } from "./query/base.js";
import type { RecordId } from "./id.js";

export const XrmQuery = {
  /**
   * Instantiates a query that retrieves a specific record.
   * @param entityPicker Function to select which entity-type should be targeted.
   * @param id GUID of the wanted record, or an alternate key.
   */
  retrieve<ISelect, IExpand, IFixed, FormattedResult, Result>(
    entityPicker: (
      x: WebEntitiesRetrieve,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => WebMappingRetrieve<ISelect, IExpand, any, IFixed, Result, FormattedResult>,
    id: RecordId,
  ) {
    return RetrieveRecord.Get<ISelect, IExpand, IFixed, FormattedResult, Result>(entityPicker, id);
  },

  /**
   * Instantiates a query that retrieves multiple records of a certain entity.
   * @param entityPicker Function to select which entity should be targeted.
   */
  retrieveMultiple<ISelect, IExpand, IFilter, IFixed, FormattedResult, Result>(
    entityPicker: (
      x: WebEntitiesRetrieve,
    ) => WebMappingRetrieve<ISelect, IExpand, IFilter, IFixed, Result, FormattedResult>,
  ) {
    return RetrieveMultipleRecords.Get<ISelect, IExpand, IFilter, IFixed, FormattedResult, Result>(
      entityPicker,
    );
  },

  /**
   * Instantiates a query that retrieves a related record of a given record.
   * @param entityPicker Function to select which entity-type the related record should be retrieved from.
   * @param id GUID of the record of which the related record should be retrieved.
   * @param relatedPicker Function to select which navigation property points to the related record.
   */
  retrieveRelated<ISingle, ISelect, IExpand, IFixed, FormattedResult, Result>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<ISingle, any>,
    id: RecordId,
    relatedPicker: (
      x: ISingle,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => WebMappingRetrieve<ISelect, IExpand, any, IFixed, Result, FormattedResult>,
  ) {
    return RetrieveRecord.Related<ISingle, ISelect, IExpand, IFixed, FormattedResult, Result>(
      entityPicker,
      id,
      relatedPicker,
    );
  },

  /**
   * Instantiates a query that retrieves multiple related records of a given record.
   * @param entityPicker Function to select which entity-type the related records should be retrieved from.
   * @param id GUID of the record of which the related records should be retrieved.
   * @param relatedPicker Function to select which navigation property points to the related records.
   */
  retrieveRelatedMultiple<IMultiple, ISelect, IExpand, IFilter, IFixed, FormattedResult, Result>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<any, IMultiple>,
    id: RecordId,
    relatedPicker: (
      x: IMultiple,
    ) => WebMappingRetrieve<ISelect, IExpand, IFilter, IFixed, Result, FormattedResult>,
  ) {
    return RetrieveMultipleRecords.Related<
      IMultiple,
      ISelect,
      IExpand,
      IFilter,
      IFixed,
      FormattedResult,
      Result
    >(entityPicker, id, relatedPicker);
  },

  /**
   * Instantiates a query that creates a record.
   * @param entityPicker Function to select which entity-type should be created.
   * @param record Object of the record to be created.
   */
  create<ICreate>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<ICreate, any, any>,
    record?: ICreate,
  ) {
    return new CreateRecord<ICreate>(entityPicker, record);
  },

  /**
   * Instantiates a query that updates a specific record.
   * @param entityPicker Function to select which entity-type should be updated.
   * @param id GUID of the record to be updated, or an alternate key.
   * @param record Object containing the attributes to be updated.
   */
  update<IUpdate>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, IUpdate, any>,
    id?: RecordId,
    record?: IUpdate,
  ) {
    return new UpdateRecord<IUpdate>(entityPicker, id, record);
  },

  /**
   * Instantiates a query that updates a record, creating it if it does not exist.
   * @param entityPicker Function to select which entity-type should be upserted.
   * @param id GUID of the record, or an alternate key — an alternate key is the usual choice here.
   * @param record Object containing the attributes to set.
   */
  upsert<IUpdate>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, IUpdate, any>,
    id: RecordId,
    record?: IUpdate,
  ) {
    return new UpsertRecord<IUpdate>(entityPicker, id, record);
  },

  /**
   * Instantiates a query that deletes a specific record.
   * @param entityPicker Function to select which entity-type should be deleted.
   * @param id GUID of the record to be deleted, or an alternate key.
   */
  deleteRecord(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, any, any>,
    id?: RecordId,
  ) {
    return new DeleteRecord(entityPicker, id);
  },

  /**
   * Instantiates a query that associates two records over an N:1 relation.
   * @param entityPicker Function to select the entity-type of the source entity.
   * @param id GUID of the source entity.
   * @param entityTargetPicker Function to select the entity-type of the target entity.
   * @param targetId GUID of the target entity.
   * @param relationPicker Function to select which N:1 relation (lookup-field) should be used.
   */
  associateSingle<ISingle, ISelect>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<ISingle, any>,
    id: RecordId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityTargetPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, any, ISelect>,
    targetId: RecordId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relationPicker: (x: ISingle) => WebMappingRetrieve<ISelect, any, any, any, any, any>,
  ) {
    return new AssociateRecordSingle<ISingle, ISelect>(
      entityPicker,
      id,
      entityTargetPicker,
      targetId,
      relationPicker,
    );
  },

  /**
   * Instantiates a query that associates two records over an N:N or 1:N relation.
   * @param entityPicker Function to select the entity-type of the source entity.
   * @param id GUID of the source entity.
   * @param entityTargetPicker Function to select the entity-type of the target entity.
   * @param targetId GUID of the target entity.
   * @param relationPicker Function to select which N:N or 1:N relation should be used.
   */
  associateCollection<IMultiple, ISelect>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<any, IMultiple>,
    id: RecordId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityTargetPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, any, ISelect>,
    targetId: RecordId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relationPicker: (x: IMultiple) => WebMappingRetrieve<ISelect, any, any, any, any, any>,
  ) {
    return new AssociateRecordCollection<IMultiple, ISelect>(
      entityPicker,
      id,
      entityTargetPicker,
      targetId,
      relationPicker,
    );
  },

  /**
   * Instantiates a query that disassociates two records over an N:1 relation.
   * @param entityPicker Function to select the entity-type of the source entity.
   * @param id GUID of the source entity.
   * @param relationPicker Function to select which N:1 relation (lookup-field) should be cleared.
   */
  disassociateSingle<ISingle, ISelect>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<ISingle, any>,
    id: RecordId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relationPicker: (x: ISingle) => WebMappingRetrieve<ISelect, any, any, any, any, any>,
  ) {
    return DisassociateRecord.Single<ISingle, ISelect>(entityPicker, id, relationPicker);
  },

  /**
   * Instantiates a query that disassociates two records over an N:N or 1:N relation.
   * @param entityPicker Function to select the entity-type of the source entity.
   * @param id GUID of the source entity.
   * @param relationPicker Function to select which N:N or 1:N relation should be used.
   * @param targetId GUID of the target entity.
   */
  disassociateCollection<IMultiple, ISelect>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<any, IMultiple>,
    id: RecordId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relationPicker: (x: IMultiple) => WebMappingRetrieve<ISelect, any, any, any, any, any>,
    targetId: RecordId,
  ) {
    return DisassociateRecord.Collection<IMultiple, ISelect>(
      entityPicker,
      id,
      relationPicker,
      targetId,
    );
  },

  /**
   * Instantiates a request that calls an action.
   * @param name Name of the action, e.g. `WinOpportunity`.
   * @param params Parameters to send in the request body.
   * @param boundTo Entity set and record id, when calling an action bound to a record.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action<Result = any>(name: string, params?: Parameters, boundTo?: BoundTo) {
    return new ActionRequest<Result>(name, params, boundTo);
  },

  /**
   * Instantiates a request that calls a function.
   * @param name Name of the function, e.g. `WhoAmI`.
   * @param params Parameters to pass in the url.
   * @param boundTo Entity set and record id, when calling a function bound to a record.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function<Result = any>(name: string, params?: Parameters, boundTo?: BoundTo) {
    return new FunctionRequest<Result>(name, params, boundTo);
  },

  /**
   * Packs several queries into one `$batch` request. Consecutive change requests are grouped into a
   * changeset and executed as one transaction.
   */
  batch<const T extends readonly Query<unknown>[]>(queries: T) {
    return new BatchRequest<T>(queries);
  },
};

export { Filter } from "./filter.js";
export { SortOrder } from "./globals.js";
export {
  configure,
  resetConfig,
  setApiUrl,
  setApiVersion,
  getApiUrl,
  DEFAULT_API_VERSION,
  type XrmQueryConfig,
} from "./config.js";
export { XrmQueryError } from "./errors.js";

export { Query } from "./query/base.js";
export { RetrieveRecord } from "./query/retrieve.js";
export { RetrieveMultipleRecords } from "./query/retrieveMultiple.js";
export { CreateRecord, UpdateRecord, UpsertRecord, DeleteRecord } from "./query/mutate.js";
export {
  AssociateRecordSingle,
  AssociateRecordCollection,
  DisassociateRecord,
} from "./query/associate.js";
export { ActionRequest, FunctionRequest } from "./query/action.js";
export { BatchRequest, type BatchResults } from "./query/batch.js";

export type { BoundTo, Parameters } from "./query/action.js";
export type { RecordId, AlternateKey } from "./id.js";
export type { HttpMethod, RawRequest, RawResponse, RequestHeader } from "./http.js";
