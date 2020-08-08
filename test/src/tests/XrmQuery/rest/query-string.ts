/// <reference path='../../../../typings/XRM/dg.xrmquery.rest.d.ts'/>
import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "@testdeck/mocha";

@suite 
class Rest_QueryString {
    
    @test 
    "retrieve accounts"() {
        const os = XrmQuery.REST.retrieveMultipleRecords(x => x.Account)
            .getOptionString();

        expect(os).to.equal("");
    }


    @test 
    "simple select"() {
        const os = XrmQuery.REST.retrieveMultipleRecords(x => x.Account)
            .select(x => [x.Name, x.AccountNumber])
            .getOptionString();

        expect(os).to.equal("$select=Name,AccountNumber");
    }

    @test 
    "multiple query settings"() {
        const os = XrmQuery.REST.retrieveMultipleRecords(x => x.Account)
            .skip(5)
            .top(3)
            .getOptionString();

        expect(os).to.equal("$skip=5&$top=3");
    }

    @test 
    "order by"() {
        const os = XrmQuery.REST.retrieveMultipleRecords(x => x.Account)
            .orderAsc(x => x.AccountNumber)
            .orderDesc(x => x.Name)
            .getOptionString();

        expect(os).to.equal("$orderby=AccountNumber asc,Name desc");
    }


    @test 
    "simple filter"() {
        const os = XrmQuery.REST.retrieveMultipleRecords(x => x.Account)
            .filter(x => Filter.REST.equals(x.AccountNumber, "12345"))
            .getOptionString();

        expect(os).to.equal("$filter=AccountNumber eq '12345'");
    }



    @test 
    "complex filter"() {
        
        const os = XrmQuery.REST.retrieveMultipleRecords(x => x.Account)
            .filter(x =>
                Filter.REST.and(
                    Filter.REST.startsWith(x.Name, "admin"),
                    Filter.REST.equals(x.AccountNumber, "12345")
                )
            )
            .orFilter(x => Filter.REST.notEquals(x.AccountId, Filter.REST.makeGuid("SOME-GUID")))
            .getOptionString();

        expect(os).to.equal("$filter=((startswith(Name, 'admin') and AccountNumber eq '12345') or AccountId ne (guid'SOME-GUID'))");
    }


    @test 
    "simple expand"() {
        const os = XrmQuery.REST.retrieveMultipleRecords(x => x.Account)
            .expand(x => x.contact_customer_accounts)
            .getOptionString();

        expect(os).to.equal("$expand=contact_customer_accounts");
    }


    @test 
    "expand with selects"() {
        const os = XrmQuery.REST.retrieveMultipleRecords(x => x.Account)
            .expand(x => x.contact_customer_accounts, x => [x.FullName, x.EMailAddress1])
            .getOptionString();

        expect(os).to.equal("$select=contact_customer_accounts/FullName,contact_customer_accounts/EMailAddress1&$expand=contact_customer_accounts");
    }
}
