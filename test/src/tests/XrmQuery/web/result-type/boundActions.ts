import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import FakeRequests from '../../../common/fakeRequests';
import * as sinon from 'sinon';

@suite
class Web_Bound_Action_ResultTypeCheck extends FakeRequests {

    queueId: string;

    before() {
        super.before();
        this.queueId = "SOME_QUEUE_GUID";
    }

    @test
    "boundAction response"() {
        var callback = sinon.spy();
        var result = XrmQuery.boundAction(x => x.AddToQueue, x => x.queues, this.queueId)
          .withParameters({
            Target: {
              activityid: "59ae8258-4878-e511-80d4-00155d2a68d1",
              $type: "letter"
            }
          })
          .execute(callback);

        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("POST");
        expect(req.url).to.equal(`queues(${this.queueId})/Microsoft.Dynamics.CRM.AddToQueue`);

        var body = JSON.parse(req.requestBody);
        expect(body).to.deep.equal({
         "Target": {
          "activityid": "59ae8258-4878-e511-80d4-00155d2a68d1",
          "@odata.type": "Microsoft.Dynamics.CRM.letter"
         }
        });
    }

    @test
    "boundAction promise"() {
        var result = XrmQuery.boundAction(x => x.AddToQueue, x => x.queues, this.queueId)
          .withParameters({
            Target: {
              activityid: "59ae8258-4878-e511-80d4-00155d2a68d1",
              $type: "letter"
            }
          })
          .promise();

        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("POST");
        expect(req.url).to.equal(`queues(${this.queueId})/Microsoft.Dynamics.CRM.AddToQueue`);

        var body = JSON.parse(req.requestBody);
        expect(body).to.deep.equal({
         "Target": {
          "activityid": "59ae8258-4878-e511-80d4-00155d2a68d1",
          "@odata.type": "Microsoft.Dynamics.CRM.letter"
         }
        });

        // Respond with entity reference
        req.respond(200, {}, JSON.stringify({
            value: [ 
                {
                 "@odata.context": "[Organization URI]/api/data/v9.0/$metadata#Microsoft.Dynamics.CRM.AddToQueueResponse",
                 "QueueItemId": "5aae8258-4878-e511-80d4-00155d2a68d1"
                }
            ]
        }));

        expect(result).to.eventually.deep.equal({
          QueueItemId: "5aae8258-4878-e511-80d4-00155d2a68d1"
        });
    }


}