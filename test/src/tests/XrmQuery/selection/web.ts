import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

@suite 
class Web_Selection {
    
    @test 
    @skip
    "retrieve accounts"() {
        XrmQuery.retrieveRelatedRecord(x => x.accounts, "sds", x => x.masterid)
            .select(x => [x.accountnumber])
            
        XrmQuery.retrieveRelatedMultiple(x => x.accounts, "sds", x => x.dg_account_contact_TestAccount)
            .select(x => [x.contactid])

    }


}