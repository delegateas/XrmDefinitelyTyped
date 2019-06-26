/**
 * SDK namespace
 */
declare namespace SDK {
  /**
   * SDK.Metadata namespace
   */
  namespace Metadata {
    /**
     * Enum which corresponds to the entity filters used in the metadata functions.
     */
    const enum EntityFilters {
      Default = 1,
      Entity = 1,
      Attributes = 2,
      Privileges = 4,
      Relationships = 8,
      All = 15,
    }
    /**
     * Sends an asynchronous RetrieveAllEntities Request to retrieve all entities in the system.
     *
     * @param EntityFilters SDK.Metadata.EntityFilters provides an enumeration for the filters available to filter which data is retrieved.
     *                      Include only those elements of the entity you want to retrieve. Retrieving all parts of all entitities may take significant time.
     * @param RetrieveAsIfPublished Sets whether to retrieve the metadata that has not been published.
     * @param successCallback The function that will be passed through and be called by a successful response.
     *                        This function must accept the entityMetadataCollection as a parameter.
     * @param errorCallBack The function that will be passed through and be called by a failed response.
     *                      This function must accept an Error object as a parameter.
     * @param passThroughObject An Object that will be passed through to as the second parameter to the successCallBack.
     */
    function RetrieveAllEntities(EntityFilters: EntityFilters, RetrieveAsIfPublished: boolean, successCallback: (metadata: EntityMetadata[], passThroughObject?: any) => any, errorCallback: (error: Error) => any, passThroughObject: any): void;

    /**
     * Sends an asynchronous RetrieveEntity Request to retrieve a specific entity.
     *
     * @param EntityFilters SDK.Metadata.EntityFilters provides an enumeration for the filters available to filter which data is retrieved.
     *                      Include only those elements of the entity you want to retrieve. Retrieving all parts of all entitities may take significant time.
     * @param LogicalName The logical name of the entity requested. A null value may be used if a MetadataId is provided.
     * @param MetadataId A null value or an empty guid may be passed if a LogicalName is provided.
     * @param RetrieveAsIfPublished Sets whether to retrieve the metadata that has not been published.
     * @param successCallback The function that will be passed through and be called by a successful response.
     *                        This function must accept the entityMetadata as a parameter.
     * @param errorCallback The function that will be passed through and be called by a failed response.
     *                      This function must accept an Error object as a parameter.
     * @param passThroughObject An Object that will be passed through to as the second parameter to the successCallBack.
     */
    function RetrieveEntity(EntityFilters: EntityFilters, LogicalName: string, MetadataId: string | null, RetrieveAsIfPublished: boolean, successCallback: (metadata: EntityMetadata, passThroughObject?: any) => any, errorCallback: (error: Error) => any, passThroughObject: any): void;
    /**
     * Sends an asynchronous RetrieveAttribute Request to retrieve a specific entity.
     *
     * @param EntityLogicalName The logical name of the entity for the attribute requested. A null value may be used if a MetadataId is provided.
     * @param LogicalName The logical name of the attribute requested.
     * @param MetadataId A null value may be passed if an EntityLogicalName and LogicalName is provided.
     * @param RetrieveAsIfPublished Sets whether to retrieve the metadata that has not been published.
     * @param successCallback The function that will be passed through and be called by a successful response.
     *                        This function must accept the entityMetadata as a parameter.
     * @param errorCallback The function that will be passed through and be called by a failed response.
     *                      This function must accept an Error object as a parameter.
     * @param passThroughObject An Object that will be passed through to as the second parameter to the successCallBack.
     */
    function RetrieveAttribute(EntityLogicalName: string, LogicalName: string, MetadataId: string | null, RetrieveAsIfPublished: boolean, successCallback: (metadata: AttributeMetadata, passThroughObject?: any) => any, errorCallback: (error: Error) => any, passThroughObject: any): void;

    interface BasicMetadata {
      HasChanged: any;
      MetadataId: string;
      IsManaged: boolean;
    }

    interface GeneralMetadata extends BasicMetadata {
      IntroducedVersion: string;
      IsCustomizable: ManagedProperty<boolean>;
    }

    /**
     * Interface that holds metadata for an attribute.
     */
    interface AttributeMetadata extends GeneralMetadata {
      AttributeOf: string;
      AttributeType: string;
      AttributeTypeName: Value<string>;

      CanBeSecuredForCreate: boolean;
      CanBeSecuredForRead: boolean;
      CanBeSecuredForUpdate: boolean;
      CanModifyAdditionalSettings: ManagedProperty<boolean>;
      ColumnNumber: number;
      DeprecatedVersion: string;

      Description: Label;
      DisplayName: Label;

      /**
       * Logical name of the entity.
       */
      EntityLogicalName: string;

      IsAuditEnabled: ManagedProperty<boolean>;
      IsCustomAttribute: boolean;
      IsLogical: string;
      IsPrimaryId: boolean;
      IsPrimaryName: boolean;
      IsRenameable: ManagedProperty<boolean>;
      IsSecured: boolean;
      IsValidForAdvancedFind: ManagedProperty<boolean>;
      IsValidForCreate: boolean;
      IsValidForRead: boolean;
      IsValidForUpdate: boolean;

      LinkedAttributeId: string;

      /**
       * Logical name of the attribute.
       */
      LogicalName: string;

      RequiredLevel: ManagedProperty<string>;

      /**
       * Schema name of the attribute.
       */
      SchemaName: string;

      SourceType: string;

      /**
       * Only available on Attributes with AttributeType == "Picklist"
       */
      SourceTypeMask?: string;

      /**
       * Only available on Attributes with AttributeType == "Picklist"
       */
      DefaultFormValue?: number;

      /**
       * Only available on Attributes with AttributeType == "Picklist"
       */
      FormulaDefinition?: string;

      /**
       * Only available on Attributes with AttributeType == "Picklist"
       */
      OptionSet?: OptionSetMetadata;

      /**
       * Only available on Attributes with AttributeType == "Lookup"
       */
      Targets?: string[];

      /**
       * Only available on Attributes with AttributeType == "String"
       */
      MaxLength?: number;

      /**
       * Only available on Attributes with AttributeType == "Integer", "Decimal", "Money"
       */
      MinValue?: number;

      /**
       * Only available on Attributes with AttributeType == "Integer", "Decimal", "Money"
       */
      MaxValue?: number;

      /**
       * Only available on Attributes with AttributeType == "Decimal", "Money"
       */
      Precision?: number;

      /**
       * Only available on Attributes with AttributeType == "Money"
       */
      PrecisionSource?: PrecisionSource;
    }

    const enum PrecisionSource {
      Precision = 0,
      UseOrganizationPricingDecimalPrecision = 1,
      UseCurrencyPrecision = 2,
    }

    interface OptionSetMetadata extends GeneralMetadata {
      Description: Label;
      DisplayName: Label;

      IsCustomOptionSet: boolean;

      IsGlobal: boolean;
      Name: string;
      OptionSetType: string;
      Options: OptionMetadata[];
    }

    interface OptionMetadata extends BasicMetadata {
      Description: Label;
      Label: Label;
      Value: number;
    }

    interface Label {
      LocalizedLabels: LocalizedLabel[];
      UserLocalizedLabel: LocalizedLabel;
    }

    interface LocalizedLabel extends BasicMetadata {
      Label: string;
      LanguageCode: number;
    }

    interface ManagedProperty<T> {
      CanBeChanged: boolean;
      ManagedPropertyLogicalName: string;
      Value: T;
    }

    /**
     * Interface that holds metadata for an entity.
     */
    interface EntityMetadata extends GeneralMetadata {
      AttributeTypeMask: number;

      /**
       * Attribute metadata of the entity
       */
      Attributes: AttributeMetadata[];

      AutoCreateAccessTeams: any;
      AutoRouteToOwnerQueue: boolean;

      CanBeInManyToMany: ManagedProperty<boolean>;
      CanBePrimaryEntityInRelationship: ManagedProperty<boolean>;
      CanBeRelatedEntityInRelationship: ManagedProperty<boolean>;
      CanChangeHierarchicalRelationship: ManagedProperty<boolean>;
      CanCreateAttributes: ManagedProperty<boolean>;
      CanCreateCharts: ManagedProperty<boolean>;
      CanCreateForms: ManagedProperty<boolean>;
      CanCreateViews: ManagedProperty<boolean>;
      CanModifyAdditionalSettings: ManagedProperty<boolean>;
      CanTriggerWorkflow: boolean;

      Description: Label;
      DisplayCollectionName: Label;
      DisplayName: Label;

      EnforceStateTransitions: string;
      EntityHelpUrl: string;
      EntityHelpUrlEnabled: string;

      IconLargeName: string;
      IconMediumName: string;
      IconSmallName: string;

      IsActivity: boolean;
      IsActivityParty: boolean;
      IsAIRUpdated: boolean;
      IsAuditEnabled: ManagedProperty<boolean>;
      IsAvailableOffline: boolean;
      IsBusinessProcessEnabled: string;
      IsChildEntity: boolean;
      IsConnectionsEnabled: ManagedProperty<boolean>;
      IsCustomEntity: boolean;
      IsDocumentManagementEnabled: boolean;
      IsDuplicateDetectionEnabled: ManagedProperty<boolean>;
      IsEnabledForCharts: boolean;
      IsEnabledForTrace: string;
      IsImportable: boolean;
      IsIntersect: boolean;
      IsMailMergeEnabled: ManagedProperty<boolean>;
      IsMappable: ManagedProperty<boolean>;
      IsQuickCreateEnabled: string;
      IsReadingPaneEnabled: boolean;
      IsReadOnlyInMobileClient: ManagedProperty<boolean>;
      IsRenameable: ManagedProperty<boolean>;
      IsStateModelAware: string;
      IsValidForAdvancedFind: boolean;
      IsValidForQueue: ManagedProperty<boolean>;
      IsVisibleInMobile: ManagedProperty<boolean>;
      IsVisibleInMobileClient: ManagedProperty<boolean>;

      LogicalName: string;

      ManyToManyRelationships: ManyToManyRelationshipMetadata[];
      ManyToOneRelationships: OneToManyRelationshipMetadata[];
      ObjectTypeCode: number;
      OneToManyRelationships: OneToManyRelationshipMetadata[];

      OwnershipType: string;
      PrimaryIdAttribute: string;
      PrimaryImageAttribute: string;
      PrimaryNameAttribute: string;

      Privileges: Privilege[];

      RecurrenceBaseEntityLogicalName: string;
      ReportViewName: string;
      SchemaName: string;
    }

    interface RelationshipMetadata extends GeneralMetadata {
      IsCustomRelationship: boolean;
      IsValidForAdvancedFind: boolean;
      RelationshipType: string;
      SchemaName: string;
      SecurityTypes: string;
    }

    interface OneToManyRelationshipMetadata extends RelationshipMetadata {
      AssociatedMenuConfiguration: AssociatedMenuConfiguration;
      CascadeConfiguration: CascadeConfiguration;

      IsHierarchical: string;

      ReferencedAttribute: string;
      ReferencedEntity: string;
      ReferencingAttribute: string;
      ReferencingEntity: string;
    }

    interface ManyToManyRelationshipMetadata extends RelationshipMetadata {
      Entity1AssociatedMenuConfiguration: AssociatedMenuConfiguration;
      Entity1IntersectAttribute: string;
      Entity1LogicalName: string;

      Entity2AssociatedMenuConfiguration: AssociatedMenuConfiguration;
      Entity2IntersectAttribute: string;
      Entity2LogicalName: string;

      IntersectEntityName: string;
    }

    interface CascadeConfiguration {
      Assign: string;
      Delete: string;
      Merge: string;
      Reparent: string;
      Share: string;
      Unshare: string;
    }

    interface AssociatedMenuConfiguration {
      Behavior: string;
      Group: string;
      Label: Label;
      Order: number;
    }

    interface Privilege {
      CanBeBasic: boolean;
      CanBeDeep: boolean;
      CanBeGlobal: boolean;
      CanBeLocal: boolean;
      Name: string;
      PrivilegeId: string;
      PrivilegeType: string;
    }

    interface Value<T> {
      Value: T;
    }
  }
}
