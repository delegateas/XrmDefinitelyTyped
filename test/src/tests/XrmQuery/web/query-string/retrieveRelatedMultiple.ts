/// <reference path='../../../../../typings/XRM/dg.xrmquery.web.d.ts'/>
import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "@testdeck/mocha";

@suite 
class Web_RetrieveRelated_QueryString {
    
    accountId: string;
    viewId: string;

    before() {
        this.accountId = "SOME_ACCOUNT_GUID";
        this.viewId = "SOME_VIEW_GUID";
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

        expect(qs).to.equal(`accounts(${this.accountId})/contact_customer_accounts?$expand=dg_TestAccount`);
    }

    @test 
    "expand with selects"() {
        const qs = XrmQuery.retrieveRelatedMultiple(x => x.accounts, this.accountId, x => x.contact_customer_accounts)
            .expand(x => x.dg_TestAccount, x => [x.accountnumber])
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/contact_customer_accounts?$expand=dg_TestAccount($select=accountnumber)`);
    }

    @test 
    "fetchXml"() {
        const qs = XrmQuery.retrieveRelatedMultiple(x => x.accounts, this.accountId, x => x.account_master_account)
            .useFetchXml(`<fetch mapping='logical'><entity name='account'><attribute name='accountid'/><attribute name='name'/></entity></fetch>`)
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/account_master_account?fetchXml=%3Cfetch%20mapping%3D'logical'%3E%3Centity%20name%3D'account'%3E%3Cattribute%20name%3D'accountid'%2F%3E%3Cattribute%20name%3D'name'%2F%3E%3C%2Fentity%3E%3C%2Ffetch%3E`);
    }

    @test 
    "userQuery"() {
        const qs = XrmQuery.retrieveRelatedMultiple(x => x.accounts, this.accountId, x => x.account_master_account)
            .usePredefinedQuery("userQuery", this.viewId)
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/account_master_account?userQuery=${this.viewId}`);
    }

    @test 
    "savedQuery"() {
        const qs = XrmQuery.retrieveRelatedMultiple(x => x.accounts, this.accountId, x => x.account_master_account)
            .usePredefinedQuery("savedQuery", this.viewId)
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/account_master_account?savedQuery=${this.viewId}`);
    }
}