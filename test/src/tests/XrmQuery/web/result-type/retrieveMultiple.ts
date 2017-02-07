import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

@suite
class Web_RetrieveMultiple_ResultTypeCheck {


    @test
    "no select, without formatted"() {
        XrmQuery.retrieveMultiple(x => x.contacts)
            .execute(x => x[0].contactid)
    }

    @test
    "no select, with formatted"() {
        XrmQuery.retrieveMultiple(x => x.contacts)
            .includeFormattedValues()
            .execute(x => x[0].birthdate_formatted)
    }

    @test
    "select, without formatted"() {
        XrmQuery.retrieveMultiple(x => x.contacts)
            .select(x => [x.birthdate])
            .execute(x => x[0].birthdate)
    }

    @test
    "select, with formatted"() {
        XrmQuery.retrieveMultiple(x => x.contacts)
            .select(x => [x.birthdate])
            .includeFormattedValues()
            .execute(x => x[0].birthdate_formatted)
    }

}