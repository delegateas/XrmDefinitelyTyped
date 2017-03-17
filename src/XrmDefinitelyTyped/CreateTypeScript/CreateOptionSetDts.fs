module internal DG.XrmDefinitelyTyped.CreateOptionSetDts

open TsStringUtil
open IntermediateRepresentation

 
let getOptionSetEnum (os:OptionSet) =
  TsEnum.Create(
    os.displayName,
    os.options 
      |> Array.Parallel.map (fun o -> o.label, Some o.value) 
      |> List.ofArray,
    declare = true)
  |> enumToString


let getUniquePicklists (es:XrmEntity[]) =
  es
  |> Array.Parallel.map (fun e -> e.opt_sets) |> List.concat
  |> Seq.distinctBy (fun os -> os.displayName) |> Array.ofSeq
