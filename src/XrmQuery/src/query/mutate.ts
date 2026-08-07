import { serializeRecord } from "../body.js";
import { idToString, type RecordId } from "../id.js";
import type { RawResponse } from "../http.js";
import { parseRaw } from "../proxy.js";
import { Query } from "./base.js";

/** Pulls the id of the created record out of the `OData-EntityId` response header. */
function idFromEntityIdHeader(response: RawResponse): string {
  const header = response.headers.get("OData-EntityId");
  if (header === null) throw new Error("XrmQuery: no valid OData-EntityId found in the response.");
  return header.slice(-37, -1);
}

/** A query that creates a record. */
export class CreateRecord<ICreate> extends Query<string> {
  /** @internal */
  private entitySetName: string;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<ICreate, any, any>,
    private record?: ICreate,
  ) {
    super("POST");
    this.entitySetName = parseRaw(entityPicker);
  }

  /** @internal */
  protected handleResponse(response: RawResponse): string {
    return idFromEntityIdHeader(response);
  }

  setData(record: ICreate): this {
    this.record = record;
    return this;
  }

  /** @internal */
  protected getObjectToSend(): string {
    return serializeRecord(this.record);
  }

  getQueryString(): string {
    return this.entitySetName;
  }
}

/** A query that updates a record. */
export class UpdateRecord<IUpdate> extends Query<undefined> {
  /** @internal */
  private entitySetName: string;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, IUpdate, any>,
    private id?: RecordId,
    private record?: IUpdate,
  ) {
    super("PATCH");
    this.entitySetName = parseRaw(entityPicker);
  }

  /** @internal */
  protected handleResponse(): undefined {
    return undefined;
  }

  setData(id: RecordId, record: IUpdate): this {
    this.id = id;
    this.record = record;
    return this;
  }

  /** @internal */
  protected getObjectToSend(): string {
    return serializeRecord(this.record);
  }

  getQueryString(): string {
    return `${this.entitySetName}(${idToString(this.id ?? "")})`;
  }
}

/**
 * A query that updates a record if it exists and creates it otherwise.
 *
 * Upsert is a `PATCH` without the `If-Match: *` header an update sends; use {@link updateOnly} or
 * {@link createOnly} to restrict it to one of the two.
 *
 * See https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/update-delete-entities-using-web-api#upsert-a-table-row
 */
export class UpsertRecord<IUpdate> extends Query<string | undefined> {
  /** @internal */
  private entitySetName: string;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, IUpdate, any>,
    private id: RecordId,
    private record?: IUpdate,
  ) {
    super("PATCH");
    this.entitySetName = parseRaw(entityPicker);
  }

  /** Fails with a 404 instead of creating the record when it does not exist. */
  updateOnly(): this {
    return this.header("If-Match", "*");
  }

  /** Fails with a 412 instead of updating the record when it already exists. */
  createOnly(): this {
    return this.header("If-None-Match", "*");
  }

  /** @internal */
  protected handleResponse(response: RawResponse): string | undefined {
    // A create returns 204 with an OData-EntityId; an update returns 204 with nothing useful.
    return response.headers.get("OData-EntityId") !== null
      ? idFromEntityIdHeader(response)
      : undefined;
  }

  setData(id: RecordId, record: IUpdate): this {
    this.id = id;
    this.record = record;
    return this;
  }

  /** @internal */
  protected getObjectToSend(): string {
    return serializeRecord(this.record);
  }

  getQueryString(): string {
    return `${this.entitySetName}(${idToString(this.id)})`;
  }
}

/** A query that deletes a record. */
export class DeleteRecord extends Query<undefined> {
  /** @internal */
  private entitySetName: string;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, any, any>,
    private id?: RecordId,
  ) {
    super("DELETE");
    this.entitySetName = parseRaw(entityPicker);
  }

  /** @internal */
  protected handleResponse(): undefined {
    return undefined;
  }

  setId(id: RecordId): this {
    this.id = id;
    return this;
  }

  getQueryString(): string {
    return `${this.entitySetName}(${idToString(this.id ?? "")})`;
  }
}
