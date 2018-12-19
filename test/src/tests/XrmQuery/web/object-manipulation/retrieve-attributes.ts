import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";
import FakeRequests from '../../../common/fakeRequests';
import * as sinon from 'sinon';

@suite 
class Web_Retrieve_Attributes extends FakeRequests {

    accountId: string;
    contactId: string;
    currencyId: string;
    contactName: string;
    currencyName: string;
    contactLogicalName: string;
    currencyLogicalName: string;
    contactNavProperty: string;
    currenyNavProperty: string;

    before() {
        super.before();
        this.accountId = "SOME_ACCOUNT_GUID";
        this.contactId = "SOME_CONTACT_GUID";
        this.currencyId = "SOME_CURRENCY_GUID";
        
        this.contactName = "John Doe";
        this.currencyName = "US Dollars";

        this.contactLogicalName = "contact";
        this.currencyLogicalName = "transactioncurrency";

        this.contactNavProperty = "account_primary_contact";
        this.currenyNavProperty = "transactioncurrency_account";
    }

    @test
    "rename of entity reference keys from _XXX_value to XXX_guid in select"() {

        var callback = sinon.spy();
        XrmQuery.retrieve(x => x.accounts, this.accountId)
            .select(x => [ x.primarycontactid_guid, x.transactioncurrencyid_guid ])
            .execute(callback);

        // Check requests
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts(${this.accountId})?$select=_primarycontactid_value,_transactioncurrencyid_value`);

        // Respond
        req.respond(200, {}, JSON.stringify({
            _primarycontactid_value: this.contactId,
            _transactioncurrencyid_value: this.currencyId
        }));

        // Check that body is parsed and renamed accordingly
        sinon.assert.calledWith(callback, {
            primarycontactid_guid: this.contactId, 
            transactioncurrencyid_guid: this.currencyId
        });
    }

    @test
    "rename of entity reference keys from _XXX_value to XXX_guid in filter"() {
        var callback = sinon.spy();
        XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.equals(x.primarycontactid_guid, Filter.makeGuid("test")))
            .execute(callback);

        // Check requests
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts?$filter=_primarycontactid_value%20eq%20test`);
    }

    @test
    "rename of entity reference keys from _XXX_value to XXX_guid in orderby"() {
        var callback = sinon.spy();
        XrmQuery.retrieveMultiple(x => x.accounts)
            .orderAsc(x => x.primarycontactid_guid)
            .execute(callback);

        // Check requests
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts?$orderby=_primarycontactid_value%20asc`);
    }


    @test
    "rename of formatted value keys"() {

        var callback = sinon.spy();
        XrmQuery.retrieve(x => x.accounts, this.accountId)
            .select(x => [ x.primarycontactid_guid, x.transactioncurrencyid_guid ])
            .includeFormattedValues()
            .execute(callback);

        // Check requests
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts(${this.accountId})?$select=_primarycontactid_value,_transactioncurrencyid_value`);
        expect(req.requestHeaders["Prefer"]).to.equal('odata.include-annotations="OData.Community.Display.V1.FormattedValue"');
        
        // Respond
        req.respond(200, {}, JSON.stringify({
            _primarycontactid_value: this.contactId,
            _transactioncurrencyid_value: this.currencyId,
            "_primarycontactid_value@OData.Community.Display.V1.FormattedValue": this.contactName,
            "_transactioncurrencyid_value@OData.Community.Display.V1.FormattedValue": this.currencyName
        }));

        // Check that body is parsed and renamed accordingly
        sinon.assert.calledWith(callback, {
            primarycontactid_guid: this.contactId, 
            primarycontactid_formatted: this.contactName,
            transactioncurrencyid_guid: this.currencyId,
            transactioncurrencyid_formatted: this.currencyName
        });
    }


    @test
    "rename of formatted/lookupproperty value keys"() {

        var callback = sinon.spy();
        XrmQuery.retrieve(x => x.accounts, this.accountId)
            .select(x => [x.primarycontactid_guid, x.transactioncurrencyid_guid])
            .includeFormattedValuesAndLookupProperties()
            .execute(callback);

        // Check requests
        expect(this.requests.length).to.equal(1);
        var req = this.requests[0];
        expect(req.method).to.equal("GET");
        expect(req.url).to.equal(`accounts(${this.accountId})?$select=_primarycontactid_value,_transactioncurrencyid_value`);
        expect(req.requestHeaders["Prefer"]).to.equal('odata.include-annotations="*"');

        // Respond
        req.respond(200, {}, JSON.stringify({
            _primarycontactid_value: this.contactId,
            _transactioncurrencyid_value: this.currencyId,
            "_primarycontactid_value@OData.Community.Display.V1.FormattedValue": this.contactName,
            "_primarycontactid_value@Microsoft.Dynamics.CRM.lookuplogicalname": this.contactLogicalName,
            "_primarycontactid_value@Microsoft.Dynamics.CRM.associatednavigationproperty": this.contactNavProperty,
            "_transactioncurrencyid_value@OData.Community.Display.V1.FormattedValue": this.currencyName,
            "_transactioncurrencyid_value@Microsoft.Dynamics.CRM.lookuplogicalname": this.currencyLogicalName,
            "_transactioncurrencyid_value@Microsoft.Dynamics.CRM.associatednavigationproperty": this.currenyNavProperty
        }));

        // Check that body is parsed and renamed accordingly
        sinon.assert.calledWith(callback, {
            primarycontactid_guid: this.contactId,
            primarycontactid_formatted: this.contactName,
            primarycontactid_lookuplogicalname: this.contactLogicalName,
            primarycontactid_navigationproperty: this.contactNavProperty,
            transactioncurrencyid_guid: this.currencyId,
            transactioncurrencyid_formatted: this.currencyName,
            transactioncurrencyid_lookuplogicalname: this.currencyLogicalName,
            transactioncurrencyid_navigationproperty: this.currenyNavProperty
        });
    }
}