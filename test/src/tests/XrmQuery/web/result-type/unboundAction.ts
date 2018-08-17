import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import FakeRequests from '../../../common/fakeRequests';
import * as sinon from 'sinon';

@suite
class Web_Unbound_Action_ResultTypeCheck extends FakeRequests {

    oppId: string;

    before() {
        super.before();
        this.oppId = "SOME_OPPORTUNITY_GUID";
    }

    @test
    "unboundAction response"() {
        var callback = sinon.spy();
        XrmQuery.unboundAction(x => x.WinOpportunity)
          .withParameters({
            Status: 3,
            OpportunityClose: {
              subject: "Won Opportunity",
              opportunityid_bind$opportunities: this.oppId
            }
          })
          .execute(callback);

        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("POST");
        expect(req.url).to.equal("WinOpportunity");
        
        var body = JSON.parse(req.requestBody);
        expect(body).to.deep.equal({
         "Status": 3,
         "OpportunityClose": {
          "subject": "Won Opportunity",
          "opportunityid@odata.bind": `/opportunities(${this.oppId})`
         }
        });
    }

    @test
    "unboundAction promise"() {
        XrmQuery.unboundAction(x => x.WinOpportunity)
          .withParameters({
            Status: 3,
            OpportunityClose: {
              subject: "Won Opportunity",
              opportunityid_bind$opportunities: this.oppId
            }
          })
          .promise();

        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("POST");
        expect(req.url).to.equal("WinOpportunity");
        
        var body = JSON.parse(req.requestBody);
        expect(body).to.deep.equal({
         "Status": 3,
         "OpportunityClose": {
          "subject": "Won Opportunity",
          "opportunityid@odata.bind": `/opportunities(${this.oppId})`
         }
        });
    }

}