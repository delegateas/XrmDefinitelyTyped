/// <reference path='../../../../../typings/XRM/dg.xrmquery.web.d.ts'/>
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { suite, test, slow, timeout, skip, only } from "@testdeck/mocha";
import FakeRequests from '../../../common/fakeRequests';
import * as sinon from 'sinon';

const expect = chai.expect;
chai.use(chaiAsPromised);

@suite 
class Web_Retrieve_Promise extends FakeRequests {

    @test
    "retrieve promise"() {

        var result = XrmQuery.retrieveMultiple(x => x.accounts)
            .promise();

        // Check request
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts`);

        // Respond with empty result
        req.respond(200, {}, JSON.stringify({
            value: [ 
                { accountnumber: 1 }
            ]
        }));

        expect(result).to.eventually.deep.equal([{ accountnumber: 1 }]);
    }

    @test
    "retrieve promiseFirst"() {

        var result = XrmQuery.retrieveMultiple(x => x.accounts)
            .promiseFirst();

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

        expect(result).to.eventually.deep.equal({ accountnumber: 1 });
    }


    @test
    "create promise"() {
        const relatedAccountId = "SOME_ACCOUNT_GUID";
        const newAccountId = "SOME_NEW_ACCOUNT_GUID";

        var result = XrmQuery.create(x => x.accounts, { parentaccountid_bind$accounts: relatedAccountId })
            .promise();

        // Check request is valid 
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.url).to.equal(`accounts`);
        expect(req.method).to.equal("POST");

        // Check that body was created properly
        var body = JSON.parse(req.requestBody);
        expect(body).to.deep.equal({ 'parentaccountid@odata.bind': `/accounts(${relatedAccountId})` })

        // Check that response is gotten correctly from header
        req.respond(200, { 'OData-EntityId': newAccountId }, "");
        expect(result).to.eventually.equal(newAccountId);
    }

    @test
    "No-Content response"() {
        var result = XrmQuery.retrieveRelated(x => x.accounts, "0000-SOME-GUID", y => y.parentaccountid)
        .select(x => [x.createdby_guid])    
        .promise();

        // Check request
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];

        // Respond and check that body is parsed correctly
        req.respond(204, {}, "");

        expect(result).to.eventually.deep.equal([]);
    }
}