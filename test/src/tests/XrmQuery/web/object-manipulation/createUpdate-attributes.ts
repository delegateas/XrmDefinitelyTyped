/// <reference path='../../../../../typings/XRM/dg.xrmquery.web.d.ts'/>

import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "@testdeck/mocha";
import FakeRequests from '../../../common/fakeRequests';
import * as sinon from 'sinon';

@suite
class Web_CreateUpdate_Attributes extends FakeRequests {

  @test
  "simple create"() {
    const relatedAccountId = "SOME_ACCOUNT_GUID";
    const newAccountId = "00000000-0000-0000-0000-000000000000";

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
    req.respond(200, { 'OData-EntityId': `https://organization.tld/api/data/v9.0/accounts(${newAccountId})` }, "");
    sinon.assert.calledWith(callback, newAccountId);
  }


  @test
  "simple delete"() {
    const relatedAccountId = "SOME_ACCOUNT_GUID";

    var callback = sinon.spy();
    XrmQuery.deleteRecord(x => x.accounts, relatedAccountId)
      .execute(callback);

    // Check request is valid 
    expect(this.requests.length).to.equal(1);
    var req = this.requests[0];
    expect(req.url).to.equal(`accounts(SOME_ACCOUNT_GUID)`);
    expect(req.method).to.equal("DELETE");

    // Check that body was created properly (no body on delete)
    var body = JSON.parse(req.requestBody);
    expect(body).to.deep.equal(null)

    // Check that response is gotten correctly from header (no response on delete)
    req.respond(200, {}, "");
    sinon.assert.calledWith(callback);
  }

  @test
  "simple update"() {
    const accountId = "SOME_ACCOUNT_GUID";
    const newAccountId = "SOME_NEW_ACCOUNT_GUID";

    var updAccount = {
      parentaccountid_bind$accounts: newAccountId
    };

    var callback = sinon.spy();
    XrmQuery.update(x => x.accounts, accountId, updAccount).execute(callback);

    // Check request is valid 
    expect(this.requests.length).to.equal(1);
    var req = this.requests[0];
    expect(req.url).to.equal(`accounts(SOME_ACCOUNT_GUID)`);
    expect(req.method).to.equal("PATCH");

    // Check that body was created properly
    var body = JSON.parse(req.requestBody);
    expect(body).to.deep.equal({ 'parentaccountid@odata.bind': `/accounts(${newAccountId})` });

    // Check that response is gotten correctly from header
    req.respond(200, {}, "");
    sinon.assert.calledWith(callback);
  }

  @test
  "associate for single-valued"() {
    const contactId = "SOME_CONTACT_GUID";
    const targetId = "SOME_ACCOUNT_GUID";

    //var relation = "dg_account_contact"

    var callback = sinon.spy();
    XrmQuery.associateSingle(x => x.contacts, contactId, x => x.accounts, targetId, x => x.parentcustomerid_account).execute(callback);

    // Check request is valid 
    expect(this.requests.length).to.equal(1);
    var req = this.requests[0];
    expect(req.url).to.equal(`contacts(${contactId})/parentcustomerid_account/$ref`);
    expect(req.method).to.equal("PUT");
    // Check that body was created properly
    var body = JSON.parse(req.requestBody);
    expect(body).to.deep.equal({ '@odata.id': `accounts(${targetId})` })

    // Check that response is gotten correctly from header (no response on associate)
    req.respond(200, {}, "");
    sinon.assert.calledWith(callback);
  }

  @test
  "associate for collection-valued"() {
    const accountId = "SOME_ACCOUNT_GUID";
    const targetId = "SOME_CONTACT_GUID";

    //var relation = "dg_account_contact"

    var callback = sinon.spy();
    XrmQuery.associateCollection(x => x.accounts, accountId, x => x.contacts, targetId, x => x.dg_account_contact).execute(callback);

    // Check request is valid 
    expect(this.requests.length).to.equal(1);
    var req = this.requests[0];
    expect(req.url).to.equal(`accounts(${accountId})/dg_account_contact/$ref`);
    expect(req.method).to.equal("POST");
    // Check that body was created properly
    var body = JSON.parse(req.requestBody);
    expect(body).to.deep.equal({ '@odata.id': `contacts(${targetId})` })

    // Check that response is gotten correctly from header (no response on associate)
    req.respond(200, {}, "");
    sinon.assert.calledWith(callback);
  }

  @test
  "disassociate for single-valued"() {
    const contactId = "SOME_CONTACT_GUID";

    var callback = sinon.spy();
    XrmQuery.disassociateSingle(x => x.contacts, contactId, x => x.parentcustomerid_account).execute(callback);

    // Check request is valid 
    expect(this.requests.length).to.equal(1);
    var req = this.requests[0];
    expect(req.url).to.equal(`contacts(SOME_CONTACT_GUID)/parentcustomerid_account/$ref`);
    expect(req.method).to.equal("DELETE");

    // Check that body was created properly (no body on disassociate)
    var body = JSON.parse(req.requestBody);
    expect(body).to.deep.equal(null)

    // Check that response is gotten correctly from header (no response on disassociate)
    req.respond(200, {}, "");
    sinon.assert.calledWith(callback);
  }

  @test
  "disassociate for collection-valued"() {
    const accountId = "SOME_ACCOUNT_GUID";
    const targetId = "SOME_CONTACT_GUID";

    //var relation = "dg_account_contact";

    var callback = sinon.spy();
    XrmQuery.disassociateCollection(x => x.accounts, accountId, x => x.dg_account_contact, targetId).execute(callback);

    // Check request is valid 
    expect(this.requests.length).to.equal(1);
    var req = this.requests[0];
    expect(req.url).to.equal(`accounts(SOME_ACCOUNT_GUID)/dg_account_contact(SOME_CONTACT_GUID)/$ref`);
    expect(req.method).to.equal("DELETE");

    // Check that body was created properly (no body on disassociate)
    var body = JSON.parse(req.requestBody);
    expect(body).to.deep.equal(null)

    // Check that response is gotten correctly from header (no response on disassociate)
    req.respond(200, {}, "");
    sinon.assert.calledWith(callback);
  }
}
