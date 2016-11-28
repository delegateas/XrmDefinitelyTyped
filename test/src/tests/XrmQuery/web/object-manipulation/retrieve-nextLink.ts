import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import FakeRequests from '../../common/fakeRequests';
import * as sinon from 'sinon';

@suite 
class Web_Retrieve_NextLink extends FakeRequests {

    accountId; string;
    accountNumber: string;
    linkUrl: string;

    before() {
        super.before();
        this.accountId = "SOME_ACCOUNT_GUID";
        this.accountNumber = "SOME_ACCOUNTNUMBER";
        this.linkUrl = "NEXT_LINK_URL";
    }

    @test
    "follow page-nextLink of retrieveMultiple and concat results"() {

        var callback = sinon.spy();
        XrmQuery.retrieveMultiple(x => x.accounts)
            .execute(callback);

        // Expect first page request
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts`);

        // Respond with first page and nextLink
        req.respond(200, {}, JSON.stringify({
            value: [ 
                { accountNumber: 1 },
                { accountNumber: 2 } 
            ],
            "@odata.nextLink": this.linkUrl
        }));

        // Second page request
        expect(this.requests.length).to.equal(2);
        var req = this.requests[1];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(this.linkUrl);

        // Respond with second page and no next Link
        req.respond(200, {}, JSON.stringify({
            value: [ 
                { accountNumber: 3 } 
            ]
        }));

        // No additional requests made
        expect(this.requests.length).to.equal(2);

        // Response is concatenated results
        sinon.assert.calledWith(callback, 
        [
            { accountNumber: 1 },
            { accountNumber: 2 },
            { accountNumber: 3 } 
        ]);
    }


    @test
    "follow expand-nextLink of record result and insert results"() {

        var callback = sinon.spy();
        XrmQuery.retrieve(x => x.accounts, this.accountId)
            .expand(x => x.contact_customer_accounts)
            .execute(callback);

        // Expect initial record result
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts(${this.accountId})?$select=contact_customer_accounts&$expand=contact_customer_accounts`);

        // Respond with initial record and with expand-nextLink
        req.respond(200, {}, JSON.stringify({
            accountNumber: this.accountNumber,
            contact_customer_accounts: [],
            "contact_customer_accounts@odata.nextLink": this.linkUrl
        }));

        // Second page request
        expect(this.requests.length).to.equal(2);
        var req = this.requests[1];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(this.linkUrl);

        // Respond with result of expand-nextLink
        req.respond(200, {}, JSON.stringify({
            value: [ 
                { contact: 1 },
                { contact: 2 } 
            ]
        }));

        // No additional requests made
        expect(this.requests.length).to.equal(2);

        // Response is record with inserted expand results
        sinon.assert.calledWith(callback, {
            accountNumber: this.accountNumber,
            contact_customer_accounts: [
                { contact: 1 },
                { contact: 2 } 
            ]
        });
    }

}