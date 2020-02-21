/// <reference path='../../../../../typings/XRM/dg.xrmquery.web.d.ts'/>
import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

@suite 
class Web_Query_Function_Filter {
    @test 
    "In filter"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.$in(x.address1_city,["12345"]))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=Microsoft.Dynamics.CRM.In(PropertyName='address1_city',PropertyValues=['12345'])");
    }

    @test 
    "In custom filter"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.$in(x.dg_test_med_underscore,["12345"]))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=Microsoft.Dynamics.CRM.In(PropertyName='dg_test_med_underscore',PropertyValues=['12345'])");
    }

    @test 
    "NotIn filter"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.notIn(x.accountnumber,["12345"]))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=Microsoft.Dynamics.CRM.NotIn(PropertyName='accountnumber',PropertyValues=['12345'])");
    }

    @test 
    "Under filter"() {
        debugger;
        const accountId = "ACCOUNT_ID";
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.under(x.parentaccountid_guid, accountId))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=Microsoft.Dynamics.CRM.Under(PropertyName='parentaccountid',PropertyValues='ACCOUNT_ID')");
    }

    @test 
    "UnderOrEqual filter"() {
        const accountId = "ACCOUNT_ID";
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.underOrEqual(x.parentaccountid_guid, accountId))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=Microsoft.Dynamics.CRM.UnderOrEqual(PropertyName='parentaccountid',PropertyValues='ACCOUNT_ID')");
    }

    @test 
    "NotUnder filter"() {
        const accountId = "ACCOUNT_ID";
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.notUnder(x.parentaccountid_guid, accountId))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=Microsoft.Dynamics.CRM.NotUnder(PropertyName='parentaccountid',PropertyValues='ACCOUNT_ID')");
    }

    @test 
    "Above filter"() {
        const accountId = "ACCOUNT_ID";
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.above(x.parentaccountid_guid, accountId))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=Microsoft.Dynamics.CRM.Above(PropertyName='parentaccountid',PropertyValues='ACCOUNT_ID')");
    }

    @test 
    "EqualUserId filter"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.equalUserId(x.ownerid_guid))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=Microsoft.Dynamics.CRM.EqualUserId(PropertyName='ownerid')");
    }

    @test 
    "NotEqualUserId filter"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.notEqualUserId(x.ownerid_guid))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=Microsoft.Dynamics.CRM.NotEqualUserId(PropertyName='ownerid')");
    }

    @test 
    "EqualBusinessId filter"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.equalBusinessId(x.owningbusinessunit_guid))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=Microsoft.Dynamics.CRM.EqualBusinessId(PropertyName='owningbusinessunit')");
    }

    @test 
    "NotEqualBusinessId filter"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.notEqualBusinessId(x.owningbusinessunit_guid))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=Microsoft.Dynamics.CRM.NotEqualBusinessId(PropertyName='owningbusinessunit')");
    }
}