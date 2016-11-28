import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

@suite 
class Web_RetrieveRelated_QueryString {
    
    accountId: string;

    before() {
        this.accountId = "ACCOUNT_ID";
    }

    @test 
    "retrieve accounts"() {
        const qs = XrmQuery.retrieveRelatedMultiple(x => x.accounts, this.accountId, x => x.contact_customer_accounts)
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/contact_customer_accounts`);
    }


    @test 
    "simple select"() {
        const qs = XrmQuery.retrieveRelatedMultiple(x => x.accounts, this.accountId, x => x.contact_customer_accounts)
            .select(x => [x.fullname, x.parentcustomerid_guid])
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/contact_customer_accounts?$select=fullname,_parentcustomerid_value`);
    }



    @test 
    "simple expand"() {
        const qs = XrmQuery.retrieveRelatedMultiple(x => x.accounts, this.accountId, x => x.contact_customer_accounts)
            .expand(x => x.dg_TestAccount)
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/contact_customer_accounts?$select=dg_TestAccount&$expand=dg_TestAccount`);
    }

    @test 
    "expand with selects"() {
        const qs = XrmQuery.retrieveRelatedMultiple(x => x.accounts, this.accountId, x => x.contact_customer_accounts)
            .expand(x => x.dg_TestAccount, x => [x.accountnumber])
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/contact_customer_accounts?$select=dg_TestAccount&$expand=dg_TestAccount($select=accountnumber)`);
    }

}