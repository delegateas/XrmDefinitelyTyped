/// <reference path='../../../../../typings/XRM/dg.xrmquery.web.d.ts'/>
import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

@suite
class Web_RetrieveRelated_ResultTypeCheck {

    accountId: string;

    before() {
        this.accountId = "ACCOUNT_ID";
    }

    @test
    "no select, without formatted"() {
        XrmQuery.retrieveRelatedMultiple(x => x.accounts, this.accountId, x => x.contact_customer_accounts)
            .execute(x => x[0].contactid)
    }

    @test
    "no select, with formatted"() {
        XrmQuery.retrieveRelatedMultiple(x => x.accounts, this.accountId, x => x.contact_customer_accounts)
            .includeFormattedValues()
            .execute(x => x[0].birthdate_formatted)
    }

    @test
    "select, without formatted"() {
        XrmQuery.retrieveRelatedMultiple(x => x.accounts, this.accountId, x => x.contact_customer_accounts)
            .select(x => [x.birthdate])
            .execute(x => x[0].birthdate)
    }

    @test
    "select, with formatted"() {
        XrmQuery.retrieveRelatedMultiple(x => x.accounts, this.accountId, x => x.contact_customer_accounts)
            .select(x => [x.birthdate])
            .includeFormattedValues()
            .execute(x => x[0].birthdate_formatted)
    }

}