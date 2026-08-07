import { serializeRecord } from "../body.js";
import { idToString, type RecordId } from "../id.js";
import { parseRaw } from "../proxy.js";
import { Query } from "./base.js";

/**
 * Shared implementation of the two associate queries. They differ only in HTTP method: a
 * single-valued navigation property is `PUT`, a collection-valued one is `POST`.
 */
abstract class AssociateRecord extends Query<undefined> {
  /** @internal */
  protected entitySetName: string;
  /** @internal */
  protected relation: string;
  /** @internal */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected record: any;

  protected constructor(
    method: "PUT" | "POST",
    entitySetName: string,
    protected id: RecordId,
    entitySetNameTarget: string,
    targetId: RecordId,
    relation: string,
  ) {
    super(method);
    this.entitySetName = entitySetName;
    this.relation = relation;
    this.record = { [`_id$${entitySetNameTarget}`]: idToString(targetId) };
  }

  /** @internal */
  protected handleResponse(): undefined {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData(id: RecordId, record: any): this {
    this.id = id;
    this.record = record;
    return this;
  }

  /** @internal */
  protected getObjectToSend(): string {
    return serializeRecord(this.record);
  }

  getQueryString(): string {
    return `${this.entitySetName}(${idToString(this.id)})/${this.relation}/$ref`;
  }
}

/** Associates two records over a single-valued navigation property (an N:1 lookup). */

export class AssociateRecordSingle<ISingle, ISelect> extends AssociateRecord {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<ISingle, any>,
    id: RecordId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityTargetPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, any, ISelect>,
    targetId: RecordId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relationPicker: (x: ISingle) => WebMappingRetrieve<ISelect, any, any, any, any, any>,
  ) {
    super(
      "PUT",
      parseRaw(entityPicker),
      id,
      parseRaw(entityTargetPicker),
      targetId,
      parseRaw(relationPicker),
    );
  }
}

/** Associates two records over a collection-valued navigation property (a 1:N or N:N relation). */

export class AssociateRecordCollection<IMultiple, ISelect> extends AssociateRecord {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<any, IMultiple>,
    id: RecordId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityTargetPicker: (x: WebEntitiesCUDA) => WebMappingCUDA<any, any, ISelect>,
    targetId: RecordId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relationPicker: (x: IMultiple) => WebMappingRetrieve<ISelect, any, any, any, any, any>,
  ) {
    super(
      "POST",
      parseRaw(entityPicker),
      id,
      parseRaw(entityTargetPicker),
      targetId,
      parseRaw(relationPicker),
    );
  }
}

/** Removes an association between two records. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class DisassociateRecord<ISelect> extends Query<undefined> {
  static Single<ISingle, ISelect>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<ISingle, any>,
    id: RecordId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relationPicker: (x: ISingle) => WebMappingRetrieve<ISelect, any, any, any, any, any>,
  ): DisassociateRecord<ISelect> {
    return new DisassociateRecord<ISelect>(parseRaw(entityPicker), id, parseRaw(relationPicker));
  }

  static Collection<IMultiple, ISelect>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityPicker: (x: WebEntitiesRelated) => WebMappingRelated<any, IMultiple>,
    id: RecordId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    relationPicker: (x: IMultiple) => WebMappingRetrieve<ISelect, any, any, any, any, any>,
    targetId: RecordId,
  ): DisassociateRecord<ISelect> {
    return new DisassociateRecord<ISelect>(
      parseRaw(entityPicker),
      id,
      parseRaw(relationPicker),
      targetId,
    );
  }

  constructor(
    private entitySetName: string,
    private id: RecordId,
    private relation: string,
    private targetId?: RecordId,
  ) {
    super("DELETE");
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
    const prefix = `${this.entitySetName}(${idToString(this.id)})/${this.relation}`;
    return this.targetId === undefined || this.targetId === null
      ? `${prefix}/$ref`
      : `${prefix}(${idToString(this.targetId)})/$ref`;
  }
}
