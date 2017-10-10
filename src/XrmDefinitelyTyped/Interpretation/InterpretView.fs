module internal DG.XrmDefinitelyTyped.InterpretView

open System.Xml.Linq
open DG.XrmDefinitelyTyped.IntermediateRepresentation

// Helper function for getting XName for elements and attributes
let xn s = XName.Get(s)
  
// Function for getting the names of the columns in a fetch xml
let getColumnNames (xml: XDocument) =
  xml.Element(xn "fetch").Element(xn "entity").Elements(xn "attribute")
  |> Seq.map (fun (e: XElement) -> e.Attribute(xn "name").Value)
  |> List.ofSeq

// Helper function for getting the attributes in a link-entity
let getLinkedAttributeNames (linkEntity: XElement) =
    linkEntity.Elements(xn "attribute")
    |> Seq.map (fun (e: XElement) -> e.Attribute(xn "name").Value)
    |> List.ofSeq

let getLinkEntityNameAndAlias (linkEntity: XElement) =
  let name = linkEntity.Attribute(xn "name").Value
  let aliasAttribute = linkEntity.Attribute(xn "alias")
  let alias =
    match aliasAttribute with
    | null -> ""
    | attr -> attr.Value

  name, alias

// Function for getting the entity, attribute name pairs of the linked entities
let getLinkedAttributes (xml: XDocument) = 
  let linkEntities = xml.Element(xn "fetch").Element(xn "entity").Elements(xn "link-entity")
  
  let linkedAttributes =
    linkEntities 
    |> Seq.map (fun (e: XElement) -> getLinkEntityNameAndAlias e, getLinkedAttributeNames e)

  linkedAttributes |> List.ofSeq

// Function to intepret a single view's fetch xml
let intepretFetchXml fetchXml =
  let xml = XDocument.Parse(fetchXml)
  
  let entityName =  xml.Element(xn "fetch").Element(xn "entity").Attribute(xn "name").Value
  let ownedAttributeNames = getColumnNames xml
  let linkedAttributes = getLinkedAttributes xml
  
  entityName, ownedAttributeNames, linkedAttributes

// Function to get the (attribute name * attribute type) pairs from an entity's metadata based on a list of names
let getAttributes (attributeNames: string list) (entityMetadata: XrmEntity) =
  entityMetadata.attributes
  |> List.choose (fun (attribute: XrmAttribute) -> 
      match List.contains attribute.logicalName attributeNames with
      | false -> None
      | true -> Some attribute
  )
  
// Function to get the metadata of the entity whose logical name matched the supplied name
let getEntityMetadata entityLogicalName (xrmEntities: XrmEntity[]) =
  xrmEntities 
  |> Array.tryFind (fun entity -> entity.logicalName = entityLogicalName)

// Function to get the complete information of a view based on its parsed fetchxml
let interpretView (xrmEntities: XrmEntity[]) parsedFetchXml =
  let (viewName, (entityName, ownedAttributesNames, linkedAttributeInfo)) = parsedFetchXml
  let entityData = xrmEntities |> getEntityMetadata entityName

  let ownedAttributes = entityData.Value |> getAttributes ownedAttributesNames

  let linkedAttributes =
    linkedAttributeInfo
    |> List.map (fun ((entityName, alias), attributes) -> 
        (getEntityMetadata entityName xrmEntities).Value
        |> getAttributes attributes 
        |> List.map (fun a ->
          { XrmAttribute.schemaName = sprintf "%s_%s" alias a.schemaName
            logicalName = sprintf "%s_%s" alias a.logicalName
            varType = a.varType
            specialType = a.specialType
            targetEntitySets = a.targetEntitySets
            readable = a.readable
            createable = a.createable
            updateable = a.updateable
          })
    )
    |> List.concat
    |> List.distinctBy (fun (attr: XrmAttribute) -> attr.logicalName)

  { XrmView.name = viewName
    entityName = entityData.Value.logicalName
    attributes = ownedAttributes
    linkedAttributes = linkedAttributes
  }