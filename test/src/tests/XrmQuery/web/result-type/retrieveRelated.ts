/// <reference path='../../../../../typings/XRM/dg.xrmquery.web.ts'/>
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
        XrmQuery.retrieveRelated(x => x.accounts, this.accountId, x => x.primarycontactid)
            .execute(x => x.contactid)
    }

    @test
    "no select, with formatted"() {
        XrmQuery.retrieveRelated(x => x.accounts, this.accountId, x => x.primarycontactid)
            .includeFormattedValues()
            .execute(x => x.birthdate_formatted)
    }

    @test
    "select, without formatted"() {
        XrmQuery.retrieveRelated(x => x.accounts, this.accountId, x => x.primarycontactid)
            .select(x => [x.birthdate])
            .execute(x => x.birthdate)
    }

    @test
    "select, with formatted"() {
        XrmQuery.retrieveRelated(x => x.accounts, this.accountId, x => x.primarycontactid)
            .select(x => [x.birthdate])
            .includeFormattedValues()
            .execute(x => x.birthdate_formatted)
    }

}