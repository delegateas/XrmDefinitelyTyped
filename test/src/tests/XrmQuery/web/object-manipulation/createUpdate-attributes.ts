import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import FakeRequests from '../../../common/fakeRequests';
import * as sinon from 'sinon';

@suite 
class Web_CreateUpdate_Attributes extends FakeRequests {
    
    @test
    "simple create"() {
        const relatedAccountId = "SOME_ACCOUNT_GUID";
        const newAccountId = "SOME_NEW_ACCOUNT_GUID";

        var callback = sinon.spy();
        XrmQuery.create(x => x.accounts, { parentaccountid_bind$accounts: relatedAccountId })
            .execute(callback);

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
        sinon.assert.calledWith(callback, newAccountId);
    }

}
