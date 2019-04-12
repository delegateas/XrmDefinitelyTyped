/// <reference path='../../../../../typings/XRM/dg.xrmquery.web.d.ts'/>
import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import FakeRequests from '../../../common/fakeRequests';
import * as sinon from 'sinon';

@suite 
class Web_Retrieve_EscapeSpecialCharacters extends FakeRequests {
    @test
    "simple filter with special characters"() {

        var callback = sinon.spy();
        XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.equals(x.accountnumber, "*._-~'!()/+@?=:#;,$& %^[]{}<>\"\\|`"))
            .execute(callback);

        // Check request
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts?$filter=accountnumber%20eq%20'*._-~''!()%2F%2B@%3F=:%23;,$%26%20%25%5E%5B%5D%7B%7D%3C%3E%22%5C%7C%60'`);

        // Respond with empty result
        req.respond(200, {}, JSON.stringify({
            value: [ ]
        }));

        // Check that null was correctly passed to success-handler
        sinon.assert.calledWith(callback, []);
    }

    @test
    "expand and simple filter with special characters"() {
        const accountId = "ACCOUNT_ID";

        var callback = sinon.spy();
        XrmQuery.retrieve(x => x.accounts, accountId)
            .expand(x => x.contact_customer_accounts, x => [x.fullname],
                {
                    filter: x => Filter.equals(x.firstname, "*._-~'!()/+@?=:#;,$& %^[]{}<>\"\\|`")
                }
            )
            .execute(callback);

        // Check request
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts(${accountId})?$expand=contact_customer_accounts($select=fullname;$filter=firstname%20eq%20'*._-~''!()%2F%2B@%3F=:%23;,$%26%20%25%5E%5B%5D%7B%7D%3C%3E%22%5C%7C%60')`);

        // Respond with empty result
        req.respond(200, {}, JSON.stringify({}));

        // Check that null was correctly passed to success-handler
        sinon.assert.calledWith(callback, {});
    }

    @test
    "fetchxml with special characters"() {
        var callback = sinon.spy();
        XrmQuery.retrieveMultiple(x => x.accounts)
            .useFetchXml(`<fetch mapping='logical'><entity name='account'><attribute name='accountid'/><attribute name='name'/><filter><condition attribute="name" operator="eq" value="*._-~&apos;!()/+@?=:#;,$&amp; %^[]{}&lt;&gt;&quot;\\|\`" /></filter></entity></fetch>`)
            .execute(callback);

        // Check request
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts?fetchXml=%3Cfetch%20mapping%3D'logical'%3E%3Centity%20name%3D'account'%3E%3Cattribute%20name%3D'accountid'%2F%3E%3Cattribute%20name%3D'name'%2F%3E%3Cfilter%3E%3Ccondition%20attribute%3D%22name%22%20operator%3D%22eq%22%20value%3D%22*._-~%26apos%3B!()%2F%2B%40%3F%3D%3A%23%3B%2C%24%26amp%3B%20%25%5E%5B%5D%7B%7D%26lt%3B%26gt%3B%26quot%3B%5C%7C%60%22%20%2F%3E%3C%2Ffilter%3E%3C%2Fentity%3E%3C%2Ffetch%3E`);

        // Respond with empty result
        req.respond(200, {}, JSON.stringify({
            value: []
        }));

        // Check that null was correctly passed to success-handler
        sinon.assert.calledWith(callback, []);
    }
}