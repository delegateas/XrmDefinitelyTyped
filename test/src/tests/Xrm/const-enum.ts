import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "@testdeck/mocha";

@suite 
class ConstEnumCheck {
    
    @test 
    "check that const enums are evaluated"() {
        expect(Xrm.FormType.Create).to.equal(1);
        expect(Xrm.FormType.Update).to.equal(2);

        expect(Xrm.StageCategory.Develop).to.equal(1);
    }

    @test 
    "check that const enums are evaluated after overwrite with specific form"() {
        const modXrm = <Xrm<Form.account.Main.Information>>{};

        expect(modXrm.FormType.Create).to.equal(1);
        expect(modXrm.FormType.Update).to.equal(2);

        expect(modXrm.StageCategory.Develop).to.equal(1);
    }

}