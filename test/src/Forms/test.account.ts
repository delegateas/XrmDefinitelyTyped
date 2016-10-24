
namespace Test.Account {
    const Page = <Form.account.Main.Account>Xrm.Page;

    export function onLoad() {
        Page.getAttribute("accountnumber").setValue("some-string");
        Page.getAttribute("dg_somedecimal").setValue(5.5);
        Page.getAttribute("creditlimit").setValue(100);
        Page.getAttribute("donotemail").setValue(true);
        Page.getAttribute("address1_shippingmethodcode").setValue(account_address1_shippingmethodcode.Airborne);
    }

}