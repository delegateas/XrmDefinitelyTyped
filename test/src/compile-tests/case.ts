namespace Test.Case {
    const Page = <Form.incident.Main.Case>Xrm.Page;

    export function onLoad() {

        Page.getControl("header_process_customerid")
        Page.getControl("header_process_customerid_1")
        Page.getControl("header_process_customerid_2")
        Page.getControl("header_process_primarycontactid")
        Page.getControl("header_process_primarycontactid_1")


        Page.getControl("hss")

        Page.data.process.addOnPreStageChange(() => { console.log("addOnPreStageChange called!") });
        Page.data.process.addOnPreProcessStatusChange(() => { console.log("addOnPreProcessStatusChange called!") });
    }

}