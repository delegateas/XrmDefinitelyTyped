import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import FakeRequests from './fakeRequests';
import * as sinon from 'sinon';

@suite 
class Web_RetrieveManipulation extends FakeRequests {

    accountId: string;
    contactId: string;
    currencyId: string;
    contactName: string;
    currencyName; string;

    before() {
        super.before();
        this.accountId = "SOME_ACCOUNT_GUID";
        this.contactId = "SOME_CONTACT_GUID";
        this.currencyId = "SOME_CURRENCY_GUID";
        
        this.contactName = "John Doe";
        this.currencyName = "US Dollars";
    }

    @test
    "testing of entity reference values (_guid)"() {

        var callback = sinon.spy();
        XrmQuery.retrieve(x => x.accounts, this.accountId)
            .select(x => [ x.primarycontactid_guid, x.transactioncurrencyid_guid ])
            .executeCallback(callback);

        // Request tests
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts(${this.accountId})?$select=_primarycontactid_value,_transactioncurrencyid_value`);

        // Respond and check that body is parsed correctly
        req.respond(200, {}, JSON.stringify({
            _primarycontactid_value: this.contactId,
            _transactioncurrencyid_value: this.currencyId
        }));

        sinon.assert.calledWith(callback, {
            primarycontactid_guid: this.contactId, 
            transactioncurrencyid_guid: this.currencyId
        });
    }



    @test
    "testing of formatted values"() {

        var callback = sinon.spy();
        XrmQuery.retrieve(x => x.accounts, this.accountId)
            .select(x => [ x.primarycontactid_guid, x.transactioncurrencyid_guid ])
            .includeFormattedValues()
            .executeCallback(callback);

        // Request tests
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts(${this.accountId})?$select=_primarycontactid_value,_transactioncurrencyid_value`);
        expect(req.requestHeaders["Prefer"]).to.equal('odata.include-annotations="OData.Community.Display.V1.FormattedValue"');
        
        // Respond and check that body is parsed correctly
        req.respond(200, {}, JSON.stringify({
            _primarycontactid_value: this.contactId,
            _transactioncurrencyid_value: this.currencyId,
            "primarycontactid@OData.Community.Display.V1.FormattedValue": this.contactName,
            "transactioncurrencyid@OData.Community.Display.V1.FormattedValue": this.currencyName
        }));

        sinon.assert.calledWith(callback, {
            primarycontactid_guid: this.contactId, 
            primarycontactid_formatted: this.contactName,
            transactioncurrencyid_guid: this.currencyId,
            transactioncurrencyid_formatted: this.currencyName
        });
    }
}