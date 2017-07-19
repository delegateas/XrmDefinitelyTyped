import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import FakeRequests from '../common/fakeRequests';
import * as sinon from 'sinon';

@suite 
class SdkRestInputArgs extends FakeRequests {
    
    @test 
    "check that it can take strings"() {
        const accountGuid = "SOME-GUID";
        
        let callback = sinon.spy();
        SDK.REST.retrieveRecord(accountGuid, "Account", "accountnumber", "primarycontact", callback, () => { expect.fail() });

        // Check requests
        expect(this.requests.length).to.equal(1);
        const req = this.requests[0];

        // Respond
        const responseCheck = { name: "it-works" };
        req.respond(200, {}, JSON.stringify({ d: responseCheck }));

        sinon.assert.calledWith(callback, responseCheck);
    }

    @test 
    "check that it can take null at select and expand"() {
        const accountGuid = "SOME-GUID";
        
        let callback = sinon.spy();
        SDK.REST.retrieveRecord(accountGuid, "Account", null, null, callback, () => { expect.fail() });

        // Check requests
        expect(this.requests.length).to.equal(1);
        const req = this.requests[0];

        // Respond
        const responseCheck = { name: "it-works" };
        req.respond(200, {}, JSON.stringify({ d: responseCheck }));

        sinon.assert.calledWith(callback, responseCheck);
    }

}