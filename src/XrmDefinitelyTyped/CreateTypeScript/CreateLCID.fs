module internal DG.XrmDefinitelyTyped.CreateLCID

open TsStringUtil

let languages = [|(1025, "Arabic"); (1069, "Basque"); (1026, "Bulgarian"); (1027, "Catalan");
                  (3076, "Chinese_Hong_Kong_SAR"); (2052, "Chinese_PRC"); (1028, "Chinese_Taiwan"); 
                  (1050, "Croatian"); (1029, "Czech");
                  (1030, "Danish"); (1043, "Dutch"); (1033, "English"); (1061, "Estonian");
                  (1035, "Finnish"); (1036, "French"); (1110, "Galician"); (1031, "German");
                  (1032, "Greek"); (1037, "Hebrew"); (1081, "Hindi"); (1038, "Hungarian");
                  (1057, "Indonesian"); (1040, "Italian"); (1041, "Japanese");
                  (1087, "Kazakh"); (1042, "Korean"); (1062, "Latvian"); (1063, "Lithuanian");
                  (1086, "Malay_Malaysia"); (1044, "Norwegian_Bokmål"); (1045, "Polish");
                  (1046, "Portuguese_Brazil"); (2070, "Portuguese_Portugal");
                  (1048, "Romanian"); (1049, "Russian"); (3098, "Serbian_Cyrillic");
                  (2074, "Serbian_Latin"); (1051, "Slovak"); (1060, "Slovenian");
                  (3082, "Spanish"); (1053, "Swedish"); (1054, "Thai"); (1055, "Turkish");
                  (1058, "Ukrainian"); (1066, "Vietnamese")|]



let getLanguageName (lcid: int) languages =
  match Array.tryFind (fun (lcid',_) -> lcid = lcid') languages with
  | Some (_, lang) -> lang
  | None -> ""

let createLCIDEnum (availableLCIDS: int[]) =
  let enumValues = 
    availableLCIDS 
    |> Array.map (fun id -> (getLanguageName id languages, Some id)) 
    |> List.ofArray

  TsEnum.Create("LCID", enumValues, declare = true) |> enumToString

