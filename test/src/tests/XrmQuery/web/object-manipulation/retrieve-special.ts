/// <reference path='../../../../../typings/XRM/dg.xrmquery.web.d.ts'/>
import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import FakeRequests from '../../../common/fakeRequests';
import * as sinon from 'sinon';

@suite 
class Web_Retrieve_Special extends FakeRequests {

    @test
    "getFirst"() {

        var callback = sinon.spy();
        XrmQuery.retrieveMultiple(x => x.accounts)
            .getFirst(callback);

        // Check request
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts?$top=1`);

        // Respond and check that body is parsed correctly
        req.respond(200, {}, JSON.stringify({
            value: [ 
                { accountnumber: 1 }
            ]
        }));

        sinon.assert.calledWith(callback, {
            accountnumber: 1
        });
    }

    @test
    "getFirst empty-check"() {

        var callback = sinon.spy();
        XrmQuery.retrieveMultiple(x => x.accounts)
            .getFirst(callback);

        // Check request
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts?$top=1`);

        // Respond with empty result
        req.respond(200, {}, JSON.stringify({
            value: [ ]
        }));

        // Check that null was correctly passed to success-handler
        sinon.assert.calledWith(callback, null);
    }
}