module internal DG.XrmDefinitelyTyped.InterpretOptionSetMetadata

open Microsoft.Xrm.Sdk
open Microsoft.Xrm.Sdk.Metadata

open Utility
open IntermediateRepresentation


let getLabelString (label:Label) labelMapping =
  try
    label.UserLocalizedLabel.Label
    |> Utility.applyLabelMappings labelMapping
    |> Utility.sanitizeString
  with _ -> emptyLabel

let getUnsanitizedLabelString (label:Label) (labelmapping:(string*string)[] option) =
  try
    label.UserLocalizedLabel.Label 
    |> Utility.applyLabelMappings labelmapping
  with _ -> emptyLabel

let getMetadataString (metadata:OptionSetMetadataBase) labelMapping =
  getLabelString metadata.DisplayName labelMapping
  |> fun name -> 
    if name <> emptyLabel then name
    else metadata.Name


/// Interprets CRM OptionSetMetadata into intermediate type
let interpretOptionSet entityNames (metadata:OptionSetMetadataBase) labelMapping =
  match metadata with
  | :? OptionSetMetadata as osm ->

    let options =
      osm.Options
      |> Seq.map (fun opt ->
        { label = getLabelString opt.Label labelMapping
          value = opt.Value.GetValueOrDefault() }) 

    let displayName = 
      match entityNames |> Set.contains metadata.Name with
      | true  -> sprintf "%s_Enum" metadata.Name
      | false -> metadata.Name
  
    let fixedOptionLabels =
      options
      |> Seq.fold (fun (countMap:Map<string,Option list>) op ->
        if countMap.ContainsKey op.label then
          countMap.Add(
            op.label, 
            { op with label = sprintf "%s_%d" op.label (countMap.[op.label].Length+1) } 
              :: countMap.[op.label]
          )
        else countMap.Add(op.label, [op])
      ) Map.empty
      |> Map.toArray |> Array.map snd |> List.concat 
      |> List.sortBy (fun op -> op.value) |> List.toArray

    { displayName = displayName
      options = fixedOptionLabels }
    |> Some

  | :? BooleanOptionSetMetadata as bosm ->
    let options =
      [|  { label = getLabelString bosm.TrueOption.Label labelMapping
            value = 1 }
          { label = getLabelString bosm.FalseOption.Label labelMapping
            value = 0 } |]

    { displayName = metadata.Name
      options = options }
    |> Some

  | _ -> None