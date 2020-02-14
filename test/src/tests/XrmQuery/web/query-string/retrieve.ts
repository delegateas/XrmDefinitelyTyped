/// <reference path='../../../../../typings/XRM/dg.xrmquery.web.d.ts'/>
import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

@suite
class Web_Retrieve_QueryString {

    accountId: string;
    responseId: string;

    before() {
        this.accountId = "ACCOUNT_ID";
        this.responseId = "RESPONSE_ID";
    }

    @test
    "retrieve accounts"() {
        const qs = XrmQuery.retrieve(x => x.accounts, this.accountId)
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})`);
    }


    @test
    "simple select"() {
        const qs = XrmQuery.retrieve(x => x.accounts, this.accountId)
            .select(x => [x.name, x.accountnumber])
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})?$select=name,accountnumber`);
    }



    @test
    "simple select with _guid in attribute name"() {
        const qs = XrmQuery.retrieve(x => x.accounts, this.accountId)
            .select(x => [x.name, x.dg_somestringwith_guids])
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})?$select=name,dg_somestringwith_guids`);
    }



    @test
    "simple expand"() {
        const qs = XrmQuery.retrieve(x => x.accounts, this.accountId)
            .expand(x => x.contact_customer_accounts)
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})?$expand=contact_customer_accounts`);
    }

    @test
    "expand with selects"() {
        const qs = XrmQuery.retrieve(x => x.accounts, this.accountId)
            .expand(x => x.contact_customer_accounts, x => [x.fullname, x.emailaddress1])
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})?$expand=contact_customer_accounts($select=fullname,emailaddress1)`);
    }

    @test
    "expand with selects and extra options"() {
        const qs = XrmQuery.retrieve(x => x.accounts, this.accountId)
            .expand(x => x.contact_customer_accounts, x => [x.fullname], { top: 2, sortOrder: SortOrder.Descending, orderBy: x => x.firstname })
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})?$expand=contact_customer_accounts($select=fullname;$top=2;$orderby=firstname desc)`);
    }

    @test
    "expand with selects and filters"() {
        const contactId = "CONTACT_ID";
        const contactFirstName = "CONTACT_NAME";

        const qs = XrmQuery.retrieve(x => x.accounts, this.accountId)
            .expand(x => x.contact_customer_accounts, x => [x.fullname],
            {
                filter: x =>
                    Filter.and(
                        Filter.equals(x.firstname, contactFirstName),
                        Filter.equals(x.contactid, Filter.makeGuid(contactId))
                    )
            }
            )
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})?$expand=contact_customer_accounts($select=fullname;$filter=(firstname eq '${contactFirstName}' and contactid eq ${contactId}))`);
    }

    @test
    "expand with selects and filters with special characters"() {
        const qs = XrmQuery.retrieve(x => x.accounts, this.accountId)
            .expand(x => x.contact_customer_accounts, x => [x.fullname],
                {
                    filter: x => Filter.equals(x.firstname, "*._-~'!()/+@?=:#;,$& %^[]{}<>\"\\|`")
                }
            )
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})?$expand=contact_customer_accounts($select=fullname;$filter=firstname eq '*._-~''!()%2F%2B@%3F=:%23;,$%26%20%25%5E%5B%5D%7B%7D%3C%3E%22%5C%7C%60')`);
    }

    @test
    "select when field name is same as entity name"() {
        const qs = XrmQuery.retrieve(x => x.dg_responses, this.responseId)
            .select(x => [x.dg_response])
            .getQueryString();
            
        expect(qs).to.equal(`dg_responses(${this.responseId})?$select=dg_response1`);
    }   

    @test
    "select multiple when one field name is same as entity name"() {
        const qs = XrmQuery.retrieve(x => x.dg_responses, this.responseId)
            .select(x => [x.dg_name, x.dg_response])
            .getQueryString();
            
        expect(qs).to.equal(`dg_responses(${this.responseId})?$select=dg_name,dg_response1`);
    }
}